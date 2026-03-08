import { GlassCard, Tag } from "@/components/ui";
import { getMonthGrid, monthLabel } from "@/lib/date";
import { DailyLog } from "@/lib/types";

export function CalendarMonth({
  currentMonth,
  periodDates,
  predictedDates,
  dailyLogs,
  selectedDate,
  onSelectDate,
}: {
  currentMonth: string;
  periodDates: Map<string, string>;
  predictedDates: Set<string>;
  dailyLogs: DailyLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const grid = getMonthGrid(currentMonth);

  return (
    <GlassCard>
      <div className="calendar-header">
        <div>
          <p className="eyebrow">Month view</p>
          <h2>{monthLabel(currentMonth)}</h2>
        </div>
        <div className="calendar-legend">
          <Tag tone="success">Confirmed</Tag>
          <Tag tone="warning">Estimated</Tag>
        </div>
      </div>
      <div className="calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {grid.cells.map((date) => {
          const inMonth = date.slice(5, 7) === currentMonth.slice(5, 7);
          const hasLog = dailyLogs.some((log) => log.logDate === date);
          const isConfirmed = periodDates.has(date);
          const isPredicted = predictedDates.has(date);
          const isSelected = selectedDate === date;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`calendar-cell${inMonth ? "" : " is-muted"}${isConfirmed ? " is-confirmed" : ""}${isPredicted ? " is-predicted" : ""}${isSelected ? " is-selected" : ""}`}
            >
              <span>{Number(date.slice(8, 10))}</span>
              {hasLog ? <i /> : null}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
