"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Sparkles, TriangleAlert } from "lucide-react";
import { Label, SPRING } from "./shared";

type FieldDef = { name: string; type: string; def?: string; factory?: boolean };
const FIELDS: FieldDef[] = [
  { name: "name", type: "str" },
  { name: "earth", type: "int" },
  { name: "power", type: "int", def: "50" },
  { name: "gadgets", type: "list[str]", factory: true },
];

type Opts = { eq: boolean; order: boolean; frozen: boolean; trap: boolean };
type Method = { id: string; lines: string[]; note?: string };

function generate(fields: FieldDef[], o: Opts): { methods: Method[]; error?: string; warn?: string } {
  if (o.trap && fields.some((f) => f.factory))
    return { methods: [], error: "ValueError: mutable default <class 'list'> for field gadgets is not allowed: use default_factory" };
  if (o.order && !o.eq) return { methods: [], error: "ValueError: eq must be true if order is true" };

  const names = fields.map((f) => f.name);
  const tuple = (who: string) => (names.length === 1 ? `(${who}.${names[0]},)` : `(${names.map((n) => `${who}.${n}`).join(", ")})`);
  const params = fields.map((f) => `${f.name}: ${f.type}${f.def ? ` = ${f.def}` : f.factory ? " = <factory>" : ""}`).join(", ");
  const set = (n: string, v: string) => (o.frozen ? `object.__setattr__(self, '${n}', ${v})` : `self.${n} = ${v}`);

  const methods: Method[] = [
    {
      id: "__init__",
      lines: [
        `def __init__(self, ${params}):`,
        ...fields.map((f) => `    ${set(f.name, f.factory ? `list() if ${f.name} is <factory> else ${f.name}` : f.name)}`),
      ],
      note: o.frozen ? "frozen: пише в обхід власного заблокованого __setattr__" : undefined,
    },
    {
      id: "__repr__",
      lines: ["def __repr__(self):", `    return f"Spider(${names.map((n) => `${n}={self.${n}!r}`).join(", ")})"`],
    },
  ];
  if (o.eq)
    methods.push({
      id: "__eq__",
      lines: [
        "def __eq__(self, other):",
        "    if other.__class__ is self.__class__:",
        `        return ${tuple("self")} == ${tuple("other")}`,
        "    return NotImplemented",
      ],
    });
  if (o.order)
    methods.push({
      id: "__lt__ …",
      lines: [
        "def __lt__(self, other):",
        "    if other.__class__ is self.__class__:",
        `        return ${tuple("self")} < ${tuple("other")}`,
        "    return NotImplemented",
        "# + __le__, __gt__, __ge__ — так само",
      ],
    });
  if (o.eq && o.frozen)
    methods.push({ id: "__hash__", lines: ["def __hash__(self):", `    return hash(${tuple("self")})`], note: "eq + frozen → об'єкт можна класти в set і робити ключем dict" });
  else if (o.eq) methods.push({ id: "__hash__", lines: ["__hash__ = None"], note: "eq без frozen → нехешований: в set не покладеш" });
  if (o.frozen)
    methods.push({
      id: "__setattr__",
      lines: ["def __setattr__(self, name, value):", "    raise FrozenInstanceError(f\"cannot assign to field {name!r}\")", "# + __delattr__ — так само"],
    });

  const warn = o.frozen && o.eq && fields.some((f) => f.factory) ? "hash(spider) впаде з TypeError: unhashable type: 'list' — список усередині «замороженого» об'єкта не хешується." : undefined;
  return { methods, warn };
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[12px] font-semibold"
      style={{
        borderColor: on ? "var(--accent)" : "var(--separator)",
        background: on ? "color-mix(in oklab, var(--accent) 10%, white)" : "transparent",
      }}
    >
      <span
        className="relative inline-flex h-[16px] w-[28px] rounded-full transition-colors"
        style={{ background: on ? "var(--accent)" : "color-mix(in oklab, var(--label-2) 30%, transparent)" }}
      >
        <motion.span layout transition={SPRING} className="absolute top-[2px] size-[12px] rounded-full bg-white shadow" style={{ left: on ? 14 : 2 }} />
      </span>
      {label}
    </motion.button>
  );
}

