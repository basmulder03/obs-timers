import type { RendererType } from "@/types";
import { ClassicRenderer } from "@/renderers/classic";
import { SevenRenderer } from "@/renderers/seven";
import { FlipRenderer } from "@/renderers/flip";
import { RingRenderer } from "@/renderers/ring";
import { SplitFlapRenderer } from "@/renderers/splitflap";

interface Props {
  renderer: RendererType;
  text: string;
  progress: number;
  segmentGlow: boolean;
  flipSpeed: "slow" | "normal" | "fast";
  flapSpeed: "slow" | "normal" | "fast";
  ringThickness: number;
  ringTicks: boolean;
}

export function RendererView(props: Props) {
  if (props.renderer === "seven") {
    return <SevenRenderer text={props.text} segmentGlow={props.segmentGlow} />;
  }
  if (props.renderer === "flip") {
    return <FlipRenderer text={props.text} speed={props.flipSpeed} />;
  }
  if (props.renderer === "ring") {
    return <RingRenderer text={props.text} progress={props.progress} thickness={props.ringThickness} ticks={props.ringTicks} />;
  }
  if (props.renderer === "splitflap") {
    return <SplitFlapRenderer text={props.text} speed={props.flapSpeed} />;
  }
  return <ClassicRenderer text={props.text} />;
}
