import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { defaultConfig } from "@/core/defaults";
import { parseConfigFromSearch } from "@/core/urlConfig";
import { sharedConfigSchema, type SharedConfig } from "@/core/sharedSchema";
import type { TimerConfig, TimerType } from "@/types";
import { RendererView } from "@/renderers/RendererView";
import styles from "@/pages/CommunityPage.module.scss";

interface WarningItem {
  fileName: string;
  reason: string;
}

export function CommunityPage() {
  const [items, setItems] = useState<SharedConfig[]>([]);
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState<Record<string, boolean>>({});

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
    <main className={styles.container}>
      <section className={styles.panel} style={{ marginBottom: "0.9rem" }}>
        <h1>Community</h1>
        <p className={styles.muted}>Shared configurations loaded from separate JSON files.</p>
      </section>

      <section className={styles.cards}>
        {warnings.map((warning) => (
          <article key={`warn-${warning.fileName}`} className={`${styles.card} ${styles.cardWarning}`}>
            <h3>Invalid shared entry</h3>
            <p>
              <strong>File:</strong> <code>{warning.fileName}</code>
            </p>
            <p className={styles.muted}>{warning.reason}</p>
          </article>
        ))}

        {items.map((item) => {
          const previewConfig = parseItemPreviewConfig(item);
          const previewState = getPreviewState(previewConfig);
          const previewThemeClass = previewConfig.theme === "amber" ? styles.themeAmber : previewConfig.theme === "ice" ? styles.themeIce : "";
          const previewStyle = {
            ["--preview-text-color" as string]: previewConfig.color,
            ["--preview-font-family" as string]: `"${previewConfig.font}", "Segoe UI", sans-serif`,
            ["--preview-shadow" as string]: previewConfig.shadow ? "0 5px 18px var(--shadow-color)" : "none"
          } as CSSProperties;

          return (
            <article key={item.id} className={styles.card}>
              <h3>{item.title}</h3>
              <p className={styles.muted}>{item.description}</p>
              <p>
                <strong>Type:</strong> {item.timerType}
              </p>
              <p>
                <strong>By:</strong> {item.author}
              </p>
              <div className={styles.tagRow}>
                {item.tags.map((tag) => (
                  <span className={styles.tag} key={`${item.id}-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.actions}>
                <button className={styles.button} type="button" onClick={() => setPreviewOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
                  {previewOpen[item.id] ? "Hide Preview" : "Show Preview"}
                </button>
                <a className={styles.link} href={resolveItemUrl(item.url)}>
                  Open Timer URL
                </a>
              </div>
              {previewOpen[item.id] ? (
                <section className={`${styles.previewFrame} ${previewConfig.bg === "solid" ? styles.previewSolidBg : styles.previewTransparentBg} ${previewThemeClass}`} style={previewStyle}>
                  <div className={styles.previewText} style={{ fontSize: `${Math.max(34, Math.min(previewConfig.size, 120))}px` }}>
                    <RendererView
                      renderer={previewConfig.renderer}
                      text={previewState.text}
                      progress={previewState.progress}
                      segmentGlow={previewConfig.segmentGlow}
                      flipSpeed={previewConfig.flipSpeed}
                      flapSpeed={previewConfig.flapSpeed}
                      ringThickness={previewConfig.ringThickness}
                      ringTicks={previewConfig.ringTicks}
                    />
                  </div>
                  <div className={styles.previewLabel}>{previewState.label}</div>
                  {previewState.round ? <div className={styles.previewRound}>{previewState.round}</div> : null}
                  {previewConfig.showInfo ? <div className={`${styles.previewInfo} ${styles[previewConfig.infoStyle]}`}>{previewConfig.infoText || `${previewState.label} | ${previewConfig.target}`}</div> : null}
                </section>
              ) : null}
            </article>
          );
        })}

        {!items.length && !warnings.length ? (
          <article className={styles.card}>
            <h3>No shared configs yet</h3>
            <p className={styles.muted}>Open a PR to add one.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}

function parseItemPreviewConfig(item: SharedConfig): TimerConfig {
  const resolvedUrl = resolveItemUrl(item.url);
  try {
    const url = new URL(resolvedUrl);
    const match = url.pathname.match(/\/overlay\/(countdown|stopwatch|countup|interval)$/);
    const timerType = (match?.[1] ?? item.timerType ?? defaultConfig.type) as TimerType;
    return parseConfigFromSearch(timerType, url.search);
  } catch {
    return { ...defaultConfig, type: item.timerType };
  }
}

function getPreviewState(config: TimerConfig): { text: string; label: string; round: string; progress: number } {
  if (config.type === "countdown") {
    return { text: "18:22", label: "Countdown", round: "", progress: 0.33 };
  }
  if (config.type === "countup") {
    return { text: "00:39:17", label: "Count Up", round: "", progress: 0.41 };
  }
  if (config.type === "interval") {
    return { text: "00:30", label: "Work", round: `Round 2/${config.rounds}`, progress: 0.72 };
  }
  return { text: "00:07:54", label: "Stopwatch", round: "", progress: 0.13 };
}

function resolveItemUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  return new URL(url.replace(/^\//, ""), base).toString();
}
