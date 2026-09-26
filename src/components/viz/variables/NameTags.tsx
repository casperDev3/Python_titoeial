"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Btn, ControlBar } from "../kit";

type ObjId = "A" | "B" | "C" | "D";
type Obj = { type: string; value: string; addr: string; slot: number };

const OBJECTS: Record<ObjId, Obj> = {
  A: { type: "int", value: "9000", addr: "0x7f3a10", slot: 0 },
  B: { type: "int", value: "9001", addr: "0x7f3a58", slot: 1 },
  C: { type: "list", value: "['Goku']", addr: "0x7f4c20", slot: 2 },
  D: { type: "str", value: "'over 9000!'", addr: "0x7f5e90", slot: 3 },
};

const NAMES = ["power", "goku", "team", "squad"] as const;
type Name = (typeof NAMES)[number];

const PROGRAM: { code: string; note: string }[] = [
  { code: "power = 9000", note: "Створено об'єкт int 9000, ім'я power наклеєно на нього." },
  { code: "goku = power", note: "Жодного копіювання: goku — другий ярлик на ТОЙ САМИЙ об'єкт. refcount = 2." },
  { code: "power = power + 1", note: "int незмінний: обчислено НОВИЙ об'єкт 9001, ярлик power переклеєно. goku лишився на 9000." },
  { code: 'team = ["Goku"]', note: "Новий список у пам'яті, ім'я team вказує на нього." },
  { code: "squad = team", note: "squad — ще один ярлик на той самий список (не копія!)." },
  { code: 'squad.append("Vegeta")', note: "Список змінено НА МІСЦІ. Адреса та сама — тому team теж бачить Vegeta." },
  { code: 'goku = "over 9000!"', note: "goku переклеєно на рядок. На 9000 більше ніхто не вказує → refcount 0 → пам'ять звільнено." },
];

type Mem = { names: Partial<Record<Name, ObjId>>; objs: Partial<Record<ObjId, string>>; changed?: ObjId };

function memoryAt(step: number): Mem {
  const m: Mem = { names: {}, objs: {} };
  const ops: ((m: Mem) => void)[] = [
    (m) => {
      m.objs.A = OBJECTS.A.value;
      m.names.power = "A";
    },
    (m) => {
      m.names.goku = "A";
    },
    (m) => {
      m.objs.B = OBJECTS.B.value;
      m.names.power = "B";
    },
    (m) => {
      m.objs.C = OBJECTS.C.value;
      m.names.team = "C";
    },
    (m) => {
      m.names.squad = "C";
    },
    (m) => {
      m.objs.C = "['Goku', 'Vegeta']";
      m.changed = "C";
    },
    (m) => {
      m.objs.D = OBJECTS.D.value;
      m.names.goku = "D";
    },
  ];
  for (let i = 0; i < step; i++) {
    m.changed = undefined;
    ops[i](m);
  }
  return m;
}

// Геометрія SVG
const W = 420;
const ROW = 64;
const TOP = 18;
const NAME_X = 12;
const NAME_W = 86;
const OBJ_X = 196;
const OBJ_W = 212;
const OBJ_H = 50;
const H = TOP + ROW * 4 + 4;

const nameY = (i: number) => TOP + i * ROW + 8;
const objY = (slot: number) => TOP + slot * ROW;

