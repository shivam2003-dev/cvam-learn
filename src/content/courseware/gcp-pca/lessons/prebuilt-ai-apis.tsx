import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Differentiate Google's prebuilt AI APIs: search, conversation, vision, image, video and audio",
    "Decide between a prebuilt API, a foundation model from Model Garden, and a custom model",
    "Integrate Gemini Enterprise features such as AI agents and NotebookLM into workflows",
    "Configure authentication, quotas and data handling for AI APIs",
  ],
  tasks: [
    {
      id: "apis",
      title: "The prebuilt API families",
      body: (
        <>
          <Table
            head={["Family", "Services", "Typical use"]}
            rows={[
              ["Search", "Vertex AI Search / enterprise search, Google Search grounding, Vector Search", "Site and enterprise search, grounded answers, recommendations"],
              ["Conversation", "Conversational Agents (Dialogflow CX), Contact Center AI, Gemini chat", "Virtual agents, call centre automation"],
              ["Vision / Image", "Cloud Vision API, Imagen (image generation and editing), Document AI", "Labels, OCR, object detection, product search, generating images, form parsing"],
              ["Video", "Video Intelligence API, Veo (video generation), Transcoder API", "Shot detection, content moderation, video analysis and generation"],
              ["Audio / Speech", "Speech-to-Text, Text-to-Speech, Chirp models", "Transcription, voice assistants, accessibility"],
              ["Language", "Natural Language API, Translation API / Translation Hub, Gemini", "Sentiment, entities, translation, summarisation"],
              ["Generative multimodal", "Gemini models via the platform and Gemini API", "Reasoning over text, images, audio, video; code; agents"],
            ]}
          />
          <CloudDiagram course="gcp-pca" id="prebuilt-ai-apis-diagram-1" />
        </>
      ),
    },
    {
      id: "enterprise",
      title: "Gemini Enterprise, agents and Model Garden",
      body: (
        <>
          <ul>
            <li><strong>Gemini Enterprise</strong> brings Google AI to employees: agents that search and act across company data and apps, plus <strong>NotebookLM</strong> to analyse and summarise source documents with citations. Integrate it to enhance workflows such as knowledge search, research, sales preparation and document review.</li>
            <li><strong>AI agents</strong> combine a model, tools (APIs, databases, code execution), memory and instructions. Build with Agent Builder and the Agent Development Kit, deploy to a managed runtime or Cloud Run/GKE, and connect tools through standard protocols.</li>
            <li><strong>Model Garden</strong> lets you evaluate and deploy Google, partner and open models; choose by quality, latency, cost, licence and data-handling terms, and deploy to managed endpoints or your own infrastructure.</li>
            <li><strong>Grounding</strong> options: your data (RAG), Google Search, or enterprise connectors.</li>
          </ul>
          <Callout tone="warn" title="Operational considerations">
            Quotas and rate limits apply per project and Region; request increases and design
            retries with exponential backoff. Understand data use terms (prompts and outputs are not
            used to train foundation models for paying cloud customers by default under the data
            governance terms; confirm in the current terms), choose regional endpoints for residency,
            and log requests for audit with redaction.
          </Callout>
        </>
      ),
    },
    {
      id: "use",
      title: "Authentication and integration",
      body: (
        <>
          <ul>
            <li>Use <strong>service accounts with Application Default Credentials</strong> for server-side calls; avoid API keys in code, and restrict any API keys by API and referrer/IP.</li>
            <li>Call APIs privately with <strong>Private Service Connect</strong> for Google APIs and restrict with <strong>VPC Service Controls</strong>.</li>
            <li>Batch large jobs; cache repeated results; choose smaller models for high-volume simple tasks.</li>
            <li>Combine services: Speech-to-Text → Gemini summarisation → BigQuery for call analytics; Document AI → Gemini extraction → Firestore/AlloyDB.</li>
          </ul>
          <Exercise
            title="Select the service"
            task={<p>A call centre wants transcripts of customer calls, a summary and sentiment per call, and searchable archives, with minimal ML staff. What do you build?</p>}
          >
            <p>
              Stream audio to <strong>Speech-to-Text</strong> (with diarisation), summarise and
              classify with <strong>Gemini</strong> (or use Natural Language API for sentiment),
              store transcripts and summaries in <strong>BigQuery</strong>, and expose search using{" "}
              <strong>Vertex AI Search</strong>. Orchestrate with Pub/Sub and Cloud Run, redact PII
              with Sensitive Data Protection, and secure with IAM and VPC Service Controls. All
              managed; no custom model training.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Know the prebuilt families: search, conversation, vision/image, video, audio, language, plus Gemini multimodal.",
    "Use a prebuilt API when it fits; Gemini or Model Garden with grounding for flexible tasks; customise or train only when necessary.",
    "Gemini Enterprise adds agents and NotebookLM for employee workflows.",
    "Authenticate with service accounts, restrict API keys, use PSC and VPC Service Controls, and plan quotas and residency.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service converts speech to text?",
      options: ["Speech-to-Text", "Natural Language API", "Vision API", "Translation API"],
      answer: 0,
      explain: "Speech-to-Text transcribes audio.",
    },
    {
      kind: "mcq",
      q: "Extract fields from scanned forms with minimal effort. Choose:",
      options: ["Document AI", "Custom TPU training", "Cloud SQL", "Cloud DNS"],
      answer: 0,
      explain: "Document AI provides prebuilt processors for forms and invoices.",
    },
    {
      kind: "mcq",
      q: "Which tool analyses uploaded sources and returns cited summaries within Gemini Enterprise?",
      options: ["NotebookLM", "Cloud Build", "Dataflow", "Looker"],
      answer: 0,
      explain: "NotebookLM grounds answers in the documents you provide with citations.",
    },
    {
      kind: "mcq",
      q: "Best practice for credentials used to call AI APIs from a server:",
      options: ["Service account with Application Default Credentials", "A hard-coded API key", "A shared user password", "Public access"],
      answer: 0,
      explain: "Service accounts with ADC avoid long-lived embedded secrets.",
    },
    {
      kind: "text",
      q: "Which catalogue lets you browse and deploy Google, partner and open models?",
      format: "***** ******",
      accept: ["model garden"],
      explain: "Model Garden is the model catalogue and deployment surface.",
    },
  ],
};
