/** Спрощене дерево вбудованих винятків Python (реальні зв'язки спадкування). */
export type ExcNode = { name: string; parent: string | null; note: string };

export const EXCEPTIONS: ExcNode[] = [
  { name: "BaseException", parent: null, note: "корінь усього; не лови його без потреби" },
  { name: "SystemExit", parent: "BaseException", note: "sys.exit() — програма хоче завершитись" },
  { name: "KeyboardInterrupt", parent: "BaseException", note: "користувач натиснув Ctrl+C" },
  { name: "Exception", parent: "BaseException", note: "батько майже всіх «звичайних» помилок" },
  { name: "ArithmeticError", parent: "Exception", note: "помилки арифметики" },
  { name: "ZeroDivisionError", parent: "ArithmeticError", note: "1 / 0" },
  { name: "LookupError", parent: "Exception", note: "не знайдено за ключем чи індексом" },
  { name: "IndexError", parent: "LookupError", note: "[1, 2][5]" },
  { name: "KeyError", parent: "LookupError", note: "{}['hp']" },
  { name: "ValueError", parent: "Exception", note: "int('abc')" },
  { name: "TypeError", parent: "Exception", note: "'5' + 5" },
  { name: "OSError", parent: "Exception", note: "проблеми ОС: файли, мережа" },
  { name: "FileNotFoundError", parent: "OSError", note: "open('nope.txt')" },
  { name: "PermissionError", parent: "OSError", note: "немає прав доступу" },
];

const byName = new Map(EXCEPTIONS.map((e) => [e.name, e]));

/** Чи є `cls` тим самим класом або нащадком `base` (аналог issubclass). */
export function isSubclass(cls: string, base: string): boolean {
  let cur: string | null = cls;
  while (cur) {
    if (cur === base) return true;
    cur = byName.get(cur)?.parent ?? null;
  }
  return false;
}

/** Ланцюжок предків від класу до кореня (аналог __mro__ без object). */
export function mro(cls: string): string[] {
  const out: string[] = [];
  let cur: string | null = cls;
  while (cur) {
    out.push(cur);
    cur = byName.get(cur)?.parent ?? null;
  }
  return out;
}
