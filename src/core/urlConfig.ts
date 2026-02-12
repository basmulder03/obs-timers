import { defaultConfig } from "@/core/defaults";
import { parseHexColor } from "@/core/format";
import type { TimerConfig, TimerType } from "@/types";

export function parseConfigFromSearch(timerType: TimerType, search: string): TimerConfig {
  const params = new URLSearchParams(search);
  const cfg: TimerConfig = {
    ...defaultConfig,
    type: timerType,
    target: str(params.get("target"), defaultConfig.target),
    autostart: bool(params.get("autostart"), defaultConfig.autostart),
    showMs: bool(params.get("showMs"), defaultConfig.showMs),
    font: str(params.get("font"), defaultConfig.font),
    color: parseHexColor(str(params.get("color"), defaultConfig.color), defaultConfig.color),
    bg: enumVal(params.get("bg"), ["transparent", "solid"], defaultConfig.bg),
    size: num(params.get("size"), defaultConfig.size, 36, 260),
    shadow: bool(params.get("shadow"), defaultConfig.shadow),
    theme: enumVal(params.get("theme"), ["steel", "amber", "ice"], defaultConfig.theme),
    renderer: enumVal(params.get("renderer"), ["classic", "seven", "flip", "ring", "splitflap"], defaultConfig.renderer),
    anim: bool(params.get("anim"), defaultConfig.anim),
    motion: enumVal(params.get("motion"), ["low", "normal", "high"], defaultConfig.motion),
    segmentGlow: bool(params.get("segmentGlow"), defaultConfig.segmentGlow),
    flipSpeed: enumVal(params.get("flipSpeed"), ["slow", "normal", "fast"], defaultConfig.flipSpeed),
    ringThickness: num(params.get("ringThickness"), defaultConfig.ringThickness, 4, 32),
    ringTicks: bool(params.get("ringTicks"), defaultConfig.ringTicks),
    flapSpeed: enumVal(params.get("flapSpeed"), ["slow", "normal", "fast"], defaultConfig.flapSpeed),
    showInfo: bool(params.get("showInfo"), defaultConfig.showInfo),
    infoText: str(params.get("infoText"), defaultConfig.infoText),
    infoPosition: enumVal(params.get("infoPosition"), ["tl", "tr", "bl", "br"], defaultConfig.infoPosition),
    infoStyle: enumVal(params.get("infoStyle"), ["minimal", "chip"], defaultConfig.infoStyle),
    duration: num(params.get("duration"), defaultConfig.duration, 1, 86400),
    endMode: enumVal(params.get("endMode"), ["stop", "loop", "overtime"], defaultConfig.endMode),
    start: num(params.get("start"), defaultConfig.start, 0, 86400),
    work: num(params.get("work"), defaultConfig.work, 1, 86400),
    rest: num(params.get("rest"), defaultConfig.rest, 0, 86400),
    rounds: num(params.get("rounds"), defaultConfig.rounds, 1, 200),
    autoNext: bool(params.get("autoNext"), defaultConfig.autoNext),
    finalMode: enumVal(params.get("finalMode"), ["stop", "loop"], defaultConfig.finalMode)
  };
  return cfg;
}

export function buildOverlayUrl(config: TimerConfig): string {
  const params = new URLSearchParams();
  set(params, "target", config.target);
  set(params, "autostart", boolOut(config.autostart));
  set(params, "showMs", boolOut(config.showMs));
  set(params, "font", config.font);
  set(params, "color", config.color);
  set(params, "bg", config.bg);
  set(params, "size", String(config.size));
  set(params, "shadow", boolOut(config.shadow));
  set(params, "theme", config.theme);
  set(params, "renderer", config.renderer);
  set(params, "anim", boolOut(config.anim));
  set(params, "motion", config.motion);
  set(params, "segmentGlow", boolOut(config.segmentGlow));
  set(params, "flipSpeed", config.flipSpeed);
  set(params, "ringThickness", String(config.ringThickness));
  set(params, "ringTicks", boolOut(config.ringTicks));
  set(params, "flapSpeed", config.flapSpeed);
  set(params, "showInfo", boolOut(config.showInfo));
  set(params, "infoText", config.infoText);
  set(params, "infoPosition", config.infoPosition);
  set(params, "infoStyle", config.infoStyle);

  if (config.type === "countdown") {
    set(params, "duration", String(config.duration));
    set(params, "endMode", config.endMode);
  }
  if (config.type === "countup") {
    set(params, "start", String(config.start));
  }
  if (config.type === "interval") {
    set(params, "work", String(config.work));
    set(params, "rest", String(config.rest));
    set(params, "rounds", String(config.rounds));
    set(params, "autoNext", boolOut(config.autoNext));
    set(params, "finalMode", config.finalMode);
  }
  return `/overlay/${config.type}?${params.toString()}`;
}

function set(params: URLSearchParams, key: string, value: string): void {
  params.set(key, value);
}

function str(input: string | null, fallback: string): string {
  const out = (input || "").trim();
  return out || fallback;
}

function bool(input: string | null, fallback: boolean): boolean {
  if (input === null || input === "") {
    return fallback;
  }
  const safe = input.toLowerCase();
  return safe === "1" || safe === "true" || safe === "yes" || safe === "on";
}

function boolOut(input: boolean): string {
  return input ? "1" : "0";
}

function num(input: string | null, fallback: number, min: number, max: number): number {
  const n = Number(input);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.round(Math.min(max, Math.max(min, n)));
}

function enumVal<T extends string>(input: string | null, allowed: readonly T[], fallback: T): T {
  const safe = (input || "").toLowerCase() as T;
  return allowed.includes(safe) ? safe : fallback;
}
