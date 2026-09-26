"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Btn, ControlBar, Scene3D, Slider, useThemeColors, type ThemeColors } from "../kit";
import { GREEN, MUTED } from "./palette";

const Y = -0.7;

function makePath(side: 1 | -1) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.6, Y, 0),
    new THREE.Vector3(-1.6, Y, 0),
    new THREE.Vector3(-0.2, Y, 0),
    new THREE.Vector3(1.3, Y, side * 0.9),
    new THREE.Vector3(2.9, Y, side * 1.35),
  ]);
}

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function Track({ curve, active, colors }: { curve: THREE.CatmullRomCurve3; active: boolean; colors: ThemeColors }) {
  const sleepers = useMemo(() => {
    const out: { p: THREE.Vector3; r: number }[] = [];
    for (let i = 1; i < 18; i++) {
      const u = i / 18;
      const p = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);
      out.push({ p, r: Math.atan2(tan.x, tan.z) });
    }
    return out;
  }, [curve]);
  const color = active ? colors.accent : MUTED;
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 90, 0.055, 10, false]} />
        <meshStandardMaterial
          color={color}
          emissive={active ? colors.accent : "#000000"}
          emissiveIntensity={active ? 0.55 : 0}
          transparent
          opacity={active ? 1 : 0.45}
          roughness={0.35}
        />
      </mesh>
      {sleepers.map((s, i) => (
        <mesh key={i} position={[s.p.x, Y - 0.07, s.p.z]} rotation={[0, s.r, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.07]} />
          <meshStandardMaterial color={MUTED} transparent opacity={active ? 0.7 : 0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Station({
  pos,
  label,
  active,
  colors,
}: {
  pos: [number, number, number];
  label: string;
  active: boolean;
  colors: ThemeColors;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = active ? 1.08 : 0.92;
    const s = THREE.MathUtils.damp(g.scale.x, target, 6, dt);
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref} position={pos}>
      <RoundedBox args={[1.05, 0.55, 0.8]} radius={0.14} smoothness={4}>
        <meshPhysicalMaterial
          color={active ? colors.accent : "#ffffff"}
          emissive={active ? colors.accent : "#000000"}
          emissiveIntensity={active ? 0.25 : 0}
          transmission={active ? 0.2 : 0.5}
          roughness={0.18}
          thickness={0.6}
          transparent
          opacity={active ? 0.95 : 0.6}
        />
      </RoundedBox>
      <Html center position={[0, 0.72, 0]} zIndexRange={[10, 0]}>
        <div
          className="pointer-events-none rounded-xl px-2.5 py-1 font-mono text-[12px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-md transition-all duration-500"
          style={{
            background: active ? "var(--accent)" : "white",
            color: active ? "white" : "var(--label-2)",
            border: active ? "1px solid transparent" : "1px solid var(--separator)",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function Scene({ cond, run }: { cond: boolean; run: number }) {
  const colors = useThemeColors();
  const width = useThree((st) => st.viewport.width);
  const fit = Math.min(1, width / 9.2);
  const pathA = useMemo(() => makePath(-1), []);
  const pathB = useMemo(() => makePath(1), []);
  const ball = useRef<THREE.Mesh>(null);
  const lever = useRef<THREE.Group>(null);
  const t = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    t.current = 0;
  }, [cond, run]);

  useFrame((_, dt) => {
    t.current = Math.min(1, t.current + dt / 2.4);
    const curve = cond ? pathA : pathB;
    curve.getPointAt(ease(t.current), tmp);
    if (ball.current) {
      ball.current.position.set(tmp.x, tmp.y + 0.2, tmp.z);
      ball.current.rotation.z -= dt * 4 * (1 - t.current);
    }
    if (lever.current) {
      const target = cond ? -0.5 : 0.5;
      lever.current.rotation.y = THREE.MathUtils.damp(lever.current.rotation.y, target, 8, dt);
    }
  });

  return (
    <group position={[0.2, 0.2, 0]} scale={fit}>
      <Track curve={pathA} active={cond} colors={colors} />
      <Track curve={pathB} active={!cond} colors={colors} />

      {/* стрілка-перемикач */}
      <group ref={lever} position={[-0.2, Y + 0.05, 0]}>
        <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 12]} />
          <meshStandardMaterial color={colors.accent2} emissive={colors.accent2} emissiveIntensity={0.4} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color={colors.accent2} metalness={0.3} roughness={0.3} />
        </mesh>
      </group>
      <Html center position={[-0.2, Y + 0.75, 0]} zIndexRange={[10, 0]}>
        <div
          className="pointer-events-none rounded-full px-2.5 py-1 font-mono text-[11.5px] font-bold whitespace-nowrap text-white shadow-lg"
          style={{ background: cond ? GREEN : "var(--accent-2)" }}
        >
          if hp &gt; 0 → {cond ? "True" : "False"}
        </div>
      </Html>

      <Station pos={[3.55, Y + 0.1, -1.45]} label={'"живий"'} active={cond} colors={colors} />
      <Station pos={[3.55, Y + 0.1, 1.45]} label={'"переможений"'} active={!cond} colors={colors} />

      <mesh ref={ball} position={[-3.6, Y + 0.2, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={0.5}
          clearcoat={1}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

export function TernaryRails() {
  const [hp, setHp] = useState(30);
  const [run, setRun] = useState(0);
  const cond = hp > 0;
  return (
    <div>
      <div className="mx-5 mb-1 overflow-x-auto rounded-2xl border border-separator px-4 py-2.5 font-mono text-[12.5px] whitespace-nowrap">
        status = <span style={{ color: cond ? "var(--accent)" : "var(--label-3)" }}>&quot;живий&quot;</span>{" "}
        <b style={{ color: "var(--accent-2)" }}>if</b> hp &gt; 0{" "}
        <b style={{ color: "var(--accent-2)" }}>else</b>{" "}
        <span style={{ color: !cond ? "var(--accent)" : "var(--label-3)" }}>&quot;переможений&quot;</span>
      </div>
      <Scene3D height={330} camera={[0, 3.2, 6.4]} fov={46}>
        <Scene cond={cond} run={run} />
      </Scene3D>
      <ControlBar>
        <Slider label="hp" value={hp} min={-20} max={100} onChange={setHp} />
        <Btn variant="accent" onClick={() => setRun((r) => r + 1)}>
          Прогнати знову
        </Btn>
        <span className="font-mono text-[12.5px] text-label-2">
          status = <b className="text-label">&quot;{cond ? "живий" : "переможений"}&quot;</b>
        </span>
      </ControlBar>
    </div>
  );
}
