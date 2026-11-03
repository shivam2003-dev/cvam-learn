import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Classify data and decide what may be sent to a model",
    "Explain core privacy principles and the regulations customers ask about",
    "Set up practical AI governance: ownership, risk review, human oversight and logging",
  ],
  tasks: [
    {
      id: "data",
      title: "Know your data before you move it",
      body: (
        <>
          <p>
            Before any customer data reaches a model, pipeline or laptop, find out what kind it is
            and what rules apply.
          </p>
          <Table
            head={["Class", "Examples", "Typical handling"]}
            rows={[
              ["Public", "Published docs, marketing", "Free to use"],
              ["Internal", "Policies, non-sensitive reports", "Approved tools only"],
              ["Confidential", "Contracts, pricing, source code", "Restricted access, approved providers"],
              ["Personal data (PII)", "Names, emails, IDs, location", "Minimise, mask, lawful basis"],
              ["Special / regulated", "Health, financial, children's data", "Strict controls, often on-premise or dedicated regions"],
            ]}
          />
          <ul>
            <li>
              <strong>Minimise.</strong> Send the fields the task needs, nothing more.
            </li>
            <li>
              <strong>Mask or pseudonymise</strong> names and IDs before prompts where possible.
            </li>
            <li>
              <strong>Check provider terms:</strong> retention, training on your data, region, sub-processors.
            </li>
            <li>
              <strong>Use test data</strong> for development; real data only in approved
              environments.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "rules",
      title: "Rules customers will ask about",
      body: (
        <>
          <Table
            head={["Framework", "Covers", "What it means for you"]}
            rows={[
              ["GDPR (EU/UK)", "Personal data of people in the EU", "Lawful basis, access and deletion rights, DPAs, cross-border limits"],
              ["CCPA / CPRA (California)", "Consumer data", "Disclosure, opt-out and deletion rights"],
              ["HIPAA (US)", "Protected health information", "BAAs, access control, audit logs"],
              ["SOC 2 / ISO 27001", "Security management of a provider", "Evidence of controls; customers request reports"],
              ["EU AI Act", "Risk-based rules for AI systems", "Higher duties for high-risk uses; transparency"],
              ["NIST AI RMF", "Voluntary AI risk framework", "A structure for mapping and managing AI risk"],
            ]}
          />
          <Callout tone="note">
            You are not a lawyer. Learn the vocabulary so you can ask the right questions, and
            involve the customer's privacy and legal teams early. Do not promise compliance you
            cannot evidence.
          </Callout>
        </>
      ),
    },
    {
      id: "governance",
      title: "Practical AI governance",
      body: (
        <>
          <ul>
            <li>
              <strong>Name an owner</strong> for each AI system and each decision it influences.
            </li>
            <li>
              <strong>Document intent and limits:</strong> purpose, data used, known failure modes,
              what it must not do.
            </li>
            <li>
              <strong>Assess risk</strong> by impact. Drafting an email is low; denying a claim is
              high.
            </li>
            <li>
              <strong>Keep a human in the loop</strong> for consequential decisions, with the
              ability to review and override.
            </li>
            <li>
              <strong>Test for bias and safety</strong> on relevant groups and misuse cases.
            </li>
            <li>
              <strong>Log and retain</strong> inputs, outputs, versions and approvals for audit,
              within retention rules.
            </li>
            <li>
              <strong>Plan for incidents:</strong> how to pause the system, notify, and fix.
            </li>
          </ul>
          <Callout tone="tip">
            A one-page "model card" per system (purpose, data, evals, limits, owner, contact) is
            cheap, and security reviewers love it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Classify data first; minimise, mask and check provider terms before sending it to a model.",
    "Know GDPR, HIPAA, SOC 2, the EU AI Act and NIST AI RMF well enough to ask good questions.",
    "Governance means owners, documented limits, risk tiers, human oversight, bias tests and audit logs.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which practice best reduces privacy risk when prompting a model with customer records?",
      options: [
        "Send the full database",
        "Send only needed fields and mask identifiers",
        "Email the records",
        "Ignore the provider's retention terms",
      ],
      answer: 1,
      explain: "Data minimisation and masking limit exposure if anything leaks or is retained.",
    },
    {
      kind: "mcq",
      q: "A system helps decide whether insurance claims are denied. Governance should:",
      options: [
        "Keep a human able to review and override decisions",
        "Skip logging",
        "Hide the model from auditors",
        "Treat it as low risk",
      ],
      answer: 0,
      explain: "Consequential decisions need human oversight and an audit trail.",
    },
    {
      kind: "mcq",
      q: "Which regulation covers protected health information in the US?",
      options: ["HIPAA", "GDPR", "SOC 2", "NIST AI RMF"],
      answer: 0,
      explain: "HIPAA governs protected health information handled by covered entities and their business associates.",
    },
  ],
};
