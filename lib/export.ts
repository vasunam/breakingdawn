import { AppState } from "@/lib/types";

function download(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportJson(state: AppState) {
  download(
    `period-app-export-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(state, null, 2),
    "application/json",
  );
}

export function exportCsv(state: AppState) {
  const periodRows = state.periodEvents.map((event) =>
    [
      "period_event",
      event.eventDate,
      event.eventType,
      event.confidenceState,
      event.source,
      event.sourceSnippet ?? "",
    ].join(","),
  );
  const logRows = state.dailyLogs.map((log) =>
    [
      "daily_log",
      log.logDate,
      log.flowLevel ?? "",
      log.mood ?? "",
      log.energy ?? "",
      log.painLevel ?? "",
      `"${(log.noteText ?? "").replaceAll('"', '""')}"`,
      `"${log.symptoms.map((symptom) => symptom.symptomKey).join("|")}"`,
      `"${log.medications.map((medication) => medication.name).join("|")}"`,
    ].join(","),
  );

  const csv = [
    "entity,date,field_1,field_2,field_3,field_4,field_5,field_6,field_7",
    ...periodRows,
    ...logRows,
  ].join("\n");

  download(
    `period-app-export-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
}
