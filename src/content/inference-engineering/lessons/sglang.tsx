import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why repeated prefixes dominate many LLM workloads",
    "Describe how RadixAttention stores and reuses the KV cache",
    "Calculate the prefill saved by prefix reuse",
    "Start SGLang and request schema-constrained output",
  ],
  tasks: [
    {
      id: "repeated-prefixes",
      title: "The problem: most prompts repeat",
      body: (
        <>
          <p>
            Real LLM traffic is highly repetitive. A support bot sends the same long system prompt
            every time. A chat app resends the whole conversation each turn. An agent loops over
            one long context and adds a little each round.
          </p>
          <p>
            If your engine prefills all of that from scratch, it's redoing work whose result it
            already held a moment ago. <strong>SGLang</strong> is an open-source serving engine
            designed around this. It reuses shared prefixes aggressively, and it treats structured
            output as a first-class job. The name began as Structured Generation Language.
          </p>
          <p>Here's the size of the prize, for a 4,000-token system prompt and 100-token questions:</p>
          <pre>
            <code>{`1,000 requests, no reuse:
  1,000 × 4,100 = 4,100,000 prefill tokens

1,000 requests, prefix reused after the first:
  4,100 + (999 × 100) = 104,000 prefill tokens

Reduction: 4,100,000 ÷ 104,000 ≈ 39 times less work`}</code>
          </pre>
          <p>
            It changes what users feel too. At an illustrative 20,000 tokens/s of prefill, time to
            first token falls from 4,100 ÷ 20,000 = 205 ms to 100 ÷ 20,000 = 5 ms, plus whatever
            else is in the path.
          </p>
          <Formula>tokens to prefill = prompt tokens − cached prefix tokens</Formula>
        </>
      ),
    },
    {
      id: "radix",
      title: "RadixAttention",
      body: (
        <>
          <p>
            <strong>RadixAttention</strong> keeps KV cache after a request finishes and indexes it
            in a <strong>radix tree</strong>. This is a tree where each edge holds a run of tokens,
            and paths that share a beginning share the same nodes. Think of a family tree of
            conversations: everything that starts the same way shares an ancestor.
          </p>
          <pre>
            <code>{`root
└── "You are a support agent for Acme..."   (shared by all)
    ├── "Refund policy: ..."
    │   ├── "Where is my refund?"
    │   └── "Can I return this?"
    └── "Shipping policy: ..."
        └── "When will it arrive?"`}</code>
          </pre>
          <p>
            A new request walks down from the root, matching its tokens. Whatever matches is
            reused, and only the remainder needs prefill. Its new tokens then become new edges, so
            the tree grows with traffic.
          </p>
          <p>
            Memory is finite, so old entries get evicted, least recently used first. Leaves go
            before their parents, because a parent's prefix is shared by all its children. A node
            in active use is protected from eviction.
          </p>
          <Callout tone="warn">
            Prefix matching is exact and starts from the first token. A timestamp at the top of your
            system prompt breaks the match for everyone. Put stable content first and anything that
            varies last.
          </Callout>
        </>
      ),
    },
    {
      id: "scheduling",
      title: "Cache-aware scheduling",
      body: (
        <>
          <p>
            The order of the queue changes your hit rate. If two requests share a long prefix, run
            them close together, so the prefix is still in memory. SGLang offers{" "}
            <strong>longest prefix match</strong> (LPM), which favors waiting requests with the
            longest cached prefix.
          </p>
          <p>
            LPM helps when many requests share prefixes, but it isn't free. Matching costs CPU time
            as the queue grows, and favoring cached requests can make others wait longer. First come,
            first served is simpler and fairer. Test both on your own traffic.
          </p>
          <pre>
            <code>{`python -m sglang.launch_server \\
  --model-path Qwen/Qwen2.5-7B-Instruct \\
  --context-length 8192 \\
  --mem-fraction-static 0.8 \\
  --schedule-policy lpm \\
  --port 30000`}</code>
          </pre>
          <Table
            head={["Option", "Meaning"]}
            rows={[
              ["--model-path", "Model repository or local folder"],
              ["--context-length", "Longest context, otherwise taken from the model config"],
              ["--mem-fraction-static", "Share of GPU memory for weights and KV cache; lower it first on out-of-memory errors"],
              ["--schedule-policy", "Queue order, such as fcfs or lpm"],
            ]}
          />
          <p>
            A cache is per process. If you run several replicas behind a plain load balancer, a
            request may land where its prefix isn't cached. SGLang has a companion router for this,
            and the Cache-Aware Routing lesson covers the idea in depth.
          </p>
        </>
      ),
    },
    {
      id: "structured",
      title: "Structured output",
      body: (
        <>
          <p>
            Applications often need valid JSON, not prose. SGLang takes the OpenAI-style{" "}
            <code>response_format</code> field and constrains generation to the schema:
          </p>
          <pre>
            <code>{`from openai import OpenAI

client = OpenAI(base_url="http://localhost:30000/v1", api_key="EMPTY")

schema = {
    "type": "object",
    "properties": {"city": {"type": "string"}, "country": {"type": "string"}},
    "required": ["city", "country"],
}

reply = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Where is the Eiffel Tower?"}],
    response_format={
        "type": "json_schema",
        "json_schema": {"name": "place", "schema": schema},
    },
)
print(reply.choices[0].message.content)`}</code>
          </pre>
          <p>
            Constraints can even save time. The original SGLang work noticed that much of a JSON
            object is forced: after a field ends, the next key's text is the only legal output. A{" "}
            <strong>compressed finite state machine</strong> joins those forced tokens together, and{" "}
            <strong>jump-forward decoding</strong> adds them in one go rather than running one
            decode step each.
          </p>
          <p>
            Suppose 30 of 80 output tokens are forced, at an illustrative 20 ms per step. Normal
            decoding takes 80 × 20 = 1,600 ms. Jumping can save at most 30 × 20 = 600 ms. Real
            savings depend on the schema and on the grammar back end, since engines can use
            different libraries for this.
          </p>
          <Table
            head={["", "vLLM", "SGLang"]}
            rows={[
              ["KV cache reuse", "Hashed fixed-size blocks", "Radix tree of token runs"],
              ["Core origin", "PagedAttention", "RadixAttention, structured generation"],
              ["API", "OpenAI-compatible", "OpenAI-compatible, plus a native API"],
            ]}
          />
          <Callout tone="tip">
            Both engines move quickly and borrow each other's ideas. Don't choose from a table.
            Benchmark both with your model, your prompts and your prefix patterns.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "System prompts and chat history make many requests share long prefixes.",
    "RadixAttention indexes retained KV cache in a tree, so shared prefixes skip prefill.",
    "Prefix matches are exact and start at the first token, so keep stable content first.",
    "Longest prefix match improves hit rates but has CPU and fairness costs.",
    "Constrained decoding guarantees format, and forced tokens can sometimes skip decode steps.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which change is most likely to destroy prefix cache hits?",
      options: [
        "Adding the user's question at the end",
        "Putting the current timestamp at the start of the system prompt",
        "Lowering the temperature",
        "Reducing max tokens",
      ],
      answer: 1,
      explain: "Matching runs from the first token, so an early change means nothing after it matches.",
    },
    {
      kind: "mcq",
      q: "Why are leaf nodes evicted before their parents?",
      options: [
        "Leaves are always larger",
        "Parents hold prefixes shared by all their children",
        "Leaves can't be stored in GPU memory",
        "Parents are always newer",
      ],
      answer: 1,
      explain: "A parent's tokens are needed to reach every path beneath it.",
    },
    {
      kind: "text",
      q: "A prompt has 6,000 tokens and 5,500 match the cached prefix. How many tokens need prefill?",
      format: "***",
      accept: ["500"],
      explain: "6,000 − 5,500 = 500 tokens.",
    },
    {
      kind: "text",
      q: "What does the scheduling policy abbreviation LPM stand for?",
      format: "******* ****** *****",
      accept: ["longest prefix match"],
      explain: "Longest prefix match favors requests with the most cached tokens.",
    },
  ],
};
