"use client";

import { Edges, Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Color, type Group, type MeshPhysicalMaterial } from "three";
import { ArrowDownUp } from "lucide-react";
import { Btn, ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";

type Soldier = { name: string; height: number; kills: number };
const SQUAD: Soldier[] = [
  { name: "Levi", height: 160, kills: 58 },
  { name: "Mikasa", height: 170, kills: 20 },
  { name: "Hange", height: 170, kills: 3 },
  { name: "Erwin", height: 188, kills: 10 },
  { name: "Armin", height: 163, kills: 1 },
  { name: "Jean", height: 175, kills: 5 },
];

type KeyVal = number | string | (number | string)[];
const KEYS = {
  none: { code: "(без key)", label: "порядок", k: (_s: Soldier, i: number): KeyVal => i },
  height: { code: "lambda s: s.height", label: "height", k: (s: Soldier): KeyVal => s.height },
  kills: { code: "lambda s: s.kills", label: "kills", k: (s: Soldier): KeyVal => s.kills },
  name: { code: "lambda s: s.name", label: "name", k: (s: Soldier): KeyVal => s.name },
  combo: { code: "lambda s: (-s.height, s.name)", label: "(-h, name)", k: (s: Soldier): KeyVal => [-s.height, s.name] },
} as const;
type K = keyof typeof KEYS;

function cmp(a: KeyVal, b: KeyVal): number {
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const c = cmp(a[i], b[i]);
      if (c) return c;
    }
    return a.length - b.length;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

const fmt = (v: KeyVal): string =>
  Array.isArray(v) ? `(${v.map(fmt).join(", ")})` : typeof v === "string" ? `'${v}'` : String(v);

const SP = 0.95;

function Column({
  s, idx, slot, keyText, a, selected, onPick,
}: {
  s: Soldier; idx: number; slot: number; keyText: string; a: string; selected: boolean; onPick: () => void;
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const h = (s.height - 140) / 20; // 1.0 … 2.4
  // світле «скло»: білі колони з акцентними ребрами, вибрана — тонована
  const pale = useMemo(() => new Color("#ffffff").lerp(new Color(a), 0.07), [a]);
  const hot = useMemo(() => new Color("#ffffff").lerp(new Color(a), 0.38), [a]);
  const accent = useMemo(() => new Color(a), [a]);
  const x = (slot - (SQUAD.length - 1) / 2) * SP;

  useFrame((state, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = Math.min(1, dt * 5);
    const dx = x - grp.position.x;
    grp.position.x += dx * k;
    // під час переміщення колона трохи «підстрибує» і відходить назад, щоб не зіткнутися
    grp.position.z += (-Math.min(1.1, Math.abs(dx) * 0.5) * (idx % 2 ? 1 : -1) - grp.position.z) * k;
    grp.position.y += ((selected ? 0.12 : 0) + Math.min(0.35, Math.abs(dx) * 0.25) - grp.position.y) * k;
    const m = mat.current;
    if (m) {
      m.color.copy(selected ? hot : pale);
      m.emissive.copy(accent);
      const eg = selected ? 0.18 : 0.02 + Math.sin(state.clock.elapsedTime * 1.4 + idx) * 0.02;
      m.emissiveIntensity += (eg - m.emissiveIntensity) * k;
    }
  });

  return (
    <group ref={g} position={[x, 0, 0]}>
      <RoundedBox
        args={[0.66, h, 0.66]}
        radius={0.12}
        smoothness={4}
        position={[0, -1.3 + h / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
      >
        <meshPhysicalMaterial ref={mat} transmission={0.3} thickness={0.7} roughness={0.2} clearcoat={1} transparent opacity={0.95} emissiveIntensity={0} />
        <Edges threshold={20} color={a} />
      </RoundedBox>
      <Html position={[0, -1.3 + h + 0.32 + (slot % 2) * 0.36, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center gap-0.5 whitespace-nowrap">
          <span className="text-[11px] font-bold" style={{ color: "var(--label)" }}>
            {s.name}
          </span>
          <span
            className="rounded-full border border-separator bg-white/95 px-1.5 py-px font-mono text-[10px] font-bold text-label shadow-sm"
          >
            {keyText}
          </span>
        </div>
      </Html>
    </group>
  );
}

/** Зменшує сцену на вузьких екранах (до 340px), щоб нічого не обрізалось. */
function Fit({ width, children }: { width: number; children: ReactNode }) {
  const vw = useThree((s) => s.viewport.width);
  const k = Math.min(1, vw / width);
  return <group scale={k}>{children}</group>;
}

export function SortedKey3D() {
  const c = useThemeColors();
  const [key, setKey] = useState<K>("height");
  const [rev, setRev] = useState(false);
  const [sel, setSel] = useState<number | null>(null);

  const keyVals = SQUAD.map((s, i) => KEYS[key].k(s, i));
  const order = SQUAD.map((_, i) => i).sort((x, y) => cmp(keyVals[x], keyVals[y]));
  // Python: reverse=True зберігає стабільність — рівні елементи лишаються у вихідному порядку
  const finalOrder = rev
    ? SQUAD.map((_, i) => i).sort((x, y) => cmp(keyVals[y], keyVals[x]))
    : order;
  const slotOf = new Array<number>(SQUAD.length);
  finalOrder.forEach((idx, slot) => (slotOf[idx] = slot));

  const call = key === "none" ? `sorted(squad${rev ? ", reverse=True" : ""})` : `sorted(squad, key=${KEYS[key].code}${rev ? ", reverse=True" : ""})`;
  const result = `[${finalOrder.map((i) => SQUAD[i].name).join(", ")}]`;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="cl-sort-key"
          value={key}
          onChange={setKey}
          options={(Object.keys(KEYS) as K[]).map((k) => ({ value: k, label: <span className="font-mono text-[12px]">{KEYS[k].label}</span> }))}
        />
        <Btn variant={rev ? "accent" : "glass"} onClick={() => setRev((r) => !r)}>
          <ArrowDownUp className="size-4" strokeWidth={1.75} /> reverse={rev ? "True" : "False"}
        </Btn>
      </ControlBar>

      <div className="mx-5 overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2 font-mono text-[12.5px] whitespace-nowrap thin-scroll">
        {key === "none" ? (
          <span className="text-label-3"># без key порівнюються самі об&apos;єкти — тут показуємо вихідний порядок</span>
        ) : (
          <span style={{ color: "var(--accent)" }}>{call}</span>
        )}
      </div>

      <Scene3D height={360} camera={[0, 1.4, 7.8]} fov={44}>
        <Fit width={6.4}>
        <group position={[0, 0.1, 0]}>
          {SQUAD.map((s, i) => (
            <Column
              key={s.name}
              s={s}
              idx={i}
              slot={slotOf[i]}
              keyText={key === "none" ? `#${i}` : fmt(keyVals[i])}
              a={c.accent}
              selected={sel === i}
              onPick={() => setSel(sel === i ? null : i)}
            />
          ))}
        </group>
        </Fit>
      </Scene3D>

      <div className="grid gap-2 px-5 pb-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2 font-mono text-[12px] break-words text-label">
          <span className="text-label-3">›</span> {result}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={sel ?? "none"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-separator/30 px-3.5 py-2 text-[12.5px]"
          >
            {sel === null ? (
              <span className="text-label-2">Клацни колону — побачиш об&apos;єкт і його ключ</span>
            ) : (
              <span className="font-mono">
                {SQUAD[sel].name}: height={SQUAD[sel].height}, kills={SQUAD[sel].kills} → key ={" "}
                <b style={{ color: "var(--accent)" }}>{key === "none" ? "—" : fmt(keyVals[sel])}</b>
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
