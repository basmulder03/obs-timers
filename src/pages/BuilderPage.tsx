import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { defaultConfig } from "@/core/defaults";
import type { TimerConfig } from "@/types";
import { buildOverlayUrl } from "@/core/urlConfig";
import { deletePreset, listPresets, savePreset } from "@/core/storage";
import { useDynamicFont } from "@/core/useDynamicFont";
import { RendererView } from "@/renderers/RendererView";
import styles from "@/pages/BuilderPage.module.scss";

export function BuilderPage() {
  const [config, setConfig] = useState<TimerConfig>(defaultConfig);
  const [presetName, setPresetName] = useState("");
  const [message, setMessage] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [version, setVersion] = useState(0);

  const presets = useMemo(() => listPresets(), [version]);
  const appBase = useMemo(() => new URL(import.meta.env.BASE_URL, window.location.origin), []);
  const fontState = useDynamicFont(config.font, config.fontUrl);

  const toAppUrl = (path: string) => {
    const normalized = path.startsWith("/") ? path.slice(1) : path;
    return new URL(normalized, appBase).toString();
  };

  const timerUrl = useMemo(() => buildOverlayUrl(config), [config]);
  const fullTimerUrl = toAppUrl(timerUrl);
  const controlUrl = useMemo(
    () => toAppUrl(`/control?cmd=toggle&target=${encodeURIComponent(config.target)}&syncToken=${Date.now()}`),
    [config.target]
  );
  const previewState = useMemo(() => getPreviewState(config), [config]);
  const previewThemeClass = config.theme === "amber" ? styles.themeAmber : config.theme === "ice" ? styles.themeIce : "";
  const previewStyle = {
    ["--preview-text-color" as string]: config.color,
    ["--preview-font-family" as string]: `"${fontState.resolvedFamily}", "${config.font}", "Segoe UI", sans-serif`,
    ["--preview-shadow" as string]: config.shadow ? "0 5px 18px var(--shadow-color)" : "none"
  } as CSSProperties;

  const update = <K extends keyof TimerConfig>(key: K, value: TimerConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const copy = async (value: string, ok = "Copied to clipboard.") => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(ok);
    } catch {
      setMessage("Could not copy to clipboard.");
    }
  };

  const exportJson = () => {
    const text = JSON.stringify(config, null, 2);
    setJsonInput(text);
    setMessage("Exported current config JSON.");
  };

  const copyJson = () => {
    const text = JSON.stringify(config, null, 2);
    setJsonInput(text);
    void copy(text);
  };

  const importAny = () => {
    const input = jsonInput.trim();
    if (!input) {
      setMessage("Paste config JSON or overlay URL first.");
      return;
    }

    if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("/overlay/")) {
      try {
        const url = input.startsWith("http") ? new URL(input) : new URL(input, window.location.origin);
        const params = new URLSearchParams(url.search);
        const next: TimerConfig = { ...defaultConfig };
        const match = url.pathname.match(/\/overlay\/(countdown|stopwatch|countup|interval)$/);
        if (match) {
          next.type = match[1] as TimerConfig["type"];
        }
        for (const key of Object.keys(defaultConfig) as Array<keyof TimerConfig>) {
          const raw = params.get(String(key));
          if (raw === null) {
            continue;
          }
          const template = defaultConfig[key];
          if (typeof template === "boolean") {
            (next as unknown as Record<string, unknown>)[String(key)] = ["1", "true", "on", "yes"].includes(raw.toLowerCase());
          } else if (typeof template === "number") {
            const num = Number(raw);
            if (Number.isFinite(num)) {
              (next as unknown as Record<string, unknown>)[String(key)] = num;
            }
          } else {
            (next as unknown as Record<string, unknown>)[String(key)] = raw;
          }
        }
        setConfig(next);
        setMessage("Imported settings from URL.");
      } catch {
        setMessage("Could not parse URL.");
      }
      return;
    }

    try {
      const parsed = JSON.parse(input) as Partial<TimerConfig>;
      setConfig({ ...defaultConfig, ...parsed });
      setMessage("Imported JSON config.");
    } catch {
      setMessage("Could not parse config JSON.");
    }
  };

  const save = () => {
    if (!presetName.trim()) {
      setMessage("Enter a preset name.");
      return;
    }
    savePreset(presetName, config);
    setVersion((v) => v + 1);
    setSelectedPreset(presetName);
    setMessage(`Saved preset \"${presetName}\".`);
  };

  const load = () => {
    const found = presets.find((item) => item.name === selectedPreset);
    if (!found) {
      setMessage("Preset not found.");
      return;
    }
    setConfig(found.config);
    setMessage(`Loaded preset \"${selectedPreset}\".`);
  };

  const remove = () => {
    deletePreset(selectedPreset);
    setVersion((v) => v + 1);
    setSelectedPreset("");
    setMessage("Deleted preset.");
  };

  const shareTemplate = {
    fileName: "my-preset.json",
    id: `preset-${Date.now()}`,
    title: "My Preset",
    author: "your-github-handle",
    description: "Add a short description.",
    timerType: config.type,
    url: fullTimerUrl,
    tags: [config.renderer, config.type],
    createdAt: new Date().toISOString()
  };

  return (
    <main className={styles.container}>
      <section className={styles.dashboard}>
        <section className={styles.panel}>
          <h1>Builder</h1>
          <p className={styles.muted}>Build URLs, import/export JSON, and manage presets.</p>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              Type
              <select className={styles.control} value={config.type} onChange={(e) => update("type", e.target.value as TimerConfig["type"])}>
                <option value="countdown">Countdown</option>
                <option value="stopwatch">Stopwatch</option>
                <option value="countup">Count Up</option>
                <option value="interval">Interval</option>
              </select>
            </label>
            <label className={styles.field}>
              Target
              <input className={styles.control} value={config.target} onChange={(e) => update("target", e.target.value)} />
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              Renderer
              <select className={styles.control} value={config.renderer} onChange={(e) => update("renderer", e.target.value as TimerConfig["renderer"])}>
                <option value="classic">Classic</option>
                <option value="seven">Seven Segment</option>
                <option value="flip">Flip Cards</option>
                <option value="ring">Analog Ring</option>
                <option value="splitflap">Split-Flap</option>
              </select>
            </label>
            <label className={styles.field}>
              Show info strip
              <select className={styles.control} value={config.showInfo ? "1" : "0"} onChange={(e) => update("showInfo", e.target.value === "1")}>
                <option value="0">Off</option>
                <option value="1">On</option>
              </select>
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              Font family
              <input className={styles.control} value={config.font} onChange={(e) => update("font", e.target.value)} placeholder="Barlow Condensed" />
            </label>
            <label className={styles.field}>
              Font URL (optional)
              <input className={styles.control} value={config.fontUrl} onChange={(e) => update("fontUrl", e.target.value)} placeholder="https://.../font.css or .woff2" />
            </label>
          </div>

          <div className={styles.fontStatus}>
            <span
              className={`${styles.statusDot} ${
                fontState.status === "loaded"
                  ? styles.statusLoaded
                  : fontState.status === "loading"
                    ? styles.statusLoading
                    : fontState.status === "error"
                      ? styles.statusError
                      : styles.statusIdle
              }`}
            ></span>
            <span>
              Font status: {fontState.status}
              {fontState.message ? ` - ${fontState.message}` : ""}
            </span>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              Info text
              <input className={styles.control} value={config.infoText} onChange={(e) => update("infoText", e.target.value)} />
            </label>
            <label className={styles.field}>
              Duration (countdown)
              <input className={styles.control} type="number" value={config.duration} onChange={(e) => update("duration", Number(e.target.value))} />
            </label>
          </div>

          <h3>Presets</h3>
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              Preset name
              <input className={styles.control} value={presetName} onChange={(e) => setPresetName(e.target.value)} />
            </label>
            <label className={styles.field}>
              Saved presets
              <select className={styles.control} value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)}>
                <option value="">Select preset</option>
                {presets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.actions}>
            <button className={`${styles.button} ${styles.primary}`} type="button" onClick={save}>
              Save preset
            </button>
            <button className={styles.button} type="button" onClick={load}>
              Load preset
            </button>
            <button className={styles.button} type="button" onClick={remove}>
              Delete preset
            </button>
          </div>

          <h3>Import / Export</h3>
          <label className={styles.field}>
            JSON or overlay URL
            <textarea className={styles.control} value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={7}></textarea>
          </label>
          <div className={styles.actions}>
            <button className={styles.button} type="button" onClick={exportJson}>
              Export JSON
            </button>
            <button className={styles.button} type="button" onClick={copyJson}>
              Copy JSON
            </button>
            <button className={`${styles.button} ${styles.primary}`} type="button" onClick={importAny}>
              Import
            </button>
            <button className={styles.button} type="button" onClick={() => copy(JSON.stringify(shareTemplate, null, 2), "Copied share template.")}>
              Copy Share Template
            </button>
          </div>

          <p className={styles.muted}>{message}</p>
        </section>

        <section className={`${styles.panel} ${styles.preview}`}>
          <h2>Generated URLs</h2>
          <label className={styles.field}>
            Overlay URL
            <textarea className={styles.control} readOnly value={fullTimerUrl}></textarea>
          </label>
          <div className={styles.actions}>
            <button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => copy(fullTimerUrl)}>
              Copy Overlay URL
            </button>
          </div>
          <label className={styles.field}>
            Control URL
            <textarea className={styles.control} readOnly value={controlUrl}></textarea>
          </label>
          <div className={styles.actions}>
            <button className={styles.button} type="button" onClick={() => copy(controlUrl)}>
              Copy Control URL
            </button>
          </div>

          <section className={`${styles.previewCanvas} ${config.bg === "solid" ? styles.previewSolidBg : styles.previewTransparentBg} ${previewThemeClass}`} style={previewStyle}>
            <div className={styles.previewText} style={{ fontSize: `${Math.max(36, Math.min(config.size, 160))}px` }}>
              <RendererView
                renderer={config.renderer}
                text={previewState.text}
                progress={previewState.progress}
                segmentGlow={config.segmentGlow}
                flipSpeed={config.flipSpeed}
                flapSpeed={config.flapSpeed}
                ringThickness={config.ringThickness}
                ringTicks={config.ringTicks}
              />
            </div>
            <div className={styles.previewLabel}>{previewState.label}</div>
            {previewState.round ? <div className={styles.previewRound}>{previewState.round}</div> : null}
            {config.showInfo ? <div className={`${styles.previewInfo} ${styles[config.infoStyle]}`}>{config.infoText || `${previewState.label} | ${config.target}`}</div> : null}
          </section>
        </section>
      </section>
    </main>
  );
}

function getPreviewState(config: TimerConfig): { text: string; label: string; round: string; progress: number } {
  if (config.type === "countdown") {
    return { text: "24:59", label: "Countdown", round: "", progress: 0.42 };
  }
  if (config.type === "countup") {
    return { text: "01:14:32", label: "Count Up", round: "", progress: 0.54 };
  }
  if (config.type === "interval") {
    return { text: "00:45", label: "Work", round: `Round 1/${config.rounds}`, progress: 0.65 };
  }
  return { text: "00:12:08", label: "Stopwatch", round: "", progress: 0.2 };
}
