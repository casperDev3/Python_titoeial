"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Btn, ControlBar, Segmented } from "../kit";

type Scenario = "ok" | "value" | "zero";

type Step = {
  line: number;
  note: string;
  vars?: Record<string, string>;
  out?: string;
  /** Виняток, що зараз «летить» */
  exc?: string | null;
  caught?: boolean;
  crash?: boolean;
};

const RAW: Record<Scenario, string> = { ok: "4", value: "abc", zero: "0" };

const CODE = (raw: string) => [
  `raw = "${raw}"`,
  "try:",
  "    hp = int(raw)",
  "    damage = 100 // hp",
  "except ValueError:",
  '    print("не число")',
  "else:",
  '    print("удар:", damage)',
  "finally:",
  '    print("прибрали арену")',
  'print("далі")',
];

const STEPS: Record<Scenario, Step[]> = {
  ok: [
    { line: 0, note: "Готуємо вхідні дані", vars: { raw: "'4'" } },
    { line: 1, note: "Входимо в try — захист увімкнено" },
    { line: 2, note: "int('4') → 4. Все гаразд", vars: { hp: "4" } },
    { line: 3, note: "100 // 4 → 25", vars: { damage: "25" } },
    { line: 6, note: "Винятку не було → стрибаємо в else (except пропущено)" },
    { line: 7, note: "Друкуємо результат", out: "удар: 25" },
    { line: 8, note: "finally виконується завжди" },
    { line: 9, note: "Прибираємо за собою", out: "прибрали арену" },
    { line: 10, note: "Конструкція завершена — програма йде далі", out: "далі" },
  ],
  value: [
    { line: 0, note: "Готуємо вхідні дані", vars: { raw: "'abc'" } },
    { line: 1, note: "Входимо в try — захист увімкнено" },
    {
      line: 2,
      note: "int('abc') не може стати числом — 💥 виняток!",
      exc: "ValueError: invalid literal for int() with base 10: 'abc'",
    },
    { line: 4, note: "ValueError підходить під except ValueError? Так! Ловимо", caught: true, exc: "ValueError" },
    { line: 5, note: "Обробляємо помилку", out: "не число", exc: null },
    { line: 8, note: "else пропущено (виняток був). finally — завжди" },
    { line: 9, note: "Прибираємо за собою", out: "прибрали арену" },
    { line: 10, note: "Виняток оброблено — програма живе далі", out: "далі" },
  ],
  zero: [
    { line: 0, note: "Готуємо вхідні дані", vars: { raw: "'0'" } },
    { line: 1, note: "Входимо в try — захист увімкнено" },
    { line: 2, note: "int('0') → 0. Поки що все добре", vars: { hp: "0" } },
    { line: 3, note: "100 // 0 — ділення на нуль! 💥", exc: "ZeroDivisionError: division by zero" },
    { line: 4, note: "ZeroDivisionError — це ValueError? Ні. Цей except не підходить" },
    { line: 8, note: "Ніхто не зловив, але finally все одно виконується" },
    { line: 9, note: "Прибирання відбувається навіть під час аварії", out: "прибрали арену" },
    {
      line: 9,
      note: "Виняток вилітає назовні — рядок print(\"далі\") не виконається",
      crash: true,
      out: "ZeroDivisionError: division by zero",
    },
  ],
};

const LINE_H = 28;

