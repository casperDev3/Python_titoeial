import Link from "next/link";

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-3">
      <span
        className="grid size-10 place-items-center rounded-[13px] text-xl shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          boxShadow: "0 8px 22px -8px var(--accent)",
        }}
      >
        🐍
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight">Python Hero Academy</span>
        <span className="block text-[11.5px] text-label-2">основи Python з героями</span>
      </span>
    </Link>
  );
}
