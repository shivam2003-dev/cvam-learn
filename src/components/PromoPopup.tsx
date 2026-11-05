"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const DURATION_MS = 5000;
const DELAY_MS = 2500;
const HIDE_FOREVER_KEY = "cvam-learn:promo:hidden";
const SEEN_THIS_SESSION_KEY = "cvam-learn:promo:seen";
const PROMO_URL = "https://shivam2003.com";

/** Pages where an overlay would get in the way (printed certificates). */
const SKIP = (path: string) => path.endsWith("/certificate");

function read(storage: Storage | undefined, key: string) {
  try {
    return storage?.getItem(key);
  } catch {
    return null;
  }
}

function write(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Private windows can refuse storage; the popup still closes for this page.
  }
}

/**
 * A small, non-modal promo card for the author's blog. Shows once per session
 * after a short delay, closes itself after five seconds (pausing while the
 * pointer or keyboard focus is on it), and can be hidden for good.
 */
export function PromoPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_MS);
  const [neverAgain, setNeverAgain] = useState(false);
  const tick = useRef<number | null>(null);

  // Decide whether to show, once, shortly after the first page load.
  useEffect(() => {
    if (SKIP(pathname)) return;
    if (read(window.localStorage, HIDE_FOREVER_KEY)) return;
    if (read(window.sessionStorage, SEEN_THIS_SESSION_KEY)) return;
    const timer = window.setTimeout(() => {
      write(window.sessionStorage, SEEN_THIS_SESSION_KEY, "1");
      setRemaining(DURATION_MS);
      setVisible(true);
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
    // Only the first page of a session should trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count down while visible and not paused.
  useEffect(() => {
    if (!visible || paused) return;
    tick.current = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 100));
    }, 100);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [visible, paused]);

  useEffect(() => {
    if (visible && remaining <= 0) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, visible]);

  // Escape closes it, like any dismissible overlay.
  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, neverAgain]);

  function close() {
    if (neverAgain) write(window.localStorage, HIDE_FOREVER_KEY, "1");
    setVisible(false);
  }

  if (!visible || SKIP(pathname)) return null;

  const percent = Math.round((remaining / DURATION_MS) * 100);

  return (
    <aside
      role="complementary"
      aria-label="Promotion for the author's blog"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="fixed right-4 bottom-4 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-black/50 print:hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <p className="rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-faint uppercase">
            Ad · from the author
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="ml-auto grid size-7 shrink-0 place-items-center rounded-md text-soft hover:bg-raised hover:text-text"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>
        <h2 className="mt-2 font-display text-lg leading-snug font-bold">
          cvam<span className="text-lime">.sight</span>
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-soft">
          A blog from a DevOps + ML apprentice: field notes from the systems frontier, a weekly AI
          digest and plain-English paper summaries.
        </p>
        <a
          href={PROMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="mt-3 inline-block rounded-lg bg-lime px-3.5 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          Check it out →
        </a>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-faint select-none">
          <input
            type="checkbox"
            checked={neverAgain}
            onChange={(event) => setNeverAgain(event.target.checked)}
            className="size-3.5 accent-[var(--color-lime)]"
          />
          Don&apos;t show this again
        </label>
      </div>
      <div
        role="progressbar"
        aria-label="Time until this closes"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1 w-full bg-raised"
      >
        <div
          className="h-full bg-lime"
          style={{ width: `${percent}%`, transition: paused ? "none" : "width 100ms linear" }}
        />
      </div>
    </aside>
  );
}
