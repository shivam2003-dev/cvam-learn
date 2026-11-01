import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Hard",
  objectives: [
    "Explain why prefill and decode interfere on a shared GPU",
    "Trace a request through separate prefill and decode pools",
    "Estimate KV cache transfer time and size both pools",
    "Decide when disaggregation is worth its added complexity",
  ],
  tasks: [
    {
      id: "problem",
      title: "Two jobs fighting over one GPU",
      body: (
        <>
          <p>
            Every LLM request has two phases. <strong>Prefill</strong> reads the whole prompt in
            one large pass and fills the KV cache. <strong>Decode</strong> then produces tokens
            one at a time, reading that cache at each step.
          </p>
          <Table
            head={["", "Prefill", "Decode"]}
            rows={[
              ["Work", "Many tokens at once", "One token per request, per step"],
              ["Main limit", "Compute", "Memory bandwidth"],
              ["Duration", "One burst", "Many short steps"],
              ["Metric affected", "TTFT", "Inter-token latency"],
              ["Lifetime on the GPU", "Brief", "Stays until the response ends"],
            ]}
          />
          <p>
            On a shared GPU, these phases get in each other's way. A 20,000-token prompt may
            occupy the GPU for a second. During that time, every other user's stream can stall,
            because decode steps have to wait. Users see a smooth response freeze for no obvious
            reason.
          </p>
          <p>
            Think of a restaurant where one cook does the long morning prep and also serves dinner
            orders. Each time a big prep job starts, plates stop going out. So busy kitchens split
            the roles: a prep crew and a line crew, each in its own space.
          </p>
          <p>
            <strong>Prefill and decode disaggregation</strong> does the same with GPUs. One pool
            only runs prefill. Another only runs decode. The KV cache moves between them over a
            fast network.
          </p>
        </>
      ),
    },
    {
      id: "flow",
      title: "A request's journey",
      body: (
        <>
          <ol>
            <li>A router picks one prefill worker and one decode worker for the request.</li>
            <li>The prefill worker processes the prompt and builds the KV cache.</li>
            <li>It samples the first token.</li>
            <li>
              The KV cache is sent to the decode worker, typically over RDMA, so CPUs don't have
              to copy it.
            </li>
            <li>The decode worker streams the remaining tokens.</li>
            <li>The prefill worker frees that memory, or keeps it as a reusable prefix.</li>
          </ol>
          <p>
            There's a timing subtlety. Some systems stream the first token straight from the
            prefill worker. The transfer then shows up as a longer gap before token 2. Other
            systems send everything through the decode worker, which adds the transfer to TTFT.
            Check which one yours does before you read your latency graphs.
          </p>
          <p>
            A related technique is <strong>chunked prefill</strong>, which breaks a long prompt
            into pieces and mixes them into normal decode steps on the same GPU. It reduces
            stalls without a second pool. It's often the simpler first step.
          </p>
        </>
      ),
    },
    {
      id: "transfer",
      title: "Worked example: the KV transfer",
      body: (
        <>
          <p>
            Use the model from the KV Cache lesson: 32 layers, hidden size 4,096, and 2 bytes per
            value. Each token costs:
          </p>
          <pre>
            <code>{`2 × 32 × 4,096 × 2 = 524,288 bytes per token (0.5 MiB)`}</code>
          </pre>
          <Formula>transfer time ≈ prompt tokens × KV per token ÷ bandwidth</Formula>
          <Table
            head={["Prompt", "KV size", "At 50 GB/s", "At 12.5 GB/s"]}
            rows={[
              ["2,000 tokens", "About 1.05 GB", "21 ms", "84 ms"],
              ["8,000 tokens", "About 4.2 GB", "84 ms", "336 ms"],
              ["100,000 tokens", "About 52 GB", "1.05 s", "4.2 s"],
            ]}
          />
          <p>
            For typical prompts, a fast network keeps the cost small compared with the stalls
            you've removed. For very long prompts, it becomes a real cost. Grouped-query attention
            can shrink these numbers a lot, because it stores fewer keys and values.
          </p>
          <Callout tone="warn">
            Transfers need a fast network with RDMA. Over a slow or congested link, the cost can
            outweigh the gain. Track transfer time as its own metric.
          </Callout>
        </>
      ),
    },
    {
      id: "sizing",
      title: "Worked example: sizing both pools",
      body: (
        <>
          <p>
            A major benefit is that each pool scales alone. Size them from your traffic. Suppose
            you have 20 requests per second, 2,000 input tokens and 300 output tokens each, and
            users get 30 tokens per second. From load tests, one prefill GPU handles 20,000 input
            tokens per second. One decode GPU handles 1,500 output tokens per second, and it has
            50 GiB free for KV cache. All figures are illustrative.
          </p>
          <pre>
            <code>{`Prefill demand:   20 × 2,000 = 40,000 tokens/s
Prefill GPUs:     40,000 ÷ 20,000 = 2

Decode demand:    20 × 300 = 6,000 tokens/s
By speed:         6,000 ÷ 1,500 = 4 GPUs

Time in decode:   300 ÷ 30 = 10 s
Active requests:  20 × 10 = 200
KV per request:   2,300 tokens × 0.5 MiB ≈ 1.12 GiB
Total KV:         200 × 1.12 ≈ 224 GiB
By memory:        224 ÷ 50 ≈ 4.5, so 5 GPUs`}</code>
          </pre>
          <p>
            The decode pool needs 5 GPUs, because memory turned out to be the tighter limit.
            That's a 2:5 split, 7 GPUs before adding spare capacity. The number of active
            requests comes from Little's law: requests in the system equal arrival rate times
            time spent.
          </p>
          <Formula>active requests = arrival rate × time in system</Formula>
          <p>
            The right ratio depends on your traffic. A RAG product with long prompts and short
            answers needs more prefill. A writing tool with short prompts and long answers needs
            more decode. Ratios drift over time, so autoscale each pool on its own signals:
            prefill queue length for one, and KV cache utilization for the other.
          </p>
        </>
      ),
    },
    {
      id: "tools-tradeoffs",
      title: "Tools and trade-offs",
      body: (
        <>
          <p>
            Several projects support this pattern, including SGLang and NVIDIA Dynamo. NVIDIA's
            NIXL library is designed for moving data such as KV caches between workers, and
            Mooncake takes a design built around a shared KV cache store. In SGLang, it looks like
            this:
          </p>
          <pre>
            <code>{`python -m sglang.launch_server --model-path your-org/your-model \\
  --disaggregation-mode prefill --port 30000

python -m sglang.launch_server --model-path your-org/your-model \\
  --disaggregation-mode decode --port 30001

python -m sglang_router.launch_router --pd-disaggregation \\
  --prefill http://127.0.0.1:30000 \\
  --decode http://127.0.0.1:30001 \\
  --host 0.0.0.0 --port 8000`}</code>
          </pre>
          <p>
            A real deployment also needs a transfer backend and a working RDMA network, and flags
            change between versions, so follow the docs for your release.
          </p>
          <Table
            head={["You gain", "You pay"]}
            rows={[
              ["Stable inter-token latency", "An extra network transfer"],
              ["Independent scaling of each phase", "A router that tracks two pools"],
              ["Each pool tuned for its own job", "New failures, such as a lost transfer"],
              ["Better use of GPUs at scale", "Spare capacity needed in both pools"],
            ]}
          />
          <Callout tone="tip">
            Disaggregation pays off at scale, with long prompts or strict latency targets. With a
            handful of GPUs, two small pools can each run short while the other sits idle. Start
            with chunked prefill and good admission control, and split the pools once you have
            the traffic to keep both busy.
          </Callout>
          <p>
            Prefix caching also needs care. Reuse now lives in the prefill pool, so the router
            should send requests to the prefill worker holding their prefix, as the Cache-Aware
            Routing lesson describes.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Prefill and decode have different hardware limits, and they interfere on a shared GPU.",
    "Disaggregation runs each phase in its own pool and moves the KV cache between them.",
    "Transfer time grows with prompt length, so a fast RDMA network is essential.",
    "Size prefill by input tokens, and decode by the tighter of speed and KV memory.",
    "It suits large deployments. Chunked prefill is a simpler first step for smaller ones.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What symptom on a shared GPU best motivates disaggregation?",
      options: [
        "Streams stall whenever a long prompt arrives",
        "Model weights don't fit on any GPU",
        "The tokenizer runs slowly",
        "Quiet hours leave GPUs idle",
      ],
      answer: 0,
      explain: "Long prefills block decode steps, which shows up as inter-token latency spikes.",
    },
    {
      kind: "mcq",
      q: "Which traffic needs the largest share of prefill GPUs?",
      options: [
        "Short prompts and long answers",
        "Long retrieved context and short answers",
        "Short prompts and short answers at low volume",
        "Any traffic, as the ratio is always 1:1",
      ],
      answer: 1,
      explain: "Prefill demand follows input tokens, so long prompts with short answers lean heavily on it.",
    },
    {
      kind: "text",
      q: "A KV cache is 6 GB, and the link moves 40 GB/s. How many milliseconds does the transfer take?",
      format: "***",
      accept: ["150", "150 ms", "150ms"],
      explain: "6 ÷ 40 = 0.15 s, which is 150 ms.",
    },
    {
      kind: "text",
      q: "Traffic is 10 requests per second, and each stays in decode for 12 seconds. How many requests are active at once?",
      format: "***",
      accept: ["120"],
      explain: "Little's law: 10 × 12 = 120.",
    },
    {
      kind: "text",
      q: "Traffic is 30 requests per second at 4,000 input tokens each. One prefill GPU handles 30,000 tokens per second. How many prefill GPUs do you need?",
      format: "*",
      accept: ["4"],
      explain: "30 × 4,000 = 120,000 tokens/s, and 120,000 ÷ 30,000 = 4.",
    },
  ],
};
