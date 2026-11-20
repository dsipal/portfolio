import type { Metadata } from "next";
import { ArrowUpRightIcon, BriefcaseIcon, FileTextIcon, MailIcon } from "lucide-react";
import { Container } from "@/components/container";
import { FaIcon, resolveFaIcon } from "@/components/fa-icon";
import { Markdown } from "@/components/markdown";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { SocialLinks } from "@/components/social-links";
import { StrapiImage } from "@/components/strapi-image";
import { Button } from "@/components/ui/button";
import type { About } from "@/lib/schemas";
import { getAbout } from "@/lib/strapi";
import { cn, formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return { title: about?.eyebrow ?? "About", description: about?.header ?? undefined };
}

export default async function AboutPage() {
  const about = await getAbout();

  if (!about) {
    return (
      <Container className="py-24 text-center text-muted-foreground">
        This page is being written. Check back soon.
      </Container>
    );
  }

  return (
    <>
      <Intro about={about} />

      {(about.body || about.currentlyWorkingOn) && (
        <Container
          className={cn(
            "grid items-start gap-10 py-16 sm:py-24",
            about.currentlyWorkingOn && about.body && "md:grid-cols-[1fr_2fr] md:gap-16",
          )}
        >
          {about.currentlyWorkingOn && (
            <FadeIn className="md:sticky md:top-24">
              <section
                aria-labelledby="now-heading"
                className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm"
              >
                <h2
                  id="now-heading"
                  className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase"
                >
                  <span aria-hidden className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  {about.nowHeading}
                </h2>
                <p className="text-lg leading-snug font-medium tracking-tight text-pretty">
                  {about.currentlyWorkingOn}
                </p>
              </section>
            </FadeIn>
          )}
          {about.body && (
            <FadeIn delay={0.1}>
              <Markdown className="prose-lg max-w-[68ch]">{about.body}</Markdown>
            </FadeIn>
          )}
        </Container>
      )}

      {about.skills.length > 0 && (
        <section aria-labelledby="skills-heading">
          <Container className="pb-16 sm:pb-24">
            <SectionHeading id="skills-heading">{about.skillsHeading}</SectionHeading>
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {about.skills.map((skill, i) => (
                <StaggerItem key={`${skill.name}-${i}`} className="h-full">
                  <article className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                    {resolveFaIcon(skill.icon) && (
                      <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <FaIcon value={skill.icon} className="size-5" />
                      </span>
                    )}
                    <h3 className="text-lg font-semibold tracking-tight">{skill.name}</h3>
                    {skill.description && (
                      <Markdown className="prose-sm text-muted-foreground">{skill.description}</Markdown>
                    )}
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      {about.tech.length > 0 && (
        <section aria-labelledby="toolbox-heading">
          <Container className="pb-20 sm:pb-28">
            <SectionHeading id="toolbox-heading">{about.toolboxHeading}</SectionHeading>
            <FadeIn>
              <ul className="flex flex-wrap gap-2.5">
                {about.tech.map((tech, i) => {
                  const chip = (
                    <>
                      <FaIcon value={tech.icon} className="size-4 text-brand" />
                      {tech.name}
                      {tech.link && (
                        <ArrowUpRightIcon aria-hidden className="size-3.5 text-muted-foreground" />
                      )}
                    </>
                  );
                  const chipClass =
                    "inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium shadow-xs";
                  return (
                    <li key={`${tech.name}-${i}`}>
                      {tech.link ? (
                        <a
                          href={tech.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(chipClass, "transition-colors hover:border-brand/40 hover:bg-accent")}
                        >
                          {chip}
                        </a>
                      ) : (
                        <span className={chipClass}>{chip}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </FadeIn>
          </Container>
        </section>
      )}
    </>
  );
}

function Intro({ about }: { about: About }) {
  const position = about.currentPosition;

  return (
    <section className="relative isolate overflow-hidden border-b">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)] bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60"
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-24 -z-10 size-[28rem] rounded-full bg-brand-1/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-32 -z-10 size-[22rem] rounded-full bg-brand-3/15 blur-3xl"
      />

      <Container
        className={cn(
          "grid items-center gap-12 py-14 sm:py-20 md:py-24",
          about.image && "md:grid-cols-[1.35fr_1fr] md:gap-16",
        )}
      >
        <FadeIn className="order-2 flex flex-col gap-6 md:order-1">
          <p className="inline-flex items-center gap-2 self-start rounded-full border bg-background/60 px-3 py-1.5 text-sm font-medium text-brand backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            {about.eyebrow}
          </p>
          {about.header && (
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {about.header}
            </h1>
          )}
          {position?.positionTitle && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
              <BriefcaseIcon aria-hidden className="size-4 text-brand" />
              <span>
                {position.positionTitle}
                {position.companyTitle && (
                  <>
                    {" at "}
                    {position.companyLink ? (
                      <a
                        href={position.companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand underline-offset-4 hover:underline"
                      >
                        {position.companyTitle}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">{position.companyTitle}</span>
                    )}
                  </>
                )}
              </span>
              {position.since && (
                <span className="text-muted-foreground/80">· since {formatDate(position.since)}</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {about.resume && (
              <Button asChild size="lg">
                <a href={about.resume.href} target="_blank" rel="noopener noreferrer">
                  <FileTextIcon aria-hidden />
                  {about.resume.label}
                </a>
              </Button>
            )}
            {about.coverLetter && (
              <Button asChild size="lg" variant="outline">
                <a href={about.coverLetter.href} target="_blank" rel="noopener noreferrer">
                  <MailIcon aria-hidden />
                  {about.coverLetter.label}
                </a>
              </Button>
            )}
            <SocialLinks about={about} withResume={false} />
          </div>
        </FadeIn>

        {about.image && (
          <FadeIn
            delay={0.1}
            className="order-1 mx-auto w-full max-w-[16rem] sm:max-w-xs md:order-2 md:max-w-sm"
          >
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-1/40 to-brand-3/30 blur-2xl"
              />
              <StrapiImage
                image={about.image}
                priority
                sizes="(min-width: 768px) 380px, 80vw"
                className="aspect-[4/5] w-full rounded-3xl border object-cover shadow-xl"
              />
            </div>
          </FadeIn>
        )}
      </Container>
    </section>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">
      {children}
    </h2>
  );
}
