"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";

type Mode = "bad" | "good";
const NAMES = ["Деку", "Урарака", "Іїда", "Тодорокі", "Цую", "Кірішіма"];
const HUES = ["var(--accent)", "var(--accent-2)", "#f59e0b", "#ec4899", "#6366f1", "#ef4444"];

type Call = { name: string; listId: number };
type ListObj = { id: number; items: string[]; born: "def" | "call" };

/** Пастка змінюваного значення за замовчуванням: один список на всі виклики. */
export function MutableDefault() {
  const [mode, setMode] = useState<Mode>("bad");
  const [calls, setCalls] = useState<Call[]>([]);
  const [lists, setLists] = useState<ListObj[]>([{ id: 0, items: [], born: "def" }]);

  const reset = (m: Mode) => {
    setMode(m);
    setCalls([]);
    setLists(m === "bad" ? [{ id: 0, items: [], born: "def" }] : []);
  };

  const call = () => {
    if (calls.length >= NAMES.length) return;
    const name = NAMES[calls.length];
    if (mode === "bad") {
      setLists((ls) => ls.map((l) => (l.id === 0 ? { ...l, items: [...l.items, name] } : l)));
      setCalls((c) => [...c, { name, listId: 0 }]);
    } else {
      const id = calls.length + 1;
      setLists((ls) => [...ls, { id, items: [name], born: "call" }]);
      setCalls((c) => [...c, { name, listId: id }]);
    }
  };

  const hue = (id: number) => HUES[id % HUES.length];
  const tag = (id: number) => ({
    background: `color-mix(in oklab, ${hue(id)} 14%, white)`,
    border: `1px solid color-mix(in oklab, ${hue(id)} 50%, white)`,
    color: `color-mix(in oklab, ${hue(id)} 62%, black)`,
  });
  const addr = (id: number) => `0x${(0x7f3a10 + id * 0x48).toString(16)}`;

  return (
    <div>
      <ControlBar>
        <Segmented
          id="fn-mutdef"
          value={mode}
          onChange={reset}
          options={[
            { value: "bad", label: <span className="font-mono">team=[]</span> },
            { value: "good", label: <span className="font-mono">team=None</span> },
          ]}
        />
      </ControlBar>

      <div className="mx-5 rounded-2xl border border-separator bg-[var(--code-bg)] px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed">
        {mode === "bad" ? (
          <>
            <div>
              <span style={{ color: "var(--accent)" }}>def</span> add_member(name, team=
              <span className="rounded px-1 font-bold" style={{ background: "color-mix(in oklab, #ff453a 22%, transparent)" }}>
                []
              </span>
              ):
            </div>
            <div className="pl-4 text-label-2">team.append(name); return team</div>
          </>
        ) : (
          <>
            <div>
              <span style={{ color: "var(--accent)" }}>def</span> add_member(name, team=None):
            </div>
            <div className="pl-4 text-label-2">
              if team is None: team ={" "}
              <span className="rounded px-1 font-bold" style={{ background: "color-mix(in oklab, #30d158 25%, transparent)" }}>
                []
              </span>
            </div>
            <div className="pl-4 text-label-2">team.append(name); return team</div>
          </>
        )}
      </div>

      <div className="grid gap-3 px-5 py-3 sm:grid-cols-2">
        {/* Виклики */}
        <div className="min-h-[190px] rounded-2xl bg-separator/25 p-2.5">
          <div className="mb-2 text-[11px] font-bold tracking-wider text-label-3 uppercase">Виклики</div>
          <div className="flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {calls.map((c, i) => (
                <motion.div
                  key={`${mode}-${i}`}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 360, damping: 28 }}
                  className="flex items-center gap-2 rounded-[10px] bg-elevated/70 px-2.5 py-1.5 font-mono text-[12px] shadow-sm"
                >
                  <span className="truncate">add_member(&quot;{c.name}&quot;)</span>
                  <span className="ml-auto shrink-0 text-label-3">→</span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={tag(c.listId)}
                  >
                    {addr(c.listId)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {calls.length === 0 && (
              <div className="py-6 text-center text-[12.5px] text-label-3">натисни «Викликати»</div>
            )}
          </div>
        </div>

        {/* Об'єкти в пам'яті */}
        <div className="min-h-[190px] rounded-2xl bg-separator/25 p-2.5">
          <div className="mb-2 text-[11px] font-bold tracking-wider text-label-3 uppercase">Списки в пам&apos;яті</div>
          <motion.div layout className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {lists.map((l) => (
                <motion.div
                  layout
                  key={`${mode}-${l.id}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 340, damping: 26 }}
                  className="rounded-[14px] border-2 bg-elevated/60 p-2"
                  style={{ borderColor: hue(l.id) }}
                >
                  <div className="mb-1.5 flex items-center gap-2 text-[11px]">
                    <span className="rounded-full px-2 py-0.5 font-mono font-bold" style={tag(l.id)}>
                      {addr(l.id)}
                    </span>
                    <span className="text-label-3">
                      {l.born === "def" ? "створено під час def · живе у __defaults__" : "новий список цього виклику"}
                    </span>
                  </div>
                  <div className="flex min-h-[28px] flex-wrap gap-1">
                    <span className="font-mono text-label-3">[</span>
                    <AnimatePresence initial={false}>
                      {l.items.map((it) => (
                        <motion.span
                          key={it}
                          layout
                          initial={{ opacity: 0, y: -10, scale: 0.6 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 24 }}
                          className="rounded-lg px-1.5 py-0.5 font-mono text-[12px]"
                          style={{ background: "color-mix(in oklab, var(--accent) 14%, white)" }}
                        >
                          &apos;{it}&apos;
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    <span className="font-mono text-label-3">]</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="mx-5 rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug"
        style={{ background: mode === "bad" ? "color-mix(in oklab, #ff453a 10%, white)" : "color-mix(in oklab, #30d158 12%, white)" }}>
        {mode === "bad"
          ? calls.length > 1
            ? `Бачиш? ${calls.length} ${calls.length < 5 ? "виклики" : "викликів"} — і всі повертають ОДИН і той самий список. Він створився один раз, коли виконувався def.`
            : "Список [] створюється лише один раз — у момент def. Зроби кілька викликів."
          : "Кожен виклик без team отримує None і створює свіжий список — жодних «привидів» з минулих викликів."}
      </div>

      <ControlBar>
        <Btn variant="accent" onClick={call} disabled={calls.length >= NAMES.length}>
          <Plus className="size-4" strokeWidth={1.75} /> Викликати
        </Btn>
        <Btn onClick={() => reset(mode)}>
          <RotateCcw className="size-4" strokeWidth={1.75} /> Скинути
        </Btn>
      </ControlBar>
    </div>
  );
}
