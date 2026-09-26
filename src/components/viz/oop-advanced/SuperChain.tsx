"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";
import { CodePane, Label, SPRING } from "./shared";

type Mode = "super" | "broken" | "explicit";
const MRO = ["Hybrid", "Miles", "Gwen", "Spider", "object"];

const CODE: Record<Mode, string[]> = {
  super: [
    "class Spider:",
    "    def __init__(self):",
    '        print("Spider")',
    "        super().__init__()",
    "class Miles(Spider):",
    "    def __init__(self):",
    '        print("Miles")',
    "        super().__init__()",
    "class Gwen(Spider):",
    "    def __init__(self):",
    '        print("Gwen")',
    "        super().__init__()",
    "class Hybrid(Miles, Gwen):",
    "    def __init__(self):",
    '        print("Hybrid")',
    "        super().__init__()",
  ],
  broken: [
    "class Spider:",
    "    def __init__(self):",
    '        print("Spider")',
    "        super().__init__()",
    "class Miles(Spider):",
    "    def __init__(self):",
    '        print("Miles")',
    "        # забули super().__init__()",
    "class Gwen(Spider):",
    "    def __init__(self):",
    '        print("Gwen")',
    "        super().__init__()",
    "class Hybrid(Miles, Gwen):",
    "    def __init__(self):",
    '        print("Hybrid")',
    "        super().__init__()",
  ],
  explicit: [
    "class Spider:",
    "    def __init__(self):",
    '        print("Spider")',
    "",
    "class Miles(Spider):",
    "    def __init__(self):",
    '        print("Miles")',
    "        Spider.__init__(self)",
    "class Gwen(Spider):",
    "    def __init__(self):",
    '        print("Gwen")',
    "        Spider.__init__(self)",
    "class Hybrid(Miles, Gwen):",
    "    def __init__(self):",
    '        print("Hybrid")',
    "        Miles.__init__(self); Gwen.__init__(self)",
  ],
};

/** Рядок print і рядок виклику для кожного класу. */
const LINES: Record<string, { print: number; call: number }> = {
  Spider: { print: 2, call: 3 },
  Miles: { print: 6, call: 7 },
  Gwen: { print: 10, call: 11 },
  Hybrid: { print: 14, call: 15 },
};

type Ev =
  | { t: "call"; cls: string; why: string; line: number }
  | { t: "print"; cls: string; line: number }
  | { t: "ret"; cls: string; line: number }
  | { t: "end"; note: string; line: number };

function trace(mode: Mode): Ev[] {
  const ev: Ev[] = [];
  const call = (cls: string, why: string) => {
    ev.push({ t: "call", cls, why, line: cls === "object" ? -1 : LINES[cls].print - 1 });
    if (cls === "object") {
      ev.push({ t: "ret", cls, line: -1 });
      return;
    }
    ev.push({ t: "print", cls, line: LINES[cls].print });
    if (mode === "super") {
      const next = MRO[MRO.indexOf(cls) + 1];
      call(next, `super() у ${cls} → наступний після ${cls} у Hybrid.__mro__ = ${next}`);
    } else if (mode === "broken") {
      if (cls !== "Miles") {
        const next = MRO[MRO.indexOf(cls) + 1];
        call(next, `super() у ${cls} → наступний у MRO = ${next}`);
      }
    } else {
      if (cls === "Hybrid") {
        call("Miles", "явно: Miles.__init__(self)");
        call("Gwen", "явно: Gwen.__init__(self)");
      } else if (cls === "Miles" || cls === "Gwen") {
        call("Spider", `явно: Spider.__init__(self) з ${cls}`);
      }
    }
    ev.push({ t: "ret", cls, line: mode === "explicit" && cls === "Spider" ? LINES.Spider.print : LINES[cls].call });
  };
  call("Hybrid", "Hybrid() → Python викликає Hybrid.__init__");
  const note =
    mode === "super"
      ? "Кожен __init__ виконався рівно один раз, у порядку MRO. Це і є кооперативний super()."
      : mode === "broken"
        ? "Ланцюжок обірвався на Miles: Gwen.__init__ і Spider.__init__ не виконались — їхні атрибути не створено!"
        : "Spider.__init__ виконався ДВІЧІ: ромб без super() ініціалізує спільного предка повторно.";
  ev.push({ t: "end", note, line: -1 });
  return ev;
}

type Snap = { stack: { cls: string; why: string }[]; out: string[]; line: number; msg: string; active: string | null };

function snapshots(ev: Ev[]): Snap[] {
  const snaps: Snap[] = [{ stack: [], out: [], line: -1, msg: "Тисни «Крок», щоб викликати Hybrid().", active: null }];
  let stack: { cls: string; why: string }[] = [];
  let out: string[] = [];
  for (const e of ev) {
    if (e.t === "call") {
      stack = [...stack, { cls: e.cls, why: e.why }];
      snaps.push({ stack, out, line: e.line, msg: e.why, active: e.cls });
    } else if (e.t === "print") {
      out = [...out, e.cls];
      snaps.push({ stack, out, line: e.line, msg: `print("${e.cls}")`, active: e.cls });
    } else if (e.t === "ret") {
      stack = stack.slice(0, -1);
      const top = stack.at(-1)?.cls ?? null;
      snaps.push({
        stack, out, line: e.line,
        msg: e.cls === "object" ? "object.__init__ нічого не робить — повертаємось назад." : `${e.cls}.__init__ завершився${top ? ` — назад у ${top}` : ""}.`,
        active: top,
      });
    } else {
      snaps.push({ stack, out, line: -1, msg: e.note, active: null });
    }
  }
  return snaps;
}

