"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ControlBar, Segmented } from "../kit";

type Arg = { id: string; code: string; text: string };

const ARGS: Arg[] = [
  { id: "n", code: '"Наруто"', text: "Наруто" },
  { id: "s", code: '"Саске"', text: "Саске" },
  { id: "k", code: '"Сакура"', text: "Сакура" },
  { id: "7", code: "7", text: "7" },
  { id: "t", code: "True", text: "True" },
];

const SEPS = [
  { value: "sp", label: "␣ пробіл", py: '" "', raw: " " },
  { value: "none", label: '""', py: '""', raw: "" },
  { value: "dash", label: '"-"', py: '"-"', raw: "-" },
  { value: "comma", label: '", "', py: '", "', raw: ", " },
  { value: "nl", label: "\\n", py: '"\\n"', raw: "\n" },
] as const;

const ENDS = [
  { value: "nl", label: "\\n", py: '"\\n"', raw: "\n" },
  { value: "none", label: '""', py: '""', raw: "" },
  { value: "bang", label: '"!"', py: '"!"', raw: "!" },
  { value: "dots", label: '"... "', py: '"... "', raw: "... " },
] as const;

type SepV = (typeof SEPS)[number]["value"];
type EndV = (typeof ENDS)[number]["value"];

type Piece = { kind: "text" | "sep" | "end" | "next"; s: string; key: string };

const show = (s: string) => s.replace(/ /g, "␣");

export function PrintPlayground() {
  const [on, setOn] = useState<string[]>(["n", "s", "7"]);
  const [sep, setSep] = useState<SepV>("sp");
  const [end, setEnd] = useState<EndV>("nl");

  const sepO = SEPS.find((s) => s.value === sep)!;
  const endO = ENDS.find((e) => e.value === end)!;
  const args = ARGS.filter((a) => on.includes(a.id));

  const toggle = (id: string) =>
    setOn((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].sort((a, b) => ARGS.findIndex((x) => x.id === a) - ARGS.findIndex((x) => x.id === b))));

  const kw: string[] = [];
  if (sep !== "sp") kw.push(`sep=${sepO.py}`);
  if (end !== "nl") kw.push(`end=${endO.py}`);
  const call = `print(${[...args.map((a) => a.code), ...kw].join(", ")})`;

  // Збираємо вивід з «розміченими» шматками
  const pieces: Piece[] = [];
  args.forEach((a, i) => {
    if (i > 0) pieces.push({ kind: "sep", s: sepO.raw, key: `sep-${i}` });
    pieces.push({ kind: "text", s: a.text, key: `t-${a.id}` });
  });
  pieces.push({ kind: "end", s: endO.raw, key: "end" });
  pieces.push({ kind: "next", s: "Даттебайо!", key: "next" });

  // Розбиваємо на рядки по \n
  const lines: Piece[][] = [[]];
  for (const p of pieces) {
    if (p.s === "\n") {
      lines[lines.length - 1].push({ ...p, s: "⏎" });
      lines.push([]);
    } else lines[lines.length - 1].push(p);
  }

  return (
    <div>
      <div className="px-5 pt-1">
        <div className="mb-2 text-[12px] font-semibold tracking-wider text-label-3 uppercase">Аргументи</div>
        <div className="flex flex-wrap gap-2">
          {ARGS.map((a) => {
            const active = on.includes(a.id);
            return (
              <motion.button
                key={a.id}
                onClick={() => toggle(a.id)}
                whileTap={{ scale: 0.92 }}
                animate={{ scale: active ? 1 : 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="rounded-full border px-3 py-1.5 font-mono text-[13px] font-semibold"
                style={{
                  background: active ? "color-mix(in oklab, var(--accent) 20%, var(--glass-bg))" : "var(--glass-bg)",
                  borderColor: active ? "var(--accent)" : "var(--glass-border)",
                  color: active ? "var(--label)" : "var(--label-3)",
                }}
              >
                {a.code}
              </motion.button>
            );
          })}
        </div>
      </div>

      <ControlBar>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-9 font-mono text-[13px] text-label-2">sep</span>
            <Segmented id="intro-sep" value={sep} onChange={setSep} options={SEPS.map((s) => ({ value: s.value, label: s.label }))} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-9 font-mono text-[13px] text-label-2">end</span>
            <Segmented id="intro-end" value={end} onChange={setEnd} options={ENDS.map((e) => ({ value: e.value, label: e.label }))} />
          </div>
        </div>
      </ControlBar>

      <div className="mx-5 overflow-hidden rounded-2xl border border-separator" style={{ background: "var(--code-bg)" }}>
        <div className="thin-scroll overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
          <motion.div layout className="whitespace-nowrap">
            <span style={{ color: "var(--accent)" }}>{call}</span>
          </motion.div>
          <div className="whitespace-nowrap text-label-2">print(&quot;Даттебайо!&quot;)</div>
        </div>
      </div>

      <div className="mx-5 mt-3 mb-4 min-h-[112px] rounded-2xl bg-black/80 px-4 py-3 font-mono text-[13px] leading-[1.9] text-[#e5e5ea]">
        <LayoutGroup>
          {lines.map((line, li) => (
            <motion.div layout key={li} className="flex min-h-[1.9em] flex-wrap items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {line.map((p) => (
                  <motion.span
                    layout
                    key={p.key}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 520, damping: 34 }}
                    className={
                      p.kind === "sep" || p.kind === "end"
                        ? "mx-px rounded-md px-1 text-[12px] font-bold"
                        : p.kind === "next"
                          ? "text-[#98989f]"
                          : ""
                    }
                    style={
                      p.kind === "sep"
                        ? { background: "color-mix(in oklab, var(--accent) 45%, transparent)", color: "#fff" }
                        : p.kind === "end"
                          ? { background: "color-mix(in oklab, var(--accent-2) 55%, transparent)", color: "#fff" }
                          : undefined
                    }
                  >
                    {p.kind === "sep" || p.kind === "end" ? (p.s === "" ? "∅" : show(p.s)) : p.s}
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          ))}
        </LayoutGroup>
      </div>
      <div className="flex flex-wrap gap-3 px-5 pb-4 text-[12px] text-label-2">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm" style={{ background: "var(--accent)" }} /> sep — між аргументами
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm" style={{ background: "var(--accent-2)" }} /> end — один раз у кінці
        </span>
        <span className="flex items-center gap-1.5">∅ — порожній рядок</span>
      </div>
    </div>
  );
}
