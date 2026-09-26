"use client";

import { useThree } from "@react-three/fiber";
import { motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import type { PerspectiveCamera } from "three";

/** Підганяє відстань камери під ширину сцени — від 340px до десктопа. */
export function FitCamera({ width, height = 3, min = 5.5 }: { width: number; height?: number; min?: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const w = useThree((s) => s.size.width);
  const h = useThree((s) => s.size.height);
  useEffect(() => {
    const aspect = w / Math.max(h, 1);
    const half = Math.tan((camera.fov * Math.PI) / 360);
    const d = Math.max(width / 2 / (half * aspect), height / 2 / half, min);
    camera.position.setLength(d);
    camera.updateProjectionMatrix();
  }, [camera, w, h, width, height, min]);
  return null;
}

/** Експоненційне згладжування, незалежне від FPS. */
export const damp = (from: number, to: number, lambda: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-lambda * dt));

/** Курсор над полотном. */
export function setCursor(e: { nativeEvent: Event }, c: "pointer" | "auto") {
  const el = e.nativeEvent.target;
  if (el instanceof HTMLElement) el.style.cursor = c;
}

export const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

/** Невеликий блок коду з підсвіченим рядком. */
export function CodePane({ lines, active, id }: { lines: string[]; active?: number | number[]; id?: string }) {
  const act = Array.isArray(active) ? active : active === undefined ? [] : [active];
  return (
    <div className="thin-scroll overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] py-2 font-mono text-[12px] leading-[1.7] sm:text-[12.5px]">
      {lines.map((l, i) => {
        const on = act.includes(i);
        return (
          <div key={i} className="relative flex min-w-max pr-3">
            {on && (
              <motion.span
                layoutId={id && act.length === 1 ? id : undefined}
                className="absolute inset-0"
                style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)", borderLeft: "3px solid var(--accent)" }}
                transition={SPRING}
              />
            )}
            <span className="relative w-7 shrink-0 pr-2 text-right text-label-3 select-none">{i + 1}</span>
            <span className="relative whitespace-pre">{l || " "}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Маленький заголовок-мітка всередині візуалізацій. */
export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[11px] font-semibold tracking-wider text-label-2 uppercase">{children}</div>;
}
