"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Check, Power, Search, X, Zap } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";
import { A2_INK, CONSOLE_BG, GREEN, INK, ORANGE, RED, tint } from "./palette";

type Target = "helpers" | "json" | "requests" | "random" | "dragon_radar";

const ROWS = [
  { key: "cache", title: "sys.modules", sub: "кеш уже завантажених" },
  { key: "project", title: "тека скрипта", sub: "~/stone_lab/" },
  { key: "pypath", title: "PYTHONPATH", sub: "змінна оточення" },
  { key: "stdlib", title: "стандартна бібліотека", sub: "/usr/lib/python3.14/" },
  { key: "site", title: "site-packages", sub: ".venv/…/site-packages/" },
] as const;

/** Де лежить модуль (індекс рядка без кешу) або -1. */
function locate(t: Target, shadow: boolean): number {
  if (t === "helpers") return 1;
  if (t === "random") return shadow ? 1 : 3;
  if (t === "json") return 3;
  if (t === "requests") return 4;
  return -1;
}

function filesOf(row: number, shadow: boolean, cache: Record<string, number>): string[] {
  switch (row) {
    case 0:
      return ["sys", "builtins", ...Object.keys(cache)];
    case 1:
      return ["main.py", "helpers.py", ...(shadow ? ["random.py"] : [])];
    case 2:
      return [];
    case 3:
      return ["json/", "random.py", "os.py", "pathlib/", "math"];
    default:
      return ["requests/", "rich/", "pip/"];
  }
}

const matches = (file: string, t: string) => file === t || file === `${t}.py` || file === `${t}/`;

