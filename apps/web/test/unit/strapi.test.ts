import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAbout, getPosts, getProjects } from "@/lib/strapi";

const respond = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

const validPost = {
  id: 1,
  documentId: "d1",
  title: "Valid",
  slug: "valid",
  content: "word ".repeat(450),
  publishedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("lib/strapi", () => {
  let errors: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errors = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    errors.mockRestore();
  });

  it("skips and logs invalid entries instead of failing the list", async () => {
    vi.stubGlobal(
      "fetch",
      respond({
        data: [validPost, { ...validPost, id: 2, slug: "" }],
        meta: { pagination: { page: 1, pageSize: 9, pageCount: 1, total: 2 } },
      }),
    );
    const { posts, pagination } = await getPosts();
    expect(posts.map((p) => p.slug)).toEqual(["valid"]);
    expect(posts[0]).toMatchObject({ readingTime: 2 });
    expect(posts[0]).not.toHaveProperty("content");
    expect(pagination.total).toBe(2);
    expect(errors).toHaveBeenCalledWith(expect.stringContaining('[strapi] invalid post "Valid" skipped: slug'));
  });

  it("normalizes malformed tech on projects", async () => {
    vi.stubGlobal(
      "fetch",
      respond({
        data: [{ id: 1, documentId: "p", title: "API", tech: { 0: "NestJS", 1: "Postgres" } }],
        meta: {},
      }),
    );
    const [project] = await getProjects();
    expect(project.tech).toEqual(["NestJS", "Postgres"]);
  });

  it("returns null for an unpublished single type (404)", async () => {
    vi.stubGlobal("fetch", respond({ data: null, error: { status: 404 } }, 404));
    expect(await getAbout()).toBeNull();
  });

  it("throws at runtime when Strapi errors, so ISR keeps the last good page", async () => {
    vi.stubGlobal("fetch", respond({ error: {} }, 401));
    await expect(getPosts({ page: 2 })).rejects.toThrow("401");
    expect(errors).toHaveBeenCalledWith(expect.stringContaining("[strapi] GET /api/posts failed: 401"));
  });
});
