// Builds a static preview of the storefront for GitHub Pages and, with --publish,
// pushes it to the gh-pages branch. Preview only: there is no server on Pages, so
// orders and contact messages are not sent and the admin is left out.
//
// The app is not changed: the project is copied to .pages-build/, the server-only
// parts are removed from the copy, and the static site is written to
// .pages-build/out. Every page is marked noindex.
//
// Run: npm run pages:preview             (build only)
//      npm run pages:preview -- --publish (build and push to gh-pages)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIR = path.join(ROOT, ".pages-build");
const OUT = path.join(DIR, "out");
const BASE = process.env.PAGES_BASE_PATH ?? "/planetatapeta-website";
const SITE = process.env.PAGES_SITE_URL ?? `https://matija-kojovic.github.io${BASE}`;
const publish = process.argv.includes("--publish");

const SKIP = new Set(["node_modules", ".next", ".git", ".pages-build", ".claude", "out"]);
const PRIVATE = [/^\.env/, /^data\/database\/orders\.json$/, /^data\/database\/prices\.json$/, /^data\/uploads/];
const SERVER_ONLY = ["app/api", "app/admin", "app/uploads", "app/(shop)/product", "app/sitemap.js", "app/robots.js", "proxy.js"];

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: "inherit", ...opts });
const edit = (file, from, to) => {
  const p = path.join(DIR, file);
  const text = fs.readFileSync(p, "utf-8");
  if (!text.includes(from)) throw new Error(`Preview patch no longer applies to ${file}`);
  fs.writeFileSync(p, text.replace(from, to));
};

// 1. Copy the project, without dependencies, build output, secrets or customer data.
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR);
const keep = (src) => !PRIVATE.some((re) => re.test(path.relative(ROOT, src).split(path.sep).join("/")));
for (const entry of fs.readdirSync(ROOT)) {
  if (SKIP.has(entry)) continue;
  fs.cpSync(path.join(ROOT, entry), path.join(DIR, entry), { recursive: true, filter: keep });
}
fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(DIR, "node_modules"), "dir");
for (const p of SERVER_ONLY) fs.rmSync(path.join(DIR, p), { recursive: true, force: true });

// 2. Static export under the Pages path. Pages cannot resize images, so every
//    next/image import in the copy is pointed at a wrapper that serves the
//    original files (unoptimized) under the path.
fs.writeFileSync(
  path.join(DIR, "next.config.mjs"),
  `export default {
  output: "export",
  basePath: ${JSON.stringify(BASE)},
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: ${JSON.stringify(ROOT)} },
};
`,
);
fs.writeFileSync(
  path.join(DIR, "pages-image.js"),
  `import NextImage from "next/image";

export default function PagesImage({ src, ...props }) {
  const url = typeof src === "string" && src.startsWith("/") ? ${JSON.stringify(BASE)} + src : src;
  return <NextImage {...props} src={url} unoptimized />;
}
`,
);
const sources = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? sources(path.join(dir, e.name)) : e.name.endsWith(".js") ? [path.join(dir, e.name)] : []));
for (const file of [...sources(path.join(DIR, "app")), ...sources(path.join(DIR, "components"))]) {
  const text = fs.readFileSync(file, "utf-8");
  if (text.includes('from "next/image"')) fs.writeFileSync(file, text.replaceAll('from "next/image"', 'from "@/pages-image"'));
}

// 3. Keep the preview out of search engines and say what does not work.
edit("app/layout.js", "formatDetection: { telephone: false },", "formatDetection: { telephone: false },\n    robots: { index: false, follow: false },");
const contentFile = path.join(DIR, "data/database/content.json");
const content = JSON.parse(fs.readFileSync(contentFile, "utf-8"));
content.header = { ...content.header, announcement: "Pregled dizajna: porudžbine i poruke se odavde ne šalju." };
fs.writeFileSync(contentFile, JSON.stringify(content, null, 2));

// 4. Build.
run("npx", ["next", "build"], { cwd: DIR, env: { ...process.env, NEXT_PUBLIC_SITE_URL: SITE } });
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`\nStatic preview written to ${path.relative(ROOT, OUT)}/ (${SITE}/)`);

// 5. Publish: a new commit on top of gh-pages (a normal push, never a force-push).
if (publish) {
  const origin = execFileSync("git", ["remote", "get-url", "origin"], { cwd: ROOT, encoding: "utf-8" }).trim();
  const source = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf-8" }).trim();
  const git = (...args) => run("git", args, { cwd: OUT });
  git("init", "-q", "-b", "gh-pages");
  git("remote", "add", "origin", origin);
  try {
    git("fetch", "-q", "--depth", "1", "origin", "gh-pages");
    git("reset", "-q", "--soft", "FETCH_HEAD");
  } catch {
    console.log("No gh-pages branch yet; it will be created.");
  }
  git("add", "-A");
  git("commit", "-q", "-m", `Storefront preview from ${source}`);
  git("push", "origin", "gh-pages");
}
