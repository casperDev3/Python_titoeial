/** Мінімальний двійник Python format(value, spec) для конструктора специфікації. */
import { chars } from "./util";

export type Kind = "int" | "float" | "str";
export type Value = { id: string; lit: string; kind: Kind; num: number; str: string };

export const VALUES: Value[] = [
  { id: "pi", lit: "3.14159", kind: "float", num: 3.14159, str: "" },
  { id: "big", lit: "1234567.891", kind: "float", num: 1234567.891, str: "" },
  { id: "ratio", lit: "0.8567", kind: "float", num: 0.8567, str: "" },
  { id: "int", lit: "255", kind: "int", num: 255, str: "" },
  { id: "neg", lit: "-7", kind: "int", num: -7, str: "" },
  { id: "str", lit: '"Мун"', kind: "str", num: 0, str: "Мун" },
];

export type Align = "" | "<" | "^" | ">";
export type Group = "" | "," | "_";
export type Type = "" | "f" | "%" | "e" | "d" | "b" | "x";


function groupDigits(intPart: string, sep: string, size: number): string {
  const neg = intPart.startsWith("-");
  const digits = neg ? intPart.slice(1) : intPart;
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    const fromRight = digits.length - i;
    out += digits[i];
    if (fromRight > 1 && (fromRight - 1) % size === 0) out += sep;
  }
  return (neg ? "-" : "") + out;
}

function groupNumber(s: string, sep: string, size = 3): string {
  const m = s.match(/^(-?\d+)(.*)$/);
  if (!m) return s;
  return groupDigits(m[1], sep, size) + m[2];
}

/** Мінімальний двійник format(value, spec) для обраних варіантів. */
export function formatCore(v: Value, group: Group, prec: number | null, type: Type): { ok: true; text: string } | { ok: false; err: string } {
  const typeName = v.kind === "str" ? "str" : v.kind;
  if (group === "," && (type === "b" || type === "x"))
    return { ok: false, err: `ValueError: Cannot specify ',' with '${type}'.` };
  if (v.kind === "str") {
    if (type) return { ok: false, err: `ValueError: Unknown format code '${type}' for object of type 'str'` };
    if (group) return { ok: false, err: `ValueError: Cannot specify '${group}' with 's'.` };
    const cs = chars(v.str);
    return { ok: true, text: prec === null ? v.str : cs.slice(0, prec).join("") };
  }
  if ((type === "d" || type === "b" || type === "x") && v.kind === "float")
    return { ok: false, err: `ValueError: Unknown format code '${type}' for object of type '${typeName}'` };
  if (v.kind === "int" && prec !== null && (type === "" || type === "d" || type === "b" || type === "x"))
    return { ok: false, err: "ValueError: Precision not allowed in integer format specifier" };

  const x = v.num;
  let text: string;
  switch (type) {
    case "f":
      text = x.toFixed(prec ?? 6);
      break;
    case "%":
      text = (x * 100).toFixed(prec ?? 6);
      break;
    case "e": {
      const t = x.toExponential(prec ?? 6);
      text = t.replace(/e([+-])(\d)$/, "e$10$2");
      break;
    }
    case "b":
      text = (x < 0 ? "-" : "") + Math.abs(x).toString(2);
      break;
    case "x":
      text = (x < 0 ? "-" : "") + Math.abs(x).toString(16);
      break;
    default:
      text = v.kind === "float" && prec !== null ? generalFormat(x, prec) : String(x);
  }
  if (group) {
    if (type === "b" || type === "x") text = groupNumber(text, group, 4);
    else if (type !== "e") text = groupNumber(text, group, 3);
  }
  if (type === "%") text += "%";
  return { ok: true, text };
}


/** Тип «без типу» для float з точністю: як 'g', але з правилами Python для None-типу. */
function generalFormat(x: number, prec: number): string {
  const p = prec === 0 ? 1 : prec;
  const sci = x.toExponential(p - 1);
  const exp = Number(sci.split("e")[1]);
  if (exp >= -4 && exp < p - 1) {
    let t = x.toFixed(Math.max(0, p - 1 - exp));
    if (t.includes(".")) t = t.replace(/0+$/, "").replace(/\.$/, ".0");
    return t;
  }
  const [rawMant, e] = sci.split("e");
  const mant = rawMant.includes(".") ? rawMant.replace(/0+$/, "").replace(/\.$/, "") : rawMant;
  const sign = e[0] === "-" ? "-" : "+";
  const digits = e.replace(/^[+-]/, "").padStart(2, "0");
  return `${mant}e${sign}${digits}`;
}

/** Повний результат: основний текст + заповнення до ширини. */
export function formatFull(v: Value, fill: string, align: Align, width: number, group: Group, prec: number | null, type: Type) {
  const core = formatCore(v, group, prec, type);
  if (!core.ok) return core;
  const cs = chars(core.text);
  const padN = Math.max(0, width - cs.length);
  const eff: Align = align || (v.kind === "str" ? "<" : ">");
  const padChar = align ? fill : " ";
  const left = eff === ">" ? padN : eff === "^" ? Math.floor(padN / 2) : 0;
  const right = padN - left;
  return {
    ok: true as const,
    text: core.text,
    cells: [
      ...Array.from({ length: left }, () => ({ ch: padChar, pad: true })),
      ...cs.map((ch) => ({ ch, pad: false })),
      ...Array.from({ length: right }, () => ({ ch: padChar, pad: true })),
    ],
  };
}
