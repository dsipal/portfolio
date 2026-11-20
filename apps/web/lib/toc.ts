import type { Element, Root, RootContent } from "hast";
import { toString } from "hast-util-to-string";
import rehypeSlug from "rehype-slug";
import { parseHtmlSync } from "./html";

export type TocEntry = { id: string; text: string; depth: 2 | 3 };

/**
 * h2/h3 headings from a Ghost HTML body. The ids come from rehype-slug, the
 * same plugin the renderer runs, so they always match: ids Ghost already set
 * are kept, missing ones are generated with github-slugger.
 */
export function extractToc(html: string | null | undefined): TocEntry[] {
  if (!html) return [];
  const entries: TocEntry[] = [];

  const walk = (nodes: (Root | RootContent)[]) => {
    for (const node of nodes) {
      if (node.type !== "element" && node.type !== "root") continue;
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        const id = (node as Element).properties.id;
        const text = toString(node).replace(/\s+/g, " ").trim();
        if (typeof id === "string" && text) entries.push({ id, text, depth: node.tagName === "h2" ? 2 : 3 });
        continue;
      }
      walk(node.children);
    }
  };
  walk([parseHtmlSync(html, [rehypeSlug])]);
  return entries;
}
