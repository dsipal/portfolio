#!/usr/bin/env node
// Runs `docker compose -f docker-compose.dev.yml <args>` from the repo root.
//
// On Windows, Compose (v5, which always builds through buildx bake) resolves
// the build context from the working directory but the Dockerfile through the
// filesystem, so a shell that reports the drive as "c:" (VS Code, Git Bash)
// produces "c:\..." for one and "C:\..." for the other. Bake compares them
// case-sensitively, decides the Dockerfile is outside the context and refuses
// with 'additional privileges requested: pass "--allow=fs.read=..."'. Passing
// the project directory with an upper-case drive letter keeps them consistent.
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..").replace(/^[a-z]:/, (d) => d.toUpperCase());

const { status, error } = spawnSync(
  "docker",
  ["compose", "--project-directory", root, "-f", resolve(root, "docker-compose.dev.yml"), ...process.argv.slice(2)],
  { stdio: "inherit" },
);
if (error) {
  console.error(error.message);
  process.exit(1);
}
process.exit(status ?? 1);
