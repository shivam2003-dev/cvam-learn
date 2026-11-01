import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why documents are split into chunks and what makes a chunk good",
    "Calculate chunk counts and storage overhead from size and overlap",
    "Compare fixed-size, recursive, structure-aware and semantic chunking",
    "Build an indexing step that stores text, vectors and metadata, and keeps them current",
  ],
  tasks: [
    {
      id: "why",
      title: "Why we split documents at all",
      body: (
        <>
          <p>
            You can't embed a whole 80-page manual as one vector and expect useful search. A
            single embedding squeezes all the text into one point, so the specific detail you
            want, say a refund deadline on page 41, gets averaged away with everything else. Many
            embedding models also cap how much text they accept per input.
          </p>
          <p>
            So we split documents into <strong>chunks</strong>, embed each chunk separately, and
            retrieve at chunk level. The chunk is the unit of retrieval. It is also what ends up in
            the model's prompt, so it has to make sense on its own.
          </p>
          <p>Two forces pull in opposite directions:</p>
          <Table
            head={["Chunks too small", "Chunks too large"]}
            rows={[
              ["Lose surrounding context; a sentence like 'It expires after 30 days' means nothing alone", "Embedding blurs several topics into one vector, so search gets vague"],
              ["More vectors to store and search", "Each retrieved chunk burns more of the prompt budget"],
              ["Answers split across chunks may be missed", "Irrelevant text rides along with the relevant part"],
            ]}
          />
          <p>
            There's no universal best size. A common starting range is a few hundred tokens per
            chunk, then you measure on your own questions and adjust.
          </p>
        </>
      ),
    },
    {
      id: "overlap",
      title: "Overlap and the arithmetic of chunk counts",
      body: (
        <>
          <p>
            If you cut text at fixed positions, you will sometimes cut a sentence, or an answer, in
            half. <strong>Overlap</strong> repeats the end of one chunk at the start of the next, so
            text near a boundary appears whole in at least one chunk. The distance between chunk
            starts is the <strong>stride</strong>.
          </p>
          <Formula>stride = chunk size - overlap</Formula>
          <Formula>chunks = ceil((document length - overlap) / stride)</Formula>
          <p>Worked example: a 10,000-token document, chunk size 500, overlap 100.</p>
          <pre>
            <code>{`stride  = 500 - 100 = 400
chunks  = ceil((10,000 - 100) / 400) = ceil(24.75) = 25

chunk 1 covers tokens 0-500, chunk 2 covers 400-900, ... chunk 25 covers 9,600-10,000
tokens stored = 24 x 500 + 400 = 12,400   (24% more than the original 10,000)`}</code>
          </pre>
          <p>
            Overlap costs storage and a little extra embedding work. A common rule of thumb is an
            overlap of roughly 10 to 20 percent of the chunk size, but treat that as a starting
            point to test, not a law.
          </p>
          <pre>
            <code>{`def chunk_words(text: str, size: int = 200, overlap: int = 40) -> list[str]:
    """Sliding window over words. Simple, and good enough for a first version."""
    words = text.split()
    step = size - overlap
    chunks = []
    for start in range(0, len(words), step):
        chunks.append(" ".join(words[start:start + size]))
        if start + size >= len(words):   # this window reached the end
            break
    return chunks`}</code>
          </pre>
          <Callout tone="note">
            Count in tokens when you can, because embedding limits and prompt budgets are measured
            in tokens, not words. Words are a rough stand-in: one English word is often a bit over
            one token.
          </Callout>
        </>
      ),
    },
    {
      id: "strategies",
      title: "Chunking strategies",
      body: (
        <>
          <Table
            head={["Strategy", "How it cuts", "Good for", "Watch out for"]}
            rows={[
              ["Fixed size", "Every N tokens or characters", "Quick baselines, uniform text", "Cuts mid-sentence or mid-table"],
              ["Recursive", "Try big separators first (sections, paragraphs), fall back to sentences, then words, until pieces fit", "A strong general default for prose", "Still blind to meaning"],
              ["Structure-aware", "Follow headings, list items, code functions, table rows", "Markdown, HTML, source code, legal clauses", "Needs a parser per format"],
              ["Sentence or paragraph", "Group whole sentences up to a size", "Clean, readable chunks", "Uneven sizes"],
              ["Semantic", "Start a new chunk where embedding similarity between neighbouring sentences drops", "Documents that wander between topics", "Extra embedding cost, results vary"],
            ]}
          />
          <p>
            For most projects, start with recursive splitting that respects headings and
            paragraphs. Libraries such as LangChain and LlamaIndex ship ready-made splitters, but
            the idea is simple enough to write yourself when you need control.
          </p>
          <Callout tone="tip">
            Prepend the document title and section heading to each chunk's text before embedding,
            for example "Refund Policy / Digital goods: ...". The chunk then carries its own
            context, which often helps retrieval for very little effort.
          </Callout>
          <p>
            Special content needs special handling. Keep a table together with its header row.
            Don't split a code block mid-function. For scanned PDFs, run text extraction first and
            check the output by eye: broken extraction is a very common hidden cause of poor RAG.
          </p>
        </>
      ),
    },
    {
      id: "indexing",
      title: "Indexing: what to store per chunk",
      body: (
        <>
          <p>
            Indexing means embedding every chunk and writing it to the vector store. Store more
            than just the vector. Each record should carry:
          </p>
          <ul>
            <li>
              <strong>An id</strong> that is stable, for example a hash of source plus position.
            </li>
            <li>
              <strong>The chunk text</strong>, so you can show it and put it in the prompt.
            </li>
            <li>
              <strong>The vector</strong> from your embedding model.
            </li>
            <li>
              <strong>Metadata:</strong> source file, page or section, date, language, and an
              access label such as team or tenant, so you can filter later.
            </li>
          </ul>
          <pre>
            <code>{`import hashlib

def index_document(name: str, text: str, store, embed):
    chunks = chunk_words(text)
    vectors = embed(chunks)                      # embed in batches, not one call per chunk
    records = []
    for i, (chunk, vec) in enumerate(zip(chunks, vectors)):
        records.append({
            "id": hashlib.sha1(f"{name}:{i}".encode()).hexdigest(),
            "vector": vec,
            "text": chunk,
            "metadata": {"source": name, "position": i},
        })
    store.upsert(records)                        # upsert = insert or replace by id`}</code>
          </pre>
          <p>
            Embedding in batches is much faster than one request per chunk. Because the id is
            stable, running the job twice replaces records instead of duplicating them.
          </p>
        </>
      ),
    },
    {
      id: "maintenance",
      title: "Keeping the index healthy",
      body: (
        <>
          <ul>
            <li>
              <strong>Use the same embedding model for chunks and queries.</strong> Vectors from
              different models live in different spaces and can't be compared.
            </li>
            <li>
              <strong>Handle updates.</strong> Store a hash of each source file. On the next run,
              re-index only files whose hash changed, and delete the old chunks for them first.
            </li>
            <li>
              <strong>Handle deletes.</strong> A removed document must disappear from the index, or
              the assistant will keep quoting it.
            </li>
            <li>
              <strong>Deduplicate.</strong> Repeated boilerplate such as footers floods results with
              near-identical chunks.
            </li>
            <li>
              <strong>Record the chunking settings.</strong> If you change chunk size or the
              embedding model, you must rebuild the whole index, so keep source files and settings
              reproducible.
            </li>
          </ul>
          <Callout tone="warn">
            Index access labels with the chunks. If a user isn't allowed to read a document, its
            chunks must never reach the prompt. Apply the access filter inside the search query
            itself, so restricted text is never fetched in the first place.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Chunks are the unit of retrieval: small enough to be specific, large enough to stand alone.",
    "Stride is chunk size minus overlap; overlap trades extra storage for fewer broken boundaries.",
    "Recursive, structure-aware splitting is a strong default; semantic chunking is optional and costs more.",
    "Store id, text, vector and metadata, and use the same embedding model for indexing and queries.",
    "Plan for updates, deletes and full rebuilds from the start.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main purpose of overlap between chunks?",
      options: [
        "To make embeddings smaller",
        "To keep text near a boundary intact in at least one chunk",
        "To speed up the vector search",
        "To remove duplicate documents",
      ],
      answer: 1,
      explain: "Without overlap, a sentence or answer cut at a boundary may be split across two chunks and retrieved by neither.",
    },
    {
      kind: "mcq",
      q: "You change your embedding model after indexing 100,000 chunks. What must you do?",
      options: [
        "Nothing, new queries will adapt",
        "Only re-embed the queries",
        "Re-embed and re-index all chunks with the new model",
        "Delete the metadata",
      ],
      answer: 2,
      explain: "Vectors from different models are not comparable, so the index and queries must use the same model.",
    },
    {
      kind: "text",
      q: "A 10,000-token document is split with chunk size 500 and overlap 100. How many chunks result? Digits only.",
      format: "**",
      accept: ["25"],
      explain: "Stride is 400. ceil((10,000 - 100) / 400) = ceil(24.75) = 25.",
    },
    {
      kind: "text",
      q: "Chunk size 800 and overlap 200. What is the stride in tokens? Digits only.",
      format: "***",
      accept: ["600"],
      explain: "Stride = chunk size - overlap = 800 - 200 = 600.",
    },
  ],
};
