"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Btn, ControlBar, Scene3D, Segmented, Slider, useThemeColors } from "../kit";
import { CodePane } from "./CodePane";
import { Infinity as InfinityIcon } from "lucide-react";
import { A2_INK, GREEN, MUTED, RED } from "./palette";

const R = 1.55;
const SPEED = 0.42; // витків за секунду
const DEATH = RED;
const WIN = GREEN;

const CODE_BREAK = [
  "attempt = 0",
  "while True:",
  "    attempt += 1",
  "    live_the_day()          # виток спіралі",
  "    if attempt == N:        # чекпоінт",
  "        break               # вихід знайдено",
  '    print("повернення через смерть")',
  'print("Вихід знайдено!")',
];
const CODE_INF = [
  "attempt = 0",
  "while True:",
  "    attempt += 1",
  "    live_the_day()",
  "    # if attempt == N: break   ← забули!",
  "",
  '    print("повернення через смерть")',
  "",
];

type Mode = "break" | "inf";

function lineFor(mode: Mode, lap: number, frac: number, exiting: number) {
  if (exiting >= 0) return exiting < 0.35 ? 5 : 7;
  if (lap > 0 && frac < 0.07) return 6;
  if (frac < 0.12) return 1;
  if (frac < 0.2) return 2;
  if (frac < 0.9 || mode === "inf") return 3;
  return 4;
}

function Spiral({
  n,
  mode,
  run,
  onTick,
}: {
  n: number;
  mode: Mode;
  run: number;
  onTick: (line: number, attempt: number) => void;
}) {
  const colors = useThemeColors();
  const width = useThree((s) => s.viewport.width);
  const fit = Math.min(1, width / 5.6);
  const laps = mode === "inf" ? 4 : n;
  const h = Math.min(0.62, 3.1 / laps);
  const y0 = -(laps * h) / 2 - 0.2;

  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const seg = 48;
    for (let i = 0; i <= laps * seg; i++) {
      const u = i / seg;
      const a = u * Math.PI * 2;
      pts.push(new THREE.Vector3(R * Math.cos(a), y0 + u * h, R * Math.sin(a)));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [laps, h, y0]);

  const top = useMemo(() => new THREE.Vector3(R, y0 + laps * h, 0), [laps, h, y0]);
  const exitEnd = useMemo(() => new THREE.Vector3(R + 1.3, y0 + laps * h + 1.1, 1.2), [laps, h, y0]);

  const orb = useRef<THREE.Mesh>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const flashes = useRef<number[]>([]);
  const p = useRef(0);
  const attempt = useRef(1);
  const exit = useRef(-1);
  const clock = useRef(0);
  const last = useRef({ line: -1, attempt: -1 });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    p.current = 0;
    attempt.current = 1;
    exit.current = -1;
    flashes.current = [];
  }, [n, mode, run]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    clock.current += d;
    const prev = p.current;

    if (exit.current >= 0) {
      exit.current = Math.min(1, exit.current + d * 0.9);
      const e = 1 - Math.pow(1 - exit.current, 3);
      tmp.lerpVectors(top, exitEnd, e);
    } else {
      p.current += d * SPEED;
      // перетин чекпоінта в кінці витка
      const crossed = Math.floor(p.current) > Math.floor(prev);
      if (crossed) {
        const k = Math.floor(p.current) - 1; // індекс кільця
        if (mode === "break" && attempt.current >= n) {
          exit.current = 0;
          p.current = laps;
          flashes.current[k] = clock.current;
        } else {
          flashes.current[k] = clock.current;
          attempt.current += 1;
          if (mode === "inf" && p.current >= laps) p.current -= laps; // знову на початок
        }
      }
      const u = Math.min(p.current, laps) / laps;
      curve.getPointAt(Math.min(u, 1), tmp);
    }
    if (orb.current) orb.current.position.copy(tmp);

    // пульсація кілець
    rings.current.forEach((m, i) => {
      if (!m) return;
      const f = flashes.current[i];
      const k = f === undefined ? 0 : Math.exp(-(clock.current - f) * 4);
      m.scale.setScalar(1 + k * 0.7);
    });

    const frac = p.current - Math.floor(p.current);
    const line = lineFor(mode, attempt.current > 1 ? 1 : 0, frac, exit.current);
    if (line !== last.current.line || attempt.current !== last.current.attempt) {
      last.current = { line, attempt: attempt.current };
      onTick(line, attempt.current);
    }
  });

  return (
    <group scale={fit} position={[-0.25, 0, 0]}>
      <mesh>
        <tubeGeometry args={[curve, laps * 64, 0.045, 8, false]} />
        <meshPhysicalMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={0.35}
          roughness={0.25}
          transparent
          opacity={0.75}
        />
      </mesh>
      {/* вісь часу */}
      <mesh position={[0, y0 + (laps * h) / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, laps * h + 0.6, 8]} />
        <meshStandardMaterial color={MUTED} transparent opacity={0.5} />
      </mesh>

      {/* старт */}
      <mesh position={[R, y0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 32]} />
        <meshPhysicalMaterial color={colors.accent2} emissive={colors.accent2} emissiveIntensity={0.4} roughness={0.2} />
      </mesh>
      <Html center position={[R + 0.2, y0 - 0.35, 0]} zIndexRange={[10, 0]}>
        <div className="pointer-events-none rounded-full px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap text-white" style={{ background: A2_INK }}>
          чекпоінт: крамниця
        </div>
      </Html>

      {/* кільця-перевірки */}
      {Array.from({ length: laps }, (_, k) => {
        const final = mode === "break" && k === laps - 1;
        return (
          <mesh
            key={`${mode}-${laps}-${k}`}
            ref={(m) => {
              rings.current[k] = m;
            }}
            position={[R, y0 + (k + 1) * h, 0]}
          >
            <torusGeometry args={[0.2, 0.035, 12, 40]} />
            <meshStandardMaterial
              color={final ? WIN : DEATH}
              emissive={final ? WIN : DEATH}
              emissiveIntensity={0.6}
            />
          </mesh>
        );
      })}

      {/* вихід */}
      {mode === "break" && (
        <>
          <Line points={[top, exitEnd]} color={WIN} lineWidth={2} dashed dashSize={0.12} gapSize={0.08} />
          <mesh position={exitEnd}>
            <icosahedronGeometry args={[0.24, 1]} />
            <meshPhysicalMaterial color={WIN} emissive={WIN} emissiveIntensity={0.5} transparent opacity={0.35} roughness={0.1} />
          </mesh>
          <Html center position={[exitEnd.x, exitEnd.y + 0.42, exitEnd.z]} zIndexRange={[10, 0]}>
            <div className="pointer-events-none rounded-full px-2 py-0.5 text-[10.5px] font-bold whitespace-nowrap text-white" style={{ background: WIN }}>
              break → вихід
            </div>
          </Html>
        </>
      )}

      <mesh ref={orb} position={[R, y0, 0]}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive={colors.accent2} emissiveIntensity={1.6} />
        <pointLight color={colors.accent2} intensity={2.5} distance={2} />
      </mesh>
    </group>
  );
}

