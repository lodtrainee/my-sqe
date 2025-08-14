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
  projectName: string;
  activity: string;
  outcome: string;
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

export const COMPETENCY_DESCRIPTIONS = {
  A: "Ethics, Professionalism and Judgment",
  B: "Technical Legal Practice", 
  C: "Working with Other People",
  D: "Self-management and Business Skills",
} as const;

export const LOW_LEVEL_DESCRIPTIONS: Record<LowLevelCompetency, string> = {
  A1: "Act honestly and with integrity, in accordance with legal and regulatory requirements and the SRA Standards and Regulations",
  A2: "Maintain the level of competence and legal knowledge needed to practice effectively, taking into account changes in their role and/or practice context and developments in the law",
  A3: "Work within the limits of their competence and the supervision which they need",
  A4: "Draw on a sufficient detailed knowledge and understanding of their field(s) of work and role in order to practice effectively",
  A5: "Apply understanding, critical thinking and analysis to solve problems",
  B1: "Obtain relevant facts",
  B2: "Undertake legal research",
  B3: "Develop and advise on relevant options, strategies and solutions",
  B4: "Draft documents which are legally effective and accurately reflect the client's instructions",
  B5: "Undertake effective spoken and written advocacy",
  B6: "Negotiate solutions to clients' issues",
  B7: "Plan, manage and progress legal cases and transactions",
  C1: "Establish and maintain effective and professional relationships with clients",
  C2: "Establish and maintain effective and professional relationships with other people",
  C3: "Communicate effectively orally and in writing",
  D1: "Initiate, plan, prioritise and manage work activities and projects to ensure that they are completed efficiently, on time and to an appropriate standard, both in professional practice and outside it",
  D2: "Make sound, reasoned and informed decisions",
  D3: "Undertake continuing learning and development",
};



