"use client";

import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import { GripVertical, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { Btn, ControlBar } from "../kit";
import { isSubclass, mro } from "./hierarchy";

const THROWABLE = ["KeyError", "IndexError", "ZeroDivisionError", "ValueError", "FileNotFoundError", "KeyboardInterrupt"];

const INITIAL = ["LookupError", "KeyError", "ArithmeticError", "Exception"];

type Status = "match" | "skip" | "unreached" | "dead";

export function ExceptOrder() {
  const [order, setOrder] = useState<string[]>(INITIAL);
  const [thrown, setThrown] = useState("KeyError");
  const [tick, setTick] = useState(0);

  const matchIdx = order.findIndex((c) => isSubclass(thrown, c));
  // «Мертвий» except: якийсь попередній except — його предок, тож до нього черга не дійде ніколи
  const dead = order.map((c, i) => order.slice(0, i).some((prev) => isSubclass(c, prev)));

  const statusOf = (i: number): Status => {
    if (matchIdx === i) return "match";
    if (matchIdx === -1 || i < matchIdx) return "skip";
    return "unreached";
  };

  const throwIt = (name: string) => {
    setThrown(name);
    setTick((t) => t + 1);
  };

  return (
    <div>
      <ControlBar>
        <span className="text-[13px] font-medium text-label-2">raise</span>
        <div className="flex flex-wrap gap-1.5">
          {THROWABLE.map((n) => (
            <button
              key={n}
              onClick={() => throwIt(n)}
              className={`pill !px-2.5 !py-1 font-mono !text-[12px] ${n === thrown ? "pill-accent" : "pill-glass"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </ControlBar>

      <div className="grid gap-4 px-5 pb-5 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[18px] border border-separator bg-elevated p-2 font-mono text-[13px]">
          <div className="px-3 pt-1 pb-0.5">try:</div>
          <div className="px-3 pb-2 text-label-2">
            {"    "}
            <span style={{ color: "var(--accent-2)" }}>raise</span> {thrown}()
          </div>
          <Reorder.Group axis="y" values={order} onReorder={setOrder} className="flex flex-col gap-1.5">
            {order.map((c, i) => (
              <Row key={c} c={c} i={i} st={statusOf(i)} dead={dead[i]} tick={tick} />
            ))}
          </Reorder.Group>
        </div>

        <div className="flex flex-col gap-3 text-[13.5px]">
          <div className="glass-tint rounded-[16px] border px-3.5 py-3">
            <div className="mb-1.5 text-[11px] font-bold tracking-wider text-label-3 uppercase">
              родовід {thrown}
            </div>
            <div className="flex flex-wrap items-center gap-1 font-mono text-[12px]">
              {mro(thrown).map((m, i, a) => (
                <span key={m} className="flex items-center gap-1">
                  <span
                    className="rounded-md px-1.5 py-0.5"
                    style={{
                      background: order.includes(m) ? "color-mix(in oklab, var(--accent) 22%, transparent)" : "transparent",
                      fontWeight: order.includes(m) ? 700 : 400,
                    }}
                  >
                    {m}
                  </span>
                  {i < a.length - 1 && <span className="text-label-3">→</span>}
                </span>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${tick}-${thrown}-${matchIdx}-${order.join()}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.25 }}
              className="rounded-[16px] px-3.5 py-3 leading-snug"
              style={{
                background:
                  matchIdx >= 0
                    ? "color-mix(in oklab, var(--accent) 12%, white)"
                    : "color-mix(in oklab, var(--accent-2) 12%, white)",
              }}
            >
              {matchIdx >= 0 ? (
                <>
                  <ShieldCheck className="mr-1 inline size-4 -translate-y-px" strokeWidth={1.75} />
                  <b>{thrown}</b> зловив <code className="inline-code">except {order[matchIdx]}</code> — це{" "}
                  {order[matchIdx] === thrown ? "той самий клас" : "його предок"}. Решту except Python навіть не перевіряє.
                </>
              ) : (
                <>
                  <Zap className="mr-1 inline size-4 -translate-y-px" strokeWidth={1.75} />
                  Жоден except не підійшов — <b>{thrown}</b> летить далі і, якщо його ніхто не зловить, зупинить
                  програму.
                  {thrown === "KeyboardInterrupt" && " Зверни увагу: навіть except Exception його не ловить!"}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto flex flex-wrap gap-2">
            <Btn onClick={() => setOrder(["Exception", "LookupError", "KeyError", "ArithmeticError"])}>Exception першим</Btn>
            <Btn onClick={() => setOrder(["KeyError", "LookupError", "ArithmeticError", "Exception"])}>Правильний порядок</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ c, i, st, dead, tick }: { c: string; i: number; st: Status; dead: boolean; tick: number }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={c}
      dragListener={false}
      dragControls={controls}
      className="relative flex items-center gap-2 overflow-hidden rounded-[12px] border border-separator bg-elevated/70 px-2 py-2 shadow-sm backdrop-blur"
      whileDrag={{ scale: 1.03, boxShadow: "0 12px 30px -10px rgb(0 0 0 / 0.35)", zIndex: 5 }}
    >
      <motion.span
        key={`${tick}-${c}-${st}`}
        className="absolute inset-0 origin-left"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: st === "unreached" ? 0 : 1 }}
        transition={{ delay: i * 0.14, type: "spring", stiffness: 200, damping: 26 }}
        style={{
          background:
            st === "match"
              ? "color-mix(in oklab, var(--accent) 26%, transparent)"
              : "color-mix(in oklab, var(--label) 6%, transparent)",
        }}
      />
      <span
        onPointerDown={(e) => controls.start(e)}
        className="relative -m-1 cursor-grab touch-none rounded-md p-1 active:cursor-grabbing"
        aria-label="Перетягнути"
      >
        <GripVertical className="size-4 text-label-3" />
      </span>
      <span className="relative min-w-0 flex-1 truncate">
        except <span className="font-semibold">{c}</span>:
      </span>
      <motion.span
        key={`b-${tick}-${c}-${st}`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.14 + 0.1 }}
        className="relative shrink-0 rounded-full px-2 py-0.5 font-sans text-[10.5px] font-bold"
        style={{
          background:
            st === "match"
              ? "color-mix(in oklab, var(--accent) 78%, black)"
              : dead
                ? "color-mix(in oklab, var(--accent-2) 20%, transparent)"
                : "transparent",
          color: st === "match" ? "white" : dead ? "color-mix(in oklab, var(--accent-2) 80%, var(--label))" : "var(--label-3)",
        }}
      >
        {st === "match" ? "ловить!" : dead ? "мертвий код" : st === "skip" ? "не підходить" : "не дійшло"}
      </motion.span>
    </Reorder.Item>
  );
}
