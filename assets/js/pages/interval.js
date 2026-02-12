import { formatDuration } from "../core/format.js";
import { createTimerEngine } from "../core/time-engine.js";
import { parseTimerConfig } from "../core/url-config.js";
import { applyOverlayTheme, bindCommandListener, createTimeRenderer, setInfoStrip, setText } from "./overlay-common.js";

const config = parseTimerConfig("interval");
applyOverlayTheme(config);
setInfoStrip(config, `Interval | ${config.target}`);
const renderer = createTimeRenderer(config);

const phases = [];
for (let round = 1; round <= config.rounds; round += 1) {
  phases.push({ name: "Work", seconds: config.work, round });
  if (config.rest > 0) {
    phases.push({ name: "Rest", seconds: config.rest, round });
  }
}

const engine = createTimerEngine({ initialElapsedMs: 0 });
let phaseIndex = 0;
let complete = false;

function getPhase() {
  return phases[phaseIndex] || phases[0];
}

function setPhaseUi() {
  if (complete) {
    setText("label", "Complete");
    setText("round", `Finished ${config.rounds} rounds`);
    renderer.render({ text: formatDuration(0, { showMs: config.showMs }), progress: 1, running: false });
    return;
  }

  const phase = getPhase();
  setText("label", phase.name);
  setText("round", `Round ${phase.round}/${config.rounds}`);
}

function advancePhase() {
  if (phaseIndex + 1 < phases.length) {
    phaseIndex += 1;
    return;
  }

  if (config.finalMode === "loop") {
    phaseIndex = 0;
    return;
  }

  complete = true;
}

engine.subscribe((elapsedMs) => {
  if (complete) {
    setPhaseUi();
    return;
  }

  const phase = getPhase();
  const phaseMs = phase.seconds * 1000;

  if (elapsedMs < phaseMs) {
    const remaining = phaseMs - elapsedMs;
    renderer.render({
      text: formatDuration(remaining, { showMs: config.showMs, forceHours: phaseMs >= 3600000 }),
      progress: phaseMs === 0 ? 0 : elapsedMs / phaseMs,
      running: engine.isRunning()
    });
    setPhaseUi();
    return;
  }

  advancePhase();
  engine.reset(0);

  if (complete) {
    engine.pause();
    setPhaseUi();
    return;
  }

  setPhaseUi();
  if (!config.autoNext) {
    engine.pause();
  }
});

bindCommandListener(config, {
  start: () => {
    if (complete) {
      complete = false;
      phaseIndex = 0;
      engine.reset(0);
      setPhaseUi();
    }
    engine.start();
  },
  pause: () => engine.pause(),
  reset: () => {
    complete = false;
    phaseIndex = 0;
    engine.reset(0);
    setPhaseUi();
  },
  toggle: () => {
    if (complete) {
      complete = false;
      phaseIndex = 0;
      engine.reset(0);
      setPhaseUi();
    }
    engine.toggle();
  }
});

setPhaseUi();
if (config.autostart) {
  engine.start();
}
