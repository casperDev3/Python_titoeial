"use client";

import type { ComponentType } from "react";
import { ExceptOrder } from "./ExceptOrder";
import { ExceptionTree } from "./ExceptionTree";
import { StackBubble } from "./StackBubble";
import { TryFlow } from "./TryFlow";

/** Візуалізації розділу «Винятки та помилки». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "try-flow": TryFlow,
  "except-order": ExceptOrder,
  "exception-tree": ExceptionTree,
  "stack-bubble": StackBubble,
};
