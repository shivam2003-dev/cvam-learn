import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why asking a model to show its steps can improve answers",
    "Write a chain-of-thought prompt and know when to skip it",
    "Describe the Thought, Action, Observation loop used by ReAct",
    "Build a simple tool-using loop with a step limit",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why models get multi-step problems wrong",
      body: (
        <>
          <p>
            A language model writes one token at a time, and each token comes from a fixed amount of
            computation. If the answer needs several steps and the model must jump straight to the
            final number, it has little room to work. It may guess something that sounds right.
          </p>
          <p>
            Compare doing a sum in your head with doing it on paper. On paper you write the
            intermediate results, and each line makes the next one easy. The text a model writes
            works like that paper. Intermediate steps it writes become part of its own context, so
            later tokens can use them.
          </p>
          <p>
            That is the whole idea behind <strong>chain of thought</strong> (CoT): let the model
            write its reasoning before it commits to an answer.
          </p>
        </>
      ),
    },
    {
      id: "cot",
      title: "Chain of thought in practice",
      body: (
        <>
          <p>There are two common ways to ask for it.</p>
          <ul>
            <li>
              <strong>Zero-shot CoT:</strong> add an instruction such as &quot;Work through this step
              by step, then give the final answer on its own line.&quot;
            </li>
            <li>
              <strong>Few-shot CoT:</strong> give examples where the reasoning is written out before
              the answer, so the model copies the style.
            </li>
          </ul>
          <pre>
            <code>{`A shop sells pens at 3 for 4 dollars. Ana buys 12 pens and has a
coupon for 5 dollars off. How much does she pay?

Think step by step. Put the final answer on the last line as:
Answer: <number>`}</code>
          </pre>
          <p>A good response looks like this.</p>
          <pre>
            <code>{`12 pens is 4 groups of 3 pens.
4 groups × 4 dollars = 16 dollars.
16 − 5 coupon = 11 dollars.
Answer: 11`}</code>
          </pre>
          <p>
            Asking for a fixed final line, such as <code>Answer:</code>, matters. Your code can read
            that line and ignore the reasoning above it.
          </p>
          <Callout tone="note">
            The visible reasoning is useful as working space, but it is not a guaranteed true
            account of how the model decided. Do not treat it as an audit log. Use it to improve
            answers and to debug, not as proof of correctness.
          </Callout>
        </>
      ),
    },
    {
      id: "when",
      title: "When to use it, and when not to",
      body: (
        <>
          <p>CoT is not free. Reasoning text is output tokens, which cost more and take time to generate.</p>
          <Formula>extra cost = requests × extra output tokens × output price per token</Formula>
          <p>
            Take an illustrative case: a direct answer is about 20 tokens, a reasoned answer about
            350 tokens, with 10,000 requests and an output price of 15 dollars per million tokens
            (prices change; check the provider).
          </p>
          <pre>
            <code>{`direct   : 10,000 × 20  =   200,000 tokens → 0.2 million × 15 = 3.00 dollars
reasoned : 10,000 × 350 = 3,500,000 tokens → 3.5 million × 15 = 52.50 dollars`}</code>
          </pre>
          <p>
            That is about 17 times the output cost, plus a longer wait for each reply. Worth it for
            hard problems; wasteful for easy ones.
          </p>
          <Table
            head={["Task", "Use CoT?", "Why"]}
            rows={[
              ["Arithmetic, logic puzzles, planning", "Yes", "Several dependent steps"],
              ["Multi-clue questions over a document", "Often", "Gathering evidence first helps"],
              ["Sentiment labels, simple extraction", "No", "One-step pattern matching"],
              ["Rewriting or summarising text", "No", "No chain of dependent facts"],
            ]}
          />
          <p>
            Many current providers also offer models that reason on their own before answering,
            sometimes with a setting for how much effort to spend. With those, a plain request for
            step-by-step reasoning is often unnecessary and can even get in the way. Check the
            provider's guidance for the model you use, and measure on your own examples.
          </p>
        </>
      ),
    },
    {
      id: "react",
      title: "ReAct: reasoning plus actions",
      body: (
        <>
          <p>
            Reasoning alone cannot look anything up. If the question needs today's order status or a
            figure from your database, the model must call a tool. <strong>ReAct</strong>, short for
            reasoning and acting, combines both in a loop.
          </p>
          <ol>
            <li>
              <strong>Thought:</strong> the model writes what it needs next.
            </li>
            <li>
              <strong>Action:</strong> it asks for a tool call with arguments.
            </li>
            <li>
              <strong>Observation:</strong> your code runs the tool and returns the result.
            </li>
            <li>Repeat until the model has enough, then it gives the final answer.</li>
          </ol>
          <pre>
            <code>{`Question: Is order 4417 late?
Thought: I need the shipping status and the promised date.
Action: get_order(order_id=4417)
Observation: {"status": "in_transit", "promised": "2025-03-10", "eta": "2025-03-12"}
Thought: The ETA is after the promised date, so it is late by 2 days.
Final answer: Yes, order 4417 is about 2 days late.`}</code>
          </pre>
          <p>
            Each observation is added to the context, so the next thought can use it. The model
            does not need to guess; it checks.
          </p>
          <p>
            Today most provider APIs have built-in tool calling: you describe tools as JSON schemas
            and the model returns structured tool-call requests, not free text to parse. That is the
            same loop in a safer form, and it is what you should use in practice. The text format
            above is the clearest way to see the idea.
          </p>
        </>
      ),
    },
    {
      id: "loop",
      title: "A minimal loop in code",
      body: (
        <>
          <p>
            Here is the shape of the loop. The helper names are placeholders, but the structure is
            what real agents are built on.
          </p>
          <pre>
            <code>{`# Illustrative: call_model and the tool-call format differ by provider.
MAX_STEPS = 6

def run(question, tools):
    messages = [
        {"role": "system", "content": "Use tools when you need facts. Be brief."},
        {"role": "user", "content": question},
    ]
    for step in range(MAX_STEPS):
        reply = call_model(messages, tools=tools)
        if not reply.tool_calls:
            return reply.text                      # model is done
        messages.append(reply.as_message())        # keep its request in history
        for call in reply.tool_calls:
            try:
                result = tools[call.name](**call.arguments)
            except Exception as err:
                result = f"Tool error: {err}"      # let the model recover
            messages.append(tool_result_message(call, result))
    return "Stopped: step limit reached."`}</code>
          </pre>
          <p>Three details matter more than they look.</p>
          <ul>
            <li>
              <strong>A step limit.</strong> Without <code>MAX_STEPS</code> a confused model can
              loop forever and run up your bill.
            </li>
            <li>
              <strong>Errors go back to the model.</strong> A readable error lets it retry with
              different arguments instead of crashing the run.
            </li>
            <li>
              <strong>The history grows.</strong> Every step resends everything before it, so long
              loops get more expensive per step. Later lessons on context cover how to trim.
            </li>
          </ul>
          <Callout tone="warn">
            Tool results are data from outside, and models can be tricked by text inside them.
            Validate arguments in your code, limit what each tool can do, and require human
            approval for actions that cannot be undone.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Chain of thought lets the model write intermediate steps that later tokens can use.",
    "Use it for multi-step problems; skip it for simple labels, rewrites and lookups.",
    "Reasoning is output tokens, so it raises cost and latency; do the arithmetic first.",
    "ReAct loops Thought, Action, Observation so the model can check facts with tools.",
    "Always cap the number of steps, return tool errors to the model and validate tool arguments.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does writing out steps often improve answers on multi-step problems?",
      options: [
        "The steps become context that later tokens can use",
        "It makes the model run on a faster GPU",
        "It turns off sampling randomness",
        "It gives the model access to the internet",
      ],
      answer: 0,
      explain: "Intermediate text is part of the model's own context, so each step supports the next.",
    },
    {
      kind: "mcq",
      q: "In a ReAct loop, who runs the tool?",
      options: [
        "The model itself, inside its weights",
        "The provider, without telling you",
        "Your application code, which then returns the result as an observation",
        "The end user",
      ],
      answer: 2,
      explain: "The model only asks for a call. Your code runs it and feeds back the observation.",
    },
    {
      kind: "mcq",
      q: "Which task benefits least from chain of thought?",
      options: [
        "A word problem with three dependent steps",
        "Planning a multi-stage itinerary",
        "Tagging a review as positive or negative",
        "A logic puzzle",
      ],
      answer: 2,
      explain: "A one-step label gains little and pays extra for reasoning tokens.",
    },
    {
      kind: "text",
      q: "A reasoned answer is 350 tokens and a direct answer is 20. Across 10,000 requests, how many million output tokens does the reasoned version use?",
      format: "***",
      accept: ["3.5", "3.5 million"],
      explain: "10,000 × 350 = 3,500,000 tokens, which is 3.5 million.",
    },
    {
      kind: "text",
      q: "What safeguard stops a tool-using loop from running forever? Answer with two words.",
      format: "**** *****",
      accept: ["step limit", "max steps", "iteration limit", "step cap", "max iterations"],
      explain: "A maximum number of steps bounds both cost and the damage from a confused model.",
    },
  ],
};
