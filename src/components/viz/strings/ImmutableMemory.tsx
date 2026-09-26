"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Btn, ControlBar } from "../kit";

const PROGRAM = ['s = "moon"', "t = s", "s = s.upper()", 's += "!"', 's[0] = "m"'];

type Obj = { id: number; val: string; addr: string; born: number };
const OBJECTS: Obj[] = [
  { id: 1, val: "moon", addr: "0x…a0", born: 1 },
  { id: 2, val: "MOON", addr: "0x…c8", born: 3 },
  { id: 3, val: "MOON!", addr: "0x…f0", born: 4 },
];

const EXPLAIN = [
  "Пам'ять порожня. Натискай «Крок», щоб виконувати рядки програми.",
  "Створено об'єкт-рядок \"moon\". Ім'я s — лише ярлик-стрілка на нього.",
  "t = s не копіює текст: тепер ДВА ярлики ведуть до одного й того самого об'єкта.",
  "upper() не змінює \"moon\" — він створює НОВИЙ об'єкт \"MOON\". s перечіплюється, а t і далі бачить \"moon\".",
  "+= теж створює новий рядок \"MOON!\". На \"MOON\" більше ніхто не вказує — його прибере збирач сміття.",
  "Спроба змінити символ на місці — TypeError: 'str' object does not support item assignment. Рядки незмінні!",
];

/** На який об'єкт вказує кожне ім'я на кроці step. */
function refsAt(step: number): { s?: number; t?: number } {
  const s = step >= 4 ? 3 : step >= 3 ? 2 : step >= 1 ? 1 : undefined;
  const t = step >= 2 ? 1 : undefined;
  return { s, t };
}

const W = 420;
const H = 250;
const NAME_X = 18;
const NAME_W = 66;
const NAME_H = 40;
const NAME_Y: Record<"s" | "t", number> = { s: 62, t: 152 };
const OBJ_X = 214;
const OBJ_W = 186;
const OBJ_H = 56;
const OBJ_Y: Record<number, number> = { 1: 22, 2: 97, 3: 172 };

const spring = { type: "spring" as const, stiffness: 240, damping: 26 };

