import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain what reasoning tokens are and why they cost the same as output",
    "Use Little's law to estimate how long requests occupy GPU capacity",
    "Describe how reasoning changes TTFT, KV cache use and tail latency",
    "List the controls that keep reasoning workloads predictable",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: most of the output is invisible",
      body: (
        <>
          <p>
            A <strong>reasoning model</strong> is trained to work through a problem step by step
            before it answers. It might write out a plan, try an approach, notice a mistake and
            correct it. Often this thinking is hidden or collapsed, and the user sees only the final
            answer. DeepSeek-R1, for example, wraps its reasoning in <code>&lt;think&gt;</code> tags
            in the raw output.
          </p>
          <p>
            For quality on hard tasks, this is a real gain. For your infrastructure, it's a shock.
            The thinking isn't free or special. <strong>Every reasoning token is an ordinary output
            token.</strong> It takes a decode step, grows the KV cache and occupies a place in the
            batch, just like a visible word. Commercial APIs commonly bill it as output too.
          </p>
          <p>
            Imagine a call center where each agent used to pick up, answer and hang up in one minute.
            Now each agent puts the caller on hold for ten minutes to research first. The answers get
            better, but with the same staff, the phone lines jam. Reasoning does this to your GPU
            slots.
          </p>
        </>
      ),
    },
    {
      id: "capacity",
      title: "Worked example: what hidden tokens do to capacity",
      body: (
        <>
          <p>
            The key tool here is <strong>Little's law</strong>, which holds for any stable queueing
            system. It connects arrival rate to how many requests are in progress at once:
          </p>
          <Formula>concurrent requests = arrival rate × time each request stays in the system</Formula>
          <p>
            Take an illustrative service with 5 requests per second, a decode speed of 50 tokens per
            second per stream, and 50 concurrent streams per GPU. We'll ignore prefill and queueing
            to keep the numbers simple.
          </p>
          <Table
            head={["", "Standard model", "Reasoning model"]}
            rows={[
              ["Prompt tokens", "1,000", "1,000"],
              ["Hidden thinking tokens", "0", "3,000"],
              ["Visible answer tokens", "300", "300"],
              ["Decode time per request", "300 ÷ 50 = 6 s", "3,300 ÷ 50 = 66 s"],
              ["Concurrent requests", "5 × 6 = 30", "5 × 66 = 330"],
              ["GPUs needed", "1", "330 ÷ 50 = 6.6, so 7"],
              ["Peak context length", "1,300 tokens", "4,300 tokens"],
            ]}
          />
          <p>
            Request rate didn't change, and the user sees the same 300-token answer. Yet you need
            seven times as many GPUs.
          </p>
          <p>
            It gets worse, because the last row affects memory. KV cache grows with sequence length,
            so each reasoning request ends up with 3.3 times the cache (4,300 ÷ 1,300). That lowers
            how many streams fit on a GPU, so the 50-stream assumption may not hold. Fewer streams per
            GPU means even more GPUs.
          </p>
          <Callout tone="warn">
            If you plan capacity from request rate alone, a move to a reasoning model can overload you
            with no change in traffic. Plan from total output tokens, hidden ones included.
          </Callout>
        </>
      ),
    },
    {
      id: "latency",
      title: "What happens to latency metrics",
      body: (
        <>
          <p>
            <strong>TTFT changes meaning.</strong> Time to first token can look fine, because the
            first thinking token arrives quickly. But if thinking is hidden, the user sees nothing
            until it ends. So measure a second number: time to first <em>visible</em> token. In the
            example above, that's 60 seconds (3,000 ÷ 50), not a fraction of a second.
          </p>
          <p>
            <strong>Variance grows.</strong> A simple question might take 100 thinking tokens, and a
            hard one 20,000. You can't predict which from the prompt, so p99 latency sits much further
            from the median. A scheduler can't plan around lengths it doesn't know.
          </p>
          <p>
            <strong>Long jobs hold their slots.</strong> A request with 20,000 thinking tokens keeps
            a batch slot and a growing cache for minutes. Under load, those requests pile up while
            short requests finish and leave, and the batch gets filled with the slowest work. This
            is a kind of survivorship effect, and it's why a fleet can degrade over time during a
            busy period.
          </p>
          <p>
            <strong>Timeouts bite.</strong> A gateway or load balancer with a 60-second idle timeout
            may cut a response if no bytes are flowing. Stream thinking tokens or send keep-alive
            events to keep the connection open.
          </p>
        </>
      ),
    },
    {
      id: "controls",
      title: "Controls that keep it predictable",
      body: (
        <>
          <p>You can't remove the thinking, but you can bound it.</p>
          <ul>
            <li>
              <strong>Hard token limit:</strong> a request-level cap stops runaway generations.
              Remember that it counts thinking too, so a low limit can end a response before any
              answer appears.
            </li>
            <li>
              <strong>Reasoning effort:</strong> some APIs let callers ask for less thinking. Use low
              effort for easy tasks.
            </li>
            <li>
              <strong>Routing:</strong> send simple requests to a standard model and keep reasoning
              for hard ones.
            </li>
            <li>
              <strong>Separate pools:</strong> give reasoning traffic its own GPUs, so its long
              requests don't hurt short, interactive ones.
            </li>
            <li>
              <strong>Async delivery:</strong> requests that can take minutes often fit a job model
              better than a held connection.
            </li>
          </ul>
          <p>
            On the serving side, engines can split thinking from the answer for you. In vLLM, a
            reasoning parser does this, so clients get them in separate fields:
          </p>
          <pre>
            <code>{`vllm serve deepseek-ai/DeepSeek-R1-Distill-Qwen-7B \\
  --reasoning-parser deepseek_r1 \\
  --max-model-len 32768`}</code>
          </pre>
          <p>
            On the client side, here's a request to a reasoning model through an OpenAI-style API,
            with a cap and a lower effort. Parameter support varies by provider and model, so check
            the docs for yours.
          </p>
          <pre>
            <code>{`from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model=MODEL_NAME,
    messages=[{"role": "user", "content": question}],
    reasoning_effort="low",
    max_completion_tokens=4000,
)
print(response.usage)  # Check how many tokens were really used.`}</code>
          </pre>
          <Callout tone="tip">
            Log thinking tokens and answer tokens separately. The ratio between them is your best
            guide to capacity, and it can shift when a model is updated or users start asking harder
            questions.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Reasoning tokens are ordinary output tokens that use decode time, cache and batch slots.",
    "Little's law shows concurrency rises with time in the system, so GPU needs can multiply at the same request rate.",
    "Measure time to first visible token, because normal TTFT can hide the wait.",
    "Thinking length is hard to predict, so tail latency gets worse and long jobs hold slots.",
    "Use token caps, effort settings, routing, separate pools and async delivery to bound it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "From the serving engine's point of view, what is a hidden thinking token?",
      options: [
        "A free token that skips the GPU",
        "A normal output token that needs a decode step",
        "A prefill token",
        "A token stored only on the CPU",
      ],
      answer: 1,
      explain: "It costs a decode step and grows the KV cache, whether or not the user sees it.",
    },
    {
      kind: "mcq",
      q: "Which metric best shows the wait a user feels with hidden reasoning?",
      options: [
        "Time to first visible token",
        "Tokens in the prompt",
        "GPU temperature",
        "Prefix cache hit rate",
      ],
      answer: 0,
      explain: "Standard TTFT may record the first hidden token, long before anything appears on screen.",
    },
    {
      kind: "text",
      q: "Requests arrive at 2 per second and each one stays in the system for 40 seconds. By Little's law, how many are in progress at once?",
      format: "**",
      accept: ["80"],
      explain: "2 × 40 = 80 concurrent requests.",
    },
    {
      kind: "text",
      q: "A response has 2,700 thinking tokens and 300 answer tokens, and decodes at 60 tokens per second. How many seconds does the whole response take?",
      format: "**",
      accept: ["50", "50s"],
      explain: "(2,700 + 300) ÷ 60 = 50 seconds.",
    },
  ],
};
