"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { Group, Mesh, MeshPhysicalMaterial } from "three";
import { Btn, Console, ControlBar, Scene3D, useThemeColors, type ThemeColors } from "../kit";
import { FitCamera, damp, setCanvasCursor } from "./three-utils";

const POOL = ["🗺️", "💰", "🍖", "⚓", "🍊", "🎩", "🍶", "🦴"];
const GAP = 1.1;

type Line = { text: string; tone: "ok" | "err" | "info" };

function toyHash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) + s.charCodeAt(i)) | 0;
  return h;
}

const py = (arr: string[], tuple: boolean) =>
  tuple
    ? "(" + arr.map((v) => `'${v}'`).join(", ") + (arr.length === 1 ? ",)" : ")")
    : "[" + arr.map((v) => `'${v}'`).join(", ") + "]";

export function TupleVault3D() {
  const colors = useThemeColors();
  const [list, setList] = useState<string[]>(["🗺️", "💰", "🍖"]);
  const [tuple, setTuple] = useState<string[]>(["🗺️", "💰", "🍖"]);
  const [tupleGen, setTupleGen] = useState(0);
  const [flips, setFlips] = useState<number[]>([0, 0, 0]);
  const [tupleShake, setTupleShake] = useState(0);
  const [listShake, setListShake] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [lines, setLines] = useState<Line[]>([
    { text: `lst = ${py(["🗺️", "💰", "🍖"], false)}`, tone: "info" },
    { text: `t = ${py(["🗺️", "💰", "🍖"], true)}`, tone: "info" },
  ]);

  const push = (...ls: Line[]) => setLines((old) => [...old, ...ls].slice(-4));

  const nextVal = (v: string) => POOL[(POOL.indexOf(v) + 1) % POOL.length];

  const changeList = (i: number) => {
    const v = nextVal(list[i]);
    setList((l) => l.map((x, j) => (j === i ? v : x)));
    setFlips((f) => f.map((x, j) => (j === i ? x + 1 : x)));
    push({ text: `lst[${i}] = '${v}'   # ✓ список змінено на місці`, tone: "ok" });
  };

  const changeTuple = (i: number) => {
    setTupleShake((s) => s + 1);
    push(
      { text: `t[${i}] = '${nextVal(tuple[i])}'`, tone: "info" },
      { text: "TypeError: 'tuple' object does not support item assignment", tone: "err" },
    );
  };

  const concat = () => {
    const add = POOL[(tuple.length + 3) % POOL.length];
    const next = tuple.length >= 5 ? ["🗺️", "💰", "🍖"] : [...tuple, add];
    const oldId = 0x7f30 + tupleGen * 0x48;
    setTuple(next);
    setTupleGen((g) => g + 1);
    push(
      { text: tuple.length >= 5 ? `t = ${py(next, true)}` : `t = t + ('${add}',)`, tone: "info" },
      { text: `# новий об'єкт! id: 0x${oldId.toString(16)} → 0x${(oldId + 0x48).toString(16)}`, tone: "ok" },
    );
  };

  const hashIt = () => {
    setPulse((p) => p + 1);
    setListShake((s) => s + 1);
    push(
      { text: `hash(t)   → ${toyHash(tuple.join("|"))}`, tone: "ok" },
      { text: "hash(lst) → TypeError: unhashable type: 'list'", tone: "err" },
    );
  };

  const rowW = Math.max(list.length, tuple.length) * GAP + 1.4;

  return (
    <div>
      <Scene3D height={360} camera={[0, 2.4, 9]} fov={42}>
        <FitCamera width={rowW + 1.2} height={4.4} min={6.5} />
        <Row
          y={0.95}
          label="lst = [...]  · змінюваний"
          values={list}
          colors={colors}
          kind="list"
          flips={flips}
          shake={listShake}
          onPick={changeList}
        />
        <group key={tupleGen}>
          <Row
            y={-0.75}
            label="t = (...)  · незмінний"
            values={tuple}
            colors={colors}
            kind="tuple"
            flips={[]}
            shake={tupleShake}
            pulse={pulse}
            onPick={changeTuple}
          />
        </group>
      </Scene3D>
      <ControlBar>
        <Btn variant="accent" onClick={() => changeList(1)}>
          lst[1] = …
        </Btn>
        <Btn onClick={() => changeTuple(1)}>t[1] = …</Btn>
        <Btn onClick={concat}>t = t + (x,)</Btn>
        <Btn onClick={hashIt}>hash()</Btn>
      </ControlBar>
      <Console
        lines={lines.map((l, i) => (
          <span
            key={`${i}-${l.text}`}
            className={`break-all ${l.tone === "err" ? "text-[#ff6961]" : l.tone === "ok" ? "text-[#ffd60a]" : ""}`}
          >
            {l.tone === "info" && <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>}
            {l.text}
          </span>
        ))}
      />
    </div>
  );
}

