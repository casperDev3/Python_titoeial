"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Btn, ControlBar, Segmented, Slider } from "../kit";
import { INK } from "./shared";

type Node = {
  id: number;
  n: number;
  /** порядок виклику */
  order: number;
  hit: boolean;
  parent: number | null;
  x: number;
  depth: number;
};

function buildTree(n: number, cached: boolean) {
  const nodes: Node[] = [];
  const memo = new Set<number>();
  let order = 0;
  let leafX = 0;

  const visit = (k: number, parent: number | null, depth: number): number => {
    const id = nodes.length;
    const node: Node = { id, n: k, order: order++, hit: false, parent, x: 0, depth };
    nodes.push(node);
    if (cached && memo.has(k)) {
      node.hit = true;
      node.x = leafX++;
      return id;
    }
    if (k < 2) {
      node.x = leafX++;
    } else {
      const a = visit(k - 1, id, depth + 1);
      const b = visit(k - 2, id, depth + 1);
      node.x = (nodes[a].x + nodes[b].x) / 2;
    }
    if (cached) memo.add(k);
    return id;
  };
  visit(n, null, 0);
  const maxDepth = Math.max(...nodes.map((d) => d.depth));
  return { nodes, width: Math.max(leafX, 1), maxDepth };
}

export function FibCacheTree() {
  const [n, setN] = useState(6);
  const [mode, setMode] = useState<"plain" | "cache">("plain");
  const [replay, setReplay] = useState(0);
  const cached = mode === "cache";

  const { nodes, width, maxDepth } = useMemo(() => buildTree(n, cached), [n, cached]);
  const calls = nodes.length;
  const hits = nodes.filter((d) => d.hit).length;
  const computed = calls - hits;
  // скільки разів рахувався найпопулярніший виклик
  const dup = nodes.filter((d) => d.n === 2 && !d.hit).length;

  const STEP_X = 34;
  const STEP_Y = 46;
  const R = 13;
  const W = width * STEP_X + 10;
  const H = (maxDepth + 1) * STEP_Y + 10;
  const px = (d: Node) => 5 + d.x * STEP_X + STEP_X / 2;
  const py = (d: Node) => 5 + d.depth * STEP_Y + STEP_Y / 2 - 6;
  const delay = (d: Node) => Math.min(d.order * (cached ? 0.12 : 0.045), 3);

  return (
    <div>
      <ControlBar>
        <Segmented
          id="fib-mode"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setReplay((r) => r + 1);
          }}
          options={[
            { value: "plain", label: "без кешу" },
            { value: "cache", label: "@lru_cache" },
          ]}
        />
        <Slider
          label="n у fib(n)"
          value={n}
          min={2}
          max={7}
          onChange={(v) => {
            setN(v);
            setReplay((r) => r + 1);
          }}
        />
      </ControlBar>

      <div className="px-5">
        <div className="thin-scroll overflow-x-auto rounded-2xl border border-separator bg-black/[0.02] dark:bg-white/[0.03]">
          <svg
            key={`${n}-${mode}-${replay}`}
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto block"
            style={{ width: W * 0.85, height: H * 0.85 }}
            preserveAspectRatio="xMidYMid meet"
          >
            {nodes.map((d) =>
              d.parent === null ? null : (
                <motion.line
                  key={`e-${d.id}`}
                  x1={px(nodes[d.parent])}
                  y1={py(nodes[d.parent])}
                  x2={px(d)}
                  y2={py(d)}
                  stroke="var(--separator)"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: delay(d), duration: 0.25 }}
                />
              ),
            )}
            {nodes.map((d) => {
              const leaf = d.n < 2 && !d.hit;
              const fill = d.hit
                ? "var(--accent)"
                : d.n === 2 && !cached
                  ? "color-mix(in oklab, #ff453a 22%, var(--bg-elevated))"
                  : "var(--bg-elevated)";
              return (
                <motion.g
                  key={`n-${d.id}`}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay(d), type: "spring", stiffness: 500, damping: 24 }}
                >
                  <circle
                    cx={px(d)}
                    cy={py(d)}
                    r={R}
                    fill={fill}
                    stroke={d.hit ? INK : leaf ? "var(--label-3)" : "var(--accent-2)"}
                    strokeWidth={d.parent === null ? 2.5 : 1.5}
                  />
                  <text
                    x={px(d)}
                    y={py(d) + 3.5}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="ui-monospace, monospace"
                    fontWeight={700}
                    fill={d.hit ? "#1c1c1e" : "var(--label)"}
                  >
                    {d.n}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pt-3 text-center">
        <Stat label="викликів функції" value={calls} />
        <Stat label="реально обчислено" value={computed} />
        <Stat label={cached ? "влучань у кеш" : "fib(2) рахувалась"} value={cached ? hits : dup} accent={cached} />
      </div>
      <div className="px-5 pt-2 text-[12.5px] text-label-2">
        {cached
          ? "Кожне fib(k) рахується рівно один раз, повтори миттєво беруться з кешу — дерево стискається до лінії."
          : "Червоні вузли — fib(2), що перераховується знову і знову. Кількість викликів росте як ~1.6ⁿ."}
      </div>

      <ControlBar>
        <Btn onClick={() => setReplay((r) => r + 1)}>↻ Анімувати ще раз</Btn>
        <span className="ml-auto font-mono text-[12px] text-label-2">
          fib({n}) = <b className="text-label">{fib(n)}</b>
        </span>
      </ControlBar>
    </div>
  );
}

function fib(n: number): number {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="glass !rounded-2xl px-2 py-2">
      <motion.div
        key={value}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 20 }}
        className="font-mono text-[20px] font-bold tabular-nums"
        style={{ color: accent ? INK : "var(--label)" }}
      >
        {value}
      </motion.div>
      <div className="text-[10.5px] leading-tight text-label-2">{label}</div>
    </div>
  );
}
