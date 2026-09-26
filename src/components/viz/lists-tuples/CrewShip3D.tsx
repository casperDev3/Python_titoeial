"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Group, MeshPhysicalMaterial } from "three";
import { Btn, Console, ControlBar, Scene3D, useThemeColors, type ThemeColors } from "../kit";
import { FitCamera, damp, setCanvasCursor } from "./three-utils";

type Member = { id: number; name: string; leaving?: boolean; leaveX?: number; bump: number };

const START = ["Luffy", "Zoro", "Nami", "Usopp"];
const POOL = ["Sanji", "Chopper", "Robin", "Franky", "Brook", "Jinbe", "Vivi", "Yamato"];
const EMOJI: Record<string, string> = {
  Luffy: "👒", Zoro: "⚔️", Nami: "🍊", Usopp: "🎯", Sanji: "🍳", Chopper: "🦌",
  Robin: "🌸", Franky: "🔧", Brook: "🎻", Jinbe: "🌊", Vivi: "👑", Yamato: "❄️",
};
const MAX = 7;
const GAP = 1.2;

const initial = (): Member[] => START.map((name, id) => ({ id, name, bump: 0 }));

export function CrewShip3D() {
  const colors = useThemeColors();
  const [members, setMembers] = useState<Member[]>(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [log, setLog] = useState<{ code: string; note: string }>({
    code: 'crew = ["Luffy", "Zoro", "Nami", "Usopp"]',
    note: "4 накама на борту",
  });
  const nextId = useRef(START.length);
  const poolIdx = useRef(0);

  const active = members.filter((m) => !m.leaving);
  const xOf = (i: number, n: number) => (i - (n - 1) / 2) * GAP;

  const newbie = (): Member => {
    const name = POOL[poolIdx.current % POOL.length];
    poolIdx.current += 1;
    const id = nextId.current;
    nextId.current += 1;
    return { id, name, bump: 0 };
  };

  const cleanupTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const ts = cleanupTimers.current;
    return () => ts.forEach(clearTimeout);
  }, []);

  const scheduleCleanup = (id: number) => {
    cleanupTimers.current.push(setTimeout(() => setMembers((ms) => ms.filter((m) => m.id !== id)), 700));
  };

  const append = () => {
    if (active.length >= MAX) return;
    const m = newbie();
    setMembers((ms) => [...ms, m]);
    setLog({ code: `crew.append("${m.name}")`, note: "O(1) — ніхто не зсунувся, новий накама просто став у кінець" });
  };

  const insertFront = () => {
    if (active.length >= MAX) return;
    const m = newbie();
    setMembers((ms) => [m, ...ms.map((x) => (x.leaving ? x : { ...x, bump: x.bump + 1 }))]);
    setLog({
      code: `crew.insert(0, "${m.name}")`,
      note: `O(n) — довелося зсунути ${active.length} ел. праворуч`,
    });
  };

  const popAt = (front: boolean) => {
    if (active.length === 0) return;
    const n = active.length;
    const victim = front ? active[0] : active[n - 1];
    const vx = xOf(front ? 0 : n - 1, n);
    setMembers((ms) =>
      ms.map((x) => {
        if (x.id === victim.id) return { ...x, leaving: true, leaveX: vx };
        if (front && !x.leaving) return { ...x, bump: x.bump + 1 };
        return x;
      }),
    );
    if (selected === victim.id) setSelected(null);
    scheduleCleanup(victim.id);
    setLog(
      front
        ? { code: `crew.pop(0)  # → "${victim.name}"`, note: `O(n) — решта ${n - 1} ел. зсунулися ліворуч` }
        : { code: `crew.pop()  # → "${victim.name}"`, note: "O(1) — забрали останнього, інші на місці" },
    );
  };

  const reset = () => {
    nextId.current += 10;
    poolIdx.current = 0;
    const base = nextId.current;
    setMembers(START.map((name, i) => ({ id: base + i, name, bump: 0 })));
    nextId.current = base + START.length;
    setSelected(null);
    setLog({ code: 'crew = ["Luffy", "Zoro", "Nami", "Usopp"]', note: "команда зібрана заново" });
  };

  const selIdx = active.findIndex((m) => m.id === selected);
  const sel = selIdx >= 0 ? active[selIdx] : null;
  const repr = "[" + active.map((m) => `'${m.name}'`).join(", ") + "]";

  return (
    <div>
      <div className="relative">
        <Scene3D height={340} camera={[0, 2.6, 10]} fov={42}>
          <FitCamera width={MAX * GAP + 0.8} height={4} min={7} />
          <Ship colors={colors} />
          {members.map((m) => {
            const i = active.findIndex((a) => a.id === m.id);
            const x = m.leaving ? (m.leaveX ?? 0) : xOf(i, active.length);
            return (
              <Crate
                key={m.id}
                member={m}
                x={x}
                index={i}
                neg={i - active.length}
                selected={selected === m.id}
                colors={colors}
                onSelect={() => setSelected((s) => (s === m.id ? null : m.id))}
              />
            );
          })}
        </Scene3D>
        <AnimatePresence>
          {sel && (
            <motion.div
              key={sel.id}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="glass pointer-events-none absolute top-3 left-3 max-w-[calc(100%-24px)] !rounded-[14px] px-3 py-2 font-mono text-[12.5px]"
            >
              <span style={{ color: "var(--accent)" }}>crew[{selIdx}]</span>
              <span className="text-label-2"> is </span>
              <span style={{ color: "var(--accent-2)" }}>crew[{selIdx - active.length}]</span>
              <span className="text-label-2"> → </span>&quot;{sel.name}&quot;
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ControlBar>
        <Btn variant="accent" onClick={append} disabled={active.length >= MAX}>
          append()
        </Btn>
        <Btn onClick={insertFront} disabled={active.length >= MAX}>
          insert(0, …)
        </Btn>
        <Btn onClick={() => popAt(false)} disabled={active.length === 0}>
          pop()
        </Btn>
        <Btn onClick={() => popAt(true)} disabled={active.length === 0}>
          pop(0)
        </Btn>
        <Btn onClick={reset}><span aria-hidden>↺</span><span className="sr-only">Скинути</span></Btn>
        <span className="ml-auto text-[12px] text-label-2 tabular-nums">len(crew) = {active.length}</span>
      </ControlBar>
      <Console
        lines={[
          <span key="c">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {log.code}
          </span>,
          <span key="n" className="text-[#ffd60a]">
            # {log.note}
          </span>,
          <span key="r" className="break-all">
            <span className="text-[#8e8e93]">crew = </span>
            {repr}
          </span>,
        ]}
      />
    </div>
  );
}

function Ship({ colors }: { colors: ThemeColors }) {
  const water = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (water.current) water.current.position.y = -1.05 + Math.sin(clock.elapsedTime * 1.2) * 0.04;
  });
  return (
    <group>
      {/* корпус */}
      <RoundedBox args={[MAX * GAP + 0.9, 0.34, 1.7]} radius={0.16} position={[0, -0.72, 0]}>
        <meshPhysicalMaterial color={colors.accent2} roughness={0.35} metalness={0.05} clearcoat={0.8} />
      </RoundedBox>
      <RoundedBox args={[MAX * GAP + 0.5, 0.08, 1.4]} radius={0.04} position={[0, -0.52, 0]}>
        <meshStandardMaterial color={colors.dark ? "#3a2a22" : "#c89a6a"} roughness={0.8} />
      </RoundedBox>
      {/* щогла і прапор */}
      <mesh position={[-(MAX * GAP) / 2 - 0.1, 0.6, -0.55]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 12]} />
        <meshStandardMaterial color={colors.dark ? "#8e8e93" : "#6b5b4b"} />
      </mesh>
      <mesh position={[-(MAX * GAP) / 2 + 0.35, 1.45, -0.55]}>
        <boxGeometry args={[0.85, 0.5, 0.02]} />
        <meshStandardMaterial color={colors.accent} />
      </mesh>
      <group ref={water}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[7, 48]} />
          <meshStandardMaterial color={colors.glow} transparent opacity={colors.dark ? 0.18 : 0.12} />
        </mesh>
      </group>
    </group>
  );
}

