import { AppState } from "@/lib/types";
import { getAverageCycleLength, getCycleSummaries, getTodayState } from "@/lib/cycle";
import { addDays, formatShortDate } from "@/lib/date";

function answerWhenStart(state: AppState) {
  const average = getAverageCycleLength(state.periodEvents, state.profile?.averageCycleLength ?? 29);
  const nextWindow = getTodayState(state).nextPeriodWindow;

  if (!nextWindow) {
    return {
      text: "I need at least one period start before I can estimate your usual timing.",
      citations: ["Add or import one start date to begin cycle estimates."],
    };
  }

  return {
    text: `You usually start around every ${average} days. Your next likely window is ${formatShortDate(nextWindow.start)} to ${formatShortDate(nextWindow.end)}.`,
    citations: getCycleSummaries(state.periodEvents)
      .slice(-4)
      .map((cycle) => `Cycle start ${formatShortDate(cycle.startDate)}${cycle.lengthInDays ? `, length ${cycle.lengthInDays} days` : ""}`),
  };
}

function answerCrampsTrend(state: AppState) {
  const logs = [...state.dailyLogs].sort((left, right) => left.logDate.localeCompare(right.logDate));
  const recent = logs.slice(-12);
  const older = logs.slice(-24, -12);

  const recentCount = recent.filter((log) => log.symptoms.some((symptom) => symptom.symptomKey === "cramps")).length;
  const olderCount = older.filter((log) => log.symptoms.some((symptom) => symptom.symptomKey === "cramps")).length;

  if (recentCount === 0 && olderCount === 0) {
    return {
      text: "I do not have enough cramp logs yet to compare recent cycles.",
      citations: ["Try logging cramps or pain on the days they happen."],
    };
  }

  const direction = recentCount > olderCount ? "more often" : recentCount < olderCount ? "less often" : "about as often";
  return {
    text: `Cramps showed up ${direction} in your recent logs. I found ${recentCount} recent entries versus ${olderCount} in the comparison window.`,
    citations: recent
      .filter((log) => log.symptoms.some((symptom) => symptom.symptomKey === "cramps"))
      .slice(-4)
      .map((log) => `${formatShortDate(log.logDate)}: ${log.noteText ?? "cramps logged"}`),
  };
}

function answerMonthSummary(state: AppState) {
  const todayState = getTodayState(state);
  const recentLogs = [...state.dailyLogs]
    .sort((left, right) => left.logDate.localeCompare(right.logDate))
    .slice(-6);

  if (recentLogs.length === 0) {
    return {
      text: "I need a few daily logs before I can summarize this cycle.",
      citations: ["Add a quick note or symptom chip from Home."],
    };
  }

  const symptoms = recentLogs.flatMap((log) => log.symptoms.map((symptom) => symptom.symptomKey));
  const topSymptom = symptoms.sort((left, right) => {
    const leftCount = symptoms.filter((value) => value === left).length;
    const rightCount = symptoms.filter((value) => value === right).length;
    return rightCount - leftCount;
  })[0];

  return {
    text: `You are currently in the ${todayState.phaseLabel.toLowerCase()}. This cycle, the most repeated note was ${topSymptom ?? "general check-ins"}, and your latest logs suggest a ${todayState.variabilityLabel.toLowerCase()} rhythm.`,
    citations: recentLogs.map((log) => `${formatShortDate(log.logDate)}: ${log.noteText ?? "symptoms logged"}`),
  };
}

function answerLowEnergyBeforePeriods(state: AppState) {
  const starts = getCycleSummaries(state.periodEvents).slice(-2);

  if (starts.length < 2) {
    return {
      text: "I need at least two recent cycles to check that pattern.",
      citations: ["Add or import another period start for a stronger comparison."],
    };
  }

  const citations: string[] = [];
  let matches = 0;

  starts.forEach((cycle) => {
    const cycleLogs = state.dailyLogs.filter(
      (log) =>
        log.logDate >= addDays(cycle.startDate, -5) &&
        log.logDate <= cycle.startDate,
    );
    if (cycleLogs.some((log) => log.energy === "low" || log.symptoms.some((symptom) => symptom.symptomKey === "low-energy"))) {
      matches += 1;
    }
    citations.push(`Cycle starting ${formatShortDate(cycle.startDate)} reviewed for low-energy logs.`);
  });

  return {
    text:
      matches > 0
        ? `Yes, low energy showed up near ${matches} of your last ${starts.length} period starts.`
        : `Not consistently. I did not find low-energy logs near your last ${starts.length} period starts.`,
    citations,
  };
}

export function answerQuestion(question: string, state: AppState) {
  const lowered = question.toLowerCase();

  if (lowered.includes("when do i usually start")) {
    return answerWhenStart(state);
  }

  if (lowered.includes("cramps")) {
    return answerCrampsTrend(state);
  }

  if (lowered.includes("what changed") || lowered.includes("summarize")) {
    return answerMonthSummary(state);
  }

  if (lowered.includes("low energy")) {
    return answerLowEnergyBeforePeriods(state);
  }

  return {
    text: "From your saved data, the clearest signal right now is your cycle timing. Ask about start timing, symptom trends, or a cycle summary for a more specific answer.",
    citations: getCycleSummaries(state.periodEvents)
      .slice(-3)
      .map((cycle) => `Cycle start ${formatShortDate(cycle.startDate)}`),
  };
}
