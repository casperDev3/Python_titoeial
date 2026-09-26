"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Btn, ControlBar } from "../kit";
import { CodePane } from "./CodePane";
import { ArrowUp } from "lucide-react";
import { A2_INK, CONSOLE_BG } from "./palette";

const HEROES = ["Субару", "Емілія", "Рем", "Беатріс"];

const CODE = [
  'heroes = ["Субару", "Емілія", "Рем", "Беатріс"]',
  "total = 0",
  "",
  "for name in heroes:",
  "    total += len(name)",
  "    print(name, total)",
  "",
  'print("Всього літер:", total)',
];

type State = { line: number; idx: number; name: string | null; total: number | null; out: string[]; note: string };

function buildTrace(): State[] {
  const t: State[] = [];
  let total = 0;
  const out: string[] = [];
  t.push({ line: 0, idx: -1, name: null, total: null, out: [], note: "створюємо список" });
  t.push({ line: 1, idx: -1, name: null, total: 0, out: [], note: "лічильник = 0" });
  HEROES.forEach((h, i) => {
    t.push({ line: 3, idx: i, name: h, total, out: [...out], note: `ітерація ${i + 1}: name ← "${h}"` });
    total += h.length;
    t.push({ line: 4, idx: i, name: h, total, out: [...out], note: `len("${h}") = ${h.length}` });
    out.push(`${h} ${total}`);
    t.push({ line: 5, idx: i, name: h, total, out: [...out], note: "друкуємо" });
  });
  t.push({ line: 3, idx: HEROES.length, name: HEROES[HEROES.length - 1], total, out: [...out], note: "елементів більше немає — вихід з циклу" });
  out.push(`Всього літер: ${total}`);
  t.push({ line: 7, idx: HEROES.length, name: HEROES[HEROES.length - 1], total, out: [...out], note: "після циклу" });
  return t;
}

const TRACE = buildTrace();

export function ForStepper() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = TRACE.length - 1;
  const s = TRACE[step];
  const running = playing && step < last;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((x) => Math.min(x + 1, last)), 700);
    return () => clearTimeout(t);
  }, [running, step, last]);

  return (
    <div>
      <div className="grid gap-4 px-5 pb-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          {/* список з вказівником */}
          <div className="rounded-2xl border border-separator p-3">
            <div className="mb-2 font-mono text-[12px] text-label-2">heroes</div>
            <div className="grid grid-cols-4 gap-1.5">
              {HEROES.map((h, i) => {
                const done = i < s.idx;
                const cur = i === s.idx;
                return (
                  <div key={h} className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[10px] text-label-3">[{i}]</span>
                    <motion.div
                      animate={{ scale: cur ? 1.06 : 1, opacity: done ? 0.55 : 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      className="w-full truncate rounded-xl border px-1 py-2 text-center text-[12.5px] font-semibold"
                      style={{
                        borderColor: cur ? "var(--accent)" : "var(--separator)",
                        background: cur ? "color-mix(in oklab, var(--accent) 12%, white)" : "var(--glass-bg)",
                      }}
                    >
                      {h}
                    </motion.div>
                    <div className="h-4">
                      {cur && (
                        <motion.span
                          layoutId="for-ptr"
                          transition={{ type: "spring", stiffness: 500, damping: 32 }}
                          className="block leading-none"
                          style={{ color: "var(--accent)" }}
                        >
                          <ArrowUp className="size-4" strokeWidth={1.75} />
                        </motion.span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <AnimatePresence>
              {s.idx >= HEROES.length && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-center text-[12px] font-semibold"
                  style={{ color: A2_INK }}
                >
                  StopIteration → цикл завершено
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* змінні */}
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["name", s.name === null ? "—" : `"${s.name}"`],
                ["total", s.total === null ? "—" : String(s.total)],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-separator px-3 py-2">
                <div className="font-mono text-[11px] text-label-2">{k}</div>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={v}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 480, damping: 28 }}
                    className="font-mono text-[17px] font-bold"
                    style={{ color: k === "total" ? A2_INK : "var(--accent)" }}
                  >
                    {v}
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <CodePane id="for-stepper" lines={CODE} active={s.line} />
          <div className="min-h-[108px] rounded-2xl border border-separator px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-label" style={{ background: CONSOLE_BG }}>
            <div className="text-[10px] tracking-wider text-label-3 uppercase">stdout</div>
            {s.out.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                {l}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ControlBar>
        <Btn onClick={() => setStep((x) => Math.min(x + 1, last))} disabled={step >= last}>
          Крок
        </Btn>
        <Btn
          variant="accent"
          onClick={() => {
            if (step >= last) setStep(0);
            setPlaying((p) => !(p && step < last));
          }}
        >
          {running ? "Пауза" : step >= last ? "Спочатку" : "Грати"}
        </Btn>
        <Btn
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
        >
          Скинути
        </Btn>
        <span className="text-[12.5px] text-label-2">
          <b className="text-label">{step + 1}</b>/{TRACE.length} · {s.note}
        </span>
      </ControlBar>
    </div>
  );
}
