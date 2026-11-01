import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Describe what embeddings, vector databases, RAG and agents each do",
    "Show how the four pieces connect in one request",
    "Compute a simple cosine similarity and a chunk count by hand",
    "Pick the lightest building block that solves a given problem",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a model that knows nothing about your data",
      body: (
        <>
          <p>
            A model is trained on public text up to a cutoff date. It has never seen your company
            wiki, your customer records or last week's incident report. It also cannot act: by
            itself it can only produce text. Yet most useful products need both your data and the
            ability to do things.
          </p>
          <p>
            A small set of building blocks closes that gap. This lesson is a map. Later lessons
            cover each block in depth, so here we only need to know what each one is for and how
            they fit together.
          </p>
          <Table
            head={["Block", "One-line job"]}
            rows={[
              ["Embedding", "Turn text into a list of numbers that captures meaning"],
              ["Vector database", "Store embeddings and find the closest ones fast"],
              ["RAG", "Fetch relevant text and put it in the prompt before answering"],
              ["Tools", "Let the model request actions such as search or a database call"],
              ["Agent", "A loop where the model chooses tools until the task is done"],
            ]}
          />
        </>
      ),
    },
    {
      id: "embeddings",
      title: "Embeddings: meaning as numbers",
      body: (
        <>
          <p>
            An <strong>embedding</strong> is a list of numbers, a vector, produced by an embedding
            model from a piece of text. The key property: texts with similar meaning get vectors that
            point in similar directions. Refund policy and money back guarantee land close together,
            while refund policy and banana bread land far apart.
          </p>
          <p>
            To compare two vectors, a common measure is <strong>cosine similarity</strong>, which
            looks at the angle between them:
          </p>
          <Formula>cosine(a, b) = (a · b) ÷ (|a| × |b|)</Formula>
          <p>
            Worked example with tiny three-number vectors, a = [1, 2, 2] and b = [2, 1, 2]. The dot
            product is 1×2 + 2×1 + 2×2 = 2 + 2 + 4 = 8. The length of a is the square root of 1 + 4 +
            4 = 3, and the length of b is also 3. So the similarity is 8 ÷ (3 × 3) = 0.889.
            A value near 1 means very similar direction, near 0 means unrelated. Real embeddings
            have hundreds or thousands of numbers, but the maths is identical.
          </p>
        </>
      ),
    },
    {
      id: "vector-db",
      title: "Vector databases: nearest-neighbour search",
      body: (
        <>
          <p>
            Suppose you embed 100,000 document chunks. For each question you embed the question,
            then need the few chunks whose vectors are closest. Comparing against all 100,000 works
            for small sets but gets slow as data grows. A <strong>vector database</strong> stores
            vectors with an index that finds close neighbours quickly, usually by approximating the
            answer to save time, and lets you filter by metadata such as date or customer.
          </p>
          <p>
            Many options exist, from libraries you run in memory to hosted services to extensions of
            databases you may already use. A later lesson compares them. For a prototype with a few
            thousand chunks, even a plain in-memory search can be enough.
          </p>
        </>
      ),
    },
    {
      id: "rag",
      title: "RAG: retrieve, then generate",
      body: (
        <>
          <p>
            <strong>Retrieval-augmented generation</strong> combines the two blocks above with the
            model. Instead of hoping the model knows the answer, you look it up first and hand it
            the evidence. Think of an open-book exam: the model still reasons and writes, but the
            relevant pages are on the desk.
          </p>
          <pre>
            <code>{`question -> embed -> search vector DB -> top 4 chunks
                                              |
              prompt = instructions + chunks + question
                                              |
                                  model writes grounded answer`}</code>
          </pre>
          <pre>
            <code>{`# Illustrative sketch: embed(), store and llm() stand in for real components.
def answer(question: str) -> str:
    query_vector = embed(question)
    chunks = store.search(query_vector, top_k=4)
    context = "\\n\\n".join(c.text for c in chunks)
    prompt = (
        "Answer using only the context below. "
        "If the answer is not there, say you don't know.\\n\\n"
        f"Context:\\n{context}\\n\\nQuestion: {question}"
    )
    return llm(prompt)`}</code>
          </pre>
          <p>
            Before search can happen, documents are split into <strong>chunks</strong>. Chunks
            usually overlap a little so a sentence cut at the boundary still appears whole in one
            of them. Suppose a document has 10,000 tokens and you use chunks of 500 tokens with 100
            tokens of overlap. Each new chunk starts 500 − 100 = 400 tokens after the previous one.
            The last chunk must reach the end, so its start must be at least 10,000 − 500 = 9,500.
            Starts are 0, 400, 800, and so on, so the first start at or beyond 9,500 is 400 × 24 =
            9,600. That makes starts 0 through 24, which is 25 chunks.
          </p>
        </>
      ),
    },
    {
      id: "agents",
      title: "Tools and agents: letting the model act",
      body: (
        <>
          <p>
            A <strong>tool</strong> is a function you describe to the model, such as{" "}
            <code>get_order_status(order_id)</code>. The model does not run it. It replies with a
            request to call it, your code runs it, and you return the result so the model can
            continue.
          </p>
          <p>
            An <strong>agent</strong> repeats this in a loop. The model looks at the goal, picks a
            tool, sees the result, and decides the next step, until it can give a final answer or a
            limit is reached.
          </p>
          <pre>
            <code>{`goal -> model -> "call search(query)" -> your code runs search
          ^                                             |
          +---------- result added to context <---------+
   ...repeat until the model gives a final answer or hits a step limit`}</code>
          </pre>
          <p>
            A retrieval step can itself be a tool, so RAG and agents combine naturally: the agent
            decides when to search, what to search for, and whether to search again.
          </p>
          <Callout tone="warn">
            Agents are powerful and also the least predictable block. Each loop spends tokens, adds
            latency and gives the model a chance to go wrong. Set step limits and log every action.
          </Callout>
        </>
      ),
    },
    {
      id: "choosing",
      title: "Pick the lightest block that works",
      body: (
        <>
          <Table
            head={["Your need", "Start with"]}
            rows={[
              ["Rewrite, summarise or classify text you already have", "A prompt alone"],
              ["Answer from a handful of short documents", "Paste them into the prompt"],
              ["Answer from a large or changing document set", "RAG with embeddings and a vector store"],
              ["Fetch live data or perform an action", "A tool call"],
              ["Multi-step work where the steps are not known in advance", "An agent"],
            ]}
          />
          <Callout tone="tip">
            Climb in order: prompt, then added context, then retrieval, then tools, then an agent.
            Each step adds cost, delay and ways to fail, so move up only when a measured result
            shows the simpler version is not enough.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Embeddings turn text into vectors where similar meaning means similar direction.",
    "Cosine similarity compares vectors: dot product divided by the product of their lengths.",
    "A vector database finds the nearest vectors quickly and supports metadata filters.",
    "RAG retrieves relevant chunks and puts them in the prompt so answers are grounded.",
    "Tools let a model request actions, and an agent loops over tools. Use the lightest block that works.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which building block would you use to let a model answer from thousands of your private documents?",
      options: [
        "Higher temperature",
        "A longer system prompt only",
        "A bigger output limit",
        "Embeddings with a vector store, as part of RAG",
      ],
      answer: 3,
      explain: "RAG retrieves the relevant chunks per question and supplies them in the prompt.",
    },
    {
      kind: "mcq",
      q: "In a tool-calling flow, who actually runs the function?",
      options: [
        "Your code, after the model requests it",
        "The model itself",
        "The vector database",
        "The tokenizer",
      ],
      answer: 0,
      explain: "The model only asks for the call. Your application executes it and returns the result.",
    },
    {
      kind: "text",
      q: "Compute the cosine similarity of a = [3, 4] and b = [4, 3]. Give a decimal.",
      format: "****",
      accept: ["0.96", ".96", "24/25"],
      explain: "Dot product 3×4 + 4×3 = 24. Each length is 5. So 24 ÷ 25 = 0.96.",
    },
    {
      kind: "text",
      q: "A 10,000-token document is cut into 500-token chunks with 100 tokens of overlap. How many chunks result, with the last one allowed to run past the end?",
      format: "**",
      accept: ["25"],
      explain: "The stride is 400. Chunk starts run 0, 400, ..., 9,600, which is 25 starts.",
    },
  ],
};
