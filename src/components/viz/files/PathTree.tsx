"use client";

import { Html, Line, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { Scene3D, useThemeColors, type ThemeColors } from "../kit";

type Entry = { path: string; dir: boolean };

/** Структура «лабораторії» — шляхи POSIX, як їх показує pathlib. */
const ENTRIES: Entry[] = [
  { path: "lab", dir: true },
  { path: "lab/notes", dir: true },
  { path: "lab/notes/transmutation.txt", dir: false },
  { path: "lab/notes/recipes.md", dir: false },
  { path: "lab/data", dir: true },
  { path: "lab/data/save.json", dir: false },
  { path: "lab/data/army.csv", dir: false },
  { path: "lab/images", dir: true },
  { path: "lab/images/circle.png", dir: false },
  { path: "lab/main.py", dir: false },
];

const parentOf = (p: string) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : ".");
const nameOf = (p: string) => p.slice(p.lastIndexOf("/") + 1);

type Placed = Entry & { pos: [number, number, number]; depth: number };

function layout(): Placed[] {
  const kids = (p: string) => ENTRIES.filter((e) => parentOf(e.path) === p);
  const leaves = (p: string): number => {
    const k = kids(p);
    return k.length ? k.reduce((s, c) => s + leaves(c.path), 0) : 1;
  };
  const out: Placed[] = [];
  const SP = 1.3;
  const visit = (e: Entry, depth: number, x0: number) => {
    const w = leaves(e.path) * SP;
    const x = x0 + w / 2 - (leaves("lab") * SP) / 2;
    out.push({ ...e, depth, pos: [x, 1.7 - depth * 1.35, (depth % 2) * -0.5] });
    let cur = x0;
    for (const c of kids(e.path)) {
      visit(c, depth + 1, cur);
      cur += leaves(c.path) * SP;
    }
  };
  visit(ENTRIES[0], 0, 0);
  return out;
}

const PLACED = layout();
const POS = new Map(PLACED.map((p) => [p.path, p.pos]));

const SUFFIX_COLOR: Record<string, string> = {
  ".txt": "#8e8e93",
  ".md": "#5e5ce6",
  ".json": "#30d158",
  ".csv": "#0a84ff",
  ".png": "#bf5af2",
  ".py": "#3776ab",
};

function suffixOf(name: string) {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i) : "";
}

function Item({ p, onPath, selected, colors, onPick }: { p: Placed; onPath: boolean; selected: boolean; colors: ThemeColors; onPick: (s: string) => void }) {
  const g = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const name = nameOf(p.path);
  const base = p.dir ? colors.accent : SUFFIX_COLOR[suffixOf(name)] ?? "#8e8e93";

  useFrame((st, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = 1 - Math.exp(-dt * 8);
    const ts = selected ? 1.25 : hover ? 1.12 : 1;
    grp.scale.setScalar(grp.scale.x + (ts - grp.scale.x) * k);
    const lift = selected ? 0.12 + Math.sin(st.clock.elapsedTime * 2.5) * 0.05 : 0;
    grp.position.y += (p.pos[1] + lift - grp.position.y) * k;
  });

  const pick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onPick(p.path);
  };

  return (
    <group ref={g} position={p.pos}>
      <group
        onClick={pick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
        }}
      >
        {p.dir ? (
          <>
            {/* тека: корпус + вушко */}
            <RoundedBox args={[0.8, 0.56, 0.5]} radius={0.07} smoothness={3}>
              <meshPhysicalMaterial
                color={base}
                emissive={base}
                emissiveIntensity={onPath ? 0.45 : 0.05}
                roughness={0.25}
                clearcoat={1}
                transmission={0.25}
                thickness={0.6}
              />
            </RoundedBox>
            <RoundedBox args={[0.34, 0.12, 0.5]} radius={0.04} position={[-0.2, 0.32, 0]}>
              <meshStandardMaterial color={base} emissive={base} emissiveIntensity={onPath ? 0.45 : 0.05} />
            </RoundedBox>
          </>
        ) : (
          <RoundedBox args={[0.46, 0.6, 0.08]} radius={0.04} smoothness={3}>
            <meshPhysicalMaterial
              color={colors.dark ? "#2c2c2e" : "#ffffff"}
              emissive={base}
              emissiveIntensity={onPath ? 0.6 : 0.12}
              roughness={0.15}
              clearcoat={1}
            />
          </RoundedBox>
        )}
        {!p.dir && (
          <mesh position={[0, -0.18, 0.05]}>
            <boxGeometry args={[0.34, 0.12, 0.01]} />
            <meshStandardMaterial color={base} emissive={base} emissiveIntensity={0.6} />
          </mesh>
        )}
      </group>
      <Html center position={[0, p.dir ? -0.5 : -0.52, 0]} zIndexRange={[20, 0]}>
        <button
          onClick={() => onPick(p.path)}
          className="rounded-full px-2 py-0.5 font-mono text-[10.5px] whitespace-nowrap backdrop-blur-md transition-colors duration-300 select-none"
          style={{
            background: selected ? "var(--accent)" : onPath ? "color-mix(in oklab, var(--accent) 22%, var(--glass-bg-strong))" : "var(--glass-bg-strong)",
            color: selected ? "#1c1c1e" : "var(--label)",
            border: "1px solid var(--glass-border)",
            fontWeight: selected ? 700 : 500,
          }}
        >
          {name}
          {p.dir ? "/" : ""}
        </button>
      </Html>
    </group>
  );
}

