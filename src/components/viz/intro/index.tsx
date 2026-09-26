"use client";

import type { ComponentType } from "react";
import { InterpreterPipeline3D } from "./InterpreterPipeline3D";
import { PrintPlayground } from "./PrintPlayground";
import { StepRunner } from "./StepRunner";
import { Zen3D } from "./Zen3D";

/** Візуалізації розділу «Перші кроки з Python». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "interpreter-3d": InterpreterPipeline3D,
  "print-playground": PrintPlayground,
  "step-runner": StepRunner,
  "zen-3d": Zen3D,
};
