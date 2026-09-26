"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { Btn, Console, ControlBar, Scene3D, useThemeColors, type ThemeColors } from "../kit";
import { FitCamera, damp, nowSec, setCanvasCursor } from "./three-utils";

const POOL = ["Gojo", "Yuji", "Megumi", "Nobara", "Sukuna", "Maki", "Toji", "Geto", "Yuta", "Todo"];
const SEG = 0.55; // секунд на один «стрибок» кулі

/** Навчальний хеш: сума кодів символів. */
const toyHash = (k: string) => [...k].reduce((s, ch) => s + ch.charCodeAt(0), 0);

type Table = (string | null)[];
type Flight = { key: string; path: number[]; t0: number; kind: "insert" | "lookup"; id: number };

function probe(table: Table, key: string): number[] {
  const size = table.length;
  const path: number[] = [];
  let i = toyHash(key) % size;
  for (let n = 0; n < size; n++) {
    path.push(i);
    if (table[i] === null || table[i] === key) break;
    i = (i + 1) % size;
  }
  return path;
}

function rebuild(keys: string[], size: number): Table {
  const t: Table = Array(size).fill(null);
  for (const k of keys) {
    const p = probe(t, k);
    t[p[p.length - 1]] = k;
  }
  return t;
}

const stepsWord = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "крок";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "кроки";
  return "кроків";
};

const radiusFor = (size: number) => (size <= 8 ? 2.3 : 3.1);
const slotPos = (i: number, size: number): [number, number, number] => {
  const a = (i / size) * Math.PI * 2 - Math.PI / 2;
  const r = radiusFor(size);
  return [Math.cos(a) * r, 0, Math.sin(a) * r];
};

export function HashDomain3D() {
  const colors = useThemeColors();
  const [table, setTable] = useState<Table>(() => Array(8).fill(null));
  const [order, setOrder] = useState<string[]>([]);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [info, setInfo] = useState<string[]>([
    "d = {}   # 8 порожніх комірок",
    "# натисни «Додати ключ»",
  ]);
  const flightId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const size = table.length;
  const used = order.length;
  const usable = Math.floor((size * 2) / 3);
  const nextKey = POOL.find((k) => !order.includes(k));

  const explain = (key: string, path: number[], sz: number) => {
    const h = toyHash(key);
    const lines = [`hash("${key}") = ${h}  →  ${h} % ${sz} = ${h % sz}`];
    if (path.length > 1)
      lines.push(`колізія! ${path.slice(0, -1).map((p) => `[${p}]`).join(", ")} зайнято → ставимо в [${path[path.length - 1]}]`);
    return lines;
  };

  const add = () => {
    if (!nextKey || flight) return;
    let t = table;
    const pre: string[] = [];
    if (used >= usable) {
      t = rebuild(order, size * 2);
      pre.push(`# зайнято ${used} з ${size} — поріг 2/3 досягнуто → розширення до ${size * 2}, ключі перерозкладено`);
      setTable(t);
    }
    const path = probe(t, nextKey);
    const id = ++flightId.current;
    setFlight({ key: nextKey, path, t0: nowSec() + (pre.length ? 0.9 : 0), kind: "insert", id });
    setInfo([`d["${nextKey}"] = ...`, ...pre, ...explain(nextKey, path, t.length)]);
    const k = nextKey;
    timer.current = setTimeout(
      () => {
        setTable((old) => {
          const nt = [...old];
          nt[path[path.length - 1]] = k;
          return nt;
        });
        setOrder((o) => [...o, k]);
        setFlight((f) => (f && f.id === id ? null : f));
      },
      (path.length * SEG + (pre.length ? 0.9 : 0)) * 1000 + 60,
    );
  };

  const lookup = (key: string) => {
    if (flight) return;
    const path = probe(table, key);
    const id = ++flightId.current;
    setFlight({ key, path, t0: nowSec(), kind: "lookup", id });
    setInfo([
      `d["${key}"]   # пошук`,
      ...explain(key, path, size),
      `# знайдено за ${path.length} ${stepsWord(path.length)} — без перебору всіх ${used} ключів`,
    ]);
    timer.current = setTimeout(() => setFlight((f) => (f && f.id === id ? null : f)), path.length * SEG * 1000 + 400);
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setTable(Array(8).fill(null));
    setOrder([]);
    setFlight(null);
    setInfo(["d = {}   # 8 порожніх комірок", "# натисни «Додати ключ»"]);
  };

  return (
    <div>
      <Scene3D height={380} camera={[0, 5.2, 6.4]} fov={42}>
        <FitCamera width={2 * radiusFor(16) + 1.6} height={4.6} min={7} />
        <SixEyes colors={colors} busy={!!flight} />
        {table.map((k, i) => (
          <Slot
            key={i}
            index={i}
            size={size}
            colors={colors}
            flight={flight}
            occupied={k !== null && !(flight && flight.kind === "insert" && flight.key === k)}
            onPick={() => k && lookup(k)}
          />
        ))}
        {table.map((k, i) =>
          k && order.includes(k) ? <KeyOrb key={k} name={k} target={slotPos(i, size)} colors={colors} /> : null,
        )}
        {flight && <FlyingOrb key={flight.id} flight={flight} size={size} colors={colors} />}
      </Scene3D>

      <div className="flex flex-wrap gap-1.5 px-5 pt-3">
        <span className="text-[12px] font-semibold text-label-2">у словнику:</span>
        {order.length === 0 && <span className="text-[12px] text-label-3">порожньо</span>}
        {order.map((k) => (
          <button
            key={k}
            onClick={() => lookup(k)}
            className="pill pill-glass !px-2.5 !py-0.5 font-mono !text-[11.5px]"
            title="Знайти цей ключ"
          >
            {k}
          </button>
        ))}
      </div>
      <ControlBar>
        <Btn variant="accent" onClick={add} disabled={!nextKey || !!flight}>
          Додати ключ{nextKey ? ` "${nextKey}"` : ""}
        </Btn>
        <Btn onClick={reset}>
          <span className="inline-flex items-center gap-1">
            <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
            Скинути
          </span>
        </Btn>
        <span className="ml-auto font-mono text-[12px] text-label-2 tabular-nums">
          {used}/{size} · поріг {usable}
        </span>
      </ControlBar>
      <Console
        lines={info.map((l, i) => (
          <span key={`${i}-${l}`} className={l.startsWith("колізія") ? "text-[#ff6961]" : l.startsWith("#") ? "text-[#ffd60a]" : i === 0 ? "" : "text-[#8fd3ff]"}>
            {i === 0 && <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>}
            {l}
          </span>
        ))}
      />
    </div>
  );
}

