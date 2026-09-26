"use client";

import type { ComponentType } from "react";
import { AnyAllShortCircuit } from "./AnyAllShortCircuit";
import { ComprehensionPipeline } from "./ComprehensionPipeline";
import { MapFilterLab } from "./MapFilterLab";
import { NestedGrid3D } from "./NestedGrid3D";
import { SortedKey3D } from "./SortedKey3D";

/** Візуалізації розділу «Comprehensions та lambda». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "comprehension-pipeline": ComprehensionPipeline,
  "nested-grid-3d": NestedGrid3D,
  "map-filter-lab": MapFilterLab,
  "sorted-key-3d": SortedKey3D,
  "any-all-shortcircuit": AnyAllShortCircuit,
};
