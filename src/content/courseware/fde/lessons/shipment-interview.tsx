import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Hard",
  objectives: [
    "Answer interview questions about when and how to use multi-agent systems",
    "Defend design choices on reliability, safety and cost",
    "Explain evaluation and rollout for agents that take actions",
    "Recognise and avoid common weak answers",
  ],
  tasks: [
    {
      id: "q1",
      title: "Question 1: Single agent or several?",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;A freight forwarder wants an AI system to handle shipment disruptions. Would you build one agent or many? Why?&rdquo;</p>}
          >
            <p>
              <strong>Position:</strong> &ldquo;Mostly a workflow, with two narrow agents. I would only
              use multiple agents where they earn their place.&rdquo;
            </p>
            <ul>
              <li><strong>Most steps are not agentic.</strong> Detection, impact rules, cost arithmetic and execution are deterministic and belong in code.</li>
              <li><strong>Two agents are justified:</strong> a route-search agent (open-ended, tool-heavy, needs context isolation from large carrier responses and read-only permissions) and a ranking agent (judgment over options with contract and cost data, no write access).</li>
              <li><strong>Humans approve actions.</strong> A planner approves before any booking, at least initially.</li>
            </ul>
            <p>
              <strong>Risk and measurement:</strong> errors compound across steps, so I would minimise
              the number of model decisions and measure agreement with planners on replayed history.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q2",
      title: "Question 2: Safety of write actions",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;What stops the system from booking something harmful or expensive?&rdquo;</p>}
          >
            <p>
              Layered controls that do not depend on the model behaving:
            </p>
            <ol>
              <li><strong>Separation:</strong> only an executor component can write, and it accepts only an approved plan with a specific option ID.</li>
              <li><strong>Hard constraints in code:</strong> dangerous goods, temperature and customs rules filter options before ranking.</li>
              <li><strong>Limits:</strong> cost and cargo-value ceilings, and automation enabled per lane.</li>
              <li><strong>Re-validation</strong> of price and capacity right before booking.</li>
              <li><strong>Idempotency keys and compensation</strong> for retries and partial failures.</li>
              <li><strong>Audit:</strong> immutable record of who approved what.</li>
            </ol>
            <p>
              <strong>Trade-off:</strong> every control adds friction. I would start with approval on
              everything and relax only where measured accuracy over many cases justifies it, with
              limits that cap the worst case.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q3",
      title: "Questions 3 to 6",
      body: (
        <>
          <Exercise
            title="Question 3: Reliability"
            task={<p>&ldquo;Each step is 95% reliable and the process has ten steps. How do you think about overall reliability?&rdquo;</p>}
          >
            <p>
              Roughly 0.95 to the tenth, about 60%, if failures were independent. It shows why long
              chains disappoint. My remedies: cut steps by replacing model decisions with code where
              the rule is known (several of the ten are), validate after risky steps so errors are
              caught early, make steps resumable so a failure retries one step, and keep a person at
              the highest-cost decision. I would measure end-to-end success on replayed cases, not just
              per-step accuracy.
            </p>
          </Exercise>
          <Exercise
            title="Question 4: Evaluation"
            task={<p>&ldquo;How do you evaluate an agent whose output is a plan, not a single answer?&rdquo;</p>}
          >
            <p>
              Several layers: replay historical disruptions and compare the ranked plans with what
              planners chose (agreement, cost difference); constraint tests where the cheapest option
              is infeasible; simulation of carrier failures and bad data; adversarial tests with
              injected text; and a shadow period where the system runs alongside planners. Track
              acceptance rate of recommendations, time to approved plan, cost versus best-known
              afterwards, and zero infeasible plans reaching approval.
            </p>
          </Exercise>
          <Exercise
            title="Question 5: Stale data"
            task={<p>&ldquo;The carrier&apos;s schedule data is sometimes hours old. What do you do?&rdquo;</p>}
          >
            <p>
              Make freshness explicit: record a <code>fetched_at</code> with each option and show it
              to the planner. Re-fetch the chosen option immediately before execution and reject or
              return to the planner if capacity or price changed beyond a tolerance. Prefer live carrier
              APIs over cached data for the final check, and monitor how often re-validation fails to
              detect unhealthy data sources.
            </p>
          </Exercise>
          <Exercise
            title="Question 6: Customer wants full autonomy"
            task={<p>&ldquo;After the pilot the VP says: remove the approval step, it slows us down.&rdquo;</p>}
          >
            <p>
              Acknowledge the goal and respond with evidence and a path. &ldquo;Approval time is the
              biggest part of the delay, so I understand. Over the pilot, planners accepted 78% of
              recommendations unchanged on low-value domestic lanes and zero violations occurred. I
              propose enabling automatic execution there only, with cost ceilings and daily review,
              while keeping approval for international and high-value cargo. We expand lane by lane as
              the data supports it.&rdquo; The key moves are using measured data, limiting scope, and
              keeping a cap on the worst case.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "weak",
      title: "Strong versus weak answers",
      body: (
        <>
          <DiagramReference lesson="shipment-interview" panel={1} />
          <Table
            head={["Weak", "Why it fails", "Better"]}
            rows={[
              ["'Multi-agent is more powerful'", "No justification; ignores cost and compounding errors", "State concrete reasons: permissions, isolation, parallelism"],
              ["'The model will handle edge cases'", "Unverifiable; unsafe for actions", "Enumerate edge cases, enforce constraints in code, test them"],
              ["'Add a human in the loop'", "Stops there", "Say where, what they see, and how approval is recorded and measured"],
              ["Skips cost and latency", "Ignores business reality", "Estimate cost per disruption and the time budget"],
              ["No rollout plan", "Jumps to full autonomy", "Advise, recommend, then act on low-risk lanes"],
            ]}
          />
          <Callout tone="tip" title="Use the numbers">
            Whenever you can, attach a number: expected time saved, a reliability estimate, a cost per
            run, an acceptance rate target. Numbers signal that you will measure the system rather than
            hope.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Most of a disruption system is code; justify each agent by permissions, isolation or parallelism.",
    "Protect write actions with separation, hard constraints, limits, re-validation, idempotency and audit.",
    "Reason about compounding reliability and reduce model decisions, add checkpoints and keep humans where cost is highest.",
    "Evaluate plans with replay, simulation, constraint, adversarial and shadow testing.",
    "When asked to remove approvals, respond with measured evidence and a lane-by-lane path.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A ten-step process has 95% reliability per step. Roughly what is end-to-end success if failures are independent?",
      options: ["About 60%", "About 95%", "About 99%", "About 10%"],
      answer: 0,
      explain: "0.95 to the tenth power is about 0.60.",
    },
    {
      kind: "mcq",
      q: "Which answer shows the best judgment about removing human approval?",
      options: [
        "Offer to enable automation on low-risk lanes with limits, backed by pilot data",
        "Refuse permanently",
        "Remove it everywhere immediately",
        "Say the model is smart enough",
      ],
      answer: 0,
      explain: "Evidence-based, scoped expansion with limits balances speed and safety.",
    },
    {
      kind: "mcq",
      q: "How should stale carrier data be handled before booking?",
      options: [
        "Re-fetch and re-validate the chosen option, rejecting if it changed beyond tolerance",
        "Ignore it",
        "Book anyway and fix later",
        "Delete the shipment",
      ],
      answer: 0,
      explain: "A final live check protects against acting on outdated information.",
    },
    {
      kind: "mcq",
      q: "Which is a strong reason to use a separate agent?",
      options: [
        "It needs different permissions from other roles",
        "It sounds modern",
        "Agents are cheaper per token",
        "It reduces testing",
      ],
      answer: 0,
      explain: "Least-privilege separation limits damage from errors or injected instructions.",
    },
    {
      kind: "text",
      q: "Shadow mode compares recommendations with planners' decisions after they decide. What is the key benefit? (one word)",
      format: "******",
      accept: ["safety", "safe", "evidence", "safely"],
      explain: "It produces real-world evidence without any risk of acting on the recommendations.",
    },
  ],
};
