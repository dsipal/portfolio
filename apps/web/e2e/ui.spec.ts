import { expect, test, type Page } from "@playwright/test";

const pages = ["/", "/blog/", "/post/post-3/", "/projects/", "/about/", "/category/homelab/"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

for (const path of pages) {
  test(`${path} renders without errors or horizontal overflow`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("home shows the hero, cubes and latest posts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("devin sipal");
  await expect(page.locator("canvas")).toBeVisible();
  // Dripping metaball edge at the bottom of the hero
  await expect(page.locator("section").first().locator("svg mask")).toHaveCount(2);
  await page.getByRole("heading", { name: "Latest writing" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("main").getByRole("listitem").locator('a[href^="/post/"]')).toHaveCount(8);
});

test("now strip shows role, work, latest post and availability", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByRole("region", { name: "Now" });
  await expect(strip.getByRole("term")).toHaveText(["Role", "Working on", "Latest post", "Open to"]);
  await expect(strip).toContainText("Software Engineer at Acme");
  await expect(strip).toContainText("This portfolio");
  await expect(strip).toContainText("Freelance & contract work");
  await expect(strip.getByRole("link", { name: /./ }).last()).toHaveAttribute("href", /^\/post\//);
});

test("first featured project is the spotlight", async ({ page }) => {
  await page.goto("/");
  const spotlight = page.locator("article", { hasText: "Featured" }).first();
  await expect(spotlight.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(spotlight.getByRole("list", { name: "Technologies" })).toBeVisible();
});

test("writing index filters by category", async ({ page }) => {
  await page.goto("/");
  const filters = page.getByRole("group", { name: "Filter by category" });
  const rows = page.getByRole("main").getByRole("listitem").filter({ has: page.locator('a[href^="/post/"]') });
  await expect(rows).toHaveCount(8);
  await filters.getByRole("button", { name: "homelab" }).click();
  await expect(filters.getByRole("button", { name: "homelab" })).toHaveAttribute("aria-pressed", "true");
  await expect(rows).toHaveCount(3);
  await expect(rows.filter({ hasText: "engineering" })).toHaveCount(0);
  await filters.getByRole("button", { name: "All" }).click();
  await expect(rows).toHaveCount(8);
});

test("pastel palette is set before paint", async ({ page }) => {
  await page.goto("/");
  const pastel = await page.evaluate(() => document.documentElement.style.getPropertyValue("--pastel-1"));
  expect(pastel).toMatch(/^#[0-9a-f]{6}$/);
});

test("blog pagination moves between pages", async ({ page }) => {
  await page.goto("/blog/");
  await page.getByRole("link", { name: "Go to next page" }).click();
  await expect(page).toHaveURL(/\/blog\/page\/2\/$/);
  await expect(page.getByText("14 posts · page 2 of 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to next page" })).toHaveAttribute("aria-disabled", "true");
});

test("post page has a table of contents and prev/next links", async ({ page, isMobile }) => {
  await page.goto("/post/post-3/");
  await expect(page.locator("article h2#getting-started")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "More posts" })).toBeVisible();
  if (!isMobile) {
    await expect(page.getByRole("navigation", { name: "Table of contents" })).toBeVisible();
  }
});

test("search finds a post and opens it", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Search posts" }).click();
  else await page.keyboard.press("Control+k");
  await page.getByPlaceholder("Search posts…").fill("postgres");
  const results = page.locator("[cmdk-item]");
  await expect(results).toHaveCount(3);
  await expect(results.first()).toContainText("Postgres tuning");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/post\//);
});

test("mobile menu opens and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "homelab" }).click();
  await expect(page).toHaveURL(/\/category\/homelab\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("homelab");
});

test("theme toggle switches between light and dark", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const wasDark = (await html.getAttribute("class"))?.includes("dark");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(html).toHaveClass(wasDark ? /light/ : /dark/);
});

test("project tech badges render from techStack", async ({ page }) => {
  await page.goto("/projects/");
  const badges = (title: string) =>
    page.locator("article", { has: page.getByRole("heading", { name: title }) }).getByRole("listitem");
  await expect(badges("Portfolio")).toHaveText(["Next.js", "Strapi", "Docker"]);
  // Blank items are dropped and names trimmed
  await expect(badges("API service")).toHaveText(["NestJS", "TypeScript", "Postgres"]);
});

test("hero copy comes from the CMS", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hi, I'm");
  await expect(page.getByText("I build fast, dependable web apps")).toBeVisible();
});

test("about page renders CMS sections", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { name: "What I do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Writing" })).toBeVisible();
  const toolbox = page.locator("section", { has: page.getByRole("heading", { name: "Toolbox" }) });
  await expect(toolbox.getByRole("listitem")).toHaveText(["TypeScript", "Docker", "Postgres"]);
  await expect(toolbox.getByRole("link", { name: "TypeScript" })).toHaveAttribute("href", /typescriptlang/);
  // The intro shows the résumé as its own button, not again in the social icons (the footer keeps one)
  await expect(page.getByRole("main").getByRole("link", { name: "Résumé" })).toHaveCount(1);
});
