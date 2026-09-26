"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, Console, ControlBar } from "../kit";

type Entry = [string, number];
type Change = { key: string; kind: "add" | "set" | "del" } | null;
type Op = {
  code: string;
  run: (d: Entry[]) => { d: Entry[]; ret?: string; change: Change[] };
  note: string;
};

const setKey = (d: Entry[], k: string, v: number): { d: Entry[]; change: Change } => {
  const i = d.findIndex(([key]) => key === k);
  if (i >= 0) return { d: d.map((e, j) => (j === i ? [k, v] : e)), change: { key: k, kind: "set" } };
  return { d: [...d, [k, v]], change: { key: k, kind: "add" } };
};

const PROGRAM: Op[] = [
  {
    code: 'team = {"Yuji": 1, "Megumi": 2}',
    run: () => ({ d: [["Yuji", 1], ["Megumi", 2]], change: [{ key: "Yuji", kind: "add" }, { key: "Megumi", kind: "add" }] }),
    note: "створили словник з двох пар",
  },
  {
    code: 'team["Nobara"] = 3',
    run: (d) => {
      const r = setKey(d, "Nobara", 3);
      return { d: r.d, change: [r.change] };
    },
    note: "ключа не було → додали нову пару в кінець",
  },
  {
    code: 'team["Yuji"] = 100',
    run: (d) => {
      const r = setKey(d, "Yuji", 100);
      return { d: r.d, change: [r.change] };
    },
    note: "ключ уже є → перезаписали значення, позиція та сама",
  },
  {
    code: 'team.get("Toji", 0)',
    run: (d) => ({ d, ret: "0", change: [] }),
    note: "get лише читає: ключа немає → повернув default, словник не змінився",
  },
  {
    code: 'team.setdefault("Maki", 4)',
    run: (d) => {
      const r = setKey(d, "Maki", 4);
      return { d: r.d, ret: "4", change: [r.change] };
    },
    note: "setdefault: ключа немає → ДОДАВ його і повернув значення",
  },
  {
    code: 'team.pop("Megumi")',
    run: (d) => ({
      d: d.filter(([k]) => k !== "Megumi"),
      ret: String(d.find(([k]) => k === "Megumi")?.[1]),
      change: [{ key: "Megumi", kind: "del" }],
    }),
    note: "pop видаляє пару і повертає значення",
  },
  {
    code: 'team.update({"Yuji": 1, "Todo": 5})',
    run: (d) => {
      const a = setKey(d, "Yuji", 1);
      const b = setKey(a.d, "Todo", 5);
      return { d: b.d, ret: "None", change: [a.change, b.change] };
    },
    note: "update: Yuji перезаписано, Todo додано; метод повертає None",
  },
  {
    code: '"Todo" in team',
    run: (d) => ({ d, ret: String(d.some(([k]) => k === "Todo") ? "True" : "False"), change: [] }),
    note: "in перевіряє ключі за O(1)",
  },
  {
    code: "team.popitem()",
    run: (d) => ({
      d: d.slice(0, -1),
      ret: d.length ? `('${d[d.length - 1][0]}', ${d[d.length - 1][1]})` : "KeyError",
      change: d.length ? [{ key: d[d.length - 1][0], kind: "del" }] : [],
    }),
    note: "popitem вийняв ОСТАННЮ додану пару (LIFO)",
  },
];

type Snap = { d: Entry[]; ret?: string; change: Change[]; removed: Entry[] };

function simulate(step: number): Snap {
  let d: Entry[] = [];
  let snap: Snap = { d, change: [], removed: [] };
  for (let i = 0; i <= step; i++) {
    const before = d;
    const r = PROGRAM[i].run(d);
    d = r.d;
    const removed = before.filter(([k]) => r.change.some((c) => c?.key === k && c.kind === "del"));
    snap = { d, ret: r.ret, change: r.change, removed };
  }
  return snap;
}

const repr = (d: Entry[]) => "{" + d.map(([k, v]) => `'${k}': ${v}`).join(", ") + "}";

