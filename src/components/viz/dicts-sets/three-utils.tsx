"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";

/**
 * Підганяє відстань камери так, щоб сцена шириною `width` (і висотою `height`)
 * вміщалась у будь-яке співвідношення сторін — від 340px до десктопа.
 */
export function FitCamera({ width, height = 3, min = 6 }: { width: number; height?: number; min?: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const w = useThree((s) => s.size.width);
  const h = useThree((s) => s.size.height);
  useEffect(() => {
    const aspect = w / Math.max(h, 1);
    const half = Math.tan((camera.fov * Math.PI) / 360);
    const dW = width / 2 / (half * aspect);
    const dH = height / 2 / half;
    const d = Math.max(dW, dH, min);
    camera.position.setLength(d);
    camera.updateProjectionMatrix();
  }, [camera, w, h, width, height, min]);
  return null;
}

/** Експоненційне згладжування, незалежне від FPS. */
export const damp = (from: number, to: number, lambda: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-lambda * dt));

/** Курсор над полотном (не чіпаємо body, щоб не смикати спостерігачів теми). */
export function setCanvasCursor(e: { nativeEvent: Event }, c: "pointer" | "auto") {
  const el = e.nativeEvent.target;
  if (el instanceof HTMLElement) el.style.cursor = c;
}

/** Поточний час у секундах (для анімацій, що стартують з обробників подій). */
export const nowSec = () => performance.now() / 1000;
