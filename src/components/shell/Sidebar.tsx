"use client";

import { useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { NavItem } from "@/content/nav";
import { toggleSidebar, useSidebarCollapsed } from "@/lib/sidebar";
import { Brand } from "./Brand";
import { Credit } from "./Credit";
import { NavList } from "./NavList";

export function Sidebar({ items }: { items: NavItem[] }) {
  const collapsed = useSidebarCollapsed();

  // ⌘\ / Ctrl+\ — згорнути/розгорнути
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className="glass glass-strong sidebar-shell fixed top-3 bottom-3 left-3 z-40 hidden w-[var(--sidebar-w)] flex-col overflow-hidden !rounded-[28px] lg:flex">
      <div className={`flex items-center gap-2 pt-5 pb-4 ${collapsed ? "flex-col px-2" : "px-5"}`}>
        <Brand compact={collapsed} />
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Розгорнути меню" : "Згорнути меню"}
          title={`${collapsed ? "Розгорнути" : "Згорнути"} меню (⌘\\)`}
          className={`pill pill-glass !p-2 ${collapsed ? "mt-1" : "ml-auto"}`}
        >
          <ToggleIcon className="size-4" strokeWidth={1.75} />
        </button>
      </div>
      <NavList items={items} collapsed={collapsed} />
      <div className={`border-t border-separator py-3 ${collapsed ? "grid place-items-center" : "px-5"}`}>
        <Credit compact={collapsed} />
      </div>
    </aside>
  );
}
