import { formatDuration } from "../core/format.js";
import { createTimerEngine } from "../core/time-engine.js";
import { parseTimerConfig } from "../core/url-config.js";
import { applyOverlayTheme, bindCommandListener, createTimeRenderer, setInfoStrip, setText } from "./overlay-common.js";

const config = parseTimerConfig("stopwatch");
applyOverlayTheme(config);
setText("label", "Stopwatch");
setInfoStrip(config, `Stopwatch | ${config.target}`);
const renderer = createTimeRenderer(config);

const engine = createTimerEngine({ initialElapsedMs: 0 });

engine.subscribe((elapsedMs) => {
  renderer.render({
    text: formatDuration(elapsedMs, { showMs: config.showMs, forceHours: true }),
    progress: (elapsedMs % 60000) / 60000,
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
