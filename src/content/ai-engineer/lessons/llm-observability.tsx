import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why LLM apps need traces and not only logs",
    "Record the fields that make a bad answer debuggable",
    "Compute request cost from token counts and project it to a daily bill",
    "Track latency with percentiles and time to first token",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: the failure is a sentence, not an exception",
      body: (
        <>
          <p>
            A normal service fails loudly. A stack trace points at a line of code. An LLM app can
            fail while every status code says 200: the answer is wrong, the retrieval pulled the
            wrong document, a tool returned junk, or the prompt quietly grew until it cost five
            times what you expected. Nothing crashed, so nothing alerts you.
          </p>
          <p>
            <strong>Observability</strong> means recording enough about each request that you can
            answer a question you did not think of in advance, such as why this user got a strange
            answer yesterday at 3 pm. For LLM apps that means capturing the prompt, the context,
            the output, the cost and the timing for every step.
          </p>
          <p>
            Picture a flight recorder. You hope never to need it, but when something goes wrong
            you cannot rebuild what happened from memory. Instrument first, debug later.
          </p>
        </>
      ),
    },
    {
      id: "traces",
      title: "Traces and spans",
      body: (
        <>
          <p>
            One user message often triggers many steps: rewrite the query, search a vector store,
            call the model, call a tool, call the model again. A <strong>trace</strong> is the
            whole journey of one request. A <strong>span</strong> is one step inside it, with a
            start time, an end time and attributes. Spans nest, so you can see that the slow part
            was the second model call and not the search.
          </p>
          <pre>
            <code>{`trace: answer_question            1,840 ms   total cost 0.0081
  span: rewrite_query               210 ms
  span: vector_search               95 ms    k=5
  span: llm_call (generate)       1,480 ms   in=1,200 out=300
  span: guardrail_output             55 ms`}</code>
          </pre>
          <p>
            Logs are a flat list of messages. A trace keeps the structure, so you can click one
            slow request and see every step that belonged to it. Many tools build on
            OpenTelemetry, an open standard for traces and metrics, and add LLM-specific views such
            as prompt and response inspection.
          </p>
        </>
      ),
    },
    {
      id: "what-to-record",
      title: "What to record on every model call",
      body: (
        <>
          <Table
            head={["Field", "Why you want it"]}
            rows={[
              ["Request ID and trace ID", "Join the model call to the user request and to other spans"],
              ["User or session ID (non-personal)", "Find all requests from one session or account"],
              ["Model name and parameters", "Compare behaviour across models, temperature and so on"],
              ["Prompt template name and version", "Link a quality change to a prompt change"],
              ["Input and output text", "See exactly what the model saw and said"],
              ["Retrieved document IDs", "Tell a retrieval failure from a generation failure"],
              ["Input and output token counts", "Compute cost and spot growing prompts"],
              ["Latency and time to first token", "Measure speed as the user feels it"],
              ["Error type and retry count", "Find rate limits, timeouts and flaky tools"],
              ["User feedback (thumbs up or down)", "The cheapest quality signal you will get"],
            ]}
          />
          <p>Here is a minimal wrapper. It is illustrative: adapt the client call to your SDK.</p>
          <pre>
            <code>{`import json, time, uuid

def traced_call(client, model: str, messages: list, prompt_version: str, user_id: str):
    start = time.perf_counter()
    response = client.chat(model=model, messages=messages)   # illustrative call
    latency_ms = (time.perf_counter() - start) * 1000

    record = {
        "request_id": str(uuid.uuid4()),
        "user_id": user_id,
        "model": model,
        "prompt_version": prompt_version,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "latency_ms": round(latency_ms),
    }
    print(json.dumps(record))      # ship to your log pipeline
    return response`}</code>
          </pre>
          <Callout tone="warn">
            Prompts and outputs often hold personal data. Redact before storing, set a retention
            period, and restrict who can read traces. Observability data is also user data.
          </Callout>
        </>
      ),
    },
    {
      id: "cost",
      title: "Cost: tokens times price",
      body: (
        <>
          <p>
            Providers charge per token, usually with separate prices for input and output. The
            cost of one call is:
          </p>
          <Formula>cost = input tokens × input price + output tokens × output price</Formula>
          <p>
            Use illustrative prices of 3 dollars per million input tokens and 15 dollars per
            million output tokens. Real prices change often and differ by model, so read your
            provider's current pricing page.
          </p>
          <pre>
            <code>{`input : 1,200 tokens × 3 / 1,000,000  = 0.0036 dollars
output:   300 tokens × 15 / 1,000,000 = 0.0045 dollars
total per request                      = 0.0081 dollars

At 100,000 requests a day: 100,000 × 0.0081 = 810 dollars a day`}</code>
          </pre>
          <p>
            A fraction of a cent per request becomes about 810 dollars a day at that volume. This
            is why you track cost per request, per feature and per user. Common culprits when cost
            jumps: a prompt that gained extra retrieved chunks, a retry loop, a longer system
            prompt, or one heavy user. Set budget alerts so you hear about it from a dashboard
            and not from an invoice.
          </p>
        </>
      ),
    },
    {
      id: "latency",
      title: "Latency: look at percentiles, not averages",
      body: (
        <>
          <p>
            Average latency hides the slow requests that make users give up. Use percentiles. The
            <strong> p50</strong> is the median: half of requests are faster. The{" "}
            <strong>p95</strong> means 95 percent are faster, so 1 in 20 is slower than that.
            Suppose ten requests take 1, 1, 1, 1, 1, 1, 1, 1, 2 and 12 seconds. The mean is 2.2
            seconds, which describes nobody. The median is 1 second and the slowest requests need
            attention.
          </p>
          <p>
            For streaming responses, measure <strong>time to first token</strong> (how long until
            text starts to appear) separately from total time. Users forgive a long answer that
            starts quickly. Watch these alongside cost:
          </p>
          <Table
            head={["Metric", "Alert when"]}
            rows={[
              ["p95 latency", "It crosses your product target"],
              ["Time to first token", "It grows for streaming UIs"],
              ["Error and retry rate", "Rate-limit or timeout errors rise"],
              ["Cost per request", "It drifts above its normal range"],
              ["Feedback score", "Thumbs-down share climbs"],
            ]}
          />
          <p>
            Common tools in this space include Langfuse, LangSmith, Helicone, Arize Phoenix and
            general platforms that accept OpenTelemetry data. They differ in hosting options and
            features, so choose by how well they fit your stack and data rules.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "LLM failures are often wrong answers with a 200 status, so you need to record the content, not only errors.",
    "A trace is one request's whole journey and spans are its steps, which shows where time and cost went.",
    "Record model, prompt version, token counts, latency, retrieved IDs and feedback on every call.",
    "Cost is input tokens times input price plus output tokens times output price. Small per-request amounts scale fast.",
    "Use percentiles and time to first token for latency, and treat stored traces as sensitive data.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why record the retrieved document IDs for a RAG request?",
      options: [
        "They make the response shorter",
        "They let you tell a retrieval failure from a generation failure",
        "They lower the token price",
        "They replace the need for tracing",
      ],
      answer: 1,
      explain: "If the right documents were never retrieved, fixing the prompt will not help. The IDs show which stage failed.",
    },
    {
      kind: "mcq",
      q: "Ten requests take 1, 1, 1, 1, 1, 1, 1, 1, 2 and 12 seconds. Which statement is best?",
      options: [
        "The average of 2.2 seconds describes a typical request well",
        "The median is 12 seconds",
        "The slow tail matters, and the average hides it",
        "All requests are slow",
      ],
      answer: 2,
      explain: "Most requests take 1 second. One slow request pulls the mean up and hides how the tail behaves, which is why percentiles are used.",
    },
    {
      kind: "text",
      q: "With illustrative prices of 2 dollars per million input tokens and 10 dollars per million output tokens, a call uses 2,000 input and 500 output tokens. What is its cost in dollars?",
      format: "*****",
      accept: ["0.009", "$0.009", "0.0090", "0.009 dollars"],
      explain: "Input: 2,000 × 2 / 1,000,000 = 0.004. Output: 500 × 10 / 1,000,000 = 0.005. Total 0.009.",
    },
    {
      kind: "text",
      q: "What is the name for one step inside a trace, with its own start time, end time and attributes?",
      format: "****",
      accept: ["span"],
      explain: "A trace is made of spans. Each span is one step such as a search or a model call.",
    },
  ],
};
