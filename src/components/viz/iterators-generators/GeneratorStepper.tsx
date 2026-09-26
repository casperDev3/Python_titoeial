"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Btn, ControlBar } from "../kit";
import { CodePane, Tag } from "./shared";

const GEN_CODE = [
  "def countdown(n):",
  '    print("Старт")',
  "    while n > 0:",
  "        yield n",
  "        n -= 1",
  '    print("Кінець")',
];

const CALLER_CODE = ["gen = countdown(2)", "print(next(gen))", "print(next(gen))", "print(next(gen))"];

type GenState = "—" | "GEN_CREATED" | "GEN_RUNNING" | "GEN_SUSPENDED" | "GEN_CLOSED";

type Step = {
  caller: number;
  gen: number;
  state: GenState;
  n: number | null;
  out?: string;
  /** значення, що «летить» з генератора до викликача */
  flying?: string;
  note: string;
  error?: boolean;
};

const STEPS: Step[] = [
  { caller: -1, gen: -1, state: "—", n: null, note: "Генераторна функція оголошена. Поки що це просто рецепт." },
  {
    caller: 0, gen: -1, state: "GEN_CREATED", n: 2,
    note: "Виклик countdown(2) НЕ виконує тіло! Створено об'єкт-генератор, n = 2 вже збережено.",
  },
  { caller: 1, gen: 1, state: "GEN_RUNNING", n: 2, out: "Старт", note: "Перший next() — генератор нарешті стартує з першого рядка." },
  { caller: 1, gen: 2, state: "GEN_RUNNING", n: 2, note: "Умова n > 0 → True, заходимо в цикл." },
  {
    caller: 1, gen: 3, state: "GEN_SUSPENDED", n: 2, flying: "2",
    note: "yield віддає 2 і ЗАМОРОЖУЄ функцію. Локальна n = 2 зберігається.",
  },
  { caller: 1, gen: 3, state: "GEN_SUSPENDED", n: 2, out: "2", note: "print() у викликача друкує отримане значення." },
  { caller: 2, gen: 4, state: "GEN_RUNNING", n: 1, note: "Другий next() — розморожуємося рівно після yield: n -= 1." },
  { caller: 2, gen: 2, state: "GEN_RUNNING", n: 1, note: "Знову перевірка n > 0 → True." },
  { caller: 2, gen: 3, state: "GEN_SUSPENDED", n: 1, flying: "1", note: "yield 1 — і знову пауза." },
  { caller: 2, gen: 3, state: "GEN_SUSPENDED", n: 1, out: "1", note: "Викликач друкує 1." },
  { caller: 3, gen: 4, state: "GEN_RUNNING", n: 0, note: "Третій next(): n -= 1 → 0." },
  { caller: 3, gen: 2, state: "GEN_RUNNING", n: 0, note: "n > 0 → False, цикл закінчився." },
  { caller: 3, gen: 5, state: "GEN_RUNNING", n: 0, out: "Кінець", note: "Друкуємо «Кінець» — і функція доходить до краю." },
  {
    caller: 3, gen: -1, state: "GEN_CLOSED", n: null, out: "StopIteration", error: true,
    note: "Функція завершилась → next() кидає StopIteration. У циклі for це був би тихий вихід.",
  },
];

const STATE_COLOR: Record<GenState, string> = {
  "—": "var(--label-3)",
  GEN_CREATED: "#0a84ff",
  GEN_RUNNING: "var(--accent)",
  GEN_SUSPENDED: "#ff9f0a",
  GEN_CLOSED: "#8e8e93",
};

export function GeneratorStepper() {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  const step = STEPS[i];
  const last = STEPS.length - 1;

  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setI((v) => (v >= last ? v : v + 1)), 1100);
    return () => clearInterval(id);
  }, [play, last]);

  useEffect(() => {
    if (!play || i < last) return;
    const t = setTimeout(() => setPlay(false), 0);
    return () => clearTimeout(t);
  }, [play, i, last]);

  const outputs = STEPS.slice(0, i + 1)
    .map((s) => s.out)
    .filter((o): o is string => !!o);

  return (
    <div>
      <div className="grid gap-3 px-5 pt-2 sm:grid-cols-2">
        {/* Викликач */}
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold text-label-2">
            <span>📜 Код, що викликає</span>
          </div>
          <CodePane lines={CALLER_CODE} active={step.caller} id="gen-caller" tone={step.error ? "warn" : "accent"} />
          <div className="mt-2 min-h-[92px] rounded-2xl bg-black/80 px-3 py-2 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
            <div className="text-[#8e8e93]"># вивід</div>
            <AnimatePresence initial={false}>
              {outputs.map((o, k) => (
                <motion.div
                  key={`${k}-${o}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={o === "StopIteration" ? "text-[#ff9f0a]" : ""}
                >
                  {o}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Генератор */}
        <div className="relative min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-label-2">
            <span>🌀 Фрейм генератора</span>
            <motion.span
              key={step.state}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
            >
              <Tag color={STATE_COLOR[step.state]}>{step.state}</Tag>
            </motion.span>
          </div>
          <motion.div
            animate={{
              opacity: step.state === "GEN_CLOSED" || step.state === "—" ? 0.55 : 1,
              filter: step.state === "GEN_SUSPENDED" ? "saturate(0.6)" : "saturate(1)",
            }}
            className="relative"
          >
            <CodePane lines={GEN_CODE} active={step.gen} id="gen-body" />
            {step.state === "GEN_SUSPENDED" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white"
                style={{ background: "#ff9f0a" }}
              >
                ❄ пауза
              </motion.div>
            )}
          </motion.div>
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2 font-mono text-[12.5px]"
            style={{ background: "color-mix(in oklab, var(--accent) 9%, transparent)" }}>
            <span className="text-label-2">локальні:</span>
            {step.n === null ? (
              <span className="text-label-3">—</span>
            ) : (
              <motion.span
                key={step.n}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
              >
                n = <b style={{ color: "var(--accent)" }}>{step.n}</b>
              </motion.span>
            )}
          </div>
          <AnimatePresence>
            {step.flying && (
              <motion.div
                key={`fly-${i}`}
                initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 0.8], x: [0, -40, -110, -160], y: [0, -20, -30, 10] }}
                transition={{ duration: 1.05, ease: "easeInOut" }}
                className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden size-10 place-items-center rounded-full font-mono text-[15px] font-bold text-white shadow-lg sm:grid"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
              >
                {step.flying}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        key={i}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mt-3 flex items-start gap-2 rounded-2xl px-4 py-3 text-[13.5px]"
        style={{
          background: step.error
            ? "color-mix(in oklab, #ff9f0a 14%, transparent)"
            : "color-mix(in oklab, var(--accent-2) 10%, transparent)",
        }}
      >
        <span className="font-mono text-[11px] font-bold text-label-3 tabular-nums">
          {i}/{last}
        </span>
        <span>
          {step.flying && (
            <b style={{ color: "var(--accent)" }}>
              yield → {step.flying}.{" "}
            </b>
          )}
          {step.note}
        </span>
      </motion.div>

      <ControlBar>
        <Btn onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0 || play}>
          ← Назад
        </Btn>
        <Btn variant="accent" onClick={() => setI((v) => Math.min(last, v + 1))} disabled={i === last || play}>
          Крок →
        </Btn>
        <Btn
          onClick={() => {
            if (i >= last) setI(0);
            setPlay((p) => !p);
          }}
        >
          {play ? "❚❚ Пауза" : "▶ Авто"}
        </Btn>
        <Btn
          onClick={() => {
            setPlay(false);
            setI(0);
          }}
        >
          Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}
