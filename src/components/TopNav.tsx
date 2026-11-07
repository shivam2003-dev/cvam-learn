"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountButton } from "@/components/AccountButton";
import { levelOf, streakOf, useProgress, xpOf } from "@/lib/progress";

const links = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/courseware", label: "Courseware", match: (p: string) => p.startsWith("/courseware") },
  { href: "/paths", label: "Paths", match: (p: string) => p.startsWith("/paths") },
  { href: "/practice", label: "Practice", match: (p: string) => p.startsWith("/practice") },
  { href: "/exams", label: "Exams", match: (p: string) => p.startsWith("/exams") },
];

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
      <span
        aria-hidden="true"
        className="grid size-6 place-items-center rounded bg-lime font-mono text-sm font-bold text-ink"
      >
        &gt;
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        cvam<span className="text-lime">.learn</span>
      </span>
    </Link>
  );
}

export function StatChips() {
  const progress = useProgress();
  const xp = xpOf(progress);
  const { level } = levelOf(xp);

  return (
    <div className="flex items-center gap-2 font-mono text-xs whitespace-nowrap">
      <span
        title="Days in a row with a finished lesson, quiz or problem"
        className="rounded-md border border-line bg-panel px-2 py-1 text-amber"
      >
        {streakOf(progress)}d
      </span>
      <span
        title="10 XP per lesson, 5 per correct first-try answer, 20 per problem"
        className="rounded-md border border-line bg-panel px-2 py-1 text-lime"
      >
        LV{level} · {xp} XP
      </span>
    </div>
  );
}

export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/95 backdrop-blur print:hidden">
      <div className="flex h-14 items-center gap-5 px-4">
        <Brand />
        <nav aria-label="Main" className="flex min-w-0 gap-1 overflow-x-auto text-sm">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2.5 py-1.5 ${active ? "bg-raised text-text" : "text-soft hover:text-text"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <StatChips />
          </div>
          <AccountButton />
        </div>
      </div>
    </header>
  );
}
