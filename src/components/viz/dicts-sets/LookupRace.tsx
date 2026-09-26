"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Btn, Console, ControlBar, Segmented, Slider } from "../kit";

/** Детермінований «перемішаний» набір чисел (без Math.random — стабільно для SSR). */
function makeData(n: number) {
  const out: number[] = [];
  let x = 7;
  const seen = new Set<number>();
  while (out.length < n) {
    x = (x * 48271) % 2147483647;
    const v = 100 + (x % 900);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

const tableSize = (n: number) => {
  let s = 8;
  while (s * 2 < n * 3) s *= 2; // заповнення ≤ 2/3
  return s;
};

type Where = "start" | "mid" | "end" | "none";

export function LookupRace() {
  const [n, setN] = useState(32);
  const [where, setWhere] = useState<Where>("end");
  const [run, setRun] = useState(0);
  const [pos, setPos] = useState(-1);

  const data = makeData(n);
  const target = where === "none" ? 99 : data[where === "start" ? 1 : where === "mid" ? Math.floor(n / 2) : n - 2];
  const listFoundAt = data.indexOf(target);
  const listSteps = listFoundAt >= 0 ? listFoundAt + 1 : n;

  // хеш-таблиця множини (відкрита адресація, як у CPython спрощено)
  const size = tableSize(n);
  const table: (number | null)[] = Array(size).fill(null);
  for (const v of data) {
    let i = v % size;
    while (table[i] !== null) i = (i + 1) % size;
    table[i] = v;
  }
  const setPath: number[] = [];
  {
    let i = target % size;
    for (let k = 0; k < size; k++) {
      setPath.push(i);
      if (table[i] === null || table[i] === target) break;
      i = (i + 1) % size;
    }
  }

  const running = run > 0 && pos < listSteps - 1;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setPos((p) => p + 1), Math.max(18, 900 / n));
    return () => clearInterval(t);
  }, [running, n]);

  const start = () => {
    setPos(-1);
    setRun((r) => r + 1);
  };
  const stop = () => {
    setRun(0);
    setPos(-1);
  };

  const listDone = run > 0 && pos >= listSteps - 1;
  const setShown = run > 0 && pos >= 0;
  const cols = n <= 16 ? 8 : 16;

  return (
    <div>
      <ControlBar>
        <Slider label="Розмір колекції n" value={n} min={8} max={64} step={8} onChange={(v) => { setN(v); stop(); }} />
        <Segmented
          id="race-where"
          value={where}
          onChange={(w) => {
            setWhere(w);
            stop();
          }}
          options={[
            { value: "start", label: "на початку" },
            { value: "mid", label: "в середині" },
            { value: "end", label: "в кінці" },
            { value: "none", label: "відсутній" },
          ]}
        />
      </ControlBar>

      <div className="space-y-4 px-4 sm:px-5">
        <Lane
          title={`list: x in lst  → перебір`}
          badge={run > 0 ? `${Math.min(pos + 1, listSteps)} порівн.` : "O(n)"}
          done={listDone}
        >
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {data.map((v, i) => {
              const checked = run > 0 && i <= pos;
              const hit = checked && v === target;
              const cur = run > 0 && i === pos;
              return (
                <motion.div
                  key={`${n}-${i}`}
                  animate={{ scale: cur ? 1.18 : 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  className="grid aspect-square place-items-center rounded-[5px] font-mono text-[8.5px] sm:text-[9.5px]"
                  style={{
                    background: hit
                      ? "#30d158"
                      : checked
                        ? "color-mix(in oklab, var(--accent) 45%, transparent)"
                        : "var(--separator)",
                    color: hit || checked ? "white" : "var(--label-2)",
                  }}
                >
                  {v}
                </motion.div>
              );
            })}
          </div>
        </Lane>

        <Lane
          title={`set: x in s  → hash(x) % ${size}`}
          badge={setShown ? `${setPath.length} порівн.` : "O(1)"}
          done={setShown}
        >
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(16, minmax(0, 1fr))` }}>
            {table.map((v, i) => {
              const k = setPath.indexOf(i);
              const on = setShown && k >= 0;
              const hit = on && v === target;
              return (
                <motion.div
                  key={`${size}-${i}`}
                  initial={false}
                  animate={{ scale: on ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.4, delay: on ? k * 0.15 : 0 }}
                  className="grid aspect-square place-items-center rounded-[5px] font-mono text-[8.5px] sm:text-[9.5px]"
                  style={{
                    background: hit
                      ? "#30d158"
                      : on
                        ? "var(--accent-2)"
                        : v === null
                          ? "transparent"
                          : "var(--separator)",
                    border: v === null ? "1px dashed var(--separator)" : "none",
                    color: hit || on ? "white" : "var(--label-2)",
                  }}
                >
                  {v ?? ""}
                </motion.div>
              );
            })}
          </div>
        </Lane>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={start}>
          ▶ Шукати {target}
        </Btn>
        <Btn onClick={stop}><span aria-hidden>↺</span><span className="sr-only">Скинути</span></Btn>
      </ControlBar>
      <Console
        lines={[
          <span key="a">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {target} in lst   <span className="text-[#8e8e93]"># перевірок: {listSteps} з {n}</span>
          </span>,
          <span key="b">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {target} in s     <span className="text-[#8e8e93]"># перевірок: {setPath.length}</span>
          </span>,
          <span key="c" className="text-[#ffd60a]">
            # при n = 1 000 000: list — до 1 000 000 порівнянь, set — зазвичай 1–2
          </span>,
        ]}
      />
    </div>
  );
}

function Lane({ title, badge, done, children }: { title: string; badge: string; done: boolean; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[12px] font-semibold">{title}</span>
        <motion.span
          key={badge}
          initial={{ scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full px-2 py-0.5 font-mono text-[11px] font-bold"
          style={{
            background: done ? "color-mix(in oklab, #30d158 22%, transparent)" : "var(--separator)",
            color: done ? "#1f9d45" : "var(--label-2)",
          }}
        >
          {badge}
        </motion.span>
      </div>
      {children}
    </div>
  );
}
