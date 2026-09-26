"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Btn, ControlBar, Scene3D, Segmented, Slider, useThemeColors } from "../kit";

type Op = "&" | "|" | "^" | "<<" | ">>";
const OPS: { value: Op; label: string }[] = [
  { value: "&", label: "&" },
  { value: "|", label: "|" },
  { value: "^", label: "^" },
  { value: "<<", label: "<<" },
  { value: ">>", label: ">>" },
];

const OP_HINT: Record<Op, string> = {
  "&": "AND: 1 лише там, де 1 в обох",
  "|": "OR: 1, якщо хоч в одному 1",
  "^": "XOR: 1, якщо біти різні",
  "<<": "зсув уліво = множення на 2ⁿ",
  ">>": "зсув управо = цілочисельне ділення на 2ⁿ",
};

const BITS = 8;
const GAP = 0.74;
const colX = (col: number) => (col - (BITS - 1) / 2) * GAP;
const ROW_Y = { a: 1.25, b: 0.2, r: -1.1 } as const;

const bin8 = (v: number) => (v & 0xff).toString(2).padStart(8, "0");

function compute(op: Op, a: number, b: number, shift: number): number {
  switch (op) {
    case "&": return a & b;
    case "|": return a | b;
    case "^": return a ^ b;
    case "<<": return a << shift;
    case ">>": return a >> shift;
  }
}

/** Один біт-кубик: плавно «вмикається» — піднімається, світиться й змінює колір. */
function BitCube({
  x,
  y,
  on,
  onColor,
  offColor,
  dim,
  onToggle,
}: {
  x: number;
  y: number;
  on: boolean;
  onColor: string;
  offColor: string;
  dim?: boolean;
  onToggle?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const prevOn = useRef(on);
  const pop = useRef(0);
  const colors = useMemo(
    () => ({ on: new THREE.Color(onColor), off: new THREE.Color(offColor) }),
    [onColor, offColor],
  );

  useFrame((_, dt) => {
    const g = group.current;
    const m = mat.current;
    if (!g || !m) return;
    if (prevOn.current !== on) {
      prevOn.current = on;
      pop.current = 1;
    }
    pop.current *= Math.exp(-dt * 5);
    const k = 1 - Math.exp(-dt * 9);
    const targetZ = on ? 0.22 : 0;
    g.position.z += (targetZ - g.position.z) * k;
    const baseScale = on ? 1 : 0.86;
    const s = g.scale.x + (baseScale - g.scale.x) * k;
    g.scale.setScalar(s + pop.current * 0.001);
    g.rotation.x = pop.current * 0.9;
    m.color.lerp(on ? colors.on : colors.off, k);
    m.emissive.lerp(on ? colors.on : colors.off, k);
    const targetE = on ? 0.45 : 0.02;
    m.emissiveIntensity += (targetE - m.emissiveIntensity) * k;
    const targetO = dim ? 0.25 : 1;
    m.opacity += (targetO - m.opacity) * k;
  });

  return (
    <group ref={group} position={[x, y, 0]}>
      <RoundedBox
        args={[0.6, 0.6, 0.6]}
        radius={0.12}
        smoothness={4}
        onClick={
          onToggle
            ? (e) => {
                e.stopPropagation();
                onToggle();
              }
            : undefined
        }
        onPointerOver={onToggle ? () => (document.body.style.cursor = "pointer") : undefined}
        onPointerOut={onToggle ? () => (document.body.style.cursor = "") : undefined}
      >
        <meshPhysicalMaterial
          ref={mat}
          color={offColor}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.15}
          transparent
          opacity={1}
        />
      </RoundedBox>
    </group>
  );
}

function Row({
  value,
  y,
  onColor,
  offColor,
  dim,
  onToggle,
}: {
  value: number;
  y: number;
  onColor: string;
  offColor: string;
  dim?: boolean;
  onToggle?: (bit: number) => void;
}) {
  return (
    <>
      {Array.from({ length: BITS }, (_, col) => {
        const bit = BITS - 1 - col;
        return (
          <BitCube
            key={col}
            x={colX(col)}
            y={y}
            on={((value >> bit) & 1) === 1}
            onColor={onColor}
            offColor={offColor}
            dim={dim}
            onToggle={onToggle ? () => onToggle(bit) : undefined}
          />
        );
      })}
    </>
  );
}

