"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { MathUtils } from "three";
import { Btn, ControlBar, Scene3D, Segmented, Slider, useThemeColors, type ThemeColors } from "../kit";
import { CodePane } from "./CodePane";

type Mode = "full" | "break";
type Ev = { r: number; c: number; kind: "run" | "break" };

function trace(rows: number, cols: number, mode: Mode): Ev[] {
  const ev: Ev[] = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (mode === "break" && c > r) {
        ev.push({ r, c, kind: "break" });
        break;
      }
      ev.push({ r, c, kind: "run" });
    }
  }
  return ev;
}

const GAP = 0.78;

type Status = "pending" | "current" | "done" | "break" | "never";

function Cell({
  pos,
  status,
  value,
  colors,
  maxVal,
}: {
  pos: [number, number, number];
  status: Status;
  value: number;
  colors: ThemeColors;
  maxVal: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const targetH = status === "done" || status === "current" ? 0.25 + (value / maxVal) * 1.6 : status === "break" ? 0.08 : 0.12;
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.scale.y = MathUtils.damp(g.scale.y, targetH, 7, dt);
    g.position.y = g.scale.y / 2 - 0.6 + (status === "current" ? 0.12 : 0);
  });
  const color =
    status === "break" ? "#ff453a" : status === "current" ? colors.accent2 : status === "done" ? colors.accent : "#8e8e93";
  return (
    <group position={[pos[0], 0, pos[2]]}>
      <group ref={ref} scale={[1, 0.12, 1]}>
        <RoundedBox args={[0.6, 1, 0.6]} radius={0.08} smoothness={3}>
          <meshPhysicalMaterial
            color={color}
            emissive={status === "current" || status === "break" ? color : "#000000"}
            emissiveIntensity={status === "current" ? 0.6 : status === "break" ? 0.5 : 0}
            roughness={0.2}
            clearcoat={1}
            transparent
            opacity={status === "never" ? 0.12 : status === "pending" ? 0.3 : 0.92}
          />
        </RoundedBox>
      </group>
      {(status === "done" || status === "current" || status === "break") && (
        <Html center position={[0, status === "break" ? -0.25 : targetH - 0.42 + (status === "current" ? 0.12 : 0), 0]} zIndexRange={[10, 0]}>
          <span
            className="pointer-events-none rounded-md px-1 font-mono text-[10.5px] font-bold whitespace-nowrap"
            style={{
              color: status === "current" ? "white" : status === "break" ? "#ff453a" : "var(--label)",
              background: status === "current" ? "var(--accent-2)" : "transparent",
            }}
          >
            {status === "break" ? "break" : value}
          </span>
        </Html>
      )}
    </group>
  );
}

function Grid({ rows, cols, events, step }: { rows: number; cols: number; events: Ev[]; step: number }) {
  const colors = useThemeColors();
  const width = useThree((s) => s.viewport.width);
  const fit = Math.min(1, width / (cols * GAP + 1.6));
  const status = new Map<string, Status>();
  events.forEach((e, i) => {
    const k = `${e.r}-${e.c}`;
    if (i < step - 1) status.set(k, e.kind === "break" ? "break" : "done");
    else if (i === step - 1) status.set(k, e.kind === "break" ? "break" : step >= events.length ? "done" : "current");
  });
  const visited = new Set(events.map((e) => `${e.r}-${e.c}`));
  const maxVal = rows * cols;

  const cells = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const k = `${r}-${c}`;
      const st: Status = status.get(k) ?? (visited.has(k) ? "pending" : "never");
      cells.push(
        <Cell
          key={k}
          pos={[(c - 1 - (cols - 1) / 2) * GAP, 0, (r - 1 - (rows - 1) / 2) * GAP]}
          status={st}
          value={r * c}
          colors={colors}
          maxVal={maxVal}
        />,
      );
    }
  }

  return (
    <group scale={fit} rotation={[0, -0.35, 0]}>
      {cells}
      {Array.from({ length: rows }, (_, i) => (
        <Html
          key={`r${i}`}
          center
          position={[-((cols - 1) / 2) * GAP - 0.75, -0.55, (i - (rows - 1) / 2) * GAP]}
          zIndexRange={[10, 0]}
        >
          <span className="pointer-events-none font-mono text-[10.5px] font-semibold whitespace-nowrap" style={{ color: "var(--accent)" }}>
            row={i + 1}
          </span>
        </Html>
      ))}
      {Array.from({ length: cols }, (_, i) => (
        <Html
          key={`c${i}`}
          center
          position={[(i - (cols - 1) / 2) * GAP, -0.55, ((rows - 1) / 2) * GAP + 0.65]}
          zIndexRange={[10, 0]}
        >
          <span className="pointer-events-none font-mono text-[10.5px] font-semibold whitespace-nowrap" style={{ color: "var(--accent-2)" }}>
            col={i + 1}
          </span>
        </Html>
      ))}
    </group>
  );
}

