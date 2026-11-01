import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Explain the problem retrieval-augmented generation (RAG) solves",
    "Walk through the two phases of a RAG system: indexing and answering",
    "Choose between RAG, fine-tuning and simply pasting documents into the prompt",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: the model doesn't know your data",
      body: (
        <>
          <p>
            A language model only knows what was in its training data, frozen at some past date.
            It has never seen your company wiki, your support tickets or this morning's pricing
            change. Ask it about them and it may answer anyway, confidently and wrongly. This is
            called a <strong>hallucination</strong>.
          </p>
          <p>
            <strong>Retrieval-augmented generation (RAG)</strong> fixes this without changing the
            model. Before asking the model, your code <em>looks up</em> the relevant passages from
            your own data and places them in the prompt. The model then answers using that
            material.
          </p>
          <p>
            Analogy: a closed-book exam versus an open-book exam. A plain model is sitting the
            closed-book version, answering from memory. RAG hands it the right pages of the
            textbook before it writes its answer.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "The two phases",
      body: (
        <>
          <p>Every RAG system has an offline phase and an online phase.</p>
          <Table
            head={["Phase", "When it runs", "Steps"]}
            rows={[
              ["Indexing", "Ahead of time, and again when documents change", "Load documents, split into chunks, embed each chunk, store in a vector database"],
              ["Answering", "On every user question", "Embed the question, retrieve the closest chunks, put them in the prompt, generate an answer"],
            ]}
          />
          <p>Here is the shape in code. The helper functions are placeholders for your own choices:</p>
          <pre>
            <code>{`# --- indexing (offline) ---
for doc in load_documents("./handbook"):
    for chunk in split_into_chunks(doc.text):
        store.add(vector=embed(chunk), text=chunk, metadata={"source": doc.name})

# --- answering (online) ---
def answer(question: str) -> str:
    hits = store.search(vector=embed(question), top_k=4)
    context = "\\n\\n".join(h.text for h in hits)
    prompt = (
        "Answer using only the context below. "
        "If the answer is not there, say you don't know.\\n\\n"
        f"Context:\\n{context}\\n\\nQuestion: {question}"
    )
    return call_model(prompt)`}</code>
          </pre>
          <p>
            That is the whole idea. The rest of this module is about making each step good:
            chunking and indexing, retrieval and generation, then improving a system that
            underperforms.
          </p>
        </>
      ),
    },
    {
      id: "why",
      title: "Why not just paste everything into the prompt?",
      body: (
        <>
          <p>
            Models accept a limited amount of text per request, called the context window. Even
            when a window is big enough, you pay for every token sent, on every request. Cost is
            tokens times the price per token. Here is an illustrative comparison. The price is made
            up for the example; real prices differ by model and change over time.
          </p>
          <Formula>cost = tokens x price per token</Formula>
          <pre>
            <code>{`Knowledge base: 2,000 pages x 500 tokens = 1,000,000 tokens
Illustrative price: 3 currency units per 1,000,000 input tokens

Paste everything : 1,000,000 tokens -> 3.00 per question (and may not fit at all)
RAG              : 4 chunks x 500 = 2,000 tokens of context
                   + about 300 tokens of instructions and question
                   = 2,300 tokens -> 2,300 / 1,000,000 x 3 = 0.0069 per question`}</code>
          </pre>
          <p>
            That is roughly 435 times cheaper per question in this example, and it is also faster.
            There is a quality argument too: a model given a small set of relevant passages tends
            to stay focused, while one buried in irrelevant text can lose the thread.
          </p>
          <Callout tone="tip">
            For a tiny knowledge base (a few pages), skip RAG and paste the text directly. Add
            retrieval only when the data no longer fits comfortably, or when cost and latency start
            to hurt.
          </Callout>
        </>
      ),
    },
    {
      id: "vs-finetune",
      title: "RAG or fine-tuning?",
      body: (
        <>
          <p>
            Fine-tuning continues training a model on your examples. It changes the model's
            behaviour: tone, format, specialised skills. It is a poor way to teach a model facts it
            must reproduce exactly, and the facts go stale the moment your data changes.
          </p>
          <Table
            head={["Need", "Better fit"]}
            rows={[
              ["Answers from private or recent documents", "RAG"],
              ["Facts that change daily or weekly", "RAG (update the index, not the model)"],
              ["Show where an answer came from (citations)", "RAG"],
              ["Different users may see different documents", "RAG with access filters"],
              ["A consistent style, format or specialised task behaviour", "Fine-tuning, or better prompting first"],
              ["Both fresh facts and a custom style", "Combine them"],
            ]}
          />
          <p>
            A good default order: improve the prompt first, add RAG if the model lacks knowledge,
            and consider fine-tuning only if behaviour still falls short.
          </p>
        </>
      ),
    },
    {
      id: "use-cases",
      title: "Where RAG fits, and where it doesn't",
      body: (
        <>
          <p>Common uses:</p>
          <ul>
            <li>Question answering over internal docs, policies and runbooks</li>
            <li>Customer support assistants grounded in a help centre</li>
            <li>Search over code, contracts or research papers, with cited sources</li>
            <li>Assistants that need current information the model never saw in training</li>
          </ul>
          <p>RAG struggles when:</p>
          <ul>
            <li>
              The question needs the whole corpus at once, such as "summarise every complaint this
              year". Top-few retrieval sees only a slice.
            </li>
            <li>The answer needs exact arithmetic or database aggregation. Use a tool or query instead.</li>
            <li>The source documents are wrong, outdated or contradict one another.</li>
          </ul>
          <Callout tone="warn">
            RAG reduces hallucination, it doesn't remove it. The model can still ignore the
            context or misread it. Ask for citations and measure answer quality instead of
            assuming it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "RAG looks up relevant passages from your data and gives them to the model along with the question.",
    "Indexing runs offline: load, chunk, embed, store. Answering runs per question: embed, retrieve, prompt, generate.",
    "RAG is usually cheaper and faster than pasting the whole corpus, and it keeps knowledge current.",
    "Use RAG for facts and sources; use fine-tuning for style and behaviour.",
    "RAG reduces hallucinations but doesn't eliminate them, so evaluate it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Your product documentation changes every week and users want answers with sources. What is the best fit?",
      options: [
        "Fine-tune the model every week",
        "Hope the model's training data is recent enough",
        "Retrain a model from scratch",
        "RAG over the documentation",
      ],
      answer: 3,
      explain: "With RAG you update the index when documents change, and retrieved passages give you something to cite.",
    },
    {
      kind: "mcq",
      q: "Which step belongs to the offline indexing phase?",
      options: [
        "Splitting documents into chunks and embedding them",
        "Embedding the user's question",
        "Generating the final answer",
        "Assembling the prompt for one request",
      ],
      answer: 0,
      explain: "Chunking and embedding documents happens ahead of time. The other steps run per question.",
    },
    {
      kind: "text",
      q: "A RAG prompt includes 5 retrieved chunks of 400 tokens each. How many context tokens is that? Digits only.",
      format: "****",
      accept: ["2000", "2,000"],
      explain: "5 x 400 = 2,000 tokens.",
    },
    {
      kind: "text",
      q: "What word does the R in RAG stand for?",
      format: "*********",
      accept: ["retrieval"],
      explain: "RAG is retrieval-augmented generation.",
    },
  ],
};
