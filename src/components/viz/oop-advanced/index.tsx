"use client";

import type { ComponentType } from "react";
import { DataclassGen } from "./DataclassGen";
import { DunderLab } from "./DunderLab";
import { MroWeb } from "./MroWeb";
import { MultiversePoly } from "./MultiversePoly";
import { SuperChain } from "./SuperChain";

/** Візуалізації розділу «ООП: наслідування та магія». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "multiverse-poly": MultiversePoly,
  "mro-web": MroWeb,
  "super-chain": SuperChain,
  "dunder-lab": DunderLab,
  "dataclass-gen": DataclassGen,
};
