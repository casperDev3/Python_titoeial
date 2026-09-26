import { Fragment, type ReactNode } from "react";

/**
 * Мінімальний рендер inline-розмітки: `code`, **bold**, *italic*, [text](url).
 * Абзаци — через порожній рядок, списки — рядки з "- ".
 */
export function renderInline(text: string, keyBase = "i"): ReactNode[] {
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(re).filter((p) => p !== "");
  return parts.map((p, i) => {
    const k = `${keyBase}-${i}`;
    if (p.startsWith("`")) return <code key={k} className="inline-code">{p.slice(1, -1)}</code>;
    if (p.startsWith("**")) return <strong key={k}>{renderInline(p.slice(2, -2), k)}</strong>;
    if (p.startsWith("*") && p.length > 2) return <em key={k}>{p.slice(1, -1)}</em>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m)
      return (
        <a key={k} href={m[2]} target="_blank" rel="noreferrer">
          {m[1]}
        </a>
      );
    return <Fragment key={k}>{p}</Fragment>;
  });
}

export function Prose({ md, className = "" }: { md: string; className?: string }) {
  const paras = md.trim().split(/\n\s*\n/);
  return (
    <div className={`prose-apple ${className}`}>
      {paras.map((para, i) => {
        const lines = para.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.trim().slice(2), `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(lines.join(" "), String(i))}</p>;
      })}
    </div>
  );
}
