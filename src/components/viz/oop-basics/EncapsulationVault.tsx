"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Lock, LockOpen, ShieldAlert } from "lucide-react";
import { ControlBar, Segmented } from "../kit";
import { CodePane, Label, SPRING } from "./shared";

type Where = "inside" | "outside" | "child";
type Attr = "name" | "_firmware" | "__code" | "_Suit__code";
type Tone = "ok" | "warn" | "bad";

const DRAWERS: { key: string; value: string; kind: "public" | "protected" | "private" }[] = [
  { key: "name", value: '"Mark L"', kind: "public" },
  { key: "_firmware", value: '"v7.2"', kind: "protected" },
  { key: "_Suit__code", value: '"PEPPER"', kind: "private" },
];

const CODE: Record<Where, string[]> = {
  inside: [
    "class Suit:",
    "    def __init__(self):",
    '        self.name = "Mark L"',
    '        self._firmware = "v7.2"',
    '        self.__code = "PEPPER"',
    "",
    "    def check(self):",
    "        return self.ATTR",
  ],
  outside: [
    "class Suit:",
    "    ...  # як ліворуч",
    "",
    "mark = Suit()",
    "print(mark.ATTR)",
  ],
  child: [
    "class Suit:",
    "    ...  # як ліворуч",
    "",
    "class MarkII(Suit):",
    "    def hack(self):",
    "        return self.ATTR",
  ],
};
const ACTIVE_LINE: Record<Where, number> = { inside: 7, outside: 4, child: 5 };

function resolve(where: Where, attr: Attr): { real: string; tone: Tone; result: string; note: string } {
  const cls = where === "child" ? "MarkII" : "Suit";
  const obj = where === "outside" ? "mark" : "self";
  const mangled = attr === "__code" && where !== "outside";
  const real = mangled ? `_${cls}__code` : attr;
  const found = DRAWERS.find((d) => d.key === real);
  if (!found) {
    const tname = where === "child" ? "MarkII" : "Suit";
    return {
      real,
      tone: "bad",
      result: `AttributeError: '${tname}' object has no attribute '${real}'`,
      note:
        where === "outside"
          ? "Поза тілом класу mangling не відбувається: Python шукає буквально `__code`, а в об'єкті лежить `_Suit__code`."
          : "Усередині `MarkII` ім'я перетворилось на `_MarkII__code`, а атрибут створював `Suit` під ім'ям `_Suit__code`. Ось навіщо `__`: нащадок не може випадково зачепити «приватне» поле батька.",
    };
  }
  if (attr === "_Suit__code")
    return {
      real, tone: where === "inside" ? "ok" : "warn", result: found.value,
      note: "Спрацювало — mangling лише перейменовує, а не шифрує. Але писати так — як зламати сейф Старка ломом: можна, та соромно.",
    };
  if (attr === "_firmware")
    return {
      real, tone: where === "outside" ? "warn" : "ok", result: found.value,
      note:
        where === "outside"
          ? "Доступ є, але `_` — це табличка «не чіпай, внутрішнє». Лінтер і колеги насварять, а в новій версії класу цього атрибута може вже не бути."
          : "Одне підкреслення — «для своїх»: сам клас і нащадки користуються ним вільно.",
    };
  if (attr === "__code")
    return {
      real, tone: "ok", result: found.value,
      note: "Усередині класу `Suit` Python непомітно переписує `self.__code` на `self._Suit__code` — тож усе знаходиться.",
    };
  return { real, tone: "ok", result: found.value, note: `Публічний атрибут: \`${obj}.name\` можна читати звідусіль.` };
}

const TONE: Record<Tone, { col: string; icon: typeof Lock; label: string }> = {
  ok: { col: "#15803d", icon: LockOpen, label: "доступ є" },
  warn: { col: "#b45309", icon: ShieldAlert, label: "працює, але…" },
  bad: { col: "#dc2626", icon: Lock, label: "помилка" },
};

function md(s: string) {
  return s.split(/(`[^`]+`)/g).map((p, i) =>
    p.startsWith("`") ? <code key={i} className="inline-code">{p.slice(1, -1)}</code> : <span key={i}>{p}</span>,
  );
}

