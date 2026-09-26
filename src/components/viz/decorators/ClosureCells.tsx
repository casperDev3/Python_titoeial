"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Btn, ControlBar } from "../kit";
import { CodePane, INK } from "./shared";

const CODE = [
  "def make_counter():",
  "    count = 0",
  "    def hit():",
  "        nonlocal count",
  "        count += 1",
  "        return count",
  "    return hit",
  "",
  "punch = make_counter()",
  "print(punch())",
  "print(punch())",
];

type Frame = "make_counter" | "hit" | null;

type Step = {
  line: number;
  frame: Frame;
  /** локальні імена фрейму make_counter */
  mcLocals: ("count" | "hit")[];
  cell: number | null;
  hitFn: boolean;
  punch: boolean;
  out: string[];
  note: string;
};

const S: Step[] = [
  { line: 0, frame: null, mcLocals: [], cell: null, hitFn: false, punch: false, out: [],
    note: "def лише створює об'єкт-функцію make_counter і ярлик на нього в глобальних іменах." },
  { line: 8, frame: "make_counter", mcLocals: [], cell: null, hitFn: false, punch: false, out: [],
    note: "Виклик make_counter() — на стеку з'являється новий фрейм." },
  { line: 1, frame: "make_counter", mcLocals: ["count"], cell: 0, hitFn: false, punch: false, out: [],
    note: "count потрібна вкладеній функції, тому Python кладе її не у фрейм, а в окрему комірку — cell." },
  { line: 2, frame: "make_counter", mcLocals: ["count", "hit"], cell: 0, hitFn: true, punch: false, out: [],
    note: "Створюється функція hit. Її __closure__ тримає посилання на ту саму комірку." },
  { line: 6, frame: null, mcLocals: [], cell: 0, hitFn: true, punch: true, out: [],
    note: "return hit — фрейм make_counter знищено! Але комірка жива: на неї посилається hit.__closure__. Ім'я punch тепер веде на hit." },
  { line: 4, frame: "hit", mcLocals: [], cell: 1, hitFn: true, punch: true, out: [],
    note: "punch() → фрейм hit. nonlocal count каже: пиши в комірку, а не в нову локальну змінну. count = 1." },
  { line: 5, frame: null, mcLocals: [], cell: 1, hitFn: true, punch: true, out: ["1"],
    note: "return count → 1. Фрейм hit зник, комірка лишилась." },
  { line: 4, frame: "hit", mcLocals: [], cell: 2, hitFn: true, punch: true, out: ["1"],
    note: "Другий punch() бачить ту саму комірку — і продовжує рахунок з 1." },
  { line: 5, frame: null, mcLocals: [], cell: 2, hitFn: true, punch: true, out: ["1", "2"],
    note: "Стан пережив обидва виклики без глобальних змінних і без класів. Це і є замикання." },
];

