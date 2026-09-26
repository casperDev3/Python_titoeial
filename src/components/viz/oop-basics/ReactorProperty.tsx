"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Color, type Group, type Mesh, type MeshStandardMaterial } from "three";
import { Zap } from "lucide-react";
import { Btn, ControlBar, Scene3D, Segmented, Slider, useThemeColors } from "../kit";
import { damp, FitCamera, SPRING } from "./shared";

type Mode = "property" | "raw";
type Shot = { n: number; value: number; ok: boolean; at: number };

const SEGMENTS = 10;
const SHIELD_Z = 1.05;
const CYAN = "#7fe7ff";
const RED = "#ff3b30";

function Reactor({ energy, shot, mode, accent, accent2 }: { energy: number; shot: Shot | null; mode: Mode; accent: string; accent2: string }) {
  const root = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const core = useRef<MeshStandardMaterial>(null);
  const shield = useRef<MeshStandardMaterial>(null);
  const bolt = useRef<Mesh>(null);
  const segs = useRef<(MeshStandardMaterial | null)[]>([]);
  const glow = useRef(energy / 100);
  const cyan = useMemo(() => new Color(CYAN), []);
  const red = useMemo(() => new Color(RED), []);
  const dim = useMemo(() => new Color("#2a3440"), []);
  const acc = useMemo(() => new Color(accent2), [accent2]);
  const ok = useMemo(() => new Color("#30d158"), []);
  const angles = useMemo(() => Array.from({ length: SEGMENTS }, (_, i) => (i / SEGMENTS) * Math.PI * 2), []);

  const invalid = energy > 100 || energy < 0;
  const lit = Math.max(0, Math.min(SEGMENTS, Math.round(energy / 10)));

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    const now = performance.now() / 1000;
    const since = shot ? now - shot.at : 99;
    // яскравість ядра повільно йде до поточної енергії (після «влучання»)
    const goal = since < 0.45 ? glow.current : Math.max(0, Math.min(1.6, energy / 100));
    glow.current = damp(glow.current, goal, 4, dt);
    if (inner.current) inner.current.rotation.z += dt * (0.4 + glow.current * 2.2);
    if (core.current) {
      const hot = energy > 100;
      const pulse = hot ? 0.6 + Math.sin(t * 14) * 0.5 : 0;
      core.current.emissiveIntensity = 0.15 + glow.current * 2.6 + pulse;
      core.current.emissive.copy(hot || energy < 0 ? red : cyan);
      core.current.color.copy(hot || energy < 0 ? red : cyan);
    }
    // тремтіння: при відмові setter-а або при перегріві
    if (root.current) {
      const rej = shot && !shot.ok && since < 0.9 ? Math.exp(-since * 5) * 0.12 : 0;
      const hot = energy > 100 ? 0.025 : 0;
      root.current.position.x = Math.sin(t * 60) * (rej + hot);
      root.current.rotation.y = damp(root.current.rotation.y, Math.sin(t * 0.4) * 0.25, 2, dt);
    }
    segs.current.forEach((m, i) => {
      if (!m) return;
      const on = i < lit;
      const target = energy < 0 ? red : on ? (energy > 100 ? red : cyan) : dim;
      m.emissive.lerp(target, 1 - Math.exp(-8 * dt));
      m.emissiveIntensity = damp(m.emissiveIntensity, on || energy < 0 ? 1.6 : 0.05, 6, dt);
    });
    // щит-setter: спалах зеленим/червоним
    if (shield.current) {
      const flash = shot && since < 0.8 && since > 0.3 ? 1 - (since - 0.3) / 0.5 : 0;
      const col = shot && !shot.ok ? red : ok;
      shield.current.emissive.copy(flash > 0 ? col : acc);
      shield.current.emissiveIntensity = 0.25 + flash * 1.8;
      shield.current.opacity = mode === "property" ? 0.28 + flash * 0.35 : 0;
    }
    // «снаряд» зі значенням
    if (bolt.current) {
      const b = bolt.current;
      if (!shot || since > 1.2) {
        b.visible = false;
      } else {
        b.visible = true;
        const p = Math.min(1, since / 0.45);
        const stopZ = mode === "property" && !shot.ok ? SHIELD_Z : 0.1;
        if (since < 0.45) b.position.set(0, 0, 3.4 + (stopZ - 3.4) * p);
        else if (mode === "property" && !shot.ok) {
          const q = (since - 0.45) / 0.75;
          b.position.set(q * 1.6, q * 1.2 - q * q * 2.4, SHIELD_Z + q * 2.2); // відскок
        } else b.position.set(0, 0, 0.1);
        const s = since < 0.45 ? 1 : Math.max(0.001, 1 - (since - 0.45) * 2);
        b.scale.setScalar(s);
      }
    }
  });

  return (
    <group ref={root}>
      {/* корпус */}
      <mesh>
        <torusGeometry args={[1.25, 0.16, 24, 96]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.12]}>
        <cylinderGeometry args={[1.3, 1.3, 0.12, 64]} />
        <meshStandardMaterial color="#3a414a" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* сегменти енергії */}
      {angles.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 0.92, Math.cos(a) * 0.92, 0.02]} rotation={[0, 0, -a]}>
          <boxGeometry args={[0.2, 0.34, 0.1]} />
          <meshStandardMaterial
            ref={(m) => {
              segs.current[i] = m;
            }}
            color="#dfe6ee"
            emissive={CYAN}
            emissiveIntensity={0.1}
            metalness={0.3}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* внутрішнє кільце, що крутиться швидше при більшій енергії */}
      <group ref={inner}>
        <mesh>
          <torusGeometry args={[0.58, 0.05, 12, 64]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} emissive={accent} emissiveIntensity={0.3} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.06, 1.1, 0.04]} />
            <meshStandardMaterial color="#c9d1da" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
      </group>
      {/* ядро */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[0.36, 40, 40]} />
        <meshStandardMaterial ref={core} color={CYAN} emissive={CYAN} emissiveIntensity={2} roughness={0.2} toneMapped={false} />
      </mesh>
      {/* setter-щит */}
      <mesh position={[0, 0, SHIELD_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.03, 6]} />
        <meshStandardMaterial ref={shield} color={accent2} emissive={accent2} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {mode === "property" && (
        <Html position={[1.35, 1.25, SHIELD_Z]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div className="rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-white backdrop-blur-md">
            @energy.setter
          </div>
        </Html>
      )}
      {/* снаряд-значення */}
      <mesh ref={bolt} visible={false}>
        <icosahedronGeometry args={[0.16, 1]} />
        <meshStandardMaterial color="#ffffff" emissive={shot && !shot.ok ? RED : accent2} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <Html position={[0, -1.75, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="rounded-full px-3 py-1 font-mono text-[13px] font-bold whitespace-nowrap text-white shadow-lg backdrop-blur-md"
          style={{ background: invalid ? "rgba(255,59,48,.75)" : "rgba(0,0,0,.55)" }}
        >
          {mode === "property" ? "_energy" : "energy"} = {energy}
          {invalid && " ⚠ неможливий стан"}
        </div>
      </Html>
    </group>
  );
}

export function ReactorProperty() {
  const c = useThemeColors();
  const [mode, setMode] = useState<Mode>("property");
  const [attempt, setAttempt] = useState(60);
  const [energy, setEnergy] = useState(100);
  const [shot, setShot] = useState<Shot | null>(null);
  const [log, setLog] = useState<{ n: number; code: string; out: string; err: boolean }[]>([]);

  const assign = () => {
    const ok = mode === "raw" || (attempt >= 0 && attempt <= 100);
    const n = (shot?.n ?? 0) + 1;
    setShot({ n, value: attempt, ok, at: performance.now() / 1000 });
    if (ok) setEnergy(attempt);
    const out = ok
      ? mode === "raw" && (attempt > 100 || attempt < 0)
        ? "# прийнято без питань… реактор у неможливому стані 😬"
        : "# ok"
      : `ValueError: енергія ${attempt}% поза межами 0–100`;
    setLog((l) => [...l.slice(-2), { n, code: `arc.energy = ${attempt}`, out, err: !ok }]);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setEnergy(100);
    setShot(null);
    setLog([]);
  };

  const valid = attempt >= 0 && attempt <= 100;

  return (
    <div>
      <Scene3D height={340} camera={[1.6, 0.9, 6]} fov={40} shadows={false}>
        <FitCamera width={4.2} height={4.2} min={5.4} />
        <pointLight position={[0, 0, 2.5]} intensity={4} color={CYAN} distance={6} />
        <Reactor energy={energy} shot={shot} mode={mode} accent={c.accent} accent2={c.accent2} />
      </Scene3D>

      <ControlBar>
        <Segmented
          id="oopb-reactor-mode"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "property", label: "@property" },
            { value: "raw", label: "сирий атрибут" },
          ]}
        />
      </ControlBar>
      <ControlBar>
        <Slider label={<span className="font-mono">arc.energy =</span>} value={attempt} min={-50} max={150} step={5} onChange={setAttempt} />
        <Btn variant="accent" onClick={assign}>
          <Zap className="size-4" /> Присвоїти
        </Btn>
      </ControlBar>

      {/* конвеєр присвоєння */}
      <div className="mx-5 flex flex-wrap items-center gap-1.5 font-mono text-[11.5px]">
        <Chip on>arc.energy = {attempt}</Chip>
        <span className="text-label-3">→</span>
        {mode === "property" ? (
          <>
            <Chip tone={valid ? "ok" : "bad"} on>
              setter: 0 ≤ {attempt} ≤ 100 ? {valid ? "✓" : "✗"}
            </Chip>
            <span className="text-label-3">→</span>
            <Chip tone={valid ? "ok" : "bad"} on>
              {valid ? `self._energy = ${attempt}` : "raise ValueError"}
            </Chip>
          </>
        ) : (
          <Chip tone={valid ? "ok" : "bad"} on>
            __dict__[&apos;energy&apos;] = {attempt} {valid ? "" : "(без перевірки!)"}
          </Chip>
        )}
      </div>

      <div className="mx-5 mt-3 mb-4 min-h-[64px] rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
        {log.length === 0 && <div className="text-[#8e8e93]"># обери значення і тисни «Присвоїти»</div>}
        <AnimatePresence initial={false}>
          {log.map((l) => (
            <motion.div key={l.n} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
              <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
              {l.code}
              <div className={l.err ? "text-[#ff6961]" : "text-[#8e8e93]"}>{l.out}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chip({ children, tone, on }: { children: ReactNode; tone?: "ok" | "bad"; on?: boolean }) {
  const col = tone === "ok" ? "#30d158" : tone === "bad" ? "#ff453a" : "var(--accent)";
  return (
    <motion.span
      layout
      transition={SPRING}
      className="rounded-lg px-2 py-1"
      style={{
        background: on ? `color-mix(in oklab, ${col} 16%, transparent)` : "transparent",
        border: `1px solid color-mix(in oklab, ${col} 40%, transparent)`,
      }}
    >
      {children}
    </motion.span>
  );
}
