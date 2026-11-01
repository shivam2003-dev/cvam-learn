import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Compare reserved, on-demand and spot GPU capacity",
    "Find the utilization at which a reservation beats on-demand",
    "Mix capacity types to fit a daily traffic pattern",
    "Check the contract terms that matter beyond the hourly price",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Most cloud resources feel unlimited. GPUs often don't. Popular models can be sold out in
            a region, new accounts can have low quotas, and a spike may arrive just when
            you can't buy more. Paying the wrong way can double your bill. Buying too much can
            leave you with a long contract for idle hardware.
          </p>
          <p>
            So procurement is an engineering decision. You're matching a traffic shape to a set of
            pricing models, and each model trades price against certainty.
          </p>
          <p>
            Think about a place to sleep. A <strong>reservation</strong> is a one-year apartment lease:
            cheap per night, but you pay whether you're home or not. <strong>On-demand</strong> is a
            hotel: book it when you need it and pay more per night, assuming there's a room.{" "}
            <strong>Spot</strong> is a heavily discounted room that the hotel can take back if a
            full-price guest arrives.
          </p>
        </>
      ),
    },
    {
      id: "options",
      title: "The three models",
      body: (
        <>
          <Table
            head={["", "Reserved", "On-demand", "Spot"]}
            rows={[
              ["Price", "Low, with a commitment", "Highest", "Usually lowest"],
              ["Commitment", "Months to years", "None", "None"],
              ["Availability", "Guaranteed by contract", "Not guaranteed", "Not guaranteed"],
              ["Can be taken away?", "No", "No, once running", "Yes, at short notice"],
              ["Best for", "Steady baseline load", "Peaks and short projects", "Batch and interruptible work"],
            ]}
          />
          <p>
            Spot warnings are short. As a guide, AWS gives about two minutes, and Google Cloud and
            Azure give about 30 seconds. Check your provider's current terms. Either way, that's
            less time than many long streams take, and far less than a cold start.
          </p>
          <p>
            Providers also vary. Large clouds offer deep integration with their other services. GPU
            specialist clouds may offer lower prices or faster access to the newest hardware. Owning
            hardware in a colocation facility can win at very large, stable scale, but you then
            handle failures, power and upgrades yourself.
          </p>
        </>
      ),
    },
    {
      id: "breakeven",
      title: "When does a reservation pay off?",
      body: (
        <>
          <p>
            A reservation charges you for every hour. On-demand charges only for hours you use. So a
            reservation wins once you use the GPU for a large enough share of the time:
          </p>
          <Formula>break-even utilization = reserved rate ÷ on-demand rate</Formula>
          <p>
            With illustrative rates of $2 per hour reserved and $4 per hour on-demand, the break-even
            is 2 ÷ 4 = 50%. A GPU that's busy over 12 hours a day is cheaper reserved. Below that,
            on-demand wins, as long as you can actually get it.
          </p>
          <p>
            Here's the useful part. Don't ask whether to reserve the whole fleet. Ask about each
            GPU in turn. The first GPU runs all day, so reserve it. The fortieth only runs at peak,
            so don't.
          </p>
          <Callout tone="tip">
            Reserve up to the demand level you exceed for a greater share of hours than the
            break-even. With a 50% break-even, that's your median hourly demand. Cover everything
            above it with on-demand or spot.
          </Callout>
        </>
      ),
    },
    {
      id: "worked",
      title: "Worked example: a daily pattern",
      body: (
        <>
          <p>
            A service needs 20 GPUs for 18 hours a day, and 40 GPUs for a 6-hour peak. Using the same
            illustrative rates, here are three plans for one day:
          </p>
          <pre>
            <code>{`Total GPU-hours: (20 × 18) + (40 × 6) = 360 + 240 = 600

All on-demand:
  600 × $4                                  = $2,400

Reserve 40 for the peak:
  40 × 24 × $2                              = $1,920

Reserve 20, on-demand above that:
  Reserved:  20 × 24 × $2                   = $960
  On-demand: 20 × 6 × $4                    = $480
  Total                                     = $1,440`}</code>
          </pre>
          <p>
            The mix beats both pure options. It saves 40% against all on-demand, because each
            baseline GPU runs all day, and it saves 25% against over-reserving, because peak GPUs are
            busy for only 25% of the day. That's under the 50% break-even.
          </p>
          <p>Here's the same check in code, which you can run on real hourly demand:</p>
          <pre>
            <code>{`def daily_cost(demand, reserved, res_rate=2.0, od_rate=4.0):
    fixed = reserved * len(demand) * res_rate
    overflow = sum(max(d - reserved, 0) for d in demand) * od_rate
    return fixed + overflow

demand = [20] * 18 + [40] * 6    # one value per hour
best = min(range(0, 41), key=lambda r: daily_cost(demand, r))
print(best, daily_cost(demand, best))    # 20 1440.0`}</code>
          </pre>
          <p>
            Spot could cut the overflow further. But count the lost work. If interruptions and
            restarts waste 15% of your time, a $1.60 spot GPU has an effective rate of
            1.60 ÷ 0.85, or about $1.88 per useful hour. That's a real discount, but less than the
            sticker price suggests.
          </p>
          <Callout tone="warn">
            Don't serve interactive traffic purely on spot. An interruption drops every active
            stream on that GPU, and replacing it takes a full cold start. If you use spot for live
            traffic, treat it as extra capacity with reliable capacity able to catch the load.
          </Callout>
        </>
      ),
    },
    {
      id: "contracts",
      title: "What to check before you sign",
      body: (
        <>
          <p>The hourly rate is only part of the deal. A cheap GPU in the wrong setup isn't cheap.</p>
          <Table
            head={["Check", "Why it matters"]}
            rows={[
              ["Term length", "New GPU generations can lower cost per token, leaving you locked into older hardware"],
              ["Quotas", "On-demand needs a quota, and increases can take time, so ask before you need it"],
              ["Region", "Capacity must sit near your users and meet data residency rules"],
              ["Interconnect", "Multi-GPU models need a fast link between GPUs, and multi-node needs fast networking"],
              ["Storage and egress", "Moving weights and data out of a cloud can add real cost"],
              ["Failed hardware", "Ask how fast a broken GPU gets replaced, and whether you pay meanwhile"],
              ["Reliability terms", "Ask what the service credit covers, and how availability is measured"],
            ]}
          />
          <p>
            Forecasting gets more value from shorter commitments. A one-year term on a modest
            baseline is often safer than three years on your optimistic forecast. It's easy to add
            more capacity later, but hard to shed a contract. The lesson on Capacity Management shows
            how to size that baseline.
          </p>
          <p>
            Finally, remember that all prices here are examples. GPU pricing moves quickly, and it
            differs across providers, regions and hardware, so rerun these sums on current quotes.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Reserved buys certainty, on-demand buys flexibility, and spot buys discount at the risk of interruption.",
    "A reservation pays off when utilization exceeds reserved rate divided by on-demand rate.",
    "Reserve your baseline and cover peaks with on-demand or spot.",
    "Count lost work when you calculate the real price of spot.",
    "Check term, quotas, region, networking and hardware replacement, not just the hourly rate.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Reserved costs $3 per hour and on-demand costs $5 per hour. What's the break-even utilization, as a percentage?",
      format: "**",
      accept: ["60", "60%"],
      explain: "3 ÷ 5 = 60%.",
    },
    {
      kind: "text",
      q: "You reserve 10 GPUs at $2 per hour for 24 hours. What does that cost in dollars?",
      format: "***",
      accept: ["480", "$480"],
      explain: "10 × 24 × $2 = $480, whether they're busy or not.",
    },
    {
      kind: "mcq",
      q: "Which workload suits spot GPUs best?",
      options: [
        "A live voice agent",
        "A checkpointed overnight batch job",
        "Your only production chat replica",
        "A real-time fraud check",
      ],
      answer: 1,
      explain: "Batch work can stop and resume, so an interruption costs only some repeated work.",
    },
    {
      kind: "mcq",
      q: "A GPU is needed only 6 hours a day, with a break-even utilization of 50%. What's the better choice?",
      options: [
        "Reserve it, since it's cheaper per hour",
        "Use on-demand, since 25% utilization is under the break-even",
        "Buy three of them",
        "Reserve it for three years",
      ],
      answer: 1,
      explain: "6 ÷ 24 = 25%, which is below 50%, so paying only for hours used is cheaper.",
    },
  ],
};
