import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain how prompt caching reuses a repeated prefix to cut cost and latency",
    "Structure a prompt so the stable part comes first and caches well",
    "Work out the savings from caching with illustrative prices",
    "Stream a model response to the user and handle the awkward parts",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: paying again for text that never changes",
      body: (
        <>
          <p>
            Most AI apps send the same large block of text on every call: a long system prompt,
            tool definitions, a style guide, maybe a 20-page document the user is asking questions
            about. Only the last few lines change. Without help, the model reads and you pay for all
            of it every time.
          </p>
          <p>
            Two features attack this from different sides. <strong>Prompt caching</strong> makes the
            repeated part cheaper and faster. <strong>Streaming</strong> does not make the model
            faster, but it makes the app <em>feel</em> faster by showing text as it is produced.
          </p>
        </>
      ),
    },
    {
      id: "how-caching",
      title: "How prompt caching works",
      body: (
        <>
          <p>
            When the model processes your input, it builds internal state for those tokens. If the
            provider keeps that state for a short time, a later request that starts with the{" "}
            <strong>exact same prefix</strong> can skip the work and pick up from where the prefix
            ends. The cached part is billed at a reduced rate, and the first token usually arrives
            sooner.
          </p>
          <p>The key word is <em>prefix</em>. A cache hit needs the beginning of the prompt to match exactly. One changed character early on breaks everything after it.</p>
          <Table
            head={["Cache-friendly", "Cache-breaking"]}
            rows={[
              ["Static system prompt first", "Current date and time near the top"],
              ["Tool definitions in a fixed order", "Tools reordered or edited between calls"],
              ["Big reference document, then the question", "Question first, document after it"],
              ["Append-only chat history", "Editing or rewriting old messages"],
            ]}
          />
          <p>
            So build prompts in layers, from least to most likely to change: system instructions,
            tools, reference documents, conversation history, then the new user message.
          </p>
          <Callout tone="note">
            Providers differ. Some need you to mark where the cached prefix ends. Others cache
            automatically once a prompt is long enough. Cached entries expire after a short idle
            time, and there are minimum prompt lengths and different billing rules. These details
            change, so read your provider's current docs before you rely on exact numbers.
          </Callout>
        </>
      ),
    },
    {
      id: "arithmetic",
      title: "Worked example: what caching saves",
      body: (
        <>
          <p>
            Take an app with a 10,000-token prefix (system prompt plus reference material) that
            handles 1,000 requests inside the cache lifetime. Use these <strong>illustrative</strong>{" "}
            prices: normal input costs $3.00 per million tokens, writing to the cache costs 1.25
            times that ($3.75), and reading from the cache costs 0.1 times that ($0.30).
          </p>
          <Formula>cost = tokens ÷ 1,000,000 × price per million</Formula>
          <pre>
            <code>{`No caching:
  1,000 × 10,000 = 10,000,000 tokens × $3.00 / 1M      = $30.00

With caching:
  1 cache write:  10,000 tokens × $3.75 / 1M           = $0.0375
  999 cache reads: 9,990,000 tokens × $0.30 / 1M       = $2.997
  total                                                ≈ $3.03

saving ≈ $26.97, about 90%`}</code>
          </pre>
          <p>
            The first request costs slightly more than normal because of the write. Every later hit
            is far cheaper. Caching pays off when the same prefix is reused many times in a short
            window, and gives little if each prefix is used once.
          </p>
        </>
      ),
    },
    {
      id: "caching-code",
      title: "Caching in code",
      body: (
        <>
          <p>
            With the Anthropic SDK you mark the end of the stable content with{" "}
            <code>cache_control</code>. The response reports how many tokens were written to or read
            from the cache, which is how you check that it works. The model name here is a
            placeholder read from configuration, because model names change.
          </p>
          <pre>
            <code>{`import os
import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY from the environment
MODEL = os.environ["MODEL_NAME"]        # set to a current model from the provider docs

LONG_INSTRUCTIONS = open("handbook.txt").read()   # stable, many thousands of tokens

def ask(question: str):
    return client.messages.create(
        model=MODEL,
        max_tokens=500,
        system=[
            {
                "type": "text",
                "text": LONG_INSTRUCTIONS,
                "cache_control": {"type": "ephemeral"},   # cache everything up to here
            }
        ],
        messages=[{"role": "user", "content": question}],
    )

first = ask("What is the refund policy?")
second = ask("How do I reset my password?")

for r in (first, second):
    u = r.usage
    print(u.cache_creation_input_tokens, u.cache_read_input_tokens, u.input_tokens)`}</code>
          </pre>
          <p>
            On the first call you expect a large <code>cache_creation_input_tokens</code>. On the
            second, a large <code>cache_read_input_tokens</code>. If reads stay at zero, something in
            the prefix is changing between calls. Common culprits are a timestamp in the system
            prompt, a random ID, or tools serialised in a different order.
          </p>
          <p>
            Other providers cache automatically and report cached tokens in their usage data
            instead. The design rule is the same everywhere: stable content first.
          </p>
        </>
      ),
    },
    {
      id: "streaming",
      title: "Streaming: lower the wait you feel",
      body: (
        <>
          <p>
            A model produces output one token at a time. Without streaming, the server holds the
            reply until it is finished. At an illustrative 50 tokens per second, a 500-token answer
            takes 10 seconds, and the user stares at a spinner for all 10.
          </p>
          <Formula>generation time = output tokens ÷ tokens per second</Formula>
          <p>
            With streaming, the server sends small pieces as they appear, usually as server-sent
            events over one open HTTP response. The user sees the first words after the model's{" "}
            <strong>time to first token</strong>, perhaps half a second, and reads while the rest
            arrives. Total time is the same. Perceived time drops sharply.
          </p>
          <pre>
            <code>{`with client.messages.stream(
    model=MODEL,
    max_tokens=500,
    messages=[{"role": "user", "content": "Explain DNS in four sentences."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)     # show each piece immediately
    final = stream.get_final_message()      # full message + usage when done

print()
print(final.usage.output_tokens)`}</code>
          </pre>
          <p>Things that trip people up:</p>
          <ul>
            <li>
              <strong>Buffering.</strong> A proxy, load balancer or framework may collect the
              stream and release it all at once. Check that each hop passes chunks through.
            </li>
            <li>
              <strong>Mid-stream failure.</strong> A connection can drop after half an answer. Keep
              what you received, show it clearly as incomplete, and decide whether to retry.
            </li>
            <li>
              <strong>Tool calls and JSON.</strong> Arguments arrive in fragments. Do not parse
              them until the block is complete.
            </li>
            <li>
              <strong>Cancelling.</strong> If the user presses stop, close the stream so you stop
              paying for tokens nobody will read.
            </li>
            <li>
              <strong>Moderation.</strong> If you must check output before showing it, you cannot
              stream it raw. Check in chunks or accept the delay.
            </li>
          </ul>
          <Callout tone="tip">
            Use both together. Caching lowers time to first token on big prompts. Streaming hides
            the generation time. Neither changes what the model says.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Prompt caching reuses a repeated prefix, so the stable part is cheaper and faster to process.",
    "A cache hit needs an exact prefix match, so put stable content first and dynamic content last.",
    "Caching pays off only when a prefix is reused many times within the cache lifetime.",
    "Check usage fields to confirm cache reads; zero reads usually means the prefix is changing.",
    "Streaming does not speed up generation, but it cuts perceived wait; handle buffering, drops and partial tool JSON.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Where should content that changes on every request go in a cache-friendly prompt?",
      options: [
        "At the very top",
        "Before the tool definitions",
        "At the end, after the stable content",
        "Inside the system prompt as a timestamp",
      ],
      answer: 2,
      explain: "Caching matches an exact prefix. Anything that changes early in the prompt breaks the match for everything after it.",
    },
    {
      kind: "mcq",
      q: "A cache read count stays at zero across many identical-looking requests. What is the most likely cause?",
      options: [
        "Something early in the prompt changes between calls",
        "Streaming is turned on",
        "The answer is too short",
        "The API key is valid",
      ],
      answer: 0,
      explain: "A timestamp, random ID or reordered tools changes the prefix, so there is never an exact match.",
    },
    {
      kind: "text",
      q: "A model generates 500 tokens at 25 tokens per second. How many seconds does generation take?",
      format: "**",
      accept: ["20"],
      explain: "500 ÷ 25 = 20 seconds. Streaming does not change this total.",
    },
    {
      kind: "text",
      q: "Caching needs the start of a prompt to match exactly. What one word names that start?",
      format: "******",
      accept: ["prefix"],
      explain: "The reusable part is the prefix: the beginning of the prompt that stays identical.",
    },
  ],
};
