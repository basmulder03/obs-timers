import type { TimerConfig } from "@/types";

export function InfoStrip({
  config,
  fallback,
  styles
}: {
  config: TimerConfig;
  fallback: string;
  styles: Record<string, string>;
}) {
  if (!config.showInfo) {
    return null;
  }
  return <div className={`${styles.overlayInfo} ${styles[config.infoPosition]} ${styles[config.infoStyle]}`}>{config.infoText || fallback}</div>;
}
