import { describe, expect, it, vi } from "vitest";
import { about, category, global, homepage, nameList, post, project, readPageData } from "@/lib/schemas";

const basePost = {
  id: "p1",
  title: "Hello",
  slug: "hello",
  published_at: "2026-01-01T00:00:00.000Z",
};
const basePage = { id: "pg", title: "Portfolio", slug: "portfolio" };
const withData = (data: unknown, extra: object = {}) => ({
  ...basePage,
  codeinjection_head: typeof data === "string" ? data : JSON.stringify(data),
  ...extra,
});

describe("readPageData", () => {
  it.each([
    [null, {}],
    ["  ", {}],
    ['{"a":1}', { a: 1 }],
    ['<script type="application/json">\n{"a":1}\n</script>', { a: 1 }],
    ["<script type='application/json'></script>", {}],
  ])("reads %j", (input, expected) => {
    expect(readPageData(input)).toEqual(expected);
  });

  it("throws on malformed JSON", () => {
    expect(() => readPageData("{ nope")).toThrow();
  });
});

describe("nameList", () => {
  it.each([
    [
      ["Go", " Cobra "],
      ["Go", "Cobra"],
    ],
    [["", null, "  "], []],
    [null, []],
    [undefined, []],
  ])("normalizes %j", (input, expected) => {
    expect(nameList.parse(input)).toEqual(expected);
  });
});

describe("project", () => {
  it("fills defaults when there is no page data", () => {
    expect(project.parse(basePage)).toMatchObject({
      slug: "portfolio",
      image: null,
      summary: null,
      tech: [],
      link: null,
      repoUrl: null,
      featured: false,
      order: 0,
    });
  });

  it("uses the custom excerpt as summary, falling back to Ghost's excerpt", () => {
    expect(project.parse({ ...basePage, excerpt: "Auto" }).summary).toBe("Auto");
    expect(project.parse({ ...basePage, excerpt: "Auto", custom_excerpt: "Custom" }).summary).toBe("Custom");
  });

  it("keeps valid URLs and drops invalid ones", () => {
    const parsed = project.parse(withData({ link: "  https://example.com  ", repoUrl: "javascript:alert(1)" }));
    expect(parsed.link).toBe("https://example.com");
    expect(parsed.repoUrl).toBeNull();
  });

  it("maps the feature image and featured flag", () => {
    const parsed = project.parse({
      ...basePage,
      feature_image: "https://x/y.png",
      feature_image_alt: "Y",
      featured: true,
    });
    expect(parsed.image).toEqual({ url: "https://x/y.png", alt: "Y" });
    expect(parsed.featured).toBe(true);
  });

  it("logs malformed JSON and falls back to defaults", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(project.parse(withData("{ broken")).tech).toEqual([]);
    expect(errors).toHaveBeenCalledWith(expect.stringContaining('[ghost] invalid page data "portfolio" ignored'));
    errors.mockRestore();
  });

  it("rejects well-formed data with invalid values, pointing at the field", () => {
    const result = project.safeParse(withData({ tech: "Go, Cobra" }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["codeinjection_head", "tech"]);
  });
});

describe("post", () => {
  it("accepts the minimal shape and nulls missing fields", () => {
    expect(post.parse(basePost)).toMatchObject({
      description: null,
      html: null,
      cover: null,
      category: null,
      readingTime: 1,
      date: basePost.published_at,
      updatedAt: basePost.published_at,
    });
  });

  it("uses the primary tag as category, but never an internal one", () => {
    const tag = { id: "t", name: "homelab", slug: "homelab", visibility: "public" };
    expect(post.parse({ ...basePost, primary_tag: tag }).category).toEqual({
      id: "t",
      title: "homelab",
      slug: "homelab",
      description: null,
    });
    expect(post.parse({ ...basePost, primary_tag: { ...tag, visibility: "internal" } }).category).toBeNull();
  });

  it("rejects posts without a slug or date", () => {
    expect(post.safeParse({ ...basePost, slug: undefined }).success).toBe(false);
    expect(post.safeParse({ ...basePost, published_at: null }).success).toBe(false);
  });
});

describe("category", () => {
  it("exposes the tag name as title", () => {
    expect(category.parse({ id: "t", name: "Go", slug: "go", description: " " })).toEqual({
      id: "t",
      title: "Go",
      slug: "go",
      description: null,
    });
  });
});

describe("about", () => {
  it("takes the headline, bio and portrait from the page", () => {
    const parsed = about.parse({
      ...basePage,
      title: "Hello there",
      html: "<p>Bio</p>",
      feature_image: "https://x/me.jpg",
    });
    expect(parsed).toMatchObject({
      header: "Hello there",
      body: "<p>Bio</p>",
      image: { url: "https://x/me.jpg" },
    });
  });

  it("normalizes social links", () => {
    const parsed = about.parse(withData({ github: "https://github.com/x", linkedIn: "" }));
    expect(parsed.github).toBe("https://github.com/x");
    expect(parsed.linkedIn).toBeNull();
    expect(parsed.currentPosition).toBeNull();
  });

  it("falls back to default labels and empty lists", () => {
    expect(about.parse(withData({ eyebrow: "  ", skillsHeading: null }))).toMatchObject({
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

  it("links documents from a URL string, an object, or a Ghost file path", () => {
    process.env.GHOST_URL = "https://cms.example.com";
    const parsed = about.parse(
      withData({
        resume: "https://example.com/cv.pdf",
        coverLetter: { url: "/content/files/letter.pdf", label: "Letter" },
      }),
    );
    expect(parsed.resume).toEqual({ href: "https://example.com/cv.pdf", label: "Résumé" });
    expect(parsed.coverLetter).toEqual({
      href: "https://cms.example.com/content/files/letter.pdf",
      label: "Letter",
    });
    expect(about.parse(withData({ resume: { url: "nope" } })).resume).toBeNull();
    delete process.env.GHOST_URL;
  });

  it("drops unnamed skills and tech and normalizes their links and icons", () => {
    const parsed = about.parse(
      withData({
        skills: [{ name: "Web", icon: " fa-solid code " }, { name: "" }],
        tech: [{ name: "Go", link: "nope", icon: "" }, { name: null }],
      }),
    );
    expect(parsed.skills).toEqual([{ name: "Web", description: null, icon: "fa-solid code" }]);
    expect(parsed.tech).toEqual([{ name: "Go", link: null, icon: null }]);
  });
});

describe("homepage", () => {
  it("defaults the greeting and hides a blank subheading", () => {
    expect(homepage.parse(withData({ heroSubheading: "   " }))).toEqual({
      heroGreeting: "Hi, I'm",
      heroSubheading: null,
      availability: null,
    });
  });

  it("trims availability", () => {
    expect(homepage.parse(withData({ availability: " Open source " })).availability).toBe("Open source");
  });
});

describe("global", () => {
  it("prefers the meta description and maps the icon", () => {
    expect(
      global.parse({ title: "Site", description: "Plain", meta_description: "Meta", icon: "https://x/i.png" }),
    ).toEqual({
      siteName: "Site",
      description: "Meta",
      favicon: { url: "https://x/i.png" },
      shareImage: null,
    });
  });
});
