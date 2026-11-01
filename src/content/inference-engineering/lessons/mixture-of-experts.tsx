import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Explain how Mixture of Experts differs from a standard transformer",
    "Separate total parameters from active parameters",
    "Plan for the serving challenges MoE models create",
  ],
  tasks: [
    {
      id: "idea",
      title: "Only wake the specialists you need",
      body: (
        <>
          <p>
            In a standard transformer, every token runs through every weight. A{" "}
            <strong>Mixture of Experts</strong> (MoE) model replaces the feed-forward network with
            many smaller networks called experts, plus a small <strong>router</strong> that
            chooses a few of them for each token.
          </p>
          <p>
            Picture a hospital. You don't see every doctor. A triage nurse sends you to the two
            specialists you need. The hospital employs many doctors, but each patient uses very
            little of that capacity.
          </p>
          <p>
            This choice happens per token and per layer, so one request ends up touching many
            different experts over its lifetime.
          </p>
        </>
      ),
    },
    {
      id: "numbers",
      title: "Total vs. active parameters",
      body: (
        <>
          <p>MoE models have two sizes, and both matter:</p>
          <Table
            head={["Model", "Experts", "Active per token", "Total params", "Active params"]}
            rows={[
              ["Mixtral 8x7B", "8", "2", "About 47B", "About 13B"],
              ["DeepSeek-V3", "256 routed, plus 1 shared", "8 routed, plus the shared one", "671B", "37B"],
            ]}
          />
          <p>
            DeepSeek-V3 stores 671 billion parameters but only uses 37 billion per token, which is
            about 5.5%. So its compute looks like a mid-size model's, while its memory looks like a
            huge one's.
          </p>
          <Callout tone="note" title="The rule to remember">
            <strong>Memory follows total parameters. Compute follows active parameters.</strong>{" "}
            You still need to hold every expert, even though each token only uses a few.
          </Callout>
        </>
      ),
    },
    {
      id: "serving",
      title: "Serving challenges",
      body: (
        <>
          <ul>
            <li>
              <strong>Won't fit on one GPU.</strong> Very large MoE models need several GPUs just
              to hold their weights, so multi-GPU serving isn't optional.
            </li>
            <li>
              <strong>Uneven expert use.</strong> Some experts are chosen more than others, so
              the GPUs holding popular experts become bottlenecks.
            </li>
            <li>
              <strong>Extra communication.</strong> When experts live on different GPUs, tokens
              must travel between them, which puts pressure on the interconnect.
            </li>
            <li>
              <strong>Batches split up.</strong> Tokens in one batch go to different experts, so
              efficient engines regroup tokens by expert before computing.
            </li>
          </ul>
          <p>
            The Model Parallelism module covers <strong>expert parallelism</strong>, the standard
            way to spread experts across devices.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "MoE swaps the feed-forward network for many experts and a router.",
    "Each token activates only a few experts in each layer.",
    "Memory follows total parameters, and compute follows active parameters.",
    "Popular experts create load imbalance across GPUs.",
    "Large MoE models require multi-GPU serving and good interconnects.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "An MoE model has 1T total and 50B active parameters. What sets its memory requirement?",
      options: ["Active parameters", "Total parameters", "Vocabulary size", "Request rate"],
      answer: 1,
      explain: "All experts must be loaded, even though each token uses only a few.",
    },
    {
      kind: "mcq",
      q: "Why can experts cause bottlenecks on multi-GPU setups?",
      options: [
        "Experts can't use a GPU",
        "The router picks some experts more often",
        "Experts need separate tokenizers",
        "Experts never communicate",
      ],
      answer: 1,
      explain: "Popular experts make their GPUs busier than others.",
    },
    {
      kind: "text",
      q: "What is the component that chooses which experts a token uses?",
      format: "******",
      accept: ["router", "the router", "gate", "gating network"],
      explain: "The router, also called a gating network, scores experts for each token.",
    },
  ],
};