function Lab({ selected, onPick }: { selected: string; onPick: (s: string) => void }) {
  const colors = useThemeColors();
  const grp = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 8.6);

  useFrame((_, dt) => {
    const g = grp.current;
    if (!g) return;
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * (1 - Math.exp(-dt * 6)));
  });

  const onPathSet = new Set<string>();
  for (let cur = selected; cur !== "."; cur = parentOf(cur)) onPathSet.add(cur);

  return (
    <group ref={grp}>
      {PLACED.filter((p) => p.path !== "lab").map((p) => {
        const lit = onPathSet.has(p.path);
        const from = POS.get(parentOf(p.path))!;
        return (
          <Line
            key={`l-${p.path}`}
            points={[from, [from[0], (from[1] + p.pos[1]) / 2, from[2]], [p.pos[0], (from[1] + p.pos[1]) / 2, p.pos[2]], p.pos]}
            color={lit ? colors.accent : colors.dark ? "#48484a" : "#c7c7cc"}
            lineWidth={lit ? 3 : 1.3}
          />
        );
      })}
      {PLACED.map((p) => (
        <Item key={p.path} p={p} onPath={onPathSet.has(p.path)} selected={p.path === selected} colors={colors} onPick={onPick} />
      ))}
    </group>
  );
}

export function PathTree() {
  const [selected, setSelected] = useState("lab/notes/transmutation.txt");
  const entry = ENTRIES.find((e) => e.path === selected)!;
  const name = nameOf(selected);
  const suffix = suffixOf(name);
  const stem = suffix ? name.slice(0, -suffix.length) : name;
  const parts = selected.split("/");
  const expr = `Path("${parts[0]}")${parts.slice(1).map((x) => ` / "${x}"`).join("")}`;

  const rows: [string, string][] = [
    ["p", `PosixPath('${selected}')`],
    ["p.name", `'${name}'`],
    ["p.stem", `'${stem}'`],
    ["p.suffix", `'${suffix}'`],
    ["p.parent", `PosixPath('${parentOf(selected)}')`],
    ["p.parts", `(${parts.map((x) => `'${x}'`).join(", ")}${parts.length === 1 ? "," : ""})`],
    ["p.is_dir()", entry.dir ? "True" : "False"],
  ];

  return (
    <div>
      <Scene3D height={380} camera={[0, 0.9, 8.4]} fov={42}>
        <Lab selected={selected} onPick={setSelected} />
      </Scene3D>
      <div className="grid gap-3 px-5 pb-5 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[16px] bg-black/80 px-3.5 py-3 font-mono text-[12.5px] leading-relaxed break-all text-[#e5e5ea]">
          <span className="text-white/50">&gt;&gt;&gt; </span>p = {expr}
          <div className="mt-1 text-white/50"># оператор / склеює частини шляху для будь-якої ОС</div>
        </div>
        <div className="glass-tint overflow-hidden rounded-[16px] border">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-3 border-b border-separator/60 px-3.5 py-1.5 font-mono text-[12.5px] last:border-0">
              <span className="w-[92px] shrink-0 text-label-2">{k}</span>
              <span className="min-w-0 break-all" style={{ color: v === "''" ? "var(--label-3)" : "var(--label)" }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
