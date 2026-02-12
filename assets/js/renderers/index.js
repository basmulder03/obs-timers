import { createClassicRenderer } from "./classic.js";
import { createSevenRenderer } from "./seven.js";
import { createFlipRenderer } from "./flip.js";
import { createRingRenderer } from "./ring.js";
import { createSplitFlapRenderer } from "./splitflap.js";

export function createRenderer(name) {
  const key = String(name || "classic").toLowerCase();
  if (key === "seven") {
    return createSevenRenderer();
  }
  if (key === "flip") {
    return createFlipRenderer();
  }
  if (key === "ring") {
    return createRingRenderer();
  }
  if (key === "splitflap") {
    return createSplitFlapRenderer();
  }
  return createClassicRenderer();
}
