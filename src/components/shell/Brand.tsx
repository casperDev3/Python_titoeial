import Link from "next/link";
import { SquareTerminal } from "lucide-react";

export function Brand({ onClick, compact = false }: { onClick?: () => void; compact?: boolean }) {
  return (
    <Link href="/" onClick={onClick} className="flex min-w-0 items-center gap-3" title="Python-hero / ITstep">
      <span className="icon-tile size-10 !rounded-[12px]">
        <SquareTerminal className="size-5" strokeWidth={1.75} />
      </span>
      {!compact && (
        <span className="min-w-0 truncate text-[16px] font-bold tracking-tight">
          Python-hero <span className="font-semibold text-label-3">/</span> <span className="text-accent">ITstep</span>
        </span>
      )}
    </Link>
  );
}
