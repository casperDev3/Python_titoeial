/** Допоміжні функції, що імітують поведінку рядків Python у браузері. */

/** Символи рядка так, як їх бачить Python (кодові точки, а не UTF-16). */
export const chars = (s: string): string[] => Array.from(s);

const enc = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;

/** Байти UTF-8 одного символу/рядка. */
export function utf8(s: string): number[] {
  if (!enc) return [];
  return Array.from(enc.encode(s));
}

export const hex2 = (b: number) => b.toString(16).padStart(2, "0");
export const bin8 = (b: number) => b.toString(2).padStart(8, "0");

/** Кодова точка у форматі U+XXXX. */
export const uplus = (ch: string) => "U+" + (ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0");

/** repr() рядка в стилі Python (спрощено: лапки, \\, \n, \t). */
export function pyRepr(s: string): string {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = "";
  for (const ch of s) {
    if (ch === "\\") out += "\\\\";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\t") out += "\\t";
    else if (ch === q) out += "\\" + q;
    else out += ch;
  }
  return q + out + q;
}

/** Представлення bytes у стилі Python: b'A' або b'\xd1\x97'. */
export function pyBytes(bytes: number[]): string {
  const hasSq = bytes.includes(0x27);
  const q = hasSq && !bytes.includes(0x22) ? '"' : "'";
  let out = "";
  for (const b of bytes) {
    if (b === 0x5c) out += "\\\\";
    else if (b === q.charCodeAt(0)) out += "\\" + q;
    else if (b >= 0x20 && b < 0x7f) out += String.fromCharCode(b);
    else out += "\\x" + hex2(b);
  }
  return `b${q}${out}${q}`;
}

const isCased = (ch: string) => ch.toLowerCase() !== ch.toUpperCase();

/** Titlecase одного символу: "ß" → "Ss", як у Python. */
const titleChar = (ch: string) => {
  const u = chars(ch.toUpperCase());
  return u[0] + u.slice(1).join("").toLowerCase();
};

/** str.title(): велика літера після будь-якого «нерегістрового» символу. */
export function pyTitle(s: string): string {
  let prevCased = false;
  let out = "";
  for (const ch of s) {
    if (isCased(ch)) {
      out += prevCased ? ch.toLowerCase() : titleChar(ch);
      prevCased = true;
    } else {
      out += ch;
      prevCased = false;
    }
  }
  return out;
}

export function pyCapitalize(s: string): string {
  const cs = chars(s);
  if (!cs.length) return "";
  return titleChar(cs[0]) + cs.slice(1).join("").toLowerCase();
}

export function pySwapcase(s: string): string {
  let out = "";
  for (const ch of s) {
    const u = ch.toUpperCase();
    out += ch === u ? ch.toLowerCase() : u;
  }
  return out;
}

/** Нормалізовані індекси зрізу — точна копія slice.indices() з CPython. */
export function sliceIndices(len: number, start: number | null, stop: number | null, step: number): number[] {
  let lo: number;
  let hi: number;
  if (step > 0) {
    lo = start === null ? 0 : start < 0 ? Math.max(0, start + len) : Math.min(start, len);
    hi = stop === null ? len : stop < 0 ? Math.max(0, stop + len) : Math.min(stop, len);
  } else {
    lo = start === null ? len - 1 : start < 0 ? Math.max(-1, start + len) : Math.min(start, len - 1);
    hi = stop === null ? -1 : stop < 0 ? Math.max(-1, stop + len) : Math.min(stop, len - 1);
  }
  const out: number[] = [];
  if (step > 0) for (let i = lo; i < hi; i += step) out.push(i);
  else for (let i = lo; i > hi; i += step) out.push(i);
  return out;
}
