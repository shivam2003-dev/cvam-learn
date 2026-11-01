import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Show that prefill is compute-bound and decode is memory-bound",
    "Estimate a decode speed limit from model size and bandwidth",
    "Explain why batching helps decode but doesn't change a single request's speed",
  ],
  tasks: [
    {
      id: "two-phases",
      title: "Two phases, two bottlenecks",
      body: (
        <>
          <p>
            An LLM request has two phases with opposite behavior. Using the roofline ideas from the
            last lessons, it's easy to see why.
          </p>
          <Table
            head={["", "Prefill", "Decode"]}
            rows={[
              ["Tokens per pass", "Whole prompt at once", "One token per step"],
              ["Weight reuse", "High: shared by every prompt token", "Low: each step reads all weights for one token"],
              ["Arithmetic intensity", "High", "Low, about the batch size"],
              ["Bottleneck", "Compute", "Memory bandwidth"],
              ["Shows up as", "Time to first token", "Inter-token latency"],
            ]}
          />
        </>
      ),
    },
    {
      id: "prefill",
      title: "Prefill: compute-bound",
      body: (
        <>
          <p>
            A rule of thumb for a dense transformer: a forward pass costs about 2 FLOPs per
            parameter per token.
          </p>
          <Formula>prefill FLOPs ≈ 2 × parameters × prompt tokens</Formula>
          <p>
            For an 8 billion parameter model and a 2,000 token prompt:
          </p>
          <pre>
            <code>{`2 × 8×10^9 × 2,000 = 3.2 × 10^13 FLOPs = 32 TFLOP

At 400 TFLOP/s achieved:  32 ÷ 400 = 0.08 s = about 80 ms`}</code>
          </pre>
          <p>
            Each weight is read once but used for 2,000 tokens, so intensity is high and the math
            units stay busy. Doubling the prompt doubles prefill time. Faster compute, such as
            lower precision, directly shortens it.
          </p>
        </>
      ),
    },
    {
      id: "decode",
      title: "Decode: memory-bound",
      body: (
        <>
          <p>
            Each decode step produces one token, but must read every weight from memory to do it.
            So the floor on step time is the time to read the weights.
          </p>
          <Formula>decode step time ≥ weight bytes ÷ memory bandwidth</Formula>
          <pre>
            <code>{`8B model, 16-bit  =  16 GB of weights
Bandwidth 2 TB/s  =  2,000 GB/s
Step time ≥ 16 ÷ 2,000 = 0.008 s = 8 ms   →  at most 125 tokens/s

Same model, 8-bit weights  =  8 GB
Step time ≥ 8 ÷ 2,000 = 4 ms             →  at most 250 tokens/s`}</code>
          </pre>
          <p>
            Notice what moved the number: fewer bytes, not more compute. That's why quantization,
            and higher-bandwidth memory, speed up decoding so directly.
          </p>
          <Callout tone="note">
            This is an upper bound on one request's speed. The KV cache read and other overheads
            add time, so real numbers come in lower, and they fall as context grows.
          </Callout>
        </>
      ),
    },
    {
      id: "batching",
      title: "Batching changes the totals, not the step",
      body: (
        <>
          <p>
            With a batch of 32, the weights are still read once per step, so the step still takes
            about 8 ms in the example above. But that step now produces 32 tokens.
          </p>
          <ul>
            <li>Per-request speed stays near 125 tokens per second.</li>
            <li>Total output rises toward 32 × 125 = 4,000 tokens per second.</li>
          </ul>
          <p>
            This holds until the batch is large enough to turn compute-bound, or until the KV
            caches fill GPU memory. Both limits come from the lessons you've already seen.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Prefill reuses each weight across the whole prompt, so it's compute-bound.",
    "Decode reads all weights for each token, so it's memory-bound.",
    "A dense model needs about 2 FLOPs per parameter per token.",
    "Decode step time is at least weight bytes divided by bandwidth.",
    "Batching raises total throughput, but a single request's speed stays the same.",
  ],
  quiz: [
    {
      kind: "text",
      q: "An 8B model in 8-bit weights is 8 GB. Bandwidth is 2 TB/s. What is the minimum decode step time in milliseconds?",
      format: "*",
      accept: ["4"],
      explain: "8 GB ÷ 2,000 GB/s = 0.004 s = 4 ms.",
    },
    {
      kind: "mcq",
      q: "Which technique most directly speeds up memory-bound decoding?",
      options: [
        "Increasing prompt length",
        "Quantizing weights to fewer bits",
        "Adding more CPU cores",
        "Raising the sampling temperature",
      ],
      answer: 1,
      explain: "Fewer bytes per weight means less data to read per step.",
    },
    {
      kind: "mcq",
      q: "Which phase's time grows roughly in proportion to prompt length?",
      options: ["Prefill", "Decode only", "Neither", "Tokenization only"],
      answer: 0,
      explain: "Prefill does work for every prompt token, so it scales with prompt length.",
    },
    {
      kind: "text",
      q: "A 70B model at 16 bits is 140 GB. With 3.5 TB/s of bandwidth, about how many tokens per second is the upper bound for one request?",
      format: "**",
      accept: ["25"],
      explain: "140 ÷ 3,500 = 0.04 s per token, so about 25 tokens per second.",
    },
  ],
};
