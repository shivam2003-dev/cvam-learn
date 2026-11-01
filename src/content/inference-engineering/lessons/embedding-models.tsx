import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Explain what an embedding is and how similarity is measured",
    "Compare BERT-style and LLM-based embedding models",
    "Describe pooling, truncation and normalization",
    "Calculate the storage cost of vector dimensions",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A keyword search for "refund policy" won't find a page titled "How to get your money
            back". The words differ, but the meaning is the same. Computers need a way to compare
            meaning.
          </p>
          <p>
            An <strong>embedding model</strong> turns text into a list of numbers called a{" "}
            <strong>vector</strong>. Texts with similar meanings get vectors that sit close
            together. Think of a map where every sentence has a location. "Refund policy" and
            "money back" are neighbours. "Quantum physics" is in another city. Real maps have
            hundreds or thousands of dimensions, not two.
          </p>
          <p>
            Embeddings power semantic search, retrieval for RAG, recommendations, clustering and
            duplicate detection. Unlike an LLM, an embedding model produces no text. One input
            goes in, and one vector comes out.
          </p>
        </>
      ),
    },
    {
      id: "similarity",
      title: "Measuring similarity",
      body: (
        <>
          <p>
            The most common measure is <strong>cosine similarity</strong>, which compares the
            direction of two vectors and ignores their length:
          </p>
          <Formula>cosine similarity = (a · b) ÷ (|a| × |b|)</Formula>
          <p>
            Here, a · b is the dot product: multiply matching numbers, then add the results. A
            score of 1 means the same direction, and 0 means unrelated. Try two tiny vectors, a =
            (3, 4) and b = (4, 3):
          </p>
          <pre>
            <code>{`a · b  = (3 × 4) + (4 × 3) = 24
|a|    = √(9 + 16) = 5
|b|    = √(16 + 9) = 5
Cosine = 24 ÷ (5 × 5) = 0.96`}</code>
          </pre>
          <p>
            Models or libraries often <strong>normalize</strong> vectors to a length of 1. Then
            the dot product equals cosine similarity, which makes search simpler and faster.
          </p>
        </>
      ),
    },
    {
      id: "bert-style",
      title: "BERT-style models",
      body: (
        <>
          <p>
            <strong>BERT</strong> is a transformer encoder, the classic design for embeddings. It
            reads the entire text in a single pass, and each token can attend to tokens on both
            sides. There's no decode loop and no KV cache, so inference is simple.
          </p>
          <p>
            The encoder outputs one vector per token, but you want one vector per text. Combining
            them is called <strong>pooling</strong>:
          </p>
          <ul>
            <li>
              <strong>Mean pooling:</strong> average all the token vectors.
            </li>
            <li>
              <strong>CLS pooling:</strong> use the vector of a special first token.
            </li>
            <li>
              <strong>Last-token pooling:</strong> use the final token's vector, which is common
              in LLM-based models.
            </li>
          </ul>
          <p>
            Models are trained for one pooling method, so use the one on the model card. The
            wrong choice won't raise an error. It will just quietly give you worse results.
          </p>
          <p>
            A small model, all-MiniLM-L6-v2, outputs 384 dimensions. It's cheap enough to run on a
            CPU. Larger encoders such as BGE-M3 output 1,024 dimensions and handle longer text.
          </p>
          <pre>
            <code>{`from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
vectors = model.encode(
    ["How do I get a refund?", "Refund policy"],
    normalize_embeddings=True,
)
print(vectors.shape)  # (2, 384)
print(vectors[0] @ vectors[1])  # dot product equals cosine here`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "llm-based",
      title: "LLM-based models",
      body: (
        <>
          <p>
            Newer embedding models are often adapted from LLMs. Instead of generating text, they
            run the input through the model once and pool the hidden states. Qwen3-Embedding and
            EmbeddingGemma are two open examples.
          </p>
          <Table
            head={["", "BERT-style", "LLM-based"]}
            rows={[
              ["Foundation", "Encoder made for representations", "Language model adapted for embedding"],
              ["Attention", "Usually both directions", "Often only earlier tokens"],
              ["Pooling", "Usually mean or CLS", "Last token or mean"],
              ["Typical size", "Often small", "Often larger"],
              ["Decode loop", "None", "None, it's one forward pass"],
            ]}
          />
          <p>
            These are tendencies, not strict rules. The key point for serving is the last row.
            Though it comes from an LLM, an embedding model runs only one forward pass. So you
            get no KV cache and no streaming. Serving looks more like a classifier than a chatbot.
          </p>
          <Callout tone="warn">
            If a model uses last-token pooling, padding side matters. With right padding in a
            batch, the "last token" may be padding, unless the code finds the true end of each
            text. Prefer the pooling code from the model's own instructions.
          </Callout>
          <p>
            Many models also expect an instruction or prefix. The E5 family, for example, wants{" "}
            <code>query: </code> before questions and <code>passage: </code> before documents.
            Leave that out and retrieval quality can fall, again with no error.
          </p>
        </>
      ),
    },
    {
      id: "practical",
      title: "Dimensions, limits and lock-in",
      body: (
        <>
          <p>Vector storage grows directly with dimensions:</p>
          <Formula>storage ≈ vectors × dimensions × bytes per value</Formula>
          <p>With standard 32-bit floats, which take 4 bytes each:</p>
          <Table
            head={["Vectors", "Dimensions", "Raw storage"]}
            rows={[
              ["10 million", "384", "15.36 GB"],
              ["10 million", "1,024", "40.96 GB"],
            ]}
          />
          <p>
            A vector index adds its own overhead on top. Some models are trained so that you can
            cut their vectors short and renormalize, which trades a little accuracy for storage.
            Check that yours supports this before doing it.
          </p>
          <p>
            Every model also has a maximum input length. For example, all-MiniLM-L6-v2 stops at
            256 tokens by default. Longer text is usually <strong>truncated</strong>, meaning cut
            off with no warning. That's why documents are split into chunks before embedding.
          </p>
          <Callout tone="warn" title="Vectors are locked to their model">
            Vectors from different models can't be compared, even when they have the same number
            of dimensions. Upgrading your model means re-embedding your entire corpus. Store the
            model name and version with every vector.
          </Callout>
          <Callout tone="tip">
            Pick models with your own data. Build a small set of real queries and the documents
            that should match, then measure how often the right one comes back.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Embedding models turn text into vectors, so similar meanings sit close together.",
    "Cosine similarity compares direction, and normalized vectors can use the dot product.",
    "BERT-style and LLM-based models both run one forward pass, with no decode loop.",
    "Pooling, prefixes and truncation fail silently, so follow the model card.",
    "Vectors are tied to their model, so changing it means re-embedding everything.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does an embedding model need no KV cache?",
      options: [
        "It runs one forward pass, with no token-by-token generation",
        "Its vectors are stored on disk",
        "It has no attention layers",
        "It only runs on CPUs",
      ],
      answer: 0,
      explain: "A KV cache saves work across decode steps. Embedding has no decode steps.",
    },
    {
      kind: "mcq",
      q: "You upgrade your embedding model to one with the same dimensions. What must you do with the existing vectors?",
      options: [
        "Nothing, since dimensions match",
        "Renormalize them",
        "Re-embed the corpus with the new model",
        "Average old and new vectors at query time",
      ],
      answer: 2,
      explain: "Each model has its own space, so the same dimension count doesn't make vectors comparable.",
    },
    {
      kind: "text",
      q: "What's the cosine similarity of a = (1, 0) and b = (0, 1)?",
      format: "*",
      accept: ["0"],
      explain: "The dot product is 0, so the vectors point in unrelated directions.",
    },
    {
      kind: "text",
      q: "You store 1 million vectors of 768 dimensions, at 4 bytes per value. How many GB of raw storage is that? Use 1 GB = 1,000,000,000 bytes.",
      format: "*****",
      accept: ["3.072", "3.07", "3.07 gb", "3.072 gb", "3.072gb"],
      explain: "1,000,000 × 768 × 4 = 3,072,000,000 bytes, which is 3.072 GB.",
    },
  ],
};
