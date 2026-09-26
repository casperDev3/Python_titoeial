/**
 * Контент-модель уроку. Кожен розділ — це дані (Section), а сторінка
 * рендерить їх через BlockRenderer. Візуалізації — окремі React-компоненти,
 * що підключаються за id через VizSlot.
 */

export type SectionTheme = {
  /** Основний акцент (hex), наприклад "#ff7a1a" */
  accent: string;
  /** Другий колір градієнта (hex) */
  accent2: string;
  /** Колір світіння фону (hex) */
  glow: string;
};

export type Hero = {
  /** Ім'я героя, наприклад "Наруто Узумакі" */
  name: string;
  /** Звідки герой: "Naruto", "Marvel", ... */
  universe: string;
  /** Одне емодзі-«аватар» героя */
  emoji: string;
  /** Коротка фраза героя, яка пов'язує його з темою */
  quote: string;
  /** Чому саме цей герой символізує тему (1–2 речення) */
  why: string;
};

/**
 * Inline-розмітка для text-полів: `code`, **жирний**, *курсив*,
 * [посилання](https://...). Абзаци розділяються порожнім рядком,
 * списки — рядки, що починаються з "- ".
 */
export type Inline = string;

export type Block =
  | { type: "heading"; text: string; id?: string }
  | { type: "text"; md: Inline }
  | {
      type: "code";
      code: string;
      title?: string;
      /** Очікуваний вивід (показується під кодом) */
      output?: string;
      /** Чи показувати кнопку «Запустити» (Pyodide у браузері). За замовчуванням true */
      runnable?: boolean;
      /** Номери рядків для підсвічування (1-based) */
      highlight?: number[];
    }
  | { type: "tip"; title?: string; md: Inline } // лайфхак
  | { type: "joke"; md: Inline; hero?: string } // жарт від героя
  | { type: "warning"; title?: string; md: Inline } // типова помилка
  | { type: "viz"; id: string; title: string; caption?: Inline }
  | {
      type: "compare";
      title?: string;
      bad: { label?: string; code: string };
      good: { label?: string; code: string };
      note?: Inline;
    }
  | {
      type: "quiz";
      question: Inline;
      options: string[];
      answer: number; // індекс правильної відповіді
      explain: Inline;
    }
  | {
      type: "table";
      head: string[];
      rows: Inline[][];
    };

export type Section = {
  slug: string;
  /** Порядковий номер у курсі, 1..N */
  order: number;
  title: string;
  /** Короткий підзаголовок для сайдбару */
  short: string;
  /** Емодзі-іконка розділу */
  icon: string;
  /** Група в сайдбарі */
  group: "Старт" | "Основи" | "Колекції" | "Функції" | "Надійність" | "ООП" | "Просунуто";
  /** 1–2 речення: про що розділ */
  summary: string;
  hero: Hero;
  theme: SectionTheme;
  /** Хвилин на читання */
  minutes: number;
  blocks: Block[];
};
