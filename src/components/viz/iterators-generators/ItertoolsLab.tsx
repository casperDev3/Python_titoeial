"use client";

import { AnimatePresence, motion } from "motion/react";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Btn, ControlBar } from "../kit";
import { INK, WARN, tokenize } from "./shared";

type Tool = {
  id: string;
  code: string;
  hint: string;
  input: string[];
  output: string[];
  infinite?: boolean;
};

const TOOLS: Tool[] = [
  {
    id: "count", code: "count(10, 5)", hint: "Нескінченний лічильник з кроком.",
    input: ["start=10", "step=5"], output: ["10", "15", "20", "25", "30", "35", "40", "45"], infinite: true,
  },
  {
    id: "cycle", code: 'cycle("ABC")', hint: "Ходить по колу вічно.",
    input: ["'A'", "'B'", "'C'"], output: ["'A'", "'B'", "'C'", "'A'", "'B'", "'C'", "'A'", "'B'"], infinite: true,
  },
  {
    id: "chain", code: 'chain([1, 2], "ab", (3,))', hint: "Склеює кілька ітерабельних в один потік.",
    input: ["[1, 2]", '"ab"', "(3,)"], output: ["1", "2", "'a'", "'b'", "3"],
  },
  {
    id: "accumulate", code: "accumulate([3, 1, 4, 1, 5])", hint: "Біжуча сума (або будь-яка функція).",
    input: ["3", "1", "4", "1", "5"], output: ["3", "4", "8", "9", "14"],
  },
  {
    id: "takewhile", code: "takewhile(lambda x: x < 5, [1, 4, 6, 2])", hint: "Бере, поки умова True, і зупиняється назавжди.",
    input: ["1", "4", "6", "2"], output: ["1", "4"],
  },
  {
    id: "pairwise", code: 'pairwise("ABCD")', hint: "Сусідні пари — ідеально для різниць.",
    input: ["'A'", "'B'", "'C'", "'D'"], output: ["('A', 'B')", "('B', 'C')", "('C', 'D')"],
  },
  {
    id: "batched", code: "batched(range(7), 3)", hint: "Пачки по n (Python 3.12+).",
    input: ["0", "1", "2", "3", "4", "5", "6"], output: ["(0, 1, 2)", "(3, 4, 5)", "(6,)"],
  },
  {
    id: "groupby", code: 'groupby("aaabbc")', hint: "Групує сусідні однакові елементи.",
    input: ["'a'", "'a'", "'a'", "'b'", "'b'", "'c'"],
    output: ["('a', ['a', 'a', 'a'])", "('b', ['b', 'b'])", "('c', ['c'])"],
  },
  {
    id: "combinations", code: 'combinations("ABC", 2)', hint: "Усі пари без повторів і без врахування порядку.",
    input: ["'A'", "'B'", "'C'"], output: ["('A', 'B')", "('A', 'C')", "('B', 'C')"],
  },
  {
    id: "product", code: 'product("AB", [1, 2])', hint: "Декартів добуток — вкладені цикли в один рядок.",
    input: ['"AB"', "[1, 2]"], output: ["('A', 1)", "('A', 2)", "('B', 1)", "('B', 2)"],
  },
];

export function ItertoolsLab() {
  const [toolId, setToolId] = useState("count");
  const [taken, setTaken] = useState(0);
  const [warn, setWarn] = useState<string | null>(null);
  const tool = TOOLS.find((t) => t.id === toolId) ?? TOOLS[0];
  const finished = !tool.infinite && taken > tool.output.length;

  const choose = (id: string) => {
    setToolId(id);
    setTaken(0);
    setWarn(null);
  };

  const next = () => {
    setWarn(null);
    if (tool.infinite && taken >= tool.output.length) {
      setWarn("…і так до нескінченності. Тут показано лише перші 8.");
      return;
    }
    setTaken((v) => Math.min(v + 1, tool.output.length + 1));
  };

  const all = () => {
    if (tool.infinite) {
      setTaken(tool.output.length);
      setWarn("list() на нескінченному ітераторі ніколи не завершиться! Обмеж його: list(islice(it, 8)).");
      return;
    }
    setWarn(null);
    setTaken(tool.output.length + 1);
  };

  const shown = tool.output.slice(0, taken);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-5 pt-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => choose(t.id)}
            className="relative rounded-full px-3 py-1 font-mono text-[12px] font-semibold transition-colors"
            style={{ color: t.id === toolId ? "white" : "var(--label)" }}
          >
            {t.id === toolId && (
              <motion.span
                layoutId="itertools-chip"
                className="absolute inset-0 rounded-full"
                style={{ background: INK }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            {t.id !== toolId && <span className="absolute inset-0 rounded-full bg-separator/60" />}
            <span className="relative">{t.id}</span>
          </button>
        ))}
      </div>

      <div className="px-5 pt-4">
        <div className="overflow-x-auto rounded-2xl border border-separator bg-black/[0.035] px-3 py-2 font-mono text-[12.5px] whitespace-pre">
          {tokenize(`it = ${tool.code}`, "itl")}
          {tool.infinite && <span className="ml-2 text-label-3">  # ∞</span>}
        </div>
        <div className="mt-1.5 text-[13px] text-label-2">{tool.hint}</div>

        <div className="mt-4 text-[11px] font-semibold tracking-wide text-label-3 uppercase">вхід</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {tool.input.map((x, i) => (
            <span key={`${tool.id}-${i}`} className="rounded-lg bg-separator/50 px-2 py-1 font-mono text-[12px]">
              {x}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-label-3 uppercase">
          <span>вихід — по одному через next()</span>
        </div>
        <div className="mt-1 flex min-h-[44px] flex-wrap items-center gap-1.5">
          <AnimatePresence mode="popLayout">
            {shown.map((x, i) => (
              <motion.span
                key={`${tool.id}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.4, y: -14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 460, damping: 24 }}
                className="rounded-xl px-2.5 py-1.5 font-mono text-[12.5px] font-semibold"
                style={{
                  background: i === shown.length - 1 && !finished
                    ? INK
                    : "color-mix(in oklab, var(--accent) 14%, white)",
                  color: i === shown.length - 1 && !finished ? "white" : "var(--label)",
                }}
              >
                {x}
              </motion.span>
            ))}
            {finished && (
              <motion.span
                key="stop"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-full px-3 py-1 font-mono text-[12px] font-bold text-white"
                style={{ background: WARN }}
              >
                StopIteration
              </motion.span>
            )}
            {tool.infinite && taken >= tool.output.length && (
              <motion.span key="inf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[18px] text-label-3">
                … ∞
              </motion.span>
            )}
            {shown.length === 0 && (
              <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-label-3">
                нічого не обчислено — ітератор лінивий
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {warn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-start gap-2 rounded-2xl px-3 py-2 text-[13px]" style={{ background: "#fff7ed" }}>
                <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} style={{ color: WARN }} />
                <span>{warn}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={next} disabled={finished}>
          next(it)
        </Btn>
        <Btn onClick={all} disabled={finished}>
          list(it)
        </Btn>
        <Btn onClick={() => choose(tool.id)}>Скинути</Btn>
        <span className="ml-auto font-mono text-[12px] text-label-2 tabular-nums">видано: {shown.length}</span>
      </ControlBar>
    </div>
  );
}
