"use client";

import type { ComponentType } from "react";
import { BeltLayers3D } from "./BeltLayers3D";
import { ClosureCells } from "./ClosureCells";
import { FibCacheTree } from "./FibCacheTree";
import { WrapperFlow } from "./WrapperFlow";

/** Візуалізації розділу «Декоратори». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "closure-cells": ClosureCells,
  "wrapper-flow": WrapperFlow,
  "belt-layers-3d": BeltLayers3D,
  "fib-cache-tree": FibCacheTree,
};
