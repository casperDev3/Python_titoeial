"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Mesh, MeshPhysicalMaterial } from "three";
import { ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";

type Tier = { key: string; letter: string; title: string; y: number; r: number; names: [string, string][] };

// Зверху вниз: L — найменше, B — найбільше «кільце» пошуку
const TIERS: Tier[] = [
  { key: "L", letter: "L", title: "Local", y: 1.05, r: 0.85, names: [["power", '"local: 100%"'], ["target", '"Ному"']] },
  { key: "E", letter: "E", title: "Enclosing", y: 0.35, r: 1.55, names: [["power", '"enclosing: 20%"'], ["combo", "3"]] },
  { key: "G", letter: "G", title: "Global", y: -0.35, r: 2.25, names: [["power", '"global: 5%"'], ["hero", '"Деку"'], ["counter", "0"]] },
  { key: "B", letter: "B", title: "Built-in", y: -1.05, r: 2.95, names: [["print", "<built-in>"], ["len", "<built-in>"], ["max", "<built-in>"]] },
];
const H = 0.42;

const QUERIES = ["power", "combo", "hero", "len", "ghost"] as const;
type Q = (typeof QUERIES)[number];
const foundAt = (q: Q) => TIERS.findIndex((t) => t.names.some(([n]) => n === q)); // -1 → NameError

/** Точка на «сходинці» ярусу, ближче до камери. */
function ledge(i: number): [number, number, number] {
  const t = TIERS[i];
  const inner = i === 0 ? 0 : TIERS[i - 1].r;
  return [0.35, t.y + H / 2 + 0.16, (inner + t.r) / 2];
}

function TierMesh({ t, i, stage, found, selected, onPick }: {
  t: Tier; i: number; stage: number; found: number; selected: number; onPick: (i: number) => void;
}) {
  const c = useThemeColors();
  const mat = useRef<MeshPhysicalMaterial>(null);
  const mesh = useRef<Mesh>(null);
  const [hover, setHover] = useState(false);
  const active = stage === i;
  const hit = stage === i && found === i;

  useFrame((_, dt) => {
    const m = mat.current;
    if (!m) return;
    const goal = hit ? 1.1 : active ? 0.55 : selected === i || hover ? 0.3 : 0.04;
    m.emissiveIntensity += (goal - m.emissiveIntensity) * Math.min(1, dt * 8);
    const mm = mesh.current;
    if (mm) {
      const s = hit ? 1.035 : 1;
      mm.scale.x += (s - mm.scale.x) * Math.min(1, dt * 10);
      mm.scale.z = mm.scale.x;
    }
  });

  const color = i % 2 === 0 ? c.accent : c.accent2;
  return (
    <group position={[0, t.y, 0]}>
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation();
          onPick(i);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <cylinderGeometry args={[t.r, t.r, H, 72, 1]} />
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          emissive={color}
          emissiveIntensity={0.04}
          transmission={0.55}
          thickness={0.8}
          roughness={0.18}
          metalness={0}
          clearcoat={1}
          transparent
          opacity={0.82}
        />
      </mesh>
      <Html position={[-t.r * 0.72, 0, t.r * 0.72]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-white shadow"
          style={{ background: active ? "var(--accent)" : "rgba(0,0,0,.45)", backdropFilter: "blur(8px)" }}
        >
          {t.letter} · {t.title}
        </div>
      </Html>
    </group>
  );
}

function Probe({ stage, found, done }: { stage: number; found: number; done: boolean }) {
  const c = useThemeColors();
  const ref = useRef<Mesh>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    const miss = done && found < 0;
    const [x, y, z] = stage < 0 ? [0.35, 1.9, 0.4] : miss ? [0.35, -2.0, 3.4] : ledge(Math.min(stage, 3));
    const k = Math.min(1, dt * 6);
    m.position.x += (x - m.position.x) * k;
    m.position.y += (y + Math.sin(state.clock.elapsedTime * 3) * 0.04 - m.position.y) * k;
    m.position.z += (z - m.position.z) * k;
    if (mat.current) mat.current.emissiveIntensity = 0.9 + Math.sin(state.clock.elapsedTime * 6) * 0.3;
  });
  const miss = done && found < 0;
  return (
    <mesh ref={ref} position={[0.35, 1.9, 0.4]}>
      <sphereGeometry args={[0.16, 32, 32]} />
      <meshPhysicalMaterial ref={mat} color={miss ? "#ff453a" : "#ffffff"} emissive={miss ? "#ff453a" : c.accent} emissiveIntensity={1} roughness={0.1} clearcoat={1} />
    </mesh>
  );
}

