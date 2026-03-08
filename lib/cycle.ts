import {
  AppState,
  ConfidenceState,
  CycleSummary,
  DailyLog,
  PeriodEvent,
  TodayState,
} from "@/lib/types";
import { addDays, diffInDays, today } from "@/lib/date";

function sortByDate<T extends { eventDate?: string; logDate?: string; createdAt: string }>(
  items: T[],
) {
  return [...items].sort((left, right) => {
    const leftDate = left.eventDate ?? left.logDate ?? left.createdAt;
    const rightDate = right.eventDate ?? right.logDate ?? right.createdAt;
    return leftDate.localeCompare(rightDate);
  });
}

export function getSortedPeriodStarts(periodEvents: PeriodEvent[]) {
  return sortByDate(
    periodEvents.filter((event) => event.eventType === "start"),
  ) as PeriodEvent[];
}

export function getSortedPeriodEnds(periodEvents: PeriodEvent[]) {
  return sortByDate(
    periodEvents.filter((event) => event.eventType === "end"),
  ) as PeriodEvent[];
}

export function getCycleSummaries(periodEvents: PeriodEvent[]): CycleSummary[] {
  const starts = getSortedPeriodStarts(periodEvents);
  const ends = getSortedPeriodEnds(periodEvents);

  return starts.map((start, index) => {
    const nextStart = starts[index + 1];
    const matchingEnd = ends.find((end) => end.eventDate >= start.eventDate && (!nextStart || end.eventDate < nextStart.eventDate));

    return {
      id: start.id,
      startDate: start.eventDate,
      endDate: matchingEnd?.eventDate,
      lengthInDays: nextStart ? diffInDays(start.eventDate, nextStart.eventDate) : undefined,
      periodLengthInDays: matchingEnd ? diffInDays(start.eventDate, matchingEnd.eventDate) + 1 : undefined,
    };
  });
}

export function getAverageCycleLength(periodEvents: PeriodEvent[], fallback = 29) {
  const cycleLengths = getCycleSummaries(periodEvents)
    .map((cycle) => cycle.lengthInDays)
    .filter((value): value is number => typeof value === "number");

  if (cycleLengths.length === 0) {
    return fallback;
  }

  const average = cycleLengths.reduce((total, value) => total + value, 0) / cycleLengths.length;
  return Math.round(average);
}

export function getVariability(periodEvents: PeriodEvent[]) {
  const cycleLengths = getCycleSummaries(periodEvents)
    .map((cycle) => cycle.lengthInDays)
    .filter((value): value is number => typeof value === "number");

  if (cycleLengths.length < 2) {
    return {
      spread: 0,
      label: "Building baseline",
    };
  }

  const spread = Math.max(...cycleLengths) - Math.min(...cycleLengths);
  const label = spread <= 3 ? "Fairly steady" : spread <= 6 ? "Some variation" : "Wide variation";

  return { spread, label };
}

export function isPeriodActive(periodEvents: PeriodEvent[]) {
  const starts = getSortedPeriodStarts(periodEvents);
  const ends = getSortedPeriodEnds(periodEvents);
  const lastStart = starts.at(-1);
  const lastEnd = ends.at(-1);

  if (!lastStart) {
    return false;
  }

  if (!lastEnd) {
    return true;
  }

  return lastStart.eventDate > lastEnd.eventDate;
}

function getCurrentCycleStart(periodEvents: PeriodEvent[]) {
  return getSortedPeriodStarts(periodEvents).at(-1)?.eventDate;
}

export function getPhaseLabel(cycleDay?: number, activePeriod?: boolean) {
  if (activePeriod) {
    return "Menstrual phase";
  }

  if (!cycleDay) {
    return "Cycle estimate pending";
  }

  if (cycleDay <= 13) {
    return "Follicular phase";
  }

  if (cycleDay <= 17) {
    return "Ovulation window";
  }

  return "Luteal phase";
}

export function getNextPeriodWindow(periodEvents: PeriodEvent[], profileCycleLength?: number) {
  const currentStart = getCurrentCycleStart(periodEvents);

  if (!currentStart) {
    return undefined;
  }

  const averageLength = getAverageCycleLength(periodEvents, profileCycleLength ?? 29);
  const variability = getVariability(periodEvents).spread;
  const start = addDays(currentStart, averageLength - Math.max(2, Math.round(variability / 2)));
  const end = addDays(currentStart, averageLength + Math.max(2, Math.round(variability / 2)));
  return { start, end };
}

export function getConfidenceState(periodEvents: PeriodEvent[]): ConfidenceState {
  const starts = getSortedPeriodStarts(periodEvents);

  if (starts.length >= 3) {
    return "confirmed";
  }

  if (starts.length >= 1) {
    return "inferred";
  }

  return "estimated";
}

export function getTodayState(state: AppState): TodayState {
  const currentCycleStart = getCurrentCycleStart(state.periodEvents) ?? state.profile?.lastKnownPeriodStart;
  const activePeriod = isPeriodActive(state.periodEvents);
  const nextPeriodWindow = getNextPeriodWindow(
    state.periodEvents,
    state.profile?.averageCycleLength,
  );
  const cycleDay = currentCycleStart ? diffInDays(currentCycleStart, today()) + 1 : undefined;
  const variability = getVariability(state.periodEvents);

  return {
    cycleDay,
    phaseLabel: getPhaseLabel(cycleDay, activePeriod),
    confidenceState: getConfidenceState(state.periodEvents),
    nextPeriodWindow,
    activePeriod,
    currentCycleStart,
    variabilityLabel: variability.label,
  };
}

export function getPeriodRangeDates(periodEvents: PeriodEvent[]) {
  const cycles = getCycleSummaries(periodEvents);
  const dates = new Map<string, ConfidenceState>();

  cycles.forEach((cycle) => {
    const periodLength = cycle.periodLengthInDays ?? 5;
    for (let index = 0; index < periodLength; index += 1) {
      dates.set(addDays(cycle.startDate, index), "confirmed");
    }
  });

  return dates;
}

export function getDailyLogForDate(dailyLogs: DailyLog[], logDate: string) {
  return dailyLogs.find((log) => log.logDate === logDate);
}

export function getRecentSymptoms(dailyLogs: DailyLog[]) {
  const recent = sortByDate(dailyLogs).slice(-10);
  const counts = new Map<string, number>();

  recent.forEach((log) => {
    log.symptoms.forEach((symptom) => {
      counts.set(symptom.symptomKey, (counts.get(symptom.symptomKey) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([key]) => key);
}
