"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { NavItem } from "@/content/nav";
import { Brand } from "./Brand";
import { NavList } from "./NavList";

export function MobileBar({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="glass sticky top-2 z-40 mx-2 mt-2 flex items-center justify-between !rounded-[22px] px-4 py-2.5 lg:hidden">
        <Brand onClick={() => setOpen(false)} />
        <button
          aria-label="Меню"
          onClick={() => setOpen(true)}
          className="pill pill-glass !p-2.5"
        >
          <Menu className="size-5" />
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="glass glass-strong fixed top-2 bottom-2 left-2 z-50 flex w-[min(86vw,320px)] flex-col !rounded-[26px] lg:hidden"
              initial={{ x: "-110%" }}
              animate={{ x: 0 }}
              exit={{ x: "-110%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
            >
              <div className="flex items-center justify-between p-5 pb-4">
                <Brand onClick={() => setOpen(false)} />
                <button aria-label="Закрити" onClick={() => setOpen(false)} className="pill pill-glass !p-2">
                  <X className="size-4" />
                </button>
              </div>
              <NavList items={items} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
