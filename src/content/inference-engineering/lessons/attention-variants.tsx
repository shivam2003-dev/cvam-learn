import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Separate kernel-level changes from model-level attention changes",
    "Calculate how grouped-query attention shrinks the KV cache",
    "Compare sliding-window, latent and sparse attention",
    "Read a model config to find which variant it uses",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: two kinds of attention change",
      body: (
        <>
          <p>
            Full multi-head attention has two costs that limit serving. Compute grows with the
            square of the sequence length, and the KV cache grows linearly with it, multiplied
            by the number of heads and layers. Researchers have tried many ways to reduce both.
            The names blur together, but one question sorts nearly all of them:
          </p>
          <p>
            <strong>Does this change the math the model was trained with?</strong>
          </p>
          <Table
            head={["", "Kernel-level", "Model-level"]}
            rows={[
              ["What changes", "How the math is executed", "The math itself"],
              ["Examples", "FlashAttention, memory-efficient SDPA", "Grouped-query, sliding-window, latent, sparse"],
              ["Same output?", "Yes, within floating-point rounding", "No"],
              ["Who decides", "You, the inference engineer", "The people who trained the model"],
              ["Retraining needed?", "No", "Yes, it's part of the architecture"],
            ]}
          />
          <p>
            This is the most useful thing to remember. You can swap a kernel at any time. You
            can't switch a trained full-attention model to sliding-window attention just to save
            memory, because its weights expect the context it was trained with. For model-level
            variants, your decision comes when you choose the model.
          </p>
        </>
      ),
    },
    {
      id: "gqa",
      title: "Grouped-query attention",
      body: (
        <>
          <p>
            In full multi-head attention, each head has its own query, key and value projections.
            <strong> Grouped-query attention</strong> (GQA) keeps all the query heads, but a group
            of them shares each key and value head. The cache stores fewer K and V vectors. The
            extreme case, one key and value head for all query heads, is called{" "}
            <strong>multi-query attention</strong>.
          </p>
          <p>The KV Cache lesson's formula changes slightly:</p>
          <Formula>KV bytes = 2 × layers × tokens × (KV heads × head dim) × bytes per value</Formula>
          <p>
            Take Llama 3 8B's shape: 32 layers, hidden size 4,096, and 32 query heads, so each
            head is 4,096 ÷ 32 = 128 dimensions wide. It has 8 KV heads. At 8,000 tokens in
            16-bit floats:
          </p>
          <pre>
            <code>{`Full attention (32 KV heads):
  2 × 32 × 8,000 × (32 × 128) × 2 = 4,194,304,000 bytes ≈ 3.9 GiB

GQA (8 KV heads):
  2 × 32 × 8,000 × (8 × 128) × 2 = 1,048,576,000 bytes ≈ 0.98 GiB`}</code>
          </pre>
          <p>
            That's one quarter of the memory, and the share of cache that must be read each decode
            step falls by the same amount. GQA is common in current open models because it gives
            a large serving benefit, and in practice model builders accept it readily.
          </p>
        </>
      ),
    },
    {
      id: "window-latent",
      title: "Sliding-window, latent and sparse attention",
      body: (
        <>
          <p>
            <strong>Sliding-window attention</strong> lets each token see only the last w tokens.
            Think of reading through a narrow slot: you see nearby lines clearly, but not the first
            page. The benefit is that compute and cache stop growing once a sequence is longer
            than the window. Mistral 7B popularized this approach in open models. The cost is that
            distant information can only travel indirectly, passing through stacked layers. Some
            models alternate local-window layers with full global layers to get a bit of both.
          </p>
          <p>
            <strong>Latent attention</strong>, used in DeepSeek's V2 and V3 models under the name
            multi-head latent attention (MLA), stores a compressed vector per token rather than
            full keys and values. It expands that vector at attention time. Cache memory falls a
            lot, but there's a compute price for the expansion, so it needs carefully written
            kernels. Standard attention kernels don't apply directly, which is a practical issue
            when an engine adds a new model.
          </p>
          <p>
            <strong>Sparse attention</strong> computes scores for only a chosen subset of token
            pairs, so it can break the quadratic compute cost. The selection can be a fixed
            pattern, or the model can learn it. The hard part is choosing well and cheaply, and
            irregular patterns are harder to run fast on GPUs than regular matrix math.
          </p>
          <Table
            head={["Variant", "Reduces", "Main cost", "Serving effect"]}
            rows={[
              ["Grouped-query", "KV cache", "Little in practice", "Easy, widely supported"],
              ["Multi-query", "KV cache, heavily", "Less expressive keys", "Very small cache"],
              ["Sliding-window", "Compute and cache at long lengths", "Less direct long-range context", "Bounded memory per request"],
              ["Latent (MLA)", "KV cache", "Extra compute, special kernels", "Needs engine support"],
              ["Sparse", "Compute at long lengths", "Selection logic, irregular access", "Needs special kernels"],
            ]}
          />
          <Callout tone="warn">
            Linear and other approximate attention methods appear often in papers, but a method's
            value depends on quality as well as speed. Evaluate it on your own tasks. Long-context
            retrieval is the first thing to test, because that's what these methods put at risk.
          </Callout>
        </>
      ),
    },
    {
      id: "reading",
      title: "How to check what a model uses",
      body: (
        <>
          <p>
            The model's config file usually tells you. Before you estimate capacity, read it
            rather than assuming full attention:
          </p>
          <pre>
            <code>{`from transformers import AutoConfig

cfg = AutoConfig.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")

print(cfg.num_hidden_layers)     # layers
print(cfg.hidden_size)           # hidden size
print(cfg.num_attention_heads)   # query heads
print(getattr(cfg, "num_key_value_heads", None))  # KV heads
print(getattr(cfg, "sliding_window", None))       # window, if any`}</code>
          </pre>
          <p>
            Field names differ across model families, so <code>getattr</code> with a default
            avoids a crash. If the KV head field is missing, assume it equals the query head
            count, unless the model's documentation says otherwise. Some repositories, such as
            Llama's, are gated, so you may need to accept a license first.
          </p>
          <Callout tone="tip">
            When you compare two models with similar quality, compare their cache per token as
            well. Two models with the same parameter count can differ several times over in KV
            memory, and that translates directly into how many users one GPU can serve.
          </Callout>
          <Callout tone="note">
            A long-context limit in a model card doesn't tell you how attention works. A model
            advertising a huge context may still use full attention, with cost growing to match.
            Check the architecture, then test latency at the lengths you really plan to serve.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Kernel-level changes keep the math. Model-level changes are baked in during training.",
    "Grouped-query attention shrinks the KV cache by the ratio of KV heads to query heads.",
    "Sliding-window attention bounds memory per request but limits direct long-range context.",
    "Latent and sparse attention can save a lot, but they need engine and kernel support.",
    "Always read the model config before estimating capacity.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which of these can you adopt without changing or retraining the model?",
      options: [
        "Grouped-query attention",
        "Sliding-window attention",
        "FlashAttention",
        "Latent attention",
      ],
      answer: 2,
      explain: "FlashAttention is a kernel-level change. It computes the same math more efficiently.",
    },
    {
      kind: "mcq",
      q: "What is the main downside of sliding-window attention?",
      options: [
        "Cache memory grows without limit",
        "Tokens can't directly attend to anything outside the window",
        "It requires 32-bit floats",
        "It can't be used with batching",
      ],
      answer: 1,
      explain: "Far-away information has to pass indirectly through layers, which can hurt long-range tasks.",
    },
    {
      kind: "mcq",
      q: "In the table above, which variant lowers KV cache memory but adds compute to expand vectors?",
      options: ["Multi-query", "Latent", "Sliding-window", "Sparse"],
      answer: 1,
      explain: "Latent attention stores a compressed vector and expands it when attention runs.",
    },
    {
      kind: "text",
      q: "A model has 24 query heads and 6 KV heads. Compared with full attention, its KV cache is what fraction? Give the answer as a fraction.",
      format: "***",
      accept: ["1/4", "0.25", "25%", "a quarter"],
      explain: "6 ÷ 24 = 1/4, so the cache is one quarter of the full-attention size.",
    },
    {
      kind: "text",
      q: "What is the three-letter abbreviation for grouped-query attention?",
      format: "***",
      accept: ["gqa"],
      explain: "GQA keeps all the query heads but shares each key and value head across a group.",
    },
  ],
};
