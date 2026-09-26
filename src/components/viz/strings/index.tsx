"use client";

import type { ComponentType } from "react";
import { FormatSpec } from "./FormatSpec";
import { ImmutableMemory } from "./ImmutableMemory";
import { IndexTiara3D } from "./IndexTiara3D";
import { MethodPrism } from "./MethodPrism";
import { SliceLab } from "./SliceLab";
import { Utf8Towers3D } from "./Utf8Towers3D";

/** Візуалізації розділу «Рядки». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "index-tiara": IndexTiara3D,
  "slice-lab": SliceLab,
  "immutable-memory": ImmutableMemory,
  "method-prism": MethodPrism,
  "format-spec": FormatSpec,
  "utf8-towers": Utf8Towers3D,
};
