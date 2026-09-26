"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Btn, Console, ControlBar, Segmented } from "../kit";

/** Вузол дерева виразу: або готове значення, або оператор з операндами. */
type Val = number | boolean;
type Node =
  | { kind: "val"; v: Val; paren?: boolean }
  | { kind: "bin"; op: string; a: Node; b: Node; paren?: boolean }
  | { kind: "un"; op: string; a: Node; paren?: boolean };

const n = (v: Val, paren = false): Node => ({ kind: "val", v, paren });
const bin = (op: string, a: Node, b: Node, paren = false): Node => ({ kind: "bin", op, a, b, paren });
const un = (op: string, a: Node): Node => ({ kind: "un", op, a });

type Preset = { id: string; label: string; src: string; tree: Node; note: string };

const PRESETS: Preset[] = [
  {
    id: "p1",
    label: "2 + 3 * 4 ** 2",
    src: "2 + 3 * 4 ** 2",
    tree: bin("+", n(2), bin("*", n(3), bin("**", n(4), n(2)))),
    note: "** сильніший за *, а * — за +. Тому спершу 4 ** 2.",
  },
  {
    id: "p2",
    label: "-2 ** 2",
    src: "-2 ** 2",
    tree: un("-", bin("**", n(2), n(2))),
    note: "Унарний мінус слабший за **: це -(2 ** 2).",
  },
  {
    id: "p3",
    label: "2 ** 3 ** 2",
    src: "2 ** 3 ** 2",
    tree: bin("**", n(2), bin("**", n(3), n(2))),
    note: "** групується справа наліво: 2 ** (3 ** 2).",
  },
  {
    id: "p4",
    label: "(8 + 4) // 5 * 2",
    src: "(8 + 4) // 5 * 2",
    tree: bin("*", bin("//", bin("+", n(8), n(4), true), n(5)), n(2)),
    note: "// і * мають однаковий пріоритет — ідуть зліва направо.",
  },
  {
    id: "p5",
    label: "1 + 2 > 2 and 7 % 2 == 1",
    src: "1 + 2 > 2 and 7 % 2 == 1",
    tree: bin("and", bin(">", bin("+", n(1), n(2)), n(2)), bin("==", bin("%", n(7), n(2)), n(1))),
    note: "Арифметика → порівняння → and. Логіка — найслабша.",
  },
  {
    id: "p6",
    label: "not 10 - 3 * 3 == 1",
    src: "not 10 - 3 * 3 == 1",
    tree: un("not", bin("==", bin("-", n(10), bin("*", n(3), n(3))), n(1))),
    note: "not слабший за ==: not (10 - 9 == 1).",
  },
];

function fmt(v: Val): string {
  if (typeof v === "boolean") return v ? "True" : "False";
  return String(v);
}

function apply(op: string, a: Val, b?: Val): Val {
  const x = a as number;
  const y = b as number;
  switch (op) {
    case "+": return x + y;
    case "-": return b === undefined ? -x : x - y;
    case "*": return x * y;
    case "**": return x ** y;
    case "//": return Math.floor(x / y);
    case "%": return ((x % y) + y) % y;
    case ">": return x > y;
    case "==": return x === y;
    case "and": return a ? (b as Val) : a;
    case "not": return !a;
    default: return 0;
  }
}

/** Шлях до першого (у порядку обчислення) вузла, в якого всі операнди — значення. */
function nextPath(node: Node, path: string = ""): string | null {
  if (node.kind === "val") return null;
  if (node.kind === "un") {
    return node.a.kind === "val" ? path : nextPath(node.a, path + "a");
  }
  if (node.a.kind !== "val") return nextPath(node.a, path + "a");
  if (node.b.kind !== "val") return nextPath(node.b, path + "b");
  return path;
}

function reduceAt(node: Node, path: string): { node: Node; log: string } {
  if (path === "") {
    if (node.kind === "bin" && node.a.kind === "val" && node.b.kind === "val") {
      const v = apply(node.op, node.a.v, node.b.v);
      return { node: n(v), log: `${fmt(node.a.v)} ${node.op} ${fmt(node.b.v)} → ${fmt(v)}` };
    }
    if (node.kind === "un" && node.a.kind === "val") {
      const v = apply(node.op, node.a.v);
      const sp = node.op === "not" ? " " : "";
      return { node: n(v), log: `${node.op}${sp}${fmt(node.a.v)} → ${fmt(v)}` };
    }
    return { node, log: "" };
  }
  const [head, rest] = [path[0], path.slice(1)];
  if (node.kind === "bin") {
    if (head === "a") {
      const r = reduceAt(node.a, rest);
      return { node: { ...node, a: r.node }, log: r.log };
    }
    const r = reduceAt(node.b, rest);
    return { node: { ...node, b: r.node }, log: r.log };
  }
  if (node.kind === "un") {
    const r = reduceAt(node.a, rest);
    return { node: { ...node, a: r.node }, log: r.log };
  }
  return { node, log: "" };
}

/** Ключ для ремаунту: коли підвираз стає значенням, воно «вибухає» появою. */
const ck = (x: Node) => (x.kind === "val" ? `v${fmt(x.v)}` : "e");

const spring = { type: "spring" as const, stiffness: 380, damping: 30 };

