import { formatDuration } from "../core/format.js";
import { createTimerEngine } from "../core/time-engine.js";
import { parseTimerConfig } from "../core/url-config.js";
import { applyOverlayTheme, bindCommandListener, createTimeRenderer, setInfoStrip, setText } from "./overlay-common.js";

const config = parseTimerConfig("countdown");
applyOverlayTheme(config);
setText("label", "Countdown");
setInfoStrip(config, `Countdown | ${config.target}`);
const renderer = createTimeRenderer(config);

const durationMs = config.duration * 1000;
const engine = createTimerEngine({ initialElapsedMs: 0 });
let ended = false;

engine.subscribe((elapsedMs) => {
  if (elapsedMs < durationMs) {
    const remaining = durationMs - elapsedMs;
    renderer.render({
      text: formatDuration(remaining, { showMs: config.showMs, forceHours: durationMs >= 3600000 }),
      progress: durationMs === 0 ? 0 : elapsedMs / durationMs,
      running: engine.isRunning()
    });
    return;
  }

  if (!ended) {
    ended = true;
    if (config.endMode === "stop") {
      engine.pause();
      engine.reset(durationMs);
    } else if (config.endMode === "loop") {
      engine.reset(0);
      ended = false;
      if (!engine.isRunning()) {
        engine.start();
      }
    } else {
      if (!engine.isRunning()) {
        engine.start();
      }
    }
  }

  if (config.endMode === "overtime") {
    const overtime = elapsedMs - durationMs;
    renderer.render({
      text: `+${formatDuration(overtime, { showMs: config.showMs, forceHours: durationMs >= 3600000 })}`,
      progress: 1,
      running: engine.isRunning()
    });
  } else {
    renderer.render({
      text: formatDuration(0, { showMs: config.showMs, forceHours: durationMs >= 3600000 }),
      progress: 1,
      running: engine.isRunning()
    });
  }
});

bindCommandListener(config, {
  start: () => {
    if (ended && config.endMode === "stop") {
      engine.reset(0);
      ended = false;
    }
    engine.start();
  },
  pause: () => engine.pause(),
  reset: () => {
    ended = false;
    engine.reset(0);
  },
  toggle: () => {
    if (ended && config.endMode === "stop") {
      engine.reset(0);
      ended = false;
    }
    engine.toggle();
  }
});

if (config.autostart) {
  engine.start();
}
