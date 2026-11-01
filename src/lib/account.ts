"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
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

export function startAccount() {
  if (started || !URL || !KEY) return;
  started = true;
  client = createClient(URL, KEY, { auth: { flowType: "pkce" } });

  // The button only appears once Google is switched on in Supabase.
  fetch(`${URL}/auth/v1/settings`, { headers: { apikey: KEY } })
    .then((response) => response.json())
    .then((settings) => update({ googleEnabled: settings?.external?.google === true }))
    .catch(() => {});

  client.auth.onAuthStateChange((_event, session) => {
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
}

export function signInWithGoogle() {
  return client?.auth.signInWithOAuth({
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
