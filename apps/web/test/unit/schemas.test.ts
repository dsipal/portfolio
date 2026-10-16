import { describe, expect, it } from "vitest";
import { about, post, project, techList } from "@/lib/schemas";

const baseProject = { id: 1, documentId: "p1", title: "Portfolio" };
const basePost = {
  id: 1,
  documentId: "d1",
  title: "Hello",
  slug: "hello",
  publishedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("techList", () => {
  it.each([
    [
      ["NestJS", "TypeScript"],
      ["NestJS", "TypeScript"],
    ],
    [{ 0: "NestJS", 1: "TypeScript" }, ["NestJS", "TypeScript"]],
    ["NestJS, TypeScript ,", ["NestJS", "TypeScript"]],
    [
      [
        { id: 1, name: "Go" },
        { id: 2, name: " Cobra " },
      ],
      ["Go", "Cobra"],
    ],
    [[" ", "", 3, null], []],
    [null, []],
    [undefined, []],
  ])("normalizes %j", (input, expected) => {
    expect(techList.parse(input)).toEqual(expected);
  });
});

describe("project", () => {
  it("fills defaults for missing optional fields", () => {
    expect(project.parse(baseProject)).toMatchObject({
      slug: null,
      image: null,
      tech: [],
      link: null,
      featured: false,
      order: 0,
    });
  });

  it("prefers techStack over the legacy tech field", () => {
    const parsed = project.parse({ ...baseProject, techStack: [{ name: "Go" }], tech: ["Old"] });
    expect(parsed.tech).toEqual(["Go"]);
    expect(project.parse({ ...baseProject, techStack: [], tech: { 0: "Old" } }).tech).toEqual(["Old"]);
  });

  it("keeps valid URLs and drops invalid ones", () => {
    const parsed = project.parse({
      ...baseProject,
      link: "  https://example.com  ",
      repoUrl: "javascript:alert(1)",
    });
    expect(parsed.link).toBe("https://example.com");
    expect(parsed.repoUrl).toBeNull();
    expect(project.parse({ ...baseProject, link: "not a url" }).link).toBeNull();
  });

  it("rejects a project without a title", () => {
    expect(project.safeParse({ ...baseProject, title: "" }).success).toBe(false);
  });
});

describe("post", () => {
  it("accepts the minimal list shape and nulls missing relations", () => {
    expect(post.parse(basePost)).toMatchObject({
      cover: null,
      postHero: null,
      category: null,
      content: null,
    });
  });

  it("rejects posts without a slug or with a malformed cover", () => {
    expect(post.safeParse({ ...basePost, slug: undefined }).success).toBe(false);
    expect(post.safeParse({ ...basePost, cover: { id: 1 } }).success).toBe(false);
  });
});

describe("about", () => {
  it("normalizes social links", () => {
    const parsed = about.parse({ id: 1, documentId: "a", github: "https://github.com/x", linkedIn: "" });
    expect(parsed.github).toBe("https://github.com/x");
    expect(parsed.linkedIn).toBeNull();
    expect(parsed.currentPosition).toBeNull();
  });
});
