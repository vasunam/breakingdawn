"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { CalendarMonth } from "@/components/calendar";
import { Button, EmptyState, GlassCard, Tag } from "@/components/ui";
import { getCycleSummaries, getDailyLogForDate, getNextPeriodWindow, getPeriodRangeDates } from "@/lib/cycle";
import { addDays, formatLongDate, startOfMonth, today } from "@/lib/date";

export default function HistoryPage() {
  const { state } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today()));
  const [selectedDate, setSelectedDate] = useState(today());
  const periodDates = getPeriodRangeDates(state.periodEvents);
  const nextWindow = getNextPeriodWindow(state.periodEvents, state.profile?.averageCycleLength);
  const predictedDates = new Set<string>();

  if (nextWindow) {
    let cursor = nextWindow.start;
    while (cursor <= nextWindow.end) {
      predictedDates.add(cursor);
      cursor = addDays(cursor, 1);
    }
  }

  const selectedLog = getDailyLogForDate(state.dailyLogs, selectedDate);
  const cycles = getCycleSummaries(state.periodEvents).slice().reverse();

  return (
    <AppShell
      title="History"
      subtitle="A compact view of confirmed days, estimates, and what you logged."
    >
      <div className="stack">
        <div className="action-row compact">
          <Button variant="secondary" onClick={() => setCurrentMonth(addDays(currentMonth, -28))}>
            Previous
          </Button>
          <Button variant="secondary" onClick={() => setCurrentMonth(addDays(currentMonth, 28))}>
            Next
          </Button>
        </div>

        <CalendarMonth
          currentMonth={currentMonth}
          periodDates={periodDates}
          predictedDates={predictedDates}
          dailyLogs={state.dailyLogs}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <GlassCard>
          <div className="section-row">
            <div>
              <p className="eyebrow">Selected day</p>
              <h2>{formatLongDate(selectedDate)}</h2>
            </div>
            {periodDates.has(selectedDate) ? (
              <Tag tone="success">Confirmed period day</Tag>
            ) : predictedDates.has(selectedDate) ? (
              <Tag tone="warning">Estimated window</Tag>
            ) : null}
          </div>
          {selectedLog ? (
            <div className="timeline">
              <article className="timeline-item">
                <div>
                  <strong>{selectedLog.noteText ?? "Daily log"}</strong>
                  <p>
                    {selectedLog.symptoms.length > 0
                      ? selectedLog.symptoms.map((symptom) => symptom.symptomKey).join(", ")
                      : "No symptom tags"}
                  </p>
                </div>
              </article>
            </div>
          ) : (
            <EmptyState
              title="Nothing logged for this day"
              body="Tap a symptom chip or add a note from Home to make the history more useful."
            />
          )}
        </GlassCard>

        <GlassCard>
          <p className="eyebrow">Cycle history</p>
          <h2>Recent cycles</h2>
          {cycles.length === 0 ? (
            <EmptyState
              title="No cycle history yet"
              body="Import older messages or log your next start date to build this view."
            />
          ) : (
            <div className="timeline">
              {cycles.map((cycle) => (
                <article key={cycle.id} className="timeline-item">
                  <div>
                    <strong>{formatLongDate(cycle.startDate)}</strong>
                    <p>
                      {cycle.lengthInDays
                        ? `${cycle.lengthInDays} day cycle`
                        : "Current cycle still in progress"}
                    </p>
                  </div>
                  <div className="mini-tags">
                    {cycle.periodLengthInDays ? (
                      <Tag>{cycle.periodLengthInDays} day period</Tag>
                    ) : (
                      <Tag tone="warning">Length pending</Tag>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
