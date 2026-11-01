import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Hard",
  objectives: [
    "Describe the propose, verify and accept loop",
    "Explain why output quality is preserved",
    "Calculate speedup from acceptance rate and draft cost",
    "Decide when speculation helps and when it hurts",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Decoding is serial. To produce token 11, a model must know token 10. So a model that
            takes 40 ms per step is stuck at 25 tokens per second, no matter how many GPU cores sit
            idle. Each step is limited by moving the weights and KV cache through memory.
          </p>
          <p>
            But checking is different from creating. If someone hands the model five candidate
            tokens, it can check all of them in <em>one</em> forward pass, because all five positions
            are known at once. Generating is serial. Verifying is parallel.
          </p>
          <p>
            That's the idea behind <strong>speculative decoding</strong>. Picture a senior writer
            with a fast junior assistant. The junior drafts the next few words. The senior reads
            them in one glance, keeps the words they would have written anyway, and fixes the first
            wrong one. Reading is far quicker than writing every word yourself.
          </p>
          <p>
            In <strong>draft-target decoding</strong>, the junior is a small model (the{" "}
            <strong>draft</strong>) and the senior is the large model you actually want (the{" "}
            <strong>target</strong>).
          </p>
        </>
      ),
    },
    {
      id: "loop",
      title: "The loop",
      body: (
        <>
          <p>Each cycle has three steps:</p>
          <ol>
            <li><strong>Propose:</strong> the draft model generates k tokens, one at a time.</li>
            <li><strong>Verify:</strong> the target runs one forward pass over all k tokens.</li>
            <li>
              <strong>Accept:</strong> keep tokens from the left until the first one the target
              rejects. Everything after it is thrown away.
            </li>
          </ol>
          <p>
            The target always adds a bonus token. Its pass has already computed what comes next
            after the last accepted token, whether that's a correction for a rejected token or a
            continuation. So every cycle gives at least one token, the same as normal decoding.
          </p>
          <pre>
            <code>{`Text so far:  "The capital of France"

Draft proposes:   is | Paris | , | which
Target expects:   is | Paris | . | ...
Accepted:         is, Paris
Rejected:         ",", and "which" is discarded with it
Bonus from target: "."
Result this cycle: 3 tokens for one target pass`}</code>
          </pre>
          <p>
            Rejection requires a rollback. Both models must drop KV cache entries for tokens that
            were discarded. Engines handle this, but it adds bookkeeping.
          </p>
        </>
      ),
    },
    {
      id: "quality",
      title: "Why quality doesn't change",
      body: (
        <>
          <p>
            Speculation is a speedup, not an approximation. The draft only suggests, and the target
            has the final say on every token.
          </p>
          <p>
            With greedy decoding, the check is simple: accept a token only if it's the target's own
            top choice. The output matches what the target would produce alone, apart from tiny
            numerical differences.
          </p>
          <p>
            With sampling, the check uses probabilities. Let p be the target's probability for a
            token, and q the draft's. Accept the token with probability:
          </p>
          <Formula>accept chance = min(1, p ÷ q)</Formula>
          <p>
            If the target likes a token more than the draft did, always keep it. If the draft was
            overconfident, sometimes reject it. On rejection, the replacement is sampled from what's
            left of the target's distribution, adjusted for what has already been tried. The maths
            works out so that final tokens follow the target's distribution exactly.
          </p>
        </>
      ),
    },
    {
      id: "math",
      title: "Doing the arithmetic",
      body: (
        <>
          <p>
            Assume each proposed token is accepted with chance p, independently. Real acceptance
            isn't independent, so this is a simple model. For k proposed tokens:
          </p>
          <Formula>tokens per cycle = 1 + p + p² + ... + pᵏ</Formula>
          <p>
            Each extra term needs all previous tokens accepted as well. The 1 is the bonus token.
            Now take illustrative timings: target alone 40 ms per step, target verifying 4 extra
            tokens 44 ms, draft 5 ms per token, k = 4.
          </p>
          <pre>
            <code>{`Cycle time = 44 + (4 × 5) = 64 ms
Baseline   = 1 token ÷ 40 ms = 25 tokens/s

p = 0.8:
  tokens = 1 + 0.8 + 0.64 + 0.512 + 0.4096 = 3.36
  speed  = 3.36 ÷ 0.064 s ≈ 52.5 tokens/s  (about 2.1×)

p = 0.4:
  tokens = 1 + 0.4 + 0.16 + 0.064 + 0.0256 = 1.65
  speed  = 1.65 ÷ 0.064 s ≈ 25.8 tokens/s  (almost no gain)`}</code>
          </pre>
          <p>
            Acceptance rate decides everything. At p = 0.4, you've spent extra memory and compute
            for almost nothing. The best k also depends on p: long drafts waste work when the first
            rejection arrives early.
          </p>
          <Table
            head={["Factor", "What it changes"]}
            rows={[
              ["Better draft", "Higher p, but slower and more memory"],
              ["Larger k", "More possible gain, more wasted work"],
              ["Predictable text", "Higher p, such as code or boilerplate"],
              ["Creative text at high temperature", "Lower p"],
            ]}
          />
        </>
      ),
    },
    {
      id: "production",
      title: "Running it in production",
      body: (
        <>
          <p>The fastest way to try this is Transformers' assisted generation:</p>
          <pre>
            <code>{`from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("your-org/large-model")
target = AutoModelForCausalLM.from_pretrained(
    "your-org/large-model", torch_dtype="auto", device_map="auto"
)
draft = AutoModelForCausalLM.from_pretrained(
    "your-org/small-model", torch_dtype="auto", device_map="auto"
)

inputs = tokenizer("Explain caching.", return_tensors="pt").to(target.device)
output = target.generate(**inputs, assistant_model=draft, max_new_tokens=128)
print(tokenizer.decode(output[0], skip_special_tokens=True))`}</code>
          </pre>
          <p>
            The draft should come from a related model family. Serving engines support draft models
            too, but configuration differs across versions, so use your engine's current docs.
          </p>
          <Callout tone="warn">
            Speculation isn't free under load. The draft needs its own weights and KV cache, on top
            of the target's. Every rejected token is wasted compute. A GPU already running a large
            batch has little spare capacity, so speculation can lower total throughput even as it
            speeds up a single stream. Benchmark at your real concurrency, not with one request.
          </Callout>
          <Callout tone="note">
            Speculative decoding speeds up decode only. TTFT doesn't improve, because prefill still
            runs the whole prompt, and now the draft has to prefill too.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Verifying known tokens is parallel, even though generating them is serial.",
    "A draft proposes, the target verifies in one pass, and tokens are kept up to the first rejection.",
    "The target has the final word, so output quality is preserved.",
    "Speedup depends on acceptance rate, draft cost and draft length.",
    "The draft costs memory and compute, so test at real concurrency.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why can the target model check several proposed tokens in one forward pass?",
      options: [
        "All proposed tokens are already known, so the positions can be processed together",
        "It skips attention for proposed tokens",
        "It uses the draft model's weights",
        "It ignores the KV cache",
      ],
      answer: 0,
      explain: "Generation is serial only because each next token is unknown. Known tokens can run in parallel.",
    },
    {
      kind: "mcq",
      q: "The draft proposes 5 tokens. The target rejects the third. What happens?",
      options: [
        "All 5 are discarded",
        "Only the third is discarded",
        "The first 2 are kept, the rest are discarded, and the target adds a token",
        "The third is replaced and the last 2 are kept",
      ],
      answer: 2,
      explain: "Later tokens depended on the rejected one, so they're invalid and must be thrown away.",
    },
    {
      kind: "text",
      q: "Each proposed token is accepted with p = 0.5 and k = 2. How many tokens does the average cycle produce, including the bonus token?",
      format: "****",
      accept: ["1.75"],
      explain: "1 + 0.5 + 0.25 = 1.75.",
    },
    {
      kind: "text",
      q: "A cycle produces 3 tokens in 60 ms. How many tokens per second is that?",
      format: "**",
      accept: ["50"],
      explain: "3 ÷ 0.06 s = 50 tokens per second.",
    },
    {
      kind: "text",
      q: "Which model has the final say on every token, draft or target?",
      format: "******",
      accept: ["target"],
      explain: "The target verifies every token, so the draft can't change the result, only the speed.",
    },
  ],
};
