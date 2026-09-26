"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { ControlBar, Scene3D, Segmented, Slider, useThemeColors } from "../kit";

type Mode = "zip" | "longest" | "enumerate";

const NAMES = ["Jotaro", "Joseph", "Kakyoin", "Polnareff", "Avdol", "Iggy"];
const STANDS = ["Star Platinum", "Hermit Purple", "Hierophant Green", "Silver Chariot", "Magician's Red", "The Fool"];
const initials = (s: string) => s.split(" ").map((w) => w[0]).join("");
const pyRepr = (v: string | number) =>
  typeof v === "number" ? String(v) : v.includes("'") && !v.includes('"') ? `"${v}"` : `'${v}'`;

const GAP = 1.0;
const ZA = -0.75;
const ZB = 0.75;

function Cube({
  x, z, lift, visible, dim, color, label, ghost, onPick, compact,
}: {
  x: number; z: number; lift: number; visible: boolean; dim: boolean; color: string; label: string;
  ghost?: boolean; onPick: () => void; compact: boolean;
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  useFrame((_, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = Math.min(1, dt * 7);
    grp.position.x += (x - grp.position.x) * k;
    grp.position.y += ((visible ? lift : -1.2) - grp.position.y) * k;
    const target = visible ? (dim ? 0.72 : 1) : 0.001;
    const s = grp.scale.x + (target - grp.scale.x) * k;
    grp.scale.set(s, s, s);
    const m = mat.current;
    if (m) m.opacity += ((dim ? 0.35 : ghost ? 0.35 : 0.95) - m.opacity) * k;
  });
  return (
    <group ref={g} position={[x, -1.2, z]} scale={0.001}>
      <RoundedBox
        args={[0.78, 0.5, 0.78]}
        radius={0.1}
        smoothness={3}
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
      >
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          emissive={color}
          emissiveIntensity={ghost ? 0.05 : 0.18}
          roughness={0.15}
          clearcoat={1}
          transmission={ghost ? 0.8 : 0.35}
          thickness={0.5}
          transparent
          opacity={0.95}
          wireframe={ghost}
        />
      </RoundedBox>
      {visible && (
        <Html position={[0, 0, 0.42]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div
            className="rounded-md px-1 py-px font-mono text-[10px] font-bold whitespace-nowrap text-white"
            style={{ background: "rgba(0,0,0,.45)", opacity: dim ? 0.5 : 1 }}
          >
            {compact ? label.slice(0, 4) : label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Bridge({ x, on, selected, color }: { x: number; on: boolean; selected: boolean; color: string }) {
  const m = useRef<Mesh>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame((st, dt) => {
    const mesh = m.current;
    if (!mesh) return;
    const k = Math.min(1, dt * 6);
    mesh.position.x += (x - mesh.position.x) * k;
    const sz = mesh.scale.z + ((on ? 1 : 0.001) - mesh.scale.z) * k;
    mesh.scale.set(selected ? 1.8 : 1, selected ? 1.8 : 1, sz);
    if (mat.current) mat.current.emissiveIntensity = (selected ? 1.4 : 0.7) + Math.sin(st.clock.elapsedTime * 4 + x) * 0.2;
  });
  return (
    <mesh ref={m} position={[x, 0.18, 0]} scale={[1, 1, 0.001]}>
      <boxGeometry args={[0.08, 0.08, ZB - ZA - 0.7]} />
      <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.7} />
    </mesh>
  );
}

function Scene({
  mode, lenA, lenB, sel, onPick,
}: {
  mode: Mode; lenA: number; lenB: number; sel: number | null; onPick: (i: number) => void;
}) {
  const c = useThemeColors();
  const { size } = useThree();
  const compact = size.width < 520;
  const k = Math.min(1, size.width / size.height / 1.6);
  const bLen = mode === "enumerate" ? lenA : lenB;
  const cols = Math.max(lenA, bLen);
  const pairs = mode === "zip" ? Math.min(lenA, bLen) : cols;
  const xOf = (i: number) => (i - (cols - 1) / 2) * GAP;
  const neutral = c.dark ? "#d1d1d6" : "#8e8e93";

  return (
    <group scale={k} rotation={[0, -0.12, 0]}>
      {NAMES.map((n, i) => (
        <Cube
          key={`a-${i}`}
          x={xOf(i)}
          z={ZA}
          lift={i < pairs ? 0.18 : -0.2}
          visible={i < lenA}
          dim={i >= pairs}
          color={c.accent}
          label={n}
          onPick={() => onPick(i)}
          compact={compact}
        />
      ))}
      {mode === "longest" &&
        Array.from({ length: 6 }, (_, i) => (
          <Cube
            key={`ga-${i}`}
            x={xOf(i)}
            z={ZA}
            lift={0.18}
            visible={i >= lenA && i < cols}
            dim={false}
            ghost
            color={neutral}
            label="'?'"
            onPick={() => onPick(i)}
            compact={compact}
          />
        ))}
      {STANDS.map((s, i) => (
        <Cube
          key={`b-${i}`}
          x={xOf(i)}
          z={ZB}
          lift={i < pairs ? 0.18 : -0.2}
          visible={mode !== "enumerate" && i < lenB}
          dim={i >= pairs}
          color={c.accent2}
          label={compact ? initials(s) : s}
          onPick={() => onPick(i)}
          compact={false}
        />
      ))}
      {mode === "longest" &&
        Array.from({ length: 6 }, (_, i) => (
          <Cube
            key={`gb-${i}`}
            x={xOf(i)}
            z={ZB}
            lift={0.18}
            visible={i >= lenB && i < cols}
            dim={false}
            ghost
            color={neutral}
            label="'?'"
            onPick={() => onPick(i)}
            compact={compact}
          />
        ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Cube
          key={`idx-${i}`}
          x={xOf(i)}
          z={ZB}
          lift={0.18}
          visible={mode === "enumerate" && i < lenA}
          dim={false}
          color={c.dark ? "#f5f5f7" : "#e5e5ea"}
          label={String(i + 1)}
          onPick={() => onPick(i)}
          compact={compact}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Bridge key={`br-${i}`} x={xOf(i)} on={i < pairs} selected={sel === i} color={c.glow} />
      ))}
    </group>
  );
}

export function Zip3D() {
  const [mode, setMode] = useState<Mode>("zip");
  const [lenA, setLenA] = useState(4);
  const [lenB, setLenB] = useState(3);
  const [sel, setSel] = useState<number | null>(0);

  const bLen = mode === "enumerate" ? lenA : lenB;
  const pairs = mode === "zip" ? Math.min(lenA, bLen) : Math.max(lenA, bLen);
  const tuples: string[] = Array.from({ length: pairs }, (_, i) => {
    if (mode === "enumerate") return `(${i + 1}, ${pyRepr(NAMES[i])})`;
    const a = i < lenA ? pyRepr(NAMES[i]) : "'?'";
    const b = i < lenB ? pyRepr(STANDS[i]) : "'?'";
    return `(${a}, ${b})`;
  });
  const call =
    mode === "zip"
      ? "list(zip(names, stands))"
      : mode === "longest"
        ? 'list(zip_longest(names, stands, fillvalue="?"))'
        : "list(enumerate(names, start=1))";
  const lost = mode === "zip" ? Math.max(lenA, lenB) - pairs : 0;
  const selI = sel !== null && sel < pairs ? sel : null;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="py-zip-mode"
          value={mode}
          onChange={(v) => setMode(v)}
          options={[
            { value: "zip", label: "zip" },
            { value: "longest", label: "zip_longest" },
            { value: "enumerate", label: "enumerate" },
          ]}
        />
      </ControlBar>

      <Scene3D height={320} camera={[0, 3.2, 6.2]} fov={42}>
        <Scene mode={mode} lenA={lenA} lenB={lenB} sel={selI} onPick={setSel} />
      </Scene3D>

      <div className="grid gap-2 px-5 sm:grid-cols-[1.5fr_1fr]">
        <div className="thin-scroll max-h-[200px] overflow-auto rounded-2xl bg-black/80 px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed text-[#e5e5ea]">
          <div className="text-[#8e8e93]">&gt;&gt;&gt; {call}</div>
          <div>[</div>
          <AnimatePresence initial={false}>
            {tuples.map((t, i) => (
              <motion.div
                key={`${mode}-${t}`}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => setSel(i)}
                className="cursor-pointer rounded-md pl-3 whitespace-nowrap"
                style={{ background: selI === i ? "color-mix(in oklab, var(--accent) 35%, transparent)" : undefined }}
              >
                {t}
                {i < tuples.length - 1 ? "," : ""}
              </motion.div>
            ))}
          </AnimatePresence>
          <div>]</div>
        </div>
        <div className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug" style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
          {mode === "zip" && (
            <>
              <b>zip</b> зупиняється на найкоротшому списку.{" "}
              {lost > 0 ? (
                <span className="font-semibold" style={{ color: "color-mix(in oklab, #ff9f0a 70%, var(--label))" }}>Мовчки втрачено елементів: {lost}.</span>
              ) : (
                "Довжини рівні — нічого не втрачено."
              )}
            </>
          )}
          {mode === "longest" && (
            <>
              <b>zip_longest</b> іде до кінця найдовшого, а пропуски заповнює <code className="inline-code">fillvalue</code> (прозорі кубики).
            </>
          )}
          {mode === "enumerate" && (
            <>
              <b>enumerate</b> — це по суті <code className="inline-code">zip(count(1), names)</code>: кожен елемент отримує номер.
            </>
          )}
          {selI !== null && (
            <div className="mt-2 font-mono text-[12px]">
              пара #{selI}: {tuples[selI]}
            </div>
          )}
        </div>
      </div>

      <ControlBar>
        <Slider label="len(names)" value={lenA} min={1} max={6} onChange={setLenA} />
        {mode !== "enumerate" && <Slider label="len(stands)" value={lenB} min={1} max={6} onChange={setLenB} />}
      </ControlBar>
    </div>
  );
}
