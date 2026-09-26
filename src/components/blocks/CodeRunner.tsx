"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Loader2, Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { runPython } from "@/lib/pyodide";

/** Панель інструментів коду: копіювати + запустити в браузері через Pyodide. */
export function CodeToolbar({ code, runnable }: { code: string; runnable: boolean }) {
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<{ out: string; error?: string } | null>(null);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const run = async () => {
    setState("loading");
    const r = await runPython(code).catch((e) => ({ out: "", error: String(e) }));
    setResult(r);
    setState("done");
  };

  return (
    <>
      <div className="absolute top-2.5 right-2.5 flex gap-1.5">
        <button onClick={copy} className="pill pill-glass !px-2.5 !py-1.5 text-xs" aria-label="Копіювати">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
        {runnable && (
          <button onClick={run} disabled={state === "loading"} className="pill pill-accent !px-3 !py-1.5 text-xs">
            {state === "loading" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : state === "done" ? (
              <RotateCcw className="size-3.5" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
            {state === "loading" ? "Запуск…" : "Запустити"}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="overflow-hidden border-t border-separator"
          >
            <div className="px-4 pt-2.5 text-[11px] font-semibold tracking-wider text-label-3 uppercase">
              Результат виконання
            </div>
            <pre className="thin-scroll overflow-x-auto px-4 pt-1 pb-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
              {result.out || (!result.error && <span className="text-label-3">(нічого не виведено)</span>)}
              {result.error && <span className="text-[#ff453a]">{(result.out ? "\n" : "") + result.error}</span>}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
