"use client";

import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FlowEdge, FlowNode, FlowScenario } from "@/content/types";
import { Segmented } from "@/components/viz/kit/Controls";
import { Prose, renderInline } from "./Inline";
import { FullscreenFigure } from "../ui/FullscreenFigure";

const COL_W = 224;
const ROW_H = 100;
const W = 180;
const H = 50;
const DH = 70; // висота ромба
const PAD = 28;
const LANE = 30; // відступ для стрілок-повернень

type Pt = [number, number];
type Placed = FlowNode & { x: number; y: number; h: number };

function size(n: FlowNode) {
  return n.kind === "decision" ? DH : H;
}

function route(a: Placed, b: Placed, e: FlowEdge, lanes: { left: number; right: number }): Pt[] {
  const aw = W / 2;
  const bw = W / 2;
  const forward = b.row > a.row;
  if (forward) {
    const top: Pt = [b.x, b.y - b.h / 2];
    if (!e.side && Math.abs(a.x - b.x) < 1) return [[a.x, a.y + a.h / 2], top];
    const dir = e.side ?? (b.x > a.x ? "right" : "left");
    const sx = dir === "right" ? a.x + aw : a.x - aw;
    if (Math.abs(a.x - b.x) < 1) {
      // той самий стовпець, але вихід збоку — обхід
      const lx = dir === "right" ? a.x + aw + 22 : a.x - aw - 22;
      const my = b.y - b.h / 2 - 16;
      return [[sx, a.y], [lx, a.y], [lx, my], [b.x, my], top];
    }
    return [[sx, a.y], [b.x, a.y], top];
  }
  if (b.row === a.row) {
    const right = b.x > a.x;
    return [
      [right ? a.x + aw : a.x - aw, a.y],
      [right ? b.x - bw : b.x + bw, b.y],
    ];
  }
  // повернення вгору (цикл)
  const dir = e.side ?? "left";
  const lx = dir === "left" ? lanes.left : lanes.right;
  const sx = dir === "left" ? a.x - aw : a.x + aw;
  const ex = dir === "left" ? b.x - bw : b.x + bw;
  return [[sx, a.y], [lx, a.y], [lx, b.y], [ex, b.y]];
}

function toPath(pts: Pt[], r = 10) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py);
    const l2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = cx - ((cx - px) / l1) * rr;
    const ay = cy - ((cy - py) / l1) * rr;
    const bx = cx + ((nx - cx) / l2) * rr;
    const by = cy + ((ny - cy) / l2) * rr;
    d += ` L${ax},${ay} Q${cx},${cy} ${bx},${by}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last[0]},${last[1]}`;
}

function Shape({ n, active, visited }: { n: Placed; active: boolean; visited: boolean }) {
  const stroke = active ? "var(--accent)" : visited ? "color-mix(in oklab, var(--accent) 45%, transparent)" : "rgb(60 60 67 / 0.28)";
  const fill = active
    ? "color-mix(in oklab, var(--accent) 14%, white)"
    : visited
      ? "color-mix(in oklab, var(--accent) 5%, white)"
      : "white";
  const common = { fill, stroke, strokeWidth: active ? 2.25 : 1.5, style: { transition: "all 350ms ease" } };
  const { x, y } = n;
  const w = W / 2;
  switch (n.kind) {
    case "start":
    case "end":
      return <rect x={x - w} y={y - H / 2} width={W} height={H} rx={H / 2} {...common} />;
    case "decision":
      return <path d={`M${x},${y - DH / 2} L${x + w},${y} L${x},${y + DH / 2} L${x - w},${y} Z`} strokeLinejoin="round" {...common} />;
    case "io":
      return <path d={`M${x - w + 14},${y - H / 2} L${x + w},${y - H / 2} L${x + w - 14},${y + H / 2} L${x - w},${y + H / 2} Z`} strokeLinejoin="round" {...common} />;
    case "call":
      return (
        <g>
          <rect x={x - w} y={y - H / 2} width={W} height={H} rx={8} {...common} />
          <line x1={x - w + 10} y1={y - H / 2} x2={x - w + 10} y2={y + H / 2} stroke={stroke} strokeWidth={1.25} />
          <line x1={x + w - 10} y1={y - H / 2} x2={x + w - 10} y2={y + H / 2} stroke={stroke} strokeWidth={1.25} />
        </g>
      );
    default:
      return <rect x={x - w} y={y - H / 2} width={W} height={H} rx={10} {...common} />;
  }
}

