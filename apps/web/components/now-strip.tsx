import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { FadeIn } from "@/components/motion";
import type { About, PostSummary } from "@/lib/schemas";

type Cell = { key: string; label: React.ReactNode; value: React.ReactNode };

const label = "text-xs font-medium tracking-wider text-muted-foreground uppercase";

/**
 * Live status under the hero: role, what I'm working on, the newest post and
 * an optional "open to" line. Each cell hides when its CMS field is empty.
 */
export function NowStrip({
  about,
  latestPost,
  availability,
}: {
  about: About | null;
  latestPost: PostSummary | undefined;
  /** CMS: homepage.availability */
  availability: string | null;
}) {
  const position = about?.currentPosition;
  const cells: Cell[] = [];

  if (position?.positionTitle) {
    const company = position.companyTitle;
    cells.push({
      key: "role",
      label: "Role",
      value: (
        <>
          {position.positionTitle}
          {company && (
            <>
              {" at "}
              {position.companyLink ? (
                <a
                  href={position.companyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline-offset-4 hover:underline"
                >
                  {company}
                </a>
              ) : (
                company
              )}
            </>
          )}
        </>
      ),
    });
  }

  if (about?.currentlyWorkingOn) {
    cells.push({
      key: "working-on",
      label: (
        <span className="inline-flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          Working on
        </span>
      ),
      value: about.currentlyWorkingOn,
    });
  }

  if (latestPost) {
    cells.push({
      key: "latest",
      label: "Latest post",
      value: (
        <Link
          href={`/post/${latestPost.slug}/`}
          className="group inline-flex items-baseline gap-1.5 hover:text-brand"
        >
          <span className="line-clamp-2">{latestPost.title}</span>
          <ArrowRightIcon className="size-4 shrink-0 self-center transition-transform group-hover:translate-x-0.5" />
        </Link>
      ),
    });
  }

  if (availability) cells.push({ key: "open-to", label: "Open to", value: availability });

  if (cells.length === 0) return null;

  return (
    <section aria-label="Now" className="mx-auto max-w-6xl px-4 sm:px-6">
      <FadeIn>
        {/* gap-px over a border-coloured background draws the dividers between cells */}
        <dl
          className={`grid gap-px overflow-hidden rounded-2xl border bg-border shadow-sm sm:grid-cols-2 ${
            cells.length >= 4 ? "lg:grid-cols-4" : cells.length === 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {cells.map((cell) => (
            <div key={cell.key} className="flex flex-col gap-2 bg-card px-6 py-5">
              <dt className={label}>{cell.label}</dt>
              <dd className="font-medium text-pretty">{cell.value}</dd>
            </div>
          ))}
        </dl>
      </FadeIn>
    </section>
  );
}
