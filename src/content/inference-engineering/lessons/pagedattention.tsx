import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why reserving KV cache up front wastes GPU memory",
    "Describe how blocks and block tables work",
    "Calculate the concurrency gain from paged allocation",
    "Explain sharing, copy-on-write and preemption",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: reserving for the worst case",
      body: (
        <>
          <p>
            The KV cache grows as a response is generated, and you don't know in advance how long
            that response will be. A simple engine solves this by reserving one contiguous stretch
            of memory per request, big enough for the maximum length.
          </p>
          <p>
            Most requests never reach that maximum. A short question with an 8,000-token limit
            might use only a few hundred tokens, yet it holds memory for all 8,000. The GPU looks
            full while much of its cache memory sits empty. New requests wait in a queue for space
            that's reserved but unused.
          </p>
          <p>
            <strong>PagedAttention</strong>, introduced with the vLLM engine, fixes this by
            borrowing an old idea from operating systems: virtual memory. Programs see one long
            address space, but the OS maps it onto scattered fixed-size pages of physical memory.
          </p>
          <Callout tone="note">
            Think of a hotel. The old way books a whole floor for each guest in case friends turn
            up. The paged way gives out one room at a time, as guests arrive. The rooms don't need
            to be next to each other, because the front desk keeps a list.
          </Callout>
        </>
      ),
    },
    {
      id: "blocks",
      title: "Blocks and block tables",
      body: (
        <>
          <p>
            At startup, the engine divides free GPU memory into many same-sized{" "}
            <strong>blocks</strong>. Each block holds the keys and values for a small number of
            tokens. vLLM has long used a default of 16 tokens per block, though you should check
            your version.
          </p>
          <p>
            Each request gets a <strong>block table</strong>: an ordered list saying which physical
            block holds which run of its tokens. A request's blocks can sit anywhere in memory. A
            block is allocated only when the request needs it.
          </p>
          <pre>
            <code>{`Request A, 40 tokens, block size 16

Logical block:   0     1     2
Physical block:  7     1     3
Filled tokens:   16    16    8 (8 slots free)`}</code>
          </pre>
          <p>
            When the attention kernel runs, it follows the table to gather keys and values from
            those scattered blocks. This doesn't conflict with FlashAttention, because the two
            solve different problems. Paging decides where the cache lives. A fast kernel decides
            how the math runs, and it can read through the block table.
          </p>
          <Table
            head={["", "Smaller blocks", "Larger blocks"]}
            rows={[
              ["Wasted space in the last block", "Less", "More"],
              ["Table size and lookups", "More", "Fewer"],
              ["Chance of sharing a prefix", "Higher", "Lower"],
            ]}
          />
          <p>
            The only waste is the unused tail of each request's last block, called internal
            fragmentation. On average that's about half a block per request, which is tiny compared
            with reserving a full maximum-length cache.
          </p>
        </>
      ),
    },
    {
      id: "arithmetic",
      title: "Worked example: the concurrency gain",
      body: (
        <>
          <p>
            Use the example model from the KV Cache lesson: 32 layers, hidden size 4,096, 2 bytes
            per value. Assume full multi-head attention.
          </p>
          <Formula>bytes per token = 2 × 32 × 4,096 × 2 = 524,288 bytes = 0.5 MiB</Formula>
          <p>
            A 16-token block is therefore 8 MiB. Say 50 GiB (51,200 MiB) is left after weights and
            overhead, the limit is 8,000 tokens, and the average request really uses 1,500 tokens.
            These figures are illustrative.
          </p>
          <pre>
            <code>{`Reserve the worst case:
  8,000 × 0.5 MiB = 4,000 MiB per request
  51,200 ÷ 4,000 = 12.8, so 12 requests

Paged:
  1,500 ÷ 16 = 93.75, so 94 blocks
  94 × 8 MiB = 752 MiB per request
  51,200 ÷ 752 = 68.1, so about 68 requests`}</code>
          </pre>
          <p>
            That's roughly five to six times more concurrent requests on the same GPU in this
            example. Your gain depends on how far the average request falls below the maximum. If
            every request really does use its whole limit, paging gives you almost nothing.
          </p>
          <p>
            More concurrency isn't free, because each extra request also adds work to every step.
            Paging removes the memory wall. The compute and bandwidth limits remain.
          </p>
        </>
      ),
    },
    {
      id: "sharing",
      title: "Sharing blocks",
      body: (
        <>
          <p>
            Once memory is a table of references, two requests can point at the same physical
            block. That opens up savings beyond better packing.
          </p>
          <ul>
            <li>
              <strong>Parallel sampling:</strong> asking for four completions of one prompt doesn't
              need four copies of the prompt's cache. All four share its blocks.
            </li>
            <li>
              <strong>Beam search:</strong> beams share their common history and only pay for what
              differs.
            </li>
            <li>
              <strong>Prefix caching:</strong> requests with the same system prompt reuse the same
              full blocks. Engines identify a block by a hash of its tokens and everything before
              them.
            </li>
          </ul>
          <p>
            Shared blocks use <strong>copy-on-write</strong>. Each block has a reference count. If
            a request needs to write to a block that others also use, the engine copies it first
            and points that request at the copy. Reads stay shared, and only real differences cost
            memory.
          </p>
        </>
      ),
    },
    {
      id: "operating",
      title: "Running it: limits, preemption and monitoring",
      body: (
        <>
          <p>
            Paged allocation lets an engine admit more work than could fit if every request ran
            to its limit. So memory can still run out. When no free blocks remain, the engine
            picks a request to <strong>preempt</strong>, usually the most recent one, and frees its
            blocks. There are two ways to resume it:
          </p>
          <Table
            head={["Method", "How it works", "Cost"]}
            rows={[
              ["Recompute", "Drop the blocks and rerun prefill on all its tokens later", "GPU time"],
              ["Swap", "Copy the blocks to CPU memory and bring them back later", "CPU memory and transfer time"],
            ]}
          />
          <p>You control the pool size when starting vLLM:</p>
          <pre>
            <code>{`vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --max-model-len 8192 \\
  --gpu-memory-utilization 0.90`}</code>
          </pre>
          <p>
            Here <code>--gpu-memory-utilization</code> is the share of GPU memory vLLM may use for
            weights and cache, and <code>--max-model-len</code> caps prompt plus output. At startup,
            vLLM logs the KV cache size and the maximum concurrency for full-length requests. Read
            that line: it's your worst-case figure, and real concurrency is often higher.
          </p>
          <Callout tone="warn">
            Preemption causes sudden latency spikes. A request near the end of a long response may
            be evicted and have to redo all of its work. Alert on KV cache usage and on preemption
            counts, not just on GPU utilization. vLLM's Prometheus metrics expose both, though
            metric names change between versions.
          </Callout>
          <Callout tone="tip">
            Set the max length to what your product needs, not the model's largest value. Long
            limits raise worst-case memory and make preemption more likely.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Reserving maximum-length caches strands memory that requests never use.",
    "PagedAttention allocates fixed-size blocks on demand and tracks them in a block table.",
    "The gain depends on how far average usage sits below the maximum.",
    "Blocks can be shared across requests, with copy-on-write when they diverge.",
    "When blocks run out, the engine preempts requests, so watch cache usage and preemptions.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which operating system idea inspired PagedAttention?",
      options: ["Process scheduling", "Virtual memory", "File permissions", "Interrupt handling"],
      answer: 1,
      explain: "Like OS pages, KV blocks are fixed-size and mapped through a table, so they can be scattered.",
    },
    {
      kind: "mcq",
      q: "When does paging give the smallest gain in concurrency?",
      options: [
        "When most requests are short",
        "When every request uses nearly its full length limit",
        "When the block size is 16 tokens",
        "When many requests share a system prompt",
      ],
      answer: 1,
      explain: "If real usage equals the worst case, then reserving and paging need about the same memory.",
    },
    {
      kind: "text",
      q: "Each token uses 0.5 MiB of KV cache and a block holds 32 tokens. How many MiB is one block?",
      format: "**",
      accept: ["16"],
      explain: "32 × 0.5 = 16 MiB.",
    },
    {
      kind: "text",
      q: "Requests sharing a block get their own copy only when one must write to it. What is this technique called?",
      format: "****-**-*****",
      accept: ["copy-on-write", "copy on write", "cow"],
      explain: "Copy-on-write keeps blocks shared until a real difference appears.",
    },
  ],
};
