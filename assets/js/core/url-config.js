import { parseHexColor } from "./format.js";

const COMMON_DEFAULTS = {
  target: "default",
  autostart: false,
  showMs: false,
  font: "Barlow Condensed",
  color: "#F4F8FF",
  bg: "transparent",
  size: 120,
  shadow: true,
  theme: "steel"
};

const TYPE_DEFAULTS = {
  countdown: {
    duration: 300,
    endMode: "stop"
  },
  stopwatch: {},
  countup: {
    start: 0
  },
  interval: {
    work: 1500,
    rest: 300,
    rounds: 4,
    autoNext: true,
    finalMode: "stop"
  }
};

export function parseTimerConfig(type, search = window.location.search) {
  const params = new URLSearchParams(search || "");
  const timerType = String(type || "stopwatch").toLowerCase();

  const common = {
    target: parseString(params.get("target"), COMMON_DEFAULTS.target),
    autostart: parseBool(params.get("autostart"), COMMON_DEFAULTS.autostart),
    showMs: parseBool(params.get("showMs"), COMMON_DEFAULTS.showMs),
    font: parseString(params.get("font"), COMMON_DEFAULTS.font),
    color: parseHexColor(params.get("color"), COMMON_DEFAULTS.color),
    bg: parseEnum(params.get("bg"), ["transparent", "solid"], COMMON_DEFAULTS.bg),
    size: parseNumber(params.get("size"), COMMON_DEFAULTS.size, 36, 260),
    shadow: parseBool(params.get("shadow"), COMMON_DEFAULTS.shadow),
    theme: parseEnum(params.get("theme"), ["steel", "amber", "ice"], COMMON_DEFAULTS.theme)
  };

  if (timerType === "countdown") {
    return {
      type: timerType,
      ...common,
      duration: parseNumber(params.get("duration"), TYPE_DEFAULTS.countdown.duration, 1, 86400),
      endMode: parseEnum(params.get("endMode"), ["stop", "loop", "overtime"], TYPE_DEFAULTS.countdown.endMode)
    };
  }

  if (timerType === "countup") {
    return {
      type: timerType,
      ...common,
      start: parseNumber(params.get("start"), TYPE_DEFAULTS.countup.start, 0, 86400)
    };
  }

  if (timerType === "interval") {
    return {
      type: timerType,
      ...common,
      work: parseNumber(params.get("work"), TYPE_DEFAULTS.interval.work, 1, 86400),
      rest: parseNumber(params.get("rest"), TYPE_DEFAULTS.interval.rest, 0, 86400),
      rounds: parseNumber(params.get("rounds"), TYPE_DEFAULTS.interval.rounds, 1, 200),
      autoNext: parseBool(params.get("autoNext"), TYPE_DEFAULTS.interval.autoNext),
      finalMode: parseEnum(params.get("finalMode"), ["stop", "loop"], TYPE_DEFAULTS.interval.finalMode)
    };
  }

  return {
    type: "stopwatch",
    ...common
  };
}

export function buildTimerUrl(type, config, basePath = "") {
  const timerType = String(type || "stopwatch").toLowerCase();
  const pagePath = joinBasePath(basePath, `timers/${timerType}.html`);
  const params = new URLSearchParams();

  setCommonParams(params, config);

  if (timerType === "countdown") {
    params.set("duration", String(parseNumber(config.duration, TYPE_DEFAULTS.countdown.duration, 1, 86400)));
    params.set("endMode", parseEnum(config.endMode, ["stop", "loop", "overtime"], TYPE_DEFAULTS.countdown.endMode));
  }

  if (timerType === "countup") {
    params.set("start", String(parseNumber(config.start, TYPE_DEFAULTS.countup.start, 0, 86400)));
  }

  if (timerType === "interval") {
    params.set("work", String(parseNumber(config.work, TYPE_DEFAULTS.interval.work, 1, 86400)));
    params.set("rest", String(parseNumber(config.rest, TYPE_DEFAULTS.interval.rest, 0, 86400)));
    params.set("rounds", String(parseNumber(config.rounds, TYPE_DEFAULTS.interval.rounds, 1, 200)));
    params.set("autoNext", boolString(parseBool(config.autoNext, TYPE_DEFAULTS.interval.autoNext)));
    params.set("finalMode", parseEnum(config.finalMode, ["stop", "loop"], TYPE_DEFAULTS.interval.finalMode));
  }

  return `${pagePath}?${params.toString()}`;
}

export function buildControlUrl(config, basePath = "") {
  const pagePath = joinBasePath(basePath, "timers/control.html");
  const params = new URLSearchParams();
  params.set("cmd", parseEnum(config.cmd, ["start", "pause", "reset", "toggle"], "toggle"));
  params.set("target", parseString(config.target, COMMON_DEFAULTS.target));
  params.set("syncToken", String(config.syncToken || Date.now()));
  return `${pagePath}?${params.toString()}`;
}

function setCommonParams(params, config) {
  params.set("target", parseString(config.target, COMMON_DEFAULTS.target));
  params.set("autostart", boolString(parseBool(config.autostart, COMMON_DEFAULTS.autostart)));
  params.set("showMs", boolString(parseBool(config.showMs, COMMON_DEFAULTS.showMs)));
  params.set("font", parseString(config.font, COMMON_DEFAULTS.font));
  params.set("color", parseHexColor(config.color, COMMON_DEFAULTS.color));
  params.set("bg", parseEnum(config.bg, ["transparent", "solid"], COMMON_DEFAULTS.bg));
  params.set("size", String(parseNumber(config.size, COMMON_DEFAULTS.size, 36, 260)));
  params.set("shadow", boolString(parseBool(config.shadow, COMMON_DEFAULTS.shadow)));
  params.set("theme", parseEnum(config.theme, ["steel", "amber", "ice"], COMMON_DEFAULTS.theme));
}

function parseString(value, fallback) {
  const safe = String(value || "").trim();
  return safe || fallback;
}

function parseEnum(value, allowed, fallback) {
  const safe = String(value || "").trim().toLowerCase();
  return allowed.includes(safe) ? safe : fallback;
}

function parseBool(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const safe = String(value).toLowerCase();
  return safe === "1" || safe === "true" || safe === "yes" || safe === "on";
}

function parseNumber(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.round(Math.min(max, Math.max(min, numeric)));
}

function boolString(input) {
  return input ? "1" : "0";
}

function joinBasePath(basePath, suffix) {
  const safeBase = String(basePath || "").trim();
  if (!safeBase) {
    return suffix;
  }
  return `${safeBase.replace(/\/$/, "")}/${suffix}`;
}
