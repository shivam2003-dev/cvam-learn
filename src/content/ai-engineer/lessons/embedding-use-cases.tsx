import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Match a problem to an embedding technique: search, classification, recommendation, clustering or anomaly detection",
    "Write a semantic search that ranks documents by cosine similarity",
    "Score a retrieval system with recall at k",
    "Compute a centroid and a distance to flag outliers",
  ],
  tasks: [
    {
      id: "idea",
      title: "One idea, many jobs",
      body: (
        <>
          <p>
            The previous lesson showed that an embedding turns text into a point where nearby
            points mean similar things. That is a small idea with a surprisingly wide reach. Almost
            every use case is the same move: embed things, then ask a question about distances.
          </p>
          <Table
            head={["Use case", "Question about distances", "Typical output"]}
            rows={[
              ["Semantic search", "Which documents are closest to this query?", "A ranked list"],
              ["Classification", "Which labelled group is this nearest to?", "A label"],
              ["Recommendation", "What is closest to things this user liked?", "A short list of items"],
              ["Clustering", "Which items bunch together?", "Groups, often unlabelled"],
              ["Anomaly detection", "Is this far from everything normal?", "A flag or score"],
              ["Deduplication", "Which pairs are almost the same?", "Pairs to merge"],
            ]}
          />
          <p>
            Embeddings are also the retrieval step in many LLM apps, where the closest passages are
            pasted into a prompt. That pattern gets its own lessons later. Here we focus on the
            building blocks.
          </p>
        </>
      ),
    },
    {
      id: "search",
      title: "Semantic search",
      body: (
        <>
          <p>
            Keyword search matches words. Semantic search matches meaning, so "cancel my plan" can
            find "Ending your subscription". The steps are always the same:
          </p>
          <ol>
            <li>Split your content into chunks and embed each one once. Store the vectors.</li>
            <li>At query time, embed the query with the same model.</li>
            <li>Score each chunk against the query and return the top k.</li>
          </ol>
          <pre>
            <code>{`import numpy as np

# embed() calls your embedding model and returns a (n, dim) array
doc_vecs = embed(chunks)
doc_vecs = doc_vecs / np.linalg.norm(doc_vecs, axis=1, keepdims=True)

def search(query: str, k: int = 3):
    q = embed([query])[0]
    q = q / np.linalg.norm(q)
    scores = doc_vecs @ q
    top = np.argsort(-scores)[:k]
    return [(float(scores[i]), chunks[i]) for i in top]`}</code>
          </pre>
          <p>
            Many embedding models are trained for <em>asymmetric</em> search, where a short query
            should find a long passage. Some expect a prefix or an input-type setting that tells
            them whether text is a query or a document. If results look odd, check that first.
          </p>
          <Callout tone="warn">
            Pure semantic search can miss exact strings such as order numbers, error codes or
            product SKUs, because those don't carry much "meaning". Many production systems combine
            keyword and semantic search, which is called hybrid search.
          </Callout>
        </>
      ),
    },
    {
      id: "measure",
      title: "Measuring whether search works",
      body: (
        <>
          <p>
            Don't judge search by trying three queries and feeling good. Build a small test set:
            queries, each paired with the document that should be found. Then compute{" "}
            <strong>recall at k</strong>, the share of queries whose correct document appears in
            the top k results.
          </p>
          <Formula>recall@k = queries with the right document in the top k ÷ total queries</Formula>
          <p>
            Worked example. You test 5 queries with k = 3. For 4 of them the right document is
            among the top three results. For one it is not.
          </p>
          <pre>
            <code>{`recall@3 = 4 / 5 = 0.80`}</code>
          </pre>
          <p>
            Now you can change the chunk size or the embedding model and see whether 0.80 goes up
            or down. Fifty to a few hundred labelled queries from real users make a very useful
            test set.
          </p>
        </>
      ),
    },
    {
      id: "classify",
      title: "Classification and clustering",
      body: (
        <>
          <p>
            Classification with embeddings needs far less labelled data than training a model from
            scratch, because the embedding already captures meaning. Two simple routes:
          </p>
          <ul>
            <li>
              <strong>Nearest centroid:</strong> average the vectors of your labelled examples for
              each class. A new text gets the class whose average it is closest to.
            </li>
            <li>
              <strong>A small classifier on top:</strong> train something like logistic regression
              using the embeddings as input features. This usually works better once you have a
              few hundred examples.
            </li>
          </ul>
          <p>
            <strong>Clustering</strong> has no labels. Run a clustering algorithm such as k-means
            over the vectors and read a few items from each group to name it. It is a quick way to
            explore thousands of support tickets or reviews and see what themes exist.
          </p>
          <p>
            <strong>Recommendation</strong> follows the same pattern. Average the embeddings of
            items a user liked to get a taste vector, then return the nearest items they haven't
            seen yet. Embeddings give you a good cold-start approach for new items, because a new
            item has a vector as soon as it has text.
          </p>
        </>
      ),
    },
    {
      id: "anomaly",
      title: "Anomaly detection",
      body: (
        <>
          <p>
            If normal items cluster together, an item far from that cluster is suspicious. This
            helps with spotting strange log lines, off-topic support requests or fraudulent
            descriptions. Compute the centroid of normal vectors, then measure how far a new one
            sits from it.
          </p>
          <Formula>distance = sqrt( (x1 − x2)² + (y1 − y2)² + ... )</Formula>
          <p>Worked example with tiny two-dimensional vectors. Three normal items:</p>
          <pre>
            <code>{`(1, 1), (3, 1), (2, 4)

centroid x = (1 + 3 + 2) / 3 = 2
centroid y = (1 + 1 + 4) / 3 = 2          → centroid = (2, 2)

new item (5, 6):
distance = sqrt( (5-2)² + (6-2)² ) = sqrt(9 + 16) = 5`}</code>
          </pre>
          <p>
            Is 5 large? Compare it with the normal items' own distances from the centroid. Here
            those are 1.41, 1.41 and 2, so 5 is far outside the normal range. In practice you set
            a threshold from real data, for example a high percentile of the distances of known
            good items.
          </p>
          <Callout tone="tip">
            For every use case, review the borderline results by hand. Embeddings give you a
            ranking, not a verdict. A person reading twenty near-threshold items will teach you more
            about where to set the cutoff than any formula.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Nearly every embedding use case is: embed, then ask a question about distance.",
    "Semantic search embeds chunks once, embeds the query at runtime and returns the top k by cosine.",
    "Measure with a labelled test set and a metric such as recall at k.",
    "Classification, clustering and recommendation use centroids or small models on top of embeddings.",
    "Anomaly detection flags items far from the centroid of normal data. Pair semantic search with keywords for exact terms.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which task uses the distance to the centroid of normal items?",
      options: [
        "Anomaly detection",
        "Semantic search",
        "Summarization",
        "Translation",
      ],
      answer: 0,
      explain: "An item that sits far from where normal items cluster is flagged as unusual.",
    },
    {
      kind: "mcq",
      q: "Why might pure semantic search fail on an order number like ZX-4471?",
      options: [
        "Embeddings can't store digits",
        "Codes carry little meaning, so exact-match keyword search handles them better",
        "The query is always too long",
        "Cosine similarity needs two words",
      ],
      answer: 1,
      explain: "Identifiers need exact matching. Hybrid search covers both meaning and exact strings.",
    },
    {
      kind: "text",
      q: "A test has 10 queries. The right document is in the top 5 for 8 of them. What is recall@5? Answer as a decimal.",
      format: "***",
      accept: ["0.8", "0.80", ".8"],
      explain: "8 ÷ 10 = 0.8.",
    },
    {
      kind: "text",
      q: "The centroid is (2, 2) and a new point is (5, 6). What is the Euclidean distance between them?",
      format: "*",
      accept: ["5"],
      explain: "sqrt(3² + 4²) = sqrt(25) = 5.",
    },
  ],
};
