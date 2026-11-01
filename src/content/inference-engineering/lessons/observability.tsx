import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Organize inference metrics into four layers",
    "Use percentiles from histograms, not averages",
    "Set SLOs and calculate an error budget",
    "Read a symptom and narrow down its likely cause",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            An inference service can look fine while users suffer. GPU utilization reads 95%, which
            could mean healthy and busy, or a stuck queue. The average latency is stable, while one
            user in fifty waits for 30 seconds. HTTP status is 200, but the stream died halfway
            through and the status was sent long before that.
          </p>
          <p>
            <strong>Observability</strong> is the ability to tell what your system is doing, and
            why, from the signals it gives off. The aim is to detect problems before customers
            report them and to find the cause quickly.
          </p>
          <p>
            Think of a car's dashboard. A speedometer tells you what you experience, a temperature
            gauge warns of trouble underneath, and a warning light says when to pull over. One gauge
            isn't enough, and you certainly don't want a hundred flashing lights. You want a small
            set that tells a clear story.
          </p>
        </>
      ),
    },
    {
      id: "layers",
      title: "Four layers of signals",
      body: (
        <>
          <p>Collect signals at each layer, from what the user feels down to the hardware.</p>
          <Table
            head={["Layer", "Signals", "Answers"]}
            rows={[
              ["User experience", "TTFT, inter-token latency, end-to-end latency, error rate, dropped streams", "Is it good for users?"],
              ["Engine", "Running and waiting requests, KV cache use, batch size, prefix hit rate", "Why is it slow?"],
              ["Hardware", "GPU memory, temperature, power, ECC and Xid errors", "Is the machine healthy?"],
              ["Business", "Tokens per tenant and model, cost, rate-limit rejections", "Who is using it, and what does it cost?"],
            ]}
          />
          <p>
            vLLM publishes Prometheus metrics on <code>/metrics</code>, and NVIDIA's{" "}
            <code>dcgm-exporter</code> covers GPUs. Metric names change between versions, so check
            yours. These are useful ones to start with:
          </p>
          <Table
            head={["Metric", "Meaning"]}
            rows={[
              [<code key="ttft">vllm:time_to_first_token_seconds</code>, "TTFT histogram"],
              [<code key="e2e">vllm:e2e_request_latency_seconds</code>, "Full request latency histogram"],
              [<code key="running">vllm:num_requests_running</code>, "Requests in active batches"],
              [<code key="waiting">vllm:num_requests_waiting</code>, "Requests in the queue"],
              [<code key="gen">vllm:generation_tokens_total</code>, "Tokens generated, as a counter"],
              [<code key="fb">DCGM_FI_DEV_FB_USED</code>, "GPU frame buffer memory used"],
              [<code key="xid">DCGM_FI_DEV_XID_ERRORS</code>, "Latest GPU error code from the driver"],
            ]}
          />
          <Callout tone="warn">
            GPU utilization mostly says that something ran on the GPU in the sample window. It
            doesn't tell you how much of the chip's capacity was used, and it doesn't predict
            latency. Treat it as background info, not as a health check.
          </Callout>
        </>
      ),
    },
    {
      id: "percentiles",
      title: "Percentiles, and how to get them",
      body: (
        <>
          <p>
            An average hides the people having a bad time. If 98 requests take 1 second and 2 take
            50 seconds, the average is (98 + 100) ÷ 100 = 1.98 seconds, which looks fine. But the 99th
            percentile (p99) is 50 seconds. Long tails are the rule in LLM serving, because prompt
            sizes vary so much.
          </p>
          <p>
            Store latency in histograms, so you can compute percentiles across replicas. You can't
            average percentiles from each server and get a true fleet number. In PromQL:
          </p>
          <pre>
            <code>{`histogram_quantile(
  0.99,
  sum by (le) (rate(vllm:time_to_first_token_seconds_bucket[5m]))
)`}</code>
          </pre>
          <p>
            Measure from the client's side too. Metrics in the engine can't see time spent in the
            gateway, the proxy, or on the internet. A stream that fails mid-way also needs its own
            metric, because the HTTP status can't change after the first byte. Track finish reasons
            and whether each stream ended as it should.
          </p>
        </>
      ),
    },
    {
      id: "slos",
      title: "SLOs and alerts",
      body: (
        <>
          <p>
            A <strong>service level objective</strong> (SLO) is a target for good behavior, such as
            "99.9% of requests succeed, with TTFT under 2 seconds." Its opposite is the{" "}
            <strong>error budget</strong>: how much failure you can accept in a period.
          </p>
          <Formula>error budget = (1 − SLO) × period</Formula>
          <p>Over 30 days, or 43,200 minutes, a 99.9% SLO allows:</p>
          <pre>
            <code>{`0.001 × 43,200 = 43.2 minutes of full failure`}</code>
          </pre>
          <p>
            Alert when you're spending that budget too fast, not on each brief blip. A{" "}
            <strong>burn rate</strong> of 1 uses the budget exactly by the end of the period. A burn
            rate of 14.4 sustained for an hour uses 14.4 ÷ 720 = 2% of a 30-day budget, which is
            worth waking someone for.
          </p>
          <p>Page people for what users feel. Use causes to explain it, not to wake them:</p>
          <pre>
            <code>{`groups:
  - name: inference
    rules:
      - alert: HighTTFT
        expr: |
          histogram_quantile(0.95,
            sum by (le) (rate(vllm:time_to_first_token_seconds_bucket[5m]))
          ) > 2
        for: 10m
        labels:
          severity: page
        annotations:
          summary: "p95 TTFT above 2 s for 10 minutes"`}</code>
          </pre>
          <p>
            The <code>for: 10m</code> means the condition must hold for 10 minutes, so a brief spike
            won't page anyone.
          </p>
        </>
      ),
    },
    {
      id: "diagnosis",
      title: "From symptom to cause",
      body: (
        <>
          <p>
            The value of layered metrics is that they narrow the search. Patterns are often clear
            once you've seen them a few times.
          </p>
          <Table
            head={["Symptom", "Other clue", "Likely cause"]}
            rows={[
              ["TTFT up, inter-token normal", "Requests waiting rising", "Too little capacity, or a burst"],
              ["TTFT up, no queue", "Long prompts, low prefix hit rate", "Heavy prefill or a cold cache"],
              ["Inter-token latency up", "KV cache near full, larger batches", "Memory pressure, too much concurrency"],
              ["Errors on one replica only", "Xid errors or high temperature", "Bad GPU or node"],
              ["Throughput falls, nothing else", "GPU power or clocks low", "Thermal or power throttling"],
              ["Latency up after a release", "A deployment marker lines up", "Bad config, template or model change"],
            ]}
          />
          <p>
            Metrics show that something is wrong. <strong>Traces</strong> show where one request
            spent its time. With OpenTelemetry, you can record spans for the gateway, queue, prefill,
            decode and each pipeline stage, all joined by a request ID. Sample a share of normal
            traffic, and keep all errors and very slow requests.
          </p>
          <Callout tone="tip">
            Put deployment markers on your dashboards. When a graph bends, the first question is
            always "what changed?", and a marker answers it right away.
          </Callout>
          <Callout tone="note">
            Logs and traces must follow your data rules. Prompts don't belong in them by default.
            Record token counts, the model version and the request ID, and restrict any content
            logging to cases you've approved.
          </Callout>
          <p>
            Keep the signal list short at first. Pick a dashboard for each layer, define two or
            three SLOs, and add metrics only when an incident shows you needed them.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Watch four layers: user experience, engine, hardware and business.",
    "GPU utilization alone says little, while queue depth and KV cache use say a lot.",
    "Use histograms and percentiles, and measure from the client too.",
    "Define SLOs, and alert on budget burn and on what users feel.",
    "Combine metrics, traces and deployment markers to go from symptom to cause.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Your SLO is 99.5% over 30 days (43,200 minutes). What's the error budget in minutes?",
      format: "***",
      accept: ["216"],
      explain: "0.005 × 43,200 = 216 minutes.",
    },
    {
      kind: "mcq",
      q: "TTFT rises, inter-token latency stays normal and waiting requests climb. What's the most likely cause?",
      options: [
        "A failing network cable on one client",
        "Too little capacity for current demand",
        "The tokenizer changed language",
        "Output tokens got shorter",
      ],
      answer: 1,
      explain: "Requests are waiting in the queue, while those already running are unaffected.",
    },
    {
      kind: "mcq",
      q: "Why can't you trust HTTP status alone for streaming responses?",
      options: [
        "Streams don't use HTTP",
        "The 200 is sent at the start, before any later failure",
        "Status codes are encrypted",
        "Browsers ignore status codes",
      ],
      answer: 1,
      explain: "A stream can fail after the status went out, so track finish reasons too.",
    },
    {
      kind: "text",
      q: "98 requests take 1 second and 2 take 50 seconds. What's the p99 latency in seconds?",
      format: "**",
      accept: ["50", "50s"],
      explain: "The 99th of 100 sorted requests is one of the two slow ones.",
    },
  ],
};