function arrowPath(ni: number, slot: number) {
  const x1 = NAME_X + NAME_W;
  const y1 = nameY(ni) + 17;
  const x2 = OBJ_X - 6;
  const y2 = objY(slot) + OBJ_H / 2;
  return `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;
}

const spring = { type: "spring" as const, stiffness: 260, damping: 28 };

export function NameTags() {
  const [step, setStep] = useState(0);
  const mem = memoryAt(step);

  const refcount = (id: ObjId) => Object.values(mem.names).filter((x) => x === id).length;

  return (
    <div>
      <ControlBar>
        <Btn onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="size-4" strokeWidth={1.75} aria-label="Назад" />
        </Btn>
        <Btn variant="accent" onClick={() => setStep((s) => Math.min(PROGRAM.length, s + 1))} disabled={step === PROGRAM.length}>
          <span className="inline-flex items-center gap-1">
            Крок
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </span>
        </Btn>
        <Btn onClick={() => setStep(0)}>
          <RotateCcw className="size-4" strokeWidth={1.75} aria-label="Скинути" />
        </Btn>
        <span className="ml-auto font-mono text-[12px] text-label-2 tabular-nums">
          {step}/{PROGRAM.length}
        </span>
      </ControlBar>

      <div className="grid gap-3 px-5 pb-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        {/* Код */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-separator py-2 font-mono text-[12.5px]" style={{ background: "var(--code-bg)" }}>
            {PROGRAM.map((l, i) => {
              const cur = i === step - 1;
              return (
                <div key={i} className="relative flex items-center gap-2.5 px-3 py-[3px]">
                  {cur && (
                    <motion.div
                      layoutId="vars-nametags-pc"
                      className="absolute inset-x-1.5 inset-y-0 rounded-lg"
                      style={{
                        background: "color-mix(in oklab, var(--accent) 14%, white)",
                        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--accent) 50%, transparent)",
                      }}
                      transition={spring}
                    />
                  )}
                  <span className="relative w-3 text-right text-label-3">{i + 1}</span>
                  <span className="relative truncate" style={{ opacity: i < step ? 1 : 0.45 }}>
                    {l.code}
                  </span>
                </div>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={spring}
              className="glass !rounded-[16px] px-3.5 py-2.5 text-[13.5px] leading-snug"
            >
              {step === 0 ? "Пам'ять порожня. Натисни «Крок», щоб виконати перший рядок." : PROGRAM[step - 1].note}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Пам'ять */}
        <div className="rounded-2xl border border-separator p-2" style={{ background: "var(--glass-bg)" }}>
          <div className="flex justify-between px-2 pt-1 text-[11px] font-semibold tracking-wider text-label-3 uppercase">
            <span>Імена</span>
            <span>Об&apos;єкти в пам&apos;яті</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Діаграма посилань імен на об'єкти">
            <defs>
              <marker id="vars-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: "var(--accent)" }} />
              </marker>
            </defs>

            {/* Стрілки */}
            {NAMES.map((n, i) => {
              const target = mem.names[n];
              if (!target) return null;
              return (
                <motion.path
                  key={n}
                  initial={{ pathLength: 0, opacity: 0, d: arrowPath(i, OBJECTS[target].slot) }}
                  animate={{ d: arrowPath(i, OBJECTS[target].slot), pathLength: 1, opacity: 1 }}
                  transition={spring}
                  fill="none"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  markerEnd="url(#vars-arrow)"
                  style={{ stroke: "var(--accent)" }}
                />
              );
            })}

            {/* Імена */}
            {NAMES.map((n, i) => {
              const on = !!mem.names[n];
              return (
                <motion.g key={n} initial={false} animate={{ opacity: on ? 1 : 0.28 }} transition={spring}>
                  <rect
                    x={NAME_X}
                    y={nameY(i)}
                    width={NAME_W}
                    height={34}
                    rx={17}
                    style={{
                      fill: on ? "color-mix(in oklab, var(--accent) 14%, white)" : "#ffffff",
                      stroke: on ? "var(--accent)" : "rgb(60 60 67 / 0.25)",
                    }}
                    strokeWidth={1.2}
                  />
                  <text x={NAME_X + NAME_W / 2} y={nameY(i) + 22} textAnchor="middle" className="font-mono" fontSize={14} fontWeight={600} style={{ fill: "var(--label)" }}>
                    {n}
                  </text>
                </motion.g>
              );
            })}

            {/* Об'єкти */}
            <AnimatePresence>
              {(Object.keys(mem.objs) as ObjId[]).map((id) => {
                const o = OBJECTS[id];
                const rc = refcount(id);
                const dead = rc === 0;
                const y = objY(o.slot);
                return (
                  <motion.g
                    key={id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: dead ? 0.35 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={spring}
                  >
                    <motion.rect
                      x={OBJ_X}
                      y={y}
                      width={OBJ_W}
                      height={OBJ_H}
                      rx={14}
                      strokeWidth={1.4}
                      strokeDasharray={dead ? "5 4" : undefined}
                      animate={{ scale: mem.changed === id ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        fill: "var(--bg-elevated)",
                        stroke: dead ? "var(--label-3)" : o.type === "list" ? "var(--accent-2)" : "rgb(60 60 67 / 0.28)",
                      }}
                    />
                    <text x={OBJ_X + 12} y={y + 18} fontSize={10.5} fontWeight={700} letterSpacing={0.6} style={{ fill: o.type === "list" ? "var(--accent-2)" : "var(--accent)" }}>
                      {o.type.toUpperCase()}
                    </text>
                    <text x={OBJ_X + 12} y={y + 38} className="font-mono" fontSize={14} fontWeight={600} style={{ fill: "var(--label)" }}>
                      {mem.objs[id]}
                    </text>
                    <text x={OBJ_X + OBJ_W - 40} y={y + 18} textAnchor="end" className="font-mono" fontSize={9.5} style={{ fill: "var(--label-3)" }}>
                      id {o.addr}
                    </text>
                    {/* лічильник посилань */}
                    <circle cx={OBJ_X + OBJ_W - 18} cy={y + 25} r={12} style={{ fill: dead ? "#aeaeb2" : "var(--accent)" }} />
                    <text x={OBJ_X + OBJ_W - 18} y={y + 29.5} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">
                      {rc}
                    </text>
                    {dead && (
                      <text x={OBJ_X + OBJ_W - 40} y={y + 40} textAnchor="end" fontSize={10} fontWeight={600} style={{ fill: "#d70015" }}>
                        GC: звільнено
                      </text>
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
          <div className="flex items-center gap-2 px-2 pb-1 text-[11.5px] text-label-2">
            <span className="grid size-4 place-items-center rounded-full text-[9px] font-bold text-white" style={{ background: "var(--accent)" }}>
              n
            </span>
            кількість імен, що вказують на об&apos;єкт (refcount)
          </div>
        </div>
      </div>
    </div>
  );
}
