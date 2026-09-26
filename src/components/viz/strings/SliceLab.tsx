"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { ControlBar, Segmented } from "../kit";
import { chars, pyRepr, sliceIndices } from "./util";

const WORDS = ["SAILORMOON", "MOONPRISM", "Місяць✨"] as const;
type Word = (typeof WORDS)[number];

const PRESETS: { label: string; start: number | null; stop: number | null; step: number }[] = [
  { label: "[0:6]", start: 0, stop: 6, step: 1 },
  { label: "[-4:]", start: -4, stop: null, step: 1 },
  { label: "[::2]", start: null, stop: null, step: 2 },
  { label: "[::-1]", start: null, stop: null, step: -1 },
  { label: "[1:8:3]", start: 1, stop: 8, step: 3 },
  { label: "[7:2:-2]", start: 7, stop: 2, step: -2 },
];

const spring = { type: "spring" as const, stiffness: 420, damping: 30 };

export function SliceLab() {
  const [word, setWord] = useState<Word>("SAILORMOON");
  const [start, setStart] = useState<number | null>(0);
  const [stop, setStop] = useState<number | null>(6);
  const [step, setStep] = useState(1);

  const cs = chars(word);
  const n = cs.length;
  const picked = sliceIndices(n, start, stop, step);
  const order = new Map(picked.map((idx, k) => [idx, k + 1]));
  const result = picked.map((i) => cs[i]).join("");

  // куди «вказує» stop після нормалізації (для підсвітки); start — перший взятий індекс
  const normStop = stop === null ? null : stop < 0 ? stop + n : stop;

  const fmt = (v: number | null) => (v === null ? "" : String(v));
  const expr = `s[${fmt(start)}:${fmt(stop)}${step === 1 ? "" : ":" + step}]`;

  return (
    <div>
      <div className="px-5 pb-1">
        <Segmented
          id="slice-word"
          value={word}
          onChange={setWord}
          options={WORDS.map((w) => ({ value: w, label: <span className="font-mono">{w}</span> }))}
        />
      </div>

      <div className="mx-auto mt-4 flex max-w-[560px] justify-center gap-1 px-5 sm:gap-1.5">
        {cs.map((ch, i) => {
          const k = order.get(i);
          const on = k !== undefined;
          const isStart = picked.length > 0 && i === picked[0];
          const isStop = normStop !== null && i === normStop;
          return (
            <div key={`${word}-${i}`} className="flex min-w-0 flex-1 flex-col items-center gap-1" style={{ maxWidth: 48 }}>
              <span className="font-mono text-[10.5px] tabular-nums text-label-2">{i}</span>
              <motion.div
                layout
                animate={{ y: on ? -4 : 0, scale: on ? 1.04 : 1 }}
                transition={spring}
                className="relative grid aspect-[4/5] w-full place-items-center rounded-[12px] font-mono text-[15px] font-bold sm:text-[18px]"
                style={{
                  background: on
                    ? "color-mix(in oklab, var(--accent) 20%, white)"
                    : "color-mix(in oklab, var(--label) 5%, white)",
                  color: on ? "color-mix(in oklab, var(--accent) 45%, var(--label))" : "var(--label)",
                  border: on ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                  boxShadow: isStart
                    ? "0 0 0 2px var(--bg-elevated), 0 0 0 4px var(--accent)"
                    : isStop
                      ? "0 0 0 2px var(--bg-elevated), 0 0 0 4px color-mix(in oklab, var(--label) 35%, transparent)"
                      : on
                        ? "0 4px 10px -6px color-mix(in oklab, var(--accent) 60%, transparent)"
                        : "none",
                  outline: isStop ? "1.5px dashed var(--label-3)" : "none",
                  outlineOffset: 5,
                }}
              >
                {ch}
                {on && (
                  <motion.span
                    key={`o${k}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...spring, delay: (k ?? 0) * 0.04 }}
                    className="absolute -top-2 -right-1.5 grid size-[17px] place-items-center rounded-full bg-elevated text-[10px] font-bold shadow"
                    style={{ color: "color-mix(in oklab, var(--accent) 60%, var(--label))" }}
                  >
                    {k}
                  </motion.span>
                )}
              </motion.div>
              <span className="font-mono text-[10.5px] tabular-nums text-label-3">{i - n}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-center gap-4 text-[11px] text-label-2">
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-full" style={{ boxShadow: "0 0 0 2px var(--accent)" }} />
          start (включно)
        </span>
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-full border border-dashed border-label-3" />
          stop (не включно)
        </span>
      </div>

      <motion.div
        layout
        className="mx-5 mt-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl px-4 py-3 font-mono"
        style={{ background: "color-mix(in oklab, var(--accent) 9%, white)" }}
      >
        <span className="text-[15px] font-bold">{expr}</span>
        <span className="text-label-2">→</span>
        <motion.span key={result + expr} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[16px] font-bold" style={{ color: "color-mix(in oklab, var(--accent) 60%, var(--label))" }}>
          {pyRepr(result)}
        </motion.span>
        <span className="w-full text-center text-[11.5px] text-label-2">
          індекси: [{picked.join(", ")}] {picked.length === 0 && "— порожньо, але без помилки"}
        </span>
      </motion.div>

      <div className="grid gap-3 px-5 pt-4 sm:grid-cols-3">
        <NullableStepper label="start" value={start} onChange={setStart} min={-12} max={12} />
        <NullableStepper label="stop" value={stop} onChange={setStop} min={-12} max={12} />
        <NullableStepper
          label="step"
          value={step}
          min={-3}
          max={3}
          onChange={(v) => setStep(v === null || v === 0 ? (step > 0 ? -1 : 1) : v)}
          skipZero
        />
      </div>

      <ControlBar>
        <span className="text-[12px] font-semibold text-label-2">Шаблони:</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setStart(p.start);
              setStop(p.stop);
              setStep(p.step);
            }}
            className="pill pill-glass !px-2.5 !py-1 font-mono !text-[12px]"
          >
            s{p.label}
          </button>
        ))}
      </ControlBar>
    </div>
  );
}

function NullableStepper({
  label,
  value,
  onChange,
  min,
  max,
  skipZero,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  skipZero?: boolean;
}) {
  const isNone = value === null;
  const bump = (d: number) => {
    let v = (value ?? 0) + d;
    if (skipZero && v === 0) v += d;
    onChange(Math.max(min, Math.min(max, v)));
  };
  return (
    <div className="rounded-[16px] border border-separator px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[13px] font-bold">{label}</span>
        {!skipZero && (
          <button
            onClick={() => onChange(isNone ? 0 : null)}
            className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors"
            style={{
              background: isNone ? "color-mix(in oklab, var(--accent) 18%, white)" : "color-mix(in oklab, var(--label) 8%, transparent)",
              color: isNone ? "color-mix(in oklab, var(--accent) 55%, var(--label))" : "var(--label-2)",
              boxShadow: isNone ? "inset 0 0 0 1.5px var(--accent)" : "none",
            }}
          >
            None
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StepBtn onClick={() => bump(-1)}>−</StepBtn>
        <input
          type="range"
          min={min}
          max={max}
          value={value ?? 0}
          disabled={isNone}
          onChange={(e) => {
            let v = Number(e.target.value);
            if (skipZero && v === 0) v = (value ?? 1) > 0 ? -1 : 1;
            onChange(v);
          }}
          className="min-w-0 flex-1 disabled:opacity-30"
          style={{ accentColor: "var(--accent)" }}
        />
        <StepBtn onClick={() => bump(1)}>+</StepBtn>
        <span className="w-9 text-right font-mono text-[14px] font-bold tabular-nums">{isNone ? "—" : value}</span>
      </div>
    </div>
  );
}

function StepBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid size-7 shrink-0 place-items-center rounded-full text-[15px] font-bold active:scale-90"
      style={{ background: "color-mix(in oklab, var(--label) 8%, transparent)", transition: "transform 200ms" }}
    >
      {children}
    </button>
  );
}
