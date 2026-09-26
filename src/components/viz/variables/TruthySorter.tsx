"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Btn, ControlBar } from "../kit";

type Item = { id: string; code: string; truthy: boolean; why: string };

const ITEMS: Item[] = [
  { id: "0", code: "0", truthy: false, why: "Нуль — falsy." },
  { id: "42", code: "42", truthy: true, why: "Будь-яке ненульове число — truthy." },
  { id: "-1", code: "-1", truthy: true, why: "Від'ємні числа теж ненульові — truthy." },
  { id: "0.0", code: "0.0", truthy: false, why: "0.0 — теж нуль, просто float." },
  { id: "empty", code: '""', truthy: false, why: "Порожній рядок — falsy." },
  { id: "space", code: '" "', truthy: true, why: "Пробіл — це символ, рядок непорожній." },
  { id: "s0", code: '"0"', truthy: true, why: "Рядок з символом «0» — непорожній, отже truthy." },
  { id: "sFalse", code: '"False"', truthy: true, why: "Текст «False» — все одно непорожній рядок." },
  { id: "none", code: "None", truthy: false, why: "None — завжди falsy." },
  { id: "list", code: "[]", truthy: false, why: "Порожній список — falsy." },
  { id: "list0", code: "[0]", truthy: true, why: "Список з одним елементом (хай і нулем) — непорожній." },
  { id: "dict", code: "{}", truthy: false, why: "Порожній словник — falsy." },
];

type Where = "pool" | "truthy" | "falsy";

const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

export function TruthySorter() {
  const [where, setWhere] = useState<Record<string, Where>>({});
  const [selected, setSelected] = useState<string | null>("s0");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(0);

  const pos = (id: string): Where => where[id] ?? "pool";
  const sel = ITEMS.find((i) => i.id === selected) ?? null;

  const guess = (g: boolean) => {
    if (!sel) return;
    const ok = sel.truthy === g;
    setWhere((w) => ({ ...w, [sel.id]: sel.truthy ? "truthy" : "falsy" }));
    setMsg({ ok, text: `bool(${sel.code}) → ${sel.truthy ? "True" : "False"}. ${sel.why}` });
    if (ok) setScore((s) => s + 1);
    else setShake((s) => s + 1);
    const next = ITEMS.find((i) => i.id !== sel.id && pos(i.id) === "pool");
    setSelected(next ? next.id : null);
  };

  const reset = () => {
    setWhere({});
    setSelected("s0");
    setMsg(null);
    setScore(0);
  };

  const chip = (it: Item) => {
    const p = pos(it.id);
    const isSel = selected === it.id;
    return (
      <motion.button
        layout
        layoutId={`truthy-${it.id}`}
        key={it.id}
        transition={spring}
        whileTap={{ scale: 0.92 }}
        disabled={p !== "pool"}
        onClick={() => setSelected(it.id)}
        className="rounded-[12px] border px-2.5 py-1.5 font-mono text-[13px] font-semibold"
        style={{
          background:
            p === "truthy"
              ? "rgb(48 209 88 / 0.16)"
              : p === "falsy"
                ? "rgb(255 69 58 / 0.14)"
                : isSel
                  ? "color-mix(in oklab, var(--accent) 24%, var(--bg-elevated))"
                  : "var(--bg-elevated)",
          borderColor: isSel ? "var(--accent)" : "var(--separator)",
          boxShadow: isSel ? "0 0 0 3px color-mix(in oklab, var(--accent) 25%, transparent)" : undefined,
        }}
      >
        {it.code}
      </motion.button>
    );
  };

  const bins: { key: "truthy" | "falsy"; title: string; color: string }[] = [
    { key: "truthy", title: "Truthy ✓", color: "#30d158" },
    { key: "falsy", title: "Falsy ✗", color: "#ff453a" },
  ];

  const total = ITEMS.length;
  const placed = Object.keys(where).length;

  return (
    <div>
      <LayoutGroup id="truthy-sorter">
        <div className="px-5 pt-1">
          <div className="mb-2 flex items-center justify-between text-[12px] font-semibold tracking-wider text-label-3 uppercase">
            <span>Значення</span>
            <span className="normal-case tracking-normal">
              Рівень сили:{" "}
              <motion.span key={score} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="inline-block font-mono text-label" style={{ color: "var(--accent)" }}>
                {score * 1000}
              </motion.span>
            </span>
          </div>
          <div className="flex min-h-[44px] flex-wrap gap-1.5">{ITEMS.filter((i) => pos(i.id) === "pool").map(chip)}</div>
        </div>

        <ControlBar>
          <motion.div key={shake} animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.35 }} className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] text-label-2">bool({sel ? sel.code : "…"}) →</span>
            <Btn variant="accent" onClick={() => guess(true)} disabled={!sel}>
              True
            </Btn>
            <Btn onClick={() => guess(false)} disabled={!sel}>
              False
            </Btn>
          </motion.div>
          <Btn onClick={reset}><span aria-hidden>↺</span><span className="sr-only">Скинути</span></Btn>
        </ControlBar>

        <div className="grid grid-cols-2 gap-3 px-5">
          {bins.map((b) => (
            <div
              key={b.key}
              className="min-h-[108px] rounded-2xl border p-3"
              style={{ borderColor: `${b.color}55`, background: `color-mix(in oklab, ${b.color} 7%, var(--glass-bg))` }}
            >
              <div className="mb-2 text-[13px] font-bold" style={{ color: b.color }}>
                {b.title}
              </div>
              <div className="flex flex-wrap gap-1.5">{ITEMS.filter((i) => pos(i.id) === b.key).map(chip)}</div>
            </div>
          ))}
        </div>
      </LayoutGroup>

      <div className="px-5 pt-3 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={msg?.text ?? "hint"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={spring}
            className="rounded-2xl px-4 py-2.5 text-[13.5px]"
            style={{
              background: !msg ? "var(--glass-bg)" : msg.ok ? "rgb(48 209 88 / 0.14)" : "rgb(255 159 10 / 0.16)",
            }}
          >
            {!msg
              ? "Обери значення і натисни True чи False — що поверне bool()?"
              : placed === total
                ? `Усі ${total} розсортовано! Рівень сили: ${score * 1000}${score === total ? " — це більше 9000! 🐉" : ""}`
                : `${msg.ok ? "Так! " : "Майже… "}${msg.text}`}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