export function ClosureCells() {
  const [i, setI] = useState(0);
  const st = S[i];
  const last = S.length - 1;

  return (
    <div>
      <div className="grid gap-3 px-5 pt-2">
        <div className="min-w-0">
          <CodePane lines={CODE} active={st.line} id="closure" />
          <div className="mt-2 rounded-2xl bg-black/80 px-3 py-2 font-mono text-[12px] text-[#e5e5ea]">
            <span className="text-[#8e8e93]"># вивід: </span>
            {st.out.join("  ") || "—"}
          </div>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
          <Panel title="Глобальні імена">
            <Row name="make_counter">
              <Ref>fn make_counter</Ref>
            </Row>
            <AnimatePresence>
              {st.punch && (
                <motion.div key="punch" {...pop}>
                  <Row name="punch">
                    <Ref hot>fn hit</Ref>
                  </Row>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>

          <Panel title="Стек викликів">
            <AnimatePresence mode="popLayout">
              {st.frame === "make_counter" && (
                <motion.div key="mc" {...frameAnim} className="rounded-xl border border-separator p-2">
                  <div className="mb-1 font-mono text-[11.5px] font-bold">make_counter()</div>
                  {st.mcLocals.length === 0 && <div className="text-[11px] text-label-3">порожньо</div>}
                  {st.mcLocals.includes("count") && (
                    <Row name="count">
                      <Ref cell>cell</Ref>
                    </Row>
                  )}
                  {st.mcLocals.includes("hit") && (
                    <Row name="hit">
                      <Ref hot>fn hit</Ref>
                    </Row>
                  )}
                </motion.div>
              )}
              {st.frame === "hit" && (
                <motion.div key={`hit-${i}`} {...frameAnim} className="rounded-xl border border-separator p-2">
                  <div className="mb-1 font-mono text-[11.5px] font-bold">hit()</div>
                  <Row name="count">
                    <Ref cell>cell (nonlocal)</Ref>
                  </Row>
                </motion.div>
              )}
              {st.frame === null && (
                <motion.div key="empty" {...frameAnim} className="text-[11.5px] text-label-3">
                  лише глобальний рівень
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>

          <Panel title="Об'єкти в пам'яті">
            <div className="rounded-xl bg-separator/40 px-2 py-1.5 font-mono text-[11.5px]">fn make_counter</div>
            <AnimatePresence>
              {st.hitFn && (
                <motion.div key="hitfn" {...pop} className="rounded-xl px-2 py-1.5 font-mono text-[11.5px]"
                  style={{ background: "color-mix(in oklab, var(--accent) 20%, white)" }}>
                  <div className="font-bold">fn hit</div>
                  <div className="text-label-2">__closure__ → (cell,)</div>
                </motion.div>
              )}
              {st.cell !== null && (
                <motion.div
                  key="cell"
                  {...pop}
                  className="relative rounded-xl border-2 px-2 py-2 text-center"
                  style={{ borderColor: INK, background: "color-mix(in oklab, var(--accent) 10%, white)" }}
                >
                  <div className="font-mono text-[10.5px] font-bold tracking-wider uppercase" style={{ color: INK }}>
                    cell
                  </div>
                  <div className="font-mono text-[12px]">
                    count ={" "}
                    <motion.b
                      key={st.cell}
                      initial={{ scale: 1.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="inline-block text-[18px]"
                    >
                      {st.cell}
                    </motion.b>
                  </div>
                  {st.frame === null && st.hitFn && (
                    <div className="mt-0.5 text-[10px] text-label-2">живе завдяки hit.__closure__</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>
        </div>
      </div>

      <motion.div
        key={i}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mt-3 flex gap-2 rounded-2xl px-4 py-3 text-[13.5px]"
        style={{ background: "color-mix(in oklab, var(--accent) 12%, white)" }}
      >
        <span className="font-mono text-[11px] font-bold text-label-3 tabular-nums">
          {i}/{last}
        </span>
        <span>{st.note}</span>
      </motion.div>

      <ControlBar>
        <Btn onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
          <ChevronLeft className="size-4" strokeWidth={1.75} />
          Назад
        </Btn>
        <Btn variant="accent" onClick={() => setI((v) => Math.min(last, v + 1))} disabled={i === last}>
          Крок
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </Btn>
        <Btn onClick={() => setI(0)}>
          <RotateCcw className="size-4" strokeWidth={1.75} />
          Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}

const pop = {
  initial: { opacity: 0, scale: 0.85, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.85 },
  transition: { type: "spring" as const, stiffness: 420, damping: 28 },
};

const frameAnim = {
  initial: { opacity: 0, x: -14 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 14, filter: "blur(4px)" },
  transition: { type: "spring" as const, stiffness: 360, damping: 30 },
};

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass flex min-h-[150px] flex-col gap-1.5 !rounded-2xl p-2.5">
      <div className="text-[10.5px] font-bold tracking-wider text-label-3 uppercase">{title}</div>
      {children}
    </div>
  );
}

function Row({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[11.5px]">
      <span>{name}</span>
      <span className="text-label-3">→</span>
      {children}
    </div>
  );
}

function Ref({ children, hot, cell }: { children: ReactNode; hot?: boolean; cell?: boolean }) {
  return (
    <span
      className="rounded-md px-1.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap"
      style={{
        background: cell
          ? "transparent"
          : hot
            ? "color-mix(in oklab, var(--accent) 22%, white)"
            : "var(--separator)",
        border: cell ? `1.5px solid ${INK}` : "1.5px solid transparent",
        color: hot || cell ? INK : "var(--label-2)",
      }}
    >
      {children}
    </span>
  );
}
