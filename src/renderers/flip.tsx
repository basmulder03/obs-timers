import { useMemo } from "react";

export function FlipRenderer({ text, speed }: { text: string; speed: "slow" | "normal" | "fast" }) {
  const chars = useMemo(() => text.split(""), [text]);
  return (
    <span className="renderer-flip" data-flip-speed={speed}>
      {chars.map((char, index) => {
        if (!/[0-9]/.test(char)) {
          return (
            <span key={`${char}-${index}`} className={char === ":" ? "flip-sep" : "flip-mark"}>
              {char}
            </span>
          );
        }
        return (
          <span key={`${char}-${index}`} className="flip-slot">
            <span className="flip-card">
              <span className="half top current">{char}</span>
              <span className="half bottom current">{char}</span>
              <span className="half top next">{char}</span>
              <span className="half bottom next">{char}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
