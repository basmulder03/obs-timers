const PRESETS_KEY = "obsTimers.presets.v1";
const COMMAND_PREFIX = "obsTimers.command.v1.";

export function listPresets() {
  const data = readJson(PRESETS_KEY, {});
  return Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, config: data[name] }));
}

export function savePreset(name, config) {
  const safeName = String(name || "").trim();
  if (!safeName) {
    throw new Error("Preset name is required");
  }

  const data = readJson(PRESETS_KEY, {});
  data[safeName] = config;
  localStorage.setItem(PRESETS_KEY, JSON.stringify(data));
}

export function deletePreset(name) {
  const safeName = String(name || "").trim();
  if (!safeName) {
    return;
  }

  const data = readJson(PRESETS_KEY, {});
  delete data[safeName];
  localStorage.setItem(PRESETS_KEY, JSON.stringify(data));
}

export function getCommandKey(target = "default") {
  return `${COMMAND_PREFIX}${safeTarget(target)}`;
}

export function publishCommand(target, cmd, syncToken = "") {
  const command = String(cmd || "").trim().toLowerCase();
  if (!["start", "pause", "reset", "toggle"].includes(command)) {
    throw new Error("Invalid command");
  }

  const payload = {
    cmd: command,
    target: safeTarget(target),
    syncToken: String(syncToken || ""),
    issuedAt: Date.now(),
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  };

  const key = getCommandKey(payload.target);
  localStorage.setItem(key, JSON.stringify(payload));
  return payload;
}

export function readLatestCommand(target) {
  const key = getCommandKey(target);
  return readJson(key, null);
}

export function listenForCommands(target, onCommand) {
  const safe = safeTarget(target);
  const key = getCommandKey(safe);
  let lastId = "";

  function consume(payload) {
    if (!payload || payload.target !== safe || payload.id === lastId) {
      return;
    }
    lastId = payload.id;
    onCommand(payload);
  }

  function handleStorage(event) {
    if (event.key !== key || !event.newValue) {
      return;
    }

    try {
      consume(JSON.parse(event.newValue));
    } catch {
      return;
    }
  }

  const pollId = window.setInterval(() => {
    consume(readLatestCommand(safe));
  }, 600);

  window.addEventListener("storage", handleStorage);

  return () => {
    window.clearInterval(pollId);
    window.removeEventListener("storage", handleStorage);
  };
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return fallback;
    }
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function safeTarget(value) {
  const trimmed = String(value || "default").trim();
  return trimmed || "default";
}
