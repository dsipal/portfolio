#!/usr/bin/env node
// One-off migration of the Strapi content into Ghost. Delete this script once
// production has been migrated.
//
//   STRAPI_URL=https://admin.example.com STRAPI_API_TOKEN=... \
//   GHOST_ADMIN_URL=http://localhost:2368 GHOST_ADMIN_API_KEY=<id>:<secret> \
//   node scripts/migrate-strapi-to-ghost.mjs [--dry-run] [--force]
//
// GHOST_ADMIN_API_KEY is the Admin API key of a custom integration (Ghost Admin
// → Settings → Integrations). Run `pnpm install` first: the Markdown packages
// come from the workspace.
//
// What it does, in order:
//   categories → public tags
//   posts      → posts (Markdown rendered to HTML, imported with ?source=html)
//   projects   → pages tagged #project, link/repo/tech/order as page data JSON
//   about      → page "about" (structured fields as page data JSON)
//   homepage   → page "home"
//   global     → site settings (title, description, icon, og image)
// Images and files are re-uploaded to Ghost and links in Markdown rewritten.
// Entries that already exist in Ghost (same slug) are skipped; --force updates
// them instead. --dry-run reads Strapi and reports, without writing to Ghost.
import { createHmac } from "node:crypto";
import { toHtml } from "hast-util-to-html";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const FORCE = args.has("--force");

const env = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name}. See the header of ${new URL(import.meta.url).pathname} for usage.`);
    process.exit(1);
  }
  return value.replace(/\/+$/, "");
};
const STRAPI_URL = env("STRAPI_URL");
const STRAPI_API_TOKEN = env("STRAPI_API_TOKEN");
const GHOST_ADMIN_URL = env("GHOST_ADMIN_URL");
const [KEY_ID, KEY_SECRET] = env("GHOST_ADMIN_API_KEY").split(":");
if (!KEY_ID || !KEY_SECRET) {
  console.error("GHOST_ADMIN_API_KEY must look like <id>:<secret>");
  process.exit(1);
}

// Ghost's field limits; longer values are cut with a warning
const LIMITS = { custom_excerpt: 300, feature_image_alt: 191, meta_description: 500 };

const report = { created: [], updated: [], skipped: [], warnings: [], review: [] };
const warn = (message) => {
  report.warnings.push(message);
  console.warn(`  ! ${message}`);
};

function clip(field, value, where) {
  const text = value?.trim();
  if (!text) return null;
  if (text.length <= LIMITS[field]) return text;
  warn(`${where}: ${field} cut to ${LIMITS[field]} characters`);
  return `${text.slice(0, LIMITS[field] - 1)}…`;
}

// --- Strapi ---------------------------------------------------------------

async function strapi(path, params = {}) {
  const url = new URL(`${STRAPI_URL}/api${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Strapi GET ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function strapiList(path, params) {
  const items = [];
  for (let page = 1; ; page++) {
    const res = await strapi(path, { ...params, "pagination[page]": page, "pagination[pageSize]": 100 });
    items.push(...(res?.data ?? []));
    if (!res || page >= (res.meta?.pagination?.pageCount ?? 1)) return items;
  }
}

const strapiAsset = (url) => (url.startsWith("/") ? `${STRAPI_URL}${url}` : url);

// --- Ghost Admin API ------------------------------------------------------

function ghostToken() {
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const iat = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "HS256", typ: "JWT", kid: KEY_ID })}.${b64({ iat, exp: iat + 300, aud: "/admin/" })}`;
  const signature = createHmac("sha256", Buffer.from(KEY_SECRET, "hex")).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

async function ghost(method, path, body) {
  const res = await fetch(`${GHOST_ADMIN_URL}/ghost/api/admin${path}`, {
    method,
    headers: {
      Authorization: `Ghost ${ghostToken()}`,
      "Accept-Version": "v6.0",
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404 && method === "GET") return null;
  if (!res.ok) throw new Error(`Ghost ${method} ${path}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const uploaded = new Map();

/** Download a Strapi/Cloudinary asset and upload it to Ghost; returns the Ghost URL */
async function upload(url, kind = "image") {
  if (!url) return null;
  const source = strapiAsset(url);
  if (uploaded.has(source)) return uploaded.get(source);
  if (DRY_RUN) {
    uploaded.set(source, source);
    return source;
  }
  const res = await fetch(source);
  if (!res.ok) {
    warn(`could not download ${source} (${res.status}); left as is`);
    uploaded.set(source, source);
    return source;
  }
  const name = decodeURIComponent(new URL(source).pathname.split("/").pop() || "upload");
  const form = new FormData();
  form.append("file", new Blob([await res.arrayBuffer()], { type: res.headers.get("content-type") ?? undefined }), name);
  if (kind === "image") form.append("purpose", "image");
  const body = await ghost("POST", kind === "image" ? "/images/upload/" : "/files/upload/", form);
  const ghostUrl = (kind === "image" ? body.images : body.files)[0].url;
  uploaded.set(source, ghostUrl);
  return ghostUrl;
}

