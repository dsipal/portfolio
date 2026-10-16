import { getPosts } from "@/lib/strapi";
import { SITE_URL, getSiteInfo } from "@/lib/site";

export const revalidate = 3600;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const [{ name, description }, { posts }] = await Promise.all([getSiteInfo(), getPosts({ pageSize: 50 })]);

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/post/${post.slug}/`;
      const date = new Date(post.published_date ?? post.publishedAt).toUTCString();
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${date}</pubDate>${post.description ? `\n      <description>${escape(post.description)}</description>` : ""}${post.category ? `\n      <category>${escape(post.category.title)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(name)}</title>
    <link>${SITE_URL}</link>
    <description>${escape(description ?? `Posts from ${name}`)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
