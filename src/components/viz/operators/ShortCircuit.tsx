"use client";

import { Moon, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Btn, Console, ControlBar, Segmented } from "../kit";

type PyVal = { id: string; repr: string; truthy: boolean };

const VALUES: PyVal[] = [
  { id: "0", repr: "0", truthy: false },
  { id: "empty", repr: '""', truthy: false },
  { id: "list", repr: "[]", truthy: false },
  { id: "none", repr: "None", truthy: false },
  { id: "false", repr: "False", truthy: false },
  { id: "5", repr: "5", truthy: true },
  { id: "hero", repr: '"Генос"', truthy: true },
  { id: "true", repr: "True", truthy: true },
];

type Op = "and" | "or";
/** 0 — нічого, 1 — оцінили лівий, 2 — вирішили долю правого, 3 — результат */
type Stage = 0 | 1 | 2 | 3;

const spring = { type: "spring" as const, stiffness: 360, damping: 28 };

export function ShortCircuit() {
  const [op, setOp] = useState<Op>("or");
  const [left, setLeft] = useState<PyVal>(VALUES[0]);
  const [right, setRight] = useState<PyVal>(VALUES[6]);
  const [stage, setStage] = useState<Stage>(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  // and: хибний лівий вирішує все. or: істинний лівий вирішує все.
  const shortCircuit = op === "and" ? !left.truthy : left.truthy;
  const result = shortCircuit ? left : right;

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const resetWith = (fn: () => void) => {
    clearTimers();
    fn();
    setStage(0);
  };

  const play = () => {
    clearTimers();
    setStage(1);
    timers.current.push(window.setTimeout(() => setStage(2), 750));
    timers.current.push(window.setTimeout(() => setStage(3), 1500));
  };

  const step = () => {
    clearTimers();
    setStage((s) => (s >= 3 ? 0 : ((s + 1) as Stage)));
  };

  const rightSkipped = stage >= 2 && shortCircuit;
  const rightEvaluated = stage >= 2 && !shortCircuit;

  const explain = (() => {
    if (stage === 0) return "Натисни «Удар», щоб Python обчислив вираз зліва направо.";
    if (stage === 1)
      return `Лівий операнд ${left.repr} — ${left.truthy ? "truthy ✓" : "falsy ✗"}.`;
    if (stage === 2)
      return shortCircuit
        ? op === "and"
          ? "and вже знає відповідь: хибне зліва робить увесь вираз хибним. Правий операнд пропущено!"
          : "or вже знає відповідь: істинне зліва — цього досить. Правий операнд пропущено!"
        : `Лівий операнд не вирішує справу — обчислюємо правий: ${right.repr} (${right.truthy ? "truthy" : "falsy"}).`;
    return `Результат — сам операнд ${result.repr}, а не True/False.`;
  })();

  return (
    <div>
      <div className="relative mx-5 mt-1 overflow-hidden rounded-[20px] border border-separator px-3 py-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "color-mix(in oklab, var(--accent) 6%, white)" }}
        />
        <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Operand val={left} active={stage >= 1} highlight={stage >= 3 && shortCircuit} />
          <motion.span
            layout
            className="rounded-full px-3 py-1 font-mono text-[16px] font-bold"
            style={{ background: "color-mix(in oklab, var(--accent-2) 12%, white)", color: "color-mix(in oklab, var(--accent-2) 85%, black)" }}
          >
            {op}
          </motion.span>
          <Operand
            val={right}
            active={rightEvaluated}
            skipped={rightSkipped}
            highlight={stage >= 3 && !shortCircuit}
          />
        </div>

        <div className="relative mt-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {stage >= 3 ? (
              <motion.div
                key="res"
                initial={{ scale: 0.6, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="flex items-center gap-2 rounded-2xl px-4 py-2 font-mono text-[15px] font-bold text-label shadow-sm"
                style={{ background: "color-mix(in oklab, var(--accent) 22%, white)", border: "1.5px solid var(--accent)" }}
              >
                → {result.repr}
              </motion.div>
            ) : (
              <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[38px]" />
            )}
          </AnimatePresence>
        </div>

        <p className="relative mt-3 min-h-[40px] text-center text-[13.5px] text-label-2">{explain}</p>
      </div>

      <div className="grid gap-3 px-5 pt-4 sm:grid-cols-2">
        <Picker title="Лівий операнд" value={left} onPick={(v) => resetWith(() => setLeft(v))} />
        <Picker title="Правий операнд" value={right} onPick={(v) => resetWith(() => setRight(v))} />
      </div>

      <ControlBar>
        <Segmented
          id="sc-op"
          value={op}
          onChange={(v) => resetWith(() => setOp(v))}
          options={[
            { value: "and", label: "and" },
            { value: "or", label: "or" },
          ]}
        />
        <Btn variant="accent" onClick={play}>
          <Zap className="size-4" strokeWidth={1.75} /> Удар
        </Btn>
        <Btn onClick={step}>Крок {stage}/3</Btn>
      </ControlBar>
      <Console
        lines={[
          <span key="c">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {left.repr} {op} {right.repr}
          </span>,
          <span key="r" className={stage >= 3 ? "text-[#ffd60a]" : "text-[#8e8e93]"}>
            {stage >= 3 ? result.repr.replace(/"/g, "'") : "…"}
          </span>,
          <span key="b" className="text-[#8e8e93]">
            # bool(результат) = {result.truthy ? "True" : "False"}; правий операнд {shortCircuit ? "не обчислювався" : "обчислено"}
          </span>,
        ]}
      />
    </div>
  );
}

function Operand({
  val,
  active,
  skipped,
  highlight,
}: {
  val: PyVal;
  active: boolean;
  skipped?: boolean;
  highlight?: boolean;
}) {
  return (
    <motion.div
      layout
      animate={{
        scale: highlight ? 1.12 : active ? 1.04 : 1,
        opacity: skipped ? 0.35 : 1,
        rotate: skipped ? -4 : 0,
      }}
      transition={spring}
      className="relative flex min-w-[92px] flex-col items-center rounded-[18px] px-4 py-3"
      style={{
        background: highlight
          ? "color-mix(in oklab, var(--accent) 22%, white)"
          : "var(--glass-bg-strong)",
        border: `1.5px solid ${
          highlight ? "var(--accent)" : active ? "color-mix(in oklab, var(--accent) 60%, var(--label))" : "var(--separator)"
        }`,
      }}
    >
      <span className="font-mono text-[17px] font-bold">{val.repr}</span>
      <span className="mt-1 h-4 text-[11px] font-semibold">
        {active && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: val.truthy ? "#248a3d" : "#d70015" }}
          >
            {val.truthy ? "truthy" : "falsy"}
          </motion.span>
        )}
        {skipped && (
          <span className="inline-flex items-center gap-1 text-label-2">
            <Moon className="size-3" strokeWidth={1.75} /> пропущено
          </span>
        )}
      </span>
    </motion.div>
  );
}

function Picker({ title, value, onPick }: { title: string; value: PyVal; onPick: (v: PyVal) => void }) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-semibold text-label-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {VALUES.map((v) => (
          <button
            key={v.id}
            onClick={() => onPick(v)}
            className="rounded-full px-2.5 py-1 font-mono text-[12.5px] font-semibold transition-colors"
            style={{
              background:
                v.id === value.id
                  ? "color-mix(in oklab, var(--accent) 24%, white)"
                  : "color-mix(in oklab, var(--label) 6%, transparent)",
              boxShadow: v.id === value.id ? "inset 0 0 0 1.5px var(--accent)" : "none",
            }}
          >
            {v.repr}
          </button>
        ))}
      </div>
    </div>
  );
}
