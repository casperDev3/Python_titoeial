"use client";

import { Maximize2, Minimize2, Sparkles, Workflow } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Скляна картка інтерактиву з кнопкою повноекранного режиму.
 * Використовує Fullscreen API, а де його немає (iPhone Safari) —
 * фіксований оверлей на все вікно. Esc виходить з обох режимів.
 */
const icons = { viz: Sparkles, flow: Workflow };

export function FullscreenFigure({
  icon,
  title,
  badge,
  children,
  footer,
}: {
  icon: keyof typeof icons;
  title: string;
  badge: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const Icon = icons[icon];
  const ref = useRef<HTMLElement>(null);
  const [fs, setFs] = useState(false);

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setFs(false);
  }, []);

  const enter = useCallback(() => {
    setFs(true);
    ref.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    if (!fs) return;
    const onChange = () => {
      if (!document.fullscreenElement) setFs(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && exit();
    document.addEventListener("fullscreenchange", onChange);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [fs, exit]);

  return (
    <figure ref={ref} className={`glass viz-figure overflow-hidden !rounded-[24px] ${fs ? "is-fs" : ""}`}>
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
        <span className="min-w-0 truncate text-sm font-semibold tracking-tight">{title}</span>
        <span className="icon-tile ml-auto !rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          {badge}
        </span>
        <button
          onClick={fs ? exit : enter}
          aria-label={fs ? "Вийти з повноекранного режиму" : "На весь екран"}
          title={fs ? "Вийти (Esc)" : "На весь екран"}
          className="pill pill-glass !p-2"
        >
          {fs ? <Minimize2 className="size-4" strokeWidth={1.75} /> : <Maximize2 className="size-4" strokeWidth={1.75} />}
        </button>
      </div>
      <div className="viz-body relative">{children}</div>
      {footer}
    </figure>
  );
}
