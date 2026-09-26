"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ControlBar, Slider } from "../kit";

const H = 190;
const PAD = 18;
const MIN = -32;
const MAX = 32;
const Y = 118;

/**
 * Числова пряма: a // b — кількість стрибків довжиною b від нуля
 * (округлення вниз), a % b — залишок від останньої точки до a.
 */
export function DivmodLine() {
  const [a, setA] = useState(17);
  const [b, setB] = useState(5);
  // реальна ширина в пікселях — щоб шрифти лишались читабельними на телефоні
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(300, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const x = (v: number) => PAD + ((v - MIN) / (MAX - MIN)) * (W - PAD * 2);

  const q = Math.floor(a / b);
  const r = a - b * q;
  const trunc = Math.trunc(a / b);
  const differs = trunc !== q;

  const hops = Array.from({ length: Math.abs(q) }, (_, i) => {
    const from = Math.sign(q) * i * b;
    const to = from + Math.sign(q) * b;
    return { from, to, i };
  });

  const ticks: number[] = [];
  for (let t = Math.ceil(MIN / b) * b; t <= MAX; t += b) ticks.push(t);

  const qb = q * b;
  // підписуємо не кожну кратну точку, щоб числа не налазили одне на одне
  const unit = (W - PAD * 2) / (MAX - MIN);
  const labelEvery = Math.max(1, Math.ceil(26 / (b * unit)));

  return (
    <div>
      <div ref={box} className="px-3 sm:px-5">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block h-auto w-full" role="img" aria-label="Числова пряма для // і %">
          <defs>
            <linearGradient id="dm-hop" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>

          {/* основна вісь */}
          <line x1={PAD} x2={W - PAD} y1={Y} y2={Y} stroke="var(--label-3)" strokeWidth={2} strokeLinecap="round" />

          {/* дрібні поділки по 1 */}
          {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map((t) => (
            <line key={t} x1={x(t)} x2={x(t)} y1={Y - 3} y2={Y + 3} stroke="var(--separator)" strokeWidth={1} />
          ))}

          {/* кратні b — «точки приземлення» */}
          {ticks.map((t) => (
            <g key={`m${t}`}>
              <line x1={x(t)} x2={x(t)} y1={Y - 9} y2={Y + 9} stroke="var(--label-2)" strokeWidth={1.5} />
              {(t / b) % labelEvery === 0 && <text x={x(t)} y={Y + 26} textAnchor="middle" fontSize={11} fill="var(--label-2)" className="font-mono">
                {t}
              </text>}
            </g>
          ))}

          {/* стрибки */}
          {hops.map((h) => {
            const x1 = x(h.from);
            const x2 = x(h.to);
            const mid = (x1 + x2) / 2;
            const lift = Math.min(60, 18 + Math.abs(x2 - x1) * 0.6);
            return (
              <motion.path
                key={`${b}-${q}-${h.i}`}
                d={`M ${x1} ${Y} Q ${mid} ${Y - lift} ${x2} ${Y}`}
                fill="none"
                stroke="url(#dm-hop)"
                strokeWidth={3}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: Math.min(h.i * 0.05, 0.9), type: "spring", stiffness: 140, damping: 20 }}
              />
            );
          })}

          {/* залишок */}
          {r > 0 && (
            <motion.rect
              initial={false}
              animate={{ x: x(qb), width: Math.max(0, x(a) - x(qb)) }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              y={Y - 5}
              height={10}
              rx={5}
              fill="var(--accent-2)"
              opacity={0.85}
            />
          )}

          {/* нуль */}
          <circle cx={x(0)} cy={Y} r={5} fill="var(--label)" />
          <text x={x(0)} y={Y + 42} textAnchor="middle" fontSize={11} fill="var(--label-2)">
            старт
          </text>

          {/* точка q*b */}
          <motion.g initial={false} animate={{ x: x(qb) }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
            <circle cx={0} cy={Y} r={7} fill="var(--accent)" stroke="var(--bg-elevated)" strokeWidth={2} />
          </motion.g>

          {/* маркер a */}
          <motion.g initial={false} animate={{ x: x(a) }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
            <line x1={0} x2={0} y1={Y - 70} y2={Y} stroke="var(--label)" strokeWidth={1.5} strokeDasharray="3 3" />
            <rect x={-26} y={Y - 92} width={52} height={22} rx={11} fill="var(--label)" />
            <text x={0} y={Y - 77} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--bg-elevated)" className="font-mono">
              a={a}
            </text>
          </motion.g>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 sm:grid-cols-4">
        <Stat label="a // b" value={q} accent />
        <Stat label="a % b" value={r} accent2 />
        <Stat label="int(a / b)" value={trunc} warn={differs} />
        <Stat label="b * q + r" value={b * q + r} />
      </div>
      <div className="px-5 pt-2 text-[13px] text-label-2">
        {differs ? (
          <span>
            ⚠️ Для від&apos;ємного <b className="text-label">a</b> результати різні: <code className="inline-code">{"//"}</code> округлює
            вниз (до −∞), а <code className="inline-code">int()</code> просто відкидає дробову частину (до нуля).
          </span>
        ) : (
          <span>
            {Math.abs(q)} {Math.abs(q) === 1 ? "стрибок" : "стрибків"} по {b} {q < 0 ? "ліворуч" : "праворуч"}, і ще{" "}
            <b className="text-label">{r}</b> до точки a. Остача завжди в межах 0…{b - 1}.
          </span>
        )}
      </div>

      <ControlBar>
        <Slider label="a (ділене)" value={a} min={-30} max={30} onChange={setA} />
        <Slider label="b (дільник)" value={b} min={1} max={10} onChange={setB} />
      </ControlBar>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  accent2,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  accent2?: boolean;
  warn?: boolean;
}) {
  const color = accent ? "var(--accent)" : accent2 ? "var(--accent-2)" : warn ? "#ff9f0a" : "var(--label-3)";
  return (
    <div
      className="rounded-[14px] px-3 py-2"
      style={{ background: `color-mix(in oklab, ${color} 13%, transparent)`, border: `1px solid color-mix(in oklab, ${color} 35%, transparent)` }}
    >
      <div className="font-mono text-[11.5px] text-label-2">{label}</div>
      <motion.div
        key={value}
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="font-mono text-[20px] font-bold tabular-nums"
      >
        {value}
      </motion.div>
    </div>
  );
}
