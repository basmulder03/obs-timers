import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docsSrcDir = path.join(root, "docs-src");
const docsOutDir = path.join(root, "docs");

await fs.mkdir(docsOutDir, { recursive: true });

const sourceFiles = (await fs.readdir(docsSrcDir)).filter((name) => name.endsWith(".md")).sort();
const pages = [];

for (const fileName of sourceFiles) {
  const filePath = path.join(docsSrcDir, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const slug = fileName.replace(/\.md$/, "");
  const title = readTitle(raw) || toTitle(slug);
  const body = renderMarkdown(raw);
  const html = renderDocHtml({ title, body, pages: sourceFiles.map((item) => item.replace(/\.md$/, "")), current: slug });
  await fs.writeFile(path.join(docsOutDir, `${slug}.html`), html, "utf8");
  pages.push({ slug, title });
}

const indexBody = `
<h1>Documentation</h1>
<p>Guides generated from markdown files in <code>docs-src/</code>.</p>
<ul>
${pages.map((item) => `  <li><a href="${item.slug}.html">${escapeHtml(item.title)}</a></li>`).join("\n")}
</ul>
`.trim();

await fs.writeFile(
  path.join(docsOutDir, "index.html"),
  renderDocHtml({ title: "Documentation", body: indexBody, pages: pages.map((item) => item.slug), current: "index" }),
  "utf8"
);

function renderDocHtml({ title, body }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} | OBS Timers Docs</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../assets/css/base.css" />
    <link rel="stylesheet" href="../assets/css/themes.css" />
    <link rel="stylesheet" href="../assets/css/site.css" />
  </head>
  <body class="solid-bg theme-steel">
    <header class="site-nav">
      <div><strong>OBS Timers</strong></div>
      <nav class="links">
        <a href="../index.html">Builder</a>
        <a href="../community/index.html">Community</a>
        <a class="active" href="index.html">Docs</a>
      </nav>
    </header>
    <main class="container">
      <article class="doc">${body}</article>
    </main>
  </body>
</html>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let inCode = false;
  let codeLines = [];
  let listItems = [];

  function flushList() {
    if (!listItems.length) {
      return;
    }
    const items = listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    blocks.push(`<ul>${items}</ul>`);
    listItems = [];
  }

  function flushCode() {
    if (!codeLines.length) {
      return;
    }
    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = [];
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      listItems.push(line.replace(/^\s*-\s+/, ""));
      continue;
    }

    flushList();

    if (!line.trim()) {
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }

    blocks.push(`<p>${escapeInline(line)}</p>`);
  }

  flushList();
  flushCode();
  return blocks.join("\n");
}

function escapeInline(input) {
  const escaped = escapeHtml(input);
  return escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
}

function escapeHtml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readTitle(markdown) {
  const line = markdown.split(/\r?\n/).find((item) => item.startsWith("# "));
  return line ? line.slice(2).trim() : "";
}

function toTitle(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
