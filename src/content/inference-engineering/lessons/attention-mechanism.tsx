import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain queries, keys and values with a simple analogy",
    "Work through the attention formula step by step",
    "See why prefill and decode have such different attention costs",
  ],
  tasks: [
    {
      id: "idea",
      title: "Search, inside the model",
      body: (
        <>
          <p>
            Consider the sentence "The trophy didn't fit in the suitcase because it was too big".
            To understand "it", the model must work out which earlier word matters. Attention is
            the mechanism for that.
          </p>
          <p>
            Think of a search engine. You type a <strong>query</strong>. It compares it with the{" "}
            <strong>keys</strong> of documents, like titles. Then it returns their{" "}
            <strong>values</strong>, the content. Attention does a soft version: rather than
            picking one result, each token takes a weighted mix of all of them.
          </p>
        </>
      ),
    },
    {
      id: "formula",
      title: "The formula",
      body: (
        <>
          <Formula>Attention(Q, K, V) = softmax(Q Kᵀ ÷ √d) V</Formula>
          <p>Read it from the inside out:</p>
          <ol>
            <li><strong>Q Kᵀ</strong> scores how well each query matches each key.</li>
            <li><strong>÷ √d</strong> scales those scores so they don't grow too large in high dimensions.</li>
            <li><strong>softmax</strong> turns the scores into weights that sum to 1.</li>
            <li><strong>× V</strong> mixes the values using those weights.</li>
          </ol>
          <p>
            In an LLM, a token can only look backward. A <strong>causal mask</strong> blocks scores
            for future tokens during training and prefill, so a word can't peek at what comes
            after it.
          </p>
          <p>
            <strong>Multi-head attention</strong> runs this many times in parallel on smaller
            slices of the vector. One head might track grammar while another tracks topic. The
            outputs are then joined back together.
          </p>
        </>
      ),
    },
    {
      id: "cost",
      title: "The cost of attention",
      body: (
        <>
          <p>
            Every token compares itself with earlier tokens, so comparing all n tokens needs about
            n² operations. This one fact explains a lot of LLM serving behavior.
          </p>
          <Table
            head={["Phase", "New queries", "Keys compared", "Work per layer"]}
            rows={[
              ["Prefill, n prompt tokens", "n", "All earlier tokens", "Grows with n²"],
              ["Decode, one step", "1", "All n cached tokens", "Grows with n"],
            ]}
          />
          <p>
            So a prompt of 10,000 tokens takes roughly 100 times the attention work of a 1,000
            token prompt, while each decode step only gets about 10 times heavier.
          </p>
          <Callout tone="warn">
            This scaling is only for the attention itself. Measured prefill time often looks close
            to linear at typical lengths because the feed-forward work is linear and dominates.
            At very long contexts, the quadratic part takes over.
          </Callout>
        </>
      ),
    },
    {
      id: "gqa",
      title: "Saving memory with grouped-query attention",
      body: (
        <>
          <p>
            Standard multi-head attention gives every query head its own key and value head.{" "}
            <strong>Grouped-query attention</strong> (GQA) lets several query heads share one set.
            With 32 query heads and 8 key-value heads, the KV cache shrinks by 4 times, usually with
            little effect on quality.
          </p>
          <p>
            That's a direct win for serving, since smaller caches mean more concurrent requests on
            each GPU. Later, the Attention Optimization module covers how engines make the
            attention math itself faster.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Attention compares queries with keys, then blends the matching values.",
    "A causal mask stops tokens from seeing future tokens.",
    "Multi-head attention runs many parallel attention operations.",
    "Prefill attention grows with n², and each decode step grows with n.",
    "Grouped-query attention shrinks the KV cache by sharing keys and values.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does the softmax step produce?",
      options: ["Token IDs", "Weights that sum to 1", "A KV cache", "Position embeddings"],
      answer: 1,
      explain: "Softmax turns match scores into weights used to mix the values.",
    },
    {
      kind: "mcq",
      q: "Why is a causal mask used?",
      options: [
        "To speed up tokenization",
        "To stop tokens from seeing future tokens",
        "To compress the weights",
        "To block malicious prompts",
      ],
      answer: 1,
      explain: "Generation only has past context, so the model must not see ahead.",
    },
    {
      kind: "text",
      q: "A model has 64 query heads and 16 key-value heads. How many times smaller is its KV cache than full multi-head attention?",
      format: "*",
      accept: ["4"],
      explain: "64 ÷ 16 = 4.",
    },
  ],
};