function SixEyes({ colors, busy }: { colors: ThemeColors; busy: boolean }) {
  const core = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.05);
    if (halo.current) {
      halo.current.rotation.z += dt * (busy ? 1.6 : 0.4);
      halo.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.7) * 0.15;
    }
  });
  return (
    <group position={[0, 0.7, 0]}>
      <mesh ref={core}>
        <sphereGeometry args={[0.36, 40, 40]} />
        <meshPhysicalMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.9} roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh ref={halo}>
        <torusGeometry args={[0.62, 0.025, 12, 64]} />
        <meshStandardMaterial color={colors.accent2} emissive={colors.accent2} emissiveIntensity={0.8} />
      </mesh>
      {/* підлога «території» */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color={colors.glow} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function Slot({
  index,
  size,
  colors,
  flight,
  occupied,
  onPick,
}: {
  index: number;
  size: number;
  colors: ThemeColors;
  flight: Flight | null;
  occupied: boolean;
  onPick: () => void;
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const [spawn] = useState<[number, number, number]>(() => slotPos(index, size));
  const target = slotPos(index, size);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const o = g.current;
    if (!o) return;
    o.position.x = damp(o.position.x, target[0], 5, d);
    o.position.z = damp(o.position.z, target[2], 5, d);
    o.scale.setScalar(damp(o.scale.x, 1, 6, d));
    o.rotation.y = -((index / size) * Math.PI * 2 - Math.PI / 2);
    if (!mat.current) return;
    // підсвітка: колізія (червона) або ціль (акцент)
    let hit = 0;
    let goal = 0;
    if (flight) {
      const el = nowSec() - flight.t0;
      const k = flight.path.indexOf(index);
      if (k >= 0) {
        const arrive = (k + 1) * SEG;
        const since = el - arrive;
        const last = k === flight.path.length - 1;
        if (since >= 0 && since < 0.5 && !last) hit = 1 - since / 0.5;
        if (since >= 0 && last) goal = 1;
      }
    }
    mat.current.emissive.set(hit > 0 ? "#ff3b30" : colors.accent);
    mat.current.emissiveIntensity = hit > 0 ? hit * 1.4 : goal ? 0.8 : occupied ? 0.25 : 0.04;
  });

  return (
    <group ref={g} position={spawn} scale={0.01}>
      <RoundedBox
        args={[0.78, 0.16, 0.78]}
        radius={0.06}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={(e) => occupied && setCanvasCursor(e, "pointer")}
        onPointerOut={(e) => setCanvasCursor(e, "auto")}
      >
        <meshPhysicalMaterial
          ref={mat}
          color={occupied ? colors.accent : "#ffffff"}
          emissive={colors.accent}
          emissiveIntensity={0.04}
          roughness={0.2}
          transmission={occupied ? 0.2 : 0.5}
          thickness={0.3}
          clearcoat={1}
        />
      </RoundedBox>
      <Html center zIndexRange={[20, 0]} position={[0, -0.02, 0.62]} style={{ pointerEvents: "none" }}>
        <span className="font-mono text-[10px] font-bold text-label-2">[{index}]</span>
      </Html>
    </group>
  );
}

