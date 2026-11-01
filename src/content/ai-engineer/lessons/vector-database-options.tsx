import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Sort vector stores into libraries, embedded databases, self-hosted servers, managed services and database extensions",
    "Estimate the memory a vector collection needs",
    "Choose a starting option from a few honest questions about your project",
  ],
  tasks: [
    {
      id: "landscape",
      title: "The landscape in five groups",
      body: (
        <>
          <p>
            There are many vector stores and new ones keep appearing. Learning every product is a
            losing game. Learning the <em>categories</em> is not, because the trade-offs inside
            each category stay the same. Features, limits and prices change often, so always check
            current documentation before you commit.
          </p>
          <Table
            head={["Group", "Examples", "What you get", "What you give up"]}
            rows={[
              ["Index library", "FAISS", "Fast in-process search, full control over the index", "It is a library, not a database: you handle persistence, updates and filtering yourself"],
              ["Embedded database", "Chroma, LanceDB", "Runs inside your app or from a local folder, no server to operate", "Scaling beyond one machine takes extra work"],
              ["Self-hosted server", "Qdrant, Weaviate, Milvus", "A dedicated service with rich filtering and scaling options", "You run, monitor and upgrade it"],
              ["Managed service", "Pinecone, hosted tiers of the products above", "No infrastructure to run, scales for you", "Cost grows with usage; data lives with a vendor"],
              ["Extension to a database you have", "pgvector for Postgres, vector search in Elasticsearch, OpenSearch, MongoDB, Redis", "One system, one backup plan, joins with your existing tables", "May not match a specialised engine at very large scale"],
            ]}
          />
          <p>
            Some products fit more than one group. Qdrant, Weaviate and Chroma, for example, each
            offer both self-hosting and a hosted cloud option.
          </p>
        </>
      ),
    },
    {
      id: "profiles",
      title: "A quick profile of the common ones",
      body: (
        <>
          <ul>
            <li>
              <strong>Chroma:</strong> open source and very easy to start with. It can run in
              memory, persist to a local folder, or run as a server. A popular choice for
              prototypes and small apps.
            </li>
            <li>
              <strong>Pinecone:</strong> a fully managed, closed-source service. You create an
              index through an API and the vendor handles the rest.
            </li>
            <li>
              <strong>Weaviate:</strong> open source, with built-in support for combining keyword
              and vector search (hybrid search) and optional modules that call embedding models for
              you.
            </li>
            <li>
              <strong>FAISS:</strong> an open source library from Meta for similarity search,
              offering flat, IVF, HNSW and compressed index types. Excellent building block,
              but you wrap it yourself.
            </li>
            <li>
              <strong>Qdrant:</strong> open source, written in Rust, known for attaching a flexible
              "payload" of metadata to each vector and filtering on it.
            </li>
            <li>
              <strong>LanceDB:</strong> open source and embedded, built on the Lance columnar file
              format, so vectors and ordinary columns live together on disk.
            </li>
            <li>
              <strong>pgvector:</strong> an extension that adds a vector column type and similarity
              operators to PostgreSQL.
            </li>
          </ul>
          <Callout tone="tip">
            If you already run Postgres, try pgvector first. Your vectors sit next to the rows they
            describe, a single SQL query can filter and rank at once, and you add no new service to
            operate.
          </Callout>
        </>
      ),
    },
    {
      id: "pgvector",
      title: "What the code looks like",
      body: (
        <>
          <p>
            Two short examples, to show how different the experience can be. Method names and
            defaults change between versions, so treat these as illustrative.
          </p>
          <p>An embedded database (Chroma), with a local folder for storage:</p>
          <pre>
            <code>{`import chromadb

client = chromadb.PersistentClient(path="./chroma_data")
docs = client.get_or_create_collection("docs")

docs.add(
    ids=["a1", "a2"],
    documents=["Refunds take 5 business days.", "Passwords can be reset in Settings."],
    metadatas=[{"topic": "billing"}, {"topic": "account"}],
)

hits = docs.query(query_texts=["how long do refunds take?"], n_results=1)
print(hits["documents"])`}</code>
          </pre>
          <p>
            When no vectors are passed, Chroma embeds the text with a default embedding function.
            In a real project, choose your embedding model on purpose.
          </p>
          <p>The same idea inside Postgres with pgvector:</p>
          <pre>
            <code>{`CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE docs (
  id        bigserial PRIMARY KEY,
  tenant_id int,
  body      text,
  embedding vector(1536)
);

CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);

-- $1 is the query embedding; <=> is cosine distance (lower is closer)
SELECT id, body
FROM docs
WHERE tenant_id = 7
ORDER BY embedding <=> $1
LIMIT 5;`}</code>
          </pre>
          <p>
            Here the filter and the nearest-neighbour ranking are one ordinary SQL statement.
            That convenience is the main selling point of the extension approach.
          </p>
        </>
      ),
    },
    {
      id: "sizing",
      title: "Size it before you choose",
      body: (
        <>
          <p>
            Fast ANN indexes usually keep vectors, and an index structure, in memory. So a first
            sizing estimate is simply:
          </p>
          <Formula>raw bytes = vectors x dimensions x bytes per number</Formula>
          <p>Worked example with 5,000,000 vectors, 768 dimensions, float32 (4 bytes):</p>
          <pre>
            <code>{`bytes per vector = 768 x 4          = 3,072
raw total        = 5,000,000 x 3,072 = 15,360,000,000 bytes  (about 15.4 GB)

int8 quantized   = 768 x 1 = 768 bytes per vector
raw total        = 5,000,000 x 768   = 3,840,000,000 bytes   (about 3.8 GB)`}</code>
          </pre>
          <p>
            Index structures such as HNSW graphs add overhead on top, so plan for noticeably more
            than the raw figure; how much depends on settings. Storing numbers in fewer bits
            (quantization) cuts memory a lot, at a small cost in accuracy. This one calculation
            often decides the whole question: 100,000 vectors fit in a laptop's memory with room to
            spare, 5 million need real planning, and hundreds of millions call for a distributed
            or disk-based design.
          </p>
        </>
      ),
    },
    {
      id: "choosing",
      title: "A simple way to decide",
      body: (
        <>
          <Table
            head={["If this describes you", "Start with"]}
            rows={[
              ["Learning, prototype, small dataset", "Chroma or LanceDB, running locally"],
              ["Already on Postgres, moderate data size", "pgvector"],
              ["Want zero infrastructure and can pay for it", "A managed service such as Pinecone or a hosted tier"],
              ["Heavy metadata filtering, want to self-host", "Qdrant or Weaviate"],
              ["Research, custom index tuning, batch jobs", "FAISS inside your own code"],
            ]}
          />
          <p>Questions that matter more than benchmarks you read online:</p>
          <ul>
            <li>How many vectors now, and in a year?</li>
            <li>How much filtering do queries need (by user, date, tenant)?</li>
            <li>Do you need hybrid keyword plus vector search?</li>
            <li>Who will operate it, and what are your data residency rules?</li>
            <li>How often does data change: rarely, or constantly?</li>
          </ul>
          <Callout tone="note">
            Avoid locking yourself in. Keep your original documents and chunk text outside the
            vector store. If you ever migrate, you re-embed from the source rather than trying to
            extract vectors from a product that makes that hard.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Think in groups: index library, embedded database, self-hosted server, managed service, database extension.",
    "FAISS is a library, not a full database; Chroma and LanceDB are embedded; Qdrant and Weaviate can be self-hosted; Pinecone is managed; pgvector lives inside Postgres.",
    "Estimate memory with vectors x dimensions x bytes per number, then add index overhead.",
    "Start with the simplest option that meets your scale, and keep source text outside the store.",
    "Check current docs: features, limits and prices change often.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which statement about FAISS is most accurate?",
      options: [
        "It is a managed cloud service",
        "It is a Postgres extension",
        "It is a similarity search library you wrap with your own storage",
        "It can only run on a GPU",
      ],
      answer: 2,
      explain: "FAISS provides index types and search, but persistence, updates and metadata handling are up to you.",
    },
    {
      kind: "mcq",
      q: "Your team already runs PostgreSQL with 200,000 rows to make searchable. What is a sensible first try?",
      options: [
        "pgvector in the existing database",
        "A new multi-node cluster",
        "Writing your own index from scratch",
        "Skipping embeddings entirely",
      ],
      answer: 0,
      explain: "At this size, adding a vector column to existing tables is simple and avoids another system to operate.",
    },
    {
      kind: "text",
      q: "Which PostgreSQL extension adds a vector column type and similarity search? One word.",
      format: "********",
      accept: ["pgvector"],
      explain: "pgvector adds vector types and distance operators to Postgres.",
    },
    {
      kind: "text",
      q: "Raw float32 storage for 5,000,000 vectors of 768 dimensions, in GB (1 GB = 1,000,000,000 bytes). Give the number with two decimals.",
      format: "*****",
      accept: ["15.36"],
      explain: "768 x 4 = 3,072 bytes per vector; 3,072 x 5,000,000 = 15,360,000,000 bytes = 15.36 GB.",
    },
  ],
};
