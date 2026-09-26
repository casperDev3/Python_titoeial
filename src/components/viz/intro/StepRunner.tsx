"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Btn, ControlBar, Segmented } from "../kit";

type Mode = "ok" | "name" | "syntax";

type Line = {
  code: string;
  /** Що з'являється в консолі після виконання рядка */
  out?: string;
  /** Змінна, що створюється */
  set?: [string, string];
  /** Помилка під час виконання */
  error?: string;
};

const PROGRAMS: Record<Mode, { lines: Line[]; syntaxError?: { line: number; msg: string; col: number; len: number } }> = {
  ok: {
    lines: [
      { code: 'print("Академія відкрита!")', out: "Академія відкрита!" },
      { code: 'name = input("Ім\'я: ")', out: "Ім'я: Наруто", set: ["name", "'Наруто'"] },
      { code: 'rank = "генін"', set: ["rank", "'генін'"] },
      { code: 'print(name, "—", rank)', out: "Наруто — генін" },
      { code: 'print("Мрія:", "Хокаге")', out: "Мрія: Хокаге" },
    ],
  },
  name: {
    lines: [
      { code: 'print("Академія відкрита!")', out: "Академія відкрита!" },
      { code: 'name = input("Ім\'я: ")', out: "Ім'я: Наруто", set: ["name", "'Наруто'"] },
      { code: 'rank = "генін"', set: ["rank", "'генін'"] },
      {
        code: 'print(nam, "—", rank)',
        error: "NameError: name 'nam' is not defined. Did you mean: 'name'?",
      },
      { code: 'print("Мрія:", "Хокаге")', out: "Мрія: Хокаге" },
    ],
  },
  syntax: {
    lines: [
      { code: 'print("Академія відкрита!")' },
      { code: 'name = input("Ім\'я: ")' },
      { code: 'rank = "генін"' },
      { code: 'print(name, "—" rank)' },
      { code: 'print("Мрія:", "Хокаге")' },
    ],
    syntaxError: { line: 3, col: 12, len: 8, msg: "SyntaxError: invalid syntax. Perhaps you forgot a comma?" },
  },
};

type State = {
  /** pc — індекс наступного рядка до виконання */
  phase: "idle" | "compiled" | "running" | "done" | "crashed" | "syntax";
  pc: number;
};

