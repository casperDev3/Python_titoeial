"use client";

import { Edges, Float, Html, Line, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Btn, ControlBar, Scene3D, useThemeColors, type ThemeColors } from "../kit";
import { GREEN, MUTED } from "./palette";

type Vars = { notebook: boolean; face: boolean; name: boolean };
type NodeId = "n1" | "n2" | "n3" | "l1" | "l2" | "l3" | "l4";
type V3 = [number, number, number];

const NODES: Record<NodeId, { pos: V3; label: string; v?: keyof Vars; depth: number }> = {
  n1: { pos: [1.4, 1.75, 0], label: "has_notebook", v: "notebook", depth: 0 },
  l1: { pos: [2.9, 0.65, 0.5], label: "немає зошита", depth: 1 },
  n2: { pos: [0, 0.65, -0.2], label: "knows_face", v: "face", depth: 1 },
  l2: { pos: [1.5, -0.45, 0.6], label: "потрібне обличчя", depth: 2 },
  n3: { pos: [-1.4, -0.45, -0.4], label: "knows_name", v: "name", depth: 2 },
  l3: { pos: [0.1, -1.5, 0.5], label: "потрібне ім'я", depth: 3 },
  l4: { pos: [-2.8, -1.5, -0.3], label: "записано", depth: 3 },
};

const EDGES: { from: NodeId; to: NodeId; yes: boolean }[] = [
  { from: "n1", to: "n2", yes: true },
  { from: "n1", to: "l1", yes: false },
  { from: "n2", to: "n3", yes: true },
  { from: "n2", to: "l2", yes: false },
  { from: "n3", to: "l4", yes: true },
  { from: "n3", to: "l3", yes: false },
];

function pathOf(v: Vars): NodeId[] {
  if (!v.notebook) return ["n1", "l1"];
  if (!v.face) return ["n1", "n2", "l2"];
  return ["n1", "n2", "n3", v.name ? "l4" : "l3"];
}

function Decision({
  id,
  onPath,
  value,
  colors,
  onToggle,
}: {
  id: NodeId;
  onPath: boolean;
  value: boolean;
  colors: ThemeColors;
  onToggle: () => void;
}) {
  const n = NODES[id];
  const ref = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (onPath ? 0.9 : 0.25);
    const s = THREE.MathUtils.damp(ref.current.scale.x, hover ? 1.18 : onPath ? 1.05 : 0.9, 8, dt);
    ref.current.scale.setScalar(s);
  });
  return (
    <group position={n.pos}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
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
        <octahedronGeometry args={[0.36, 0]} />
        <meshPhysicalMaterial
          color={onPath ? colors.accent : "#ffffff"}
          emissive={onPath ? colors.accent : "#000000"}
          emissiveIntensity={onPath ? 0.45 : 0}
          roughness={0.12}
          transmission={0.3}
          thickness={0.5}
          clearcoat={1}
          transparent
          opacity={onPath ? 0.95 : 0.7}
          flatShading
        />
        <Edges color={onPath ? colors.accent : MUTED} />
      </mesh>
      <Html center position={[0, 0.62, 0]} zIndexRange={[10, 0]}>
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 rounded-full py-0.5 pr-1 pl-2.5 font-mono text-[11.5px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-md"
          style={{ background: "white", border: "1px solid var(--separator)", color: "var(--label)", opacity: onPath ? 1 : 0.75 }}
        >
          {n.label}?
          <span
            className="rounded-full px-1.5 text-[10.5px] text-white"
            style={{ background: value ? GREEN : "var(--accent)" }}
          >
            {value ? "True" : "False"}
          </span>
        </button>
      </Html>
    </group>
  );
}

function Leaf({ id, active, colors }: { id: NodeId; active: boolean; colors: ThemeColors }) {
  const n = NODES[id];
  return (
    <Float speed={active ? 3 : 0} floatIntensity={active ? 0.4 : 0} rotationIntensity={0}>
      <group position={n.pos}>
        <RoundedBox args={[0.62, 0.34, 0.34]} radius={0.1} smoothness={4}>
          <meshPhysicalMaterial
            color={active ? colors.accent2 : "#ffffff"}
            emissive={active ? colors.accent2 : "#000000"}
            emissiveIntensity={active ? 0.55 : 0}
            roughness={0.2}
            clearcoat={1}
            transparent
            opacity={active ? 1 : 0.7}
          />
        </RoundedBox>
        <Html center position={[0, -0.42, 0]} zIndexRange={[10, 0]}>
          <div
            className="pointer-events-none rounded-lg px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap transition-all duration-500"
            style={{
              background: active ? "var(--accent-2)" : "rgb(255 255 255 / 0.85)",
              color: active ? "white" : "var(--label-2)",
            }}
          >
            return &quot;{n.label}&quot;
          </div>
        </Html>
      </group>
    </Float>
  );
}

