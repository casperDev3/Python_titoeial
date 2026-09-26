"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { NavItem } from "@/content/nav";
import { markVisited } from "@/lib/progress";

const DEFAULT = { accent: "#0a84ff", accent2: "#bf5af2", glow: "#5e5ce6" };

/**
 * Виставляє акцентні кольори активного розділу на <body>.
 * Кольори оголошені через @property, тому браузер плавно перетікає
 * між темами при навігації.
 */
export function ThemeSync({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  useEffect(() => {
    const slug = pathname.startsWith("/learn/") ? pathname.split("/")[2] : null;
    const item = items.find((i) => i.slug === slug);
    const t = item?.theme ?? DEFAULT;
    const b = document.body.style;
    b.setProperty("--accent", t.accent);
    b.setProperty("--accent-2", "accent2" in t ? t.accent2 : DEFAULT.accent2);
    b.setProperty("--glow", t.glow);
    if (slug && item) markVisited(slug);
  }, [pathname, items]);

  return null;
}
