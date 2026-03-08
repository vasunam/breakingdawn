"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, GlassCard, InputField } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

type AuthMode = "signIn" | "signUp";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const handler = mode === "signIn" ? signIn : signUp;
    const error = await handler(email.trim(), password);

    setIsSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "signUp") {
      setMessage(
        "Account created. You can sign in right away once you confirm verification, then continue setup.",
      );
    }
  }

  const alternateMode = mode === "signIn" ? "signUp" : "signIn";

  return (
    <AppShell title="Welcome" subtitle="Sign in or create an account to sync across devices.">
      <div className="stack">
        <GlassCard>
          <p className="eyebrow">Authentication</p>
          <h2>{mode === "signIn" ? "Sign in" : "Create account"}</h2>
          <form className="stack" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Email</span>
              <InputField
                type="email"
                value={email}
                required
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field-group">
              <span>Password</span>
              <InputField
                type="password"
                minLength={8}
                value={password}
                required
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Working..." : mode === "signIn" ? "Sign in" : "Create account"}
            </Button>
          </form>
          {error ? <p className="muted-copy">{error}</p> : null}
          {message ? <p className="muted-copy">{message}</p> : null}
        </GlassCard>

        <Button
          variant="secondary"
          onClick={() => {
            setMode(alternateMode);
            setError("");
            setMessage("");
          }}
        >
          {alternateMode === "signIn" ? "Already have an account? Sign in" : "Need an account? Create one"}
        </Button>
      </div>
    </AppShell>
  );
}
