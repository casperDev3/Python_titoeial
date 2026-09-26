"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Btn, ControlBar } from "../kit";
import { GREEN, ORANGE } from "./palette";

type Item = { repr: string; truthy: boolean; why: string };

const DECK: Item[] = [
  { repr: "0", truthy: false, why: "нуль будь-якого числового типу — falsy" },
  { repr: '"0"', truthy: true, why: "непорожній рядок! Вміст не важливий" },
  { repr: "[]", truthy: false, why: "порожній список" },
  { repr: '" "', truthy: true, why: "пробіл — теж символ, рядок непорожній" },
  { repr: "None", truthy: false, why: "None завжди falsy" },
  { repr: "[0]", truthy: true, why: "список з одним елементом — непорожній" },
  { repr: "-1", truthy: true, why: "будь-яке ненульове число — truthy" },
  { repr: "{}", truthy: false, why: "порожній словник" },
  { repr: '"False"', truthy: true, why: "це рядок з 5 літер, а не bool" },
  { repr: "0.0", truthy: false, why: "float нуль — falsy" },
  { repr: "(None,)", truthy: true, why: "кортеж з одним елементом" },
  { repr: "range(0)", truthy: false, why: "порожній діапазон" },
];

type Placed = Item & { guessOk: boolean };

export function TruthySorter() {
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [last, setLast] = useState<Placed | null>(null);

  const current = DECK[idx];
  const finished = idx >= DECK.length;
  const score = placed.filter((p) => p.guessOk).length;

  const guess = (truthy: boolean) => {
    if (!current) return;
    const p = { ...current, guessOk: current.truthy === truthy };
    setPlaced((xs) => [...xs, p]);
    setLast(p);
    setIdx((i) => i + 1);
  };

  const reset = () => {
    setIdx(0);
    setPlaced([]);
    setLast(null);
  };

  const bin = (truthy: boolean) => {
    const color = truthy ? GREEN : "var(--accent)";
    return (
      <button
        onClick={() => guess(truthy)}
        disabled={finished}
        className="glass-interactive flex min-h-[150px] flex-col gap-2 rounded-[20px] border-2 border-dashed p-3 text-left transition-colors"
        style={{ borderColor: `color-mix(in oklab, ${color} 55%, transparent)`, background: `color-mix(in oklab, ${color} 6%, white)` }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold tracking-wide uppercase" style={{ color }}>
            {truthy ? "truthy" : "falsy"}
          </span>
          <span className="font-mono text-[11px] text-label-2">bool(x) is {truthy ? "True" : "False"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence>
            {placed
              .filter((p) => p.truthy === truthy)
              .map((p) => (
                <motion.span
                  key={p.repr}
                  layoutId={`ts-${p.repr}`}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="rounded-lg px-2 py-0.5 font-mono text-[12.5px]"
                  style={{
                    background: "var(--glass-bg-strong)",
                    boxShadow: p.guessOk ? `inset 0 0 0 1.5px ${color}` : `inset 0 0 0 1.5px ${ORANGE}`,
                  }}
                  title={p.why}
                >
                  {p.repr}
                  {!p.guessOk && <span className="ml-1 text-[#c45500]">!</span>}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
      </button>
    );
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-2 px-5 pt-3 pb-4">
        <div className="text-[12px] text-label-2">
          {finished ? "Готово!" : `Значення ${idx + 1} з ${DECK.length} · куди його?`}
        </div>
        <div className="grid h-[78px] place-items-center">
          <AnimatePresence mode="popLayout">
            {current ? (
              <motion.div
                key={current.repr}
                layoutId={`ts-${current.repr}`}
                initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="glass-strong glass rounded-[18px] px-6 py-3 font-mono text-[26px] font-semibold"
              >
                {current.repr}
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-[28px] font-bold" style={{ color: "var(--accent)" }}>
                  {score}/{DECK.length}
                </div>
                <div className="text-[13px] text-label-2">
                  {score === DECK.length ? "Рівень L: жодної помилки" : score >= 9 ? "Майже детектив" : "Рюк сміється. Спробуй ще"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex min-h-10 items-center justify-center text-center text-[13px]">
          <AnimatePresence mode="wait">
            {last && (
              <motion.div
                key={last.repr}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <b style={{ color: last.guessOk ? GREEN : ORANGE }}>{last.guessOk ? "Вірно" : "Ні"}</b>
                <span className="text-label-2">
                  {" "}
                  · <code className="font-mono">bool({last.repr})</code> → {last.truthy ? "True" : "False"}: {last.why}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pb-2">
        {bin(false)}
        {bin(true)}
      </div>
      <ControlBar>
        <Btn onClick={reset}>Почати знову</Btn>
        <span className="text-[12px] text-label-2">
          Вірно: <b className="text-label">{score}</b> · помаранчевим позначено помилки
        </span>
      </ControlBar>
    </div>
  );
}