export function EncapsulationVault() {
  const [where, setWhere] = useState<Where>("outside");
  const [attr, setAttr] = useState<Attr>("__code");
  const r = resolve(where, attr);
  const obj = where === "outside" ? "mark" : "self";
  const T = TONE[r.tone];
  const Icon = T.icon;
  const lines = CODE[where].map((l) => l.replace("ATTR", attr));

  return (
    <div>
      <ControlBar>
        <Segmented
          id="oopb-vault-where"
          value={where}
          onChange={setWhere}
          options={[
            { value: "inside", label: "у класі Suit" },
            { value: "outside", label: "ззовні" },
            { value: "child", label: "у нащадку" },
          ]}
        />
      </ControlBar>
      <div className="flex flex-wrap gap-1.5 px-5 pb-3">
        {(["name", "_firmware", "__code", "_Suit__code"] as Attr[]).map((a) => (
          <button
            key={a}
            onClick={() => setAttr(a)}
            className="relative rounded-xl border border-separator px-2.5 py-1.5 font-mono text-[12px] font-semibold"
          >
            {attr === a && (
              <motion.span
                layoutId="oopb-vault-attr"
                className="absolute inset-0 rounded-xl"
                style={{ background: "color-mix(in oklab, var(--accent) 12%, white)", boxShadow: "inset 0 0 0 1.5px var(--accent)" }}
                transition={SPRING}
              />
            )}
            <span className="relative">
              {obj}.{a}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 px-5 md:grid-cols-2">
        <div className="min-w-0">
          <Label>Код</Label>
          <CodePane id="oopb-vault-hl" lines={lines} active={ACTIVE_LINE[where]} />
          <div className="mt-3">
            <Label>Що бачить Python</Label>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[12.5px]">
              <span className="rounded-lg border border-separator px-2 py-1">
                {obj}.{attr}
              </span>
              <motion.span key={`${where}${attr}`} initial={{ x: -6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-label-3">
                →
              </motion.span>
              <motion.span
                key={r.real + where}
                initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ ...SPRING, delay: 0.1 }}
                className="rounded-lg px-2 py-1 font-semibold"
                style={{
                  background: r.real !== attr ? "color-mix(in oklab, var(--accent-2) 20%, white)" : "transparent",
                  border: "1px solid color-mix(in oklab, var(--accent-2) 45%, transparent)",
                }}
              >
                {obj}.{r.real}
              </motion.span>
              {r.real !== attr && <span className="font-sans text-[11px] text-label-2">name mangling</span>}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <Label>Сейф: mark.__dict__</Label>
          <div
            className="relative overflow-hidden rounded-[20px] border p-2.5"
            style={{
              borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
              background: "color-mix(in oklab, var(--accent) 6%, white)",
            }}
          >
            <div className="space-y-1.5">
              {DRAWERS.map((d) => {
                const hit = d.key === r.real;
                const DIcon = d.kind === "private" ? Lock : d.kind === "protected" ? ShieldAlert : LockOpen;
                return (
                  <motion.div
                    key={d.key}
                    animate={{ x: hit ? 10 : 0, scale: hit ? 1.02 : 1 }}
                    transition={SPRING}
                    className="flex items-center gap-2 rounded-xl border border-separator bg-elevated/80 px-2.5 py-2 font-mono text-[12px]"
                    style={hit ? { boxShadow: `0 0 0 2px ${T.col}, 0 8px 24px -10px ${T.col}` } : undefined}
                  >
                    <DIcon className="size-3.5 shrink-0 text-label-2" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{d.key}</span>
                    <span className="truncate text-label-2">{d.value}</span>
                  </motion.div>
                );
              })}
              <AnimatePresence>
                {r.tone === "bad" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: [20, -6, 4, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="flex items-center gap-2 rounded-xl border border-dashed px-2.5 py-2 font-mono text-[12px]"
                    style={{ borderColor: "#dc2626", color: "#b42318" }}
                  >
                    <Lock className="size-3.5" strokeWidth={1.75} /> {r.real} — такої шухляди немає
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${where}-${attr}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mx-5 mt-3 mb-4 rounded-2xl border p-3"
          style={{ borderColor: `color-mix(in oklab, ${T.col} 45%, transparent)`, background: `color-mix(in oklab, ${T.col} 7%, white)` }}
        >
          <div className="flex items-center gap-2 font-mono text-[12.5px] font-semibold" style={{ color: T.col }}>
            <Icon className="size-4" strokeWidth={1.75} /> {T.label}: <span className="break-all">{r.result}</span>
          </div>
          <p className="mt-1.5 text-[13.5px] leading-snug">{md(r.note)}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
