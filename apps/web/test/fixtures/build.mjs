// Generates test/fixtures/*.json, the Strapi 5 (flat format) content served
// by test/mock-strapi.mjs. Re-run after editing: node test/fixtures/build.mjs
import { writeFileSync } from "node:fs";

const dir = new URL(".", import.meta.url);
const write = (name, data) => writeFileSync(new URL(name, dir), JSON.stringify(data, null, 2) + "\n");

const categories = [
  {
    id: 1,
    documentId: "cat-eng",
    title: "engineering",
    slug: "engineering",
    description: "Notes on building software.",
  },
  {
    id: 2,
    documentId: "cat-lab",
    title: "homelab",
    slug: "homelab",
    description: "Self-hosting and infrastructure.",
  },
];

const content = `Intro paragraph with **bold**, \`inline code\` and a [link](https://example.com).

## Getting started

${"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(40)}

\`\`\`ts
export function add(a: number, b: number) {
  return a + b;
}
\`\`\`

### A sub heading

- one
- two

| col | val |
| --- | --- |
| a | 1 |

## Wrapping up

> A quote to finish.
`;

const topics = [
  "Docker on a budget",
  "Next.js App Router migration",
  "Postgres tuning",
  "Traefik and Watchtower",
];
const posts = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 0, 1 + i * 5)).toISOString();
  return {
    id: i + 1,
    documentId: `post-${i + 1}`,
    title: `Post number ${i + 1}: ${topics[i % topics.length]}`,
    slug: `post-${i + 1}`,
    description: "A short description of what this post covers and why it matters to the reader.",
    content,
    published_date: date,
    publishedAt: date,
    updatedAt: date,
    cover: null,
    postHero: null,
    category: categories[i % 2],
  };
});
// Edge cases: a post with no category and no description
posts[13] = {
  ...posts[13],
  title: "Uncategorised post",
  slug: "uncategorised",
  category: null,
  description: null,
};

const projects = [
  {
    title: "Portfolio",
    tech: ["Next.js", "Strapi", "Docker"],
    featured: true,
    repoUrl: "https://github.com/example/portfolio",
  },
  { title: "Homelab", tech: ["Proxmox", "Traefik"], featured: true, repoUrl: null },
  // Malformed tech: an object with numeric keys, as an editor once entered it
  {
    title: "API service",
    tech: { 0: "NestJS", 1: "TypeScript", 2: "Postgres" },
    featured: true,
    repoUrl: null,
  },
  // New-style techStack component wins over the legacy JSON field
  {
    title: "CLI tool",
    techStack: [
      { id: 1, name: "Go" },
      { id: 2, name: "Cobra" },
    ],
    tech: ["ignored"],
    featured: false,
    repoUrl: "https://github.com/example/cli",
  },
].map((p, i) => ({
  id: i + 1,
  documentId: `project-${i + 1}`,
  slug: p.title.toLowerCase().replace(/\W+/g, "-"),
  summary: "A one-paragraph summary of the project, what it does and the stack.",
  description: null,
  image: null,
  link: "https://example.com",
  order: i,
  ...p,
}));

const about = {
  id: 1,
  documentId: "about",
  header: "Engineer who likes shipping small, sharp tools.",
  body: "I build things for the web.\n\nSecond paragraph.",
  image: null,
  github: "https://github.com/example",
  linkedIn: "https://linkedin.com/in/example",
  resumeUrl: null,
  currentlyWorkingOn: "This portfolio",
  currentPosition: {
    companyTitle: "Acme",
    positionTitle: "Software Engineer",
    since: "2024-03-01",
    companyLink: "https://example.com",
  },
};

const global = {
  id: 1,
  documentId: "global",
  SiteName: "devin sipal",
  favicon: null,
  defaultSeo: {
    MetaTitle: "devin sipal",
    MetaDescription: "Software engineer writing about the web and self-hosting.",
    shareImage: null,
  },
};

write("categories.json", categories);
write("posts.json", posts);
write("projects.json", projects);
write("about.json", about);
write("global.json", global);
