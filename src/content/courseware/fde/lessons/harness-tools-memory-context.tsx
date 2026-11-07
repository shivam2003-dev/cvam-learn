import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Hard",
  objectives: [
    "Define the agent harness: everything around the model that makes an agent useful and safe",
    "Design tools with clear names, schemas, descriptions and error messages",
    "Distinguish working context, session state and long-term memory, and manage each",
    "Budget the context window and keep the right information in it",
    "Implement the basic agent loop and know its stopping conditions",
  ],
  tasks: [
    {
      id: "harness",
      title: "The model is not the agent",
      body: (
        <>
          <p>
            People often say &ldquo;the agent&rdquo; when they mean the model. In practice, an agent
            is a model inside a <strong>harness</strong>: the code that feeds it context, exposes
            tools, remembers things, enforces rules and records what happens. Two agents using the
            same model can differ enormously in quality because their harnesses differ.
          </p>
          <p>
            As an FDE you will spend more time on the harness than on the model. That is good news:
            the harness is ordinary engineering, and it is where reliability comes from.
          </p>

          <DiagramReference lesson="harness-tools-memory-context" panel={1} />
        </>
      ),
    },
    {
      id: "loop",
      title: "The agent loop",
      body: (
        <>
          <p>
            At its core an agent is a loop. The harness sends the current context to the model; the
            model either answers or asks to call a tool; the harness runs the tool, appends the
            result, and repeats.
          </p>

          <DiagramReference lesson="harness-tools-memory-context" panel={2} />

          <pre>
            <code>{`MAX_STEPS = 10

def run_agent(goal, tools, model, ctx):
    messages = ctx.initial_messages(goal)
    for step in range(MAX_STEPS):
        reply = model.call(messages, tools=tools.schemas())
        if not reply.tool_calls:
            return reply.text                           # model chose to answer
        for call in reply.tool_calls:
            args = tools.validate(call.name, call.arguments)   # reject bad calls
            result = tools.run(call.name, args)                # may raise: return error text
            messages.append(tool_result(call.id, result))
        messages = ctx.trim(messages)                   # keep within token budget
    raise RuntimeError("step limit reached")            # never loop forever`}</code>
          </pre>
          <p>
            Three stopping conditions are essential: the model answers, a step limit is hit, or a
            budget (tokens, cost, time) runs out. An agent without all three will eventually run
            away.
          </p>
        </>
      ),
    },
    {
      id: "tools",
      title: "Designing tools",
      body: (
        <>
          <p>
            A <strong>tool</strong> is a function the model may ask the harness to run. To the model,
            a tool is only its name, description and parameter schema, so those three things largely
            determine whether it is used correctly. Think of writing a tool description as writing
            documentation for a smart new colleague who cannot ask questions.
          </p>
          <pre>
            <code>{`{
  "name": "search_orders",
  "description": "Find a customer's orders by email or order ID. Use this first when the user asks about an order. Returns at most 5 recent orders with status and ETA. Does NOT return payment details.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email":    { "type": "string", "description": "Customer email, exact match" },
      "order_id": { "type": "string", "description": "e.g. A-1001" },
      "status":   { "type": "string", "enum": ["open", "shipped", "delivered", "cancelled"] }
    },
    "anyOf": [{ "required": ["email"] }, { "required": ["order_id"] }]
  }
}`}</code>
          </pre>
          <Table
            head={["Principle", "Why", "Example"]}
            rows={[
              ["Few, distinct tools", "Overlapping tools confuse choice", "One search_orders, not four similar lookups"],
              ["Say when to use it and what it returns", "Guides selection and prevents misuse", "Use this first when asked about an order"],
              ["Constrain parameters", "Enums and required fields cut bad calls", "status enum instead of free text"],
              ["Return concise, useful results", "Large outputs bloat context", "5 orders, not the whole table; paginate"],
              ["Return errors the model can act on", "Lets it self-correct instead of looping", "No order found for A-9999. Check the ID or search by email."],
              ["Separate read from write", "Safer permissions and approvals", "get_refund_status vs issue_refund"],
            ]}
          />
          <Callout tone="tip" title="Errors are part of the interface">
            A tool that fails with &ldquo;error 500&rdquo; teaches the model nothing. One that says
            &ldquo;date must be YYYY-MM-DD; received 12/03/2026&rdquo; lets it fix the call on the
            next step. Most agent loops are cured by better error messages.
          </Callout>
        </>
      ),
    },
    {
      id: "memory",
      title: "Memory and state",
      body: (
        <>
          <p>
            Models have no memory between calls. Anything that must persist must be stored by the
            harness and put back into context. Distinguish four kinds, because each is stored and
            retrieved differently:
          </p>

          <DiagramReference lesson="harness-tools-memory-context" panel={3} />

          <ul>
            <li>
              <strong>Persist state outside the model.</strong> If the process crashes, you should
              resume from stored state, not from a lost context.
            </li>
            <li>
              <strong>Store structured facts, not whole transcripts.</strong> &ldquo;Customer prefers
              email; refund approved at 14:02&rdquo; is cheaper and more reliable than replaying 40
              turns.
            </li>
            <li>
              <strong>Scope memory by user and tenant,</strong> and let users see and delete what is
              remembered.
            </li>
            <li>
              <strong>Beware stale and wrong memories.</strong> Add timestamps and sources, and expire
              or verify facts that change.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "context",
      title: "Context engineering",
      body: (
        <>
          <p>
            <strong>Context engineering</strong> is deciding, for each model call, what goes into the
            window. More is not better: long contexts cost more, run slower, and can bury key facts.
            Performance often degrades when irrelevant or contradictory text crowds the window.
          </p>
          <Table
            head={["Technique", "What it does", "When to use"]}
            rows={[
              ["Budgeting", "Allocate tokens: instructions, tools, retrieved data, history, answer", "Always; set limits per section"],
              ["Summarising history", "Replace old turns with a short summary", "Long conversations"],
              ["Selective retrieval", "Fetch only what the next step needs", "Large knowledge bases"],
              ["Tool result trimming", "Return summaries or IDs; fetch details on demand", "Tools that return big payloads"],
              ["Ordering", "Stable instructions first (enables caching); key facts near the end", "Prompt design and cost"],
              ["Isolation", "Run a sub-task in its own context and return only a summary", "Research or reading many documents"],
            ]}
          />
          <p>
            A useful discipline is to print the exact prompt for a failing run and read it as the
            model would. Often the problem is obvious: the instruction is buried, a tool result is
            enormous, or two parts of the context contradict each other.
          </p>

          <Exercise
            title="Fix the harness"
            task={
              <p>
                An agent answers order questions well for the first few turns, then starts giving
                wrong order IDs and repeating questions. Conversations average 40 turns, and the
                &ldquo;search_orders&rdquo; tool returns up to 50 full order records. Name three
                harness changes.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Trim the tool result</strong>: return at most five orders with only the
                fields needed (ID, status, ETA), and a way to fetch more.
              </li>
              <li>
                <strong>Summarise older turns</strong> and keep a structured record of confirmed
                facts (the customer&apos;s email and the order being discussed) in session state,
                re-injected each turn.
              </li>
              <li>
                <strong>Set a token budget per section</strong> and log the final prompt size, so
                growth is visible before it causes errors.
              </li>
            </ol>
            <p>
              None of these changes touches the model. They address the real cause: context bloat
              pushing out the facts the agent needs.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "An agent is a model inside a harness: context, tools, memory, guardrails and observability.",
    "The loop runs until the model answers, a step limit hits, or a budget ends; the harness executes tools.",
    "Good tools have few, distinct purposes, clear descriptions, constrained parameters and actionable errors.",
    "Persist session state and long-term memory outside the model, scoped by user and tenant.",
    "Context engineering budgets and curates the window; many agent failures are context failures.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Who executes a tool call in an agent loop?",
      options: ["The harness", "The model", "The user", "The GPU driver"],
      answer: 0,
      explain: "The model only requests the call. The harness validates and runs it, then returns the result.",
    },
    {
      kind: "mcq",
      q: "A tool returns 'error 500'. The agent keeps retrying the same bad call. What is the best fix?",
      options: [
        "Return an actionable error that says what was wrong and how to correct it",
        "Add more tools",
        "Increase the temperature",
        "Remove the step limit",
      ],
      answer: 0,
      explain: "A specific error lets the model self-correct; vague errors cause loops.",
    },
    {
      kind: "mcq",
      q: "Where should task progress be stored so a crashed run can resume?",
      options: [
        "In your own storage, keyed by session",
        "Only in the prompt",
        "In the model's weights",
        "It cannot be resumed",
      ],
      answer: 0,
      explain: "The context window is temporary; durable state belongs in your system.",
    },
    {
      kind: "mcq",
      q: "Why put stable instructions at the start of the prompt?",
      options: [
        "It allows prompt caching to reuse the unchanged prefix, lowering cost and latency",
        "Models only read the first line",
        "It is required by JSON",
        "It makes the model smarter",
      ],
      answer: 0,
      explain: "Caching works on identical prefixes, so keep the variable parts after the stable ones.",
    },
    {
      kind: "text",
      q: "Name the three essential stopping conditions for an agent loop: the model answers, a budget runs out, or a ... limit is reached. (one word)",
      format: "****",
      accept: ["step", "steps", "step limit"],
      explain: "A maximum number of steps prevents runaway loops.",
    },
  ],
};
