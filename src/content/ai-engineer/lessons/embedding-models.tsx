import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Compare hosted and open embedding models on cost, privacy and control",
    "Explain what dimensions and the input token limit mean, and how they affect storage",
    "Compute recall and mean reciprocal rank on a small evaluation set",
    "Follow a repeatable process for choosing and later changing a model",
  ],
  tasks: [
    {
      id: "choices",
      title: "The problem: dozens of models, no obvious winner",
      body: (
        <>
          <p>
            Embeddings power search, classification and retrieval, so the model that makes them
            quietly decides how good your product is. But there are many models, they change often,
            and public rankings are measured on other people's data. A model that tops a chart may
            do worse than a smaller one on your support tickets.
          </p>
          <p>
            This lesson gives you a way to choose that stays useful as models come and go. You
            won't find specific model names here on purpose: check current docs and listings when
            you decide.
          </p>
          <Table
            head={["", "Hosted API models", "Open models you run"]}
            rows={[
              ["Setup", "An API key and a call", "Download weights, run on CPU or GPU"],
              ["Cost shape", "Pay per token processed", "Hardware and operations, then near-free calls"],
              ["Privacy", "Text goes to a provider", "Text stays with you"],
              ["Control", "Provider may retire a model version", "You can pin a model forever"],
              ["Effort", "Lowest", "Higher, but small models run on a laptop"],
            ]}
          />
          <p>
            Both exist across the usual families. Hosted options come from the large providers.
            Open options are published on the Hugging Face Hub, usually under the feature
            extraction or sentence similarity tasks, and can be loaded with libraries such as
            sentence-transformers.
          </p>
        </>
      ),
    },
    {
      id: "properties",
      title: "Properties that matter",
      body: (
        <>
          <p>When you read a model's documentation, look for these.</p>
          <ul>
            <li>
              <strong>Dimensions:</strong> the length of each vector. More dimensions can capture
              more detail but cost more to store and compare.
            </li>
            <li>
              <strong>Input limit:</strong> the maximum number of tokens per text. Text beyond the
              limit is cut off or rejected, so it must be larger than your chunks.
            </li>
            <li>
              <strong>Languages:</strong> some models are English-only, others are multilingual.
              A mismatch quietly ruins results.
            </li>
            <li>
              <strong>Query and document modes:</strong> some models expect a prefix or a setting
              that marks text as a query or a document.
            </li>
            <li>
              <strong>Normalization and metric:</strong> whether vectors come out at length 1, and
              which similarity the model was trained for. Usually cosine.
            </li>
            <li>
              <strong>Flexible dimensions:</strong> some models are trained so that the first part
              of the vector still works on its own. This is often called Matryoshka-style training.
              Those let you truncate vectors to save space and then re-normalize.
            </li>
            <li>
              <strong>License:</strong> for open models, confirm that your use is permitted.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "storage",
      title: "Dimensions and storage cost",
      body: (
        <>
          <p>
            Dimensions turn directly into memory. Using the rule from earlier, each number takes
            4 bytes as a float32:
          </p>
          <Formula>storage = vectors × dimensions × bytes per number</Formula>
          <pre>
            <code>{`1,000,000 vectors, float32 (illustrative sizes):

  384 dims : 1,000,000 × 384  × 4 = 1,536,000,000 B ≈  1.5 GB
  768 dims : 1,000,000 × 768  × 4 = 3,072,000,000 B ≈  3.1 GB
 1536 dims : 1,000,000 × 1536 × 4 = 6,144,000,000 B ≈  6.1 GB
 3072 dims : 1,000,000 × 3072 × 4 = 12,288,000,000 B ≈ 12.3 GB`}</code>
          </pre>
          <p>
            Four times the dimensions means four times the memory, and slower search. Vector
            databases can also compress vectors, for instance by storing 8-bit integers instead of
            32-bit floats, which cuts the size by four at a small accuracy cost.
          </p>
          <p>
            Embedding also has a one-time cost per token. With an illustrative price of $0.10 per
            million tokens, embedding 50,000 documents of 400 tokens each is 20,000,000 tokens, so
            about $2.00. That is cheap, which makes re-embedding after a model change affordable
            for many projects. Check real prices before you plan.
          </p>
        </>
      ),
    },
    {
      id: "evaluate",
      title: "Evaluate on your own data",
      body: (
        <>
          <p>
            The only ranking that counts is the one on your data. Build a small test set of real
            queries and the passages that should answer them, then run each candidate model on it.
            Use two metrics.
          </p>
          <p>
            <strong>Recall at k</strong> asks whether the right passage appears in the top k.{" "}
            <strong>Mean reciprocal rank (MRR)</strong> also rewards putting it first. For each
            query, take 1 divided by the rank of the first correct result, then average.
          </p>
          <Formula>MRR = average of (1 ÷ rank of first correct result)</Formula>
          <p>Worked example with four queries:</p>
          <pre>
            <code>{`query   rank of right answer   reciprocal
  A              1               1.00
  B              2               0.50
  C              4               0.25
  D              1               1.00

MRR = (1.00 + 0.50 + 0.25 + 1.00) / 4 = 2.75 / 4 = 0.6875
recall@3 = 3 of 4 queries found in the top 3 = 0.75`}</code>
          </pre>
          <p>
            Model X may have a higher recall@3 but a lower MRR than model Y. That tells you X finds
            the answer more often, but Y puts it higher up. Which matters more depends on whether a
            person reads the list or an LLM reads all of the top results.
          </p>
          <pre>
            <code>{`def mrr(ranks):
    # ranks: rank of the first correct result per query, or None if missing
    return sum(1 / r for r in ranks if r) / len(ranks)

def recall_at_k(ranks, k):
    return sum(1 for r in ranks if r and r <= k) / len(ranks)

print(mrr([1, 2, 4, 1]), recall_at_k([1, 2, 4, 1], 3))`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "process",
      title: "A process you can repeat",
      body: (
        <>
          <ol>
            <li>List needs: languages, text length, privacy rules, budget, expected volume.</li>
            <li>Shortlist two or three models, including one small and cheap option.</li>
            <li>Build a test set from real queries and run each model on it.</li>
            <li>Compare recall, MRR, latency and storage together, not one number alone.</li>
            <li>Record the model name, version and settings next to the index.</li>
          </ol>
          <Callout tone="warn">
            Never mix vectors from two models in one index, and never query with a different model
            than the one that embedded the documents. Changing models means re-embedding the whole
            collection, so version your index and keep the old one live until the new one is
            tested.
          </Callout>
          <Callout tone="tip">
            Start with a small, cheap model to get the whole pipeline working. Upgrading later is
            a re-index and an evaluation run, and your test set tells you whether it was worth it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Hosted models are easiest; open models give privacy and control. Both can work well.",
    "Check dimensions, input token limit, languages, query and document modes, and license.",
    "Storage is vectors times dimensions times bytes per number, so dimensions drive cost.",
    "Evaluate on your own queries with recall at k and mean reciprocal rank.",
    "Keep one model per index and re-embed everything when you switch.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why compare embedding models on your own data rather than on a public ranking?",
      options: [
        "Public rankings are always wrong",
        "Your documents, queries and language may behave differently from the benchmark's",
        "Open models can't be ranked",
        "Rankings only list hosted models",
      ],
      answer: 1,
      explain: "A model's score on someone else's data doesn't guarantee it fits yours.",
    },
    {
      kind: "mcq",
      q: "You change embedding models. What must you do with the existing index?",
      options: [
        "Keep it and query with the new model",
        "Truncate all vectors to 100 numbers",
        "Mix new and old vectors together",
        "Re-embed every document with the new model",
      ],
      answer: 3,
      explain: "Vectors from different models aren't comparable, so the whole collection must be re-embedded.",
    },
    {
      kind: "text",
      q: "Correct answers appeared at rank 1 for one query and rank 2 for another. What is the MRR? Answer as a decimal.",
      format: "****",
      accept: ["0.75", ".75", "3/4"],
      explain: "(1 + 0.5) ÷ 2 = 0.75.",
    },
    {
      kind: "text",
      q: "How many GB do 500,000 float32 vectors of 1,000 dimensions take? (4 bytes per number)",
      format: "*",
      accept: ["2", "2.0", "2 gb", "2gb"],
      explain: "500,000 × 1,000 × 4 = 2,000,000,000 bytes, which is 2 GB.",
    },
  ],
};
