import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAbout, getCategories, getSearchIndex } from "@/lib/strapi";
import { getStrapiMedia } from "@/lib/media";
import { SITE_URL, getSiteInfo } from "@/lib/site";
import { pastelScript } from "@/lib/pastel";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { name, description, global } = await getSiteInfo();
  const favicon = getStrapiMedia(global?.favicon, { public: true });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description,
    icons: favicon ? { icon: favicon } : undefined,
    alternates: { types: { "application/rss+xml": "/rss.xml" } },
    openGraph: { type: "website", siteName: name },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ name }, categories, about, searchItems] = await Promise.all([
    getSiteInfo(),
    getCategories(),
    getAbout(),
    getSearchIndex(),
  ]);
  const gaId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets the per-visit pastel accent palette before first paint */}
        <script dangerouslySetInnerHTML={{ __html: pastelScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col font-sans`}>
        <Providers>
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-background px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <SiteHeader siteName={name} categories={categories} searchItems={searchItems} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter siteName={name} about={about} />
        </Providers>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
