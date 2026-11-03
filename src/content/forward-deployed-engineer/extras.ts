import type { Reference } from "@/lib/types";

const book = (title: string, url: string): Reference => ({ type: "book", title, url });
const official = (title: string, url: string): Reference => ({ type: "official", title, url });
const article = (title: string, url: string): Reference => ({ type: "article", title, url });

const ddia = book("Designing Data-Intensive Applications, Martin Kleppmann", "https://dataintensive.net/");
const buildingAgents = article("Building Effective Agents (Anthropic)", "https://www.anthropic.com/engineering/building-effective-agents");

export const moduleExtras: Record<string, Reference[]> = {
  introduction: [
    article("The rise of the Forward Deployed Engineer (a16z)", "https://a16z.com/the-rise-of-the-forward-deployed-engineer/"),
    article("Palantir: a day in the life of a Forward Deployed Engineer", "https://blog.palantir.com/a-day-in-the-life-of-a-palantir-forward-deployed-software-engineer-45ef2de257b1"),
  ],
  "engineering-foundations": [
    official("Pro Git book", "https://git-scm.com/book/en/v2"),
    official("The Linux Command Line (free book)", "https://linuxcommand.org/tlcl.php"),
    official("Python tutorial", "https://docs.python.org/3/tutorial/"),
    official("TypeScript handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"),
  ],
  "application-skills": [
    official("MDN Web Docs", "https://developer.mozilla.org/"),
    official("React documentation", "https://react.dev/learn"),
    official("PostgreSQL documentation", "https://www.postgresql.org/docs/current/"),
    official("GraphQL learn", "https://graphql.org/learn/"),
  ],
  "data-engineering": [
    ddia,
    official("Apache Airflow documentation", "https://airflow.apache.org/docs/"),
    official("Apache Spark documentation", "https://spark.apache.org/docs/latest/"),
  ],
  "ai-foundations": [
    book("AI Engineering, Chip Huyen", "https://www.oreilly.com/library/view/ai-engineering/9781098166298/"),
    article("Effective context engineering for AI agents (Anthropic)", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"),
    official("Anthropic prompt engineering overview", "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"),
  ],
  agents: [
    buildingAgents,
    official("Model Context Protocol documentation", "https://modelcontextprotocol.io/"),
  ],
  "vibe-coding": [
    official("Claude Code documentation", "https://docs.anthropic.com/en/docs/claude-code/overview"),
    official("OpenAI Codex on GitHub", "https://github.com/openai/codex"),
    official("Cursor documentation", "https://docs.cursor.com/"),
  ],
  integration: [
    book("Enterprise Integration Patterns", "https://www.enterpriseintegrationpatterns.com/"),
    article("Strangler Fig pattern, Martin Fowler", "https://martinfowler.com/bliki/StranglerFigApplication.html"),
  ],
  "cloud-devops": [
    official("Docker documentation", "https://docs.docker.com/"),
    official("Kubernetes documentation", "https://kubernetes.io/docs/home/"),
    official("Terraform documentation", "https://developer.hashicorp.com/terraform/docs"),
    official("AWS documentation", "https://docs.aws.amazon.com/"),
  ],
  observability: [
    article("Your AI Product Needs Evals, Hamel Husain", "https://hamel.dev/blog/posts/evals/"),
    official("Langfuse documentation", "https://langfuse.com/docs"),
    official("OpenTelemetry documentation", "https://opentelemetry.io/docs/"),
  ],
  security: [
    official("OWASP API Security Top 10", "https://owasp.org/API-Security/"),
    official("OWASP Top 10 for LLM Applications", "https://genai.owasp.org/llm-top-10/"),
    official("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"),
  ],
  discovery: [
    book("The Mom Test, Rob Fitzpatrick", "https://www.momtestbook.com/"),
    article("Shape Up, Basecamp (free book)", "https://basecamp.com/shapeup"),
  ],
  business: [
    book("The Phoenix Project", "https://itrevolution.com/product/the-phoenix-project/"),
    article("Working Backwards, Amazon-style PR/FAQ", "https://workingbackwards.com/concepts/working-backwards-pr-faq-process/"),
  ],
  communication: [
    official("Google technical writing courses", "https://developers.google.com/tech-writing"),
    article("Writing runbooks, Atlassian incident handbook", "https://www.atlassian.com/incident-management/handbook"),
  ],
};

export const lessonExtras: Record<string, Reference[]> = {
  "what-is-an-fde": [article("The rise of the Forward Deployed Engineer (a16z)", "https://a16z.com/the-rise-of-the-forward-deployed-engineer/")],
  "agent-architectures": [buildingAgents],
  "working-with-legacy-systems": [article("Strangler Fig pattern, Martin Fowler", "https://martinfowler.com/bliki/StranglerFigApplication.html")],
  "requirements-gathering": [book("The Mom Test, Rob Fitzpatrick", "https://www.momtestbook.com/")],
};
