import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSection, sections } from "@/content/sections";
import { BlockRenderer, slugify } from "@/components/blocks/BlockRenderer";
import { SectionHero } from "@/components/shell/SectionHero";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getSection(slug);
  return s ? { title: s.title, description: s.summary } : {};
}

export default async function LearnPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();

  const i = sections.indexOf(section);
  const prev = sections[i - 1];
  const next = sections[i + 1];
  const toc = section.blocks.flatMap((b) =>
    b.type === "heading" ? [{ id: b.id ?? slugify(b.text), text: b.text }] : [],
  );

  return (
    <div className="mx-auto flex max-w-[1240px] gap-10 px-4 pt-6 pb-24 sm:px-8 lg:pt-10">
      <main className="min-w-0 flex-1" key={section.slug}>
        <SectionHero section={section} />
        <div className="mt-10">
          <BlockRenderer section={section} />
        </div>

        <nav className="mt-16 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`/learn/${prev.slug}`} className="glass glass-interactive p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-label-2">
                <ArrowLeft className="size-3.5" /> Попередній
              </div>
              <div className="mt-1 text-lg font-bold tracking-tight">
                {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/learn/${next.slug}`} className="glass glass-interactive p-5 text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-label-2">
                Далі <ArrowRight className="size-3.5" />
              </div>
              <div className="mt-1 text-lg font-bold tracking-tight">
                {next.title}
              </div>
            </Link>
          )}
        </nav>
      </main>

      {toc.length > 0 && (
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="glass sticky top-6 p-4">
            <div className="mb-2 text-[11px] font-semibold tracking-wider text-label-3 uppercase">У цьому розділі</div>
            <ul className="space-y-1 text-[13px]">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="block rounded-lg px-2 py-1 text-label-2 transition-colors hover:bg-separator/50 hover:text-label">
                    {t.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
