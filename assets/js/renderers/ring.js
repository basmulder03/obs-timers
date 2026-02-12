export function createRingRenderer() {
  let root = null;
  let textNode = null;
  let progressNode = null;
  let circumference = 0;

  return {
    init(rootEl, config) {
      root = rootEl;
      if (!root) {
        return;
      }

      root.classList.add("renderer-ring");
      const thickness = Math.max(4, Math.min(32, Number(config.ringThickness) || 12));
      const ticks = config.ringTicks ? "1" : "0";
      root.dataset.ringTicks = ticks;
      root.style.setProperty("--ring-thickness", `${thickness}px`);

      root.innerHTML = `
        <svg viewBox="0 0 220 220" class="ring-svg" aria-hidden="true">
          <g class="ring-ticks"></g>
          <circle class="ring-track" cx="110" cy="110" r="92"></circle>
          <circle class="ring-progress" cx="110" cy="110" r="92"></circle>
        </svg>
        <span class="ring-text">00:00</span>
      `;

      textNode = root.querySelector(".ring-text");
      progressNode = root.querySelector(".ring-progress");
      const ticksRoot = root.querySelector(".ring-ticks");
      circumference = 2 * Math.PI * 92;
      progressNode.style.strokeDasharray = `${circumference}`;
      progressNode.style.strokeDashoffset = `${circumference}`;

      if (ticks === "1" && ticksRoot) {
        ticksRoot.innerHTML = buildTicks();
      }
    },
    render(payload) {
      if (!root || !textNode || !progressNode) {
        return;
      }

      textNode.textContent = payload.text;
      const progress = Number.isFinite(payload.progress) ? Math.max(0, Math.min(1, payload.progress)) : 0;
      const offset = circumference * (1 - progress);
      progressNode.style.strokeDashoffset = `${offset}`;
    },
    destroy() {
      if (root) {
        root.classList.remove("renderer-ring");
      }
      root = null;
      textNode = null;
      progressNode = null;
      circumference = 0;
    }
  };
}

function buildTicks() {
  const nodes = [];
  for (let i = 0; i < 60; i += 1) {
    const angle = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const inner = major ? 14 : 18;
    const outer = 22;
    const x1 = 110 + Math.cos(angle) * (92 - inner);
    const y1 = 110 + Math.sin(angle) * (92 - inner);
    const x2 = 110 + Math.cos(angle) * (92 + outer - inner);
    const y2 = 110 + Math.sin(angle) * (92 + outer - inner);
    nodes.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"></line>`);
  }
  return nodes.join("");
}
