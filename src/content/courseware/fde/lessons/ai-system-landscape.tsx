import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Distinguish rules, classical ML, deep learning, LLM prompting, retrieval, fine-tuning and agents",
    "Choose the simplest system type that meets a requirement",
    "Compare system types on cost, latency, accuracy, explainability and risk",
    "Recognise when not to use AI at all",
    "Map a customer problem to a system type using a decision path",
  ],
  tasks: [
    {
      id: "why",
      title: "Start from the problem, not the model",
      body: (
        <>
          <p>
            Customers often arrive with a technology in mind: &ldquo;we want an agent&rdquo;,
            &ldquo;we want to fine-tune a model&rdquo;. An FDE&apos;s first job is to translate that
            into a system type that fits the problem. Pick too heavy a tool and you pay for latency,
            cost and risk you did not need. Pick too light a tool and quality stalls.
          </p>
          <p>
            Think of AI system types as a ladder. Each rung adds capability, and each rung adds cost,
            unpredictability and operational burden. The rule of thumb is to climb only as high as the
            problem requires.
          </p>

          <Figure caption="The ladder of AI system types. Higher rungs handle more open-ended problems and cost more to build, run and trust.">
            <Layers
              layers={[
                { title: "Agents", note: "A model chooses actions and tools over multiple steps to reach a goal.", tone: "rose" },
                { title: "Fine-tuned models", note: "A model whose weights are adapted to your task, style or format.", tone: "amber" },
                { title: "Retrieval (RAG)", note: "A model answers from documents fetched at question time.", tone: "amber" },
                { title: "LLM prompting", note: "A general model, instructed with prompts and examples.", tone: "lime" },
                { title: "Classical ML", note: "Trained models on structured data: classification, regression, ranking, forecasting.", tone: "sky" },
                { title: "Rules and code", note: "Deterministic logic written by people. Fast, cheap, explainable.", tone: "plain" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "types",
      title: "The system types in turn",
      body: (
        <>
          <Table
            head={["Type", "What it is", "Good for", "Watch out for"]}
            rows={[
              ["Rules and code", "If/then logic, regex, SQL, workflows", "Stable, well-understood decisions; anything that must be exact", "Brittle on messy language or edge cases"],
              ["Classical ML", "Gradient boosting, linear models, forecasting on tabular data", "Scoring, churn, fraud, demand, anomaly detection; when you have labelled data", "Needs labelled data and feature engineering; drift over time"],
              ["Deep learning (vision, speech)", "Neural networks for images, audio, signals", "OCR, defect detection, transcription", "Data and compute needs; domain shift"],
              ["LLM prompting", "A general language model given instructions", "Summarising, classifying, extracting, drafting, reasoning over text", "Non-determinism; hallucination; cost per call"],
              ["RAG", "Retrieve relevant passages, then generate from them", "Q&A over private or changing documents with citations", "Retrieval quality is the ceiling; permissions"],
              ["Fine-tuning", "Further train a model on your examples", "Consistent format or style, narrow tasks, cheaper smaller models", "Needs good data; harder to update; not for adding knowledge"],
              ["Agents", "A model loop with tools that picks its own steps", "Open-ended tasks where steps cannot be fixed in advance", "Compounding errors; cost; safety; hard to test"],
            ]}
          />

          <p>
            Two clarifications help avoid common confusion. First, <strong>LLMs are not always the
            right tool even for language problems</strong>. Extracting a date in a fixed format may be
            a one-line regular expression. Second, <strong>fine-tuning is mostly for behaviour, not
            knowledge</strong>. If the model needs to know your documents, give it the documents
            (RAG). If it needs to follow a house style reliably, consider fine-tuning.
          </p>
        </>
      ),
    },
    {
      id: "tradeoffs",
      title: "Comparing on what matters to a customer",
      body: (
        <>
          <p>
            Customers do not buy architectures; they buy outcomes with acceptable cost and risk.
            Compare system types on the dimensions they will ask about.
          </p>
          <Table
            head={["", "Rules", "Classical ML", "LLM prompt", "RAG", "Agent"]}
            rows={[
              ["Build effort", "Low", "Medium", "Low", "Medium", "High"],
              ["Cost per request", "Near zero", "Very low", "Medium", "Medium", "High"],
              ["Latency", "Milliseconds", "Milliseconds", "Seconds", "Seconds", "Many seconds to minutes"],
              ["Predictability", "Exact", "Statistical", "Variable", "Variable", "Least predictable"],
              ["Explainability", "Full", "Partial", "Low", "Medium (citations)", "Low, but traceable"],
              ["Handles open-ended input", "No", "No", "Yes", "Yes", "Yes"],
              ["Testing difficulty", "Easy", "Medium", "Medium", "Medium", "Hard"],
            ]}
          />
          <Callout tone="note" title="Hybrids are the norm">
            Real systems combine types. A support assistant may use rules for routing, a classifier
            to detect sentiment, RAG to find policies, an LLM to draft the answer, and a small agent
            step to look up an order. The skill is putting each tool where it is strongest.
          </Callout>
        </>
      ),
    },
    {
      id: "choose",
      title: "A decision path",
      body: (
        <>
          <p>
            A simple sequence of questions gets you to a sensible first design. Answer in order and
            stop at the first &ldquo;yes&rdquo;.
          </p>

          <Figure caption="Choosing a system type. Start at the top and stop at the first rung that works; move down only when the problem forces it.">
            <Flow
              direction="col"
              numbered
              steps={[
                { title: "Can a rule or query solve it exactly?", note: "Yes: use code. It is cheaper, faster and fully explainable.", tone: "plain" },
                { title: "Is it a prediction on structured data with labels?", note: "Yes: classical ML (scoring, forecasting, anomaly detection).", tone: "sky" },
                { title: "Is it language understanding or generation with no private knowledge needed?", note: "Yes: LLM with a good prompt and a small test set.", tone: "lime" },
                { title: "Must it answer from private or changing documents?", note: "Yes: add retrieval (RAG) with citations and permissions.", tone: "amber" },
                { title: "Must output follow a strict style or format a prompt cannot hold?", note: "Yes: consider fine-tuning a smaller model.", tone: "amber" },
                { title: "Are the steps unknown in advance and tool use needed?", note: "Yes: an agent, with limits and approvals.", tone: "rose" },
              ]}
            />
          </Figure>

          <p>
            Notice how many problems stop in the first three rows. Starting from the top is a habit
            worth building: it keeps systems small and customers happy with cost.
          </p>

          <Figure caption="A hybrid support system. Rules route, a classifier detects intent, retrieval finds policy, a model drafts, and a person approves.">
            <Graph
              label="A hybrid support system: rules route, a classifier detects intent, RAG retrieves policy, an LLM drafts, a person approves"
              cellW={176}
              cellH={100}
              nodeW={146}
              nodes={[
                { id: "in", label: "Ticket", col: 0, row: 0, tone: "plain", shape: "pill" },
                { id: "rules", label: "Rules", sub: "Spam, VIP, language", col: 1, row: 0, tone: "plain" },
                { id: "ml", label: "Classifier", sub: "Intent and urgency", col: 2, row: 0, tone: "sky" },
                { id: "rag", label: "RAG", sub: "Find policy passages", col: 3, row: 0, tone: "amber" },
                { id: "llm", label: "LLM", sub: "Draft the reply", col: 3, row: 1, tone: "lime" },
                { id: "human", label: "Agent approves", sub: "Edits and sends", col: 2, row: 1, tone: "rose", shape: "pill" },
                { id: "out", label: "Customer", col: 1, row: 1, tone: "plain", shape: "pill" },
              ]}
              edges={[
                { from: "in", to: "rules" },
                { from: "rules", to: "ml" },
                { from: "ml", to: "rag" },
                { from: "rag", to: "llm" },
                { from: "llm", to: "human" },
                { from: "human", to: "out" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "no-ai",
      title: "When not to use AI",
      body: (
        <>
          <p>
            Sometimes the best FDE answer is &ldquo;you do not need a model for this&rdquo;. It builds
            trust and saves the customer money. Signs that AI is the wrong tool:
          </p>
          <ul>
            <li>
              <strong>The answer must be exactly right every time</strong> and a wrong one is costly:
              tax calculation, dosage, ledger entries. Use deterministic code, possibly with a model
              only to read the input.
            </li>
            <li>
              <strong>The logic is already written down.</strong> If a policy fits in a flowchart,
              implement the flowchart.
            </li>
            <li>
              <strong>There is no data or no way to judge quality.</strong> If nobody can say what a
              correct output looks like, you cannot evaluate the system.
            </li>
            <li>
              <strong>The volume is tiny.</strong> If twenty requests a month are handled by one
              person happily, automation may cost more than it saves.
            </li>
            <li>
              <strong>The process is broken.</strong> Automating a bad process makes the mistakes
              faster. Fix the process first.
            </li>
          </ul>

          <Exercise
            title="Pick the system type"
            task={
              <p>
                For each request, choose the simplest system type and say why: (a) flag insurance
                claims likely to be fraudulent using 5 years of labelled claims; (b) answer employee
                questions about HR policy with citations; (c) convert dates in invoices to ISO
                format; (d) a research assistant that browses the web, reads papers and writes a
                report.
              </p>
            }
          >
            <ol>
              <li>
                <strong>(a) Classical ML</strong> (gradient boosting). Structured features, plenty of
                labelled data, a prediction task. An LLM adds cost and little accuracy.
              </li>
              <li>
                <strong>(b) RAG.</strong> The knowledge is private and changes, and citations are
                required.
              </li>
              <li>
                <strong>(c) Rules/code.</strong> A date parser handles it exactly and instantly. Use a
                model only for the odd unreadable case, if at all.
              </li>
              <li>
                <strong>(d) An agent.</strong> The steps (search, read, decide what to read next) are
                unknown in advance and need tools, so a model-driven loop is justified, with step and
                cost limits.
              </li>
            </ol>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Choose the simplest system type that meets the requirement; each rung adds cost and risk.",
    "Rules and classical ML handle exact and structured problems; LLMs, RAG, fine-tuning and agents handle open-ended ones.",
    "RAG adds knowledge; fine-tuning shapes behaviour; agents add autonomy.",
    "Compare options on build effort, cost, latency, predictability, explainability and testability.",
    "Real systems are hybrids, and sometimes the right answer is no AI.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You need an assistant to answer questions from internal documents that change weekly, with citations. Which fits best?",
      options: ["RAG", "Fine-tuning only", "A rules engine", "Classical ML regression"],
      answer: 0,
      explain: "RAG retrieves current documents at question time and can cite them, so updates need only re-indexing.",
    },
    {
      kind: "mcq",
      q: "Fine-tuning is best suited to which need?",
      options: [
        "Making outputs follow a consistent style or format",
        "Teaching the model brand-new facts that change daily",
        "Replacing all documentation",
        "Eliminating the need for evaluation",
      ],
      answer: 0,
      explain: "Fine-tuning shapes behaviour. For changing knowledge, retrieval is the better tool.",
    },
    {
      kind: "mcq",
      q: "Why start at the top of the decision path (rules first)?",
      options: [
        "Simple solutions are cheaper, faster and easier to explain and test",
        "Rules are always more accurate",
        "Customers dislike models",
        "It avoids all risk",
      ],
      answer: 0,
      explain: "Climbing only as far as needed keeps cost, latency and risk down.",
    },
    {
      kind: "mcq",
      q: "Which task is a poor fit for an LLM alone?",
      options: [
        "Calculating exact tax amounts that must always be right",
        "Summarising a meeting transcript",
        "Drafting a reply email",
        "Classifying the tone of a message",
      ],
      answer: 0,
      explain: "Exact, high-stakes calculations belong in deterministic code. An LLM may help read the inputs.",
    },
    {
      kind: "text",
      q: "What does RAG stand for? (Retrieval-... Generation; give the middle word)",
      format: "*********",
      accept: ["augmented", "retrieval-augmented generation", "retrieval augmented generation"],
      explain: "Retrieval-augmented generation: fetch relevant text, then generate from it.",
    },
  ],
};
