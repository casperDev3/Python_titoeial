"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Console } from "../kit";

const CREW = ["Luffy", "Zoro", "Nami", "Usopp", "Sanji"];
const EMOJI = ["👒", "⚔️", "🍊", "🎯", "🍳"];

type Target = { name: string; star?: boolean };
type Pattern = { id: string; targets: Target[] };

const PATTERNS: Pattern[] = [
  { id: "all", targets: ["a", "b", "c", "d", "e"].map((name) => ({ name })) },
  { id: "head", targets: [{ name: "captain" }, { name: "rest", star: true }] },
  { id: "ends", targets: [{ name: "first" }, { name: "mid", star: true }, { name: "last" }] },
  { id: "tail", targets: [{ name: "init", star: true }, { name: "last" }] },
  { id: "skip", targets: [{ name: "_" }, { name: "zoro" }, { name: "_", star: true }] },
  { id: "few", targets: [{ name: "a" }, { name: "b" }] },
  { id: "many", targets: ["a", "b", "c", "d", "e", "f"].map((name) => ({ name })) },
];

type Result =
  | { ok: true; groups: { target: Target; idx: number[] }[] }
  | { ok: false; error: string };

/** Та сама логіка, що й у CPython: одна зірочка «добирає» все зайве. */
function unpack(targets: Target[], n: number): Result {
  const starAt = targets.findIndex((t) => t.star);
  if (starAt < 0) {
    if (targets.length < n) return { ok: false, error: `ValueError: too many values to unpack (expected ${targets.length})` };
    if (targets.length > n)
      return { ok: false, error: `ValueError: not enough values to unpack (expected ${targets.length}, got ${n})` };
    return { ok: true, groups: targets.map((t, i) => ({ target: t, idx: [i] })) };
  }
  const fixed = targets.length - 1;
  if (fixed > n)
    return { ok: false, error: `ValueError: not enough values to unpack (expected at least ${fixed}, got ${n})` };
  const groups = targets.map((t, i) => {
    if (i < starAt) return { target: t, idx: [i] };
    if (i === starAt) return { target: t, idx: Array.from({ length: n - fixed }, (_, k) => starAt + k) };
    const back = targets.length - i; // 1..after
    return { target: t, idx: [n - back] };
  });
  return { ok: true, groups };
}

const lhs = (p: Pattern) => p.targets.map((t) => (t.star ? "*" : "") + t.name).join(", ");

const W = 420;
const CHIP = 66;
const CGAP = 10;
const chipX = (i: number) => (W - (CHIP * CREW.length + CGAP * (CREW.length - 1))) / 2 + i * (CHIP + CGAP);

