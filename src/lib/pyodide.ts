"use client";

/** Ледаче завантаження Pyodide (CPython у WebAssembly) з CDN — тільки при першому «Запустити». */

const VERSION = "v314.0.7";
const BASE = `https://cdn.jsdelivr.net/pyodide/${VERSION}/full/`;

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (o: { batched: (s: string) => void }) => void;
  setStderr: (o: { batched: (s: string) => void }) => void;
  setStdin: (o: { stdin: () => string | null }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (o: { indexURL: string }) => Promise<Pyodide>;
  }
}

let loading: Promise<Pyodide> | null = null;

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => res();
    s.onerror = () => rej(new Error("Не вдалося завантажити Pyodide"));
    document.head.appendChild(s);
  });
}

export function getPyodide() {
  loading ??= (async () => {
    if (!window.loadPyodide) await loadScript(BASE + "pyodide.js");
    return window.loadPyodide!({ indexURL: BASE });
  })();
  loading.catch(() => (loading = null));
  return loading;
}

/** Виконує код в ізольованому неймспейсі й повертає весь stdout/stderr. */
export async function runPython(code: string): Promise<{ out: string; error?: string }> {
  const py = await getPyodide();
  let out = "";
  py.setStdout({ batched: (s) => (out += s + "\n") });
  py.setStderr({ batched: (s) => (out += s + "\n") });
  // input() у браузері: повертаємо відповідь з prompt()
  py.setStdin({ stdin: () => window.prompt("input():") ?? "" });
  try {
    const wrapped = `__ns = {"__name__": "__main__"}\nexec(compile(${JSON.stringify(code)}, "main.py", "exec"), __ns)`;
    await py.runPythonAsync(wrapped);
    return { out: out.trimEnd() };
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    // Прибираємо внутрішні кадри Pyodide з traceback
    const lines = msg.split("\n");
    const i = lines.findIndex((l) => l.includes('File "main.py"'));
    const tb = i >= 0 ? ["Traceback (most recent call last):", ...lines.slice(i)].join("\n") : msg;
    return { out: out.trimEnd(), error: tb.trimEnd() };
  }
}
