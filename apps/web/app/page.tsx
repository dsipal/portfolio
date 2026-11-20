import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { Hero } from "@/components/hero";
import { FadeIn } from "@/components/motion";
import { NowStrip } from "@/components/now-strip";
import { ProjectSpotlight } from "@/components/project-spotlight";
import { SocialLinks } from "@/components/social-links";
import { WritingIndex } from "@/components/writing-index";
import { getAbout, getHomepage, getPosts, getProjects } from "@/lib/ghost";
import { getSiteInfo } from "@/lib/site";

export const revalidate = 60;

/** Posts listed in the writing index */
const LATEST_POSTS = 8;

export default async function HomePage() {
  const [{ name }, homepage, about, { posts }, projects] = await Promise.all([
    getSiteInfo(),
    getHomepage(),
    getAbout(),
    getPosts({ pageSize: LATEST_POSTS }),
    getProjects({ featured: true }),
  ]);

  return (
    <>
      <Hero
        name={name}
        greeting={homepage?.heroGreeting ?? "Hi, I'm"}
        subheading={homepage?.heroSubheading ?? null}
        socials={<SocialLinks about={about} />}
      />

      <NowStrip about={about} latestPost={posts[0]} availability={homepage?.availability ?? null} />

      {projects.length > 0 && (
        <Container className="pt-16 pb-6 sm:pt-20">
          <SectionHeading
            title={projects.length > 1 ? "Featured projects" : "Featured project"}
            href="/projects/"
            linkLabel="All projects"
          />
          <ProjectSpotlight projects={projects} />
        </Container>
      )}

      <Container className="py-16 sm:py-20">
        <SectionHeading title="Latest writing" href="/blog/" linkLabel="All posts" />
        <FadeIn>
          <WritingIndex posts={posts} />
        </FadeIn>
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
