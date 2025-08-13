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

  // Calculate progress percentage based on competencies (0-6)
  let progressPercent = 0;
  if (count === 1) progressPercent = 33.33; // 2pm (120°)
  else if (count === 2) progressPercent = 50; // 4pm (180°)
  else if (count === 3) progressPercent = 66.67; // 6pm (240°)
  else if (count === 4) progressPercent = 83.33; // 8pm (300°)
  else if (count === 5) progressPercent = 91.67; // 10pm (330°)
  else if (count >= 6) progressPercent = 100; // 12pm (360°)

  // Calculate the angle for the conic gradient
  const progressAngle = (progressPercent / 100) * 360;

  return (
    <div className="flex items-center justify-center flex-col gap-2">
      <button
        type="button"
        aria-label={hoverTitle ? `${label}: ${hoverTitle}` : label}
        className="relative group outline-none rounded-full hover:z-10 focus:z-10"
        style={{ width: size, height: size }}
      >
        {/* Progress ring with conic gradient */}
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg shadow-gray-300/50">
          {/* Background ring */}
          <div 
            className="w-full h-full rounded-full"
            style={{ 
              background: "var(--muted)",
              padding: "8px",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)"
            }}
          />
          
          {/* Progress ring */}
          {count > 0 && (
            <div 
              className="absolute inset-0 rounded-full"
              style={{ 
                background: count >= 6 
                  ? `conic-gradient(from 0deg, var(--brand-teal) 0deg, #1ABF9B 60deg, #1ABF9B 120deg, var(--accent-blue) 180deg, var(--accent-purple) 240deg, var(--brand-teal) 360deg)`
                  : `conic-gradient(from 0deg, var(--brand-red) 0deg, var(--accent-pink) ${progressAngle}deg, transparent ${progressAngle}deg, transparent 360deg)`,
                padding: "8px",
                filter: count >= 6 
                  ? "drop-shadow(0 0 15px rgba(18, 199, 179, 0.5))"
                  : "drop-shadow(0 0 15px rgba(234, 107, 111, 0.5))"
              }}
            />
          )}
        </div>



        {/* Inner disc with modern styling */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div 
            className="rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 shadow-md" 
            style={{ 
              width: `calc(100% - ${baseInnerPaddingPx}px)`, 
              height: `calc(100% - ${baseInnerPaddingPx}px)`,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)"
            }} 
          />
        </div>
        
        {/* Label with modern typography */}
        <div
          className="absolute inset-0 grid place-items-center text-[color:var(--color-heading)] font-bold transition-all duration-300"
        >
          <span className={hoverTitle ? "group-hover:opacity-0 group-focus:opacity-0 transition-opacity duration-150" : undefined}>{label}</span>
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
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-all duration-300 z-10 rounded-full overflow-hidden shadow-2xl shadow-gray-400/40"
          style={{ 
            width: `${overlayScale * 100}%`, 
            height: `${overlayScale * 100}%`
          }}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden">
            {/* Background ring overlay */}
            <div 
              className="w-full h-full rounded-full"
              style={{ 
                background: "var(--muted)",
                padding: "12px",
                boxShadow: "inset 0 3px 6px rgba(0, 0, 0, 0.15)"
              }}
            />
            
            {/* Progress ring overlay */}
            {count > 0 && (
              <div 
                className="absolute inset-0 rounded-full"
                style={{ 
                  background: count >= 6 
                    ? `conic-gradient(from 0deg, var(--brand-teal) 0deg, #1ABF9B 60deg, #1ABF9B 120deg, var(--accent-blue) 180deg, var(--accent-purple) 240deg, var(--brand-teal) 360deg)`
                    : `conic-gradient(from 0deg, var(--brand-red) 0deg, var(--accent-pink) ${progressAngle}deg, transparent ${progressAngle}deg, transparent 360deg)`,
                  padding: "12px",
                  filter: count >= 6 
                    ? "drop-shadow(0 0 25px rgba(18, 199, 179, 0.7))"
                    : "drop-shadow(0 0 25px rgba(234, 107, 111, 0.7))"
                }}
              />
            )}
            
            <div className="absolute inset-0 grid place-items-center">
              <div 
                className="rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 shadow-lg" 
                style={{ 
                  width: `calc(100% - ${overlayInnerPaddingPx}px)`, 
                  height: `calc(100% - ${overlayInnerPaddingPx}px)`,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.9)"
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


