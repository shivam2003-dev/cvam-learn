import type { Course } from "@/lib/types";

export const aiEngineer: Course = {
  slug: "ai-engineer",
  title: "AI Engineer",
  tagline:
    "Build real products on top of large language models: prompts, context, RAG, agents, evaluation and safety.",
  description:
    "Learn the practical skills of an AI engineer: how LLMs behave, how to prompt and feed them context, choose and call models, build retrieval and agents, connect tools with MCP, and ship with observability, evaluation and guardrails.",
  level: "Beginner to Intermediate",
  skills: ["Prompting", "Context engineering", "Embeddings & RAG", "Agents & MCP", "Evaluation", "AI safety"],
  modules: [
    {
      id: "introduction",
      title: "Introduction",
      blurb: "What the job is, and how it differs from its neighbours.",
      lessons: [
        { slug: "what-is-an-ai-engineer", title: "What Is an AI Engineer?", summary: "The role, its daily work and how AI changes product development." },
        { slug: "ai-engineer-vs-ml-engineer", title: "AI Engineer vs ML Engineer", summary: "Who trains models, who builds with them, and what AGI does and doesn't mean." },
      ],
    },
    {
      id: "how-llms-work",
      title: "How LLMs Work",
      blurb: "Enough theory to predict how a model will behave.",
      lessons: [
        { slug: "llms-and-tokens", title: "LLMs and Tokens", summary: "Next-token prediction, tokenization and why token counts drive cost." },
        { slug: "context-window", title: "Context and the Context Window", summary: "What the model can see at once, and what happens at the limit." },
        { slug: "training-inference-fine-tuning", title: "Training, Inference and Fine-Tuning", summary: "The stages a model goes through, and when each matters to you." },
        { slug: "sampling-parameters", title: "Sampling Parameters", summary: "Temperature, top-k, top-p and repetition penalties." },
        { slug: "ai-building-blocks", title: "The Building Blocks at a Glance", summary: "Embeddings, vector databases, RAG and agents, and how they fit together." },
      ],
    },
    {
      id: "prompt-engineering",
      title: "Prompt Engineering",
      blurb: "Write instructions a model follows reliably.",
      lessons: [
        { slug: "prompt-basics", title: "Prompt Basics and System Prompts", summary: "Input format, role, behaviour and constraints." },
        { slug: "zero-shot-few-shot", title: "Zero-Shot and Few-Shot Prompting", summary: "When examples help and how to choose them." },
        { slug: "reasoning-prompts", title: "Chain of Thought and ReAct", summary: "Prompting for step-by-step reasoning and tool-using loops." },
        { slug: "structured-output", title: "Structured Output", summary: "Get JSON you can parse, and validate it." },
      ],
    },
    {
      id: "context-engineering",
      title: "Context Engineering",
      blurb: "Deciding what goes into the window, and what stays out.",
      lessons: [
        { slug: "context-vs-prompt-engineering", title: "Context vs Prompt Engineering", summary: "Why the whole window matters more than the prompt alone." },
        { slug: "context-layer-and-sources", title: "The Context Layer and Its Sources", summary: "Instructions, retrieved data, tools, memory and history." },
        { slug: "memory-and-state", title: "Memory Systems and State", summary: "Short-term history, long-term memory and what to persist." },
        { slug: "long-context-and-compaction", title: "Long Context and Compaction", summary: "Working with big inputs, summarising and trimming." },
        { slug: "prompt-caching-and-streaming", title: "Prompt Caching and Streaming", summary: "Cut cost and latency with reuse and incremental output." },
        { slug: "context-failure-modes", title: "Context Failure Modes", summary: "Poisoning, distraction, confusion and clash, and how to prevent them." },
        { slug: "context-security-and-isolation", title: "Context Security, Isolation and Evaluation", summary: "Keep untrusted data apart, share context safely, and test it." },
      ],
    },
    {
      id: "models",
      title: "Choosing and Calling Models",
      blurb: "Pick a model and talk to it from code.",
      lessons: [
        { slug: "open-vs-closed-models", title: "Open vs Closed Models", summary: "Hosted APIs, open weights and self-hosting trade-offs." },
        { slug: "choosing-the-right-model", title: "Choosing the Right Model", summary: "Quality, cost, latency, context length and fit for the task." },
        { slug: "model-families", title: "Model Families", summary: "Claude, Gemini, GPT, Llama, Mistral, DeepSeek, Qwen, Gemma and Cohere." },
        { slug: "calling-model-apis", title: "Calling Model APIs", summary: "Messages-style APIs, OpenAI-compatible endpoints and error handling." },
        { slug: "hugging-face", title: "Hugging Face", summary: "The Hub, tasks, Transformers.js and the inference SDK." },
        { slug: "local-models", title: "Running Models Locally", summary: "Ollama and LM Studio for private, offline development." },
        { slug: "model-gateways", title: "Gateways and OpenRouter", summary: "One API for many models, with routing and fallbacks." },
      ],
    },
    {
      id: "embeddings",
      title: "Embeddings",
      blurb: "Turn meaning into numbers you can search.",
      lessons: [
        { slug: "what-are-embeddings", title: "What Are Embeddings?", summary: "Vectors, similarity and why meaning ends up nearby." },
        { slug: "embedding-use-cases", title: "Embedding Use Cases", summary: "Semantic search, classification, recommendations and anomaly detection." },
        { slug: "embedding-models", title: "Embedding Models", summary: "Hosted and open models, dimensions, and how to pick one." },
      ],
    },
    {
      id: "vector-databases",
      title: "Vector Databases",
      blurb: "Store embeddings and find the nearest ones fast.",
      lessons: [
        { slug: "vector-database-basics", title: "Vector Database Basics", summary: "Purpose, indexing and similarity search." },
        { slug: "vector-database-options", title: "Choosing a Vector Database", summary: "Chroma, Pinecone, Weaviate, FAISS, Qdrant, LanceDB, pgvector and more." },
      ],
    },
    {
      id: "rag",
      title: "Retrieval-Augmented Generation",
      blurb: "Ground answers in your own data.",
      lessons: [
        { slug: "rag-overview", title: "What Is RAG?", summary: "Use cases and when to choose RAG over fine-tuning." },
        { slug: "chunking-and-indexing", title: "Chunking and Indexing", summary: "Split documents well and index them for retrieval." },
        { slug: "retrieval-and-generation", title: "Retrieval and Generation", summary: "Query, rank, assemble context and answer with citations." },
        { slug: "improving-rag", title: "Improving a RAG System", summary: "Hybrid search, reranking, filters and common failure fixes." },
      ],
    },
    {
      id: "agents",
      title: "AI Agents",
      blurb: "Models that decide, act and loop.",
      lessons: [
        { slug: "what-are-agents", title: "What Are AI Agents?", summary: "The loop, use cases, and when not to build an agent." },
        { slug: "tools-and-function-calling", title: "Tools and Function Calling", summary: "Describe functions, let the model call them, and handle results." },
        { slug: "agent-patterns", title: "Agent Patterns and Multi-Agent Systems", summary: "ReAct, planning, routing and when more agents help." },
        { slug: "agent-frameworks", title: "Agent Frameworks and SDKs", summary: "Direct SDKs, LangChain, LlamaIndex, Haystack, ADK and manual loops." },
      ],
    },
    {
      id: "mcp",
      title: "Model Context Protocol",
      blurb: "A standard way to connect models to tools and data.",
      lessons: [
        { slug: "mcp-overview", title: "What Is MCP?", summary: "The problem it solves and its main ideas." },
        { slug: "mcp-architecture", title: "MCP Architecture", summary: "Hosts, clients, servers, the data layer and transports." },
        { slug: "building-mcp-servers-and-clients", title: "Building MCP Servers and Clients", summary: "Expose tools, connect locally or remotely, and test them." },
      ],
    },
    {
      id: "safety",
      title: "AI Safety and Ethics",
      blurb: "Build systems you can trust with real users.",
      lessons: [
        { slug: "prompt-injection", title: "Prompt Injection", summary: "How untrusted text hijacks a model, and layered defences." },
        { slug: "security-and-privacy", title: "Security and Privacy", summary: "Data leakage, permissions, secrets and compliance basics." },
        { slug: "bias-fairness-moderation", title: "Bias, Fairness and Moderation", summary: "Spotting unfair behaviour and filtering harmful content." },
        { slug: "guardrails-and-adversarial-testing", title: "Guardrails and Adversarial Testing", summary: "Constrain inputs and outputs, attribute users, and red-team your app." },
      ],
    },
    {
      id: "observability-evals",
      title: "Observability and Evaluation",
      blurb: "Know what your system does, and whether it got better.",
      lessons: [
        { slug: "llm-observability", title: "LLM Observability", summary: "Tracing, logging, cost and latency monitoring, and common tools." },
        { slug: "llm-evaluations", title: "LLM Evaluations", summary: "Deterministic, model-based and human evals, and the metrics behind them." },
        { slug: "regression-testing", title: "Regression Testing for AI", summary: "Datasets, CI checks, RAG metrics and catching quality drops." },
      ],
    },
    {
      id: "multimodal",
      title: "Multimodal AI",
      blurb: "Beyond text: images, video and speech.",
      lessons: [
        { slug: "multimodal-ai", title: "Multimodal AI", summary: "Image and video understanding, image generation and use cases." },
        { slug: "speech-and-audio", title: "Speech and Audio", summary: "Speech-to-text, text-to-speech and building voice features." },
      ],
    },
    {
      id: "dev-tools",
      title: "AI Development Tools",
      blurb: "Use AI to build faster, safely.",
      lessons: [
        { slug: "ai-coding-tools", title: "AI Coding Assistants", summary: "Terminal agents, AI editors and habits that keep their output trustworthy." },
      ],
    },
  ],
};
