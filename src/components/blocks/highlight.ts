import "server-only";
import { createHighlighter, type Highlighter } from "shiki";

let hl: Promise<Highlighter> | null = null;

function highlighter() {
  hl ??= createHighlighter({ themes: ["github-light", "github-dark"], langs: ["python", "bash", "text"] });
  return hl;
}

export async function highlightPython(code: string, highlight: number[] = [], lang = "python") {
  const h = await highlighter();
  return h.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
    transformers: [
      {
        line(node, line) {
          if (highlight.includes(line)) this.addClassToHast(node, "hl");
        },
      },
    ],
  });
}
