import type { Section } from "@/content/types";
import { Clock, Quote } from "lucide-react";
import { HeroAvatar, SectionIcon } from "@/components/ui/SectionIcon";

export function SectionHero({ section }: { section: Section }) {
  const { hero } = section;
  return (
    <header className="relative pt-2">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-[13px] font-medium text-label-2">
        <span className="pill pill-glass !py-1">
          Розділ {section.order} · {section.group}
        </span>
        <span className="pill pill-glass !py-1">
          <Clock className="size-3.5" strokeWidth={1.75} /> {section.minutes} хв
        </span>
      </div>
      <div className="flex items-start gap-4">
        <SectionIcon slug={section.slug} size={56} className="mt-1 !rounded-[16px]" />
        <h1 className="text-[38px] leading-[1.05] font-bold tracking-[-0.03em] sm:text-[52px]">{section.title}</h1>
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-label-2 sm:text-xl">{section.summary}</p>

      <div className="glass glass-tint mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <HeroAvatar name={hero.name} size={72} />
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wider text-label-2 uppercase">
            Провідник розділу · {hero.universe}
          </div>
          <div className="mt-0.5 text-2xl font-bold tracking-tight">{hero.name}</div>
          <blockquote className="mt-2 flex gap-2 text-[17px] font-medium">
            <Quote className="mt-1 size-4 shrink-0 text-accent" strokeWidth={1.75} />
            <span>{hero.quote}</span>
          </blockquote>
          <p className="mt-2 text-[15px] text-label-2">{hero.why}</p>
        </div>
      </div>
    </header>
  );
}
