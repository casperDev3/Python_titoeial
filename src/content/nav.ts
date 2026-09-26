import { sections } from "./sections";
import type { Section } from "./types";

/** Легка версія розділу для клієнтських компонентів (без блоків контенту). */
export type NavItem = Pick<Section, "slug" | "order" | "title" | "short" | "icon" | "group" | "theme" | "minutes"> & {
  heroEmoji: string;
  heroName: string;
};

export const navItems: NavItem[] = sections.map((s) => ({
  slug: s.slug,
  order: s.order,
  title: s.title,
  short: s.short,
  icon: s.icon,
  group: s.group,
  theme: s.theme,
  minutes: s.minutes,
  heroEmoji: s.hero.emoji,
  heroName: s.hero.name,
}));
