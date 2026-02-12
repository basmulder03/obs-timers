import { deletePreset, listPresets, savePreset } from "../core/storage.js";
import { buildControlUrl, buildTimerUrl } from "../core/url-config.js";

const form = document.getElementById("config-form");
const timerUrlOutput = document.getElementById("timer-url");
const controlUrlOutput = document.getElementById("control-url");
const previewFrame = document.getElementById("preview-frame");
const presetSelect = document.getElementById("preset-select");
const presetNameInput = document.getElementById("preset-name");
const jsonInput = document.getElementById("config-json");
const messageEl = document.getElementById("message");

const sections = {
  countdown: document.getElementById("type-countdown"),
  countup: document.getElementById("type-countup"),
  interval: document.getElementById("type-interval")
};

const rendererSections = {
  seven: document.getElementById("renderer-seven"),
  flip: document.getElementById("renderer-flip"),
  ring: document.getElementById("renderer-ring"),
  splitflap: document.getElementById("renderer-splitflap")
};

const initialState = {
  type: "countdown",
  target: "main",
  autostart: true,
  showMs: false,
  font: "Barlow Condensed",
  color: "#F4F8FF",
  bg: "transparent",
  size: 140,
  shadow: true,
  theme: "steel",
  renderer: "classic",
  anim: true,
  motion: "normal",
  segmentGlow: true,
  flipSpeed: "normal",
  ringThickness: 12,
  ringTicks: false,
  flapSpeed: "normal",
  showInfo: false,
  infoText: "",
  infoPosition: "tr",
  infoStyle: "chip",
  duration: 300,
  endMode: "stop",
  start: 0,
  work: 1500,
  rest: 300,
  rounds: 4,
  autoNext: true,
  finalMode: "stop",
  cmd: "toggle"
};

hydrateForm(initialState);
refreshPresetList();
render();

form.addEventListener("input", render);

bind("copy-timer-url", () => copyText(timerUrlOutput.value));
bind("copy-control-url", () => copyText(controlUrlOutput.value));

bind("save-preset", () => {
  const state = readForm();
  const presetName = String(presetNameInput.value || "").trim();
  if (!presetName) {
    setMessage("Enter a preset name.");
    return;
  }

  savePreset(presetName, state);
  refreshPresetList();
  presetSelect.value = presetName;
  setMessage(`Saved preset \"${presetName}\".`);
});

bind("load-preset", () => {
  const selected = presetSelect.value;
  if (!selected) {
    setMessage("Select a preset first.");
    return;
  }

  const preset = listPresets().find((item) => item.name === selected);
  if (!preset) {
    setMessage("Preset not found.");
    return;
  }

  hydrateForm(preset.config);
  render();
  setMessage(`Loaded preset \"${selected}\".`);
});

bind("delete-preset", () => {
  const selected = presetSelect.value;
  if (!selected) {
    setMessage("Select a preset to delete.");
    return;
  }

  deletePreset(selected);
  refreshPresetList();
  setMessage(`Deleted preset \"${selected}\".`);
});

bind("export-config", () => {
  const state = readForm();
  jsonInput.value = JSON.stringify(state, null, 2);
  setMessage("Exported current config JSON.");
});

bind("copy-config-json", () => {
  const state = readForm();
  const json = JSON.stringify(state, null, 2);
  jsonInput.value = json;
  copyText(json);
});

bind("import-config", () => {
  const input = String(jsonInput.value || "").trim();
  if (!input) {
    setMessage("Paste config JSON or a timer URL first.");
    return;
  }

  if (input.startsWith("http://") || input.startsWith("https://") || input.includes("timers/")) {
    importFromUrl(input);
    return;
  }

  try {
    const parsed = JSON.parse(input);
    hydrateForm({ ...initialState, ...parsed });
    render();
    setMessage("Imported JSON config.");
  } catch {
    setMessage("Could not parse config JSON.");
  }
});

bind("copy-share-template", () => {
  const state = readForm();
  const payload = {
    fileName: "my-preset.json",
    id: `preset-${Date.now()}`,
    title: "My Preset",
    author: "your-github-handle",
    description: "Add a short description.",
    timerType: state.type,
    url: timerUrlOutput.value,
    tags: [state.renderer, state.type],
    createdAt: new Date().toISOString()
  };
  jsonInput.value = JSON.stringify(payload, null, 2);
  copyText(jsonInput.value);
});