export function Flowchart({
  title,
  caption,
  nodes,
  edges,
  scenarios = [],
}: {
  title: string;
  caption?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  scenarios?: FlowScenario[];
}) {
  const layout = useMemo(() => {
    const cols = Math.max(...nodes.map((n) => n.col)) + 1;
    const rows = Math.max(...nodes.map((n) => n.row)) + 1;
    const hasLeft = edges.some((e) => {
      const a = nodes.find((n) => n.id === e.from);
      const b = nodes.find((n) => n.id === e.to);
      return a && b && b.row < a.row && (e.side ?? "left") === "left";
    });
    const hasRight = edges.some((e) => {
      const a = nodes.find((n) => n.id === e.from);
      const b = nodes.find((n) => n.id === e.to);
      return a && b && b.row < a.row && e.side === "right";
    });
    const offX = PAD + (hasLeft ? LANE + 12 : 0);
    const placed = new Map<string, Placed>();
    nodes.forEach((n) =>
      placed.set(n.id, { ...n, x: offX + n.col * COL_W + COL_W / 2, y: PAD + n.row * ROW_H + ROW_H / 2, h: size(n) }),
    );
    const width = offX + cols * COL_W + PAD + (hasRight ? LANE + 12 : 0);
    const height = PAD * 2 + rows * ROW_H;
    const lanes = { left: offX - LANE + 8, right: offX + cols * COL_W + LANE - 8 };
    const routed = edges.flatMap((e, i) => {
      const a = placed.get(e.from);
      const b = placed.get(e.to);
      if (!a || !b) return [];
      const pts = route(a, b, e, lanes);
      return [{ key: `${e.from}->${e.to}-${i}`, e, pts, d: toPath(pts) }];
    });
    return { placed, width, height, routed };
  }, [nodes, edges]);

  const [sc, setSc] = useState(0);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const scenario = scenarios[sc];
  const steps = scenario?.steps ?? [];
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing || step >= steps.length - 1) return;
    timer.current = setTimeout(() => {
      setStep(step + 1);
      if (step + 1 >= steps.length - 1) setPlaying(false);
    }, step < 0 ? 150 : 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, step, steps.length]);

  const activeId = step >= 0 ? steps[step]?.node : undefined;
  const visitedNodes = new Set(steps.slice(0, step + 1).map((s) => s.node));
  const visitedEdges = new Set<string>();
  for (let i = 1; i <= step; i++) visitedEdges.add(`${steps[i - 1].node}->${steps[i].node}`);
  const currentEdge = step > 0 ? `${steps[step - 1].node}->${steps[step].node}` : null;
  const note = step >= 0 ? steps[step]?.note : undefined;

  const reset = () => {
    setPlaying(false);
    setStep(-1);
  };
  const uid = useMemo(() => title.replace(/[^\p{L}\p{N}]+/gu, "-"), [title]);

  return (
    <FullscreenFigure
      icon="flow"
      title={title}
      badge="блок-схема"
      footer={
        caption && (
          <figcaption className="border-t border-separator px-5 py-3">
            <Prose md={caption} className="!text-[14px] !text-label-2" />
          </figcaption>
        )
      }
    >
      <div className="flow-canvas thin-scroll overflow-x-auto px-2">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ width: "100%", minWidth: Math.min(layout.width, 540), maxWidth: layout.width, display: "block", margin: "0 auto" }}
          role="img"
          aria-label={title}
        >
          <defs>
            <marker id={`arr-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" fill="rgb(60 60 67 / 0.45)" />
            </marker>
            <marker id={`arr-a-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" fill="var(--accent)" />
            </marker>
          </defs>

          {layout.routed.map(({ key, e, pts, d }) => {
            const on = visitedEdges.has(`${e.from}->${e.to}`);
            const [sx, sy] = pts[0];
            const [nx, ny] = pts[1];
            const horiz = Math.abs(ny - sy) < 1;
            const lx = horiz ? sx + (nx > sx ? 22 : -22) : sx + 10;
            const ly = horiz ? sy - 8 : sy + 16;
            return (
              <g key={key}>
                <path
                  d={d}
                  fill="none"
                  stroke={on ? "var(--accent)" : "rgb(60 60 67 / 0.35)"}
                  strokeWidth={on ? 2.25 : 1.5}
                  markerEnd={`url(#${on ? `arr-a-${uid}` : `arr-${uid}`})`}
                  style={{ transition: "stroke 300ms ease" }}
                />
                {e.label && (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={horiz ? (nx > sx ? "start" : "end") : "start"}
                    className="fill-label-2 text-[11.5px] font-semibold"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {currentEdge &&
            layout.routed
              .filter(({ e }) => `${e.from}->${e.to}` === currentEdge)
              .slice(0, 1)
              .map(({ key, d }) => (
                <circle key={`dot-${key}-${step}`} r={5.5} fill="var(--accent)">
                  <animateMotion dur="0.55s" fill="freeze" path={d} />
                </circle>
              ))}

          {[...layout.placed.values()].map((n) => {
            const active = n.id === activeId;
            const lines = n.label.split("\n");
            const mono = n.kind !== "start" && n.kind !== "end";
            return (
              <g key={n.id}>
                {active && (
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    initial={{ r: 20, opacity: 0.35 }}
                    animate={{ r: 96, opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    fill="var(--accent)"
                    key={`pulse-${step}`}
                  />
                )}
                <Shape n={n} active={active} visited={visitedNodes.has(n.id)} />
                <text
                  x={n.x}
                  y={n.y - ((lines.length - 1) * 15) / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`fill-label ${mono ? "font-mono text-[12.5px]" : "text-[13.5px] font-semibold"}`}
                >
                  {lines.map((l, i) => (
                    <tspan key={i} x={n.x} dy={i === 0 ? 0 : 15}>
                      {l}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {scenarios.length > 0 && (
        <div className="border-t border-separator px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {scenarios.length > 1 && (
              <Segmented
                id={`flow-${uid}`}
                value={String(sc)}
                options={scenarios.map((s, i) => ({ value: String(i), label: s.name }))}
                onChange={(v) => {
                  setSc(Number(v));
                  reset();
                }}
              />
            )}
            <div className="ml-auto flex gap-1.5">
              <button aria-label="Крок назад" className="pill pill-glass !p-2" disabled={step < 0} onClick={() => { setPlaying(false); setStep((s) => Math.max(-1, s - 1)); }}>
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </button>
              <button
                className="pill pill-accent"
                onClick={() => {
                  if (step >= steps.length - 1) setStep(-1);
                  setPlaying((p) => !p);
                }}
              >
                {playing ? <Pause className="size-4" strokeWidth={1.75} /> : <Play className="size-4" strokeWidth={1.75} />}
                {playing ? "Пауза" : step >= steps.length - 1 ? "Ще раз" : "Виконати"}
              </button>
              <button aria-label="Крок вперед" className="pill pill-glass !p-2" disabled={step >= steps.length - 1} onClick={() => { setPlaying(false); setStep((s) => Math.min(steps.length - 1, s + 1)); }}>
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </button>
              <button aria-label="Скинути" className="pill pill-glass !p-2" onClick={reset}>
                <RotateCcw className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
          <div className="mt-2.5 flex min-h-[40px] items-center gap-3 rounded-[12px] bg-bg px-3.5 py-2 text-[14px]">
            <span className="font-mono text-[12px] text-label-3 tabular-nums">
              {Math.max(0, step + 1)}/{steps.length}
            </span>
            <span className="min-w-0">
              {step < 0 ? (
                <span className="text-label-2">Натисни «Виконати» або крокуй стрілками, щоб пройти схему для сценарію «{scenario?.name}».</span>
              ) : note ? (
                renderInline(note, "fn")
              ) : (
                <span className="text-label-2">…</span>
              )}
            </span>
          </div>
        </div>
      )}

    </FullscreenFigure>
  );
}
