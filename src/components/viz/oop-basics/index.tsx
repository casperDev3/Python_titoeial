"use client";

import type { ComponentType } from "react";
import { AttrLookup } from "./AttrLookup";
import { BlueprintForge } from "./BlueprintForge";
import { EncapsulationVault } from "./EncapsulationVault";
import { InitStepper } from "./InitStepper";
import { ReactorProperty } from "./ReactorProperty";

/** Візуалізації розділу «ООП: класи та об'єкти». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "init-stepper": InitStepper,
  "attr-lookup": AttrLookup,
  "blueprint-forge": BlueprintForge,
  "reactor-property": ReactorProperty,
  "encapsulation-vault": EncapsulationVault,
};
