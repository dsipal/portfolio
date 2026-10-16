import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { Hero } from "@/components/hero";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { PostGrid } from "@/components/post-grid";
import { ProjectCard } from "@/components/project-card";
import { SocialLinks } from "@/components/social-links";
import { getAbout, getPosts, getProjects } from "@/lib/strapi";
import { getSiteInfo } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const [{ name, description }, about, { posts }, projects] = await Promise.all([
    getSiteInfo(),
    getAbout(),
    getPosts({ pageSize: 6 }),
    getProjects({ featured: true }),
  ]);

  const position = about?.currentPosition;
  const role =
    position?.positionTitle && position.companyTitle
      ? `${position.positionTitle} at ${position.companyTitle}`
      : (position?.positionTitle ?? null);

  return (
    <>
      <Hero
        name={name}
        role={role}
        intro={description ?? about?.header ?? null}
        socials={<SocialLinks about={about} />}
      />

      {projects.length > 0 && (
        <Container className="py-12">
          <SectionHeading title="Featured projects" href="/projects/" linkLabel="All projects" />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      )}

      <Container className="py-12">
        <SectionHeading title="Latest writing" href="/blog/" linkLabel="All posts" />
        <PostGrid posts={posts} />
      </Container>
    </>
  );
}

function SectionHeading({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <FadeIn className="mb-8 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <Button asChild variant="ghost" size="sm" className="group text-muted-foreground">
        <Link href={href}>
          {linkLabel}
          <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </FadeIn>
  );
}
