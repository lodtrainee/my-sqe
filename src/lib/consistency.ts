import { AppData } from './store';
import { Reflection } from './types';

export interface ConsistencyStats {
  currentStreak: number;
  longestStreak: number;
  totalWeeks: number;
  lastReflectionDate: string | null;
}

export interface QuarterlyStats {
  currentQuarterWeeks: number;
  previousQuarterWeeks: number;
  currentQuarterName: string;
  previousQuarterName: string;
}

export function calculateConsistencyStreak(data: AppData): ConsistencyStats {
  // Get all reflections from all periods
  const allReflections = data.periods.flatMap(period => period.reflections);
  
  if (!allReflections || allReflections.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalWeeks: 0,
      lastReflectionDate: null
    };
  }

  // Sort reflections by date
  const sortedReflections = [...allReflections].sort((a, b) => 
    new Date(a.loggedOn).getTime() - new Date(b.loggedOn).getTime()
  );

  // Group reflections by week (Monday to Sunday)
  const weeklyReflections = new Map<string, number>();
  
  sortedReflections.forEach(reflection => {
    const date = new Date(reflection.loggedOn);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    weeklyReflections.set(weekKey, (weeklyReflections.get(weekKey) || 0) + 1);
  });

  const weeks = Array.from(weeklyReflections.keys()).sort();
  const totalWeeks = weeks.length;
  
  if (totalWeeks === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalWeeks: 0,
      lastReflectionDate: null
    };
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  const currentWeekKey = currentWeekStart.toISOString().split('T')[0];
  
  // Check if they've reflected this week
  const hasReflectedThisWeek = weeklyReflections.has(currentWeekKey);
  
  if (hasReflectedThisWeek) {
    currentStreak = 1;
    // Count backwards to see how many consecutive weeks
    for (let i = weeks.length - 2; i >= 0; i--) {
      const weekDate = new Date(weeks[i]);
      const prevWeekDate = new Date(weeks[i + 1]);
      
      // Check if weeks are consecutive
      const weekDiff = Math.floor((prevWeekDate.getTime() - weekDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weekDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    // Check if they reflected last week and count backwards
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekKey = lastWeekStart.toISOString().split('T')[0];
    
    if (weeklyReflections.has(lastWeekKey)) {
      currentStreak = 1;
      // Count backwards from last week
      for (let i = weeks.length - 2; i >= 0; i--) {
        const weekDate = new Date(weeks[i]);
        const prevWeekDate = new Date(weeks[i + 1]);
        
        const weekDiff = Math.floor((prevWeekDate.getTime() - weekDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        if (weekDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < weeks.length; i++) {
    const weekDate = new Date(weeks[i]);
    const prevWeekDate = new Date(weeks[i - 1]);
    
    const weekDiff = Math.floor((weekDate.getTime() - prevWeekDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  const lastReflectionDate = sortedReflections[sortedReflections.length - 1].loggedOn;

  return {
    currentStreak,
    longestStreak,
    totalWeeks,
    lastReflectionDate
  };
}

export function calculateQuarterlyStats(data: AppData): QuarterlyStats {
  // Get all reflections from all periods
  const allReflections = data.periods.flatMap(period => period.reflections);
  
  if (!allReflections || allReflections.length === 0) {
    return {
      currentQuarterWeeks: 0,
      previousQuarterWeeks: 0,
      currentQuarterName: getCurrentQuarterName(),
      previousQuarterName: getPreviousQuarterName()
    };
  }

  const today = new Date();
  const currentQuarter = getQuarter(today);
  const previousQuarter = getPreviousQuarter(today);

  // Group reflections by quarter
  const quarterlyReflections = new Map<string, Set<string>>();
  
  allReflections.forEach((reflection: Reflection) => {
    const date = new Date(reflection.loggedOn);
    const quarter = getQuarter(date);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!quarterlyReflections.has(quarter)) {
      quarterlyReflections.set(quarter, new Set());
    }
    quarterlyReflections.get(quarter)!.add(weekKey);
  });

  const currentQuarterWeeks = quarterlyReflections.get(currentQuarter)?.size || 0;
  const previousQuarterWeeks = quarterlyReflections.get(previousQuarter)?.size || 0;

  return {
    currentQuarterWeeks,
    previousQuarterWeeks,
    currentQuarterName: getQuarterDisplayName(currentQuarter),
    previousQuarterName: getQuarterDisplayName(previousQuarter)
  };
}

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

function getQuarter(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month >= 0 && month <= 2) return `${year}-Q1`;
  if (month >= 3 && month <= 5) return `${year}-Q2`;
  if (month >= 6 && month <= 8) return `${year}-Q3`;
  return `${year}-Q4`;
}

function getPreviousQuarter(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month >= 0 && month <= 2) return `${year-1}-Q4`;
  if (month >= 3 && month <= 5) return `${year}-Q1`;
  if (month >= 6 && month <= 8) return `${year}-Q2`;
  return `${year}-Q3`;
}

function getCurrentQuarterName(): string {
  const today = new Date();
  return getQuarterDisplayName(getQuarter(today));
}

function getPreviousQuarterName(): string {
  const today = new Date();
  return getQuarterDisplayName(getPreviousQuarter(today));
}

function getQuarterDisplayName(quarter: string): string {
  const [year, q] = quarter.split('-');
  const currentYear = new Date().getFullYear();
  const yearDiff = currentYear - parseInt(year);
  
  if (yearDiff === 0) {
    return q; // Q1, Q2, Q3, Q4
  } else if (yearDiff === 1) {
    return `Last ${q}`; // Last Q1, Last Q2, etc.
  } else {
    return `${year} ${q}`; // 2023 Q1, etc.
  }
}

export function getConsistencyMessage(stats: ConsistencyStats): string {
  if (stats.currentStreak === 0) {
    return "Start your reflection journey!";
  }
  
  if (stats.currentStreak === 1) {
    return "Great start! Keep it up!";
  }
  
  if (stats.currentStreak >= 2 && stats.currentStreak <= 4) {
    return `You're on a ${stats.currentStreak}-week streak!`;
  }
  
  if (stats.currentStreak >= 5 && stats.currentStreak <= 8) {
    return `Impressive ${stats.currentStreak}-week streak!`;
  }
  
  if (stats.currentStreak >= 9 && stats.currentStreak <= 12) {
    return `Outstanding ${stats.currentStreak}-week streak!`;
  }
  
  return `Incredible ${stats.currentStreak}-week streak!`;
}

export function getConsistencyEmoji(stats: ConsistencyStats): string {
  if (stats.currentStreak === 0) return "🚀";
  if (stats.currentStreak <= 2) return "🔥";
  if (stats.currentStreak <= 4) return "⚡";
  if (stats.currentStreak <= 8) return "💪";
  if (stats.currentStreak <= 12) return "🏆";
  return "👑";
}
