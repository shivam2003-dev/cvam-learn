import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain how pipeline parallelism splits a model by layers",
    "Calculate per-request speed and total throughput for a pipeline",
    "Compare the communication needs of pipeline and tensor parallelism",
    "Combine pipeline and tensor parallelism across machines",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Tensor parallelism needs a very fast link, because GPUs sync twice in every layer.
            That's fine inside one machine. But what if your model must span GPUs joined by a
            slower link, such as a network between two machines?
          </p>
          <p>
            <strong>Pipeline parallelism</strong> (PP) takes a different cut. Instead of slicing
            each layer, it gives whole groups of layers to different GPUs. With 80 layers and 4
            GPUs, GPU 1 runs layers 1 to 20, GPU 2 runs 21 to 40, and so on. Each group is called
            a <strong>stage</strong>.
          </p>
          <p>
            Picture a car assembly line. Each station does its part, then passes the car along.
            One car doesn't get finished any faster. But the line holds several cars at once, so
            more cars leave the factory each hour.
          </p>
        </>
      ),
    },
    {
      id: "flow",
      title: "How a token moves through the pipeline",
      body: (
        <>
          <ol>
            <li>Stage 1 embeds the tokens and runs its layers.</li>
            <li>
              It sends the output, called the <strong>hidden state</strong>, to stage 2.
            </li>
            <li>Each following stage runs its layers and passes the result on.</li>
            <li>The last stage picks the next token and sends it back to stage 1.</li>
          </ol>
          <p>
            While stage 2 works on one group of requests, stage 1 is free to start another. These
            groups are called <strong>micro-batches</strong>. In steady state, every stage is busy
            with a different one.
          </p>
          <p>
            Each stage keeps the KV cache for its own layers, so weights and caches both divide
            across stages. A stage must hold cache for all requests in all micro-batches, though,
            not only the one it's working on now.
          </p>
          <Formula>time per token ≈ sum of stage times + hand-off times</Formula>
          <Formula>throughput ≈ tokens in flight ÷ time per token</Formula>
        </>
      ),
    },
    {
      id: "worked-example",
      title: "Worked example: latency vs. throughput",
      body: (
        <>
          <p>
            Take the 80-layer model again. One GPU would take 40 ms per step with a batch of 16
            requests. Split it into 4 equal stages of 10 ms each, with a 1 ms hand-off between
            neighbours. Sending the token back is too small to matter. All figures here are
            illustrative.
          </p>
          <pre>
            <code>{`Time per token:  (4 × 10 ms) + (3 × 1 ms) = 43 ms
Micro-batches:   4, one per stage, with 16 requests each
In flight:       4 × 16 = 64 requests
Throughput:      64 tokens ÷ 0.043 s ≈ 1,488 tokens/s
Per request:     1 token ÷ 0.043 s ≈ 23 tokens/s`}</code>
          </pre>
          <Table
            head={["Setup", "Requests", "Tokens/s per request", "Total tokens/s"]}
            rows={[
              ["1 GPU (if it fit)", "16", "25", "400"],
              ["PP with 4 GPUs", "64", "About 23", "About 1,488"],
            ]}
          />
          <p>
            Total throughput rises about 3.7 times. But each user's stream gets slightly{" "}
            <em>slower</em>, because the hand-offs add time. TP on the same four GPUs would have
            cut the step to around 13 ms instead. That's the core difference:
          </p>
          <ul>
            <li>
              <strong>Tensor parallelism</strong> shortens each step, so users see faster tokens.
            </li>
            <li>
              <strong>Pipeline parallelism</strong> fits more requests in, so the system does more
              work in total.
            </li>
          </ul>
          <Callout tone="warn">
            That throughput gain depends on a full pipeline. With only one active micro-batch, 3
            of the 4 GPUs sit idle at any moment. PP disappoints under light traffic.
          </Callout>
        </>
      ),
    },
    {
      id: "communication",
      title: "Why it tolerates slow links",
      body: (
        <>
          <p>
            PP sends one tensor at each stage boundary. TP sends one for every all-reduce. Compare
            one decode step with a hidden size of 4,096 and 2 bytes per value, for 16 tokens:
          </p>
          <Table
            head={["Method", "Bytes per transfer", "Transfers per step", "Total per step"]}
            rows={[
              ["TP, 80 layers", "131,072", "160", "About 21 MB"],
              ["PP, 4 stages", "131,072", "3", "About 0.39 MB"],
            ]}
          />
          <p>
            That's about 53 times less data, so PP can run on links that would cripple TP. Long
            prompts are still costly, though. A 4,000-token prompt sends about 32.8 MB across
            each boundary.
          </p>
          <p>The catch is balance, because the slowest stage limits the whole line:</p>
          <Formula>best possible throughput = micro-batch size ÷ slowest stage time</Formula>
          <p>
            Layer counts alone don't guarantee balance. The first stage holds the embeddings, and
            the last holds the output head, so they can carry extra weight. Check per-stage
            utilization. One stage pinned at 100% while the others idle means the split is uneven.
          </p>
        </>
      ),
    },
    {
      id: "combining",
      title: "Combining PP with TP",
      body: (
        <>
          <p>
            The two methods work well together. Use TP inside each machine, where links are fast,
            and PP between machines, where they're slow.
          </p>
          <pre>
            <code>{`# Two machines with 4 GPUs each: 4 × 2 = 8 GPUs in total
vllm serve your-org/your-model \\
  --tensor-parallel-size 4 \\
  --pipeline-parallel-size 2`}</code>
          </pre>
          <p>
            Here, each machine forms one stage, and its 4 GPUs split that stage with TP. Total
            GPUs equal TP size times PP size. Multi-node runs also need a cluster setup such as
            Ray underneath, which the Multi-Node Inference lesson covers.
          </p>
          <Table
            head={["", "Tensor parallelism", "Pipeline parallelism"]}
            rows={[
              ["Splits", "Each layer", "Groups of layers"],
              ["Time per token", "Shorter", "Same or slightly longer"],
              ["Total throughput", "Higher", "Higher, if the line stays full"],
              ["Link needed", "Very fast", "Moderate"],
              ["Best place", "Inside a machine", "Across machines"],
            ]}
          />
          <Callout tone="tip">
            If the weights fit inside one machine, use TP there and skip PP. Reach for PP when you
            must cross a slow link. Not every engine supports it for every model, so check first.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Pipeline parallelism gives groups of layers to different GPUs, called stages.",
    "It raises total throughput, but doesn't make a single stream faster.",
    "Throughput gains need a full pipeline, so light traffic leaves GPUs idle.",
    "It sends far less data than tensor parallelism, so it tolerates slower links.",
    "A common layout uses TP inside each machine and PP between machines.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A model moves from one GPU to a 4-stage pipeline. What happens to the token rate each user sees?",
      options: [
        "It rises about four times",
        "It stays about the same or drops slightly",
        "It falls to a quarter",
        "It depends only on prompt length",
      ],
      answer: 1,
      explain:
        "Each token still crosses every layer in sequence, with hand-offs added. The gain is in total throughput.",
    },
    {
      kind: "mcq",
      q: "Why does pipeline parallelism suit slower links better than tensor parallelism?",
      options: [
        "It compresses every tensor",
        "It doesn't need a KV cache",
        "It only transfers at stage boundaries, not at every layer",
        "It sends no data between GPUs",
      ],
      answer: 2,
      explain: "A few transfers per step replace two all-reduces per layer.",
    },
    {
      kind: "text",
      q: "A pipeline has 5 stages of 8 ms each, with 4 hand-offs of 2 ms each. What's the time per token in ms?",
      format: "**",
      accept: ["48", "48 ms", "48ms"],
      explain: "(5 × 8) + (4 × 2) = 40 + 8 = 48 ms.",
    },
    {
      kind: "text",
      q: "A deployment uses TP size 8 and PP size 3. How many GPUs does it need in total?",
      format: "**",
      accept: ["24"],
      explain: "8 × 3 = 24.",
    },
  ],
};
