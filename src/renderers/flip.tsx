import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/renderers/Renderers.module.scss";

export function FlipRenderer({ text, speed }: { text: string; speed: "slow" | "normal" | "fast" }) {
  const chars = useMemo(() => text.split(""), [text]);
  const prevRef = useRef(text);
  const [previousText, setPreviousText] = useState(text);
  const [changed, setChanged] = useState<Set<number>>(new Set());

  useEffect(() => {
    const previous = prevRef.current;
    const next = new Set<number>();
    for (let i = 0; i < text.length; i += 1) {
      if (previous[i] !== text[i] && /[0-9]/.test(text[i] || "")) {
        next.add(i);
      }
    }
    setPreviousText(previous);
    setChanged(next);
    prevRef.current = text;
    const timer = window.setTimeout(() => setChanged(new Set()), speedMs(speed));
    return () => window.clearTimeout(timer);
  }, [text, speed]);

  return (
    <span className={styles.rendererFlip} data-flip-speed={speed}>
      {chars.map((char, index) => {
        if (!/[0-9]/.test(char)) {
          return (
            <span key={`${char}-${index}`} className={char === ":" ? styles.flipSep : styles.flipMark}>
              {char}
            </span>
          );
        }

        const previous = previousText[index] ?? char;
        const isChanged = changed.has(index);
        return (
          <span key={`${index}-${char}`} className={styles.flipSlot}>
            <span className={`${styles.flipCard} ${isChanged ? styles.flipping : ""}`}>
              <span className={`${styles.half} ${styles.top} ${styles.current}`}>{isChanged ? previous : char}</span>
              <span className={`${styles.half} ${styles.bottom} ${styles.current}`}>{isChanged ? previous : char}</span>
              <span className={`${styles.half} ${styles.top} ${styles.next}`}>{char}</span>
              <span className={`${styles.half} ${styles.bottom} ${styles.next}`}>{char}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

function speedMs(speed: "slow" | "normal" | "fast"): number {
  if (speed === "slow") {
    return 520;
  }
  if (speed === "fast") {
    return 260;
  }
  return 380;
}
