import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain an embedding as a list of numbers that places meaning in space",
    "Compute a dot product, vector length and cosine similarity by hand",
    "Say when cosine similarity, dot product and Euclidean distance agree",
    "Estimate the memory needed to store a set of embeddings",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: computers match letters, not meaning",
      body: (
        <>
          <p>
            Search for "how do I cancel my plan" in a help centre that only has an article titled
            "Ending your subscription". A keyword search finds nothing, because the two phrases
            share no important words. A person sees at once that they mean the same thing.
          </p>
          <p>
            We need a way for a computer to compare <em>meaning</em>. The trick is to turn text
            into numbers in such a way that similar meanings get similar numbers. Those numbers are
            an <strong>embedding</strong>: a list of numbers, called a <strong>vector</strong>,
            produced by a trained model.
          </p>
          <p>
            Here is an analogy. Imagine a giant library where books are shelved by topic, not by
            title. Cookery sits near gardening, far from tax law. If you knew each book's exact
            shelf position, you could find books about a topic by looking at what sits nearby. An
            embedding is a shelf position, except the library has hundreds or thousands of
            directions instead of two or three.
          </p>
        </>
      ),
    },
    {
      id: "vectors",
      title: "What the vector is",
      body: (
        <>
          <p>
            A vector with two numbers is a point on a flat map. With three it is a point in a room.
            Real embeddings have hundreds or thousands of numbers, which we can't picture, but the
            maths works exactly the same way.
          </p>
          <p>
            The number of values is the <strong>dimension</strong>. It is fixed by the model: every
            text you embed with that model gives a vector of the same length. The individual
            numbers aren't human-readable features such as "is about animals". Meaning lives in the
            pattern across all of them.
          </p>
          <p>
            A model learns this layout during training. It sees huge amounts of text and is nudged
            so that texts used in similar contexts land close together. After training, the layout
            is frozen. You feed in a sentence and get a position out.
          </p>
          <Table
            head={["Text", "Behaviour you hope for"]}
            rows={[
              ["cancel my plan / ending your subscription", "Close together"],
              ["cancel my plan / best pasta recipe", "Far apart"],
              ["The bank raised rates / the river bank flooded", "Different, because context sets the meaning"],
            ]}
          />
        </>
      ),
    },
    {
      id: "similarity",
      title: "Measuring closeness",
      body: (
        <>
          <p>
            "Close" needs a definition. The most common choice is <strong>cosine
            similarity</strong>, which measures the angle between two vectors and ignores their
            length. Pointing the same way means similar meaning.
          </p>
          <Formula>cosine(a, b) = (a · b) ÷ (|a| × |b|)</Formula>
          <p>
            The dot product <code>a · b</code> multiplies matching entries and adds them up. The
            length <code>|a|</code> is the square root of the sum of squares. The result runs from
            -1 (opposite) through 0 (unrelated) to 1 (same direction). Real text embeddings from
            most models mostly land between about 0 and 1.
          </p>
          <p>Worked example in two dimensions. A query q and three documents:</p>
          <pre>
            <code>{`q  = (3, 4)      |q|  = sqrt(9 + 16)  = 5
d1 = (6, 8)      |d1| = sqrt(36 + 64) = 10
d2 = (4, 3)      |d2| = sqrt(16 + 9)  = 5
d3 = (-4, 3)     |d3| = sqrt(16 + 9)  = 5

q·d1 = 18 + 32 = 50    cosine = 50 / (5 × 10) = 1.00
q·d2 = 12 + 12 = 24    cosine = 24 / (5 × 5)  = 0.96
q·d3 = -12 + 12 = 0    cosine = 0  / (5 × 5)  = 0.00`}</code>
          </pre>
          <p>
            Notice d1 is twice as long as q yet scores a perfect 1: it points the same way. d2
            is slightly off-angle, so 0.96. d3 is at a right angle, so 0. Rank by cosine and you
            get d1, d2, d3.
          </p>
          <Callout tone="tip">
            If every vector is scaled to length 1 (normalized), then the dot product equals the
            cosine, and ranking by Euclidean distance gives the same order too. Many embedding
            models return normalized vectors for this reason. Check your model's docs, since a
            plain dot product on unnormalized vectors can be dominated by length.
          </Callout>
        </>
      ),
    },
    {
      id: "code",
      title: "Doing it in code",
      body: (
        <>
          <p>
            Once you have vectors, search is a few lines of NumPy. The function that creates the
            vectors depends on your embedding model, which the next lessons cover, so it appears
            here as a placeholder.
          </p>
          <pre>
            <code>{`import numpy as np

def embed(texts: list[str]) -> np.ndarray:
    """Call your embedding model here. Returns shape (len(texts), dim)."""
    raise NotImplementedError

def normalize(m: np.ndarray) -> np.ndarray:
    return m / np.linalg.norm(m, axis=1, keepdims=True)

docs = ["Ending your subscription", "Best pasta recipe", "Change your password"]
doc_vecs = normalize(embed(docs))

query_vec = normalize(embed(["how do I cancel my plan"]))[0]
scores = doc_vecs @ query_vec          # cosine, because both are unit length
for i in np.argsort(-scores):
    print(round(float(scores[i]), 3), docs[i])`}</code>
          </pre>
          <p>
            For a few thousand vectors this brute-force scan is fast enough. For millions you need
            an index built for nearest-neighbour search, which is what vector databases provide.
          </p>
        </>
      ),
    },
    {
      id: "storage",
      title: "How much memory do embeddings take?",
      body: (
        <>
          <p>
            Each number is usually stored as a 32-bit float, 4 bytes. So one vector costs its
            dimension times 4 bytes, and a collection scales linearly.
          </p>
          <Formula>bytes = vectors × dimensions × 4</Formula>
          <pre>
            <code>{`one 768-dim vector  : 768 × 4            = 3,072 bytes
1,000,000 vectors   : 1,000,000 × 3,072  = 3,072,000,000 bytes ≈ 3.07 GB
(768 is an illustrative dimension)`}</code>
          </pre>
          <p>
            This is why dimension is a real design choice. Doubling it doubles storage and slows
            comparisons. The Embedding Models lesson returns to that trade-off.
          </p>
          <Callout tone="warn">
            Vectors from different models live in different spaces. You can't compare a vector
            from model A with one from model B, even if both have the same dimension. If you
            change models, re-embed everything.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An embedding is a vector produced by a model that places similar meanings near each other.",
    "Cosine similarity compares direction: dot product divided by the product of lengths.",
    "Scores run from -1 to 1; for normalized vectors the dot product equals cosine.",
    "Memory is vectors times dimensions times bytes per number, usually 4.",
    "Vectors from different models are not comparable. Keep one model per index.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does a cosine similarity near 0 between two embeddings suggest?",
      options: [
        "The texts are identical",
        "The texts are unrelated in meaning",
        "The texts are opposite in length",
        "The model failed to run",
      ],
      answer: 1,
      explain: "A right angle between vectors means little shared meaning.",
    },
    {
      kind: "mcq",
      q: "Why is the library-shelf analogy useful?",
      options: [
        "Embeddings sort books alphabetically",
        "Each number is a page count",
        "Position encodes topic, so nearby items are related",
        "Shelves must always hold 768 books",
      ],
      answer: 2,
      explain: "Meaning is encoded as position, and closeness stands for relatedness.",
    },
    {
      kind: "text",
      q: "q = (3, 4) and d = (6, 8). What is the cosine similarity? Answer with a number.",
      format: "*",
      accept: ["1", "1.0", "1.00"],
      explain: "The dot product is 50 and the lengths are 5 and 10, so 50 ÷ 50 = 1. They point the same way.",
    },
    {
      kind: "text",
      q: "How many bytes does one 256-dimension float32 vector take?",
      format: "****",
      accept: ["1024", "1,024"],
      explain: "256 × 4 bytes = 1,024 bytes.",
    },
  ],
};
