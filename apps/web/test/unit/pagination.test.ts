import { describe, expect, it } from "vitest";
import { pageHref, pageList } from "@/components/posts-pagination";

describe("pageHref", () => {
  it("puts page 1 at the base path and later pages under page/n/", () => {
    expect(pageHref("/blog/", 1)).toBe("/blog/");
    expect(pageHref("/blog/", 0)).toBe("/blog/");
    expect(pageHref("/category/x/", 3)).toBe("/category/x/page/3/");
  });
});

describe("pageList", () => {
  it("lists every page when there are few", () => {
    expect(pageList(1, 1)).toEqual([1]);
    expect(pageList(2, 3)).toEqual([1, 2, 3]);
  });

  it("shows first, last and current ±1 with gaps", () => {
    expect(pageList(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
    expect(pageList(1, 10)).toEqual([1, 2, null, 10]);
    expect(pageList(10, 10)).toEqual([1, null, 9, 10]);
  });

  it("does not insert a gap between adjacent pages", () => {
    expect(pageList(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});
