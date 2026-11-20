import type { ComponentProps } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import type { PluggableList } from "unified";
import { parseHtml } from "@/lib/html";
import { cn } from "@/lib/utils";

/** Rehype plugins shared by Markdown and Ghost HTML: heading anchors and Shiki code blocks */
const rehypePlugins: PluggableList = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["heading-anchor"] } }],
  [rehypePrettyCode, { theme: { light: "github-light", dark: "one-dark-pro" }, keepBackground: true }],
];

// react-markdown passes the hast `node`; keep it off the DOM element
type WithNode<T extends "a" | "img"> = ComponentProps<T> & { node?: unknown };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Anchor({ href, children, node, ...props }: WithNode<"a">) {
  const external = href?.startsWith("http");
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
      {children}
    </a>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Img({ alt, node, className, ...props }: WithNode<"img">) {
  // Content images have no known dimensions, so next/image can't size them
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt ?? ""} loading="lazy" className={cn("rounded-lg border", className)} {...props} />;
}

const components = { a: Anchor, img: Img };

function Prose({ className, children }: { className?: string; children: React.ReactNode }) {
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
      {children}
    </div>
  );
}

/** Server-rendered Markdown (short CMS fields such as skill descriptions): GFM and raw HTML */
export async function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <Prose className={className}>
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, ...rehypePlugins]}
        components={components}
      >
        {children}
      </MarkdownAsync>
    </Prose>
  );
}

/** Server-rendered Ghost HTML (post and page bodies), with the same anchors and code highlighting */
export async function HtmlContent({ html, className }: { html: string; className?: string }) {
  const tree = await parseHtml(html, rehypePlugins);
  return (
    <Prose className={className}>
      {toJsxRuntime(tree, { Fragment, jsx, jsxs, components })}
    </Prose>
  );
}
