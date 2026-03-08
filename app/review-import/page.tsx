"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { Button, EmptyState, GlassCard, InputField, Tag } from "@/components/ui";
import { formatLongDate } from "@/lib/date";
import { ImportCandidate, ImportSession } from "@/lib/types";

interface CandidateDraft {
  id: string;
  messageText: string;
  messageDate: string;
  suggestedType: ImportCandidate["suggestedType"];
  reviewState: ImportCandidate["reviewState"];
}

function createDrafts(session: ImportSession) {
  return session.candidates.map((candidate) => ({
    id: candidate.id,
    messageText: candidate.messageText,
    messageDate: candidate.messageDate,
    suggestedType: candidate.suggestedType,
    reviewState: candidate.reviewState,
  }));
}

function ReviewImportContent({ session }: { session: ImportSession }) {
  const router = useRouter();
  const { finalizeImportReview } = useAppContext();
  const [drafts, setDrafts] = useState<CandidateDraft[]>(() => createDrafts(session));

  const accepted = drafts.filter(
    (candidate) =>
      candidate.reviewState !== "rejected" && candidate.suggestedType !== "uncertain",
  );

  return (
    <div className="stack">
      <GlassCard>
        <div className="section-row">
          <div>
            <p className="eyebrow">Running summary</p>
            <h2>{accepted.length} events ready to save</h2>
          </div>
          <Tag tone="warning">{session.candidates.length} detected</Tag>
        </div>
        <p className="muted-copy">
          Imported events are marked as inferred unless you keep the original suggestion unchanged.
        </p>
        <Button
          onClick={() => {
            finalizeImportReview(session.id, drafts);
            router.push("/history");
          }}
        >
          Save accepted events
        </Button>
      </GlassCard>

      {drafts.map((candidate, index) => {
        const original = session.candidates[index];
        return (
          <GlassCard key={candidate.id}>
            <div className="section-row">
              <div>
                <p className="eyebrow">Candidate {index + 1}</p>
                <h2>{formatLongDate(candidate.messageDate)}</h2>
              </div>
              <Tag tone={original.confidenceScore >= 0.8 ? "success" : "warning"}>
                {Math.round(original.confidenceScore * 100)}%
              </Tag>
            </div>
            <p className="source-snippet">{candidate.messageText}</p>
            <div className="field-group">
              <span>Suggested type</span>
              <div className="segmented-row">
                {["start", "end", "uncertain"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`segment${candidate.suggestedType === type ? " is-active" : ""}`}
                    onClick={() =>
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === candidate.id
                            ? {
                                ...item,
                                suggestedType: type as CandidateDraft["suggestedType"],
                                reviewState:
                                  type === original.suggestedType ? "accepted" : "edited",
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <label className="field-group">
              <span>Date</span>
              <InputField
                type="date"
                value={candidate.messageDate}
                onChange={(event) =>
                  setDrafts((current) =>
                    current.map((item) =>
                      item.id === candidate.id
                        ? {
                            ...item,
                            messageDate: event.target.value,
                            reviewState:
                              event.target.value === original.messageDate &&
                              item.suggestedType === original.suggestedType
                                ? "accepted"
                                : "edited",
                          }
                        : item,
                    ),
                  )
                }
              />
            </label>
            <div className="action-row">
              <Button
                variant="secondary"
                onClick={() =>
                  setDrafts((current) =>
                    current.map((item) =>
                      item.id === candidate.id
                        ? { ...item, reviewState: "accepted" }
                        : item,
                    ),
                  )
                }
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setDrafts((current) =>
                    current.map((item) =>
                      item.id === candidate.id
                        ? { ...item, reviewState: "rejected" }
                        : item,
                    ),
                  )
                }
              >
                Reject
              </Button>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

function ReviewImportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const { state } = useAppContext();
  const session = state.importSessions.find((item) => item.id === sessionId) ?? state.importSessions[0];

  if (!session) {
    return (
      <AppShell title="Review import" subtitle="Review detected candidates before saving.">
        <EmptyState
          title="No session to review"
          body="Start from the import screen to parse Telegram history."
          action={
            <Button onClick={() => router.push("/import")}>
              Open import
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Review import"
      subtitle="Confirm, edit, or reject each detected event."
    >
      <ReviewImportContent key={session.id} session={session} />
    </AppShell>
  );
}

export default function ReviewImportPage() {
  return (
    <Suspense
      fallback={
        <AppShell
          title="Review import"
          subtitle="Confirm, edit, or reject each detected event."
        >
          <GlassCard>
            <p className="muted-copy">Loading import session…</p>
          </GlassCard>
        </AppShell>
      }
    >
      <ReviewImportPageContent />
    </Suspense>
  );
}
