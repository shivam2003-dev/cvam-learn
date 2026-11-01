import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Easy",
  objectives: [
    "Define TTFT, tokens per second and inter-token latency precisely",
    "Predict total response time from those numbers",
    "Measure them yourself against a streaming API",
  ],
  tasks: [
    {
      id: "feel",
      title: "Three numbers that describe how a response feels",
      body: (
        <>
          <p>
            A streamed answer has two experiences in it: the wait before anything happens, and
            the pace of text after it starts. Three metrics capture them.
          </p>
          <Table
            head={["Metric", "Meaning", "What drives it"]}
            rows={[
              [<strong key="a">TTFT</strong>, "Time to first token: request sent to first token received", "Network, queueing, prefill"],
              [<strong key="b">ITL</strong>, "Inter-token latency: gap between consecutive tokens", "Decode step time, batch load"],
              [<strong key="c">TPS</strong>, "Tokens per second generated for one request", "The inverse of ITL"],
            ]}
          />
          <p>
            A slow TTFT feels like the app is broken. People start to wonder if the click worked.
            A slow ITL feels like reading through a straw. Which one matters most depends on the
            product: a voice agent needs a very low TTFT, while a batch summarizer may not care
            about either.
          </p>
        </>
      ),
    },
    {
      id: "formulas",
      title: "How they fit together",
      body: (
        <>
          <p>TPS and ITL are two views of the same thing:</p>
          <Formula>TPS ≈ 1000 ÷ ITL in ms</Formula>
          <p>
            An ITL of 25 ms gives 40 tokens per second. The first token arrives at TTFT, and
            every remaining token adds one gap, so total time is:
          </p>
          <Formula>end-to-end time = TTFT + (output tokens − 1) × ITL</Formula>
          <p>
            With a TTFT of 400 ms, an ITL of 25 ms and 300 output tokens, the response takes
            0.4 s + 299 × 0.025 s = <strong>7.875 seconds</strong>.
          </p>
          <p>
            Notice what dominates. Cutting TTFT in half saves 0.2 seconds. Cutting ITL by 20%
            saves about 1.5 seconds. For long responses, decode speed matters most to total time,
            while TTFT still matters most to how fast the app feels.
          </p>
        </>
      ),
    },
    {
      id: "gotchas",
      title: "Definitions that trip people up",
      body: (
        <>
          <p>Two vendors can publish the same metric name and mean different things.</p>
          <ul>
            <li>
              <strong>TPS per request vs. total TPS.</strong> Per-request TPS is one user's
              speed. Total TPS is the whole system's output. A benchmark claiming 10,000 TPS
              usually means the total across many requests.
            </li>
            <li>
              <strong>Whether TTFT is included.</strong> Some tools compute TPS as tokens ÷ total
              time, and others exclude TTFT. Long prefill makes the first look much worse.
            </li>
            <li>
              <strong>Stream chunks aren't tokens.</strong> Servers often send several tokens in
              one network chunk, so counting chunks misreports speed. Use token counts from the
              response usage field or run the tokenizer yourself.
            </li>
            <li>
              <strong>Hidden reasoning tokens.</strong> A reasoning model may generate thousands
              of tokens before visible text. Decide whether your TTFT means first token or first
              visible token.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "measure",
      title: "Measure it yourself",
      body: (
        <>
          <p>
            Here's a small script for any OpenAI-compatible endpoint, which most inference
            engines expose. It records the time of each content chunk, then uses the usage
            counts from the final chunk.
          </p>
          <pre>
            <code>{`import time
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="local")

start = time.perf_counter()
first = last = None
usage = None

stream = client.chat.completions.create(
    model="my-model",
    messages=[{"role": "user", "content": "Explain DNS in 200 words."}],
    stream=True,
    stream_options={"include_usage": True},
)

for chunk in stream:
    if chunk.usage:
        usage = chunk.usage
    if chunk.choices and chunk.choices[0].delta.content:
        last = time.perf_counter()
        first = first or last

tokens = usage.completion_tokens
ttft = first - start
itl = (last - first) / max(tokens - 1, 1)

print(f"TTFT {ttft * 1000:.0f} ms")
print(f"ITL  {itl * 1000:.1f} ms")
print(f"TPS  {1 / itl:.1f}")`}</code>
          </pre>
          <Callout tone="tip">
            Run this from where your users are, not from the same machine as the server. Then
            run it many times and under load. One quiet measurement tells you the best case and
            nothing else.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "TTFT covers the wait, and ITL and TPS cover the pace.",
    "TPS and ITL are inverses: 25 ms ITL is 40 tokens per second.",
    "End-to-end time is TTFT plus (tokens − 1) × ITL.",
    "Per-request TPS and total system TPS are very different numbers.",
    "Count tokens with usage data, because stream chunks aren't tokens.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which delay is part of TTFT but not ITL?",
      options: ["Decode step time", "Queueing and prefill", "Detokenization only", "None of these"],
      answer: 1,
      explain: "TTFT includes time waiting in queue and processing the prompt. ITL only appears after output begins.",
    },
    {
      kind: "text",
      q: "A model has an ITL of 20 ms. What is its speed in tokens per second?",
      format: "**",
      accept: ["50"],
      explain: "1000 ÷ 20 = 50 tokens per second.",
    },
    {
      kind: "mcq",
      q: "Why shouldn't you count streamed chunks to measure TPS?",
      options: [
        "Chunks are encrypted",
        "A chunk can contain more than one token",
        "Chunks only arrive after the stream ends",
        "Chunks exclude the first token",
      ],
      answer: 1,
      explain: "Servers and proxies can group tokens, so chunk count doesn't equal token count.",
    },
    {
      kind: "mcq",
      q: "TTFT is 500 ms, ITL is 50 ms, and output is 101 tokens. How long does the response take?",
      options: ["5.0 s", "5.5 s", "5.55 s", "10.5 s"],
      answer: 1,
      explain: "0.5 s + 100 × 0.05 s = 5.5 s.",
    },
  ],
};
