"use client";

import {
  createContext,
  ReactNode,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AppState,
  DailyLog,
  ImportCandidate,
  ImportSession,
  ParsedLog,
  PeriodEventType,
  Profile,
  SymptomKey,
} from "@/lib/types";
import {
  addAskExchange,
  addParsedLogToState,
  createDailyLog,
  createPeriodEvent,
  createProfile,
  defaultState,
  readState,
  saveImportSession,
  writeState,
} from "@/lib/storage";
import { today } from "@/lib/date";

interface FinalizedImportCandidate {
  id: string;
  reviewState: ImportCandidate["reviewState"];
  messageDate: string;
  suggestedType: ImportCandidate["suggestedType"];
  messageText: string;
}

interface OnboardingInput extends Partial<Profile> {
  importAfter?: boolean;
}

interface AppContextValue {
  hydrated: boolean;
  state: AppState;
  completeOnboarding: (input: OnboardingInput) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  startPeriod: (date?: string, extras?: { symptoms?: SymptomKey[]; flowLevel?: DailyLog["flowLevel"] }) => void;
  endPeriod: (date?: string, extras?: { symptoms?: SymptomKey[] }) => void;
  addQuickSymptom: (symptomKey: SymptomKey, logDate?: string) => void;
  saveParsedLog: (parsedLog: ParsedLog, logDate?: string) => void;
  saveManualNote: (noteText: string, logDate?: string) => void;
  addImportSession: (session: ImportSession) => void;
  finalizeImportReview: (sessionId: string, reviewedCandidates: FinalizedImportCandidate[]) => void;
  askQuestion: (question: string) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function mergeLogs(logs: DailyLog[], draft: Omit<DailyLog, "id" | "createdAt" | "updatedAt">) {
  const current = logs.find((log) => log.logDate === draft.logDate);

  if (!current) {
    return [
      ...logs,
      createDailyLog({
        logDate: draft.logDate,
        source: draft.source,
        noteText: draft.noteText,
        flowLevel: draft.flowLevel,
        mood: draft.mood,
        energy: draft.energy,
        painLevel: draft.painLevel,
        symptoms: draft.symptoms.map((symptom) => symptom.symptomKey),
        medications: draft.medications,
        originalText: draft.originalText,
      }),
    ];
  }

  return logs.map((log) => {
    if (log.id !== current.id) {
      return log;
    }

    const incomingSymptoms = draft.symptoms.filter(
      (symptom) => !log.symptoms.some((existing) => existing.symptomKey === symptom.symptomKey),
    );

    return {
      ...log,
      flowLevel: draft.flowLevel ?? log.flowLevel,
      mood: draft.mood ?? log.mood,
      energy: draft.energy ?? log.energy,
      painLevel: draft.painLevel ?? log.painLevel,
      noteText:
        draft.noteText && log.noteText
          ? `${log.noteText}\n${draft.noteText}`
          : draft.noteText ?? log.noteText,
      medications: [...log.medications, ...draft.medications],
      symptoms: [...log.symptoms, ...incomingSymptoms],
      originalText:
        draft.originalText && log.originalText
          ? `${log.originalText}\n${draft.originalText}`
          : draft.originalText ?? log.originalText,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setState(readState());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeState(state);
  }, [hydrated, state]);

  function completeOnboarding(input: OnboardingInput) {
    setState((current) => {
      const nextProfile = createProfile(input);
      const nextEvents = [...current.periodEvents];

      if (input.lastKnownPeriodStart) {
        nextEvents.push(
          createPeriodEvent({
            eventType: "start",
            eventDate: input.lastKnownPeriodStart,
            source: "manual",
            confidenceState: "confirmed",
          }),
        );
      }

      return {
        ...current,
        onboardingComplete: true,
        profile: nextProfile,
        periodEvents: nextEvents,
      };
    });
  }

  function updateProfile(patch: Partial<Profile>) {
    setState((current) => ({
      ...current,
      profile: createProfile({
        ...current.profile,
        ...patch,
      }),
    }));
  }

  function startPeriod(
    date = today(),
    extras?: { symptoms?: SymptomKey[]; flowLevel?: DailyLog["flowLevel"] },
  ) {
    setState((current) => ({
      ...current,
      periodEvents: [
        ...current.periodEvents,
        createPeriodEvent({
          eventType: "start",
          eventDate: date,
          source: "manual",
          confidenceState: "confirmed",
        }),
      ],
      dailyLogs: mergeLogs(current.dailyLogs, {
        logDate: date,
        source: "manual",
        noteText: "Started period",
        flowLevel: extras?.flowLevel,
        symptoms: (extras?.symptoms ?? []).map((symptomKey, index) => ({
          id: `temp-${index}`,
          symptomKey,
        })),
        medications: [],
      }),
    }));
  }

  function endPeriod(date = today(), extras?: { symptoms?: SymptomKey[] }) {
    setState((current) => ({
      ...current,
      periodEvents: [
        ...current.periodEvents,
        createPeriodEvent({
          eventType: "end",
          eventDate: date,
          source: "manual",
          confidenceState: "confirmed",
        }),
      ],
      dailyLogs: mergeLogs(current.dailyLogs, {
        logDate: date,
        source: "manual",
        noteText: "Ended period",
        symptoms: (extras?.symptoms ?? []).map((symptomKey, index) => ({
          id: `temp-${index}`,
          symptomKey,
        })),
        medications: [],
      }),
    }));
  }

  function addQuickSymptom(symptomKey: SymptomKey, logDate = today()) {
    setState((current) => ({
      ...current,
      dailyLogs: mergeLogs(current.dailyLogs, {
        logDate,
        source: "manual",
        symptoms: [
          {
            id: `temp-${symptomKey}`,
            symptomKey,
          },
        ],
        medications: [],
      }),
    }));
  }

  function saveParsedLog(parsedLog: ParsedLog, logDate = today()) {
    setState((current) => addParsedLogToState(current, parsedLog, logDate));
  }

  function saveManualNote(noteText: string, logDate = today()) {
    setState((current) => ({
      ...current,
      dailyLogs: mergeLogs(current.dailyLogs, {
        logDate,
        source: "manual",
        noteText,
        symptoms: [],
        medications: [],
      }),
    }));
  }

  function addImportSession(session: ImportSession) {
    setState((current) => saveImportSession(current, session));
  }

  function finalizeImportReview(
    sessionId: string,
    reviewedCandidates: FinalizedImportCandidate[],
  ) {
    setState((current) => {
      const acceptedEvents = reviewedCandidates
        .filter(
          (candidate) =>
            candidate.reviewState !== "rejected" && candidate.suggestedType !== "uncertain",
        )
        .map((candidate) =>
          createPeriodEvent({
            eventType: candidate.suggestedType as PeriodEventType,
            eventDate: candidate.messageDate,
            source: "import",
            confidenceState:
              candidate.reviewState === "edited" ? "inferred" : "confirmed",
            sourceSnippet: candidate.messageText,
          }),
        );

      return {
        ...current,
        periodEvents: [...current.periodEvents, ...acceptedEvents],
        importSessions: current.importSessions.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          return {
            ...session,
            status: "completed",
            candidates: session.candidates.map((candidate) => {
              const reviewed = reviewedCandidates.find((item) => item.id === candidate.id);
              if (!reviewed) {
                return candidate;
              }

              const linkedEvent = acceptedEvents.find(
                (event) =>
                  event.sourceSnippet === reviewed.messageText &&
                  event.eventDate === reviewed.messageDate,
              );

              return {
                ...candidate,
                reviewState: reviewed.reviewState,
                messageDate: reviewed.messageDate,
                suggestedType: reviewed.suggestedType,
                linkedPeriodEventId: linkedEvent?.id,
              };
            }),
          };
        }),
      };
    });
  }

  function askQuestion(question: string) {
    setState((current) => addAskExchange(current, question));
  }

  function clearAllData() {
    setState(defaultState);
  }

  return (
    <AppContext.Provider
      value={{
        hydrated,
        state,
        completeOnboarding,
        updateProfile,
        startPeriod,
        endPeriod,
        addQuickSymptom,
        saveParsedLog,
        saveManualNote,
        addImportSession,
        finalizeImportReview,
        askQuestion,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
