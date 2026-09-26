"use client";

import { Html, Line, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Mesh } from "three";
import { Folder, MapPin } from "lucide-react";
import { ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";
import { A2_INK, CONSOLE_BG, INK, tint } from "./palette";

type Pkg = { id: string; label: string; pos: [number, number, number]; files: string[] };

const CURRENT = "kingdom.radio.receiver";

const PKGS: Pkg[] = [
  { id: "kingdom", label: "kingdom/", pos: [0, 1.05, -0.4], files: ["__init__", "config"] },
  { id: "kingdom.chemistry", label: "chemistry/", pos: [-2.55, -0.55, 0.35], files: ["__init__", "soap", "glass"] },
  { id: "kingdom.radio", label: "radio/", pos: [0, -0.55, 0.9], files: ["__init__", "antenna", "receiver"] },
  { id: "kingdom.metal", label: "metal/", pos: [2.55, -0.55, 0.35], files: ["__init__", "forge"] },
];

const pkgOf = (id: string) => PKGS.find((p) => p.id === id)!;

/** Ланцюжок пакетів від кореня до id (включно). */
function chain(pkgId: string): string[] {
  const parts = pkgId.split(".");
  return parts.map((_, i) => parts.slice(0, i + 1).join("."));
}

type Sel = { pkg: string; file: string | null }; // file === null → вибрано саму теку-пакет

function describe(sel: Sel) {
  const { pkg, file } = sel;
  const full = file && file !== "__init__" ? `${pkg}.${file}` : pkg;
  const isPkg = !file || file === "__init__";
  const leaf = full.split(".").pop()!;
  const parent = full.split(".").slice(0, -1).join(".");

  const absolute = isPkg ? [`import ${full}`] : [`import ${full}`, `from ${parent} import ${leaf}`];

  let relative: string;
  if (full === CURRENT) relative = "# це поточний файл — ти тут";
  else if (full === "kingdom") relative = "# корінь пакета: з receiver.py — лише абсолютно";
  else if (full === "kingdom.radio") relative = "from . import antenna  # свій пакет";
  else if (parent === "kingdom.radio") relative = `from . import ${leaf}`;
  else if (parent === "kingdom") relative = `from .. import ${leaf}`;
  else relative = `from ..${parent.split(".").pop()} import ${leaf}`;

  const pkgs = chain(isPkg ? full : pkg);
  const order = pkgs.map((p) => `${p.replaceAll(".", "/")}/__init__.py`);
  if (!isPkg) order.push(`${full.replaceAll(".", "/")}.py`);
  return { full, absolute, relative, order };
}

function Crystal({
  x, name, pkg, selected, current, onPick, color, initColor, compact,
}: {
  x: number; name: string; pkg: string; selected: boolean; current: boolean; compact: boolean;
  onPick: (s: Sel) => void; color: string; initColor: string;
}) {
  const m = useRef<Mesh>(null);
  const isInit = name === "__init__";
  useFrame((_, dt) => {
    const mesh = m.current;
    if (!mesh) return;
    mesh.rotation.y += dt * (selected ? 2.4 : 0.5);
    const goal = selected ? 1.35 : 1;
    const s = mesh.scale.x + (goal - mesh.scale.x) * Math.min(1, dt * 8);
    mesh.scale.set(s, s, s);
    const y = selected ? 0.42 : 0.32;
    mesh.position.y += (y - mesh.position.y) * Math.min(1, dt * 8);
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh
        ref={m}
        position={[0, 0.32, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onPick({ pkg, file: name });
        }}
      >
        {isInit ? <boxGeometry args={[0.24, 0.24, 0.24]} /> : <octahedronGeometry args={[0.2, 0]} />}
        <meshPhysicalMaterial
          color={current ? "#ffffff" : isInit ? initColor : color}
          emissive={isInit ? initColor : color}
          emissiveIntensity={selected ? 0.55 : 0.12}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          transmission={0.25}
          thickness={0.4}
        />
      </mesh>
      {(!compact || selected || current) && (
      <Html position={[0, -0.04, 0.22]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="flex items-center gap-0.5 rounded-full border px-1.5 py-px font-mono text-[9.5px] whitespace-nowrap shadow-sm"
          style={{
            background: selected ? tint(18) : "rgba(255,255,255,.92)",
            borderColor: selected ? "var(--accent)" : "var(--separator)",
            color: selected ? INK : "var(--label)",
          }}
        >
          {name}.py{current && <MapPin className="size-3" strokeWidth={1.75} style={{ color: INK }} />}
        </div>
      </Html>
      )}
    </group>
  );
}

function Platform({
  p, active, sel, onPick, c, compact,
}: {
  p: Pkg; active: boolean; sel: Sel | null; onPick: (s: Sel) => void; compact: boolean;
  c: { accent: string; accent2: string };
}) {
  const w = 0.62 * p.files.length + 0.3;
  return (
    <group position={p.pos}>
      <RoundedBox
        args={[w, 0.14, 0.95]}
        radius={0.06}
        smoothness={3}
        onClick={(e) => {
          e.stopPropagation();
          onPick({ pkg: p.id, file: null });
        }}
      >
        <meshPhysicalMaterial
          color={active ? c.accent2 : "#ffffff"}
          emissive={c.accent2}
          emissiveIntensity={active ? 0.2 : 0}
          transmission={0.55}
          thickness={0.5}
          roughness={0.18}
          clearcoat={1}
          transparent
          opacity={0.92}
        />
      </RoundedBox>
      {p.files.map((f, i) => (
        <Crystal
          key={f}
          x={(i - (p.files.length - 1) / 2) * 0.62}
          name={f}
          pkg={p.id}
          selected={!!sel && sel.pkg === p.id && sel.file === f}
          current={`${p.id}.${f}` === CURRENT}
          onPick={onPick}
          color={c.accent}
          initColor={c.accent2}
          compact={compact}
        />
      ))}
      <Html position={[-w / 2 + 0.05, 0.02, 0.5]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="flex items-center gap-1 rounded-md border px-1.5 py-px font-mono text-[10.5px] font-bold whitespace-nowrap shadow-sm"
          style={{
            background: active ? tint(16, "--accent-2") : "rgba(255,255,255,.92)",
            borderColor: active ? "color-mix(in oklab, var(--accent-2) 50%, transparent)" : "var(--separator)",
            color: active ? A2_INK : "var(--label)",
            transform: "translateY(2px)",
          }}
        >
          <Folder className="size-3" strokeWidth={1.75} /> {p.label}
        </div>
      </Html>
    </group>
  );
}

function Tree({ sel, onPick }: { sel: Sel | null; onPick: (s: Sel) => void }) {
  const c = useThemeColors();
  const { size } = useThree();
  const k = Math.min(1, size.width / size.height / 1.55);
  const activeChain = sel ? chain(sel.pkg) : [];
  const root = pkgOf("kingdom");
  return (
    <group scale={k} position={[0, 0.1, 0]}>
      {PKGS.slice(1).map((p) => {
        const on = activeChain.includes(p.id);
        return (
          <Line
            key={p.id}
            points={[
              [root.pos[0], root.pos[1] - 0.08, root.pos[2]],
              [p.pos[0], p.pos[1] + 0.08, p.pos[2]],
            ]}
            color={on ? c.accent : "#8e8e93"}
            lineWidth={on ? 3 : 1.2}
            transparent
            opacity={on ? 1 : 0.45}
            dashed={!on}
            dashSize={0.12}
            gapSize={0.08}
          />
        );
      })}
      {PKGS.map((p) => (
        <Platform key={p.id} p={p} active={activeChain.includes(p.id)} sel={sel} onPick={onPick} c={c} compact={size.width < 560} />
      ))}
    </group>
  );
}

export function PackageTree3D() {
  const [sel, setSel] = useState<Sel | null>({ pkg: "kingdom.chemistry", file: "soap" });
  const [style, setStyle] = useState<"abs" | "rel">("abs");
  const d = sel ? describe(sel) : null;

  return (
    <div>
      <Scene3D height={360} camera={[0, 2.4, 7.2]} fov={42}>
        <Tree sel={sel} onPick={setSel} />
      </Scene3D>

      <ControlBar>
        <Segmented
          id="mod-pkg-style"
          value={style}
          onChange={setStyle}
          options={[
            { value: "abs", label: "абсолютний" },
            { value: "rel", label: "відносний (з receiver.py)" },
          ]}
        />
      </ControlBar>

      <div className="grid gap-2 px-5 pb-4 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-separator px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed text-label" style={{ background: CONSOLE_BG }}>
          <div className="mb-1 font-sans text-[11px] font-bold tracking-wider text-label-3 uppercase">
            {d ? d.full : "обери модуль"}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${d?.full}-${style}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {d &&
                (style === "abs" ? (
                  d.absolute.map((l) => (
                    <div key={l}>
                      <span className="font-semibold" style={{ color: INK }}>{l.split(" ")[0]}</span> {l.split(" ").slice(1).join(" ")}
                    </div>
                  ))
                ) : (
                  <div style={{ color: d.relative.startsWith("#") ? "var(--label-3)" : undefined }}>{d.relative}</div>
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="rounded-2xl px-3.5 py-2.5 text-[12.5px]" style={{ background: tint(9) }}>
          <div className="mb-1 text-[11px] font-bold tracking-wider text-label-3 uppercase">Що виконається при імпорті</div>
          <AnimatePresence mode="popLayout">
            {d?.order.map((f, i) => (
              <motion.div
                key={`${d.full}-${f}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 28, delay: i * 0.18 }}
                className="flex items-center gap-1.5 font-mono text-[11.5px]"
              >
                <span className="flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: INK }}>
                  {i + 1}
                </span>
                {f}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
