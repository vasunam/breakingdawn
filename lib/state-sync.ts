import type { AppState } from "@/lib/types";
import { defaultState, writeState } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

const STATE_TABLE = "app_states";

export async function loadStateFromSupabase(): Promise<AppState | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from(STATE_TABLE)
    .select("state")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (error || !data?.state) {
    return null;
  }

  const remote = normalizeState(data.state);
  if (remote) {
    return remote;
  }

  return null;
}

export async function saveStateToSupabase(state: AppState) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Not signed in");
  }

  const payload = {
    user_id: authData.user.id,
    state,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(STATE_TABLE).upsert(payload, {
    onConflict: "user_id",
  });
  if (error) {
    throw error;
  }
  writeState(state);
}

export async function clearRemoteState() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return;
  }

  await supabase.from(STATE_TABLE).delete().eq("user_id", authData.user.id);
}

function normalizeState(input: unknown): AppState | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as Partial<AppState>;

  return {
    ...defaultState,
    ...candidate,
    profile: candidate.profile ?? null,
    periodEvents: candidate.periodEvents ?? [],
    dailyLogs: candidate.dailyLogs ?? [],
    importSessions: candidate.importSessions ?? [],
    askMessages: candidate.askMessages ?? [],
  };
}
