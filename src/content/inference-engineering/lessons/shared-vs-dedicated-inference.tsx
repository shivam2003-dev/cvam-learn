import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Describe how shared and dedicated inference are billed and run",
    "Calculate the utilization where dedicated becomes cheaper",
    "Design a hybrid setup that uses each for what it's good at",
  ],
  tasks: [
    {
      id: "two-models",
      title: "Two ways to rent a model",
      body: (
        <>
          <p>
            <strong>Shared inference</strong>, often called serverless, runs your requests on a
            fleet used by many customers. You pay per token and nothing while idle. The provider
            handles batching, scaling and hardware.
          </p>
          <p>
            <strong>Dedicated inference</strong> reserves GPUs for you alone. You pay per GPU
            hour whether traffic arrives or not, and in exchange you get predictable performance
            and much more control.
          </p>
          <p>
            Think of a taxi versus a leased car. A taxi is great for occasional trips. If you
            drive all day, every day, the lease wins.
          </p>
          <Table
            head={["", "Shared", "Dedicated"]}
            rows={[
              ["Billing", "Per token", "Per GPU hour"],
              ["Idle cost", "None", "Full price"],
              ["Latency consistency", "Varies with other customers", "Predictable"],
              ["Rate limits", "Set by the provider", "Limited by your capacity"],
              ["Custom or fine-tuned models", "Often limited", "Yes"],
              ["Engine tuning", "None", "Batch size, quantization, cache"],
              ["Burst handling", "Usually absorbed by the fleet", "Your job"],
            ]}
          />
        </>
      ),
    },
    {
      id: "noisy",
      title: "The noisy neighbor problem",
      body: (
        <>
          <p>
            On a shared fleet, your request shares a GPU and a batch with other people's. If
            someone sends a giant prompt, or a traffic spike lands on the same replicas, your
            tail latency can rise even though nothing changed on your side.
          </p>
          <p>
            Providers fight this with queues, per-customer limits and fair scheduling, but they
            can't remove it entirely. So measure a shared endpoint at different hours of the day
            rather than trusting one quick test.
          </p>
        </>
      ),
    },
    {
      id: "utilization",
      title: "Utilization decides the bill",
      body: (
        <>
          <p>
            A GPU earns its keep only when it's busy. To compare fairly, ask what its output
            would cost on the shared API. The share of its maximum output at which both cost the
            same is your break-even utilization.
          </p>
          <Formula>break-even utilization = GPU $/hour ÷ (max M tokens/hour × shared $/M)</Formula>
          <p>
            Take an illustrative GPU at $3.00 an hour that sustains 1,000 tokens per second.
            That's 3.6 million tokens per hour. At a shared price of $1.50 per million, a fully
            busy GPU produces $5.40 of API-equivalent tokens each hour.
          </p>
          <p>
            So break-even utilization is $3.00 ÷ $5.40, or about <strong>55.6%</strong>. Run
            busier than that around the clock and dedicated is cheaper. Run quieter and you're
            paying for air.
          </p>
          <Callout tone="warn" title="Sometimes dedicated never wins">
            Run the same numbers at a shared price of $0.50 per million. A fully busy GPU now
            produces only $1.80 of value per hour, less than its $3.00 cost. Break-even comes out
            above 100%, so no amount of traffic justifies this setup unless you make the model
            run faster.
          </Callout>
        </>
      ),
    },
    {
      id: "hybrid",
      title: "Hybrid: the common production answer",
      body: (
        <>
          <p>
            You don't have to pick one. A common pattern is to size dedicated capacity for your
            steady baseline, then spill bursts over to a shared endpoint.
          </p>
          <ul>
            <li>The baseline stays busy, so dedicated GPUs keep high utilization.</li>
            <li>Peaks cost a bit more per token, but only for the hours they last.</li>
            <li>Shared gives you a fallback if a dedicated region has trouble.</li>
          </ul>
          <Callout tone="tip">
            The two endpoints must behave the same. Use the same model version and quantization,
            and test both, or users will see quality change whenever traffic spills over.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Shared bills per token, and dedicated bills per GPU hour.",
    "Dedicated buys predictable latency and control, but you pay for idle time.",
    "Break-even utilization compares GPU cost with the API value of its maximum output.",
    "If break-even is above 100%, dedicated can't win without a faster setup.",
    "Baseline on dedicated with burst on shared is a common hybrid.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which workload best suits shared inference?",
      options: [
        "A steady internal pipeline running around the clock",
        "A new feature with low, unpredictable traffic",
        "A custom fine-tuned model",
        "A product with strict, consistent latency requirements",
      ],
      answer: 1,
      explain: "With low or unknown traffic, paying only per token avoids paying for idle GPUs.",
    },
    {
      kind: "mcq",
      q: "A GPU costs $4/hour and sustains 2 million tokens/hour. Shared costs $1 per million. What's break-even utilization?",
      options: ["50%", "100%", "200%", "25%"],
      answer: 2,
      explain: "Full output is worth $2/hour against a $4 cost, so break-even is 200%. Dedicated can't win at this speed.",
    },
    {
      kind: "text",
      q: "What term describes other customers' traffic hurting your latency on a shared fleet? Two words.",
      format: "***** ********",
      accept: ["noisy neighbor", "noisy neighbour", "noisy neighbors", "noisy neighbours"],
      explain: "Noisy neighbors are the classic downside of multi-tenant systems.",
    },
  ],
};