export function NestedGrid() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [mode, setMode] = useState<Mode>("full");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const events = trace(rows, cols, mode);
  const done = step >= events.length;
  const running = playing && !done;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((s) => s + 1), 380);
    return () => clearTimeout(t);
  }, [running, step]);

  const reset = (play: boolean) => {
    setStep(0);
    setPlaying(play);
  };

  const cur = events[step - 1];
  const code =
    mode === "full"
      ? [`for row in range(1, ${rows + 1}):`, `    for col in range(1, ${cols + 1}):`, "        print(row * col)"]
      : [
          `for row in range(1, ${rows + 1}):`,
          `    for col in range(1, ${cols + 1}):`,
          "        if col > row:",
          "            break      # лише внутрішній!",
          "        print(row * col)",
        ];
  const active = !cur ? 0 : mode === "full" ? 2 : cur.kind === "break" ? 3 : 4;
  const runs = events.slice(0, step).filter((e) => e.kind === "run").length;

  return (
    <div>
      <Scene3D height={340} camera={[0, 3.6, 5.6]} fov={45}>
        <Grid rows={rows} cols={cols} events={events} step={step} />
      </Scene3D>
      <div className="grid gap-3 px-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <CodePane id="nested" lines={code} active={active} />
        <div className="flex gap-2 md:flex-col">
          <div className="flex-1 rounded-2xl border border-separator px-3 py-2 font-mono text-[12.5px]">
            <div className="text-[11px] text-label-2">стан</div>
            {cur ? (
              <div>
                row=<b style={{ color: "var(--accent)" }}>{cur.r}</b> col=<b style={{ color: "var(--accent-2)" }}>{cur.c}</b>
              </div>
            ) : (
              <div className="text-label-3">—</div>
            )}
          </div>
          <div className="flex-1 rounded-2xl border border-separator px-3 py-2 font-mono text-[12.5px]">
            <div className="text-[11px] text-label-2">print-ів</div>
            <b>{runs}</b>
            <span className="text-label-3"> / {mode === "full" ? `${rows}×${cols}=${rows * cols}` : events.filter((e) => e.kind === "run").length}</span>
          </div>
        </div>
      </div>
      <ControlBar>
        <Segmented
          id="nested-mode"
          value={mode}
          onChange={(v) => {
            setMode(v);
            reset(true);
          }}
          options={[
            { value: "full", label: "повна таблиця" },
            { value: "break", label: "break при col > row" },
          ]}
        />
        <Slider label="rows" value={rows} min={1} max={5} onChange={(v) => { setRows(v); reset(false); }} />
        <Slider label="cols" value={cols} min={1} max={6} onChange={(v) => { setCols(v); reset(false); }} />
        <Btn onClick={() => { setPlaying(false); setStep((s) => Math.min(s + 1, events.length)); }} disabled={done}>
          Крок
        </Btn>
        <Btn variant="accent" onClick={() => reset(true)}>
          Грати
        </Btn>
      </ControlBar>
    </div>
  );
}
