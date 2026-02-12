import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/renderers/Renderers.module.scss";

export function SplitFlapRenderer({ text, speed }: { text: string; speed: "slow" | "normal" | "fast" }) {
  const chars = useMemo(() => text.split(""), [text]);
  const prevRef = useRef(text);
  const [changed, setChanged] = useState<Set<number>>(new Set());

  useEffect(() => {
    const next = new Set<number>();
    for (let i = 0; i < text.length; i += 1) {
      if (prevRef.current[i] !== text[i] && /[0-9]/.test(text[i] || "")) {
        next.add(i);
      }
    }
    setChanged(next);
    prevRef.current = text;
    const timer = window.setTimeout(() => setChanged(new Set()), speedMs(speed));
    return () => window.clearTimeout(timer);
  }, [text, speed]);

  return (
    <span className={styles.rendererSplitflap} data-flap-speed={speed}>
      {chars.map((char, index) => {
        if (!/[0-9]/.test(char)) {
          return (
            <span key={`${char}-${index}`} className={char === ":" ? styles.splitflapSep : styles.splitflapMark}>
              {char}
            </span>
          );
        }
        return (
          <span key={`${index}-${char}`} className={`${styles.splitflapDigit} ${changed.has(index) ? styles.flapping : ""}`}>
            <span className={styles.splitflapTop}>{char}</span>
            <span className={styles.splitflapBottom}>{char}</span>
            <span className={styles.splitflapLeaf}>{char}</span>
          </span>
        );
      })}
    </span>
  );
}

function speedMs(speed: "slow" | "normal" | "fast"): number {
  if (speed === "slow") {
    return 160;
  }
  if (speed === "fast") {
    return 80;
  }
  return 110;
}
