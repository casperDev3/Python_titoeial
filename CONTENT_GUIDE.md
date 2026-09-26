# Python Hero Academy — гайд для авторів розділів

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + motion + three / @react-three/fiber / drei + shiki.
Мова сайту — **українська**. Код і ідентифікатори в прикладах — англійською (як прийнято в Python), коментарі в коді — українською.

## Де що лежить

| Шлях | Що це |
| --- | --- |
| `src/content/types.ts` | Контент-модель: `Section`, `Block` (heading, text, code, tip, joke, warning, viz, compare, quiz, table) |
| `src/content/sections/<slug>.ts` | Дані розділу. Метадані (hero, theme, summary…) уже заповнені — **заповнюй `blocks`** |
| `src/components/viz/<slug>/index.tsx` | Мапа візуалізацій розділу `export const viz: Record<string, ComponentType>` — id з блоку `{ type: "viz", id }` |
| `src/components/viz/<slug>/*.tsx` | Компоненти візуалізацій розділу |
| `src/components/viz/kit` | Спільні інструменти: `Scene3D`, `useThemeColors`, `Segmented`, `Btn`, `Slider`, `ControlBar`, `Console` |
| `src/components/blocks/*` | Рендер блоків (не чіпати без потреби) |

**Власність файлів:** автор розділу змінює лише `src/content/sections/<slug>.ts` і `src/components/viz/<slug>/**`. Спільні файли (kit, blocks, types, globals.css, layout) не редагуй — якщо чогось бракує, зроби локальний компонент у своїй папці.

## Inline-розмітка у `md`

`` `code` ``, `**жирний**`, `*курсив*`, `[текст](https://…)`. Абзаци — порожній рядок. Список — рядки з `- `.

## Мінімальний склад розділу

- 6–10 блоків `heading` (підтеми) — структура від простого до складного, покривай **весь базис теми** з `summary`.
- `text` між ними — живе, дружнє пояснення з аналогіями (у тому числі з всесвіту героя розділу).
- ≥ 12 блоків `code` з реальними прикладами. Поле `output` — **точний** вивід (перевір, запустивши `python3`). Приклади з `input()` чи нескінченним циклом — `runnable: false`. Код запускається у браузері через Pyodide (сучасний CPython, є віртуальна ФС, немає мережі/потоків/subprocess).
- ≥ 5 `tip` — справжні лайфхаки (не банальності).
- ≥ 3 `joke` — жарти/репліки героя розділу, пов'язані з темою. Можна і від інших героїв (поле `hero`).
- ≥ 2 `warning` — типові помилки новачків.
- ≥ 1 `compare` — «погано / добре».
- ≥ 3 `quiz` з поясненням.
- ≥ 1 `table` (шпаргалка).
- ≥ 4 блоки `viz`: **мінімум 1–2 тривимірні** (через `Scene3D`) і **мінімум 2 інтерактивні 2D** (SVG/DOM + motion): з кнопками, слайдерами, покроковим виконанням, drag тощо. Кожна візуалізація має реально пояснювати механіку (як працюють посилання, зрізи, хеш-таблиця, стек викликів, MRO…), а не бути прикрасою.

## Правила для візуалізацій

```tsx
// src/components/viz/<slug>/index.tsx
"use client";
import type { ComponentType } from "react";
import { MemoryBoxes } from "./MemoryBoxes";
export const viz: Record<string, ComponentType> = { "memory-boxes": MemoryBoxes };
```

- Файли візуалізацій — `"use client"`. Компонент без пропсів.
- Кольори: у DOM/SVG — `var(--accent)`, `var(--accent-2)`, `var(--label)`, `var(--label-2)`, `var(--separator)`, класи `text-label-2`, `bg-separator` тощо. У three.js — `useThemeColors()` (повертає реальні кольори). Має виглядати добре і в світлій, і в темній темі.
- Стиль Apple / Liquid Glass: заокруглення 12–20px, напівпрозорі «скляні» підкладки (клас `glass`, `pill pill-glass`), м'які spring-анімації (`motion/react`, `type: "spring"`), SF-типографіка (за замовчуванням), без різких кольорів поза темою.
- 3D: тільки через `<Scene3D>` (він сам монтує Canvas при появі у viewport і зупиняє рендер поза ним). Підписи — `<Html>` з drei (DOM) або прості меші. **Без** завантаження зовнішніх моделей/текстур/HDR/шрифтів (жодних мереж), без `<Environment>`, без `<Text>` з drei (тягне шрифт з мережі). Матеріали — `meshPhysicalMaterial` з `transmission`/`roughness` для «скла» або `meshStandardMaterial`. Анімації — `useFrame` без алокацій в кадрі.
- Висота візуалізації 280–460px, адаптивна ширина (працює від 340px). Кнопки керування — `ControlBar` + `Btn`/`Segmented`/`Slider`.
- Жодних нових npm-залежностей.
- Уникай `Math.random()` у рендері (SSR/гідратація) — лише в ефектах/обробниках.

## Перевірка

- `python3` — прогнати кожен приклад і звірити `output`.
- `npx tsc --noEmit` і `npx eslint src/content/sections/<slug>.ts src/components/viz/<slug>` — без помилок.
- **Не запускай** `next build` / `next dev` — паралельно працюють інші автори і спільна тека `.next`.
