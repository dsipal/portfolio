import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAbout, getAllPostSlugs, getHomepage, getPosts, getProjects } from "@/lib/ghost";

const respond = (body: unknown, status = 200) =>
  vi.fn(async (...args: [url: string, init?: RequestInit]) => {
    void args;
    return new Response(JSON.stringify(body), { status });
  });

const validPost = {
  id: "p1",
  title: "Valid",
  slug: "valid",
  html: "<p>hello</p>",
  reading_time: 2,
  published_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const pagination = (total: number, limit = 9, page = 1) => ({
  pagination: { page, limit, pages: Math.ceil(total / limit), total },
});

const calledUrl = (fetch: ReturnType<typeof respond>, call = 0) => new URL(String(fetch.mock.calls[call][0]));

describe("lib/ghost", () => {
  let errors: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errors = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.GHOST_CONTENT_API_KEY = "test-key";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    errors.mockRestore();
  });

  it("skips and logs invalid entries instead of failing the list", async () => {
    vi.stubGlobal(
      "fetch",
      respond({ posts: [validPost, { ...validPost, id: "p2", slug: "" }], meta: pagination(2) }),
    );
    const { posts, pagination: page } = await getPosts();
    expect(posts.map((p) => p.slug)).toEqual(["valid"]);
    expect(posts[0]).toMatchObject({ readingTime: 2, date: validPost.published_at });
    expect(posts[0]).not.toHaveProperty("html");
    expect(page).toEqual({ page: 1, pageSize: 9, pageCount: 1, total: 2 });
    expect(errors).toHaveBeenCalledWith(expect.stringContaining('[ghost] invalid post "Valid" skipped: slug'));
  });

  it("queries the Content API with the key, tags, order and category filter", async () => {
    const fetch = respond({ posts: [], meta: pagination(0) });
    vi.stubGlobal("fetch", fetch);
    await getPosts({ page: 2, category: "homelab" });
    const url = calledUrl(fetch);
    expect(url.pathname).toBe("/ghost/api/content/posts/");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      key: "test-key",
      include: "tags",
      order: "published_at desc",
      filter: "tag:'homelab'",
      limit: "9",
      page: "2",
    });
    expect((fetch.mock.calls[0][1]?.headers as Record<string, string>)["Accept-Version"]).toBe("v6.0");
  });

  it("follows pagination when fetching every entry", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ posts: [{ id: "a", slug: "a" }], meta: pagination(2, 1, 1) }))
      .mockResolvedValueOnce(Response.json({ posts: [{ id: "b", slug: "b" }], meta: pagination(2, 1, 2) }));
    vi.stubGlobal("fetch", fetch);
    expect((await getAllPostSlugs()).map((p) => p.slug)).toEqual(["a", "b"]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("reads projects from #project pages, sorted by their page data order", async () => {
    const page = (title: string, data: object) => ({
      id: title,
      title,
      slug: title.toLowerCase(),
      codeinjection_head: JSON.stringify(data),
    });
    const fetch = respond({
      pages: [page("Second", { order: 2, tech: [" NestJS ", ""] }), page("First", { order: 1 })],
      meta: pagination(2, 100),
    });
    vi.stubGlobal("fetch", fetch);
    const projects = await getProjects({ featured: true });
    expect(projects.map((p) => p.title)).toEqual(["First", "Second"]);
    expect(projects[1].tech).toEqual(["NestJS"]);
    expect(calledUrl(fetch).searchParams.get("filter")).toBe("tag:hash-project+featured:true");
  });

  it("reads the hero copy from the home page's data", async () => {
    const fetch = respond({
      pages: [
        {
          id: "h",
          title: "Home",
          slug: "home",
          codeinjection_head:
            '<script type="application/json">{"heroGreeting":"Hey, I\'m","heroSubheading":"Builder."}</script>',
        },
      ],
    });
    vi.stubGlobal("fetch", fetch);
    expect(await getHomepage()).toMatchObject({ heroGreeting: "Hey, I'm", heroSubheading: "Builder." });
    expect(calledUrl(fetch).pathname).toBe("/ghost/api/content/pages/slug/home/");
  });

  it("returns null for a missing page (404)", async () => {
    vi.stubGlobal("fetch", respond({ errors: [{ type: "NotFoundError" }] }, 404));
    expect(await getAbout()).toBeNull();
  });

  it("throws at runtime when Ghost errors, so ISR keeps the last good page", async () => {
    vi.stubGlobal("fetch", respond({ errors: [] }, 401));
    await expect(getPosts({ page: 3 })).rejects.toThrow("401");
    expect(errors).toHaveBeenCalledWith(expect.stringContaining("[ghost] GET /posts/ failed: 401"));
  });
});