/** Re-upload images referenced in Markdown and point the Markdown at the copies */
async function rehostMarkdownImages(markdown) {
  if (!markdown) return markdown;
  const urls = new Set();
  for (const match of markdown.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)/g)) urls.add(match[1]);
  for (const match of markdown.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) urls.add(match[1]);
  let result = markdown;
  for (const url of urls) {
    if (!url.startsWith("/uploads/") && !url.startsWith(STRAPI_URL) && !url.includes("res.cloudinary.com")) continue;
    result = result.split(url).join(await upload(url));
  }
  return result;
}

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw);

async function markdownToHtml(markdown, where) {
  if (!markdown?.trim()) return "";
  const withoutCode = markdown.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`/g, "");
  if (/<[a-z][\w-]*[\s>/]/i.test(withoutCode)) report.review.push(where);
  const md = await rehostMarkdownImages(markdown);
  return toHtml(await markdownProcessor.run(markdownProcessor.parse(md)));
}

/** Page data in the format lib/schemas.ts reads: JSON inside a script tag */
const pageData = (data) => `<script type="application/json">\n${JSON.stringify(data, null, 2)}\n</script>`;

/** Create or (with --force) update a post or page by slug */
async function upsert(resource, entry, where) {
  const existing = await ghost("GET", `/${resource}/slug/${encodeURIComponent(entry.slug)}/`);
  const current = existing?.[resource]?.[0];
  if (current && !FORCE) {
    report.skipped.push(where);
    console.log(`  = ${where} exists, skipped`);
    return;
  }
  if (DRY_RUN) {
    (current ? report.updated : report.created).push(where);
    console.log(`  ${current ? "~" : "+"} ${where} (dry run)`);
    return;
  }
  if (current) {
    await ghost("PUT", `/${resource}/${current.id}/?source=html`, {
      [resource]: [{ ...entry, updated_at: current.updated_at }],
    });
    report.updated.push(where);
    console.log(`  ~ ${where}`);
  } else {
    await ghost("POST", `/${resource}/?source=html`, { [resource]: [entry] });
    report.created.push(where);
    console.log(`  + ${where}`);
  }
}

// --- Content --------------------------------------------------------------

async function migrateCategories() {
  console.log("Categories → tags");
  for (const category of await strapiList("/categories")) {
    const where = `tag "${category.slug}"`;
    const existing = await ghost("GET", `/tags/slug/${encodeURIComponent(category.slug)}/`);
    const tag = { name: category.title, slug: category.slug, description: category.description || null };
    if (existing && !FORCE) {
      report.skipped.push(where);
      console.log(`  = ${where} exists, skipped`);
    } else if (DRY_RUN) {
      (existing ? report.updated : report.created).push(where);
      console.log(`  ${existing ? "~" : "+"} ${where} (dry run)`);
    } else if (existing) {
      await ghost("PUT", `/tags/${existing.tags[0].id}/`, { tags: [tag] });
      report.updated.push(where);
      console.log(`  ~ ${where}`);
    } else {
      await ghost("POST", "/tags/", { tags: [tag] });
      report.created.push(where);
      console.log(`  + ${where}`);
    }
  }
}

async function migratePosts() {
  console.log("Posts");
  const posts = await strapiList("/posts", {
    "populate[cover]": true,
    "populate[postHero]": true,
    "populate[category]": true,
    sort: "published_date:asc",
  });
  for (const post of posts) {
    const where = `post "${post.slug}"`;
    if (post.postHero && post.cover && post.postHero.url !== post.cover.url) {
      warn(`${where}: has both a cover and a postHero; Ghost keeps one feature image (the cover)`);
    }
    const image = post.cover ?? post.postHero;
    await upsert(
      "posts",
      {
        title: post.title,
        slug: post.slug,
        html: await markdownToHtml(post.content, where),
        status: "published",
        published_at: post.published_date ?? post.publishedAt,
        custom_excerpt: clip("custom_excerpt", post.description, where),
        feature_image: await upload(image?.url),
        feature_image_alt: clip("feature_image_alt", image?.alternativeText, where),
        tags: post.category ? [{ name: post.category.title, slug: post.category.slug }] : [],
      },
      where,
    );
  }
}

async function migrateProjects() {
  console.log("Projects → pages tagged #project");
  const projects = await strapiList("/projects", { "populate[image]": true, "populate[techStack]": true });
  for (const project of projects) {
    const slug = project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const where = `project "${slug}"`;
    await upsert(
      "pages",
      {
        title: project.title,
        slug,
        html: await markdownToHtml(project.description, where),
        status: "published",
        custom_excerpt: clip("custom_excerpt", project.summary, where),
        feature_image: await upload(project.image?.url),
        feature_image_alt: clip("feature_image_alt", project.image?.alternativeText, where),
        featured: Boolean(project.featured),
        tags: [{ name: "#project" }],
        codeinjection_head: pageData({
          link: project.link?.trim() || null,
          repoUrl: project.repoUrl?.trim() || null,
          tech: (project.techStack ?? []).map((t) => t.name?.trim()).filter(Boolean),
          order: project.order ?? 0,
        }),
      },
      where,
    );
  }
}

async function documentLink(file, url, label) {
  const href = file ? await upload(file.url, "file") : url?.trim() || null;
  return href ? { url: href, ...(label?.trim() ? { label: label.trim() } : {}) } : null;
}

async function migrateAbout() {
  console.log("About → page \"about\"");
  const res = await strapi("/about", {
    "populate[image]": true,
    "populate[resumeFile]": true,
    "populate[coverLetterFile]": true,
    "populate[currentPosition]": true,
    "populate[skills]": true,
    "populate[tech]": true,
  });
  const about = res?.data;
  if (!about) return console.log("  (no about entry in Strapi)");
  const strip = (items, keys) =>
    (items ?? []).map((item) => Object.fromEntries(keys.map((key) => [key, item[key] ?? null])));
  await upsert(
    "pages",
    {
      title: about.header?.trim() || "About",
      slug: "about",
      html: await markdownToHtml(about.body, "about"),
      status: "published",
      feature_image: await upload(about.image?.url),
      feature_image_alt: clip("feature_image_alt", about.image?.alternativeText, "about"),
      codeinjection_head: pageData({
        eyebrow: about.eyebrow ?? null,
        github: about.github ?? null,
        linkedIn: about.linkedIn ?? null,
        resume: await documentLink(about.resumeFile, about.resumeUrl, about.resumeLabel),
        coverLetter: await documentLink(about.coverLetterFile, about.coverLetterUrl, about.coverLetterLabel),
        currentPosition: about.currentPosition
          ? strip([about.currentPosition], ["companyTitle", "positionTitle", "since", "companyLink"])[0]
          : null,
        nowHeading: about.nowHeading ?? null,
        currentlyWorkingOn: about.currentlyWorkingOn ?? null,
        skillsHeading: about.skillsHeading ?? null,
        skills: strip(about.skills, ["name", "description", "icon"]),
        toolboxHeading: about.toolboxHeading ?? null,
        tech: strip(about.tech, ["name", "link", "icon"]),
      }),
    },
    "about",
  );
}

async function migrateHomepage() {
  console.log("Homepage → page \"home\"");
  const home = (await strapi("/homepage"))?.data;
  if (!home) return console.log("  (no homepage entry in Strapi)");
  await upsert(
    "pages",
    {
      title: "Home",
      slug: "home",
      html: "<p>Site copy for the front page lives in this page's code injection (Site header).</p>",
      status: "published",
      codeinjection_head: pageData({
        heroGreeting: home.heroGreeting ?? null,
        heroSubheading: home.heroSubheading ?? null,
        availability: home.availability ?? null,
      }),
    },
    "home",
  );
}

async function migrateGlobal() {
  console.log("Global → site settings");
  const global = (await strapi("/global", { "populate[favicon]": true, "populate[defaultSeo][populate]": "*" }))
    ?.data;
  if (!global) return console.log("  (no global entry in Strapi)");
  const seo = global.defaultSeo ?? {};
  const settings = [
    ["title", global.SiteName],
    ["description", clip("meta_description", seo.MetaDescription, "settings")],
    ["meta_title", seo.MetaTitle],
    ["meta_description", clip("meta_description", seo.MetaDescription, "settings")],
    ["icon", await upload(global.favicon?.url)],
    ["og_image", await upload(seo.shareImage?.url)],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => ({ key, value }));
  if (DRY_RUN) {
    console.log(`  ~ settings (dry run): ${settings.map((s) => s.key).join(", ")}`);
    return;
  }
  try {
    await ghost("PUT", "/settings/", { settings });
    report.updated.push("settings");
    console.log(`  ~ settings: ${settings.map((s) => s.key).join(", ")}`);
  } catch (err) {
    // Integrations may not be allowed to edit settings; print them for Ghost Admin → Settings
    warn(`could not update settings (${err.message.split(":")[0]}); set these by hand:`);
    for (const { key, value } of settings) console.warn(`      ${key}: ${value}`);
  }
}

// --- Run ------------------------------------------------------------------

console.log(`Migrating ${STRAPI_URL} → ${GHOST_ADMIN_URL}${DRY_RUN ? " (dry run)" : ""}${FORCE ? " (force)" : ""}\n`);
await migrateCategories();
await migratePosts();
await migrateProjects();
await migrateAbout();
await migrateHomepage();
await migrateGlobal();

console.log(`
Done: ${report.created.length} created, ${report.updated.length} updated, ${report.skipped.length} skipped, ${uploaded.size} assets ${DRY_RUN ? "found" : "uploaded"}.`);
if (report.warnings.length) console.log(`${report.warnings.length} warning(s) above.`);
if (report.review.length) {
  console.log("\nThese had raw HTML in their Markdown; check them in the Ghost editor:");
  for (const where of report.review) console.log(`  - ${where}`);
}
