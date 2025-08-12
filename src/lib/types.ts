export type AssignmentType = "LOD" | "Standard";

export interface SolicitorDetails {
  fullName: string;
  sraNumber: string; // 6 digits
  email: string;
}

export interface QwePeriod {
  id: string;
  companyName: string;
  companySraNumber?: string;
  jobTitle: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  assignmentType: AssignmentType;
  confirmingSolicitor: SolicitorDetails;
  reflections: Reflection[];
}

export interface Reflection {
  id: string;
  loggedOn: string; // ISO date
  highLevelAreas: HighLevelArea[]; // A|B|C|D
  lowLevelCompetencies: LowLevelCompetency[]; // A1..D3
  activity: string;
  learning: string;
}

export type HighLevelArea = "A" | "B" | "C" | "D";

export type LowLevelCompetency =
  | "A1" | "A2" | "A3" | "A4" | "A5"
  | "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7"
  | "C1" | "C2" | "C3"
  | "D1" | "D2" | "D3";

export const HIGH_TO_LOW: Record<HighLevelArea, LowLevelCompetency[]> = {
  A: ["A1", "A2", "A3", "A4", "A5"],
  B: ["B1", "B2", "B3", "B4", "B5", "B6", "B7"],
  C: ["C1", "C2", "C3"],
  D: ["D1", "D2", "D3"],
};

export const ALL_LOW: LowLevelCompetency[] = [
  "A1","A2","A3","A4","A5",
  "B1","B2","B3","B4","B5","B6","B7",
  "C1","C2","C3",
  "D1","D2","D3",
];

export const LOD_DEFAULTS = {
  companySraNumber: "800000", // placeholder
  solicitor: {
    fullName: "LOD Confirmations",
    sraNumber: "123456",
    email: "confirmations@lodlaw.com",
  } as SolicitorDetails,
};