function arrowPath(fromY: number, objId: number) {
  const x1 = NAME_X + NAME_W;
  const y1 = fromY + NAME_H / 2;
  const x2 = OBJ_X - 10;
  const y2 = OBJ_Y[objId] + OBJ_H / 2;
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

export function ImmutableMemory() {
  const [step, setStep] = useState(0);
  const refs = refsAt(step);
  const error = step === 5;
  const alive = OBJECTS.filter((o) => o.born <= step);
  const referenced = new Set([refs.s, refs.t].filter((x): x is number => x !== undefined));

  return (
    <div>
      <div className="grid gap-3 px-5 md:grid-cols-[minmax(0,200px)_1fr]">
        {/* код */}
        <div className="rounded-[16px] bg-black/80 p-3 font-mono text-[12.5px] leading-[1.9] text-[#e5e5ea]">
          {PROGRAM.map((line, i) => {
            const n = i + 1;
            const current = n === step;
            const done = n < step;
            return (
              <div key={i} className="relative rounded-md px-2">
                {current && (
                  <motion.div
                    layoutId="imm-line"
                    className="absolute inset-0 rounded-md"
                    style={{ background: error ? "rgb(255 69 58 / 0.35)" : "color-mix(in oklab, var(--accent) 40%, transparent)" }}
                    transition={spring}
                  />
                )}
                <span className={`relative ${done ? "text-[#8e8e93]" : ""}`}>
                  <span className="mr-2 text-[#636366]">{n}</span>
                  {line}
                </span>
              </div>
            );
          })}
        </div>

        {/* пам'ять */}
        <div className="relative rounded-[16px] border border-separator">
          <div className="absolute top-2 left-3 text-[10px] font-bold tracking-wider text-label-3 uppercase">імена</div>
          <div className="absolute top-2 right-3 text-[10px] font-bold tracking-wider text-label-3 uppercase">об&apos;єкти в пам&apos;яті</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Діаграма пам'яті рядків">
            <defs>
              <marker id="imm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
              </marker>
              <linearGradient id="imm-obj" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--accent-2)" stopOpacity={0.22} />
              </linearGradient>
            </defs>

            {/* об'єкти */}
            <AnimatePresence>
              {alive.map((o) => {
                const garbage = !referenced.has(o.id);
                const shaking = error && o.id === 3;
                return (
                  <motion.g
                    key={o.id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: garbage ? 0.4 : 1, scale: 1, x: shaking ? [0, -8, 8, -6, 6, 0] : 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={shaking ? { duration: 0.5 } : spring}
                    style={{ transformOrigin: `${OBJ_X + OBJ_W / 2}px ${OBJ_Y[o.id] + OBJ_H / 2}px` }}
                  >
                    <rect
                      x={OBJ_X}
                      y={OBJ_Y[o.id]}
                      width={OBJ_W}
                      height={OBJ_H}
                      rx={16}
                      fill="url(#imm-obj)"
                      stroke={shaking ? "#ff453a" : garbage ? "var(--label-3)" : "var(--accent)"}
                      strokeWidth={1.5}
                      strokeDasharray={garbage ? "5 4" : undefined}
                    />
                    <text x={OBJ_X + 14} y={OBJ_Y[o.id] + 24} fontSize={16} fontWeight={700} fill="var(--label)" className="font-mono">
                      &quot;{o.val}&quot;
                    </text>
                    <text x={OBJ_X + 14} y={OBJ_Y[o.id] + 43} fontSize={10.5} fill="var(--label-2)" className="font-mono">
                      str · id {o.addr} {garbage ? "· 🗑 сміття" : ""}
                    </text>
                    <text x={OBJ_X + OBJ_W - 12} y={OBJ_Y[o.id] + 24} textAnchor="end" fontSize={13}>
                      🔒
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* імена та стрілки */}
            {(["s", "t"] as const).map((name) => {
              const target = refs[name];
              if (target === undefined) return null;
              return (
                <g key={name}>
                  <motion.path
                    initial={{ pathLength: 0, d: arrowPath(NAME_Y[name], target) }}
                    animate={{ pathLength: 1, d: arrowPath(NAME_Y[name], target) }}
                    transition={spring}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2.2}
                    markerEnd="url(#imm-arrow)"
                  />
                  <motion.g initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={spring}>
                    <rect
                      x={NAME_X}
                      y={NAME_Y[name]}
                      width={NAME_W}
                      height={NAME_H}
                      rx={12}
                      fill="var(--label)"
                    />
                    <text
                      x={NAME_X + NAME_W / 2}
                      y={NAME_Y[name] + 26}
                      textAnchor="middle"
                      fontSize={17}
                      fontWeight={800}
                      fill="var(--bg-elevated)"
                      className="font-mono"
                    >
                      {name}
                    </text>
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className={`mx-5 mt-3 min-h-[44px] rounded-[14px] px-4 py-2.5 text-[13.5px] ${error ? "text-[#ff453a]" : "text-label"}`}
          style={{ background: error ? "rgb(255 69 58 / 0.1)" : "color-mix(in oklab, var(--accent) 10%, transparent)" }}
        >
          {EXPLAIN[step]}
        </motion.p>
      </AnimatePresence>

      <ControlBar>
        <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ← Назад
        </Btn>
        <Btn variant="accent" onClick={() => setStep((s) => Math.min(5, s + 1))} disabled={step === 5}>
          Крок {step}/5 →
        </Btn>
        <Btn onClick={() => setStep(0)}>Спочатку</Btn>
        <span className="ml-auto font-mono text-[12px] text-label-2">
          print(s, t) → {refs.s ? OBJECTS[refs.s - 1].val : "—"} {refs.t ? OBJECTS[refs.t - 1].val : "—"}
        </span>
      </ControlBar>
    </div>
  );
}
