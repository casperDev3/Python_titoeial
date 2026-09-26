import type { Section } from "@/content/types";
import { Clock } from "lucide-react";

export function SectionHero({ section }: { section: Section }) {
  const { hero, theme } = section;
  return (
    <header className="relative pt-4">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px] font-medium text-label-2">
        <span className="pill pill-glass !py-1">
          Розділ {section.order} · {section.group}
        </span>
        <span className="pill pill-glass !py-1">
          <Clock className="size-3.5" /> {section.minutes} хв
        </span>
      </div>
      <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[56px]">
        <span className="mr-3 inline-block">{section.icon}</span>
        <span className="text-gradient">{section.title}</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-label-2 sm:text-xl">{section.summary}</p>

      <div className="glass glass-tint mt-8 flex flex-col gap-5 overflow-hidden p-6 sm:flex-row sm:items-center">
        <div
          className="relative grid size-24 shrink-0 place-items-center rounded-[28px] text-5xl"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            boxShadow: `0 18px 40px -14px ${theme.glow}`,
          }}
        >
          <span className="animate-[float_5s_ease-in-out_infinite]">{hero.emoji}</span>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wider text-label-2 uppercase">
            Провідник розділу · {hero.universe}
          </div>
          <div className="mt-0.5 text-2xl font-bold tracking-tight">{hero.name}</div>
          <blockquote className="mt-2 text-[17px] font-medium italic">«{hero.quote}»</blockquote>
          <p className="mt-2 text-[15px] text-label-2">{hero.why}</p>
        </div>
      </div>
    </header>
  );
}
