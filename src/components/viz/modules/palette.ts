/** Кольори для світлої теми: суцільні заливки й тонування на білому, без градієнтів. */
/** Затемнений акцент — для тексту й заливок під білим текстом (контраст на білому). */
export const INK = "color-mix(in oklab, var(--accent) 58%, black)";
/** Затемнений другий акцент */
export const A2_INK = "color-mix(in oklab, var(--accent-2) 58%, black)";
/** Світла тонована підкладка з акцентом */
export const tint = (pct: number, v = "--accent") => `color-mix(in oklab, var(${v}) ${pct}%, white)`;
/** Світла консоль / панель коду */
export const CONSOLE_BG = "color-mix(in oklab, var(--accent) 4%, white)";
export const GREEN = "#248a3d";
export const RED = "#d70015";
export const ORANGE = "#c45500";
/** Нейтральний сірий для неактивних 3D-об'єктів */
export const MUTED = "#aeaeb2";
