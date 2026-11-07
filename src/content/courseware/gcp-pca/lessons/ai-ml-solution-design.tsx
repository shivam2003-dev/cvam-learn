import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Medium",
  objectives: [
    "Place Gemini models, Model Garden, Agent Builder and AI Hypercomputer in an architecture",
    "Design a retrieval-augmented generation (RAG) solution on Google Cloud",
    "Choose between prebuilt APIs, foundation models, fine-tuning and custom training",
    "Account for latency, cost, data privacy and grounding when using generative AI",
  ],
  tasks: [
    {
      id: "map",
      title: "The generative AI building blocks",
      body: (
        <>
          <Table
            head={["Building block", "What it is", "Use when"]}
            rows={[
              ["Gemini models", "Google's multimodal foundation models (Pro, Flash and lighter variants) via the managed AI platform and APIs", "Text, code, image, audio and video understanding and generation"],
              ["Model Garden", "Catalogue of first-party, partner and open models you can deploy or call", "Compare and select models; deploy open models to managed endpoints"],
              ["Agent Builder", "Tools to build agents and search/chat apps: grounding, RAG engine, vector/search, agent frameworks and runtime", "Enterprise search, assistants and agents that use tools and company data"],
              ["Prebuilt AI APIs", "Vision, Speech, Natural Language, Translation, Document AI, Video, Conversational", "Common tasks without ML expertise"],
              ["Custom training and tuning", "Fine-tuning (supervised, adapter), custom models on GPUs/TPUs", "Domain adaptation or proprietary models when prompting and RAG are not enough"],
              ["AI Hypercomputer", "Integrated supercomputing architecture: TPUs, GPUs, networking, storage, and software for training and serving", "Large-scale training and high-throughput inference"],
            ]}
          />
          <Callout tone="note" title="Naming">
            The current exam guide refers to the managed AI platform as the Gemini Enterprise Agent
            Platform and to its pipelines as Agent Platform Pipelines; older documentation and many
            existing resources call it Vertex AI. They refer to the same family of capabilities, so
            read both names when you study.
          </Callout>
        </>
      ),
    },
    {
      id: "rag",
      title: "A RAG reference architecture",
      body: (
        <>
          <p>
            Large language models do not know your private data and can invent facts.{" "}
            <strong>Retrieval-augmented generation</strong> retrieves relevant company content and
            passes it to the model as context so answers are <em>grounded</em> and citable.
          </p>
          <Figure caption="RAG on Google Cloud. Documents are chunked, embedded and indexed; at query time the system retrieves context, applies safety checks and calls Gemini.">
            <Graph
              label="RAG architecture: documents to embeddings and vector index, user query retrieves context, Gemini generates a grounded answer with Model Armor screening"
              cellW={190}
              cellH={96}
              nodeW={160}
              nodes={[
                { id: "docs", label: "Documents", sub: "Cloud Storage, drives, databases", col: 0, row: 0, tone: "sky" },
                { id: "emb", label: "Chunk + embed", sub: "embedding model", col: 1, row: 0, tone: "lime" },
                { id: "idx", label: "Vector index", sub: "Vector Search, AlloyDB, BigQuery", col: 2, row: 0, tone: "amber", shape: "db" },
                { id: "user", label: "User query", col: 0, row: 1, tone: "sky", shape: "pill" },
                { id: "app", label: "App / agent", sub: "Cloud Run, Agent Builder", col: 1, row: 1, tone: "lime" },
                { id: "ma", label: "Model Armor", sub: "screen prompts + responses", col: 2, row: 1, tone: "rose" },
                { id: "gem", label: "Gemini", sub: "grounded generation", col: 3, row: 1, tone: "lime" },
              ]}
              edges={[
                { from: "docs", to: "emb" },
                { from: "emb", to: "idx" },
                { from: "user", to: "app" },
                { from: "app", to: "idx", label: "retrieve", dashed: true },
                { from: "app", to: "ma" },
                { from: "ma", to: "gem" },
              ]}
            />
          </Figure>
          <ul>
            <li><strong>Grounding</strong> with enterprise data or Google Search reduces hallucination.</li>
            <li><strong>Evaluate</strong> quality with test sets and metrics; log prompts and responses with privacy controls.</li>
            <li><strong>Security:</strong> keep data in your project and region, use CMEK, VPC Service Controls, IAM, and Sensitive Data Protection to redact PII before indexing or prompting; Model Armor screens for prompt injection and sensitive data.</li>
          </ul>
        </>
      ),
    },
    {
      id: "choose",
      title: "Choosing an approach",
      body: (
        <>
          <Table
            head={["Need", "Approach", "Why"]}
            rows={[
              ["Extract text from invoices", "Document AI", "Prebuilt, accurate, no training"],
              ["Chat over internal documents", "RAG with Agent Builder / Gemini", "Grounded, up-to-date, cheap to maintain"],
              ["Consistent tone or specialised task output", "Prompt design first, then fine-tune a model", "Tuning when prompting is insufficient"],
              ["Proprietary architecture or massive scale training", "Custom training on GPUs/TPUs with AI Hypercomputer", "Full control"],
              ["Predictive model on tabular data", "BigQuery ML or AutoML-style tools", "In-database, quick"],
              ["Latency or cost sensitive high volume", "Smaller/faster Gemini variant, caching, batching, provisioned throughput", "Optimise cost per request"],
            ]}
          />
          <Exercise
            title="Design an assistant"
            task={<p>A bank wants an internal assistant that answers policy questions from 50,000 PDFs, never exposes customer PII in prompts, and keeps data in the EU. What is the architecture?</p>}
          >
            <p>
              Store PDFs in Cloud Storage in an EU region; use <strong>Document AI</strong> or
              built-in parsing to extract text; redact PII with <strong>Sensitive Data
              Protection</strong>; embed and index in a vector store in the EU
              (<strong>Vector Search</strong> or AlloyDB). Serve through a Cloud Run or Agent Builder
              app that retrieves chunks, screens prompts and responses with <strong>Model
              Armor</strong>, then calls <strong>Gemini</strong> using an EU endpoint. Protect with
              IAM and groups, CMEK, VPC Service Controls, audit logs and an organization policy for
              resource locations.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Gemini (models), Model Garden (catalogue), Agent Builder (agents and search), prebuilt APIs and AI Hypercomputer (infrastructure) cover the AI portfolio.",
    "RAG grounds answers in your data: ingest, chunk, embed, index, retrieve, screen, generate.",
    "Prefer prebuilt APIs or prompting and RAG before fine-tuning or custom training.",
    "Protect AI workloads with IAM, CMEK, VPC Service Controls, residency, Sensitive Data Protection and Model Armor.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the purpose of retrieval-augmented generation?",
      options: ["Ground model answers in your own data", "Increase GPU memory", "Replace IAM", "Reduce network latency"],
      answer: 0,
      explain: "RAG supplies relevant retrieved content to the model so answers are grounded.",
    },
    {
      kind: "mcq",
      q: "Which service screens prompts and responses for injection and sensitive data?",
      options: ["Model Armor", "Cloud Armor only", "Cloud NAT", "Binary Authorization"],
      answer: 0,
      explain: "Model Armor protects generative AI applications from prompt injection and data leakage.",
    },
    {
      kind: "mcq",
      q: "Extracting fields from scanned invoices with no ML expertise. Which service?",
      options: ["Document AI", "Custom TPU training", "Cloud SQL", "Pub/Sub"],
      answer: 0,
      explain: "Document AI provides prebuilt document processors.",
    },
    {
      kind: "mcq",
      q: "Where can you browse and deploy first-party, partner and open models?",
      options: ["Model Garden", "Artifact Registry", "Cloud Marketplace only", "Cloud Source Repositories"],
      answer: 0,
      explain: "Model Garden is the model catalogue in the AI platform.",
    },
    {
      kind: "text",
      q: "Which Google architecture brand covers TPUs, GPUs, networking and software for large-scale AI training and serving?",
      format: "** ************",
      accept: ["ai hypercomputer"],
      explain: "AI Hypercomputer is the integrated AI infrastructure architecture.",
    },
  ],
};
