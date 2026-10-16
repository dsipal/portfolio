import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

/** Page 1 lives at `basePath`; page n at `${basePath}page/n/` */
export function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}page/${page}/`;
}

/** Page numbers to show: always first, last, and current ±1, with gaps as null */
export function pageList(current: number, count: number): (number | null)[] {
  const pages = new Set([1, count, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

export function PostsPagination({
  basePath,
  page,
  pageCount,
}: {
  basePath: string;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const disabled = "pointer-events-none opacity-40";

  return (
    <Pagination className="mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={pageHref(basePath, page - 1)}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={cn(page <= 1 && disabled)}
          />
        </PaginationItem>
        {pageList(page, pageCount).map((p, i) =>
          p === null ? (
            <PaginationItem key={`gap-${i}`} className="hidden sm:block">
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p} className={cn(p !== page && "hidden sm:block")}>
              <PaginationLink href={pageHref(basePath, p)} isActive={p === page}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={pageHref(basePath, page + 1)}
            aria-disabled={page >= pageCount}
            tabIndex={page >= pageCount ? -1 : undefined}
            className={cn(page >= pageCount && disabled)}
          />
        </PaginationItem>
      </PaginationContent>
      <p className="sr-only" aria-live="polite">
        Page {page} of {pageCount}
      </p>
    </Pagination>
  );
}
