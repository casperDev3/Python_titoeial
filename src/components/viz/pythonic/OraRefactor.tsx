"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar } from "../kit";

const HEAD = `stands = ["Star Platinum", "The World", "Hermit Purple", "Magician's Red"]`;

type Step = { title: string; note: string; lines: string[] };

const STEPS: Step[] = [
  {
    title: "Вихідний код",
    note: "Працює, але це «акцент» з C: ручний лічильник `i`, індекси, склеювання рядків через `+`. Десять рядків — і кожен треба уважно читати.",
    lines: [
      HEAD,
      "result = []",
      "i = 0",
      "while i < len(stands):",
      "    s = stands[i]",
      "    if len(s) > 10:",
      '        result.append(str(i + 1) + ". " + s.upper())',
      "    i = i + 1",
      "for j in range(len(result)):",
      "    print(result[j])",
    ],
  },
  {
    title: "ORA! enumerate замість лічильника",
    note: "`enumerate(stands, start=1)` одразу дає номер і елемент. Зникли `i = 0`, `i = i + 1` і `stands[i]` — а з ними й шанс забути інкремент і зависнути в нескінченному циклі.",
    lines: [
      HEAD,
      "result = []",
      "for i, s in enumerate(stands, start=1):",
      "    if len(s) > 10:",
      '        result.append(str(i) + ". " + s.upper())',
      "for j in range(len(result)):",
      "    print(result[j])",
    ],
  },
  {
    title: "ORA! f-string замість +",
    note: "`f\"{i}. {s.upper()}\"` — видно, як виглядатиме результат, без `str()` і плюсів.",
    lines: [
      HEAD,
      "result = []",
      "for i, s in enumerate(stands, start=1):",
      "    if len(s) > 10:",
      '        result.append(f"{i}. {s.upper()}")',
      "for j in range(len(result)):",
      "    print(result[j])",
    ],
  },
  {
    title: "ORA! Ітеруй елементи, а не індекси",
    note: "`for line in result` — нам не потрібен номер, тож не просимо його. `range(len(...))` у Python майже завжди зайвий.",
    lines: [
      HEAD,
      "result = []",
      "for i, s in enumerate(stands, start=1):",
      "    if len(s) > 10:",
      '        result.append(f"{i}. {s.upper()}")',
      "for line in result:",
      "    print(line)",
    ],
  },
  {
    title: "ORA ORA! List comprehension",
    note: "Шаблон «порожній список → цикл → if → append» — це рівно один list comprehension. Читається як речення: *рядок для кожного стенду, якщо ім'я довше 10*.",
    lines: [
      HEAD,
      'result = [f"{i}. {s.upper()}" for i, s in enumerate(stands, start=1) if len(s) > 10]',
      "for line in result:",
      "    print(line)",
    ],
  },
  {
    title: "ORA ORA ORA! Розпакування в print",
    note: "`print(*result, sep=\"\\n\")` друкує всі елементи через перенос рядка. З 10 рядків — 3, вивід той самий. Yare yare daze.",
    lines: [HEAD, 'result = [f"{i}. {s.upper()}" for i, s in enumerate(stands, start=1) if len(s) > 10]', 'print(*result, sep="\\n")'],
  },
];

const OUTPUT = ["1. STAR PLATINUM", "3. HERMIT PURPLE", "4. MAGICIAN'S RED"];

function Md({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*[^*]+\*)/g).map((p, i) =>
        p.startsWith("`") ? (
          <code key={i} className="inline-code">
            {p.slice(1, -1)}
          </code>
        ) : p.startsWith("*") ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function OraRefactor() {
  const [s, setS] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[s];
  const prev = s > 0 ? new Set(STEPS[s - 1].lines) : new Set(step.lines);
  const last = STEPS.length - 1;
  const max = STEPS[0].lines.length;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (s >= last) setPlaying(false);
      else setS(s + 1);
    }, s >= last ? 0 : 2200);
    return () => clearTimeout(t);
  }, [playing, s, last]);

  return (
    <div>
      <div className="relative px-5">
        {/* ORA-сплеск */}
        <AnimatePresence>
          {s > 0 && (
            <motion.div
              key={s}
              initial={{ opacity: 0, scale: 0.4, rotate: -14 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 1.1], rotate: -8 }}
              transition={{ duration: 1.1, times: [0, 0.2, 0.7, 1] }}
              className="pointer-events-none absolute top-6 right-8 z-10 text-[34px] font-black italic tracking-tight"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                WebkitBackgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 4px 12px color-mix(in oklab, var(--accent) 50%, transparent))",
              }}
            >
              {"ORA! ".repeat(Math.min(3, s)).trim()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-hidden rounded-2xl border border-separator" style={{ background: "var(--code-bg)" }}>
          <div className="flex items-center justify-between gap-2 border-b border-separator px-3 py-1.5">
            <span className="font-mono text-[12px] font-semibold">stands.py</span>
            <div className="flex items-center gap-2 text-[11px] text-label-2">
              <span className="font-mono tabular-nums">{step.lines.length} рядк.</span>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-separator">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
                  animate={{ width: `${(step.lines.length / max) * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 26 }}
                />
              </div>
            </div>
          </div>
          <div className="thin-scroll min-h-[236px] overflow-x-auto py-2 font-mono text-[12px] leading-[22px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {step.lines.map((l, i) => {
                const fresh = !prev.has(l);
                return (
                  <motion.div
                    layout
                    key={l}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    className="flex px-3 whitespace-pre transition-[background-color,border-color] duration-700"
                    style={{
                      background: fresh ? "color-mix(in oklab, var(--accent) 20%, transparent)" : "transparent",
                      borderLeft: `3px solid ${fresh ? "var(--accent)" : "transparent"}`,
                    }}
                  >
                    <span className="mr-3 w-4 shrink-0 text-right text-label-3 select-none">{i + 1}</span>
                    <span>{l}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid gap-2 px-5 pt-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="min-h-[92px] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug" style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
          <div className="mb-1 text-[11px] font-bold tracking-wider text-label-3 uppercase">
            Удар {s}/{last} · {step.title}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={s} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.16 }}>
              <Md text={step.note} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="rounded-2xl bg-black/80 px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
          <div className="text-[#636366]">$ python3 stands.py</div>
          {OUTPUT.map((o) => (
            <motion.div key={`${s}-${o}`} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }}>
              {o}
            </motion.div>
          ))}
          <div className="mt-1 text-[11px] text-[#86efac]">✓ вивід не змінився</div>
        </div>
      </div>

      <ControlBar>
        <Btn onClick={() => setS((v) => Math.max(0, v - 1))} disabled={s === 0}>
          <ChevronLeft className="size-4" />
        </Btn>
        <Btn variant="accent" onClick={() => setS((v) => Math.min(last, v + 1))} disabled={s === last}>
          ORA! <ChevronRight className="size-4" />
        </Btn>
        <Btn
          onClick={() => {
            if (s >= last) setS(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Btn>
        <Btn
          onClick={() => {
            setPlaying(false);
            setS(0);
          }}
        >
          <RotateCcw className="size-4" />
        </Btn>
      </ControlBar>
    </div>
  );
}
