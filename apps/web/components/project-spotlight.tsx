import { ArrowUpRightIcon, ExternalLinkIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { CmsImage } from "@/components/cms-image";
import type { Project } from "@/lib/schemas";

/**
 * The first featured project (by `order`) as a case-study card, the next
 * three in a compact row. No extra CMS fields: `featured` + `order` decide.
 */
export function ProjectSpotlight({ projects }: { projects: Project[] }) {
  const [spotlight, ...rest] = projects;
  if (!spotlight) return null;
  const others = rest.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <article className="group grid overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-colors duration-300 hover:border-brand/40 md:grid-cols-[1.25fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto md:min-h-[22rem]">
            {spotlight.image ? (
              <CmsImage
                image={spotlight.image}
                fill
                sizes="(min-width: 1024px) 640px, (min-width: 768px) 55vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <Monogram title={spotlight.title} className="text-7xl" />
            )}
          </div>

          <div className="flex flex-col justify-center gap-4 p-6 sm:p-9">
            <Badge className="self-start bg-brand/15 text-brand" variant="secondary">
              Featured
            </Badge>
            <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {spotlight.title}
            </h3>
            {spotlight.summary && <p className="text-pretty text-muted-foreground">{spotlight.summary}</p>}
            {spotlight.tech.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                {spotlight.tech.map((t) => (
                  <li key={t}>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {t}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            {(spotlight.link || spotlight.repoUrl) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {spotlight.link && (
                  <Button asChild>
                    <a href={spotlight.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon />
                      Visit
                    </a>
                  </Button>
                )}
                {spotlight.repoUrl && (
                  <Button asChild variant="outline">
                    <a href={spotlight.repoUrl} target="_blank" rel="noopener noreferrer">
                      <FaGithub />
                      Source
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </article>
      </FadeIn>

      {others.length > 0 && (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((project) => (
            <StaggerItem key={project.id}>
              <a
                href={project.link ?? project.repoUrl ?? "/projects/"}
                {...(project.link || project.repoUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex h-full items-center gap-4 rounded-xl border bg-card p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {project.image ? (
                    <CmsImage image={project.image} fill sizes="56px" className="object-cover" />
                  ) : (
                    <Monogram title={project.title} className="text-xl" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-semibold">{project.title}</span>
                  {project.summary && (
                    <span className="line-clamp-1 text-sm text-muted-foreground">{project.summary}</span>
                  )}
                </span>
                <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function Monogram({ title, className }: { title: string; className: string }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/25 via-brand/5 to-transparent"
    >
      <span className={`font-semibold text-brand/60 ${className}`}>{title.charAt(0)}</span>
    </span>
  );
}