export function ReturnByDeath() {
  const [n, setN] = useState(4);
  const [mode, setMode] = useState<Mode>("break");
  const [run, setRun] = useState(0);
  const [line, setLine] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const code = mode === "break" ? CODE_BREAK : CODE_INF;

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center">
        <div className="relative">
          <Scene3D height={360} camera={[0, 1.4, 6.2]} fov={45}>
            <Spiral
              n={n}
              mode={mode}
              run={run}
              onTick={(l, a) => {
                setLine(l);
                setAttempt(a);
              }}
            />
          </Scene3D>
          <div className="pointer-events-none absolute top-3 left-4 flex flex-col gap-1">
            <div className="rounded-2xl border border-separator bg-white/90 px-3 py-1.5 font-mono text-[13px] text-label shadow-sm">
              attempt = <b className="text-[16px]">{attempt}</b>
            </div>
            {mode === "inf" && attempt > 4 && (
              <div className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: DEATH }}>
                <span className="inline-flex items-center gap-1"><InfinityIcon className="size-3.5" strokeWidth={1.75} /> нескінченний цикл</span>
              </div>
            )}
          </div>
        </div>
        <div className="px-5 md:pr-5 md:pl-0">
          <CodePane id="rbd" lines={code} active={line} />
        </div>
      </div>
      <ControlBar>
        <Segmented
          id="rbd-mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "break", label: "з break" },
            { value: "inf", label: "без break" },
          ]}
        />
        {mode === "break" && <Slider label="N — спроба, на якій знайдено вихід" value={n} min={1} max={7} onChange={setN} />}
        <Btn variant="accent" onClick={() => setRun((r) => r + 1)}>
          Повернутись на старт
        </Btn>
      </ControlBar>
    </div>
  );
}
