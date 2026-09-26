"use client";

import type { ComponentType } from "react";
import { FileCursor } from "./FileCursor";
import { JsonBridge } from "./JsonBridge";
import { OpenModes } from "./OpenModes";
import { PathTree } from "./PathTree";
import { WithCircle } from "./WithCircle";

/** Візуалізації розділу «Файли та контекст». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "with-circle": WithCircle,
  "open-modes": OpenModes,
  "file-cursor": FileCursor,
  "path-tree": PathTree,
  "json-bridge": JsonBridge,
};
