"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { Button, GlassCard, InputField, Toggle } from "@/components/ui";

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAppContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lastStart, setLastStart] = useState("");
  const [cycleLength, setCycleLength] = useState("29");
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [importAfter, setImportAfter] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    completeOnboarding({
      name,
      email,
      lastKnownPeriodStart: lastStart || undefined,
      averageCycleLength: cycleLength ? Number(cycleLength) : undefined,
      remindersEnabled,
      importAfter,
    });
    router.push(importAfter ? "/import" : "/");
  }

  return (
    <AppShell
      title="Onboarding"
      subtitle="Under two minutes, no long questionnaire."
    >
      <GlassCard className="hero-card onboarding-hero">
        <div className="moon-orb is-active" />
        <div className="hero-copy">
          <p className="eyebrow">Private by default</p>
          <h2>Set up the minimum needed to make the app useful right away.</h2>
          <p className="muted-copy">
            Everything here is optional except creating your local profile. You can export or delete all data any time.
          </p>
        </div>
      </GlassCard>

      <form className="stack" onSubmit={handleSubmit}>
        <GlassCard>
          <label className="field-group">
            <span>Name</span>
            <InputField
              placeholder="Optional"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="field-group">
            <span>Email</span>
            <InputField
              type="email"
              placeholder="Optional for this prototype"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field-group">
            <span>Last period start</span>
            <InputField
              type="date"
              value={lastStart}
              onChange={(event) => setLastStart(event.target.value)}
            />
          </label>
          <label className="field-group">
            <span>Typical cycle length</span>
            <InputField
              type="number"
              min="20"
              max="45"
              value={cycleLength}
              onChange={(event) => setCycleLength(event.target.value)}
            />
          </label>
        </GlassCard>

        <GlassCard>
          <div className="list-row">
            <div>
              <strong>Gentle reminders</strong>
              <p>Show likely-period nudges in Settings. Telegram can be connected later.</p>
            </div>
            <Toggle checked={remindersEnabled} onChange={setRemindersEnabled} />
          </div>
          <div className="list-row">
            <div>
              <strong>Import Telegram history now</strong>
              <p>Paste or upload exported chat text and review any detected period events.</p>
            </div>
            <Toggle checked={importAfter} onChange={setImportAfter} />
          </div>
        </GlassCard>

        <Button type="submit">Continue</Button>
      </form>
    </AppShell>
  );
}
