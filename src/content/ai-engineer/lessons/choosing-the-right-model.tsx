import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "List the factors that decide which model fits a task",
    "Compute cost per request and per day from token counts and prices",
    "Build a small evaluation set and use it to compare models",
    "Explain routing and cascading as ways to mix cheap and strong models",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: there is no best model",
      body: (
        <>
          <p>
            New models appear all the time, and public rankings shift often. If you pick the one at
            the top of a chart, you may pay several times more than needed, wait longer than your
            users will tolerate, or still fail on your own data. A model that is great at general
            tests can be mediocre at your narrow task.
          </p>
          <p>
            The right question is not &quot;which model is best?&quot; but &quot;which is the
            cheapest, fastest model that is good enough for this job?&quot; Answering that takes a
            method, not a leaderboard.
          </p>
        </>
      ),
    },
    {
      id: "factors",
      title: "The factors that matter",
      body: (
        <>
          <Table
            head={["Factor", "Question to ask"]}
            rows={[
              ["Quality on your task", "Does it pass your own tests, not just public ones?"],
              ["Cost", "What is the price per input and output token, and how many tokens do I use?"],
              ["Latency", "How long until the first token, and how long until the full answer?"],
              ["Context length", "Does my longest realistic input fit, with room for the output?"],
              ["Features", "Does it support tool calling, structured output, images or reasoning modes that I need?"],
              ["Data and compliance", "Where does my data go, and is that allowed for this data?"],
              ["Reliability", "What are the rate limits, uptime history and retirement policy?"],
              ["Ecosystem fit", "Is there an SDK, an OpenAI-compatible endpoint, or a host I already use?"],
            ]}
          />
          <p>
            Quality is only one row. A model that is slightly better but ten times costlier or
            twice as slow may be the wrong answer. Also, some limits are hard: if your input does not
            fit the context window or your data may not leave your network, those rule models out
            before quality is even considered.
          </p>
        </>
      ),
    },
    {
      id: "cost",
      title: "Cost arithmetic",
      body: (
        <>
          <p>
            Providers usually charge separately for input and output tokens, and output is typically
            pricier. Prices change often, so the numbers below are <strong>illustrative</strong>.
            Always check current pricing.
          </p>
          <Formula>cost = (input tokens × input price + output tokens × output price) ÷ 1,000,000</Formula>
          <p>
            Take a request with 2,000 input tokens and 500 output tokens, and two imaginary models
            with prices per million tokens: a large one at $3 input and $15 output, and a small one
            at $0.25 input and $1.25 output.
          </p>
          <pre>
            <code>{`Large model:
  input  2,000 × $3.00  / 1M = $0.006
  output   500 × $15.00 / 1M = $0.0075
  total                      = $0.0135 per request

Small model:
  input  2,000 × $0.25  / 1M = $0.0005
  output   500 × $1.25  / 1M = $0.000625
  total                      = $0.001125 per request

At 100,000 requests per day:
  large = $1,350 per day
  small =   $112.50 per day      (12× cheaper)`}</code>
          </pre>
          <p>
            A cost-aware view divides by success. If the large model passes 94 of 100 of your tests
            and the small passes 88, the cost per <em>successful</em> request is $0.0135 ÷ 0.94 ≈
            $0.0144 versus $0.001125 ÷ 0.88 ≈ $0.00128. Even with lower quality, the small model is
            far cheaper per good answer, unless failures are costly.
          </p>
        </>
      ),
    },
    {
      id: "eval",
      title: "Decide with your own evaluation",
      body: (
        <>
          <p>
            Collect 30 to 100 real examples of the task, with the answer you would accept for each.
            Run every candidate model on them with the same prompt, score the results, and record
            cost and latency alongside. The aim is not a perfect benchmark. It is a repeatable test
            you can re-run when a new model arrives.
          </p>
          <pre>
            <code>{`import time

def evaluate(call_model, cases, check):
    passed, total_ms = 0, 0.0
    for case in cases:
        start = time.perf_counter()
        answer = call_model(case["input"])          # your SDK call, behind a function
        total_ms += (time.perf_counter() - start) * 1000
        if check(answer, case["expected"]):
            passed += 1
    return {
        "pass_rate": passed / len(cases),
        "avg_latency_ms": total_ms / len(cases),
    }

# for name, fn in candidates.items():
#     print(name, evaluate(fn, cases, check))`}</code>
          </pre>
          <p>
            Keep the model name in configuration, not scattered through the code, so swapping
            candidates is a one-line change. Include some hard and edge cases, and examples of
            failures you have seen in production.
          </p>
          <Callout tone="warn">
            Do not tune your prompt on the same cases you use to judge. Hold some cases back, or
            you will measure how well you fitted the test rather than how well the model works.
          </Callout>
        </>
      ),
    },
    {
      id: "routing",
      title: "Mixing models: routing and cascades",
      body: (
        <>
          <p>
            You do not have to choose one model for everything. <strong>Routing</strong> sends each
            request to a model chosen by difficulty or type: a small model for classification and
            simple extraction, a strong one for open-ended reasoning. A <strong>cascade</strong>{" "}
            tries the small model first and escalates only when a check fails or confidence is low.
          </p>
          <pre>
            <code>{`Route 80% of traffic to the small model, 20% to the large:
  0.8 × $0.001125 + 0.2 × $0.0135
  = $0.0009 + $0.0027
  = $0.0036 per request

At 100,000 requests per day: $360 (vs $1,350 all-large)`}</code>
          </pre>
          <p>
            The saving depends on routing correctly. A router that sends hard questions to the weak
            model hurts quality quietly, so measure it with the same evaluation set.
          </p>
          <Callout tone="tip">
            A good default process: start with a strong model to prove the task is solvable, build
            your test set, then try cheaper models and move down until quality drops below your bar.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "There is no best model, only the cheapest and fastest one that is good enough for your task.",
    "Weigh quality, cost, latency, context length, features, data rules and reliability together.",
    "Cost per request is (input tokens × input price + output tokens × output price) divided by one million.",
    "Build a small evaluation set from real examples and re-run it whenever you consider a change.",
    "Routing and cascades can cut cost a lot, but only if the router itself is measured.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What should you do first when comparing candidate models for a product?",
      options: [
        "Pick the top model on a public leaderboard",
        "Choose the cheapest one without testing",
        "Build an evaluation set from your own task examples",
        "Wait for the next release",
      ],
      answer: 2,
      explain: "Public rankings do not measure your task. Your own repeatable test is the basis for a good choice.",
    },
    {
      kind: "mcq",
      q: "A cascade works by:",
      options: [
        "Running all models and averaging their text",
        "Trying a cheaper model first and escalating to a stronger one if a check fails",
        "Splitting the prompt across models by word count",
        "Always using the largest model",
      ],
      answer: 1,
      explain: "Cascades keep most traffic on the cheap model and pay for the strong one only when needed.",
    },
    {
      kind: "text",
      q: "A request uses 1,000 input tokens at $2 per million and 200 output tokens at $10 per million. What is the cost in dollars? Use a decimal.",
      format: "*****",
      accept: ["0.004", "$0.004", ".004"],
      explain: "Input: 1,000 × 2 ÷ 1,000,000 = 0.002. Output: 200 × 10 ÷ 1,000,000 = 0.002. Total 0.004.",
    },
    {
      kind: "text",
      q: "What is the term for sending each request to a different model depending on its difficulty or type?",
      format: "*******",
      accept: ["routing", "model routing"],
      explain: "Routing picks a model per request so easy work goes to cheap models.",
    },
  ],
};
