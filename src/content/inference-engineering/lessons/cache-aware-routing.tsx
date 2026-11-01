import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain why ordinary load balancing lowers prefix cache hit rate",
    "Compare consistent hashing with prefix-aware routing",
    "Trade cache affinity against load using an estimated TTFT",
    "Handle hot prefixes and scaling events",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Prefix caches live on individual replicas. A <strong>replica</strong> is one running copy
            of the model, and a load balancer spreads requests across them. Standard load balancers
            know nothing about prompts. Round-robin simply sends each request to the next replica.
          </p>
          <p>
            Picture a long chat with 10 replicas behind round-robin. Turn 1 fills the cache on replica
            3. Turn 2 lands on replica 4, which has nothing, so the whole conversation is prefilled
            again. Turn 3 lands on replica 5. There's a chance of about 1 in 10 of landing on a
            replica that holds it, assuming only one does. The cache works. It just isn't where the
            request goes.
          </p>
          <p>
            <strong>Cache-aware routing</strong> sends a request to the replica most likely to hold
            its prefix. It's like calling the same doctor who already has your notes, so you don't
            have to explain your history from the start.
          </p>
        </>
      ),
    },
    {
      id: "methods",
      title: "Routing methods",
      body: (
        <>
          <Table
            head={["Method", "How it decides", "Strength", "Weakness"]}
            rows={[
              ["Round-robin", "Next replica in turn", "Even load", "Ignores caches"],
              ["Session affinity", "Same session, same replica", "Simple, good for chat", "Misses shared prefixes"],
              ["Consistent hashing", "Hash of a prefix or ID", "Needs no shared state", "Blind to load"],
              ["Prefix tree", "Longest match per replica", "Most accurate", "Router tracks more state"],
            ]}
          />
          <p>
            <strong>Consistent hashing</strong> places replicas and keys on a ring, and each key goes
            to the next replica along it. Its big advantage is how it behaves during scaling.
            Compare it with plain <code>hash % n</code> when going from 4 replicas to 5:
          </p>
          <pre>
            <code>{`hash % n:            a key stays only if hash % 4 == hash % 5
                     that's 4 of every 20 keys, so 80% move
consistent hashing:  only the new replica's share moves, about 1 in 5, or 20%`}</code>
          </pre>
          <p>
            When a key moves, its cache doesn't come with it, so it's a guaranteed miss. Fewer moves
            mean fewer cold starts.
          </p>
          <p>
            A <strong>prefix tree</strong>, or radix tree, stores prefixes the router has seen, per
            replica. A new prompt walks the tree to find the replica with the longest match. The
            router's tree is an approximation, since it can't see every eviction inside each engine.
            Some systems close this gap by having engines report cache events to the router. NVIDIA
            Dynamo works in this direction, and SGLang's router and projects such as llm-d offer
            prefix-aware policies.
          </p>
        </>
      ),
    },
    {
      id: "tradeoff",
      title: "Affinity against load",
      body: (
        <>
          <p>
            Always chasing the longest match creates a new problem. Popular prefixes pile onto one
            replica, and its queue grows while others sit idle. A cache hit is no use if it comes
            after a long wait.
          </p>
          <p>
            So compare replicas by what the user feels. Estimate TTFT for each one:
          </p>
          <Formula>estimated TTFT = queue wait + uncached tokens ÷ prefill rate</Formula>
          <p>
            Take a 4,000-token prompt, a prefill rate of 5,000 tokens per second, and an illustrative
            wait of 0.3 s per queued request.
          </p>
          <pre>
            <code>{`Replica A: 3,800 tokens cached, 6 requests queued
  wait = 6 × 0.3 = 1.8 s
  prefill = 200 ÷ 5,000 = 0.04 s
  total = 1.84 s

Replica B: nothing cached, 1 request queued
  wait = 1 × 0.3 = 0.3 s
  prefill = 4,000 ÷ 5,000 = 0.8 s
  total = 1.1 s`}</code>
          </pre>
          <p>
            B wins, despite the miss. If A's queue held only 2 requests, A's estimate would be 0.64
            s, and it would win instead. A good router makes this call for every request.
          </p>
          <pre>
            <code>{`from dataclasses import dataclass

@dataclass
class Replica:
    name: str
    matched_tokens: int
    queued: int

def estimated_ttft(r, prompt_tokens, prefill_rate=5_000, wait_per_request=0.3):
    uncached = prompt_tokens - r.matched_tokens
    return r.queued * wait_per_request + uncached / prefill_rate

def choose(replicas, prompt_tokens):
    return min(replicas, key=lambda r: estimated_ttft(r, prompt_tokens))

replicas = [Replica("a", 3_800, 6), Replica("b", 0, 1)]
print(choose(replicas, 4_000).name)  # b`}</code>
          </pre>
          <p>
            This sketch ignores a second-order benefit: sending traffic to B also fills B's cache, so
            a popular prefix spreads. That's often good.
          </p>
        </>
      ),
    },
    {
      id: "edges",
      title: "Edge cases",
      body: (
        <>
          <p>
            <strong>Hot prefixes.</strong> One huge customer's system prompt may be more than a
            single replica can serve. Let it spread to several replicas, then stop. Bounded-load
            consistent hashing does something similar by capping how far above average any replica
            can go, and passing the overflow along.
          </p>
          <p>
            <strong>Tokens or characters?</strong> Exact matching needs the same tokens the engine
            will use, so the router may have to tokenize the prompt, which uses CPU. Others match on
            raw text, which is cheaper but less exact.
          </p>
          <p>
            <strong>Scaling and restarts.</strong> A new replica starts cold. An exiting replica
            takes its cache with it. Warm new replicas with common prefixes, or use a shared storage
            tier, as described in KV Cache Storage.
          </p>
          <p>
            <strong>Failures.</strong> If the router's state vanishes, it must still route. Fall back
            to least-loaded or consistent hashing, so a router restart costs hit rate and not
            availability.
          </p>
          <Callout tone="warn">
            Watch both sides of the trade. Track hit rate and tokens saved, but also the gap in queue
            length between your busiest and quietest replicas. High hit rates with a growing p99 TTFT
            mean affinity is too strong.
          </Callout>
          <Callout tone="tip">
            Start simple. Session affinity with a load limit gets much of the benefit for chat
            products. Add prefix-tree routing when many users share long prefixes or when you've got
            a large fleet.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Prefix caches are local to replicas, so unaware load balancing wastes them.",
    "Session affinity, consistent hashing and prefix trees increase hit rate in different ways.",
    "Consistent hashing moves far fewer keys than hash modulo n during scaling.",
    "Pick replicas by estimated TTFT, weighing queue wait against uncached prefill.",
    "Bound hot prefixes, and always keep a stateless fallback.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does a pure longest-match router cause trouble?",
      options: [
        "It never produces cache hits",
        "It overloads replicas holding popular prefixes",
        "It disables the KV cache",
        "It changes the model's output",
      ],
      answer: 1,
      explain: "Queue wait can exceed the prefill saved, so load must be part of the decision.",
    },
    {
      kind: "mcq",
      q: "Which method moves the fewest keys when a replica is added?",
      options: ["hash % n", "Consistent hashing", "Random assignment", "Round-robin"],
      answer: 1,
      explain: "Consistent hashing only moves keys that belong on the new replica.",
    },
    {
      kind: "text",
      q: "Replica has 2 requests queued at 0.5 s each, plus 1,000 uncached tokens at 5,000 tokens per second. Estimated TTFT in seconds?",
      format: "***",
      accept: ["1.2", "1.20"],
      explain: "2 × 0.5 + 1,000 ÷ 5,000 = 1 + 0.2 = 1.2 s.",
    },
    {
      kind: "text",
      q: "With consistent hashing, about what percentage of keys move when growing from 9 replicas to 10?",
      format: "**",
      accept: ["10", "10%"],
      explain: "The new replica takes about 1 in 10 of the keys, which is 10%.",
    },
  ],
};
