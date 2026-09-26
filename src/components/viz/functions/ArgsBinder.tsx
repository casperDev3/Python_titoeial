"use client";

import { LayoutGroup, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";

type Tok = { kind: "pos" | "kw"; name?: string; value: string };
type SlotName = "hero" | "rank" | "args" | "place" | "kwargs";

const PRESETS: Record<string, Tok[]> = {
  a: [
    { kind: "pos", value: '"Деку"' },
    { kind: "pos", value: "1" },
  ],
  b: [
    { kind: "pos", value: '"Деку"' },
    { kind: "pos", value: "1" },
    { kind: "pos", value: '"Бакуго"' },
    { kind: "pos", value: '"Тодорокі"' },
    { kind: "kw", name: "place", value: '"Каміно"' },
  ],
  c: [
    { kind: "pos", value: '"Урарака"' },
    { kind: "pos", value: "3" },
    { kind: "pos", value: '"Цую"' },
    { kind: "kw", name: "speed", value: "9" },
    { kind: "kw", name: "mood", value: '"😊"' },
  ],
  d: [
    { kind: "kw", name: "rank", value: "2" },
    { kind: "kw", name: "hero", value: '"Іїда"' },
    { kind: "kw", name: "engine", value: '"Recipro"' },
  ],
};

const NAMED: SlotName[] = ["hero", "rank", "place"];

function target(toks: Tok[], i: number): SlotName {
  const t = toks[i];
  if (t.kind === "kw") return NAMED.includes(t.name as SlotName) ? (t.name as SlotName) : "kwargs";
  const p = toks.slice(0, i).filter((x) => x.kind === "pos").length;
  return p === 0 ? "hero" : p === 1 ? "rank" : "args";
}

function explain(toks: Tok[], k: number): string {
  if (k === 0) return "Натисни «Далі»: Python розбирає аргументи зліва направо.";
  if (k > toks.length) {
    const placeSet = toks.some((t) => t.name === "place");
    return placeSet
      ? "Готово! Усі параметри отримали значення — починається виконання тіла функції."
      : "Готово! «place» не передали — він бере значення за замовчуванням \"U.A.\".";
  }
  const t = toks[k - 1];
  const s = target(toks, k - 1);
  const label = t.kind === "kw" ? `${t.name}=${t.value}` : t.value;
  switch (s) {
    case "hero":
    case "rank":
      return t.kind === "pos"
        ? `${label} — позиційний, займає наступний вільний параметр «${s}».`
        : `${label} — іменований: шукаємо параметр з ім'ям «${s}», порядок неважливий.`;
    case "place":
      return `${label} — «place» стоїть після *args, тож його можна передати ЛИШЕ за іменем.`;
    case "args":
      return `${label} — позиційних параметрів більше немає, тож він падає в кортеж args.`;
    case "kwargs":
      return `${label} — параметра «${t.name}» немає, тож пара йде у словник kwargs.`;
  }
}

function Chip({ id, children, tone = "accent" }: { id: string; children: ReactNode; tone?: "accent" | "kw" | "def" }) {
  const bg =
    tone === "kw"
      ? "linear-gradient(120deg, var(--accent-2), color-mix(in oklab, var(--accent-2) 60%, var(--accent)))"
      : tone === "def"
        ? "color-mix(in oklab, var(--label-3) 55%, transparent)"
        : "linear-gradient(120deg, var(--accent), color-mix(in oklab, var(--accent) 70%, var(--accent-2)))";
  return (
    <motion.span
      layoutId={id}
      layout
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="inline-flex items-center rounded-[9px] px-2 py-0.5 font-mono text-[12px] font-semibold whitespace-nowrap text-white shadow-sm"
      style={{ background: bg }}
    >
      {children}
    </motion.span>
  );
}

function Slot({ title, sub, children, glow }: { title: string; sub: string; children: ReactNode; glow: boolean }) {
  return (
    <motion.div
      animate={{ scale: glow ? 1.03 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex min-h-[72px] min-w-0 flex-col gap-1.5 rounded-2xl border p-2.5"
      style={{
        borderColor: glow ? "var(--accent)" : "var(--separator)",
        background: glow ? "color-mix(in oklab, var(--accent) 10%, var(--glass-bg))" : "var(--glass-bg)",
      }}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[13px] font-bold">{title}</span>
        <span className="truncate text-[11px] text-label-3">{sub}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    </motion.div>
  );
}

export function ArgsBinder() {
  const [preset, setPreset] = useState<keyof typeof PRESETS>("b");
  const [k, setK] = useState(0);
  const toks = PRESETS[preset];
  const done = k > toks.length;
  const bound = (i: number) => i < k;
  const tid = (i: number) => `fn-arg-${preset}-${i}`;
  const lastSlot = k > 0 && k <= toks.length ? target(toks, k - 1) : null;

  const inSlot = (s: SlotName) =>
    toks.map((t, i) => ({ t, i })).filter(({ i }) => bound(i) && target(toks, i) === s);

  const placeDefault = done && !toks.some((t) => t.name === "place");

  const tokLabel = (t: Tok) => (t.kind === "kw" ? `${t.name}=${t.value}` : t.value);

  return (
    <div>
      <ControlBar>
        <Segmented
          id="fn-args-preset"
          value={preset}
          onChange={(v) => {
            setPreset(v);
            setK(0);
          }}
          options={[
            { value: "a", label: "2 арг." },
            { value: "b", label: "+ *args" },
            { value: "c", label: "+ **kwargs" },
            { value: "d", label: "за іменами" },
          ]}
        />
      </ControlBar>

      <LayoutGroup id={`fn-args-${preset}`}>
        <div className="mx-5 rounded-2xl border border-separator bg-[var(--code-bg)] p-3 font-mono text-[12.5px]">
          <div className="text-label-2">
            <span style={{ color: "var(--accent)" }}>def</span> mission(hero, rank,{" "}
            <b style={{ color: "var(--accent)" }}>*args</b>, place=&quot;U.A.&quot;,{" "}
            <b style={{ color: "var(--accent-2)" }}>**kwargs</b>)
          </div>
          <div className="mt-2 flex min-h-[30px] flex-wrap items-center gap-1.5">
            <span>mission(</span>
            {toks.map((t, i) =>
              bound(i) ? (
                <span
                  key={i}
                  className="rounded-[9px] border border-dashed border-separator px-2 py-0.5 text-label-3"
                >
                  {tokLabel(t)}
                </span>
              ) : (
                <Chip key={i} id={tid(i)} tone={t.kind === "kw" ? "kw" : "accent"}>
                  {tokLabel(t)}
                </Chip>
              ),
            )}
            <span>)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 px-5 py-3 sm:grid-cols-3">
          {(["hero", "rank"] as const).map((s) => (
            <Slot key={s} title={s} sub="позиційно або за іменем" glow={lastSlot === s}>
              {inSlot(s).map(({ t, i }) => (
                <Chip key={i} id={tid(i)} tone={t.kind === "kw" ? "kw" : "accent"}>
                  {t.value}
                </Chip>
              ))}
              {inSlot(s).length === 0 && <span className="text-[12px] text-label-3">порожньо</span>}
            </Slot>
          ))}
          <Slot title="place" sub="лише за іменем · дефолт" glow={lastSlot === "place" || placeDefault}>
            {inSlot("place").map(({ t, i }) => (
              <Chip key={i} id={tid(i)} tone="kw">
                {t.value}
              </Chip>
            ))}
            {placeDefault && (
              <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                <Chip id={`fn-arg-${preset}-default`} tone="def">
                  &quot;U.A.&quot;
                </Chip>
              </motion.span>
            )}
            {inSlot("place").length === 0 && !placeDefault && (
              <span className="text-[12px] text-label-3">чекає…</span>
            )}
          </Slot>
          <Slot title="*args" sub="кортеж" glow={lastSlot === "args"}>
            <span className="font-mono text-label-3">(</span>
            {inSlot("args").map(({ t, i }) => (
              <Chip key={i} id={tid(i)}>
                {t.value}
              </Chip>
            ))}
            <span className="font-mono text-label-3">{inSlot("args").length === 1 ? ",)" : ")"}</span>
          </Slot>
          <div className="col-span-2 sm:col-span-2">
            <Slot title="**kwargs" sub="словник" glow={lastSlot === "kwargs"}>
              <span className="font-mono text-label-3">{"{"}</span>
              {inSlot("kwargs").map(({ t, i }) => (
                <Chip key={i} id={tid(i)} tone="kw">
                  &apos;{t.name}&apos;: {t.value}
                </Chip>
              ))}
              <span className="font-mono text-label-3">{"}"}</span>
            </Slot>
          </div>
        </div>
      </LayoutGroup>

      <div className="mx-5 min-h-[46px] rounded-2xl bg-separator/30 px-3.5 py-2.5 text-[13.5px] leading-snug">
        <motion.div key={`${preset}-${k}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          {explain(toks, k)}
        </motion.div>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={() => setK((v) => Math.min(toks.length + 1, v + 1))} disabled={done}>
          Далі <ChevronRight className="size-4" />
        </Btn>
        <Btn onClick={() => setK(toks.length + 1)} disabled={done}>
          Усе одразу
        </Btn>
        <Btn onClick={() => setK(0)}>
          <RotateCcw className="size-4" /> Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}
