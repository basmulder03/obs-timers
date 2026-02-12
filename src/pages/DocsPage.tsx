import { useMemo } from "react";
import { marked } from "marked";
import { Link, useParams } from "react-router-dom";

const modules = import.meta.glob("../../docs-src/*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

const docs = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "doc";
    const titleLine = raw.split(/\r?\n/).find((line) => line.startsWith("# "));
    const title = titleLine ? titleLine.slice(2).trim() : slug;
    return { slug, title, raw };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export function DocsPage() {
  const { slug } = useParams();
  const current = useMemo(() => docs.find((doc) => doc.slug === slug) ?? docs[0], [slug]);
  const html = useMemo(() => marked.parse(current?.raw ?? "# No docs"), [current]);

  return (
    <main className="container">
      <section className="panel" style={{ marginBottom: "0.9rem" }}>
        <h1>Docs</h1>
        <div className="actions">
          {docs.map((doc) => (
            <Link key={doc.slug} to={`/docs/${doc.slug}`}>
              {doc.title}
            </Link>
          ))}
        </div>
      </section>

      <article className="doc" dangerouslySetInnerHTML={{ __html: String(html) }}></article>
    </main>
  );
}
