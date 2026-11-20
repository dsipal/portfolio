import { ExternalLinkIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StrapiImage } from "@/components/strapi-image";
import type { Project } from "@/lib/schemas";

export function ProjectCard({ project }: { project: Project }) {
  const { tech } = project;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {project.image ? (
          <StrapiImage
            image={project.image}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/25 via-brand/5 to-transparent">
            <span className="text-4xl font-semibold text-brand/60">{project.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
        {project.summary && (
          <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">{project.summary}</p>
        )}
        {tech.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {tech.map((t) => (
              <li key={t}>
                <Badge variant="outline" className="font-mono text-[11px]">
                  {t}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {(project.link || project.repoUrl) && (
          <div className="mt-auto flex gap-2 pt-2">
            {project.link && (
              <Button asChild size="sm">
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon />
                  Visit
                </a>
              </Button>
            )}
            {project.repoUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                  Source
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
