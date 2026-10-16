import { expect, test } from "@playwright/test";

const ok = [
  "/",
  "/blog/",
  "/blog/page/2/",
  "/category/engineering/",
  "/category/homelab/",
  "/post/post-3/",
  "/post/uncategorised/",
  "/projects/",
  "/about/",
  "/rss.xml",
  "/sitemap.xml",
  "/robots.txt",
];
const notFound = [
  "/does-not-exist/",
  "/post/nope/",
  "/category/nope/",
  "/blog/page/1/",
  "/blog/page/99/",
  "/blog/page/abc/",
];

test.describe("route status", () => {
  test.skip(({ isMobile }) => isMobile, "status codes don't depend on the device");

  for (const path of ok) {
    test(`200 ${path}`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(200);
    });
  }
  for (const path of notFound) {
    test(`404 ${path}`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(404);
    });
  }

  test("titles use the Strapi site name", async ({ page }) => {
    await page.goto("/post/post-3/");
    await expect(page).toHaveTitle("Post number 3: Postgres tuning | devin sipal");
  });

  test("revalidate webhook requires the secret", async ({ request }) => {
    expect((await request.post("/api/revalidate/", { data: { model: "post" } })).status()).toBe(401);
    const res = await request.post("/api/revalidate/", {
      data: { model: "post" },
      headers: { Authorization: "Bearer e2e-secret" },
    });
    expect(res.status()).toBe(200);
  });
});
