import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Start a vLLM server and call it with an OpenAI client",
    "Explain how PagedAttention raises concurrency",
    "Estimate concurrency from memory settings",
    "Tune the main server settings and monitor the right signals",
  ],
  tasks: [
    {
      id: "why-vllm",
      title: "What vLLM gives you",
      body: (
        <>
          <p>
            Writing your own server means solving batching, KV cache management, streaming and
            model support yourself. <strong>vLLM</strong> is an open-source engine that handles all
            of it. It began at UC Berkeley around one idea, PagedAttention, and it has grown into
            one of the most widely used ways to serve open models. It runs a broad range of models
            and has continuous batching built in.
          </p>
          <p>Starting a server takes one command:</p>
          <pre>
            <code>{`vllm serve Qwen/Qwen2.5-7B-Instruct \\
  --dtype auto \\
  --max-model-len 8192 \\
  --gpu-memory-utilization 0.9 \\
  --port 8000`}</code>
          </pre>
          <p>
            The server speaks the OpenAI API, so existing client code works by changing the base
            URL:
          </p>
          <pre>
            <code>{`from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")

stream = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "What is a KV cache?"}],
    max_tokens=128,
    stream=True,
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`}</code>
          </pre>
          <p>For batch work, skip the network and call the engine from Python:</p>
          <pre>
            <code>{`from vllm import LLM, SamplingParams

llm = LLM(model="Qwen/Qwen2.5-7B-Instruct", max_model_len=8192)
params = SamplingParams(temperature=0.0, max_tokens=128)

for output in llm.generate(["The KV cache stores"], params):
    print(output.outputs[0].text)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "pagedattention",
      title: "PagedAttention: why concurrency jumps",
      body: (
        <>
          <p>
            The KV cache grows as a response is generated, and you don't know its final size. A
            naive server reserves one contiguous space for the longest possible request. Most
            requests never use it, so memory sits idle.
          </p>
          <p>
            <strong>PagedAttention</strong> borrows from operating systems. Virtual memory gives
            programs fixed-size pages that needn't sit next to each other. In the same way, vLLM
            splits KV memory into fixed <strong>blocks</strong>, 16 tokens each by default on GPUs,
            and gives them out only as needed. A small table maps each request's tokens to blocks.
          </p>
          <p>
            Picture a car park. The naive way reserves a whole row for each car in case a fleet
            turns up. Paging gives out spaces one at a time, wherever they're free.
          </p>
          <p>
            Take a model that uses 0.5 MiB of KV cache per token, an 8,192-token limit, and
            requests that reach 600 tokens:
          </p>
          <pre>
            <code>{`Naive reservation:  8,192 × 0.5 MiB = 4,096 MiB = 4 GiB
Paged blocks:       600 ÷ 16 = 37.5, rounded up to 38 blocks
Paged memory:       38 × 16 × 0.5 MiB = 304 MiB`}</code>
          </pre>
          <p>Now see what that means for an 80 GiB GPU with 30 GiB of weights:</p>
          <Formula>KV budget = GPU memory × memory fraction − weights − overhead</Formula>
          <pre>
            <code>{`Budget:      80 GiB × 0.9 − 30 GiB = 42 GiB (ignoring overhead)
Naive:       42 GiB ÷ 4 GiB = 10 requests
Paged:       42 × 1,024 MiB ÷ 304 MiB ≈ 141 requests`}</code>
          </pre>
          <p>
            That's the best case, where all requests stay short, and compute may limit you before
            memory does. It still shows why paging changes capacity so much. The cost is that
            memory is no longer contiguous, so attention kernels must read through that block table.
          </p>
          <Callout tone="note">
            Blocks also make prefix caching natural. If two requests begin with identical tokens,
            they can point to the same full blocks. vLLM identifies these by hashing the block
            contents, chained with the blocks before them.
          </Callout>
        </>
      ),
    },
    {
      id: "settings",
      title: "The settings that matter",
      body: (
        <>
          <Table
            head={["Option", "What it controls", "Effect of raising it"]}
            rows={[
              ["--max-model-len", "Longest prompt plus output", "Longer requests, lower worst-case concurrency"],
              ["--gpu-memory-utilization", "Share of GPU memory for weights and cache, default 0.9", "More cache, higher out-of-memory risk"],
              ["--max-num-seqs", "Most requests per step", "More throughput, slower per user"],
              ["--max-num-batched-tokens", "Most tokens per step", "More work per step, longer steps"],
              ["--tensor-parallel-size", "GPUs that split one model", "Fits larger models, adds communication"],
            ]}
          />
          <Callout tone="warn">
            Set <code>--max-model-len</code> yourself. The default comes from the model's config,
            and that value can be very large. A big limit can cut your worst-case concurrency, or
            stop the server from starting at all. Choose the longest context your product needs.
          </Callout>
          <p>
            At startup, vLLM logs how much KV cache it allocated and the maximum concurrency that
            allows at your length limit. Read that line, because it's a free capacity estimate.
          </p>
          <Callout tone="tip">
            If a neighboring process shares the GPU, lower <code>--gpu-memory-utilization</code>.
            It's a fraction of the whole GPU, not a fraction of what happens to be free.
          </Callout>
        </>
      ),
    },
    {
      id: "operating",
      title: "Running it in production",
      body: (
        <>
          <p>
            vLLM exposes Prometheus metrics at <code>/metrics</code>, where a monitoring system can
            collect them. Three signals tell you most of what you need:
          </p>
          <Table
            head={["Signal", "Example metric", "What it tells you"]}
            rows={[
              ["Queue depth", "vllm:num_requests_waiting", "Rising and staying up means you lack capacity"],
              ["Active requests", "vllm:num_requests_running", "How much the engine is batching"],
              ["KV cache usage", "Name varies by release", "Near full means preemption is close"],
            ]}
          />
          <p>
            When the cache fills, vLLM preempts requests, usually by freeing their blocks and
            recomputing them later. That protects the server but costs latency. If preemption is
            common, reduce concurrency or add capacity.
          </p>
          <p>A healthy tuning sequence looks like this:</p>
          <ol>
            <li>Set <code>--max-model-len</code> from real product needs.</li>
            <li>Read the logged concurrency estimate.</li>
            <li>Run a load test with realistic prompt and output lengths.</li>
            <li>Raise limits until your latency targets start to slip, then back off.</li>
          </ol>
          <p>
            Option names and defaults change between releases, so run{" "}
            <code>vllm serve --help</code> on your installed version.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "vLLM provides an OpenAI-compatible server plus a Python API for offline work.",
    "PagedAttention allocates the KV cache in blocks rather than reserving the worst case.",
    "Usable cache is what remains of the memory fraction after weights and overhead.",
    "Always set a maximum length that matches your product's real needs.",
    "Watch queue depth and cache usage, because a full cache leads to preemption.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What idea does PagedAttention borrow from operating systems?",
      options: [
        "Process scheduling",
        "Virtual memory paging",
        "File permissions",
        "Disk defragmentation",
      ],
      answer: 1,
      explain: "It uses fixed-size blocks that needn't be contiguous, like memory pages.",
    },
    {
      kind: "mcq",
      q: "Which signal warns you that preemption is near?",
      options: [
        "Tokenizer version",
        "KV cache usage close to full",
        "Prompt language",
        "Server port number",
      ],
      answer: 1,
      explain: "Preemption happens when requests need more cache blocks than are free.",
    },
    {
      kind: "text",
      q: "With 16-token blocks, how many blocks does a 1,000-token request need?",
      format: "**",
      accept: ["63"],
      explain: "1,000 ÷ 16 = 62.5, which rounds up to 63 whole blocks.",
    },
    {
      kind: "text",
      q: "A 48 GiB GPU uses a memory fraction of 0.9 and has 18 GiB of weights. Ignoring overhead, how many GiB remain for KV cache?",
      format: "****",
      accept: ["25.2", "25.2 gib", "25.2gib"],
      explain: "48 × 0.9 = 43.2, then 43.2 − 18 = 25.2 GiB.",
    },
  ],
};
