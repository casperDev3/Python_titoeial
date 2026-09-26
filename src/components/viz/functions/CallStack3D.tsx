"use client";

import { Edges, Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, type Group, type MeshPhysicalMaterial } from "three";
import { ChevronLeft, ChevronRight, CornerDownLeft, Hourglass, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Scene3D, Slider, useThemeColors } from "../kit";

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const GAP = 0.46;

/**
 * Стан стека на кроці s для factorial(n):
 * кроки 1..n — «пуш» фреймів, кроки n+1..2n — «поп» з поверненням значення.
 */
function stackAt(n: number, s: number) {
  const pushed = Math.min(s, n);
  const popped = Math.max(0, s - n);
  return { pushed, popped, alive: pushed - popped };
}

function Frame({
  k, n, alive, pushed, selected, onPick, colors,
}: {
  k: number; n: number; alive: number; pushed: number; selected: boolean;
  onPick: (k: number) => void; colors: { a: string };
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  // світле «скло»: білий корпус, верхній фрейм ледь тонований акцентом
  const pale = useMemo(() => new Color("#ffffff").lerp(new Color(colors.a), 0.08), [colors.a]);
  const hot = useMemo(() => new Color("#ffffff").lerp(new Color(colors.a), 0.32), [colors.a]);
  const accent = useMemo(() => new Color(colors.a), [colors.a]);
  const nk = n - k; // значення n у цьому фреймі
  const exists = k < pushed;
  const gone = exists && k >= alive; // вже повернувся
  const isTop = exists && !gone && k === alive - 1;
  const waiting = exists && !gone && !isTop;
  // значення, яке повертає фрейм (відоме після базового випадку)
  const returned = gone || (isTop && pushed === n);

  useFrame((_, dt) => {
    const grp = g.current;
    if (!grp) return;
    const targetY = -1.15 + k * GAP + (gone ? 2.4 : 0);
    const targetS = exists && !gone ? (selected ? 1.06 : 1) : 0.001;
    const kk = Math.min(1, dt * 7);
    grp.position.y += (targetY - grp.position.y) * kk;
    const sc = grp.scale.x + (targetS - grp.scale.x) * kk;
    grp.scale.set(sc, sc, sc);
    const m = mat.current;
    if (m) {
      const goal = isTop ? 0.18 : selected ? 0.1 : 0;
      m.emissiveIntensity += (goal - m.emissiveIntensity) * kk;
      m.color.copy(isTop || selected ? hot : pale);
      m.emissive.copy(accent);
    }
  });

  return (
    <group ref={g} position={[0, -1.15 + k * GAP + 2.4, 0]} scale={0.001}>
      <RoundedBox
        args={[2.6, 0.34, 1.5]}
        radius={0.12}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          onPick(k);
        }}
      >
        <meshPhysicalMaterial
          ref={mat}
          transmission={0.35}
          thickness={0.6}
          roughness={0.2}
          clearcoat={1}
          transparent
          opacity={0.95}
          emissiveIntensity={0}
        />
        <Edges threshold={20} color={colors.a} />
      </RoundedBox>
      {exists && !gone && (
        <Html position={[0, 0, 0.78]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div
            className="flex items-center gap-1.5 rounded-full border bg-white/95 px-2.5 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-label shadow-sm"
            style={{ borderColor: isTop ? "var(--accent)" : "var(--separator)" }}
          >
            factorial({nk})
            {waiting && (
              <span className="flex items-center gap-1 font-normal text-label-2">
                <Hourglass className="size-3" strokeWidth={1.75} /> чекає
              </span>
            )}
            {returned && isTop && (
              <span className="flex items-center gap-0.5" style={{ color: "color-mix(in oklab, var(--accent) 65%, black)" }}>
                <CornerDownLeft className="size-3" strokeWidth={1.75} /> {fact(nk)}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function CallStack3D() {
  const c = useThemeColors();
  const [n, setN] = useState(4);
  const [s, setS] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const total = 2 * n;
  const { pushed, popped, alive } = stackAt(n, s);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(
      () => {
        if (s >= total) setPlaying(false);
        else setS(s + 1);
      },
      s >= total ? 0 : 900,
    );
    return () => clearTimeout(t);
  }, [playing, s, total]);

  // трасування для консолі
  const lines: string[] = [];
  for (let k = 0; k < pushed; k++) lines.push(`${"  ".repeat(k)}→ factorial(${n - k})${n - k <= 1 ? "  # базовий випадок" : ""}`);
  for (let p = 0; p < popped; p++) {
    const k = n - 1 - p;
    const v = n - k;
    lines.push(`${"  ".repeat(k)}← factorial(${v}) = ${v <= 1 ? "1" : `${v} * ${fact(v - 1)} = ${fact(v)}`}`);
  }

  const selK = sel !== null && sel < alive ? sel : null;
  const status =
    s === 0
      ? "Стек порожній. Тисни «Крок», щоб викликати factorial."
      : s < n
        ? `Фрейм factorial(${n - s + 1}) не може порахувати відповідь сам — він кличе factorial(${n - s}) і чекає.`
        : s === n
          ? "Базовий випадок n ≤ 1: повертаємо 1 без нових викликів. Далі стек почне «розмотуватись»."
          : s < total
            ? `factorial(${popped}) повернув ${fact(popped)} і зник. Тепер factorial(${popped + 1}) рахує ${popped + 1} * ${fact(popped)} = ${fact(popped + 1)}.`
            : `Готово: factorial(${n}) = ${fact(n)}. Стек знову порожній.`;

  return (
    <div>
      <Scene3D height={380} camera={[3.2, 2.3, 6.4]} fov={42}>
        <group position={[0, -0.1, 0]} rotation={[0, -0.35, 0]}>
          {Array.from({ length: n }, (_, k) => (
            <Frame
              key={`${n}-${k}`}
              k={k}
              n={n}
              alive={alive}
              pushed={pushed}
              selected={selK === k}
              onPick={setSel}
              colors={{ a: c.accent }}
            />
          ))}
          {/* основа стека */}
          <mesh position={[0, -1.42, 0]}>
            <cylinderGeometry args={[1.9, 1.9, 0.06, 64]} />
            <meshStandardMaterial color="#e5e5ea" roughness={0.6} />
          </mesh>
        </group>
      </Scene3D>

      <div className="grid gap-2 px-5 pb-1 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug" style={{ background: "color-mix(in oklab, var(--accent) 8%, white)" }}>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold tracking-wider text-label-3 uppercase">
            Крок {s}/{total} · глибина стека {alive}
          </div>
          {status}
          {selK !== null && (
            <div className="mt-2 rounded-xl bg-elevated/70 px-2.5 py-1.5 font-mono text-[12px]">
              <div className="text-label-3">locals фрейму factorial({n - selK})</div>
              <div>n = {n - selK}</div>
              <div>
                return = {n - selK <= 1 ? "1" : `${n - selK} * factorial(${n - selK - 1})`}
              </div>
            </div>
          )}
        </div>
        <div className="max-h-[170px] overflow-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed whitespace-pre text-label thin-scroll">
          {lines.length ? lines.join("\n") : <span className="text-label-3"># тут з&apos;явиться трасування</span>}
        </div>
      </div>

      <ControlBar>
        <Btn onClick={() => setS((v) => Math.max(0, v - 1))} disabled={s === 0}>
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        </Btn>
        <Btn variant="accent" onClick={() => setS((v) => Math.min(total, v + 1))} disabled={s === total}>
          Крок <ChevronRight className="size-4" strokeWidth={1.75} />
        </Btn>
        <Btn
          onClick={() => {
            if (s >= total) setS(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" strokeWidth={1.75} /> : <Play className="size-4" strokeWidth={1.75} />}
        </Btn>
        <Btn
          onClick={() => {
            setPlaying(false);
            setS(0);
          }}
        >
          <RotateCcw className="size-4" strokeWidth={1.75} />
        </Btn>
        <Slider
          label="n"
          value={n}
          min={1}
          max={6}
          onChange={(v) => {
            setN(v);
            setS(0);
            setSel(null);
            setPlaying(false);
          }}
        />
      </ControlBar>
    </div>
  );
}
