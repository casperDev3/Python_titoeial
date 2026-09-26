import Link from "next/link";
import { SquareTerminal } from "lucide-react";

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-3">
      <span className="icon-tile size-10 !rounded-[12px]">
        <SquareTerminal className="size-5" strokeWidth={1.75} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight">Python Hero Academy</span>
        <span className="block text-[11.5px] text-label-2">основи Python з героями</span>
      </span>
    </Link>
  );
}
