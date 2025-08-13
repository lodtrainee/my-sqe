type Props = {
  label: string;
  count: number; // how many times logged
};

const COMPETENCY_TITLES: Record<string, string> = {
  // A. Ethics, Professionalism & Judgment
  A1: "Act honestly and with integrity",
  A2: "Maintain competence and legal knowledge",
  A3: "Work within the limits of your competence and needed supervision",
  A4: "Apply sufficiently detailed legal knowledge",
  A5: "Apply critical thinking and analysis to problem‑solving",

  // B. Technical Legal Practice
  B1: "Obtain relevant facts",
  B2: "Undertake legal research",
  B3: "Advise on legal and factual issues",
  B4: "Draft documents, clauses and agreements",
  B5: "Undertake effective spoken and written advocacy",
  B6: "Negotiate solutions to clients' issues",
  B7: "Plan, manage and progress legal matters",

  // C. Working with Other People
  C1: "Communicate clearly and effectively",
  C2: "Establish and maintain effective and professional relations with clients",
  C3: "Establish and maintain effective and professional relations with others",

  // D. Managing Yourself and Your Work
  D1: "Initiate, plan, prioritise and manage work activities and projects",
  D2: "Keep, use and maintain accurate, complete and clear records",
  D3: "Apply good business practice",
};

export function Dial({ label, count }: Props) {
  const size = "clamp(56px, 5.8vw, 80px)";
  const hoverTitle = COMPETENCY_TITLES[label];
  const baseInnerPaddingPx = 28;
  const overlayScale = 2.3;
  const overlayRingScale = 1.35;
  const overlayInnerPaddingPx = Math.round(baseInnerPaddingPx * overlayRingScale);

  // Calculate progress percentage
  let progressPercent = 0;
  if (count >= 3) progressPercent = 100;
  else if (count === 2) progressPercent = 83.33;
  else if (count === 1) progressPercent = 66.67;

  return (
    <div className="flex items-center justify-center flex-col gap-2">
      <button
        type="button"
        aria-label={hoverTitle ? `${label}: ${hoverTitle}` : label}
        className="relative group outline-none rounded-full hover:z-10 focus:z-10"
        style={{ width: size, height: size }}
      >
        {/* Animated background with pulsing effect */}
        <div className="relative w-full h-full rounded-full overflow-hidden">
          {/* Base circle with animated background */}
          <div 
            className={`w-full h-full rounded-full transition-all duration-500 ${
              count > 0 ? 'animate-pulse' : ''
            }`}
            style={{ 
              background: count > 0 
                ? count >= 3 
                  ? "linear-gradient(45deg, var(--brand-teal), var(--accent-purple), var(--brand-teal))"
                  : "linear-gradient(45deg, var(--brand-red), var(--accent-pink), var(--brand-red))"
                : "var(--muted)",
              backgroundSize: count > 0 ? "200% 200%" : "100% 100%",
              animation: count > 0 ? "gradientShift 3s ease infinite" : "none",
              boxShadow: count > 0 
                ? count >= 3 
                  ? "0 0 20px rgba(18, 199, 179, 0.4), 0 4px 16px rgba(18, 199, 179, 0.3)"
                  : "0 0 20px rgba(234, 107, 111, 0.4), 0 4px 16px rgba(234, 107, 111, 0.3)"
                : "0 2px 8px rgba(0,0,0,0.1)"
            }}
          />
          
          {/* Progress indicator dots */}
          {count > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-1">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      dot <= count ? 'bg-white' : 'bg-white/30'
                    }`}
                    style={{
                      animation: dot <= count ? `pulse ${1 + dot * 0.2}s ease-in-out infinite` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inner disc with modern styling */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div 
            className="rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 group-hover:scale-110" 
            style={{ 
              width: `calc(100% - ${baseInnerPaddingPx}px)`, 
              height: `calc(100% - ${baseInnerPaddingPx}px)`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }} 
          />
        </div>
        
        {/* Label with modern typography */}
        <div
          className="absolute inset-0 grid place-items-center text-[color:var(--color-heading)] font-bold transition-all duration-300"
        >
          <span className={hoverTitle ? "group-hover:opacity-0 group-focus:opacity-0 transition-opacity duration-150" : undefined}>{label}</span>
        </span>
        </div>
        
        {/* Hover title */}
        {hoverTitle && (
          <div className="absolute inset-0 grid place-items-center px-2 text-center">
            <span
              className="text-[10px] leading-tight text-[color:var(--color-heading)] font-semibold opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150"
            >
              {hoverTitle}
            </span>
          </div>
        )}

        {/* Enhanced hover overlay */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-all duration-300 z-10 rounded-full overflow-hidden"
          style={{ 
            width: `${overlayScale * 100}%`, 
            height: `${overlayScale * 100}%`
          }}
        >
          <div className="relative w-full h-full">
            {/* Animated background */}
            <div 
              className={`w-full h-full rounded-full transition-all duration-500 ${
                count > 0 ? 'animate-pulse' : ''
              }`}
              style={{ 
                background: count > 0 
                  ? count >= 3 
                    ? "linear-gradient(45deg, var(--brand-teal), var(--accent-purple), var(--brand-teal))"
                    : "linear-gradient(45deg, var(--brand-red), var(--accent-pink), var(--brand-red))"
                  : "var(--muted)",
                backgroundSize: count > 0 ? "200% 200%" : "100% 100%",
                animation: count > 0 ? "gradientShift 2s ease infinite" : "none",
                boxShadow: count > 0 
                  ? count >= 3 
                    ? "0 0 40px rgba(18, 199, 179, 0.6), 0 8px 32px rgba(18, 199, 179, 0.4)"
                    : "0 0 40px rgba(234, 107, 111, 0.6), 0 8px 32px rgba(234, 107, 111, 0.4)"
                  : "0 4px 20px rgba(0,0,0,0.15)"
              }}
            />
            
            {/* Progress dots overlay */}
            {count > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-2">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        dot <= count ? 'bg-white' : 'bg-white/30'
                      }`}
                      style={{
                        animation: dot <= count ? `pulse ${0.8 + dot * 0.1}s ease-in-out infinite` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 grid place-items-center">
              <div 
                className="rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300" 
                style={{ 
                  width: `calc(100% - ${overlayInnerPaddingPx}px)`, 
                  height: `calc(100% - ${overlayInnerPaddingPx}px)`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }} 
              />
            </div>
            {hoverTitle && (
              <div
                className="absolute grid place-items-center text-center"
                style={{ inset: Math.round(overlayInnerPaddingPx * 0.8) }}
              >
                <span className="text-[11px] leading-[1.15] text-[color:var(--color-heading)] font-bold">
                  {hoverTitle}
                </span>
              </div>
            )}
            
          </div>
        </div>
      </button>
    </div>
  );
}

