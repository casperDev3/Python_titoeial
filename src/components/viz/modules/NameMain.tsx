"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Btn, ControlBar, Segmented } from "../kit";

type FileId = "tools" | "main";
type Mode = "direct" | "import";

const TOOLS = [
  'print("tools: __name__ =", __name__)',
  "",
  "def cola():",
  '    return "🥤 кола"',
  "",
  'if __name__ == "__main__":',
  '    print("Тест:", cola())',
];
const MAIN = ["import tools", "", 'print("main: __name__ =", __name__)', "print(tools.cola())"];

type Step = {
  file: FileId;
  line: number; // 1-based
  names: Partial<Record<FileId, string>>;
  out: string[];
  skipped?: number[]; // рядки tools.py, які пропущено
  note: string;
};

const STEPS: Record<Mode, Step[]> = {
  direct: [
    { file: "tools", line: 1, names: { tools: "'__main__'" }, out: ["tools: __name__ = __main__"], note: "Запускаємо `python3 tools.py`. Цей файл — головний, тому Python дає йому ім'я `__main__`." },
    { file: "tools", line: 3, names: { tools: "'__main__'" }, out: ["tools: __name__ = __main__"], note: "`def` створює функцію `cola`. Тіло поки не виконується." },
    { file: "tools", line: 6, names: { tools: "'__main__'" }, out: ["tools: __name__ = __main__"], note: "Перевірка: `'__main__' == '__main__'` → `True`. Заходимо всередину блоку." },
    { file: "tools", line: 7, names: { tools: "'__main__'" }, out: ["tools: __name__ = __main__", "Тест: 🥤 кола"], note: "Демо-код виконався. `main.py` взагалі не брав участі — його ніхто не запускав." },
  ],
  import: [
    { file: "main", line: 1, names: { main: "'__main__'" }, out: [], note: "Запускаємо `python3 main.py`. Головний тепер він: `__name__ == '__main__'`. Перший рядок — `import tools`." },
    { file: "tools", line: 1, names: { main: "'__main__'", tools: "'tools'" }, out: ["tools: __name__ = tools"], note: "Python знаходить `tools.py` і виконує його **зверху донизу**. Але тут `__name__` — це вже ім'я модуля: `'tools'`." },
    { file: "tools", line: 3, names: { main: "'__main__'", tools: "'tools'" }, out: ["tools: __name__ = tools"], note: "Створюється функція `cola` — вона стане атрибутом модуля: `tools.cola`." },
    { file: "tools", line: 6, names: { main: "'__main__'", tools: "'tools'" }, out: ["tools: __name__ = tools"], skipped: [7], note: "`'tools' == '__main__'` → `False`. Демо-блок **пропущено** — імпорт не запускає тести модуля." },
    { file: "main", line: 3, names: { main: "'__main__'", tools: "'tools'" }, out: ["tools: __name__ = tools", "main: __name__ = __main__"], skipped: [7], note: "Модуль завантажено й покладено в `sys.modules`. Повертаємось у `main.py`." },
    { file: "main", line: 4, names: { main: "'__main__'", tools: "'tools'" }, out: ["tools: __name__ = tools", "main: __name__ = __main__", "🥤 кола"], skipped: [7], note: "Викликаємо `tools.cola()` — функція з модуля працює, а зайвого виводу немає. Десять мільярдів відсотків чистоти!" },
  ],
};

