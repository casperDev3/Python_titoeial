"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ControlBar, Segmented, Slider } from "../kit";
import { chars } from "./util";
import { formatFull, VALUES, type Align, type Group, type Type } from "./format";

const FILLS = [" ", "*", "0", "·", "~"] as const;

const spring = { type: "spring" as const, stiffness: 480, damping: 32 };

export function FormatSpec() {
  const [vid, setVid] = useState("big");
  const [fill, setFill] = useState<string>("*");
  const [align, setAlign] = useState<Align>("^");
  const [width, setWidth] = useState(16);
  const [group, setGroup] = useState<Group>(",");
  const [prec, setPrec] = useState<number | null>(2);
  const [type, setType] = useState<Type>("f");

  const v = VALUES.find((x) => x.id === vid) ?? VALUES[0];
  const core = formatFull(v, fill, align, width, group, prec, type);

  const spec = `${align ? fill + align : ""}${width ? width : ""}${group}${prec !== null ? "." + prec : ""}${type}`;
  const fexpr = `f"{${v.lit}${spec ? ":" + spec : ""}}"`;

  const cells = core.ok ? core.cells : [];

  const parts: { t: string; label: string; on: boolean }[] = [
    { t: align ? fill + align : "", label: "заповн.+вирівн.", on: !!align },
    { t: width ? String(width) : "", label: "ширина", on: !!width },
    { t: group, label: "групи", on: !!group },
    { t: prec !== null ? "." + prec : "", label: "точність", on: prec !== null },
    { t: type, label: "тип", on: !!type },
  ];

  return (
    <div>
      <div className="px-5">
        <div className="flex flex-wrap gap-1.5">
          {VALUES.map((x) => (
            <button
              key={x.id}
              onClick={() => setVid(x.id)}
              className="rounded-full px-2.5 py-1 font-mono text-[12.5px] font-semibold"
              style={{
                background: x.id === vid ? "color-mix(in oklab, var(--accent) 18%, white)" : "color-mix(in oklab, var(--label) 6%, transparent)",
                boxShadow: x.id === vid ? "inset 0 0 0 1.5px var(--accent)" : "none",
              }}
            >
              {x.lit}
            </button>
          ))}
        </div>
      </div>

      {/* вираз та розбір специфікації */}
      <div className="mx-5 mt-4 rounded-[18px] bg-black/80 px-4 py-3 text-[#e5e5ea]">
        <div className="font-mono text-[16px] font-bold break-all">
          <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
          {fexpr}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {parts.map((p) => (
            <span
              key={p.label}
              className="rounded-md px-1.5 py-0.5 font-mono text-[11px]"
              style={{
                background: p.on ? "color-mix(in oklab, var(--accent) 45%, transparent)" : "rgb(255 255 255 / 0.08)",
                color: p.on ? "white" : "#8e8e93",
              }}
            >
              {p.on ? `"${p.t}"` : "—"} <span className="opacity-75">{p.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* результат по клітинках */}
      <div className="mx-5 mt-3 min-h-[86px] rounded-[18px] border border-separator px-2 py-4">
        <AnimatePresence mode="wait">
          {core.ok ? (
            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap justify-center gap-[3px]">
                {cells.map((c, i) => (
                  <motion.span
                    key={i}
                    layout
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={spring}
                    className="grid h-9 w-[22px] place-items-center rounded-[7px] font-mono text-[15px] font-bold"
                    style={{
                      background: c.pad
                        ? "color-mix(in oklab, var(--label) 4%, white)"
                        : "color-mix(in oklab, var(--accent) 18%, white)",
                      color: c.pad ? "var(--label-3)" : "color-mix(in oklab, var(--accent) 45%, var(--label))",
                      border: c.pad ? "1px dashed var(--label-3)" : "1px solid color-mix(in oklab, var(--accent) 60%, transparent)",
                    }}
                  >
                    {c.ch === " " ? "·" : c.ch}
                  </motion.span>
                ))}
              </div>
              <div className="mt-2 text-center font-mono text-[12px] text-label-2">
                &apos;{cells.map((c) => c.ch).join("")}&apos; · len = {cells.length}
                {width > 0 && chars(core.text).length > width && " (ширина — мінімум, довший текст не обрізається)"}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="err"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
              exit={{ opacity: 0 }}
              className="px-3 text-center font-mono text-[13px] font-semibold text-[#d70015]"
            >
              {core.err}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ControlBar>
        <Segmented
          id="fmt-type"
          value={type || "none"}
          onChange={(t) => setType(t === "none" ? "" : (t as Type))}
          options={[
            { value: "none", label: "—" },
            { value: "f", label: "f" },
            { value: "%", label: "%" },
            { value: "e", label: "e" },
            { value: "d", label: "d" },
            { value: "b", label: "b" },
            { value: "x", label: "x" },
          ]}
        />
        <Segmented
          id="fmt-align"
          value={align || "none"}
          onChange={(a) => setAlign(a === "none" ? "" : (a as Align))}
          options={[
            { value: "none", label: "авто" },
            { value: "<", label: "<" },
            { value: "^", label: "^" },
            { value: ">", label: ">" },
          ]}
        />
        <Segmented
          id="fmt-group"
          value={group || "none"}
          onChange={(g) => setGroup(g === "none" ? "" : (g as Group))}
          options={[
            { value: "none", label: "без груп" },
            { value: ",", label: "," },
            { value: "_", label: "_" },
          ]}
        />
      </ControlBar>
      <div className="flex flex-wrap items-center gap-2 px-5">
        <span className="text-[12px] font-semibold text-label-2">Заповнювач:</span>
        {FILLS.map((f) => (
          <button
            key={f}
            disabled={!align}
            onClick={() => setFill(f)}
            className="grid size-8 place-items-center rounded-[10px] font-mono text-[14px] font-bold disabled:opacity-30"
            style={{
              background: f === fill ? "color-mix(in oklab, var(--accent) 18%, white)" : "color-mix(in oklab, var(--label) 6%, transparent)",
              boxShadow: f === fill ? "inset 0 0 0 1.5px var(--accent)" : "none",
            }}
            aria-label={`заповнювач ${f === " " ? "пробіл" : f}`}
          >
            {f === " " ? "␣" : f}
          </button>
        ))}
        {!align && <span className="text-[11px] text-label-3">(потрібне явне вирівнювання)</span>}
      </div>
      <ControlBar>
        <Slider label="ширина" value={width} min={0} max={18} onChange={setWidth} />
        <Slider label={prec === null ? "точність (вимкнено)" : "точність"} value={prec ?? 0} min={0} max={6} onChange={setPrec} />
        <button
          onClick={() => setPrec(prec === null ? 2 : null)}
          className="pill pill-glass !px-3 !py-1 !text-[12px]"
        >
          {prec === null ? "увімкнути .точність" : "прибрати .точність"}
        </button>
      </ControlBar>
    </div>
  );
}
