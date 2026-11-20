import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/toc";

describe("extractToc", () => {
  it("returns h2/h3 headings with github-slugger ids", () => {
    const md = "# Title\n\n## Getting started\n\ntext\n\n### A *sub* heading\n\n#### Too deep\n";
    expect(extractToc(md)).toEqual([
      { id: "getting-started", text: "Getting started", depth: 2 },
      { id: "a-sub-heading", text: "A sub heading", depth: 3 },
    ]);
  });

  it("skips headings inside code fences", () => {
    const md = "## Real\n\n```md\n## Not a heading\n```\n\n~~~\n### Also not\n~~~\n";
    expect(extractToc(md).map((e) => e.text)).toEqual(["Real"]);
  });

  it("de-duplicates ids the same way rehype-slug does, counting skipped levels", () => {
    const md = "# Setup\n\n## Setup\n\n## Setup\n";
    expect(extractToc(md).map((e) => e.id)).toEqual(["setup-1", "setup-2"]);
  });

  it("strips links and inline code from heading text", () => {
    expect(extractToc("## Using [Next.js](https://nextjs.org) with `pnpm`")[0]).toEqual({
      id: "using-nextjs-with-pnpm",
      text: "Using Next.js with pnpm",
      depth: 2,
    });
  });

  it("handles empty content", () => {
    expect(extractToc(null)).toEqual([]);
    expect(extractToc("")).toEqual([]);
  });
});
