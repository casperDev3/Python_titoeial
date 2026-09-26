"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Group, Mesh, MeshPhysicalMaterial } from "three";
import { Btn, Console, ControlBar, Scene3D, useThemeColors, type ThemeColors } from "../kit";
import { FitCamera, damp, nowSec, setCanvasCursor } from "./three-utils";

const TECH = ["Blue", "Red", "Purple", "Void", "Six Eyes", "Flash"] as const;
type Tech = (typeof TECH)[number];

const BARRIER = 2.05;
const FLY = 1.15; // секунд польоту снаряда

type Shot = { id: number; name: Tech; dup: boolean; t0: number; angle: number };
type Member = { name: Tech; angle: number };
const INITIAL: Member[] = [
  { name: "Blue", angle: 0 },
  { name: "Red", angle: Math.PI },
];

export function InfinitySet3D() {
  const colors = useThemeColors();
  const [members, setMembers] = useState<Member[]>(INITIAL);
  const [shots, setShots] = useState<Shot[]>([]);
  const [lines, setLines] = useState<{ t: string; tone: "cmd" | "ok" | "dup" }[]>([
    { t: 's = {"Blue", "Red"}', tone: "cmd" },
  ]);
  const [ripple, setRipple] = useState({ n: 0, dup: false });
  const shotId = useRef(0);
  const pending = useRef<Set<Tech>>(new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const ts = timers.current;
    return () => ts.forEach(clearTimeout);
  }, []);

  const log = (...ls: { t: string; tone: "cmd" | "ok" | "dup" }[]) => setLines((o) => [...o, ...ls].slice(-5));

  const throwOne = (name: Tech, delay = 0, current: Set<Tech>) => {
    const dup = current.has(name);
    current.add(name);
    const id = ++shotId.current;
    const angle = (id * 2.399) % (Math.PI * 2); // «золотий кут» — рівномірно навколо
    const shot: Shot = { id, name, dup, t0: nowSec() + delay, angle };
    setShots((s) => [...s, shot]);
    const hitAt = (delay + FLY * 0.62) * 1000;
    timers.current.push(
      setTimeout(() => {
        setRipple((r) => ({ n: r.n + 1, dup }));
        if (!dup) setMembers((m) => (m.some((x) => x.name === name) ? m : [...m, { name, angle }]));
        log(
          { t: `s.add("${name}")`, tone: "cmd" },
          dup
            ? { t: `# "${name}" вже є → Нескінченність відбила дублікат`, tone: "dup" }
            : { t: `# новий елемент пройшов крізь бар'єр`, tone: "ok" },
        );
      }, hitAt),
      setTimeout(() => {
        setShots((s) => s.filter((x) => x.id !== id));
        pending.current.delete(name);
      }, (delay + FLY) * 1000 + 50),
    );
  };

  const known = () => new Set<Tech>([...members.map((m) => m.name), ...pending.current]);

  const add = (name: Tech) => {
    const cur = known();
    const wasNew = !cur.has(name);
    throwOne(name, 0, cur);
    if (wasNew) pending.current.add(name);
  };

  const fromList = () => {
    const list: Tech[] = ["Purple", "Blue", "Purple", "Void", "Blue"];
    log({ t: `s.update(${JSON.stringify(list).replace(/,/g, ", ")})`, tone: "cmd" });
    const cur = known();
    list.forEach((n, i) => {
      const wasNew = !cur.has(n);
      throwOne(n, i * 0.35, cur);
      if (wasNew) pending.current.add(n);
    });
  };

  const discard = (name: Tech) => {
    setMembers((m) => m.filter((x) => x.name !== name));
    log({ t: `s.discard("${name}")`, tone: "cmd" }, { t: `# вилучено, len(s) = ${members.length - 1}`, tone: "ok" });
  };

  const has = (t: Tech) => members.some((m) => m.name === t);

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    pending.current.clear();
    setShots([]);
    setMembers(INITIAL);
    setLines([{ t: 's = {"Blue", "Red"}', tone: "cmd" }]);
  };

  return (
    <div>
      <div className="relative">
        <Scene3D height={380} camera={[0, 2.2, 8]} fov={42} autoRotate>
          <FitCamera width={2 * BARRIER + 3.6} height={2 * BARRIER + 1.4} min={6.5} />
          <Core colors={colors} />
          <Barrier colors={colors} ripple={ripple} />
          {members.map((m, i) => (
            <Orbiter
              key={m.name}
              name={m.name}
              from={m.angle}
              index={i}
              total={members.length}
              colors={colors}
              onPick={() => discard(m.name)}
            />
          ))}
          {shots.map((s) => (
            <Projectile key={s.id} shot={s} colors={colors} />
          ))}
        </Scene3D>
        <div className="glass pointer-events-none absolute top-3 right-3 !rounded-[14px] px-3 py-1.5 font-mono text-[13px] font-semibold tabular-nums">
          len(s) = {members.length}
        </div>
      </div>
      <ControlBar>
        {TECH.map((t) => (
          <button
            key={t}
            onClick={() => add(t)}
            className={`pill ${has(t) ? "pill-glass" : "pill-accent"} !px-2.5 !py-1 !text-[12px]`}
            title={has(t) ? "Вже в множині — буде дублікат" : "Новий елемент"}
          >
            add(&quot;{t}&quot;)
          </button>
        ))}
      </ControlBar>
      <ControlBar>
        <Btn onClick={fromList}>update([…з дублікатами])</Btn>
        <Btn onClick={reset}>
          <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Скинути</span>
        </Btn>
      </ControlBar>
      <Console
        lines={[
          ...lines.map((l, i) => (
            <span
              key={`${i}-${l.t}`}
              className={`break-all ${l.tone === "dup" ? "text-[#ff9f0a]" : l.tone === "ok" ? "text-[#8fd3ff]" : ""}`}
            >
              {l.tone === "cmd" && <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>}
              {l.t}
            </span>
          )),
          <span key="state" className="break-all text-[#ffd60a]">
            s = {"{"}
            {members.map((m) => `'${m.name}'`).join(", ")}
            {"}"}
          </span>,
        ]}
      />
    </div>
  );
}

