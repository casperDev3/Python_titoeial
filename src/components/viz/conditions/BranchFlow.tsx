"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Btn, ControlBar, Slider } from "../kit";
import { CodePane } from "./CodePane";

type Branch = { cond: string; test: (s: number) => boolean; grade: string; line: number };

const BRANCHES: Branch[] = [
  { cond: "score >= 90", test: (s) => s >= 90, grade: "A", line: 1 },
  { cond: "score >= 75", test: (s) => s >= 75, grade: "B", line: 3 },
  { cond: "score >= 60", test: (s) => s >= 60, grade: "C", line: 5 },
  { cond: "else", test: () => true, grade: "F", line: 7 },
];

const CODE = [
  "score = {s}",
  "if score >= 90:",
  '    grade = "A"',
  "elif score >= 75:",
  '    grade = "B"',
  "elif score >= 60:",
  '    grade = "C"',
  "else:",
  '    grade = "F"',
];

type Ev = { kind: "check"; i: number; ok: boolean } | { kind: "run"; i: number };

function trace(score: number): Ev[] {
  const ev: Ev[] = [];
  for (let i = 0; i < BRANCHES.length; i++) {
    const ok = BRANCHES[i].test(score);
    if (i < BRANCHES.length - 1) ev.push({ kind: "check", i, ok });
    if (ok) {
      ev.push({ kind: "run", i });
      break;
    }
  }
  return ev;
}

export function BranchFlow() {
  const [score, setScore] = useState(78);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const events = useMemo(() => trace(score), [score]);
  const done = step >= events.length;

  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(() => setStep((s) => s + 1), 750);
    return () => clearTimeout(t);
  }, [playing, done, step]);

  const shown = events.slice(0, step);
  const last = shown[shown.length - 1];
  const winner = events[events.length - 1].i;

  // стан кожної гілки для поточного кроку
  const stateOf = (i: number): "idle" | "true" | "false" | "run" | "skip" => {
    if (shown.some((e) => e.kind === "run" && e.i === i)) return "run";
    const c = shown.find((e) => e.kind === "check" && e.i === i);
    if (c && c.kind === "check") return c.ok ? "true" : "false";
    if (done && i > winner) return "skip";
    return "idle";
  };

  const activeLine = !last ? 0 : last.kind === "check" ? BRANCHES[last.i].line : BRANCHES[last.i].line + 1;
  const muted = done
    ? BRANCHES.flatMap((b, i) => (i === winner ? [] : [b.line + 1]))
    : [];

  const code = CODE.map((l, i) => (i === 0 ? l.replace("{s}", String(score)) : l));

  return (
    <div>
      <div className="grid gap-4 px-5 pb-2 md:grid-cols-[1fr_minmax(0,300px)]">
        <div className="flex flex-col gap-2">
          {BRANCHES.map((b, i) => {
            const st = stateOf(i);
            const color =
              st === "run" || st === "true"
                ? "#30d158"
                : st === "false"
                  ? "var(--accent)"
                  : "var(--separator)";
            return (
              <motion.div
                key={b.cond}
                layout
                animate={{ opacity: st === "skip" ? 0.4 : 1, scale: st === "run" ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="flex items-center gap-3 rounded-2xl border px-3 py-2.5"
                style={{
                  borderColor: color,
                  background:
                    st === "run"
                      ? "color-mix(in oklab, #30d158 14%, var(--glass-bg))"
                      : "var(--glass-bg)",
                }}
              >
                <span
                  className="grid size-8 shrink-0 rotate-45 place-items-center rounded-[8px] border-2 transition-colors duration-300"
                  style={{ borderColor: color }}
                >
                  <span className="-rotate-45 text-[11px] font-bold">{i < 3 ? "?" : "↳"}</span>
                </span>
                <code className="min-w-0 flex-1 truncate font-mono text-[13px]">
                  {i === 0 ? "if " : i < 3 ? "elif " : ""}
                  {b.cond}:
                </code>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={st}
                    initial={{ opacity: 0, y: 6, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      color: st === "idle" ? "var(--label-3)" : st === "skip" ? "var(--label-2)" : "white",
                      background:
                        st === "true" || st === "run"
                          ? "#30d158"
                          : st === "false"
                            ? "var(--accent)"
                            : "transparent",
                    }}
                  >
                    {st === "idle" && "очікує"}
                    {st === "true" && "True"}
                    {st === "false" && "False"}
                    {st === "run" && `grade = "${b.grade}"`}
                    {st === "skip" && "пропущено"}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            );
          })}
          <div className="mt-1 flex h-9 items-center gap-2 text-[14px]">
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-label-2">Результат:</span>
                  <span
                    className="rounded-xl px-3 py-1 font-mono text-[15px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                  >
                    grade = &quot;{BRANCHES[winner].grade}&quot;
                  </span>
                  <span className="text-[12px] text-label-2">
                    перевірок: {events.filter((e) => e.kind === "check").length}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <CodePane id="branch-flow" lines={code} active={activeLine} muted={muted} />
      </div>
      <ControlBar>
        <Slider
          label="score"
          value={score}
          min={0}
          max={100}
          onChange={(v) => {
            setScore(v);
            setStep(0);
            setPlaying(false);
          }}
        />
        <div className="flex gap-2">
          <Btn onClick={() => setStep((s) => Math.min(s + 1, events.length))} disabled={done}>
            Крок
          </Btn>
          <Btn
            variant="accent"
            onClick={() => {
              if (done) setStep(0);
              setPlaying(true);
            }}
          >
            {done ? "Ще раз" : playing ? "Виконується…" : "Виконати"}
          </Btn>
          <Btn
            onClick={() => {
              setStep(0);
              setPlaying(false);
            }}
          >
            Скинути
          </Btn>
        </div>
      </ControlBar>
    </div>
  );
}
