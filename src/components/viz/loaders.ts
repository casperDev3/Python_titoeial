"use client";

import type { ComponentType } from "react";

type VizModule = { viz: Record<string, ComponentType> };

/** Ліниві завантажувачі візуалізацій — кожен розділ окремим чанком. */
export const vizLoaders: Record<string, () => Promise<VizModule>> = {
  "intro": () => import("./intro"),
  "variables": () => import("./variables"),
  "operators": () => import("./operators"),
  "strings": () => import("./strings"),
  "conditions": () => import("./conditions"),
  "loops": () => import("./loops"),
  "lists-tuples": () => import("./lists-tuples"),
  "dicts-sets": () => import("./dicts-sets"),
  "functions": () => import("./functions"),
  "comprehensions-lambda": () => import("./comprehensions-lambda"),
  "errors": () => import("./errors"),
  "files": () => import("./files"),
  "modules": () => import("./modules"),
  "oop-basics": () => import("./oop-basics"),
  "oop-advanced": () => import("./oop-advanced"),
  "iterators-generators": () => import("./iterators-generators"),
  "decorators": () => import("./decorators"),
  "pythonic": () => import("./pythonic"),
};
