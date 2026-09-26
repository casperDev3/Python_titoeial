"use client";

import type { ComponentType } from "react";
import { GeneratorStepper } from "./GeneratorStepper";
import { IterProtocol } from "./IterProtocol";
import { ItertoolsLab } from "./ItertoolsLab";
import { LazyPipeline } from "./LazyPipeline";
import { TimeStone3D } from "./TimeStone3D";

/** Візуалізації розділу «Ітератори та генератори». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "iter-protocol": IterProtocol,
  "generator-stepper": GeneratorStepper,
  "lazy-pipeline": LazyPipeline,
  "time-stone-3d": TimeStone3D,
  "itertools-lab": ItertoolsLab,
};
