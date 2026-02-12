import type { CSSProperties, ReactNode } from "react";
import type { TimerConfig } from "@/types";
import { useDynamicFont } from "@/core/useDynamicFont";
import styles from "@/pages/OverlayPage.module.scss";

export function OverlayShell({ config, children }: { config: TimerConfig; children: ReactNode }) {
  const { resolvedFamily } = useDynamicFont(config.font, config.fontUrl);

  return (
    <main className={`${styles.overlayRoot} ${config.bg === "solid" ? styles.solidBg : styles.transparentBg} ${styles[`theme${capitalize(config.theme)}`] || ""}`}>
      <section
        className={styles.overlayShell}
        style={
          {
            ["--font-family" as string]: `"${resolvedFamily}", "${config.font}", "Segoe UI", sans-serif`,
            ["--text-color" as string]: config.color,
            ["--motion-factor" as string]: config.motion === "high" ? "1.2" : config.motion === "low" ? "0.75" : "1"
          } as CSSProperties
        }
      >
        {children}
      </section>
    </main>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
