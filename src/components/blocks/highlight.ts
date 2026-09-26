import "server-only";
import { createHighlighter, type Highlighter } from "shiki";

let hl: Promise<Highlighter> | null = null;

function highlighter() {
  hl ??= createHighlighter({ themes: ["github-light"], langs: ["python", "bash", "text"] });
  return hl;
}

export async function highlightPython(code: string, highlight: number[] = [], lang = "python") {
  const h = await highlighter();
  return h.codeToHtml(code, {
    lang,
    theme: "github-light",
    transformers: [
      {
        line(node, line) {
          if (highlight.includes(line)) this.addClassToHast(node, "hl");
        },
      },
    ],
  });
}
