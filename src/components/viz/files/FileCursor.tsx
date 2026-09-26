"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Btn, ControlBar } from "../kit";

const TEXT = "Ед\nАл\nВінрі\n";
const CHARS = [...TEXT];
/** Скільки байтів займає символ у UTF-8 (для tell()). */
const bytesOf = (ch: string) => new TextEncoder().encode(ch).length;
const BYTE_AT = CHARS.reduce<number[]>((acc, ch, i) => [...acc, acc[i] + bytesOf(ch)], [0]);

type Call = { id: number; call: string; result: string; from: number; to: number };

/** repr() рядка як у Python: одинарні лапки, \n як escape. */
const pyRepr = (s: string) => `'${s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/'/g, "\\'")}'`;

export function FileCursor() {
  const [pos, setPos] = useState(0);
  const [log, setLog] = useState<Call[]>([]);
  const [seq, setSeq] = useState(0);

  const push = (call: string, result: string, from: number, to: number) => {
    setLog((l) => [{ id: seq, call, result, from, to }, ...l].slice(0, 5));
    setSeq((s) => s + 1);
    setPos(to);
  };

  const read = (n?: number) => {
    const end = n === undefined ? CHARS.length : Math.min(CHARS.length, pos + n);
    push(n === undefined ? "f.read()" : `f.read(${n})`, pyRepr(CHARS.slice(pos, end).join("")), pos, end);
  };
  const readline = () => {
    let end = pos;
    while (end < CHARS.length && CHARS[end] !== "\n") end++;
    if (end < CHARS.length) end++;
    push("f.readline()", pyRepr(CHARS.slice(pos, end).join("")), pos, end);
  };
  const readlines = () => {
    const rest = CHARS.slice(pos).join("");
    const lines = rest.match(/[^\n]*\n|[^\n]+$/g) ?? [];
    push("f.readlines()", `[${lines.map(pyRepr).join(", ")}]`, pos, CHARS.length);
  };
  const seek0 = () => push("f.seek(0)", "0", 0, 0);

  const last = log[0];
  // Розбиваємо на рядки для відображення, зберігаючи глобальні індекси
  const rows: number[][] = [[]];
  CHARS.forEach((ch, i) => {
    rows[rows.length - 1].push(i);
    if (ch === "\n") rows.push([]);
  });

  return (
    <div>
      <ControlBar>
        <Btn variant="accent" onClick={() => read(3)}>read(3)</Btn>
        <Btn onClick={readline}>readline()</Btn>
        <Btn onClick={readlines}>readlines()</Btn>
        <Btn onClick={() => read()}>read()</Btn>
        <Btn onClick={seek0}>seek(0)</Btn>
      </ControlBar>

      <div className="grid gap-4 px-5 pb-5 md:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[18px] border border-separator bg-elevated p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold tracking-wider text-label-3 uppercase">
            <span>squad.txt</span>
            <span className="font-mono normal-case">
              символ {pos} · tell() = {BYTE_AT[pos]}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {rows.map((row, r) => (
              <div key={r} className="flex min-h-9 flex-wrap items-center gap-1">
                {row.map((i) => {
                  const ch = CHARS[i];
                  const nl = ch === "\n";
                  const consumed = i < pos;
                  const justRead = last && i >= last.from && i < last.to;
                  return (
                    <div key={i} className="relative">
                      {pos === i && <CursorBar />}
                      <motion.div
                        layout
                        className="grid h-9 min-w-8 place-items-center rounded-[10px] px-1.5 font-mono text-[15px] transition-colors duration-300"
                        style={{
                          background: justRead
                            ? "color-mix(in oklab, var(--accent) 30%, transparent)"
                            : nl
                              ? "color-mix(in oklab, var(--accent-2) 12%, transparent)"
                              : "var(--glass-bg-strong)",
                          border: "1px solid var(--glass-border)",
                          opacity: consumed && !justRead ? 0.45 : 1,
                          color: nl ? "var(--accent-2)" : "var(--label)",
                        }}
                      >
                        {nl ? "\\n" : ch}
                        <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[9px] text-label-3">{BYTE_AT[i]}</span>
                      </motion.div>
                    </div>
                  );
                })}
                {r === rows.length - 1 && (
                  <div className="relative">
                    {pos === CHARS.length && <CursorBar />}
                    <div className="grid h-9 place-items-center rounded-[10px] border border-dashed border-separator px-2 text-[11px] font-semibold text-label-3">
                      EOF
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-snug text-label-3">
            Маленькі числа — позиція в байтах. Кирилиця займає 2 байти, тому tell() ≠ номер символу.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="text-[11px] font-bold tracking-wider text-label-3 uppercase">Що повернули виклики</div>
          <div className="flex min-h-[180px] flex-col gap-1.5 rounded-[16px] bg-black/80 p-3 font-mono text-[12.5px] text-[#e5e5ea]">
            {log.length === 0 && <span className="text-white/40">&gt;&gt;&gt; натисни будь-який метод угорі</span>}
            <AnimatePresence initial={false}>
              {log.map((c, i) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: i === 0 ? 1 : 0.55, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="break-all"
                >
                  <span className="text-white/50">&gt;&gt;&gt; </span>
                  {c.call}
                  <br />
                  <span style={{ color: c.result === "''" ? "#ff9f0a" : "#7ee787" }}>{c.result}</span>
                  {c.result === "''" && <span className="text-white/40">  ← курсор у кінці, читати нічого</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function CursorBar() {
  return (
    <motion.div
      layoutId="file-cursor-bar"
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="absolute -top-1 -bottom-1 -left-[3px] z-10 w-[3px] rounded-full"
      style={{ background: "color-mix(in oklab, var(--accent) 80%, var(--label))" }}
    />
  );
}
