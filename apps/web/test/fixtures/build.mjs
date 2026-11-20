// Generates test/fixtures/*.json, the Ghost Content API content served by
// test/mock-ghost.mjs. Re-run after editing: node test/fixtures/build.mjs
import { writeFileSync } from "node:fs";

const dir = new URL(".", import.meta.url);
const write = (name, data) => writeFileSync(new URL(name, dir), JSON.stringify(data, null, 2) + "\n");

const tag = (id, name, slug, description = null, visibility = "public") => ({
  id,
  name,
  slug,
  description,
  visibility,
});

const tags = [
  tag("tag-eng", "engineering", "engineering", "Notes on building software."),
  tag("tag-lab", "homelab", "homelab", "Self-hosting and infrastructure."),
];
// Internal tag marking project pages; never listed as a category
const projectTag = tag("tag-project", "#project", "hash-project", null, "internal");

// Ghost's rendered HTML: headings carry ids, code cards have language-* classes
const html = `<p>Intro paragraph with <strong>bold</strong>, <code>inline code</code> and a <a href="https://example.com">link</a>.</p>
<h2 id="getting-started">Getting started</h2>
<p>${"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(40).trim()}</p>
<pre><code class="language-ts">export function add(a: number, b: number) {
  return a + b;
}
</code></pre>
<h3 id="a-sub-heading">A sub heading</h3>
<ul><li>one</li><li>two</li></ul>
<table><thead><tr><th>col</th><th>val</th></tr></thead><tbody><tr><td>a</td><td>1</td></tr></tbody></table>
<h2 id="wrapping-up">Wrapping up</h2>
<blockquote>A quote to finish.</blockquote>`;

const topics = [
  "Docker on a budget",
  "Next.js App Router migration",
  "Postgres tuning",
  "Traefik and Watchtower",
];
const posts = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 0, 1 + i * 5)).toISOString();
  const postTags = [tags[i % 2]];
  return {
    id: `post-${i + 1}`,
    title: `Post number ${i + 1}: ${topics[i % topics.length]}`,
    slug: `post-${i + 1}`,
    custom_excerpt: "A short description of what this post covers and why it matters to the reader.",
    html,
    published_at: date,
    updated_at: date,
    feature_image: null,
    feature_image_alt: null,
    reading_time: 2,
    tags: postTags,
    primary_tag: postTags[0],
  };
});
// Edge cases: a post with no tag and no excerpt
posts[13] = {
  ...posts[13],
  title: "Uncategorised post",
  slug: "uncategorised",
  tags: [],
  primary_tag: null,
  custom_excerpt: null,
};

/** Page data as an editor pastes it into Code injection → Site header */
const pageData = (data) => `<script type="application/json">\n${JSON.stringify(data, null, 2)}\n</script>`;

const page = (fields) => ({
  html: "",
  custom_excerpt: null,
  excerpt: "",
  feature_image: null,
  feature_image_alt: null,
  featured: false,
  codeinjection_head: null,
  tags: [],
  ...fields,
});

const projects = [
  {
    title: "Portfolio",
    featured: true,
    data: { tech: ["Next.js", "Ghost", "Docker"], repoUrl: "https://github.com/example/portfolio" },
  },
  { title: "Homelab", featured: true, data: { tech: ["Proxmox", "Traefik"] } },
  // A blank item and stray whitespace, as an editor might leave them
  { title: "API service", featured: true, data: { tech: [" NestJS ", "", "TypeScript", "Postgres"] } },
  { title: "CLI tool", featured: false, data: { tech: ["Go", "Cobra"], repoUrl: "https://github.com/example/cli" } },
].map((p, i) => {
  const slug = p.title.toLowerCase().replace(/\W+/g, "-");
  return page({
    id: `project-${i + 1}`,
    title: p.title,
    slug,
    custom_excerpt: "A one-paragraph summary of the project, what it does and the stack.",
    featured: p.featured,
    tags: [projectTag],
    codeinjection_head: pageData({ link: "https://example.com", order: i, ...p.data }),
  });
});
// Malformed page data: logged on the server, the project renders with defaults
projects.push(
  page({
    id: "project-broken",
    title: "Broken data",
    slug: "broken-data",
    excerpt: "Its page data isn't valid JSON.",
    tags: [projectTag],
    codeinjection_head: '<script type="application/json">{ "tech": ["Oops", }</script>',
  }),
);

const about = page({
  id: "page-about",
  title: "Engineer who likes shipping small, sharp tools.",
  slug: "about",
  html: "<p>I build things for the web.</p>\n<p>Second paragraph.</p>",
  codeinjection_head: pageData({
    eyebrow: "About me",
    github: "https://github.com/example",
    linkedIn: "https://linkedin.com/in/example",
    resume: "https://example.com/resume.pdf",
    // A file uploaded to Ghost: site-relative paths get the public Ghost URL
    coverLetter: { url: "/content/files/cover_letter.pdf", label: "Cover letter" },
    currentPosition: {
      companyTitle: "Acme",
      positionTitle: "Software Engineer",
      since: "2024-03-01",
      companyLink: "https://example.com",
    },
    nowHeading: "Now",
    currentlyWorkingOn: "This portfolio",
    skillsHeading: "What I do",
    skills: [
      { name: "Web applications", description: "Server-rendered React front ends.", icon: "fa-solid code" },
      { name: "Infrastructure", description: "Containers and **CI**.", icon: "fa-solid server" },
      // Unknown icon: the card renders without one
      { name: "Writing", description: null, icon: "fa-solid not-a-real-icon" },
    ],
    toolboxHeading: "Toolbox",
    tech: [
      { name: "TypeScript", link: "https://www.typescriptlang.org", icon: "fa-brands js" },
      { name: "Docker", link: null, icon: "fa-brands docker" },
      // Invalid link: rendered as a plain chip
      { name: "Postgres", link: "not a url", icon: null },
    ],
  }),
});

const home = page({
  id: "page-home",
  title: "Home",
  slug: "home",
  codeinjection_head: pageData({
    heroGreeting: "Hi, I'm",
    heroSubheading: "I build fast, dependable web apps and the infrastructure under them.",
    availability: "  Freelance & contract work  ",
  }),
});

const settings = {
  title: "devin sipal",
  description: "Thoughts, stories and ideas.",
  icon: null,
  og_image: null,
  meta_title: "devin sipal",
  meta_description: "Software engineer writing about the web and self-hosting.",
};

write("tags.json", [...tags, projectTag]);
write("posts.json", posts);
write("pages.json", [...projects, about, home]);
write("settings.json", settings);
