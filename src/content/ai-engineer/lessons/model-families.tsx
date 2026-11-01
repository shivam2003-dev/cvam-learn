import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Name the major model families and who makes each",
    "Say which families are hosted-only and which publish open weights",
    "Describe how families are split into size and capability tiers",
    "Keep your code portable so a family change is a small edit",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a crowded and fast-moving field",
      body: (
        <>
          <p>
            Reading about AI means meeting a stream of names. Some are companies, some are model
            families, some are single releases. If you cannot tell them apart, it is hard to follow
            documentation, compare options or understand a teammate's choice.
          </p>
          <p>
            A <strong>model family</strong> is a line of related models from one maker, usually
            sharing a name and design approach, with new versions over time. A <strong>version</strong>{" "}
            is one specific release in that line. This lesson covers families only. Version names,
            prices and rankings change too quickly to memorise, so look those up in current
            provider docs whenever you need them.
          </p>
        </>
      ),
    },
    {
      id: "families",
      title: "The main families",
      body: (
        <>
          <Table
            head={["Family", "Maker", "How you get it", "Known for"]}
            rows={[
              ["Claude", "Anthropic", "Hosted API and cloud platforms", "Writing, coding, long documents and agent work"],
              ["Gemini", "Google", "Hosted API and Google cloud", "Multimodal input, very long inputs"],
              ["GPT", "OpenAI", "Hosted API and cloud platforms", "General purpose, wide tool and API ecosystem"],
              ["Llama", "Meta", "Open weights under a community licence", "A common base for fine-tuning and local use"],
              ["Mistral", "Mistral AI (France)", "Hosted API, plus some open-weights models", "Efficient models, strong in European languages"],
              ["DeepSeek", "DeepSeek (China)", "Open weights and a hosted API", "Reasoning-focused models and low-cost serving"],
              ["Qwen", "Alibaba", "Many open-weights sizes, plus hosted access", "A wide range of sizes, strong multilingual and coding ability"],
              ["Gemma", "Google", "Open weights, small models", "Models small enough to run on a laptop or phone"],
              ["Cohere", "Cohere (Canada)", "Hosted API and private deployments", "Enterprise search: embeddings, reranking and RAG"],
            ]}
          />
          <Callout tone="warn">
            This table is a snapshot of the broad picture, not a ranking. Licences, availability
            and strengths shift between releases. Treat the &quot;known for&quot; column as a hint
            about where to start testing, then verify on your own task.
          </Callout>
        </>
      ),
    },
    {
      id: "tiers",
      title: "Tiers inside a family",
      body: (
        <>
          <p>
            Most families ship several sizes or tiers at once, so you can trade quality against cost
            and speed without leaving the family. Think of it like a car range: a small, cheap,
            quick one and a large, powerful, pricier one, built on the same ideas.
          </p>
          <Table
            head={["Tier", "Typical traits", "Use it for"]}
            rows={[
              ["Small / fast", "Lowest price, lowest latency, less depth", "Classification, extraction, routing, high-volume chat"],
              ["Medium / balanced", "Good quality at moderate cost", "Most product features, coding help, summarising"],
              ["Large / flagship", "Best reasoning, slowest, most expensive", "Hard analysis, complex agent steps, difficult code"],
              ["Reasoning variants", "Spend extra tokens thinking before answering", "Maths, planning, multi-step problems"],
            ]}
          />
          <p>
            Claude's tiers, for instance, are named Haiku, Sonnet and Opus, from smaller to larger.
            Other families label theirs differently, often by parameter count for open models, such
            as a few billion up to tens or hundreds of billions. Reasoning variants use more output
            tokens, so check cost and latency before adopting one.
          </p>
        </>
      ),
    },
    {
      id: "choosing",
      title: "Using families without getting locked in",
      body: (
        <>
          <p>
            You will probably use more than one family over a project's life. A new release may beat
            your current model, a price may change, or a provider may retire a version. Write code
            so that change is cheap.
          </p>
          <ul>
            <li><strong>Keep model names in configuration</strong> (an environment variable or config file), never hard-coded in many places.</li>
            <li><strong>Wrap the call</strong> in one small function so only one place knows the provider's SDK.</li>
            <li><strong>Prefer common interfaces.</strong> Many providers and local servers offer an OpenAI-compatible endpoint, which makes swapping easier.</li>
            <li><strong>Own your evaluation set.</strong> It tells you whether a new family is actually better for you.</li>
            <li><strong>Test prompts per family.</strong> A prompt tuned for one family may need small edits for another, especially around formatting and tool calls.</li>
          </ul>
          <pre>
            <code>{`import os

MODEL = os.environ["MODEL_NAME"]        # e.g. set per environment, not in code
PROVIDER = os.environ["PROVIDER"]       # "anthropic", "openai", "local", ...

def complete(prompt: str) -> str:
    if PROVIDER == "anthropic":
        import anthropic
        r = anthropic.Anthropic().messages.create(
            model=MODEL, max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        return r.content[0].text
    else:
        from openai import OpenAI          # also works for OpenAI-compatible servers
        r = OpenAI().chat.completions.create(
            model=MODEL, messages=[{"role": "user", "content": prompt}],
        )
        return r.choices[0].message.content`}</code>
          </pre>
          <p>
            The code above is illustrative: SDK details change, so check the current docs. The point
            is the shape. One function, configuration for the model name, keys read from the
            environment by the SDK.
          </p>
          <Callout tone="tip">
            When a new model family is announced, resist the urge to switch on headlines. Run your
            evaluation set against it, compare cost and latency, then decide.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A family is a line of related models from one maker; a version is one specific release.",
    "Claude, Gemini and GPT are mainly hosted; Llama, Gemma and Qwen are widely used open-weights families; Mistral and DeepSeek offer both.",
    "Cohere focuses on enterprise search with embeddings, reranking and retrieval-augmented generation.",
    "Families come in tiers: small and fast, balanced, and large, plus reasoning variants.",
    "Keep model names in configuration and wrap calls in one function to stay portable.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which family is best described as small open-weights models from Google?",
      options: ["Claude", "Cohere", "Mistral", "Gemma"],
      answer: 3,
      explain: "Gemma is Google's open-weights family of small models. Gemini is Google's hosted family.",
    },
    {
      kind: "mcq",
      q: "Which pairing of family and maker is correct?",
      options: [
        "Llama and Meta",
        "Claude and Google",
        "Qwen and Anthropic",
        "Cohere and Meta",
      ],
      answer: 0,
      explain: "Llama is from Meta, Claude from Anthropic, Qwen from Alibaba and Cohere from Cohere.",
    },
    {
      kind: "text",
      q: "Which company makes the Claude family?",
      format: "*********",
      accept: ["anthropic"],
      explain: "Claude is made by Anthropic.",
    },
    {
      kind: "text",
      q: "A single specific release inside a model family is called a what? One word.",
      format: "*******",
      accept: ["version", "release"],
      explain: "A family is the line of models. A version is one particular release in that line.",
    },
  ],
};
