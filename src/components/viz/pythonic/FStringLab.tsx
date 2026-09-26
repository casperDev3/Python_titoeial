"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Btn, Segmented, Slider } from "../kit";
import { pyFormat, type FmtValue, type Spec } from "./formatSpec";

type ValKey = "power" | "ratio" | "hp" | "delta" | "cry";

const VALUES: Record<ValKey, FmtValue & { src: string }> = {
  power: { kind: "float", v: 1234.5678, src: "1234.5678" },
  ratio: { kind: "float", v: 0.1234, src: "0.1234" },
  hp: { kind: "int", v: 255, src: "255" },
  delta: { kind: "int", v: -42, src: "-42" },
  cry: { kind: "str", v: "ORA ORA", src: '"ORA ORA"' },
};

const TYPES: Record<FmtValue["kind"], { value: string; label: string }[]> = {
  float: [
    { value: "", label: "—" },
    { value: "f", label: "f" },
    { value: "e", label: "e" },
    { value: "%", label: "%" },
  ],
  int: [
    { value: "", label: "—" },
    { value: "d", label: "d" },
    { value: "b", label: "b" },
    { value: "x", label: "x" },
    { value: "f", label: "f" },
    { value: "%", label: "%" },
  ],
  str: [
    { value: "", label: "—" },
    { value: "s", label: "s" },
  ],
};

const TYPE_HINT: Record<string, string> = {
  "": "без типу: стандартний вигляд значення",
  f: "f — фіксована кома, точність = знаки після коми",
  e: "e — експоненційний запис",
  "%": "% — множить на 100 і додає знак %",
  d: "d — ціле десяткове",
  b: "b — двійкове",
  x: "x — шістнадцяткове",
  s: "s — рядок; точність обрізає рядок!",
};

const START: Spec = { fill: "", align: "", width: 12, group: "", precision: 2, type: "f" };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="w-[92px] shrink-0 text-[12px] font-semibold text-label-2">{label}</span>
      {children}
    </div>
  );
}

