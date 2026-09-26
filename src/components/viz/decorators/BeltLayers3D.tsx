"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "motion/react";
import { Check, Database, Megaphone, NotebookPen, Timer, Zap, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Vector3, type Mesh, type MeshPhysicalMaterial, type MeshStandardMaterial } from "three";
import { Btn, ControlBar, Scene3D, useThemeColors, type ThemeColors } from "../kit";
import { FitCamera, INK, damp, tokenize } from "./shared";

type LayerId = "timer" | "log" | "cache" | "shout";

const LAYERS: { id: LayerId; icon: LucideIcon; hint: string }[] = [
  { id: "timer", icon: Timer, hint: "міряє час" },
  { id: "log", icon: NotebookPen, hint: "пише в журнал" },
  { id: "cache", icon: Database, hint: "пам'ятає результат" },
  { id: "shout", icon: Megaphone, hint: "змінює результат" },
];

const SEG = 0.42; // секунд на один перехід між шарами
const CORE_R = 0.42;
const radiusOf = (k: number) => 0.95 + k * 0.48; // k — індекс від ядра
const DIR = new Vector3(1, 0.42, 0.75).normalize();

type Plan = { stops: number[]; lines: string[]; result: string; hit: boolean };
type Run = { id: number; plan: Plan };

const RAW = "удар по Джокеру";

function makePlan(active: LayerId[], cached: boolean): Plan {
  // active — зовнішній → внутрішній
  const n = active.length;
  const rOf = (idx: number) => radiusOf(n - 1 - idx);
  const outer = (n ? rOf(0) : CORE_R) + 0.9;
  const stops: number[] = [outer];
  const lines: string[] = [];
  const cacheIdx = active.indexOf("cache");
  const hit = cached && cacheIdx >= 0;
  const depth = hit ? cacheIdx + 1 : n;
  const inner = active.slice(0, depth);

  const shouted = active.includes("shout");
  const coreResult = RAW;
  const finalResult = shouted ? RAW.toUpperCase() : RAW;

  lines.push('>>> strike("Джокер")');
  inner.forEach((id, k) => {
    stops.push(rOf(k));
    if (id === "timer") lines.push("timer: старт секундоміра");
    if (id === "log") lines.push("log: → strike('Джокер')");
    if (id === "cache") lines.push(hit ? "cache: ВЛУЧАННЯ! ядро не викликаємо" : "cache: промах — треба рахувати");
    if (id === "shout") lines.push("shout: чекаю результат…");
  });
  if (!hit) {
    stops.push(0);
    lines.push(`strike() → '${coreResult}'`);
  }
  // шлях назад
  let cur = hit ? finalResult : coreResult;
  for (let k = depth - 1; k >= 0; k--) {
    const id = active[k];
    if (hit && k === depth - 1) {
      // шар кешу — розворот уже відбувся на ньому
      continue;
    }
    stops.push(rOf(k));
    if (id === "shout") {
      cur = cur.toUpperCase();
      lines.push(`shout → '${cur}'`);
    }
    if (id === "cache") lines.push("cache: запам'ятав результат");
    if (id === "log") lines.push(`log: ← '${cur}'`);
    if (id === "timer") lines.push(`timer: ${hit ? "0.01" : "0.35"} мс`);
  }
  stops.push(outer);
  lines.push(`'${finalResult}'`);
  return { stops, lines, result: finalResult, hit };
}

