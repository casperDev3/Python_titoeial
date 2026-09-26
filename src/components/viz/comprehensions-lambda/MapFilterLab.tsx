"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";

const DATA = ["levi", "mikasa", "eren", "armin", "hange", "jean"];

type Op = "map" | "filter" | "sorted";
type Fn = { code: string; f: (s: string) => string | number | boolean };

const FNS: Record<Op, Fn[]> = {
  map: [
    { code: "lambda s: s.upper()", f: (s) => s.toUpperCase() },
    { code: "len", f: (s) => s.length },
    { code: "lambda s: s[0]", f: (s) => s[0] },
  ],
  filter: [
    { code: "lambda s: len(s) > 4", f: (s) => s.length > 4 },
    { code: 'lambda s: "a" in s', f: (s) => s.includes("a") },
    { code: 'lambda s: s.endswith("n")', f: (s) => s.endsWith("n") },
  ],
  sorted: [
    { code: "len", f: (s) => s.length },
    { code: "lambda s: s[-1]", f: (s) => s[s.length - 1] },
    { code: "lambda s: -len(s)", f: (s) => -s.length },
  ],
};

const py = (v: string | number | boolean) =>
  typeof v === "string" ? `'${v}'` : typeof v === "boolean" ? (v ? "True" : "False") : String(v);

function cmp(a: string | number | boolean, b: string | number | boolean) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function MapFilterLab() {
  const [op, setOp] = useState<Op>("map");
  const [fi, setFi] = useState(0);
  const [run, setRun] = useState(0); // 0 — не запущено; інакше лічильник запусків для анімації
  const fn = FNS[op][fi];
  const applied = run > 0;

  const keys = DATA.map((s) => fn.f(s));
  let out: { s: string; label: string }[] = [];
  if (op === "map") out = DATA.map((s, i) => ({ s, label: py(keys[i]) }));
  if (op === "filter") out = DATA.filter((_, i) => keys[i]).map((s) => ({ s, label: py(s) }));
  if (op === "sorted")
    out = DATA.map((s, i) => ({ s, i }))
      .sort((a, b) => cmp(keys[a.i], keys[b.i])) // стабільне, як у Python
      .map(({ s }) => ({ s, label: py(s) }));

  const call =
    op === "sorted" ? `sorted(squad, key=${fn.code})` : `list(${op}(${fn.code}, squad))`;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="cl-mfl-op"
          value={op}
          onChange={(v) => {
            setOp(v);
            setFi(0);
            setRun(0);
          }}
          options={[
            { value: "map", label: <span className="font-mono">map</span> },
            { value: "filter", label: <span className="font-mono">filter</span> },
            { value: "sorted", label: <span className="font-mono">sorted</span> },
          ]}
        />
      </ControlBar>
      <div className="flex flex-wrap gap-1.5 px-5">
        {FNS[op].map((f, i) => (
          <button
            key={f.code}
            onClick={() => {
              setFi(i);
              setRun(0);
            }}
            className="rounded-full border px-2.5 py-1 font-mono text-[12px] transition-colors"
            style={{
              borderColor: i === fi ? "var(--accent)" : "var(--separator)",
              background: i === fi ? "color-mix(in oklab, var(--accent) 16%, transparent)" : "transparent",
              color: i === fi ? "var(--label)" : "var(--label-2)",
            }}
          >
            {f.code}
          </button>
        ))}
      </div>

      <div className="mx-5 mt-3 overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2 font-mono text-[12.5px] whitespace-nowrap thin-scroll">
        <span className="text-label-3">squad = </span>
        {`[${DATA.map((s) => `'${s}'`).join(", ")}]`}
        <br />
        <span style={{ color: "var(--accent)" }}>{call}</span>
      </div>

      {/* Таблиця «елемент → f(елемент)» */}
      <div className="grid gap-1.5 px-5 pt-3 sm:grid-cols-2">
        {DATA.map((s, i) => {
          const k = keys[i];
          const dropped = op === "filter" && applied && !k;
          return (
            <motion.div
              key={s}
              animate={{ opacity: dropped ? 0.4 : 1 }}
              className="flex items-center gap-2 rounded-[12px] bg-separator/25 px-2.5 py-1.5 font-mono text-[12.5px]"
            >
              <span className={`min-w-[64px] ${dropped ? "line-through" : ""}`}>&apos;{s}&apos;</span>
              <span className="text-label-3">→</span>
              <span className="truncate text-[11.5px] text-label-3">{op === "sorted" ? "key" : "f"}</span>
              <AnimatePresence mode="wait">
                {applied && (
                  <motion.span
                    key={`${run}-${fi}-${op}`}
                    initial={{ opacity: 0, scale: 0.5, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22, delay: i * 0.09 }}
                    className="ml-auto rounded-[8px] px-2 py-0.5 font-bold"
                    style={{
                      color: typeof k === "boolean" ? "#fff" : "var(--label)",
                      background:
                        typeof k === "boolean"
                          ? k
                            ? "#30d158"
                            : "#ff453a"
                          : "color-mix(in oklab, var(--accent) 18%, transparent)",
                    }}
                  >
                    {py(k)}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Результат */}
      <div className="px-5 pt-3">
        <div className="mb-1.5 text-[11px] font-bold tracking-wider text-label-3 uppercase">
          результат{applied ? ` · ${out.length} ел.` : ""}
        </div>
        <LayoutGroup id="cl-mfl">
          <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-2xl bg-separator/25 p-2 font-mono text-[12.5px]">
            <span className="text-label-3">[</span>
            {(applied ? out : op === "sorted" ? DATA.map((s) => ({ s, label: py(s) })) : []).map((o, j) => (
              <motion.span
                key={`${op}-${o.s}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24, delay: applied ? 0.1 + j * 0.05 : 0 }}
                className="rounded-[9px] px-2 py-0.5 font-semibold"
                style={{
                  color: applied ? "#fff" : "var(--label-2)",
                  background: applied
                    ? "linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 50%, var(--accent-2)))"
                    : "var(--glass-bg)",
                }}
              >
                {o.label}
              </motion.span>
            ))}
            <span className="text-label-3">]</span>
          </div>
        </LayoutGroup>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={() => setRun((r) => r + 1)}>
          <Play className="size-4" /> Застосувати
        </Btn>
        <Btn onClick={() => setRun(0)} disabled={!applied}>
          <RotateCcw className="size-4" /> Скинути
        </Btn>
        <span className="text-[12.5px] text-label-2">
          {op === "map" && "map: та сама кількість, нові значення"}
          {op === "filter" && "filter: ті самі значення, менше елементів"}
          {op === "sorted" && "sorted: ті самі елементи, новий порядок"}
        </span>
      </ControlBar>
    </div>
  );
}
