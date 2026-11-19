import { describe, expect, it } from "vitest";
import { about, homepage, post, project, techStack } from "@/lib/schemas";

const baseProject = { id: 1, documentId: "p1", title: "Portfolio" };
const basePost = {
  id: 1,
  documentId: "d1",
  title: "Hello",
  slug: "hello",
  publishedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("techStack", () => {
  it.each([
    [
      [
        { id: 1, name: "Go" },
        { id: 2, name: " Cobra " },
      ],
      ["Go", "Cobra"],
    ],
    [[{ name: "" }, { name: null }, {}], []],
    [null, []],
    [undefined, []],
  ])("normalizes %j", (input, expected) => {
    expect(techStack.parse(input)).toEqual(expected);
  });

  it("rejects the removed legacy shapes", () => {
    expect(techStack.safeParse("Go, Cobra").success).toBe(false);
    expect(techStack.safeParse({ 0: "Go" }).success).toBe(false);
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

  it("exposes techStack names as tech", () => {
    const parsed = project.parse({ ...baseProject, techStack: [{ id: 1, name: "Go" }] });
    expect(parsed.tech).toEqual(["Go"]);
    expect(parsed).not.toHaveProperty("techStack");
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

  it("falls back to default labels and empty lists", () => {
    expect(about.parse({ id: 1, documentId: "a", eyebrow: "  ", skillsHeading: null })).toMatchObject({
      eyebrow: "About me",
      nowHeading: "Now",
      skillsHeading: "What I do",
      toolboxHeading: "Toolbox",
      resume: null,
      coverLetter: null,
      skills: [],
      tech: [],
    });
  });

  it("links documents to the uploaded file before the URL", () => {
    const parsed = about.parse({
      id: 1,
      documentId: "a",
      resumeUrl: "https://example.com/cv.pdf",
      resumeLabel: " ",
      coverLetterUrl: "https://example.com/letter.pdf",
      coverLetterLabel: "Letter",
      coverLetterFile: { id: 2, url: "https://cdn.example.com/letter.pdf" },
    });
    expect(parsed.resume).toEqual({ href: "https://example.com/cv.pdf", label: "Résumé" });
    expect(parsed.coverLetter).toEqual({ href: "https://cdn.example.com/letter.pdf", label: "Letter" });
    expect(parsed).not.toHaveProperty("resumeUrl");
  });

  it("drops unnamed skills and tech and normalizes their links and icons", () => {
    const parsed = about.parse({
      id: 1,
      documentId: "a",
      skills: [{ name: "Web", icon: " fa-solid code " }, { name: "" }],
      tech: [{ name: "Go", link: "nope", icon: "" }, { name: null }],
    });
    expect(parsed.skills).toEqual([{ name: "Web", description: null, icon: "fa-solid code" }]);
    expect(parsed.tech).toEqual([{ name: "Go", link: null, icon: null }]);
  });
});

describe("homepage", () => {
  it("defaults the greeting and hides a blank subheading", () => {
    expect(homepage.parse({ id: 1, documentId: "h", heroSubheading: "   " })).toMatchObject({
      heroGreeting: "Hi, I'm",
      heroSubheading: null,
      availability: null,
    });
  });

  it("trims availability", () => {
    expect(homepage.parse({ id: 1, documentId: "h", availability: " Open source " }).availability).toBe(
      "Open source",
    );
  });
});
