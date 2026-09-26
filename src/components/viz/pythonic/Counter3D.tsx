"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Color, type Group, type MeshPhysicalMaterial } from "three";
import { ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";

type Mode = "chars" | "words";

const PRESETS = ["ora ora ora muda muda ora", "yare yare daze", "star platinum za warudo"];
const MAX_BARS = 12;
const GAP = 0.62;

/** Counter у стилі Python: порядок першої появи + most_common зі стабільним сортуванням. */
function count(text: string, mode: Mode) {
  const items = mode === "words" ? text.split(/\s+/).filter(Boolean) : [...text];
  const m = new Map<string, number>();
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
  const entries = [...m.entries()];
  const common = [...entries].sort((a, b) => b[1] - a[1]); // Array.sort стабільний, як sorted() у Python
  return { entries, common };
}

const pyStr = (s: string) => (s.includes("'") && !s.includes('"') ? `"${s}"` : `'${s}'`);
const show = (k: string) => (k === " " ? "␣" : k);

function Bar({
  x, h, color, hi, selected, label, onPick, value,
}: {
  x: number; h: number; color: string; hi: boolean; selected: boolean; label: string; onPick: () => void; value: number;
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const top = useRef<Group>(null);
  useFrame((st, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = Math.min(1, dt * 6);
    grp.position.x += (x - grp.position.x) * k;
    grp.scale.y += (h - grp.scale.y) * k;
    grp.position.y = -1.3 + grp.scale.y / 2;
    if (top.current) {
      top.current.position.x = grp.position.x;
      top.current.position.y = -1.3 + grp.scale.y + 0.22;
    }
    const m = mat.current;
    if (m) {
      const goal = selected ? 0.9 : hi ? 0.45 + Math.sin(st.clock.elapsedTime * 3 + x) * 0.12 : 0.06;
      m.emissiveIntensity += (goal - m.emissiveIntensity) * k;
    }
  });
  return (
    <>
      <group ref={g} position={[x, -1.3, 0]} scale={[1, 0.001, 1]}>
        <RoundedBox
          args={[0.46, 1, 0.46]}
          radius={0.06}
          smoothness={3}
          onClick={(e) => {
            e.stopPropagation();
            onPick();
          }}
        >
          <meshPhysicalMaterial
            ref={mat}
            color={color}
            emissive={color}
            emissiveIntensity={0.06}
            roughness={0.14}
            clearcoat={1}
            transmission={0.35}
            thickness={0.6}
            transparent
            opacity={hi || selected ? 0.97 : 0.8}
          />
        </RoundedBox>
      </group>
      <group ref={top} position={[x, -1, 0]}>
        <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="font-mono text-[11px] font-bold" style={{ color: hi || selected ? "var(--accent)" : "var(--label-2)" }}>
            {value}
          </div>
        </Html>
      </group>
      <Html position={[x, -1.55, 0.3]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="rounded-md px-1 font-mono text-[11px] font-semibold whitespace-nowrap"
          style={{
            background: selected ? "var(--accent)" : "transparent",
            color: selected ? "#fff" : "var(--label)",
          }}
        >
          {label}
        </div>
      </Html>
    </>
  );
}

function Bars({
  entries, top3, sel, onPick,
}: {
  entries: [string, number][]; top3: Set<string>; sel: string | null; onPick: (k: string) => void;
}) {
  const c = useThemeColors();
  const { size } = useThree();
  const k = Math.min(1, size.width / size.height / 1.5);
  const max = Math.max(1, ...entries.map((e) => e[1]));
  const n = entries.length;
  const colors = useMemo(() => {
    const a = new Color(c.accent);
    const b = new Color(c.accent2);
    return Array.from({ length: MAX_BARS }, (_, i) => "#" + a.clone().lerp(b, i / (MAX_BARS - 1)).getHexString());
  }, [c.accent, c.accent2]);
  return (
    <group scale={k}>
      {entries.map(([key, v], i) => (
        <Bar
          key={key}
          x={(i - (n - 1) / 2) * GAP}
          h={(v / max) * 2.5}
          color={colors[i % MAX_BARS]}
          hi={top3.has(key)}
          selected={sel === key}
          label={show(key)}
          value={v}
          onPick={() => onPick(key)}
        />
      ))}
    </group>
  );
}

export function Counter3D() {
  const [text, setText] = useState(PRESETS[0]);
  const [mode, setMode] = useState<Mode>("words");
  const [sel, setSel] = useState<string | null>(null);
  const { entries, common } = count(text, mode);
  const shown = entries.slice(0, MAX_BARS);
  const top3 = new Set(common.slice(0, 3).map((e) => e[0]));
  const selV = sel !== null ? entries.find((e) => e[0] === sel)?.[1] ?? 0 : null;

  const repr = common.length ? `Counter({${common.map(([k, v]) => `${pyStr(k)}: ${v}`).join(", ")}})` : "Counter()";
  const mc = `[${common
    .slice(0, 3)
    .map(([k, v]) => `(${pyStr(k)}, ${v})`)
    .join(", ")}]`;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="py-counter-mode"
          value={mode}
          onChange={(v) => {
            setMode(v);
            setSel(null);
          }}
          options={[
            { value: "words", label: "слова" },
            { value: "chars", label: "символи" },
          ]}
        />
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setText(p);
              setSel(null);
            }}
            className={`pill ${p === text ? "pill-accent" : "pill-glass"} !py-1 font-mono text-[12px]`}
          >
            {p.split(" ").slice(0, 2).join(" ")}…
          </button>
        ))}
      </ControlBar>
      <div className="px-5">
        <input
          value={text}
          maxLength={40}
          onChange={(e) => {
            setText(e.target.value.toLowerCase());
            setSel(null);
          }}
          placeholder="введи свій бойовий клич"
          className="w-full rounded-xl border border-separator bg-elevated/70 px-3 py-2 font-mono text-[13px] outline-none focus:border-[color:var(--accent)]"
        />
      </div>

      <Scene3D height={300} camera={[0, 1.2, 6.6]} fov={42}>
        {shown.length > 0 ? (
          <Bars entries={shown} top3={top3} sel={sel} onPick={setSel} />
        ) : null}
      </Scene3D>

      <div className="grid gap-2 px-5 pb-4 sm:grid-cols-[1.5fr_1fr]">
        <div className="thin-scroll overflow-x-auto rounded-2xl bg-black/80 px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed text-[#e5e5ea]">
          <div className="text-[#8e8e93]">&gt;&gt;&gt; hits = Counter({mode === "words" ? "text.split()" : "text"})</div>
          <div className="break-all">{repr}</div>
          <div className="mt-1 text-[#8e8e93]">&gt;&gt;&gt; hits.most_common(3)</div>
          <div style={{ color: "var(--accent)" }}>{mc}</div>
          {entries.length > MAX_BARS && <div className="mt-1 text-[#8e8e93]"># у 3D показано перші {MAX_BARS} ключів</div>}
        </div>
        <div className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug" style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
          {sel !== null ? (
            <div className="font-mono text-[13px]">
              hits[{pyStr(sel)}] → <b style={{ color: "var(--accent)" }}>{selV}</b>
            </div>
          ) : (
            <div className="text-label-2">Клацни стовпчик.</div>
          )}
          <div className="mt-1.5 font-mono text-[12px] text-label-2">hits[&apos;dio&apos;] → 0 <span className="font-sans">(без KeyError)</span></div>
          {mode === "chars" && text.includes(" ") && (
            <div className="mt-1.5 text-[12px] text-label-2">
              ␣ — пробіл: Counter рахує <i>кожен</i> символ, навіть пробіли.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
