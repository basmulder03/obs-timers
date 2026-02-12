export type TimerType = "countdown" | "stopwatch" | "countup" | "interval";
export type RendererType = "classic" | "seven" | "flip" | "ring" | "splitflap";
export type EndMode = "stop" | "loop" | "overtime";
export type FinalMode = "stop" | "loop";

export interface TimerConfig {
  type: TimerType;
  target: string;
  autostart: boolean;
  showMs: boolean;
  font: string;
  fontUrl: string;
  color: string;
  bg: "transparent" | "solid";
  size: number;
  shadow: boolean;
  theme: "steel" | "amber" | "ice";
  renderer: RendererType;
  anim: boolean;
  motion: "low" | "normal" | "high";
  segmentGlow: boolean;
  flipSpeed: "slow" | "normal" | "fast";
  ringThickness: number;
  ringTicks: boolean;
  flapSpeed: "slow" | "normal" | "fast";
  showInfo: boolean;
  infoText: string;
  infoPosition: "tl" | "tr" | "bl" | "br";
  infoStyle: "minimal" | "chip";
  duration: number;
  endMode: EndMode;
  start: number;
  work: number;
  rest: number;
  rounds: number;
  autoNext: boolean;
  finalMode: FinalMode;
}

export interface SharedConfigEntry {
  id: string;
  title: string;
  author: string;
  description: string;
  timerType: TimerType;
  url: string;
  tags: string[];
  createdAt?: string;
}
