import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Convert a GPU hourly price into a cost per million tokens",
    "Show how utilization moves unit cost",
    "Estimate the cost of a single customer, including prompt caching",
    "Find the break-even between a per-token API and dedicated GPUs",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            You pay for GPUs by the hour. Customers pay you per token or per seat. Between those
            two sits a question that decides if your business works: what does one token really
            cost?
          </p>
          <p>
            It's a harder question than it looks. The same GPU can be cheap at high traffic and
            ruinous at low traffic. One customer may use short cached prompts, and another may send
            long ones with heavy output. Without a cost model, you can win customers that lose you
            money and never notice.
          </p>
          <p>
            Think of an airline. A seat costs about the same to fly whether it's full or empty. The
            airline's profit depends on how many seats it fills. A GPU works the same way:
            the hourly price is fixed, so your cost per token falls as you fill it.
          </p>
        </>
      ),
    },
    {
      id: "unit-cost",
      title: "Cost per million tokens",
      body: (
        <>
          <p>Start with one GPU, its throughput, and the share of its time spent doing useful work.</p>
          <Formula>tokens per hour = tokens per second × 3,600 × utilization</Formula>
          <Formula>cost per 1M tokens = GPU cost per hour ÷ (tokens per hour ÷ 1,000,000)</Formula>
          <p>
            Take a $3 per hour GPU that generates 1,000 tokens per second at full load. Both
            numbers are illustrative, and current prices vary. Here's what utilization does:
          </p>
          <Table
            head={["Utilization", "Tokens per hour", "Cost per 1M tokens"]}
            rows={[
              ["30%", "1.08M", "$2.78"],
              ["40%", "1.44M", "$2.08"],
              ["50%", "1.80M", "$1.67"],
              ["70%", "2.52M", "$1.19"],
            ]}
          />
          <p>
            Same GPU, same model, and more than double the unit cost at the low end. This is why
            batching, autoscaling and scale-to-zero all show up on the finance report. They all
            raise utilization.
          </p>
          <Callout tone="warn">
            Use throughput from a load test run at your real latency target. A benchmark's maximum
            usually involves long queues. If you base pricing on it, your cost model will be too
            good to be true.
          </Callout>
        </>
      ),
    },
    {
      id: "input-output",
      title: "Input and output aren't equal",
      body: (
        <>
          <p>
            Prefill can process prompt tokens in large parallel chunks, while decode produces output
            one step at a time. So input tokens are usually cheaper to process, which is why APIs
            tend to price them lower. You can model this with a ratio.
          </p>
          <p>
            If prefill handles 5,000 tokens per second and decode handles 1,000, an input token is
            worth 1 ÷ 5 of an output token. Convert everything into{" "}
            <strong>output-equivalent tokens</strong>, then apply your unit cost:
          </p>
          <Formula>output-equivalent tokens = output + (input ÷ ratio)</Formula>
          <p>
            Now price one customer for a month: 400M input tokens, 50M output tokens, a ratio of 5
            and a cost of $1.19 per 1M output-equivalent tokens.
          </p>
          <pre>
            <code>{`Output equivalent:  50M + (400M ÷ 5) = 130M
Cost:               130 × $1.19      ≈ $155

With 60% of input served from the prefix cache:
Uncached input:     400M × 0.40      = 160M
Output equivalent:  50M + (160M ÷ 5) = 82M
Cost:               82 × $1.19       ≈ $98`}</code>
          </pre>
          <p>
            Caching saves about $57 for that customer, or 37%. For simplicity, this treats cached
            tokens as free. They do use some memory and compute, but much less than normal prefill.
            It also shows why you should offer a lower price for cached input: it encourages habits
            that lower your own cost.
          </p>
        </>
      ),
    },
    {
      id: "full-cost",
      title: "What the hourly rate leaves out",
      body: (
        <>
          <p>
            GPU rental is the largest line, but it isn't the whole bill. Your full cost per token
            must include these:
          </p>
          <Table
            head={["Cost", "What it covers"]}
            rows={[
              ["Idle GPUs", "Time at low traffic. Utilization covers this if you measure it over the whole day"],
              ["Buffers", "Failure, deployment and spike capacity"],
              ["Support services", "CPUs for gateways, databases, vector search and caches"],
              ["Storage and network", "Weights, logs, cross-region traffic and egress"],
              ["Observability", "Metrics, logs and traces at scale"],
              ["Engineers", "People to run it all, on call"],
              ["Unbilled tokens", "Failures, retries, free tiers and abandoned streams"],
            ]}
          />
          <p>
            Unbilled tokens are easy to forget. If a user closes a tab and the stream keeps running,
            you pay for tokens that nobody received. Canceling on disconnect fixes that cheaply.
          </p>
          <Callout tone="tip">
            Tag every request with tenant, model, and input, output and cached token counts. Then
            your per-customer margin becomes a simple query rather than a guess.
          </Callout>
          <pre>
            <code>{`SELECT tenant_id,
       SUM(input_tokens - cached_tokens) / 5.0 + SUM(output_tokens)
         AS output_equivalent_tokens,
       (SUM(input_tokens - cached_tokens) / 5.0 + SUM(output_tokens))
         / 1000000 * 1.19 AS gpu_cost_usd,
       SUM(billed_usd) AS revenue_usd
FROM request_usage
WHERE day >= CURRENT_DATE - INTERVAL '30' DAY
GROUP BY tenant_id
ORDER BY gpu_cost_usd DESC;`}</code>
          </pre>
          <p>
            The ratio of 5 and the rate of $1.19 are the example values from above. Replace them
            with your measured numbers. The table and its columns are also just an example.
          </p>
        </>
      ),
    },
    {
      id: "breakeven",
      title: "Worked example: API or dedicated?",
      body: (
        <>
          <p>
            Should you pay per token, or rent your own GPUs? Dedicated cost is fixed, and API cost
            grows with use, so there's a crossing point.
          </p>
          <Formula>break-even tokens per month = dedicated monthly cost ÷ API price per token</Formula>
          <p>
            Say you'd run 4 GPUs at $3 per hour for a 720-hour month, against an API with a blended
            price of $1.50 per 1M tokens. These are illustrative numbers.
          </p>
          <pre>
            <code>{`Dedicated:   4 × $3 × 720           = $8,640 per month
Break-even:  $8,640 ÷ $1.50 per 1M  = 5,760M tokens per month
Average:     5,760M ÷ 2,592,000 s   ≈ 2,222 tokens per second
Capacity:    4 × 1,000              = 4,000 tokens per second
Utilization: 2,222 ÷ 4,000          ≈ 56%`}</code>
          </pre>
          <p>
            So going dedicated only wins on GPU cost if you hold about 56% average utilization, day
            and night, with no buffer. That's hard for a service with quiet nights. Then add the
            engineers. It's often sensible to begin with an API and move once volume is high and
            steady, or when you need more control over data or latency.
          </p>
          <p>
            Forecast with ranges, not a single number. Run your model with low, expected and high
            cases for traffic, utilization and token mix. If the business only works in the
            optimistic case, you've learned something valuable.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Cost per token depends on GPU price, throughput and utilization.",
    "Higher utilization lowers unit cost, so scheduling work has financial value.",
    "Weight input and output separately, and credit prefix cache hits.",
    "A full cost includes buffers, support services, engineers and unbilled tokens.",
    "Dedicated capacity beats per-token APIs only at high, steady utilization.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A GPU costs $9 per hour and generates 1,000 tokens per second at 50% utilization. What's the cost in dollars per 1M tokens?",
      format: "*",
      accept: ["5", "5.00", "$5"],
      explain: "1,000 × 3,600 × 0.5 = 1.8M tokens per hour, and $9 ÷ 1.8 = $5.",
    },
    {
      kind: "text",
      q: "Dedicated GPUs cost $7,200 per month, and an API charges $1.50 per 1M tokens. What's the break-even in millions of tokens per month?",
      format: "****",
      accept: ["4800", "4,800"],
      explain: "$7,200 ÷ $1.50 = 4,800 million tokens.",
    },
    {
      kind: "mcq",
      q: "Utilization rises from 35% to 70% on the same GPU. What happens to cost per token?",
      options: ["It doubles", "It halves", "It stays the same", "It rises slightly"],
      answer: 1,
      explain: "You spread the same hourly price over twice as many tokens.",
    },
    {
      kind: "mcq",
      q: "A user closes the browser and the stream keeps generating. How does this affect you?",
      options: [
        "You pay for tokens nobody received",
        "It raises KV cache hit rates",
        "Nothing, as GPUs ignore closed clients",
        "It refunds the customer",
      ],
      answer: 0,
      explain: "Canceling on disconnect stops this waste.",
    },
    {
      kind: "text",
      q: "A customer uses 20M output tokens and 100M input tokens, with an input-to-output ratio of 5. How many million output-equivalent tokens is that?",
      format: "**",
      accept: ["40", "40M"],
      explain: "20 + (100 ÷ 5) = 40 million.",
    },
  ],
};
