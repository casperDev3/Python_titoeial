"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, PartyPopper, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { Prose, renderInline } from "./Inline";

export function Quiz({
  question,
  options,
  answer,
  explain,
}: {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === answer;

  return (
    <div className="glass p-5 sm:p-6">
      <div className="mb-1 text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--accent)" }}>
        Перевір себе
      </div>
      <div className="mb-4 text-lg font-semibold tracking-tight">{renderInline(question, "q")}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o, i) => {
          const state = picked === null ? "idle" : i === answer ? "right" : i === picked ? "wrong" : "dim";
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPicked(i)}
              className="glass-interactive flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px]"
              style={{
                borderColor:
                  state === "right" ? "#30d158" : state === "wrong" ? "#ff453a" : "var(--separator)",
                background:
                  state === "right"
                    ? "rgb(48 209 88 / 0.12)"
                    : state === "wrong"
                      ? "rgb(255 69 58 / 0.1)"
                      : "var(--glass-bg)",
                opacity: state === "dim" ? 0.55 : 1,
              }}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-separator text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1">{renderInline(o, `o${i}`)}</span>
              {state === "right" && <CheckCircle2 className="size-5 text-[#30d158]" />}
              {state === "wrong" && <XCircle className="size-5 text-[#ff453a]" />}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl bg-separator/40 p-4">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                {correct ? <PartyPopper className="size-4 text-[#248a3d]" strokeWidth={1.75} /> : <RotateCcw className="size-4 text-[#d70015]" strokeWidth={1.75} />}
                {correct ? "Точно в ціль!" : "Майже! Ось чому:"}
              </div>
              <Prose md={explain} className="!text-[15px]" />
              {!correct && (
                <button onClick={() => setPicked(null)} className="pill pill-glass mt-3">
                  Спробувати ще раз
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
