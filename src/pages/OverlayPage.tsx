import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { OverlayShell } from "@/components/OverlayShell";
import { InfoStrip } from "@/components/InfoStrip";
import { RendererView } from "@/renderers/RendererView";
import { createTimerEngine } from "@/core/timerEngine";
import { formatDuration } from "@/core/format";
import { parseConfigFromSearch } from "@/core/urlConfig";
import { defaultConfig } from "@/core/defaults";
import { listenCommands } from "@/core/storage";
import type { TimerType } from "@/types";
import styles from "@/pages/OverlayPage.module.scss";

const timerTypes: TimerType[] = ["countdown", "stopwatch", "countup", "interval"];

export function OverlayPage() {
  const { timerType } = useParams();
  const location = useLocation();
  const resolvedType = (timerTypes.includes(timerType as TimerType) ? timerType : "stopwatch") as TimerType;
  const config = useMemo(() => parseConfigFromSearch(resolvedType, location.search), [resolvedType, location.search]);

  const engineRef = useRef(createTimerEngine(0));
  const [text, setText] = useState("00:00");
  const [label, setLabel] = useState("Timer");
  const [round, setRound] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const engine = engineRef.current;
    let phaseIndex = 0;
    let complete = false;
    let ended = false;

    const intervalPhases = buildPhases(config.work, config.rest, config.rounds);

    const unsubscribe = engine.subscribe((elapsed) => {
      if (config.type === "countdown") {
        const total = config.duration * 1000;
        if (elapsed < total) {
          setLabel("Countdown");
          setText(formatDuration(total - elapsed, { showMs: config.showMs, forceHours: total >= 3600000 }));
          setProgress(total === 0 ? 0 : elapsed / total);
          return;
        }

        if (!ended) {
          ended = true;
          if (config.endMode === "stop") {
            engine.pause();
            engine.reset(total);
          } else if (config.endMode === "loop") {
            engine.reset(0);
            ended = false;
            if (!engine.isRunning()) {
              engine.start();
            }
          }
        }

        if (config.endMode === "overtime") {
          setText(`+${formatDuration(elapsed - total, { showMs: config.showMs, forceHours: total >= 3600000 })}`);
        } else {
          setText(formatDuration(0, { showMs: config.showMs, forceHours: total >= 3600000 }));
        }
        setProgress(1);
        return;
      }

      if (config.type === "stopwatch") {
        setLabel("Stopwatch");
        setText(formatDuration(elapsed, { showMs: config.showMs, forceHours: true }));
        setProgress((elapsed % 60000) / 60000);
        return;
      }

      if (config.type === "countup") {
        const total = config.start * 1000 + elapsed;
        setLabel("Count Up");
        setText(formatDuration(total, { showMs: config.showMs, forceHours: true }));
        setProgress((total % 60000) / 60000);
        return;
      }

      const phase = intervalPhases[phaseIndex] ?? intervalPhases[0];
      if (!phase) {
        setLabel("Interval");
        setText("00:00");
        return;
      }

      if (complete) {
        setLabel("Complete");
        setRound(`Finished ${config.rounds} rounds`);
        setText(formatDuration(0, { showMs: config.showMs }));
        setProgress(1);
        return;
      }

      const phaseMs = phase.seconds * 1000;
      setLabel(phase.name);
      setRound(`Round ${phase.round}/${config.rounds}`);

      if (elapsed < phaseMs) {
        setText(formatDuration(phaseMs - elapsed, { showMs: config.showMs, forceHours: phaseMs >= 3600000 }));
        setProgress(phaseMs === 0 ? 0 : elapsed / phaseMs);
        return;
      }

      if (phaseIndex + 1 < intervalPhases.length) {
        phaseIndex += 1;
      } else if (config.finalMode === "loop") {
        phaseIndex = 0;
      } else {
        complete = true;
      }

      engine.reset(0);
      if (!config.autoNext) {
        engine.pause();
      }
    });

    if (config.autostart) {
      engine.start();
    } else {
      engine.pause();
      engine.reset(0);
    }

    const stopListen = listenCommands(config.target, (cmd) => {
      if (cmd === "start") {
        engine.start();
      } else if (cmd === "pause") {
        engine.pause();
      } else if (cmd === "reset") {
        engine.reset(0);
      } else {
        engine.toggle();
      }
    });

    return () => {
      unsubscribe();
      stopListen();
      engine.pause();
    };
  }, [config]);

  const infoFallback = `${label || "Timer"} | ${config.target}`;

  return (
    <OverlayShell config={config}>
      <div className={styles.timeText} style={{ fontSize: `${config.size}px`, textShadow: config.shadow ? "0 5px 18px var(--shadow-color)" : "none" }}>
        <RendererView
          renderer={config.renderer}
          text={text}
          progress={progress}
          segmentGlow={config.segmentGlow}
          flipSpeed={config.flipSpeed}
          flapSpeed={config.flapSpeed}
          ringThickness={config.ringThickness}
          ringTicks={config.ringTicks}
        />
      </div>
      <div className={styles.timeLabel}>{label}</div>
      {config.type === "interval" ? <div className={styles.roundLabel}>{round}</div> : null}
      <InfoStrip config={config} fallback={infoFallback} styles={styles} />
    </OverlayShell>
  );
}

function buildPhases(work: number, rest: number, rounds: number): Array<{ name: "Work" | "Rest"; seconds: number; round: number }> {
  const phases: Array<{ name: "Work" | "Rest"; seconds: number; round: number }> = [];
  for (let round = 1; round <= rounds; round += 1) {
    phases.push({ name: "Work", seconds: work, round });
    if (rest > 0) {
      phases.push({ name: "Rest", seconds: rest, round });
    }
  }
  return phases;
}

export function fallbackConfigForDebug() {
  return defaultConfig;
}
