"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { NavItem } from "@/content/nav";
import { useVisited } from "@/lib/progress";

export function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const visited = useVisited();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) =>
      [i.title, i.short, i.heroName].some((x) => x.toLowerCase().includes(s)),
    );
  }, [items, q]);

  const groups = useMemo(() => {
    const m = new Map<string, NavItem[]>();
    filtered.forEach((i) => m.set(i.group, [...(m.get(i.group) ?? []), i]));
    return [...m.entries()];
  }, [filtered]);

  const pct = Math.round((visited.filter((v) => items.some((i) => i.slug === v)).length / items.length) * 100);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-3">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-label-2">
          <span>Прогрес курсу</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-separator">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <label className="pill-glass mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
          <Search className="size-4 text-label-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук теми або героя"
            className="w-full bg-transparent outline-none placeholder:text-label-3"
          />
        </label>
      </div>

      <nav className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {groups.map(([group, list]) => (
          <div key={group} className="mt-3">
            <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-label-3 uppercase">
              {group}
            </div>
            <ul className="space-y-0.5">
              {list.map((item) => {
                const href = `/learn/${item.slug}`;
                const active = pathname === href;
                const done = visited.includes(item.slug);
                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className="group relative flex items-center gap-3 rounded-xl px-3 py-2 outline-none"
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `color-mix(in oklab, ${item.theme.accent} 16%, var(--glass-bg-strong))`,
                            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${item.theme.accent} 35%, transparent), 0 6px 18px -8px ${item.theme.accent}`,
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span
                        className="relative grid size-8 shrink-0 place-items-center rounded-[10px] text-base transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${item.theme.accent}, ${item.theme.accent2})`,
                          boxShadow: `0 4px 12px -4px ${item.theme.accent}`,
                        }}
                      >
                        {item.icon}
                      </span>
                      <span className="relative min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold">{item.title}</span>
                        <span className="block truncate text-[11.5px] text-label-2">{item.short}</span>
                      </span>
                      {done && !active && (
                        <Check className="relative size-3.5 shrink-0" style={{ color: item.theme.accent }} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {!groups.length && <p className="px-3 py-6 text-sm text-label-3">Нічого не знайдено 🥲</p>}
      </nav>
    </div>
  );
}
