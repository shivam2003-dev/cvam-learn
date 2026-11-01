import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Design a fair comparison between an original and a quantized model",
    "Run a paired significance check on eval results",
    "Find regressions hidden inside an average score",
    "Set a quality gate before looking at the results",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A quantized model almost always looks fine in a quick demo. You ask it five questions,
            the answers read well, and you ship. Two weeks later, support tickets say the JSON tool
            calls are failing or that answers in one language got worse.
          </p>
          <p>
            Quality loss from quantization is subtle and uneven. Treat it like replacing a building
            material: you don't judge the new steel by looking at it. You run load tests, on the same
            rig, against the old steel, with a pass mark agreed in advance.
          </p>
          <p>
            Your job is to answer one question with evidence: <em>is this model good enough to
            replace the original, for our traffic?</em>
          </p>
        </>
      ),
    },
    {
      id: "fair",
      title: "Make the comparison fair",
      body: (
        <>
          <p>
            Change only one thing. Everything else must match, or you'll be measuring the wrong
            difference.
          </p>
          <ul>
            <li>Same tokenizer and chat template.</li>
            <li>Same prompts, in the same order.</li>
            <li>Same <code>temperature</code>, <code>top_p</code>, <code>max_tokens</code> and stop tokens.</li>
            <li>Same engine version, if you can. New engines change defaults.</li>
            <li>
              Use <code>temperature=0</code> for regression checks, so sampling luck doesn't hide or
              invent a difference.
            </li>
          </ul>
          <p>
            Build the eval set from three sources: a public benchmark close to your domain, logged
            real prompts (with privacy handled), and <strong>golden cases</strong>, a hand-picked set
            of prompts your product must never get wrong.
          </p>
          <Callout tone="tip" title="Measure your noise floor">
            Run the original model against itself: two runs, or two batch sizes. Even that shows some
            answer changes, because floating-point results can vary a little with batching. A
            difference between the models smaller than this noise isn't a real finding.
          </Callout>
          <h4>Levels of evidence</h4>
          <Table
            head={["Level", "What you measure", "What it tells you"]}
            rows={[
              ["Logits", "Top-token agreement, KL divergence", "Cheap early warning, not user quality"],
              ["Task score", "Benchmark and golden-case accuracy", "Whether it still does the job"],
              ["Format checks", "Valid JSON, tool-call success, stop behavior", "Whether downstream code still works"],
              ["Live traffic", "Thumbs, retries, task completion", "The final truth, at higher risk"],
            ]}
          />
          <p>
            <strong>KL divergence</strong> measures how far one probability distribution is from
            another. On token probabilities, it gives a quick signal for comparing candidates, but a
            low value doesn't prove users won't notice a change.
          </p>
        </>
      ),
    },
    {
      id: "stats",
      title: "Is the difference real?",
      body: (
        <>
          <p>
            You have 1,000 eval questions. The original scores 86.0%. The quantized model scores
            84.5%. Is 1.5 points a real drop or just chance?
          </p>
          <p>
            Each question was answered by both models, so this is <strong>paired</strong> data. Only
            the disagreements carry information. Questions both got right, or both got wrong, say
            nothing about which model is better.
          </p>
          <Table
            head={["", "Quantized right", "Quantized wrong"]}
            rows={[
              ["Original right", "815", "45"],
              ["Original wrong", "30", "110"],
            ]}
          />
          <p>
            Check: the original got 815 + 45 = 860 right, which is 86.0%. The quantized model got 815
            + 30 = 845, which is 84.5%. McNemar's test compares the two disagreement counts, b and c:
          </p>
          <Formula>McNemar statistic = (b − c)² ÷ (b + c)</Formula>
          <pre>
            <code>{`from scipy.stats import chi2

b = 45  # original right, quantized wrong
c = 30  # original wrong, quantized right

stat = (b - c) ** 2 / (b + c)   # 225 / 75 = 3.0
p_value = chi2.sf(stat, df=1)   # about 0.083
print(round(stat, 2), round(p_value, 3))`}</code>
          </pre>
          <p>
            A p-value of about 0.08 means a gap this large would turn up about 8% of the time if the
            models were truly equal. That's above the usual 5% threshold, so you can't call this a
            proven drop. You also can't call it proof of no drop. The test only says this sample
            doesn't settle it, so more questions would help.
          </p>
          <Callout tone="warn">
            Non-significant doesn't mean identical. Decide the largest loss you'd accept, such as one
            point, and use enough questions to detect a gap of that size. A small eval set passes
            almost anything.
          </Callout>
        </>
      ),
    },
    {
      id: "slices",
      title: "Look inside the average",
      body: (
        <>
          <p>
            An average can stay flat while one group gets much worse. Score each{" "}
            <strong>slice</strong> separately. Useful slices for LLMs include:
          </p>
          <ul>
            <li>Long prompts and long outputs, where small errors have time to compound</li>
            <li>Arithmetic, code generation and exact recall</li>
            <li>Structured output and tool calling</li>
            <li>Languages other than the model's strongest one</li>
            <li>Safety behavior: refusals and policy tests</li>
          </ul>
          <p>
            Also read a sample of the disagreements by hand. Numbers tell you where the problem is.
            Reading tells you what it looks like, such as repetition, early stopping or broken
            formatting.
          </p>
        </>
      ),
    },
    {
      id: "gate",
      title: "Set a gate, then roll out slowly",
      body: (
        <>
          <p>
            Write the pass criteria before you see the results. Otherwise it's easy to talk yourself
            into shipping. Numbers here are illustrative, so set your own.
          </p>
          <pre>
            <code>{`quality_gate:
  overall_accuracy_drop_max: 1.0      # points
  worst_slice_drop_max: 2.0           # points
  golden_cases_pass_rate_min: 100     # percent
  valid_tool_call_rate_min: 99.0      # percent
performance_gate:
  p99_ttft_no_worse_than_baseline: true
  throughput_gain_min: 25             # percent`}</code>
          </pre>
          <p>
            Include a performance gate as well. The point of quantizing was a benefit, so prove you
            got it. A smaller model that is no faster on your hardware has taken a risk for nothing.
          </p>
          <p>Then move through stages, stopping if any stage fails:</p>
          <ol>
            <li>Offline evals against the gate.</li>
            <li><strong>Shadow traffic:</strong> send copies of real requests to the new model, and don't show users the results.</li>
            <li><strong>Canary:</strong> serve a small share of real users and watch the metrics.</li>
            <li>Full rollout, keeping the old model ready for a fast rollback.</li>
          </ol>
          <Callout tone="note">
            Save the eval set, model revision, engine version and results together. When the next
            quantization recipe arrives, you'll be able to compare against a known baseline.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Change one thing at a time, and compare both models on identical prompts and settings.",
    "Measure the original against itself to learn the noise floor.",
    "Use paired tests such as McNemar's; only disagreements carry information.",
    "Averages hide damage, so score slices and read the disagreements.",
    "Fix quality and performance gates in advance, then roll out through shadow and canary stages.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why compare the original model against itself?",
      options: [
        "To warm up the GPU",
        "To estimate how much difference appears from noise alone",
        "To calibrate activation ranges",
        "To fill the KV cache",
      ],
      answer: 1,
      explain: "Any model difference smaller than the self-comparison noise isn't a meaningful finding.",
    },
    {
      kind: "mcq",
      q: "Overall accuracy is flat, but Hindi answers dropped 6 points. What's the right call?",
      options: [
        "Ship, because the average passed",
        "Fix the eval set by deleting Hindi cases",
        "Treat it as a failure if that slice matters to your product",
        "Raise the temperature",
      ],
      answer: 2,
      explain: "Slice gates exist so that an average can't hide serious damage to one group.",
    },
    {
      kind: "text",
      q: "Disagreements are b = 60 and c = 40. What's the McNemar statistic?",
      format: "*",
      accept: ["4", "4.0"],
      explain: "(60 − 40)² ÷ (60 + 40) = 400 ÷ 100 = 4.",
    },
    {
      kind: "text",
      q: "What term means sending copies of real requests to a new model without showing users the results? One word.",
      format: "******",
      accept: ["shadow", "shadowing"],
      explain: "Shadow traffic tests a model on real prompts without any risk to users.",
    },
  ],
};
