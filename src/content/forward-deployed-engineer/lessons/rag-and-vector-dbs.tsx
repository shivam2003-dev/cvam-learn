import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain retrieval-augmented generation (RAG) and when it beats fine-tuning",
    "Describe embeddings, chunking and similarity search",
    "Choose a vector store and improve retrieval quality",
  ],
  tasks: [
    {
      id: "rag",
      title: "Why RAG",
      body: (
        <>
          <p>
            Customers want answers from <em>their</em> documents: policies, manuals, tickets,
            contracts. A model does not know them. <strong>RAG</strong> fetches relevant passages at
            question time and puts them in the prompt, so the model answers from provided text.
          </p>
          <Table
            head={["", "RAG", "Fine-tuning"]}
            rows={[
              ["Adds", "Fresh, private knowledge", "Style, format, behaviour"],
              ["Updating knowledge", "Re-index documents", "Retrain"],
              ["Citations", "Easy, point to sources", "Hard"],
              ["Access control", "Filter per user at retrieval", "Baked into weights"],
              ["Use first when", "Facts change or must be cited", "Behaviour must change"],
            ]}
          />
          <Callout tone="note">
            Start with RAG for knowledge problems. Fine-tune later if the model still cannot follow
            the required format or tone.
          </Callout>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "The pipeline",
      body: (
        <>
          <ol>
            <li>
              <strong>Ingest.</strong> Parse PDFs, HTML, tickets. Clean headers, footers and
              tables.
            </li>
            <li>
              <strong>Chunk.</strong> Split into passages of a few hundred tokens with some
              overlap, along natural boundaries like headings.
            </li>
            <li>
              <strong>Embed.</strong> Convert each chunk to a vector, a list of numbers where
              similar meaning is close together.
            </li>
            <li>
              <strong>Store.</strong> Put vectors and metadata (source, date, permissions) in a
              vector database.
            </li>
            <li>
              <strong>Retrieve.</strong> Embed the question, find the nearest chunks, optionally
              re-rank.
            </li>
            <li>
              <strong>Generate.</strong> Prompt the model with the question and chunks; require
              citations.
            </li>
          </ol>
          <pre>
            <code>{`-- pgvector: nearest chunks to a query embedding, respecting permissions
SELECT id, text, source
FROM chunks
WHERE tenant_id = $1
ORDER BY embedding <=> $2   -- cosine distance
LIMIT 5;`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "quality",
      title: "Vector stores and retrieval quality",
      body: (
        <>
          <Table
            head={["Option", "Good for"]}
            rows={[
              ["pgvector (PostgreSQL)", "Already on Postgres, moderate scale, one system"],
              ["Pinecone, Weaviate, Qdrant", "Large scale, managed or dedicated features"],
              ["Chroma, FAISS, LanceDB", "Prototypes, local and embedded use"],
            ]}
          />
          <p>When answers are poor, debug retrieval before touching the prompt:</p>
          <ul>
            <li>Print the retrieved chunks. Are the right ones there?</li>
            <li>Tune chunk size and overlap; add titles and context to each chunk.</li>
            <li>Combine keyword (BM25) and vector search, then re-rank. Hybrid search often wins.</li>
            <li>Filter with metadata: tenant, date, document type.</li>
            <li>Build a small set of real questions with known answers and measure hit rate.</li>
          </ul>
          <Callout tone="warn">
            Enforce permissions at retrieval. If a user cannot open a document, its chunks must
            never reach the prompt.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "RAG supplies fresh, private, citable knowledge at query time; fine-tuning changes behaviour.",
    "Pipeline: ingest, chunk, embed, store, retrieve, generate with citations.",
    "pgvector is a strong default; dedicated vector stores suit larger scale.",
    "Debug retrieval first, use hybrid search and re-ranking, and enforce permissions in the query.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Policy documents change weekly and answers must cite sources. Best approach?",
      options: ["Fine-tune monthly", "RAG over the documents", "Hard-code answers", "Ignore updates"],
      answer: 1,
      explain: "RAG reflects document updates after re-indexing and can point to the source passage.",
    },
    {
      kind: "mcq",
      q: "RAG answers are wrong. What should you check first?",
      options: [
        "The retrieved chunks",
        "The monitor brightness",
        "The font",
        "The model's name",
      ],
      answer: 0,
      explain: "If retrieval did not surface the right passages, no prompt can fix the answer.",
    },
    {
      kind: "mcq",
      q: "Where should document permissions be enforced?",
      options: [
        "In the model's goodwill",
        "At retrieval, before chunks enter the prompt",
        "After the answer is shown",
        "Nowhere",
      ],
      answer: 1,
      explain: "Anything placed in the prompt can leak into the answer, so filter before it gets there.",
    },
  ],
};
