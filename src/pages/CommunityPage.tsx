import { useEffect, useState } from "react";
import { sharedConfigSchema, type SharedConfig } from "@/core/sharedSchema";

interface WarningItem {
  fileName: string;
  reason: string;
}

export function CommunityPage() {
  const [items, setItems] = useState<SharedConfig[]>([]);
  const [warnings, setWarnings] = useState<WarningItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const indexRes = await fetch(`${import.meta.env.BASE_URL}data/shared/index.json`, { cache: "no-store" });
        const indexJson = (await indexRes.json()) as { items?: string[] };
        const files = Array.isArray(indexJson.items) ? indexJson.items : [];

        const settled = await Promise.allSettled(
          files.map(async (fileName) => {
            const res = await fetch(`${import.meta.env.BASE_URL}data/shared/${fileName}`, { cache: "no-store" });
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }
            return { fileName, data: await res.json() };
          })
        );

        const ok: SharedConfig[] = [];
        const bad: WarningItem[] = [];

        settled.forEach((result, index) => {
          const fileName = files[index] ?? "unknown.json";
          if (result.status === "rejected") {
            bad.push({ fileName, reason: result.reason instanceof Error ? result.reason.message : "Could not load" });
            return;
          }
          const parsed = sharedConfigSchema.safeParse(result.value.data);
          if (!parsed.success) {
            bad.push({
              fileName,
              reason: parsed.error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; ")
            });
            return;
          }
          ok.push(parsed.data);
        });

        if (!cancelled) {
          setItems(ok);
          setWarnings(bad);
        }
      } catch {
        if (!cancelled) {
          setWarnings([{ fileName: "index.json", reason: "Could not load community index." }]);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="container">
      <section className="panel" style={{ marginBottom: "0.9rem" }}>
        <h1>Community</h1>
        <p className="muted">Shared configurations loaded from separate JSON files.</p>
      </section>

      <section className="cards">
        {warnings.map((warning) => (
          <article key={`warn-${warning.fileName}`} className="card card-warning">
            <h3>Invalid shared entry</h3>
            <p>
              <strong>File:</strong> <code>{warning.fileName}</code>
            </p>
            <p className="muted">{warning.reason}</p>
          </article>
        ))}

        {items.map((item) => (
          <article key={item.id} className="card">
            <h3>{item.title}</h3>
            <p className="muted">{item.description}</p>
            <p>
              <strong>Type:</strong> {item.timerType}
            </p>
            <p>
              <strong>By:</strong> {item.author}
            </p>
            <div className="tag-row">
              {item.tags.map((tag) => (
                <span className="tag" key={`${item.id}-${tag}`}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="actions" style={{ marginTop: "0.75rem" }}>
              <a href={resolveItemUrl(item.url)}>Open Timer URL</a>
            </div>
          </article>
        ))}

        {!items.length && !warnings.length ? (
          <article className="card">
            <h3>No shared configs yet</h3>
            <p className="muted">Open a PR to add one.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}

function resolveItemUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  return new URL(url.replace(/^\//, ""), base).toString();
}
