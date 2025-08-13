"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { load, computeTotalMonths, competencyCounts, placementsCount } from "@/lib/store";
import { ALL_LOW, LowLevelCompetency } from "@/lib/types";
import { Dial } from "@/components/Dial";
import { Gauge } from "@/components/Gauge";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] font-bold text-[color:var(--color-heading)] mb-6 tracking-tight">{children}</h2>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [periods, setPeriods] = useState(() => [] as any[]);

  useEffect(() => {
    setMounted(true);
    setPeriods(load().periods);
  }, []);



  const months = useMemo(() => (mounted ? computeTotalMonths(periods) : 0), [mounted, periods]);
  const counts = useMemo(() => {
    if (!mounted) {
      return Object.fromEntries(ALL_LOW.map((k) => [k, 0])) as Record<LowLevelCompetency, number>;
    }
    return competencyCounts(periods);
  }, [mounted, periods]);
  const placements = useMemo(() => (mounted ? placementsCount(periods) : 0), [mounted, periods]);
  const progress = Math.min(1, months / 24);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 page-transition">
      <h1 className={clsx("display-title", "text-[clamp(40px,8vw,90px)] leading-[0.95] font-extrabold mb-8 sm:mb-12 tracking-tight fade-in-up")}>DASHBOARD</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-28 gap-y-16 sm:gap-y-20 items-start">
        {/* Left column */}
        <div className="space-y-16 sm:space-y-20">
          <div className="min-w-[min(520px,100%)] fade-in-up" style={{ animationDelay: '0.2s' }}>
            <SectionTitle>QWE Progress Bar</SectionTitle>
            <div>
              <div className="text-[clamp(20px,4vw,32px)] font-extrabold text-[color:var(--color-heading)] mb-6 tracking-tight">{months} out of 24 months</div>
              <div className="pill-track h-[48px] sm:h-[70px] w-full max-w-[720px] flex items-center p-2 sm:p-3">
                <div className="pill-fill h-full" style={{ width: months > 0 ? `${Math.min(100, progress * 100)}%` : 0 }} />
              </div>
            </div>
          </div>

          <div className="col-span-1 fade-in-up" style={{ animationDelay: '0.4s' }}>
            <SectionTitle>Total Placements</SectionTitle>
            <div className="text-[clamp(20px,4vw,32px)] font-extrabold text-[color:var(--color-heading)] mb-6 tracking-tight">{placements} out of 4 organisations</div>
            <div className="space-y-8">
              {/* Option 3: Milestone-based Design */}
              <div className="max-w-[720px]">
                {/* Progress steps */}
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ease-out transform hover:scale-110 ${
                          step <= placements 
                            ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white shadow-lg shadow-red-500/30 floating' 
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300 hover:shadow-md'
                        }`}
                        style={{ 
                          animationDelay: `${step * 0.1}s`,
                          animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both'
                        }}
                      >
                        {step <= placements ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-lg font-semibold">{step}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress line */}
                <div className="relative mt-4">
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                      style={{ 
                        width: `${(placements / 4) * 100}%`,
                        animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) both',
                        animationDelay: '0.5s'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Enhanced info card with gradient and shadow */}
              <div className="p-8 max-w-[720px] rounded-2xl bg-white border border-gray-200 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
                   style={{ 
                     animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
                     animationDelay: '0.6s'
                   }}>
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--color-heading)] mb-3 tracking-tight">Placement Information</h3>
                    <p className="text-[color:var(--foreground)] leading-relaxed text-[15px]">
                      All of your assignments through LOD count as 1 organisation. QWE can be gained in up to 4 organisations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="min-w-[min(520px,100%)] sm:justify-self-end self-start fade-in-up" style={{ animationDelay: '0.6s' }}>
          <SectionTitle>Competency Dials</SectionTitle>
          <div className="dial-grid grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-6 sm:gap-y-8 w-full max-w-[520px]">
            {ALL_LOW.map((k) => (
              <div key={k} className="dial-chip">
                <Dial label={k} count={counts[k]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
