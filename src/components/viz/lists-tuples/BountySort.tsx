"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Console, ControlBar, Segmented } from "../kit";
import { CrewIcon } from "./icons";

type Pirate = { name: string; bounty: number };

const CREW: Pirate[] = [
  { name: "Zoro", bounty: 1111 },
  { name: "Nami", bounty: 366 },
  { name: "Luffy", bounty: 3000 },
  { name: "Usopp", bounty: 500 },
  { name: "Sanji", bounty: 1032 },
  { name: "Robin", bounty: 930 },
  { name: "Chopper", bounty: 1000 },
  { name: "Jinbe", bounty: 1100 },
];
const MAXB = 3000;

type Key = "none" | "bounty" | "len" | "name";

const KEY_CODE: Record<Key, string> = {
  none: "crew",
  bounty: "sorted(crew, key=lambda p: p.bounty",
  len: "sorted(crew, key=lambda p: len(p.name)",
  name: "sorted(crew, key=lambda p: p.name",
};

const keyOf = (k: Key, p: Pirate): number | string =>
  k === "bounty" ? p.bounty : k === "len" ? p.name.length : k === "name" ? p.name : 0;

export function BountySort() {
  const [key, setKey] = useState<Key>("none");
  const [reverse, setReverse] = useState(false);

  const indexed = CREW.map((p, i) => ({ p, i }));
  // Array.prototype.sort стабільний — як і sorted() у Python
  const sorted =
    key === "none"
      ? indexed
      : [...indexed].sort((a, b) => {
          const ka = keyOf(key, a.p);
          const kb = keyOf(key, b.p);
          const c = ka < kb ? -1 : ka > kb ? 1 : 0;
          return reverse ? -c : c;
        });

  const code =
    key === "none" ? "crew  # початковий порядок" : `${KEY_CODE[key]}${reverse ? ", reverse=True" : ""})`;

  const shownKey = (p: Pirate) =>
    key === "bounty" ? `${p.bounty}M` : key === "len" ? `len=${p.name.length}` : key === "name" ? p.name[0] : "";

  return (
    <div>
      <ControlBar>
        <Segmented
          id="bounty-key"
          value={key}
          onChange={setKey}
          options={[
            { value: "none", label: "як є" },
            { value: "bounty", label: "нагорода" },
            { value: "len", label: "len(ім'я)" },
            { value: "name", label: "ім'я" },
          ]}
        />
        <button
          onClick={() => setReverse((r) => !r)}
          disabled={key === "none"}
          className={`pill ${reverse ? "pill-accent" : "pill-glass"} font-mono !text-[12px] disabled:opacity-40`}
        >
          reverse={reverse ? "True" : "False"}
        </button>
      </ControlBar>

      <ul className="space-y-1.5 px-4 pb-3 sm:px-5">
        {sorted.map(({ p, i }, pos) => (
          <motion.li
            key={p.name}
            layout
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="flex items-center gap-2 text-[13px]"
          >
            <span className="w-4 text-right font-mono text-[11px] text-label-3">{pos}</span>
            <span className="flex w-[74px] shrink-0 items-center gap-1 truncate font-semibold sm:w-[88px]">
              <CrewIcon name={p.name} className="size-3.5 shrink-0 text-label-2" />
              <span className="truncate">{p.name}</span>
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-full" style={{ background: "var(--separator)" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={false}
                animate={{ width: `${Math.max(8, (p.bounty / MAXB) * 100)}%` }}
                style={{ background: "color-mix(in oklab, var(--accent) 30%, white)" }}
              />
              <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[11px] font-semibold text-label">
                {p.bounty}M ฿
              </span>
            </div>
            <span
              className="w-[52px] shrink-0 text-right font-mono text-[11px] font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {shownKey(p)}
            </span>
            <span
              title="початковий індекс"
              className="grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px] text-label-2"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--separator)" }}
            >
              {i}
            </span>
          </motion.li>
        ))}
      </ul>
      <div className="px-5 pb-2 text-[11.5px] text-label-3">
        Кружечок праворуч — початковий індекс. Для рівних ключів (наприклад, len = 5) він іде за зростанням: сортування стабільне.
      </div>
      <Console
        lines={[
          <span key="c" className="break-all">
            <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
            {code}
          </span>,
          <span key="r" className="break-all text-[#ffd60a]">
            <span className="text-[#8e8e93]"># імена: </span>[{sorted.map(({ p }) => `'${p.name}'`).join(", ")}]
          </span>,
        ]}
      />
    </div>
  );
}
