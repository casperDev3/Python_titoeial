"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, type Group, type MeshPhysicalMaterial } from "three";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Btn, ControlBar, Scene3D, Segmented, Slider, useThemeColors } from "../kit";

const FORMULAS = {
  mul: { code: "i * j", f: (i: number, j: number) => i * j },
  sum: { code: "i + j", f: (i: number, j: number) => i + j },
  idx: { code: "i * n + j", f: (i: number, j: number, n: number) => i * n + j },
} as const;
type Fm = keyof typeof FORMULAS;
type Mode = "grid" | "flat";

function Cube({
  i, j, n, value, visible, current, flat, selected, onPick, a, b,
}: {
  i: number; j: number; n: number; value: number; visible: boolean; current: boolean; flat: boolean;
  selected: boolean; onPick: () => void; a: string; b: string;
}) {
  const g = useRef<Group>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const N = n * n;
  const t = i * n + j;
  const tint = useMemo(() => new Color(a).lerp(new Color(b), n > 1 ? i / (n - 1) : 0), [a, b, i, n]);
  const spacing = Math.min(0.62, 4.8 / N);
  const target = flat
    ? { x: (t - (N - 1) / 2) * spacing, y: -0.2, z: 0, s: spacing / 0.8 }
    : { x: (j - (n - 1) / 2) * 0.95, y: ((n - 1) / 2 - i) * 0.95 + 0.25, z: 0, s: 1 };

  useFrame((state, dt) => {
    const grp = g.current;
    if (!grp) return;
    const k = Math.min(1, dt * 7);
    // невелика «хвиля» у flat-режимі, щоб показати порядок
    const wave = flat ? Math.sin(state.clock.elapsedTime * 2 - t * 0.5) * 0.05 : 0;
    grp.position.x += (target.x - grp.position.x) * k;
    grp.position.y += (target.y + wave - grp.position.y) * k;
    grp.position.z += (target.z - grp.position.z) * k;
    const sGoal = visible ? target.s * (current || selected ? 1.12 : 1) : 0.001;
    const sc = grp.scale.x + (sGoal - grp.scale.x) * k;
    grp.scale.set(sc, sc, sc);
    const m = mat.current;
    if (m) {
      const eg = current ? 0.9 : selected ? 0.5 : 0.12;
      m.emissiveIntensity += (eg - m.emissiveIntensity) * k;
      m.color.copy(tint);
      m.emissive.copy(tint);
    }
  });

  return (
    <group ref={g} scale={0.001} position={[target.x, target.y + 1.5, 0]}>
      <RoundedBox
        args={[0.72, 0.72, 0.72]}
        radius={0.1}
        smoothness={3}
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
      >
        <meshPhysicalMaterial ref={mat} transmission={0.45} thickness={0.5} roughness={0.2} clearcoat={1} transparent opacity={0.92} />
      </RoundedBox>
      {visible && (
        <Html position={[0, 0, 0.4]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <span className="font-mono text-[12px] font-bold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,.6)" }}>
            {value}
          </span>
        </Html>
      )}
    </group>
  );
}

