import { listenForCommands } from "../core/storage.js";

export function applyOverlayTheme(config) {
  document.body.classList.add(config.bg === "solid" ? "solid-bg" : "transparent-bg");
  document.body.classList.add(`theme-${config.theme}`);

  document.documentElement.style.setProperty("--font-family", `"${config.font}", "Segoe UI", sans-serif`);
  document.documentElement.style.setProperty("--text-color", config.color);

  const timeEl = document.getElementById("time");
  if (timeEl) {
    timeEl.style.fontSize = `${config.size}px`;
    timeEl.style.textShadow = config.shadow ? "0 5px 18px var(--shadow-color)" : "none";
  }
}

export function bindCommandListener(config, handlers) {
  return listenForCommands(config.target, (payload) => {
    if (payload.cmd === "start") {
      handlers.start();
      return;
    }
    if (payload.cmd === "pause") {
      handlers.pause();
      return;
    }
    if (payload.cmd === "reset") {
      handlers.reset();
      return;
    }
    if (payload.cmd === "toggle") {
      handlers.toggle();
    }
  });
}

export function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}