function Crate({
  member,
  x,
  index,
  neg,
  selected,
  colors,
  onSelect,
}: {
  member: Member;
  x: number;
  index: number;
  neg: number;
  selected: boolean;
  colors: ThemeColors;
  onSelect: () => void;
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const flash = useRef(0);
  const [spawn] = useState<[number, number, number]>(() => [x, 2.2, 0]);

  useEffect(() => {
    if (member.bump > 0) flash.current = 1;
  }, [member.bump]);

  useFrame((state, dt) => {
    const o = g.current;
    if (!o) return;
    const d = Math.min(dt, 0.05);
    const ty = member.leaving ? 2.6 : selected ? 0.28 : 0;
    const ts = member.leaving ? 0.001 : 1;
    o.position.x = damp(o.position.x, x, 7, d);
    o.position.y = damp(o.position.y, ty, 8, d);
    const s = damp(o.scale.x, ts, 9, d);
    o.scale.setScalar(s);
    o.rotation.y = selected ? Math.sin(state.clock.elapsedTime * 2) * 0.12 : damp(o.rotation.y, 0, 6, d);
    flash.current = Math.max(0, flash.current - d * 1.8);
    if (mat.current) mat.current.emissiveIntensity = (selected ? 0.35 : 0.06) + flash.current * 0.9;
  });

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!member.leaving) onSelect();
  };

  return (
    <group ref={g} position={spawn} scale={0.001}>
      <RoundedBox
        args={[0.92, 0.92, 0.92]}
        radius={0.14}
        onClick={click}
        onPointerOver={(e) => setCanvasCursor(e, "pointer")}
        onPointerOut={(e) => setCanvasCursor(e, "auto")}
      >
        <meshPhysicalMaterial
          ref={mat}
          color={colors.accent}
          emissive={colors.accent2}
          emissiveIntensity={0.06}
          roughness={0.18}
          transmission={0.35}
          thickness={0.6}
          clearcoat={1}
          transparent
          opacity={0.95}
        />
      </RoundedBox>
      {!member.leaving && (
        <>
          <Html center zIndexRange={[20, 0]} position={[0, 0.8, 0]} style={{ pointerEvents: "none" }}>
            <span
              className="rounded-full px-1.5 py-px font-mono text-[11px] font-bold text-white shadow"
              style={{ background: "var(--accent)" }}
            >
              {index}
            </span>
          </Html>
          <Html center zIndexRange={[20, 0]} position={[0, 0, 0.5]} style={{ pointerEvents: "none" }}>
            <span className="text-[18px] select-none">{EMOJI[member.name] ?? "🏴‍☠️"}</span>
          </Html>
          <Html center zIndexRange={[20, 0]} position={[0, -0.95, 0.6]} style={{ pointerEvents: "none" }}>
            <div className="flex flex-col items-center gap-0.5 whitespace-nowrap">
              <span className="text-[10px] font-semibold text-label">{member.name}</span>
              <span
                className="rounded-full px-1.5 font-mono text-[10px] font-bold"
                style={{ background: "color-mix(in oklab, var(--accent-2) 30%, transparent)", color: "var(--label)" }}
              >
                {neg}
              </span>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
