import { AlertTriangle, Lightbulb } from "lucide-react";
import { HeroAvatar } from "@/components/ui/SectionIcon";
import { Prose } from "./Inline";

export function Tip({ title, md }: { title?: string; md: string }) {
  return (
    <div className="glass glass-tint flex gap-4 p-5">
      <span className="icon-tile size-10">
        <Lightbulb className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="mb-1 text-sm font-bold tracking-tight" style={{ color: "var(--accent)" }}>
          Лайфхак{title ? ` · ${title}` : ""}
        </div>
        <Prose md={md} className="!text-[15.5px]" />
      </div>
    </div>
  );
}

export function Warning({ title, md }: { title?: string; md: string }) {
  return (
    <div
      className="glass flex gap-4 p-5"
      style={{ background: "color-mix(in oklab, #ff9f0a 7%, white)", borderColor: "rgb(255 159 10 / 0.3)" }}
    >
      <span className="icon-tile size-10" style={{ ["--tile" as string]: "#c96a00" }}>
        <AlertTriangle className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="mb-1 text-sm font-bold tracking-tight text-[#b35f00]">
          Обережно{title ? ` · ${title}` : ""}
        </div>
        <Prose md={md} className="!text-[15.5px]" />
      </div>
    </div>
  );
}

export function Joke({ md, hero }: { md: string; hero: string }) {
  return (
    <div className="flex items-end gap-3">
      <HeroAvatar name={hero} size={44} />
      <div className="glass relative max-w-[640px] !rounded-[22px] !rounded-bl-[6px] px-5 py-3.5">
        <div className="mb-0.5 text-xs font-semibold text-label-2">{hero} жартує</div>
        <Prose md={md} className="!text-[15.5px]" />
      </div>
    </div>
  );
}
