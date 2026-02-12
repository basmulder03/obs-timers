function makeSlot(char) {
  const slot = document.createElement("span");
  slot.className = "flip-slot";

  const card = document.createElement("span");
  card.className = "flip-card";

  const top = document.createElement("span");
  top.className = "half top current";
  top.textContent = char;

  const bottom = document.createElement("span");
  bottom.className = "half bottom current";
  bottom.textContent = char;

  const topNext = document.createElement("span");
  topNext.className = "half top next";
  topNext.textContent = char;

  const bottomNext = document.createElement("span");
  bottomNext.className = "half bottom next";
  bottomNext.textContent = char;

  card.append(top, bottom, topNext, bottomNext);
  slot.append(card);
  return { slot, top, bottom, topNext, bottomNext };
}

function makeStatic(char) {
  const node = document.createElement("span");
  node.className = char === ":" ? "flip-sep" : "flip-mark";
  node.textContent = char;
  return { node };
}

function isDigit(char) {
  return /[0-9]/.test(char);
}

export function createFlipRenderer() {
  let root = null;
  let slots = [];
  let previous = "";

  return {
    init(rootEl, config) {
      root = rootEl;
      if (!root) {
        return;
      }
      root.classList.add("renderer-flip");
      root.dataset.flipSpeed = config.flipSpeed || "normal";
      root.dataset.anim = config.anim ? "1" : "0";
      root.innerHTML = "";
    },
    render(payload) {
      if (!root) {
        return;
      }

      const text = payload.text;
      if (text !== previous || slots.length !== text.length) {
        root.innerHTML = "";
        slots = text.split("").map((char) => {
          const item = isDigit(char) ? makeSlot(char) : makeStatic(char);
          root.append(item.slot || item.node);
          return item;
        });
      }

      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const slot = slots[i];
        if (!slot.top) {
          if (slot.node && slot.node.textContent !== char) {
            slot.node.textContent = char;
          }
          continue;
        }

        const old = previous[i] || char;
        if (old === char) {
          continue;
        }

        if (root.dataset.anim === "0") {
          slot.top.textContent = char;
          slot.bottom.textContent = char;
          slot.topNext.textContent = char;
          slot.bottomNext.textContent = char;
          continue;
        }

        slot.top.textContent = old;
        slot.bottom.textContent = old;
        slot.topNext.textContent = char;
        slot.bottomNext.textContent = char;

        const card = slot.slot.querySelector(".flip-card");
        card.classList.remove("flipping");
        card.getBoundingClientRect();
        card.classList.add("flipping");

        window.setTimeout(() => {
          slot.top.textContent = char;
          slot.bottom.textContent = char;
          card.classList.remove("flipping");
        }, readFlipMs(root.dataset.flipSpeed));
      }

      previous = text;
    },
    destroy() {
      if (root) {
        root.classList.remove("renderer-flip");
      }
      root = null;
      slots = [];
      previous = "";
    }
  };
}

function readFlipMs(speed) {
  if (speed === "slow") {
    return 520;
  }
  if (speed === "fast") {
    return 260;
  }
  return 380;
}
