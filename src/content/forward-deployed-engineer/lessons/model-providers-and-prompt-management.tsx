import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Medium",
  objectives: [
    "Compare model providers on quality, cost, latency, data terms and deployment options",
    "Design for provider swaps with a thin abstraction and fallbacks",
    "Manage prompts as versioned, tested assets",
  ],
  tasks: [
    {
      id: "providers",
      title: "Choosing a model provider",
      body: (
        <>
          <p>
            The best model on a benchmark is not always the best choice for a customer. Customer
            constraints often decide.
          </p>
          <Table
            head={["Factor", "Questions to ask"]}
            rows={[
              ["Quality", "How does it score on our own test set, not a public one?"],
              ["Cost", "Price per million input and output tokens at expected volume?"],
              ["Latency", "Time to first token and total time for typical requests?"],
              ["Data terms", "Is data retained or used for training? Zero retention available?"],
              ["Residency and compliance", "Region, SOC 2, HIPAA, GDPR needs?"],
              ["Deployment", "Hosted API, customer's cloud (Bedrock, Vertex, Azure), or open weights on-premise?"],
              ["Limits", "Rate limits, context length, tool and vision support?"],
            ]}
          />
          <Callout tone="tip">
            Evaluate two or three candidates on 50 to 100 real examples from the customer. It takes
            an afternoon and ends most opinion battles.
          </Callout>
        </>
      ),
    },
    {
      id: "swap",
      title: "Design for change",
      body: (
        <>
          <p>
            Models are retired and prices shift. Do not scatter provider calls through the code.
          </p>
          <pre>
            <code>{`# One thin interface; providers are configuration
class LLM:
    def complete(self, system: str, user: str, *, schema: dict | None = None) -> str: ...

def get_llm(name: str) -> LLM:
    return {"primary": PrimaryClient(), "backup": BackupClient()}[name]

def answer(question: str) -> str:
    for name in ("primary", "backup"):
        try:
            return get_llm(name).complete(SYSTEM_PROMPT, question)
        except (TimeoutError, RateLimitError):
            continue
    raise RuntimeError("all providers failed")`}</code>
          </pre>
          <ul>
            <li>Pin model versions in config; do not follow "latest" in production.</li>
            <li>Add timeouts, retries with backoff and a fallback model.</li>
            <li>Route easy requests to a small model and hard ones to a large one to control cost.</li>
            <li>Re-run your eval set before changing any model.</li>
          </ul>
        </>
      ),
    },
    {
      id: "prompts",
      title: "Prompt management",
      body: (
        <>
          <p>
            A prompt change can alter behaviour as much as a code change. Treat prompts as
            first-class artifacts.
          </p>
          <ul>
            <li>
              <strong>Store in version control</strong> as files or in a prompt registry, with
              review.
            </li>
            <li>
              <strong>Template variables</strong> instead of string-pasting, and escape untrusted
              input.
            </li>
            <li>
              <strong>Version and tag</strong> each prompt; log which version produced each output.
            </li>
            <li>
              <strong>Test before release</strong> with your eval set; compare to the current
              version.
            </li>
            <li>
              <strong>Roll out gradually</strong> with a flag so you can revert in seconds.
            </li>
          </ul>
          <Callout tone="note">
            Keep customer-specific wording in configuration layered over a shared base prompt, so
            you do not maintain forty near-copies.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Choose providers on your own evals plus cost, latency, data terms, residency and deployment fit.",
    "Wrap providers behind a thin interface with pinned versions, retries and fallbacks.",
    "Version, test and gradually roll out prompts like code.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A customer's data must stay in their own cloud account. Which factor is this?",
      options: ["Font choice", "Deployment and data terms", "Temperature", "Token colour"],
      answer: 1,
      explain: "Deployment option and data handling terms decide whether a provider is allowed at all.",
    },
    {
      kind: "mcq",
      q: "Why pin a model version in production?",
      options: [
        "To prevent behaviour changing silently when 'latest' moves",
        "To save disk space",
        "To avoid using an API key",
        "To make prompts shorter",
      ],
      answer: 0,
      explain: "A moving alias can change outputs without any code change; pinning keeps results stable until you test an upgrade.",
    },
    {
      kind: "mcq",
      q: "Before changing a prompt in production, what should you do?",
      options: [
        "Run your eval set against the new version and compare",
        "Edit it live and watch complaints",
        "Delete the old prompt",
        "Ask the model if it likes it",
      ],
      answer: 0,
      explain: "Evals show whether the change helps or regresses on real cases before users see it.",
    },
  ],
};
