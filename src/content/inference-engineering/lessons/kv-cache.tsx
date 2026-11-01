import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Medium",
  objectives: [
    "Explain what the KV cache stores and why decoding needs it",
    "Estimate KV cache memory from model parameters",
    "Connect cache size to concurrency limits on a GPU",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            In a transformer, each token looks back at earlier tokens through attention. Every
            token is projected into three vectors: a <strong>query</strong> (what am I looking
            for?), a <strong>key</strong> (what do I contain?) and a <strong>value</strong> (what
            do I pass on?). A token's query is compared with the keys of earlier tokens, and the
            matching values are blended together.
          </p>
          <p>
            Output is generated one token at a time. Without any cache, producing token 1,001
            means recomputing keys and values for the previous 1,000 tokens, and token 1,002
            repeats it all again. Total work grows with the square of the sequence length.
          </p>
          <p>
            But keys and values for old tokens never change, because earlier text doesn't change.
            So store them. That store is the <strong>KV cache</strong>. Each new step computes K
            and V only for the newest token, appends them, and reads the rest from memory.
          </p>
          <Table
            head={["", "Without cache", "With cache"]}
            rows={[
              ["Tokens processed per step", "All tokens so far", "1 new token"],
              ["Step cost over a response", "Grows with length", "Mostly flat, slow growth"],
              ["Memory", "Small", "Large and growing"],
            ]}
          />
          <p>
            That's the trade: spend memory to save compute. It's the reason decode is practical at
            all.
          </p>
        </>
      ),
    },
    {
      id: "phases",
      title: "How it connects to prefill and decode",
      body: (
        <>
          <p>
            <strong>Prefill</strong> runs all the prompt tokens through the model at once and fills
            the cache in a single pass. <strong>Decode</strong> then adds to it one token per step.
          </p>
          <p>
            Each decode step must read the whole cache for that request. That's why decode is so
            sensitive to memory bandwidth: there's not much new math, but a lot of data to move.
          </p>
        </>
      ),
    },
    {
      id: "size",
      title: "How big does it get?",
      body: (
        <>
          <p>For a standard transformer, every layer stores one K and one V vector per token:</p>
          <Formula>KV bytes = 2 × layers × tokens × hidden size × bytes per value</Formula>
          <p>
            Take a model with 32 layers and a hidden size of 4,096, stored in 16-bit floats (2
            bytes), at 8,000 tokens of context:
          </p>
          <pre>
            <code>{`2 × 32 × 8,000 × 4,096 × 2 = 4,194,304,000 bytes
                          ≈ 3.9 GiB`}</code>
          </pre>
          <p>
            That's <strong>one request</strong>. Twenty of those need about 78 GiB, more than the
            cache room on many single GPUs once the weights are loaded. This is why long context
            limits concurrency so sharply, and why engines work so hard on this one structure.
          </p>
          <Callout tone="note">
            Many modern models use grouped-query attention, sharing keys and values across
            several query heads. That shrinks the cache a lot, so check the model's{" "}
            <code>num_key_value_heads</code> setting. The formula here is the upper estimate
            for full multi-head attention.
          </Callout>
        </>
      ),
    },
    {
      id: "concurrency",
      title: "Memory sets your concurrency",
      body: (
        <>
          <p>GPU memory has to hold weights first, then the caches of every active request:</p>
          <Formula>max requests ≈ (GPU memory − weights − overhead) ÷ KV per request</Formula>
          <p>
            With 80 GiB of memory, 30 GiB of weights and 4 GiB per request, you get 12 concurrent
            long requests at most, and fewer after engine overhead.
          </p>
          <p>Engines use several techniques to stretch this limit:</p>
          <ul>
            <li>
              <strong>Paged allocation:</strong> grow caches in blocks rather than reserving the
              worst case, as vLLM's PagedAttention does.
            </li>
            <li>
              <strong>Prefix sharing:</strong> requests with the same system prompt reuse cached
              blocks.
            </li>
            <li>
              <strong>Eviction:</strong> pause a request and drop or move its cache when memory is
              short, then restore it later.
            </li>
            <li>
              <strong>Offloading:</strong> keep inactive caches in CPU memory or on fast disks.
            </li>
          </ul>
          <Callout tone="warn">
            If memory runs out mid-response, the engine must evict something. Recomputing an
            evicted cache is slow, so a system close to its memory limit can see latency jump
            suddenly. Watch cache utilization as closely as GPU utilization.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The KV cache stores keys and values for past tokens, so they're never recomputed.",
    "It trades memory for compute, which makes decoding practical.",
    "Size grows with layers, tokens, hidden size and precision.",
    "Memory left after weights sets your concurrency limit.",
    "Paging, prefix sharing, eviction and offloading stretch that limit.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why can keys and values for past tokens be reused?",
      options: [
        "They're compressed by the GPU",
        "Earlier tokens don't change, so neither do their keys and values",
        "They're the same for all models",
        "Attention ignores past tokens",
      ],
      answer: 1,
      explain: "Text already generated stays the same, so recomputing it would be wasted work.",
    },
    {
      kind: "mcq",
      q: "Doubling context length has what effect on KV cache size?",
      options: ["No effect", "Roughly doubles it", "Quadruples it", "Halves it"],
      answer: 1,
      explain: "Size grows linearly with token count.",
    },
    {
      kind: "text",
      q: "A GPU has 48 GiB. Weights take 24 GiB. Each request needs 3 GiB of KV cache. Ignoring overhead, how many concurrent requests fit?",
      format: "*",
      accept: ["8"],
      explain: "(48 − 24) ÷ 3 = 8.",
    },
    {
      kind: "text",
      q: "Which of the three attention vectors is not stored in the KV cache?",
      format: "*****",
      accept: ["query", "queries"],
      explain: "The cache stores keys and values. Only the newest token needs a query, so it's computed fresh.",
    },
  ],
};
