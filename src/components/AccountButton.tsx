"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle, signOut, startAccount, useAccount } from "@/lib/account";

export function AccountButton() {
  const { user, googleEnabled } = useAccount();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    startAccount();
  }, []);

  if (!user) {
    if (!googleEnabled) return null;
    return (
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        title="Optional: save your progress across devices"
        className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs whitespace-nowrap text-soft hover:text-text"
      >
        Sign in with Google
      </button>
    );
  }

  const name: string = user.user_metadata?.full_name ?? user.email ?? "Account";

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((value) => !value)}
        className="grid size-7 place-items-center rounded-full bg-lime text-xs font-bold text-ink"
      >
        {name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="absolute top-9 right-0 z-30 w-56 rounded-lg border border-line bg-panel p-3 text-sm">
          <p className="truncate font-medium">{name}</p>
          <p className="mt-0.5 text-xs text-faint">Progress saves to your account.</p>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="mt-3 font-mono text-xs text-sky hover:underline"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