export function StepRunner() {
  const [mode, setMode] = useState<Mode>("ok");
  const [st, setSt] = useState<State>({ phase: "idle", pc: -1 });
  const prog = PROGRAMS[mode];

  const reset = (m: Mode = mode) => {
    setMode(m);
    setSt({ phase: "idle", pc: -1 });
  };

  const step = () => {
    setSt((s) => {
      if (s.phase === "idle") {
        if (prog.syntaxError) return { phase: "syntax", pc: -1 };
        return { phase: "compiled", pc: 0 };
      }
      if (s.phase === "compiled" || s.phase === "running") {
        const line = prog.lines[s.pc];
        if (line.error) return { phase: "crashed", pc: s.pc };
        const next = s.pc + 1;
        return next >= prog.lines.length ? { phase: "done", pc: next } : { phase: "running", pc: next };
      }
      return s;
    });
  };

  const finished = st.phase === "done" || st.phase === "crashed" || st.phase === "syntax";

  // Виконані рядки: від 0 до pc-1 (для crashed — pc теж «торкнувся», але впав)
  const executed = st.phase === "compiled" || st.phase === "idle" || st.phase === "syntax" ? 0 : st.pc;
  const term: { text: string; err?: boolean }[] = [];
  const vars: [string, string][] = [];
  for (let i = 0; i < executed; i++) {
    const l = prog.lines[i];
    if (l.out) term.push({ text: l.out });
    if (l.set) vars.push(l.set);
  }
  if (st.phase === "crashed") {
    term.push({ text: "Traceback (most recent call last):", err: true });
    term.push({ text: `  File "academy.py", line ${st.pc + 1}, in <module>`, err: true });
    term.push({ text: `    ${prog.lines[st.pc].code}`, err: true });
    term.push({ text: "          ^^^", err: true });
    term.push({ text: prog.lines[st.pc].error!, err: true });
  }
  if (st.phase === "syntax" && prog.syntaxError) {
    const se = prog.syntaxError;
    term.push({ text: `  File "academy.py", line ${se.line + 1}`, err: true });
    term.push({ text: `    ${prog.lines[se.line].code}`, err: true });
    term.push({ text: `    ${" ".repeat(se.col)}${"^".repeat(se.len)}`, err: true });
    term.push({ text: se.msg, err: true });
  }

  const current = st.phase === "compiled" || st.phase === "running" || st.phase === "crashed" ? st.pc : -1;

  const phaseLabel =
    st.phase === "idle"
      ? "Готовий до запуску"
      : st.phase === "syntax"
        ? "Компіляція впала — жоден рядок не виконано"
        : st.phase === "compiled"
          ? "✓ Компіляція в байткод — ок. Виконуємо…"
          : st.phase === "running"
            ? `Виконання: рядок ${st.pc + 1}`
            : st.phase === "crashed"
              ? `Падіння на рядку ${st.pc + 1} — вище все встигло виконатися`
              : "Програма завершилась успішно";

  return (
    <div>
      <ControlBar>
        <Segmented
          id="intro-runner"
          value={mode}
          onChange={(m) => reset(m)}
          options={[
            { value: "ok", label: "Все ок" },
            { value: "name", label: "NameError" },
            { value: "syntax", label: "SyntaxError" },
          ]}
        />
        <div className="ml-auto flex gap-2">
          <Btn variant="accent" onClick={step} disabled={finished}>
            {st.phase === "idle" ? "Компілювати" : "Крок ▸"}
          </Btn>
          <Btn onClick={() => reset()}>↺</Btn>
        </div>
      </ControlBar>

      {/* Фази */}
      <div className="flex flex-wrap items-center gap-2 px-5 pb-3 text-[12px] font-semibold">
        {[
          { k: "c", label: "1 · Компіляція", on: st.phase !== "idle", bad: st.phase === "syntax" },
          { k: "r", label: "2 · Виконання", on: ["compiled", "running", "done", "crashed"].includes(st.phase), bad: st.phase === "crashed" },
        ].map((p) => (
          <motion.span
            key={p.k}
            animate={{ opacity: p.on ? 1 : 0.45 }}
            className="rounded-full px-2.5 py-1"
            style={{
              background: p.bad
                ? "rgb(255 69 58 / 0.18)"
                : p.on
                  ? "color-mix(in oklab, var(--accent) 22%, transparent)"
                  : "var(--separator)",
              color: p.bad ? "#ff453a" : "var(--label)",
            }}
          >
            {p.label}
          </motion.span>
        ))}
        <span className="text-label-2">{phaseLabel}</span>
      </div>

      <div className="grid gap-3 px-5 pb-5 md:grid-cols-[1.3fr_1fr]">
        {/* Код */}
        <div className="relative overflow-hidden rounded-2xl border border-separator py-2 font-mono text-[12.5px]" style={{ background: "var(--code-bg)" }}>
          {prog.lines.map((l, i) => {
            const isCur = i === current;
            const done = i < executed;
            const isSyntax = st.phase === "syntax" && prog.syntaxError?.line === i;
            const crashed = st.phase === "crashed" && i === st.pc;
            return (
              <div key={`${mode}-${i}`} className="relative flex items-center gap-3 px-3 py-1">
                {(isCur || isSyntax) && (
                  <motion.div
                    layoutId="intro-runner-pc"
                    className="absolute inset-x-1.5 inset-y-0 rounded-lg"
                    style={{
                      background: crashed || isSyntax ? "rgb(255 69 58 / 0.18)" : "color-mix(in oklab, var(--accent) 22%, transparent)",
                      boxShadow: crashed || isSyntax ? "inset 0 0 0 1px rgb(255 69 58 / 0.5)" : "inset 0 0 0 1px color-mix(in oklab, var(--accent) 55%, transparent)",
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative w-4 text-right text-label-3 tabular-nums">{i + 1}</span>
                <span
                  className="relative min-w-0 flex-1 truncate transition-opacity duration-300"
                  style={{ opacity: st.phase === "syntax" && !isSyntax ? 0.4 : 1 }}
                >
                  {l.code}
                </span>
                <span className="relative w-4 text-center">
                  {done ? <span style={{ color: "#30d158" }}>✓</span> : crashed || isSyntax ? <span className="text-[#ff453a]">✗</span> : null}
                </span>
              </div>
            );
          })}
        </div>

        {/* Стан */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-separator p-3" style={{ background: "var(--glass-bg)" }}>
            <div className="mb-1.5 text-[11px] font-semibold tracking-wider text-label-3 uppercase">Змінні</div>
            <div className="flex min-h-[28px] flex-wrap gap-1.5">
              <AnimatePresence initial={false}>
                {vars.length === 0 && (
                  <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12px] text-label-3">
                    порожньо
                  </motion.span>
                )}
                {vars.map(([k, v]) => (
                  <motion.span
                    key={k}
                    initial={{ opacity: 0, scale: 0.7, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="rounded-full px-2.5 py-0.5 font-mono text-[12px]"
                    style={{ background: "color-mix(in oklab, var(--accent) 18%, var(--glass-bg))" }}
                  >
                    {k} = {v}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="min-h-[120px] flex-1 rounded-2xl bg-black/80 px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
            <AnimatePresence initial={false}>
              {term.map((c, i) => (
                <motion.div
                  key={`${mode}-${i}-${c.text}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="break-words whitespace-pre-wrap"
                  style={{ color: c.err ? "#ff6961" : undefined }}
                >
                  {c.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {term.length === 0 && <div className="text-[#8e8e93]">$ python3 academy.py</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