function Tree({ vars, toggle }: { vars: Vars; toggle: (k: keyof Vars) => void }) {
  const colors = useThemeColors();
  const width = useThree((s) => s.viewport.width);
  const fit = Math.min(1, width / 7.4);
  const path = pathOf(vars);
  const key = path.join(">");
  const orb = useRef<THREE.Mesh>(null);
  const p = useRef(0);

  useEffect(() => {
    p.current = 0;
  }, [key]);

  useFrame((_, dt) => {
    const max = path.length - 1;
    p.current = Math.min(max, p.current + dt * 1.3);
    const i = Math.min(Math.floor(p.current), max - 1);
    const f = p.current - i;
    const e = f * f * (3 - 2 * f);
    if (orb.current) {
      const a = NODES[path[i]].pos;
      const b = NODES[path[i + 1]].pos;
      orb.current.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e + 0.02, a[2] + (b[2] - a[2]) * e);
    }
  });

  const onPath = (a: NodeId, b: NodeId) => {
    const i = path.indexOf(a);
    return i !== -1 && path[i + 1] === b;
  };

  return (
    <group scale={fit} position={[0.2, 0.1, 0]}>
      {EDGES.map((e) => {
        const act = onPath(e.from, e.to);
        const a = NODES[e.from].pos;
        const b = NODES[e.to].pos;
        const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        return (
          <group key={e.from + e.to}>
            <Line
              points={[a, b]}
              color={act ? colors.accent : MUTED}
              lineWidth={act ? 4 : 1.5}
              transparent
              opacity={act ? 1 : 0.6}
            />
            <Html center position={mid} zIndexRange={[5, 0]}>
              <span
                className="pointer-events-none rounded-md px-1 text-[10px] font-bold"
                style={{
                  color: act ? (e.yes ? GREEN : "var(--accent)") : "var(--label-3)",
                  background: "white",
                }}
              >
                {e.yes ? "True" : "False"}
              </span>
            </Html>
          </group>
        );
      })}
      {(["n1", "n2", "n3"] as const).map((id) => {
        const v = NODES[id].v as keyof Vars;
        return (
          <Decision
            key={id}
            id={id}
            onPath={path.includes(id)}
            value={vars[v]}
            colors={colors}
            onToggle={() => toggle(v)}
          />
        );
      })}
      {(["l1", "l2", "l3", "l4"] as const).map((id) => (
        <Leaf key={id} id={id} active={path[path.length - 1] === id} colors={colors} />
      ))}
      <mesh ref={orb} position={NODES.n1.pos}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive={colors.accent} emissiveIntensity={1.4} />
        <pointLight color={colors.accent} intensity={3} distance={2.2} />
      </mesh>
    </group>
  );
}

const LABELS: Record<keyof Vars, string> = { notebook: "has_notebook", face: "knows_face", name: "knows_name" };

export function DecisionTree() {
  const [vars, setVars] = useState<Vars>({ notebook: true, face: true, name: false });
  const toggle = (k: keyof Vars) => setVars((v) => ({ ...v, [k]: !v[k] }));
  const path = pathOf(vars);
  const leaf = NODES[path[path.length - 1]].label;
  return (
    <div>
      <Scene3D height={380} camera={[0, 0.6, 6.6]} fov={45} shadows={false}>
        <Tree vars={vars} toggle={toggle} />
      </Scene3D>
      <ControlBar>
        {(Object.keys(LABELS) as (keyof Vars)[]).map((k) => (
          <Btn key={k} variant={vars[k] ? "accent" : "glass"} onClick={() => toggle(k)}>
            <span className="font-mono text-[12px]">
              {LABELS[k]}={vars[k] ? "True" : "False"}
            </span>
          </Btn>
        ))}
        <span className="text-[12.5px] text-label-2">
          глибина: <b className="text-label">{path.length - 1}</b> · результат: <b className="text-label">{leaf}</b>
        </span>
      </ControlBar>
    </div>
  );
}
