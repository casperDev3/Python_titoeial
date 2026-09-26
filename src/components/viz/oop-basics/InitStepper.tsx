"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";
import { CodePane, Label, SPRING } from "./shared";

type Mode = "init" | "method";

type Snap = {
  line: number;
  /** імена у глобальній області */
  globals: { name: string; ref: boolean }[];
  /** чи існує об'єкт у пам'яті */
  obj: boolean;
  /** атрибути об'єкта (__dict__) */
  dict: [string, string][];
  /** фрейм функції, що зараз виконується */
  frame: { title: string; vars: [string, string][] } | null;
  /** щойно змінений ключ */
  fresh?: string;
  say: string;
  out?: string;
};

const ADDR = "0x7f3a10";

const INIT_CODE = [
  "class Suit:",
  "    def __init__(self, name, energy):",
  "        self.name = name",
  "        self.energy = energy",
  "        self.damage = 0",
  "",
  'mark = Suit("Mark III", 80)',
];

const METHOD_CODE = [
  "class Suit:",
  "    def fire(self, cost):",
  "        self.energy -= cost",
  "        return self.energy",
  "",
  "left = mark.fire(30)",
  "print(left)",
];

const SELF = `→ ${ADDR}`;

const INIT_STEPS: Snap[] = [
  { line: 6, globals: [], obj: false, dict: [], frame: null, say: "Python бачить виклик класу `Suit(...)`. Клас можна викликати, як функцію — це і є «фабрика» об'єктів." },
  { line: 6, globals: [], obj: true, dict: [], frame: { title: "Suit.__new__(Suit)", vars: [] }, say: "Крок 1 — `__new__`: у пам'яті з'являється **порожній** об'єкт класу Suit. Його словник атрибутів ще пустий." },
  {
    line: 1, globals: [], obj: true, dict: [], fresh: "self",
    frame: { title: "Suit.__init__", vars: [["self", SELF], ["name", '"Mark III"'], ["energy", "80"]] },
    say: "Крок 2 — Python викликає `__init__` і сам підставляє новий об'єкт першим аргументом. Саме його ми і звемо `self`.",
  },
  {
    line: 2, globals: [], obj: true, dict: [["name", '"Mark III"']], fresh: "name",
    frame: { title: "Suit.__init__", vars: [["self", SELF], ["name", '"Mark III"'], ["energy", "80"]] },
    say: "`self.name = name` — записуємо в **об'єкт** (не в локальну змінну!) атрибут `name`.",
  },
  {
    line: 3, globals: [], obj: true, dict: [["name", '"Mark III"'], ["energy", "80"]], fresh: "energy",
    frame: { title: "Suit.__init__", vars: [["self", SELF], ["name", '"Mark III"'], ["energy", "80"]] },
    say: "`self.energy = energy` — ще один запис у словник атрибутів об'єкта.",
  },
  {
    line: 4, globals: [], obj: true, dict: [["name", '"Mark III"'], ["energy", "80"], ["damage", "0"]], fresh: "damage",
    frame: { title: "Suit.__init__", vars: [["self", SELF], ["name", '"Mark III"'], ["energy", "80"]] },
    say: "Атрибут не обов'язково брати з параметрів: `damage` стартує з нуля в кожного нового костюма.",
  },
  {
    line: 6, globals: [{ name: "mark", ref: true }], obj: true, dict: [["name", '"Mark III"'], ["energy", "80"], ["damage", "0"]], frame: null, fresh: "mark",
    say: "`__init__` повертає `None`, його фрейм зникає разом з локальними `name` та `energy`. А змінна `mark` отримує **посилання** на готовий об'єкт.",
  },
];

const BASE_DICT: [string, string][] = [["name", '"Mark III"'], ["energy", "80"], ["damage", "0"]];

