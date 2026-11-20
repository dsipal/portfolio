import { beforeEach, describe, expect, it, vi } from "vitest";
import { signGhostPayload, verifyGhostSignature } from "@/lib/webhook";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));

const { POST } = await import("@/app/api/revalidate/route");

const request = (body: unknown, signature?: string) =>
  new Request("http://localhost/api/revalidate/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(signature ? { "X-Ghost-Signature": signature } : {}),
    },
    body: JSON.stringify(body),
  });

const signed = (body: unknown, secret = "s3cret") => request(body, signGhostPayload(JSON.stringify(body), secret));

const tagsRevalidated = () => revalidateTag.mock.calls.map((c) => c[0]).sort();

describe("verifyGhostSignature", () => {
  it("accepts a fresh signature and rejects tampering or staleness", () => {
    const now = 1_700_000_000_000;
    const header = signGhostPayload("{}", "k", now);
    expect(verifyGhostSignature(header, "{}", "k", now)).toBe(true);
    expect(verifyGhostSignature(header, "{ }", "k", now)).toBe(false);
    expect(verifyGhostSignature(header, "{}", "other", now)).toBe(false);
    expect(verifyGhostSignature(header, "{}", "k", now + 10 * 60 * 1000)).toBe(false);
    expect(verifyGhostSignature("garbage", "{}", "k", now)).toBe(false);
  });
});

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    process.env.REVALIDATE_SECRET = "s3cret";
  });

  it("rejects missing or wrong signatures", async () => {
    expect((await POST(request({ post: {} }))).status).toBe(401);
    expect((await POST(signed({ post: {} }, "nope"))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects everything when no secret is configured", async () => {
    const req = signed({ post: {} });
    delete process.env.REVALIDATE_SECRET;
    expect((await POST(req)).status).toBe(401);
  });

  it("expires the tags for the changed resource", async () => {
    const res = await POST(signed({ tag: { current: {}, previous: {} } }));
    expect(res.status).toBe(200);
    expect(tagsRevalidated()).toEqual(["categories", "posts"]);
    expect(revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
  });

  it("expires every page-backed tag for page events", async () => {
    await POST(signed({ page: { current: {} } }));
    expect(tagsRevalidated()).toEqual(["about", "homepage", "projects"]);
  });

  it("expires every tag for site.changed and unknown payloads", async () => {
    await POST(signed({}));
    expect(tagsRevalidated()).toEqual(["about", "categories", "global", "homepage", "posts", "projects"]);
  });
});
