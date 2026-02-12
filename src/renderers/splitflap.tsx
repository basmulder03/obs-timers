export function SplitFlapRenderer({ text, speed }: { text: string; speed: "slow" | "normal" | "fast" }) {
  return (
    <span className="renderer-splitflap" data-flap-speed={speed}>
      {text.split("").map((char, index) => {
        if (!/[0-9]/.test(char)) {
          return (
            <span key={`${char}-${index}`} className={char === ":" ? "splitflap-sep" : "splitflap-mark"}>
              {char}
            </span>
          );
        }
        return (
          <span key={`${char}-${index}`} className="splitflap-digit">
            <span className="splitflap-top">{char}</span>
            <span className="splitflap-bottom">{char}</span>
            <span className="splitflap-leaf">{char}</span>
          </span>
        );
      })}
    </span>
  );
}
