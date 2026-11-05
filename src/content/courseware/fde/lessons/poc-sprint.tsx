import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers, Sequence, Timeline } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Define a proof of concept by the question it answers, not the features it contains",
    "Plan a two-week POC sprint with daily rhythm, checkpoints and a fixed demo date",
    "Set success criteria and kill criteria before writing code",
    "Build evaluation into the POC so the result is evidence, not an impression",
    "Run the demo and the go/no-go decision",
  ],
  tasks: [
    {
      id: "what",
      title: "What a POC is for",
      body: (
        <>
          <p>
            A <strong>proof of concept</strong> (POC) is an experiment. It exists to answer one question
            that the customer needs answered before committing more money: <em>does this approach work
            well enough, on our real data, to be worth building properly?</em>
          </p>
          <p>
            That framing changes how you run it. A POC is not a smaller version of the final product.
            It is allowed to be ugly, to cover one case, to run on a laptop. What it must be is{" "}
            <strong>honest</strong>: real data, a real measurement, and a result that could have come
            out negative.
          </p>

          <Table
            head={["", "POC", "Pilot", "Production"]}
            rows={[
              ["Question", "Can it work?", "Does it work for real users?", "Can we rely on it?"],
              ["Duration", "1 to 3 weeks", "4 to 12 weeks", "Ongoing"],
              ["Users", "A few, hand-picked", "A real team", "Everyone"],
              ["Quality bar", "Prove feasibility", "Meet the success metric", "Meet SLAs, security, support"],
              ["Throwaway?", "Often", "Partly", "No"],
            ]}
          />

          <Callout tone="warn" title="The POC that quietly becomes production">
            The most dangerous POC is the impressive one. Stakeholders see it work and ask when it can
            launch. Say clearly, from the start, what it is not: no hardening, no security review, no
            scaling. Agree what will be thrown away and what will be kept.
          </Callout>
        </>
      ),
    },
    {
      id: "criteria",
      title: "Write the success and kill criteria first",
      body: (
        <>
          <p>
            Before any code, write down what result would count as success, and what result would
            make you stop. This prevents the common failure of moving the goalposts after seeing the
            output.
          </p>
          <Table
            head={["Type", "Example", "Why it matters"]}
            rows={[
              ["Success criterion", "At least 90% of answers judged correct by two reviewers on 100 real questions", "Defines done in measurable terms"],
              ["Quality floor", "No more than 2% of answers contain an unsupported claim", "Guards against 'impressive but wrong'"],
              ["Cost/latency bound", "Under $0.05 and 6 seconds per answer", "Keeps the result commercially viable"],
              ["Kill criterion", "If accuracy is below 70% after two data fixes, stop and report", "Allows an honest 'no'"],
            ]}
          />
          <p>
            Agree these with the customer in writing. A POC that cannot fail proves nothing, and
            customers learn to trust FDEs who are willing to report a negative result when it is
            warranted.
          </p>

          <Callout tone="tip" title="Create the test set on day one">
            Ask the customer&apos;s experts for 50 to 100 real examples with correct answers (the
            ground truth) before you build. Labelling them yourself invites bias, and discovering at
            the end that nobody can agree on the right answer is a finding in itself.
          </Callout>
        </>
      ),
    },
    {
      id: "plan",
      title: "Plan the sprint",
      body: (
        <>
          <p>
            A two-week POC sprint is short enough to keep focus and long enough to produce evidence.
            Fix the end date first and let scope flex to fit, never the other way round.
          </p>

          <Figure caption="A two-week POC sprint. The demo date is fixed on day one; the plan works backwards from it.">
            <Timeline
              phases={[
                { label: "Days 1 to 2", when: "Set up", tone: "sky", items: ["Access, data and environment", "Success and kill criteria", "Ground-truth test set"] },
                { label: "Days 3 to 6", when: "Thin slice", tone: "lime", weight: 1.3, items: ["End-to-end on one case", "First measurement", "Fix the biggest error class"] },
                { label: "Days 7 to 9", when: "Improve", tone: "lime", weight: 1.3, items: ["Broaden to second case", "Error analysis", "Cost and latency check"] },
                { label: "Day 10", when: "Evidence", tone: "amber", weight: 0.9, items: ["Final measurement", "Freeze the code", "Write the readout"] },
                { label: "Demo", when: "Readout", tone: "plain", weight: 0.8, items: ["Live demo", "Results vs criteria", "Go/no-go"] },
              ]}
            />
          </Figure>

          <p>The daily rhythm matters more than the plan:</p>
          <Figure caption="A daily loop. Short feedback cycles keep a two-week sprint honest.">
            <Flow
              numbered
              steps={[
                { title: "Measure", note: "Run the test set; record the score", tone: "sky" },
                { title: "Find the worst errors", note: "Read the failures, group them", tone: "sky" },
                { title: "Fix the biggest group", note: "One change at a time", tone: "lime" },
                { title: "Re-measure", note: "Did the score move? Did anything regress?", tone: "lime" },
                { title: "Show a user", note: "Ten minutes with a real operator", tone: "amber" },
              ]}
            />
          </Figure>

          <p>
            Do a brief check-in with the customer champion every two or three days. It catches
            misunderstandings early and means the final demo contains no surprises.
          </p>
        </>
      ),
    },
    {
      id: "build",
      title: "Build for learning, not for show",
      body: (
        <>
          <p>
            In a POC every shortcut is allowed except dishonest ones. Hard-code the config, run in a
            notebook, skip authentication. But keep these three things real:
          </p>
          <ul>
            <li>
              <strong>Real data.</strong> Not the clean sample from the vendor. The messy, real thing,
              with its scans, duplicates and odd encodings.
            </li>
            <li>
              <strong>A repeatable measurement.</strong> One command runs the test set and prints the
              score. You should be able to rerun it after any change.
            </li>
            <li>
              <strong>An error log you read.</strong> Look at actual failures, not just the average
              score. Patterns in the failures tell you what to fix.
            </li>
          </ul>

          <Figure caption="The POC stack. Everything above the measurement line may be rough; the measurement line itself must be trustworthy.">
            <Layers
              layers={[
                { title: "Demo surface", note: "A notebook, CLI or one simple page. Looks are irrelevant.", tone: "plain" },
                { title: "Solution logic", note: "Prompts, retrieval, rules, glue code. Change it fast.", tone: "lime" },
                { title: "Measurement harness", note: "Test set, scoring script, results table. Must be correct and repeatable.", tone: "amber" },
                { title: "Real data access", note: "A genuine sample of the customer's data, under agreed handling rules.", tone: "sky" },
              ]}
            />
          </Figure>

          <pre>
            <code>{`# eval.py: one command, one number, a list of failures
import json
from poc import answer          # your POC code

cases = json.load(open("testset.json"))   # [{"q": ..., "expected": ...}, ...]
results = []
for case in cases:
    got = answer(case["q"])
    results.append({"q": case["q"], "ok": judge(got, case["expected"]), "got": got})

score = sum(r["ok"] for r in results) / len(results)
print(f"accuracy: {score:.1%}  ({sum(r['ok'] for r in results)}/{len(results)})")
for r in results:
    if not r["ok"]:
        print("FAIL:", r["q"], "->", r["got"][:120])`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "demo",
      title: "The demo and the decision",
      body: (
        <>
          <p>
            The final session has two parts: show it working, and show the evidence. Both matter, and
            the evidence matters more.
          </p>

          <Figure caption="A POC readout meeting. The decision at the end is the point of the whole sprint.">
            <Sequence
              label="Sequence of a POC readout: recap goal, live demo, results against criteria, limits, decision"
              actors={[
                { id: "fde", label: "FDE" },
                { id: "users", label: "Users" },
                { id: "sponsor", label: "Sponsor" },
              ]}
              messages={[
                { from: "fde", to: "sponsor", text: "Recap the question and the agreed criteria" },
                { from: "fde", to: "users", text: "Live demo on real, unseen cases" },
                { from: "users", to: "fde", text: "Try to break it; ask hard questions", dashed: true },
                { from: "fde", to: "sponsor", text: "Results against each criterion; failures shown honestly" },
                { note: "State clearly what was NOT tested and what would be needed for production.", over: ["fde", "sponsor"] },
                { from: "sponsor", to: "fde", text: "Decision: go, adjust, or stop", dashed: true },
              ]}
            />
          </Figure>

          <p>Structure the readout around the decision the customer must make:</p>
          <ol>
            <li>The question and the criteria (one slide).</li>
            <li>A live demo, preferably on cases the audience supplies on the spot.</li>
            <li>Results table against each success and kill criterion.</li>
            <li>The failure modes you found and what each would take to fix.</li>
            <li>What a pilot would involve: scope, people, time, cost, risks.</li>
            <li>A recommendation and the decision you are asking for.</li>
          </ol>

          <Table
            head={["Result", "Recommendation"]}
            rows={[
              ["All criteria met", "Go to pilot; propose scope, users and timeline"],
              ["Close; a known fixable gap", "Extend the POC briefly for that gap, or pilot with human review"],
              ["Quality met, but cost or latency not", "Explore a smaller model, caching or a different design"],
              ["Kill criterion triggered", "Stop; document what was learned; propose alternatives"],
            ]}
          />

          <Exercise
            title="Write the criteria"
            task={
              <p>
                A customer wants a POC for an AI assistant that extracts the total, due date and
                supplier name from invoices. Write one success criterion, one quality floor, and one
                kill criterion, each measurable.
              </p>
            }
          >
            <ul>
              <li>
                <strong>Success:</strong> at least 95% of the three fields correct on a held-out set
                of 100 real invoices, judged against hand-labelled answers.
              </li>
              <li>
                <strong>Quality floor:</strong> no more than 1% of invoices produce a confident but
                wrong total, since an incorrect payment amount is costly. Low-confidence cases go to
                review.
              </li>
              <li>
                <strong>Kill:</strong> if after fixing the top two error categories accuracy is still
                below 80%, stop and report the cause (for example scan quality).
              </li>
            </ul>
            <p>
              All three can be computed by a script, which is what makes them honest. Note that the
              quality floor is different from overall accuracy: a few confident wrong answers can be
              worse than many abstentions.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A POC answers one feasibility question on real data; it is an experiment that can fail.",
    "Write success criteria, quality floors and kill criteria, and build the test set, before coding.",
    "Fix the demo date first; run a daily loop of measure, find errors, fix, re-measure, show a user.",
    "Roughness is fine except in the data, the measurement and the error review, which must be honest.",
    "End with a readout that reports results against criteria and asks for a clear go/adjust/stop decision.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the primary purpose of a proof of concept?",
      options: [
        "To answer whether an approach works well enough on real data to justify further investment",
        "To deliver a finished product early",
        "To impress executives with polish",
        "To avoid security review",
      ],
      answer: 0,
      explain: "A POC is an experiment that informs a decision, not a mini production system.",
    },
    {
      kind: "mcq",
      q: "Why write kill criteria before building?",
      options: [
        "So the team cannot move the goalposts and can honestly report a negative result",
        "To discourage the customer",
        "To reduce the number of tests",
        "They are required by law",
      ],
      answer: 0,
      explain: "Pre-agreed stop conditions keep the POC honest and make a 'no' an acceptable outcome.",
    },
    {
      kind: "mcq",
      q: "Which part of a POC must NOT be rough?",
      options: [
        "The measurement harness and the data it uses",
        "The user interface",
        "The variable names",
        "The colour scheme",
      ],
      answer: 0,
      explain: "If the measurement is untrustworthy, the whole result is meaningless.",
    },
    {
      kind: "mcq",
      q: "The demo impresses everyone and a sponsor asks to 'launch it Monday'. What should you do?",
      options: [
        "Restate what the POC did not cover and propose a pilot with the missing hardening",
        "Launch it Monday",
        "Deny that the demo worked",
        "Ask for a bonus",
      ],
      answer: 0,
      explain: "A POC lacks security, scaling and support. Make the gap explicit and propose the right next phase.",
    },
    {
      kind: "text",
      q: "A test set has 100 cases and your system gets 87 correct. What is the accuracy as a percentage?",
      format: "**%",
      accept: ["87", "87%", "0.87"],
      explain: "87 / 100 = 87%.",
    },
  ],
};