function Core({ colors }: { colors: ThemeColors }) {
  const m = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (m.current) m.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.06);
  });
  return (
    <group>
      <mesh ref={m}>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshPhysicalMaterial color="#ffffff" emissive={colors.accent} emissiveIntensity={1.1} roughness={0.05} clearcoat={1} />
      </mesh>
      <pointLight color={colors.accent} intensity={6} distance={6} />
    </group>
  );
}

function Barrier({ colors, ripple }: { colors: ThemeColors; ripple: { n: number; dup: boolean } }) {
  const mat = useRef<MeshPhysicalMaterial>(null);
  const shell = useRef<Mesh>(null);
  const flash = useRef(0);

  useEffect(() => {
    if (ripple.n > 0) flash.current = 1;
  }, [ripple.n]);

  useFrame(({ clock }, dt) => {
    flash.current = Math.max(0, flash.current - Math.min(dt, 0.05) * 1.8);
    if (mat.current) {
      mat.current.emissiveIntensity = 0.12 + flash.current * (ripple.dup ? 1.3 : 0.7);
      mat.current.opacity = 0.2 + flash.current * 0.25;
    }
    if (shell.current) {
      const s = 1 + flash.current * 0.05 * Math.sin(clock.elapsedTime * 30);
      shell.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={shell}>
      <sphereGeometry args={[BARRIER, 64, 64]} />
      <meshPhysicalMaterial
        ref={mat}
        color={colors.accent2}
        emissive={ripple.dup ? "#ff9f0a" : colors.accent}
        emissiveIntensity={0.12}
        roughness={0.05}
        transmission={0.6}
        thickness={0.2}
        transparent
        opacity={0.2}
        depthWrite={false}
      />
    </mesh>
  );
}

function techColor(name: Tech, c: ThemeColors) {
  switch (name) {
    case "Blue":
      return c.accent;
    case "Red":
      return "#ff6b8a";
    case "Purple":
      return c.accent2;
    case "Void":
      return "#1f2937";
    case "Six Eyes":
      return "#7dd3fc";
    default:
      return "#fbbf24";
  }
}

function Orbiter({
  name,
  from,
  index,
  total,
  colors,
  onPick,
}: {
  name: Tech;
  from: number;
  index: number;
  total: number;
  colors: ThemeColors;
  onPick: () => void;
}) {
  const g = useRef<Group>(null);
  const r = 1.25;
  const [spawn] = useState<[number, number, number]>(() => [Math.cos(from) * 1.25, 0.25, Math.sin(from) * 1.25]);
  useFrame(({ clock }, dt) => {
    const o = g.current;
    if (!o) return;
    const d = Math.min(dt, 0.05);
    const a = clock.elapsedTime * 0.5 + (index / total) * Math.PI * 2;
    const tilt = 0.35;
    o.position.x = damp(o.position.x, Math.cos(a) * r, 6, d);
    o.position.z = damp(o.position.z, Math.sin(a) * r, 6, d);
    o.position.y = damp(o.position.y, Math.sin(a) * r * tilt, 6, d);
  });
  const c = techColor(name, colors);
  return (
    <group ref={g} position={spawn}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={(e) => setCanvasCursor(e, "pointer")}
        onPointerOut={(e) => setCanvasCursor(e, "auto")}
      >
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshPhysicalMaterial color={c} emissive={c} emissiveIntensity={0.45} roughness={0.12} clearcoat={1} />
      </mesh>
      <Html center zIndexRange={[20, 0]} position={[0, 0.45, 0]} style={{ pointerEvents: "none" }}>
        <span className="glass !rounded-full px-1.5 py-px text-[10.5px] font-semibold whitespace-nowrap text-label">
          {name}
        </span>
      </Html>
    </group>
  );
}

function Projectile({ shot, colors }: { shot: Shot; colors: ThemeColors }) {
  const g = useRef<Group>(null);
  const start = 4.6;
  useFrame(() => {
    const o = g.current;
    if (!o) return;
    const el = nowSec() - shot.t0;
    if (el < 0) {
      o.scale.setScalar(0.001);
      return;
    }
    const t = Math.min(1, el / FLY);
    const hit = 0.62;
    let dist: number;
    if (t < hit) {
      const k = t / hit;
      const stopAt = shot.dup ? BARRIER + 0.28 : 1.25;
      dist = start + (stopAt - start) * (1 - Math.pow(1 - k, 3));
    } else if (shot.dup) {
      const k = (t - hit) / (1 - hit);
      dist = BARRIER + 0.28 + k * k * 3; // відскок назад
    } else {
      dist = 1.25;
    }
    o.position.set(Math.cos(shot.angle) * dist, 0.25, Math.sin(shot.angle) * dist);
    const fade = shot.dup ? (t < hit ? 1 : 1 - (t - hit) / (1 - hit)) : t < hit ? 1 : 1 - (t - hit) / (1 - hit);
    o.scale.setScalar(Math.max(0.001, fade));
  });
  const c = techColor(shot.name, colors);
  return (
    <group ref={g} scale={0.001}>
      <mesh>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} />
      </mesh>
      <Html center zIndexRange={[20, 0]} position={[0, 0.42, 0]} style={{ pointerEvents: "none" }}>
        <span
          className="rounded-full px-1.5 py-px text-[10.5px] font-bold whitespace-nowrap text-white"
          style={{ background: shot.dup ? "#c93400" : "var(--accent)" }}
        >
          {shot.dup ? `${shot.name} ×` : shot.name}
        </span>
      </Html>
    </group>
  );
}
