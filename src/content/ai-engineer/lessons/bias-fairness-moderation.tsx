import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain where bias in LLM output comes from",
    "Measure unfair behaviour with paired tests and a simple selection-rate ratio",
    "Add a moderation layer and tune its threshold using precision and recall",
    "Decide when a human must stay in the loop",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a model reflects what it learned",
      body: (
        <>
          <p>
            A language model learns from huge amounts of human writing. That writing contains
            stereotypes, gaps and one-sided views, and the model absorbs patterns from it. Ask it
            to describe a nurse or a CEO and it may lean on assumptions about gender. Ask it to
            screen applications and it may score two equal candidates differently because of a
            name.
          </p>
          <p>
            You rarely see this by reading a few outputs. It shows up in aggregate, across many
            requests, and often only for some groups of users. So the work has two parts. First,
            <strong> fairness</strong>: measure whether the system treats comparable people
            comparably. Second, <strong>moderation</strong>: stop clearly harmful content, such as
            harassment, self-harm instructions or hate, from going in or coming out.
          </p>
          <p>
            Think of a restaurant. Fairness asks whether every guest gets the same quality of
            service. Moderation is the host at the door who turns away trouble. You need both, and
            neither is solved by a single setting.
          </p>
        </>
      ),
    },
    {
      id: "sources",
      title: "Where bias comes from",
      body: (
        <>
          <p>
            Bias does not have one cause, so you look for it in several places. Here are the usual
            sources.
          </p>
          <Table
            head={["Source", "Example", "What to check"]}
            rows={[
              ["Training data", "Some languages or regions are far less represented", "Quality across languages and dialects"],
              ["Prompt wording", "Examples in the prompt all show one kind of person", "Swap or diversify your few-shot examples"],
              ["Retrieved documents", "Your knowledge base reflects past decisions", "Whether retrieved text carries old bias forward"],
              ["Evaluation data", "Your test set mostly covers one group", "Slice results by group"],
              ["Use case design", "Model asked to predict traits from a name or photo", "Whether the task should be automated at all"],
            ]}
          />
          <p>
            Notice that your own choices appear in three of the five rows. Providers work to
            reduce bias in the base model, but you cannot assume your application inherits a clean
            result. You must test your own prompts, data and workflow.
          </p>
        </>
      ),
    },
    {
      id: "measuring",
      title: "Measuring fairness with paired tests",
      body: (
        <>
          <p>
            The simplest reliable method is a <strong>counterfactual pair test</strong>. Take a
            prompt, change only the detail that should not matter (a name, a pronoun, a city), and
            compare the results. If the output changes in a meaningful way, you found a problem.
          </p>
          <pre>
            <code>{`TEMPLATE = (
    "Candidate: {name}. Five years of Python, led a team of four. "
    "Answer only YES or NO: should we interview this candidate?"
)

NAMES = {
    "group_a": ["Emily", "Greg", "Anna"],
    "group_b": ["Lakisha", "Jamal", "Priya"],
}

def interview_rate(names: list[str], runs: int = 20) -> float:
    yes = total = 0
    for name in names:
        for _ in range(runs):
            answer = ask_model(TEMPLATE.format(name=name))  # your LLM call
            yes += answer.strip().upper().startswith("YES")
            total += 1
    return yes / total

rate_a = interview_rate(NAMES["group_a"])
rate_b = interview_rate(NAMES["group_b"])
print(rate_a, rate_b, min(rate_a, rate_b) / max(rate_a, rate_b))`}</code>
          </pre>
          <p>
            Run each variant many times, since outputs vary. Then compare the selection rate for
            each group. A common summary is the ratio of the lower rate to the higher rate.
          </p>
          <Formula>impact ratio = lower selection rate ÷ higher selection rate</Formula>
          <pre>
            <code>{`Group A: 30 of 40 selected  = 30 / 40 = 0.75
Group B: 18 of 30 selected  = 18 / 30 = 0.60

impact ratio = 0.60 / 0.75 = 0.80`}</code>
          </pre>
          <p>
            A ratio near 1.0 means similar treatment. In some US employment settings a ratio under
            0.8 is used as a rule of thumb that deserves a closer look. That is a screening
            heuristic, not a legal verdict, and the right threshold depends on your jurisdiction
            and use case. Counts this small are also noisy, so use many more samples in practice.
          </p>
          <Callout tone="warn">
            Equal selection rates are not the only definition of fair, and different definitions
            can conflict. Pick the one that fits the harm you are guarding against, and write the
            choice down so reviewers can challenge it.
          </Callout>
        </>
      ),
    },
    {
      id: "moderation",
      title: "Moderation: filter harmful content in and out",
      body: (
        <>
          <p>
            Moderation sits at two points: on the <strong>input</strong> (what users send) and on
            the <strong>output</strong> (what the model says back). Many providers offer a
            moderation endpoint or safety classifier that scores text against categories such as
            hate, harassment, violence, sexual content and self-harm. Open-source classifier
            models exist as well. The category names and scores differ, so read your provider's
            current documentation.
          </p>
          <pre>
            <code>{`BLOCK_AT = 0.80    # tune this on your own labelled data
REVIEW_AT = 0.50

def moderate(text: str) -> str:
    scores = moderation_client.score(text)      # illustrative: category -> 0..1
    worst = max(scores.values())
    if worst >= BLOCK_AT:
        return "block"
    if worst >= REVIEW_AT:
        return "human_review"
    return "allow"`}</code>
          </pre>
          <p>
            The threshold is a trade-off, and you can calculate it. Suppose 1,000 test messages
            include 50 that are truly harmful. Your filter flags 60 messages, and 45 of those are
            truly harmful.
          </p>
          <pre>
            <code>{`precision = true flags / all flags    = 45 / 60 = 0.75
recall    = true flags / all harmful  = 45 / 50 = 0.90`}</code>
          </pre>
          <p>
            Lower the threshold and recall rises (fewer harmful messages slip through) but
            precision falls (more innocent messages blocked). A children's education app may
            accept many false blocks. A medical or legal research tool may not, since blocking a
            question about a drug overdose could harm the very people it should help.
          </p>
          <Callout tone="tip">
            Add a middle band that routes borderline scores to human review instead of choosing
            only between allow and block. It costs a little staff time and removes the hardest
            judgement calls from the automated path.
          </Callout>
        </>
      ),
    },
    {
      id: "humans",
      title: "Keep humans where the stakes are high",
      body: (
        <>
          <p>
            Some decisions should not be fully automated: hiring, lending, medical triage,
            benefits, anything that affects someone&apos;s rights or livelihood. In those cases let
            the model assist and let a person decide, give users a way to contest the outcome, and
            log enough to explain what happened.
          </p>
          <p>A short checklist you can reuse:</p>
          <ul>
            <li>Test with paired prompts across the groups your users belong to.</li>
            <li>Slice evaluation results by language, region and group, not only overall.</li>
            <li>Moderate both input and output, and tune thresholds on your own labelled data.</li>
            <li>Provide a report or appeal path so users can flag bad outputs.</li>
            <li>Re-test after every model or prompt change, because behaviour shifts.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Models inherit patterns from data, and your prompts, documents and tests add more.",
    "Counterfactual pair tests change one irrelevant detail and compare outcomes across many runs.",
    "The impact ratio, lower selection rate over higher, is a screening number, not a verdict.",
    "Moderation thresholds trade precision against recall, so tune them with your own labelled data.",
    "Keep a human in the loop for high-stakes decisions and re-test after every change.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In a counterfactual pair test, what do you change between the two prompts?",
      options: [
        "Everything except the question",
        "Only the detail that should not affect the answer, such as a name",
        "The model provider",
        "The max token limit",
      ],
      answer: 1,
      explain: "Changing one irrelevant detail isolates its effect. If the output shifts, the model is using it.",
    },
    {
      kind: "mcq",
      q: "You lower a moderation threshold so more content is flagged. What most likely happens?",
      options: [
        "Recall falls and precision rises",
        "Precision and recall both fall",
        "Recall rises and precision tends to fall",
        "Nothing changes",
      ],
      answer: 2,
      explain: "A lower threshold catches more harmful content (higher recall) but also flags more harmless content (lower precision).",
    },
    {
      kind: "text",
      q: "Group A has 24 of 30 selected. Group B has 15 of 25 selected. What is the impact ratio (lower rate divided by higher rate) as a decimal?",
      format: "****",
      accept: ["0.75", ".75"],
      explain: "A is 24/30 = 0.80. B is 15/25 = 0.60. The ratio is 0.60 / 0.80 = 0.75.",
    },
    {
      kind: "text",
      q: "A filter flags 40 messages and 30 are truly harmful. What is its precision as a decimal?",
      format: "****",
      accept: ["0.75", ".75"],
      explain: "Precision = true flags ÷ all flags = 30 / 40 = 0.75.",
    },
  ],
};
