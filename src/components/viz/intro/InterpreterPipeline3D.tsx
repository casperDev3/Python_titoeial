"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";
import { Btn, ControlBar, Scene3D, Segmented, useThemeColors } from "../kit";

type StageId = "src" | "compile" | "pvm" | "out";

const STAGES: {
  id: StageId;
  short: string;
  title: string;
  body: string;
  lines: string[];
}[] = [
  {
    id: "src",
    short: "hello.py",
    title: "Вихідний код",
    body: "Звичайний текстовий файл. Для Python це поки лише символи — він ще нічого не виконав.",
    lines: ['name = "Наруто"', 'print("Привіт,", name)'],
  },
  {
    id: "compile",
    short: "Компілятор",
    title: "Компіляція в байткод",
    body: "CPython розбирає текст на токени, будує дерево (AST) і перевіряє синтаксис. Помилка тут = SyntaxError, і не виконується жоден рядок.",
    lines: ["tokens → AST → code object", "✓ синтаксис валідний", "кеш: __pycache__/hello.cpython-3xx.pyc"],
  },
  {
    id: "pvm",
    short: "PVM",
    title: "Віртуальна машина",
    body: "Python Virtual Machine виконує байткод інструкція за інструкцією, кладучи значення на стек. Помилки тут — під час виконання (NameError, TypeError…).",
    lines: [
      "LOAD_CONST   'Наруто'",
      "STORE_NAME   name",
      "LOAD_NAME    print",
      "LOAD_CONST   'Привіт,'",
      "LOAD_NAME    name",
      "CALL         2",
    ],
  },
  {
    id: "out",
    short: "Вивід",
    title: "Результат",
    body: "print() пише текст у стандартний потік виводу (stdout) — у термінал, IDE чи, як тут, у браузер.",
    lines: ["$ python3 hello.py", "Привіт, Наруто"],
  },
];

const X = [-3.3, -1.1, 1.1, 3.3];
const Z = [0.35, -0.25, -0.25, 0.35];

function Station({
  i,
  active,
  lit,
  onPick,
}: {
  i: number;
  active: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const c = useThemeColors();
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = active ? 1.12 : hover ? 1.05 : 1;
    const s = THREE.MathUtils.damp(g.scale.x, target, 8, dt);
    g.scale.setScalar(s);
    g.position.y = Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.06 + (active ? 0.15 : 0);
  });

  const stage = STAGES[i];
  const color = i % 2 === 0 ? c.accent : c.accent2;

  return (
    <group position={[X[i], 0, Z[i]]}>
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onPick();
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
        <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.22} smoothness={4}>
          <meshPhysicalMaterial
            color={color}
            transmission={0.55}
            thickness={1.2}
            roughness={0.18}
            clearcoat={1}
            transparent
            opacity={0.82}
            emissive={color}
            emissiveIntensity={lit ? 0.9 : active ? 0.35 : 0.08}
          />
        </RoundedBox>
        <StationCore i={i} color={c.dark ? "#ffffff" : "#1c1c1e"} />
      </group>
      <Html center position={[0, -1.25, 0]} distanceFactor={9} style={{ pointerEvents: "none" }}>
        <div
          className="rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap backdrop-blur-md"
          style={{
            background: active ? "var(--accent)" : "var(--glass-bg-strong)",
            color: active ? "#fff" : "var(--label)",
            border: "1px solid var(--glass-border)",
          }}
        >
          {i + 1}. {stage.short}
        </div>
      </Html>
    </group>
  );
}

/** Невелика «начинка» кожної станції, щоб вони відрізнялись формою. */
function StationCore({ i, color }: { i: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.8;
      ref.current.rotation.x += dt * 0.3;
    }
  });
  return (
    <mesh ref={ref}>
      {i === 0 && <boxGeometry args={[0.55, 0.7, 0.08]} />}
      {i === 1 && <octahedronGeometry args={[0.42]} />}
      {i === 2 && <torusGeometry args={[0.34, 0.1, 16, 40]} />}
      {i === 3 && <icosahedronGeometry args={[0.38, 0]} />}
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
    </mesh>
  );
}

