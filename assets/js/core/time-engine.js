export function createTimerEngine(config = {}) {
  const initialElapsedMs = sanitizeNumber(config.initialElapsedMs, 0, 0, 864000000);
  let elapsedMs = initialElapsedMs;
  let running = false;
  let startedAt = 0;
  let rafId = null;
  const subscribers = new Set();

  function notify() {
    const current = getElapsed();
    for (const callback of subscribers) {
      callback(current, running);
    }
  }

  function tick() {
    notify();
    if (running) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  function getElapsed() {
    if (!running) {
      return elapsedMs;
    }
    return elapsedMs + (performance.now() - startedAt);
  }

  function start() {
    if (running) {
      return;
    }
    running = true;
    startedAt = performance.now();
    tick();
  }

  function pause() {
    if (!running) {
      return;
    }
    elapsedMs = getElapsed();
    running = false;
    startedAt = 0;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    notify();
  }

  function reset(newElapsedMs = initialElapsedMs) {
    elapsedMs = sanitizeNumber(newElapsedMs, initialElapsedMs, 0, 864000000);
    startedAt = running ? performance.now() : 0;
    notify();
  }

  function toggle() {
    if (running) {
      pause();
      return;
    }
    start();
  }

  function subscribe(callback) {
    subscribers.add(callback);
    callback(getElapsed(), running);
    return () => subscribers.delete(callback);
  }

  return {
    start,
    pause,
    reset,
    toggle,
    getElapsed,
    isRunning: () => running,
    subscribe
  };
}

function sanitizeNumber(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, numeric));
}
