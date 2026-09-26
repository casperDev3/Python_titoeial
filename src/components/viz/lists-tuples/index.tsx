"use client";

import type { ComponentType } from "react";
import { BountySort } from "./BountySort";
import { CrewShip3D } from "./CrewShip3D";
import { ReferenceLab } from "./ReferenceLab";
import { SliceLab } from "./SliceLab";
import { TupleVault3D } from "./TupleVault3D";
import { UnpackMap } from "./UnpackMap";

/** Візуалізації розділу «Списки та кортежі». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "crew-ship-3d": CrewShip3D,
  "slice-lab": SliceLab,
  "reference-lab": ReferenceLab,
  "bounty-sort": BountySort,
  "tuple-vault-3d": TupleVault3D,
  "unpack-map": UnpackMap,
};
