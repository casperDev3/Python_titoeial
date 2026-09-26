"use client";

import { useEffect, useState, type ComponentType } from "react";
import { vizLoaders } from "./loaders";

const cache = new Map<string, ComponentType>();

/** Підвантажує візуалізацію розділу за id (окремий чанк на розділ). */
export function VizSlot({ section, id }: { section: string; id: string }) {
  const key = `${section}/${id}`;
  const [Comp, setComp] = useState<ComponentType | null>(() => cache.get(key) ?? null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (Comp) return;
    let alive = true;
    vizLoaders[section]?.()
      .then((m) => {
        const c = m.viz[id];
        if (!alive) return;
        if (c) {
          cache.set(key, c);
          setComp(() => c);
        } else setMissing(true);
      })
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
    };
  }, [Comp, key, section, id]);

  if (missing)
    return <div className="p-8 text-center text-sm text-label-3">Візуалізацію «{id}» не знайдено</div>;
  if (!Comp) return <VizSkeleton />;
  return <Comp />;
}

export function VizSkeleton() {
  return (
    <div className="grid h-[320px] place-items-center">
      <div
        className="size-10 animate-spin rounded-full border-[3px] border-separator"
        style={{ borderTopColor: "var(--accent)" }}
      />
    </div>
  );
}
