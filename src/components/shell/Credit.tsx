import { GraduationCap } from "lucide-react";

/** Підпис внизу: для кого адаптовано курс. */
export function Credit({ compact = false }: { compact?: boolean }) {
  if (compact)
    return (
      <span className="icon-tile size-9 !rounded-full" title="Адаптовано для групи c4521">
        <GraduationCap className="size-4" strokeWidth={1.75} />
      </span>
    );
  return (
    <div className="flex items-center gap-2.5 text-[12px] leading-tight text-label-2">
      <span className="icon-tile size-8 !rounded-full">
        <GraduationCap className="size-4" strokeWidth={1.75} />
      </span>
      <span>
        Адаптовано для групи
        <span className="block font-semibold text-label">c4521</span>
      </span>
    </div>
  );
}
