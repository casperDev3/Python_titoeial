"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";

const DATA = [4, 15, 7, 13, 60, 3, 8];

const EXPRS = {
  id: { code: "h", sub: (h: number) => String(h), f: (h: number) => String(h) },
  x10: { code: "h * 10", sub: (h: number) => `${h} * 10`, f: (h: number) => String(h * 10) },
  tag: { code: 'f"T{h}"', sub: (h: number) => `f"T{${h}}"`, f: (h: number) => `'T${h}'` },
} as const;
const FILTERS = {
  none: { code: "", f: () => true },
  big: { code: "if h > 5", f: (h: number) => h > 5 },
  even: { code: "if h % 2 == 0", f: (h: number) => h % 2 === 0 },
} as const;
type E = keyof typeof EXPRS;
type F = keyof typeof FILTERS;

/**
 * Кожен елемент проходить 2 фази: перевірка фільтра → обчислення виразу.
 * step = 2*i + phase.
 */
export function ComprehensionPipeline() {
  const [expr, setExpr] = useState<E>("x10");
  const [filt, setFilt] = useState<F>("big");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = DATA.length * 2;
  const idx = Math.min(DATA.length - 1, Math.floor(step / 2));
  const phase = step >= total ? 2 : step % 2; // 0 — фільтр, 1 — вираз, 2 — кінець
  const cur = DATA[idx];
  const passes = FILTERS[filt].f(cur);

  // Результат: усі елементи до поточного + поточний, якщо вже «впав» у список
  const result: { i: number; v: string }[] = [];
  const processed = step >= total ? DATA.length : idx + (phase === 1 && passes ? 1 : 0);
  for (let i = 0; i < processed; i++) {
    if (FILTERS[filt].f(DATA[i])) result.push({ i, v: EXPRS[expr].f(DATA[i]) });
  }

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(
      () => {
        if (step >= total) setPlaying(false);
        else setStep(step + 1);
      },
      step >= total ? 0 : 650,
    );
    return () => clearTimeout(t);
  }, [playing, step, total]);

  const reset = () => {
    setStep(0);
    setPlaying(false);
  };

  const fcode = FILTERS[filt].code;
  const ended = step >= total;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="cl-pipe-expr"
          value={expr}
          onChange={(v) => {
            setExpr(v);
            reset();
          }}
          options={(Object.keys(EXPRS) as E[]).map((k) => ({ value: k, label: <span className="font-mono">{EXPRS[k].code}</span> }))}
        />
        <Segmented
          id="cl-pipe-filt"
          value={filt}
          onChange={(v) => {
            setFilt(v);
            reset();
          }}
          options={(Object.keys(FILTERS) as F[]).map((k) => ({
            value: k,
            label: <span className="font-mono">{FILTERS[k].code || "без if"}</span>,
          }))}
        />
      </ControlBar>

      {/* Рядок коду, де підсвічується активна частина */}
      <div className="mx-5 overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2.5 font-mono text-[13px] whitespace-nowrap thin-scroll">
        <span className="text-label-3">[</span>
        <Part on={!ended && phase === 1 && passes}>{EXPRS[expr].code}</Part>{" "}
        <span style={{ color: "var(--accent)" }}>for</span> <Part on={false}>h</Part>{" "}
        <span style={{ color: "var(--accent)" }}>in</span> heights
        {fcode && (
          <>
            {" "}
            <Part on={!ended && phase === 0}>{fcode}</Part>
          </>
        )}
        <span className="text-label-3">]</span>
      </div>

      {/* Джерело */}
      <div className="px-5 pt-3">
        <div className="mb-1.5 text-[11px] font-bold tracking-wider text-label-3 uppercase">heights</div>
        <div className="flex flex-wrap gap-1.5">
          {DATA.map((h, i) => {
            const done = i < idx || ended;
            const active = i === idx && !ended;
            const ok = FILTERS[filt].f(h);
            return (
              <motion.div
                key={i}
                animate={{ scale: active ? 1.12 : 1, opacity: done ? 0.38 : 1, y: active ? -3 : 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                className="grid size-10 place-items-center rounded-[12px] font-mono text-[14px] font-bold"
                style={{
                  background: active ? "var(--accent)" : "var(--glass-bg)",
                  color: active ? "#fff" : "var(--label)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--separator)"}`,
                  textDecoration: done && !ok ? "line-through" : undefined,
                }}
              >
                {h}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Станції: фільтр → вираз */}
      <div className="grid grid-cols-2 gap-2 px-5 pt-3">
        <Station title="1 · Фільтр" code={fcode || "(немає — пропускаємо всіх)"} active={!ended && phase === 0}>
          {!ended && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${step}-f`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="font-mono text-[13px]"
              >
                h = {cur} →{" "}
                <b style={{ color: passes ? "#30d158" : "#ff453a" }}>{passes ? "True ✓" : "False ✗"}</b>
              </motion.div>
            </AnimatePresence>
          )}
        </Station>
        <Station title="2 · Вираз" code={EXPRS[expr].code} active={!ended && phase === 1}>
          {!ended && phase === 1 && (
            <motion.div
              key={`${step}-e`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-[13px]"
            >
              {passes ? (
                <>
                  {EXPRS[expr].sub(cur)} →{" "}
                  <b style={{ color: "var(--accent)" }}>{EXPRS[expr].f(cur)}</b>
                </>
              ) : (
                <span className="text-label-3">пропущено — вираз не обчислюється</span>
              )}
            </motion.div>
          )}
        </Station>
      </div>

      {/* Результат */}
      <div className="px-5 pt-3">
        <div className="mb-1.5 text-[11px] font-bold tracking-wider text-label-3 uppercase">
          результат · len = {result.length}
        </div>
        <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-2xl bg-separator/25 p-2 font-mono">
          <span className="text-label-3">[</span>
          <AnimatePresence initial={false}>
            {result.map((r) => (
              <motion.span
                key={`${expr}-${filt}-${r.i}`}
                layout
                initial={{ opacity: 0, y: -26, scale: 0.4 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className="rounded-[10px] px-2 py-1 text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 55%, var(--accent-2)))" }}
              >
                {r.v}
              </motion.span>
            ))}
          </AnimatePresence>
          <span className="text-label-3">]</span>
        </div>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={() => setStep((s) => Math.min(total, s + 1))} disabled={ended}>
          Крок <ChevronRight className="size-4" />
        </Btn>
        <Btn
          onClick={() => {
            if (ended) setStep(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Пауза" : "Запуск"}
        </Btn>
        <Btn onClick={reset}>
          <RotateCcw className="size-4" /> Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}

function Part({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <motion.span
      animate={{
        backgroundColor: on ? "color-mix(in oklab, var(--accent) 24%, transparent)" : "rgba(0,0,0,0)",
      }}
      className="rounded-md px-0.5"
    >
      {children}
    </motion.span>
  );
}

function Station({ title, code, active, children }: { title: string; code: string; active: boolean; children: ReactNode }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className="min-h-[92px] min-w-0 rounded-2xl border p-2.5"
      style={{
        borderColor: active ? "var(--accent)" : "var(--separator)",
        background: active ? "color-mix(in oklab, var(--accent) 9%, var(--glass-bg))" : "var(--glass-bg)",
      }}
    >
      <div className="text-[11px] font-bold tracking-wider text-label-3 uppercase">{title}</div>
      <div className="mb-1.5 truncate font-mono text-[12px] text-label-2">{code}</div>
      {children}
    </motion.div>
  );
}
