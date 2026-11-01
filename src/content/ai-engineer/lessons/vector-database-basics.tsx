import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain why searching embeddings needs a specialised index",
    "Compute cosine similarity and Euclidean distance by hand",
    "Contrast exact search with approximate nearest neighbour (ANN) search",
    "Describe what a vector database stores beyond the vectors",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: nearest neighbours at scale",
      body: (
        <>
          <p>
            An embedding turns a piece of text (or an image) into a list of numbers, called a{" "}
            <strong>vector</strong>. Texts with similar meaning end up with vectors that point in
            similar directions. To do semantic search you embed the user's question, then find the
            stored vectors closest to it. This is the <strong>nearest neighbour</strong> problem.
          </p>
          <p>
            The simplest approach is brute force: compare the query with every stored vector. That
            is fine for a few thousand items. It gets painful quickly. Take 1,000,000 stored
            vectors with 1,536 dimensions each (a common size for hosted embedding models):
          </p>
          <pre>
            <code>{`work per query   = 1,000,000 vectors x 1,536 dims = 1,536,000,000 multiply-adds
bytes per vector = 1,536 numbers x 4 bytes (float32) = 6,144 bytes
total storage    = 1,000,000 x 6,144 bytes = 6,144,000,000 bytes (about 6.1 GB)`}</code>
          </pre>
          <p>
            Over a billion operations for every single query, plus several gigabytes to keep in
            fast memory. A <strong>vector database</strong> exists to make this cheap: it stores
            vectors, builds an index so a query touches only a small part of the data, and gives
            you the usual database features around that (updates, filters, persistence).
          </p>
          <p>
            Analogy: finding a book in a library. Brute force is reading every spine. An index is
            the signs on the shelves that send you to the right aisle first.
          </p>
        </>
      ),
    },
    {
      id: "similarity",
      title: "Measuring closeness",
      body: (
        <>
          <p>
            "Closest" needs a definition. Three measures cover almost every case.
          </p>
          <Table
            head={["Measure", "What it looks at", "Higher or lower is closer"]}
            rows={[
              ["Cosine similarity", "The angle between vectors, ignoring length", "Higher (max 1)"],
              ["Dot product", "Angle and length together", "Higher"],
              ["Euclidean (L2) distance", "Straight-line distance between points", "Lower"],
            ]}
          />
          <Formula>cosine(a, b) = (a . b) / (|a| x |b|)</Formula>
          <p>
            Worked example with tiny 3-dimensional vectors, a = (1, 2, 2) and b = (2, 1, 2):
          </p>
          <pre>
            <code>{`a . b   = 1x2 + 2x1 + 2x2 = 2 + 2 + 4 = 8
|a|     = sqrt(1 + 4 + 4) = 3
|b|     = sqrt(4 + 1 + 4) = 3
cosine  = 8 / (3 x 3)     = 0.889

a - b   = (-1, 1, 0)
L2 dist = sqrt(1 + 1 + 0) = 1.414`}</code>
          </pre>
          <p>
            A cosine of 1 means the same direction, 0 means unrelated (at right angles), and -1
            means opposite. If every vector is first scaled to length 1 (many embedding models
            already do this), cosine similarity and dot product give the same ranking, and the dot
            product is cheaper to compute.
          </p>
          <Callout tone="tip">
            Use the metric the embedding model was trained for. The model's documentation says
            which one. Mixing them up quietly lowers result quality without raising any error.
          </Callout>
        </>
      ),
    },
    {
      id: "brute-force",
      title: "Exact search in a few lines",
      body: (
        <>
          <p>
            Before reaching for a database, it helps to see exact search. This version uses NumPy
            and scans everything. It is a real, working baseline and a good way to check an
            approximate index later.
          </p>
          <pre>
            <code>{`import numpy as np

def top_k(query: np.ndarray, matrix: np.ndarray, k: int = 3):
    """Exact cosine search. matrix has one stored vector per row."""
    q = query / np.linalg.norm(query)
    m = matrix / np.linalg.norm(matrix, axis=1, keepdims=True)
    scores = m @ q                      # one cosine score per row
    best = np.argsort(-scores)[:k]      # indices of the k highest scores
    return best, scores[best]`}</code>
          </pre>
          <p>
            This is called a <strong>flat index</strong>. It is perfectly accurate (100% of the
            true nearest neighbours are found) and its cost grows in a straight line with the
            number of vectors. Many teams run flat search happily up to tens of thousands of
            items.
          </p>
        </>
      ),
    },
    {
      id: "ann",
      title: "Approximate search: trading a little accuracy for speed",
      body: (
        <>
          <p>
            To go beyond that, vector databases use <strong>approximate nearest neighbour</strong>{" "}
            (ANN) algorithms. They may miss a true neighbour now and then, but they look at far
            fewer vectors. The share of true neighbours they actually return is called{" "}
            <strong>recall</strong>. A recall of 0.95 means 95 of the true top 100 were found.
          </p>
          <Table
            head={["Index idea", "How it works", "Main trade-off"]}
            rows={[
              ["Flat", "Compare against everything", "Exact, but slow at scale"],
              ["IVF (inverted file)", "Group vectors into clusters; search only the nearest few clusters", "Fast; may miss items sitting in a neighbouring cluster"],
              ["HNSW (graph)", "Connect each vector to near neighbours in layered graphs; walk the graph toward the query", "Very fast and accurate; uses more memory"],
              ["Quantization (e.g. PQ)", "Store compressed, lower-precision vectors", "Much less memory; slightly lower accuracy"],
            ]}
          />
          <p>
            Worked example for IVF. Split 1,000,000 vectors into 1,000 clusters, so each holds about
            1,000. At query time, find the closest cluster centres, then scan only the 10 nearest
            clusters:
          </p>
          <pre>
            <code>{`vectors scanned = 10 clusters x 1,000 vectors = 10,000
share of data   = 10,000 / 1,000,000 = 1%`}</code>
          </pre>
          <p>
            That is about a hundred times less work than flat search. The catch: if the best match
            lives in the 11th-closest cluster, you miss it. Scanning more clusters raises recall
            and raises latency. Almost every ANN index has a knob like this, so tuning means
            choosing a point on a speed versus recall curve for your data.
          </p>
          <Callout tone="note">
            HNSW stands for Hierarchical Navigable Small World. The idea is a skip-list for
            geometry: coarse upper layers jump across the space, and the dense bottom layer refines
            the answer.
          </Callout>
        </>
      ),
    },
    {
      id: "database",
      title: "More than an index: what a vector database adds",
      body: (
        <>
          <p>An index alone is not a database. A vector database usually also provides:</p>
          <ul>
            <li>
              <strong>Records:</strong> an id, the vector, the original text or a pointer to it, and
              metadata such as source, date or tenant.
            </li>
            <li>
              <strong>Metadata filtering:</strong> "nearest vectors where language is English and
              year is at least 2023".
            </li>
            <li>
              <strong>Updates and deletes:</strong> add, change and remove records without
              rebuilding everything.
            </li>
            <li>
              <strong>Persistence and scaling:</strong> data survives restarts, and larger
              deployments can be split across machines.
            </li>
          </ul>
          <p>A typical query, in provider-neutral pseudocode, looks like this:</p>
          <pre>
            <code>{`results = store.search(
    vector=embed("how do I reset my password?"),
    top_k=5,
    filter={"product": "billing", "lang": "en"},
)
for r in results:
    print(r.score, r.metadata["source"], r.text[:80])`}</code>
          </pre>
          <p>
            Every product spells this differently, so treat the snippet as illustrative and check
            your chosen database's docs.
          </p>
          <Callout tone="warn">
            Vectors from different embedding models are not comparable. If you switch models, you
            must re-embed and re-index everything, and the new vectors may even have a different
            number of dimensions.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A vector database stores embeddings and finds the nearest ones to a query efficiently.",
    "Cosine similarity compares direction; Euclidean distance compares position; use the metric your model expects.",
    "Flat search is exact but its cost grows with every vector; ANN indexes (IVF, HNSW) trade a little recall for big speedups.",
    "Real systems also need metadata filters, updates and persistence, not just an index.",
    "Never mix vectors from different embedding models in one index.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does approximate nearest neighbour search give up in exchange for speed?",
      options: [
        "It may occasionally miss a true nearest neighbour",
        "It can only store text, not vectors",
        "It cannot use metadata",
        "It needs a new embedding model for every query",
      ],
      answer: 0,
      explain: "ANN indexes look at fewer vectors, so recall can fall slightly below 100%.",
    },
    {
      kind: "mcq",
      q: "Vectors a = (1, 0) and b = (0, 1) are compared. What is true of their cosine similarity?",
      options: [
        "It is 1, the vectors are identical",
        "It is -1, the vectors are opposite",
        "It is 0.5",
        "It is 0, the vectors are at right angles",
      ],
      answer: 3,
      explain: "The dot product is 1x0 + 0x1 = 0, so the cosine is 0.",
    },
    {
      kind: "text",
      q: "A float32 number takes 4 bytes. How many bytes does one 1,536-dimension float32 vector take? Digits only.",
      format: "****",
      accept: ["6144", "6,144"],
      explain: "1,536 x 4 = 6,144 bytes.",
    },
    {
      kind: "text",
      q: "What does the first A in ANN stand for? One word.",
      format: "***********",
      accept: ["approximate"],
      explain: "ANN means approximate nearest neighbour.",
    },
  ],
};
