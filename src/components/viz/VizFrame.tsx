import { Sparkles } from "lucide-react";
import { Prose } from "../blocks/Inline";
import { VizSlot } from "./VizSlot";

export function VizFrame({ section, id, title, caption }: { section: string; id: string; title: string; caption?: string }) {
  return (
    <figure className="glass overflow-hidden !rounded-[26px]">
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <Sparkles className="size-4" strokeWidth={1.75} style={{ color: "var(--accent)" }} />
        <span className="text-sm font-semibold tracking-tight">{title}</span>
        <span className="icon-tile ml-auto !rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          інтерактив
        </span>
      </div>
      <div className="relative">
        <VizSlot section={section} id={id} />
      </div>
      {caption && (
        <figcaption className="border-t border-separator px-5 py-3 text-label-2">
          <Prose md={caption} className="!text-[14px] !text-label-2" />
        </figcaption>
      )}
    </figure>
  );
}
