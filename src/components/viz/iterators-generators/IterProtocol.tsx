"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useReducer, useState } from "react";
import { Btn, ControlBar } from "../kit";
import { CodePane } from "./shared";

const VISIONS = ["бій", "угода", "петля", "перемога"];

const LOOP = [
  "it = iter(visions)",
  "while True:",
  "    try:",
  "        v = next(it)",
  "    except StopIteration:",
  "        break",
  "    print(v)",
];

type S = {
  created: boolean;
  pos: number;
  active: number;
  stopped: boolean;
  /** лічильник подій — для перезапуску анімацій */
  tick: number;
  log: string[];
};

const INIT: S = { created: false, pos: 0, active: -1, stopped: false, tick: 0, log: ["# visions — список, а не ітератор"] };

type A = { type: "iter" } | { type: "next" } | { type: "print" } | { type: "reset" } | { type: "auto" };

function reduce(s: S, a: A): S {
  switch (a.type) {
    case "reset":
      return INIT;
    case "iter":
      return {
        ...s,
        created: true,
        pos: 0,
        stopped: false,
        active: 0,
        tick: s.tick + 1,
        log: [...s.log, ">>> it = iter(visions)", "<list_iterator, index=0>"].slice(-6),
      };
    case "next": {
      if (!s.created) return s;
      if (s.pos >= VISIONS.length)
        return {
          ...s,
          stopped: true,
          active: 5,
          tick: s.tick + 1,
          log: [...s.log, ">>> next(it)", "StopIteration  # for тихо виходить"].slice(-6),
        };
      return {
        ...s,
        pos: s.pos + 1,
        active: 3,
        tick: s.tick + 1,
        log: [...s.log, ">>> next(it)", `'${VISIONS[s.pos]}'`].slice(-6),
      };
    }
    case "print":
      return { ...s, active: 6 };
    case "auto":
      if (s.stopped) return s;
      if (!s.created) return reduce(s, { type: "iter" });
      return s.active === 3 ? reduce(s, { type: "print" }) : reduce(s, { type: "next" });
  }
}

export function IterProtocol() {
  const [s, dispatch] = useReducer(reduce, INIT);
  const [auto, setAuto] = useState(false);

  // Автоматичний «for»: next → print → next → print → ... → StopIteration
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => dispatch({ type: "auto" }), 850);
    return () => clearInterval(id);
  }, [auto]);

  useEffect(() => {
    if (!auto || !s.stopped) return;
    const t = setTimeout(() => setAuto(false), 50);
    return () => clearTimeout(t);
  }, [auto, s.stopped]);

  const startFor = () => {
    dispatch({ type: "reset" });
    setAuto(true);
  };

  const exhausted = s.created && s.pos >= VISIONS.length;

  return (
    <div>
      <div className="grid gap-4 px-5 pt-2 pb-3 md:grid-cols-[1fr_minmax(0,250px)]">
        <div className="min-w-0">
          <div className="mb-2 font-mono text-[12px] text-label-2">visions = [ … ]</div>
          <div className="flex flex-wrap gap-2">
            {VISIONS.map((v, i) => {
              const done = s.created && i < s.pos;
              const next = s.created && i === s.pos;
              return (
                <div key={v} className="relative flex flex-col items-center">
                  <motion.div
                    animate={{
                      opacity: done ? 0.4 : 1,
                      scale: next ? 1.06 : 1,
                      y: done && i === s.pos - 1 ? [0, -10, 0] : 0,
                    }}
                    transition={{
                      default: { type: "spring", stiffness: 380, damping: 22 },
                      y: { type: "tween", duration: 0.45 },
                    }}
                    className="glass relative flex min-w-[64px] flex-col items-center !rounded-2xl px-3 py-2"
                    style={{
                      borderColor: next ? "var(--accent)" : undefined,
                      boxShadow: next ? "0 0 0 2px color-mix(in oklab, var(--accent) 45%, transparent)" : undefined,
                    }}
                  >
                    <span className="font-mono text-[10px] text-label-3">[{i}]</span>
                    <span className="text-[14px] font-semibold">{v}</span>
                    {done && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full text-[9px] text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                  <div className="h-7">
                    {next && (
                      <motion.div
                        layoutId="iter-bookmark"
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        className="mt-1 flex flex-col items-center text-[11px] font-bold"
                        style={{ color: "var(--accent)" }}
                      >
                        <span className="leading-none">▲</span>
                        <span className="leading-none">it</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
            {exhausted && (
              <div className="flex flex-col items-center">
                <motion.div
                  layoutId="iter-bookmark"
                  className="grid h-[54px] min-w-[44px] place-items-center rounded-2xl border-2 border-dashed px-2 text-[11px] font-bold text-label-3"
                  style={{ borderColor: "var(--separator)" }}
                >
                  кінець
                </motion.div>
              </div>
            )}
          </div>

          {/* об'єкт-ітератор */}
          <AnimatePresence mode="popLayout">
            {s.created ? (
              <motion.div
                key="it"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="mt-2 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}
              >
                <span className="text-[22px]">🔖</span>
                <div className="min-w-0 font-mono text-[12.5px]">
                  <div>
                    it → <b>list_iterator</b>
                  </div>
                  <div className="text-label-2">
                    індекс = <b className="text-label tabular-nums">{s.pos}</b>
                    {exhausted ? "  (вичерпано)" : ""}
                  </div>
                </div>
                <AnimatePresence>
                  {s.stopped && (
                    <motion.span
                      key={s.tick}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="ml-auto rounded-full px-3 py-1 font-mono text-[12px] font-bold text-white"
                      style={{ background: "#ff9f0a" }}
                    >
                      StopIteration
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 rounded-2xl border border-dashed border-separator px-4 py-3 text-[13px] text-label-2"
              >
                Ітератора ще немає. Список — це «книга», а закладку створює <code className="inline-code">iter()</code>.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="min-w-0">
          <div className="mb-2 text-[12px] font-semibold text-label-2">for v in visions — під капотом</div>
          <CodePane lines={LOOP} active={s.active} id="iterproto" tone={s.stopped ? "warn" : "accent"} />
        </div>
      </div>

      <div className="mx-5 mb-2 rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
        {s.log.map((l, i) => (
          <div key={`${s.tick}-${i}-${l}`} className={l.startsWith(">>>") ? "text-[#8e8e93]" : ""}>
            {l}
          </div>
        ))}
      </div>

      <ControlBar>
        <Btn onClick={() => dispatch({ type: "iter" })} disabled={auto}>
          iter(visions)
        </Btn>
        <Btn variant="accent" onClick={() => dispatch({ type: "next" })} disabled={!s.created || auto || s.stopped}>
          next(it)
        </Btn>
        <Btn onClick={startFor} disabled={auto}>
          ▶ for автоматом
        </Btn>
        <Btn
          onClick={() => {
            setAuto(false);
            dispatch({ type: "reset" });
          }}
        >
          Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}
