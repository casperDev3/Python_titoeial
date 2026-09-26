"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Btn, ControlBar, Segmented } from "../kit";

type T = "int" | "str" | "tuple" | "list";

type Obj = { key: number; items: string[]; addr: string };

const CFG: Record<
  T,
  { start: string[]; add: (n: number) => string; op: (n: number) => string; render: (items: string[]) => string; mutable: boolean }
> = {
  int: {
    start: ["9000"],
    add: (n) => String(9000 + n),
    op: () => "a += 1",
    render: (it) => it[0],
    mutable: false,
  },
  str: {
    start: ["Goku"],
    add: () => "!",
    op: () => 'a += "!"',
    render: (it) => `'${it.join("")}'`,
    mutable: false,
  },
  tuple: {
    start: ["1", "2"],
    add: (n) => String(2 + n),
    op: (n) => `a += (${2 + n},)`,
    render: (it) => `(${it.join(", ")})`,
    mutable: false,
  },
  list: {
    start: ["1", "2"],
    add: (n) => String(2 + n),
    op: (n) => `a += [${2 + n}]`,
    render: (it) => `[${it.join(", ")}]`,
    mutable: true,
  },
};

const BASE: Record<T, number> = { int: 0x7f10a0, str: 0x7f22c0, tuple: 0x7f3a40, list: 0x7f5c80 };
const hex = (n: number) => `0x${n.toString(16)}`;

type State = { objs: Obj[]; a: number; b: number; n: number; log: { text: string; tone?: "ok" | "bad" }[] };

function init(t: T): State {
  return {
    objs: [{ key: 0, items: CFG[t].start, addr: hex(BASE[t]) }],
    a: 0,
    b: 0,
    n: 0,
    log: [
      { text: `a = ${CFG[t].render(CFG[t].start)}` },
      { text: "b = a" },
    ],
  };
}

const spring = { type: "spring" as const, stiffness: 380, damping: 30 };

