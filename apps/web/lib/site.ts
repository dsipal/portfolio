import "server-only";
import { getGlobal } from "./strapi";

export const SITE_URL = (process.env.SITE_URL || "https://devinsipal.com").replace(/\/$/, "");

/** Site name and description from the Strapi `global` single type, with fallbacks */
export async function getSiteInfo() {
  const global = await getGlobal();
  return {
    name: global?.SiteName || "devin sipal",
    description: global?.defaultSeo?.MetaDescription || null,
    global,
  };
}
