"use client";

import type { ComponentType } from "react";
import { BreakContinue } from "./BreakContinue";
import { ForStepper } from "./ForStepper";
import { NestedGrid } from "./NestedGrid";
import { RangeRuler } from "./RangeRuler";
import { ReturnByDeath } from "./ReturnByDeath";
import { ZipEnumerate } from "./ZipEnumerate";

/** Візуалізації розділу «Цикли». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "for-stepper": ForStepper,
  "range-ruler": RangeRuler,
  "return-by-death": ReturnByDeath,
  "break-continue": BreakContinue,
  "zip-enumerate": ZipEnumerate,
  "nested-grid": NestedGrid,
};