export function DataclassGen() {
  const [opts, setOpts] = useState<Opts>({ eq: true, order: false, frozen: false, trap: false });
  const [enabled, setEnabled] = useState<Set<string>>(new Set(FIELDS.map((f) => f.name)));
  const fields = FIELDS.filter((f) => enabled.has(f.name));
  const gen = generate(fields, opts);

  const flip = (k: keyof Opts) => setOpts((o) => ({ ...o, [k]: !o[k] }));
  const toggleField = (n: string) =>
    setEnabled((s) => {
      const next = new Set(s);
      if (next.has(n)) {
        if (next.size > 1) next.delete(n);
      } else next.add(n);
      return next;
    });

  const args = [!opts.eq && "eq=False", opts.order && "order=True", opts.frozen && "frozen=True"].filter(Boolean).join(", ");
  const userLines = [
    `@dataclass${args ? `(${args})` : ""}`,
    "class Spider:",
    ...fields.map((f) =>
      f.factory
        ? opts.trap
          ? `    ${f.name}: list = []`
          : `    ${f.name}: ${f.type} = field(default_factory=list)`
        : `    ${f.name}: ${f.type}${f.def ? ` = ${f.def}` : ""}`,
    ),
  ];
  const genCount = gen.methods.reduce((n, m) => n + m.lines.filter((l) => !l.startsWith("#")).length, 0) + (opts.order ? 12 : 0) + (opts.frozen ? 2 : 0);

  return (
    <div className="pb-4">
      <div className="flex flex-wrap gap-1.5 px-5 pt-1">
        <Toggle on={opts.eq} label="eq" onClick={() => flip("eq")} />
        <Toggle on={opts.order} label="order" onClick={() => flip("order")} />
        <Toggle on={opts.frozen} label="frozen" onClick={() => flip("frozen")} />
        <Toggle on={opts.trap} label="gadgets = [] (пастка)" onClick={() => flip("trap")} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-5">
        <span className="text-[12px] text-label-2">Поля:</span>
        {FIELDS.map((f) => (
          <button
            key={f.name}
            onClick={() => toggleField(f.name)}
            className="rounded-lg border px-2 py-0.5 font-mono text-[12px] transition-colors"
            style={{
              borderColor: enabled.has(f.name) ? "var(--accent-2)" : "var(--separator)",
              background: enabled.has(f.name) ? "color-mix(in oklab, var(--accent-2) 14%, white)" : "transparent",
              textDecoration: enabled.has(f.name) ? undefined : "line-through",
              opacity: enabled.has(f.name) ? 1 : 0.6,
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 px-5 md:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <Label>Ти пишеш · {userLines.length} рядків</Label>
          <div className="thin-scroll overflow-x-auto rounded-2xl border border-separator bg-[var(--code-bg)] px-3 py-2 font-mono text-[12px] leading-[1.7]">
            <AnimatePresence initial={false}>
              {userLines.map((l) => (
                <motion.div
                  key={l}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={SPRING}
                  className="whitespace-pre"
                  style={l.includes("= []") ? { color: "#c42b1c" } : l.startsWith("@") ? { color: "var(--accent)" } : undefined}
                >
                  {l}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-separator p-3 text-[13px]">
            <Sparkles className="size-4 shrink-0" style={{ color: "var(--accent)" }} strokeWidth={1.75} />
            <span>
              {gen.error ? (
                "Декоратор відмовився генерувати клас."
              ) : (
                <>
                  <b className="tabular-nums">{userLines.length}</b> твоїх рядків → <b className="tabular-nums">≈{genCount}</b> згенерованих
                </>
              )}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <Label>@dataclass генерує</Label>
          <AnimatePresence mode="popLayout">
            {gen.error ? (
              <motion.div
                key="err"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, x: [0, -8, 6, -3, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-[#dc2626]/40 bg-[#fef2f2] p-3 font-mono text-[12px] text-[#b42318]"
              >
                <TriangleAlert className="mb-1 size-4" strokeWidth={1.75} />
                {gen.error}
              </motion.div>
            ) : (
              <motion.div key="ok" className="space-y-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {gen.methods.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={SPRING}
                      className="overflow-hidden rounded-2xl border"
                      style={{
                        borderColor: "color-mix(in oklab, var(--accent-2) 35%, transparent)",
                        background: "color-mix(in oklab, var(--accent-2) 7%, white)",
                      }}
                    >
                      <div className="thin-scroll overflow-x-auto px-3 py-2 font-mono text-[11.5px] leading-[1.6]">
                        {m.lines.map((l, i) => (
                          <motion.div
                            key={l}
                            layout="position"
                            className={`whitespace-pre ${l.startsWith("#") ? "text-label-3" : ""}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            {l}
                          </motion.div>
                        ))}
                      </div>
                      {m.note && <div className="border-t border-separator px-3 py-1.5 text-[11.5px] text-label-2">{m.note}</div>}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {gen.warn && (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 rounded-2xl border border-[#d97706]/40 bg-[#fffbeb] p-2.5 text-[12px]"
                  >
                    <TriangleAlert className="size-4 shrink-0 text-[#b45309]" strokeWidth={1.75} />
                    {gen.warn}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