export function BeltLayers3D() {
  const colors = useThemeColors();
  const [on, setOn] = useState<Record<LayerId, boolean>>({ timer: true, log: true, cache: true, shout: false });
  const [cached, setCached] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [shown, setShown] = useState<string[]>(["# увімкни шари і натисни «Виклик»"]);
  const runId = useRef(0);
  const pulseRef = useRef(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const active = LAYERS.map((l) => l.id).filter((id) => on[id]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const call = () => {
    if (run) return;
    const plan = makePlan(active, cached);
    const id = ++runId.current;
    setRun({ id, plan });
    setShown([plan.lines[0]]);
    timers.current.forEach(clearTimeout);
    // рядки консолі з'являються синхронно з імпульсом
    const segs = plan.stops.length - 1;
    const mid = plan.lines.slice(1, -1);
    mid.forEach((line, k) => {
      timers.current.push(setTimeout(() => setShown((s) => [...s, line]), (k + 1) * SEG * 1000));
    });
    timers.current.push(
      setTimeout(() => {
        setShown((s) => [...s, plan.lines[plan.lines.length - 1]]);
        setRun((r) => (r && r.id === id ? null : r));
        if (active.includes("cache")) setCached(true);
      }, segs * SEG * 1000 + 80),
    );
  };

  const toggle = (id: LayerId) => {
    if (run) return;
    setOn((o) => ({ ...o, [id]: !o[id] }));
    setCached(false);
  };

  const n = active.length;
  const expr = active.reduceRight((acc, id) => `${id}(${acc})`, "strike");

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-5 pt-2">
        {LAYERS.map((l) => (
          <motion.button
            key={l.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => toggle(l.id)}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
            style={{
              borderColor: on[l.id] ? INK : "var(--separator)",
              background: on[l.id] ? "color-mix(in oklab, var(--accent) 18%, white)" : "white",
              opacity: run ? 0.6 : 1,
            }}
          >
            <l.icon className="size-4" strokeWidth={1.75} />
            <span className="font-mono">@{l.id}</span>
            <span className="hidden text-[11px] font-normal text-label-2 sm:inline">· {l.hint}</span>
          </motion.button>
        ))}
      </div>

      <Scene3D height={360} camera={[1.2, 1.6, 7]} fov={42}>
        <FitCamera width={radiusOf(3) * 2 + 1.6} height={radiusOf(3) * 2 + 0.6} min={6} />
        <Core colors={colors} pulseRef={pulseRef} />
        {active.map((id, idx) => (
          <Shell
            key={id}
            id={id}
            radius={radiusOf(n - 1 - idx)}
            colors={colors}
            pulseRef={pulseRef}
            hitLayer={id === "cache" && cached}
            order={idx}
          />
        ))}
        {run && <Traveler key={run.id} stops={run.plan.stops} colors={colors} pulseRef={pulseRef} />}
      </Scene3D>

      <div className="grid gap-3 px-5 pt-3 md:grid-cols-2">
        <div className="min-w-0 overflow-x-auto rounded-2xl border border-separator bg-black/[0.035] px-3 py-2 font-mono text-[12px] leading-[1.7]">
          {active.map((id) => (
            <div key={id} className="whitespace-pre">
              {tokenize(`@${id}`, `d-${id}`)}
            </div>
          ))}
          <div className="whitespace-pre">{tokenize("def strike(target):", "d-def")}</div>
          <div className="whitespace-pre">{tokenize('    return f"удар по {target}у"', "d-ret")}</div>
          <div className="mt-1 border-t border-separator pt-1 whitespace-pre text-label-2">
            {tokenize(`# strike = ${expr}`, "d-eq")}
          </div>
        </div>
        <div className="min-h-[120px] rounded-2xl bg-black/80 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#e5e5ea]">
          {shown.map((l, k) => (
            <motion.div
              key={`${k}-${l}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={l.startsWith(">>>") || l.startsWith("#") ? "text-[#8e8e93]" : l.includes("ВЛУЧАННЯ") ? "text-[#facc15]" : ""}
            >
              {l}
            </motion.div>
          ))}
        </div>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={call} disabled={!!run}>
          <Zap className="size-4" strokeWidth={1.75} />
          Виклик strike()
        </Btn>
        <Btn
          onClick={() => {
            setCached(false);
            setShown(["# strike.cache_clear()"]);
          }}
          disabled={!!run || !on.cache}
        >
          Очистити кеш
        </Btn>
        <span className="ml-auto text-[12px] text-label-2">
          кеш: <b className="text-label">{on.cache ? (cached ? "є результат" : "порожній") : "вимкнено"}</b>
        </span>
      </ControlBar>
    </div>
  );
}

const LAYER_COLOR = (id: LayerId, c: ThemeColors) =>
  id === "timer" ? c.accent : id === "log" ? c.accent2 : id === "cache" ? "#f59e0b" : "#475569";

function Shell({
  id,
  radius,
  colors,
  pulseRef,
  hitLayer,
  order,
}: {
  id: LayerId;
  radius: number;
  colors: ThemeColors;
  pulseRef: MutableRefObject<number>;
  hitLayer: boolean;
  order: number;
}) {
  const group = useRef<Mesh>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const ring = useRef<Mesh>(null);
  const ringMat = useRef<MeshStandardMaterial>(null);
  const scale = useRef(0.01);
  const color = LAYER_COLOR(id, colors);

  useFrame((state, dt) => {
    scale.current = damp(scale.current, 1, 7, dt);
    if (group.current) group.current.scale.setScalar(scale.current);
    const near = pulseRef.current >= 0 ? Math.max(0, 1 - Math.abs(pulseRef.current - radius) / 0.22) : 0;
    if (mat.current) mat.current.opacity = damp(mat.current.opacity, 0.1 + near * 0.28, 12, dt);
    if (ringMat.current) ringMat.current.emissiveIntensity = damp(ringMat.current.emissiveIntensity, 0.15 + near * 1.8, 12, dt);
    if (ring.current) {
      ring.current.rotation.z += dt * (0.25 + order * 0.08) * (order % 2 ? -1 : 1);
      ring.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.4 + order) * 0.18;
    }
  });

  const a = 0.62 + order * 0.16;
  return (
    <group>
      <mesh ref={group}>
        <sphereGeometry args={[radius, 48, 32]} />
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          transparent
          opacity={0.1}
          roughness={0.1}
          metalness={0}
          clearcoat={1}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[radius, 0.022, 12, 128]} />
        <meshStandardMaterial ref={ringMat} color={color} emissive={color} emissiveIntensity={0.15} metalness={0.1} roughness={0.35} />
      </mesh>
      <Html
        position={[Math.cos(a) * radius * -1, Math.sin(a) * radius, 0.1]}
        center
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          className="flex items-center gap-1 rounded-full border bg-white/95 px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap shadow-md"
          style={{ borderColor: color, color: hitLayer ? "#b45309" : "var(--label)" }}
        >
          @{id}
          {hitLayer && <Check className="size-3" strokeWidth={2.25} />}
        </div>
      </Html>
    </group>
  );
}

function Core({ colors, pulseRef }: { colors: ThemeColors; pulseRef: MutableRefObject<number> }) {
  const ref = useRef<Mesh>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.5;
      ref.current.rotation.x += dt * 0.2;
    }
    const near = pulseRef.current >= 0 && pulseRef.current < 0.2 ? 1 : 0;
    if (mat.current) mat.current.emissiveIntensity = damp(mat.current.emissiveIntensity, 0.25 + near * 2.2, 10, dt);
  });
  return (
    <group>
      <mesh ref={ref}>
        <octahedronGeometry args={[CORE_R, 0]} />
        <meshStandardMaterial
          ref={mat}
          color="#f8fafc"
          emissive={colors.accent}
          emissiveIntensity={0.25}
          metalness={0.05}
          roughness={0.3}
          flatShading
        />
      </mesh>
      <Html position={[0, -CORE_R - 0.28, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="rounded-full border border-separator bg-white/95 px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-label shadow-md">
          strike()
        </div>
      </Html>
    </group>
  );
}

function Traveler({
  stops,
  colors,
  pulseRef,
}: {
  stops: number[];
  colors: ThemeColors;
  pulseRef: MutableRefObject<number>;
}) {
  const ref = useRef<Mesh>(null);
  const t = useRef(0);
  const tmp = useRef(new Vector3());

  useEffect(
    () => () => {
      pulseRef.current = -1;
    },
    [pulseRef],
  );

  useFrame((_, dt) => {
    t.current += dt;
    const segs = stops.length - 1;
    const u = Math.min(t.current / SEG, segs);
    const k = Math.min(Math.floor(u), segs - 1);
    const f = u - k;
    const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    const r = stops[k] + (stops[k + 1] - stops[k]) * e;
    pulseRef.current = r;
    const m = ref.current;
    if (m) {
      tmp.current.copy(DIR).multiplyScalar(r);
      m.position.copy(tmp.current);
      m.scale.setScalar(1 + Math.sin(t.current * 14) * 0.12);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.13, 20, 20]} />
      <meshBasicMaterial color={colors.accent} />
    </mesh>
  );
}
