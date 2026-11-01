import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Separate response, semantic and prefix caching",
    "Calculate TTFT and compute savings from a cache hit rate",
    "Structure prompts to get prefix cache hits",
    "Avoid privacy and staleness failures",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A support bot sends the same 4,000-token system prompt with every request. Each time, the
            GPU runs those identical tokens through prefill and gets the identical result. Meanwhile
            500 users ask "How do I reset my password?" and the model writes much the same answer
            500 times.
          </p>
          <p>
            That's compute you paid for and threw away. Caching stores work you've already done so
            you can reuse it. Think of a restaurant. If someone orders the dish that's sitting ready
            under the heat lamp, you hand it over. That's a <strong>response cache</strong>. If
            someone orders a different dish that uses the same sauce, you don't make the sauce again.
            You start from the prepared sauce. That's a <strong>prefix cache</strong>.
          </p>
        </>
      ),
    },
    {
      id: "layers",
      title: "The caching layers",
      body: (
        <>
          <Table
            head={["Layer", "Stores", "Matches on", "Saves"]}
            rows={[
              ["Response cache", "Final answer text", "Exact same request", "All inference"],
              ["Semantic cache", "Final answer text", "Similar meaning", "All inference, with risk"],
              ["Prefix cache", "KV cache blocks", "Identical leading tokens", "Prefill of matched tokens"],
            ]}
          />
          <p>
            <strong>Response caching</strong> sits in front of the engine, often in Redis. It's
            simple and costs almost nothing per hit. It only helps with exact repeats, which are
            common in some products and rare in chat.
          </p>
          <p>
            <strong>Semantic caching</strong> embeds each query as a vector, then looks for a stored
            query that is close in meaning. Hits are far more frequent, but so are mistakes. "Cancel
            my order" and "Cancel my subscription" look alike to an embedding model, but they're very
            different requests.
          </p>
          <p>
            <strong>Prefix caching</strong> lives inside the engine. When a new prompt starts with
            the same tokens as an earlier one, the engine reuses those KV cache entries and prefills
            only what's new. The output isn't reused, so the response is still freshly generated. It
            can't change the answer, apart from tiny numerical differences.
          </p>
          <p>
            <strong>Prompt caching</strong> is the name API providers usually give this feature when
            they offer it to customers. Some apply it automatically. Others ask you to mark what to
            cache. Many charge less for cached input tokens. Terms and prices vary and change, so
            check your provider's current docs.
          </p>
        </>
      ),
    },
    {
      id: "math",
      title: "What a hit is worth",
      body: (
        <>
          <p>
            A prompt has a 4,000-token shared system prompt and a 200-token user message. Assume an
            illustrative prefill speed of 5,000 tokens per second.
          </p>
          <pre>
            <code>{`Cold (miss): 4,200 ÷ 5,000 = 0.84 s
Hit:           200 ÷ 5,000 = 0.04 s

Prefill work saved on a hit = 4,000 ÷ 4,200 ≈ 95%`}</code>
          </pre>
          <p>Across all requests, weight the two cases by hit rate:</p>
          <Formula>average prefill time = hit rate × hit time + (1 − hit rate) × miss time</Formula>
          <pre>
            <code>{`At a 70% hit rate:
  0.7 × 0.04 + 0.3 × 0.84 = 0.028 + 0.252 = 0.28 s`}</code>
          </pre>
          <p>
            Average prefill time falls by two-thirds. And freed GPU time means more requests per
            server. Decode costs don't change, though. A prefix cache helps most when prompts are
            long and outputs are short.
          </p>
        </>
      ),
    },
    {
      id: "prefix",
      title: "Designing for prefix hits",
      body: (
        <>
          <p>
            A prefix match runs from the very first token and stops at the first difference. Change
            one token early on, and everything after it misses. Engines also match in fixed blocks
            of tokens, so very short prefixes may gain nothing.
          </p>
          <Table
            head={["Bad", "Good"]}
            rows={[
              ["Current time at the top of the system prompt", "Time at the end, after stable content"],
              ["User name in the first line", "Static instructions first, user details later"],
              ["Tool list in random order", "Tools sorted the same way every time"],
              ["Retrieved documents before instructions", "Instructions, then documents, then the question"],
            ]}
          />
          <p>The rule is short: <strong>stable content first, variable content last</strong>.</p>
          <p>
            Multi-turn chat suits prefix caching naturally, because each turn extends the last one.
            If you edit or summarize old messages, though, the prefix changes and the cache misses
            from that point.
          </p>
        </>
      ),
    },
    {
      id: "safety",
      title: "Staying safe",
      body: (
        <>
          <p>
            A response cache key must include everything that affects the output. Miss one field and
            you could serve the wrong answer, or another customer's data.
          </p>
          <pre>
            <code>{`import hashlib, json

def cache_key(tenant_id, model_revision, messages, params):
    payload = {
        "tenant": tenant_id,
        "model": model_revision,
        "messages": messages,
        "params": params,  # temperature, max_tokens, tools, and so on
    }
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode()).hexdigest()`}</code>
          </pre>
          <p>
            Note the tenant ID. Without it, one customer could receive an answer built from another
            customer's private context. Set a time-to-live (TTL) too, so stored answers expire and
            stale facts don't linger. Clear the cache whenever the model changes.
          </p>
          <Callout tone="warn" title="Timing can leak">
            Prefix caches have a subtle side channel. A cache hit is faster, so a user could guess
            that someone else recently sent a particular prompt by timing their own requests. On
            multi-tenant systems, keep tenants' caches separate. Some engines let you salt the
            prefix per tenant for this reason.
          </Callout>
          <Callout tone="tip">
            Track hit rate and tokens saved for each layer. If most of your traffic is unique, a
            semantic cache may add risk and little else, while prefix caching keeps paying off.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Response caches reuse answers, while prefix caches reuse prefill work.",
    "Semantic caches hit more often, but risk returning a wrong answer.",
    "Prefix matches stop at the first different token, so put stable content first.",
    "Cache hits lower TTFT and free GPU time, but don't reduce decode cost.",
    "Include tenant, model and parameters in keys, and isolate tenants.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which change is most likely to destroy prefix cache hits?",
      options: [
        "Adding a timestamp to the first line of the system prompt",
        "Appending the user's question at the end",
        "Keeping tools in a fixed order",
        "Lowering max_tokens",
      ],
      answer: 0,
      explain: "Matching stops at the first difference, so an early change makes everything after it miss.",
    },
    {
      kind: "mcq",
      q: "Which cache could return an answer that's wrong for a slightly different question?",
      options: ["Prefix cache", "Semantic cache", "KV cache", "Tokenizer cache"],
      answer: 1,
      explain: "A semantic cache matches on similar meaning, and similar isn't the same as identical.",
    },
    {
      kind: "text",
      q: "A hit costs 0.1 s and a miss costs 1.1 s. At a 50% hit rate, what's the average in seconds?",
      format: "***",
      accept: ["0.6", ".6", "0.60"],
      explain: "0.5 × 0.1 + 0.5 × 1.1 = 0.05 + 0.55 = 0.6 s.",
    },
    {
      kind: "text",
      q: "A 9,000-token prompt has 6,000 cached tokens. How many tokens must still be prefilled?",
      format: "*****",
      accept: ["3000", "3,000"],
      explain: "9,000 − 6,000 = 3,000 tokens.",
    },
  ],
};
