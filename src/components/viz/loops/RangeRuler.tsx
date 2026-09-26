"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ControlBar, Slider } from "../kit";
import { A2_INK, RED } from "./palette";

const LO = -6;
const HI = 16;

function rangeValues(start: number, stop: number, step: number): number[] {
  const out: number[] = [];
  if (step === 0) return out;
  if (step > 0) for (let v = start; v < stop; v += step) out.push(v);
  else for (let v = start; v > stop; v += step) out.push(v);
  return out;
}

const PRESETS: { label: string; v: [number, number, number] }[] = [
  { label: "range(5)", v: [0, 5, 1] },
  { label: "range(2, 9)", v: [2, 9, 1] },
  { label: "range(0, 15, 3)", v: [0, 15, 3] },
  { label: "range(10, 0, -2)", v: [10, 0, -2] },
  { label: "range(5, 2)", v: [5, 2, 1] },
];

export function RangeRuler() {
  const [start, setStart] = useState(1);
  const [stop, setStop] = useState(11);
  const [step, setStep] = useState(2);
  const vals = rangeValues(start, stop, step);
  const set = new Map(vals.map((v, i) => [v, i]));
  const ticks = Array.from({ length: HI - LO + 1 }, (_, i) => LO + i);
  const call = start === 0 && step === 1 ? `range(${stop})` : step === 1 ? `range(${start}, ${stop})` : `range(${start}, ${stop}, ${step})`;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-5 pb-3">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setStart(p.v[0]);
              setStop(p.v[1]);
              setStep(p.v[2]);
            }}
            className="rounded-full border border-separator px-3 py-1 font-mono text-[12px] transition-colors hover:border-[var(--accent)]"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mx-5 overflow-x-auto rounded-2xl border border-separator px-2 pt-8 pb-3">
        <div className="relative flex w-max gap-0">
          {ticks.map((t) => {
            const on = set.has(t);
            const order = set.get(t) ?? 0;
            const isStart = t === start;
            const isStop = t === stop;
            return (
              <div key={t} className="relative flex w-[30px] shrink-0 flex-col items-center">
                {(isStart || isStop) && (
                  <span
                    className="absolute -top-7 rounded-md px-1 text-[9.5px] font-bold whitespace-nowrap text-white"
                    style={{ background: isStart ? "var(--accent)" : A2_INK }}
                  >
                    {isStart && isStop ? "start=stop" : isStart ? "start" : "stop"}
                  </span>
                )}
                <div className="relative grid h-[30px] w-full place-items-center">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-separator" />
                  {on ? (
                    <motion.span
                      key={`${t}-${start}-${stop}-${step}`}
                      initial={{ scale: 0, y: -14 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 520, damping: 22, delay: order * 0.06 }}
                      className="relative grid size-[24px] place-items-center rounded-full text-[10px] font-bold text-white shadow-md"
                      style={{ background: "var(--accent)" }}
                    >
                      {order + 1}
                    </motion.span>
                  ) : isStop ? (
                    <span className="relative size-[20px] rounded-full border-2 border-dashed bg-white" style={{ borderColor: A2_INK }} />
                  ) : (
                    <span className="relative size-1.5 rounded-full bg-separator" />
                  )}
                </div>
                <span
                  className="mt-1 font-mono text-[11px] tabular-nums"
                  style={{ color: on ? "var(--label)" : "var(--label-3)", fontWeight: on ? 700 : 400 }}
                >
                  {t}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-5 mt-3 rounded-2xl px-4 py-2.5 font-mono text-[13px]" style={{ background: "color-mix(in oklab, var(--accent) 9%, transparent)" }}>
        {step === 0 ? (
          <span style={{ color: RED }}>ValueError: range() arg 3 must not be zero</span>
        ) : (
          <>
            <span className="text-label-2">list({call}) → </span>
            <b style={{ color: "var(--accent)" }}>[{vals.join(", ")}]</b>
            <span className="ml-2 text-label-2">len = {vals.length}</span>
            {vals.length === 0 && (
              <span className="ml-2 font-sans text-[12px] text-label-2">
                (порожньо: з кроком {step > 0 ? "+" : "−"} не дійти від {start} до {stop})
              </span>
            )}
          </>
        )}
      </div>

      <ControlBar>
        <Slider label="start" value={start} min={LO} max={HI} onChange={setStart} />
        <Slider label="stop" value={stop} min={LO} max={HI} onChange={setStop} />
        <Slider label="step" value={step} min={-5} max={5} onChange={setStep} />
      </ControlBar>
    </div>
  );
}
