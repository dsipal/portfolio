import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/container";
import { Stagger, StaggerItem } from "@/components/motion";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/lib/strapi";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built, shipped and tinkered with.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Container>
      <PageHeader title="Projects" description={metadata.description} />
      {projects.length > 0 ? (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Projects are on their way.
        </div>
      )}
    </Container>
  );
}
