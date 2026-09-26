"use client";

import { useEffect, useState } from "react";

export type ThemeColors = { accent: string; accent2: string; glow: string; label: string; label2: string; dark: boolean };

function read(): ThemeColors {
  const cs = getComputedStyle(document.body);
  const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
  return {
    accent: v("--accent", "#0a84ff"),
    accent2: v("--accent-2", "#bf5af2"),
    glow: v("--glow", "#5e5ce6"),
    label: v("--label", "#1c1c1e"),
    label2: v("--label-2", "#666"),
    dark: matchMedia("(prefers-color-scheme: dark)").matches,
  };
}

/**
 * Реальні кольори теми (hex/rgb) для Three.js-матеріалів і canvas,
 * де CSS-змінні напряму не працюють. Оновлюється при зміні теми.
 */
export function useThemeColors(): ThemeColors {
  const [c, setC] = useState<ThemeColors>({
    accent: "#0a84ff", accent2: "#bf5af2", glow: "#5e5ce6", label: "#1c1c1e", label2: "#666", dark: false,
  });
  useEffect(() => {
    const update = () => setC(read());
    // ThemeSync міняє змінні після навігації — чекаємо кінця переходу
    const t = setTimeout(update, 50);
    const t2 = setTimeout(update, 950);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    const mo = new MutationObserver(() => setTimeout(update, 950));
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      mq.removeEventListener("change", update);
      mo.disconnect();
    };
  }, []);
  return c;
}
