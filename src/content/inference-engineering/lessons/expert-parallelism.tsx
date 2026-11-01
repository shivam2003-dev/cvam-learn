import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain why MoE models suit expert parallelism better than tensor parallelism",
    "Trace a token through dispatch, expert compute and combine",
    "Calculate memory per GPU and the effect of load imbalance",
    "Name the main ways to deal with hot experts",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A Mixture of Experts (MoE) model replaces the feed-forward block with many smaller
            networks called <strong>experts</strong>. A small <strong>router</strong> picks a few
            of them for each token. DeepSeek-V3, for example, has 256 experts per MoE layer and
            activates 8 per token. Nearly all of the model's memory sits in experts that any one
            token never touches.
          </p>
          <p>
            You could split such a model with tensor parallelism. But then every GPU holds a
            slice of every expert, and all GPUs must work together on each small expert, then
            sync. That's a lot of communication for a small amount of math.
          </p>
          <p>
            <strong>Expert parallelism</strong> (EP) is the better fit. It gives whole experts to
            different GPUs, and sends each token to the GPUs holding the experts it needs.
          </p>
          <p>
            Think of a hospital group with specialists in different buildings. Nobody splits one
            doctor across buildings. Instead, the triage nurse sends each patient to the right
            building, and each doctor's notes come back to the patient's file.
          </p>
        </>
      ),
    },
    {
      id: "flow",
      title: "One MoE layer, step by step",
      body: (
        <>
          <p>
            A common layout keeps a copy of the non-expert parts, such as attention and the
            router, on every GPU. Each GPU handles its own share of requests for those parts.
            Experts are divided and shared by everyone. One MoE layer then runs like this:
          </p>
          <ol>
            <li>
              <strong>Route.</strong> Each GPU runs its router and picks the top experts for each
              of its tokens.
            </li>
            <li>
              <strong>Dispatch.</strong> Each token's hidden state is sent to the GPUs that own
              its chosen experts. This is an <strong>all-to-all</strong> transfer, where every GPU
              sends a different set of data to every other GPU.
            </li>
            <li>
              <strong>Compute.</strong> Each GPU groups the tokens it received by expert, then
              runs its experts.
            </li>
            <li>
              <strong>Combine.</strong> Results return through a second all-to-all. Each token's
              home GPU forms their weighted sum using the router's scores.
            </li>
          </ol>
          <p>
            So EP adds two all-to-all transfers per MoE layer. All-to-all is harder on an
            interconnect than all-reduce. Message sizes differ at every step, because they depend
            on what the router chose, and that isn't known in advance.
          </p>
        </>
      ),
    },
    {
      id: "memory",
      title: "Worked example: memory and traffic",
      body: (
        <>
          <p>
            Take an illustrative MoE model with 460 GiB of expert weights and 20 GiB of everything
            else, on 8 GPUs with 96 GiB each. The experts divide. The non-expert parts are copied
            to all GPUs:
          </p>
          <Formula>memory per GPU ≈ expert weights ÷ N + shared weights + KV cache</Formula>
          <pre>
            <code>{`Experts per GPU:  460 ÷ 8 = 57.5 GiB
Shared weights:   20 GiB
Weights on GPU:   57.5 + 20 = 77.5 GiB
Free memory:      96 − 77.5 = 18.5 GiB for KV cache and overhead`}</code>
          </pre>
          <p>
            Now the traffic. Say one step holds 100 tokens, each picking 2 experts, so there are
            200 <strong>activations</strong>. With a hidden size of 4,096 and 2 bytes per value:
          </p>
          <pre>
            <code>{`One direction, one layer:  200 × 4,096 × 2 = 819,200 bytes
Both directions:           819,200 × 2 = 1,638,400 bytes
Over 40 MoE layers:        1,638,400 × 40 = 65,536,000 bytes ≈ 62.5 MiB`}</code>
          </pre>
          <p>
            About 7 in 8 activations leave their home GPU on average, so most of that crosses the
            interconnect. A fast all-to-all fabric matters here. Libraries such as DeepEP exist
            specifically to make this exchange efficient.
          </p>
        </>
      ),
    },
    {
      id: "imbalance",
      title: "Hot experts and imbalance",
      body: (
        <>
          <p>
            TP divides work evenly by design. EP doesn't. The router chooses experts based on the
            text, so some experts are far more popular than others. The GPUs holding them get
            more work, and the step can't finish until the busiest GPU does.
          </p>
          <Formula>imbalance = busiest GPU's load ÷ average load</Formula>
          <Formula>effective speed-up ≈ N ÷ imbalance</Formula>
          <p>
            With our 200 activations across 8 GPUs, a perfect split gives each GPU 25. If the
            busiest gets 40, imbalance is 40 ÷ 25 = 1.6. The speed-up falls from 8 to 8 ÷ 1.6 = 5.
            Three GPUs' worth of expert compute is wasted waiting.
          </p>
          <Table
            head={["Fix", "How it works", "Trade-off"]}
            rows={[
              ["Smarter placement", "Spread popular experts across GPUs, using measured usage", "Needs real traffic data, and usage shifts"],
              ["Replication", "Keep copies of hot experts on several GPUs", "Uses more memory"],
              ["Dynamic rebalancing", "Move experts while running as load changes", "Costs migration work and engine complexity"],
              ["Capacity limits", "Cap tokens per GPU and redirect the excess", "Tokens may use a less suitable expert"],
            ]}
          />
          <Callout tone="warn">
            Capacity limits can change output quality, because a token no longer gets the expert
            the router would choose. Evaluate quality before enabling them.
          </Callout>
          <p>In vLLM, a basic EP deployment looks like this:</p>
          <pre>
            <code>{`vllm serve your-org/your-moe-model \\
  --tensor-parallel-size 1 \\
  --data-parallel-size 8 \\
  --enable-expert-parallel`}</code>
          </pre>
          <p>
            Here, 8 GPUs each run their own share of requests, and they share the experts through
            EP. Flags vary by version and hardware, so check your engine's documentation. EP can
            also combine with TP, which splits the attention work inside each group.
          </p>
          <Callout tone="tip">
            Watch per-GPU expert load, not only average GPU utilization. An average of 60% can
            hide one GPU at 100% that's slowing all the others.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Expert parallelism gives whole experts to different GPUs, instead of slicing each expert.",
    "Each MoE layer adds two all-to-all transfers: dispatch and combine.",
    "Memory per GPU is the expert share plus any non-expert parts that are copied to it.",
    "Router choices create uneven load, and the busiest GPU sets the pace.",
    "Placement, replication and rebalancing reduce imbalance, each at some cost.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why is EP often better than TP for the experts in a MoE model?",
      options: [
        "EP needs no communication",
        "Each token uses few experts, so all GPUs shouldn't need to sync on every one",
        "TP can't load models over 100 GiB",
        "EP removes the router",
      ],
      answer: 1,
      explain:
        "Whole experts on separate GPUs let each one run locally, rather than having every GPU work on every expert.",
    },
    {
      kind: "mcq",
      q: "What sets the duration of the expert step under EP?",
      options: ["The average GPU", "The fastest GPU", "The busiest GPU", "The router's hidden size"],
      answer: 2,
      explain: "All tokens must return before the next layer, so everyone waits for the busiest GPU.",
    },
    {
      kind: "text",
      q: "Across 10 GPUs, the average load is 30 activations and the busiest GPU has 60. What's the effective speed-up?",
      format: "*",
      accept: ["5"],
      explain: "Imbalance is 60 ÷ 30 = 2, so the speed-up is 10 ÷ 2 = 5.",
    },
    {
      kind: "text",
      q: "A model has 320 GiB of experts and 16 GiB of shared weights copied to every GPU. Using 4 GPUs, how many GiB of weights sit on each?",
      format: "***",
      accept: ["96", "96 gib", "96gib"],
      explain: "320 ÷ 4 = 80, plus 16 shared, gives 96 GiB.",
    },
  ],
};
