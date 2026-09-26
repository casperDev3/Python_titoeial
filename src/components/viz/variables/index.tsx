"use client";

import type { ComponentType } from "react";
import { Memory3D } from "./Memory3D";
import { MutableLab } from "./MutableLab";
import { NameTags } from "./NameTags";
import { Transform3D } from "./Transform3D";
import { TruthySorter } from "./TruthySorter";

/** Візуалізації розділу «Змінні та типи даних». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "name-tags": NameTags,
  "truthy-sorter": TruthySorter,
  "transform-3d": Transform3D,
  "mutable-lab": MutableLab,
  "memory-3d": Memory3D,
};
