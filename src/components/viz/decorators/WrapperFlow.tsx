"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Btn, ControlBar, Segmented } from "../kit";
import { CodePane, INK } from "./shared";

type Where = "none" | "log" | "wrapper" | "orig";

type Step = {
  line: number;
  phase: "оголошення" | "виклик";
  orig: boolean;
  wrapper: boolean;
  /** на що зараз вказує ім'я add */
  addTo: "none" | "orig" | "wrapper";
  pulse: Where;
  out?: string;
  note: string;
};

const STEPS: Step[] = [
  { line: 0, phase: "оголошення", orig: false, wrapper: false, addTo: "none", pulse: "none",
    note: "def log — створено функцію-декоратор. Вона чекає на вхід іншу функцію." },
  { line: 10, phase: "оголошення", orig: true, wrapper: false, addTo: "orig", pulse: "none",
    note: "def add — Python створює оригінальну функцію add…" },
  { line: 9, phase: "оголошення", orig: true, wrapper: false, addTo: "orig", pulse: "log",
    note: "…і одразу виконує @log, тобто log(add). Параметр func тепер — оригінальна add." },
  { line: 2, phase: "оголошення", orig: true, wrapper: true, addTo: "orig", pulse: "log",
    note: "Усередині log створюється wrapper — замикання, що пам'ятає func." },
  { line: 7, phase: "оголошення", orig: true, wrapper: true, addTo: "wrapper", pulse: "none",
    note: "return wrapper → ім'я add перечіплюється на wrapper. Оригінал схований всередині, у func." },
  { line: 13, phase: "виклик", orig: true, wrapper: true, addTo: "wrapper", pulse: "wrapper",
    note: "add(2, 3) насправді викликає wrapper(2, 3)." },
  { line: 3, phase: "виклик", orig: true, wrapper: true, addTo: "wrapper", pulse: "wrapper", out: "→ add",
    note: "Код «до»: wrapper друкує ім'я. func — це оригінал, тому тут завжди «add»." },
  { line: 11, phase: "виклик", orig: true, wrapper: true, addTo: "wrapper", pulse: "orig",
    note: "func(*args) — сигнал заходить в оригінал: return 2 + 3." },
  { line: 5, phase: "виклик", orig: true, wrapper: true, addTo: "wrapper", pulse: "wrapper", out: "← 5",
    note: "Код «після»: результат повернувся у wrapper." },
  { line: 6, phase: "виклик", orig: true, wrapper: true, addTo: "wrapper", pulse: "none", out: "5",
    note: "return result — без цього рядка add(2, 3) повертала б None!" },
  { line: 14, phase: "виклик", orig: true, wrapper: true, addTo: "wrapper", pulse: "none", out: "__NAME__",
    note: "add.__name__ — чиє ім'я ми побачимо? Залежить від @wraps. Перемкни і подивись." },
];

const codeFor = (wraps: boolean) => [
  "def log(func):",
  wraps ? "    @wraps(func)" : "    # без @wraps",
  "    def wrapper(*args):",
  '        print("→", func.__name__)',
  "        result = func(*args)",
  '        print("←", result)',
  "        return result",
  "    return wrapper",
  "",
  "@log",
  "def add(a, b):",
  "    return a + b",
  "",
  "print(add(2, 3))",
  "print(add.__name__)",
];

