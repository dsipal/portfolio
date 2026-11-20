import path from "node:path";
import type { NextConfig } from "next";

// pnpm workspace root: dependencies are hoisted there, so standalone output
// must trace from it (server.js lands at .next/standalone/apps/web/)
const workspaceRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  turbopack: { root: workspaceRoot },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "strapi" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.devinsipal.com" },
    ],
  },
};

export default nextConfig;
