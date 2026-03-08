import { AppState } from "@/lib/types";
import { getAverageCycleLength, getCycleSummaries, getRecentSymptoms, getTodayState } from "@/lib/cycle";
import { formatShortDate } from "@/lib/date";

export function buildInsightCard(state: AppState) {
  const todayState = getTodayState(state);
  const cycles = getCycleSummaries(state.periodEvents);
  const recentSymptoms = getRecentSymptoms(state.dailyLogs);

  if (cycles.length === 0) {
    return {
      eyebrow: "Fresh start",
      title: "Log one period start to unlock cycle math.",
      body: "Everything updates from the first confirmed date. You can also import Telegram history if that is faster.",
    };
  }

  if (todayState.nextPeriodWindow) {
    return {
      eyebrow: todayState.phaseLabel,
      title: `Next likely window: ${formatShortDate(todayState.nextPeriodWindow.start)} to ${formatShortDate(todayState.nextPeriodWindow.end)}`,
      body:
        recentSymptoms.length > 0
          ? `Recently logged most often: ${recentSymptoms.join(", ")}.`
          : `Average cycle length is about ${getAverageCycleLength(state.periodEvents, state.profile?.averageCycleLength ?? 29)} days.`,
    };
  }

  return {
    eyebrow: "Current pattern",
    title: "Still building confidence from your history.",
    body: "The app will switch from estimated to more grounded guidance as you confirm more cycle starts.",
  };
}