function ExprView({
  node,
  path,
  target,
  depth,
  showParens,
}: {
  node: Node;
  path: string;
  target: string | null;
  depth: number;
  showParens: boolean;
}) {
  if (node.kind === "val") {
    return (
      <motion.span
        layout
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
        className="inline-flex items-center rounded-[10px] px-2 py-1 font-mono text-[15px] font-bold"
        style={{
          background:
            typeof node.v === "boolean"
              ? "color-mix(in oklab, var(--accent-2) 22%, transparent)"
              : "color-mix(in oklab, var(--label) 7%, transparent)",
        }}
      >
        {fmt(node.v)}
      </motion.span>
    );
  }
  const isTarget = path === target;
  const explicit = node.paren;
  const implicit = !explicit && depth > 0 && showParens;
  const inner =
    node.kind === "bin" ? (
      <>
        <ExprView key={ck(node.a)} node={node.a} path={path + "a"} target={target} depth={depth + 1} showParens={showParens} />
        <span className="px-0.5 font-mono text-[15px] font-bold" style={{ color: "var(--accent-2)" }}>
          {node.op}
        </span>
        <ExprView key={ck(node.b)} node={node.b} path={path + "b"} target={target} depth={depth + 1} showParens={showParens} />
      </>
    ) : (
      <>
        <span className="font-mono text-[15px] font-bold" style={{ color: "var(--accent-2)" }}>
          {node.op}
        </span>
        <ExprView key={ck(node.a)} node={node.a} path={path + "a"} target={target} depth={depth + 1} showParens={showParens} />
      </>
    );
  return (
    <motion.span
      layout
      transition={spring}
      className="relative inline-flex flex-wrap items-center gap-1.5 rounded-[14px] px-1.5 py-1"
      style={{
        border: `1.5px ${isTarget ? "solid" : "dashed"} ${
          isTarget ? "var(--accent)" : "color-mix(in oklab, var(--label) 18%, transparent)"
        }`,
        background: isTarget
          ? "color-mix(in oklab, var(--accent) 20%, transparent)"
          : "color-mix(in oklab, var(--label) 3%, transparent)",
        boxShadow: isTarget ? "0 0 0 4px color-mix(in oklab, var(--accent) 18%, transparent)" : "none",
      }}
    >
      {(explicit || implicit) && (
        <span className={`font-mono text-[16px] font-bold ${explicit ? "text-label" : "text-label-3"}`}>(</span>
      )}
      {inner}
      {(explicit || implicit) && (
        <span className={`font-mono text-[16px] font-bold ${explicit ? "text-label" : "text-label-3"}`}>)</span>
      )}
    </motion.span>
  );
}

export function PrecedencePunch() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const [tree, setTree] = useState<Node>(preset.tree);
  const [log, setLog] = useState<string[]>([]);
  const [showParens, setShowParens] = useState(true);
  const [flash, setFlash] = useState(0);

  const target = nextPath(tree);
  const done = target === null;

  const choose = (id: string) => {
    const p = PRESETS.find((x) => x.id === id) ?? PRESETS[0];
    setPresetId(id);
    setTree(p.tree);
    setLog([]);
  };

  const punch = () => {
    if (target === null) return;
    const r = reduceAt(tree, target);
    setTree(r.node);
    setLog((l) => [...l, r.log]);
    setFlash((f) => f + 1);
  };

  const reset = () => {
    setTree(preset.tree);
    setLog([]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-5 pb-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => choose(p.id)}
            className="rounded-full px-3 py-1 font-mono text-[12.5px] font-semibold transition-colors"
            style={{
              background:
                p.id === presetId
                  ? "color-mix(in oklab, var(--accent) 28%, transparent)"
                  : "color-mix(in oklab, var(--label) 6%, transparent)",
              color: "var(--label)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="relative mx-5 mt-3 flex min-h-[170px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-separator px-3 py-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)",
          }}
        />
        <AnimatePresence>
          <motion.div
            key={flash}
            initial={{ scale: 0.4, opacity: 0.55 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute size-40 rounded-full"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)", display: flash ? "block" : "none" }}
          />
        </AnimatePresence>
        <motion.div layout className="relative flex max-w-full flex-wrap items-center justify-center">
          <ExprView key={ck(tree)} node={tree} path="" target={target} depth={0} showParens={showParens} />
        </motion.div>
        <div className="relative text-center text-[13px] text-label-2">
          {done ? (
            <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-label">
              👊 Один удар — і готово! Результат: {tree.kind === "val" ? fmt(tree.v) : ""}
            </motion.span>
          ) : (
            preset.note
          )}
        </div>
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={punch} disabled={done}>
          👊 Удар
        </Btn>
        <Btn onClick={reset}>Скинути</Btn>
        <div className="ml-auto">
          <Segmented
            id="prec-parens"
            value={showParens ? "on" : "off"}
            onChange={(v) => setShowParens(v === "on")}
            options={[
              { value: "on", label: "невидимі ( )" },
              { value: "off", label: "без дужок" },
            ]}
          />
        </div>
      </ControlBar>
      <Console
        lines={[
          <span key="src" className="text-[#8e8e93]">&gt;&gt;&gt; {preset.src}</span>,
          ...log.map((l, i) => (
            <span key={i}>
              <span className="text-[#8e8e93]">крок {i + 1}: </span>
              {l}
            </span>
          )),
          ...(done && tree.kind === "val" ? [<span key="res" className="font-bold text-[#ffd60a]">{fmt(tree.v)}</span>] : []),
        ]}
      />
    </div>
  );
}
