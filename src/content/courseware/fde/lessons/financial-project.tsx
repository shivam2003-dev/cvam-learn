import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 45,
  difficulty: "Hard",
  objectives: [
    "Build a working RAG assistant with LangChain, Google Gemini and a local vector store",
    "Attach metadata to chunks and use it for filtered retrieval",
    "Return structured, cited answers that can abstain",
    "Verify cited figures in code and measure quality with a small test set",
    "Describe what you would add before showing this to a real customer",
  ],
  tasks: [
    {
      id: "goal",
      title: "Project goal and plan",
      body: (
        <>
          <p>
            You will build a small version of the financial knowledge assistant from this chapter. It
            ingests a handful of PDFs, answers questions with citations, refuses when it cannot find
            support, and checks that quoted figures appear in the sources. It runs locally, so no
            customer data is involved. Use public documents such as a company annual report or a
            public policy PDF.
          </p>
          <Figure caption="Project plan. Each step produces something you can run and test before moving on.">
            <Flow
              numbered
              steps={[
                { title: "Set up", note: "Environment, API key, folder of PDFs", tone: "sky" },
                { title: "Ingest", note: "Load, chunk, tag, embed, store", tone: "lime" },
                { title: "Retrieve", note: "Filtered similarity search", tone: "lime" },
                { title: "Answer", note: "Structured output with citations", tone: "amber" },
                { title: "Verify", note: "Check figures against sources", tone: "amber" },
                { title: "Evaluate", note: "Run a labelled question set", tone: "sky" },
              ]}
            />
          </Figure>
          <Callout tone="warn" title="Library versions change quickly">
            LangChain and the Google integration packages change names and signatures often. The code
            below targets the common, current style, but check each package&apos;s documentation if an
            import fails. Pin versions in <code>requirements.txt</code> once it works, and set model
            names through environment variables so you can follow provider updates without editing code.
          </Callout>
        </>
      ),
    },
    {
      id: "setup",
      title: "Step 1: set up",
      body: (
        <>
          <pre>
            <code>{`mkdir fin-rag && cd fin-rag
python3 -m venv .venv && source .venv/bin/activate
pip install langchain langchain-google-genai langchain-chroma langchain-community \\
            langchain-text-splitters pypdf python-dotenv pydantic
mkdir docs        # put 3 to 5 PDFs here, e.g. annual reports

# .env (never commit this)
GOOGLE_API_KEY=your-key
GEMINI_MODEL=<chat model name from Google's current docs>
GEMINI_EMBEDDING_MODEL=<embedding model name from Google's current docs>`}</code>
          </pre>
          <p>
            Create the key in Google AI Studio, add <code>.env</code> to <code>.gitignore</code>, and
            set a budget alert on the account. The project makes only a few hundred small calls, but
            good habits start now.
          </p>
          <Figure caption="Project files and their roles, from the question loop to the evaluation script.">
            <Layers
              layers={[
                { title: "app.py", note: "Question loop: retrieve, answer, verify, print.", tone: "lime" },
                { title: "ingest.py", note: "Builds the vector store from the docs folder.", tone: "lime" },
                { title: "eval.py", note: "Runs a labelled question set and prints a score.", tone: "amber" },
                { title: "chroma/ and docs/", note: "Local vector store and your source PDFs.", tone: "plain" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "ingest",
      title: "Step 2: ingest with metadata",
      body: (
        <>
          <pre>
            <code>{`# ingest.py
import os, pathlib
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

load_dotenv()
emb = GoogleGenerativeAIEmbeddings(model=os.environ["GEMINI_EMBEDDING_MODEL"])
splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=150)

chunks = []
for pdf in pathlib.Path("docs").glob("*.pdf"):
    pages = PyPDFLoader(str(pdf)).load()                 # one Document per page
    for page in pages:
        for piece in splitter.split_documents([page]):
            piece.metadata.update({
                "source": pdf.name,                       # for citations
                "company": pdf.stem.split("_")[0],        # e.g. acme_2025_annual.pdf
                "year": pdf.stem.split("_")[1] if "_" in pdf.stem else "unknown",
                "page": page.metadata.get("page", 0) + 1, # PDF pages are 0-indexed
            })
            chunks.append(piece)

db = Chroma(collection_name="fin", embedding_function=emb, persist_directory="chroma")
db.add_documents(chunks)
print(f"indexed {len(chunks)} chunks from {len(list(pathlib.Path('docs').glob('*.pdf')))} files")`}</code>
          </pre>
          <p>Name files like <code>acme_2025_annual.pdf</code> so the metadata can be read from the filename. Run it:</p>
          <pre>
            <code>{`python ingest.py`}</code>
          </pre>
          <ul>
            <li>
              Check a few chunks by eye: print <code>chunks[0].page_content</code> and confirm tables
              are not total gibberish. If they are, note it; it is the main limitation of this simple
              loader and a good extension.
            </li>
            <li>
              Re-running adds duplicates. For a real system, use stable chunk IDs, or delete the
              collection first while developing.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "answer",
      title: "Step 3: retrieve and answer with citations",
      body: (
        <>
          <pre>
            <code>{`# app.py
import os, re, sys
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

load_dotenv()
emb = GoogleGenerativeAIEmbeddings(model=os.environ["GEMINI_EMBEDDING_MODEL"])
db = Chroma(collection_name="fin", embedding_function=emb, persist_directory="chroma")
llm = ChatGoogleGenerativeAI(model=os.environ["GEMINI_MODEL"], temperature=0)

class Answer(BaseModel):
    answerable: bool = Field(description="False if the passages do not contain the answer")
    answer: str = Field(description="Concise answer, quoting figures exactly as written")
    citations: list[int] = Field(description="Passage numbers used")
    figures: list[str] = Field(description="Every number quoted in the answer, as written in the passage")

structured = llm.with_structured_output(Answer)

PROMPT = """You answer questions using ONLY the numbered passages below.
- Cite passages by number. Quote figures exactly, with units and period.
- If the passages do not contain the answer, set answerable=false.
- If passages conflict, say so and cite both.

{passages}

Question: {question}"""

def retrieve(question, company=None, k=6):
    flt = {"company": company} if company else None
    return db.similarity_search(question, k=k, filter=flt)

def format_passages(docs):
    return "\\n\\n".join(
        f"[{i+1}] ({d.metadata['source']}, p.{d.metadata['page']}) {d.page_content}"
        for i, d in enumerate(docs))

def ask(question, company=None):
    docs = retrieve(question, company)
    result = structured.invoke(PROMPT.format(passages=format_passages(docs), question=question))
    return result, docs`}</code>
          </pre>
          <p>
            Notice that <code>temperature=0</code> reduces variation, and the structured output makes
            the next step (verification) possible: the model must list each figure it quotes.
          </p>
        </>
      ),
    },
    {
      id: "verify",
      title: "Step 4: verify in code",
      body: (
        <>
          <pre>
            <code>{`def norm(s):                                  # compare numbers ignoring commas and spaces
    return re.sub(r"[\\s,]", "", s).lower()

def verify(result, docs):
    problems = []
    if not result.answerable:
        return problems                      # abstaining is acceptable
    if not result.citations:
        problems.append("no citations")
    for n in result.citations:
        if not 1 <= n <= len(docs):
            problems.append(f"citation {n} does not exist")
    cited_text = norm(" ".join(docs[n-1].page_content for n in result.citations if 1 <= n <= len(docs)))
    for fig in result.figures:
        if norm(fig) not in cited_text:
            problems.append(f"figure {fig!r} not found in cited passages")
    return problems

if __name__ == "__main__":
    while True:
        q = input("\\nQuestion (blank to quit): ").strip()
        if not q:
            break
        result, docs = ask(q)
        issues = verify(result, docs)
        print("\\nANSWER:", result.answer if result.answerable else "Not found in the documents.")
        for n in result.citations:
            d = docs[n-1]
            print(f"  [{n}] {d.metadata['source']} p.{d.metadata['page']}")
        if issues:
            print("  CHECK FAILED:", "; ".join(issues))`}</code>
          </pre>
          <Callout tone="tip" title="What a failed check should do">
            In this project it prints a warning. In a production system a failed verification should
            trigger one retry with the error message appended, then fall back to &ldquo;I could not
            verify this answer&rdquo; and show the sources unanswered, so the user is never handed an
            unchecked number.
          </Callout>
        </>
      ),
    },
    {
      id: "evaluate",
      title: "Step 5: evaluate",
      body: (
        <>
          <p>
            Write 15 to 20 questions with known answers from your documents, including at least three
            that are <em>not answerable</em> from them.
          </p>
          <pre>
            <code>{`# eval_set.json
[
  {"q": "What was total revenue in 2025?", "expect": "12,431", "company": "acme"},
  {"q": "Who is the chief financial officer?", "expect": "Jane Doe", "company": "acme"},
  {"q": "What was Acme's 2031 revenue forecast?", "expect": null}
]

# eval.py
import json
from app import ask, verify

cases = json.load(open("eval_set.json"))
ok = abstain_ok = bad_verify = 0
for c in cases:
    result, docs = ask(c["q"], c.get("company"))
    issues = verify(result, docs)
    if c["expect"] is None:
        abstain_ok += (not result.answerable)
    else:
        ok += (result.answerable and c["expect"].replace(",", "") in result.answer.replace(",", ""))
    bad_verify += bool(issues)
answerable = sum(1 for c in cases if c["expect"] is not None)
print(f"correct: {ok}/{answerable}   abstained when unanswerable: {abstain_ok}/{len(cases)-answerable}   failed verification: {bad_verify}")`}</code>
          </pre>
          <Table
            head={["Result", "Likely cause", "What to try"]}
            rows={[
              ["Wrong figure, found in the sources", "Table parsed badly", "Inspect the chunk; try a table-aware parser; keep tables whole"],
              ["Answer missing though in the document", "Retrieval miss", "Increase k, add keyword search, adjust chunk size, add headings to chunks"],
              ["Answers questions it should refuse", "Prompt or retrieval returns weak passages", "Add a relevance score threshold; strengthen the abstain instruction"],
              ["Cites the wrong page", "Page metadata off by one", "Check 0-indexing; print the passage before citing"],
            ]}
          />
        </>
      ),
    },
    {
      id: "extend",
      title: "Stretch goals and what is missing for production",
      body: (
        <>
          <ul>
            <li><strong>Hybrid search:</strong> add a keyword retriever (BM25) and merge results with the vector ones.</li>
            <li><strong>Re-ranking:</strong> retrieve 30 passages, re-rank to 6 with a cross-encoder or a model call.</li>
            <li><strong>Table-aware parsing:</strong> extract tables as structured text and keep them whole.</li>
            <li><strong>Permissions:</strong> add an <code>acl_group</code> metadata field and require a user group in the filter.</li>
            <li><strong>Audit log:</strong> append every question, retrieved IDs and answer to a log file.</li>
            <li><strong>Regression test:</strong> run <code>eval.py</code> in CI and fail if scores drop.</li>
          </ul>
          <Exercise
            title="Customer readiness review"
            task={
              <p>
                You are about to show this project to a real asset manager. List five things that are
                missing between this project and a pilot, in priority order.
              </p>
            }
          >
            <ol>
              <li><strong>Permissions and entitlements</strong> enforced in retrieval, with a test suite.</li>
              <li><strong>Reliable table handling</strong>, since figures are the highest-risk content.</li>
              <li><strong>A larger, expert-labelled evaluation set</strong> and agreed launch thresholds.</li>
              <li><strong>Authentication (SSO), audit logging and retention</strong> aligned with compliance.</li>
              <li><strong>Operations:</strong> incremental re-indexing, deletion propagation, monitoring, cost tracking and a rollback.</li>
            </ol>
            <p>
              Notice that none of these is about a better model. They are the engineering around the
              model that makes it usable by a regulated customer.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A useful RAG project ingests with metadata, retrieves with filters, answers with structured citations and abstains.",
    "Verifying quoted figures in code catches the most damaging errors cheaply.",
    "A small labelled evaluation set, including unanswerable questions, makes every change measurable.",
    "Production readiness is mostly permissions, table handling, evaluation, compliance and operations.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why ask the model to return the list of figures it quoted?",
      options: [
        "So code can check each figure appears in the cited passages",
        "To make output longer",
        "To avoid citations",
        "To speed up retrieval",
      ],
      answer: 0,
      explain: "A structured list of figures enables automatic verification against the sources.",
    },
    {
      kind: "mcq",
      q: "Your evaluation shows the assistant answers questions that are not in the documents. What helps?",
      options: [
        "A relevance threshold and a stronger abstain instruction",
        "A longer answer",
        "Removing citations",
        "Disabling evaluation",
      ],
      answer: 0,
      explain: "Weak retrieval scores and clearer abstention instructions reduce unsupported answers.",
    },
    {
      kind: "mcq",
      q: "Why set the model name through an environment variable?",
      options: [
        "So you can follow provider model updates without changing code",
        "It makes the model smarter",
        "It is required by Python",
        "It hides the API key",
      ],
      answer: 0,
      explain: "Model names change; configuration keeps code stable.",
    },
    {
      kind: "mcq",
      q: "What is the biggest gap between this project and a customer pilot?",
      options: [
        "Permissions, compliance, table handling and a rigorous evaluation set",
        "The colour of the output",
        "The Python version",
        "The folder name",
      ],
      answer: 0,
      explain: "These determine whether a regulated customer can safely use the system.",
    },
    {
      kind: "text",
      q: "PDF page numbers from the loader start at 0. What do you add to show human page numbers?",
      format: "*",
      accept: ["1", "+1", "add 1", "plus 1"],
      explain: "Add 1 so page 0 displays as page 1.",
    },
  ],
};