export function WrapperFlow() {
  const [i, setI] = useState(0);
  const [wraps, setWraps] = useState<"on" | "off">("on");
  const st = STEPS[i];
  const last = STEPS.length - 1;
  const name = wraps === "on" ? "add" : "wrapper";

  const outs = STEPS.slice(0, i + 1)
    .map((s) => s.out)
    .filter((o): o is string => !!o)
    .map((o) => (o === "__NAME__" ? name : o));

  return (
    <div>
      <ControlBar>
        <Segmented
          id="wraps-toggle"
          value={wraps}
          onChange={setWraps}
          options={[
            { value: "on", label: "з @wraps" },
            { value: "off", label: "без @wraps" },
          ]}
        />
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase"
          style={{ color: INK, background: "color-mix(in oklab, var(--accent) 16%, transparent)" }}
        >
          час {st.phase}
        </span>
      </ControlBar>

      <div className="grid gap-4 px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CodePane lines={codeFor(wraps === "on")} active={st.line} id="wrapflow" />

        <LayoutGroup id="wrapflow-diagram">
          <div className="flex min-w-0 flex-col gap-3">
            {/* ярлик add */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[13px]">
              <span className="rounded-lg px-2 py-1 font-bold" style={{ background: "var(--separator)" }}>
                add
              </span>
              <span className="text-label-3">→</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={st.addTo}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="rounded-lg px-2 py-1 text-[12px] font-bold"
                  style={{
                    color: st.addTo === "wrapper" ? INK : "var(--label)",
                    background:
                      st.addTo === "wrapper"
                        ? "color-mix(in oklab, var(--accent) 20%, transparent)"
                        : "var(--glass-bg)",
                  }}
                >
                  {st.addTo === "none" ? "ще не існує" : st.addTo === "orig" ? "fn add (оригінал)" : "fn wrapper"}
                </motion.span>
              </AnimatePresence>
              {i >= 4 && (
                <span className="ml-auto rounded-full bg-separator/60 px-2 py-0.5 text-[11px]">
                  __name__ = <b>&quot;{name}&quot;</b>
                </span>
              )}
            </div>

            <div className="relative min-h-[190px] rounded-2xl border border-dashed border-separator p-3">
              <div className="absolute top-2 right-3 text-[10px] font-semibold tracking-wider text-label-3 uppercase">
                пам&apos;ять
              </div>
              {st.pulse === "log" && (
                <motion.div
                  layoutId="wf-log"
                  className="mb-2 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-[12px]"
                  style={{ background: "color-mix(in oklab, var(--accent-2) 18%, transparent)" }}
                >
                  <Pulse /> log(func=add) виконується…
                </motion.div>
              )}
              {st.wrapper ? (
                <motion.div
                  layout
                  layoutId="wf-wrapper"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="rounded-2xl border-2 p-3"
                  style={{
                    borderColor: INK,
                    background: "color-mix(in oklab, var(--accent) 9%, transparent)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2 font-mono text-[12px] font-bold" style={{ color: INK }}>
                    🦇 wrapper(*args)
                    {st.pulse === "wrapper" && <Pulse />}
                  </div>
                  <div className="mb-1 font-mono text-[11px] text-label-2">до → func(*args) → після</div>
                  <Orig active={st.pulse === "orig"} />
                </motion.div>
              ) : st.orig ? (
                <Orig active={st.pulse === "orig"} />
              ) : (
                <div className="grid h-[120px] place-items-center text-[12px] text-label-3">тут з&apos;являться функції</div>
              )}
            </div>
          </div>
        </LayoutGroup>
      </div>

      <div className="mx-5 mt-3 rounded-2xl bg-black/80 px-4 py-2.5 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
        <div className="text-[#8e8e93]"># вивід</div>
        {outs.length === 0 && <div className="text-[#8e8e93]">—</div>}
        {outs.map((o, k) => (
          <motion.div key={`${k}-${o}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
            {o}
          </motion.div>
        ))}
      </div>

      <motion.div
        key={i}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mt-3 flex gap-2 rounded-2xl px-4 py-3 text-[13.5px]"
        style={{ background: "color-mix(in oklab, var(--accent) 12%, transparent)" }}
      >
        <span className="font-mono text-[11px] font-bold text-label-3 tabular-nums">
          {i}/{last}
        </span>
        <span>{st.note}</span>
      </motion.div>

      <ControlBar>
        <Btn onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
          ← Назад
        </Btn>
        <Btn variant="accent" onClick={() => setI((v) => Math.min(last, v + 1))} disabled={i === last}>
          Крок →
        </Btn>
        <Btn onClick={() => setI(0)}>Скинути</Btn>
      </ControlBar>
    </div>
  );
}

function Orig({ active }: { active: boolean }) {
  return (
    <motion.div
      layout
      layoutId="wf-orig"
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="rounded-xl border px-3 py-2 font-mono text-[12px]"
      style={{
        borderColor: active ? INK : "var(--separator)",
        background: "var(--glass-bg-strong)",
        boxShadow: active ? "0 0 0 3px color-mix(in oklab, var(--accent) 35%, transparent)" : "none",
      }}
    >
      <div className="flex items-center gap-2 font-bold">
        fn add (оригінал) {active && <Pulse />}
      </div>
      <div className="text-label-2">return a + b</div>
    </motion.div>
  );
}

function Pulse() {
  return (
    <span className="relative inline-flex size-2.5">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: "var(--accent)" }}
        animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="relative size-2.5 rounded-full" style={{ background: "var(--accent)" }} />
    </span>
  );
}
