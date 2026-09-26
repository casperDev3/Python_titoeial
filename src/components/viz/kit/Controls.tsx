"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Сегментований перемикач у стилі iOS. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  id,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  /** унікальний id для анімації індикатора */
  id: string;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-[12px] bg-separator/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="relative rounded-[10px] px-3 py-1.5 text-[13px] font-semibold"
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${id}`}
              className="absolute inset-0 rounded-[10px] bg-elevated shadow-sm"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Кнопка-пігулка. variant="accent" — заливка кольором теми. */
export function Btn({
  children,
  onClick,
  variant = "glass",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "glass" | "accent";
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`pill ${variant === "accent" ? "pill-accent" : "pill-glass"} disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

/** Слайдер з підписом і значенням. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-[13px]">
      <span className="flex justify-between font-medium text-label-2">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-label">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: "var(--accent)" }}
      />
    </label>
  );
}

/** Панель керування під/над візуалізацією. */
export function ControlBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 px-5 py-3">{children}</div>;
}

/** Монохромний «термінал» для виводу стану візуалізації. */
export function Console({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="mx-5 mb-4 rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12.5px] leading-relaxed text-[#e5e5ea]">
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
}
