"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { A2_INK } from "./palette";

const KW = new Set([
  "if", "elif", "else", "match", "case", "and", "or", "not", "in", "is", "return", "def", "for", "while",
  "break", "continue", "True", "False", "None", "print", "pass",
]);

/** Дуже простий підсвічувач Python для коротких фрагментів у візуалізаціях. */
export function tokenize(line: string, key: string): ReactNode[] {
  const re = /("[^"]*"|'[^']*'|#.*$|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  return line
    .split(re)
    .filter((p) => p !== "")
    .map((p, i) => {
      const k = `${key}-${i}`;
      if (p.startsWith("#")) return <span key={k} className="text-label-3 italic">{p}</span>;
      if (p.startsWith('"') || p.startsWith("'"))
        return <span key={k} style={{ color: A2_INK }}>{p}</span>;
      if (/^\d/.test(p)) return <span key={k} className="text-[#c45500]">{p}</span>;
      if (KW.has(p)) return <span key={k} className="font-semibold" style={{ color: "var(--accent)" }}>{p}</span>;
      return <span key={k}>{p}</span>;
    });
}

/**
 * Панель коду з підсвіченим активним рядком. `active` — індекс рядка (0-based)
 * або -1. `muted` — рядки, які слід притушити (пропущені гілки).
 */
export function CodePane({
  lines,
  active = -1,
  muted = [],
  id,
  className = "",
}: {
  lines: string[];
  active?: number;
  muted?: number[];
  id: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-x-auto rounded-2xl border border-separator bg-white py-2.5 font-mono text-[12.5px] leading-[1.7] ${className}`}
    >
      {lines.map((l, i) => (
        <div key={i} className="relative px-3 whitespace-pre">
          {i === active && (
            <motion.span
              layoutId={`codepane-${id}`}
              className="absolute inset-y-0 left-0 right-0 rounded-md"
              style={{
                background: "color-mix(in oklab, var(--accent) 16%, transparent)",
                boxShadow: "inset 3px 0 0 var(--accent)",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span
            className="relative transition-opacity duration-300"
            style={{ opacity: muted.includes(i) ? 0.35 : 1 }}
          >
            <span className="mr-3 inline-block w-4 text-right text-label-3 select-none">{i + 1}</span>
            {tokenize(l, `${id}-${i}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