export function NestedGrid3D() {
  const c = useThemeColors();
  const [n, setN] = useState(3);
  const [fm, setFm] = useState<Fm>("idx");
  const [mode, setMode] = useState<Mode>("grid");
  const [filled, setFilled] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const N = n * n;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(
      () => {
        if (filled >= N) setPlaying(false);
        else setFilled(filled + 1);
      },
      filled >= N ? 0 : 520,
    );
    return () => clearTimeout(t);
  }, [playing, filled, N]);

  const f = FORMULAS[fm].f;
  const cur = filled > 0 && filled <= N ? filled - 1 : -1;
  const ci = cur >= 0 ? Math.floor(cur / n) : -1;
  const cj = cur >= 0 ? cur % n : -1;

  // Текстове представлення того, що вже побудовано
  const rows: string[] = [];
  for (let i = 0; i < n; i++) {
    const vals: number[] = [];
    for (let j = 0; j < n; j++) if (i * n + j < filled) vals.push(f(i, j, n));
    if (i * n < filled) rows.push(`[${vals.join(", ")}${vals.length < n ? ", …" : ""}]`);
  }
  const flatVals: number[] = [];
  for (let t = 0; t < filled; t++) flatVals.push(f(Math.floor(t / n), t % n, n));
  const built = mode === "grid" ? `[${rows.join(", ")}]` : `[${flatVals.join(", ")}]`;

  const selInfo = sel !== null && sel < filled ? { i: Math.floor(sel / n), j: sel % n } : null;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="cl-grid-fm"
          value={fm}
          onChange={(v) => {
            setFm(v);
            setSel(null);
          }}
          options={(Object.keys(FORMULAS) as Fm[]).map((k) => ({ value: k, label: <span className="font-mono">{FORMULAS[k].code}</span> }))}
        />
        <Segmented
          id="cl-grid-mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "grid", label: "grid" },
            { value: "flat", label: "flat" },
          ]}
        />
      </ControlBar>

      <div className="mx-5 overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2 font-mono text-[12.5px] leading-relaxed whitespace-nowrap thin-scroll">
        <div>
          grid = [[<b style={{ color: "var(--accent)" }}>{FORMULAS[fm].code}</b>{" "}
          <span style={{ background: cj >= 0 ? "color-mix(in oklab, var(--accent-2) 22%, transparent)" : undefined }} className="rounded px-0.5">
            for j in range({n})
          </span>
          ]{" "}
          <span style={{ background: ci >= 0 ? "color-mix(in oklab, var(--accent) 22%, transparent)" : undefined }} className="rounded px-0.5">
            for i in range({n})
          </span>
          ]
        </div>
        {mode === "flat" && (
          <div>
            flat = [x <span style={{ color: "var(--accent)" }}>for row in grid</span>{" "}
            <span style={{ color: "var(--accent-2)" }}>for x in row</span>]
          </div>
        )}
      </div>

      <Scene3D height={340} camera={[0, 1.2, 7.4]} fov={42}>
        <group rotation={[-0.08, 0, 0]}>
          {Array.from({ length: N }, (_, t) => {
            const i = Math.floor(t / n);
            const j = t % n;
            return (
              <Cube
                key={`${n}-${t}`}
                i={i}
                j={j}
                n={n}
                value={f(i, j, n)}
                visible={t < filled}
                current={t === cur}
                flat={mode === "flat"}
                selected={sel === t}
                onPick={() => setSel(t)}
                a={c.accent}
                b={c.accent2}
              />
            );
          })}
        </group>
      </Scene3D>

      <div className="grid gap-2 px-5 sm:grid-cols-[auto_1fr]">
        <div className="flex gap-2 font-mono text-[12.5px]">
          <span className="rounded-full px-2.5 py-1" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)" }}>
            i = {selInfo ? selInfo.i : ci >= 0 ? ci : "–"}
          </span>
          <span className="rounded-full px-2.5 py-1" style={{ background: "color-mix(in oklab, var(--accent-2) 20%, transparent)" }}>
            j = {selInfo ? selInfo.j : cj >= 0 ? cj : "–"}
          </span>
          {selInfo && (
            <span className="rounded-full bg-separator/50 px-2.5 py-1">
              → {f(selInfo.i, selInfo.j, n)}
            </span>
          )}
        </div>
        <div className="rounded-xl bg-black/80 px-3 py-1.5 font-mono text-[12px] break-all text-[#e5e5ea]">
          {filled === 0 ? <span className="text-[#636366]"># натисни «Заповнити»</span> : built}
        </div>
      </div>

      <ControlBar>
        <Btn
          variant="accent"
          onClick={() => {
            if (filled >= N) setFilled(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Пауза" : "Заповнити"}
        </Btn>
        <Btn onClick={() => setFilled((v) => Math.min(N, v + 1))} disabled={filled >= N}>
          <SkipForward className="size-4" /> +1
        </Btn>
        <Btn
          onClick={() => {
            setPlaying(false);
            setFilled(0);
            setSel(null);
          }}
        >
          <RotateCcw className="size-4" />
        </Btn>
        <Slider
          label="n"
          value={n}
          min={2}
          max={4}
          onChange={(v) => {
            setN(v);
            setFilled(0);
            setSel(null);
            setPlaying(false);
          }}
        />
      </ControlBar>
    </div>
  );
}
