import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 9,
  difficulty: "Medium",
  objectives: [
    "Structure a status update that executives can act on in a minute",
    "Report risks and bad news early with options",
    "Present results in business terms with a clear ask",
  ],
  tasks: [
    {
      id: "structure",
      title: "The one-minute update",
      body: (
        <>
          <p>
            Executives read dozens of updates a day. They want to know if they need to do anything.
            Use the same structure every time so they learn where to look.
          </p>
          <pre>
            <code>{`Status: GREEN / AMBER / RED  (one word, up front)

Headline: Pilot live with 12 agents; median lookup time down from 38 to 9 minutes.

Progress this week
- Rolled out to Team B (12 agents). SSO enabled.
- Accuracy on 120-case test set: 94% (target 92%).

Risks
- AMBER: Legal review of data retention not started. Needed by 14 Nov for full rollout.
  Option A: Start now with your counsel (owner: J. Lee). Option B: pilot only until review done.

Asks / decisions
- Please confirm Option A by Friday.

Next week
- Train Team C; add monitoring dashboard.`}</code>
          </pre>
          <Callout tone="tip">
            Put status, headline and asks at the top. If a reader gets nothing else, they still
            know how it is going and what you need.
          </Callout>
        </>
      ),
    },
    {
      id: "risks",
      title: "Reporting risks and bad news",
      body: (
        <>
          <ul>
            <li>
              <strong>Early beats perfect.</strong> Raise a risk when you see it, not when it has
              become a miss.
            </li>
            <li>
              <strong>State impact and date:</strong> "Without access by 14 Nov, launch slips two
              weeks."
            </li>
            <li>
              <strong>Bring options and a recommendation</strong>, with trade-offs.
            </li>
            <li>
              <strong>Name an owner</strong> and a decision date for each risk.
            </li>
            <li>
              <strong>Be factual,</strong> not defensive or dramatic. No blame.
            </li>
          </ul>
          <Table
            head={["Status", "Meaning"]}
            rows={[
              ["Green", "On track; no help needed"],
              ["Amber", "Risk to date or scope; plan exists; may need a decision"],
              ["Red", "Off track; needs executive action now"],
            ]}
          />
          <Callout tone="warn">
            Do not stay green until the last minute. A sudden red erodes trust far more than a
            timely amber.
          </Callout>
        </>
      ),
    },
    {
      id: "results",
      title: "Presenting results",
      body: (
        <>
          <ol>
            <li>
              <strong>Start with the outcome</strong> in business language: hours saved, errors
              cut, revenue protected.
            </li>
            <li>
              <strong>Show the before and after</strong> with one chart or number.
            </li>
            <li>
              <strong>Add one user story or quote.</strong> It makes numbers real.
            </li>
            <li>
              <strong>Be honest about limits:</strong> where it fails and how you handle it.
            </li>
            <li>
              <strong>End with a clear ask:</strong> expand to two more teams, approve budget,
              unblock access.
            </li>
          </ol>
          <Table
            head={["Instead of", "Say"]}
            rows={[
              ["F1 improved to 0.91", "It now correctly reads 94 of 100 invoices; staff only review 6"],
              ["Latency p95 is 1.8 s", "Agents get an answer in under two seconds"],
              ["We built a RAG pipeline", "Agents can search every policy in one place, with sources"],
            ]}
          />
          <p>
            Keep one backup slide of technical detail for the engineers in the room, but lead with
            what the audience cares about.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Use a consistent update: status, headline, progress, risks with options, asks, next steps.",
    "Report risks early with impact, owner, date and a recommended option.",
    "Present outcomes in business terms with before and after, a story, honest limits and a clear ask.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Where should the decision you need from an executive appear in a status update?",
      options: [
        "At the top, in a clear ask",
        "Hidden in the last paragraph",
        "Not at all",
        "In an attachment only",
      ],
      answer: 0,
      explain: "Executives scan; make the ask impossible to miss.",
    },
    {
      kind: "mcq",
      q: "A key dependency may slip. What should you do?",
      options: [
        "Wait until it definitely slips",
        "Report it as amber now, with impact, options and a recommendation",
        "Hide it",
        "Blame the other team in the email",
      ],
      answer: 1,
      explain: "Early, factual reporting with options preserves trust and time to act.",
    },
    {
      kind: "mcq",
      q: "Which phrasing suits an executive audience best?",
      options: [
        "F1 score improved 0.04",
        "Staff now review 6 of 100 invoices instead of 40",
        "We refactored the embedding layer",
        "The GPU utilisation increased",
      ],
      answer: 1,
      explain: "It states the outcome in terms of work and impact.",
    },
  ],
};