export function UnpackMap() {
  const [pid, setPid] = useState("ends");
  const p = PATTERNS.find((x) => x.id === pid)!;
  const res = unpack(p.targets, CREW.length);

  // розкладка змінних знизу
  const T = p.targets.length;
  const slot = (W - 20) / T;
  const tx = (i: number) => 10 + slot * i + slot / 2;
  const owner = new Map<number, number>();
  if (res.ok) res.groups.forEach((g, gi) => g.idx.forEach((ix) => owner.set(ix, gi)));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-5 pt-2 pb-1">
        {PATTERNS.map((x) => (
          <button
            key={x.id}
            onClick={() => setPid(x.id)}
            className={`pill ${x.id === pid ? "pill-accent" : "pill-glass"} !px-2.5 !py-1 font-mono !text-[11.5px]`}
          >
            {lhs(x)}
          </button>
        ))}
      </div>

      <div className="px-2 sm:px-4">
        <svg viewBox={`0 0 ${W} 230`} className="h-auto w-full select-none" role="img" aria-label="Схема розпакування">
          {/* значення */}
          {CREW.map((name, i) => {
            const mine = owner.get(i);
            const g = mine !== undefined && res.ok ? res.groups[mine] : null;
            const isStar = !!g?.target.star;
            const skipped = g?.target.name === "_";
            return (
              <g key={name} transform={`translate(${chipX(i)}, 14)`}>
                <motion.rect
                  width={CHIP}
                  height={46}
                  rx={14}
                  initial={false}
                  animate={{ opacity: res.ok ? (skipped ? 0.45 : 1) : 0.6 }}
                  strokeWidth={1.4}
                  style={{
                    fill: isStar
                      ? "color-mix(in oklab, var(--accent-2) 26%, var(--bg-elevated))"
                      : "color-mix(in oklab, var(--accent) 16%, var(--bg-elevated))",
                    stroke: isStar ? "var(--accent-2)" : "color-mix(in oklab, var(--accent) 55%, transparent)",
                  }}
                />
                <text x={CHIP / 2} y={21} textAnchor="middle" fontSize={16}>
                  {EMOJI[i]}
                </text>
                <text x={CHIP / 2} y={38} textAnchor="middle" fontSize={11} fontWeight={600} style={{ fill: "var(--label)" }}>
                  {name}
                </text>
              </g>
            );
          })}

          {/* лінії */}
          <AnimatePresence>
            {res.ok &&
              res.groups.flatMap((g, gi) =>
                g.idx.map((ix, k) => {
                  const sx = chipX(ix) + CHIP / 2;
                  const ex = tx(gi);
                  return (
                    <motion.path
                      key={`${pid}-${gi}-${ix}`}
                      d={`M${sx},62 C${sx},110 ${ex},110 ${ex},150`}
                      fill="none"
                      strokeWidth={2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: g.target.name === "_" ? 0.35 : 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, delay: 0.07 * (gi + k), ease: [0.22, 1, 0.36, 1] }}
                      style={{ stroke: g.target.star ? "var(--accent-2)" : "var(--accent)" }}
                    />
                  );
                }),
              )}
          </AnimatePresence>

          {/* змінні */}
          {p.targets.map((t, i) => {
            const g = res.ok ? res.groups[i] : null;
            const val = g ? (t.star ? "[" + g.idx.map((ix) => CREW[ix]).join(", ") + "]" : CREW[g.idx[0]]) : "?";
            const bw = Math.min(slot - 8, 150);
            return (
              <motion.g
                key={`${pid}-${i}`}
                initial={{ opacity: 0, y: 160 }}
                animate={{ opacity: 1, y: 152 }}
                transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.04 * i }}
              >
                <rect
                  x={tx(i) - bw / 2}
                  y={0}
                  width={bw}
                  height={60}
                  rx={14}
                  strokeWidth={1.4}
                  style={{
                    fill: res.ok ? "var(--bg-elevated)" : "color-mix(in oklab, #ff453a 12%, var(--bg-elevated))",
                    stroke: res.ok ? "var(--separator)" : "#ff453a",
                  }}
                />
                <text x={tx(i)} y={22} textAnchor="middle" className="font-mono" fontSize={12.5} fontWeight={700} style={{ fill: t.star ? "var(--accent-2)" : "var(--accent)" }}>
                  {(t.star ? "*" : "") + t.name}
                </text>
                <text x={tx(i)} y={43} textAnchor="middle" fontSize={T > 4 ? 9.5 : 10.5} style={{ fill: "var(--label-2)" }}>
                  {val.length > 26 ? val.slice(0, 25) + "…" : val}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      <Console
        lines={[
          <span key="c" className="break-all">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {lhs(p)} = crew
          </span>,
          ...(res.ok
            ? res.groups
                .filter((g) => g.target.name !== "_")
                .map((g) => (
                  <span key={g.target.name} className="break-all text-[#ffd60a]">
                    {g.target.name} = {g.target.star ? "[" + g.idx.map((ix) => `'${CREW[ix]}'`).join(", ") + "]" : `'${CREW[g.idx[0]]}'`}
                  </span>
                ))
            : [
                <span key="e" className="text-[#ff6961]">
                  {res.error}
                </span>,
              ]),
        ]}
      />
    </div>
  );
}
