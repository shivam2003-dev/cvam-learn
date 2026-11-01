import type { Reference } from "@/lib/types";

const book = (title: string, url: string): Reference => ({ type: "book", title, url });
const official = (title: string, url: string): Reference => ({ type: "official", title, url });
const paper = (title: string, url: string): Reference => ({ type: "paper", title, url });
const article = (title: string, url: string): Reference => ({ type: "article", title, url });
const video = (title: string, url: string): Reference => ({ type: "video", title, url });
const course = (title: string, url: string): Reference => ({ type: "course", title, url });

const aiEngineering = book("AI Engineering, Chip Huyen", "https://www.oreilly.com/library/view/ai-engineering/9781098166298/");
const promptGuide = article("Prompt Engineering Guide", "https://www.promptingguide.ai/");
const buildingAgents = article("Building Effective Agents (Anthropic)", "https://www.anthropic.com/engineering/building-effective-agents");

export const moduleExtras: Record<string, Reference[]> = {
  introduction: [
    aiEngineering,
    article("Patterns for Building LLM-based Systems, Eugene Yan", "https://eugeneyan.com/writing/llm-patterns/"),
    course("DeepLearning.AI short courses", "https://www.deeplearning.ai/short-courses/"),
  ],
  "how-llms-work": [
    video("Intro to Large Language Models, Andrej Karpathy", "https://www.youtube.com/watch?v=zjkBMFhNj_g"),
    video("Let's build the GPT Tokenizer, Andrej Karpathy", "https://www.youtube.com/watch?v=zduSFxRajkE"),
    article("The Illustrated Transformer, Jay Alammar", "https://jalammar.github.io/illustrated-transformer/"),
    paper("Attention Is All You Need", "https://arxiv.org/abs/1706.03762"),
    course("Hugging Face LLM Course", "https://huggingface.co/learn/llm-course"),
  ],
  "prompt-engineering": [
    official("Anthropic prompt engineering overview", "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"),
    official("OpenAI prompt engineering guide", "https://platform.openai.com/docs/guides/prompt-engineering"),
    promptGuide,
    article("Prompt Engineering, Lilian Weng", "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/"),
    paper("Chain-of-Thought Prompting Elicits Reasoning", "https://arxiv.org/abs/2201.11903"),
    paper("ReAct: Synergizing Reasoning and Acting", "https://arxiv.org/abs/2210.03629"),
  ],
  "context-engineering": [
    article("Effective context engineering for AI agents (Anthropic)", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"),
    article("How Contexts Fail and How to Fix Them, Drew Breunig", "https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html"),
    official("Anthropic: prompt caching", "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching"),
  ],
  models: [
    official("OpenAI API documentation", "https://platform.openai.com/docs"),
    official("Anthropic API documentation", "https://docs.anthropic.com/"),
    official("Gemini API documentation", "https://ai.google.dev/gemini-api/docs"),
    official("Hugging Face documentation", "https://huggingface.co/docs"),
    official("Ollama", "https://ollama.com/"),
    official("LM Studio", "https://lmstudio.ai/"),
    official("OpenRouter documentation", "https://openrouter.ai/docs"),
    article("OpenAI Cookbook", "https://cookbook.openai.com/"),
    article("Anthropic Cookbook", "https://github.com/anthropics/anthropic-cookbook"),
  ],
  embeddings: [
    official("Pinecone Learning Center", "https://www.pinecone.io/learn/"),
    course("Cohere LLM University", "https://cohere.com/llmu"),
    official("Sentence Transformers documentation", "https://www.sbert.net/"),
    official("MTEB embedding leaderboard", "https://huggingface.co/spaces/mteb/leaderboard"),
  ],
  "vector-databases": [
    official("FAISS on GitHub", "https://github.com/facebookresearch/faiss"),
    official("Qdrant documentation", "https://qdrant.tech/documentation/"),
    official("pgvector on GitHub", "https://github.com/pgvector/pgvector"),
    official("Chroma documentation", "https://docs.trychroma.com/"),
    official("Pinecone Learning Center", "https://www.pinecone.io/learn/"),
  ],
  rag: [
    paper("Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", "https://arxiv.org/abs/2005.11401"),
    official("Anthropic: Contextual Retrieval", "https://www.anthropic.com/news/contextual-retrieval"),
    official("LlamaIndex documentation", "https://docs.llamaindex.ai/"),
    aiEngineering,
  ],
  agents: [
    buildingAgents,
    article("LLM Powered Autonomous Agents, Lilian Weng", "https://lilianweng.github.io/posts/2023-06-23-agent/"),
    official("LangChain documentation", "https://python.langchain.com/docs/"),
    official("Google Agent Development Kit", "https://google.github.io/adk-docs/"),
    official("OpenAI function calling guide", "https://platform.openai.com/docs/guides/function-calling"),
  ],
  mcp: [
    official("Model Context Protocol documentation", "https://modelcontextprotocol.io/"),
    official("MCP specification", "https://modelcontextprotocol.io/specification"),
    official("MCP servers repository", "https://github.com/modelcontextprotocol/servers"),
  ],
  safety: [
    official("OWASP Top 10 for LLM Applications", "https://genai.owasp.org/llm-top-10/"),
    official("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"),
    article("Prompt injection series, Simon Willison", "https://simonwillison.net/series/prompt-injection/"),
    official("OpenAI moderation guide", "https://platform.openai.com/docs/guides/moderation"),
  ],
  "observability-evals": [
    article("Your AI Product Needs Evals, Hamel Husain", "https://hamel.dev/blog/posts/evals/"),
    official("Langfuse documentation", "https://langfuse.com/docs"),
    official("RAGAS documentation", "https://docs.ragas.io/"),
    official("DeepEval documentation", "https://deepeval.com/docs/getting-started"),
    aiEngineering,
  ],
  multimodal: [
    official("Hugging Face: Tasks", "https://huggingface.co/tasks"),
    official("OpenAI vision guide", "https://platform.openai.com/docs/guides/images-vision"),
    official("OpenAI Whisper on GitHub", "https://github.com/openai/whisper"),
  ],
  "dev-tools": [
    official("Claude Code documentation", "https://docs.anthropic.com/en/docs/claude-code/overview"),
    official("Cursor documentation", "https://docs.cursor.com/"),
    official("OpenAI Codex on GitHub", "https://github.com/openai/codex"),
  ],
};

export const lessonExtras: Record<string, Reference[]> = {
  "reasoning-prompts": [
    paper("Chain-of-Thought Prompting Elicits Reasoning", "https://arxiv.org/abs/2201.11903"),
    paper("ReAct: Synergizing Reasoning and Acting", "https://arxiv.org/abs/2210.03629"),
  ],
  "what-are-agents": [buildingAgents],
  "prompt-injection": [official("OWASP Top 10 for LLM Applications", "https://genai.owasp.org/llm-top-10/")],
};
