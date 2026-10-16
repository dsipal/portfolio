import GithubSlugger from "github-slugger";

export type TocEntry = { id: string; text: string; depth: 2 | 3 };

/**
 * h2/h3 headings from Markdown, with the same ids rehype-slug will assign
 * (both use github-slugger, in document order).
 */
export function extractToc(markdown: string | null | undefined): TocEntry[] {
  if (!markdown) return [];
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2]
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/images → text
      .replace(/[*_`~]/g, "")
      .trim();
    const id = slugger.slug(text); // slug every heading so later ids match
    const depth = match[1].length;
    if (depth === 2 || depth === 3) entries.push({ id, text, depth });
  }
  return entries;
}
