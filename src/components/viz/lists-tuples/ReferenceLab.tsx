"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Btn, Console, ControlBar, Segmented } from "../kit";

type Mode = "alias" | "copy" | "deep";
type ObjId = "L1" | "L2" | "I1" | "I2";
type Item = { kind: "str"; v: string } | { kind: "ref"; to: ObjId };
type Heap = Partial<Record<ObjId, Item[]>>;
type World = { heap: Heap; a: ObjId; b: ObjId };

const FAKE_ID: Record<ObjId, string> = { L1: "0x7a10", L2: "0x7c48", I1: "0x91f4", I2: "0x93b0" };

const OUTER_X = 76;
const INNER_X = 262;
const OCELL = 54;
const ICELL = 50;
const H = 34;

const LAYOUT: Record<Mode, { vars: { a: number; b: number }; pos: Partial<Record<ObjId, number>> }> = {
  alias: { vars: { a: 40, b: 104 }, pos: { L1: 72, I1: 160 } },
  copy: { vars: { a: 30, b: 172 }, pos: { L1: 30, L2: 172, I1: 101 } },
  deep: { vars: { a: 30, b: 172 }, pos: { L1: 30, L2: 172, I1: 30, I2: 172 } },
};

const CODE: Record<Mode, string> = {
  alias: "b = a",
  copy: "b = a.copy()",
  deep: "b = copy.deepcopy(a)",
};

function init(mode: Mode): World {
  const heap: Heap = {
    L1: [{ kind: "str", v: "Luffy" }, { kind: "ref", to: "I1" }],
    I1: [{ kind: "str", v: "Zoro" }, { kind: "str", v: "Sanji" }],
  };
  if (mode === "alias") return { heap, a: "L1", b: "L1" };
  heap.L2 = [{ kind: "str", v: "Luffy" }, { kind: "ref", to: mode === "deep" ? "I2" : "I1" }];
  if (mode === "deep") heap.I2 = [{ kind: "str", v: "Zoro" }, { kind: "str", v: "Sanji" }];
  return { heap, a: "L1", b: "L2" };
}

function repr(heap: Heap, id: ObjId): string {
  return (
    "[" +
    (heap[id] ?? []).map((it) => (it.kind === "str" ? `'${it.v}'` : repr(heap, it.to))).join(", ") +
    "]"
  );
}

type Action = "append" | "nested" | "assign";

