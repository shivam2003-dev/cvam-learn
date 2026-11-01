import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Hard",
  objectives: [
    "Diagnose whether a bad RAG answer is a retrieval problem or a generation problem",
    "Combine keyword and vector search with reciprocal rank fusion",
    "Explain how reranking, filters, query rewriting and richer chunks each improve results",
    "Improve a system one measured change at a time",
  ],
  tasks: [
    {
      id: "diagnose",
      title: "Diagnose before you tune",
      body: (
        <>
          <p>
            A first RAG prototype usually works on the demo questions and disappoints on real ones.
            The urge is to change everything at once: new embedding model, bigger chunks, a fancier
            prompt. Resist it. You will not know which change helped.
          </p>
          <p>Start by asking, for a failing question: was the right text in the retrieved set?</p>
          <Table
            head={["What you see", "Likely cause", "Where to look"]}
            rows={[
              ["Right chunk was never retrieved", "Retrieval failure", "Chunking, embedding model, search method, filters"],
              ["Right chunk retrieved but ranked low or cut off by k", "Ranking failure", "Reranking, k, hybrid search"],
              ["Right chunk in the prompt, answer still wrong", "Generation failure", "Prompt wording, too much noise, model choice"],
              ["Answer is right but cites the wrong source", "Attribution failure", "Source labelling, citation instructions"],
              ["Confident answer where no document exists", "Missing refusal behaviour", "Score threshold, 'I don't know' instruction"],
            ]}
          />
          <Callout tone="tip">
            Build a small evaluation set of 30 to 100 real questions with the chunks that answer
            them. Re-run it after every change. Without it you are guessing, with it you are
            engineering.
          </Callout>
        </>
      ),
    },
    {
      id: "hybrid",
      title: "Hybrid search: keywords plus vectors",
      body: (
        <>
          <p>
            Vector search is good at meaning: "cancel my plan" finds "terminate your subscription".
            It is weaker at exact tokens: error codes, product SKUs, names, acronyms. Classic
            keyword search (often BM25, a scoring method based on term frequency) is the reverse.
            <strong> Hybrid search</strong> runs both and merges the lists.
          </p>
          <p>
            The two scores live on different scales, so adding them directly is awkward. A popular,
            simple fix is <strong>reciprocal rank fusion (RRF)</strong>, which uses only each
            document's rank in each list:
          </p>
          <Formula>RRF score = sum over lists of 1 / (k + rank)</Formula>
          <p>
            The constant k is commonly set to 60. It softens the gap between the very top ranks.
            Worked example with two documents:
          </p>
          <pre>
            <code>{`                 vector rank   keyword rank
Document A            1             3
Document B            2             1

A = 1/(60+1) + 1/(60+3) = 0.016393 + 0.015873 = 0.032266
B = 1/(60+2) + 1/(60+1) = 0.016129 + 0.016393 = 0.032522

B ranks first: it did well in both lists, and was best in one.`}</code>
          </pre>
          <p>
            A document that appears in only one list still gets a score, just a smaller one. Some
            databases offer hybrid search built in; if yours does not, RRF is a few lines of code.
          </p>
          <pre>
            <code>{`def rrf(ranked_lists, k=60):
    scores = {}
    for ranking in ranked_lists:                  # each is a list of doc ids, best first
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "rerank",
      title: "Reranking: retrieve wide, then choose carefully",
      body: (
        <>
          <p>
            The embeddings used for first-stage search encode the query and each chunk
            <em> separately</em>, which is what makes search fast. The price is precision. A{" "}
            <strong>reranker</strong> (often a cross-encoder model) reads the query and one
            candidate <em>together</em> and outputs a relevance score. That is slower per item but
            much sharper.
          </p>
          <p>The usual recipe is two stages:</p>
          <ol>
            <li>Fast retrieval returns a wide set, for example the top 50 candidates.</li>
            <li>The reranker scores those 50 and you keep the best 5 for the prompt.</li>
          </ol>
          <p>
            You pay extra latency and cost for 50 reranker calls, but you send fewer, better chunks
            to the generation model, which can offset it. Rerankers are available as hosted APIs
            and as open models you can run yourself. Measure whether the quality gain on your own
            evaluation set justifies the added delay.
          </p>
        </>
      ),
    },
    {
      id: "query",
      title: "Fixing the query and the chunks",
      body: (
        <>
          <ul>
            <li>
              <strong>Query rewriting.</strong> A follow-up such as "and what about for teams?"
              means nothing alone. Have a model rewrite it into a standalone question using the
              conversation, then search with that.
            </li>
            <li>
              <strong>Query expansion or multi-query.</strong> Generate several phrasings of the
              question, search with each, and merge the results with RRF. This helps when users and
              documents use different words.
            </li>
            <li>
              <strong>HyDE (hypothetical document embeddings).</strong> Ask a model to write a short
              imagined answer, then embed that instead of the question. An answer often sits closer
              to real passages than a question does. It can also drift, so test it.
            </li>
            <li>
              <strong>Metadata filters.</strong> Narrow by product, version, date or tenant before
              ranking. Old versions of a document answering a question about the new version are a
              classic failure.
            </li>
            <li>
              <strong>Contextual chunks.</strong> Prepend the title and heading, or a one-line
              summary of the surrounding document, to each chunk before embedding.
            </li>
            <li>
              <strong>Parent-child retrieval.</strong> Search small chunks for precision, but hand
              the model the larger parent section they came from, for context.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "process",
      title: "A disciplined improvement loop",
      body: (
        <>
          <ol>
            <li>Collect failing real questions and note the correct source passage for each.</li>
            <li>Measure retrieval (recall@k, MRR) and answer quality on the whole set.</li>
            <li>Change <em>one</em> thing: chunk size, hybrid search, a reranker, a filter.</li>
            <li>Re-measure. Keep the change only if the numbers improve without hurting other questions.</li>
            <li>Repeat, and log what you tried so you do not retry old ideas.</li>
          </ol>
          <Table
            head={["Change", "Typically helps", "Typical cost"]}
            rows={[
              ["Hybrid search", "Exact terms, IDs, rare words", "Second index to maintain"],
              ["Reranking", "Ordering of the top results", "Extra latency and calls"],
              ["Query rewriting", "Multi-turn chats, vague questions", "An extra model call per question"],
              ["Better chunks and metadata", "Almost everything", "Re-indexing the corpus"],
              ["Bigger k with a reranker", "Recall", "More candidates to score"],
            ]}
          />
          <Callout tone="warn">
            Beware of overfitting to your test set. If you tune until 40 questions pass, then add
            new real questions and the score falls, that is normal. Keep a fresh set that you
            never tune against, and refresh the sets from real user traffic over time.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "First decide whether a failure is retrieval, ranking or generation; each has different fixes.",
    "Hybrid search covers exact terms that vectors miss, and reciprocal rank fusion merges lists by rank.",
    "A reranker rescoring a wide candidate set sharpens the final few chunks.",
    "Query rewriting, filters, richer chunks and parent-child retrieval fix common failure modes.",
    "Change one thing at a time and measure on an evaluation set you keep fresh.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Users search for an error code like 'E-4417' and vector search returns loosely related pages. Which fix fits best?",
      options: [
        "Lower the temperature of the model",
        "Add keyword search to make it hybrid",
        "Make chunks much larger",
        "Remove metadata",
      ],
      answer: 1,
      explain: "Exact identifiers are where keyword matching is strong and embeddings are weak, so combining them helps.",
    },
    {
      kind: "mcq",
      q: "What is the usual two-stage recipe for reranking?",
      options: [
        "Rerank the whole corpus, then embed the winners",
        "Retrieve about 5, then rerank 50",
        "Retrieve a wide candidate set, rerank it, keep the best few",
        "Rerank first, then chunk",
      ],
      answer: 2,
      explain: "Fast retrieval finds many candidates cheaply, and the slower, sharper reranker picks the few that go into the prompt.",
    },
    {
      kind: "text",
      q: "With RRF constant k = 60, a document at rank 1 in one list only scores 1 / 61. Give it to 4 decimal places.",
      format: "******",
      accept: ["0.0164", ".0164"],
      explain: "1 / 61 = 0.016393, which rounds to 0.0164.",
    },
    {
      kind: "text",
      q: "What is the name of the model that reads a query and a candidate chunk together and scores their relevance? One word.",
      format: "********",
      accept: ["reranker", "re-ranker", "reranking", "cross-encoder", "crossencoder", "cross encoder"],
      explain: "A reranker (often a cross-encoder) scores each query and candidate pair jointly.",
    },
  ],
};
