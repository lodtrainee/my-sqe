import { v4 as uuidv4 } from "uuid";
import { differenceInDays } from "date-fns";
import {
  QwePeriod,
  Reflection,
  LowLevelCompetency,
  AssignmentType,
  LOD_DEFAULTS,
  ALL_LOW,
} from "@/lib/types";

export type AppData = {
  periods: QwePeriod[];
};

const STORAGE_KEY = "qwe-data-v1";

function getDefaultData(): AppData {
  // Seed with sample data so first-time users see the UI populated
  const nowYear = new Date().getFullYear();
  const sample: AppData = {
    periods: [
      {
        id: uuidv4(),
        companyName: "Acme Corp",
        companySraNumber: undefined,
        jobTitle: "Paralegal",
        startDate: `${nowYear}-01-01T00:00:00.000Z`,
        endDate: `${nowYear}-03-20T00:00:00.000Z`,
        assignmentType: "Standard",
        confirmingSolicitor: {
          fullName: "Jane Smith",
          sraNumber: "654321",
          email: "jane@example.com",
        },
        reflections: [],
      },
      {
        id: uuidv4(),
        companyName: "LOD Assignment",
        companySraNumber: LOD_DEFAULTS.companySraNumber,
        jobTitle: "Legal Associate",
        startDate: `${nowYear}-04-01T00:00:00.000Z`,
        endDate: `${nowYear}-07-20T00:00:00.000Z`,
        assignmentType: "LOD",
        confirmingSolicitor: LOD_DEFAULTS.solicitor,
        reflections: [],
      },
      {
        id: uuidv4(),
        companyName: "LOD Placement",
        companySraNumber: LOD_DEFAULTS.companySraNumber,
        jobTitle: "Junior Counsel",
        startDate: `${nowYear}-09-01T00:00:00.000Z`,
        endDate: `${nowYear}-10-20T00:00:00.000Z`,
        assignmentType: "LOD",
        confirmingSolicitor: LOD_DEFAULTS.solicitor,
        reflections: [],
      },
    ],
  };

  // Add reflections to drive the dial visuals
  const add = (periodIndex: number, low: LowLevelCompetency[], high: ("A"|"B"|"C"|"D")[] = ["A"]) => {
    const p = sample.periods[periodIndex];
    p.reflections.unshift({
      id: uuidv4(),
      loggedOn: new Date().toISOString(),
      highLevelAreas: high as any,
      lowLevelCompetencies: low,
      activity: "Worked on matter X",
      learning: "Learned Y",
    });
  };
  // Red segments (1 competency)
  add(0, ["A2"]);
  add(1, ["A4"]);
  // Part completed dials (2 competencies) - for testing
  add(0, ["A1"]); add(1, ["A1"]);
  add(0, ["A3"]); add(1, ["A3"]);
  add(0, ["B5"]); add(1, ["B5"]);
  add(0, ["B6"]); add(1, ["B6"]);
  // Blue rings (>=3)
  add(1, ["A5"]); add(1, ["A5"]); add(2, ["A5"]);
  add(0, ["B2"]); add(1, ["B2"]); add(2, ["B2"]);
  add(0, ["B3"]); add(1, ["B3"]); add(2, ["B3"]);
  add(0, ["B4"]); add(1, ["B4"]); add(2, ["B4"]);
  add(0, ["D3"]); add(1, ["D3"]); add(2, ["D3"]);

  return sample;
}

function save(data: AppData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function load(): AppData {
  if (typeof window === "undefined") return getDefaultData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = getDefaultData();
    save(initial);
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as AppData;
    // Basic shape guard
    if (!parsed || !Array.isArray(parsed.periods)) return getDefaultData();
    return parsed;
  } catch {
    return getDefaultData();
  }
}

type NewPeriodInput = {
  companyName: string;
  companySraNumber?: string;
  jobTitle: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  assignmentType: AssignmentType;
  confirmingSolicitor: QwePeriod["confirmingSolicitor"];
};

export function addPeriod(current: AppData, input: NewPeriodInput): AppData {
  const data: AppData = { ...current, periods: [...current.periods] };
  const period: QwePeriod = {
    id: uuidv4(),
    companyName: input.companyName,
    companySraNumber: input.companySraNumber,
    jobTitle: input.jobTitle,
    startDate: input.startDate,
    endDate: input.endDate,
    assignmentType: input.assignmentType,
    confirmingSolicitor: input.confirmingSolicitor,
    reflections: [],
  };
  data.periods.unshift(period);
  save(data);
  return data;
}

type NewReflectionInput = Omit<Reflection, "id">;

export function addReflection(current: AppData, periodId: string, reflection: NewReflectionInput): AppData {
  const data: AppData = { ...current, periods: [...current.periods] };
  const index = data.periods.findIndex((p) => p.id === periodId);
  if (index === -1) return current;
  const target = { ...data.periods[index], reflections: [...data.periods[index].reflections] };
  const newReflection: Reflection = { id: uuidv4(), ...reflection };
  target.reflections.unshift(newReflection);
  data.periods[index] = target;
  save(data);
  return data;
}

export function deleteReflection(current: AppData, periodId: string, reflectionId: string): AppData {
  const data: AppData = { ...current, periods: [...current.periods] };
  const index = data.periods.findIndex((p) => p.id === periodId);
  if (index === -1) return current;
  const target = { ...data.periods[index] };
  target.reflections = target.reflections.filter((r) => r.id !== reflectionId);
  data.periods[index] = target;
  save(data);
  return data;
}

export function computeTotalMonths(periods: QwePeriod[]): number {
  let totalMonths = 0;
  for (const p of periods) {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const days = Math.max(0, differenceInDays(end, start));
    totalMonths += days / 30; // simple approx to get a decimal month
  }
  // round to one decimal for display
  return Math.round(totalMonths * 10) / 10;
}

export function competencyCounts(periods: QwePeriod[]): Record<LowLevelCompetency, number> {
  const counts = Object.fromEntries(ALL_LOW.map((c) => [c, 0])) as Record<LowLevelCompetency, number>;
  for (const p of periods) {
    for (const r of p.reflections) {
      for (const low of r.lowLevelCompetencies) {
        counts[low] = (counts[low] ?? 0) + 1;
      }
    }
  }
  return counts;
}

export function placementsCount(periods: QwePeriod[]): number {
  return periods.filter((p) => p.assignmentType === "LOD").length;
}

// Convenience for users adding LOD periods manually
export function withLodDefaults(input: Partial<NewPeriodInput>): NewPeriodInput {
  return {
    companyName: input.companyName ?? "",
    companySraNumber: input.companySraNumber ?? LOD_DEFAULTS.companySraNumber,
    jobTitle: input.jobTitle ?? "",
    startDate: input.startDate ?? new Date().toISOString(),
    endDate: input.endDate ?? new Date().toISOString(),
    assignmentType: input.assignmentType ?? "LOD",
    confirmingSolicitor: input.confirmingSolicitor ?? LOD_DEFAULTS.solicitor,
  };
}


