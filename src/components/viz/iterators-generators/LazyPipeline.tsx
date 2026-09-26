"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Btn, ControlBar, Segmented, Slider } from "../kit";

type Mode = "eager" | "lazy";
type Ev = { x: number; stage: 1 | 2 | 3 };

const TAKE = 3;

function buildEvents(mode: Mode, n: number): Ev[] {
  const ev: Ev[] = [];
  if (mode === "eager") {
    for (let x = 1; x <= n; x++) ev.push({ x, stage: 1 });
    for (let x = 1; x <= n; x++) ev.push({ x, stage: 2 });
    let got = 0;
    for (let x = 1; x <= n && got < TAKE; x++)
      if ((x * x) % 2 === 0) {
        ev.push({ x, stage: 3 });
        got++;
      }
  } else {
    let got = 0;
    for (let x = 1; x <= n && got < TAKE; x++) {
      ev.push({ x, stage: 1 });
      ev.push({ x, stage: 2 });
      if ((x * x) % 2 === 0) {
        ev.push({ x, stage: 3 });
        got++;
      }
    }
  }
  return ev;
}

const CODE: Record<Mode, string[]> = {
  eager: [
    "sq = [x * x for x in range(1, N + 1)]",
    "ev = [s for s in sq if s % 2 == 0]",
    "result = ev[:3]",
  ],
  lazy: [
    "sq = (x * x for x in range(1, N + 1))",
    "ev = (s for s in sq if s % 2 == 0)",
    "result = list(islice(ev, 3))",
  ],
};

const HEAD = ["x", "x * x", "парне?", "результат"];

