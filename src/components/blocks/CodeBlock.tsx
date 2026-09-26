import { highlightPython } from "./highlight";
import { CodeToolbar } from "./CodeRunner";

type Props = {
  code: string;
  title?: string;
  output?: string;
  runnable?: boolean;
  highlight?: number[];
  tone?: "default" | "bad" | "good";
};

export async function CodeBlock({ code, title, output, runnable = true, highlight, tone = "default" }: Props) {
  const html = await highlightPython(code.replace(/\n+$/, ""), highlight);
  const ring =
    tone === "bad" ? "ring-1 ring-[#ff453a]/40" : tone === "good" ? "ring-1 ring-[#30d158]/45" : "";
  return (
    <figure className={`glass overflow-hidden !rounded-[18px] ${ring}`} style={{ background: "var(--code-bg)" }}>
      <div className="flex items-center gap-2 border-b border-separator px-4 py-2.5 pr-40">
        <span className="flex gap-1.5">
          <i className="size-3 rounded-full bg-[#ff5f57]" />
          <i className="size-3 rounded-full bg-[#febc2e]" />
          <i className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <figcaption className="ml-2 truncate font-mono text-xs text-label-2">{title ?? "main.py"}</figcaption>
      </div>
      <div>
        <div className="code-body" dangerouslySetInnerHTML={{ __html: html }} />
        {output && (
          <div className="border-t border-dashed border-separator px-4 py-2.5">
            <div className="text-[11px] font-semibold tracking-wider text-label-3 uppercase">Вивід</div>
            <pre className="thin-scroll overflow-x-auto font-mono text-[13px] leading-relaxed text-label-2">{output}</pre>
          </div>
        )}
      </div>
      <CodeToolbar code={code} runnable={runnable} />
    </figure>
  );
}
