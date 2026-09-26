"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar } from "../kit";

const CODE = [
  "def power_up(base, boost=2):",
  "    result = base * boost",
  "    return result",
  "",
  "x = power_up(5)",
  "y = power_up(3, boost=10)",
  "print(x + y)",
];

type Vars = [string, string][];
type Step = {
  line: number; // 1-based
  globals: Vars;
  frame: { call: string; locals: Vars } | null;
  ret?: string;
  out: string[];
  note: string;
};

const FN = "<function>";
const STEPS: Step[] = [
  { line: 1, globals: [["power_up", FN]], frame: null, out: [], note: "`def` лише створює об'єкт функції і кладе його в змінну `power_up`. Тіло ще не виконується." },
  { line: 5, globals: [["power_up", FN]], frame: { call: "power_up(5)", locals: [["base", "5"], ["boost", "2"]] }, out: [], note: "Виклик! Python створює новий фрейм. `base` отримує 5, а `boost` бере значення за замовчуванням 2." },
  { line: 2, globals: [["power_up", FN]], frame: { call: "power_up(5)", locals: [["base", "5"], ["boost", "2"], ["result", "10"]] }, out: [], note: "`result` — локальна змінна. Вона живе лише у фреймі цього виклику." },
  { line: 3, globals: [["power_up", FN]], frame: { call: "power_up(5)", locals: [["base", "5"], ["boost", "2"], ["result", "10"]] }, ret: "10", out: [], note: "`return` бере значення 10 і несе його назад у місце виклику." },
  { line: 5, globals: [["power_up", FN], ["x", "10"]], frame: null, out: [], note: "Фрейм знищено разом з `base`, `boost` і `result`. У глобальній області з'явився `x = 10`." },
  { line: 6, globals: [["power_up", FN], ["x", "10"]], frame: { call: "power_up(3, boost=10)", locals: [["base", "3"], ["boost", "10"]] }, out: [], note: "Новий виклик — новий, чистий фрейм. Тепер `boost` передано за іменем." },
  { line: 2, globals: [["power_up", FN], ["x", "10"]], frame: { call: "power_up(3, boost=10)", locals: [["base", "3"], ["boost", "10"], ["result", "30"]] }, out: [], note: "Той самий код, інші дані: `result = 3 * 10`." },
  { line: 3, globals: [["power_up", FN], ["x", "10"]], frame: { call: "power_up(3, boost=10)", locals: [["base", "3"], ["boost", "10"], ["result", "30"]] }, ret: "30", out: [], note: "Повертаємо 30." },
  { line: 6, globals: [["power_up", FN], ["x", "10"], ["y", "30"]], frame: null, out: [], note: "`y = 30`. Змінної `result` у глобальній області немає й ніколи не було." },
  { line: 7, globals: [["power_up", FN], ["x", "10"], ["y", "30"]], frame: null, out: ["40"], note: "`print` виводить `x + y`. Plus Ultra!" },
];

function Note({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") ? (
          <code key={i} className="inline-code">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function VarRow({ name, value }: { name: string; value: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="flex items-center justify-between gap-3 rounded-[10px] bg-elevated/70 px-2.5 py-1.5 font-mono text-[12.5px] shadow-sm"
    >
      <span className="text-label-2">{name}</span>
      <motion.span
        key={value}
        initial={{ scale: 1.25, color: "var(--accent)" }}
        animate={{ scale: 1, color: "var(--label)" }}
        className="font-semibold"
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

export function CallStepper() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const s = STEPS[i];
  const last = STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(
      () => {
        if (i >= last) setPlaying(false);
        else setI(i + 1);
      },
      i >= last ? 0 : 1400,
    );
    return () => clearTimeout(t);
  }, [playing, i, last]);

  return (
    <div>
      <div className="grid gap-3 px-5 pt-1 pb-3 md:grid-cols-[1.15fr_1fr]">
        {/* Код */}
        <div className="relative overflow-hidden rounded-2xl border border-separator bg-[var(--code-bg)] py-2 font-mono text-[12.5px] sm:text-[13px]">
          {CODE.map((line, idx) => {
            const active = s.line === idx + 1;
            return (
              <div key={idx} className="relative flex items-center px-3 py-[3px]">
                {active && (
                  <motion.div
                    layoutId="fn-stepper-line"
                    className="absolute inset-0"
                    style={{
                      background: "color-mix(in oklab, var(--accent) 16%, transparent)",
                      boxShadow: "inset 3px 0 0 var(--accent)",
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="relative w-6 shrink-0 text-right text-label-3 tabular-nums">{idx + 1}</span>
                <span className="relative ml-3 whitespace-pre text-label">{line || " "}</span>
              </div>
            );
          })}
        </div>

        {/* Пам'ять */}
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="rounded-2xl border border-separator bg-separator/25 p-2.5">
            <div className="mb-1.5 text-[11px] font-bold tracking-wider text-label-3 uppercase">Global</div>
            <motion.div layout className="flex flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {s.globals.map(([n, v]) => (
                  <VarRow key={n} name={n} value={v} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="relative min-h-[132px]">
            <AnimatePresence mode="popLayout">
              {s.frame ? (
                <motion.div
                  key={s.frame.call}
                  initial={{ opacity: 0, y: 24, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.9, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className="glass-tint rounded-2xl border p-2.5"
                >
                  <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                    <span className="size-2 rounded-full" style={{ background: "var(--accent)" }} />
                    <span style={{ color: "var(--accent)" }}>Фрейм</span>
                    <span className="truncate font-mono tracking-normal text-label-2 normal-case">{s.frame.call}</span>
                  </div>
                  <motion.div layout className="flex flex-col gap-1.5">
                    <AnimatePresence initial={false}>
                      {s.frame.locals.map(([n, v]) => (
                        <VarRow key={n} name={n} value={v} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {s.ret && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[12px] font-bold text-white"
                        style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))" }}
                      >
                        ↩ return {s.ret}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid h-[132px] place-items-center rounded-2xl border border-dashed border-separator text-center text-[12.5px] text-label-3"
                >
                  немає активного виклику
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mx-5 min-h-[52px] rounded-2xl bg-separator/30 px-3.5 py-2.5 text-[13.5px] leading-snug">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <span className="mr-1.5 font-semibold" style={{ color: "var(--accent)" }}>
              {i + 1}/{STEPS.length}
            </span>
            <Note text={s.note} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-5 mt-3 rounded-2xl bg-black/80 px-4 py-2.5 font-mono text-[12.5px] text-[#e5e5ea]">
        <span className="text-[#8e8e93]">stdout ›</span> {s.out.join(" ") || <span className="text-[#636366]">—</span>}
      </div>

      <ControlBar>
        <Btn onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
          <ChevronLeft className="size-4" /> Назад
        </Btn>
        <Btn variant="accent" onClick={() => setI((v) => Math.min(last, v + 1))} disabled={i === last}>
          Крок <ChevronRight className="size-4" />
        </Btn>
        <Btn
          onClick={() => {
            if (i === last) setI(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Пауза" : "Авто"}
        </Btn>
        <Btn
          onClick={() => {
            setPlaying(false);
            setI(0);
          }}
        >
          <RotateCcw className="size-4" /> Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}
