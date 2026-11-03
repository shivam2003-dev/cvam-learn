import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Distinguish a workflow from an agent and choose the simpler one first",
    "Describe common agent architectures: ReAct, plan and execute, routing, orchestrator-workers",
    "Know when a multi-agent design is justified",
    "Add human approval and limits to agents that act in customer systems",
  ],
  tasks: [
    {
      id: "what",
      title: "Workflows vs agents",
      body: (
        <>
          <p>
            An <strong>agent</strong> is a model in a loop with tools: it decides what to do next,
            calls a tool, reads the result, and repeats until done. A <strong>workflow</strong> is
            a fixed sequence your code controls, with model calls inside steps.
          </p>
          <Table
            head={["", "Workflow", "Agent"]}
            rows={[
              ["Who picks the next step", "Your code", "The model"],
              ["Predictability", "High", "Lower"],
              ["Cost and latency", "Lower", "Higher"],
              ["Good for", "Known process: extract, validate, route, write back", "Open-ended tasks with unknown steps"],
            ]}
          />
          <Callout tone="tip">
            Most enterprise automation is a workflow with one or two smart steps. Reach for a free
            agent only when the path really cannot be known ahead of time.
          </Callout>
        </>
      ),
    },
    {
      id: "patterns",
      title: "Common architectures",
      body: (
        <>
          <ul>
            <li>
              <strong>Prompt chaining.</strong> Output of one call feeds the next. Add checks
              between steps.
            </li>
            <li>
              <strong>Routing.</strong> A cheap call classifies the request and sends it to a
              specialised prompt or tool set.
            </li>
            <li>
              <strong>ReAct.</strong> Think, act with a tool, observe the result, repeat.
            </li>
            <li>
              <strong>Plan and execute.</strong> Write a plan first, then run steps and re-plan on
              failure. Keeps long tasks on track.
            </li>
            <li>
              <strong>Orchestrator and workers.</strong> A lead agent splits work and delegates to
              workers that return short results.
            </li>
            <li>
              <strong>Evaluator loop.</strong> One call drafts, another checks against concrete
              criteria, repeat.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "multi",
      title: "Multi-agent systems",
      body: (
        <>
          <p>
            Several agents can help when you need <strong>context isolation</strong> (a worker
            reads fifty pages and returns a summary), <strong>parallel work</strong>,{" "}
            <strong>different permissions</strong> (one reads the database, another sends email),
            or <strong>different specialities</strong>.
          </p>
          <p>
            They also add tokens, latency and places for errors to compound. If each step succeeds
            with probability <code>p</code>, an <code>n</code>-step task succeeds with:
          </p>
          <Formula>P(success) = p ^ n</Formula>
          <p>At p = 0.95 and n = 10 that is about 60%. Fewer, checked steps beat many clever ones.</p>
        </>
      ),
    },
    {
      id: "safe",
      title: "Agents that touch customer systems",
      body: (
        <>
          <ul>
            <li>
              <strong>Least privilege.</strong> Give each tool the narrowest permission that works;
              prefer read-only.
            </li>
            <li>
              <strong>Human approval</strong> before irreversible actions: sending money, deleting
              records, emailing customers.
            </li>
            <li>
              <strong>Limits.</strong> Cap steps, tokens, time and spend per run.
            </li>
            <li>
              <strong>Audit trail.</strong> Log every thought, tool call and result with a run ID.
            </li>
            <li>
              <strong>Dry-run mode</strong> that shows what the agent would do without doing it.
            </li>
          </ul>
          <Callout tone="warn">
            An agent that can read untrusted text and take actions is exposed to prompt injection.
            Keep the dangerous tools behind approval or a separate, restricted agent.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A workflow's steps are chosen by code; an agent's by the model. Prefer workflows.",
    "Routing, chaining, ReAct, plan and execute, orchestrator-workers and evaluator loops are the core patterns.",
    "Add agents only for isolation, parallelism, permissions or specialisation; errors compound as p^n.",
    "Use least privilege, human approval, hard limits, audit logs and dry runs.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A process always runs extract, validate, then write to the CRM. What should you build?",
      options: ["A workflow", "A free-running multi-agent swarm", "Nothing", "A bigger model only"],
      answer: 0,
      explain: "A known sequence is a workflow; model calls handle the fuzzy steps inside.",
    },
    {
      kind: "mcq",
      q: "Which action most clearly needs a human approval step?",
      options: [
        "Summarising a document",
        "Issuing a refund to a customer",
        "Reading a public web page",
        "Counting words",
      ],
      answer: 1,
      explain: "Money movement is hard to reverse, so require approval.",
    },
    {
      kind: "text",
      q: "Each step succeeds with probability 0.9, independently. What is the success chance of a 2-step task as a whole percentage?",
      format: "**",
      accept: ["81", "81%", "0.81"],
      explain: "0.9 x 0.9 = 0.81, which is 81%.",
    },
  ],
};
