import {
  Box,
  Boxes,
  Calculator,
  FileText,
  GitBranch,
  KeyRound,
  Layers,
  List,
  Network,
  Package,
  Repeat,
  Rocket,
  ShieldAlert,
  Sparkles,
  SquareFunction,
  Type,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Outline-іконка для кожного розділу (замість емодзі). */
export const sectionIcons: Record<string, LucideIcon> = {
  intro: Rocket,
  variables: Box,
  operators: Calculator,
  strings: Type,
  conditions: GitBranch,
  loops: Repeat,
  "lists-tuples": List,
  "dicts-sets": KeyRound,
  functions: SquareFunction,
  "comprehensions-lambda": Zap,
  errors: ShieldAlert,
  files: FileText,
  modules: Package,
  "oop-basics": Boxes,
  "oop-advanced": Network,
  "iterators-generators": Waves,
  decorators: Layers,
  pythonic: Sparkles,
};

/** Плитка з outline-іконкою розділу. color — акцент (за замовчуванням поточна тема). */
export function SectionIcon({
  slug,
  size = 32,
  color,
  className = "",
}: {
  slug: string;
  size?: number;
  color?: string;
  className?: string;
}) {
  const Icon = sectionIcons[slug] ?? Sparkles;
  return (
    <span
      className={`icon-tile ${className}`}
      style={{ width: size, height: size, ...(color ? { ["--tile" as string]: color } : {}) }}
    >
      <Icon strokeWidth={1.75} style={{ width: size * 0.52, height: size * 0.52 }} />
    </span>
  );
}

/** Аватар героя — ініціали в колі (як у «Повідомленнях» Apple). */
export function HeroAvatar({ name, size = 44, color }: { name: string; size?: number; color?: string }) {
  const initials = name
    .replace(/\(.*?\)/g, "")
    .split(/[\s/]+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <span
      className="icon-tile !rounded-full font-semibold tracking-tight"
      style={{ width: size, height: size, fontSize: size * 0.36, ...(color ? { ["--tile" as string]: color } : {}) }}
    >
      {initials}
    </span>
  );
}
