import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Design a benchmark that reflects real traffic",
    "Separate closed-loop and open-loop load, and use Little's law",
    "Use AIPerf, Locust and genai-bench for the right jobs",
    "Turn a load sweep into a capacity number",
  ],
  tasks: [
    {
      id: "why-honest",
      title: "Most benchmarks answer the wrong question",
      body: (
        <>
          <p>
            A team sends one short prompt 100 times and reports great numbers. In production, with
            long prompts and bursts, the system falls over. The tool worked fine, but the test
            described a workload that doesn't exist.
          </p>
          <p>
            A good benchmark answers one specific question: <strong>how much traffic of this shape
            can we serve within our latency targets?</strong> A crash test is a fair comparison: it
            uses a set speed, a set barrier and a calibrated dummy. Change one, and the results
            mean something else.
          </p>
          <p>Fix these inputs before you start, and write them down:</p>
          <Table
            head={["Input", "Why it matters"]}
            rows={[
              ["Prompt length distribution", "Drives prefill time and KV cache use"],
              ["Output length distribution", "Drives decode load and how long slots stay busy"],
              ["Shared prefix share", "Cache hits can hide or create huge differences"],
              ["Streaming on or off", "You need streaming to measure time to first token"],
              ["Arrival pattern", "Bursts behave differently from a steady rate"],
              ["Latency target", "Defines what counts as a pass"],
            ]}
          />
          <Callout tone="warn">
            Sending the same prompt repeatedly tests the prefix cache, not the engine. Use varied
            prompts, sampled from real traffic where privacy rules allow, and report whether caching
            was on.
          </Callout>
          <p>
            Control output length too. If the model stops early, comparisons get muddied. Many tools
            set a fixed output length, and vLLM accepts an <code>ignore_eos</code> sampling option
            that keeps generating past the stop token.
          </p>
        </>
      ),
    },
    {
      id: "load-models",
      title: "Closed loop, open loop and Little's law",
      body: (
        <>
          <p>There are two ways to generate load, and they answer different questions.</p>
          <p>
            A <strong>closed-loop</strong> test keeps a fixed number of requests in flight. A new
            one starts only when another ends. If the server slows down, the load drops by itself,
            which hides trouble.
          </p>
          <p>
            An <strong>open-loop</strong> test sends requests at a set rate, whatever happens. Real
            users behave this way: they don't wait for your server to recover before arriving. If
            the server falls behind, the queue grows, and you see it.
          </p>
          <p>
            <strong>Little's law</strong> connects the two:
          </p>
          <Formula>requests in flight = arrival rate × time in system</Formula>
          <pre>
            <code>{`10 requests in flight, 2 s each:
  rate = 10 ÷ 2 = 5 requests/s

The server slows to 4 s each, still 10 in flight:
  rate = 10 ÷ 4 = 2.5 requests/s (load quietly halved)

Open loop at 5 requests/s, 4 s each:
  in flight = 5 × 4 = 20 (and growing as the queue builds)`}</code>
          </pre>
          <p>
            Use closed-loop runs for quick comparisons at a set concurrency. Use open-loop runs to
            answer capacity questions.
          </p>
        </>
      ),
    },
    {
      id: "tools",
      title: "Three tools",
      body: (
        <>
          <Table
            head={["Tool", "Best for", "Style"]}
            rows={[
              ["AIPerf", "Detailed LLM metrics from one command", "CLI from NVIDIA's AI Dynamo project"],
              ["genai-bench", "Comparing runs across scenarios, with reports", "CLI from the SGLang project"],
              ["Locust", "Custom user journeys and traffic logic", "General load tool, scripted in Python"],
            ]}
          />
          <p>
            <strong>AIPerf</strong> reports time to first token, inter-token latency, request
            latency and throughput, with percentiles:
          </p>
          <pre>
            <code>{`aiperf profile \\
  --model Qwen/Qwen2.5-7B-Instruct \\
  --tokenizer Qwen/Qwen2.5-7B-Instruct \\
  --url http://localhost:8000 \\
  --endpoint-type chat \\
  --streaming \\
  --concurrency 10 \\
  --request-count 1000`}</code>
          </pre>
          <p>
            <strong>genai-bench</strong> runs a series of tests and produces spreadsheet reports and
            plots across traffic scenarios and concurrency levels:
          </p>
          <pre>
            <code>{`genai-bench benchmark \\
  --api-backend openai \\
  --api-base http://localhost:8000 \\
  --api-key EMPTY \\
  --api-model-name Qwen/Qwen2.5-7B-Instruct \\
  --model-tokenizer Qwen/Qwen2.5-7B-Instruct \\
  --task text-to-text \\
  --max-time-per-run 5 \\
  --max-requests-per-run 500`}</code>
          </pre>
          <p>
            <strong>Locust</strong> knows nothing about LLMs, so you measure what you need yourself.
            In exchange, it can model a real session, such as a multi-turn chat with pauses:
          </p>
          <pre>
            <code>{`import time
from locust import HttpUser, task, between

class ChatUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def chat(self):
        body = {
            "model": "Qwen/Qwen2.5-7B-Instruct",
            "messages": [{"role": "user", "content": "Summarize KV caching."}],
            "max_tokens": 200,
            "stream": True,
        }
        start = time.perf_counter()
        first = None
        with self.client.post(
            "/v1/chat/completions", json=body, stream=True, name="chat"
        ) as response:
            for line in response.iter_lines():
                if first is None and line.startswith(b"data: "):
                    first = time.perf_counter()

        if first is not None:
            self.environment.events.request.fire(
                request_type="LLM",
                name="ttft",
                response_time=(first - start) * 1000,
                response_length=0,
                exception=None,
                context={},
            )`}</code>
          </pre>
          <pre>
            <code>{`locust -f locustfile.py --headless --users 50 --spawn-rate 5 \\
  --run-time 10m --host http://localhost:8000`}</code>
          </pre>
          <p>
            This sketch times the first stream chunk. A stricter script would wait for the first
            chunk with non-empty content, since some servers send a role-only chunk first.
          </p>
          <Callout tone="note">
            Check <code>--help</code> on your installed version, because options for these tools
            change. Also keep the options you used with your results.
          </Callout>
        </>
      ),
    },
    {
      id: "running",
      title: "Run it properly",
      body: (
        <>
          <p>A few habits separate real results from noise:</p>
          <ul>
            <li>
              <strong>Warm up first.</strong> Discard the opening period, where compilation and
              empty caches distort results.
            </li>
            <li>
              <strong>Check the load generator.</strong> If its CPU is saturated, you're measuring
              your client. Run it near the server, on its own machine.
            </li>
            <li>
              <strong>Collect enough samples.</strong> With 100 requests, p99 rests on about one
              request. With 1,000, it rests on about ten.
            </li>
            <li>
              <strong>Count failures.</strong> Fast errors can make latency look better. Report the
              error rate next to every latency figure.
            </li>
            <li>
              <strong>Repeat.</strong> Run each point more than once and check the results agree.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "capacity",
      title: "From sweep to capacity",
      body: (
        <>
          <p>
            One run gives one point. To find capacity, sweep the rate upward until the system
            breaks. Here's an illustrative sweep with 200 output tokens per request and a target of
            p95 time to first token under 500 ms:
          </p>
          <Table
            head={["Offered rate", "Achieved rate", "p50 TTFT", "p95 TTFT", "Output tokens/s"]}
            rows={[
              ["5/s", "5/s", "180 ms", "260 ms", "1,000"],
              ["10/s", "10/s", "190 ms", "300 ms", "2,000"],
              ["15/s", "15/s", "240 ms", "480 ms", "3,000"],
              ["20/s", "18/s", "900 ms", "4,200 ms", "3,600"],
            ]}
          />
          <p>
            Look at the last row. The offered rate passed what the system can do, and p95 jumped
            nearly ninefold. That sharp rise is the <strong>knee</strong> of the curve. Peak
            throughput here is 3,600 tokens/s, but the honest capacity is 15 requests/s, the last
            point that met the target.
          </p>
          <pre>
            <code>{`Expected peak:  120 requests/s
Replicas:       120 ÷ 15 = 8
25% headroom:   8 × 1.25 = 10 replicas`}</code>
          </pre>
          <Callout tone="tip">
            Report throughput at your latency target, not peak throughput. Peak is a number no user
            would accept.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A benchmark is only as useful as how closely it matches real traffic.",
    "Closed-loop tests hide overload; open-loop tests reveal it.",
    "Little's law links in-flight requests, arrival rate and latency.",
    "AIPerf and genai-bench suit LLM metrics, and Locust suits custom user behavior.",
    "Capacity is the highest load that still meets your latency target.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why can a closed-loop test hide overload?",
      options: [
        "It uses fewer tokens",
        "New requests start only after others finish, so load drops as the server slows",
        "It doesn't use streaming",
        "It only works on CPUs",
      ],
      answer: 1,
      explain: "A slower server means fewer completions, so the client sends less traffic.",
    },
    {
      kind: "mcq",
      q: "Sending one identical prompt 1,000 times mostly measures what?",
      options: ["Model accuracy", "Prefix cache behavior", "Disk speed", "Network security"],
      answer: 1,
      explain: "After the first request, a repeated prompt can be served from cached prefixes.",
    },
    {
      kind: "text",
      q: "A system holds 30 requests in flight and each takes 6 s. What is the rate in requests per second?",
      format: "*",
      accept: ["5"],
      explain: "Little's law: 30 ÷ 6 = 5 requests per second.",
    },
    {
      kind: "text",
      q: "Peak traffic is 200 requests/s and one replica meets its target at 25 requests/s. How many replicas are needed before headroom?",
      format: "*",
      accept: ["8"],
      explain: "200 ÷ 25 = 8 replicas.",
    },
  ],
};
