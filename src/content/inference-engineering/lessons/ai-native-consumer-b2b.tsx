import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Describe how consumer and B2B traffic differ in shape",
    "Use peak-to-average ratio to estimate fleet size and utilization",
    "Protect shared capacity from a single large customer",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: same model, different traffic",
      body: (
        <>
          <p>
            An <strong>AI-native app</strong> is a product where the model is the core of the
            experience, not an add-on. Remove the model and there's no product. That means inference
            cost and latency shape the business directly, as much as any feature does.
          </p>
          <p>
            Two AI-native apps can run the same model and need very different infrastructure. A
            consumer companion app and a contract review tool for law firms both send text to an LLM.
            But one has millions of light users, and the other has a few hundred heavy ones.
          </p>
          <p>
            Think of a motorway and a freight rail line. The motorway carries huge numbers of small
            vehicles, and rush hour is unpredictable. The rail line carries few, enormous loads on
            agreed schedules, and a missed delivery has a contract attached. You wouldn't design them
            the same way.
          </p>
          <Table
            head={["", "Consumer", "B2B"]}
            rows={[
              ["Users", "Many, each using little", "Few accounts, each using a lot"],
              ["Request size", "Often short prompts and replies", "Often long documents and RAG context"],
              ["Traffic shape", "Daily waves, sudden viral spikes", "Business hours, scheduled jobs"],
              ["Revenue per request", "Low, many free users", "Higher, set by contract"],
              ["Main risk", "Cost per user and surprise spikes", "One tenant hurting the others"],
              ["What buyers ask for", "Speed and a good free tier", "SLAs, privacy, audit trails"],
            ]}
          />
          <p>
            A note on terms. A <strong>tenant</strong> is one customer sharing your platform. An{" "}
            <strong>SLA</strong>, or service level agreement, is a contract that sets targets such as
            uptime and latency, often with financial penalties if you miss them.{" "}
            <strong>RAG</strong> means retrieving documents and adding them to the prompt.
          </p>
        </>
      ),
    },
    {
      id: "consumer",
      title: "Consumer: survive the spike, watch the unit cost",
      body: (
        <>
          <p>
            Consumer traffic follows waking hours in each time zone, which gives a smooth daily
            wave. On top of that sit spikes you can't schedule: a post goes viral, or a celebrity
            mentions the app. Traffic can multiply in minutes, faster than new GPUs can start.
          </p>
          <p>
            Consumer apps also have a pricing problem. Many users pay nothing, and paying users
            often pay a flat fee. So a heavy user can cost far more than they bring in. Common
            responses:
          </p>
          <ul>
            <li>
              <strong>Model tiers:</strong> free users get a small, cheap model, and paying users get
              the large one.
            </li>
            <li>
              <strong>Load shedding:</strong> during a spike, slow or reject free traffic first and
              keep paying users healthy.
            </li>
            <li>
              <strong>Output limits:</strong> a cap on tokens per reply limits the worst case.
            </li>
            <li>
              <strong>Prefix caching:</strong> a shared system prompt can be reused across millions of
              requests.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "b2b",
      title: "B2B: fair sharing and promises",
      body: (
        <>
          <p>
            B2B traffic is calmer in the aggregate. It rises during working hours and drops at
            weekends. But it's concentrated. Your top five accounts may produce most of your tokens,
            and one of them can start a job that processes 100,000 documents at 2 a.m.
          </p>
          <p>
            That creates the <strong>noisy neighbor</strong> problem: one tenant fills the queue and
            everyone else's latency suffers. The standard defense is a per-tenant rate limit. Limit
            tokens rather than requests, because one request can carry 50 tokens or 50,000.
          </p>
          <pre>
            <code>{`import time

class TokenBucket:
    """Allows short bursts, then limits a tenant to refill_per_s."""

    def __init__(self, capacity, refill_per_s):
        self.capacity = capacity
        self.refill_per_s = refill_per_s
        self.available = capacity
        self.last = time.monotonic()

    def try_consume(self, tokens):
        now = time.monotonic()
        earned = (now - self.last) * self.refill_per_s
        self.available = min(self.capacity, self.available + earned)
        self.last = now
        if tokens > self.available:
            return False  # Return HTTP 429, or send to a slower queue.
        self.available -= tokens
        return True`}</code>
          </pre>
          <p>
            Keep one bucket per tenant and call it before a request enters the engine. Count the
            prompt plus <code>max_tokens</code>, since you don't yet know the real output length.
          </p>
          <p>
            Big customers often want guarantees that shared capacity can't give, such as a fixed
            throughput or no data retention. That's when dedicated deployments appear, as covered in
            Shared vs. Dedicated Inference. The GPUs cost more per token, but the customer gets
            isolation and you get a predictable contract.
          </p>
          <Callout tone="warn">
            Concentration cuts both ways. If one customer provides half your traffic, losing them
            leaves half your reserved GPUs idle. Keep that in mind before signing long hardware
            commitments.
          </Callout>
        </>
      ),
    },
    {
      id: "capacity",
      title: "Worked example: peak-to-average ratio",
      body: (
        <>
          <p>
            One number captures most of the difference between the two audiences. It tells you how
            much idle capacity a fixed fleet will carry:
          </p>
          <Formula>peak-to-average ratio = peak load ÷ average load</Formula>
          <p>
            Suppose both products average 40 requests per second, and one GPU handles 10 requests
            per second within the latency target. All figures are illustrative.
          </p>
          <Table
            head={["", "Consumer", "B2B"]}
            rows={[
              ["Average load", "40 req/s", "40 req/s"],
              ["Peak-to-average ratio", "4", "1.5"],
              ["Peak load", "160 req/s", "60 req/s"],
              ["GPUs needed at peak", "16", "6"],
              ["Average utilization", "25%", "About 67%"],
            ]}
          />
          <p>
            Average utilization is the average load divided by total capacity. For consumer that's
            40 ÷ 160 = 25%. For B2B it's 40 ÷ 60, about 67%. The two products serve exactly the same
            number of requests over a day, yet the consumer fleet is 2.7 times larger if it stays
            fixed.
          </p>
          <p>
            That gap is why autoscaling matters so much more for consumer apps. Scaling down
            overnight wins back much of the wasted 75%. It also explains why consumer teams move
            work like summaries and title generation to async or offline paths, which trims the peak.
          </p>
          <Callout tone="tip">
            Measure your own ratio from real logs, at one-minute resolution. Hourly averages hide the
            spikes that break latency targets.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Consumer traffic is many small requests with daily waves and unpredictable spikes.",
    "B2B traffic is concentrated in fewer accounts with larger requests and contract promises.",
    "Peak-to-average ratio shows how much idle capacity a fixed fleet will carry.",
    "Limit tenants by tokens, not requests, to stop noisy neighbors.",
    "Model tiers, load shedding and dedicated deployments are the main tools for each audience.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why should a per-tenant limit count tokens instead of requests?",
      options: [
        "Tokens are easier to log",
        "Requests can vary hugely in size, so tokens reflect real GPU load",
        "HTTP can't count requests",
        "SLAs forbid request limits",
      ],
      answer: 1,
      explain: "One request might carry 50 tokens or 50,000, so request counts hide the true cost.",
    },
    {
      kind: "mcq",
      q: "Which is the main capacity risk for a B2B platform with a few large tenants?",
      options: [
        "One tenant's job hurting everyone else's latency",
        "Too many free users",
        "Viral posts on social media",
        "Prompts being too short",
      ],
      answer: 0,
      explain: "This is the noisy neighbor problem, handled with per-tenant limits and isolation.",
    },
    {
      kind: "text",
      q: "Average load is 30 req/s and peak load is 120 req/s. What is the peak-to-average ratio?",
      format: "*",
      accept: ["4", "4.0"],
      explain: "120 ÷ 30 = 4.",
    },
    {
      kind: "text",
      q: "A fixed fleet is sized for 120 req/s and averages 30 req/s. What is its average utilization as a percentage?",
      format: "**",
      accept: ["25", "25%"],
      explain: "30 ÷ 120 = 0.25, or 25%.",
    },
  ],
};