export function LazyPipeline() {
  const [mode, setMode] = useState<Mode>("lazy");
  const [n, setN] = useState(10);
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(false);

  const events = useMemo(() => buildEvents(mode, n), [mode, n]);
  const total = events.length;

  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setT((v) => (v >= total ? v : v + 1)), 190);
    return () => clearInterval(id);
  }, [play, total]);

  useEffect(() => {
    if (!play || t < total) return;
    const id = setTimeout(() => setPlay(false), 0);
    return () => clearTimeout(id);
  }, [play, t, total]);

  const done = useMemo(() => {
    const m = new Map<string, number>();
    events.slice(0, t).forEach((e, i) => m.set(`${e.x}-${e.stage}`, i));
    return m;
  }, [events, t]);
  const cur = t > 0 ? events[t - 1] : null;

  const opsMap = events.slice(0, t).filter((e) => e.stage === 1).length;
  const opsFilter = events.slice(0, t).filter((e) => e.stage === 2).length;
  const results = events.slice(0, t).filter((e) => e.stage === 3).map((e) => e.x * e.x);

  // скільки елементів одночасно тримаємо в пам'яті
  const inMemory =
    mode === "lazy"
      ? t > 0 && t < total
        ? 1
        : 0
      : cur?.stage === 1
        ? opsMap
        : cur
          ? n + events.slice(0, t).filter((e) => e.stage === 2 && (e.x * e.x) % 2 === 0).length
          : 0;

  const reset = (m: Mode = mode, nn: number = n) => {
    setPlay(false);
    setT(0);
    if (m !== mode) setMode(m);
    if (nn !== n) setN(nn);
  };

  const activeLine = !cur ? -1 : cur.stage - 1;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="lazy-mode"
          value={mode}
          onChange={(m) => reset(m)}
          options={[
            { value: "eager", label: "Список (жадібно)" },
            { value: "lazy", label: "Генератор (ліниво)" },
          ]}
        />
        <Slider label="N — розмір range" value={n} min={6} max={14} onChange={(v) => reset(mode, v)} />
      </ControlBar>

      <div className="mx-5 overflow-x-auto rounded-2xl border border-separator bg-black/[0.035] py-2 font-mono text-[11.5px] leading-[1.7] sm:text-[12.5px] dark:bg-white/[0.04]">
        {CODE[mode].map((l, i) => (
          <div key={l} className="relative px-3 whitespace-pre">
            {i === activeLine && (
              <motion.span
                layoutId="lazy-line"
                className="absolute inset-0 rounded-md"
                style={{
                  background: "color-mix(in oklab, var(--accent) 16%, transparent)",
                  boxShadow: "inset 3px 0 0 var(--accent)",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{l}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 px-5 pt-3 md:grid-cols-[1fr_200px]">
        <div className="min-w-0">
          <div className="grid grid-cols-4 gap-1 pb-1 text-center text-[11px] font-semibold text-label-2">
            {HEAD.map((h) => (
              <div key={h}>{h}</div>
            ))}
          </div>
          <div className="space-y-1">
            {Array.from({ length: n }, (_, k) => k + 1).map((x) => {
              const sq = x * x;
              const even = sq % 2 === 0;
              return (
                <div key={x} className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map((col) => {
                    const stage = col === 0 ? 1 : col;
                    const touched = done.has(`${x}-${stage}`);
                    const isCur = !!cur && cur.x === x && (cur.stage === stage || (col === 0 && cur.stage === 1));
                    let label = "";
                    if (col === 0) label = String(x);
                    else if (touched) label = col === 0 ? String(x) : col === 1 ? String(sq) : col === 2 ? (even ? "✓" : "✗") : String(sq);
                    const failed = col === 2 && touched && !even;
                    const isResult = col === 3 && touched;
                    return (
                      <motion.div
                        key={col}
                        animate={{
                          scale: isCur ? 1.08 : 1,
                          opacity: touched ? (failed ? 0.55 : 1) : 0.4,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 26 }}
                        className="grid h-[22px] place-items-center rounded-lg font-mono text-[12px] font-semibold tabular-nums"
                        style={{
                          background: isResult
                            ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                            : touched
                              ? "color-mix(in oklab, var(--accent) 15%, transparent)"
                              : "transparent",
                          color: isResult ? "white" : failed ? "var(--label-3)" : "var(--label)",
                          border: touched ? "1px solid transparent" : "1px dashed var(--separator)",
                          boxShadow: isCur ? "0 0 0 2px var(--accent)" : "none",
                        }}
                      >
                        {label}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid content-start gap-2 text-[13px]">
          <Stat label="обчислено x * x" value={opsMap} of={n} />
          <Stat label="перевірок на парність" value={opsFilter} of={n} />
          <div className="glass !rounded-2xl px-3 py-2.5">
            <div className="text-[11px] font-semibold text-label-2">{"у пам'яті одночасно"}</div>
            <div className="mt-1 flex items-end gap-1">
              {Array.from({ length: n + Math.floor(n / 2) }, (_, k) => (
                <motion.span
                  key={k}
                  animate={{ height: k < inMemory ? 22 : 6, opacity: k < inMemory ? 1 : 0.3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                  className="w-full rounded-sm"
                  style={{ background: k < inMemory ? "var(--accent-2)" : "var(--separator)" }}
                />
              ))}
            </div>
            <div className="mt-1 font-mono text-[12px] tabular-nums">{inMemory} ел.</div>
          </div>
          <div className="rounded-2xl px-3 py-2.5 font-mono text-[12.5px]"
            style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
            result = [{results.join(", ")}]
          </div>
        </div>
      </div>

      <ControlBar>
        <Btn
          variant="accent"
          onClick={() => {
            if (t >= total) setT(0);
            setPlay((p) => !p);
          }}
        >
          {play ? "❚❚ Пауза" : t >= total ? "↻ Ще раз" : "▶ Запустити"}
        </Btn>
        <Btn onClick={() => setT((v) => Math.min(total, v + 1))} disabled={play || t >= total}>
          Крок
        </Btn>
        <Btn onClick={() => reset()}>Скинути</Btn>
        <span className="ml-auto text-[12px] text-label-2 tabular-nums">
          операцій: <b className="text-label">{t}</b> / {total}
        </span>
      </ControlBar>
    </div>
  );
}

function Stat({ label, value, of }: { label: string; value: number; of: number }) {
  return (
    <div className="glass !rounded-2xl px-3 py-2.5">
      <div className="text-[11px] font-semibold text-label-2">{label}</div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-separator">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--accent)" }}
          animate={{ width: `${(value / of) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      <div className="mt-1 font-mono text-[12px] tabular-nums">
        {value} / {of}
      </div>
    </div>
  );
}
