import { MarkdownAsync, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { cn } from "@/lib/utils";

const components: Components = {
  a({ href, children, ...props }) {
    const external = href?.startsWith("http");
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {children}
      </a>
    );
  },
  img({ alt, ...props }) {
    // Markdown images have no known dimensions, so next/image can't size them
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ""} loading="lazy" className="rounded-lg border" {...props} />;
  },
};

/** Server-rendered Markdown: GFM, raw HTML, heading anchors and Shiki code blocks */
export async function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-zinc prose-theme max-w-none",
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:font-medium prose-a:underline-offset-4 hover:prose-a:decoration-2",
        "prose-pre:bg-transparent prose-pre:p-0",
        className,
      )}
    >
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["heading-anchor"] } }],
          [
            rehypePrettyCode,
            { theme: { light: "github-light", dark: "one-dark-pro" }, keepBackground: true },
          ],
        ]}
        components={components}
      >
        {children}
      </MarkdownAsync>
    </div>
  );
}
