/**
 * Валідатор блок-схем: node --experimental-strip-types scripts/check-flows.mts [slug...]
 * Перевіряє унікальність id і клітинок сітки, що ребра посилаються на існуючі вузли,
 * і що кожен крок сценарію йде по існуючому ребру.
 */
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

type Any = Record<string, any>;
const dir = path.resolve("src/content/sections");
const only = process.argv.slice(2);
let errors = 0;
let total = 0;

for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
  const slug = f.replace(/\.ts$/, "");
  if (only.length && !only.includes(slug)) continue;
  const mod = await import(pathToFileURL(path.join(dir, f)).href);
  const s: Any = mod.default;
  const flows = s.blocks.filter((b: Any) => b.type === "flow");
  total += flows.length;
  for (const fl of flows) {
    const err = (m: string) => {
      errors++;
      console.log(`✗ ${slug} / «${fl.title}»: ${m}`);
    };
    const ids = new Set<string>();
    const cells = new Set<string>();
    for (const n of fl.nodes) {
      if (ids.has(n.id)) err(`дубль id ${n.id}`);
      ids.add(n.id);
      const c = `${n.col},${n.row}`;
      if (cells.has(c)) err(`два вузли в клітинці ${c}`);
      cells.add(c);
      for (const l of n.label.split("\n")) if ([...l].length > 24) err(`задовгий рядок (${[...l].length}): "${l}"`);
      if (n.label.split("\n").length > 3) err(`більше 3 рядків у "${n.id}"`);
    }
    const edgeSet = new Set<string>();
    for (const e of fl.edges) {
      if (!ids.has(e.from) || !ids.has(e.to)) err(`ребро ${e.from}->${e.to} на неіснуючий вузол`);
      edgeSet.add(`${e.from}->${e.to}`);
    }
    for (const sc of fl.scenarios ?? []) {
      sc.steps.forEach((st: Any, i: number) => {
        if (!ids.has(st.node)) err(`сценарій «${sc.name}»: немає вузла ${st.node}`);
        if (i > 0 && !edgeSet.has(`${sc.steps[i - 1].node}->${st.node}`))
          err(`сценарій «${sc.name}»: немає ребра ${sc.steps[i - 1].node}->${st.node}`);
      });
    }
  }
  console.log(`${slug}: ${flows.length} блок-схем`);
}
console.log(errors ? `\n${errors} помилок у ${total} схемах` : `\nOK: ${total} схем без помилок`);
process.exit(errors ? 1 : 0);
