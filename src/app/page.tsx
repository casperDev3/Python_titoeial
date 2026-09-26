import Link from "next/link";
import { ArrowRight, Box, Laugh, Play, Zap } from "lucide-react";
import { sections } from "@/content/sections";
import { HeroScene } from "@/components/home/HeroScene";

const features = [
  { icon: Box, title: "3D-візуалізації", text: "Змінні, списки, словники і класи — у просторі, який можна крутити." },
  { icon: Play, title: "Живий Python", text: "Кожен приклад запускається прямо в браузері — без встановлення." },
  { icon: Zap, title: "Лайфхаки", text: "Трюки, які зазвичай дізнаються лише через роки практики." },
  { icon: Laugh, title: "Герої та жарти", text: "Кожну тему веде свій герой аніме чи супергерой." },
];

export default function Home() {
  const first = sections[0];
  return (
    <div className="mx-auto max-w-[1180px] px-4 pt-8 pb-24 sm:px-8 lg:pt-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="pill pill-glass !py-1 text-[13px]">🐍 {sections.length} розділів · від нуля до pythonic</span>
          <h1 className="mt-5 text-[46px] leading-[1.02] font-extrabold tracking-[-0.035em] sm:text-[68px]">
            Вивчи Python
            <br />
            <span className="text-gradient">як справжній герой</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-label-2 sm:text-xl">
            Інтерактивний курс основ Python: 3D-схеми, анімовані пояснення, код, що запускається в браузері, і
            провідники — Наруто, Гоку, Залізна Людина, Бетмен та інші.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/learn/${first.slug}`} className="pill pill-accent !px-6 !py-3 !text-base">
              Почати з «{first.title}» <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="glass overflow-hidden !rounded-[32px]">
          <HeroScene />
        </div>
      </section>

      <section className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="glass p-5">
            <f.icon className="size-6" style={{ color: "var(--accent)" }} />
            <div className="mt-3 font-bold tracking-tight">{f.title}</div>
            <p className="mt-1 text-[14.5px] text-label-2">{f.text}</p>
          </div>
        ))}
      </section>

      <h2 className="mt-20 text-[32px] font-bold tracking-tight">Шлях героя</h2>
      <p className="mt-2 text-label-2">Кожен розділ має свій колір, героя та настрій.</p>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/learn/${s.slug}`}
            className="glass glass-interactive group overflow-hidden p-5"
            style={{ borderColor: `color-mix(in oklab, ${s.theme.accent} 28%, var(--glass-border))` }}
          >
            <div
              className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
              style={{ background: s.theme.glow }}
            />
            <div className="flex items-center gap-3">
              <span
                className="grid size-12 place-items-center rounded-[15px] text-2xl"
                style={{ background: `linear-gradient(135deg, ${s.theme.accent}, ${s.theme.accent2})` }}
              >
                {s.icon}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-label-3">Розділ {s.order}</div>
                <div className="truncate text-lg font-bold tracking-tight">{s.title}</div>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-[14.5px] text-label-2">{s.summary}</p>
            <div className="mt-4 flex items-center gap-2 text-[13px] font-medium">
              <span className="text-lg">{s.hero.emoji}</span>
              <span className="truncate">{s.hero.name}</span>
              <span className="ml-auto text-label-3">{s.minutes} хв</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
