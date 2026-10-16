import Link from "next/link";
import { RssIcon } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import type { About } from "@/lib/types";

export function SiteFooter({ siteName, about }: { siteName: string; about: About | null }) {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <div className="text-center sm:text-left">
          <Link href="/" className="font-semibold tracking-tight lowercase">
            {siteName}
            <span className="text-brand">.</span>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteName}. Built with Next.js &amp; Strapi.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <SocialLinks about={about} />
          <Link
            href="/rss.xml"
            aria-label="RSS feed"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RssIcon className="size-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
