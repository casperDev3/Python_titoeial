"use client";

import { Html, Line, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, type Group, type MeshStandardMaterial } from "three";
import { Hammer, Paintbrush, RotateCcw, Undo2 } from "lucide-react";
import { Btn, ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";
import { damp, FitCamera, setCursor, SPRING } from "./shared";

type ClsColor = "red" | "gold" | "silver";
type SuitData = { id: number; name: string; own: boolean; energy: number };

const NAMES = ["Mark I", "Mark II", "Mark III", "Mark IV", "Mark V"];
const SLOTS: [number, number, number][] = [
  [0, -0.35, 1.0],
  [-1.35, -0.35, 0.7],
  [1.35, -0.35, 0.7],
  [-2.6, -0.35, 0.2],
  [2.6, -0.35, 0.2],
];
const BLUEPRINT: [number, number, number] = [0, 0.75, -1.6];
const OWN = "#2563eb"; // Iron Patriot

/** Один костюм: колір плавно «перефарбовується», а новий костюм вилітає з креслення. */
function SuitFigure({
  slot, color, selected, onPick, gold,
}: {
  slot: [number, number, number]; color: string; selected: boolean; onPick: () => void; gold: string;
}) {
  const g = useRef<Group>(null);
  const body = useRef<MeshStandardMaterial>(null);
  const head = useRef<MeshStandardMaterial>(null);
  const armL = useRef<MeshStandardMaterial>(null);
  const armR = useRef<MeshStandardMaterial>(null);
  const target = useMemo(() => new Color(color), [color]);

  useFrame((state, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = 5;
    grp.position.x = damp(grp.position.x, slot[0], k, dt);
    grp.position.z = damp(grp.position.z, slot[2], k, dt);
    const bob = selected ? Math.sin(state.clock.elapsedTime * 2.2) * 0.06 + 0.12 : 0;
    grp.position.y = damp(grp.position.y, slot[1] + bob, k, dt);
    const s = damp(grp.scale.x, selected ? 1.08 : 1, 6, dt);
    grp.scale.setScalar(s);
    grp.rotation.y = selected ? grp.rotation.y + dt * 0.9 : damp(grp.rotation.y, 0, 4, dt);
    for (const m of [body.current, head.current, armL.current, armR.current]) {
      if (m) m.color.lerp(target, 1 - Math.exp(-6 * dt));
    }
  });

  return (
    <group
      ref={g}
      position={BLUEPRINT}
      scale={0.05}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
      onPointerOver={(e) => setCursor(e, "pointer")}
      onPointerOut={(e) => setCursor(e, "auto")}
    >
      {/* торс */}
      <RoundedBox args={[0.56, 0.62, 0.32]} radius={0.1} position={[0, 0.42, 0]}>
        <meshStandardMaterial ref={body} color="#ffffff" metalness={0.75} roughness={0.28} />
      </RoundedBox>
      {/* реактор */}
      <mesh position={[0, 0.5, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 24]} />
        <meshStandardMaterial color="#bff4ff" emissive="#7fe7ff" emissiveIntensity={2.2} />
      </mesh>
      {/* голова */}
      <RoundedBox args={[0.3, 0.32, 0.3]} radius={0.09} position={[0, 0.93, 0]}>
        <meshStandardMaterial ref={head} color="#ffffff" metalness={0.75} roughness={0.28} />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.2, 0.04]} radius={0.03} position={[0, 0.92, 0.15]}>
        <meshStandardMaterial color={gold} metalness={0.9} roughness={0.2} />
      </RoundedBox>
      {/* очі */}
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[x, 0.95, 0.175]}>
          <boxGeometry args={[0.06, 0.018, 0.01]} />
          <meshStandardMaterial color="#e0fbff" emissive="#9cf0ff" emissiveIntensity={2} />
        </mesh>
      ))}
      {/* руки */}
      <mesh position={[-0.38, 0.4, 0]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.08, 0.42, 6, 12]} />
        <meshStandardMaterial ref={armL} color="#ffffff" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0.38, 0.4, 0]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.08, 0.42, 6, 12]} />
        <meshStandardMaterial ref={armR} color="#ffffff" metalness={0.75} roughness={0.28} />
      </mesh>
      {/* ноги */}
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, -0.18, 0]}>
          <capsuleGeometry args={[0.09, 0.46, 6, 12]} />
          <meshStandardMaterial color={gold} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {/* кільце вибору */}
      <mesh position={[0, -0.52, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={selected}>
        <torusGeometry args={[0.46, 0.018, 12, 48]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

/** Креслення класу: скляна панель з сіткою. */
function Blueprint({ accent, accent2, clsColor, hex }: { accent: string; accent2: string; clsColor: ClsColor; hex: string }) {
  const grid = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let i = -4; i <= 4; i++) lines.push([[i * 0.3, -0.85, 0.04], [i * 0.3, 0.85, 0.04]]);
    for (let j = -2; j <= 2; j++) lines.push([[-1.25, j * 0.34, 0.04], [1.25, j * 0.34, 0.04]]);
    return lines;
  }, []);
  const g = useRef<Group>(null);
  useFrame((st) => {
    if (g.current) g.current.position.y = BLUEPRINT[1] + Math.sin(st.clock.elapsedTime * 0.8) * 0.04;
  });
  return (
    <group ref={g} position={BLUEPRINT}>
      <RoundedBox args={[2.7, 1.9, 0.06]} radius={0.05}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.5} thickness={0.4} roughness={0.25} transparent opacity={0.7} />
      </RoundedBox>
      <Line points={[[-1.35, -0.95, 0.04], [1.35, -0.95, 0.04], [1.35, 0.95, 0.04], [-1.35, 0.95, 0.04], [-1.35, -0.95, 0.04]]} color={accent2} lineWidth={1.4} />
      {grid.map((p, i) => (
        <Line key={i} points={p} color={accent} lineWidth={0.6} transparent opacity={0.22} />
      ))}
      <Html position={[0, 0, 0.06]} center transform distanceFactor={4.2} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div className="w-[260px] rounded-2xl border border-black/10 bg-white/90 px-4 py-3 font-mono text-[15px] leading-relaxed text-[#1c1c1e] shadow-sm">
          <div className="font-bold" style={{ color: accent }}>class Suit:</div>
          <div className="pl-4">
            maker = <span style={{ color: "#15803d" }}>&quot;Stark&quot;</span>
          </div>
          <div className="flex items-center gap-2 pl-4">
            color = <span style={{ color: "#15803d" }}>&quot;{clsColor}&quot;</span>
            <span className="inline-block size-3 rounded-full" style={{ background: hex }} />
          </div>
          <div className="pl-4 text-[#6e6e73]">def __init__(self, name): …</div>
        </div>
      </Html>
    </group>
  );
}

