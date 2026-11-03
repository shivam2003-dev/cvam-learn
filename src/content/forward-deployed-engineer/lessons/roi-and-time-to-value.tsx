import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Calculate ROI and payback period for an AI project",
    "Choose metrics that link technical results to business outcomes",
    "Shorten time-to-value with early, visible wins",
  ],
  tasks: [
    {
      id: "roi",
      title: "ROI in plain arithmetic",
      body: (
        <>
          <p>
            Executives fund projects that pay back. You do not need finance training, only honest
            arithmetic with assumptions written down.
          </p>
          <Formula>ROI = (annual benefit - annual cost) / annual cost</Formula>
          <Formula>Payback period (months) = one-time cost / monthly net benefit</Formula>
          <pre>
            <code>{`Example: support policy search
Agents: 40            Escalations/agent/day: 6      Working days/year: 230
Time saved/escalation: 12 minutes
Hours saved/year = 40 x 6 x 230 x 12 / 60 = 11,040 hours
Loaded cost/hour: $35
Annual benefit   = 11,040 x $35 = $386,400

Cost: build $90,000 one-time; run $60,000/year (cloud + model + support)
Year-1 net  = 386,400 - 60,000 - 90,000 = $236,400
ROI (year 1)= 236,400 / 150,000 = 1.58 (158%)
Monthly net benefit = (386,400 - 60,000)/12 = $27,200
Payback     = 90,000 / 27,200 = about 3.3 months`}</code>
          </pre>
          <Callout tone="warn">
            Time saved is not money saved unless it is redeployed or avoids hiring. Say which. Be
            conservative, show ranges, and let the customer's finance team set the loaded cost.
          </Callout>
        </>
      ),
    },
    {
      id: "metrics",
      title: "Link technical metrics to business metrics",
      body: (
        <>
          <Table
            head={["Technical metric", "Business metric it supports"]}
            rows={[
              ["Extraction accuracy 96%", "Fewer manual corrections, hours saved"],
              ["Median answer latency 2 s", "Agent handle time"],
              ["Auto-resolution rate 35%", "Tickets avoided, cost per ticket"],
              ["Hallucination rate under 2%", "Risk of wrong customer advice"],
              ["Uptime 99.9%", "Staff can rely on it daily"],
            ]}
          />
          <ul>
            <li>Measure a <strong>baseline</strong> before you change anything.</li>
            <li>Use the customer's own metric where possible, not a new invented one.</li>
            <li>Track adoption: a perfect tool nobody uses has zero ROI.</li>
            <li>Include cost per task, so scaling does not surprise anyone.</li>
          </ul>
        </>
      ),
    },
    {
      id: "ttv",
      title: "Time-to-value",
      body: (
        <>
          <p>
            <strong>Time-to-value</strong> is how long until the customer sees a real benefit.
            Shorter is almost always better: it builds trust, funds the next phase, and protects
            against priorities changing.
          </p>
          <ul>
            <li>
              <strong>Define the "first value moment"</strong> with the customer: one user gets one
              answer faster.
            </li>
            <li>
              <strong>Pre-work access and security</strong> in parallel with building.
            </li>
            <li>
              <strong>Use their data from week one</strong> to avoid a demo-to-reality gap.
            </li>
            <li>
              <strong>Ship a small pilot</strong> to a friendly team and publish the early numbers.
            </li>
            <li>
              <strong>Remove friction:</strong> SSO, a short guide, a named contact.
            </li>
          </ul>
          <Callout tone="tip">
            Send a one-line weekly metric: "Median lookup time: 38 min before, 9 min this week".
            Visible movement beats any slide.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "ROI = (benefit - cost) / cost; payback = one-time cost / monthly net benefit; write down assumptions.",
    "Tie accuracy, latency and resolution rates to business outcomes and measure a baseline first.",
    "Shorten time-to-value with a defined first value moment, parallel pre-work and a pilot with real data.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A project costs $120,000 one-time and returns $10,000 net per month. What is the payback period in months?",
      format: "**",
      accept: ["12", "12 months"],
      explain: "120,000 / 10,000 = 12 months.",
    },
    {
      kind: "mcq",
      q: "Why measure a baseline before launching?",
      options: [
        "To prove improvement against the starting point",
        "To delay launch",
        "It is optional decoration",
        "To reduce adoption",
      ],
      answer: 0,
      explain: "Without a baseline you cannot show the change you caused.",
    },
    {
      kind: "mcq",
      q: "Which action most directly shortens time-to-value?",
      options: [
        "Building every feature before showing anything",
        "Piloting with one team on real data early",
        "Waiting for all approvals before starting",
        "Using only synthetic data",
      ],
      answer: 1,
      explain: "An early pilot on real data gets benefits and evidence sooner.",
    },
  ],
};
