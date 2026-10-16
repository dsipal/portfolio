import type { Metadata } from "next";
import { BriefcaseIcon, SparklesIcon } from "lucide-react";
import { Container } from "@/components/container";
import { FadeIn } from "@/components/motion";
import { Markdown } from "@/components/markdown";
import { SocialLinks } from "@/components/social-links";
import { StrapiImage } from "@/components/strapi-image";
import { getAbout } from "@/lib/strapi";
import { cn, formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return { title: "About", description: about?.header ?? undefined };
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

  const position = about.currentPosition;

  return (
    <Container className="max-w-5xl py-12 sm:py-16">
      <div className={cn("grid items-start gap-10 md:gap-14", about.image && "md:grid-cols-[2fr_3fr]")}>
        {about.image && (
          <FadeIn className="mx-auto w-full max-w-sm md:sticky md:top-24">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-1/30 to-brand-3/20 blur-2xl"
              />
              <StrapiImage
                image={about.image}
                priority
                sizes="(min-width: 768px) 380px, 90vw"
                className="aspect-[4/5] w-full rounded-3xl border object-cover shadow-xl"
                alt="Portrait"
              />
            </div>
            <SocialLinks about={about} className="mt-6 justify-center" />
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <p className="mb-3 text-sm font-medium text-brand">About me</p>
          {about.header && (
            <h1 className="mb-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {about.header}
            </h1>
          )}
          {about.body && <Markdown className="prose-lg">{about.body}</Markdown>}

          {(position?.positionTitle || about.currentlyWorkingOn) && (
            <dl className="mt-10 grid gap-4 sm:grid-cols-2">
              {position?.positionTitle && (
                <InfoCard icon={<BriefcaseIcon />} label="Currently">
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
                        position.companyTitle
                      )}
                    </>
                  )}
                  {position.since && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Since {formatDate(position.since)}
                    </span>
                  )}
                </InfoCard>
              )}
              {about.currentlyWorkingOn && (
                <InfoCard icon={<SparklesIcon />} label="Working on">
                  {about.currentlyWorkingOn}
                </InfoCard>
              )}
            </dl>
          )}
          {!about.image && <SocialLinks about={about} className="mt-8 -ml-2" />}
        </FadeIn>
      </div>
    </Container>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <dt className="mb-2 flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:text-brand">
        {icon}
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
