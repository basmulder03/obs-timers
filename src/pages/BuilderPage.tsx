import { useMemo, useState } from "react";
import { defaultConfig } from "@/core/defaults";
import type { TimerConfig } from "@/types";
import { buildOverlayUrl } from "@/core/urlConfig";
import { deletePreset, listPresets, savePreset } from "@/core/storage";

export function BuilderPage() {
  const [config, setConfig] = useState<TimerConfig>(defaultConfig);
  const [presetName, setPresetName] = useState("");
  const [message, setMessage] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [version, setVersion] = useState(0);

  const presets = useMemo(() => listPresets(), [version]);
  const appBase = useMemo(() => new URL(import.meta.env.BASE_URL, window.location.origin), []);

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
    <main className="container">
      <section className="dashboard">
        <section className="panel">
          <h1>Builder</h1>
          <p className="muted">Build URLs, import/export JSON, and manage presets.</p>

          <div className="field-row">
            <label className="field">
              Type
              <select value={config.type} onChange={(e) => update("type", e.target.value as TimerConfig["type"])}>
                <option value="countdown">Countdown</option>
                <option value="stopwatch">Stopwatch</option>
                <option value="countup">Count Up</option>
                <option value="interval">Interval</option>
              </select>
            </label>
            <label className="field">
              Target
              <input value={config.target} onChange={(e) => update("target", e.target.value)} />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              Renderer
              <select value={config.renderer} onChange={(e) => update("renderer", e.target.value as TimerConfig["renderer"])}>
                <option value="classic">Classic</option>
                <option value="seven">Seven Segment</option>
                <option value="flip">Flip Cards</option>
                <option value="ring">Analog Ring</option>
                <option value="splitflap">Split-Flap</option>
              </select>
            </label>
            <label className="field">
              Show info strip
              <select value={config.showInfo ? "1" : "0"} onChange={(e) => update("showInfo", e.target.value === "1")}>
                <option value="0">Off</option>
                <option value="1">On</option>
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              Info text
              <input value={config.infoText} onChange={(e) => update("infoText", e.target.value)} />
            </label>
            <label className="field">
              Duration (countdown)
              <input type="number" value={config.duration} onChange={(e) => update("duration", Number(e.target.value))} />
            </label>
          </div>

          <h3>Presets</h3>
          <div className="field-row">
            <label className="field">
              Preset name
              <input value={presetName} onChange={(e) => setPresetName(e.target.value)} />
            </label>
            <label className="field">
              Saved presets
              <select value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)}>
                <option value="">Select preset</option>
                {presets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="actions">
            <button className="primary" type="button" onClick={save}>
              Save preset
            </button>
            <button type="button" onClick={load}>
              Load preset
            </button>
            <button type="button" onClick={remove}>
              Delete preset
            </button>
          </div>

          <h3>Import / Export</h3>
          <label className="field">
            JSON or overlay URL
            <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={7}></textarea>
          </label>
          <div className="actions">
            <button type="button" onClick={exportJson}>
              Export JSON
            </button>
            <button type="button" onClick={copyJson}>
              Copy JSON
            </button>
            <button className="primary" type="button" onClick={importAny}>
              Import
            </button>
            <button type="button" onClick={() => copy(JSON.stringify(shareTemplate, null, 2), "Copied share template.")}>
              Copy Share Template
            </button>
          </div>

          <p className="muted">{message}</p>
        </section>

        <section className="panel preview">
          <h2>Generated URLs</h2>
          <label className="field">
            Overlay URL
            <textarea readOnly value={fullTimerUrl}></textarea>
          </label>
          <div className="actions">
            <button className="primary" type="button" onClick={() => copy(fullTimerUrl)}>
              Copy Overlay URL
            </button>
          </div>
          <label className="field">
            Control URL
            <textarea readOnly value={controlUrl}></textarea>
          </label>
          <div className="actions">
            <button type="button" onClick={() => copy(controlUrl)}>
              Copy Control URL
            </button>
          </div>

          <iframe title="preview" src={fullTimerUrl}></iframe>
        </section>
      </section>
    </main>
  );
}
