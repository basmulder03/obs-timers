import type { ReactNode } from "react";
import type { TimerConfig } from "@/types";

export function OverlayShell({ config, children }: { config: TimerConfig; children: ReactNode }) {
  return (
    <main className={`overlay-root ${config.bg === "solid" ? "solid-bg" : "transparent-bg"} theme-${config.theme} renderer-${config.renderer}`}>
      <section
        className={`overlay-shell ${config.anim ? "" : "animations-off"}`}
        style={
          {
            ["--font-family" as string]: `"${config.font}", "Segoe UI", sans-serif`,
            ["--text-color" as string]: config.color,
            ["--motion-factor" as string]: config.motion === "high" ? "1.2" : config.motion === "low" ? "0.75" : "1"
          } as React.CSSProperties
        }
      >
        {children}
      </section>
    </main>
  );
}
