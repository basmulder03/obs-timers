import { formatDuration } from "../core/format.js";
import { createTimerEngine } from "../core/time-engine.js";
import { parseTimerConfig } from "../core/url-config.js";
import { applyOverlayTheme, bindCommandListener, setText } from "./overlay-common.js";

const config = parseTimerConfig("countup");
applyOverlayTheme(config);
setText("label", "Count Up");

const baseMs = config.start * 1000;
const engine = createTimerEngine({ initialElapsedMs: 0 });

engine.subscribe((elapsedMs) => {
  setText("time", formatDuration(baseMs + elapsedMs, { showMs: config.showMs, forceHours: true }));
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
