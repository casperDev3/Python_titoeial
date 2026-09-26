"use client";

import { useSyncExternalStore } from "react";

const KEY = "pha:visited";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

export function markVisited(slug: string) {
  const cur = read();
  if (cur.includes(slug)) return;
  cache = [...cur, slug];
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {}
  listeners.forEach((l) => l());
}

const EMPTY: string[] = [];

/** Список розділів, які користувач уже відкривав (зберігається в localStorage). */
export function useVisited(): string[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
