"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Btn, ControlBar, Segmented } from "../kit";

type Field = {
  key: string;
  /** Як ключ виглядає в Python */
  pyKey: string;
  py: string;
  pyType: string;
  json: string;
  jsonType: string;
  /** Що повернеться після json.loads (None — те саме) */
  back?: string;
  note: string;
  /** Нестерпний для json тип */
  fails?: boolean;
};

const FIELDS: Field[] = [
  { key: "name", pyKey: '"name"', py: '"Ед"', pyType: "str", json: '"Ед"', jsonType: "string", note: "Рядок лишається рядком. Лише лапки завжди подвійні." },
  { key: "age", pyKey: '"age"', py: "15", pyType: "int", json: "15", jsonType: "number", note: "int і float стають number." },
  { key: "hp", pyKey: '"hp"', py: "92.5", pyType: "float", json: "92.5", jsonType: "number", note: "float → number → знову float." },
  { key: "automail", pyKey: '"automail"', py: "True", pyType: "bool", json: "true", jsonType: "boolean", note: "True/False пишуться з малої літери." },
  { key: "brother", pyKey: '"brother"', py: "None", pyType: "NoneType", json: "null", jsonType: "null", note: "None ⇄ null." },
  {
    key: "skills",
    pyKey: '"skills"',
    py: '("алхімія", "бій")',
    pyType: "tuple",
    json: '["алхімія", "бій"]',
    jsonType: "array",
    back: "['алхімія', 'бій']",
    note: "У JSON немає кортежів — повернеться list. Обмін не рівноцінний!",
  },
  {
    key: "1",
    pyKey: "1",
    py: '"ключ-число"',
    pyType: "int-ключ",
    json: '"ключ-число"',
    jsonType: "string-ключ",
    back: "'1': 'ключ-число'",
    note: "Ключі в JSON — тільки рядки. Ключ 1 повернеться як '1'.",
  },
];

const SET_FIELD: Field = {
  key: "tags",
  pyKey: '"tags"',
  py: '{"сталь", "вогонь"}',
  pyType: "set",
  json: "",
  jsonType: "—",
  note: "set не має відповідника в JSON → TypeError. Рятує default=list.",
  fails: true,
};

/** Екранування не-ASCII так, як це робить json.dumps(ensure_ascii=True). */
const asciiEscape = (s: string) =>
  [...s].map((c) => (c.charCodeAt(0) > 127 ? "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0") : c)).join("");

