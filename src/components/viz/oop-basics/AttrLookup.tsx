"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";
import { SPRING } from "./shared";

type Mode = "attrs" | "list";
type Who = "a" | "b";
type Dict = Record<string, string>;
type State = { cls: Dict; a: Dict; b: Dict };
/** Що підсвітити після операції */
type Probe = { who: Who | "cls"; attr: string; kind: "read" | "write" | "del" | "mutate"; found: Who | "cls" | null } | null;

const INIT: Record<Mode, State> = {
  attrs: { cls: { maker: '"Stark"' }, a: { name: '"Mark I"' }, b: { name: '"Mark II"' } },
  list: { cls: { upgrades: "[]" }, a: { name: '"Mark I"' }, b: { name: '"Mark II"' } },
};

type Op = { code: string; run: (s: State) => { s: State; probe: Probe; out: string } };

function read(s: State, who: Who, attr: string): { probe: Probe; out: string } {
  if (attr in s[who]) return { probe: { who, attr, kind: "read", found: who }, out: s[who][attr] };
  if (attr in s.cls) return { probe: { who, attr, kind: "read", found: "cls" }, out: s.cls[attr] };
  return { probe: { who, attr, kind: "read", found: null }, out: `AttributeError: 'Suit' object has no attribute '${attr}'` };
}

const without = (d: Dict, k: string) => Object.fromEntries(Object.entries(d).filter(([key]) => key !== k));

const OPS: Record<Mode, Op[]> = {
  attrs: [
    { code: "a.maker", run: (s) => ({ s, ...read(s, "a", "maker") }) },
    { code: "b.maker", run: (s) => ({ s, ...read(s, "b", "maker") }) },
    {
      code: 'b.maker = "Hammer"',
      run: (s) => ({ s: { ...s, b: { ...s.b, maker: '"Hammer"' } }, probe: { who: "b", attr: "maker", kind: "write", found: "b" }, out: "# створено тінь у b.__dict__" }),
    },
    {
      code: 'Suit.maker = "Stark Tech"',
      run: (s) => ({ s: { ...s, cls: { ...s.cls, maker: '"Stark Tech"' } }, probe: { who: "cls", attr: "maker", kind: "write", found: "cls" }, out: "# змінено креслення — побачать усі без тіні" }),
    },
    {
      code: "del b.maker",
      run: (s) =>
        "maker" in s.b
          ? { s: { ...s, b: without(s.b, "maker") }, probe: { who: "b", attr: "maker", kind: "del", found: "b" }, out: "# тінь прибрано — знову видно клас" }
          : { s, probe: { who: "b", attr: "maker", kind: "del", found: null }, out: "AttributeError: 'Suit' object has no attribute 'maker'" },
    },
    { code: "a.color", run: (s) => ({ s, ...read(s, "a", "color") }) },
  ],
  list: [
    {
      code: 'a.upgrades.append("ракети")',
      run: (s) => {
        if ("upgrades" in s.a) {
          const v = s.a.upgrades === "[]" ? '["ракети"]' : s.a.upgrades.replace("]", ', "ракети"]');
          return { s: { ...s, a: { ...s.a, upgrades: v } }, probe: { who: "a", attr: "upgrades", kind: "mutate", found: "a" }, out: "# змінено ВЛАСНИЙ список a" };
        }
        const v = s.cls.upgrades === "[]" ? '["ракети"]' : s.cls.upgrades.replace("]", ', "ракети"]');
        return { s: { ...s, cls: { ...s.cls, upgrades: v } }, probe: { who: "a", attr: "upgrades", kind: "mutate", found: "cls" }, out: "# append НЕ присвоює: знайшли список у класі і змінили його!" };
      },
    },
    { code: "b.upgrades", run: (s) => ({ s, ...read(s, "b", "upgrades") }) },
    {
      code: "a.upgrades = []",
      run: (s) => ({ s: { ...s, a: { ...s.a, upgrades: "[]" } }, probe: { who: "a", attr: "upgrades", kind: "write", found: "a" }, out: "# присвоєння → власний список у a (так роблять у __init__)" }),
    },
    { code: "a.upgrades", run: (s) => ({ s, ...read(s, "a", "upgrades") }) },
  ],
};

