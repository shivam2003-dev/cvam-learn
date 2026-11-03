import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Medium",
  objectives: [
    "Cut a project into thin end-to-end slices",
    "Order work by value, risk and dependency",
    "Define a first milestone that proves the idea within weeks",
  ],
  tasks: [
    {
      id: "slice",
      title: "Slice thin and vertical",
      body: (
        <>
          <p>
            A big plan fails on the first surprise. Cut the work into <strong>vertical slices</strong>:
            each one goes through every layer (data in, logic, interface, output) for one narrow
            case, instead of building layers one by one.
          </p>
          <Table
            head={["Horizontal (risky)", "Vertical (better)"]}
            rows={[
              ["Build all connectors, then all models, then the UI", "Handle one invoice type end to end, then add types"],
              ["Perfect the data pipeline first", "Pipe one source, produce one answer, show it to a user"],
              ["Months before anyone sees anything", "A working demo in the first two weeks"],
            ]}
          />
          <Callout tone="tip">
            A thin slice that touches real data, real systems and a real user surfaces the hard
            problems early, when they are cheap to fix.
          </Callout>
        </>
      ),
    },
    {
      id: "order",
      title: "Sequence by value, risk and dependency",
      body: (
        <>
          <ul>
            <li>
              <strong>Value.</strong> What moves the customer's key metric most?
            </li>
            <li>
              <strong>Risk.</strong> What is most likely to kill the project: data access,
              accuracy, security approval? Do those <em>first</em>.
            </li>
            <li>
              <strong>Dependency.</strong> What must exist before something else can start?
              Start long lead items (access, firewall rules, procurement) on day one.
            </li>
            <li>
              <strong>Effort.</strong> Prefer cheap wins to build trust.
            </li>
          </ul>
          <Table
            head={["Item", "Value", "Risk", "Effort", "Order"]}
            rows={[
              ["Get read access to policy store", "Enabler", "High", "Low", "1 (start now)"],
              ["Search over 50 policies, one team", "High", "Medium", "Low", "2"],
              ["Cite sources in answers", "High", "Low", "Low", "3"],
              ["Roll out to all 40 agents", "High", "Medium", "Medium", "4"],
              ["Auto-draft customer replies", "Medium", "High", "High", "Later"],
            ]}
          />
        </>
      ),
    },
    {
      id: "milestones",
      title: "Milestones that prove something",
      body: (
        <>
          <ol>
            <li>
              <strong>Week 1 to 2: feasibility.</strong> Access works; a rough end-to-end answer
              exists on real data.
            </li>
            <li>
              <strong>Week 3 to 4: pilot.</strong> A few real users, measured against the
              baseline.
            </li>
            <li>
              <strong>Week 5 to 8: harden and expand.</strong> Security review, monitoring,
              training, wider rollout.
            </li>
            <li>
              <strong>Then: handover and review.</strong> Runbook, owners, results report.
            </li>
          </ol>
          <Callout tone="warn">
            Add buffer for the customer's processes: approvals, holidays, access requests. They
            often take longer than the coding.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Build thin vertical slices on real data rather than layer by layer.",
    "Do risky and long-lead items first; weigh value, risk, dependency and effort.",
    "Plan feasibility, pilot, hardening and handover milestones, with buffer for customer processes.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why tackle the riskiest assumption first?",
      options: [
        "To fail early and cheaply if it is false",
        "Because risk is fun",
        "To delay delivery",
        "It lowers costs automatically",
      ],
      answer: 0,
      explain: "If the riskiest piece fails, you want to know before investing in everything else.",
    },
    {
      kind: "mcq",
      q: "Which is a vertical slice?",
      options: [
        "Build the entire database layer first",
        "Process one document type end to end and show the result to a user",
        "Design every screen before coding",
        "Write all documentation first",
      ],
      answer: 1,
      explain: "A vertical slice touches every layer for a narrow case, giving real feedback quickly.",
    },
    {
      kind: "mcq",
      q: "When should you request firewall changes and access for a project?",
      options: ["Day one", "After the demo", "After launch", "Never"],
      answer: 0,
      explain: "Long lead items should start immediately so they do not block later milestones.",
    },
  ],
};
