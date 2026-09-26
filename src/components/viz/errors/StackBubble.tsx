"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Btn, Console, ControlBar, Scene3D, Segmented, useThemeColors, type ThemeColors } from "../kit";

/** Кадри стеку: зверху — найзовнішній виклик, знизу — там, де стався збій (як у traceback). */
const FRAMES = ["<module>", "start_game()", 'load_level("два")', 'parse("два")', 'int("два")'];
const TOP = 1.75;
const GAP = 0.78;
const frameY = (i: number) => TOP - i * GAP;

type Catch = "none" | "1" | "2" | "3";
type Phase = "idle" | "build" | "fly" | "caught" | "crash";

type State = { visible: number; orb: number | null; phase: Phase };

function Slab({
  i,
  label,
  shown,
  unwound,
  guard,
  active,
  colors,
}: {
  i: number;
  label: string;
  shown: boolean;
  unwound: boolean;
  guard: boolean;
  active: boolean;
  colors: ThemeColors;
}) {
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const target = shown && !unwound ? 1 : 0.001;
  const tintHex = unwound ? colors.accent2 : guard ? colors.accent : "#eef1f5";
  const tint = useMemo(() => new THREE.Color(tintHex), [tintHex]);

  useFrame((_, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = 1 - Math.exp(-dt * 7);
    const s = grp.scale.x + (target - grp.scale.x) * k;
    grp.scale.set(s, s, s);
    grp.position.x += ((unwound ? 1.6 : 0) - grp.position.x) * k;
    if (mat.current) {
      mat.current.color.lerp(tint, k);
      mat.current.emissiveIntensity += ((active ? 0.55 : 0.04) - mat.current.emissiveIntensity) * k;
    }
  });

  return (
    <group ref={g} position={[0, frameY(i), 0]} scale={0.001}>
      <RoundedBox args={[3.4, 0.46, 1.5]} radius={0.16} smoothness={4}>
        <meshPhysicalMaterial
          ref={mat}
          color="#eef1f5"
          emissive={colors.accent}
          emissiveIntensity={0.04}
          roughness={0.12}
          transmission={0.6}
          thickness={1}
          clearcoat={1}
          transparent
          opacity={0.92}
        />
      </RoundedBox>
      <Html center position={[0, 0, 0.8]} zIndexRange={[20, 0]}>
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11.5px] whitespace-nowrap shadow-sm backdrop-blur-md select-none"
          style={{
            background: "var(--glass-bg-strong)",
            border: "1px solid var(--glass-border)",
            color: "var(--label)",
            opacity: shown && !unwound ? 1 : 0,
            transition: "opacity 300ms",
          }}
        >
          {guard && (
            <ShieldCheck
              className="size-3.5"
              strokeWidth={1.75}
              style={{ color: "color-mix(in oklab, var(--accent) 75%, var(--label))" }}
              aria-label="тут стоїть try/except"
            />
          )}
          {label}
        </div>
      </Html>
    </group>
  );
}

function Orb({ state, colors }: { state: State; colors: ThemeColors }) {
  const m = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const red = useMemo(() => new THREE.Color(colors.accent2), [colors.accent2]);
  const green = useMemo(() => new THREE.Color(colors.accent), [colors.accent]);

  useFrame((st, dt) => {
    const mesh = m.current;
    if (!mesh) return;
    const k = 1 - Math.exp(-dt * 5);
    const ty = state.phase === "crash" ? TOP + 2.2 : state.orb === null ? frameY(4) : frameY(state.orb);
    mesh.position.y += (ty - mesh.position.y) * k;
    const show = state.phase === "fly" || state.phase === "caught" || state.phase === "crash";
    const ts = show ? (state.phase === "caught" ? 0.55 : 1) : 0.001;
    const pulse = state.phase === "fly" ? 1 + Math.sin(st.clock.elapsedTime * 10) * 0.08 : 1;
    const s = mesh.scale.x + (ts * pulse - mesh.scale.x) * k;
    mesh.scale.setScalar(s);
    if (mat.current) {
      const c = state.phase === "caught" ? green : red;
      mat.current.color.lerp(c, k);
      mat.current.emissive.lerp(c, k);
    }
  });

  return (
    <mesh ref={m} position={[1.95, frameY(4), 0.3]} scale={0.001}>
      <sphereGeometry args={[0.26, 32, 32]} />
      <meshStandardMaterial ref={mat} color={colors.accent2} emissive={colors.accent2} emissiveIntensity={1.4} roughness={0.3} />
    </mesh>
  );
}

