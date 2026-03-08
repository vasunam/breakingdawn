import { MedicationEntry, ParsedLog, SymptomKey } from "@/lib/types";

const symptomRules: Array<{ pattern: RegExp; symptom: SymptomKey }> = [
  { pattern: /\bbleeding\b/i, symptom: "bleeding" },
  { pattern: /\bspotting\b/i, symptom: "spotting" },
  { pattern: /\bcramp|cramps|cramping\b/i, symptom: "cramps" },
  { pattern: /\bheadache|migraine\b/i, symptom: "headache" },
  { pattern: /\bbloating|bloated\b/i, symptom: "bloating" },
  { pattern: /\bfatigue|tired|exhausted\b/i, symptom: "fatigue" },
  { pattern: /\blow energy|sluggish\b/i, symptom: "low-energy" },
  { pattern: /\bmood low|sad|down\b/i, symptom: "mood-low" },
  { pattern: /\birritable|snappy\b/i, symptom: "irritability" },
  { pattern: /\bhigh energy|energized\b/i, symptom: "high-energy" },
];

const medicationMatches = ["ibuprofen", "advil", "tylenol", "acetaminophen", "midol"];

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function parseMedicationEntries(input: string): MedicationEntry[] {
  const lower = input.toLowerCase();

  return medicationMatches
    .filter((medication) => lower.includes(medication))
    .map((medication, index) => ({
      id: `med-${index}-${medication}`,
      name: medication,
    }));
}

export function parseNaturalLanguageLog(input: string): ParsedLog {
  const symptoms = unique(
    symptomRules
      .filter((rule) => rule.pattern.test(input))
      .map((rule) => rule.symptom),
  );
  const medications = parseMedicationEntries(input);

  const lowered = input.toLowerCase();
  const flowLevel = lowered.includes("heavy")
    ? "heavy"
    : lowered.includes("medium")
      ? "medium"
      : lowered.includes("light")
        ? "light"
        : lowered.includes("spotting")
          ? "spotting"
          : undefined;
  const mood = lowered.includes("irritable")
    ? "irritable"
    : lowered.includes("low") || lowered.includes("sad")
      ? "low"
      : lowered.includes("good")
        ? "good"
        : undefined;
  const energy = lowered.includes("high energy") || lowered.includes("energized")
    ? "high"
    : lowered.includes("low energy") || lowered.includes("tired")
      ? "low"
      : undefined;
  const painLevel = lowered.includes("severe")
    ? 4
    : lowered.includes("painful") || lowered.includes("bad cramps")
      ? 3
      : lowered.includes("cramps")
        ? 2
        : undefined;

  const suggestedPeriodEvent = /\b(period started|started my period|day 1|period is here)\b/i.test(input)
    ? {
        eventType: "start" as const,
        eventDate: new Date().toISOString().slice(0, 10),
      }
    : /\b(period ended|ended my period|period is over)\b/i.test(input)
      ? {
          eventType: "end" as const,
          eventDate: new Date().toISOString().slice(0, 10),
        }
      : undefined;

  const signalCount = symptoms.length + medications.length + Number(Boolean(flowLevel)) + Number(Boolean(mood)) + Number(Boolean(energy)) + Number(Boolean(suggestedPeriodEvent));
  const confidenceScore = Math.min(0.98, 0.25 + signalCount * 0.16);
  const confidence = confidenceScore >= 0.8 ? "high" : confidenceScore >= 0.55 ? "medium" : "low";

  return {
    symptoms,
    flowLevel,
    mood,
    energy,
    painLevel,
    medications,
    noteText: input,
    confidence,
    confidenceScore,
    clarificationQuestion:
      confidence === "low" && !flowLevel && symptoms.length === 0
        ? "Do you want this saved as a note, or should I tag a symptom too?"
        : undefined,
    suggestedPeriodEvent,
    originalText: input,
  };
}
