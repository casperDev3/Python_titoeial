"use client";

import type { ComponentType } from "react";
import { Counter3D } from "./Counter3D";
import { FStringLab } from "./FStringLab";
import { OraRefactor } from "./OraRefactor";
import { UnpackLab } from "./UnpackLab";
import { Zip3D } from "./Zip3D";

/** Візуалізації розділу «Pythonic стиль і лайфхаки». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "ora-refactor": OraRefactor,
  "fstring-lab": FStringLab,
  "unpack-lab": UnpackLab,
  "zip-3d": Zip3D,
  "counter-3d": Counter3D,
};
