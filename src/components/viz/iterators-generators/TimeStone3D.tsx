"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { Btn, ControlBar, Scene3D, Segmented, useThemeColors, type ThemeColors } from "../kit";
import { FitCamera, damp } from "./shared";

const FUTURES = [
  "Танос перемагає",
  "Втеча з Титану",
  "Залізна рукавиця",
  "Капітан без щита",
  "Вонг у відпустці",
  "Квантова петля",
  "Дормамму торгується",
  "Портал у Ваканду",
  "Громовержець",
  "Пісок часу",
  "Хаос-магія",
  "Єдиний шанс ✓",
];
const COUNT = FUTURES.length;
const R = 2.35;

const futurePos = (i: number): [number, number, number] => {
  const a = (i / COUNT) * Math.PI * 2 * 1.15 - Math.PI / 2;
  return [Math.cos(a) * R, -0.95 + i * 0.19, Math.sin(a) * R];
};

type Mode = "gen" | "list";
type Pulse = { id: number; target: number };

function setCursor(e: ThreeEvent<PointerEvent>, c: string) {
  const el = e.nativeEvent.target;
  if (el instanceof HTMLElement) el.style.cursor = c;
}

export function TimeStone3D() {
  const colors = useThemeColors();
  const [mode, setMode] = useState<Mode>("gen");
  const [computed, setComputed] = useState(0);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [msg, setMsg] = useState<string>("futures = see_future()   # генератор створено, нічого не обчислено");
  const pulseId = useRef(0);

  const next = () => {
    if (computed >= COUNT) {
      setMsg("next(futures) → StopIteration   # варіанти скінчились");
      return;
    }
    const i = computed;
    setComputed(i + 1);
    setPulse({ id: ++pulseId.current, target: i });
    setMsg(`next(futures) → "${FUTURES[i]}"   # обчислено ${i + 1} з ${COUNT}`);
  };

  const all = () => {
    setComputed(COUNT);
    setPulse(null);
    setMsg(`futures = list(see_future())   # усі ${COUNT} варіантів одразу в пам'яті`);
  };

  const reset = (m: Mode = mode) => {
    setMode(m);
    setComputed(0);
    setPulse(null);
    setMsg(
      m === "gen"
        ? "futures = see_future()   # генератор створено, нічого не обчислено"
        : "# режим списку: list() обчислить усе одразу",
    );
  };

  const pick = (i: number) => {
    if (mode === "list" && computed === 0) setMsg("список ще не створено — натисни list(see_future())");
    else if (i < computed) setMsg(`варіант #${i + 1}: "${FUTURES[i]}" — уже обчислено`);
    else if (i === computed) next();
    else
      setMsg(
        `#${i + 1} ще не існує! Генератор не стрибає вперед — спершу next() для #${computed + 1}`,
      );
  };

  return (
    <div>
      <ControlBar>
        <Segmented
          id="stone-mode"
          value={mode}
          onChange={(m) => reset(m)}
          options={[
            { value: "gen", label: "Генератор" },
            { value: "list", label: "Список" },
          ]}
        />
      </ControlBar>
      <Scene3D height={380} camera={[0, 2.4, 7]} fov={42}>
        <FitCamera width={6.2} height={4.2} min={6.5} />
        <EyeOfAgamotto colors={colors} busy={!!pulse} />
        {FUTURES.map((f, i) => (
          <Future
            key={f}
            index={i}
            colors={colors}
            computed={i < computed}
            latest={i === computed - 1 && mode === "gen"}
            label={f}
            onPick={() => pick(i)}
          />
        ))}
        {pulse && (
          <PulseOrb
            key={pulse.id}
            target={futurePos(pulse.target)}
            colors={colors}
            onDone={() => setPulse((p) => (p && p.id === pulse.id ? null : p))}
          />
        )}
      </Scene3D>

      <div className="px-5 pt-3">
        <div className="flex items-center justify-between text-[12px] font-semibold text-label-2">
          <span>{"обчислено варіантів (пам'ять)"}</span>
          <span className="font-mono tabular-nums text-label">
            {computed} / {COUNT}
          </span>
        </div>
        <div className="mt-1.5 flex gap-1">
          {FUTURES.map((f, i) => (
            <span
              key={f}
              className="h-2 flex-1 rounded-full transition-all duration-500"
              style={{
                background: i < computed ? "linear-gradient(90deg, var(--accent), var(--accent-2))" : "var(--separator)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="mx-5 mt-3 rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed break-words text-[#e5e5ea]">
        <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
        {msg}
      </div>

      <ControlBar>
        {mode === "gen" ? (
          <Btn variant="accent" onClick={next} disabled={!!pulse}>
            next(futures)
          </Btn>
        ) : (
          <Btn variant="accent" onClick={all} disabled={computed === COUNT}>
            list(see_future())
          </Btn>
        )}
        <Btn onClick={() => reset()}>Новий генератор</Btn>
      </ControlBar>
    </div>
  );
}

function EyeOfAgamotto({ colors, busy }: { colors: ThemeColors; busy: boolean }) {
  const stone = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const mandala = useRef<Group>(null);
  const mat = useRef<MeshStandardMaterial>(null);

  useFrame((_, dt) => {
    const k = busy ? 3.2 : 1;
    if (stone.current) {
      stone.current.rotation.y += dt * 0.6 * k;
      stone.current.rotation.x += dt * 0.25 * k;
    }
    if (ringA.current) ringA.current.rotation.z += dt * 0.5 * k;
    if (ringB.current) ringB.current.rotation.x += dt * 0.35 * k;
    if (mandala.current) mandala.current.rotation.z -= dt * 0.2 * k;
    if (mat.current) mat.current.emissiveIntensity = damp(mat.current.emissiveIntensity, busy ? 1.6 : 0.55, 6, dt);
  });

  return (
    <group position={[0, 0.1, 0]}>
      <mesh ref={stone}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          ref={mat}
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={0.55}
          roughness={0.15}
          metalness={0.2}
          flatShading
        />
      </mesh>
      <mesh ref={ringA}>
        <torusGeometry args={[0.95, 0.045, 16, 96]} />
        <meshStandardMaterial color={colors.accent2} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.12, 0.03, 16, 96]} />
        <meshStandardMaterial color={colors.accent2} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* мандала-підлога */}
      <group ref={mandala} position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[2.0, 2.08, 96]} />
          <meshBasicMaterial color={colors.accent2} transparent opacity={0.55} />
        </mesh>
        <mesh>
          <ringGeometry args={[2.6, 2.64, 6]} />
          <meshBasicMaterial color={colors.accent2} transparent opacity={0.45} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <ringGeometry args={[2.6, 2.64, 6]} />
          <meshBasicMaterial color={colors.accent2} transparent opacity={0.45} />
        </mesh>
        <mesh>
          <ringGeometry args={[1.3, 1.33, 64]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function Future({
  index,
  colors,
  computed,
  latest,
  label,
  onPick,
}: {
  index: number;
  colors: ThemeColors;
  computed: boolean;
  latest: boolean;
  label: string;
  onPick: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  const [hover, setHover] = useState(false);
  const pos = futurePos(index);

  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    const target = computed ? (latest ? 1.45 : 1) : 0.7;
    const s = damp(m.scale.x, hover ? target * 1.2 : target, 8, dt);
    m.scale.setScalar(s);
    m.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 1.3 + index) * 0.05;
    if (mat.current) {
      mat.current.opacity = damp(mat.current.opacity, computed ? 1 : 0.28, 6, dt);
      mat.current.emissiveIntensity = damp(mat.current.emissiveIntensity, computed ? (latest ? 1.1 : 0.45) : 0, 6, dt);
    }
  });

  return (
    <mesh
      ref={ref}
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        setCursor(e, "pointer");
      }}
      onPointerOut={(e) => {
        setHover(false);
        setCursor(e, "auto");
      }}
    >
      <sphereGeometry args={[0.2, 24, 24]} />
      <meshStandardMaterial
        ref={mat}
        color={computed ? colors.accent : colors.label2}
        emissive={colors.accent}
        emissiveIntensity={0}
        transparent
        opacity={0.28}
        wireframe={!computed}
        roughness={0.3}
        metalness={0.1}
      />
      {(latest || hover) && (
        <Html center position={[0, 0.48, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-lg backdrop-blur-md"
            style={{
              background: computed ? "color-mix(in oklab, var(--accent) 85%, black)" : "rgb(0 0 0 / 0.55)",
              color: "white",
            }}
          >
            #{index + 1} {computed ? label : "· ще не обчислено"}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function PulseOrb({
  target,
  colors,
  onDone,
}: {
  target: [number, number, number];
  colors: ThemeColors;
  onDone: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const t = useRef(0);
  const finished = useRef(false);
  const DUR = 0.75;

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    t.current += dt;
    const p = Math.min(t.current / DUR, 1);
    const e = 1 - Math.pow(1 - p, 3);
    m.position.set(target[0] * e, 0.1 + (target[1] - 0.1) * e + Math.sin(p * Math.PI) * 0.6, target[2] * e);
    m.scale.setScalar(0.6 + Math.sin(p * Math.PI) * 0.6);
    if (p >= 1 && !finished.current) {
      finished.current = true;
      onDone();
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.1, 0]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial color={colors.accent2} />
    </mesh>
  );
}
