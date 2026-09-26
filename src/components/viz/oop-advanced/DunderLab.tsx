"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Label, SPRING } from "./shared";

type Dunder = "__repr__" | "__str__" | "__eq__" | "__lt__" | "__len__" | "__add__";

const DEFS: Record<Dunder, string[]> = {
  __repr__: ["    def __repr__(self):", '        return f"Spider({self.name!r}, {self.power})"'],
  __str__: ["    def __str__(self):", '        return f"🕷️ {self.name} ({self.power})"'],
  __eq__: ["    def __eq__(self, other):", "        return self.name == other.name and self.power == other.power"],
  __lt__: ["    def __lt__(self, other):", "        return self.power < other.power"],
  __len__: ["    def __len__(self):", "        return len(self.gadgets)"],
  __add__: ["    def __add__(self, other):", '        return Spider(f"{self.name}&{other.name}", self.power + other.power)'],
};
const ORDER: Dunder[] = ["__repr__", "__str__", "__eq__", "__lt__", "__len__", "__add__"];
const DEFAULT = "<__main__.Spider object at 0x10f3a2b40>";
const DEFAULT_C = "<__main__.Spider object at 0x10f3a2c80>";

type Result = { calls: string; out: string; kind: "ok" | "fallback" | "error"; why: string };
type Op = { code: string; run: (on: Set<Dunder>) => Result };

const reprA = (on: Set<Dunder>) => (on.has("__repr__") ? "Spider('Майлз', 90)" : DEFAULT);
const reprC = (on: Set<Dunder>) => (on.has("__repr__") ? "Spider('Гвен', 88)" : DEFAULT_C);

const OPS: Op[] = [
  {
    code: "print(a)",
    run: (on) =>
      on.has("__str__")
        ? { calls: "a.__str__()", out: "🕷️ Майлз (90)", kind: "ok", why: "`print` викликає `str(a)`, а той — твій `__str__`." }
        : on.has("__repr__")
          ? { calls: "a.__str__() → object.__str__ → a.__repr__()", out: reprA(on), kind: "fallback", why: "`__str__` немає — Python бере `__repr__`. Тому `__repr__` корисніший як «перший»." }
          : { calls: "object.__repr__(a)", out: DEFAULT, kind: "fallback", why: "Ані `__str__`, ані `__repr__` — друкується тип і адреса в пам'яті. Павуче чуття без павука." },
  },
  {
    code: "[a, c]",
    run: (on) => ({
      calls: on.has("__repr__") ? "a.__repr__(), c.__repr__()" : "object.__repr__ ×2",
      out: `[${reprA(on)}, ${reprC(on)}]`,
      kind: on.has("__repr__") ? "ok" : "fallback",
      why: on.has("__str__") && !on.has("__repr__")
        ? "Сюрприз: контейнери показують елементи через `__repr__`, а не `__str__`! Твій гарний `__str__` тут не допоможе."
        : "Список, словник, консоль і дебагер показують об'єкти через `__repr__`.",
    }),
  },
  {
    code: "a == b",
    run: (on) =>
      on.has("__eq__")
        ? { calls: "a.__eq__(b)", out: "True", kind: "ok", why: "Твій `__eq__` порівнює вміст: однакові ім'я та сила → рівні." }
        : { calls: "object.__eq__(a, b) → a is b", out: "False", kind: "fallback", why: "Без `__eq__` рівність = ідентичність: `a` і `b` — різні об'єкти, хоч і з однаковими даними." },
  },
  {
    code: "sorted([a, c])",
    run: (on) =>
      on.has("__lt__")
        ? { calls: "c.__lt__(a) …", out: `[${reprC(on)}, ${reprA(on)}]`, kind: "ok", why: "`sorted`, `min`, `max` потребують лише `<`. Гвен (88) < Майлз (90)." }
        : { calls: "c.__lt__(a) → NotImplemented", out: "TypeError: '<' not supported between instances of 'Spider' and 'Spider'", kind: "error", why: "Щоб сортувати — навчи клас порівнюватись через `__lt__` (або передай `key=`)." },
  },
  {
    code: "len(a)",
    run: (on) =>
      on.has("__len__")
        ? { calls: "a.__len__()", out: "3", kind: "ok", why: "`len()` — це просто виклик `__len__`. У Майлза 3 гаджети." }
        : { calls: "a.__len__ → немає", out: "TypeError: object of type 'Spider' has no len()", kind: "error", why: "Без `__len__` об'єкт не має «довжини»." },
  },
  {
    code: "a + c",
    run: (on) =>
      on.has("__add__")
        ? {
            calls: "a.__add__(c)",
            out: on.has("__repr__") ? "Spider('Майлз&Гвен', 178)" : "<__main__.Spider object at 0x10f3a2dc0>",
            kind: "ok",
            why: "Оператор `+` викликає `__add__` лівого операнда і повертає НОВИЙ об'єкт.",
          }
        : { calls: "a.__add__ → немає, c.__radd__ → немає", out: "TypeError: unsupported operand type(s) for +: 'Spider' and 'Spider'", kind: "error", why: "Python пробує `a.__add__(c)`, потім дзеркальний `c.__radd__(a)` — і здається." },
  },
  {
    code: "bool(a)",
    run: (on) =>
      on.has("__len__")
        ? { calls: "a.__bool__ → немає → a.__len__() != 0", out: "True", kind: "fallback", why: "Без `__bool__` Python питає `__len__`: довжина 3 ≠ 0 → правда. Об'єкт з `len == 0` був би хибним!" }
        : { calls: "немає ні __bool__, ні __len__", out: "True", kind: "fallback", why: "За замовчуванням будь-який об'єкт — істинний." },
  },
];