export function ReferenceLab() {
  const [mode, setMode] = useState<Mode>("alias");
  const [world, setWorld] = useState<World>(() => init("alias"));
  const [history, setHistory] = useState<string[]>([]);
  const [flash, setFlash] = useState<{ ids: ObjId[]; tick: number }>({ ids: [], tick: 0 });

  const changeMode = (m: Mode) => {
    setMode(m);
    setWorld(init(m));
    setHistory([]);
    setFlash({ ids: [], tick: 0 });
  };

  const outerB = world.heap[world.b] ?? [];
  const ref1 = outerB[1];
  const innerB = ref1 && ref1.kind === "ref" ? ref1.to : null;

  const act = (a: Action) => {
    const heap: Heap = Object.fromEntries(
      Object.entries(world.heap).map(([k, v]) => [k, v!.map((x) => ({ ...x }))]),
    ) as Heap;
    let target: ObjId | null = null;
    let line = "";
    if (a === "append") {
      target = world.b;
      heap[target]!.push({ kind: "str", v: "Nami" });
      line = 'b.append("Nami")';
    } else if (a === "nested" && innerB) {
      target = innerB;
      heap[target]!.push({ kind: "str", v: "Jinbe" });
      line = 'b[1].append("Jinbe")';
    } else if (a === "assign") {
      target = world.b;
      heap[target]![0] = { kind: "str", v: "Ace" };
      line = 'b[0] = "Ace"';
    }
    if (!target) return;
    setWorld({ ...world, heap });
    setHistory((h) => [...h, line]);
    setFlash((f) => ({ ids: [target!], tick: f.tick + 1 }));
  };

  const used = (l: string) => history.includes(l);
  const L = LAYOUT[mode];
  const objs = (Object.keys(world.heap) as ObjId[]).filter((k) => L.pos[k] !== undefined);
  const aIsB = world.a === world.b;
  const aInner = (world.heap[world.a] ?? [])[1];
  const bInner = outerB[1];
  const innerShared =
    aInner?.kind === "ref" && bInner?.kind === "ref" ? aInner.to === bInner.to : false;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="ref-mode"
          value={mode}
          onChange={changeMode}
          options={[
            { value: "alias", label: "b = a" },
            { value: "copy", label: "a.copy()" },
            { value: "deep", label: "deepcopy" },
          ]}
        />
      </ControlBar>

      <div className="px-2 sm:px-4">
        <svg viewBox="0 0 420 236" className="h-auto w-full select-none" role="img" aria-label="Діаграма посилань">
          <defs>
            <marker id="rl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--accent)" }} />
            </marker>
            <marker id="rl-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--label-2)" }} />
            </marker>
          </defs>

          {/* стрілки змінна → об'єкт */}
          {(["a", "b"] as const).map((v) => {
            const vy = L.vars[v] + 13;
            const oy = (L.pos[world[v]] ?? 0) + H / 2;
            return (
              <motion.path
                key={v}
                initial={false}
                animate={{ d: `M46,${vy} C62,${vy} 60,${oy} ${OUTER_X - 3},${oy}` }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                fill="none"
                strokeWidth={2.2}
                style={{ stroke: "var(--accent)" }}
                markerEnd="url(#rl-arrow)"
              />
            );
          })}

          {/* стрілки елемент → вкладений список */}
          {objs
            .filter((id) => id === "L1" || id === "L2")
            .map((id) => {
              const items = world.heap[id] ?? [];
              return items.map((it, i) =>
                it.kind === "ref" ? (
                  <motion.path
                    key={`${id}-${i}-${it.to}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: 1,
                      d: refPath(OUTER_X + OCELL * i + OCELL / 2, L.pos[id] ?? 0, (L.pos[it.to] ?? 0) + H / 2),
                    }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                    fill="none"
                    strokeWidth={1.8}
                    style={{ stroke: "var(--label-2)" }}
                    markerEnd="url(#rl-arrow2)"
                  />
                ) : null,
              );
            })}

          {/* змінні */}
          {(["a", "b"] as const).map((v) => (
            <motion.g key={v} initial={false} animate={{ y: L.vars[v] }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
              <rect x={8} y={0} width={38} height={26} rx={13} style={{ fill: "var(--accent)" }} />
              <text x={27} y={17.5} textAnchor="middle" className="font-mono" fontSize={14} fontWeight={700} fill="white">
                {v}
              </text>
            </motion.g>
          ))}

          {/* об'єкти */}
          <AnimatePresence>
            {objs.map((id) => {
              const outer = id === "L1" || id === "L2";
              const x = outer ? OUTER_X : INNER_X;
              const cw = outer ? OCELL : ICELL;
              const items = world.heap[id] ?? [];
              const w = cw * items.length;
              const y = L.pos[id] ?? 0;
              const isFlash = flash.ids.includes(id);
              return (
                <motion.g
                  key={id}
                  initial={{ opacity: 0, x, y: y + 12 }}
                  animate={{ opacity: 1, x, y }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 240, damping: 26 }}
                >
                  <text x={2} y={-5} fontSize={9.5} className="font-mono" style={{ fill: "var(--label-2)" }}>
                    list · id {FAKE_ID[id]}
                  </text>
                  <motion.rect
                    x={0}
                    y={0}
                    height={H}
                    rx={10}
                    initial={false}
                    animate={{ width: w }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    strokeWidth={1.4}
                    style={{
                      fill: outer
                        ? "color-mix(in oklab, var(--accent) 12%, var(--bg-elevated))"
                        : "color-mix(in oklab, var(--accent-2) 16%, var(--bg-elevated))",
                      stroke: outer ? "color-mix(in oklab, var(--accent) 50%, transparent)" : "color-mix(in oklab, var(--accent-2) 70%, transparent)",
                    }}
                  />
                  {isFlash && (
                    <motion.rect
                      key={flash.tick}
                      x={-3}
                      y={-3}
                      width={w + 6}
                      height={H + 6}
                      rx={13}
                      fill="none"
                      strokeWidth={3}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.2 }}
                      style={{ stroke: "var(--accent)" }}
                    />
                  )}
                  {items.map((it, i) => (
                    <g key={i}>
                      {i > 0 && (
                        <line x1={cw * i} x2={cw * i} y1={6} y2={H - 6} strokeWidth={1} style={{ stroke: "var(--separator)" }} />
                      )}
                      {it.kind === "str" ? (
                        <motion.text
                          key={it.v}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          x={cw * i + cw / 2}
                          y={H / 2 + 4.5}
                          textAnchor="middle"
                          fontSize={outer ? 12 : 11.5}
                          fontWeight={600}
                          style={{ fill: "var(--label)" }}
                        >
                          {it.v}
                        </motion.text>
                      ) : (
                        <circle cx={cw * i + cw / 2} cy={H / 2} r={4.5} style={{ fill: "var(--label-2)" }} />
                      )}
                    </g>
                  ))}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 px-5 pt-1">
        <Badge ok={aIsB} label="a is b" />
        <Badge ok={innerShared || aIsB} label="a[1] is b[1]" />
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={() => act("append")} disabled={used('b.append("Nami")')}>
          b.append(&quot;Nami&quot;)
        </Btn>
        <Btn onClick={() => act("nested")} disabled={used('b[1].append("Jinbe")')}>
          b[1].append(&quot;Jinbe&quot;)
        </Btn>
        <Btn onClick={() => act("assign")} disabled={used('b[0] = "Ace"')}>
          b[0] = &quot;Ace&quot;
        </Btn>
        <Btn onClick={() => changeMode(mode)}>
          <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Скинути</span>
        </Btn>
      </ControlBar>

      <Console
        lines={[
          <span key="0" className="text-[#8e8e93]">
            a = [&quot;Luffy&quot;, [&quot;Zoro&quot;, &quot;Sanji&quot;]]
          </span>,
          <span key="1" className="text-[#8e8e93]">
            {CODE[mode]}
          </span>,
          ...history.map((h, i) => <span key={`h${i}`}>{h}</span>),
          <span key="pa" className="break-all">
            <span className="text-[#8e8e93]">print(a) → </span>
            <span className="text-[#ffd60a]">{repr(world.heap, world.a)}</span>
          </span>,
          <span key="pb" className="break-all">
            <span className="text-[#8e8e93]">print(b) → </span>
            <span className="text-[#ffd60a]">{repr(world.heap, world.b)}</span>
          </span>,
        ]}
      />
    </div>
  );
}

/** Стрілка від комірки-посилання до вкладеного списку: з верхнього ряду — вниз, з нижнього — вгору. */
function refPath(sx: number, objY: number, ty: number) {
  const tx = INNER_X - 3;
  const top = objY < 100;
  const sy = top ? objY + H : objY;
  const cy = top ? sy + 42 : sy - 42;
  return `M${sx},${sy} C${sx},${cy} ${tx - 46},${ty} ${tx},${ty}`;
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <motion.span
      layout
      className="rounded-full px-2.5 py-1 font-mono text-[12px] font-semibold"
      style={{
        background: ok ? "color-mix(in oklab, var(--accent) 18%, transparent)" : "var(--separator)",
        color: ok ? "var(--accent)" : "var(--label-2)",
      }}
    >
      {label} → {ok ? "True" : "False"}
    </motion.span>
  );
}
