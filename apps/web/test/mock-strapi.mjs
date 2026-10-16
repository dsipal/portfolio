// Minimal Strapi 5 REST mock serving test/fixtures, for e2e tests and for
// building the site without a real CMS. Supports the filters, sorting and
// pagination that lib/strapi.ts uses.
//   node test/mock-strapi.mjs [port]   (default 1338)
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import qs from "qs";

const load = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"));
const [categories, posts, projects, about, global] = [
  "categories",
  "posts",
  "projects",
  "about",
  "global",
].map(load);

function paginate(list, { page = 1, pageSize = 25 } = {}) {
  const [p, size] = [Number(page), Number(pageSize)];
  return {
    data: list.slice((p - 1) * size, p * size),
    meta: {
      pagination: { page: p, pageSize: size, pageCount: Math.ceil(list.length / size), total: list.length },
    },
  };
}

function findPosts(query) {
  const f = query.filters ?? {};
  let list = posts.filter(
    (p) =>
      (!f.slug || p.slug === f.slug.$eq) &&
      (!f.category || p.category?.slug === f.category.slug.$eq) &&
      (!f.published_date?.$lt || p.published_date < f.published_date.$lt) &&
      (!f.published_date?.$gt || p.published_date > f.published_date.$gt),
  );
  const asc = String([query.sort ?? []].flat()[0] ?? "").endsWith(":asc");
  list = list.toSorted((a, b) => (asc ? 1 : -1) * a.published_date.localeCompare(b.published_date));
  return paginate(list, query.pagination);
}

const routes = {
  "/api/posts": findPosts,
  "/api/categories": (q) => paginate(categories, q.pagination),
  "/api/projects": (q) =>
    paginate(q.filters?.featured ? projects.filter((p) => p.featured) : projects, q.pagination),
  "/api/about": () => ({ data: about, meta: {} }),
  "/api/global": () => ({ data: global, meta: {} }),
};

const port = Number(process.argv[2] ?? process.env.PORT ?? 1338);
createServer((req, res) => {
  const [path, query = ""] = req.url.split("?");
  const handler = routes[path];
  res.writeHead(handler ? 200 : 404, { "Content-Type": "application/json" });
  res.end(JSON.stringify(handler ? handler(qs.parse(query)) : { data: null, error: { status: 404 } }));
}).listen(port, () => console.log(`mock strapi listening on :${port}`));
