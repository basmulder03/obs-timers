function isDigit(char) {
  return /[0-9]/.test(char);
}

function makeDigit(char) {
  const node = document.createElement("span");
  node.className = "splitflap-digit";
  node.innerHTML = `
    <span class="splitflap-top">${char}</span>
    <span class="splitflap-bottom">${char}</span>
    <span class="splitflap-leaf">${char}</span>
  `;

  return {
    node,
    top: node.querySelector(".splitflap-top"),
    bottom: node.querySelector(".splitflap-bottom"),
    leaf: node.querySelector(".splitflap-leaf")
  };
}

function makeStatic(char) {
  const node = document.createElement("span");
  node.className = char === ":" ? "splitflap-sep" : "splitflap-mark";
  node.textContent = char;
  return { node };
}

function numericCycle(fromChar, toChar) {
  const start = Number(fromChar);
  const end = Number(toChar);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return [toChar];
  }

  const out = [];
  let value = start;
  let guard = 0;
  while (value !== end && guard < 12) {
    value = (value + 1) % 10;
    out.push(String(value));
    guard += 1;
  }
  return out.length ? out : [toChar];
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function createSplitFlapRenderer() {
  let root = null;
  let slots = [];
  let previous = "";
  let desiredText = "";
  let processing = false;
  let alive = true;
  let clickTimer = null;

  function pulseBoard() {
    if (!root) {
      return;
    }
    root.classList.add("clicking");
    if (clickTimer !== null) {
      window.clearTimeout(clickTimer);
    }
    clickTimer = window.setTimeout(() => {
      if (root) {
        root.classList.remove("clicking");
      }
      clickTimer = null;
    }, 80);
  }

  async function animateDigit(slot, nextChar, speed) {
    slot.leaf.textContent = nextChar;
    slot.node.classList.remove("flapping");
    slot.node.getBoundingClientRect();
    slot.node.classList.add("flapping");
    pulseBoard();
    await wait(speed);
    slot.top.textContent = nextChar;
    slot.bottom.textContent = nextChar;
    slot.leaf.textContent = nextChar;
    slot.node.classList.remove("flapping");
  }

  return {
    init(rootEl, config) {
      root = rootEl;
      if (!root) {
        return;
      }
      alive = true;
      root.classList.add("renderer-splitflap");
      root.dataset.flapSpeed = config.flapSpeed || "normal";
      root.dataset.anim = config.anim ? "1" : "0";
      root.innerHTML = "";
    },
    render(payload) {
      if (!root || !alive) {
        return;
      }

      desiredText = String(payload.text || "");
      if (processing) {
        return;
      }

      processing = true;
      processQueue().finally(() => {
        processing = false;
      });
    },
    destroy() {
      alive = false;
      if (root) {
        root.classList.remove("renderer-splitflap");
      }
      root = null;
      slots = [];
      previous = "";
      desiredText = "";
      processing = false;
      if (clickTimer !== null) {
        window.clearTimeout(clickTimer);
      }
      clickTimer = null;
    }
  };

  async function processQueue() {
    while (alive && root && desiredText !== previous) {
      const text = desiredText;
      if (slots.length !== text.length) {
        root.innerHTML = "";
        slots = text.split("").map((char) => {
          const item = isDigit(char) ? makeDigit(char) : makeStatic(char);
          root.append(item.node);
          return item;
        });
        previous = text;
        continue;
      }

      const speed = readFlapMs(root.dataset.flapSpeed);
      for (let i = text.length - 1; i >= 0; i -= 1) {
        if (!alive || !root) {
          return;
        }

        const nextChar = text[i];
        const oldChar = previous[i] || nextChar;
        const slot = slots[i];

        if (!slot.top) {
          if (slot.node.textContent !== nextChar) {
            slot.node.textContent = nextChar;
          }
          continue;
        }

        if (oldChar === nextChar) {
          continue;
        }

        if (root.dataset.anim === "0") {
          slot.top.textContent = nextChar;
          slot.bottom.textContent = nextChar;
          slot.leaf.textContent = nextChar;
          continue;
        }

        const steps = isDigit(oldChar) && isDigit(nextChar) ? numericCycle(oldChar, nextChar) : [nextChar];
        for (const step of steps) {
          await animateDigit(slot, step, speed);
          if (!alive) {
            return;
          }
        }
      }

      previous = text;
    }
  }
}

function readFlapMs(speed) {
  if (speed === "slow") {
    return 140;
  }
  if (speed === "fast") {
    return 70;
  }
  return 95;
}