function Card({
  title, sub, dict, glow, probeAttr, badge, accent,
}: {
  title: string; sub: string; dict: Dict; glow: "hit" | "miss" | "write" | null; probeAttr?: string; badge?: ReactNode; accent: string;
}) {
  const ring =
    glow === "hit" ? "0 0 0 2px #30d158, 0 10px 30px -10px #30d158"
    : glow === "miss" ? "0 0 0 2px color-mix(in oklab, var(--label-2) 60%, transparent)"
    : glow === "write" ? `0 0 0 2px ${accent}, 0 10px 30px -10px ${accent}`
    : "0 0 0 0px transparent";
  return (
    <motion.div
      layout
      animate={{ boxShadow: ring, scale: glow === "hit" || glow === "write" ? 1.02 : 1 }}
      transition={SPRING}
      className="relative min-w-0 rounded-2xl border border-separator bg-elevated/70 p-2.5 font-mono text-[12px]"
    >
      <AnimatePresence>
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ ...SPRING, delay: glow === "hit" && sub === "клас" ? 0.35 : 0 }}
            className="absolute -top-2.5 right-2 rounded-full px-2 py-0.5 font-sans text-[10.5px] font-bold text-white shadow"
            style={{ background: glow === "hit" ? "#30d158" : glow === "write" ? accent : "var(--label-2)" }}
          >
            {badge}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-semibold" style={{ color: accent }}>
          {title}
        </span>
        <span className="shrink-0 font-sans text-[10.5px] text-label-2">{sub}</span>
      </div>
      <div className="mt-1.5 space-y-0.5">
        <AnimatePresence initial={false}>
          {Object.entries(dict).map(([k, v]) => (
            <motion.div
              key={k}
              layout
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12, height: 0 }}
              transition={SPRING}
              className="flex justify-between gap-2 rounded-md px-1"
              style={probeAttr === k && glow && glow !== "miss" ? { background: "color-mix(in oklab, #30d158 22%, transparent)" } : undefined}
            >
              <span>{k}</span>
              <motion.span key={v} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="truncate text-label-2">
                {v}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function AttrLookup() {
  const [mode, setMode] = useState<Mode>("attrs");
  const [st, setSt] = useState<State>(INIT.attrs);
  const [probe, setProbe] = useState<Probe>(null);
  const [log, setLog] = useState<{ code: string; out: string; n: number }[]>([]);

  const reset = (m: Mode) => {
    setMode(m);
    setSt(INIT[m]);
    setProbe(null);
    setLog([]);
  };

  const run = (op: Op) => {
    const r = op.run(st);
    setSt(r.s);
    setProbe(r.probe);
    setLog((l) => [...l.slice(-4), { code: op.code, out: r.out, n: (l.at(-1)?.n ?? 0) + 1 }]);
  };

  const glowFor = (who: Who | "cls"): "hit" | "miss" | "write" | null => {
    if (!probe) return null;
    if (probe.kind === "write" || probe.kind === "del") return probe.who === who ? "write" : null;
    if (probe.found === who) return probe.kind === "mutate" && who === "cls" ? "write" : "hit";
    if (probe.who === who && probe.found !== who) return "miss";
    return null;
  };

  const badgeFor = (who: Who | "cls"): ReactNode => {
    if (!probe) return null;
    const g = glowFor(who);
    if (probe.kind === "write") return g ? "запис" : null;
    if (probe.kind === "del") return g ? (probe.found ? "del" : "нема що видаляти") : null;
    if (g === "miss") return "① немає";
    if (g === "hit" || g === "write") return probe.who === who ? "① знайдено" : probe.kind === "mutate" ? "② змінено!" : "② знайдено";
    return null;
  };

  const goesUp = probe && probe.who !== "cls" && probe.found === "cls";

  return (
    <div>
      <ControlBar>
        <Segmented
          id="oopb-lookup-mode"
          value={mode}
          onChange={reset}
          options={[
            { value: "attrs", label: "Тінь атрибута" },
            { value: "list", label: "Спільний список" },
          ]}
        />
        <Btn onClick={() => reset(mode)}>
          <RotateCcw className="size-4" /> Скинути
        </Btn>
      </ControlBar>

      <div className="px-5">
        <div className="mx-auto max-w-[520px]">
          <Card
            title="class Suit"
            sub="клас"
            dict={st.cls}
            glow={glowFor("cls")}
            probeAttr={probe?.attr}
            badge={badgeFor("cls")}
            accent="var(--accent-2)"
          />
          <div className="relative grid h-11 grid-cols-2">
            {(["a", "b"] as const).map((w) => {
              const active = goesUp && probe?.who === w;
              return (
                <div key={w} className="flex items-stretch justify-center gap-1.5">
                  <div className="relative w-[2px] overflow-hidden rounded-full bg-separator">
                    {active && (
                      <motion.div
                        key={`${log.length}`}
                        initial={{ y: 44 }}
                        animate={{ y: -44 }}
                        transition={{ duration: 0.6, ease: "easeInOut", repeat: 1 }}
                        className="absolute h-full w-full"
                        style={{ background: "linear-gradient(to top, transparent, #30d158, transparent)" }}
                      />
                    )}
                  </div>
                  <span
                    className="flex items-center gap-0.5 font-mono text-[10px] font-semibold transition-colors"
                    style={{ color: active ? "#30d158" : "var(--label-3)" }}
                  >
                    <ArrowUp className="size-3" /> __class__
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card title="a" sub="екземпляр" dict={st.a} glow={glowFor("a")} probeAttr={probe?.attr} badge={badgeFor("a")} accent="var(--accent)" />
            <Card title="b" sub="екземпляр" dict={st.b} glow={glowFor("b")} probeAttr={probe?.attr} badge={badgeFor("b")} accent="var(--accent)" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-5">
        {OPS[mode].map((op) => (
          <button
            key={op.code}
            onClick={() => run(op)}
            className="glass-interactive rounded-xl border border-separator bg-elevated/70 px-2.5 py-1.5 font-mono text-[12px] font-medium"
          >
            {op.code}
          </button>
        ))}
      </div>

      <div className="mx-5 mt-3 mb-4 min-h-[84px] rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
        {log.length === 0 && <div className="text-[#8e8e93]"># клацни операцію вище</div>}
        <AnimatePresence initial={false}>
          {log.map((l) => (
            <motion.div key={l.n} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
              <span className="text-[#8e8e93]">&gt;&gt;&gt; </span>
              {l.code}
              <div className={l.out.startsWith("#") ? "text-[#8e8e93]" : l.out.startsWith("Attr") ? "text-[#ff6961]" : "text-[#a7f3d0]"}>{l.out}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
