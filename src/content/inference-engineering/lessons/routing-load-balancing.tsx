import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Explain why request count is a poor measure of LLM load",
    "Compare round robin, least-loaded, power of two choices and cache-aware routing",
    "Estimate the prefill time saved by routing to a cached prefix",
    "Avoid common failures with streaming and stale load data",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Once you have several replicas, something must decide which one gets each request.
            The classic answer for web traffic is <strong>round robin</strong>: take turns. It works
            when requests are similar, as with short API calls that each take a few milliseconds.
          </p>
          <p>
            LLM requests aren't similar. One user asks for a one-line answer. Another pastes a
            50-page contract and wants a long summary. Those two requests can differ by a thousand
            times in the work they create, and the router can't see that if it only counts them.
          </p>
          <p>
            Imagine a restaurant host who seats groups by strict rotation, one table to each waiter.
            A party of two goes to Ana. A party of twelve goes to Ben. A party of two goes to Ana,
            and another twelve go to Ben. Both have two tables, but Ben is drowning and Ana is bored.
            Equal counts aren't equal work.
          </p>
        </>
      ),
    },
    {
      id: "why-round-robin-fails",
      title: "Round robin, with numbers",
      body: (
        <>
          <p>Four requests go to two replicas, in order. Token counts here are illustrative.</p>
          <Table
            head={["Request", "Total tokens", "Replica"]}
            rows={[
              ["1", "10,000", "A"],
              ["2", "100", "B"],
              ["3", "10,000", "A"],
              ["4", "100", "B"],
            ]}
          />
          <p>
            Each replica got two requests, so the load looks perfectly even. But A holds 20,000
            tokens and B holds 200, which is 100 times more. A's KV cache is under pressure and its
            users see slow tokens, while B sits nearly idle. Round robin split the traffic evenly and
            still produced a very uneven cluster.
          </p>
          <p>
            The mismatch doesn't need to be unlucky. A single bursty customer with a long prompt
            pattern can keep it going.
          </p>
        </>
      ),
    },
    {
      id: "strategies",
      title: "Better strategies",
      body: (
        <>
          <Table
            head={["Strategy", "How it picks", "Weakness"]}
            rows={[
              ["Round robin", "Next replica in order", "Ignores all load"],
              ["Least outstanding requests", "Replica with fewest active requests", "Treats a huge and a tiny request as the same"],
              ["Token-weighted", "Replica with the fewest estimated pending tokens", "Output length is only a guess"],
              ["Power of two choices", "Sample two replicas, take the less loaded", "Needs a load measure, but stays cheap"],
              ["Cache-aware", "Replica that already holds the prompt prefix", "Can pile traffic on one replica if unbounded"],
            ]}
          />
          <p>
            <strong>Power of two choices</strong> deserves attention. Checking every replica sounds
            best, but it has a flaw. If load data is a few seconds old, all routers see the same
            "emptiest" replica and rush it at once. Picking two at random and taking the better one
            spreads requests out, and it still gets most of the benefit of checking all of them.
          </p>
          <pre>
            <code>{`import random

def estimated_load(replica):
    # Output tokens stay in memory and run for many steps, so weight them higher.
    return replica.pending_prompt_tokens + 4 * replica.pending_output_tokens

def pick(replicas):
    a, b = random.sample(replicas, 2)
    return a if estimated_load(a) <= estimated_load(b) else b`}</code>
          </pre>
          <p>
            The weight of 4 is an example, not a standard. Tune it from your own measurements. For
            output, you don't know the real length ahead of time, so estimate it using{" "}
            <code>max_tokens</code> or a typical length for that customer.
          </p>
        </>
      ),
    },
    {
      id: "cache-aware",
      title: "Routing for the prefix cache",
      body: (
        <>
          <p>
            Replicas aren't interchangeable once they've served traffic. Each one keeps KV blocks
            for recent prompts, so a request that shares a prefix with an earlier one can skip part
            of prefill. This is prefix caching, and it only helps if the request lands on the
            replica that holds that prefix.
          </p>
          <p>Say prefill runs at 6,000 tokens per second, an illustrative rate, and a request has a 3,000-token shared system prompt plus 60 new tokens:</p>
          <pre>
            <code>{`Cache miss:  3,060 ÷ 6,000 ≈ 0.51 s of prefill
Cache hit:      60 ÷ 6,000 = 0.01 s of prefill`}</code>
          </pre>
          <p>
            That's 500 ms of saved first-token latency, and 500 ms of GPU time returned to the
            cluster on every hit. On long-prompt workloads, this can be one of the largest wins
            available.
          </p>
          <p>
            But cache affinity fights load balance. If you always follow the cache, a popular prompt
            overwhelms one replica. So real routers score both:
          </p>
          <Formula>score = cache match × weight − current load × weight</Formula>
          <p>
            A common pattern is to prefer the cached replica unless it's overloaded by a set margin,
            then fall back to the least loaded replica. That replica then builds its own copy of the
            prefix, which spreads popular prompts across the fleet. The lesson on Cache-Aware Routing
            covers this in more depth.
          </p>
        </>
      ),
    },
    {
      id: "pitfalls",
      title: "Streaming and other traps",
      body: (
        <>
          <p>
            Layer 4 load balancers work on connections, and they don't read requests. That's a
            problem for HTTP/2 and gRPC, which send many requests down one long-lived connection.
            All of them follow the first choice, so one replica can receive a client's entire load.
            Use a <strong>layer 7</strong> proxy that picks a replica for each request.
          </p>
          <ul>
            <li>
              <strong>Buffering:</strong> proxies may hold a response until it's complete, which ruins
              streaming. In NGINX, set <code>proxy_buffering off</code> for these routes.
            </li>
            <li>
              <strong>Timeouts:</strong> long responses can outlive default proxy timeouts. Set them
              with your longest reasonable response in mind.
            </li>
            <li>
              <strong>Stale data:</strong> a metrics scrape every 15 seconds is too slow for routing.
              Have the router count what it has sent and what has finished.
            </li>
            <li>
              <strong>Failed replicas:</strong> a broken replica finishes requests instantly, so it
              looks empty and attracts more traffic. Treat a high error rate as unhealthy.
            </li>
          </ul>
          <Callout tone="warn">
            That last failure is called a black hole. A least-loaded router will happily send
            everything to the replica that's failing fastest. Add health checks that test real
            inference, not just that a port responds.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "LLM requests vary hugely in cost, so equal request counts don't mean equal load.",
    "Token-weighted load is a better signal than active request count.",
    "Power of two choices avoids herding on stale data at a very low cost.",
    "Cache-aware routing cuts prefill, but it must stay bounded by load.",
    "Use a layer 7 proxy, disable response buffering, and watch for fast-failing replicas.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does round robin perform poorly for LLM traffic?",
      options: [
        "It's too slow to compute",
        "Requests vary widely in cost, but it spreads them by count",
        "It can't work with HTTP",
        "It needs a GPU to run",
      ],
      answer: 1,
      explain: "Two replicas can receive the same number of requests with very different token loads.",
    },
    {
      kind: "text",
      q: "Prefill runs at 6,000 tokens per second. How many milliseconds does a 3,000-token prefill take on a cache miss?",
      format: "***",
      accept: ["500", "500ms"],
      explain: "3,000 ÷ 6,000 = 0.5 seconds, which is 500 ms.",
    },
    {
      kind: "mcq",
      q: "What's the main benefit of power of two choices over always picking the globally least loaded replica?",
      options: [
        "It avoids everyone rushing one replica on stale load data",
        "It removes the need for health checks",
        "It always finds the emptiest replica",
        "It works without any replicas",
      ],
      answer: 0,
      explain: "Randomly sampling two spreads requests out, even when load information lags.",
    },
    {
      kind: "mcq",
      q: "A replica is failing every request instantly. Why might a least-loaded router send it more traffic?",
      options: [
        "It has a larger GPU",
        "Its requests finish fast, so it looks idle",
        "Routers prefer errors",
        "Its cache is full",
      ],
      answer: 1,
      explain: "This black hole effect is why error rates must feed into health decisions.",
    },
  ],
};
