"use client";

import type { ComponentType } from "react";
import { Bitwise3D } from "./Bitwise3D";
import { DivmodLine } from "./DivmodLine";
import { Identity3D } from "./Identity3D";
import { PrecedencePunch } from "./PrecedencePunch";
import { ShortCircuit } from "./ShortCircuit";

/** Візуалізації розділу «Оператори та вирази». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "divmod-line": DivmodLine,
  "precedence-punch": PrecedencePunch,
  "short-circuit": ShortCircuit,
  "identity-3d": Identity3D,
  "bitwise-3d": Bitwise3D,
};