/** Зменшує сцену на вузьких екранах (до 340px), щоб нічого не обрізалось. */
function Fit({ width, children }: { width: number; children: ReactNode }) {
  const vw = useThree((s) => s.viewport.width);
  const k = Math.min(1, vw / width);
  return <group scale={k}>{children}</group>;
}

export function Legb3D() {
  const [q, setQ] = useState<Q>("power");
  const [stage, setStage] = useState(-1);
  const [selected, setSelected] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const found = foundAt(q);
  const last = found < 0 ? TIERS.length : found; // скільки ярусів пройде зонд
  const done = stage >= last;

  const run = (name: Q) => {
    timers.current.forEach(clearTimeout);
    setQ(name);
    setStage(-1);
    const f = foundAt(name);
    const end = f < 0 ? TIERS.length : f;
    timers.current = Array.from({ length: end + 1 }, (_, i) => setTimeout(() => setStage(i), 350 + i * 750));
  };

  useEffect(() => {
    const t = setTimeout(() => run("power"), 600);
    return () => {
      clearTimeout(t);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const status =
    stage < 0
      ? `Шукаю ім'я «${q}»…`
      : found >= 0 && stage === found
        ? `✓ «${q}» знайдено в ${TIERS[found].title}. Пошук зупинено — зовнішні рівні вже не перевіряються.`
        : stage >= TIERS.length
          ? `✗ NameError: name '${q}' is not defined — жодне кільце не знає цього імені.`
          : `Немає в ${TIERS[stage].title} → йду назовні…`;

  const sel = TIERS[selected];
  return (
    <div>
      <ControlBar>
        <span className="text-[13px] font-medium text-label-2">Шукаємо:</span>
        <Segmented
          id="fn-legb-q"
          value={q}
          onChange={run}
          options={QUERIES.map((n) => ({ value: n, label: <span className="font-mono">{n}</span> }))}
        />
      </ControlBar>
      <Scene3D height={360} camera={[4.6, 3.4, 6.2]} fov={42}>
        <Fit width={6.6}>
        <group position={[0, 0.1, 0]}>
          {TIERS.map((t, i) => (
            <TierMesh key={t.key} t={t} i={i} stage={stage} found={found} selected={selected} onPick={setSelected} />
          ))}
          <Probe stage={stage} found={found} done={done} />
        </group>
        </Fit>
      </Scene3D>
      <div className="grid gap-2 px-5 pb-4 sm:grid-cols-[1.3fr_1fr]">
        <div
          className="rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug"
          style={{
            background:
              done && found < 0
                ? "color-mix(in oklab, #ff453a 12%, transparent)"
                : "color-mix(in oklab, var(--accent) 10%, transparent)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={status} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }}>
              {status}
            </motion.div>
          </AnimatePresence>
          <div className="mt-2 flex gap-1">
            {TIERS.map((t, i) => (
              <span
                key={t.key}
                className="flex-1 rounded-full py-0.5 text-center font-mono text-[11px] font-bold transition-colors"
                style={{
                  background: i <= stage ? (i === found ? "var(--accent)" : "var(--separator)") : "transparent",
                  color: i === found && i <= stage ? "#fff" : "var(--label-2)",
                  border: "1px solid var(--separator)",
                }}
              >
                {t.letter}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-separator/30 px-3 py-2.5">
          <div className="mb-1 text-[11px] font-bold tracking-wider text-label-3 uppercase">
            {sel.letter} · {sel.title} <span className="font-normal normal-case">(клацни ярус)</span>
          </div>
          <div className="flex flex-col gap-0.5 font-mono text-[12px]">
            {sel.names.map(([n, v]) => (
              <div key={n} className="flex justify-between gap-2">
                <span style={{ color: n === q ? "var(--accent)" : undefined }} className={n === q ? "font-bold" : ""}>
                  {n}
                </span>
                <span className="truncate text-label-2">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
