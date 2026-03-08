import { TodayState } from "@/lib/types";
import { formatShortDate, relativeDayLabel } from "@/lib/date";
import { GlassCard, Tag } from "@/components/ui";

export function MoonHero({ todayState }: { todayState: TodayState }) {
  const nextWindow = todayState.nextPeriodWindow
    ? `${formatShortDate(todayState.nextPeriodWindow.start)} - ${formatShortDate(todayState.nextPeriodWindow.end)}`
    : "Add one start date to estimate";

  return (
    <GlassCard className="hero-card">
      <div className={`moon-orb${todayState.activePeriod ? " is-active" : ""}`}>
        <div className="moon-shadow" />
      </div>
      <div className="hero-copy">
        <div className="hero-meta">
          <Tag tone={todayState.confidenceState === "confirmed" ? "success" : "warning"}>
            {todayState.confidenceState}
          </Tag>
          <span>{todayState.variabilityLabel}</span>
        </div>
        <h2>{todayState.activePeriod ? "Active period" : todayState.phaseLabel}</h2>
        <p className="hero-value">
          {todayState.cycleDay ? `Cycle day ${todayState.cycleDay}` : "Waiting for your first cycle"}
        </p>
        <div className="hero-stats">
          <div>
            <span>Next window</span>
            <strong>{nextWindow}</strong>
          </div>
          <div>
            <span>What matters now</span>
            <strong>
              {todayState.nextPeriodWindow
                ? relativeDayLabel(todayState.nextPeriodWindow.start)
                : "Log one start"}
            </strong>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
