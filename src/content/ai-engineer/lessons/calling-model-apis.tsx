import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Easy",
  objectives: [
    "Build a request for a messages-style chat API and read the response, including token usage",
    "Reuse the same code against any OpenAI-compatible endpoint by changing the base URL",
    "Decide which errors to retry, and write a retry loop with exponential backoff and jitter",
    "Estimate the cost of a call from token counts",
  ],
  tasks: [
    {
      id: "shape",
      title: "What a model API actually is",
      body: (
        <>
          <p>
            A hosted language model is just an HTTP service. You send JSON that describes a
            conversation, and you get JSON back with the model's reply. Everything else, such as
            SDKs, streaming helpers and agent frameworks, is a layer on top of that one idea. If
            you understand the raw request and response, you can debug any of those layers.
          </p>
          <p>
            Think of it like ordering at a counter. You hand over a written order (the request),
            the kitchen works on it, and you get a tray back (the response). The kitchen keeps no
            memory of you between orders. If you want it to remember the last order, you have to
            write it on the new slip yourself.
          </p>
          <p>
            That last point matters most: <strong>the API is stateless</strong>. The model only
            sees what you send in this one request. A chat app "remembers" because your code
            resends the whole conversation each turn.
          </p>
          <Table
            head={["Request field", "What it does"]}
            rows={[
              ["model", "Which model should answer. Read it from config, never hard-code it deep in your logic"],
              ["messages", "The conversation so far, as a list of turns with a role and content"],
              ["system prompt", "Standing instructions: tone, rules, format. Some APIs take it as its own field, others as a first message with role system"],
              ["max tokens", "A cap on how long the reply can be. It protects your bill and your latency"],
              ["temperature", "How random the sampling is. Lower is steadier, higher is more varied"],
            ]}
          />
          <p>
            Roles are usually <code>user</code> (the person), <code>assistant</code> (earlier model
            replies) and a system role for instructions. Turns normally alternate between user and
            assistant.
          </p>
        </>
      ),
    },
    {
      id: "messages-api",
      title: "A messages-style call",
      body: (
        <>
          <p>
            Anthropic's Messages API is a good reference for the pattern. The SDK reads your key
            from an environment variable, so the key never appears in code. The model name below
            comes from an environment variable too, because model names change often. Treat every
            snippet in this lesson as illustrative: check your provider's docs for current names
            and parameters.
          </p>
          <pre>
            <code>{`import os
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

resp = client.messages.create(
    model=os.environ["MODEL_NAME"],
    max_tokens=300,
    system="You are a concise assistant for a billing team.",
    messages=[
        {"role": "user", "content": "Explain proration in two sentences."},
    ],
)

print(resp.content[0].text)
print(resp.stop_reason, resp.usage.input_tokens, resp.usage.output_tokens)`}</code>
          </pre>
          <p>Three parts of the response are worth reading every time:</p>
          <ul>
            <li>
              <strong>The content.</strong> A list of blocks. For plain chat the first block holds
              the text. When a model calls tools, other block types appear, so don't assume the
              list has exactly one item in production code.
            </li>
            <li>
              <strong>The stop reason.</strong> It says why generation ended. A natural finish
              looks different from hitting your max tokens cap. If you see the cap, the answer was
              cut off, and you should raise the limit or ask for a shorter reply.
            </li>
            <li>
              <strong>Usage.</strong> Input and output token counts. Log these on every call.
              They are how you will later find out which feature is expensive.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "compatible",
      title: "OpenAI-compatible endpoints",
      body: (
        <>
          <p>
            Many providers, gateways and local servers copy the shape of OpenAI's chat completions
            API. That makes it a common denominator. If a service says it is "OpenAI-compatible",
            you can usually keep the same client code and change two settings: the base URL and the
            key.
          </p>
          <pre>
            <code>{`import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ["LLM_BASE_URL"],
    api_key=os.environ["LLM_API_KEY"],
)

resp = client.chat.completions.create(
    model=os.environ["MODEL_NAME"],
    max_tokens=300,
    messages=[
        {"role": "system", "content": "You are a concise assistant."},
        {"role": "user", "content": "Explain proration in two sentences."},
    ],
)

print(resp.choices[0].message.content)
print(resp.choices[0].finish_reason)
print(resp.usage.prompt_tokens, resp.usage.completion_tokens)`}</code>
          </pre>
          <p>
            Notice the differences from the messages style: the system prompt is a message, the
            text lives under <code>choices</code>, and the token fields have different names.
            "Compatible" rarely means identical, so test the features you rely on, such as
            streaming, tool calls and structured output.
          </p>
          <Callout tone="tip">
            Put the base URL, key and model name in environment variables from day one. Switching
            provider, or pointing at a local model for testing, then becomes a config change with
            no code change.
          </Callout>
        </>
      ),
    },
    {
      id: "cost",
      title: "Token arithmetic: what a call costs",
      body: (
        <>
          <p>
            Providers bill by tokens, and output tokens usually cost more than input tokens.
            Prices change, so always read the current price sheet. The formula never changes:
          </p>
          <Formula>cost = input tokens × input price + output tokens × output price</Formula>
          <p>
            Worked example with made-up prices. Say input costs $3 per million tokens and output
            costs $15 per million. A request sends 2,000 input tokens and gets 500 output tokens:
          </p>
          <pre>
            <code>{`input : 2,000 × 3 / 1,000,000  = $0.0060
output:   500 × 15 / 1,000,000 = $0.0075
total                          = $0.0135 per request

1,000 requests a day → about $13.50 a day (illustrative)`}</code>
          </pre>
          <p>
            Two habits keep this under control. Trim the prompt, since the conversation history is
            resent every turn and grows each time. And set a sensible max tokens cap so a runaway
            reply can't surprise you.
          </p>
        </>
      ),
    },
    {
      id: "errors",
      title: "Errors, retries and backoff",
      body: (
        <>
          <p>
            Network calls fail. A model API adds its own failure modes: rate limits, overloaded
            servers and requests the model refuses to run. The first question for any error is
            whether trying again can help.
          </p>
          <Table
            head={["Status", "Meaning", "Retry?"]}
            rows={[
              ["400", "Your request is malformed or too long", "No. Fix the request"],
              ["401 / 403", "Bad key or no permission", "No. Fix credentials"],
              ["404", "Wrong URL or unknown model name", "No. Fix the config"],
              ["429", "Rate limited", "Yes, after waiting"],
              ["500 / 502 / 503 / 504", "Provider or network trouble", "Yes, a few times"],
              ["Timeout or dropped connection", "No answer in time", "Yes, with care"],
            ]}
          />
          <p>
            For retries, use <strong>exponential backoff with jitter</strong>. Wait a short time,
            then double the wait after each failure, and add a random amount so that many clients
            don't all retry at the same instant. Rate-limit responses often include a header
            telling you how long to wait; respect it when present.
          </p>
          <pre>
            <code>{`import random
import time

RETRYABLE = {408, 429, 500, 502, 503, 504}

def call_with_retry(send, max_attempts=5):
    for attempt in range(max_attempts):
        try:
            return send()
        except Exception as err:
            status = getattr(err, "status_code", None)
            if status is not None and status not in RETRYABLE:
                raise  # a 400 or 401 will fail the same way again
            if attempt == max_attempts - 1:
                raise
            delay = min(2 ** attempt, 30) + random.random()
            time.sleep(delay)  # waits about 1, 2, 4, 8 seconds`}</code>
          </pre>
          <p>
            With five attempts the waits are 1, 2, 4 and 8 seconds, so a call gives up after about
            15 seconds plus jitter. Official SDKs already retry a couple of times by default, so
            check before you stack your own loop on top.
          </p>
          <Callout tone="warn">
            Retries can double-charge you if the first attempt actually succeeded but the response
            was lost. Always set a client timeout, cap the number of attempts, and keep long
            generations on streaming so a stall is noticed early.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A model API is stateless HTTP and JSON. Resend the conversation each turn.",
    "Read the stop reason and usage on every response, and log them.",
    "OpenAI-compatible endpoints let you swap providers by changing the base URL and key.",
    "Cost is input tokens times input price plus output tokens times output price.",
    "Retry 429 and 5xx errors with exponential backoff and jitter. Never retry 400 or 401.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why must your code resend earlier messages on every turn of a chat?",
      options: [
        "The model API is stateless and only sees the current request",
        "The provider deletes messages after 5 seconds",
        "Roles only work with a full history",
        "It lowers the token count",
      ],
      answer: 0,
      explain: "The model has no memory between calls. Your application supplies the history each time.",
    },
    {
      kind: "mcq",
      q: "Which response should you not retry blindly?",
      options: [
        "A 503 from the provider",
        "A dropped connection",
        "A 400 saying the request is malformed",
        "A 429 rate limit",
      ],
      answer: 2,
      explain: "A malformed request fails the same way every time. Fix the request instead of retrying.",
    },
    {
      kind: "text",
      q: "Which HTTP status code usually means you have been rate limited?",
      format: "***",
      accept: ["429"],
      explain: "429 means too many requests. Wait, then retry with backoff.",
    },
    {
      kind: "text",
      q: "Backoff starts at a 1 second wait and doubles each retry. How many seconds is the wait before the 4th retry (ignoring jitter)?",
      format: "*",
      accept: ["8"],
      explain: "The waits are 1, 2, 4, 8 seconds, so the 4th retry waits 8.",
    },
    {
      kind: "text",
      q: "Input is $2 per million tokens. A request has 5,000 input tokens and no meaningful output cost. What is the input cost in dollars? Use the format 0.00.",
      format: "*.**",
      accept: ["0.01", ".01"],
      explain: "5,000 × 2 / 1,000,000 = 0.01 dollars.",
    },
  ],
};
