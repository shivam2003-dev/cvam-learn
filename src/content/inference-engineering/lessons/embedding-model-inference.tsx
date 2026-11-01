import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Separate online query traffic from bulk indexing traffic",
    "Calculate padding waste in a batch",
    "Use sorting and token budgets to fill batches efficiently",
    "Estimate the time and cost of an indexing job",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Embedding jobs are small. A single text might take a few milliseconds. But there are
            often vast numbers of them. A search product might embed 50 million document chunks
            once, then a thousand queries every second, forever.
          </p>
          <p>
            In LLM serving, the hard part is memory and long-lived streams. Embedding has neither:
            there's no KV cache and no decode loop, and a request is over after one forward pass.
            What's left is a batching problem. GPUs are fast when they process many inputs in
            parallel, so the whole job is about filling each batch with useful work.
          </p>
          <p>
            These are also two very different workloads, and it pays to treat them separately.
          </p>
          <Table
            head={["", "Online queries", "Bulk indexing"]}
            rows={[
              ["Input", "One short text", "Millions of chunks"],
              ["Goal", "Low latency", "High throughput, low cost"],
              ["Typical batch", "Small, whatever is waiting", "Large and full"],
              ["If it fails", "User sees an error", "Retry that part"],
            ]}
          />
        </>
      ),
    },
    {
      id: "padding",
      title: "Padding: the hidden cost",
      body: (
        <>
          <p>
            A batch is a rectangle, because GPUs work on regular tensors. Every text in it must
            have the same length, so shorter texts get filled with empty{" "}
            <strong>padding</strong> tokens. The model still has to allocate that space and run
            the matching math.
          </p>
          <Formula>padded tokens = batch size × longest text in the batch</Formula>
          <Formula>batch fill = real tokens ÷ padded tokens</Formula>
          <p>Take 31 short texts of 20 tokens, and one long text of 512 tokens:</p>
          <pre>
            <code>{`Real tokens:    (31 × 20) + 512 = 1,132
Padded tokens:  32 × 512 = 16,384
Batch fill:     1,132 ÷ 16,384 ≈ 6.9%`}</code>
          </pre>
          <p>
            Over 93% of that batch is wasted. One long text made every short text pay for its
            length. It's like hiring a full coach for 31 people because one passenger's luggage
            needs the whole hold, then doing it again on every trip.
          </p>
          <p>Now put the long text in its own batch:</p>
          <pre>
            <code>{`Batch A:  31 × 20 = 620 padded tokens
Batch B:  1 × 512 = 512 padded tokens
Total:    1,132 padded tokens, with no waste`}</code>
          </pre>
          <p>
            That's over 14 times fewer padded tokens. The true gain is larger still, as attention
            cost grows faster than linearly with sequence length.
          </p>
        </>
      ),
    },
    {
      id: "batching",
      title: "Batching by tokens",
      body: (
        <>
          <p>Two habits fix most of this:</p>
          <ul>
            <li>
              <strong>Sort by length.</strong> For bulk jobs, sort texts by token count first, so
              each batch holds similar lengths. Remember each text's original position, so you
              can restore the order afterwards.
            </li>
            <li>
              <strong>Use a token budget.</strong> Don't set a fixed batch size. Limit padded
              tokens per batch instead. Short texts then get big batches, long texts get small
              ones, and memory use stays predictable.
            </li>
          </ul>
          <pre>
            <code>{`def token_batches(items, max_padded_tokens=16_384):
    """items is a list of (index, token_ids) pairs."""
    items = sorted(items, key=lambda item: len(item[1]))
    batch, longest = [], 0
    for item in items:
        new_longest = max(longest, len(item[1]))
        if batch and new_longest * (len(batch) + 1) > max_padded_tokens:
            yield batch
            batch, new_longest = [], len(item[1])
        batch.append(item)
        longest = new_longest
    if batch:
        yield batch`}</code>
          </pre>
          <p>
            Serving tools can do this for you. Hugging Face's Text Embeddings Inference (TEI) is a
            server built for this workload, and it exposes the budget directly:
          </p>
          <pre>
            <code>{`text-embeddings-router \\
  --model-id BAAI/bge-small-en-v1.5 \\
  --port 8080 \\
  --max-batch-tokens 16384

curl 127.0.0.1:8080/embed \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -d '{"inputs": ["What is a KV cache?"]}'`}</code>
          </pre>
          <Callout tone="tip">
            Tokenize before you batch. Tokenization runs on the CPU, and in bulk jobs it can
            become the real bottleneck. If GPU utilization is low while CPU cores are full, the
            GPU is waiting for input.
          </Callout>
        </>
      ),
    },
    {
      id: "online",
      title: "Online queries: wait a little",
      body: (
        <>
          <p>
            Live queries arrive one at a time, so there's nothing to sort. Servers use{" "}
            <strong>dynamic batching</strong>. They collect requests for a very short window, then
            run whatever has arrived. Longer windows fill batches better, but every request pays
            for the wait.
          </p>
          <Formula>worst-case latency ≈ max wait + queue + batch compute</Formula>
          <p>
            With a 5 ms window and a 10 ms batch, a request sees up to about 15 ms with an empty
            queue (illustrative). As traffic rises, batches fill faster, so the window matters
            less.
          </p>
          <Callout tone="warn">
            Don't let indexing share a queue with live queries. A 10-million-document job can sit
            ahead of your users and turn 15 ms into seconds. Use separate pools, or give queries
            strict priority.
          </Callout>
          <p>
            A cache also pays off here. Popular queries repeat, and the same text always gives the
            same vector. A hash lookup of normalized text and model version costs almost nothing
            next to a GPU call.
          </p>
        </>
      ),
    },
    {
      id: "indexing",
      title: "Worked example: a bulk indexing job",
      body: (
        <>
          <p>
            Embed 50 million chunks of 200 tokens each. One GPU runs 50,000 padded tokens per
            second, and costs $2 per hour. All figures are illustrative, and prices change.
          </p>
          <Formula>job time = real tokens ÷ (padded token rate × batch fill)</Formula>
          <pre>
            <code>{`Total tokens: 50,000,000 × 200 = 10,000,000,000

Unsorted, 40% fill:
  Rate:   50,000 × 0.40 = 20,000 real tokens/s
  Time:   10,000,000,000 ÷ 20,000 = 500,000 s ≈ 138.9 GPU-hours
  Cost:   138.9 × $2 ≈ $278

Sorted, 90% fill:
  Rate:   50,000 × 0.90 = 45,000 real tokens/s
  Time:   10,000,000,000 ÷ 45,000 ≈ 222,222 s ≈ 61.7 GPU-hours
  Cost:   61.7 × $2 ≈ $123`}</code>
          </pre>
          <p>
            Sorting cuts the bill by more than half, and it costs one line of code. With 10 GPUs,
            the sorted job takes about 6.2 hours.
          </p>
          <p>For a job this long, plan for failure:</p>
          <ul>
            <li>Split it into shards, and record which ones are done.</li>
            <li>Make writes idempotent, so a retried shard doesn't create duplicates.</li>
            <li>Run on cheaper spot capacity, as a lost shard is easily redone.</li>
            <li>Write vectors in large groups, because the vector database may be the slowest step.</li>
          </ul>
          <Callout tone="note">
            Small models may not need a GPU at all. A compact encoder running through ONNX Runtime
            on CPUs can handle moderate query traffic. Compare cost per million tokens, not raw
            speed.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Embedding has no KV cache or decode loop, so serving comes down to batching.",
    "Padding makes every text in a batch cost as much as the longest one.",
    "Sort by length and use token budgets to keep batches full.",
    "Dynamic batching trades a small wait for better GPU use on live traffic.",
    "Keep indexing and live queries apart, and make bulk jobs safe to retry.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does a token budget work better than a fixed batch size?",
      options: [
        "It removes the need for padding",
        "It bounds the work per batch, whatever the text lengths are",
        "It makes tokenization optional",
        "It keeps all batches the same size",
      ],
      answer: 1,
      explain: "Short texts get large batches and long ones get small batches, so memory use stays predictable.",
    },
    {
      kind: "mcq",
      q: "Live query latency jumps whenever an indexing job runs. What's the best fix?",
      options: [
        "Increase the dynamic batching window",
        "Remove the query cache",
        "Isolate the jobs with separate pools or strict priority",
        "Raise the maximum token length",
      ],
      answer: 2,
      explain: "Bulk work shouldn't share a queue with live traffic without priority.",
    },
    {
      kind: "text",
      q: "A batch has 10 texts, and the longest is 100 tokens. How many padded tokens does it use?",
      format: "****",
      accept: ["1000", "1,000"],
      explain: "10 × 100 = 1,000.",
    },
    {
      kind: "text",
      q: "A batch holds 4,000 padded tokens, of which 3,000 are real. What's the batch fill, as a percentage?",
      format: "**",
      accept: ["75", "75%"],
      explain: "3,000 ÷ 4,000 = 75%.",
    },
    {
      kind: "text",
      q: "A job has 3,600,000,000 real tokens, and a GPU achieves 20,000 real tokens per second. How many GPU-hours is that?",
      format: "**",
      accept: ["50", "50 hours"],
      explain: "3,600,000,000 ÷ 20,000 = 180,000 s, and 180,000 ÷ 3,600 = 50 hours.",
    },
  ],
};