function render() {
  const state = readForm();
  setSectionVisibility(state.type);
  setRendererSectionVisibility(state.renderer);

  const basePath = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  const timerUrl = new URL(buildTimerUrl(state.type, state, basePath), window.location.origin).toString();
  const controlUrl = new URL(
    buildControlUrl(
      {
        cmd: state.cmd,
        target: state.target,
        syncToken: Date.now()
      },
      basePath
    ),
    window.location.origin
  ).toString();

  timerUrlOutput.value = timerUrl;
  controlUrlOutput.value = controlUrl;
  previewFrame.src = timerUrl;
}

function importFromUrl(raw) {
  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(raw, window.location.origin);
    const params = url.searchParams;
    const state = { ...initialState };

    for (const [key, value] of params.entries()) {
      if (!(key in state)) {
        continue;
      }
      state[key] = coerceValue(state[key], value);
    }

    if (url.pathname.includes("/timers/")) {
      const match = url.pathname.match(/\/timers\/(\w+)\.html$/);
      if (match) {
        state.type = match[1];
      }
    }

    hydrateForm(state);
    render();
    setMessage("Imported settings from URL.");
  } catch {
    setMessage("Could not parse URL.");
  }
}

function coerceValue(template, value) {
  if (typeof template === "boolean") {
    const safe = String(value).toLowerCase();
    return safe === "1" || safe === "true" || safe === "on";
  }
  if (typeof template === "number") {
    const num = Number(value);
    return Number.isFinite(num) ? num : template;
  }
  return value;
}

function setSectionVisibility(type) {
  Object.values(sections).forEach((section) => {
    section.hidden = true;
  });

  if (sections[type]) {
    sections[type].hidden = false;
  }
}

function setRendererSectionVisibility(renderer) {
  Object.values(rendererSections).forEach((section) => {
    section.hidden = true;
  });

  if (rendererSections[renderer]) {
    rendererSections[renderer].hidden = false;
  }
}

function readForm() {
  const data = new FormData(form);
  return {
    type: data.get("type"),
    target: data.get("target"),
    autostart: data.get("autostart") === "1",
    showMs: data.get("showMs") === "1",
    font: data.get("font"),
    color: data.get("color"),
    bg: data.get("bg"),
    size: Number(data.get("size")),
    shadow: data.get("shadow") === "1",
    theme: data.get("theme"),
    renderer: data.get("renderer"),
    anim: data.get("anim") === "1",
    motion: data.get("motion"),
    segmentGlow: data.get("segmentGlow") === "1",
    flipSpeed: data.get("flipSpeed"),
    ringThickness: Number(data.get("ringThickness")),
    ringTicks: data.get("ringTicks") === "1",
    flapSpeed: data.get("flapSpeed"),
    showInfo: data.get("showInfo") === "1",
    infoText: data.get("infoText"),
    infoPosition: data.get("infoPosition"),
    infoStyle: data.get("infoStyle"),
    duration: Number(data.get("duration")),
    endMode: data.get("endMode"),
    start: Number(data.get("start")),
    work: Number(data.get("work")),
    rest: Number(data.get("rest")),
    rounds: Number(data.get("rounds")),
    autoNext: data.get("autoNext") === "1",
    finalMode: data.get("finalMode"),
    cmd: data.get("cmd")
  };
}

function hydrateForm(state) {
  for (const [key, value] of Object.entries(state)) {
    const field = form.elements.namedItem(key);
    if (!field) {
      continue;
    }

    if (field instanceof RadioNodeList) {
      field.value = normalizeValue(value);
      continue;
    }

    field.value = normalizeValue(value);
  }
}

function normalizeValue(value) {
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  return String(value);
}

function refreshPresetList() {
  const presets = listPresets();
  const current = presetSelect.value;
  presetSelect.innerHTML = "";

  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "Select preset";
  presetSelect.append(blank);

  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.name;
    option.textContent = preset.name;
    presetSelect.append(option);
  });

  presetSelect.value = current;
}

function bind(id, callback) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener("click", callback);
  }
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    setMessage("Copied to clipboard.");
  } catch {
    setMessage("Could not copy to clipboard.");
  }
}

function setMessage(value) {
  messageEl.textContent = value;
}