function Row({
  y,
  label,
  values,
  colors,
  kind,
  flips,
  shake,
  pulse = 0,
  onPick,
}: {
  y: number;
  label: string;
  values: string[];
  colors: ThemeColors;
  kind: "list" | "tuple";
  flips: number[];
  shake: number;
  pulse?: number;
  onPick: (i: number) => void;
}) {
  const g = useRef<Group>(null);
  const shell = useRef<MeshPhysicalMaterial>(null);
  const ring = useRef<Mesh>(null);
  const shakeT = useRef(0);
  const pulseT = useRef(0);
  const n = values.length;
  const w = n * GAP + 0.3;

  useEffect(() => {
    if (shake > 0) shakeT.current = 1;
  }, [shake]);
  useEffect(() => {
    if (pulse > 0) pulseT.current = 1;
  }, [pulse]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const o = g.current;
    if (!o) return;
    shakeT.current = Math.max(0, shakeT.current - d * 1.6);
    pulseT.current = Math.max(0, pulseT.current - d * 0.9);
    o.position.x = Math.sin(state.clock.elapsedTime * 55) * 0.09 * shakeT.current;
    o.scale.setScalar(damp(o.scale.x, 1, 8, d));
    if (shell.current) {
      shell.current.emissiveIntensity = 0.08 + shakeT.current * 1.2;
    }
    if (ring.current) {
      const p = 1 - pulseT.current;
      ring.current.scale.setScalar(pulseT.current > 0 ? 0.6 + p * 1.1 : 0.001);
      (ring.current.material as MeshPhysicalMaterial).opacity = pulseT.current * 0.8;
    }
  });

  return (
    <group position={[0, y, 0]}>
      <group ref={g} scale={0.001}>
        {values.map((v, i) => (
          <Crate
            key={i}
            x={(i - (n - 1) / 2) * GAP}
            value={v}
            colors={colors}
            kind={kind}
            flip={flips[i] ?? 0}
            onPick={() => onPick(i)}
          />
        ))}
        {kind === "tuple" && (
          <>
            <RoundedBox args={[w, 1.12, 1.12]} radius={0.3} smoothness={5}>
              <meshPhysicalMaterial
                ref={shell}
                color={colors.accent2}
                emissive="#ff3b30"
                emissiveIntensity={0.08}
                transmission={0.92}
                roughness={0.08}
                thickness={0.4}
                ior={1.4}
                transparent
                opacity={0.55}
                depthWrite={false}
              />
            </RoundedBox>
            {/* замок */}
            <group position={[w / 2 - 0.05, 0, 0.35]}>
              <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[0.14, 0.04, 12, 24, Math.PI]} />
                <meshStandardMaterial color={colors.accent2} metalness={0.7} roughness={0.25} />
              </mesh>
              <RoundedBox args={[0.36, 0.3, 0.14]} radius={0.05}>
                <meshStandardMaterial color={colors.accent2} metalness={0.7} roughness={0.25} />
              </RoundedBox>
            </group>
            <mesh ref={ring} rotation={[0, 0, 0]} scale={0.001}>
              <torusGeometry args={[w / 2 + 0.2, 0.03, 12, 64]} />
              <meshPhysicalMaterial color={colors.accent2} emissive={colors.accent2} emissiveIntensity={1} transparent opacity={0} />
            </mesh>
          </>
        )}
      </group>
      <Html center zIndexRange={[20, 0]} position={[0, 0.9, 0]} style={{ pointerEvents: "none" }}>
        <span className="rounded-full bg-black/35 px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-white backdrop-blur-md">
          {label}
        </span>
      </Html>
    </group>
  );
}

function Crate({
  x,
  value,
  colors,
  kind,
  flip,
  onPick,
}: {
  x: number;
  value: string;
  colors: ThemeColors;
  kind: "list" | "tuple";
  flip: number;
  onPick: () => void;
}) {
  const g = useRef<Group>(null);
  const lid = useRef<Group>(null);
  const [spawn] = useState<[number, number, number]>(() => [x, 0, 0]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    if (g.current) {
      g.current.rotation.x = damp(g.current.rotation.x, flip * Math.PI * 2, 6, d);
      g.current.position.x = damp(g.current.position.x, x, 7, d);
    }
    if (lid.current) {
      lid.current.rotation.x = -0.75 + Math.sin(state.clock.elapsedTime * 1.6 + x) * 0.12;
    }
  });

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPick();
  };

  const color = kind === "list" ? colors.accent : colors.accent2;

  return (
    <group ref={g} position={spawn}>
      <RoundedBox
        args={[0.82, 0.72, 0.82]}
        radius={0.1}
        onClick={click}
        onPointerOver={(e) => setCanvasCursor(e, "pointer")}
        onPointerOut={(e) => setCanvasCursor(e, "auto")}
      >
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} metalness={0.05} />
      </RoundedBox>
      {kind === "list" && (
        <group ref={lid} position={[0, 0.37, -0.41]}>
          <RoundedBox args={[0.84, 0.06, 0.84]} radius={0.03} position={[0, 0, 0.42]}>
            <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} />
          </RoundedBox>
        </group>
      )}
      <Html center zIndexRange={[20, 0]} position={[0, 0, 0.45]} style={{ pointerEvents: "none" }}>
        <span className="text-[20px] select-none">{value}</span>
      </Html>
    </group>
  );
}