export function ImportSearch() {
  const [target, setTarget] = useState<Target>("helpers");
  const [shadow, setShadow] = useState(false);
  const [cache, setCache] = useState<Record<string, number>>({});
  const [probe, setProbe] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  // знімок на момент запуску: де знайдемо (0 = кеш) і звідки модуль родом
  const [snap, setSnap] = useState<{ hit: number; source: number }>({ hit: 1, source: 1 });

  const hitRow = snap.hit;
  const stopAt = hitRow === -1 ? ROWS.length - 1 : hitRow;

  useEffect(() => {
    if (phase !== "running") return;
    const t = setTimeout(() => {
      if (probe < stopAt) {
        setProbe(probe + 1);
        return;
      }
      setPhase("done");
      if (hitRow > 0) setCache((c) => ({ ...c, [target]: hitRow }));
    }, probe < 0 ? 80 : 620);
    return () => clearTimeout(t);
  }, [phase, probe, stopAt, hitRow, target]);

  const run = () => {
    const cached = cache[target];
    const found = locate(target, shadow);
    setSnap(cached !== undefined ? { hit: 0, source: cached } : { hit: found, source: found });
    setProbe(-1);
    setPhase("running");
  };
  const choose = (t: Target) => {
    setTarget(t);
    setPhase("idle");
    setProbe(-1);
  };

  const done = phase === "done";
  const source = snap.source;
  const shadowed = target === "random" && source === 1;

  let result: { tone: "ok" | "warn" | "err" | "cache"; text: string };
  if (hitRow === -1) result = { tone: "err", text: `ModuleNotFoundError: No module named '${target}'` };
  else if (hitRow === 0)
    result = {
      tone: shadowed ? "warn" : "cache",
      text: shadowed
        ? "Миттєво з кешу… але в кеші лежить ТВІЙ random.py! Навіть вимкнувши файл, треба перезапустити Python."
        : "Миттєво з кешу sys.modules — код модуля повторно не виконується.",
    };
  else if (shadowed)
    result = { tone: "warn", text: "Імпортовано твій ~/stone_lab/random.py замість стандартного! random.randint(1, 6) → AttributeError: module 'random' has no attribute 'randint'" };
  else
    result = {
      tone: "ok",
      text:
        hitRow === 1
          ? "Знайдено ~/stone_lab/helpers.py: код виконано, модуль покладено в sys.modules."
          : hitRow === 3
            ? "Знайдено в стандартній бібліотеці — встановлювати нічого не треба."
            : "Знайдено в site-packages — сюди його поставив pip install.",
    };
  const toneColor = { ok: GREEN, cache: A2_INK, warn: ORANGE, err: RED }[result.tone];

  return (
    <div>
      <ControlBar>
        <Segmented
          id="mod-search"
          value={target}
          onChange={choose}
          options={[
            { value: "helpers", label: "helpers" },
            { value: "json", label: "json" },
            { value: "requests", label: "requests" },
            { value: "random", label: "random" },
            { value: "dragon_radar", label: "dragon_radar" },
          ]}
        />
      </ControlBar>

      <div className="px-5">
        <div className="mb-2 rounded-xl border border-separator px-3 py-2 font-mono text-[12.5px] text-label" style={{ background: CONSOLE_BG }}>
          <span className="text-label-3">main.py ›</span> <span className="font-semibold" style={{ color: INK }}>import</span> {target}
        </div>
        <div className="relative space-y-1.5">
          {ROWS.map((r, i) => {
            const checked = phase !== "idle" && probe >= i;
            const isProbe = phase === "running" && probe === i;
            const hit = checked && i === hitRow && (done || isProbe);
            const miss = checked && !hit && (i < probe || done);
            const files = filesOf(i, shadow, cache);
            return (
              <div
                key={r.key}
                className="relative flex items-center gap-2.5 rounded-2xl border border-separator bg-elevated/60 px-3 py-2"
              >
                {isProbe && (
                  <motion.div
                    layoutId="mod-probe"
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ boxShadow: "0 0 0 2px var(--accent)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold"
                  style={{
                    background: hit ? GREEN : miss ? "var(--bg)" : tint(14),
                    color: hit ? "white" : miss ? "var(--label-3)" : INK,
                    borderColor: hit ? GREEN : miss ? "var(--separator)" : "color-mix(in oklab, var(--accent) 35%, transparent)",
                  }}>
                  {hit ? <Check className="size-4" strokeWidth={1.75} /> : miss ? <X className="size-4" strokeWidth={1.75} /> : isProbe ? <Search className="size-3.5" strokeWidth={1.75} /> : i === 0 ? <Zap className="size-3.5" strokeWidth={1.75} /> : i}
                </div>
                <div className="w-[118px] shrink-0 leading-tight sm:w-[160px]">
                  <div className="text-[13px] font-semibold">{r.title}</div>
                  <div className="truncate font-mono text-[10.5px] text-label-3">{r.sub}</div>
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                  {files.length === 0 && <span className="text-[11.5px] text-label-3">(порожньо)</span>}
                  <AnimatePresence initial={false}>
                    {files.map((f) => {
                      const m = matches(f, target);
                      const glow = m && hit;
                      return (
                        <motion.span
                          key={f}
                          layout
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: glow ? 1.08 : 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: "spring", stiffness: 420, damping: 26 }}
                          className="rounded-[8px] px-1.5 py-0.5 font-mono text-[11px]"
                          style={{
                            background: glow ? GREEN : f === "random.py" && i === 1 ? `color-mix(in oklab, ${ORANGE} 14%, white)` : "var(--bg-elevated)",
                            color: glow ? "white" : f === "random.py" && i === 1 ? ORANGE : undefined,
                            boxShadow: "0 0 0 1px var(--separator)",
                          }}
                        >
                          {f}
                        </motion.span>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 min-h-[48px]">
          <AnimatePresence mode="wait">
            {done && (
              <motion.div
                key={`${target}-${hitRow}-${shadow}`}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="rounded-2xl px-3.5 py-2.5 font-mono text-[12.5px] leading-snug"
                style={{ background: `color-mix(in oklab, ${toneColor} 9%, white)`, borderLeft: `3px solid ${toneColor}` }}
              >
                {result.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={run} disabled={phase === "running"}>
          <Search className="size-4" strokeWidth={1.75} /> import {target}
        </Btn>
        <Btn
          onClick={() => {
            setShadow((v) => !v);
            setPhase("idle");
            setProbe(-1);
          }}
        >
          <span
            className="inline-block size-3 rounded-full"
            style={{ background: shadow ? ORANGE : "var(--label-3)" }}
          />
          Мій random.py у теці проєкту
        </Btn>
        <Btn
          onClick={() => {
            setCache({});
            setPhase("idle");
            setProbe(-1);
          }}
        >
          <Power className="size-4" strokeWidth={1.75} /> Перезапустити Python
        </Btn>
      </ControlBar>
    </div>
  );
}
