import type { ReactNode } from "react";
import type { Difficulty } from "@/lib/types";

const tones = {
  note: { label: "Note", className: "border-sky/50 bg-sky/8", text: "text-sky" },
  tip: { label: "Field tip", className: "border-lime/50 bg-lime/8", text: "text-lime" },
  warn: { label: "Watch out", className: "border-amber/50 bg-amber/8", text: "text-amber" },
};

export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children: ReactNode;
}) {
  const style = tones[tone];
  return (
    <aside className={`rounded-r-lg border-l-3 px-4 py-3 ${style.className}`}>
      <p className={`font-mono text-xs uppercase tracking-wider ${style.text}`}>
        {title ?? style.label}
      </p>
      <div className="mt-1.5 text-[0.98rem] leading-relaxed">{children}</div>
    </aside>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="overflow-x-auto rounded-lg border border-line bg-[#080b0f] px-4 py-3 text-center font-mono text-[0.95rem] whitespace-nowrap text-lime">
      {children}
    </p>
  );
}

export function Table({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const difficultyTone: Record<Difficulty, string> = {
  Easy: "text-lime border-lime/40",
  Medium: "text-amber border-amber/40",
  Hard: "text-rose border-rose/40",
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-xs ${difficultyTone[value]}`}
    >
      {value}
    </span>
  );
}
