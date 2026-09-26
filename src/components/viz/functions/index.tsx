"use client";

import type { ComponentType } from "react";
import { ArgsBinder } from "./ArgsBinder";
import { CallStack3D } from "./CallStack3D";
import { CallStepper } from "./CallStepper";
import { Legb3D } from "./Legb3D";
import { MutableDefault } from "./MutableDefault";

/** Візуалізації розділу «Функції». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "call-stepper": CallStepper,
  "mutable-default": MutableDefault,
  "args-binder": ArgsBinder,
  "legb-3d": Legb3D,
  "call-stack-3d": CallStack3D,
};
