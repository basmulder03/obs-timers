import styles from "@/renderers/Renderers.module.scss";

const MAP: Record<string, string[]> = {
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

export function SevenRenderer({ text, segmentGlow }: { text: string; segmentGlow: boolean }) {
  return (
    <span className={styles.rendererSeven} data-segment-glow={segmentGlow ? "1" : "0"}>
      {text.split("").map((char, index) => {
        if (char === ":") {
          return (
            <span key={`c-${index}`} className={styles.sevenColon}>
              <i></i>
              <i></i>
            </span>
          );
        }
        if (char === ".") {
          return <span key={`d-${index}`} className={styles.sevenDot} />;
        }
        if (!/[0-9]/.test(char)) {
          return (
            <span key={`m-${index}`} className={styles.sevenMark}>
              {char}
            </span>
          );
        }
        const active = MAP[char] || [];
        return (
          <span key={`n-${index}`} className={styles.sevenDigit}>
            {(["a", "b", "c", "d", "e", "f", "g"] as const).map((part) => (
              <i key={part} className={`${styles.seg} ${styles[part]} ${active.includes(part) ? styles.on : ""}`}></i>
            ))}
          </span>
        );
      })}
    </span>
  );
}