export function DictOps() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const last = PROGRAM.length - 1;
  const snap = simulate(step);

  const playing = auto && step < last;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => Math.min(last, s + 1)), 1400);
    return () => clearInterval(t);
  }, [playing, last]);

  const kindOf = (k: string) => snap.change.find((c) => c?.key === k)?.kind;
  const rows: { k: string; v: number; kind?: "add" | "set" | "del" }[] = [
    ...snap.d.map(([k, v]) => ({ k, v, kind: kindOf(k) })),
    ...snap.removed.map(([k, v]) => ({ k, v, kind: "del" as const })),
  ];

  return (
    <div>
      <div className="grid gap-3 px-4 pt-2 sm:grid-cols-[1.15fr_1fr] sm:px-5">
        {/* програма */}
        <ol className="glass !rounded-[16px] py-2 font-mono text-[12px] leading-[1.9]">
          {PROGRAM.map((op, i) => (
            <li
              key={i}
              onClick={() => setStep(i)}
              className="relative cursor-pointer px-3 transition-opacity"
              style={{ opacity: i <= step ? 1 : 0.4 }}
            >
              {i === step && (
                <motion.span
                  layoutId="dictops-cursor"
                  className="absolute inset-0 rounded-[8px]"
                  style={{ background: "color-mix(in oklab, var(--accent) 12%, white)", boxShadow: "inset 3px 0 0 var(--accent)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative mr-2 text-label-3 tabular-nums">{i + 1}</span>
              <span className="relative break-all">{op.code}</span>
            </li>
          ))}
        </ol>

        {/* стан словника */}
        <div className="glass flex flex-col !rounded-[16px] p-3">
          <div className="mb-2 flex items-center justify-between text-[12px]">
            <span className="font-mono font-semibold">team</span>
            <span className="text-label-2 tabular-nums">len = {snap.d.length}</span>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {rows.map((r) => (
                <motion.div
                  key={r.k}
                  layout
                  initial={{ opacity: 0, x: 24, scale: 0.95 }}
                  animate={{ opacity: r.kind === "del" ? 0.55 : 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="flex items-center gap-2 rounded-[12px] px-3 py-1.5 font-mono text-[13px]"
                  style={{
                    background:
                      r.kind === "add"
                        ? "color-mix(in oklab, #30d158 16%, white)"
                        : r.kind === "set"
                          ? "color-mix(in oklab, var(--accent-2) 16%, white)"
                          : r.kind === "del"
                            ? "color-mix(in oklab, #ff453a 12%, white)"
                            : "var(--glass-bg)",
                    textDecoration: r.kind === "del" ? "line-through" : "none",
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>&apos;{r.k}&apos;</span>
                  <span className="text-label-3">→</span>
                  <motion.span key={`${r.k}-${r.v}`} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-semibold">
                    {r.v}
                  </motion.span>
                  {r.kind && (
                    <span className="ml-auto text-[10px] font-sans font-semibold text-label-2">
                      {r.kind === "add" ? "нова" : r.kind === "set" ? "перезапис" : "видалено"}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ControlBar>
        <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <span className="inline-flex items-center gap-1">
            <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
            Назад
          </span>
        </Btn>
        <Btn variant="accent" onClick={() => setStep((s) => Math.min(last, s + 1))} disabled={step === last}>
          <span className="inline-flex items-center gap-1">
            Крок
            <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        </Btn>
        <Btn
          onClick={() => {
            if (playing) return setAuto(false);
            if (step === last) setStep(0);
            setAuto(true);
          }}
        >
          <span className="inline-flex items-center gap-1">
            {playing ? <Pause className="size-4" strokeWidth={1.75} aria-hidden /> : <Play className="size-4" strokeWidth={1.75} aria-hidden />}
            {playing ? "Пауза" : "Авто"}
          </span>
        </Btn>
        <Btn
          onClick={() => {
            setAuto(false);
            setStep(0);
          }}
        >
          <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Скинути</span>
        </Btn>
        <span className="ml-auto text-[12px] text-label-2 tabular-nums">
          {step + 1}/{PROGRAM.length}
        </span>
      </ControlBar>

      <Console
        lines={[
          <span key="c" className="break-all">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {PROGRAM[step].code}
          </span>,
          ...(snap.ret !== undefined ? [<span key="r" className="text-[#8fd3ff]">{snap.ret}</span>] : []),
          <span key="n" className="text-[#ffd60a]">
            # {PROGRAM[step].note}
          </span>,
          <span key="s" className="break-all text-[#8e8e93]">
            team = {repr(snap.d)}
          </span>,
        ]}
      />
    </div>
  );
}
