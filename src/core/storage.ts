import type { TimerConfig } from "@/types";

const PRESETS_KEY = "obsTimers.presets.v2";
const COMMAND_PREFIX = "obsTimers.command.v2.";

export function listPresets(): Array<{ name: string; config: TimerConfig }> {
  const data = readJson<Record<string, TimerConfig>>(PRESETS_KEY, {});
  return Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, config: data[name] }));
}

export function savePreset(name: string, config: TimerConfig): void {
  const key = name.trim();
  if (!key) {
    throw new Error("Preset name is required");
  }
  const data = readJson<Record<string, TimerConfig>>(PRESETS_KEY, {});
  data[key] = config;
  localStorage.setItem(PRESETS_KEY, JSON.stringify(data));
}

export function deletePreset(name: string): void {
  const key = name.trim();
  if (!key) {
    return;
  }
  const data = readJson<Record<string, TimerConfig>>(PRESETS_KEY, {});
  delete data[key];
  localStorage.setItem(PRESETS_KEY, JSON.stringify(data));
}

export function publishCommand(target: string, cmd: "start" | "pause" | "reset" | "toggle", syncToken = ""): void {
  const payload = {
    cmd,
    target: target.trim() || "default",
    syncToken,
    issuedAt: Date.now(),
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  };
  localStorage.setItem(`${COMMAND_PREFIX}${payload.target}`, JSON.stringify(payload));
}

export function listenCommands(
  target: string,
  onCommand: (cmd: "start" | "pause" | "reset" | "toggle") => void
): () => void {
  const safeTarget = target.trim() || "default";
  const key = `${COMMAND_PREFIX}${safeTarget}`;
  let lastId = "";

  const consume = (raw: string | null) => {
    if (!raw) {
      return;
    }
    try {
      const payload = JSON.parse(raw) as { cmd: "start" | "pause" | "reset" | "toggle"; id: string; target: string };
      if (payload.target !== safeTarget || payload.id === lastId) {
        return;
      }
      lastId = payload.id;
      onCommand(payload.cmd);
    } catch {
      return;
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === key) {
      consume(event.newValue);
    }
  };

  const poll = window.setInterval(() => {
    consume(localStorage.getItem(key));
  }, 500);

  window.addEventListener("storage", handleStorage);
  return () => {
    window.clearInterval(poll);
    window.removeEventListener("storage", handleStorage);
  };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