export function StackBubble() {
  const colors = useThemeColors();
  const [where, setWhere] = useState<Catch>("2");
  const [st, setSt] = useState<State>({ visible: 0, orb: null, phase: "idle" });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers;
    return () => t.current.forEach(clearTimeout);
  }, []);

  const guardIdx = where === "none" ? -1 : Number(where);

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const seq: State[] = [];
    for (let v = 1; v <= FRAMES.length; v++) seq.push({ visible: v, orb: null, phase: "build" });
    seq.push({ visible: 5, orb: 4, phase: "fly" });
    // Виняток піднімається, розмотуючи кадри, доки не знайде try/except
    let level = 4;
    while (level - 1 >= 0 && level !== guardIdx) {
      level -= 1;
      seq.push({ visible: 5, orb: level, phase: "fly" });
    }
    if (level === guardIdx) seq.push({ visible: 5, orb: level, phase: "caught" });
    else seq.push({ visible: 5, orb: 0, phase: "crash" });
    setSt({ visible: 0, orb: null, phase: "build" });
    seq.forEach((s, i) => timers.current.push(setTimeout(() => setSt(s), 420 + i * 650)));
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setSt({ visible: 0, orb: null, phase: "idle" });
  };

  const unwoundFrom = st.orb === null ? 99 : st.phase === "crash" ? 0 : st.orb + 1;

  const lines: string[] = (() => {
    if (st.phase === "idle") return ["Натисни «Кинути виняток», щоб побудувати стек викликів."];
    if (st.phase === "build") return [`виклик → ${FRAMES[st.visible - 1] ?? ""}`, "стек росте донизу — як у traceback"];
    if (st.phase === "fly")
      return [
        `ValueError у кадрі ${FRAMES[st.orb ?? 4]}`,
        st.orb === 4 ? "int() не може перетворити 'два'" : `у ${FRAMES[st.orb ?? 4]} немає try — кадр перервано, летимо вище`,
      ];
    if (st.phase === "caught")
      return [
        `except ValueError у ${FRAMES[guardIdx]} зловив виняток`,
        `кадри нижче знищено, ${FRAMES[guardIdx]} і все вище продовжують працювати`,
      ];
    return ["Traceback (most recent call last): …", "ValueError: invalid literal for int() with base 10: 'два'", "Ніхто не зловив — програма завершилась"];
  })();

  return (
    <div>
      <ControlBar>
        <span className="text-[13px] font-medium text-label-2">try/except у:</span>
        <Segmented
          id="stack-catch"
          value={where}
          onChange={(v) => {
            setWhere(v);
            reset();
          }}
          options={[
            { value: "none", label: "ніде" },
            { value: "1", label: "start_game" },
            { value: "2", label: "load_level" },
            { value: "3", label: "parse" },
          ]}
        />
        <div className="ml-auto flex gap-2">
          <Btn onClick={reset}>Скинути</Btn>
          <Btn variant="accent" onClick={run}>
            Кинути виняток
          </Btn>
        </div>
      </ControlBar>
      <Scene3D height={360} camera={[3.2, 1.2, 7.4]} fov={42}>
        <group position={[-0.3, 0, 0]}>
          {FRAMES.map((f, i) => (
            <Slab
              key={f}
              i={i}
              label={f}
              shown={i < st.visible}
              unwound={i >= unwoundFrom}
              guard={i === guardIdx}
              active={st.phase === "caught" && i === guardIdx}
              colors={colors}
            />
          ))}
          <Orb state={st} colors={colors} />
        </group>
      </Scene3D>
      <Console
        lines={lines.map((l, i) => (
          <span key={i} className={st.phase === "crash" && i < 2 ? "text-[#ff6b61]" : ""}>
            {l}
          </span>
        ))}
      />
    </div>
  );
}
