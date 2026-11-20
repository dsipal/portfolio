import type { Root } from "hast";
import rehypeParse from "rehype-parse";
import { unified, type PluggableList } from "unified";

const processor = (plugins: PluggableList) => unified().use(rehypeParse, { fragment: true }).use(plugins);

/** Parse an HTML fragment (a Ghost post body) and run rehype plugins over it */
export async function parseHtml(html: string, plugins: PluggableList = []): Promise<Root> {
  const p = processor(plugins);
  return (await p.run(p.parse(html))) as Root;
}

/** parseHtml for synchronous plugins only */
export function parseHtmlSync(html: string, plugins: PluggableList = []): Root {
  const p = processor(plugins);
  return p.runSync(p.parse(html)) as Root;
}
