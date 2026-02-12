export function createClassicRenderer() {
  let root = null;

  return {
    init(rootEl) {
      root = rootEl;
      if (root) {
        root.classList.add("renderer-classic");
      }
    },
    render(payload) {
      if (!root) {
        return;
      }
      root.textContent = payload.text;
    },
    destroy() {
      if (root) {
        root.classList.remove("renderer-classic");
      }
      root = null;
    }
  };
}
