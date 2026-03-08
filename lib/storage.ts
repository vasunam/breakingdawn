import { AppState, DailyLog, ImportSession, ParsedLog, PeriodEvent, Profile, SourceType, SymptomKey } from "@/lib/types";
import { answerQuestion } from "@/lib/ask";
import { today } from "@/lib/date";

export const STORAGE_KEY = "period-app-v1";

export const defaultState: AppState = {
  version: 1,
  onboardingComplete: false,
  profile: null,
  periodEvents: [],
  dailyLogs: [],
  importSessions: [],
  askMessages: [],
};

export function clearState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function readState() {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultState;
  }
}

export function writeState(state: AppState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createPeriodEvent(input: {
  eventType: PeriodEvent["eventType"];
  eventDate: string;
  source: SourceType;
  confidenceState: PeriodEvent["confidenceState"];
  sourceSnippet?: string;
}): PeriodEvent {
  const timestamp = new Date().toISOString();
  return {
    id: `event-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: input.eventType,
    eventDate: input.eventDate,
    source: input.source,
    confidenceState: input.confidenceState,
    sourceSnippet: input.sourceSnippet,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createDailyLog(input: {
  logDate?: string;
  source: SourceType;
  noteText?: string;
  flowLevel?: DailyLog["flowLevel"];
  mood?: DailyLog["mood"];
  energy?: DailyLog["energy"];
  painLevel?: number;
  symptoms?: SymptomKey[];
  medications?: DailyLog["medications"];
  originalText?: string;
}): DailyLog {
  const timestamp = new Date().toISOString();
  return {
    id: `log-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    logDate: input.logDate ?? today(),
    flowLevel: input.flowLevel,
    mood: input.mood,
    energy: input.energy,
    painLevel: input.painLevel,
    noteText: input.noteText,
    source: input.source,
    createdAt: timestamp,
    updatedAt: timestamp,
    symptoms: (input.symptoms ?? []).map((symptomKey, index) => ({
      id: `symptom-${timestamp}-${index}`,
      symptomKey,
    })),
    medications: input.medications ?? [],
    originalText: input.originalText,
  };
}

export function createProfile(input: Partial<Profile>): Profile {
  return {
    name: input.name?.trim() ?? "",
    email: input.email?.trim() ?? "",
    timezone: input.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    lastKnownPeriodStart: input.lastKnownPeriodStart,
    averageCycleLength: input.averageCycleLength,
    remindersEnabled: input.remindersEnabled ?? false,
    telegramLinked: input.telegramLinked ?? false,
  };
}

export function addParsedLogToState(state: AppState, parsedLog: ParsedLog, logDate = today()) {
  const nextState = {
    ...state,
    dailyLogs: [
      ...state.dailyLogs,
      createDailyLog({
        logDate,
        source: "ai_parse",
        noteText: parsedLog.noteText,
        flowLevel: parsedLog.flowLevel,
        mood: parsedLog.mood,
        energy: parsedLog.energy,
        painLevel: parsedLog.painLevel,
        symptoms: parsedLog.symptoms,
        medications: parsedLog.medications,
        originalText: parsedLog.originalText,
      }),
    ],
  };

  if (parsedLog.suggestedPeriodEvent) {
    nextState.periodEvents = [
      ...nextState.periodEvents,
      createPeriodEvent({
        eventType: parsedLog.suggestedPeriodEvent.eventType,
        eventDate: parsedLog.suggestedPeriodEvent.eventDate,
        source: "ai_parse",
        confidenceState: "confirmed",
      }),
    ];
  }

  return nextState;
}

export function addAskExchange(state: AppState, question: string) {
  const answer = answerQuestion(question, state);
  const timestamp = new Date().toISOString();

  return {
    ...state,
    askMessages: [
      ...state.askMessages,
      {
        id: `ask-user-${timestamp}`,
        role: "user" as const,
        text: question,
      },
      {
        id: `ask-assistant-${timestamp}`,
        role: "assistant" as const,
        text: answer.text,
        citations: answer.citations,
      },
    ],
  };
}

export function saveImportSession(state: AppState, importSession: ImportSession) {
  return {
    ...state,
    importSessions: [importSession, ...state.importSessions],
  };
}
