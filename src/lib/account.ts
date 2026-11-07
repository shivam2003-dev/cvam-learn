"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import {
  clearProgress,
  getProgress,
  mergeProgress,
  subscribeProgress,
  type Progress,
} from "@/lib/progress";

const URL = process.env.NEXT_PUBLIC_ASUPABASE_URL;
const KEY =
  process.env.NEXT_PUBLIC_ASUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_ASUPABASE_ANON_KEY;
const PUSH_DELAY_MS = 1500;

type Account = { user: User | null; googleEnabled: boolean };

const SIGNED_OUT: Account = { user: null, googleEnabled: false };

let account = SIGNED_OUT;
let client: SupabaseClient | null = null;
let started = false;
let syncedUser: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function update(next: Partial<Account>) {
  account = { ...account, ...next };
  listeners.forEach((listener) => listener());
}

async function push(userId: string) {
  await client
    ?.from("learn_progress")
    .upsert({ user_id: userId, data: getProgress(), updated_at: new Date().toISOString() });
}

/** Guest progress and saved progress are merged, so signing in never loses work. */
async function pull(userId: string) {
  if (syncedUser === userId) return;
  const { data, error } = (await client
    ?.from("learn_progress")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle()) ?? { data: null, error: null };
  if (error) return;
  if (data?.data) mergeProgress(data.data as Partial<Progress>);
  syncedUser = userId;
  await push(userId);
}

let clientPromise: Promise<SupabaseClient> | null = null;

/** Only visitors who may already be signed in (or are returning from Google) need the SDK up front. */
function mayBeSignedIn() {
  try {
    if (new URLSearchParams(window.location.search).has("code")) return true;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("sb-") && key.includes("auth-token")) return true;
    }
  } catch {
    // Storage can be blocked; treat as signed out.
  }
  return false;
}

/** The Supabase SDK is large, so it is fetched on demand instead of with every page. */
function ensureClient(): Promise<SupabaseClient> {
  if (clientPromise) return clientPromise;
  clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
    const created = createClient(URL!, KEY!, { auth: { flowType: "pkce" } });
    client = created;

    created.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      update({ user });
      // Supabase deadlocks if its own client is awaited inside this callback.
      if (user) setTimeout(() => void pull(user.id));
    });

    subscribeProgress(() => {
      const user = account.user;
      if (!user || syncedUser !== user.id) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(() => void push(user.id), PUSH_DELAY_MS);
    });
    return created;
  });
  return clientPromise;
}

export function startAccount() {
  if (started || !URL || !KEY) return;
  started = true;

  // The button only appears once Google is switched on in Supabase.
  fetch(`${URL}/auth/v1/settings`, { headers: { apikey: KEY } })
    .then((response) => response.json())
    .then((settings) => update({ googleEnabled: settings?.external?.google === true }))
    .catch(() => {});

  if (mayBeSignedIn()) void ensureClient();
}

export async function signInWithGoogle() {
  const ready = await ensureClient();
  return ready.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.href },
  });
}

export async function signOut() {
  clearTimeout(pushTimer);
  if (account.user && syncedUser === account.user.id) await push(account.user.id);
  await client?.auth.signOut();
  syncedUser = null;
  // Saved progress is safe in the account; don't leave it for the next person here.
  clearProgress();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAccount() {
  return useSyncExternalStore(
    subscribe,
    () => account,
    () => SIGNED_OUT,
  );
}
