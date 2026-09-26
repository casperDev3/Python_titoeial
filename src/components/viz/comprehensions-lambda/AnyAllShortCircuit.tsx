"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";

const HP = [100, 45, 0, 80, 0, 30];
const CONDS = {
  dead: { code: "h == 0", f: (h: number) => h === 0 },
  alive: { code: "h > 0", f: (h: number) => h > 0 },
  strong: { code: "h >= 30", f: (h: number) => h >= 30 },
  valid: { code: "h >= 0", f: (h: number) => h >= 0 },
} as const;
type C = keyof typeof CONDS;
type Fn = "any" | "all";

/** Індекс, на якому any/all зупиняються (або null — дійшли до кінця). */
function stopAt(fn: Fn, c: C): number | null {
  const f = CONDS[c].f;
  const i = HP.findIndex((h) => (fn === "any" ? f(h) : !f(h)));
  return i < 0 ? null : i;
}

export function AnyAllShortCircuit() {
  const [fn, setFn] = useState<Fn>("any");
  const [c, setC] = useState<C>("dead");
  const [k, setK] = useState(0); // скільки елементів уже перевірено
  const [playing, setPlaying] = useState(false);
  const stop = stopAt(fn, c);
  const limit = stop === null ? HP.length : stop + 1;
  const finished = k >= limit;
  const result = fn === "any" ? stop !== null : stop === null;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(
      () => {
        if (k >= limit) setPlaying(false);
        else setK(k + 1);
      },
      k >= limit ? 0 : 700,
    );
    return () => clearTimeout(t);
  }, [playing, k, limit]);

  const reset = () => {
    setK(0);
    setPlaying(false);
  };

  return (
    <div>
      <ControlBar>
        <Segmented
          id="cl-anyall-fn"
          value={fn}
          onChange={(v) => {
            setFn(v);
            reset();
          }}
          options={[
            { value: "any", label: <span className="font-mono">any</span> },
            { value: "all", label: <span className="font-mono">all</span> },
          ]}
        />
        <Segmented
          id="cl-anyall-c"
          value={c}
          onChange={(v) => {
            setC(v);
            reset();
          }}
          options={(Object.keys(CONDS) as C[]).map((key) => ({
            value: key,
            label: <span className="font-mono">{CONDS[key].code}</span>,
          }))}
        />
      </ControlBar>

      <div className="mx-5 overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2 font-mono text-[13px] whitespace-nowrap thin-scroll">
        <span style={{ color: "var(--accent)" }}>{fn}</span>({CONDS[c].code} for h in hp)
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pt-4 sm:grid-cols-6">
        {HP.map((h, i) => {
          const checked = i < k;
          const val = CONDS[c].f(h);
          const isStop = finished && stop === i;
          const skipped = finished && i >= limit;
          return (
            <motion.div
              key={i}
              animate={{
                scale: isStop ? 1.08 : i === k - 1 && !finished ? 1.05 : 1,
                opacity: skipped ? 0.35 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="relative flex flex-col items-center gap-1 rounded-2xl border p-2"
              style={{
                borderColor: isStop ? "var(--accent)" : "var(--separator)",
                background: isStop ? "color-mix(in oklab, var(--accent) 14%, var(--glass-bg))" : "var(--glass-bg)",
                boxShadow: isStop ? "0 8px 24px -10px var(--accent)" : undefined,
              }}
            >
              <span className="text-[10px] font-semibold text-label-3">hp[{i}]</span>
              <span className="font-mono text-[16px] font-bold">{h}</span>
              <div className="h-[22px]">
                <AnimatePresence>
                  {checked && (
                    <motion.span
                      initial={{ opacity: 0, y: 6, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-bold text-white"
                      style={{ background: val ? "#30d158" : "#ff453a" }}
                    >
                      {val ? "True" : "False"}
                    </motion.span>
                  )}
                  {skipped && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10.5px] text-label-3"
                    >
                      не перевірено
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mx-5 mt-3 min-h-[48px] rounded-2xl bg-separator/30 px-3.5 py-2.5 text-[13.5px] leading-snug">
        <AnimatePresence mode="wait">
          <motion.div key={`${fn}-${c}-${finished}-${k}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!finished ? (
              k === 0 ? (
                fn === "any" ? (
                  "any шукає ПЕРШЕ True. Тисни «Крок»."
                ) : (
                  "all шукає ПЕРШЕ False. Тисни «Крок»."
                )
              ) : (
                `Перевірено ${k} з ${HP.length}… ${fn === "any" ? "True ще не знайдено" : "поки всі True"}.`
              )
            ) : (
              <>
                <span
                  className="mr-2 rounded-full px-2 py-0.5 font-mono text-[12px] font-bold text-white"
                  style={{ background: result ? "#30d158" : "#ff453a" }}
                >
                  {fn}(…) → {result ? "True" : "False"}
                </span>
                {stop !== null
                  ? `Зупинились на hp[${stop}]: результат уже відомий, ще ${HP.length - limit} ел. не перевірялись.`
                  : `Довелося перевірити всі ${HP.length} елементів — ${fn === "any" ? "жодного True" : "жодного False"}.`}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={() => setK((v) => Math.min(limit, v + 1))} disabled={finished}>
          Крок <ChevronRight className="size-4" />
        </Btn>
        <Btn
          onClick={() => {
            if (finished) setK(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Пауза" : "Авто"}
        </Btn>
        <Btn onClick={reset}>
          <RotateCcw className="size-4" /> Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}
