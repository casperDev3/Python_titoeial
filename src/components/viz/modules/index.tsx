"use client";

import type { ComponentType } from "react";
import { ImportNamespace } from "./ImportNamespace";
import { ImportSearch } from "./ImportSearch";
import { NameMain } from "./NameMain";
import { PackageTree3D } from "./PackageTree3D";
import { VenvIslands3D } from "./VenvIslands3D";

/** Візуалізації розділу «Модулі, пакети та pip». Ключ = id з блоку { type: "viz", id }. */
export const viz: Record<string, ComponentType> = {
  "import-namespace": ImportNamespace,
  "name-main": NameMain,
  "import-search": ImportSearch,
  "package-tree-3d": PackageTree3D,
  "venv-islands-3d": VenvIslands3D,
};
