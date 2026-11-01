import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Size a deployment from traffic and a measured benchmark",
    "Calculate cost per million tokens at real utilization",
    "Compare reserved, on-demand and spot capacity",
    "Work out the utilization at which reserving pays off",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: expensive to get wrong in either direction",
      body: (
        <>
          <p>
            GPUs are costly, and they're often sold in long commitments. Buy too few and users see
            queues and timeouts at peak. Buy too many and you pay for idle silicon every hour.
            Vendor specs can't tell you the right number, since your throughput depends on your
            model, prompt lengths, engine settings and latency targets.
          </p>
          <p>
            Sizing is like planning a restaurant. You don't count seats from the size of the
            building. You measure how quickly the kitchen serves real orders, estimate the
            dinner rush, and add spare tables. Then you decide whether to lease or rent.
          </p>
        </>
      ),
    },
    {
      id: "steps",
      title: "A sizing method in four steps",
      body: (
        <>
          <ol>
            <li>
              <strong>Check memory fit.</strong> Weights plus KV cache for your target concurrency
              must fit. This rules out some GPUs immediately.
            </li>
            <li>
              <strong>Benchmark one unit.</strong> Run your real prompt lengths against a candidate
              GPU. Raise the load until your latency target breaks. The highest throughput that
              still meets the target is your <strong>capacity per GPU</strong>.
            </li>
            <li>
              <strong>Estimate peak demand.</strong> Use your busiest period, not your daily
              average, and measure it in the same unit.
            </li>
            <li>
              <strong>Add headroom and redundancy.</strong> Leave room for growth and bursts, then
              add spares so that a failed GPU doesn't break your target.
            </li>
          </ol>
          <Formula>GPUs = ceil(peak demand × (1 + headroom) ÷ capacity per GPU) + spares</Formula>
          <Callout tone="warn">
            Never size from maximum throughput on a benchmark. That number usually comes with
            terrible latency. Your capacity is what you can sustain while still meeting your p95
            or p99 target.
          </Callout>
        </>
      ),
    },
    {
      id: "worked",
      title: "Worked example",
      body: (
        <>
          <p>
            All numbers here are illustrative. Your peak is 3,000 output tokens per second, and
            you want 30% headroom. On your benchmark, one GPU sustains 600 output tokens per second
            within your latency target. You also want one spare.
          </p>
          <pre>
            <code>{`import math

peak = 3_000          # output tokens/s at peak
headroom = 0.30
per_gpu = 600         # measured, at your latency target
spares = 1

needed = peak * (1 + headroom) / per_gpu     # 6.5
gpus = math.ceil(needed) + spares            # 7 + 1 = 8

rate = 2.50           # illustrative $ per GPU hour
hours = 720           # 30-day month
monthly = gpus * rate * hours                # $14,400

average = 1_200       # output tokens/s across the month
tokens = average * 3600 * hours              # 3.11 billion
per_million = monthly / (tokens / 1e6)       # $4.63`}</code>
          </pre>
          <p>
            So 8 GPUs cost $14,400 a month. At an average of 1,200 tokens per second, you serve
            about 3.11 billion output tokens, or about $4.63 per million output tokens.
          </p>
          <p>
            Notice how much the average matters. These 8 GPUs could carry far more than 1,200
            tokens per second, but the fleet is sized for the peak. If average load doubled with
            the same fleet, cost per token would halve. This is why utilization, not list price,
            often decides your real cost.
          </p>
          <p>
            Remember to compare candidates on cost per token at your latency target, not on price
            per hour. A GPU that costs more per hour can be cheaper per token. It may also need a
            smaller fleet, which lowers networking and operations work.
          </p>
        </>
      ),
    },
    {
      id: "buying",
      title: "Ways to buy capacity",
      body: (
        <>
          <p>
            Terms vary by provider, but capacity comes in a few basic forms. The GPU Procurement
            lesson covers multi-provider strategy in more depth.
          </p>
          <Table
            head={["Option", "Pay", "Availability", "Best for"]}
            rows={[
              ["On-demand", "Highest hourly rate, no commitment", "Not guaranteed for popular GPUs", "Spikes, tests, early products"],
              ["Reserved or committed", "Lower rate, long commitment", "Guaranteed for the term", "Your steady baseline"],
              ["Spot or preemptible", "Lowest rate", "Can be taken back", "Batch jobs that can restart"],
              ["Neo-cloud contracts", "Often lower, terms vary", "Varies by provider", "Large GPU fleets"],
              ["Own hardware", "Large upfront, plus power and staff", "Yours, after lead time", "Long-term steady scale"],
            ]}
          />
          <p>Reserving only wins if you use the capacity enough. The break-even point is simple:</p>
          <Formula>break-even utilization = reserved rate ÷ on-demand rate</Formula>
          <p>
            With an illustrative reserved rate of $2.50 and on-demand at $4.00, the break-even is
            2.50 ÷ 4.00 = 62.5%. If you'd need the GPU more than 62.5% of the time, reserve it.
            Below that, paying on-demand is cheaper, assuming you can actually get capacity when
            you need it. For popular GPUs, that assumption can fail.
          </p>
          <p>
            A common pattern is to reserve your baseline, cover daily peaks with on-demand or a
            second provider, and send interruptible batch work to spot.
          </p>
          <Callout tone="warn">
            Spot is a poor fit for live streaming. An interruption ends in-progress responses, and
            a new replica takes minutes to load. Use it for work that can retry.
          </Callout>
        </>
      ),
    },
    {
      id: "checklist",
      title: "Before you sign",
      body: (
        <>
          <p>A contract lasts longer than a benchmark. Ask these questions first:</p>
          <ul>
            <li>
              <strong>Hardware life:</strong> the commitment may outlast this GPU generation. What
              happens to your price when a better one ships?
            </li>
            <li>
              <strong>Real configuration:</strong> which exact GPU model, interconnect, network and
              local storage do you get?
            </li>
            <li>
              <strong>Quotas and region:</strong> can you actually get this many GPUs, in the
              region your users and data need?
            </li>
            <li>
              <strong>Failures:</strong> how fast are bad GPUs replaced? Is there a service credit?
            </li>
            <li>
              <strong>Hidden costs:</strong> data transfer, storage and support can add up.
            </li>
            <li>
              <strong>Testing:</strong> can you run your own benchmark on the exact hardware before
              you commit?
            </li>
          </ul>
          <Callout tone="tip">
            Prices, availability and lead times shift quickly. Treat all figures in this lesson as
            placeholders. Get live quotes, and repeat your sizing whenever your model or traffic
            changes.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Benchmark your own workload and define capacity at your latency target.",
    "Size for peak demand with headroom and spares, not for the daily average.",
    "Compare hardware on cost per token, not on price per hour.",
    "Reserve when expected utilization is above reserved rate divided by on-demand rate.",
    "Reserve your baseline, burst on-demand, and keep spot for work that can retry.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which number should you use as capacity per GPU?",
      options: [
        "The vendor's peak figure",
        "The highest throughput that still meets your latency target",
        "The average throughput of all GPUs in the region",
        "Throughput at 100% GPU utilization",
      ],
      answer: 1,
      explain: "Throughput beyond your latency target isn't usable capacity.",
    },
    {
      kind: "mcq",
      q: "Which workload suits spot GPUs best?",
      options: [
        "A live chat product",
        "A voice agent",
        "An overnight batch job that can retry",
        "A payment fraud check",
      ],
      answer: 2,
      explain: "Spot capacity can vanish, so the work must tolerate interruption.",
    },
    {
      kind: "text",
      q: "Peak demand is 1,000 tokens/s and headroom is 20%. Each GPU sustains 300 tokens/s. With no spares, how many GPUs do you need?",
      format: "*",
      accept: ["4"],
      explain: "1,000 × 1.2 ÷ 300 = 4 exactly.",
    },
    {
      kind: "text",
      q: "A reserved GPU costs $3 per hour and on-demand costs $5. What is the break-even utilization, as a percentage?",
      format: "***",
      accept: ["60%", "60", "60 percent"],
      explain: "3 ÷ 5 = 0.6, which is 60%.",
    },
  ],
};
