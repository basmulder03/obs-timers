export function formatDuration(ms, options = {}) {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const showMs = Boolean(options.showMs);
  const includeHours = Boolean(options.forceHours) || hours > 0;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");

  let output = includeHours ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;

  if (showMs) {
    const centiseconds = Math.floor((safeMs % 1000) / 10);
    output += `.${String(centiseconds).padStart(2, "0")}`;
  }

  return output;
}

export function parseHexColor(input, fallback = "#F4F8FF") {
  const value = String(input || "").trim();
  const normalized = value.startsWith("#") ? value : `#${value}`;
  return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : fallback;
}
