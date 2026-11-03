import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Write short documents for a specific reader and purpose",
    "Produce the core FDE documents: design note, runbook, handover and decision log",
    "Edit for clarity using simple, testable rules",
  ],
  tasks: [
    {
      id: "reader",
      title: "Write for a reader",
      body: (
        <>
          <p>
            Documents outlive your involvement. When you leave the engagement, writing is what
            remains. Good technical writing is not long; it is useful to one reader in one moment.
          </p>
          <ol>
            <li>
              <strong>Who reads this?</strong> An operator at 3 a.m., a manager deciding, a new
              engineer onboarding.
            </li>
            <li>
              <strong>What should they do or decide after reading?</strong> Put that first.
            </li>
            <li>
              <strong>What do they already know?</strong> Skip it; define only new terms.
            </li>
          </ol>
          <Callout tone="tip">
            Lead with the conclusion. "Recommendation: use the nightly batch. Reasons below."
            Readers who stop after two lines still got the point.
          </Callout>
        </>
      ),
    },
    {
      id: "docs",
      title: "Documents an FDE writes",
      body: (
        <>
          <Table
            head={["Document", "Reader", "Contains"]}
            rows={[
              ["Design note", "Customer engineers, security", "Problem, options considered, chosen design, diagram, risks"],
              ["Runbook", "On-call operator", "Symptoms, checks, exact commands, escalation contact"],
              ["Handover pack", "Customer's team", "Architecture, access, credentials process, ownership, known issues"],
              ["Decision log", "Everyone, later", "Date, decision, who, why, alternatives rejected"],
              ["Status update", "Sponsor", "Progress, risks, asks, next steps"],
              ["Postmortem", "Team and customer", "Timeline, impact, causes, fixes, follow-ups (blameless)"],
            ]}
          />
          <pre>
            <code>{`# Runbook: policy search returns no results

Symptom:  Search returns "No results" for all queries
Impact:   Agents cannot find policies; escalations slow down

1. Check index health:   curl -s https://search.internal/health
2. If "stale": rerun ingestion:  ./scripts/reindex.sh --since yesterday
3. If SharePoint auth error in logs: renew the service credential (see Access doc)
4. Still failing after 15 min: page the platform on-call (contact in Handover pack)

Last verified: 2026-10-20 by A. Person`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "edit",
      title: "Edit for clarity",
      body: (
        <>
          <ul>
            <li>Prefer short sentences and active voice: "The job writes a file", not "A file is written".</li>
            <li>Use the same word for the same thing every time.</li>
            <li>Use lists for steps, tables for comparisons, code blocks for commands.</li>
            <li>Replace vague words (soon, fast, robust) with numbers.</li>
            <li>Add a diagram when explaining flow between more than three components.</li>
            <li>Keep docs next to the code, in version control, and update them in the same pull request.</li>
            <li>Test instructions by having someone new follow them.</li>
          </ul>
          <Callout tone="note">
            A stale document is worse than none. Put a "last verified" date on runbooks and assign
            an owner.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Write for one reader and one action; lead with the conclusion.",
    "Core FDE documents: design note, runbook, handover pack, decision log, status update and postmortem.",
    "Edit for short active sentences, numbers over vague words, and keep docs versioned and tested.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Who is the primary reader of a runbook?",
      options: [
        "An operator handling an incident",
        "A marketing manager",
        "A competitor",
        "Nobody",
      ],
      answer: 0,
      explain: "Runbooks must be usable under stress, with exact checks and commands.",
    },
    {
      kind: "mcq",
      q: "Which sentence is clearest?",
      options: [
        "The system should be fairly fast.",
        "Search returns results in under 2 seconds for 95% of queries.",
        "Performance is robust.",
        "It is soon going to be better.",
      ],
      answer: 1,
      explain: "Numbers replace vague words and can be tested.",
    },
    {
      kind: "mcq",
      q: "Where should project docs live?",
      options: [
        "Next to the code in version control, updated with changes",
        "Only in someone's memory",
        "In a screenshot",
        "On a personal laptop only",
      ],
      answer: 0,
      explain: "Co-located, versioned docs stay current and reviewable.",
    },
  ],
};
