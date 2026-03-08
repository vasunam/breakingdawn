"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { MoonHero } from "@/components/moon-hero";
import { Button, Chip, EmptyState, GlassCard, Tag, TextArea } from "@/components/ui";
import { buildInsightCard } from "@/lib/insights";
import { getTodayState } from "@/lib/cycle";
import { parseNaturalLanguageLog } from "@/lib/parser";
import { formatShortDate, relativeDayLabel, today } from "@/lib/date";
import { ParsedLog, SymptomKey } from "@/lib/types";

const quickSymptoms: Array<{ key: SymptomKey; label: string }> = [
  { key: "cramps", label: "Cramps" },
  { key: "fatigue", label: "Fatigue" },
  { key: "bloating", label: "Bloating" },
  { key: "headache", label: "Headache" },
  { key: "low-energy", label: "Low energy" },
  { key: "mood-low", label: "Mood low" },
];

export default function HomePage() {
  const { state, startPeriod, endPeriod, addQuickSymptom, saveParsedLog } = useAppContext();
  const [draft, setDraft] = useState("");
  const [parsedLog, setParsedLog] = useState<ParsedLog | null>(null);
  const [lastSaved, setLastSaved] = useState("");
  const todayState = getTodayState(state);
  const insight = buildInsightCard(state);
  const recentLogs = [...state.dailyLogs].sort((left, right) => right.logDate.localeCompare(left.logDate)).slice(0, 4);

  function handleParse() {
    if (!draft.trim()) {
      return;
    }

    setParsedLog(parseNaturalLanguageLog(draft));
  }

  function handleSaveParsedLog() {
    if (!parsedLog) {
      return;
    }

    saveParsedLog(parsedLog);
    setLastSaved(`Saved ${relativeDayLabel(today()).toLowerCase()}`);
    setDraft("");
    setParsedLog(null);
  }

  return (
    <AppShell
      title="Home"
      subtitle="Fast enough to use with one thumb, grounded enough to trust."
    >
      <div className="stack">
        <MoonHero todayState={todayState} />

        <div className="two-up">
          <Button
            onClick={() => startPeriod()}
            variant={todayState.activePeriod ? "secondary" : "primary"}
          >
            Start Period
          </Button>
          <Button
            onClick={() => endPeriod()}
            variant={todayState.activePeriod ? "primary" : "secondary"}
          >
            End Period
          </Button>
        </div>

        <GlassCard>
          <div className="section-row">
            <div>
              <p className="eyebrow">Quick log</p>
              <h2>What happened today?</h2>
            </div>
            {lastSaved ? <Tag tone="success">{lastSaved}</Tag> : null}
          </div>
          <div className="chip-row">
            {quickSymptoms.map((symptom) => (
              <Chip
                key={symptom.key}
                onClick={() => {
                  addQuickSymptom(symptom.key);
                  setLastSaved(`${symptom.label} logged`);
                }}
              >
                {symptom.label}
              </Chip>
            ))}
          </div>
          <TextArea
            rows={4}
            placeholder="Log anything... cramps, low energy, took ibuprofen, medium flow"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="action-row">
            <Button onClick={handleParse}>Review parsed log</Button>
            <Link href="/ask" className="text-link">
              Ask AI
            </Link>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="eyebrow">{insight.eyebrow}</p>
          <h2>{insight.title}</h2>
          <p className="muted-copy">{insight.body}</p>
        </GlassCard>

        <GlassCard>
          <div className="section-row">
            <div>
              <p className="eyebrow">Today at a glance</p>
              <h2>Cycle state</h2>
            </div>
            <Tag tone="warning">{todayState.phaseLabel}</Tag>
          </div>
          <div className="stat-grid">
            <div>
              <span>Cycle day</span>
              <strong>{todayState.cycleDay ?? "..."}</strong>
            </div>
            <div>
              <span>Next window</span>
              <strong>
                {todayState.nextPeriodWindow
                  ? formatShortDate(todayState.nextPeriodWindow.start)
                  : "Pending"}
              </strong>
            </div>
          </div>
          <p className="muted-copy">
            {todayState.nextPeriodWindow
              ? `Predicted window runs ${formatShortDate(todayState.nextPeriodWindow.start)} to ${formatShortDate(todayState.nextPeriodWindow.end)}.`
              : "As soon as you confirm one start date, your next likely window will appear here."}
          </p>
        </GlassCard>

        <GlassCard>
          <div className="section-row">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2>Latest logs</h2>
            </div>
            <Link href="/history" className="text-link">
              Open history
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <EmptyState
              title="No logs yet"
              body="Start a period, tap a symptom chip, or paste a quick note to build your history."
              action={
                <Link href="/import" className="inline-link">
                  Import Telegram history instead
                </Link>
              }
            />
          ) : (
            <div className="timeline">
              {recentLogs.map((log) => (
                <article key={log.id} className="timeline-item">
                  <div>
                    <strong>{formatShortDate(log.logDate)}</strong>
                    <p>{log.noteText ?? "Structured log saved"}</p>
                  </div>
                  <div className="mini-tags">
                    {log.symptoms.slice(0, 3).map((symptom) => (
                      <Tag key={symptom.id}>{symptom.symptomKey}</Tag>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {parsedLog ? (
        <div className="sheet-backdrop" onClick={() => setParsedLog(null)}>
          <div
            className="sheet"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="sheet-handle" />
            <p className="eyebrow">Review before save</p>
            <h2>Structured interpretation</h2>
            <p className="muted-copy">
              Confidence: {Math.round(parsedLog.confidenceScore * 100)}%
            </p>
            <div className="chip-row">
              {parsedLog.flowLevel ? <Tag tone="success">Flow: {parsedLog.flowLevel}</Tag> : null}
              {parsedLog.mood ? <Tag>Mood: {parsedLog.mood}</Tag> : null}
              {parsedLog.energy ? <Tag>Energy: {parsedLog.energy}</Tag> : null}
              {parsedLog.painLevel ? <Tag>Pain: {parsedLog.painLevel}/4</Tag> : null}
              {parsedLog.symptoms.map((symptom) => (
                <Tag key={symptom}>{symptom}</Tag>
              ))}
              {parsedLog.medications.map((medication) => (
                <Tag key={medication.id}>{medication.name}</Tag>
              ))}
            </div>
            {parsedLog.suggestedPeriodEvent ? (
              <p className="muted-copy">
                Also detected: {parsedLog.suggestedPeriodEvent.eventType} period today.
              </p>
            ) : null}
            {parsedLog.clarificationQuestion ? (
              <p className="muted-copy">{parsedLog.clarificationQuestion}</p>
            ) : null}
            <div className="action-row">
              <Button variant="secondary" onClick={() => setParsedLog(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveParsedLog}>Save log</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
