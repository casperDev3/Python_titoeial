"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { chars, pyCapitalize, pyRepr, pySwapcase, pyTitle } from "./util";

type Method = {
  id: string;
  call: string;
  run: (s: string) => string | string[];
  note: string;
};

const METHODS: Method[] = [
  { id: "upper", call: ".upper()", run: (s) => s.toUpperCase(), note: "усі літери великі" },
  { id: "lower", call: ".lower()", run: (s) => s.toLowerCase(), note: "усі літери малі" },
  { id: "title", call: ".title()", run: pyTitle, note: "кожне слово з великої" },
  { id: "capitalize", call: ".capitalize()", run: pyCapitalize, note: "лише перша літера рядка велика" },
  { id: "swapcase", call: ".swapcase()", run: pySwapcase, note: "регістр навпаки" },
  { id: "strip", call: ".strip()", run: (s) => s.trim(), note: "прибирає пробіли по краях" },
  { id: "replace", call: '.replace("o", "0")', run: (s) => s.split("o").join("0"), note: "замінює всі входження" },
  { id: "split", call: ".split()", run: (s) => s.split(/\s+/).filter(Boolean), note: "список слів — вже не рядок!" },
  { id: "join", call: '"-".join(s.split())', run: (s) => s.split(/\s+/).filter(Boolean).join("-"), note: "слова через дефіс — готовий slug" },
  { id: "reverse", call: "[::-1]", run: (s) => chars(s).reverse().join(""), note: "зріз з кроком -1 розвертає рядок" },
];

const spring = { type: "spring" as const, stiffness: 520, damping: 32 };

function Tiles({ text, tone }: { text: string; tone: "result" | "orig" }) {
  const cs = chars(text);
  return (
    <div className="flex flex-wrap justify-center gap-[3px]">
      <AnimatePresence mode="popLayout" initial={false}>
        {cs.map((ch, i) => {
          const space = ch === " ";
          return (
            <motion.span
              layout
              key={`${i}-${ch}`}
              initial={{ rotateX: -90, opacity: 0, y: -6 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              exit={{ rotateX: 90, opacity: 0, scale: 0.6 }}
              transition={{ ...spring, delay: Math.min(i * 0.012, 0.3) }}
              className="grid h-8 min-w-[22px] place-items-center rounded-[8px] px-1 font-mono text-[15px] font-bold"
              style={{
                background:
                  tone === "result"
                    ? space
                      ? "color-mix(in oklab, var(--accent) 10%, transparent)"
                      : "linear-gradient(160deg, color-mix(in oklab, var(--accent) 85%, white), var(--accent-2))"
                    : "color-mix(in oklab, var(--label) 6%, transparent)",
                color: tone === "result" && !space ? "white" : space ? "var(--label-3)" : "var(--label)",
                transformPerspective: 400,
              }}
            >
              {space ? "␣" : ch}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function MethodPrism() {
  const [text, setText] = useState("  sailor moon, make up!  ");
  const [mid, setMid] = useState("title");
  const method = METHODS.find((m) => m.id === mid) ?? METHODS[0];
  const result = method.run(text);
  const isList = Array.isArray(result);
  const code = method.id === "join" ? method.call : `s${method.call}`;
  const reprResult = isList ? `[${result.map(pyRepr).join(", ")}]` : pyRepr(result);

  return (
    <div className="pb-4">
      <div className="px-5">
        <label className="flex items-center gap-2 rounded-[14px] border border-separator px-3 py-2">
          <span className="font-mono text-[13px] font-bold text-label-2">s =</span>
          <input
            value={text}
            maxLength={40}
            onChange={(e) => setText(e.target.value)}
            className="min-w-0 flex-1 bg-transparent font-mono text-[14px] outline-none"
            spellCheck={false}
            aria-label="Рядок для трансформації"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5 px-5 pt-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMid(m.id)}
            className="relative rounded-full px-2.5 py-1 font-mono text-[12px] font-semibold"
            style={{ background: m.id === mid ? "transparent" : "color-mix(in oklab, var(--label) 6%, transparent)" }}
          >
            {m.id === mid && (
              <motion.span
                layoutId="prism-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                transition={spring}
              />
            )}
            <span
              className="relative"
              style={{ color: m.id === mid ? "white" : "var(--label)" }}
            >
              {m.call}
            </span>
          </button>
        ))}
      </div>

      {/* призма */}
      <div className="relative mx-5 mt-4 overflow-hidden rounded-[20px] border border-separator px-3 py-5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 70% at 50% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 70%), radial-gradient(50% 70% at 50% 100%, color-mix(in oklab, var(--accent-2) 16%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mb-3 text-center font-mono text-[13px] font-semibold">
          <span className="text-label-2">&gt;&gt;&gt; </span>
          {code}
          <span className="ml-2 text-[11.5px] font-normal text-label-2">— {method.note}</span>
        </div>

        <div className="relative min-h-[72px]">
          {isList ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[20px] text-label-2">[</span>
              <AnimatePresence mode="popLayout">
                {result.map((w, i) => (
                  <motion.div
                    key={`${i}-${w}`}
                    layout
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ ...spring, delay: i * 0.05 }}
                    className="rounded-[12px] p-1"
                    style={{ border: "1.5px dashed color-mix(in oklab, var(--accent) 60%, transparent)" }}
                  >
                    <Tiles text={w} tone="result" />
                  </motion.div>
                ))}
              </AnimatePresence>
              <span className="font-mono text-[20px] text-label-2">]</span>
            </div>
          ) : (
            <Tiles key="res" text={result} tone="result" />
          )}
        </div>

        <div className="relative mt-3 text-center font-mono text-[12.5px] break-all text-label">{reprResult}</div>
      </div>

      <div className="mx-5 mt-3 rounded-[16px] px-3 py-3" style={{ background: "color-mix(in oklab, var(--label) 4%, transparent)" }}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-label-2">
          <span>
            <b className="text-label">Оригінал s</b> — без змін 🔒
          </span>
          <span className="font-mono">
            len(s) = {chars(text).length} → {isList ? `len(список) = ${result.length}` : `len(результат) = ${chars(result).length}`}
          </span>
        </div>
        <Tiles text={text} tone="orig" />
      </div>
    </div>
  );
}
