"use client";

import { useSyncExternalStore } from "react";

const KEY = "pha:sidebar";
const listeners = new Set<() => void>();

/** Скрипт для <head>: застосовує збережений стан до першого малювання (без «стрибка»). */
export const sidebarInitScript = `try{if(localStorage.getItem("${KEY}")==="collapsed")document.documentElement.dataset.sidebar="collapsed"}catch(e){}`;

const read = () => document.documentElement.dataset.sidebar === "collapsed";

export function toggleSidebar() {
  const next = !read();
  if (next) document.documentElement.dataset.sidebar = "collapsed";
  else delete document.documentElement.dataset.sidebar;
  try {
    localStorage.setItem(KEY, next ? "collapsed" : "expanded");
  } catch {}
  listeners.forEach((l) => l());
}

export function useSidebarCollapsed() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => false,
  );
}
