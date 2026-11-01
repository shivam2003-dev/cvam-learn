import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Explain how tensor parallelism splits the work inside each layer",
    "Estimate memory per GPU and concurrency for a split model",
    "Calculate the communication cost of prefill and decode",
    "Decide how many GPUs are worth using for one model",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Sometimes a model is too big for one GPU. Take a model with 120 GiB of weights and a
            GPU with 48 GiB of memory. It won't load at all. Other times the model fits, but one
            GPU can't produce tokens fast enough for your latency target.
          </p>
          <p>
            <strong>Tensor parallelism</strong> (TP) solves both. It splits every layer across
            several GPUs, so they all work on the same token at the same time. Each GPU holds a
            slice of every weight matrix. Together, they act like one larger, faster GPU.
          </p>
          <p>
            Think of four cooks making one huge pot of soup. Each chops a quarter of every
            ingredient, and after each stage they tip their piles together before moving on. The
            chopping goes four times faster, but they keep stopping to combine their work. Those
            stops are the price of TP.
          </p>
        </>
      ),
    },
    {
      id: "mechanics",
      title: "How a layer gets split",
      body: (
        <>
          <p>
            A transformer layer is mostly matrix multiplication, and a matrix can be cut in two
            useful ways:
          </p>
          <ul>
            <li>
              <strong>Column-parallel:</strong> split the matrix by columns. Each GPU computes
              part of the output, which stays spread across the GPUs.
            </li>
            <li>
              <strong>Row-parallel:</strong> split the matrix by rows. Each GPU reads its slice
              of the input and produces a partial result for the whole output. The partial
              results must then be added up.
            </li>
          </ul>
          <p>
            The two are paired. In the attention block, the projections that create queries,
            keys and values are column-parallel, so each GPU owns a subset of the attention
            heads. The final output projection is row-parallel. The feed-forward block follows
            the same pattern with its two linear layers.
          </p>
          <p>
            That row-parallel step needs an <strong>all-reduce</strong>, a group operation where
            every GPU sends its partial result and every GPU ends up with the sum. So a standard
            layer needs two all-reduces, one after attention and one after the feed-forward
            block. Every GPU must finish before anyone can continue, so the slowest one sets the
            pace.
          </p>
          <Callout tone="note">
            Because heads are divided between GPUs, the head count must divide evenly by the TP
            size. A model with 32 heads works with 2, 4 or 8 GPUs, but not with 3. vLLM rejects
            a TP size that doesn't divide evenly.
          </Callout>
        </>
      ),
    },
    {
      id: "memory",
      title: "What it does to memory",
      body: (
        <>
          <p>
            Weights divide across GPUs. So does the KV cache, because each GPU only stores keys
            and values for its own heads. Both shrink by roughly the TP size:
          </p>
          <Formula>memory per GPU ≈ (weights + KV caches) ÷ TP size + overhead</Formula>
          <p>
            Back to the 120 GiB model, with TP 4 on 48 GiB GPUs (illustrative figures):
          </p>
          <pre>
            <code>{`Weights per GPU:  120 ÷ 4 = 30 GiB
Free per GPU:     48 − 30 = 18 GiB
KV per request:   4 GiB total, so 4 ÷ 4 = 1 GiB per GPU
Concurrency:      18 ÷ 1 = 18 requests, before overhead`}</code>
          </pre>
          <p>
            In practice, a little more than one quarter lands on each GPU. Embedding tables and
            layer norms are often kept whole on every GPU, and the engine needs its own working
            memory.
          </p>
        </>
      ),
    },
    {
      id: "communication",
      title: "The cost of talking",
      body: (
        <>
          <p>
            Each all-reduce moves a tensor sized by the number of tokens in the current step:
          </p>
          <Formula>bytes per sync ≈ tokens in step × hidden size × bytes per value</Formula>
          <p>
            Let's use 80 layers, so 160 syncs per step, with a hidden size of 4,096 and 2 bytes
            per value. A decode step with 32 active requests has 32 tokens, one per request. A
            prefill step for one 4,000-token prompt has 4,000.
          </p>
          <Table
            head={["Phase", "Per sync", "Per step", "At 50 GB/s", "At 5 GB/s"]}
            rows={[
              ["Decode, 32 tokens", "262,144 bytes", "About 42 MB", "0.84 ms", "8.4 ms"],
              ["Prefill, 4,000 tokens", "About 32.8 MB", "About 5.2 GB", "105 ms", "About 1.05 s"],
            ]}
          />
          <p>
            These are rough figures. The exact volume depends on the all-reduce algorithm, and
            each sync also adds a small fixed delay. But the lesson is clear: TP is
            bandwidth-hungry, and prefill is where it hurts most. That's why TP belongs on a
            fast link such as NVLink, inside one machine, and not on a slower one such as PCIe
            or a network.
          </p>
        </>
      ),
    },
    {
      id: "scaling",
      title: "How far should you scale?",
      body: (
        <>
          <p>Compute divides by the GPU count. Communication doesn't, and it tends to grow:</p>
          <Formula>step time ≈ compute ÷ N + communication</Formula>
          <p>Here's a decode step that takes 40 ms on one GPU (illustrative):</p>
          <Table
            head={["GPUs", "Compute", "Communication", "Step time", "Speed-up", "Efficiency"]}
            rows={[
              ["1", "40 ms", "0 ms", "40 ms", "1×", "100%"],
              ["4", "10 ms", "3 ms", "13 ms", "About 3.1×", "About 77%"],
              ["8", "5 ms", "5 ms", "10 ms", "4×", "50%"],
            ]}
          />
          <p>
            Going from 4 to 8 GPUs doubles the hardware but saves only 3 ms. That can still be
            right if the weights need 8 GPUs or your target demands it. But if the model fits on
            4, two separate 4-GPU replicas will usually give you far more throughput than one
            8-GPU group.
          </p>
          <p>Setting it up is usually a single flag:</p>
          <pre>
            <code>{`vllm serve your-org/your-model --tensor-parallel-size 4`}</code>
          </pre>
          <Callout tone="tip">
            Use the smallest TP size that fits the weights and hits your latency target. Then
            add replicas for throughput. Replicas add capacity without adding any communication.
          </Callout>
          <Callout tone="warn">
            A TP group shares one fate. If one GPU stalls or fails, the whole group stops,
            because every layer waits for every GPU.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Tensor parallelism splits each layer across GPUs, so they work on the same token together.",
    "Weights and KV caches both shrink by about the TP size, which is often the main reason to use it.",
    "It lowers per-token latency, unlike pipeline parallelism.",
    "Two all-reduces per layer make it bandwidth-hungry, especially during prefill.",
    "Use the smallest TP size that works, then add replicas for throughput.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does tensor parallelism divide across GPUs?",
      options: [
        "Whole requests, one per GPU",
        "The matrices inside each layer",
        "Whole layers, in groups",
        "Whole experts in a MoE model",
      ],
      answer: 1,
      explain: "Each GPU holds a slice of every layer's weights, so all GPUs work on each token.",
    },
    {
      kind: "mcq",
      q: "Why does prefill stress the interconnect more than decode?",
      options: [
        "Prefill skips the all-reduce step",
        "Decode uses the CPU for communication",
        "Prefill sends every prompt token's hidden state at each sync",
        "Prefill has more attention heads",
      ],
      answer: 2,
      explain:
        "Sync size grows with the tokens in the step. A prompt has thousands, while a decode step has one per active request.",
    },
    {
      kind: "text",
      q: "A model has 60 layers, with two all-reduces per layer. How many all-reduces happen in one step?",
      format: "***",
      accept: ["120"],
      explain: "60 × 2 = 120.",
    },
    {
      kind: "text",
      q: "A model has 160 GiB of weights, split with TP 4 on GPUs with 64 GiB each. Each request needs 4 GiB of KV cache in total, split evenly. Ignoring overhead, how many concurrent requests fit?",
      format: "**",
      accept: ["24"],
      explain: "160 ÷ 4 = 40 GiB of weights per GPU, leaving 24 GiB. KV is 4 ÷ 4 = 1 GiB per GPU, so 24 ÷ 1 = 24.",
    },
  ],
};
