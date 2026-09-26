"use client";

import { useThree } from "@react-three/fiber";
import { motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import type { PerspectiveCamera } from "three";

/** Акцент для тексту: жовтий Бетмена затемнюється у світлій темі й світлішає в темній. */
export const INK = "color-mix(in oklab, var(--accent) 62%, var(--label))";

const KW = new Set([
  "def", "return", "yield", "from", "while", "for", "in", "if", "else", "try", "except", "break", "import",
  "True", "False", "None", "print", "nonlocal", "global", "lambda", "not", "class", "pass",
]);

/** Мінімальний підсвічувач Python для коротких фрагментів. */
export function tokenize(line: string, key: string): ReactNode[] {
  const re = /("[^"]*"|'[^']*'|#.*$|@[A-Za-z_][\w.]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  return line
    .split(re)
    .filter((p) => p !== "")
    .map((p, i) => {
      const k = `${key}-${i}`;
      if (p.startsWith("@"))
        return (
          <span key={k} className="font-bold" style={{ color: INK }}>
            {p}
          </span>
        );
      if (p.startsWith("#")) return <span key={k} className="text-label-3 italic">{p}</span>;
      if (p.startsWith('"') || p.startsWith("'"))
        return <span key={k} className="text-[#30a46c] dark:text-[#5bd38d]">{p}</span>;
      if (/^\d/.test(p)) return <span key={k} className="text-[#ff9f0a]">{p}</span>;
      if (KW.has(p))
        return (
          <span key={k} className="font-semibold" style={{ color: INK }}>
            {p}
          </span>
        );
      return <span key={k}>{p}</span>;
    });
}

/** Панель коду з анімованою підсвіткою активного рядка (0-based, -1 — нічого). */
export function CodePane({
  lines,
  active = -1,
  id,
  tone = "accent",
  className = "",
}: {
  lines: string[];
  active?: number;
  id: string;
  tone?: "accent" | "warn";
  className?: string;
}) {
  const c = tone === "warn" ? "#ff9f0a" : "var(--accent)";
  return (
    <div
      className={`relative overflow-x-auto rounded-2xl border border-separator bg-black/[0.035] py-2 font-mono text-[12px] leading-[1.75] sm:text-[12.5px] dark:bg-white/[0.04] ${className}`}
    >
      {lines.map((l, i) => (
        <div key={i} className="relative px-3 whitespace-pre">
          {i === active && (
            <motion.span
              layoutId={`cp-${id}`}
              className="absolute inset-y-0 left-0 right-0 rounded-md"
              style={{
                background: `color-mix(in oklab, ${c} 18%, transparent)`,
                boxShadow: `inset 3px 0 0 ${c}`,
              }}
              transition={{ type: "spring", stiffness: 520, damping: 40 }}
            />
          )}
          <span className="relative">
            <span className="mr-3 inline-block w-4 text-right text-label-3 select-none">{i + 1}</span>
            {tokenize(l, `${id}-${i}`)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Підганяє відстань камери, щоб сцена шириною `width` вміщалась від 340px до десктопа. */
export function FitCamera({ width, height = 3, min = 6 }: { width: number; height?: number; min?: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const w = useThree((s) => s.size.width);
  const h = useThree((s) => s.size.height);
  useEffect(() => {
    const aspect = w / Math.max(h, 1);
    const half = Math.tan((camera.fov * Math.PI) / 360);
    const dW = width / 2 / (half * aspect);
    const dH = height / 2 / half;
    camera.position.setLength(Math.max(dW, dH, min));
    camera.updateProjectionMatrix();
  }, [camera, w, h, width, height, min]);
  return null;
}

/** Експоненційне згладжування, незалежне від FPS. */
export const damp = (from: number, to: number, lambda: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-lambda * dt));

/** Невеликий «скляний» бейдж-підпис. */
export function Tag({ children, color = INK }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10.5px] font-bold tracking-wide"
      style={{ color, background: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      {children}
    </span>
  );
}
