import { formatDuration } from "../core/format.js";
import { createTimerEngine } from "../core/time-engine.js";
import { parseTimerConfig } from "../core/url-config.js";
import { applyOverlayTheme, bindCommandListener, createTimeRenderer, setInfoStrip, setText } from "./overlay-common.js";

const config = parseTimerConfig("countup");
applyOverlayTheme(config);
setText("label", "Count Up");
setInfoStrip(config, `Count Up | ${config.target}`);
const renderer = createTimeRenderer(config);

const baseMs = config.start * 1000;
const engine = createTimerEngine({ initialElapsedMs: 0 });

engine.subscribe((elapsedMs) => {
  const total = baseMs + elapsedMs;
  renderer.render({
    text: formatDuration(total, { showMs: config.showMs, forceHours: true }),
    progress: (total % 60000) / 60000,
    running: engine.isRunning()
  });
});

bindCommandListener(config, {
  start: () => engine.start(),
  pause: () => engine.pause(),
  reset: () => engine.reset(0),
  toggle: () => engine.toggle()
});

if (config.autostart) {
  engine.start();
}
