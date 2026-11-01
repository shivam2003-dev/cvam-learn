import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain why public leaderboards can't choose a model for you",
    "Build a small evaluation set from real product data",
    "Compare models by total cost per task, including failures",
    "Judge whether a difference in eval scores is real",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: the best model on paper may not be best for you",
      body: (
        <>
          <p>
            New models arrive every few weeks, each with a chart showing it on top. It's tempting to
            pick whichever leads a public leaderboard. But a leaderboard answers a question you didn't
            ask: how did this model do on someone else's tasks?
          </p>
          <p>
            Your product has its own prompts, documents, languages, output formats and failure costs.
            A model that wins at math puzzles may be worse at extracting fields from your invoices.
            Public benchmarks can also be over-optimized, because vendors know exactly what's on them.
            They rarely consider speed or price either.
          </p>
          <p>
            An <strong>eval</strong>, short for evaluation, is a repeatable test: a set of inputs, a
            way to run a model on them, and a way to score the outputs. Think of it as a job interview
            built around the actual job. A strong résumé gets a candidate an interview, but a work
            sample tells you if they can do what you need. Leaderboards are résumés. Your eval is the
            work sample.
          </p>
        </>
      ),
    },
    {
      id: "funnel",
      title: "A four-stage selection funnel",
      body: (
        <>
          <p>Running every model through everything is wasteful. Narrow them down in order, cheapest first.</p>
          <Table
            head={["Stage", "Question", "Removes models that..."]}
            rows={[
              ["1. Hard filters", "Can we use it at all?", "Fail on license, data rules, context length or language"],
              ["2. Offline eval", "Is it good at our task?", "Score too low on our examples"],
              ["3. Performance test", "Is it fast and cheap enough?", "Miss latency or cost targets on our hardware"],
              ["4. Live test", "Do real users benefit?", "Look good offline but don't help users"],
            ]}
          />
          <p>
            Stage 4 usually starts as a <strong>shadow test</strong>, where the candidate receives a
            copy of live traffic and its replies are logged but never shown to users. After that comes
            an <strong>A/B test</strong>, where a small share of users really gets the new model.
          </p>
        </>
      ),
    },
    {
      id: "eval-set",
      title: "Build an eval that reflects your product",
      body: (
        <>
          <p>
            Start with 50 to 200 real examples, and grow from there. Good sources are production logs
            (with privacy rules applied), support tickets about bad answers, and hard cases your team
            already knows about. Include common cases in proportion, then add the rare ones that would
            really hurt.
          </p>
          <p>The way you score depends on the task:</p>
          <Table
            head={["Task", "Scoring method"]}
            rows={[
              ["Classification", "Accuracy, precision and recall against labels"],
              ["Extraction", "Exact field match, JSON schema validity"],
              ["Summaries and chat", "A rubric graded by people or a judge model"],
              ["RAG answers", "Is the answer grounded in the retrieved text?"],
              ["Coding", "Do the unit tests pass?"],
            ]}
          />
          <p>
            A basic harness is short. This one works with any server that speaks the OpenAI API,
            which includes vLLM and SGLang, so hosted and self-hosted candidates run through the same
            code:
          </p>
          <pre>
            <code>{`import json
from openai import OpenAI

def run_eval(base_url, model, path):
    client = OpenAI(base_url=base_url, api_key="unused")
    passed = total = 0
    with open(path) as f:
        for line in f:
            case = json.loads(line)
            reply = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": case["prompt"]}],
                temperature=0,
                max_tokens=64,
            )
            text = reply.choices[0].message.content.strip().lower()
            passed += text == case["expected"].lower()
            total += 1
    return passed / total`}</code>
          </pre>
          <Callout tone="warn">
            Run the final eval on the exact setup you'll deploy. Quantization, a different engine or a
            changed prompt template can all shift quality. A score earned by the FP16 model says
            little about your FP8 build.
          </Callout>
        </>
      ),
    },
    {
      id: "cost-per-task",
      title: "Worked example: cost per task, not cost per token",
      body: (
        <>
          <p>
            Token price alone misleads, because a cheap model that fails often creates expensive work
            elsewhere. Add the cost of each failure, such as a human review or a retry:
          </p>
          <Formula>cost per task = inference cost + failure rate × cost of a failure</Formula>
          <p>
            Imagine a task where each failure needs a $0.50 human review. All figures are
            illustrative, and they assume the eval set is large enough to trust.
          </p>
          <Table
            head={["Model", "Pass rate", "Inference cost", "Failure cost", "Total per task"]}
            rows={[
              ["Large", "92%", "$0.012", "0.08 × $0.50 = $0.040", "$0.052"],
              ["Medium", "89%", "$0.003", "0.11 × $0.50 = $0.055", "$0.058"],
              ["Small", "70%", "$0.001", "0.30 × $0.50 = $0.150", "$0.151"],
            ]}
          />
          <p>
            The large model costs four times as much to run as the medium one, and it's still the
            cheapest choice overall. Yet if a failure costs only $0.05, for example an automatic
            retry, the medium model wins: $0.0085 against $0.016. The right model depends on your
            failure cost, which no leaderboard knows.
          </p>
        </>
      ),
    },
    {
      id: "noise",
      title: "Is the difference real?",
      body: (
        <>
          <p>
            An eval score is an estimate from a sample, so it carries noise. For a pass rate{" "}
            <code>p</code> on <code>n</code> examples, the standard error is:
          </p>
          <Formula>standard error = √(p × (1 − p) ÷ n)</Formula>
          <p>
            A rough 95% range is about two standard errors each way. At a 90% pass rate on 100
            examples, the error is √(0.9 × 0.1 ÷ 100) = 0.03, so the range is about ±6 points. A
            92% score and an 89% score on 100 examples could easily be the same model.
          </p>
          <p>
            Sample size helps, but slowly. At 400 examples the error halves to 0.015, or about ±3
            points. Four times the data gives half the noise.
          </p>
          <Callout tone="tip">
            Run both models on the same examples and look at where they disagree. That paired view is
            more sensitive than comparing two totals, and reading those disagreements by hand often
            teaches you more than the score does.
          </Callout>
          <p>
            Finally, keep the eval after launch. Rerun it for each new model, prompt change or engine
            upgrade, the same way you'd run a test suite before a release.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Leaderboards measure someone else's tasks, so use them only to build a shortlist.",
    "Filter in order: hard limits, offline eval, performance test, then live test.",
    "Build evals from real examples and score them in a way that fits the task.",
    "Compare cost per task, including failures, rather than cost per token.",
    "Small eval sets are noisy, so test on the deployed setup with enough examples.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In a shadow test, what happens to the candidate model's replies?",
      options: [
        "They're shown to all users",
        "They're logged but not shown to users",
        "They replace the production model",
        "They're used to retrain the model",
      ],
      answer: 1,
      explain: "A shadow test gets real traffic with no risk to users, since nobody sees the output.",
    },
    {
      kind: "mcq",
      q: "Eval set size goes from 100 to 400 examples. What happens to the standard error?",
      options: ["It stays the same", "It halves", "It quarters", "It doubles"],
      answer: 1,
      explain: "Standard error shrinks with the square root of n, and √4 = 2.",
    },
    {
      kind: "mcq",
      q: "You've measured a great score on an FP16 model, but you'll deploy FP8. What should you do?",
      options: [
        "Nothing, since quantization never changes quality",
        "Rerun the eval on the FP8 build",
        "Switch to a leaderboard score",
        "Lower the temperature",
      ],
      answer: 1,
      explain: "Quality should be measured on the exact setup you plan to deploy.",
    },
    {
      kind: "text",
      q: "Inference costs $0.01 per task, 20% of tasks fail, and each failure costs $0.50. What is the total cost per task in dollars?",
      format: "****",
      accept: ["0.11", "$0.11", ".11"],
      explain: "0.01 + 0.20 × 0.50 = 0.01 + 0.10 = $0.11.",
    },
    {
      kind: "text",
      q: "What is the short word for a repeatable test of model quality on a set of examples?",
      format: "****",
      accept: ["eval", "evals", "evaluation"],
      explain: "An eval combines inputs, a way to run the model and a way to score outputs.",
    },
  ],
};