const METHOD_STEPS: Snap[] = [
  { line: 5, globals: [{ name: "mark", ref: true }], obj: true, dict: BASE_DICT, frame: null, say: "Викликаємо `mark.fire(30)`. Спершу Python шукає ім'я `fire` в самому об'єкті — у його `__dict__` такого немає…" },
  { line: 1, globals: [{ name: "mark", ref: true }], obj: true, dict: BASE_DICT, frame: null, fresh: "fire", say: "…тож іде в клас `Suit` і знаходить там функцію `fire`. Виклик перетворюється на `Suit.fire(mark, 30)`." },
  {
    line: 1, globals: [{ name: "mark", ref: true }], obj: true, dict: BASE_DICT, fresh: "self",
    frame: { title: "Suit.fire", vars: [["self", SELF], ["cost", "30"]] },
    say: "Новий фрейм: `self` вказує на **той самий** об'єкт, що й `mark`. Два імені — один костюм.",
  },
  {
    line: 2, globals: [{ name: "mark", ref: true }], obj: true, dict: [["name", '"Mark III"'], ["energy", "50"], ["damage", "0"]], fresh: "energy",
    frame: { title: "Suit.fire", vars: [["self", SELF], ["cost", "30"]] },
    say: "`self.energy -= cost` змінює атрибут об'єкта: 80 → 50. Зміна переживе виклик, бо живе в об'єкті, а не у фреймі.",
  },
  {
    line: 3, globals: [{ name: "mark", ref: true }], obj: true, dict: [["name", '"Mark III"'], ["energy", "50"], ["damage", "0"]],
    frame: { title: "Suit.fire", vars: [["self", SELF], ["cost", "30"], ["return", "50"]] },
    say: "`return self.energy` віддає 50 назад у місце виклику.",
  },
  {
    line: 5, globals: [{ name: "mark", ref: true }, { name: "left", ref: false }], obj: true, dict: [["name", '"Mark III"'], ["energy", "50"], ["damage", "0"]], frame: null, fresh: "left",
    say: "Фрейм зник, `self` і `cost` — теж. Але `mark.energy` уже 50 назавжди, а `left` отримала повернене значення.",
  },
  {
    line: 6, globals: [{ name: "mark", ref: true }, { name: "left", ref: false }], obj: true, dict: [["name", '"Mark III"'], ["energy", "50"], ["damage", "0"]], frame: null,
    say: "Готово! Метод — це просто функція класу, яка отримує об'єкт через `self`.", out: "50",
  },
];

function md(s: string) {
  // легкий рендер **жирного** і `коду`
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
    p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong>
    : p.startsWith("`") ? <code key={i} className="inline-code">{p.slice(1, -1)}</code>
    : <span key={i}>{p}</span>,
  );
}

