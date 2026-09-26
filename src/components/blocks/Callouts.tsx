import { AlertTriangle, Lightbulb } from "lucide-react";
import { Prose } from "./Inline";

export function Tip({ title, md }: { title?: string; md: string }) {
  return (
    <div className="glass glass-tint flex gap-4 p-5">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-[12px] text-white"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
      >
        <Lightbulb className="size-5" />
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
      style={{ background: "color-mix(in oklab, #ff9f0a 10%, var(--glass-bg))", borderColor: "rgb(255 159 10 / 0.35)" }}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#ff9f0a] text-white">
        <AlertTriangle className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="mb-1 text-sm font-bold tracking-tight text-[#c77700] dark:text-[#ffb340]">
          Обережно{title ? ` · ${title}` : ""}
        </div>
        <Prose md={md} className="!text-[15.5px]" />
      </div>
    </div>
  );
}

export function Joke({ md, hero, emoji }: { md: string; hero: string; emoji: string }) {
  return (
    <div className="flex items-end gap-3">
      <span
        className="grid size-12 shrink-0 place-items-center rounded-full text-2xl shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
      >
        {emoji}
      </span>
      <div className="glass relative max-w-[640px] !rounded-[22px] !rounded-bl-[6px] px-5 py-3.5">
        <div className="mb-0.5 text-xs font-semibold text-label-2">{hero} жартує</div>
        <Prose md={md} className="!text-[15.5px]" />
      </div>
    </div>
  );
}
