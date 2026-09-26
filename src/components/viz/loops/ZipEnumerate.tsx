"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Btn, ControlBar, Segmented } from "../kit";

type Mode = "enumerate" | "zip" | "strict";

const PARTY = ["Субару", "Емілія", "Рем", "Беатріс"];
const ROLES = ["гравець", "маг", "мечник"];

const spring = { type: "spring", stiffness: 460, damping: 30 } as const;

export function ZipEnumerate() {
  const [mode, setMode] = useState<Mode>("zip");
  const [start, setStart] = useState<"0" | "1">("0");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // скільки кроків у режимі: enumerate — 4 елементи; zip — 3 пари + 1 крок «зупинка»
  const total = mode === "enumerate" ? PARTY.length : ROLES.length + 1;
  const done = step >= total;
  const running = playing && !done;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((s) => s + 1), 750);
    return () => clearTimeout(t);
  }, [running, step]);

  const reset = (play: boolean) => {
    setStep(0);
    setPlaying(play);
  };

  const s0 = Number(start);
  const pairs = mode === "enumerate" ? PARTY.map((p, i) => [String(i + s0), p]) : ROLES.map((r, i) => [PARTY[i], r]);
  const produced = pairs.slice(0, Math.min(step, mode === "enumerate" ? PARTY.length : ROLES.length));
  const stopped = mode !== "enumerate" && step > ROLES.length;
  const error = stopped && mode === "strict";

  const call =
    mode === "enumerate"
      ? `enumerate(party${s0 ? ", start=1" : ""})`
      : `zip(party, roles${mode === "strict" ? ", strict=True" : ""})`;

  return (
    <div>
      <div className="mx-5 mb-3 overflow-x-auto rounded-2xl border border-separator px-4 py-2.5 font-mono text-[12.5px] whitespace-nowrap">
        <span style={{ color: "var(--accent)" }} className="font-semibold">for</span>{" "}
        {mode === "enumerate" ? "i, name" : "name, role"}{" "}
        <span style={{ color: "var(--accent)" }} className="font-semibold">in</span> {call}:
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-start gap-1 px-5 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]">
        {/* ліва колонка */}
        <div className="flex flex-col gap-1.5">
          <div className="text-center font-mono text-[11px] text-label-2">{mode === "enumerate" ? "лічильник" : "party"}</div>
          {PARTY.map((p, i) => {
            const lit = i < step;
            const orphan = mode !== "enumerate" && i >= ROLES.length;
            const label = mode === "enumerate" ? String(i + s0) : p;
            return (
              <motion.div
                key={mode + i}
                animate={{
                  opacity: orphan && stopped ? 0.35 : 1,
                  x: lit && !orphan ? 6 : 0,
                }}
                transition={spring}
                className="h-[38px] truncate rounded-xl border px-2 text-center text-[13px] leading-[36px] font-semibold"
                style={{
                  borderColor: lit && !orphan ? "var(--accent)" : orphan && stopped ? "#ff9f0a" : "var(--separator)",
                  borderStyle: orphan && stopped ? "dashed" : "solid",
                  background: "var(--glass-bg)",
                  fontFamily: mode === "enumerate" ? "var(--font-mono, ui-monospace)" : undefined,
                }}
              >
                {label}
              </motion.div>
            );
          })}
        </div>

        {/* «застібка» */}
        <div className="flex flex-col gap-1.5">
          <div className="text-center text-[11px] opacity-0">·</div>
          {PARTY.map((_, i) => {
            const on = i < step && (mode === "enumerate" || i < ROLES.length);
            return (
              <div key={i} className="relative grid h-[38px] place-items-center">
                <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-separator" />
                <motion.div
                  initial={false}
                  animate={{ scaleX: on ? 1 : 0 }}
                  transition={spring}
                  className="absolute inset-x-0 top-1/2 h-[3px] origin-left -translate-y-1/2 rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
                />
                <motion.span
                  initial={false}
                  animate={{ scale: on ? 1 : 0.6, opacity: on ? 1 : 0.4 }}
                  transition={spring}
                  className="relative grid size-5 place-items-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: on ? "var(--accent-2)" : "var(--separator)" }}
                >
                  {i + 1}
                </motion.span>
              </div>
            );
          })}
        </div>

        {/* права колонка */}
        <div className="flex flex-col gap-1.5">
          <div className="text-center font-mono text-[11px] text-label-2">{mode === "enumerate" ? "party" : "roles"}</div>
          {(mode === "enumerate" ? PARTY : ROLES).map((r, i) => {
            const lit = i < step;
            return (
              <motion.div
                key={mode + r + i}
                animate={{ x: lit ? -6 : 0 }}
                transition={spring}
                className="h-[38px] truncate rounded-xl border px-2 text-center text-[13px] leading-[36px] font-semibold"
                style={{ borderColor: lit ? "var(--accent-2)" : "var(--separator)", background: "var(--glass-bg)" }}
              >
                {r}
              </motion.div>
            );
          })}
          {mode !== "enumerate" && (
            <div className="grid h-[38px] place-items-center rounded-xl border border-dashed border-separator text-[11px] text-label-3">
              порожньо
            </div>
          )}
        </div>
      </div>

      {/* результат */}
      <div className="mx-5 mt-3 flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-2xl px-3 py-2" style={{ background: "color-mix(in oklab, var(--accent) 9%, transparent)" }}>
        <span className="text-[12px] font-semibold text-label-2">видано:</span>
        <AnimatePresence mode="popLayout">
          {produced.map(([a, b], i) => (
            <motion.span
              key={mode + start + i}
              initial={{ opacity: 0, y: -12, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={spring}
              className="rounded-lg px-2 py-0.5 font-mono text-[12px]"
              style={{ background: "var(--glass-bg-strong)", boxShadow: "inset 0 0 0 1px var(--separator)" }}
            >
              ({mode === "enumerate" ? a : `'${a}'`}, &apos;{b}&apos;)
            </motion.span>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {stopped && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[12px] font-semibold"
              style={{ color: error ? "#ff453a" : "#ff9f0a" }}
            >
              {error
                ? "ValueError: zip() argument 2 is shorter than argument 1"
                : "roles закінчились → zip тихо зупинився, «Беатріс» без пари"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <ControlBar>
        <Segmented
          id="zip-mode"
          value={mode}
          onChange={(v) => {
            setMode(v);
            reset(false);
          }}
          options={[
            { value: "enumerate", label: "enumerate" },
            { value: "zip", label: "zip" },
            { value: "strict", label: "strict=True" },
          ]}
        />
        {mode === "enumerate" && (
          <Segmented
            id="zip-start"
            value={start}
            onChange={(v) => {
              setStart(v);
              reset(false);
            }}
            options={[
              { value: "0", label: "start=0" },
              { value: "1", label: "start=1" },
            ]}
          />
        )}
        <Btn onClick={() => setStep((s) => Math.min(s + 1, total))} disabled={done}>
          Крок
        </Btn>
        <Btn variant="accent" onClick={() => reset(true)}>
          Грати
        </Btn>
      </ControlBar>
    </div>
  );
}
