import type { Block, Section } from "@/content/types";
import { Reveal } from "../ui/Reveal";
import { CodeBlock } from "./CodeBlock";
import { Joke, Tip, Warning } from "./Callouts";
import { Prose } from "./Inline";
import { Quiz } from "./Quiz";
import { Table } from "./Table";
import { Flowchart } from "./Flowchart";
import { VizFrame } from "../viz/VizFrame";

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

function BlockView({ block, section }: { block: Block; section: Section }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 id={block.id ?? slugify(block.text)} className="pt-6 text-[28px] font-bold tracking-tight sm:text-[32px]">
          {block.text}
        </h2>
      );
    case "text":
      return <Prose md={block.md} />;
    case "code":
      return <CodeBlock {...block} />;
    case "tip":
      return <Tip {...block} />;
    case "warning":
      return <Warning {...block} />;
    case "joke":
      return <Joke md={block.md} hero={block.hero ?? section.hero.name} />;
    case "viz":
      return <VizFrame section={section.slug} {...block} />;
    case "quiz":
      return <Quiz {...block} />;
    case "table":
      return <Table {...block} />;
    case "flow":
      return <Flowchart {...block} />;
    case "compare":
      return (
        <div className="space-y-3">
          {block.title && <div className="font-semibold">{block.title}</div>}
          <div className="grid gap-3 xl:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#ff453a]">✗ {block.bad.label ?? "Не так"}</div>
              <CodeBlock code={block.bad.code} tone="bad" runnable={false} title="bad.py" />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#30d158]">✓ {block.good.label ?? "А ось так"}</div>
              <CodeBlock code={block.good.code} tone="good" runnable={false} title="good.py" />
            </div>
          </div>
          {block.note && <Prose md={block.note} className="!text-[15px] text-label-2" />}
        </div>
      );
  }
}

export function BlockRenderer({ section }: { section: Section }) {
  return (
    <div className="space-y-6">
      {section.blocks.map((b, i) => (
        <Reveal key={i}>
          <BlockView block={b} section={section} />
        </Reveal>
      ))}
    </div>
  );
}