/** «Чакра», що летить конвеєром. progress: 0..3 (між станціями). */
function ChakraOrb({ runRef, onStage }: { runRef: RefObject<number>; onStage: (i: number) => void }) {
  const c = useThemeColors();
  const orb = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const last = useRef(-1);

  useFrame((state, dt) => {
    const o = orb.current;
    const h = halo.current;
    if (!o || !h) return;
    let p = runRef.current;
    if (p >= 0) {
      p = Math.min(p + dt * 0.9, 3.0001);
      runRef.current = p > 3 ? -1 : p;
      const idx = Math.min(3, Math.floor(p + 0.15));
      if (idx !== last.current) {
        last.current = idx;
        onStage(idx);
      }
    }
    const t = runRef.current < 0 ? 3 : runRef.current;
    const i = Math.min(2, Math.floor(t));
    const f = t - i;
    const x = THREE.MathUtils.lerp(X[i], X[i + 1], f);
    const z = THREE.MathUtils.lerp(Z[i], Z[i + 1], f);
    const y = 1.35 + Math.sin(f * Math.PI) * 0.6;
    o.position.set(x, y, z);
    h.position.copy(o.position);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.12;
    const visible = runRef.current >= 0 ? 1 : 0;
    o.scale.setScalar(THREE.MathUtils.damp(o.scale.x, visible * pulse, 10, dt));
    h.scale.setScalar(THREE.MathUtils.damp(h.scale.x, visible * pulse * 1.9, 10, dt));
    if (runRef.current < 0) last.current = -1;
  });

  return (
    <>
      <mesh ref={orb} scale={0}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color={c.accent2} emissive={c.accent2} emissiveIntensity={2} />
      </mesh>
      <mesh ref={halo} scale={0}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color={c.accent} transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </>
  );
}

function Rail() {
  const c = useThemeColors();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(X.map((x, i) => new THREE.Vector3(x, -0.85, Z[i]))), []);
  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
      <meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.4} transparent opacity={0.6} />
    </mesh>
  );
}

function Fit({ children }: { children: ReactNode }) {
  const w = useThree((s) => s.viewport.width);
  const scale = Math.min(1, w / 9.6);
  return <group scale={scale}>{children}</group>;
}

export function InterpreterPipeline3D() {
  const [stage, setStage] = useState<StageId>("src");
  const [lit, setLit] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const runRef = useRef<number>(-1);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (doneTimer.current) clearTimeout(doneTimer.current);
    },
    [],
  );

  const idx = STAGES.findIndex((s) => s.id === stage);
  const s = STAGES[idx];

  const run = () => {
    runRef.current = 0;
    setRunning(true);
  };

  const onStage = (i: number) => {
    setLit(i);
    setStage(STAGES[i].id);
    if (i === 3) {
      if (doneTimer.current) clearTimeout(doneTimer.current);
      doneTimer.current = setTimeout(() => {
        setLit(-1);
        setRunning(false);
      }, 900);
    }
  };

  return (
    <div>
      <Scene3D height={330} camera={[0, 2.2, 7.6]} fov={48}>
        <Fit>
          <Rail />
          {STAGES.map((st, i) => (
            <Station key={st.id} i={i} active={st.id === stage} lit={lit === i} onPick={() => setStage(st.id)} />
          ))}
          <ChakraOrb runRef={runRef} onStage={onStage} />
        </Fit>
      </Scene3D>

      <ControlBar>
        <Btn variant="accent" onClick={run} disabled={running}>
          {running ? "Виконується…" : "▶ Запустити"}
        </Btn>
        <Segmented
          id="intro-pipeline"
          value={stage}
          onChange={setStage}
          options={STAGES.map((st, i) => ({ value: st.id, label: `${i + 1}` }))}
        />
      </ControlBar>

      <div className="px-5 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="grid gap-3 sm:grid-cols-[1fr_1.1fr]"
          >
            <div>
              <div className="text-[15px] font-bold tracking-tight">
                <span style={{ color: "var(--accent)" }}>Крок {idx + 1}.</span> {s.title}
              </div>
              <p className="mt-1 text-[14px] leading-relaxed text-label-2">{s.body}</p>
            </div>
            <div className="rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
              {s.lines.map((l, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="truncate"
                >
                  {l}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