export function InitStepper() {
  const [mode, setMode] = useState<Mode>("init");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = mode === "init" ? INIT_STEPS : METHOD_STEPS;
  const snap = steps[step];
  const last = step >= steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (last) {
      const t = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(t);
  }, [playing, last, step]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep(0);
    setPlaying(false);
  };

  return (
    <div>
      <ControlBar>
        <Segmented
          id="oopb-init-mode"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "init", label: <span className="font-mono">Suit(...)</span> },
            { value: "method", label: <span className="font-mono">mark.fire()</span> },
          ]}
        />
        <span className="ml-auto font-mono text-[12px] text-label-2 tabular-nums">
          {step + 1}/{steps.length}
        </span>
      </ControlBar>

      <div className="grid gap-3 px-5 md:grid-cols-[1fr_1.15fr]">
        <div>
          <Label>Код</Label>
          <CodePane id="oopb-init-hl" lines={mode === "init" ? INIT_CODE : METHOD_CODE} active={snap.line} />
          {snap.out && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-xl bg-black/80 px-3 py-2 font-mono text-[12.5px] text-[#e5e5ea]"
            >
              {snap.out}
            </motion.div>
          )}
        </div>

        <div className="grid min-h-[270px] grid-cols-[auto_1fr] gap-3">
          {/* Імена + фрейм */}
          <div className="flex w-[118px] flex-col gap-3 sm:w-[140px]">
            <div>
              <Label>Глобальні імена</Label>
              <div className="flex min-h-[44px] flex-col gap-1.5">
                <AnimatePresence>
                  {snap.globals.map((g) => (
                    <motion.div
                      key={g.name}
                      layout
                      initial={{ opacity: 0, x: -10, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={SPRING}
                      className="flex items-center justify-between rounded-xl border border-separator bg-elevated/70 px-2.5 py-1.5 font-mono text-[12px]"
                      style={snap.fresh === g.name ? { boxShadow: "0 0 0 2px var(--accent)" } : undefined}
                    >
                      <span className="font-semibold">{g.name}</span>
                      <span className="text-label-2">{g.ref ? `→ ${ADDR.slice(-3)}` : "50"}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {snap.globals.length === 0 && <div className="text-[12px] text-label-3">порожньо</div>}
              </div>
            </div>
            <div>
              <Label>Фрейм виклику</Label>
              <AnimatePresence mode="popLayout">
                {snap.frame ? (
                  <motion.div
                    key={snap.frame.title}
                    initial={{ opacity: 0, y: 14, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -18, scale: 0.9, filter: "blur(4px)" }}
                    transition={SPRING}
                    className="glass-tint rounded-2xl border p-2 font-mono text-[11.5px]"
                  >
                    <div className="mb-1 truncate font-semibold" style={{ color: "var(--accent)" }}>
                      {snap.frame.title}
                    </div>
                    {snap.frame.vars.map(([k, v]) => (
                      <motion.div
                        key={k}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-between gap-1 rounded-md px-1"
                        style={snap.fresh === k ? { background: "color-mix(in oklab, var(--accent-2) 25%, transparent)" } : undefined}
                      >
                        <span>{k}</span>
                        <span className="truncate text-label-2">{v}</span>
                      </motion.div>
                    ))}
                    {snap.frame.vars.length === 0 && <div className="text-label-3">створення…</div>}
                  </motion.div>
                ) : (
                  <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-label-3">
                    немає активного виклику
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Пам'ять: клас та об'єкт */}
          <div className="flex min-w-0 flex-col gap-3">
            <div>
              <Label>Клас (креслення)</Label>
              <motion.div
                animate={{ boxShadow: snap.fresh === "fire" ? "0 0 0 2px var(--accent-2)" : "0 0 0 0px transparent" }}
                className="rounded-2xl border border-separator bg-elevated/60 p-2.5 font-mono text-[12px]"
              >
                <div className="font-semibold">Suit</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(mode === "init" ? ["__init__"] : ["__init__", "fire"]).map((m) => (
                    <span
                      key={m}
                      className="rounded-md px-1.5 py-0.5 text-[11px]"
                      style={{
                        background: snap.fresh === "fire" && m === "fire" ? "var(--accent-2)" : "color-mix(in oklab, var(--accent-2) 16%, transparent)",
                        color: snap.fresh === "fire" && m === "fire" ? "white" : undefined,
                      }}
                    >
                      ƒ {m}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="min-w-0">
              <Label>Об&apos;єкт у пам&apos;яті</Label>
              <AnimatePresence>
                {snap.obj && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="relative overflow-hidden rounded-2xl border p-2.5 font-mono text-[12px]"
                    style={{
                      borderColor: "color-mix(in oklab, var(--accent) 45%, transparent)",
                      background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 14%, transparent), color-mix(in oklab, var(--accent-2) 12%, transparent))",
                      boxShadow: snap.fresh === "self" || snap.fresh === "mark" ? "0 0 0 2px var(--accent), 0 8px 28px -8px var(--accent)" : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Suit object</span>
                      <span className="text-[11px] text-label-2">{ADDR}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-label-2">__class__ → Suit</div>
                    <div className="mt-2 rounded-xl bg-separator/50 p-1.5">
                      <div className="mb-0.5 text-[10.5px] text-label-2">__dict__</div>
                      {snap.dict.length === 0 && <div className="text-label-3">{"{ }"}</div>}
                      <AnimatePresence initial={false}>
                        {snap.dict.map(([k, v]) => (
                          <motion.div
                            key={k}
                            layout
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={SPRING}
                            className="flex justify-between gap-2 rounded-md px-1"
                            style={snap.fresh === k ? { background: "color-mix(in oklab, var(--accent) 24%, transparent)" } : undefined}
                          >
                            <span>{k}</span>
                            <motion.span key={v} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="truncate">
                              {v}
                            </motion.span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!snap.obj && <div className="text-[12px] text-label-3">ще нічого не створено</div>}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={`${mode}-${step}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mx-5 mt-3 min-h-[3.2em] text-[14px] leading-snug"
        >
          {md(snap.say)}
        </motion.p>
      </AnimatePresence>

      <ControlBar>
        <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="size-4" /> Назад
        </Btn>
        <Btn variant="accent" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} disabled={last}>
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
      </ControlBar>
    </div>
  );
}
