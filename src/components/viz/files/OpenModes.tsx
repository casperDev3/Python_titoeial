"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Btn, ControlBar, Segmented } from "../kit";

type Mode = "r" | "w" | "a" | "x" | "r+";

const INITIAL = "day 1\nday 2\n";
const NEW = "NEW\n";

const INFO: Record<Mode, { read: boolean; write: boolean; creates: boolean; truncates: boolean; start: string; hint: string }> = {
  r: { read: true, write: false, creates: false, truncates: false, start: "початок", hint: "Безпечне читання. Змінити файл неможливо." },
  w: { read: false, write: true, creates: true, truncates: true, start: "початок", hint: "Стирає вміст одразу при відкритті — навіть якщо ти нічого не запишеш." },
  a: { read: false, write: true, creates: true, truncates: false, start: "кінець", hint: "Будь-який write іде в кінець. Ідеально для логів." },
  x: { read: false, write: true, creates: true, truncates: false, start: "початок", hint: "Створює лише новий файл. Існуючий не зачепить — кине помилку." },
  "r+": { read: true, write: true, creates: false, truncates: false, start: "початок", hint: "Читання і запис. write перезаписує символи з місця курсора." },
};

type Result = { before: string | null; after: string | null; returned?: string; error?: string; code: string };

function simulate(mode: Mode, exists: boolean): Result {
  const before = exists ? INITIAL : null;
  const writes = INFO[mode].write;
  const code = `with open("log.txt", "${mode}", encoding="utf-8") as f:\n    ${writes ? `f.write(${JSON.stringify(NEW).replace(/"/g, "'")})` : "data = f.read()"}`;
  if ((mode === "r" || mode === "r+") && !exists)
    return { before, after: null, error: "FileNotFoundError: [Errno 2] No such file or directory: 'log.txt'", code };
  if (mode === "x" && exists) return { before, after: before, error: "FileExistsError: [Errno 17] File exists: 'log.txt'", code };
  switch (mode) {
    case "r":
      return { before, after: before, returned: `data = ${JSON.stringify(before).replace(/"/g, "'")}`, code };
    case "w":
    case "x":
      return { before, after: NEW, code };
    case "a":
      return { before, after: (before ?? "") + NEW, code };
    case "r+":
      return { before, after: NEW + (before ?? "").slice(NEW.length), code };
  }
}

function FileCard({ title, content, tone }: { title: string; content: string | null; tone?: "new" | "gone" }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 text-[11px] font-bold tracking-wider text-label-3 uppercase">{title}</div>
      <motion.div
        layout
        className="min-h-[108px] rounded-[16px] border p-3 font-mono text-[13px] leading-relaxed"
        style={{
          borderColor: tone === "new" ? "var(--accent)" : "var(--glass-border)",
          background:
            content === null
              ? "repeating-linear-gradient(135deg, transparent 0 8px, color-mix(in oklab, var(--label) 5%, transparent) 8px 16px)"
              : "var(--glass-bg-strong)",
        }}
      >
        {content === null ? (
          <span className="text-label-3">файлу не існує</span>
        ) : content === "" ? (
          <span className="text-label-3">(порожній)</span>
        ) : (
          content.split("\n").slice(0, -1).map((l, i) => (
            <motion.div
              key={`${l}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ color: l.startsWith("NEW") ? "var(--accent-2)" : undefined, fontWeight: l.startsWith("NEW") ? 700 : 400 }}
            >
              {l}
              <span className="text-label-3">\n</span>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

export function OpenModes() {
  const [mode, setMode] = useState<Mode>("w");
  const [exists, setExists] = useState(true);
  const [ran, setRan] = useState(0);

  const r = simulate(mode, exists);
  const info = INFO[mode];
  const shown = ran > 0;

  const flag = (ok: boolean, label: string) => (
    <span className="flex items-center gap-1">
      <span
        className="grid size-4 place-items-center rounded-full"
        style={{ background: ok ? "var(--accent)" : "var(--separator)", color: ok ? "white" : "var(--label-3)" }}
      >
        {ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
      </span>
      {label}
    </span>
  );

  return (
    <div>
      <ControlBar>
        <Segmented
          id="open-mode"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setRan(0);
          }}
          options={(["r", "w", "a", "x", "r+"] as Mode[]).map((m) => ({ value: m, label: <span className="font-mono">&quot;{m}&quot;</span> }))}
        />
        <Segmented
          id="open-exists"
          value={exists ? "yes" : "no"}
          onChange={(v) => {
            setExists(v === "yes");
            setRan(0);
          }}
          options={[
            { value: "yes", label: "файл є" },
            { value: "no", label: "файлу немає" },
          ]}
        />
        <div className="ml-auto">
          <Btn variant="accent" onClick={() => setRan((n) => n + 1)}>
            Виконати ▶
          </Btn>
        </div>
      </ControlBar>

      <div className="flex flex-col gap-3 px-5 pb-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-label-2">
          {flag(info.read, "читання")}
          {flag(info.write, "запис")}
          {flag(info.creates, "створює новий")}
          {flag(info.truncates, "стирає вміст")}
          <span>
            курсор: <b className="text-label">{info.start}</b>
          </span>
        </div>
        <div className="text-[13px] text-label-2">{info.hint}</div>

        <pre className="thin-scroll overflow-x-auto rounded-[14px] bg-black/80 px-3.5 py-2.5 font-mono text-[12.5px] text-[#e5e5ea]">{r.code}</pre>

        <div className="flex flex-col gap-3 sm:flex-row">
          <FileCard title="log.txt до" content={r.before} />
          <div className="grid place-items-center text-2xl text-label-3 sm:pt-6">
            <motion.span animate={{ rotate: shown ? 0 : -90, opacity: shown ? 1 : 0.4 }}>→</motion.span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${exists}-${ran}`}
              className="min-w-0 flex-1"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              animate={{ opacity: shown ? 1 : 0.35, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <FileCard title="log.txt після" content={shown ? r.after : r.before} tone={shown && r.after !== r.before ? "new" : undefined} />
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {shown && (r.error || r.returned) && (
            <motion.div
              key={`msg-${mode}-${exists}-${ran}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-[14px] px-3.5 py-2.5 font-mono text-[12.5px] break-all"
              style={{
                background: r.error
                  ? "color-mix(in oklab, var(--accent-2) 14%, transparent)"
                  : "color-mix(in oklab, var(--accent) 14%, transparent)",
                color: r.error ? "var(--accent-2)" : "var(--label)",
              }}
            >
              {r.error ? `💥 ${r.error}` : r.returned}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
