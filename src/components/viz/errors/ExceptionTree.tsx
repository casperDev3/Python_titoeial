"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Scene3D, useThemeColors, type ThemeColors } from "../kit";
import { EXCEPTIONS, isSubclass } from "./hierarchy";

type Placed = { name: string; parent: string | null; pos: [number, number, number]; depth: number };

/** Розкладка дерева «конусом»: кожен рівень — нижче й ширше, діти — навколо свого батька. */
function layout(): Placed[] {
  const kids = (p: string | null) => EXCEPTIONS.filter((e) => e.parent === p);
  const out: Placed[] = [];
  const Y = [2.1, 0.95, -0.2, -1.3];
  const R = [0, 1.5, 2.35, 3.05];
  const visit = (name: string, parent: string | null, depth: number, a0: number, a1: number) => {
    const a = (a0 + a1) / 2;
    const r = R[depth];
    out.push({ name, parent, depth, pos: [Math.sin(a) * r, Y[depth], Math.cos(a) * r] });
    const ch = kids(name);
    // Розподіляємо кут пропорційно кількості листків
    const weight = (n: string): number => {
      const k = kids(n);
      return k.length ? k.reduce((s, c) => s + weight(c.name), 0) : 1;
    };
    const total = ch.reduce((s, c) => s + weight(c.name), 0);
    let cur = a0;
    for (const c of ch) {
      const span = ((a1 - a0) * weight(c.name)) / total;
      visit(c.name, name, depth + 1, cur, cur + span);
      cur += span;
    }
  };
  visit("BaseException", null, 0, -Math.PI * 0.95, Math.PI * 0.95);
  return out;
}

const PLACED = layout();
const POS = new Map(PLACED.map((p) => [p.name, p.pos]));

function Node({
  p,
  lit,
  selected,
  colors,
  onPick,
}: {
  p: Placed;
  lit: boolean;
  selected: boolean;
  colors: ThemeColors;
  onPick: (n: string) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const [hover, setHover] = useState(false);
  const target = selected ? 1.45 : hover ? 1.2 : lit ? 1.1 : 0.85;
  const special = p.name === "SystemExit" || p.name === "KeyboardInterrupt";

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const k = 1 - Math.exp(-dt * 10);
    const s = m.scale.x + (target - m.scale.x) * k;
    m.scale.setScalar(s);
    if (mat.current) {
      mat.current.emissiveIntensity += ((lit ? 0.9 : 0.05) - mat.current.emissiveIntensity) * k;
    }
  });

  const color = lit ? colors.accent : special ? colors.accent2 : "#d1d5db";

  return (
    <group position={p.pos}>
      <mesh
        ref={mesh}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick(p.name);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          emissive={colors.accent}
          emissiveIntensity={0.05}
          roughness={0.15}
          metalness={0.05}
          clearcoat={1}
          transmission={lit ? 0.2 : 0.55}
          thickness={0.6}
        />
      </mesh>
      <Html center position={[0, -0.36, 0]} zIndexRange={[20, 0]}>
        <button
          onClick={() => onPick(p.name)}
          className="rounded-full px-2 py-0.5 font-mono text-[10.5px] whitespace-nowrap backdrop-blur-md transition-all duration-300 select-none"
          style={{
            background: selected
              ? "color-mix(in oklab, var(--accent) 78%, black)"
              : lit
                ? "color-mix(in oklab, var(--accent) 22%, var(--glass-bg-strong))"
                : "var(--glass-bg-strong)",
            color: selected ? "white" : lit ? "var(--label)" : "var(--label-2)",
            border: "1px solid var(--glass-border)",
            fontWeight: selected ? 700 : 500,
            opacity: lit || hover ? 1 : 0.8,
          }}
        >
          {p.name}
        </button>
      </Html>
    </group>
  );
}

function Tree({ selected, onPick }: { selected: string; onPick: (n: string) => void }) {
  const colors = useThemeColors();
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 7.2);

  const edges = useMemo(
    () =>
      PLACED.filter((p) => p.parent).map((p) => ({
        key: p.name,
        child: p.name,
        points: [POS.get(p.parent!)!, p.pos] as [number, number, number][],
      })),
    [],
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * (1 - Math.exp(-dt * 6)));
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      {edges.map((e) => {
        const lit = isSubclass(e.child, selected);
        return (
          <Line
            key={e.key}
            points={e.points}
            color={lit ? colors.accent : "#b8bcc4"}
            lineWidth={lit ? 3 : 1.4}
            transparent
            opacity={lit ? 0.95 : 0.55}
          />
        );
      })}
      {PLACED.map((p) => (
        <Node
          key={p.name}
          p={p}
          lit={isSubclass(p.name, selected)}
          selected={p.name === selected}
          colors={colors}
          onPick={onPick}
        />
      ))}
    </group>
  );
}

export function ExceptionTree() {
  const [selected, setSelected] = useState("LookupError");
  const caught = EXCEPTIONS.filter((e) => isSubclass(e.name, selected)).map((e) => e.name);
  const note = EXCEPTIONS.find((e) => e.name === selected)?.note;

  return (
    <div className="relative">
      <Scene3D height={400} camera={[0, 1.6, 8.2]} fov={42}>
        <Tree selected={selected} onPick={setSelected} />
      </Scene3D>
      <div className="px-5 pb-4">
        <div className="glass-tint rounded-[16px] border px-3.5 py-2.5 text-[12.5px] leading-snug">
          <div className="font-mono text-[13px]">
            <span className="text-label-3">except </span>
            <span className="font-bold" style={{ color: "color-mix(in oklab, var(--accent) 70%, var(--label))" }}>
              {selected}
            </span>
            <span className="text-label-3">:</span>
            <span className="ml-2 font-sans text-[11.5px] text-label-2">— {note}</span>
          </div>
          <div className="mt-1 text-label-2">
            ловить <b className="text-label">{caught.length}</b>{" "}
            {caught.length === 1 ? "клас" : caught.length < 5 ? "класи" : "класів"}:{" "}
            <span className="font-mono text-[11.5px]">{caught.join(", ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
