import "server-only";
import { getGlobal } from "./ghost";

export const SITE_URL = (process.env.SITE_URL || "https://devinsipal.com").replace(/\/$/, "");

/** Site name and description from Ghost's site settings, with fallbacks */
export async function getSiteInfo() {
  const global = await getGlobal();
  return {
    name: global?.siteName || "devin sipal",
    description: global?.description ?? null,
    global,
  };
}
