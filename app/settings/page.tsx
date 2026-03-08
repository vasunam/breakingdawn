"use client";

import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { useAuth } from "@/components/auth-provider";
import { Button, GlassCard, Tag, Toggle } from "@/components/ui";
import { exportCsv, exportJson } from "@/lib/export";

export default function SettingsPage() {
  const { clearAllData, state, updateProfile } = useAppContext();
  const { user, signOut } = useAuth();

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
              <p>Reminders toggle is included in your synced app profile.</p>
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
              if (window.confirm("Delete all your data across this account?")) {
                clearAllData();
              }
            }}
          >
            Delete all data
          </Button>
        </GlassCard>

        <GlassCard>
          <p className="eyebrow">Account</p>
          <h2>{user?.email ?? "Signed in"}</h2>
          <Button variant="secondary" onClick={() => void signOut()}>
            Sign out
          </Button>
        </GlassCard>

        <GlassCard>
          <p className="eyebrow">Privacy</p>
          <h2>What this V1 stores</h2>
          <p className="muted-copy">
            This version syncs your complete state to Supabase after you sign in so it works across devices.
          </p>
        </GlassCard>
      </div>
    </AppShell>
  );
}
