import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 9,
  difficulty: "Medium",
  objectives: [
    "Explain the scope, speed and quality trade-off",
    "Decide where to be strict and where to be quick",
    "Negotiate changes without damaging trust",
  ],
  tasks: [
    {
      id: "triangle",
      title: "You cannot maximise all three",
      body: (
        <>
          <p>
            Every project balances <strong>scope</strong> (what is built), <strong>speed</strong>{" "}
            (when it is delivered) and <strong>quality</strong> (how well it works and how
            maintainable it is). Pushing on one pulls on the others. When someone says "more,
            faster, and perfect", the honest answer shows the trade.
          </p>
          <Table
            head={["If the customer wants...", "Then something must give", "Typical move"]}
            rows={[
              ["More features by the same date", "Quality or speed", "Cut scope to the must-haves"],
              ["The date pulled in", "Scope or quality", "Ship a smaller first release"],
              ["Higher quality without moving the date", "Scope", "Fewer features, better tested"],
              ["Everything, by the date, to a high standard", "Resources", "Add people early, or move the date"],
            ]}
          />
        </>
      ),
    },
    {
      id: "where",
      title: "Where to be strict, where to be fast",
      body: (
        <>
          <p>Quality is not uniform. Spend it where mistakes are costly.</p>
          <Table
            head={["Be strict", "Be quick"]}
            rows={[
              ["Anything touching money, safety or personal data", "Internal prototypes and demos"],
              ["Security and permissions", "Cosmetic polish"],
              ["Data correctness and idempotency", "One-off scripts with a clear end date"],
              ["Things hard to change later: data model, public API", "Easy to change: UI copy, thresholds"],
              ["Monitoring and rollback", "Optional reports"],
            ]}
          />
          <Callout tone="note">
            Label prototypes as prototypes, and say what is missing. A demo that quietly becomes
            production is how shortcuts turn into incidents.
          </Callout>
        </>
      ),
    },
    {
      id: "negotiate",
      title: "Negotiating change",
      body: (
        <>
          <ul>
            <li>
              <strong>Say yes with a trade.</strong> "We can add that. It adds about a week, or we
              can swap it with the export feature. Which do you prefer?"
            </li>
            <li>
              <strong>Show the numbers.</strong> Estimates, risks and what each option costs.
            </li>
            <li>
              <strong>Keep a change log.</strong> Every agreed change, who approved it, and its
              effect on date and cost.
            </li>
            <li>
              <strong>Defer, don't dismiss.</strong> Put requests on a visible backlog with a
              proposed phase.
            </li>
            <li>
              <strong>Escalate early.</strong> If the date and scope cannot both hold, tell the
              sponsor as soon as you know, with options.
            </li>
          </ul>
          <Callout tone="tip">
            Customers trust engineers who report bad news early with a plan. Surprises, not delays,
            damage the relationship.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Scope, speed and quality trade against each other; make the trade explicit.",
    "Be strict on money, security, data correctness and hard-to-change decisions; be quick on prototypes and polish.",
    "Say yes with a trade, keep a change log, defer on a visible backlog and escalate early.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "The customer wants an extra feature but the date cannot move. A good response is:",
      options: [
        "Silently add it and cut testing",
        "Offer options: swap it for another feature, move the date, or add resources",
        "Refuse without explanation",
        "Agree and hope",
      ],
      answer: 1,
      explain: "Making the trade visible lets the customer decide with full information.",
    },
    {
      kind: "mcq",
      q: "Where should quality standards be highest?",
      options: [
        "A throwaway demo",
        "Code handling payments and personal data",
        "Button colours",
        "A scratch script deleted tomorrow",
      ],
      answer: 1,
      explain: "Errors in money, privacy and security have the highest cost.",
    },
    {
      kind: "mcq",
      q: "Why keep a change log?",
      options: [
        "It records agreed changes and their impact on date and cost",
        "To look busy",
        "It is required by Git",
        "To avoid communication",
      ],
      answer: 0,
      explain: "A shared record prevents disputes about what was agreed and why dates moved.",
    },
  ],
};