export function BlueprintForge() {
  const c = useThemeColors();
  const [suits, setSuits] = useState<SuitData[]>([{ id: 0, name: NAMES[0], own: false, energy: 100 }]);
  const [clsColor, setClsColor] = useState<ClsColor>("red");
  const [sel, setSel] = useState<number | null>(0);
  const [flash, setFlash] = useState(0);

  const hexOf = (k: ClsColor) => (k === "red" ? c.accent : k === "gold" ? c.accent2 : "#b8bec9");
  const clsHex = hexOf(clsColor);
  const selected = suits.find((s) => s.id === sel) ?? null;

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(0), 900);
    return () => clearTimeout(t);
  }, [flash]);

  const forge = () => {
    if (suits.length >= NAMES.length) return;
    const id = suits.length;
    setSuits((s) => [...s, { id, name: NAMES[id], own: false, energy: 100 }]);
    setSel(id);
  };

  const toggleOwn = () => {
    if (sel === null) return;
    setSuits((s) => s.map((x) => (x.id === sel ? { ...x, own: !x.own } : x)));
  };

  const setColor = (v: ClsColor) => {
    setClsColor(v);
    setFlash((f) => f + 1);
  };

  const varName = (s: SuitData) => `mk${s.id + 1}`;

  return (
    <div>
      <Scene3D height={400} camera={[0, 1.6, 7]} fov={40}>
        <FitCamera width={6.6} height={3.6} min={6} />
        <pointLight position={[0, 2, 2]} intensity={6} color={c.accent2} distance={8} />
        <Blueprint accent={c.accent} accent2={c.accent2} clsColor={clsColor} hex={clsHex} />
        {suits.map((s) => {
          const slot = SLOTS[s.id];
          const fromCls = !s.own;
          return (
            <group key={s.id}>
              <SuitFigure
                slot={slot}
                color={s.own ? OWN : clsHex}
                gold={c.accent2}
                selected={sel === s.id}
                onPick={() => setSel(sel === s.id ? null : s.id)}
              />
              <Line
                points={[[slot[0], slot[1] + 1.1, slot[2]], [BLUEPRINT[0] + slot[0] * 0.35, BLUEPRINT[1] - 0.6, BLUEPRINT[2] + 0.05]]}
                color={fromCls ? c.accent2 : c.label2}
                lineWidth={fromCls && flash ? 2.6 : 1.2}
                dashed={!fromCls}
                dashSize={0.08}
                gapSize={0.06}
                transparent
                opacity={fromCls ? 0.85 : 0.35}
              />
              <Html position={[slot[0], slot[1] - 0.85, slot[2]]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                <div
                  className="rounded-full border bg-white/90 px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-[#1c1c1e] shadow-sm"
                  style={{ borderColor: sel === s.id ? c.accent : "rgba(0,0,0,.12)", color: sel === s.id ? c.accent : undefined }}
                >
                  {varName(s)}
                  {s.own && <span className="ml-1 font-normal text-[#6e6e73]">· тінь</span>}
                </div>
              </Html>
            </group>
          );
        })}
      </Scene3D>

      <ControlBar>
        <Btn variant="accent" onClick={forge} disabled={suits.length >= NAMES.length}>
          <Hammer className="size-4" strokeWidth={1.75} /> Зібрати костюм
        </Btn>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-label-2">Suit.color =</span>
          <Segmented
            id="oopb-forge-color"
            value={clsColor}
            onChange={setColor}
            options={[
              { value: "red", label: "red" },
              { value: "gold", label: "gold" },
              { value: "silver", label: "silver" },
            ]}
          />
        </div>
      </ControlBar>

      <div className="mx-5 mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={`${selected.id}-${selected.own}-${clsColor}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SPRING}
              className="rounded-2xl border border-separator bg-[var(--code-bg)] px-4 py-3 font-mono text-[12px] leading-relaxed text-label"
            >
              <div>
                <span className="text-label-3">&gt;&gt;&gt; </span>vars({varName(selected)})
              </div>
              <div className="break-all text-[#15803d]">
                {`{'name': '${selected.name}', 'energy': ${selected.energy}${selected.own ? ", 'color': 'blue'" : ""}}`}
              </div>
              <div className="mt-1">
                <span className="text-label-3">&gt;&gt;&gt; </span>
                {varName(selected)}.color
              </div>
              <div>
                <span className="text-[#15803d]">&apos;{selected.own ? "blue" : clsColor}&apos;</span>
                <span className="ml-2 text-label-3">
                  # {selected.own ? "знайдено у самому об'єкті — клас не питали" : "в об'єкті немає → узято з класу Suit"}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-center text-[13px] text-label-2">
              Клацни по костюму, щоб зазирнути в його <code className="inline-code">__dict__</code>.
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={toggleOwn} disabled={!selected}>
            {selected?.own ? <Undo2 className="size-4" strokeWidth={1.75} /> : <Paintbrush className="size-4" strokeWidth={1.75} />}
            <span className="font-mono text-[12px]">
              {selected ? (selected.own ? `del ${varName(selected)}.color` : `${varName(selected)}.color = "blue"`) : "обери костюм"}
            </span>
          </Btn>
          <Btn
            onClick={() => {
              setSuits([{ id: 0, name: NAMES[0], own: false, energy: 100 }]);
              setSel(0);
              setClsColor("red");
            }}
          >
            <RotateCcw className="size-4" strokeWidth={1.75} />
          </Btn>
        </div>
      </div>
    </div>
  );
}
