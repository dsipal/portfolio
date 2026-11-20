import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/toc";

describe("extractToc", () => {
  it("returns h2/h3 headings, keeping the ids Ghost set", () => {
    const html =
      '<h1 id="title">Title</h1><h2 id="getting-started">Getting started</h2><p>text</p>' +
      '<h3 id="a-sub-heading">A <em>sub</em> heading</h3><h4 id="too-deep">Too deep</h4>';
    expect(extractToc(html)).toEqual([
      { id: "getting-started", text: "Getting started", depth: 2 },
      { id: "a-sub-heading", text: "A sub heading", depth: 3 },
    ]);
  });

  it("generates github-slugger ids for headings without one", () => {
    expect(extractToc("<h2>Using <code>pnpm</code> &amp; Next.js</h2><h2>Using pnpm &amp; Next.js</h2>")).toEqual([
      { id: "using-pnpm--nextjs", text: "Using pnpm & Next.js", depth: 2 },
      { id: "using-pnpm--nextjs-1", text: "Using pnpm & Next.js", depth: 2 },
    ]);
  });

  it("ignores heading-like text inside code blocks", () => {
    const html = '<h2 id="real">Real</h2><pre><code class="language-md">## Not a heading</code></pre>';
    expect(extractToc(html).map((e) => e.text)).toEqual(["Real"]);
  });

  it("handles empty content", () => {
    expect(extractToc(null)).toEqual([]);
    expect(extractToc("")).toEqual([]);
  });
});
