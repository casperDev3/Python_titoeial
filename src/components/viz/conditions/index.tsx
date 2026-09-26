"use client";

import type { ComponentType } from "react";
import { BranchFlow } from "./BranchFlow";
import { DecisionTree } from "./DecisionTree";
import { MatchMachine } from "./MatchMachine";
import { ShortCircuit } from "./ShortCircuit";
import { TernaryRails } from "./TernaryRails";
import { TruthySorter } from "./TruthySorter";

/** Візуалізації розділу «Умови та розгалуження». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "branch-flow": BranchFlow,
  "short-circuit": ShortCircuit,
  "truthy-sorter": TruthySorter,
  "ternary-rails": TernaryRails,
  "decision-tree": DecisionTree,
  "match-machine": MatchMachine,
};