export function FStringLab() {
  const [key, setKey] = useState<ValKey>("power");
  const [spec, setSpec] = useState<Spec>(START);
  const val = VALUES[key];
  const set = (p: Partial<Spec>) => setSpec((s) => ({ ...s, ...p }));
  const res = pyFormat(val, spec);

  const chooseVal = (k: ValKey) => {
    setKey(k);
    const kind = VALUES[k].kind;
    setSpec((s) => ({
      ...s,
      type: TYPES[kind].some((t) => t.value === s.type) ? s.type : "",
      precision: kind === "int" ? -1 : s.precision,
      group: kind === "str" ? "" : s.group,
    }));
  };

  // частини специфікації з кольорами
  const parts: { t: string; c: string; tip: string }[] = [];
  if (spec.align) parts.push({ t: spec.fill + spec.align, c: "var(--accent)", tip: "заповнювач + вирівнювання" });
  if (spec.width > 0) parts.push({ t: String(spec.width), c: "var(--accent-2)", tip: "ширина" });
  if (spec.group) parts.push({ t: spec.group, c: "#30d158", tip: "роздільник" });
  if (spec.precision >= 0) parts.push({ t: "." + spec.precision, c: "#ff9f0a", tip: "точність" });
  if (spec.type) parts.push({ t: spec.type, c: "#64d2ff", tip: "тип" });

  const chars = res.ok ? [...res.text] : [];

  return (
    <div>
      <div className="px-5 pt-1">
        <div className="overflow-x-auto rounded-2xl bg-black/80 px-4 py-3 font-mono text-[14px] text-[#e5e5ea] thin-scroll">
          <div className="text-[#8e8e93]">
            {key} = <span className="text-[#e5e5ea]">{val.src}</span>
          </div>
          <div className="whitespace-nowrap">
            print(<span className="text-[#ff9f0a]">f&quot;</span>
            <span className="text-[#8e8e93]">{"{"}</span>
            {key}
            {parts.length > 0 && <span className="text-[#8e8e93]">:</span>}
            <AnimatePresence mode="popLayout">
              {parts.map((p) => (
                <motion.span
                  key={p.tip}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  title={p.tip}
                  className="inline-block font-bold"
                  style={{ color: p.c }}
                >
                  {p.t === " <" || p.t === " ^" || p.t === " >" ? p.t.replace(" ", "␣") : p.t}
                </motion.span>
              ))}
            </AnimatePresence>
            <span className="text-[#8e8e93]">{"}"}</span>
            <span className="text-[#ff9f0a]">&quot;</span>)
          </div>
        </div>

        {/* результат */}
        <div className="mt-3 min-h-[74px] rounded-2xl border border-separator bg-elevated/60 px-3 py-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider text-label-3 uppercase">
            <span>Вивід</span>
            {res.ok && (
              <span className="font-mono normal-case">
                len = {chars.length}
                {spec.width > 0 ? ` · ширина ${spec.width}` : ""}
              </span>
            )}
          </div>
          {res.ok ? (
            <div className="thin-scroll flex overflow-x-auto pb-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {chars.map((ch, i) => {
                  const pad = i < res.core[0] || i >= res.core[1];
                  return (
                    <motion.span
                      layout
                      key={`${i}-${ch}-${pad}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 520, damping: 32 }}
                      className="-ml-px flex h-9 w-[22px] shrink-0 items-center justify-center border font-mono text-[15px] font-semibold first:ml-0 first:rounded-l-lg last:rounded-r-lg"
                      style={{
                        borderColor: "var(--separator)",
                        background: pad
                          ? "color-mix(in oklab, var(--accent-2) 12%, transparent)"
                          : "color-mix(in oklab, var(--accent) 16%, transparent)",
                        color: pad ? "var(--label-3)" : "var(--label)",
                      }}
                    >
                      {ch === " " ? <span className="opacity-50">·</span> : ch}
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              key={res.error}
              initial={{ x: -6 }}
              animate={{ x: [6, -4, 2, 0] }}
              className="rounded-xl px-3 py-2 font-mono text-[12.5px]"
              style={{ background: "color-mix(in oklab, #ff453a 14%, transparent)", color: "#ff453a" }}
            >
              {res.error}
            </motion.div>
          )}
          <div className="mt-1.5 text-[12px] text-label-2">{TYPE_HINT[spec.type]}</div>
        </div>
      </div>

      <div className="space-y-2.5 px-5 py-4">
        <Row label="значення">
          <Segmented
            id="py-fs-val"
            value={key}
            onChange={chooseVal}
            options={[
              { value: "power", label: "1234.5678" },
              { value: "ratio", label: "0.1234" },
              { value: "hp", label: "255" },
              { value: "delta", label: "-42" },
              { value: "cry", label: '"ORA ORA"' },
            ]}
          />
        </Row>
        <Row label="тип">
          <Segmented id="py-fs-type" value={spec.type} onChange={(v) => set({ type: v })} options={TYPES[val.kind]} />
        </Row>
        <Row label="вирівнювання">
          <Segmented
            id="py-fs-align"
            value={spec.align}
            onChange={(v) => set({ align: v })}
            options={[
              { value: "", label: "—" },
              { value: "<", label: "< ліво" },
              { value: "^", label: "^ центр" },
              { value: ">", label: "> право" },
            ]}
          />
        </Row>
        {spec.align && (
          <Row label="заповнювач">
            <Segmented
              id="py-fs-fill"
              value={spec.fill}
              onChange={(v) => set({ fill: v })}
              options={[
                { value: "", label: "пробіл" },
                { value: "*", label: "*" },
                { value: "0", label: "0" },
                { value: "-", label: "-" },
              ]}
            />
          </Row>
        )}
        <Row label="роздільник">
          <Segmented
            id="py-fs-group"
            value={spec.group}
            onChange={(v) => set({ group: v })}
            options={[
              { value: "", label: "—" },
              { value: ",", label: ", кома" },
              { value: "_", label: "_ підкреслення" },
            ]}
          />
        </Row>
        <div className="flex flex-wrap items-end gap-4">
          <Slider label="ширина (0 = без)" value={spec.width} min={0} max={16} onChange={(v) => set({ width: v })} />
          <Slider
            label={spec.precision < 0 ? "точність (-1 = без)" : "точність"}
            value={spec.precision}
            min={-1}
            max={6}
            onChange={(v) => set({ precision: v })}
          />
          <Btn onClick={() => { setKey("power"); setSpec(START); }}>
            <RotateCcw className="size-4" />
          </Btn>
        </div>
      </div>
    </div>
  );
}
