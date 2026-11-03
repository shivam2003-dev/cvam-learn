import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Medium",
  objectives: [
    "Describe how large organisations actually get work done",
    "Identify the systems, approvals and exceptions around a workflow",
    "Design AI features that fit existing processes instead of replacing them overnight",
  ],
  tasks: [
    {
      id: "how",
      title: "How enterprises work",
      body: (
        <>
          <p>
            A startup decides in a meeting. An enterprise decides through roles, systems and
            controls. Most of your friction will come from this, not from technology.
          </p>
          <Table
            head={["Feature", "What it looks like", "What to do"]}
            rows={[
              ["Specialised roles", "Intake, review, approval, audit each belong to different teams", "Map who does what, and who must sign off"],
              ["Systems of record", "ERP, CRM, ITSM, core banking", "Integrate with them; never create a competing source of truth"],
              ["Controls and audit", "Segregation of duties, approvals, logs", "Keep an audit trail; do not bypass approvals"],
              ["Change management", "Release windows, CAB approvals, freezes", "Plan around them; ask early"],
              ["Procurement and security review", "Vendor assessment, contracts, risk forms", "Prepare documents in advance"],
              ["Exceptions", "Regional rules, special customers, workarounds", "Ask for the top ten exceptions"],
            ]}
          />
        </>
      ),
    },
    {
      id: "workflow",
      title: "Anatomy of a workflow",
      body: (
        <>
          <p>
            Take an accounts-payable process. It looks like "process invoices" but in reality:
          </p>
          <ol>
            <li>Invoice arrives by email, post or portal (many formats).</li>
            <li>A clerk keys it into the ERP and matches it to a purchase order.</li>
            <li>Mismatches go to the buyer; large amounts go to a manager for approval.</li>
            <li>Finance schedules payment; the bank file is released in a batch.</li>
            <li>Audit samples a portion each quarter.</li>
          </ol>
          <p>
            An AI feature could extract fields (step 2), flag mismatches (step 3) and draft emails
            to buyers, while the ERP, approvals and bank steps stay as they are. That is faster to
            ship, easier to approve and measurable.
          </p>
          <Callout tone="tip">
            Insert yourself at one step. Improve the slow, error-prone, repetitive step first and
            leave the controlled steps alone until trust is earned.
          </Callout>
        </>
      ),
    },
    {
      id: "fit",
      title: "Designing to fit",
      body: (
        <>
          <ul>
            <li>
              <strong>Work inside the tools people already use.</strong> A new portal is another
              login; a button inside their ERP gets used.
            </li>
            <li>
              <strong>Keep humans in the loop at first.</strong> Suggest, then confirm, then
              automate when accuracy is proven.
            </li>
            <li>
              <strong>Respect the controls.</strong> Approvals, limits and logs are there for
              reasons; they are not obstacles to engineer around.
            </li>
            <li>
              <strong>Plan for people.</strong> Training, a champion on each team, and a clear
              answer to "what happens to my job?".
            </li>
            <li>
              <strong>Handle the exceptions explicitly.</strong> Route what the system cannot
              handle to a human queue instead of guessing.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Enterprises run on roles, systems of record, controls and change management.",
    "Map the real workflow, including exceptions, then improve one step at a time.",
    "Fit into existing tools, start with human confirmation, respect controls and plan for people.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the best first place to insert AI in an invoice process?",
      options: [
        "Removing all approvals",
        "Extracting fields and flagging mismatches with a human confirming",
        "Replacing the ERP",
        "Releasing payments automatically from day one",
      ],
      answer: 1,
      explain: "It improves a slow repetitive step while keeping controls and approvals intact.",
    },
    {
      kind: "mcq",
      q: "Why integrate with the system of record instead of creating a new one?",
      options: [
        "Two sources of truth lead to conflict and mistrust",
        "It is more fashionable",
        "It avoids all testing",
        "It reduces security checks",
      ],
      answer: 0,
      explain: "The system of record is authoritative; duplicates drift and cause disputes.",
    },
    {
      kind: "mcq",
      q: "A case your system cannot handle confidently should:",
      options: [
        "Be guessed",
        "Go to a human review queue",
        "Be deleted",
        "Be ignored silently",
      ],
      answer: 1,
      explain: "Explicit fallback to humans keeps quality and trust high.",
    },
  ],
};
