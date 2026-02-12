export function formatDuration(ms: number, options?: { showMs?: boolean; forceHours?: boolean }): string {
  const safe = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const totalSeconds = Math.floor(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const showMs = Boolean(options?.showMs);
  const forceHours = Boolean(options?.forceHours);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  let out = forceHours || hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;

  if (showMs) {
    out += `.${String(Math.floor((safe % 1000) / 10)).padStart(2, "0")}`;
  }

  return out;
}

export function parseHexColor(input: string, fallback = "#F4F8FF"): string {
  const value = (input || "").trim();
  const normalized = value.startsWith("#") ? value : `#${value}`;
  return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : fallback;
}
