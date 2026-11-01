import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain why KV cache storage is tiered",
    "Compare reload time with recompute time for each tier",
    "Decide when offloading a cache is worthwhile",
    "Plan for eviction, invalidation and data safety",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            GPU memory is the most expensive memory in the building, and the KV cache eats it
            quickly. When memory runs out, the engine has to evict something. A freed block is gone,
            so the next request needing that prefix pays for a full prefill.
          </p>
          <p>
            Meanwhile, the same server has hundreds of gigabytes of idle CPU memory and terabytes of
            fast disk. Why not keep the cache there instead of throwing it away?
          </p>
          <p>
            That's <strong>KV cache tiering</strong>. Think of a kitchen. Ingredients you're using now
            sit on the counter. Tonight's sit in the fridge. Next week's are in the pantry, and bulk
            supplies are in the warehouse down the road. Each step away holds more but takes longer to
            reach.
          </p>
        </>
      ),
    },
    {
      id: "tiers",
      title: "The storage tiers",
      body: (
        <>
          <Table
            head={["Tier", "Capacity", "Speed", "Role"]}
            rows={[
              ["GPU memory", "Smallest", "Fastest", "Active requests; caches being decoded"],
              ["CPU memory (DRAM)", "Medium", "Fast", "Idle sessions, recent prefixes"],
              ["Local NVMe SSD", "Large", "Moderate", "Warm prefixes on this machine"],
              ["Network storage", "Largest", "Depends on network", "Shared across machines"],
            ]}
          />
          <p>
            The GPU can only compute with data in its own memory, so anything stored lower down has
            to travel back up before use. That trip is a reload, and it has a cost.
          </p>
          <p>
            A cache in a lower tier isn't useful for active decoding. Each decode step reads the
            whole cache, so it has to live in GPU memory. Tiering suits <strong>idle</strong> data:
            a chat waiting for the user's next message, or a popular system prompt between uses.
          </p>
        </>
      ),
    },
    {
      id: "math",
      title: "Reload or recompute?",
      body: (
        <>
          <p>
            Storing a cache only pays if loading it beats making it again. The test is simple:
          </p>
          <Formula>offload if size ÷ bandwidth + overhead is under tokens ÷ prefill rate</Formula>
          <p>
            Take a 4 GB cache for an 8,000-token prefix. Prefill runs at 5,000 tokens per second, so
            recomputing costs 1.6 seconds. All speeds below are illustrative, and real values depend
            on your hardware and on how busy it is.
          </p>
          <Table
            head={["Source", "Bandwidth", "Time for 4 GB", "Against 1.6 s recompute"]}
            rows={[
              ["CPU memory", "50 GB/s", "0.08 s", "20× faster"],
              ["Network storage", "10 GB/s", "0.4 s", "4× faster"],
              ["Local NVMe", "5 GB/s", "0.8 s", "2× faster"],
            ]}
          />
          <p>
            The result flips for short prefixes, since both sides shrink but overhead stays. With a
            fixed 5 ms lookup, take a 100-token prefix, or 50 MB of cache by the same ratio. From
            NVMe: 0.05 ÷ 5 + 0.005 = 0.015 s. Recompute: 100 ÷ 5,000 = 0.02 s. That's nearly a tie,
            and writing to disk also had a cost.
          </p>
          <pre>
            <code>{`def should_offload(tokens, gb_per_token, bandwidth_gb_per_s,
                   overhead_s, prefill_tokens_per_s):
    reload_s = tokens * gb_per_token / bandwidth_gb_per_s + overhead_s
    recompute_s = tokens / prefill_tokens_per_s
    return reload_s < recompute_s

# 8,000 tokens at 0.0005 GB per token, from NVMe
should_offload(8_000, 0.0005, 5, 0.005, 5_000)  # True: 0.805 s vs 1.6 s`}</code>
          </pre>
          <p>
            Two more points change the picture. Prefill speed isn't fixed: a loaded GPU recomputes
            more slowly and steals time from other requests, which favors reloading. A reload uses
            little compute, so it may also free the GPU to do other work.
          </p>
        </>
      ),
    },
    {
      id: "management",
      title: "Managing the tiers",
      body: (
        <>
          <p>A tiered cache needs answers to four questions:</p>
          <ul>
            <li>
              <strong>What gets demoted?</strong> Least recently used (LRU) blocks are the usual
              choice. Blocks shared by many requests deserve more protection.
            </li>
            <li>
              <strong>When is it written?</strong> Copying a cache only as it's evicted adds no
              extra traffic, but the memory can't be freed until the copy finishes. Copying in the
              background costs bandwidth but makes eviction instant.
            </li>
            <li>
              <strong>When is it promoted?</strong> Load it back on a hit. Some systems preload it if
              they expect a returning session.
            </li>
            <li>
              <strong>When is it invalid?</strong> A KV cache is tied to one exact setup.
            </li>
          </ul>
          <Callout tone="warn">
            A stored cache is valid only for the same model weights, quantization, data type,
            tokenizer and cache layout. Include all of these in the key, and treat a model or engine
            upgrade as a full invalidation. Loading a mismatched cache can quietly produce bad output
            instead of an error.
          </Callout>
          <p>
            Open-source and vendor tools build on this. LMCache provides a KV cache layer for engines
            such as vLLM. NVIDIA Dynamo manages KV blocks across memory tiers in a cluster. SGLang
            and Mooncake have their own approaches to multi-tier and shared caches. This area moves
            quickly, so check current support for your engine.
          </p>
        </>
      ),
    },
    {
      id: "value",
      title: "Is it worth it?",
      body: (
        <>
          <p>Storage only pays if blocks get reused while they're still valid:</p>
          <Formula>value per stored block = reuse chance × compute saved − storage and transfer cost</Formula>
          <p>
            Long agent sessions, shared documents and repeated system prompts all reuse heavily.
            One-off questions with unique prompts don't. Writing them to disk just wears out the SSD.
            Set size limits, and measure hit rate by tier.
          </p>
          <p>
            Network storage has an extra benefit. A cache written by one server can be read by
            another, so a hit isn't limited to one machine. That connects directly to the next
            lesson, Cache-Aware Routing.
          </p>
          <Callout tone="note" title="It's user data">
            A KV cache is derived from prompts, and it may let someone recover information about
            them. Don't treat it as harmless numbers. Apply the same encryption, access limits,
            retention rules and tenant separation you use for the prompts themselves, especially on
            disk or shared storage.
          </Callout>
          <Callout tone="tip">
            Add tiers one at a time. Start with CPU memory, as it's the fastest and simplest. Add
            NVMe if your idle cache outgrows it, and only add shared storage when you can show
            cross-machine reuse.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Tiers keep idle KV data in cheaper, larger memory instead of throwing it away.",
    "Active decoding needs the cache in GPU memory, so tiers hold idle data.",
    "Offload only when reloading beats recomputing, including overhead.",
    "Reuse decides the value of a stored cache, so measure hit rate by tier.",
    "Stored caches are tied to one exact setup and should be treated as user data.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why can't active decoding read its KV cache straight from NVMe?",
      options: [
        "NVMe drives can't store floats",
        "Each step reads the whole cache, so it must be in fast GPU memory",
        "The tokenizer forbids it",
        "Disks are read-only during decode",
      ],
      answer: 1,
      explain: "Decode reads the whole cache at every step, so disk speed would ruin token rates.",
    },
    {
      kind: "mcq",
      q: "Which change must invalidate a stored KV cache?",
      options: [
        "The user changes their display name in the UI",
        "The model's quantization changes",
        "The server's clock moves one minute",
        "Another request finishes",
      ],
      answer: 1,
      explain: "Different weights or precision give different keys and values, so the old cache doesn't apply.",
    },
    {
      kind: "text",
      q: "A 6 GB cache is read at 12 GB/s. How many seconds does the reload take?",
      format: "***",
      accept: ["0.5", ".5", "0.50"],
      explain: "6 ÷ 12 = 0.5 s.",
    },
    {
      kind: "text",
      q: "A 10,000-token prefix prefills at 5,000 tokens per second. How many seconds does recomputing it take?",
      format: "*",
      accept: ["2", "2.0"],
      explain: "10,000 ÷ 5,000 = 2 s.",
    },
  ],
};
