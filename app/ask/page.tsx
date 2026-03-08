"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppContext } from "@/components/app-provider";
import { Button, Chip, EmptyState, GlassCard, TextArea } from "@/components/ui";

const suggestedPrompts = [
  "When do I usually start my period?",
  "Have my cramps been worse recently?",
  "Summarize this month.",
  "Did I usually feel low energy before my last two periods?",
];

export default function AskPage() {
  const { askQuestion, state } = useAppContext();
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }
    askQuestion(draft.trim());
    setDraft("");
  }

  return (
    <AppShell
      title="Ask"
      subtitle="Grounded answers first, uncertainty when the data is thin."
    >
      <div className="stack">
        <GlassCard>
          <p className="eyebrow">Suggested prompts</p>
          <div className="chip-row">
            {suggestedPrompts.map((prompt) => (
              <Chip key={prompt} onClick={() => askQuestion(prompt)}>
                {prompt}
              </Chip>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <form className="stack" onSubmit={handleSubmit}>
            <TextArea
              rows={4}
              placeholder="Ask about your own data..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit">Ask</Button>
          </form>
        </GlassCard>

        {state.askMessages.length === 0 ? (
          <EmptyState
            title="No answers yet"
            body="Ask about timing, symptom recurrence, or a summary of this cycle."
          />
        ) : (
          <div className="chat-list">
            {state.askMessages.map((message) => (
              <GlassCard
                key={message.id}
                className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`}
              >
                <p className="eyebrow">{message.role === "assistant" ? "Answer" : "You asked"}</p>
                <h2>{message.text}</h2>
                {message.citations?.length ? (
                  <ul className="citation-list">
                    {message.citations.map((citation) => (
                      <li key={citation}>{citation}</li>
                    ))}
                  </ul>
                ) : null}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
