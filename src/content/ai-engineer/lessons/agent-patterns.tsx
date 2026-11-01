import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Describe ReAct, plan and execute, routing and other common agent patterns",
    "Choose between a fixed workflow and a free-running agent",
    "Explain when a multi-agent design helps and when it only adds cost",
    "Calculate how per-step reliability compounds across a long task",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: one loop does not fit every task",
      body: (
        <>
          <p>
            A basic agent is a model in a loop with tools. That works for small jobs. For bigger
            ones it breaks in predictable ways: the model forgets the goal, wanders, repeats itself,
            or fills its context with noise. Patterns are the standard shapes people use to give the
            loop more structure.
          </p>
          <p>
            A useful split is between <strong>workflows</strong> and <strong>agents</strong>. In a
            workflow, your code decides the steps and the model fills in the content. In an agent,
            the model decides the steps. Workflows are predictable and cheap. Agents are flexible
            and riskier. Start with the simplest thing that works.
          </p>
        </>
      ),
    },
    {
      id: "react",
      title: "ReAct: think, act, observe",
      body: (
        <>
          <p>
            <strong>ReAct</strong> (reason plus act) is the default agent loop. At each step the
            model writes a short thought, picks an action (a tool call), reads the observation (the
            result), and repeats until it can answer.
          </p>
          <pre>
            <code>{`Thought: I need the order's ship date before I can answer.
Action:  get_order_status(order_id="A-1001")
Observation: status shipped, eta 2 days
Thought: I have enough to answer.
Answer:  Your order ships in 2 days.`}</code>
          </pre>
          <p>
            It adapts well because each step uses the latest information. Its weakness is that it
            plans only one step ahead, so on long tasks it can drift. Many current models reason
            internally before tool calls, so you may not write this format yourself, but the
            think, act, observe cycle is still what is happening.
          </p>
        </>
      ),
    },
    {
      id: "patterns",
      title: "The common patterns",
      body: (
        <>
          <Table
            head={["Pattern", "How it works", "Use it when"]}
            rows={[
              ["Prompt chaining", "Fixed sequence: output of step 1 feeds step 2", "The task splits cleanly, such as draft then translate"],
              ["Routing", "A cheap classifier call sends the input to a specialised path", "Inputs differ a lot: billing, bugs, small talk"],
              ["Parallelization", "Run independent calls at once, then merge", "Subtasks do not depend on each other"],
              ["Plan and execute", "One call writes a plan, then steps run one by one", "Long tasks where drift is a risk"],
              ["Orchestrator and workers", "A lead model splits work and delegates to workers", "You cannot predict the subtasks in advance"],
              ["Evaluator and optimizer", "One call drafts, another critiques, loop until good", "There is a clear quality bar to check against"],
            ]}
          />
          <p>
            <strong>Plan and execute</strong> separates thinking from doing. The planner writes
            numbered steps. An executor carries them out, and you can re-plan if a step fails. This
            keeps the goal visible and makes the run easy to inspect.
          </p>
          <p>
            <strong>Routing</strong> is underrated. A small, cheap model call can decide whether a
            message is a refund request, a bug report or chit-chat, then hand it to a short focused
            prompt. Each path stays simple, and you test each one on its own.
          </p>
          <Callout tone="tip">
            Reflection (asking the model to critique its own answer) helps most when the check is
            concrete: run the tests, validate the JSON, compare with the source. Asking a model "is
            this good?" with nothing to check against often just gets "yes".
          </Callout>
        </>
      ),
    },
    {
      id: "multi-agent",
      title: "When more agents help",
      body: (
        <>
          <p>
            A <strong>multi-agent system</strong> uses several model-driven agents, each with its
            own prompt, tools and context. It sounds powerful, but every extra agent adds tokens,
            latency and ways to fail. Add one only for a real reason:
          </p>
          <ul>
            <li>
              <strong>Context isolation.</strong> A research worker can read fifty pages and return
              a 200-word summary, so the lead agent's context stays clean.
            </li>
            <li>
              <strong>Parallel work.</strong> Independent subtasks can run at the same time, which
              cuts wall-clock time.
            </li>
            <li>
              <strong>Different permissions.</strong> One agent can read the database while another
              can send email, so a mistake in one has a smaller blast radius.
            </li>
            <li>
              <strong>Different skills.</strong> Separate prompts and tools for coding, review and
              writing are easier to tune than one giant prompt.
            </li>
          </ul>
          <p>
            Reasons that are not enough: "it feels more like a team", or "the single prompt is
            getting long" (try tidying the prompt and the tool list first).
          </p>
          <Callout tone="warn">
            Agents pass text to each other, and text can lose detail or carry mistakes. A wrong claim
            from a worker becomes a fact in the lead's context. Give workers a clear output format
            and let the lead check key claims.
          </Callout>
        </>
      ),
    },
    {
      id: "reliability",
      title: "Why long tasks fail: compounding errors",
      body: (
        <>
          <p>
            If each step succeeds independently with probability <code>p</code>, a task of{" "}
            <code>n</code> steps succeeds with probability:
          </p>
          <Formula>P(success) = p ^ n</Formula>
          <p>With an illustrative 95% success per step:</p>
          <pre>
            <code>{`  5 steps: 0.95^5  = 0.774  (77%)
 10 steps: 0.95^10 = 0.599  (60%)
 20 steps: 0.95^20 = 0.358  (36%)`}</code>
          </pre>
          <p>
            A model that is right 95% of the time per step still fails four tasks in ten at 10
            steps. Real steps are not fully independent, so treat this as a rule of thumb, but it
            explains why agents get worse as tasks grow.
          </p>
          <p>The fixes follow directly from the formula:</p>
          <ul>
            <li>Use fewer steps. Replace model decisions with plain code where you can.</li>
            <li>Raise <code>p</code> per step with clearer tools, validation and examples.</li>
            <li>Add checkpoints that catch errors early, such as tests or schema checks.</li>
            <li>Keep a human approval step before irreversible actions.</li>
          </ul>
          <Callout tone="note">
            Always set a step limit and a token budget, and log every thought, action and
            observation. You cannot fix a run you cannot read.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Workflows have code-chosen steps. Agents have model-chosen steps. Prefer the simpler one.",
    "ReAct is the base loop: think, act, observe, repeat.",
    "Routing, chaining, parallelization, planning and evaluator loops give the loop structure.",
    "Add more agents only for context isolation, parallelism, permissions or specialised skills.",
    "Success compounds as p to the power n, so shorter chains and early checks matter.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does the observation step in ReAct contain?",
      options: [
        "The model's private reasoning",
        "The user's original question",
        "The result returned by the tool",
        "The system prompt",
      ],
      answer: 2,
      explain: "The model acts by calling a tool, and the tool's result is the observation it reasons over next.",
    },
    {
      kind: "mcq",
      q: "Which is the strongest reason to use a separate worker agent?",
      options: [
        "To keep a large pile of raw research out of the lead agent's context",
        "To make the system look more advanced",
        "Because two agents are always more accurate than one",
        "To avoid writing any tool code",
      ],
      answer: 0,
      explain: "Context isolation is a real benefit. The worker returns a short summary and the lead stays focused.",
    },
    {
      kind: "mcq",
      q: "A cheap first call decides whether a message is billing, a bug report or small talk, then sends it down a matching prompt. Which pattern is this?",
      options: ["Reflection", "Routing", "Orchestrator and workers", "Plan and execute"],
      answer: 1,
      explain: "Routing classifies the input and dispatches it to a specialised path.",
    },
    {
      kind: "text",
      q: "Each step succeeds with probability 0.9, independently. What is the chance that a 3-step task succeeds, as a whole percentage? (0.9 x 0.9 x 0.9)",
      format: "**",
      accept: ["73", "73%", "72.9", "72.9%", "0.729"],
      explain: "0.9 cubed is 0.729, about 73%.",
    },
  ],
};
