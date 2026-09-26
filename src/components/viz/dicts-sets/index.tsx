"use client";

import type { ComponentType } from "react";
import { DictOps } from "./DictOps";
import { HashDomain3D } from "./HashDomain3D";
import { InfinitySet3D } from "./InfinitySet3D";
import { LookupRace } from "./LookupRace";
import { VennSets } from "./VennSets";

/** Візуалізації розділу «Словники та множини». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "hash-domain-3d": HashDomain3D,
  "dict-ops": DictOps,
  "lookup-race": LookupRace,
  "infinity-set-3d": InfinitySet3D,
  "venn-sets": VennSets,
};
