const SEGMENTS_BY_CHAR = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "d", "e", "g"],
  "3": ["a", "b", "c", "d", "g"],
  "4": ["b", "c", "f", "g"],
  "5": ["a", "c", "d", "f", "g"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"]
};

export function createSevenRenderer() {
  let root = null;
  let previous = "";

  return {
    init(rootEl, config) {
      root = rootEl;
      if (!root) {
        return;
      }
      root.classList.add("renderer-seven");
      root.dataset.segmentGlow = config.segmentGlow ? "1" : "0";
      root.innerHTML = "";
    },
    render(payload) {
      if (!root) {
        return;
      }

      const text = payload.text;
      if (text === previous) {
        return;
      }

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (char === ":") {
          const colon = document.createElement("span");
          colon.className = "seven-colon";
          colon.innerHTML = "<i></i><i></i>";
          fragment.append(colon);
          continue;
        }
        if (char === ".") {
          const dot = document.createElement("span");
          dot.className = "seven-dot";
          fragment.append(dot);
          continue;
        }
        if (char === "+") {
          const plus = document.createElement("span");
          plus.className = "seven-plus";
          plus.textContent = "+";
          fragment.append(plus);
          continue;
        }

        const digit = document.createElement("span");
        digit.className = "seven-digit";
        if (previous[i] !== char) {
          digit.classList.add("changed");
        }

        const active = SEGMENTS_BY_CHAR[char] || [];
        for (const id of ["a", "b", "c", "d", "e", "f", "g"]) {
          const segment = document.createElement("i");
          segment.className = `seg ${id}${active.includes(id) ? " on" : ""}`;
          digit.append(segment);
        }
        fragment.append(digit);
      }

      root.innerHTML = "";
      root.append(fragment);
      previous = text;
    },
    destroy() {
      if (root) {
        root.classList.remove("renderer-seven");
      }
      root = null;
      previous = "";
    }
  };
}
