import { Callout, Formula, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Hard",
  objectives: [
    "Decide whether a problem needs one agent, a workflow, or several agents",
    "Recognise the main orchestration patterns: pipeline, router, orchestrator-workers, parallel, critic and hand-off",
    "Design contracts between agents so errors do not propagate silently",
    "Estimate how reliability compounds across steps and agents",
    "Apply a checklist of reasons that justify the added complexity",
  ],
  tasks: [
    {
      id: "when",
      title: "Do you need more than one agent?",
      body: (
        <>
          <p>
            Multi-agent systems are fashionable, and often overbuilt. Each extra agent adds tokens,
            latency, integration points and ways to fail. The default should be the simplest design
            that works: a single model call, then a fixed workflow, then one agent with tools, and
            only then several agents.
          </p>
          <Table
            head={["Reason", "Valid?", "Why"]}
            rows={[
              ["Context isolation: a worker reads 50 pages and returns a summary", "Yes", "Keeps the lead agent's context small and focused"],
              ["Parallel work on independent sub-tasks", "Yes", "Reduces elapsed time"],
              ["Different permissions per role (read-only vs can-send)", "Yes", "Limits blast radius and aids security"],
              ["Different skills needing different prompts and tools", "Sometimes", "Only if one prompt becomes unmanageable"],
              ["It feels more like a team", "No", "Metaphor is not a requirement"],
              ["The single prompt is long", "Not yet", "Tidy the prompt and tools first"],
            ]}
          />
          <Callout tone="tip" title="Start with a workflow">
            Many tasks have steps you can fix in advance. A deterministic chain of model calls with
            code between them is easier to test, cheaper and more predictable than agents that decide
            their own route. Use agents only for the parts where the route truly is unknown.
          </Callout>
        </>
      ),
    },
    {
      id: "patterns",
      title: "The core patterns",
      body: (
        <>
          <p>Most multi-agent designs are combinations of a handful of shapes.</p>

          <h3>1. Pipeline (prompt chaining)</h3>
          <p>
            Each step feeds the next in a fixed order, with a check between steps. Use it when the
            task splits cleanly (extract, then validate, then draft).
          </p>
          <Figure caption="Pipeline: a fixed sequence with a gate between steps. Predictable and easy to test.">
            <Graph
              label="Pipeline: extract, validate gate, draft, review"
              cellW={176}
              cellH={84}
              nodeW={140}
              nodes={[
                { id: "a", label: "Extract", col: 0, row: 0, tone: "sky" },
                { id: "g", label: "Gate", sub: "Schema + rules", col: 1, row: 0, tone: "rose", shape: "pill" },
                { id: "b", label: "Draft", col: 2, row: 0, tone: "lime" },
                { id: "c", label: "Review", col: 3, row: 0, tone: "amber" },
              ]}
              edges={[
                { from: "a", to: "g" },
                { from: "g", to: "b", label: "pass" },
                { from: "b", to: "c" },
              ]}
            />
          </Figure>

          <h3>2. Router</h3>
          <p>
            A cheap first step classifies the request and sends it to a specialised path. Each path
            has a short, focused prompt and its own tools.
          </p>
          <Figure caption="Router: classify, then dispatch. Each branch is simple and testable on its own.">
            <Graph
              label="Router sends requests to billing, technical or general handlers"
              cellW={186}
              cellH={84}
              nodeW={150}
              nodes={[
                { id: "in", label: "Request", col: 0, row: 1, tone: "plain", shape: "pill" },
                { id: "r", label: "Router", sub: "Cheap classifier", col: 1, row: 1, tone: "amber" },
                { id: "b", label: "Billing agent", col: 2.4, row: 0, tone: "lime" },
                { id: "t", label: "Technical agent", col: 2.4, row: 1, tone: "lime" },
                { id: "g", label: "General agent", col: 2.4, row: 2, tone: "lime" },
              ]}
              edges={[
                { from: "in", to: "r" },
                { from: "r", to: "b", label: "billing" },
                { from: "r", to: "t", label: "technical" },
                { from: "r", to: "g", label: "other" },
              ]}
            />
          </Figure>

          <h3>3. Orchestrator and workers</h3>
          <p>
            A lead agent plans, delegates sub-tasks to worker agents, and combines their results.
            Useful when sub-tasks cannot be predicted in advance, such as researching an open
            question.
          </p>
          <Figure caption="Orchestrator-workers: the lead plans and synthesises; workers run in isolated contexts and return short results.">
            <Graph
              label="An orchestrator delegating to three workers and combining the results"
              cellW={186}
              cellH={84}
              nodeW={150}
              nodes={[
                { id: "o", label: "Orchestrator", sub: "Plan, delegate, merge", col: 0.5, row: 1, tone: "amber", w: 170 },
                { id: "w1", label: "Worker: search", col: 2.4, row: 0, tone: "lime" },
                { id: "w2", label: "Worker: read", col: 2.4, row: 1, tone: "lime" },
                { id: "w3", label: "Worker: analyse", col: 2.4, row: 2, tone: "lime" },
              ]}
              edges={[
                { from: "o", to: "w1" },
                { from: "o", to: "w2" },
                { from: "o", to: "w3" },
                { from: "w1", to: "o", dashed: true, bend: 14 },
              ]}
            />
          </Figure>

          <h3>4. Parallel fan-out and merge</h3>
          <p>
            Independent calls run at the same time and a final step merges them: for example,
            reviewing a contract section by section, or running several checks. It reduces elapsed
            time, not cost.
          </p>

          <h3>5. Critic (evaluator-optimiser)</h3>
          <p>
            One agent produces; another checks against explicit criteria; they loop until the
            criteria pass or a limit is reached. It works best when the check is concrete (tests
            pass, schema validates, figures match the source).
          </p>

          <h3>6. Hand-off</h3>
          <p>
            One agent transfers the conversation, with context, to another that owns the next phase,
            such as from a triage agent to a specialist. The risk is losing context in the transfer.
          </p>
        </>
      ),
    },
    {
      id: "contracts",
      title: "Contracts between agents",
      body: (
        <>
          <p>
            Agents pass text to each other, and text loses detail and carries mistakes. A wrong claim
            from a worker becomes a fact in the lead&apos;s context. Treat every agent boundary like
            an API boundary: define the contract.
          </p>
          <pre>
            <code>{`// A worker's output contract: structured, with evidence and a confidence.
{
  "task_id": "t-12",
  "status": "done" | "failed" | "needs_input",
  "findings": [
    {"claim": "Supplier X was late on 4 of 10 orders",
     "evidence": ["PO-1182", "PO-1190"], "confidence": "medium"}
  ],
  "open_questions": ["Is the March backlog included?"]
}`}</code>
          </pre>
          <ul>
            <li>
              <strong>Use structured outputs</strong> between agents, validated by code, not
              free-form chat.
            </li>
            <li>
              <strong>Pass evidence, not just conclusions,</strong> so claims can be checked.
            </li>
            <li>
              <strong>Let agents say &ldquo;I don&apos;t know&rdquo;</strong> or ask for input,
              instead of forcing an answer.
            </li>
            <li>
              <strong>Give each agent a narrow brief,</strong> a defined output and a stop rule.
            </li>
            <li>
              <strong>Verify key claims</strong> with a second source or deterministic check before
              acting on them.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "reliability",
      title: "Reliability compounds against you",
      body: (
        <>
          <p>
            If each step in a chain succeeds independently with probability <code>p</code>, an{" "}
            <code>n</code>-step task succeeds with:
          </p>
          <Formula>P(success) = p ^ n</Formula>
          <pre>
            <code>{`p = 0.95 per step
  5 steps:  0.95^5  = 0.774   (77%)
 10 steps:  0.95^10 = 0.599   (60%)
 20 steps:  0.95^20 = 0.358   (36%)

p = 0.99 per step
 20 steps:  0.99^20 = 0.818   (82%)`}</code>
          </pre>
          <p>
            Real steps are not fully independent, so treat this as an intuition, not a prediction. It
            explains why long agent chains feel unreliable even when each step looks good, and it
            points to the remedies:
          </p>
          <ul>
            <li>Reduce steps: replace model decisions with code wherever the rule is known.</li>
            <li>Raise per-step reliability: clearer tools, validation, examples, a stronger model for hard steps.</li>
            <li>Add checkpoints that catch errors early, such as schema checks and tests.</li>
            <li>Make steps resumable so a failure retries one step, not the whole task.</li>
            <li>Keep a person in the loop at the points with the highest cost of error.</li>
          </ul>

          <Exercise
            title="Design the shape"
            task={
              <p>
                A logistics customer wants a system that, when a shipment is delayed, checks the
                carrier status, finds alternative routes, estimates the cost of each, and proposes the
                best option to a planner for approval. Choose patterns and say which steps should be
                code rather than agents.
              </p>
            }
          >
            <p>
              <strong>Shape:</strong> a pipeline with a small orchestrator-workers step.
            </p>
            <ol>
              <li>
                <strong>Code:</strong> receive the delay event, look up the shipment and its
                constraints (deterministic).
              </li>
              <li>
                <strong>Workers (parallel):</strong> query carrier APIs for routes, in isolated
                contexts, each returning a structured option list. Mostly tool calls, little
                reasoning.
              </li>
              <li>
                <strong>Code:</strong> compute cost and delivery time for each option with a pricing
                function. Do not ask a model to do arithmetic.
              </li>
              <li>
                <strong>Model:</strong> rank options against business rules and write a short
                recommendation with its reasoning.
              </li>
              <li>
                <strong>Human approval:</strong> the planner confirms before any booking is made.
              </li>
            </ol>
            <p>
              Only the ranking and explanation genuinely need a model. Everything else is better as
              code, which cuts steps and raises reliability.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Prefer the simplest design: single call, workflow, single agent, then multiple agents.",
    "Valid reasons for several agents: context isolation, parallelism, different permissions, distinct skills.",
    "Core patterns are pipeline, router, orchestrator-workers, parallel fan-out, critic and hand-off.",
    "Treat agent boundaries as API contracts: structured outputs, evidence, an 'I don't know' option, verification.",
    "Reliability compounds as p to the n; cut steps, validate early and keep humans at high-risk points.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which is a valid reason to split work across agents?",
      options: [
        "A worker can read many pages and return a short summary, keeping the lead's context clean",
        "Having more agents looks impressive",
        "Agents are always cheaper",
        "A long prompt is always a sign you need more agents",
      ],
      answer: 0,
      explain: "Context isolation is a concrete benefit. The other reasons do not justify the added complexity.",
    },
    {
      kind: "mcq",
      q: "A cheap first call classifies an incoming message and sends it to billing, technical or general handlers. Which pattern is this?",
      options: ["Router", "Critic", "Hand-off", "Parallel fan-out"],
      answer: 0,
      explain: "A router classifies the input and dispatches it to a specialised path.",
    },
    {
      kind: "mcq",
      q: "Why should agents exchange structured, validated output instead of free text?",
      options: [
        "Errors and lost detail in free text propagate as facts",
        "JSON is shorter",
        "Free text is illegal",
        "Models cannot read text",
      ],
      answer: 0,
      explain: "Structured contracts with evidence let code verify claims and stop mistakes spreading.",
    },
    {
      kind: "mcq",
      q: "Cost calculations for route options should be done by:",
      options: [
        "Deterministic code",
        "The model, since it is smart",
        "A guess",
        "The planner by hand every time",
      ],
      answer: 0,
      explain: "Arithmetic and rules belong in code, which is exact and cheap. Use the model for judgment and language.",
    },
    {
      kind: "text",
      q: "Each step succeeds with probability 0.9. What is the success chance of a 3-step task as a whole percentage?",
      format: "**",
      accept: ["73", "73%", "72.9", "72.9%", "0.729"],
      explain: "0.9 x 0.9 x 0.9 = 0.729, about 73%.",
    },
  ],
};