function Scene({
  a,
  b,
  result,
  shiftOp,
  toggleA,
  toggleB,
}: {
  a: number;
  b: number;
  result: number;
  shiftOp: boolean;
  toggleA: (bit: number) => void;
  toggleB: (bit: number) => void;
}) {
  const c = useThemeColors();
  const off = c.dark ? "#3a3a3c" : "#d1d1d6";
  const mixed = useMemo(() => "#" + new THREE.Color(c.accent).lerp(new THREE.Color(c.accent2), 0.5).getHexString(), [c.accent, c.accent2]);
  const rowLabel = "font-mono text-[13px] font-bold whitespace-nowrap";
  const labelX = colX(0) - 0.75;
  return (
    <group position={[0.25, 0.05, 0]}>
      {/* ваги бітів */}
      {Array.from({ length: BITS }, (_, col) => (
        <Html key={col} center position={[colX(col), ROW_Y.a + 0.62, 0]} style={{ pointerEvents: "none" }}>
          <div className="font-mono text-[10px] text-label-2">{2 ** (BITS - 1 - col)}</div>
        </Html>
      ))}
      <Html center position={[labelX, ROW_Y.a, 0]} style={{ pointerEvents: "none" }}>
        <div className={rowLabel} style={{ color: c.accent }}>a</div>
      </Html>
      <Html center position={[labelX, ROW_Y.b, 0]} style={{ pointerEvents: "none" }}>
        <div className={rowLabel} style={{ color: c.accent2, opacity: shiftOp ? 0.35 : 1 }}>b</div>
      </Html>
      <Html center position={[labelX, ROW_Y.r, 0]} style={{ pointerEvents: "none" }}>
        <div className={rowLabel} style={{ color: c.label }}>=</div>
      </Html>

      <Row value={a} y={ROW_Y.a} onColor={c.accent} offColor={off} onToggle={toggleA} />
      <Row value={b} y={ROW_Y.b} onColor={c.accent2} offColor={off} dim={shiftOp} onToggle={shiftOp ? undefined : toggleB} />

      {/* роздільна «планка» */}
      <mesh position={[0, (ROW_Y.b + ROW_Y.r) / 2, -0.1]}>
        <boxGeometry args={[GAP * BITS + 0.2, 0.04, 0.04]} />
        <meshStandardMaterial color={c.label2} transparent opacity={0.5} />
      </mesh>

      <Row value={result} y={ROW_Y.r} onColor={mixed} offColor={off} />
      {result > 0xff && (
        <Html center position={[labelX, ROW_Y.r - 0.62, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
            ← ще біти старше 8-го
          </div>
        </Html>
      )}
    </group>
  );
}

/** Зменшує сцену на вузьких екранах (до 340px), щоб нічого не обрізалось. */
function Fit({ width, children }: { width: number; children: ReactNode }) {
  const vw = useThree((s) => s.viewport.width);
  const k = Math.min(1, vw / width);
  return <group scale={k}>{children}</group>;
}

export function Bitwise3D() {
  const [a, setA] = useState(0b1100);
  const [b, setB] = useState(0b1010);
  const [op, setOp] = useState<Op>("&");
  const [shift, setShift] = useState(1);

  const shiftOp = op === "<<" || op === ">>";
  const result = compute(op, a, b, shift);
  const expr = shiftOp ? `a ${op} ${shift}` : `a ${op} b`;
  const exprNum = shiftOp ? `${a} ${op} ${shift}` : `${a} ${op} ${b}`;

  const randomize = () => {
    setA(Math.floor(Math.random() * 256));
    setB(Math.floor(Math.random() * 256));
  };

  return (
    <div>
      <div className="relative">
        <Scene3D height={360} camera={[0, 1.2, 9.6]} shadows={false}>
          <Fit width={7.6}>
          <Scene
            a={a}
            b={b}
            result={result}
            shiftOp={shiftOp}
            toggleA={(bit) => setA((v) => v ^ (1 << bit))}
            toggleB={(bit) => setB((v) => v ^ (1 << bit))}
          />
          </Fit>
        </Scene3D>
        <div className="pointer-events-none absolute top-2 right-3 left-3 flex flex-wrap justify-end gap-1.5">
          <span className="glass rounded-full px-2.5 py-1 font-mono text-[11.5px]">
            a = 0b{bin8(a)} <b>({a})</b>
          </span>
          {!shiftOp && (
            <span className="glass rounded-full px-2.5 py-1 font-mono text-[11.5px]">
              b = 0b{bin8(b)} <b>({b})</b>
            </span>
          )}
        </div>
      </div>

      <div className="mx-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3" style={{ background: "color-mix(in oklab, var(--accent) 12%, transparent)" }}>
        <div className="font-mono text-[15px] font-bold">
          {expr} <span className="text-label-2">→</span> {exprNum} = <span style={{ color: "var(--accent-2)" }}>{result}</span>
        </div>
        <div className="font-mono text-[12.5px] text-label-2">bin: {result.toString(2)}</div>
        <div className="w-full text-[12.5px] text-label-2">{OP_HINT[op]}</div>
      </div>

      <ControlBar>
        <Segmented id="bit-op" value={op} onChange={setOp} options={OPS} />
        <Btn onClick={randomize}>🎲 Випадкові</Btn>
        <Btn
          onClick={() => {
            setA(0b1100);
            setB(0b1010);
            setShift(1);
          }}
        >
          Скинути
        </Btn>
        {shiftOp && <Slider label="зсув n" value={shift} min={0} max={4} onChange={setShift} />}
      </ControlBar>
    </div>
  );
}
