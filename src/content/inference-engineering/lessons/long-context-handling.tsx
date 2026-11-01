import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Estimate memory and prefill time for a very long prompt",
    "Protect normal traffic with admission control and isolation",
    "Explain chunked prefill and its trade-off",
    "Handle over-limit prompts without silent data loss",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A user pastes a 200,000-token contract into your chatbot. It's one request, but it behaves
            like a truck entering a street of bicycles. It takes a huge share of GPU memory, holds up
            everyone behind it, and may run out of memory halfway through.
          </p>
          <p>
            Long context means a model that accepts prompts of tens or hundreds of thousands of
            tokens. A larger advertised limit sells well. Serving it safely is an engineering problem,
            because long prompts stress all the things this course has discussed: memory, prefill,
            scheduling and tail latency.
          </p>
        </>
      ),
    },
    {
      id: "math",
      title: "What one long prompt costs",
      body: (
        <>
          <p>
            Use the example model from the KV Cache lesson: 32 layers, a hidden size of 4,096, and
            2 bytes per value. First work out the cost per token:
          </p>
          <Formula>KV bytes per token = 2 × layers × hidden size × bytes per value</Formula>
          <pre>
            <code>{`Per token:     2 × 32 × 4,096 × 2 = 524,288 bytes = 0.5 MiB
200,000 tokens: 200,000 × 0.5 MiB = 100,000 MiB ≈ 97.7 GiB
With grouped-query attention sharing keys and values
across 4× fewer heads:         97.7 ÷ 4 ≈ 24.4 GiB`}</code>
          </pre>
          <p>
            Even the smaller figure would use a large part of a single GPU's memory for one user.
            Next, time. At an illustrative 5,000 tokens per second:
          </p>
          <pre>
            <code>{`Prefill time = 200,000 ÷ 5,000 = 40 s`}</code>
          </pre>
          <p>
            Forty seconds before the first token. That estimate is also optimistic. Each new token
            attends to all earlier ones, so per-token cost tends to grow with position, and prefill
            usually slows as the prompt gets longer. Measure your real curve at several lengths.
          </p>
          <p>
            Decode suffers too. Every step now moves a much larger cache, so tokens per second falls.
            A model doing fine at 8,000 tokens can feel sluggish at 200,000.
          </p>
          <Callout tone="note">
            These figures describe one model. Check <code>num_key_value_heads</code> and your own
            memory measurements. Treat the calculation as a planning tool, not a guarantee.
          </Callout>
        </>
      ),
    },
    {
      id: "admission",
      title: "Admission control",
      body: (
        <>
          <p>
            <strong>Admission control</strong> means deciding whether a request may enter before you
            spend anything on it. Without it, requests start, grow, and then fail once the GPU is
            exhausted, wasting everything already done.
          </p>
          <pre>
            <code>{`from fastapi import HTTPException

MAX_CONTEXT = 131_072
MAX_PROMPT_TOKENS_FREE = 16_384
MIB_PER_TOKEN = 0.5

def admit(prompt_tokens, max_tokens, tier, free_cache_mib):
    total = prompt_tokens + max_tokens

    if total > MAX_CONTEXT:
        raise HTTPException(400, "Prompt plus max_tokens exceeds the context limit.")
    if tier == "free" and prompt_tokens > MAX_PROMPT_TOKENS_FREE:
        raise HTTPException(400, "Prompt is too long for this plan.")
    if total * MIB_PER_TOKEN > free_cache_mib:
        raise HTTPException(429, "Server is at capacity. Retry shortly.")`}</code>
          </pre>
          <p>
            Reserve for the prompt <em>plus</em> <code>max_tokens</code>, since the cache keeps growing
            during decode. Tokenize on the server too, because a client's token count can't be trusted.
          </p>
          <p>
            Rate limits should count tokens as well. A limit of 60 requests per minute treats a
            20-token question and a 200,000-token document as equal. Tokens per minute doesn't.
          </p>
          <p>Engine settings provide a second line of defense. With vLLM, for example:</p>
          <pre>
            <code>{`vllm serve your-org/your-model \\
  --max-model-len 131072 \\
  --max-num-batched-tokens 8192`}</code>
          </pre>
          <p>
            These cap total context and the tokens processed per scheduling step. Flag names can
            change between releases, so check your version.
          </p>
        </>
      ),
    },
    {
      id: "scheduling",
      title: "Keeping others moving",
      body: (
        <>
          <p>
            If a GPU spends 40 seconds on one prefill, every streaming response on it stalls.
            Inter-token latency spikes for people who did nothing wrong.
          </p>
          <p>
            <strong>Chunked prefill</strong> splits a long prompt into pieces, and each scheduler step
            mixes one piece with decode work for other requests. It's like a long freight train that
            pulls aside regularly to let commuter trains pass. It keeps other streams smooth, but the
            long request itself takes longer to finish.
          </p>
          <Table
            head={["Technique", "Protects", "Cost"]}
            rows={[
              ["Chunked prefill", "Inter-token latency of others", "Longer TTFT for the long request"],
              ["Dedicated long-context pool", "All normal traffic", "Separate capacity, possibly idle"],
              ["Separate prefill and decode GPUs", "Decode smoothness", "Transfers and system complexity"],
              ["Prefix caching", "Repeat questions on one document", "Memory or storage for the cache"],
            ]}
          />
          <p>
            A <strong>dedicated pool</strong> is often the safest move. Route by token count, so
            prompts past a threshold go to their own replicas, with their own limits and alerts.
            Long-context users can't then harm everyone else. The lesson Prefill &amp; Decode
            Disaggregation covers the option of separating those phases.
          </p>
          <p>
            Prefix caching matters a lot here. If a user asks ten questions about a contract, only the
            first pays the 40 seconds, as long as the question comes after the document.
          </p>
        </>
      ),
    },
    {
      id: "edges",
      title: "Failing safely",
      body: (
        <>
          <p>
            <strong>Never truncate silently.</strong> If you cut tokens from the start, you may delete
            the system prompt, including safety rules. If you cut from the end, you may delete the
            actual question. Either way the user gets a confident answer to something they didn't
            ask. Return a clear error with the token counts, or make any trimming explicit.
          </p>
          <p>
            <strong>Reduce the prompt on the client.</strong> For very long inputs, retrieval sends
            only relevant passages, and summarization compresses old conversation turns. Both also
            change prefixes, so they affect caching.
          </p>
          <p>
            <strong>Handle timeouts.</strong> Proxies and load balancers often cut idle connections.
            A long prefill sends nothing for a while, so raise the timeouts on that route, or send
            periodic keep-alive events on a streaming connection.
          </p>
          <p>
            <strong>Propagate cancellation.</strong> When a client disconnects, abort the request.
            Otherwise a long prefill keeps burning a GPU for someone who has left.
          </p>
          <Callout tone="warn">
            A model that accepts 200,000 tokens doesn't always use them well. Evaluate answers about
            content deep inside long documents, and test whether quality holds at your limit. Advertise
            what you've tested, not just what fits.
          </Callout>
          <Callout tone="tip">
            Load test with a realistic mix: mostly short requests, and a few very long ones. A test of
            only short prompts will look great, and it'll hide the failure you most need to see.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "KV memory and prefill time grow with prompt length, and prefill often slows as prompts grow.",
    "Check prompt plus max_tokens against limits before work starts.",
    "Rate limit by tokens, since requests vary enormously in cost.",
    "Chunked prefill and dedicated pools stop long requests from stalling others.",
    "Never truncate silently, propagate cancellations, and test quality at the limit.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why must admission control include max_tokens as well as prompt tokens?",
      options: [
        "The KV cache keeps growing during decode",
        "It makes prefill faster",
        "It's needed for tokenization",
        "It shrinks the weights",
      ],
      answer: 0,
      explain: "Each generated token adds to the cache, so memory needs to cover the whole response.",
    },
    {
      kind: "mcq",
      q: "What's the main trade-off of chunked prefill?",
      options: [
        "It changes the model's answers",
        "Other streams stay smooth, but the long request's TTFT grows",
        "It removes the need for a KV cache",
        "It requires a second model",
      ],
      answer: 1,
      explain: "Sharing the GPU protects other streams, but the long prompt takes longer to finish prefill.",
    },
    {
      kind: "text",
      q: "At 0.5 MiB per token, how many MiB does a 40,000-token context need?",
      format: "*****",
      accept: ["20000", "20,000"],
      explain: "40,000 × 0.5 = 20,000 MiB.",
    },
    {
      kind: "text",
      q: "A 150,000-token prompt prefills at 5,000 tokens per second. How many seconds is that?",
      format: "**",
      accept: ["30"],
      explain: "150,000 ÷ 5,000 = 30 s.",
    },
  ],
};
