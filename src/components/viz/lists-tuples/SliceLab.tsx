"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Console, ControlBar } from "../kit";
import { CrewIcon } from "./icons";

const CREW = ["Luffy", "Zoro", "Nami", "Usopp", "Sanji", "Chopper"];
const N = CREW.length;

type P = number | null;

/** Точна семантика slice.indices() з CPython. */
function sliceIndices(len: number, start: P, stop: P, step: number): number[] {
  const neg = step < 0;
  const lower = neg ? -1 : 0;
  const upper = neg ? len - 1 : len;
  const norm = (v: P, def: number) => {
    if (v === null) return def;
    if (v < 0) return Math.max(v + len, lower);
    return Math.min(v, upper);
  };
  const s = norm(start, neg ? upper : lower);
  const e = norm(stop, neg ? lower : upper);
  const out: number[] = [];
  for (let i = s; neg ? i > e : i < e; i += step) out.push(i);
  return out;
}

const PRESETS: { label: string; start: P; stop: P; step: P }[] = [
  { label: "[1:4]", start: 1, stop: 4, step: null },
  { label: "[:3]", start: null, stop: 3, step: null },
  { label: "[-2:]", start: -2, stop: null, step: null },
  { label: "[::2]", start: null, stop: null, step: 2 },
  { label: "[::-1]", start: null, stop: null, step: -1 },
  { label: "[4:1:-1]", start: 4, stop: 1, step: -1 },
  { label: "[-7:7]", start: -7, stop: 7, step: null },
];

export function SliceLab() {
  const [start, setStart] = useState<P>(1);
  const [stop, setStop] = useState<P>(4);
  const [step, setStep] = useState<P>(null);

  const st = step ?? 1;
  const zero = st === 0;
  const picked = zero ? [] : sliceIndices(N, start, stop, st);
  const fmt = (v: P) => (v === null ? "" : String(v));
  const expr = `crew[${fmt(start)}:${fmt(stop)}${step === null ? "" : ":" + step}]`;
  const result = zero
    ? "ValueError: slice step cannot be zero"
    : "[" + picked.map((i) => `'${CREW[i]}'`).join(", ") + "]";

  return (
    <div>
      <div className="px-4 pt-3 sm:px-5">
        <div className="mb-2 flex items-baseline justify-between font-mono text-[15px] font-semibold">
          <motion.span key={expr} initial={{ opacity: 0.4, y: -3 }} animate={{ opacity: 1, y: 0 }}>
            {expr}
          </motion.span>
          <span className="text-[11px] font-normal text-label-2">len = {zero ? "—" : picked.length}</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {CREW.map((name, i) => {
            const order = picked.indexOf(i);
            const on = order >= 0;
            return (
              <div key={name} className="flex min-w-0 flex-col items-center gap-1">
                <span className="font-mono text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                  {i}
                </span>
                <motion.div
                  animate={{ y: on ? -6 : 0, scale: on ? 1 : 0.94, opacity: on ? 1 : 0.5 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className="relative flex h-[62px] w-full flex-col items-center justify-center rounded-[14px] border"
                  style={{
                    background: on ? "color-mix(in oklab, var(--accent) 14%, white)" : "white",
                    borderColor: on ? "var(--accent)" : "var(--separator)",
                    color: "var(--label)",
                    boxShadow: on ? "0 8px 20px -10px color-mix(in oklab, var(--accent) 60%, transparent)" : "none",
                  }}
                >
                  <CrewIcon name={name} className={`size-5 ${on ? "text-accent" : "text-label-2"}`} />
                  <span className="mt-1 w-full truncate px-0.5 text-center text-[10.5px] font-semibold">{name}</span>
                  {on && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-1.5 grid size-5 place-items-center rounded-full bg-elevated font-mono text-[10px] font-bold shadow"
                      style={{ color: "var(--accent)" }}
                    >
                      {order + 1}
                    </motion.span>
                  )}
                </motion.div>
                <span className="font-mono text-[11px] text-label-2">{i - N}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10.5px] text-label-3">
          <span>індекс ↑</span>
          <span>від&apos;ємний індекс ↓</span>
        </div>
      </div>

      <div className="grid gap-3 px-4 pt-4 sm:grid-cols-3 sm:px-5">
        <Param name="start" value={start} min={-7} max={7} onChange={setStart} hint="звідки (включно)" />
        <Param name="stop" value={stop} min={-7} max={7} onChange={setStop} hint="докуди (НЕ включно)" def={6} />
        <Param name="step" value={step} min={-3} max={3} onChange={setStep} hint="крок" def={1} />
      </div>

      <ControlBar>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="pill pill-glass !px-2.5 !py-1 font-mono !text-[12px]"
            onClick={() => {
              setStart(p.start);
              setStop(p.stop);
              setStep(p.step);
            }}
          >
            {p.label}
          </button>
        ))}
      </ControlBar>
      <Console
        lines={[
          <span key="e">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {expr}
          </span>,
          <span key="r" className={zero ? "text-[#ff6961]" : "text-[#ffd60a]"}>
            {result}
          </span>,
        ]}
      />
    </div>
  );
}

function Param({
  name,
  value,
  min,
  max,
  onChange,
  hint,
  def = 0,
}: {
  name: string;
  value: P;
  min: number;
  max: number;
  onChange: (v: P) => void;
  hint: string;
  def?: number;
}) {
  const omitted = value === null;
  return (
    <div className="glass !rounded-[14px] px-3 py-2">
      <div className="flex items-center justify-between gap-2 text-[12.5px]">
        <span className="font-mono font-semibold">{name}</span>
        <button
          onClick={() => onChange(omitted ? def : null)}
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors"
          style={{
            background: omitted ? "var(--accent)" : "var(--separator)",
            color: omitted ? "white" : "var(--label-2)",
          }}
        >
          {omitted ? "пропущено" : "пропустити"}
        </button>
        <span className="min-w-6 text-right font-mono tabular-nums">{omitted ? "—" : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={omitted ? def : (value as number)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
        style={{ accentColor: "var(--accent)", opacity: omitted ? 0.4 : 1 }}
        aria-label={name}
      />
      <div className="text-[11px] text-label-3">{hint}</div>
    </div>
  );
}
