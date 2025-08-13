"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { load, computeTotalMonths, competencyCounts, placementsCount } from "@/lib/store";
import { ALL_LOW, LowLevelCompetency } from "@/lib/types";
import { Dial } from "@/components/Dial";
import { Gauge } from "@/components/Gauge";
import { calculateConsistencyStreak, calculateQuarterlyStats, getConsistencyMessage, getConsistencyEmoji } from "@/lib/consistency";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] font-bold text-[color:var(--color-heading)] mb-6 tracking-tight">{children}</h2>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [periods, setPeriods] = useState(() => [] as any[]);
  const [data, setData] = useState(() => null as any);

  useEffect(() => {
    setMounted(true);
    const loadedData = load();
    setPeriods(loadedData.periods);
    setData(loadedData);
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
  
  const consistencyStats = useMemo(() => {
    if (!mounted || !data) {
      return { currentStreak: 0, longestStreak: 0, totalWeeks: 0, lastReflectionDate: null };
    }
    return calculateConsistencyStreak(data);
  }, [mounted, data]);

  const quarterlyStats = useMemo(() => {
    if (!mounted || !data) {
      return { currentQuarterWeeks: 0, previousQuarterWeeks: 0, currentQuarterName: '', previousQuarterName: '' };
    }
    return calculateQuarterlyStats(data);
  }, [mounted, data]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 page-transition">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className={clsx("display-title", "text-[clamp(40px,8vw,90px)] leading-[0.95] font-extrabold tracking-tight fade-in-up")}>DASHBOARD</h1>
        
        {/* Battery-style Consistency Tracker */}
        <div className="flex items-center gap-2 fade-in-up group relative" style={{ animationDelay: '0.2s' }}>
          {/* Previous Quarter - Slick Badge */}
          <div className="px-2 py-1 bg-gray-100 rounded-full border border-gray-200">
            <div className="text-xs font-medium text-gray-600">Last quarter: {quarterlyStats.previousQuarterWeeks}w</div>
          </div>
          
          {/* Current Quarter Battery */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-[color:var(--foreground)]">
              {quarterlyStats.currentQuarterWeeks}w
            </div>
            <div className="pill-track h-6 w-72 flex items-center p-1 relative overflow-hidden">
              <div 
                className="pill-fill h-full transition-all duration-700 ease-out rounded-full shadow-lg relative" 
                style={{ 
                  width: `${Math.min((quarterlyStats.currentQuarterWeeks / 12) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #2dd4bf 0%, #1ABF9B 30%, #14b8a6 70%, #0d9488 100%)',
                  boxShadow: '0 4px 12px rgba(26, 191, 155, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
                }} 
              >
                {/* Primary shine effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
                    transform: 'translateX(-15%)'
                  }}
                />
                {/* Secondary highlight */}
                <div 
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 30%)',
                    transform: 'translateX(10%) translateY(-10%)'
                  }}
                />
                {/* Bottom shadow for depth */}
                <div 
                  className="absolute inset-0 rounded-full opacity-25"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.2) 100%)',
                    transform: 'translateX(5%) translateY(5%)'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-50 border border-gray-200 text-[#252E4B] text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg">
            Consistency is key! This shows how many reflections you've added this quarter.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-50"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-28 gap-y-8 sm:gap-y-12 items-start">
        {/* Left column */}
        <div className="space-y-8 sm:space-y-12">
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
            <SectionTitle>Total Organisations</SectionTitle>
            <div className="text-[clamp(20px,4vw,32px)] font-extrabold text-[color:var(--color-heading)] mb-6 tracking-tight flex items-center gap-3">
              {placements} out of 4 organisations
              {placements > 4 && (
                <div className="relative group flex items-center">
                                     <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-gray-400/50 flex items-center justify-center cursor-pointer hover:shadow-xl hover:shadow-gray-500/60 transition-all duration-300">
                     <span className="text-white font-black text-sm">!</span>
                   </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-50 border border-gray-200 text-[#252E4B] text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    Maximum organisations exceeded
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-50"></div>
                  </div>
                </div>
              )}
            </div>
            


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
                        width: `${Math.min((placements / 4) * 100, 100)}%`,
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
                                 <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-50 via-pink-25 to-white shadow-inner flex items-center justify-center">
                 <svg className="w-6 h-6" style={{ color: '#252E4B' }} fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
               </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--color-heading)] mb-3 tracking-tight">QWE Information</h3>
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
        <div className="space-y-8 sm:space-y-12">
          <div className="min-w-[min(520px,100%)] fade-in-up" style={{ animationDelay: '0.6s' }}>
            <SectionTitle>Competency Dials</SectionTitle>
            <div className="text-[clamp(20px,4vw,32px)] font-extrabold text-[color:var(--color-heading)] mb-4 tracking-tight">
              {Object.values(counts).filter(count => count >= 6).length} out of 2 competencies
            </div>
            {/* Competency Information Card */}
            <div className="p-6 w-full rounded-2xl bg-white border border-gray-200 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] mb-6"
                 style={{ 
                   animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
                   animationDelay: '0.8s'
                 }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-50 via-pink-25 to-white shadow-inner flex items-center justify-center">
                  <svg className="w-5 h-5" style={{ color: '#252E4B' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[color:var(--color-heading)] mb-2 tracking-tight">Competency Guidance</h3>
                  <p className="text-[color:var(--foreground)] leading-relaxed text-sm">
                    The SRA doesn't set a minimum number of times you must apply a competency. In theory, 2 strong examples in different contexts may be enough. In this tracker, the dial fills at 6 to promote repetition, variety and depth of experience. A full dial doesn't guarantee competence and an unfilled one doesn't mean it's undeveloped. Quality and supervisor judgment matter most.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 sm:gap-3 relative mt-8">
              {ALL_LOW.map((competency, index) => (
                <div
                  key={competency}
                  className="relative hover:z-50"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both'
                  }}
                >
                  <Dial
                    label={competency}
                    count={counts[competency]}
                  />
                </div>
              ))}
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}
