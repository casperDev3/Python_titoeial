"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Btn, ControlBar } from "../kit";
import { tokenize } from "./CodePane";

type Part = { lit: string } | { cap: string } | { star: string };
type Pattern = { src: string; parts: Part[] | null; ret: (b: Record<string, string>) => string };

const CASES: Pattern[] = [
  { src: 'case ["quit"]:', parts: [{ lit: "quit" }], ret: () => '"вихід"' },
  { src: 'case ["go", direction]:', parts: [{ lit: "go" }, { cap: "direction" }], ret: (b) => `"іду на ${unq(b.direction)}"` },
  {
    src: 'case ["write", name, *rest]:',
    parts: [{ lit: "write" }, { cap: "name" }, { star: "rest" }],
    ret: (b) => `"записую ${unq(b.name)}, деталі: ${b.rest}"`,
  },
  { src: "case []:", parts: [], ret: () => '"порожня команда"' },
  { src: "case _:", parts: null, ret: () => '"невідома команда"' },
];

const SUBJECTS = ["quit", "go north", "write Lind heart attack", "", "dance now please", "go"];

const unq = (s: string) => s.replace(/^'|'$/g, "");

type Result = { ok: boolean; why: string; binds: Record<string, string> };

const q = (s: string) => `'${s}'`;
const listRepr = (xs: string[]) => `[${xs.map(q).join(", ")}]`;

function tryMatch(p: Pattern, words: string[]): Result {
  if (p.parts === null) return { ok: true, why: "_ збігається з будь-чим", binds: {} };
  const star = p.parts.findIndex((x) => "star" in x);
  const fixed = star === -1 ? p.parts.length : p.parts.length - 1;
  if (star === -1 && words.length !== fixed)
    return { ok: false, why: `довжина ${words.length} ≠ ${fixed}`, binds: {} };
  if (star !== -1 && words.length < fixed)
    return { ok: false, why: `потрібно ≥ ${fixed} елементи, є ${words.length}`, binds: {} };
  const binds: Record<string, string> = {};
  for (let i = 0; i < p.parts.length; i++) {
    const part = p.parts[i];
    if ("lit" in part) {
      if (words[i] !== part.lit) return { ok: false, why: `${q(words[i])} ≠ ${q(part.lit)}`, binds: {} };
    } else if ("cap" in part) binds[part.cap] = q(words[i]);
    else binds[part.star] = listRepr(words.slice(i));
  }
  return { ok: true, why: p.parts.length === 0 ? "список порожній" : "структура збіглася", binds };
}

export function MatchMachine() {
  const [subject, setSubject] = useState(SUBJECTS[2]);
  const [step, setStep] = useState(0);
  const words = subject.split(" ").filter(Boolean);
  const results = CASES.map((c) => tryMatch(c, words));
  const hit = results.findIndex((r) => r.ok);
  const done = step > hit;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 350 : 650);
    return () => clearTimeout(t);
  }, [step, done]);

  const pick = (s: string) => {
    setSubject(s);
    setStep(0);
  };

  const binds = done ? results[hit].binds : {};
  const current = Math.min(step - 1, hit);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-5 pt-1 pb-3">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => pick(s)}
            className="rounded-full border px-3 py-1 font-mono text-[12.5px] transition-colors"
            style={{
              borderColor: s === subject ? "var(--accent)" : "var(--separator)",
              background: s === subject ? "color-mix(in oklab, var(--accent) 14%, transparent)" : "transparent",
            }}
          >
            {s === "" ? '""' : `"${s}"`}
          </button>
        ))}
      </div>

      <div className="mx-5 mb-3 rounded-2xl border border-separator px-4 py-2.5 font-mono text-[13px]">
        <span className="text-label-2">match </span>
        <span>command.split()</span>
        <span className="text-label-2"> → </span>
        <motion.b key={subject} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "var(--accent-2)" }}>
          {listRepr(words)}
        </motion.b>
      </div>

      <div className="flex flex-col gap-1.5 px-5">
        {CASES.map((c, i) => {
          const r = results[i];
          const reached = i < step;
          const isHit = reached && i === hit;
          const isActive = i === current && !done;
          const unreached = done && i > hit;
          return (
            <motion.div
              key={c.src}
              animate={{ opacity: unreached ? 0.35 : 1, x: isActive ? 4 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative flex flex-wrap items-center gap-x-3 gap-y-1 overflow-hidden rounded-xl border px-3 py-2"
              style={{
                borderColor: isHit ? "#30d158" : reached && !r.ok ? "color-mix(in oklab, var(--accent) 50%, transparent)" : "var(--separator)",
                background: isHit ? "color-mix(in oklab, #30d158 12%, var(--glass-bg))" : "var(--glass-bg)",
              }}
            >
              <span
                className="grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white transition-colors duration-300"
                style={{
                  background: !reached ? "var(--separator)" : r.ok ? "#30d158" : "var(--accent)",
                }}
              >
                {!reached ? i + 1 : r.ok ? "✓" : "✗"}
              </span>
              <code className="font-mono text-[13px] whitespace-pre">{tokenize(c.src, `mm-${i}`)}</code>
              <AnimatePresence>
                {reached && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="ml-auto text-[12px] text-label-2"
                  >
                    {r.why}
                  </motion.span>
                )}
                {unreached && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto text-[12px] text-label-3">
                    не перевіряється
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mx-5 mt-3 mb-1 flex min-h-[46px] flex-wrap items-center gap-2 rounded-2xl px-3 py-2"
        style={{ background: "color-mix(in oklab, var(--accent-2) 9%, transparent)" }}>
        <span className="text-[12px] font-semibold text-label-2">Захоплено:</span>
        <AnimatePresence mode="popLayout">
          {Object.entries(binds).map(([k, v], i) => (
            <motion.span
              key={subject + k}
              initial={{ opacity: 0, scale: 0.6, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 460, damping: 24, delay: i * 0.12 }}
              className="rounded-lg px-2 py-0.5 font-mono text-[12.5px] text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
            >
              {k} = {v}
            </motion.span>
          ))}
        </AnimatePresence>
        {done && Object.keys(binds).length === 0 && <span className="text-[12px] text-label-3">нічого</span>}
        {done && (
          <motion.span
            key={`ret-${subject}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto font-mono text-[12.5px] text-label-2"
          >
            return {CASES[hit].ret(binds)}
          </motion.span>
        )}
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={() => setStep(0)}>
          Зіставити ще раз
        </Btn>
        <span className="text-[12px] text-label-2">Кейси перевіряються згори вниз — до першого збігу</span>
      </ControlBar>
    </div>
  );
}
