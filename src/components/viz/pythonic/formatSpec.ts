/**
 * Міні-реалізація Python format spec для лабораторії f-string:
 * [[fill]align][width][grouping][.precision][type].
 * Покриває підмножину, яку показує візуалізація, і повертає ті самі
 * повідомлення ValueError, що й CPython.
 */

export type FmtValue = { kind: "float" | "int" | "str"; v: number | string };
export type Spec = {
  fill: string; // "" = за замовчуванням (пробіл)
  align: "" | "<" | ">" | "^";
  width: number; // 0 = без ширини
  group: "" | "," | "_";
  precision: number; // -1 = без точності
  type: string; // "" | f | e | % | d | b | x | s
};

export function specString(s: Spec): string {
  let out = "";
  if (s.align) out += s.fill + s.align;
  if (s.width > 0) out += String(s.width);
  out += s.group;
  if (s.precision >= 0) out += "." + s.precision;
  out += s.type;
  return out;
}

const pyExp = (s: string) =>
  s.replace(/e([+-])(\d+)$/, (_, sign: string, d: string) => `e${sign}${d.padStart(2, "0")}`);

function groupInt(digits: string, sep: string, every: number): string {
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    const left = digits.length - i;
    out += digits[i];
    if (left > 1 && (left - 1) % every === 0) out += sep;
  }
  return out;
}

/** Групування цілої частини рядка числа (з можливим знаком, дробовою частиною, експонентою). */
function applyGroup(num: string, sep: string, every = 3): string {
  if (!sep) return num;
  const m = /^(-?)([0-9a-f]+)(.*)$/.exec(num);
  if (!m) return num;
  return m[1] + groupInt(m[2], sep, every) + m[3];
}

/** Python-подібне «загальне» форматування (тип за замовчуванням з точністю). */
function general(x: number, p: number): string {
  const prec = Math.max(1, p);
  if (x === 0) return "0.0";
  const sci = x.toExponential(prec - 1);
  const exp = Number(sci.split("e")[1]);
  if (exp < -4 || exp >= prec - 1) {
    const e = sci.split("e")[1];
    let mant = sci.split("e")[0];
    if (mant.includes(".")) mant = mant.replace(/0+$/, "").replace(/\.$/, "");
    return pyExp(`${mant}e${e}`);
  }
  let fixed = x.toFixed(Math.max(0, prec - 1 - exp));
  if (fixed.includes(".")) fixed = fixed.replace(/0+$/, "");
  if (fixed.endsWith(".")) fixed += "0";
  if (!fixed.includes(".")) fixed += ".0";
  return fixed;
}

function reprFloat(x: number): string {
  if (Number.isInteger(x) && Math.abs(x) < 1e16) return x.toFixed(1);
  return pyExp(String(x));
}

export type FmtResult = { ok: true; text: string; core: [number, number] } | { ok: false; error: string };

export function pyFormat(val: FmtValue, s: Spec): FmtResult {
  let body: string;
  const t = s.type;

  if (val.kind === "str") {
    if (t && t !== "s") return { ok: false, error: `ValueError: Unknown format code '${t}' for object of type 'str'` };
    if (s.group) return { ok: false, error: `ValueError: Cannot specify '${s.group}' with 's'.` };
    const str = String(val.v);
    body = s.precision >= 0 ? str.slice(0, s.precision) : str;
  } else {
    const x = Number(val.v);
    const intLike = val.kind === "int" && (t === "" || t === "d" || t === "b" || t === "x");
    if (intLike) {
      if ((t === "b" || t === "x") && s.group === ",") return { ok: false, error: `ValueError: Cannot specify ',' with '${t}'.` };
      if (s.precision >= 0) return { ok: false, error: "ValueError: Precision not allowed in integer format specifier" };
      const neg = x < 0 ? "-" : "";
      const abs = Math.abs(x);
      const digits = t === "b" ? abs.toString(2) : t === "x" ? abs.toString(16) : String(abs);
      body = neg + groupInt(digits, s.group, t === "b" || t === "x" ? 4 : 3);
    } else if (val.kind === "float" && (t === "d" || t === "b" || t === "x")) {
      return { ok: false, error: `ValueError: Unknown format code '${t}' for object of type 'float'` };
    } else {
      const p = s.precision >= 0 ? s.precision : 6;
      if (t === "f") body = applyGroup(x.toFixed(p), s.group);
      else if (t === "e") body = applyGroup(pyExp(x.toExponential(p)), s.group);
      else if (t === "%") body = applyGroup((x * 100).toFixed(p), s.group) + "%";
      else body = applyGroup(s.precision >= 0 ? general(x, s.precision) : reprFloat(x), s.group);
    }
  }

  const align = s.align || (val.kind === "str" ? "<" : ">");
  const fill = s.fill || " ";
  const pad = Math.max(0, s.width - [...body].length);
  let left = 0;
  if (align === ">") left = pad;
  else if (align === "^") left = Math.floor(pad / 2);
  const right = pad - left;
  const text = fill.repeat(left) + body + fill.repeat(right);
  return { ok: true, text, core: [left, left + [...body].length] };
}
