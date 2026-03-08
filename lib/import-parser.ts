import { ImportCandidate, ImportSession, PeriodEventType } from "@/lib/types";

function extractDateFromLine(line: string) {
  const isoMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    return isoMatch[1];
  }

  const usMatch = line.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    const month = usMatch[1].padStart(2, "0");
    const day = usMatch[2].padStart(2, "0");
    const year = usMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(line);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return undefined;
}

function classifyLine(line: string): {
  suggestedType: PeriodEventType | "uncertain";
  confidenceScore: number;
} | null {
  if (/\b(started my period|period started|day 1|got my period)\b/i.test(line)) {
    return { suggestedType: "start", confidenceScore: 0.93 };
  }

  if (/\b(period ended|period is over|stopped bleeding)\b/i.test(line)) {
    return { suggestedType: "end", confidenceScore: 0.86 };
  }

  if (/\bspotting|bleeding|period\b/i.test(line)) {
    return { suggestedType: "uncertain", confidenceScore: 0.56 };
  }

  return null;
}

export function buildImportSession(input: {
  rawText: string;
  rawSourceType: "text" | "file";
  rawSourceName?: string;
}): ImportSession {
  const candidates: ImportCandidate[] = input.rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const classification = classifyLine(line);
      if (!classification) {
        return null;
      }

      const messageDate = extractDateFromLine(line);
      if (!messageDate) {
        return null;
      }

      return {
        id: `candidate-${Date.now()}-${index}`,
        messageDate,
        messageText: line,
        suggestedType: classification.suggestedType,
        confidenceScore: classification.confidenceScore,
        reviewState: "pending",
      };
    })
    .filter((candidate): candidate is ImportCandidate => Boolean(candidate));

  return {
    id: `import-${Date.now()}`,
    status: "pending_review",
    rawSourceType: input.rawSourceType,
    rawSourceName: input.rawSourceName,
    rawText: input.rawText,
    createdAt: new Date().toISOString(),
    candidates,
  };
}
