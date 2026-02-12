export interface TimerEngine {
  start: () => void;
  pause: () => void;
  reset: (ms?: number) => void;
  toggle: () => void;
  getElapsed: () => number;
  isRunning: () => boolean;
  subscribe: (listener: (elapsed: number, running: boolean) => void) => () => void;
}

export function createTimerEngine(initialElapsedMs = 0): TimerEngine {
  let elapsedMs = Math.max(0, initialElapsedMs);
  let running = false;
  let startedAt = 0;
  let raf: number | null = null;
  const listeners = new Set<(elapsed: number, running: boolean) => void>();

  const notify = () => {
    const elapsed = getElapsed();
    listeners.forEach((listener) => listener(elapsed, running));
  };

  const tick = () => {
    notify();
    if (running) {
      raf = window.requestAnimationFrame(tick);
    }
  };

  const getElapsed = () => {
    if (!running) {
      return elapsedMs;
    }
    return elapsedMs + (performance.now() - startedAt);
  };

  const start = () => {
    if (running) {
      return;
    }
    running = true;
    startedAt = performance.now();
    tick();
  };

  const pause = () => {
    if (!running) {
      return;
    }
    elapsedMs = getElapsed();
    running = false;
    startedAt = 0;
    if (raf !== null) {
      window.cancelAnimationFrame(raf);
      raf = null;
    }
    notify();
  };

  const reset = (ms = initialElapsedMs) => {
    elapsedMs = Math.max(0, ms);
    startedAt = running ? performance.now() : 0;
    notify();
  };

  const toggle = () => {
    if (running) {
      pause();
    } else {
      start();
    }
  };

  const subscribe = (listener: (elapsed: number, running: boolean) => void) => {
    listeners.add(listener);
    listener(getElapsed(), running);
    return () => listeners.delete(listener);
  };

  return { start, pause, reset, toggle, getElapsed, isRunning: () => running, subscribe };
}
