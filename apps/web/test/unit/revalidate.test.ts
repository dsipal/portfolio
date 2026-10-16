import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));

const { POST } = await import("@/app/api/revalidate/route");

const request = (body: unknown, auth?: string) =>
  new Request("http://localhost/api/revalidate/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },
    body: JSON.stringify(body),
  });

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    process.env.REVALIDATE_SECRET = "s3cret";
  });

  it("rejects missing or wrong secrets", async () => {
    expect((await POST(request({ model: "post" }))).status).toBe(401);
    expect((await POST(request({ model: "post" }, "Bearer nope"))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects everything when no secret is configured", async () => {
    delete process.env.REVALIDATE_SECRET;
    expect((await POST(request({ model: "post" }, "Bearer "))).status).toBe(401);
  });

  it("expires the tags for the changed model", async () => {
    const res = await POST(request({ model: "category" }, "Bearer s3cret"));
    expect(res.status).toBe(200);
    expect(revalidateTag.mock.calls.map((c) => c[0])).toEqual(["categories", "posts"]);
    expect(revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
  });

  it("expires every tag for unknown models", async () => {
    await POST(request({ model: "something-else" }, "Bearer s3cret"));
    expect(revalidateTag.mock.calls.map((c) => c[0]).sort()).toEqual(
      ["about", "categories", "global", "posts", "projects"].sort(),
    );
  });
});
