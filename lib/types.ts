export type ConfidenceState = "confirmed" | "inferred" | "estimated";
export type PeriodEventType = "start" | "end";
export type SourceType =
  | "manual"
  | "import"
  | "telegram_reminder"
  | "ai_parse"
  | "system";
export type FlowLevel = "spotting" | "light" | "medium" | "heavy";
export type MoodLevel = "steady" | "low" | "irritable" | "good";
export type EnergyLevel = "low" | "steady" | "high";
export type SymptomKey =
  | "bleeding"
  | "spotting"
  | "cramps"
  | "headache"
  | "bloating"
  | "fatigue"
  | "low-energy"
  | "mood-low"
  | "irritability"
  | "high-energy";
export type ImportReviewState = "pending" | "accepted" | "rejected" | "edited";
export type ParseConfidence = "high" | "medium" | "low";

export interface Profile {
  name: string;
  email: string;
  timezone: string;
  lastKnownPeriodStart?: string;
  averageCycleLength?: number;
  remindersEnabled: boolean;
  telegramLinked: boolean;
}

export interface PeriodEvent {
  id: string;
  eventType: PeriodEventType;
  eventDate: string;
  source: SourceType;
  confidenceState: ConfidenceState;
  sourceSnippet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomEntry {
  id: string;
  symptomKey: SymptomKey;
  intensity?: number;
}

export interface MedicationEntry {
  id: string;
  name: string;
  doseText?: string;
}

export interface DailyLog {
  id: string;
  logDate: string;
  flowLevel?: FlowLevel;
  mood?: MoodLevel;
  energy?: EnergyLevel;
  painLevel?: number;
  noteText?: string;
  source: SourceType;
  createdAt: string;
  updatedAt: string;
  symptoms: SymptomEntry[];
  medications: MedicationEntry[];
  originalText?: string;
}

export interface ImportCandidate {
  id: string;
  messageDate: string;
  messageText: string;
  suggestedType: PeriodEventType | "uncertain";
  confidenceScore: number;
  reviewState: ImportReviewState;
  linkedPeriodEventId?: string;
}

export interface ImportSession {
  id: string;
  status: "pending_review" | "completed";
  rawSourceType: "text" | "file";
  rawSourceName?: string;
  rawText: string;
  createdAt: string;
  candidates: ImportCandidate[];
}

export interface SuggestedPeriodEvent {
  eventType: PeriodEventType;
  eventDate: string;
}

export interface ParsedLog {
  symptoms: SymptomKey[];
  flowLevel?: FlowLevel;
  mood?: MoodLevel;
  energy?: EnergyLevel;
  painLevel?: number;
  medications: MedicationEntry[];
  noteText?: string;
  confidence: ParseConfidence;
  confidenceScore: number;
  clarificationQuestion?: string;
  suggestedPeriodEvent?: SuggestedPeriodEvent;
  originalText: string;
}

export interface AskMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: string[];
}

export interface AppState {
  version: number;
  onboardingComplete: boolean;
  profile: Profile | null;
  periodEvents: PeriodEvent[];
  dailyLogs: DailyLog[];
  importSessions: ImportSession[];
  askMessages: AskMessage[];
}

export interface CycleSummary {
  id: string;
  startDate: string;
  endDate?: string;
  lengthInDays?: number;
  periodLengthInDays?: number;
}

export interface TodayState {
  cycleDay?: number;
  phaseLabel: string;
  confidenceState: ConfidenceState;
  nextPeriodWindow?: {
    start: string;
    end: string;
  };
  activePeriod: boolean;
  currentCycleStart?: string;
  variabilityLabel: string;
}
