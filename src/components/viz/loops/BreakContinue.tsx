"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Btn, ControlBar, Segmented, Slider } from "../kit";
import { CodePane } from "./CodePane";

type Stmt = "continue" | "break" | "pass";
type Ev =
  | { kind: "check"; n: number }
  | { kind: "print" | "continue" | "break"; n: number }
  | { kind: "else" }
  | { kind: "end" };

const NS = [1, 2, 3, 4, 5, 6, 7, 8];

function trace(stmt: Stmt, k: number): Ev[] {
  const ev: Ev[] = [];
  let broke = false;
  for (const n of NS) {
    ev.push({ kind: "check", n });
    if (n === k && stmt === "continue") {
      ev.push({ kind: "continue", n });
      continue;
    }
    if (n === k && stmt === "break") {
      ev.push({ kind: "break", n });
      broke = true;
      break;
    }
    ev.push({ kind: "print", n });
  }
  if (!broke) ev.push({ kind: "else" });
  ev.push({ kind: "end" });
  return ev;
}

export function BreakContinue() {
  const [stmt, setStmt] = useState<Stmt>("break");
  const [k, setK] = useState(5);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const events = trace(stmt, k);
  const done = step >= events.length;
  const running = playing && !done;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((s) => s + 1), 420);
    return () => clearTimeout(t);
  }, [running, step]);

  const shown = events.slice(0, step);
  const cur = shown[shown.length - 1];
  const outcome = new Map<number, "print" | "continue" | "break">();
  let visiting = -1;
  for (const e of shown) {
    if (e.kind === "check") visiting = e.n;
    else if (e.kind === "print" || e.kind === "continue" || e.kind === "break") outcome.set(e.n, e.kind);
  }
  const broke = shown.some((e) => e.kind === "break");
  const elseRan = shown.some((e) => e.kind === "else");
  const out: string[] = [];
  for (const e of shown) {
    if (e.kind === "print") out.push(String(e.n));
    if (e.kind === "else") out.push("else: без break");
    if (e.kind === "end") out.push("кінець");
  }

  const code = [
    "for n in range(1, 9):",
    `    if n == ${k}:`,
    `        ${stmt}`,
    "    print(n)",
    "else:",
    '    print("else: без break")',
    'print("кінець")',
  ];
  const active = cur ? (cur.kind === "check" ? 1 : cur.kind === "print" ? 3 : cur.kind === "else" ? 5 : cur.kind === "end" ? 6 : 2) : 0;

  const restart = (play = true) => {
    setStep(0);
    setPlaying(play);
  };

  return (
    <div>
      <div className="grid grid-cols-8 gap-1 px-5 pt-1 pb-4 sm:gap-2">
        {NS.map((n) => {
          const o = outcome.get(n);
          const isCur = visiting === n && !o;
          const unreached = broke && !o && n > k;
          const color =
            o === "print" ? "var(--accent)" : o === "continue" ? "#ff9f0a" : o === "break" ? "#ff453a" : "var(--separator)";
          return (
            <div key={n} className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  y: isCur ? -6 : 0,
                  scale: isCur ? 1.08 : 1,
                  opacity: unreached ? 0.3 : 1,
                  rotate: o === "continue" ? -8 : 0,
                }}
                transition={{ type: "spring", stiffness: 480, damping: 24 }}
                className="grid aspect-square w-full max-w-[56px] place-items-center rounded-[14px] border-2 font-mono text-[15px] font-bold sm:text-[18px]"
                style={{
                  borderColor: isCur ? "var(--accent-2)" : color,
                  background: o === "print" ? "color-mix(in oklab, var(--accent) 18%, var(--glass-bg))" : "var(--glass-bg)",
                  textDecoration: o === "continue" ? "line-through" : "none",
                }}
              >
                {n}
              </motion.div>
              <span className="h-3 text-[9px] font-semibold tracking-wide uppercase sm:text-[10px]" style={{ color }}>
                {o === "print" ? "print" : o === "continue" ? "skip" : o === "break" ? "break" : unreached ? "—" : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 px-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <CodePane id="brk" lines={code} active={active} muted={stmt === "pass" ? [1, 2] : []} />
        <div className="flex flex-col gap-2">
          <div
            className="flex items-center gap-2 rounded-2xl border-2 px-3 py-2 text-[13px] transition-colors duration-300"
            style={{
              borderColor: elseRan ? "#30d158" : broke ? "#ff453a" : "var(--separator)",
            }}
          >
            <span className="font-mono font-bold">else</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={elseRan ? "y" : broke ? "n" : "w"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-label-2"
              >
                {elseRan ? "виконано — циклу ніхто не перервав" : broke ? "пропущено — був break" : "чекає кінця циклу…"}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="min-h-[92px] flex-1 rounded-2xl bg-black/80 px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
            <div className="text-[10px] tracking-wider text-white/40 uppercase">stdout</div>
            <div className="flex flex-wrap gap-x-2">
              {out.map((l, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>
                  {l}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ControlBar>
        <Segmented
          id="brk-stmt"
          value={stmt}
          onChange={(v) => {
            setStmt(v);
            restart(true);
          }}
          options={[
            { value: "break", label: "break" },
            { value: "continue", label: "continue" },
            { value: "pass", label: "pass" },
          ]}
        />
        <Slider
          label="спрацює при n =="
          value={k}
          min={1}
          max={8}
          onChange={(v) => {
            setK(v);
            restart(false);
          }}
        />
        <Btn
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.min(s + 1, events.length));
          }}
          disabled={done}
        >
          Крок
        </Btn>
        <Btn variant="accent" onClick={() => restart()}>
          Запустити
        </Btn>
      </ControlBar>
    </div>
  );
}
