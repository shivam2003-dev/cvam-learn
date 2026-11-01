import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Convert token demand into a GPU count with a target utilization",
    "Add buffers for spikes, failures, deployments and growth",
    "Forecast when capacity runs out and when to order more",
    "Explain how sharing a pool reduces the capacity you must hold",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Autoscaling handles minutes. Capacity management handles months. An autoscaler can only
            scale within the GPUs you already have access to. When a contract or quota takes weeks
            to arrange, you can't react to growth. You have to see it coming.
          </p>
          <p>
            Get it wrong in one direction, and you turn away customers because there are no GPUs to
            serve them. Get it wrong in the other, and you pay for idle hardware every hour of a
            long contract.
          </p>
          <p>
            A power grid works in the same way. Operators don't build for the average day. They
            forecast demand, plan for the hottest afternoon of the year, and keep reserve in case a
            plant goes down. Your cluster needs the same habit.
          </p>
        </>
      ),
    },
    {
      id: "sizing",
      title: "From tokens to GPUs",
      body: (
        <>
          <p>
            Start with your peak, not your average. Measure it in tokens per second, as request
            counts hide size. Then use a load test to find how much one GPU can serve while still
            meeting your latency targets. That number is your <strong>sustainable throughput</strong>.
            It's lower than the maximum a benchmark reports.
          </p>
          <p>
            Never plan to run at 100% of that. Keep a <strong>target utilization</strong>, because
            queues build fast near full.
          </p>
          <Formula>GPUs = peak tokens per second ÷ (sustainable throughput × target utilization)</Formula>
          <p>
            Say your peak is 1.2 million tokens per minute, each GPU sustains 500 tokens per second,
            and you target 70%. These numbers are illustrative.
          </p>
          <pre>
            <code>{`Peak:      1,200,000 ÷ 60        = 20,000 tokens per second
Usable:    500 × 0.70            = 350 tokens per second per GPU
GPUs:      20,000 ÷ 350          = 57.1, so 58 GPUs`}</code>
          </pre>
          <p>
            Always round up. And check that peak carefully: if it comes from hourly averages, a
            short spike may be hidden inside it. Use per-minute data or finer.
          </p>
        </>
      ),
    },
    {
      id: "buffers",
      title: "The buffers you need",
      body: (
        <>
          <p>
            Target utilization covers everyday noise. Other risks need their own room. List
            each one, as buffers tend to get added twice or forgotten.
          </p>
          <Table
            head={["Buffer", "Protects against", "Typical approach"]}
            rows={[
              ["Spike", "Random bursts", "Target utilization below 100%"],
              ["Failure", "Losing a GPU, a zone or a region", "Survive your largest expected failure"],
              ["Deployment", "Replicas draining during a rollout", "Spare replicas for rolling updates"],
              ["Cold start", "Demand growing during scale-up", "Warm spares, sized by growth rate"],
              ["Growth", "Demand rising before new capacity lands", "Order ahead by the procurement lead time"],
            ]}
          />
          <p>
            Failure buffers are often the largest. Say those 58 GPUs must survive losing one of three
            zones. The two surviving zones must carry the full load, so each needs 58 ÷ 2 = 29 GPUs.
            Three zones of 29 is 87 GPUs. You've added 50% to protect against one failure. Whether
            that's worth it depends on your availability promise, which is a business decision.
          </p>
          <Callout tone="note">
            These buffers don't need to be idle. Spare GPUs can run batch jobs at low priority,
            and you can pause that work in a moment when live traffic needs the room. It's one of
            the best ways of paying for headroom.
          </Callout>
        </>
      ),
    },
    {
      id: "forecast",
      title: "Forecasting and lead time",
      body: (
        <>
          <p>
            Capacity must arrive before you need it. So work out when you'll run out, then subtract
            the time it takes to get more.
          </p>
          <Formula>order by = month capacity runs out − procurement lead time</Formula>
          <p>
            Say you hold 100 GPUs, so usable capacity is 100 × 350 = 35,000 tokens per second. Peak
            demand is 20,000 and grows 8% per month. Here's how long you've got:
          </p>
          <pre>
            <code>{`import math

capacity = 100 * 500 * 0.70     # 35,000 tokens per second
demand = 20_000
growth = 0.08

months = math.log(capacity / demand) / math.log(1 + growth)
print(round(months, 1))         # 7.3`}</code>
          </pre>
          <p>
            With 7.3 months of runway and a 3-month lead time, order by about month 4. In practice,
            order earlier, as forecasts miss and delivery slips. The failure buffer would also bring
            the real date forward.
          </p>
          <p>
            Growth compounds, so small changes add up. After six months at 8% per month, demand
            is 20,000 × 1.08<sup>6</sup>, or about 31,700 tokens per second. That needs
            31,700 ÷ 350 = 90.6, so 91 GPUs before any failure buffer.
          </p>
          <Callout tone="warn">
            Token volume isn't the only thing that grows. Longer contexts use more KV memory. A
            reasoning model can generate far more tokens per answer. A heavier new model drops your
            throughput per GPU. Any of these can break a plan built only on request growth, so redo
            the load test when the workload shifts.
          </Callout>
        </>
      ),
    },
    {
      id: "pooling",
      title: "Pooling and running the process",
      body: (
        <>
          <p>
            If 10 models each keep their own buffers, you hold 10 sets of spare GPUs. But their peaks
            rarely all land at once. A shared pool can hold one combined buffer and shift GPUs
            between models as needed. This is <strong>statistical multiplexing</strong>: the peak of
            a sum is usually smaller than the sum of the peaks.
          </p>
          <Table
            head={["Model", "Own peak (GPUs)"]}
            rows={[
              ["A: daytime chat", "30"],
              ["B: overnight batch", "20"],
              ["C: business-hours tool", "10"],
              ["Dedicated total", "60"],
              ["Shared peak, if B runs when A and C are quiet (example)", "40"],
            ]}
          />
          <p>
            Pooling works best when models can load quickly and share the same hardware type. Long
            cold starts limit how fast you can shift GPUs around.
          </p>
          <p>Make it a routine, not a one-off:</p>
          <ul>
            <li>Review actual against forecast each month.</li>
            <li>Track headroom by region and by GPU type, since capacity in one doesn't help another.</li>
            <li>Rerun load tests after engine, model or kernel changes.</li>
            <li>Set token-based rate limits per customer, so a single account can't use all your buffer.</li>
            <li>Agree in advance what gets shed if demand beats supply.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Autoscaling works within capacity, and capacity planning makes sure there's enough to scale into.",
    "Size from peak tokens per second, sustainable throughput and target utilization.",
    "Name each buffer: spikes, failures, deployments, cold starts and growth.",
    "Order ahead by your procurement lead time, plus a margin for error.",
    "Pooling models reduces total buffer, and batch work can fill spare capacity.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Peak is 9,000 tokens per second. One GPU sustains 300 tokens per second, and you target 75% utilization. How many GPUs do you need?",
      format: "**",
      accept: ["40"],
      explain: "300 × 0.75 = 225 usable, and 9,000 ÷ 225 = 40 GPUs.",
    },
    {
      kind: "text",
      q: "A service needs 60 GPUs, spread across 3 zones, and must survive losing one zone. How many GPUs do you need in total?",
      format: "**",
      accept: ["90"],
      explain: "Two zones must carry 60, so each needs 30, and 3 × 30 = 90.",
    },
    {
      kind: "mcq",
      q: "Why should you size from sustainable throughput and not from a benchmark's maximum?",
      options: [
        "Benchmarks can't measure GPUs",
        "The maximum may break your latency targets",
        "Sustainable throughput is always higher",
        "The maximum only applies to spot GPUs",
      ],
      answer: 1,
      explain: "Peak throughput often comes with long queues, so it isn't usable for live traffic.",
    },
    {
      kind: "mcq",
      q: "How does a shared GPU pool reduce the capacity you hold?",
      options: [
        "GPUs run faster when shared",
        "Models' peaks rarely all happen at the same moment",
        "Models use fewer tokens",
        "It removes the need for failure planning",
      ],
      answer: 1,
      explain: "The combined peak is usually lower than the sum of separate peaks.",
    },
  ],
};
