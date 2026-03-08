"use client";

import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { Button, GlassCard, Tag, Toggle } from "@/components/ui";
import { exportCsv, exportJson } from "@/lib/export";

export default function SettingsPage() {
  const { clearAllData, state, updateProfile } = useAppContext();

  return (
    <AppShell
      title="Settings"
      subtitle="Export, delete, and reminder controls should be easy to find."
    >
      <div className="stack">
        <GlassCard>
          <div className="list-row">
            <div>
              <strong>Likely-period reminders</strong>
              <p>Prototype toggle stored locally. Telegram connection is ready for a backend pass later.</p>
            </div>
            <Toggle
              checked={state.profile?.remindersEnabled ?? false}
              onChange={(next) => updateProfile({ remindersEnabled: next })}
            />
          </div>
          <div className="list-row">
            <div>
              <strong>Telegram connection</strong>
              <p>
                {state.profile?.telegramLinked
                  ? "Connected"
                  : "Not linked in this prototype build"}
              </p>
            </div>
            <Tag tone="warning">
              {state.profile?.telegramLinked ? "Linked" : "Pending"}
            </Tag>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="eyebrow">Data controls</p>
          <h2>Export or remove everything</h2>
          <div className="action-row">
            <Button variant="secondary" onClick={() => exportJson(state)}>
              Export JSON
            </Button>
            <Button variant="secondary" onClick={() => exportCsv(state)}>
              Export CSV
            </Button>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("Delete all local data for this prototype?")) {
                clearAllData();
              }
            }}
          >
            Delete all data
          </Button>
        </GlassCard>

        <GlassCard>
          <p className="eyebrow">Privacy</p>
          <h2>What this V1 stores</h2>
          <p className="muted-copy">
            This version stores data in your browser so it deploys to Vercel with zero backend setup. That keeps V1 simple for testing, but it is single-device storage until we add server-backed auth and sync.
          </p>
        </GlassCard>
      </div>
    </AppShell>
  );
}
