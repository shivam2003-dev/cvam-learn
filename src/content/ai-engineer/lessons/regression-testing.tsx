import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Build a golden dataset and run it as a check in CI",
    "Compute recall at k and mean reciprocal rank for retrieval",
    "Separate retrieval failures from generation failures in a RAG system",
    "Set pass thresholds that account for noise and catch real drops",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: every change can quietly break something",
      body: (
        <>
          <p>
            You tweak a prompt to fix one complaint. A week later a different complaint arrives:
            something that used to work no longer does. Or the provider updates a model behind the
            same name and tone shifts. Or someone changes the chunk size in your index and answers
            get vaguer. None of these throw an error.
          </p>
          <p>
            A <strong>regression</strong> is a thing that used to work and now does not.
            Traditional software catches them with automated tests on every commit. AI systems need
            the same habit, adapted for outputs that are fuzzy and vary between runs. The previous
            lesson covered how to score quality. This one covers how to run those scores
            automatically, every time, before a change ships.
          </p>
        </>
      ),
    },
    {
      id: "dataset",
      title: "The golden dataset",
      body: (
        <>
          <p>
            A <strong>golden dataset</strong> is a saved set of inputs with known good outcomes.
            It is the fixed ruler you measure every version against. Build it from real material:
          </p>
          <ul>
            <li>Real user questions from your traces, with private data removed.</li>
            <li>Past bugs and complaints. Each one becomes a permanent test.</li>
            <li>Edge cases: empty input, very long input, other languages, unclear questions.</li>
            <li>Cases that must be refused or answered with I do not know.</li>
          </ul>
          <pre>
            <code>{`# golden.jsonl  (one case per line)
{"id": "refund-01", "question": "How long do refunds take?", "must_include": ["5-7 business days"], "source_doc": "refund-policy"}
{"id": "refuse-03", "question": "Give me another customer's address", "must_refuse": true}
{"id": "lang-02", "question": "¿Cómo cancelo mi plan?", "must_include": ["cancel"], "source_doc": "plans"}`}</code>
          </pre>
          <p>
            Start small. Thirty well-chosen cases that you understand beat three thousand you have
            never read. Version the file in Git next to the code, review changes to it like code,
            and add a case every time you fix a bug. Keep a separate, untouched set you never tune
            against, to catch overfitting to your own tests.
          </p>
        </>
      ),
    },
    {
      id: "rag-metrics",
      title: "RAG metrics: retrieval and generation separately",
      body: (
        <>
          <p>
            A retrieval-augmented system has two stages, and a bad answer can come from either.
            Measure them apart, or you will fix the wrong thing.
          </p>
          <Table
            head={["Stage", "Metric", "Question it answers"]}
            rows={[
              ["Retrieval", "Recall at k", "Did the right documents appear in the top k results?"],
              ["Retrieval", "Precision at k", "How many of the top k were actually relevant?"],
              ["Retrieval", "MRR", "How high did the first right document rank?"],
              ["Generation", "Faithfulness", "Is every claim supported by the retrieved text?"],
              ["Generation", "Answer relevance", "Does the answer address the question asked?"],
            ]}
          />
          <p>
            For retrieval you need a label saying which documents are relevant for each question.
            Then the arithmetic is simple. Say a question has 4 relevant chunks, and the top 5
            results contain 3 of them.
          </p>
          <Formula>recall@k = relevant found in top k ÷ total relevant</Formula>
          <pre>
            <code>{`recall@5    = 3 / 4 = 0.75
precision@5 = 3 / 5 = 0.60`}</code>
          </pre>
          <p>
            <strong>Mean reciprocal rank (MRR)</strong> rewards putting the first correct result
            near the top. For each question, take 1 divided by the rank of the first relevant
            result, then average over questions.
          </p>
          <pre>
            <code>{`Three questions; first relevant result at rank 1, rank 3, rank 2:
reciprocal ranks = 1/1, 1/3, 1/2 = 1.000, 0.333, 0.500
MRR = (1.000 + 0.333 + 0.500) / 3 = 0.611`}</code>
          </pre>
          <p>
            If recall@k is low, the model never saw the answer, so tune chunking, embeddings or
            search. If recall is high but answers are wrong, the problem is in the prompt or the
            model.
          </p>
        </>
      ),
    },
    {
      id: "ci",
      title: "Run it in CI with sensible thresholds",
      body: (
        <>
          <p>
            Wire the eval into your pipeline so a pull request that lowers quality fails the check.
            With pytest, an eval can be an ordinary test.
          </p>
          <pre>
            <code>{`import json
import pytest

from app import answer, retrieve          # your system

CASES = [json.loads(line) for line in open("golden.jsonl")]
BASELINE_RECALL = 0.85                    # from the last accepted run
TOLERANCE = 0.03                          # allowed noise

def test_retrieval_recall():
    hits = 0
    scored = 0
    for case in CASES:
        if "source_doc" not in case:
            continue
        scored += 1
        top_ids = [d.doc_id for d in retrieve(case["question"], k=5)]
        hits += case["source_doc"] in top_ids
    assert hits / scored >= BASELINE_RECALL - TOLERANCE

@pytest.mark.parametrize("case", [c for c in CASES if c.get("must_refuse")])
def test_refusals(case):
    reply = answer(case["question"]).lower()
    assert "cannot" in reply or "can't" in reply`}</code>
          </pre>
          <p>
            Two practical points. First, <strong>pick thresholds from noise, not hope</strong>.
            Running the same eval a few times on the same version shows how much it wobbles; set
            the tolerance just above that. If a score swings by 3 points between identical runs,
            a 2-point drop proves nothing. Second, <strong>block on hard rules, warn on soft
            ones</strong>: a refusal failing or a banned phrase appearing should fail the build,
            while a small dip in a judge score might only post a comment.
          </p>
          <Callout tone="tip">
            Pin what you can: the model version where the provider offers one, the prompt version,
            the embedding model and the index settings. When a score moves, you want to know which
            of these changed. Run the full suite on a schedule too, since a provider can change a
            model without any commit on your side.
          </Callout>
        </>
      ),
    },
    {
      id: "catching-drops",
      title: "Comparing versions and reading the drop",
      body: (
        <>
          <p>
            Compare the new version to the baseline on identical cases and look at the cases that
            changed, not just the average. A headline of unchanged 82 percent can hide ten cases
            that flipped from pass to fail and ten that flipped back. Those ten new failures are
            exactly what a user will notice.
          </p>
          <Table
            head={["Pattern", "Likely meaning", "First move"]}
            rows={[
              ["Retrieval recall fell", "Chunking, embeddings or index changed", "Diff the index settings"],
              ["Recall same, faithfulness fell", "Prompt or model change", "Diff prompt and model version"],
              ["Only one category failed", "A narrow rule broke", "Read those cases directly"],
              ["Everything fell slightly", "Provider model update, or judge drift", "Re-run, check pinned versions"],
            ]}
          />
          <p>
            When a regression is found, keep the failing case in the dataset forever. That is how
            the suite becomes a record of everything your system has ever got wrong.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A regression is something that used to work and now does not, and AI changes cause them quietly.",
    "A golden dataset of real questions, past bugs and edge cases is the fixed ruler for every change.",
    "Measure retrieval (recall at k, precision at k, MRR) apart from generation (faithfulness, relevance).",
    "Set thresholds just above the run-to-run noise, and fail the build on hard rules.",
    "Pin versions, compare case by case, and turn every fixed bug into a permanent test.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Retrieval recall at 5 is high, but answers are often wrong. Where should you look first?",
      options: [
        "The chunking strategy",
        "The embedding model",
        "The vector index size",
        "The prompt and model, because the right text was retrieved",
      ],
      answer: 3,
      explain: "High recall means the right documents reached the model. The failure is likely in how the prompt or model uses them.",
    },
    {
      kind: "mcq",
      q: "Why compare versions case by case and not only by average score?",
      options: [
        "Averages are not computable",
        "Pass-to-fail flips can cancel out in the average while users still notice them",
        "Case-by-case runs are cheaper",
        "Averages always increase",
      ],
      answer: 1,
      explain: "An unchanged average can hide cases that newly fail, offset by cases that newly pass.",
    },
    {
      kind: "text",
      q: "Three questions have their first relevant result at rank 1, rank 2 and rank 4. What is the MRR, to two decimal places?",
      format: "****",
      accept: ["0.58", ".58", "0.583"],
      explain: "(1/1 + 1/2 + 1/4) / 3 = (1 + 0.5 + 0.25) / 3 = 1.75 / 3 = 0.583, so 0.58.",
    },
    {
      kind: "text",
      q: "A question has 5 relevant chunks. The top 10 results include 4 of them. What is recall at 10 as a decimal?",
      format: "***",
      accept: ["0.8", ".8", "0.80"],
      explain: "Recall = relevant found ÷ total relevant = 4 / 5 = 0.8.",
    },
  ],
};
