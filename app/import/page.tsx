"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { Button, EmptyState, GlassCard, TextArea } from "@/components/ui";
import { buildImportSession } from "@/lib/import-parser";

export default function ImportPage() {
  const router = useRouter();
  const { addImportSession, state } = useAppContext();
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const latestSession = state.importSessions[0];

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setRawText(text);
    setFileName(file.name);
  }

  function handleImport() {
    if (!rawText.trim()) {
      return;
    }

    const session = buildImportSession({
      rawText,
      rawSourceType: fileName ? "file" : "text",
      rawSourceName: fileName || undefined,
    });
    addImportSession(session);
    router.push(`/review-import?session=${session.id}`);
  }

  return (
    <AppShell
      title="Import"
      subtitle="Approximate by design. Nothing is saved until you review it."
    >
      <div className="stack">
        <GlassCard>
          <p className="eyebrow">Telegram bootstrap</p>
          <h2>Paste chat export text or upload a text file.</h2>
          <p className="muted-copy">
            The parser looks for likely period starts, ends, and uncertain mentions. You will review every candidate before anything becomes history.
          </p>
          <TextArea
            rows={10}
            placeholder="02/14/2026 - I think my period started today&#10;02/19/2026 - period ended"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
          />
          <label className="upload-field">
            <input type="file" accept=".txt,.json" onChange={handleFileChange} />
            <span>{fileName || "Upload export file"}</span>
          </label>
          <div className="action-row">
            <Button onClick={handleImport}>Parse candidates</Button>
          </div>
        </GlassCard>

        {latestSession ? (
          <GlassCard>
            <p className="eyebrow">Latest session</p>
            <h2>{latestSession.rawSourceName ?? "Pasted text"}</h2>
            <p className="muted-copy">
              {latestSession.candidates.length} candidates found in your latest import.
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push(`/review-import?session=${latestSession.id}`)}
            >
              Open review
            </Button>
          </GlassCard>
        ) : (
          <EmptyState
            title="No import session yet"
            body="If you already know one recent period start, you can skip import and begin from Home."
          />
        )}
      </div>
    </AppShell>
  );
}
