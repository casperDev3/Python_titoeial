"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Console, ControlBar, Segmented } from "../kit";

type Zone = "a" | "both" | "b";
type Op = "|" | "&" | "-" | "^";

const START: Record<string, Zone> = {
  Yuji: "a",
  Megumi: "a",
  Nobara: "a",
  Maki: "both",
  Panda: "both",
  Todo: "b",
  Mai: "b",
  Momo: "b",
};
const NEXT: Record<Zone, Zone> = { a: "both", both: "b", b: "a" };

const OPS: Record<Op, { name: string; zones: Zone[]; method: string }> = {
  "|": { name: "об'єднання", zones: ["a", "both", "b"], method: "union" },
  "&": { name: "перетин", zones: ["both"], method: "intersection" },
  "-": { name: "різниця", zones: ["a"], method: "difference" },
  "^": { name: "симетрична різниця", zones: ["a", "b"], method: "symmetric_difference" },
};

const AX = 150;
const BX = 270;
const CY = 128;
const R = 104;
const ZONE_X: Record<Zone, number> = { a: 96, both: 210, b: 324 };

export function VennSets() {
  const [op, setOp] = useState<Op>("&");
  const [zones, setZones] = useState<Record<string, Zone>>(START);

  const names = Object.keys(zones);
  const active = OPS[op].zones;
  const inZone = (z: Zone) => names.filter((n) => zones[n] === z);
  const pos = (n: string) => {
    const z = zones[n];
    const list = inZone(z);
    const i = list.indexOf(n);
    const gap = 26;
    const y0 = CY - ((list.length - 1) * gap) / 2;
    return { x: ZONE_X[z], y: y0 + i * gap };
  };

  const tokyo = names.filter((n) => zones[n] !== "b").sort();
  const kyoto = names.filter((n) => zones[n] !== "a").sort();
  const result = names.filter((n) => active.includes(zones[n])).sort();
  const fmt = (xs: string[]) => (xs.length ? "{" + xs.map((x) => `'${x}'`).join(", ") + "}" : "set()");

  const on = (z: Zone) => active.includes(z);
  const fill = "color-mix(in oklab, var(--accent) 55%, var(--accent-2))";

  return (
    <div>
      <ControlBar>
        <Segmented
          id="venn-op"
          value={op}
          onChange={setOp}
          options={(Object.keys(OPS) as Op[]).map((o) => ({
            value: o,
            label: <span className="font-mono">a {o} b</span>,
          }))}
        />
        <span className="text-[13px] font-semibold" style={{ color: "var(--accent)" }}>
          {OPS[op].name}
        </span>
      </ControlBar>

      <div className="px-2 sm:px-4">
        <svg viewBox="0 0 420 256" className="h-auto w-full select-none" role="img" aria-label="Діаграма Венна">
          <defs>
            <clipPath id="venn-clip-a">
              <circle cx={AX} cy={CY} r={R} />
            </clipPath>
            <clipPath id="venn-clip-b">
              <circle cx={BX} cy={CY} r={R} />
            </clipPath>
            <mask id="venn-a-only">
              <rect width="420" height="256" fill="white" />
              <circle cx={BX} cy={CY} r={R} fill="black" />
            </mask>
            <mask id="venn-b-only">
              <rect width="420" height="256" fill="white" />
              <circle cx={AX} cy={CY} r={R} fill="black" />
            </mask>
          </defs>

          {/* області */}
          <motion.circle
            cx={AX}
            cy={CY}
            r={R}
            mask="url(#venn-a-only)"
            initial={false}
            animate={{ opacity: on("a") ? 0.55 : 0.06 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            style={{ fill }}
          />
          <motion.circle
            cx={BX}
            cy={CY}
            r={R}
            mask="url(#venn-b-only)"
            initial={false}
            animate={{ opacity: on("b") ? 0.55 : 0.06 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            style={{ fill }}
          />
          <g clipPath="url(#venn-clip-a)">
            <motion.circle
              cx={BX}
              cy={CY}
              r={R}
              initial={false}
              animate={{ opacity: on("both") ? 0.75 : 0.06 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              style={{ fill }}
            />
          </g>

          {/* контури */}
          <circle cx={AX} cy={CY} r={R} fill="none" strokeWidth={2} style={{ stroke: "var(--accent)" }} />
          <circle cx={BX} cy={CY} r={R} fill="none" strokeWidth={2} style={{ stroke: "var(--accent-2)" }} />
          <text x={AX - 70} y={15} fontSize={13} fontWeight={700} className="font-mono" style={{ fill: "var(--accent)" }}>
            a = tokyo
          </text>
          <text x={BX + 70} y={15} fontSize={13} fontWeight={700} textAnchor="end" className="font-mono" style={{ fill: "var(--accent-2)" }}>
            b = kyoto
          </text>

          {/* імена */}
          {names.map((n) => {
            const p = pos(n);
            const inRes = active.includes(zones[n]);
            const w = n.length * 7.4 + 16;
            return (
              <motion.g
                key={n}
                initial={false}
                animate={{ x: p.x, y: p.y }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                onClick={() => setZones((z) => ({ ...z, [n]: NEXT[z[n]] }))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={-w / 2}
                  y={-11}
                  width={w}
                  height={22}
                  rx={11}
                  style={{
                    fill: inRes ? "var(--bg-elevated)" : "color-mix(in oklab, var(--bg-elevated) 55%, transparent)",
                    stroke: inRes ? "var(--accent)" : "var(--separator)",
                  }}
                  strokeWidth={1.2}
                />
                <text
                  textAnchor="middle"
                  y={4.2}
                  fontSize={12}
                  fontWeight={inRes ? 700 : 500}
                  style={{ fill: inRes ? "var(--label)" : "var(--label-2)" }}
                >
                  {n}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="px-5 pb-1 text-[11.5px] text-label-3">Клацни на ім&apos;я — воно переміститься: лише a → обидві → лише b.</div>

      <Console
        lines={[
          <span key="a" className="break-all text-[#8e8e93]">
            tokyo = {fmt(tokyo)}
          </span>,
          <span key="b" className="break-all text-[#8e8e93]">
            kyoto = {fmt(kyoto)}
          </span>,
          <span key="c">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            sorted(tokyo {op} kyoto)
            <span className="text-[#8e8e93]">   # або tokyo.{OPS[op].method}(kyoto)</span>
          </span>,
          <motion.span key={`r-${op}-${result.join()}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="break-all text-[#ffd60a]">
            {result.length ? "[" + result.map((x) => `'${x}'`).join(", ") + "]" : "[]"}
          </motion.span>,
        ]}
      />
    </div>
  );
}
