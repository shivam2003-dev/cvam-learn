import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Explain what an agent framework provides and what it costs you",
    "Compare building directly on a model SDK with adopting a framework",
    "Evaluate frameworks against criteria that matter in customer deployments",
    "Reduce lock-in with a thin abstraction and standard protocols",
    "Make and document a framework decision",
  ],
  tasks: [
    {
      id: "what",
      title: "What a framework gives you",
      body: (
        <>
          <p>
            An agent framework packages the harness pieces from the previous lessons: the loop, tool
            registration, memory, state, orchestration of multiple agents, tracing hooks and
            integrations. The pitch is speed: you describe agents and tools, and the framework
            handles the plumbing.
          </p>
          <p>
            The cost is that you adopt someone else&apos;s abstractions, release cycle and bugs. The
            field moves fast; frameworks change APIs, merge, or fall out of favour. Because of that,
            this lesson teaches the <em>decision method</em> rather than a ranking, which would be
            out of date quickly.
          </p>

          <Figure caption="Where a framework sits. It wraps the loop, tools and state; you still own the product logic, evaluation and operations.">
            <Layers
              layers={[
                { title: "Your product logic", note: "Prompts, tools, business rules, evaluations, UI. Always yours.", tone: "lime" },
                { title: "Agent framework (optional)", note: "Loop, tool registry, state and memory, multi-agent orchestration, tracing hooks.", tone: "amber" },
                { title: "Model SDK or API", note: "Messages, tool calling, streaming, structured output from a provider.", tone: "sky" },
                { title: "Model", note: "Hosted or self-hosted language model.", tone: "plain" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "sdk",
      title: "Framework or plain SDK code?",
      body: (
        <>
          <p>
            For many customer projects, a short loop on a model SDK is enough. The loop from the
            earlier lesson is about 30 lines. Compare honestly:
          </p>
          <Table
            head={["", "Plain SDK code", "Framework"]}
            rows={[
              ["Setup speed", "Slower at first", "Faster for common patterns"],
              ["Control and debugging", "Full; you read your own code", "Indirect; stack traces pass through the framework"],
              ["Learning curve", "Low (HTTP and a loop)", "Medium to high (concepts, configuration)"],
              ["Multi-agent, state, resume", "You build it", "Often built in"],
              ["Upgrade risk", "Low", "Higher; APIs change, versions conflict"],
              ["Fit for customer handoff", "Customer engineers can read it", "They must also learn the framework"],
              ["Lock-in", "Minimal", "Moderate, in concepts and code shape"],
            ]}
          />
          <pre>
            <code>{`# Plain loop: complete, readable, no framework dependency
def run(goal):
    messages = [system(PROMPT), user(goal)]
    for _ in range(10):
        r = client.messages.create(model=MODEL, messages=messages, tools=TOOLS)
        if not r.tool_calls:
            return r.text
        for call in r.tool_calls:
            messages.append(tool_result(call.id, TOOL_IMPLS[call.name](**call.args)))
    raise RuntimeError("step limit")`}</code>
          </pre>
          <Callout tone="tip" title="A good default">
            Start with plain SDK code for the first slice. Adopt a framework when you hit a concrete
            need it solves well, such as durable multi-step state, human-in-the-loop pauses or complex
            graphs of agents, and when the customer&apos;s team is willing to own it.
          </Callout>
        </>
      ),
    },
    {
      id: "criteria",
      title: "Criteria for choosing",
      body: (
        <>
          <p>
            When you do evaluate frameworks, score them on criteria that matter for a deployment you
            will hand to someone else, not on demo appeal.
          </p>
          <Table
            head={["Criterion", "Questions to ask"]}
            rows={[
              ["Fit with the problem", "Does it model the pattern you need (workflow graph, hand-offs, parallel workers) naturally?"],
              ["Model and provider support", "Does it work with the providers the customer allows, including self-hosted and private endpoints?"],
              ["State and durability", "Can runs pause, resume and survive restarts? Where is state stored?"],
              ["Human in the loop", "Can a run stop for approval and continue afterwards?"],
              ["Observability", "Does it emit standard traces (for example OpenTelemetry) and integrate with your tooling?"],
              ["Testability", "Can you unit-test tools and replay runs with recorded model responses?"],
              ["Maturity and maintenance", "Release cadence, breaking-change history, community size, who backs it"],
              ["Security and deployment", "Licence, dependency footprint, support for restricted networks, supply-chain posture"],
              ["Team skill and handoff", "Can the customer's engineers learn it and operate it?"],
            ]}
          />

          <Figure caption="A decision path. Most projects exit at the first or second box; frameworks earn their place only when a concrete need appears.">
            <Flow
              direction="col"
              numbered
              steps={[
                { title: "Single model call or fixed workflow?", note: "Use plain SDK code and ordinary functions.", tone: "lime" },
                { title: "One agent with a few tools?", note: "Plain loop (about 30 lines) is usually enough.", tone: "lime" },
                { title: "Durable state, approvals or graph-shaped flows needed?", note: "Evaluate a framework against the criteria above.", tone: "amber" },
                { title: "Customer already standardised on one?", note: "Follow their standard unless it blocks the requirement.", tone: "sky" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "lockin",
      title: "Limit lock-in",
      body: (
        <>
          <p>
            Whatever you choose, assume you will change a model, a provider or the framework itself
            within a year. Design so that change is bounded.
          </p>
          <ul>
            <li>
              <strong>Keep tools framework-free.</strong> Write tool logic as ordinary functions with
              typed inputs; wrap them in the framework&apos;s format in one thin adapter.
            </li>
            <li>
              <strong>Own your prompts and evaluations.</strong> Store them in your repository, in
              plain files, so they move with you.
            </li>
            <li>
              <strong>Put model access behind an interface,</strong> so providers can be swapped or
              made configurable per customer.
            </li>
            <li>
              <strong>Use open standards</strong> where available: the Model Context Protocol for
              tool servers, OpenTelemetry for traces, JSON Schema for tool definitions.
            </li>
            <li>
              <strong>Pin versions</strong> and read changelogs before upgrading; run your evaluation
              suite on every upgrade.
            </li>
          </ul>
          <pre>
            <code>{`# Framework-free tool: a typed function. Adapters wrap it for any framework.
def get_order_status(order_id: str) -> dict:
    """Return status and ETA for an order. Raises KeyError if not found."""
    ...

# one thin adapter per framework (kept in adapters/, easy to replace)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "decide",
      title: "Make and record the decision",
      body: (
        <>
          <p>
            Write the decision down as a short record so that the next engineer understands the
            reasoning and can revisit it when conditions change.
          </p>
          <pre>
            <code>{`DECISION 012: Agent implementation approach
Context:   Claims-triage assistant; one agent, 4 tools, human approval before any
           claim status change; deployed in customer's VPC; handoff to their team.
Options:   (A) Plain SDK loop  (B) Framework X  (C) Framework Y
Decision:  (A) for v1.
Why:       Customer engineers can read and run it; no new dependency approvals;
           needs are met by ~60 lines. Approval pause implemented via a status field.
Revisit:   If we add parallel workers or need durable pauses > 24h, evaluate
           a framework against the criteria table (state, HITL, tracing, handoff).`}</code>
          </pre>

          <Exercise
            title="Argue for and against"
            task={
              <p>
                A teammate wants to adopt a popular multi-agent framework for a customer project that
                is a single agent with three read-only tools and an approval step. Give two arguments
                against adopting it now and one condition under which you would change your mind.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Unneeded complexity:</strong> a single agent with three tools is a 30-line
                loop; the framework adds concepts, dependencies and upgrade risk without solving a
                present problem.
              </li>
              <li>
                <strong>Handoff and approval burden:</strong> the customer&apos;s engineers must learn
                and approve a new dependency, which can add weeks to security review, for no gain.
              </li>
            </ol>
            <p>
              <strong>Change my mind if:</strong> the project grows to need durable multi-step state
              that survives restarts, parallel workers, or long human-approval pauses, where
              re-implementing those would cost more than adopting and learning the framework.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A framework packages the harness: loop, tools, state, orchestration and tracing, at the cost of its abstractions and churn.",
    "A basic agent is a short loop; start with plain SDK code and add a framework for a concrete need.",
    "Score frameworks on fit, provider support, state, human-in-the-loop, observability, testability, maturity, security and handoff.",
    "Limit lock-in with framework-free tools, owned prompts and evals, a model interface, open standards and pinned versions.",
    "Record the decision and the conditions that would change it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "For a single agent with three tools, what is usually the best starting point?",
      options: [
        "A plain loop using the model SDK",
        "A large multi-agent framework",
        "A custom compiler",
        "No code at all",
      ],
      answer: 0,
      explain: "The loop is small and readable, and avoids dependencies the customer must approve and learn.",
    },
    {
      kind: "mcq",
      q: "Which design reduces lock-in most?",
      options: [
        "Writing tools as plain typed functions behind a thin adapter",
        "Putting all logic inside framework-specific classes",
        "Storing prompts inside the framework's private format",
        "Using unpinned latest versions",
      ],
      answer: 0,
      explain: "Framework-free tools and owned prompts move with you if you change frameworks.",
    },
    {
      kind: "mcq",
      q: "Which need most justifies adopting a framework?",
      options: [
        "Durable multi-step runs that pause for human approval and resume days later",
        "Wanting something new",
        "Printing a nicer log",
        "A single model call",
      ],
      answer: 0,
      explain: "Durable state and pausing are hard to build well, so a framework may pay for itself there.",
    },
    {
      kind: "mcq",
      q: "Why record framework decisions in a decision log?",
      options: [
        "So future engineers understand the reasoning and when to revisit it",
        "To make the repository larger",
        "It is required by Git",
        "To avoid testing",
      ],
      answer: 0,
      explain: "Context and revisit conditions turn a one-time choice into something others can evaluate later.",
    },
    {
      kind: "text",
      q: "Which open protocol standardises how AI apps connect to tool servers? (three letters)",
      format: "***",
      accept: ["mcp", "model context protocol"],
      explain: "The Model Context Protocol (MCP) lets one tool server be used by many AI clients.",
    },
  ],
};
