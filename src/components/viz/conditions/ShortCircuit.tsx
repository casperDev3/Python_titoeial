"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Btn, ControlBar, Segmented } from "../kit";

type Val = { repr: string; truthy: boolean };

const VALUES: Val[] = [
  { repr: "0", truthy: false },
  { repr: '"Кіра"', truthy: true },
  { repr: "None", truthy: false },
  { repr: "42", truthy: true },
  { repr: '""', truthy: false },
  { repr: "[1, 2]", truthy: true },
  { repr: "[]", truthy: false },
  { repr: "True", truthy: true },
];

type Op = "and" | "or";

export function ShortCircuit() {
  const [op, setOp] = useState<Op>("or");
  const [picks, setPicks] = useState([4, 1, 3]);
  const [run, setRun] = useState(0); // ключ для перезапуску анімації

  const vals = picks.map((p) => VALUES[p]);
  // де зупиниться обчислення
  let stop = vals.length - 1;
  for (let i = 0; i < vals.length; i++) {
    const decisive = op === "and" ? !vals[i].truthy : vals[i].truthy;
    if (decisive) {
      stop = i;
      break;
    }
  }
  const result = vals[stop];

  const cycle = (idx: number) => {
    setPicks((p) => p.map((v, i) => (i === idx ? (v + 1) % VALUES.length : v)));
    setRun((r) => r + 1);
  };

  const D = 0.45; // секунд на операнд

  return (
    <div>
      <div className="px-5 pt-2 pb-1 text-[13px] text-label-2">
        Натисни на операнд, щоб змінити значення.
      </div>
      <div key={run + op} className="flex flex-wrap items-center justify-center gap-2 px-5 py-6 sm:gap-3">
        {vals.map((v, i) => {
          const evaluated = i <= stop;
          return (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && (
                <motion.span
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: i <= stop ? 1 : 0.3 }}
                  transition={{ delay: i * D }}
                  className="font-mono text-[15px] font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  {op}
                </motion.span>
              )}
              <motion.button
                onClick={() => cycle(i)}
                whileTap={{ scale: 0.94 }}
                initial={{ opacity: 0.5, y: 0 }}
                animate={{
                  opacity: evaluated ? 1 : 0.35,
                  y: evaluated ? [0, -8, 0] : 0,
                }}
                transition={{ delay: i * D, duration: 0.45, type: "tween" }}
                className="relative flex min-w-[76px] flex-col items-center gap-1 rounded-2xl border-2 px-3 py-2.5"
                style={{
                  borderColor: evaluated ? (v.truthy ? "#30d158" : "var(--accent)") : "var(--separator)",
                  background: "var(--glass-bg)",
                  borderStyle: evaluated ? "solid" : "dashed",
                }}
              >
                <span className="font-mono text-[16px] font-semibold">{v.repr}</span>
                <span
                  className="text-[10px] font-bold tracking-wide uppercase"
                  style={{ color: evaluated ? (v.truthy ? "#30d158" : "var(--accent)") : "var(--label-3)" }}
                >
                  {evaluated ? (v.truthy ? "truthy" : "falsy") : "не обчислено"}
                </span>
                {i === stop && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * D + 0.35, type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -top-2.5 -right-2.5 grid size-6 place-items-center rounded-full text-[12px] text-white shadow"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                  >
                    ⏹
                  </motion.span>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>

      <motion.div
        key={`r-${run}-${op}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: stop * D + 0.5, type: "spring", stiffness: 300, damping: 26 }}
        className="mx-5 mb-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3 text-center text-[14px]"
        style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}
      >
        <span className="font-mono">
          result = <b style={{ color: "var(--accent)" }}>{result.repr}</b>
        </span>
        <span className="text-label-2">
          {op === "and"
            ? stop < vals.length - 1 || !result.truthy
              ? `and зупинився на першому falsy (операнд ${stop + 1})`
              : "усі truthy — and повертає останній"
            : stop < vals.length - 1 || result.truthy
              ? `or зупинився на першому truthy (операнд ${stop + 1})`
              : "усі falsy — or повертає останній"}
        </span>
      </motion.div>

      <ControlBar>
        <Segmented
          id="sc-op"
          value={op}
          onChange={(v) => {
            setOp(v);
            setRun((r) => r + 1);
          }}
          options={[
            { value: "and", label: "and" },
            { value: "or", label: "or" },
          ]}
        />
        <Btn onClick={() => setRun((r) => r + 1)}>Повторити</Btn>
        <span className="text-[12px] text-label-2">
          {op === "and" ? "and шукає перший falsy" : "or шукає перший truthy"}
        </span>
      </ControlBar>
    </div>
  );
}
