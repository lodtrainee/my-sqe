type Props = {
  value: number; // 0..1
};

export function Gauge({ value }: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  const angle = -90 + clamped * 180; // -90..90
  return (
    <svg width="100%" height="auto" viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>
      <path d="M20 120 A90 90 0 0 1 200 120" fill="none" stroke="#1c2640" strokeWidth="28" filter="url(#shadow)"/>
      <g transform={`translate(110,118) rotate(${angle})`}>
        <rect x="-6" y="-76" width="12" height="80" rx="6" fill="#ea6b6f" />
      </g>
    </svg>
  );
}