const TONE = { ok: "#15803d", fallback: "#b45309", error: "#dc2626" } as const;

function md(s: string) {
  return s.split(/(`[^`]+`)/g).map((p, i) =>
    p.startsWith("`") ? <code key={i} className="inline-code">{p.slice(1, -1)}</code> : <span key={i}>{p}</span>,
  );
}

export function DunderLab() {
  const [on, setOn] = useState<Set<Dunder>>(new Set(["__repr__"]));
  const [opIdx, setOpIdx] = useState(0);
  const [nonce, setNonce] = useState(0);
  const res = OPS[opIdx].run(on);

  const toggle = (d: Dunder) => {
    setOn((s) => {
      const n = new Set(s);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
    setNonce((x) => x + 1);
  };

  const classLines = [
    "class Spider:",
    "    def __init__(self, name, power):",
    "        self.name, self.power = name, power",
    '        self.gadgets = ["шутери", "камуфляж", "веном"]',
  ];

  return (
    <div className="pb-4">
      <div className="px-5 pt-1">
        <Label>Увімкни dunder-методи</Label>
        <div className="flex flex-wrap gap-1.5">
          {ORDER.map((d) => {
            const active = on.has(d);
            return (
              <motion.button
                key={d}
                whileTap={{ scale: 0.94 }}
                onClick={() => toggle(d)}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[12px] font-semibold transition-colors"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--separator)",
                  background: active ? "color-mix(in oklab, var(--accent) 12%, white)" : "transparent",
                }}
              >
                <span
                  className="relative inline-flex h-[16px] w-[28px] rounded-full transition-colors"
                  style={{ background: active ? "var(--accent)" : "color-mix(in oklab, var(--label-2) 30%, transparent)" }}
                >
                  <motion.span
                    layout
                    transition={SPRING}
                    className="absolute top-[2px] size-[12px] rounded-full bg-white shadow"
                    style={{ left: active ? 14 : 2 }}
                  />
                </span>
                {d}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid gap-3 px-5 md:grid-cols-[1.15fr_1fr]">
        <div className="min-w-0">
          <Label>Клас</Label>
          <div className="thin-scroll overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3 py-2 font-mono text-[11.5px] leading-[1.65]">
            {classLines.map((l, i) => (
              <div key={i} className="whitespace-pre">
                {l}
              </div>
            ))}
            <AnimatePresence initial={false}>
              {ORDER.filter((d) => on.has(d)).map((d) => (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={SPRING}
                  className="overflow-hidden"
                >
                  <div
                    className="my-0.5 rounded-md"
                    style={{ background: res.calls.includes(d) ? "color-mix(in oklab, var(--accent) 12%, white)" : undefined }}
                  >
                    {DEFS[d].map((l, i) => (
                      <div key={i} className="whitespace-pre">
                        {l}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="mt-1 whitespace-pre text-label-2">
              {'a = Spider("Майлз", 90); b = Spider("Майлз", 90)\nc = Spider("Гвен", 88)'}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <Label>Операція</Label>
            <div className="flex flex-wrap gap-1.5">
              {OPS.map((o, i) => (
                <button
                  key={o.code}
                  onClick={() => {
                    setOpIdx(i);
                    setNonce((x) => x + 1);
                  }}
                  className="relative rounded-xl border border-separator px-2.5 py-1 font-mono text-[12px] font-semibold"
                >
                  {opIdx === i && (
                    <motion.span
                      layoutId="oopa-dunder-op"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "color-mix(in oklab, var(--accent-2) 16%, white)", boxShadow: "inset 0 0 0 1.5px var(--accent-2)" }}
                      transition={SPRING}
                    />
                  )}
                  <span className="relative">{o.code}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${opIdx}-${nonce}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border p-3"
              style={{ borderColor: `color-mix(in oklab, ${TONE[res.kind]} 45%, transparent)`, background: `color-mix(in oklab, ${TONE[res.kind]} 6%, white)` }}
            >
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[12px]">
                <span className="rounded-md bg-separator/60 px-1.5 py-0.5 font-semibold">{OPS[opIdx].code}</span>
                <ArrowRight className="size-3.5 text-label-3" strokeWidth={1.75} />
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.12 }}
                  className="rounded-md px-1.5 py-0.5"
                  style={{ background: "color-mix(in oklab, var(--accent) 12%, white)" }}
                >
                  {res.calls}
                </motion.span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 rounded-xl border border-separator bg-[var(--code-bg)] px-3 py-2 font-mono text-[12px] break-words"
                style={{ color: res.kind === "error" ? "#c42b1c" : "#1c1c1e" }}
              >
                {res.out}
              </motion.div>
              <p className="mt-2 text-[13px] leading-snug">{md(res.why)}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
