import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Define an AI agent as a model running in a loop with tools",
    "Distinguish a fixed workflow from an agent",
    "Estimate how cost and reliability change as the number of steps grows",
    "Decide when an agent is the wrong choice",
  ],
  tasks: [
    {
      id: "definition",
      title: "A model, some tools and a loop",
      body: (
        <>
          <p>
            A single model call takes text in and gives text out. That is enough for summarising
            or answering a question, but not for "find out why last night's deploy failed and open
            a ticket". That job needs several actions, and what to do next depends on what the
            previous action returned.
          </p>
          <p>
            An <strong>AI agent</strong> is a program where a language model decides what to do
            next, runs actions through <strong>tools</strong>, looks at the results, and repeats
            until the task is done. The defining feature is that the model, not your code, chooses
            the path.
          </p>
          <p>
            Analogy: a function call is like giving a contractor a fixed checklist. An agent is like
            handing a capable colleague a goal, a set of tools and the freedom to figure out the
            steps, and checking in on how they get on.
          </p>
          <Table
            head={["Piece", "Role"]}
            rows={[
              ["Model", "Reads the situation and decides: call a tool, or give the final answer"],
              ["Tools", "Functions the model can request: search, read a file, run a query, send a message"],
              ["Instructions", "The goal, rules and limits, usually in the system prompt"],
              ["State and memory", "The running list of messages and tool results the model sees each turn"],
              ["Loop and limits", "Your code: runs tools, feeds results back, stops after a step cap"],
            ]}
          />
        </>
      ),
    },
    {
      id: "loop",
      title: "The loop in code",
      body: (
        <>
          <p>
            Strip away every framework and an agent is a short <code>while</code> loop. This
            sketch is provider-neutral and illustrative. Real SDKs differ in how they represent
            messages and tool calls, but the shape is always the same:
          </p>
          <pre>
            <code>{`MAX_STEPS = 8

def run_agent(goal: str) -> str:
    messages = [{"role": "user", "content": goal}]

    for step in range(MAX_STEPS):
        reply = call_model(system=INSTRUCTIONS, messages=messages, tools=TOOL_SPECS)
        messages.append(reply.as_message())

        if not reply.tool_calls:                 # no tool requested: the model is done
            return reply.text

        for call in reply.tool_calls:            # run each requested tool
            result = run_tool(call.name, call.arguments)
            messages.append({"role": "tool", "id": call.id, "content": result})

    return "Stopped: step limit reached without a final answer."`}</code>
          </pre>
          <p>
            Notice what your code owns: executing tools, enforcing the step cap, and deciding
            what the model is allowed to touch. The model only proposes. A later lesson covers
            tool definitions and function calling in detail.
          </p>
        </>
      ),
    },
    {
      id: "workflow",
      title: "Workflow or agent?",
      body: (
        <>
          <p>
            Many useful LLM systems are <strong>workflows</strong>: your code fixes the sequence of
            steps and calls the model at set points. For example: classify the email, then draft a
            reply, then check the tone. An agent differs by letting the model choose the steps at
            run time.
          </p>
          <Table
            head={["", "Workflow", "Agent"]}
            rows={[
              ["Who picks the next step?", "Your code", "The model"],
              ["Predictability", "High", "Lower"],
              ["Cost and latency", "Known in advance", "Varies per run"],
              ["Best when", "Steps are known and stable", "Steps depend on what is found along the way"],
              ["Testing", "Test each stage", "Test whole trajectories"],
            ]}
          />
          <Callout tone="tip">
            Start with the simplest thing that works: one good prompt, then a fixed workflow, and
            only then an agent. Each step up buys flexibility and costs predictability.
          </Callout>
        </>
      ),
    },
    {
      id: "math",
      title: "What the loop costs, and how it fails",
      body: (
        <>
          <p>
            <strong>Cost.</strong> Every step sends the whole history again, and the history grows
            with each tool result. Suppose the first call has 1,000 input tokens and each step
            adds 500 tokens of model output and tool result (illustrative):
          </p>
          <pre>
            <code>{`step 1: 1,000 input tokens
step 2: 1,500
step 3: 2,000
step 4: 2,500
step 5: 3,000
total input = 10,000 tokens   (not 5 x 1,000 = 5,000)

at an illustrative 3 currency units per 1,000,000 input tokens:
10,000 / 1,000,000 x 3 = 0.03 for this single run, before output tokens`}</code>
          </pre>
          <p>
            Input cost grows roughly with the square of the number of steps, because longer
            histories get resent every time. Prompt caching and trimming old tool output both help.
          </p>
          <p>
            <strong>Reliability.</strong> If each step succeeds independently with probability p,
            the chance that all n steps succeed is:
          </p>
          <Formula>success chance = p ^ n</Formula>
          <pre>
            <code>{`p = 0.95 per step:
 2 steps -> 0.95^2  = 0.903
 5 steps -> 0.95^5  = 0.774
10 steps -> 0.95^10 = 0.599`}</code>
          </pre>
          <p>
            A step that is right 95% of the time sounds excellent, yet ten of them in a row
            succeed only about 60% of the time. Real steps are not fully independent, and the
            model can sometimes notice and recover from an error, so treat this as intuition, not
            a prediction. The lesson stands: fewer steps, clear tools, and checks between steps.
          </p>
        </>
      ),
    },
    {
      id: "when-not",
      title: "When not to build an agent",
      body: (
        <>
          <ul>
            <li>
              <strong>The steps are known.</strong> If you can write the flow as a flowchart, write
              it as a workflow.
            </li>
            <li>
              <strong>One call is enough.</strong> Summarising, classifying, extracting and
              answering from retrieved text rarely need a loop.
            </li>
            <li>
              <strong>Latency matters.</strong> Each step is a full model call. A five-step run
              may take many seconds.
            </li>
            <li>
              <strong>Mistakes are costly and unrecoverable.</strong> Sending money, deleting data
              or emailing customers should not hinge on a model's judgement alone.
            </li>
          </ul>
          <p>
            Agents earn their keep on open-ended tasks with a verifiable result: fixing a failing
            test, researching a question across many sources, working through a support case that
            needs several lookups.
          </p>
          <Callout tone="warn">
            Always set a maximum step count and a budget, give each tool the least permission it
            needs, log every step, and require human approval before irreversible actions.
            Without those limits, a confused agent can loop, spend money, or do damage.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An agent is a model in a loop: decide, call a tool, read the result, repeat until done.",
    "The model chooses the path; your code runs the tools and enforces the limits.",
    "A workflow fixes the steps in code; use it whenever the steps are known.",
    "Cost grows quickly with steps because history is resent, and reliability falls as steps multiply.",
    "Use step caps, least-privilege tools, logging and human approval for risky actions.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What most clearly separates an agent from a workflow?",
      options: [
        "Agents never use tools",
        "Workflows cannot call a model",
        "The model decides the next step at run time",
        "Agents always use more than one model",
      ],
      answer: 2,
      explain: "In a workflow your code fixes the sequence. In an agent the model picks the next action based on results so far.",
    },
    {
      kind: "mcq",
      q: "Which task is the weakest candidate for an agent?",
      options: [
        "Investigating a failing test across many files",
        "Always doing the same three steps in the same order",
        "Researching a question across several sources",
        "Working a support case that needs unpredictable lookups",
      ],
      answer: 1,
      explain: "A fixed, known sequence belongs in a plain workflow, which is cheaper, faster and more predictable.",
    },
    {
      kind: "text",
      q: "A run has 5 steps. Step 1 sends 1,000 input tokens and each later step adds 500 tokens to the history. How many input tokens are sent in total? Digits only.",
      format: "*****",
      accept: ["10000", "10,000"],
      explain: "1,000 + 1,500 + 2,000 + 2,500 + 3,000 = 10,000.",
    },
    {
      kind: "text",
      q: "Each step succeeds 90% of the time, independently. What is the chance that 2 steps in a row both succeed? Give a decimal.",
      format: "****",
      accept: ["0.81", ".81"],
      explain: "0.9 x 0.9 = 0.81.",
    },
  ],
};