export function SuperChain() {
  const [mode, setMode] = useState<Mode>("super");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const snaps = useMemo(() => snapshots(trace(mode)), [mode]);
  const s = snaps[step];
  const last = step >= snaps.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (last) {
      const t = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((x) => x + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, last, step]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep(0);
    setPlaying(false);
  };

  const counts = s.out.reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }), {});

  return (
    <div>
      <ControlBar>
        <Segmented
          id="oopa-super-mode"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "super", label: "super()" },
            { value: "broken", label: "без super()" },
            { value: "explicit", label: "Батько.__init__" },
          ]}
        />
      </ControlBar>

      {/* MRO-стрічка */}
      <div className="mx-5 mb-3 flex flex-wrap items-center gap-1 font-mono text-[12px]">
        <span className="mr-1 text-label-2">Hybrid.__mro__:</span>
        {MRO.map((k, i) => {
          const on = s.active === k;
          const n = counts[k] ?? 0;
          return (
            <span key={k} className="flex items-center gap-1">
              <motion.span
                animate={{ scale: on ? 1.1 : 1, y: on ? -2 : 0 }}
                transition={SPRING}
                className="relative rounded-lg border px-2 py-0.5"
                style={{
                  borderColor: on ? "var(--accent)" : "var(--separator)",
                  background: on ? "color-mix(in oklab, var(--accent) 18%, transparent)" : n ? "color-mix(in oklab, var(--accent-2) 14%, transparent)" : "transparent",
                }}
              >
                {k}
                {n > 1 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 rounded-full bg-[#ff453a] px-1.5 text-[10px] font-bold text-white"
                  >
                    ×{n}
                  </motion.span>
                )}
              </motion.span>
              {i < MRO.length - 1 && <ChevronRight className="size-3 text-label-3" />}
            </span>
          );
        })}
      </div>

      <div className="grid gap-3 px-5 md:grid-cols-[1.1fr_1fr]">
        <div className="min-w-0">
          <Label>Код</Label>
          <CodePane id="oopa-super-hl" lines={CODE[mode]} active={s.line >= 0 ? s.line : undefined} />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <Label>Стек викликів</Label>
            <div className="flex min-h-[150px] flex-col-reverse justify-start gap-1.5 rounded-2xl border border-dashed border-separator p-2">
              <AnimatePresence initial={false}>
                {s.stack.map((f, i) => (
                  <motion.div
                    key={`${f.cls}-${i}-${f.why}`}
                    layout
                    initial={{ opacity: 0, y: -16, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.9 }}
                    transition={SPRING}
                    className="rounded-xl px-2.5 py-1.5 font-mono text-[12px]"
                    style={{
                      background:
                        i === s.stack.length - 1
                          ? "linear-gradient(135deg, color-mix(in oklab, var(--accent) 26%, transparent), color-mix(in oklab, var(--accent-2) 22%, transparent))"
                          : "color-mix(in oklab, var(--label-2) 9%, transparent)",
                      border: "1px solid var(--separator)",
                    }}
                  >
                    <span className="font-semibold">{f.cls}.__init__</span>
                    {i === s.stack.length - 1 && <span className="ml-1.5 text-[10.5px] text-label-2">← виконується</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
              {s.stack.length === 0 && <div className="m-auto text-[12px] text-label-3">стек порожній</div>}
            </div>
          </div>
          <div className="min-h-[70px] rounded-2xl bg-black/80 px-4 py-2.5 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
            {s.out.length === 0 && <span className="text-[#8e8e93]"># вивід</span>}
            {s.out.map((o, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} style={{ color: counts[o] > 1 && o === "Spider" ? "#ff6961" : undefined }}>
                {o}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={`${mode}-${step}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="mx-5 mt-3 min-h-[2.8em] font-mono text-[12.5px] leading-snug"
          style={{ color: last && mode !== "super" ? "#ff453a" : undefined }}
        >
          {s.msg}
        </motion.p>
      </AnimatePresence>

      <ControlBar>
        <Btn onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0}>
          <ChevronLeft className="size-4" />
        </Btn>
        <Btn variant="accent" onClick={() => setStep((x) => Math.min(snaps.length - 1, x + 1))} disabled={last}>
          Крок <ChevronRight className="size-4" />
        </Btn>
        <Btn
          onClick={() => {
            if (last) setStep(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Пауза" : "Авто"}
        </Btn>
        <Btn
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
        >
          <RotateCcw className="size-4" />
        </Btn>
        <span className="ml-auto font-mono text-[12px] text-label-2 tabular-nums">
          {step + 1}/{snaps.length}
        </span>
      </ControlBar>
    </div>
  );
}
