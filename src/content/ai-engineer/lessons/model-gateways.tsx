import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Explain what a model gateway does and the problems it solves",
    "Describe how OpenRouter-style routing, fallbacks and unified billing work",
    "Write a simple client-side fallback chain over several models",
    "Estimate the availability gain from adding a fallback provider",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: too many providers",
      body: (
        <>
          <p>
            Suppose your app calls one provider directly. Then a product manager asks for a
            cheaper model for simple tasks. Then the provider has an outage on a Friday. Then a new
            model appears that is better at code. Each change means a new SDK, a new key, a new
            invoice, new error formats and new retry logic.
          </p>
          <p>
            A <strong>model gateway</strong> sits between your app and the providers. You send
            every request to one endpoint in one format, and the gateway forwards it to the right
            provider. Think of it as a travel agent: you ask for a trip, and the agent deals with
            the airlines.
          </p>
          <Table
            head={["Without a gateway", "With a gateway"]}
            rows={[
              ["One SDK and key per provider", "One endpoint and one key"],
              ["Different request shapes and errors", "One normalized shape, often OpenAI-compatible"],
              ["Switching models means code changes", "Switching models means changing a string"],
              ["Outage means your feature is down", "Requests can fall back to another model or provider"],
              ["Many invoices and dashboards", "One bill and one place to see usage"],
            ]}
          />
        </>
      ),
    },
    {
      id: "openrouter",
      title: "OpenRouter: a hosted gateway",
      body: (
        <>
          <p>
            <strong>OpenRouter</strong> is a hosted service that exposes many models from many
            providers behind a single OpenAI-compatible API. Models are named in a{" "}
            <code>provider/model</code> style, so the same call can reach different families just
            by changing that string. You top up one account and pay through it.
          </p>
          <p>The code is the OpenAI-compatible client you already know:</p>
          <pre>
            <code>{`import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ["GATEWAY_BASE_URL"],
    api_key=os.environ["GATEWAY_API_KEY"],
)

resp = client.chat.completions.create(
    model=os.environ["PRIMARY_MODEL"],   # a provider/model style name
    messages=[{"role": "user", "content": "Summarize: gateways route requests."}],
    max_tokens=100,
)
print(resp.choices[0].message.content)`}</code>
          </pre>
          <p>
            Gateways typically add features on top of plain forwarding. Exact names and options
            differ by service, so check the current docs, but the common ideas are:
          </p>
          <ul>
            <li>
              <strong>Routing:</strong> pick a provider by price, speed or availability, since the
              same open-weight model is often hosted by several providers.
            </li>
            <li>
              <strong>Fallbacks:</strong> if the first choice errors or is overloaded, try the
              next one automatically.
            </li>
            <li>
              <strong>Unified usage and billing:</strong> one view of tokens and spend across
              providers.
            </li>
            <li>
              <strong>Policy controls:</strong> limits on which providers may see your data, or
              spending caps.
            </li>
          </ul>
          <p>
            You can also run a gateway yourself. Open-source proxies such as LiteLLM give you the
            same single-endpoint idea on your own infrastructure, and some cloud platforms offer
            their own managed gateways. The trade is control and data handling against the effort
            of running it.
          </p>
        </>
      ),
    },
    {
      id: "fallback",
      title: "Building a fallback chain",
      body: (
        <>
          <p>
            Even if your gateway has built-in fallbacks, understanding the pattern helps you
            debug it, and it is easy to write yourself. The idea: keep an ordered list of models,
            try the first, and move down the list on a retryable failure.
          </p>
          <pre>
            <code>{`import os

MODELS = [
    os.environ["PRIMARY_MODEL"],
    os.environ["BACKUP_MODEL"],
    os.environ["LAST_RESORT_MODEL"],
]

def ask(client, prompt):
    last_error = None
    for model in MODELS:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                timeout=20,
            )
            return resp.choices[0].message.content, model
        except Exception as err:
            status = getattr(err, "status_code", None)
            if status in (400, 401, 403):
                raise            # our fault, a backup won't fix it
            last_error = err     # 429, 5xx, timeout: try the next model
    raise RuntimeError("all models failed") from last_error`}</code>
          </pre>
          <p>
            Two details matter. First, return which model actually answered and log it, or you
            will never know that half your traffic quietly moved to the backup. Second, only fall
            back on errors a different model could fix. A malformed request will fail on every
            model.
          </p>
          <Callout tone="warn">
            A fallback model is not a drop-in copy. It may follow instructions differently, have
            a shorter context window, or format JSON in its own way. Test your prompts against every
            model in the chain, not only the first.
          </Callout>
        </>
      ),
    },
    {
      id: "reliability",
      title: "What a fallback buys you",
      body: (
        <>
          <p>
            Reliability arithmetic is simple when failures are independent. If a request fails
            only when every option fails, then:
          </p>
          <Formula>P(all fail) = P(fail 1) × P(fail 2) × ...</Formula>
          <pre>
            <code>{`one provider, 99% available     → 1% of requests fail
two independent, 99% each       → 0.01 × 0.01 = 0.0001 = 0.01% fail
                                  (99.99% available)
(illustrative numbers)`}</code>
          </pre>
          <p>
            Real failures are not fully independent. Providers share clouds, and a bad prompt or
            expired key breaks everything at once. So treat the result as an upper bound on the
            gain, but the direction is solid: a second option cuts the failure rate sharply.
          </p>
        </>
      ),
    },
    {
      id: "tradeoffs",
      title: "Trade-offs to weigh",
      body: (
        <>
          <Table
            head={["Concern", "What to check"]}
            rows={[
              ["Latency", "A gateway adds a network hop. Measure it with your real traffic"],
              ["Price", "Compare gateway pricing and any fee with direct provider pricing; prices change"],
              ["Privacy", "Your prompts pass through another company. Read data and retention terms"],
              ["Features", "New provider features may reach a gateway later, or only in part"],
              ["Lock-in", "Keep the base URL and model names in config so you can leave"],
              ["Rate limits", "You now have limits from the gateway and from each underlying provider"],
            ]}
          />
          <p>
            A gateway is a strong default for prototypes and for apps that mix models. For
            high-volume production, many teams still benchmark direct provider access against it.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A gateway gives you one endpoint, one key and one request format for many providers.",
    "OpenRouter-style services add routing, fallbacks and unified billing; self-hosted proxies offer a similar idea.",
    "A fallback chain tries models in order and only moves on for errors a different model could fix.",
    "Log which model answered, and test prompts on every model in the chain.",
    "Weigh the extra hop, cost, privacy and lock-in before depending on one.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main benefit of a model gateway?",
      options: [
        "It trains models for you",
        "It makes every model identical",
        "It removes the need for prompts",
        "It gives one API for many models, with routing and fallbacks",
      ],
      answer: 3,
      explain: "A gateway normalizes access so you can swap or combine models without rewriting client code.",
    },
    {
      kind: "mcq",
      q: "Which error should NOT trigger a fall back to the next model?",
      options: [
        "A 429 rate limit",
        "A 400 because the request is malformed",
        "A 503 from a provider",
        "A timeout",
      ],
      answer: 1,
      explain: "A malformed request will fail on every model. The other three might succeed elsewhere.",
    },
    {
      kind: "text",
      q: "Two independent providers each fail 10% of requests. What percent of requests fail on both? Answer with a number.",
      format: "*",
      accept: ["1", "1%", "1 %"],
      explain: "0.10 × 0.10 = 0.01, which is 1%.",
    },
    {
      kind: "text",
      q: "What is the name for automatically trying another model when the first one errors?",
      format: "********",
      accept: ["fallback", "failover", "fall back"],
      explain: "A fallback chain gives you resilience when a provider is down or rate limited.",
    },
  ],
};
