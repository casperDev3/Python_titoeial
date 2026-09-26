"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { PackageOpen, Undo2 } from "lucide-react";
import { Btn, ControlBar, Segmented, Slider } from "../kit";

type Pattern = "abc" | "rest" | "mid" | "last";

const PATTERNS: Record<Pattern, { targets: string[]; label: string }> = {
  abc: { targets: ["a", "b", "c"], label: "a, b, c" },
  rest: { targets: ["first", "*rest"], label: "first, *rest" },
  mid: { targets: ["first", "*mid", "last"], label: "first, *mid, last" },
  last: { targets: ["*_", "boss"], label: "*_, boss" },
};

const POOL = ["ORA", "MUDA", "Yare", "Daze", "Za", "Warudo"];

type Plan = { ok: true; slots: number[][] } | { ok: false; error: string };

function plan(targets: string[], n: number): Plan {
  const star = targets.findIndex((t) => t.startsWith("*"));
  const req = targets.length - (star >= 0 ? 1 : 0);
  const idx = Array.from({ length: n }, (_, i) => i);
  if (star < 0) {
    if (n > req) return { ok: false, error: `ValueError: too many values to unpack (expected ${req}, got ${n})` };
    if (n < req) return { ok: false, error: `ValueError: not enough values to unpack (expected ${req}, got ${n})` };
    return { ok: true, slots: idx.map((i) => [i]) };
  }
  if (n < req) return { ok: false, error: `ValueError: not enough values to unpack (expected at least ${req}, got ${n})` };
  const after = targets.length - star - 1;
  const slots: number[][] = [];
  for (let t = 0; t < star; t++) slots.push([t]);
  slots.push(idx.slice(star, n - after));
  for (let t = 0; t < after; t++) slots.push([n - after + t]);
  return { ok: true, slots };
}

function Chip({ i }: { i: number }) {
  return (
    <motion.span
      layoutId={`unp-${i}`}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="inline-flex items-center rounded-[10px] px-2.5 py-1 font-mono text-[12.5px] font-semibold text-white shadow-md"
      style={{ background: `linear-gradient(135deg, var(--accent), var(--accent-2))`, filter: `hue-rotate(${i * 14}deg)` }}
    >
      &quot;{POOL[i]}&quot;
    </motion.span>
  );
}

export function UnpackLab() {
  const [pattern, setPattern] = useState<Pattern>("mid");
  const [n, setN] = useState(5);
  const [packed, setPacked] = useState(true);
  const [shake, setShake] = useState(0);
  const { targets, label } = PATTERNS[pattern];
  const p = plan(targets, n);
  const unpacked = !packed && p.ok;

  const act = () => {
    if (!packed) return setPacked(true);
    if (!p.ok) return setShake((v) => v + 1);
    setPacked(false);
  };

  const listSrc = `[${POOL.slice(0, n).map((w) => `"${w}"`).join(", ")}]`;
  const printed =
    p.ok &&
    targets
      .filter((t) => t !== "*_")
      .map((t) => {
        const k = targets.indexOf(t);
        const vals = p.slots[k].map((i) => POOL[i]);
        return t.startsWith("*") ? `[${vals.map((v) => `'${v}'`).join(", ")}]` : vals[0];
      })
      .join(" ");

  return (
    <div>
      <ControlBar>
        <Segmented
          id="py-unpack"
          value={pattern}
          onChange={(v) => {
            setPattern(v);
            setPacked(true);
          }}
          options={(Object.keys(PATTERNS) as Pattern[]).map((k) => ({ value: k, label: <span className="font-mono">{PATTERNS[k].label}</span> }))}
        />
      </ControlBar>

      <LayoutGroup id="py-unpack-group">
        <div className="px-5">
          <div className="thin-scroll overflow-x-auto rounded-2xl bg-black/80 px-4 py-2.5 font-mono text-[12.5px] whitespace-nowrap text-[#e5e5ea]">
            <span style={{ color: "var(--accent)" }}>{label}</span> = {listSrc}
          </div>

          {/* список-джерело */}
          <motion.div
            key={shake}
            animate={shake ? { x: [0, -10, 9, -6, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="mt-3 flex min-h-[54px] flex-wrap items-center gap-1.5 rounded-2xl border border-dashed px-3 py-2.5"
            style={{ borderColor: "var(--separator)" }}
          >
            <span className="mr-1 font-mono text-[18px] text-label-3">[</span>
            {!unpacked && Array.from({ length: n }, (_, i) => <Chip key={i} i={i} />)}
            {n === 0 && <span className="text-[12px] text-label-3">порожній список</span>}
            <span className="ml-1 font-mono text-[18px] text-label-3">]</span>
          </motion.div>

          {/* змінні */}
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${targets.length}, minmax(0, 1fr))` }}>
            {targets.map((t, k) => {
              const star = t.startsWith("*");
              return (
                <div
                  key={`${pattern}-${t}`}
                  className="flex min-h-[92px] flex-col rounded-2xl border px-2 py-2"
                  style={{
                    borderColor: star ? "var(--accent-2)" : "var(--separator)",
                    background: star ? "color-mix(in oklab, var(--accent-2) 8%, transparent)" : "var(--bg-elevated)",
                    opacity: t === "*_" ? 0.75 : 1,
                  }}
                >
                  <div className="mb-1.5 text-center font-mono text-[13px] font-bold" style={{ color: star ? "var(--accent-2)" : "var(--accent)" }}>
                    {t}
                  </div>
                  <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-1">
                    {star && <span className="font-mono text-label-3">[</span>}
                    {unpacked && p.ok && p.slots[k].map((i) => <Chip key={i} i={i} />)}
                    {star && <span className="font-mono text-label-3">]</span>}
                  </div>
                  {t === "*_" && <div className="text-center text-[10px] text-label-3">«не потрібне»</div>}
                </div>
              );
            })}
          </div>
        </div>
      </LayoutGroup>

      <div className="mx-5 mt-3 min-h-[44px] rounded-2xl px-3.5 py-2.5 font-mono text-[12.5px]" style={{
        background: p.ok ? "color-mix(in oklab, var(--accent) 10%, transparent)" : "color-mix(in oklab, #ff453a 12%, transparent)",
        color: p.ok ? undefined : "#ff453a",
      }}>
        <AnimatePresence mode="wait">
          <motion.div key={`${pattern}-${n}-${packed}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {!p.ok ? (
              p.error
            ) : unpacked ? (
              <>
                <span className="text-label-3">&gt;&gt;&gt; print({targets.filter((t) => t !== "*_").map((t) => t.replace("*", "")).join(", ")})</span>
                <div>{printed}</div>
              </>
            ) : (
              <span className="font-sans text-[13px] text-label-2">
                Імен без зірочки: {targets.filter((t) => !t.startsWith("*")).length}, елементів: {n}.{" "}
                {targets.some((t) => t.startsWith("*")) ? "Зірочка забере решту (можливо, нуль елементів)." : "Кількість має збігатися точно."}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={act}>
          {packed ? <PackageOpen className="size-4" /> : <Undo2 className="size-4" />}
          {packed ? "Розпакувати" : "Скласти назад"}
        </Btn>
        <Slider
          label="елементів у списку"
          value={n}
          min={0}
          max={6}
          onChange={(v) => {
            setN(v);
            setPacked(true);
          }}
        />
      </ControlBar>
    </div>
  );
}
