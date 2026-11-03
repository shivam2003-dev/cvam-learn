import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Estimate the cost of an LLM feature from tokens and volume",
    "Cut latency and cost with caching, batching, model routing and shorter context",
    "Know when self-hosting or quantisation is worth the effort",
  ],
  tasks: [
    {
      id: "cost",
      title: "Know your numbers",
      body: (
        <>
          <p>
            Hosted model pricing is per token, usually with different prices for input and output.
            A rough estimate before you build avoids ugly surprises.
          </p>
          <Formula>cost per request = (input tokens x input price) + (output tokens x output price)</Formula>
          <pre>
            <code>{`Illustrative prices: $3 per 1M input tokens, $15 per 1M output tokens
A request: 6,000 input tokens, 500 output tokens
  input : 6,000 / 1,000,000 x $3  = $0.0180
  output:   500 / 1,000,000 x $15 = $0.0075
  total ~ $0.0255 per request

At 100,000 requests a day -> about $2,550 per day`}</code>
          </pre>
          <p>
            Output tokens are slower and pricier than input tokens, and generation speed limits
            latency. Measure <strong>time to first token</strong> (how fast streaming starts) and{" "}
            <strong>tokens per second</strong> separately.
          </p>
        </>
      ),
    },
    {
      id: "levers",
      title: "The main levers",
      body: (
        <>
          <Table
            head={["Lever", "Effect", "Notes"]}
            rows={[
              ["Shorter prompts and context", "Cost and latency", "Retrieve fewer, better chunks; drop dead history"],
              ["Prompt caching", "Cheaper, faster repeated prefixes", "Put stable system prompt and docs first"],
              ["Response caching", "Skip the call", "Cache identical or semantically similar questions where safe"],
              ["Model routing", "Cost", "Small model for easy tasks, large model for hard ones"],
              ["Streaming", "Perceived latency", "Show tokens as they arrive"],
              ["Batch APIs", "Lower price for offline work", "Use for non-urgent bulk jobs"],
              ["Parallel calls", "Wall-clock time", "Run independent steps together"],
              ["Cap output length", "Cost and latency", "Ask for concise or structured output"],
            ]}
          />
          <Callout tone="tip">
            Optimise last. First make it correct and measured with evals, then change one lever at
            a time and re-run the evals to confirm quality held.
          </Callout>
        </>
      ),
    },
    {
      id: "selfhost",
      title: "Self-hosting and smaller models",
      body: (
        <>
          <p>
            Sometimes the customer requires models on their own hardware. Then performance
            engineering becomes yours.
          </p>
          <ul>
            <li>
              <strong>Quantisation</strong> stores weights in fewer bits (8 or 4), cutting memory
              and often boosting speed with a small quality cost.
            </li>
            <li>
              <strong>Serving engines</strong> such as vLLM or TensorRT-LLM use continuous batching
              and KV-cache management for higher throughput.
            </li>
            <li>
              <strong>Distillation and fine-tuning</strong> can make a small model good at a narrow
              task.
            </li>
            <li>
              <strong>Hardware fit.</strong> Memory capacity decides which models fit; memory
              bandwidth often decides token speed.
            </li>
          </ul>
          <Callout tone="warn">
            Self-hosting trades per-token fees for fixed costs and operations work. It usually
            pays off at steady high volume or when data cannot leave, not for light usage.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Estimate cost from input and output tokens times price times volume before building.",
    "Cut tokens, cache prefixes and responses, route by difficulty, stream, batch and parallelise.",
    "Measure quality with evals after every optimisation.",
    "Self-hosting and quantisation fit steady volume or strict data rules, and add operations burden.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which change usually reduces both cost and latency the most for a RAG feature?",
      options: [
        "Retrieving fewer but better chunks",
        "Adding more unrelated context",
        "Increasing max output length",
        "Disabling caching",
      ],
      answer: 0,
      explain: "Less input text means fewer tokens to pay for and process.",
    },
    {
      kind: "text",
      q: "A request uses 2,000,000 input tokens in a day at $3 per 1M input tokens (output ignored). What is the daily input cost in dollars?",
      format: "*",
      accept: ["6", "$6", "6.00", "$6.00"],
      explain: "2 million tokens is 2 x $3 = $6.",
    },
    {
      kind: "mcq",
      q: "What does quantisation do?",
      options: [
        "Stores model weights with fewer bits to save memory and often increase speed",
        "Trains a new model",
        "Adds more parameters",
        "Encrypts prompts",
      ],
      answer: 0,
      explain: "Lower-precision weights shrink memory use, with a small accuracy trade-off.",
    },
  ],
};