export function JsonBridge() {
  const [active, setActive] = useState("skills");
  const [ascii, setAscii] = useState<"false" | "true">("false");
  const [roundTrip, setRoundTrip] = useState(false);
  const [withSet, setWithSet] = useState(false);

  const fields = withSet ? [...FIELDS, SET_FIELD] : FIELDS;
  const cur = fields.find((f) => f.key === active) ?? fields[0];
  const failed = withSet;
  const esc = (s: string) => (ascii === "true" ? asciiEscape(s) : s);

  return (
    <div>
      <ControlBar>
        <Segmented
          id="json-ascii"
          value={ascii}
          onChange={setAscii}
          options={[
            { value: "false", label: "ensure_ascii=False" },
            { value: "true", label: "=True" },
          ]}
        />
        <Btn onClick={() => setRoundTrip((r) => !r)} variant={roundTrip ? "accent" : "glass"}>
          <ArrowLeftRight className="size-3.5" strokeWidth={1.75} />
          Туди й назад
        </Btn>
        <Btn
          onClick={() => {
            setWithSet((w) => !w);
            setActive(withSet ? "skills" : "tags");
          }}
        >
          {withSet ? <Minus className="size-3.5" strokeWidth={1.75} /> : <Plus className="size-3.5" strokeWidth={1.75} />}
          {withSet ? "Прибрати set" : "set"}
        </Btn>
      </ControlBar>

      <div className="grid gap-3 px-5 md:grid-cols-2">
        {/* Python */}
        <div className="rounded-[18px] border border-separator bg-elevated p-2.5 font-mono text-[12.5px]">
          <div className="px-1.5 pb-1 text-[11px] font-bold tracking-wider text-label-3 uppercase font-sans">Python dict</div>
          <div className="px-1.5 text-label-3">hero = {"{"}</div>
          {fields.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className="relative flex w-full items-center gap-1 rounded-[10px] px-1.5 py-1 text-left"
            >
              {active === f.key && (
                <motion.span
                  layoutId="json-py-hl"
                  className="absolute inset-0 rounded-[10px]"
                  style={{ background: "color-mix(in oklab, var(--accent) 24%, transparent)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative truncate pl-4">
                <span className="text-label-2">{f.pyKey}</span>: <span style={{ color: f.fails ? "var(--accent-2)" : undefined }}>{f.py}</span>,
              </span>
              <span className="relative ml-auto shrink-0 rounded-full px-1.5 font-sans text-[10px] text-label-3">{f.pyType}</span>
            </button>
          ))}
          <div className="px-1.5 text-label-3">{"}"}</div>
        </div>

        {/* JSON */}
        <div className="relative rounded-[18px] bg-black/80 p-2.5 font-mono text-[12.5px] text-[#e5e5ea]">
          <div className="px-1.5 pb-1 font-sans text-[11px] font-bold tracking-wider text-white/40 uppercase">
            {roundTrip ? "json.loads(json.dumps(hero))" : "json.dumps(hero, indent=2)"}
          </div>
          <AnimatePresence mode="wait">
            {failed ? (
              <motion.div
                key="err"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="px-1.5 py-2 text-[#ff6b61]"
              >
                TypeError: Object of type set is not JSON serializable
                <div className="mt-2 text-white/50"># рішення: json.dumps(hero, default=list)</div>
              </motion.div>
            ) : (
              <motion.div key={`ok-${roundTrip}-${ascii}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="px-1.5 text-white/40">{"{"}</div>
                {fields.map((f, i) => {
                  const changed = roundTrip && !!f.back;
                  const line = roundTrip
                    ? f.back && f.key === "1"
                      ? f.back
                      : `'${f.key}': ${f.back ?? pyLiteral(f)}`
                    : `${esc(`"${f.key}"`)}: ${esc(f.json)}`;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setActive(f.key)}
                      className="relative flex w-full items-center rounded-[10px] px-1.5 py-1 text-left"
                    >
                      {active === f.key && (
                        <motion.span
                          layoutId="json-js-hl"
                          className="absolute inset-0 rounded-[10px]"
                          style={{ background: "color-mix(in oklab, var(--accent) 30%, transparent)" }}
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative min-w-0 truncate pl-4" style={{ color: changed ? "#ff9f0a" : undefined }}>
                        {line}
                        {i < fields.length - 1 ? "," : ""}
                      </span>
                      {changed && <span className="relative ml-auto shrink-0 pl-2 font-sans text-[10px] text-[#ff9f0a]">змінилось!</span>}
                    </button>
                  );
                })}
                <div className="px-1.5 text-white/40">{"}"}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-5 pt-3 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="glass-tint flex flex-wrap items-center gap-2 rounded-[16px] border px-3.5 py-2.5 text-[13px]"
          >
            <span className="pill pill-glass !px-2 !py-0.5 font-mono !text-[11.5px]">{cur.pyType}</span>
            <span className="text-label-3">→</span>
            <span className="pill pill-glass !px-2 !py-0.5 font-mono !text-[11.5px]">{cur.jsonType}</span>
            <span className="min-w-[200px] flex-1 text-label-2">{cur.note}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Як поле виглядає у repr після loads, якщо тип не змінився. */
function pyLiteral(f: Field) {
  if (f.json === "true") return "True";
  if (f.json === "null") return "None";
  return f.py.replace(/"/g, "'");
}
