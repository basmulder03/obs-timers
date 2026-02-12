import type { TimerConfig } from "@/types";

export function InfoStrip({ config, fallback }: { config: TimerConfig; fallback: string }) {
  if (!config.showInfo) {
    return null;
  }
  return <div className={`overlay-info ${config.infoPosition} ${config.infoStyle}`}>{config.infoText || fallback}</div>;
}
