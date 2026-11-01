import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain what a LoRA adapter is and why it's so much smaller than a model",
    "Serve many adapters on one shared base model",
    "Calculate how adapter hit rate affects latency",
    "Design a routing rule that places hot adapters on enough replicas",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Picture a platform with 200 customers, each with a fine-tuned version of the same open
            model. Serving each as a full model means 200 sets of weights, and most would sit idle.
            At several GPUs per model, you'd go bankrupt.
          </p>
          <p>
            <strong>LoRA</strong>, short for Low-Rank Adaptation, avoids that. It trains a small add-on
            instead of a new model. A replica loads the shared base model once, then applies a
            small <strong>adapter</strong> per customer.
          </p>
          <p>
            Think of a printer that holds one large base template. Each customer brings a thin
            transparent overlay. You don't need 200 printers. But the overlay must be on the printer
            when a job arrives, and that's the routing problem: send each request to a replica that
            already has its adapter loaded.
          </p>
        </>
      ),
    },
    {
      id: "what-lora-is",
      title: "Why adapters are small",
      body: (
        <>
          <p>
            Model weights are mostly big matrices. LoRA leaves those frozen, and it learns a change
            expressed as two thin matrices, A and B. Multiplying them gives an update as large as the
            original:
          </p>
          <Formula>adapted weight = W + (α ÷ r) × B × A</Formula>
          <p>
            Here W is the frozen matrix, r is the <strong>rank</strong> (the width of the thin
            matrices) and α is a scaling factor. Rank controls the adapter's size and capacity.
          </p>
          <p>Take one 4,096 × 4,096 matrix and a rank-16 adapter:</p>
          <pre>
            <code>{`Full matrix:  4,096 × 4,096         = 16,777,216 values
LoRA:         2 × 4,096 × 16        =    131,072 values
Ratio:        16,777,216 ÷ 131,072  = 128 times smaller`}</code>
          </pre>
          <p>
            Real adapters usually touch only some of the matrices too, so they're often megabytes
            where the base model is many gigabytes. That's why a single replica can keep several ready.
          </p>
        </>
      ),
    },
    {
      id: "serving",
      title: "Serving many adapters",
      body: (
        <>
          <p>vLLM supports this directly. You register adapters at startup:</p>
          <pre>
            <code>{`vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --enable-lora \\
  --max-loras 8 \\
  --max-cpu-loras 32 \\
  --max-lora-rank 32 \\
  --lora-modules customer-a=/adapters/a customer-b=/adapters/b`}</code>
          </pre>
          <p>
            Clients then pick an adapter by setting the <code>model</code> field in their request to
            a name such as <code>customer-a</code>. Adapters can live in different places, each with
            its own price:
          </p>
          <Table
            head={["Where the adapter is", "Added latency", "Limit"]}
            rows={[
              ["Active in GPU memory", "Close to zero", "Slots per batch, such as --max-loras"],
              ["Cached in CPU memory", "Small", "Host memory, such as --max-cpu-loras"],
              ["Object storage or disk", "Can reach seconds", "Network and download speed"],
            ]}
          />
          <p>
            <code>--max-loras</code> is a limit on how many different adapters can run together in
            one batch. A high value costs memory and can reduce throughput, so don't simply set it
            to the size of your catalog. Check the flags against your vLLM version, as these details
            change.
          </p>
          <Callout tone="note">
            An adapter changes the model's output, so cached KV blocks from one adapter can't be
            reused for another, even with an identical prompt. Each adapter gets its own prefix
            cache entries. Adapter-heavy traffic will therefore see lower prefix hit rates than a
            single model would.
          </Callout>
        </>
      ),
    },
    {
      id: "hit-rate",
      title: "Worked example: hit rate",
      body: (
        <>
          <p>
            Say you have 200 adapters. Each of 5 replicas can hold 20 adapters ready. A miss costs
            2 seconds. All numbers here are illustrative, and traffic is assumed to be spread evenly
            across adapters.
          </p>
          <Formula>expected added latency = miss rate × miss cost</Formula>
          <pre>
            <code>{`Random routing:
  Hit rate  = 20 ÷ 200 = 10%
  Added     = 0.90 × 2 s = 1.8 s on average

LoRA-aware routing, 95% hit rate:
  Added     = 0.05 × 2 s = 0.1 s on average`}</code>
          </pre>
          <p>
            Same hardware, same adapters, and 18 times less added latency. Note too that random
            routing makes things worse over time, as each miss evicts an adapter that a later
            request may need. Replicas spend their time swapping instead of serving.
          </p>
          <p>
            Real traffic is rarely even. Often a few adapters take most requests, which helps you:
            even a modest cache can catch the bulk of the traffic.
          </p>
        </>
      ),
    },
    {
      id: "routing",
      title: "The routing rule",
      body: (
        <>
          <p>
            The router needs a live map of which replica holds which adapter. Replicas can report
            this, or the router can track what it has sent. Then it applies a preference order:
          </p>
          <pre>
            <code>{`def route(adapter, replicas, load_limit):
    loaded = [r for r in replicas if adapter in r.loaded_adapters]
    healthy = [r for r in loaded if r.load < load_limit]

    if healthy:
        return min(healthy, key=lambda r: r.load)

    # Overloaded or not loaded: place a new copy on the least loaded replica.
    # It will load the adapter, evicting its least recently used one if full.
    return min(replicas, key=lambda r: r.load)`}</code>
          </pre>
          <p>
            That second branch does useful work. A hot adapter overflows its replica, gets copied to
            another, and so on, until it's on as many replicas as its traffic needs. A quiet adapter
            stays on one or none. Placement follows demand automatically.
          </p>
          <p>A few details matter in production:</p>
          <ul>
            <li>
              <strong>Pin the base version:</strong> an adapter is trained against an exact base
              model. Applying it to a different version gives wrong output, and you may get no error.
            </li>
            <li>
              <strong>Limit concurrent misses:</strong> if many requests for one adapter arrive at
              once, load it once and queue the others.
            </li>
            <li>
              <strong>Control access:</strong> the gateway must check that a tenant can use the
              adapter it names, or one customer could call another's fine-tuned model.
            </li>
            <li>
              <strong>Watch per-adapter metrics:</strong> track hit rate and load time, so you can
              see evictions before users do.
            </li>
          </ul>
          <Callout tone="warn">
            If two adapters are both popular and constantly evict each other from a tight slot
            count, you'll see latency spikes while GPUs look busy. That's cache thrashing. Fix it by
            adding slots, adding replicas, or having your router keep your largest adapters resident so
            they aren't evicted.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "LoRA stores a small low-rank change, so many adapters can share one base model.",
    "Rank sets adapter size: each matrix adds about 2 × width × rank values.",
    "Latency depends on where the adapter is: GPU, CPU or remote storage.",
    "Added latency is miss rate times miss cost, so routing to loaded adapters pays off.",
    "Prefer loaded replicas, spread hot adapters on overflow, and pin the base model version.",
  ],
  quiz: [
    {
      kind: "text",
      q: "How many values does a rank-10 LoRA add for a 1,000 × 1,000 matrix?",
      format: "*****",
      accept: ["20000", "20,000"],
      explain: "2 × 1,000 × 10 = 20,000 values, compared with 1,000,000 in the full matrix.",
    },
    {
      kind: "text",
      q: "Replicas hold 30 adapters out of 150, chosen evenly, and routing is random. What is the hit rate, as a percentage?",
      format: "**",
      accept: ["20", "20%"],
      explain: "30 ÷ 150 = 20%.",
    },
    {
      kind: "mcq",
      q: "A hot adapter's only replica is overloaded. What should a good router do?",
      options: [
        "Reject all traffic for that adapter",
        "Load it onto another replica, spreading its traffic",
        "Restart the base model",
        "Remove the adapter from the catalog",
      ],
      answer: 1,
      explain: "Copying hot adapters to more replicas lets placement follow demand.",
    },
    {
      kind: "mcq",
      q: "Why must an adapter be pinned to a base model version?",
      options: [
        "Adapters are stored inside the tokenizer",
        "It was trained as a change to those exact weights",
        "Licenses forbid moving them",
        "GPUs reject newer models",
      ],
      answer: 1,
      explain: "The adapter's values only make sense as an update to the weights it was trained against.",
    },
  ],
};
