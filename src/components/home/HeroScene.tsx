"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import type { Group, Mesh } from "three";
import { Scene3D, useThemeColors } from "@/components/viz/kit";

/** Токени, що обертаються навколо «логотипа» — базові цеглинки Python. */
const TOKENS = [
  { label: "int", code: "power = 9001", note: "Цілі числа без меж розміру — хоч рівень сили Гоку." },
  { label: "str", code: 'name = "Naruto"', note: "Рядки незмінні: кожна «зміна» створює новий рядок." },
  { label: "list", code: "team = [1, 2, 3]", note: "Змінний впорядкований список — як загін героїв." },
  { label: "dict", code: '{"hero": "Luffy"}', note: "Ключ → значення, пошук за O(1) завдяки хешам." },
  { label: "def", code: "def fly(): ...", note: "Функція — перевикористовувана суперсила." },
  { label: "class", code: "class Hero: ...", note: "Клас — креслення для створення героїв-об'єктів." },
] as const;

const N = TOKENS.length;
const ORBIT_R = 2.55;

type Glass = {
  color: string;
  transmission?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

function GlassMaterial({ color, transmission = 0.55, emissive, emissiveIntensity = 0 }: Glass) {
  return (
    <meshPhysicalMaterial
      color={color}
      transmission={transmission}
      thickness={0.9}
      roughness={0.12}
      metalness={0.05}
      ior={1.4}
      clearcoat={1}
      clearcoatRoughness={0.08}
      iridescence={0.7}
      iridescenceIOR={1.3}
      emissive={emissive ?? color}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

/** Зменшує сцену на вузьких екранах (до 340px), щоб нічого не обрізалось. */
function Fit({ width, children }: { width: number; children: ReactNode }) {
  const vw = useThree((s) => s.viewport.width);
  const k = Math.min(1, vw / width);
  return <group scale={k}>{children}</group>;
}

/** Одне скляне кільце «змії» з оком. Клік — розкрутити. */
function SnakeRing({
  color,
  position,
  rotation,
  eye,
  spinRef,
}: {
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  eye: [number, number, number];
  spinRef: { current: number };
}) {
  const [hover, setHover] = useState(false);
  // не лишати курсор-«руку», якщо сцена зникла під час наведення
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    setHover(false);
    document.body.style.cursor = "";
  };
  return (
    <group position={position} rotation={rotation}>
      <mesh
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={(e) => {
          e.stopPropagation();
          spinRef.current += 9;
        }}
      >
        <torusGeometry args={[0.95, 0.3, 32, 96]} />
        <GlassMaterial color={color} emissiveIntensity={hover ? 0.35 : 0.08} />
      </mesh>
      <mesh position={eye}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshPhysicalMaterial color="#ffffff" clearcoat={1} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Logo({ accent, accent2 }: { accent: string; accent2: string }) {
  const root = useRef<Group>(null);
  const spin = useRef(0);
  const angle = useRef(0);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    // імпульс від кліку плавно згасає
    angle.current += (0.25 + spin.current) * d;
    spin.current *= Math.exp(-2.2 * d);
    g.rotation.y = angle.current;
    g.rotation.x = Math.sin(t * 0.5) * 0.12;
    g.position.y = 0.15 + Math.sin(t * 0.9) * 0.12;
  });

  return (
    <group ref={root}>
      {/* Два переплетені кільця — стилізований логотип Python */}
      <SnakeRing
        color={accent}
        position={[-0.475, 0, 0]}
        rotation={[0, 0, 0]}
        eye={[-0.61, 0.73, 0.28]}
        spinRef={spin}
      />
      <SnakeRing
        color={accent2}
        position={[0.475, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        eye={[0.61, -0.73, 0.28]}
        spinRef={spin}
      />
      {/* Скляне ядро */}
      <mesh>
        <icosahedronGeometry args={[0.36, 3]} />
        <GlassMaterial color="#ffffff" transmission={0.85} />
      </mesh>
    </group>
  );
}

function Tokens({
  accent,
  accent2,
  hovered,
  selected,
  onHover,
  onSelect,
}: {
  accent: string;
  accent2: string;
  hovered: number | null;
  selected: number | null;
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
}) {
  const items = useRef<(Group | null)[]>([]);
  const orbs = useRef<(Mesh | null)[]>([]);
  const phase = useRef(0);
  const speed = useRef(0.35);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    // при наведенні орбіта м'яко сповільнюється
    const target = hovered !== null ? 0.04 : 0.35;
    speed.current += (target - speed.current) * Math.min(1, d * 4);
    phase.current += speed.current * d;
    for (let i = 0; i < N; i++) {
      const g = items.current[i];
      if (!g) continue;
      const a = phase.current + (i / N) * Math.PI * 2;
      g.position.set(
        Math.cos(a) * ORBIT_R,
        Math.sin(a * 2 + i) * 0.35 + Math.sin(t * 1.3 + i) * 0.08,
        Math.sin(a) * ORBIT_R * 0.72,
      );
      const o = orbs.current[i];
      if (o) {
        const want = i === hovered || i === selected ? 1.6 : 1;
        const s = o.scale.x + (want - o.scale.x) * Math.min(1, d * 8);
        o.scale.setScalar(s);
        o.rotation.y += d * 1.5;
      }
    }
  });

  return (
    <>
      {TOKENS.map((tok, i) => {
        const active = i === hovered || i === selected;
        const color = i % 2 === 0 ? accent : accent2;
        return (
          <group
            key={tok.label}
            ref={(el) => {
              items.current[i] = el;
            }}
          >
            <mesh
              ref={(el) => {
                orbs.current[i] = el;
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHover(i);
              }}
              onPointerOut={() => onHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(i);
              }}
            >
              <octahedronGeometry args={[0.14, 0]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={active ? 0.6 : 0.15}
                clearcoat={1}
                roughness={0.15}
                iridescence={0.8}
              />
            </mesh>
            <Html center position={[0, 0.34, 0]} zIndexRange={[20, 0]}>
              <button
                type="button"
                onPointerEnter={() => onHover(i)}
                onPointerLeave={() => onHover(null)}
                onClick={() => onSelect(i)}
                className="pill pill-glass cursor-pointer select-none whitespace-nowrap font-mono text-[12px] font-semibold transition-transform duration-300"
                style={{
                  transform: active ? "scale(1.18)" : "scale(1)",
                  color: active ? "var(--accent)" : "var(--label)",
                  boxShadow: active ? "0 0 0 1.5px var(--accent), 0 6px 22px -6px var(--accent)" : undefined,
                }}
              >
                {tok.label}
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}

/** Інтерактивна 3D-сцена головної: скляний «логотип» Python і орбіта токенів. */
export function HeroScene() {
  const c = useThemeColors();
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const shown = hovered ?? selected;
  const tok = shown !== null ? TOKENS[shown] : null;

  return (
    <div className="relative w-full">
      <Scene3D height={380} camera={[0, 1.4, 7.4]} fov={42} hint>
        <pointLight position={[-4, 2, 3]} intensity={18} color={c.accent} distance={14} />
        <pointLight position={[4, -1, 3]} intensity={14} color={c.accent2} distance={14} />
        <Fit width={6.6}>
          <Logo accent={c.accent} accent2={c.accent2} />
          <Tokens
          accent={c.accent}
          accent2={c.accent2}
          hovered={hovered}
          selected={selected}
          onHover={setHovered}
          onSelect={(i) => setSelected((s) => (s === i ? null : i))}
          />
        </Fit>
      </Scene3D>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-center sm:justify-end">
        <AnimatePresence mode="wait">
          {tok ? (
            <motion.div
              key={tok.label}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="glass max-w-[min(300px,100%)] rounded-2xl px-4 py-3 text-left"
            >
              <div className="font-mono text-[13px] font-semibold text-[color:var(--accent)]">{tok.code}</div>
              <div className="mt-1 text-[12.5px] leading-snug text-label-2">{tok.note}</div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pill pill-glass text-[12px] text-label-2"
            >
              Наведи на токен або клацни по кільцю
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
