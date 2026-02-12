import { listenForCommands } from "../core/storage.js";
import { createRenderer } from "../renderers/index.js";

export function applyOverlayTheme(config) {
  document.body.classList.add(config.bg === "solid" ? "solid-bg" : "transparent-bg");
  document.body.classList.add(`theme-${config.theme}`);
  document.body.classList.add(`renderer-${config.renderer}`);
  if (!config.anim) {
    document.body.classList.add("animations-off");
  }

  document.documentElement.style.setProperty("--font-family", `"${config.font}", "Segoe UI", sans-serif`);
  document.documentElement.style.setProperty("--text-color", config.color);
  document.documentElement.style.setProperty("--motion-factor", readMotionFactor(config.motion));

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

export function createTimeRenderer(config) {
  const root = document.getElementById("time");
  const renderer = createRenderer(config.renderer);
  renderer.init(root, config);

  return {
    render(payload) {
      const content = typeof payload === "string" ? { text: payload } : payload;
      renderer.render(content);
    },
    destroy() {
      renderer.destroy();
    }
  };
}

function readMotionFactor(value) {
  if (value === "low") {
    return "0.75";
  }
  if (value === "high") {
    return "1.2";
  }
  return "1";
}