export function MutableLab() {
  const [t, setT] = useState<T>("int");
  const [st, setSt] = useState<State>(() => init("int"));
  const cfg = CFG[t];

  const apply = () => {
    setSt((s) => {
      const n = s.n + 1;
      const cur = s.objs.find((o) => o.key === s.a)!;
      const add = cfg.add(n);
      const opText = cfg.op(n);
      if (cfg.mutable) {
        const objs = s.objs.map((o) => (o.key === s.a ? { ...o, items: [...o.items, add] } : o));
        return {
          ...s,
          objs,
          n,
          log: [
            ...s.log,
            { text: opText },
            { text: `id(a): ${cur.addr} → ${cur.addr}  (той самий)`, tone: "ok" as const },
            { text: `a is b → ${s.a === s.b ? "True" : "False"}`, tone: "ok" as const },
          ].slice(-6),
        };
      }
      const items = t === "int" ? [add] : [...cur.items, add];
      const key = Math.max(...s.objs.map((o) => o.key)) + 1;
      const obj: Obj = { key, items, addr: hex(BASE[t] + key * 0x48) };
      // лишаємо лише «живі» об'єкти + старий, щоб показати, як він звільняється
      const objs = [...s.objs.filter((o) => o.key === s.b || o.key === s.a), obj];
      return {
        ...s,
        objs,
        a: key,
        n,
        log: [
          ...s.log,
          { text: opText },
          { text: `id(a): ${cur.addr} → ${obj.addr}  (НОВИЙ об'єкт)`, tone: "bad" as const },
          { text: `a is b → False`, tone: "bad" as const },
        ].slice(-6),
      };
    });
  };

  const switchType = (nt: T) => {
    setT(nt);
    setSt(init(nt));
  };

  const a = st.objs.find((o) => o.key === st.a)!;
  const b = st.objs.find((o) => o.key === st.b)!;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="vars-mutable"
          value={t}
          onChange={switchType}
          options={[
            { value: "int", label: "int" },
            { value: "str", label: "str" },
            { value: "tuple", label: "tuple" },
            { value: "list", label: "list" },
          ]}
        />
        <Btn variant="accent" onClick={apply} disabled={st.n >= 4}>
          <span className="font-mono">{cfg.op(st.n + 1)}</span>
        </Btn>
        <Btn onClick={() => setSt(init(t))}>↺</Btn>
        <span
          className="ml-auto rounded-full px-2.5 py-1 text-[11.5px] font-bold"
          style={{
            background: cfg.mutable ? "color-mix(in oklab, var(--accent-2) 22%, transparent)" : "color-mix(in oklab, var(--accent) 22%, transparent)",
            color: cfg.mutable ? "var(--accent-2)" : "var(--accent)",
          }}
        >
          {cfg.mutable ? "MUTABLE" : "IMMUTABLE"}
        </span>
      </ControlBar>

      <div className="px-5">
        <LayoutGroup id={`mut-${t}`}>
          <div className="flex min-h-[150px] flex-wrap items-start gap-3 rounded-2xl border border-separator p-3" style={{ background: "var(--glass-bg)" }}>
            <AnimatePresence mode="popLayout">
              {st.objs.map((o) => {
                const hasA = o.key === st.a;
                const hasB = o.key === st.b;
                const dead = !hasA && !hasB;
                return (
                  <motion.div
                    layout
                    key={`${t}-${o.key}`}
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: dead ? 0.4 : 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, filter: "blur(6px)" }}
                    transition={spring}
                    className="relative min-w-[132px] flex-1 rounded-[18px] border px-3.5 pt-8 pb-3 sm:flex-none"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: dead ? "var(--separator)" : cfg.mutable ? "var(--accent-2)" : "var(--accent)",
                      borderStyle: dead ? "dashed" : "solid",
                    }}
                  >
                    {/* Ярлики */}
                    <div className="absolute -top-3 left-3 flex gap-1.5">
                      {hasA && (
                        <motion.span layoutId={`tag-a-${t}`} transition={spring} className="rounded-full px-2.5 py-0.5 font-mono text-[12px] font-bold text-white shadow-md" style={{ background: "var(--accent)" }}>
                          a
                        </motion.span>
                      )}
                      {hasB && (
                        <motion.span layoutId={`tag-b-${t}`} transition={spring} className="rounded-full px-2.5 py-0.5 font-mono text-[12px] font-bold text-white shadow-md" style={{ background: "var(--accent-2)" }}>
                          b
                        </motion.span>
                      )}
                    </div>
                    <div className="absolute top-2 right-3 font-mono text-[10px] text-label-3">{o.addr}</div>
                    <motion.div layout="position" className="font-mono text-[15px] font-semibold break-all">
                      {cfg.render(o.items)}
                    </motion.div>
                    <div className="mt-1 text-[11px] text-label-2">{dead ? "refcount 0 → буде звільнено" : `${t}`}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>

      <div className="mt-3 grid gap-3 px-5 pb-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-separator px-4 py-3 text-[13.5px]" style={{ background: "var(--glass-bg)" }}>
          <div className="mb-1 font-mono">
            <span style={{ color: "var(--accent)" }}>a</span> = {cfg.render(a.items)}
          </div>
          <div className="mb-2 font-mono">
            <span style={{ color: "var(--accent-2)" }}>b</span> = {cfg.render(b.items)}
          </div>
          <div className="text-label-2">
            {cfg.mutable
              ? "Список змінюється на місці: обидва ярлики на одному об'єкті, тому b бачить усі зміни."
              : "Об'єкт не можна змінити — += будує новий, і лише a переїжджає. b спокійно дивиться на старе значення."}
          </div>
        </div>
        <div className="min-h-[110px] rounded-2xl bg-black/80 px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
          <AnimatePresence initial={false}>
            {st.log.map((l, i) => (
              <motion.div
                key={`${t}-${st.n}-${i}-${l.text}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="break-words"
                style={{ color: l.tone === "bad" ? "#ffb340" : l.tone === "ok" ? "#30d158" : undefined }}
              >
                {l.tone ? "  " : ">>> "}
                {l.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
