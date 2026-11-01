import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Separate closed models, open-weight models and truly open-source models",
    "Weigh control, cost, quality and effort when choosing",
    "Calculate a rough break-even point for self-hosting",
  ],
  tasks: [
    {
      id: "spectrum",
      title: "It's a spectrum, not a switch",
      body: (
        <>
          <p>
            A <strong>closed model</strong> is reachable only through its creator's API or a
            licensed partner. You send a request and receive a response. You never see the
            weights, so you can't run the model on your own GPUs or change how it's served.
          </p>
          <p>
            An <strong>open-weight model</strong> publishes its trained weights for download, so
            you can run it wherever you like. This is where nearly all hands-on inference
            engineering happens, because you control the whole stack.
          </p>
          <p>
            People often call these models "open source", but that's usually loose. Publishing
            weights doesn't mean publishing training data or full training code, so you can't
            rebuild the model from scratch. A handful of research projects release all of it, and
            those sit at the far open end.
          </p>
          <Callout tone="warn" title="Read the license">
            Open weights doesn't mean free for any use. Licenses range from permissive ones like
            Apache 2.0 and MIT to custom community licenses with extra terms. Check the license
            of the exact model version you plan to ship.
          </Callout>
        </>
      ),
    },
    {
      id: "trade-offs",
      title: "What you gain and give up",
      body: (
        <>
          <Table
            head={["Factor", "Closed API", "Open weights, self-hosted"]}
            rows={[
              ["Time to start", "Minutes", "Days to weeks"],
              ["Peak quality", "Often first to the frontier", "Usually close behind, sometimes level"],
              ["Pricing", "Per token, little fixed cost", "Mainly GPU rental, paid even when idle"],
              ["Latency control", "Whatever the provider gives you", "Yours to tune"],
              ["Customization", "Limited", "Fine-tune, quantize, change anything"],
              ["Data handling", "Governed by a provider contract", "Stays in your environment"],
              ["Version stability", "Provider can deprecate models", "You keep the weights forever"],
              ["Operational load", "Almost none", "You own on-call, scaling and upgrades"],
            ]}
          />
          <p>
            There's a useful middle option: run an open-weight model through a hosted inference
            provider. You keep model portability without buying GPUs, and you can move later if
            you outgrow them.
          </p>
        </>
      ),
    },
    {
      id: "break-even",
      title: "A break-even you can do by hand",
      body: (
        <>
          <p>
            Self-hosting has a fixed monthly bill. An API has a variable one. So there's a volume
            where they cross.
          </p>
          <Formula>break-even tokens/month = monthly GPU cost ÷ API price per token</Formula>
          <p>
            Here's an illustrative example. One GPU costs $2.50 an hour and runs 730 hours a
            month, which is $1,825. If the equivalent API blends to $1.00 per million tokens, the
            break-even is 1,825 million tokens a month. Spread across a month, that's roughly 694
            tokens per second, sustained day and night.
          </p>
          <p>
            That last part is the catch. Real traffic rises and falls, but the GPU bill doesn't.
            You also need spare capacity, more than one replica for reliability, and engineers to
            run it. Real break-even is usually much higher than the napkin number.
          </p>
          <Callout tone="tip">
            These prices are only examples, and both GPU rental and token prices move fast. Rerun
            the math with today's quotes before you decide.
          </Callout>
        </>
      ),
    },
    {
      id: "decide",
      title: "A sensible default",
      body: (
        <>
          <p>Most teams can follow this path:</p>
          <ol>
            <li>Start on an API to prove that the product works at all.</li>
            <li>Build an evaluation set from real requests, so models become easy to swap.</li>
            <li>
              Move to open weights when you have a concrete reason: cost at volume, latency
              targets, data rules, or the need to customize.
            </li>
          </ol>
          <p>
            Many mature products end up mixing both, with a cheap open model handling most
            traffic and a frontier model reserved for the hardest requests.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Closed models are API-only. Open-weight models can run anywhere you choose.",
    "Open weights isn't the same as fully open source, and licenses still apply.",
    "Self-hosting has a fixed cost, so it only wins at sustained volume.",
    "Napkin break-even ignores idle time, redundancy and staff, so real break-even is higher.",
    "Good evals make switching models cheap, which keeps your options open.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does an open-weight release always give you?",
      options: [
        "The training data",
        "Downloadable trained weights",
        "Permission for every commercial use",
        "A free hosted API",
      ],
      answer: 1,
      explain: "Open weights means the parameters are downloadable. Training data and unrestricted licensing aren't guaranteed.",
    },
    {
      kind: "mcq",
      q: "Why is real break-even usually higher than the napkin calculation?",
      options: [
        "GPUs slow down each month",
        "APIs get cheaper as you use them more",
        "You pay for idle capacity, redundancy and engineering time",
        "Tokens get longer in production",
      ],
      answer: 2,
      explain: "The napkin math assumes one GPU busy around the clock, with no spare capacity and no people cost.",
    },
    {
      kind: "text",
      q: "A GPU costs $2/hour for 730 hours. An API costs $0.50 per million tokens. What's the break-even, in millions of tokens per month?",
      format: "****",
      accept: ["2920", "2,920"],
      explain: "$2 × 730 = $1,460 a month. $1,460 ÷ $0.50 = 2,920 million tokens.",
    },
  ],
};
