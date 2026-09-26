"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { RefreshCw, Repeat } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";

type Mode = "import" | "from" | "as" | "star";

/** Публічні імена модуля math, які показуємо (скорочено). */
const MATH_NAMES = ["sqrt", "pi", "floor", "ceil", "factorial", "e", "tau", "isqrt", "gcd", "pow", "log", "sin"];

const MODES: Record<Mode, { stmt: string; call: string; bound: string[]; note: string }> = {
  import: {
    stmt: "import math",
    call: "math.sqrt(16)",
    bound: ["math"],
    note: "У namespace з'являється одне ім'я — `math`, яке посилається на весь об'єкт модуля. Функції беремо через крапку, тож завжди видно, звідки вони.",
  },
  from: {
    stmt: "from math import sqrt, pi",
    call: "sqrt(16)",
    bound: ["sqrt", "pi"],
    note: "Модуль все одно завантажується повністю (і потрапляє в `sys.modules`), але у твій файл копіюються лише посилання `sqrt` і `pi`. Імені `math` у файлі немає!",
  },
  as: {
    stmt: "import math as m",
    call: "m.sqrt(16)",
    bound: ["m"],
    note: "Те саме, що `import math`, але ім'я в namespace — `m`. Корисно для довгих назв: `import numpy as np`.",
  },
  star: {
    stmt: "from math import *",
    call: "sqrt(16)  # а pow — чия?",
    bound: MATH_NAMES,
    note: "Висипаються всі публічні імена. `pow` з math мовчки перекрила вбудовану `pow` — тепер `pow(2, 10, 5)` впаде з помилкою. Ось чому `*` уникають.",
  },
};

function Md({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((p, i) =>
        p.startsWith("`") ? (
          <code key={i} className="inline-code">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function ImportNamespace() {
  const [mode, setMode] = useState<Mode>("import");
  const [imports, setImports] = useState(1);
  const [execs, setExecs] = useState(1);
  const [flash, setFlash] = useState<"cache" | "reload" | null>(null);
  const m = MODES[mode];
  const bound = new Set(m.bound);

  const again = () => {
    setImports((v) => v + 1);
    setFlash("cache");
  };
  const reload = () => {
    setExecs((v) => v + 1);
    setFlash("reload");
  };

  return (
    <div>
      <ControlBar>
        <Segmented
          id="mod-ns"
          value={mode}
          onChange={(v) => {
            setMode(v);
            setFlash(null);
          }}
          options={[
            { value: "import", label: "import" },
            { value: "from", label: "from … import" },
            { value: "as", label: "as" },
            { value: "star", label: "import *" },
          ]}
        />
      </ControlBar>

      <div className="grid gap-3 px-5 sm:grid-cols-2">
        {/* модуль math */}
        <div className="rounded-2xl border border-separator p-3.5" style={{ background: "color-mix(in oklab, var(--accent-2) 8%, transparent)" }}>
          <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-label-2">
            <span>📦 модуль <span className="font-mono text-label">math</span></span>
            <span className="font-mono text-[11px]">sys.modules[&quot;math&quot;]</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MATH_NAMES.map((n) => {
              const on = mode === "import" || mode === "as" ? false : bound.has(n);
              return (
                <motion.span
                  key={n}
                  animate={{
                    scale: on ? 1.04 : 1,
                    opacity: on || mode === "import" || mode === "as" ? 1 : 0.45,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="rounded-[9px] px-2 py-1 font-mono text-[12px]"
                  style={{
                    background: on ? "color-mix(in oklab, var(--accent) 22%, transparent)" : "var(--bg-elevated)",
                    boxShadow: on ? "0 0 0 1px var(--accent)" : "0 0 0 1px var(--separator)",
                  }}
                >
                  {n}
                </motion.span>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[12px]">
            <div className="rounded-xl bg-elevated/70 px-2 py-1.5">
              <div className="text-label-3">import-ів</div>
              <motion.div key={imports} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-mono text-[18px] font-bold">
                {imports}
              </motion.div>
            </div>
            <div className="rounded-xl bg-elevated/70 px-2 py-1.5">
              <div className="text-label-3">виконань коду</div>
              <motion.div
                key={execs}
                initial={{ scale: 1.4, color: "var(--accent)" }}
                animate={{ scale: 1, color: "var(--label)" }}
                className="font-mono text-[18px] font-bold"
              >
                {execs}
              </motion.div>
            </div>
          </div>
        </div>

        {/* namespace main.py */}
        <div className="rounded-2xl border border-separator p-3.5" style={{ background: "color-mix(in oklab, var(--accent) 7%, transparent)" }}>
          <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-label-2">
            <span>📄 namespace <span className="font-mono text-label">main.py</span></span>
            <span className="font-mono text-[11px]">globals()</span>
          </div>
          <div className="mb-2 rounded-xl bg-black/80 px-3 py-2 font-mono text-[12.5px] text-[#e5e5ea]">
            <div>
              <span style={{ color: "var(--accent)" }}>{m.stmt}</span>
            </div>
            <div className="text-[#a1a1aa]">{m.call}</div>
          </div>
          <div className="flex min-h-[86px] flex-wrap content-start gap-1.5">
            <span className="rounded-[9px] bg-elevated/70 px-2 py-1 font-mono text-[12px] text-label-3">__name__</span>
            <AnimatePresence mode="popLayout">
              {m.bound.map((n, i) => (
                <motion.span
                  layout
                  key={`${mode}-${n}`}
                  initial={{ opacity: 0, x: -40, scale: 0.6 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26, delay: i * 0.035 }}
                  className="rounded-[9px] px-2 py-1 font-mono text-[12px] font-semibold text-white"
                  style={{
                    background:
                      mode === "star" && n === "pow"
                        ? "#ff453a"
                        : "linear-gradient(135deg, var(--accent), var(--accent-2))",
                  }}
                >
                  {n}
                  {(mode === "import" || mode === "as") && <span className="font-normal opacity-80"> → &lt;module&gt;</span>}
                  {mode === "star" && n === "pow" && <span className="font-normal"> ⚠ перекрито</span>}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mx-5 mt-3 min-h-[64px] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug" style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={flash ?? mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {flash === "cache" ? (
              <Md text="Повторний `import` не виконує модуль знову: Python знаходить `math` у кеші `sys.modules` і просто прив'язує ім'я. Лічильник виконань не змінився." />
            ) : flash === "reload" ? (
              <Md text="`importlib.reload(math)` примусово виконує код модуля ще раз — зручно в REPL, коли ти змінив свій файл і не хочеш перезапускати інтерпретатор." />
            ) : (
              <Md text={m.note} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={again}>
          <Repeat className="size-4" /> Імпортувати ще раз
        </Btn>
        <Btn onClick={reload}>
          <RefreshCw className="size-4" /> importlib.reload
        </Btn>
      </ControlBar>
    </div>
  );
}