function Md({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("`") ? (
          <code key={i} className="inline-code">
            {p.slice(1, -1)}
          </code>
        ) : p.startsWith("**") ? (
          <b key={i}>{p.slice(2, -2)}</b>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Pane({
  id, lines, step, mode, dim,
}: {
  id: FileId; lines: string[]; step: Step | null; mode: Mode; dim: boolean;
}) {
  const active = step?.file === id;
  const name = step?.names[id];
  return (
    <motion.div
      animate={{ opacity: dim ? 0.4 : 1, scale: active ? 1 : 0.985 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: active ? "var(--accent)" : "var(--separator)",
        background: "var(--code-bg)",
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-separator px-3 py-1.5 text-[12px]">
        <span className="font-mono font-semibold">{id}.py</span>
        <AnimatePresence mode="wait">
          {name ? (
            <motion.span
              key={name}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-full px-2 py-0.5 font-mono text-[11px] font-bold text-white"
              style={{ background: name === "'__main__'" ? "var(--accent)" : "var(--accent-2)" }}
            >
              __name__ = {name}
            </motion.span>
          ) : (
            <span className="text-[11px] text-label-3">{dim && mode === "direct" ? "не запускається" : id === "main" ? "ще не запущено" : "ще не завантажено"}</span>
          )}
        </AnimatePresence>
      </div>
      <div className="relative py-1.5 font-mono text-[12px] leading-[22px]">
        {lines.map((l, i) => {
          const n = i + 1;
          const isActive = active && step?.line === n;
          const skipped = id === "tools" && step?.skipped?.includes(n);
          return (
            <div key={i} className="relative flex px-3 whitespace-pre">
              {isActive && (
                <motion.div
                  layoutId={`nm-line-${id}`}
                  className="absolute inset-0"
                  style={{ background: "color-mix(in oklab, var(--accent) 22%, transparent)", borderLeft: "3px solid var(--accent)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative mr-3 w-3 text-right text-label-3 select-none">{n}</span>
              <span className={`relative ${skipped ? "line-through opacity-40" : ""}`}>{l || " "}</span>
              {skipped && <span className="relative ml-2 text-[10px] font-sans font-bold text-[#ff9f0a]">пропущено</span>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function NameMain() {
  const [mode, setMode] = useState<Mode>("import");
  const [s, setS] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = STEPS[mode];
  const total = steps.length;
  const step = s > 0 ? steps[s - 1] : null;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (s >= total) setPlaying(false);
      else setS(s + 1);
    }, s >= total ? 0 : 1100);
    return () => clearTimeout(t);
  }, [playing, s, total]);

  const reset = (m: Mode = mode) => {
    setMode(m);
    setS(0);
    setPlaying(false);
  };

  return (
    <div>
      <ControlBar>
        <Segmented
          id="mod-namemain"
          value={mode}
          onChange={(v) => reset(v)}
          options={[
            { value: "import", label: "$ python3 main.py" },
            { value: "direct", label: "$ python3 tools.py" },
          ]}
        />
      </ControlBar>

      <div className="grid gap-3 px-5 md:grid-cols-2">
        <Pane id="main" lines={MAIN} step={step} mode={mode} dim={mode === "direct"} />
        <Pane id="tools" lines={TOOLS} step={step} mode={mode} dim={false} />
      </div>

      <div className="grid gap-2 px-5 pt-3 sm:grid-cols-[1.3fr_1fr]">
        <div className="min-h-[76px] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug" style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)" }}>
          <div className="mb-1 text-[11px] font-bold tracking-wider text-label-3 uppercase">
            Крок {s}/{total}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${mode}-${s}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.16 }}>
              {step ? <Md text={step.note} /> : "Натисни «Крок», щоб запустити програму."}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="min-h-[76px] rounded-2xl bg-black/80 px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-[#e5e5ea]">
          <div className="text-[#636366]">$ python3 {mode === "direct" ? "tools.py" : "main.py"}</div>
          <AnimatePresence initial={false}>
            {(step?.out ?? []).map((l) => (
              <motion.div key={`${mode}-${l}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                {l}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ControlBar>
        <Btn onClick={() => setS((v) => Math.max(0, v - 1))} disabled={s === 0}>
          <ChevronLeft className="size-4" />
        </Btn>
        <Btn variant="accent" onClick={() => setS((v) => Math.min(total, v + 1))} disabled={s === total}>
          Крок <ChevronRight className="size-4" />
        </Btn>
        <Btn
          onClick={() => {
            if (s >= total) setS(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Btn>
        <Btn onClick={() => reset()}>
          <RotateCcw className="size-4" />
        </Btn>
      </ControlBar>
    </div>
  );
}