export function TryFlow() {
  const [sc, setSc] = useState<Scenario>("value");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = STEPS[sc];
  const last = steps.length - 1;
  const cur = steps[step];
  const code = CODE(RAW[sc]);
  const running = playing && step < last;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, last)), 1100);
    return () => clearInterval(t);
  }, [running, last]);

  // Зібраний стан до поточного кроку включно
  const vars: Record<string, string> = {};
  const out: { text: string; err?: boolean }[] = [];
  const visited = new Set<number>();
  let exc: string | null = null;
  let caught = false;
  for (let i = 0; i <= step; i++) {
    const s = steps[i];
    visited.add(s.line);
    Object.assign(vars, s.vars);
    if (s.exc !== undefined) exc = s.exc;
    if (s.caught) caught = true;
    if (s.exc === null) caught = false;
    if (s.out) out.push({ text: s.out, err: s.crash });
  }
  const done = step === last;

  const choose = (v: Scenario) => {
    setSc(v);
    setStep(0);
    setPlaying(false);
  };

  return (
    <div>
      <ControlBar>
        <Segmented
          id="tryflow-sc"
          value={sc}
          onChange={choose}
          options={[
            { value: "ok", label: 'raw = "4"' },
            { value: "value", label: '"abc"' },
            { value: "zero", label: '"0"' },
          ]}
        />
        <div className="ml-auto flex gap-2">
          <Btn onClick={() => { setPlaying(false); setStep(0); }}>Скинути</Btn>
          <Btn onClick={() => { if (done) setStep(0); setPlaying((p) => !p || done); }}>
            {running ? "Пауза" : "Авто"}
          </Btn>
          <Btn variant="accent" disabled={done} onClick={() => { setPlaying(false); setStep((s) => Math.min(s + 1, last)); }}>
            Крок →
          </Btn>
        </div>
      </ControlBar>

      <div className="grid gap-3 px-5 pb-5 md:grid-cols-[1.25fr_1fr]">
        {/* Код */}
        <div className="relative overflow-hidden rounded-[18px] border border-separator bg-black/[0.03] py-2 font-mono text-[12.5px] dark:bg-white/[0.04] sm:text-[13px]">
          <motion.div
            className="absolute top-2 right-2 left-2 rounded-[10px] transition-[background-color] duration-300"
            style={{
              height: LINE_H,
              backgroundColor: exc && !caught
                ? "color-mix(in oklab, var(--accent-2) 22%, transparent)"
                : "color-mix(in oklab, var(--accent) 20%, transparent)",
            }}
            animate={{ y: cur.line * LINE_H }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
          {code.map((line, i) => {
            const seen = visited.has(i);
            const skipped = done && !seen;
            return (
              <div key={i} className="relative flex items-center gap-2.5 px-3 whitespace-pre" style={{ height: LINE_H }}>
                <span className="w-4 text-right text-[11px] text-label-3 tabular-nums">{i + 1}</span>
                <motion.span
                  className="size-1.5 shrink-0 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: seen ? "var(--accent)" : "var(--separator)" }}
                  animate={{ scale: seen ? 1 : 0.6 }}
                />
                <span className={`truncate transition-opacity ${skipped ? "text-label-3 line-through opacity-50" : ""}`}>
                  {line}
                </span>
              </div>
            );
          })}
        </div>

        {/* Стан */}
        <div className="flex min-w-0 flex-col gap-2.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sc}-${step}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="glass-tint rounded-[16px] border px-3.5 py-2.5 text-[13.5px] leading-snug"
            >
              <span className="mr-1.5 text-[11px] font-bold tracking-wider text-label-3 uppercase">
                крок {step + 1}/{steps.length}
              </span>
              {cur.note}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(vars).map(([k, v]) => (
              <motion.span
                key={k}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="pill pill-glass !px-2.5 !py-1 font-mono !text-[12px]"
              >
                {k} = {v}
              </motion.span>
            ))}
          </div>

          <AnimatePresence>
            {exc && (
              <motion.div
                key={exc}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="rounded-[14px] px-3 py-2 font-mono text-[12px] leading-snug"
                style={{
                  background: caught
                    ? "color-mix(in oklab, var(--accent) 16%, transparent)"
                    : "color-mix(in oklab, var(--accent-2) 16%, transparent)",
                  color: caught ? "var(--accent)" : "var(--accent-2)",
                }}
              >
                {caught ? "🛡️ зловлено: " : "💥 летить: "}
                {exc}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="min-h-[92px] flex-1 rounded-[16px] bg-black/80 px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed text-[#e5e5ea]">
            <div className="mb-1 text-[10px] tracking-wider text-white/40 uppercase">stdout</div>
            <AnimatePresence initial={false}>
              {out.map((o, i) => (
                <motion.div
                  key={`${sc}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`whitespace-pre-wrap ${o.err ? "text-[#ff6b61]" : ""}`}
                >
                  {o.err ? `Traceback (most recent call last): …\n${o.text}` : o.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