function KeyOrb({ name, target, colors }: { name: string; target: [number, number, number]; colors: ThemeColors }) {
  const g = useRef<Group>(null);
  const [spawn] = useState<[number, number, number]>(() => [target[0], 0.45, target[2]]);
  useFrame(({ clock }, dt) => {
    const d = Math.min(dt, 0.05);
    const o = g.current;
    if (!o) return;
    o.position.x = damp(o.position.x, target[0], 4, d);
    o.position.z = damp(o.position.z, target[2], 4, d);
    o.position.y = 0.45 + Math.sin(clock.elapsedTime * 2 + target[0]) * 0.05;
  });
  return (
    <group ref={g} position={spawn}>
      <mesh>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshPhysicalMaterial color={colors.accent2} emissive={colors.accent2} emissiveIntensity={0.35} roughness={0.15} clearcoat={1} />
      </mesh>
      <Html center zIndexRange={[20, 0]} position={[0, 0.42, 0]} style={{ pointerEvents: "none" }}>
        <span className="glass !rounded-full px-1.5 py-px font-mono text-[10.5px] font-semibold whitespace-nowrap text-label">
          {name}
        </span>
      </Html>
    </group>
  );
}

function FlyingOrb({ flight, size, colors }: { flight: Flight; size: number; colors: ThemeColors }) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    const o = g.current;
    if (!o) return;
    const el = nowSec() - flight.t0;
    if (el < 0) {
      o.position.set(0, 0.7, 0);
      o.scale.setScalar(0.001);
      return;
    }
    const seg = Math.min(Math.floor(el / SEG), flight.path.length - 1);
    const t = Math.min(1, (el - seg * SEG) / SEG);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const from: [number, number, number] = seg === 0 ? [0, 0.7, 0] : slotPos(flight.path[seg - 1], size);
    const to = slotPos(flight.path[seg], size);
    const hop = seg === 0 ? 1.1 : 0.55;
    o.position.set(
      from[0] + (to[0] - from[0]) * e,
      (seg === 0 ? 0.7 * (1 - e) : 0) + 0.45 + Math.sin(Math.PI * e) * hop,
      from[2] + (to[2] - from[2]) * e,
    );
    o.scale.setScalar(Math.min(1, el * 4));
    if (mat.current) mat.current.emissiveIntensity = 0.8 + Math.sin(el * 20) * 0.2;
  });
  const c = flight.kind === "lookup" ? colors.accent : colors.accent2;
  return (
    <group ref={g} position={[0, 0.7, 0]} scale={0.001}>
      <mesh>
        <sphereGeometry args={[0.24, 28, 28]} />
        <meshStandardMaterial ref={mat} color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
      <Html center zIndexRange={[20, 0]} position={[0, 0.44, 0]} style={{ pointerEvents: "none" }}>
        <span
          className="rounded-full px-1.5 py-px font-mono text-[10.5px] font-bold whitespace-nowrap text-white"
          style={{ background: "var(--accent)" }}
        >
          {flight.kind === "lookup" ? `? ${flight.key}` : flight.key}
        </span>
      </Html>
    </group>
  );
}
