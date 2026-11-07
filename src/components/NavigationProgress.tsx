"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "loading" | "done";

/**
 * Shows a slim progress bar and a "Loading" chip as soon as an internal link is
 * clicked, so the page never feels frozen, and swallows repeat clicks on the
 * same link while the navigation is still in flight.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [showChip, setShowChip] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const startPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  // Navigation finished: the pathname changed.
  useEffect(() => {
    if (pathname === startPath.current) return;
    startPath.current = pathname;
    if (pendingHref.current === null) return;
    clearTimers();
    pendingHref.current = null;
    document.documentElement.removeAttribute("data-nav-pending");
    setShowChip(false);
    setPhase("done");
    timers.current.push(window.setTimeout(() => setPhase("idle"), 450));
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const sameDocument = url.pathname === window.location.pathname && url.search === window.location.search;
      if (sameDocument) return;

      // The same link was already clicked and is still loading: ignore the repeat.
      if (pendingHref.current === url.pathname + url.search) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      pendingHref.current = url.pathname + url.search;
      startPath.current = window.location.pathname;
      document.documentElement.setAttribute("data-nav-pending", "");
      clearTimers();
      setPhase("loading");
      // Only show the chip if the page is slow, so instant navigations do not flash.
      timers.current.push(window.setTimeout(() => setShowChip(true), 250));
      // Safety net: never leave the indicator stuck.
      timers.current.push(
        window.setTimeout(() => {
          pendingHref.current = null;
          document.documentElement.removeAttribute("data-nav-pending");
          setShowChip(false);
          setPhase("idle");
        }, 20000),
      );
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, []);

  if (phase === "idle") return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent print:hidden"
      >
        <div className={`h-full bg-lime shadow-[0_0_10px_#c6f24e] ${phase === "loading" ? "nav-bar-loading" : "nav-bar-done"}`} />
      </div>
      {showChip && phase === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed top-[4.25rem] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-panel/95 px-3.5 py-1.5 font-mono text-xs text-soft shadow-lg backdrop-blur print:hidden"
        >
          <span className="nav-spinner size-3.5 rounded-full border-2 border-lime/30 border-t-lime" aria-hidden="true" />
          Loading…
        </div>
      )}
    </>
  );
}
