// Minimal Ghost Content API mock serving test/fixtures, for e2e tests and for
// building the site without a real CMS. Supports the filters, ordering and
// pagination that lib/ghost.ts uses.
//   node test/mock-ghost.mjs [port]   (default 1338)
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const load = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"));
const [tags, posts, pages, settings] = ["tags", "posts", "pages", "settings"].map(load);

const unquote = (value) => value.replace(/^'(.*)'$/, "$1");

/** The subset of Ghost's NQL filter syntax lib/ghost.ts sends: clauses joined with + */
function matches(entry, filter) {
  if (!filter) return true;
  return filter.split("+").every((clause) => {
    const [, field, op = "", raw] = /^(\w+):([<>]?)(.+)$/.exec(clause) ?? [];
    const value = unquote(raw ?? "");
    switch (field) {
      case "tag":
        return (entry.tags ?? []).some((t) => t.slug === value);
      case "visibility":
        return entry.visibility === value;
      case "featured":
        return String(Boolean(entry.featured)) === value;
      case "published_at":
        return op === "<" ? entry.published_at < value : op === ">" ? entry.published_at > value : true;
      default:
        return false;
    }
  });
}

function list(resource, items, query) {
  let result = items.filter((e) => matches(e, query.get("filter")));
  const [field, dir] = (query.get("order") ?? "").split(" ");
  if (field) {
    result = result.toSorted((a, b) => (dir === "asc" ? 1 : -1) * String(a[field]).localeCompare(String(b[field])));
  }
  const page = Number(query.get("page") ?? 1);
  const limit = Number(query.get("limit") ?? 15);
  return {
    [resource]: result.slice((page - 1) * limit, page * limit),
    meta: {
      pagination: { page, limit, pages: Math.ceil(result.length / limit), total: result.length },
    },
  };
}

const bySlug = (resource, items, slug) => {
  const entry = items.find((e) => e.slug === slug);
  return entry ? { [resource]: [entry] } : null;
};

function route(path, query) {
  const slug = /^\/(posts|pages)\/slug\/([^/]+)\/$/.exec(path);
  if (slug) return bySlug(slug[1], slug[1] === "posts" ? posts : pages, decodeURIComponent(slug[2]));
  if (path === "/posts/") return list("posts", posts, query);
  if (path === "/pages/") return list("pages", pages, query);
  if (path === "/tags/") return list("tags", tags, query);
  if (path === "/settings/") return { settings, meta: {} };
  return null;
}

const PREFIX = "/ghost/api/content";
const port = Number(process.argv[2] ?? process.env.PORT ?? 1338);
createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const send = (status, body) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (!url.searchParams.get("key")) {
    return send(401, { errors: [{ message: "Authorization failed", type: "UnauthorizedError" }] });
  }
  const body = url.pathname.startsWith(PREFIX) ? route(url.pathname.slice(PREFIX.length), url.searchParams) : null;
  if (!body) return send(404, { errors: [{ message: "Resource not found", type: "NotFoundError" }] });
  send(200, body);
}).listen(port, () => console.log(`mock ghost listening on :${port}`));
