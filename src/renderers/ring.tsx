export function RingRenderer({
  text,
  progress,
  thickness,
  ticks
}: {
  text: string;
  progress: number;
  thickness: number;
  ticks: boolean;
}) {
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);

  return (
    <span className="renderer-ring" data-ring-ticks={ticks ? "1" : "0"} style={{ ["--ring-thickness" as string]: `${thickness}px` }}>
      <svg viewBox="0 0 220 220" className="ring-svg" aria-hidden="true">
        <g className="ring-ticks">
          {ticks
            ? Array.from({ length: 60 }).map((_, i) => {
                const angle = (i / 60) * Math.PI * 2;
                const major = i % 5 === 0;
                const inner = major ? 72 : 76;
                const outer = 86;
                const x1 = 110 + Math.cos(angle) * inner;
                const y1 = 110 + Math.sin(angle) * inner;
                const x2 = 110 + Math.cos(angle) * outer;
                const y2 = 110 + Math.sin(angle) * outer;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })
            : null}
        </g>
        <circle className="ring-track" cx="110" cy="110" r={radius}></circle>
        <circle className="ring-progress" cx="110" cy="110" r={radius} strokeDasharray={circumference} strokeDashoffset={offset}></circle>
      </svg>
      <span className="ring-text">{text}</span>
    </span>
  );
}
