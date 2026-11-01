import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain how Prometheus scrapes and stores metrics",
    "Instrument a Python model server with counters, gauges and histograms",
    "Write PromQL for throughput, error rate and p95 latency",
    "Build Grafana dashboards and alerts while keeping cardinality under control",
  ],
  tasks: [
    {
      id: "how-it-works",
      title: "Two tools, two jobs",
      body: (
        <>
          <p>
            Your model server runs on a dozen pods. Someone asks whether latency got worse after
            last night's release. Log files can't answer that quickly. You need numbers collected
            over time, in one place, that you can query and chart.
          </p>
          <p>
            <strong>Prometheus</strong> collects and stores those numbers as time series.{" "}
            <strong>Grafana</strong> draws them. Think of a weather station: Prometheus is the
            instrument that takes a reading every few seconds and files it away, and Grafana is the
            forecast screen that makes those readings readable.
          </p>
          <p>
            Prometheus uses a <strong>pull</strong> model. Your service exposes its current metrics
            as plain text at an HTTP endpoint, usually <code>/metrics</code>. Every 15 seconds or so,
            Prometheus fetches that page, which is called a <strong>scrape</strong>, and saves the
            values. If a scrape fails, Prometheus records that too, so a dead target is easy to spot.
          </p>
          <Table
            head={["Component", "Role"]}
            rows={[
              ["Your app", "Exposes metrics through a client library"],
              ["Exporters", "Expose metrics for things you don't own, like hosts or GPUs"],
              ["Prometheus", "Scrapes targets, stores series, evaluates rules"],
              ["Alertmanager", "Groups alerts and routes them to Slack, email or a pager"],
              ["Grafana", "Queries Prometheus and displays dashboards"],
            ]}
          />
          <p>
            Common exporters include <code>node_exporter</code> for CPU, memory and disk, and
            NVIDIA's DCGM exporter for GPU utilization, memory and temperature. Short batch jobs may
            finish before a scrape happens, so they can send results to a Pushgateway, which
            Prometheus then scrapes.
          </p>
        </>
      ),
    },
    {
      id: "metric-types",
      title: "Metric types and instrumenting a model server",
      body: (
        <>
          <p>A time series is a metric name plus a set of labels. There are four types:</p>
          <Table
            head={["Type", "Behavior", "Use it for"]}
            rows={[
              ["Counter", "Only goes up; resets on restart", "Requests, errors, tokens served"],
              ["Gauge", "Goes up and down", "Queue depth, loaded model count, PSI score"],
              ["Histogram", "Counts observations in buckets", "Latency, payload size"],
              ["Summary", "Computes quantiles in the client", "Latency for a single instance"],
            ]}
          />
          <p>
            Prefer histograms for latency. Bucket counts from many pods can be added together on the
            server, while quantiles from a summary generally cannot be averaged in a meaningful way.
          </p>
          <pre>
            <code>{`from prometheus_client import Counter, Gauge, Histogram, start_http_server

PREDICTIONS = Counter(
    "model_predictions_total", "Predictions served",
    ["model", "version", "outcome"],
)
LATENCY = Histogram(
    "model_inference_seconds", "Inference latency",
    ["model"],
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5),
)
FEATURE_PSI = Gauge(
    "model_feature_psi", "Latest PSI score",
    ["model", "feature"],
)

start_http_server(8000)  # serves /metrics on port 8000

def predict(features):
    with LATENCY.labels(model="churn").time():
        try:
            result = model.predict(features)
        except Exception:
            PREDICTIONS.labels("churn", "1.4.2", "error").inc()
            raise
    PREDICTIONS.labels("churn", "1.4.2", "ok").inc()
    return result`}</code>
          </pre>
          <p>Then point Prometheus at that port in <code>prometheus.yml</code>:</p>
          <pre>
            <code>{`global:
  scrape_interval: 15s

rule_files:
  - "ml_alerts.yml"

scrape_configs:
  - job_name: "model-server"
    static_configs:
      - targets: ["model-server:8000"]`}</code>
          </pre>
          <Callout tone="note">
            If your server uses several worker processes, each one holds its own counters, so a
            plain scrape only sees one of them. The Python client has a multiprocess mode for this
            case. In Kubernetes, targets are normally discovered automatically instead of being
            listed by hand.
          </Callout>
        </>
      ),
    },
    {
      id: "promql",
      title: "Querying with PromQL",
      body: (
        <>
          <p>
            PromQL is Prometheus's query language. A raw counter is not useful, because it only climbs.
            What you want is its speed, and that is what <code>rate()</code> gives you:
          </p>
          <Formula>rate ≈ (last value − first value) ÷ window in seconds</Formula>
          <p>
            A worked example: a counter goes from 12,000 to 12,600 over 5 minutes. That is 600
            requests in 300 seconds, or <strong>2 requests per second</strong>. <code>rate()</code>{" "}
            also handles counter resets, so a restart does not look like a huge negative drop.
          </p>
          <pre>
            <code>{`# Throughput per version
sum by (version) (rate(model_predictions_total[5m]))

# Error ratio
sum(rate(model_predictions_total{outcome="error"}[5m]))
  / sum(rate(model_predictions_total[5m]))

# p95 latency across all pods
histogram_quantile(
  0.95,
  sum by (le) (rate(model_inference_seconds_bucket[5m]))
)`}</code>
          </pre>
          <p>
            Histogram quantiles are estimates. Each bucket is cumulative, labelled <code>le</code> for
            "less than or equal". Suppose 1,000 requests fall like this:
          </p>
          <Table
            head={["Bucket limit (s)", "Cumulative count"]}
            rows={[
              ["0.05", "700"],
              ["0.1", "900"],
              ["0.25", "980"],
              ["0.5", "1,000"],
            ]}
          />
          <p>
            The 95th percentile is request number 950, which sits between the 0.1 and 0.25 limits.
            Prometheus assumes values spread evenly within the bucket:
          </p>
          <pre>
            <code>{`0.1 + (950 − 900) ÷ (980 − 900) × (0.25 − 0.1)
= 0.1 + 0.625 × 0.15
= 0.194 s, about 194 ms`}</code>
          </pre>
          <p>
            So choose bucket limits around the values you care about. If your target is 200 ms, put a
            limit near 200 ms, or the estimate around your target will be coarse.
          </p>
        </>
      ),
    },
    {
      id: "grafana",
      title: "Dashboards in Grafana",
      body: (
        <>
          <p>
            In Grafana, you add Prometheus as a <strong>data source</strong>, then build a{" "}
            <strong>dashboard</strong> from <strong>panels</strong>. Each panel holds one or more
            queries and a visualization, such as a time series, a stat or a heatmap.
          </p>
          <p>
            A dashboard <strong>variable</strong> saves you from cloning panels. Define a variable
            called <code>model</code> using a Prometheus label query, and every panel can filter on
            it through a dropdown:
          </p>
          <pre>
            <code>{`# Variable query
label_values(model_predictions_total, model)

# Panel query
sum by (version) (rate(model_predictions_total{model="$model"}[5m]))`}</code>
          </pre>
          <p>A useful layout for a model service, from top to bottom:</p>
          <ul>
            <li><strong>Health:</strong> throughput, error ratio and p95 latency.</li>
            <li><strong>Saturation:</strong> queue depth, GPU utilization and memory.</li>
            <li><strong>Model signals:</strong> prediction mix per version and PSI on top features.</li>
          </ul>
          <p>
            Batch jobs can compute drift scores on a schedule and publish them to the{" "}
            <code>model_feature_psi</code> gauge. That puts your model monitoring next to your
            service metrics, on one screen. Dashboards can be exported as JSON, so you can keep them
            in Git with your other configuration.
          </p>
        </>
      ),
    },
    {
      id: "alerts-cardinality",
      title: "Alerts and the cardinality trap",
      body: (
        <>
          <p>
            A dashboard only helps if someone is looking at it. Alert rules run all the time.
            Prometheus evaluates them and sends firing alerts to Alertmanager.
          </p>
          <pre>
            <code>{`groups:
  - name: model-serving
    rules:
      - alert: HighInferenceLatency
        expr: |
          histogram_quantile(0.95,
            sum by (le) (rate(model_inference_seconds_bucket[5m]))
          ) > 0.5
        for: 10m
        labels:
          severity: page
        annotations:
          summary: "p95 inference latency above 500 ms"`}</code>
          </pre>
          <p>
            The <code>for: 10m</code> line means the condition must hold for 10 minutes before the
            alert fires, which filters out short spikes. Alert on symptoms users feel, such as
            errors and latency, rather than on every internal number.
          </p>
          <p>
            The classic mistake is a label with too many values. Every unique combination of labels
            creates a new time series, and each series costs memory. This is called{" "}
            <strong>cardinality</strong>. Take a histogram with 10 bucket limits. That exposes about
            13 series per label set: 11 buckets including <code>+Inf</code>, plus a sum and a count.
          </p>
          <Formula>4 models × 3 versions × 20 pods × 13 series = 3,120 series</Formula>
          <p>
            That is fine. Now add a <code>user_id</code> label with 100,000 values, and you get 312
            million potential series, which will overload a typical Prometheus server.
          </p>
          <Callout tone="warn">
            Never use user IDs, request IDs, raw prompts or other unbounded values as labels. Keep
            those in logs or traces. Metrics are for aggregates. Keep model version labels
            bounded too, and retire old versions.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Prometheus pulls metrics from /metrics endpoints and stores them as time series; Grafana visualizes them.",
    "Use counters for totals, gauges for current values and histograms for latency.",
    "rate() turns a counter into a per-second speed, and histogram_quantile() estimates percentiles from buckets.",
    "Alert on user-facing symptoms, and require the condition to hold for a while before firing.",
    "Every label combination is a new series, so keep label values bounded.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which metric type fits the current number of requests waiting in a queue?",
      options: ["Counter", "Gauge", "Histogram", "Summary"],
      answer: 1,
      explain: "Queue depth rises and falls, so it is a gauge.",
    },
    {
      kind: "mcq",
      q: "Why are histograms preferred over summaries for latency across many pods?",
      options: [
        "Histograms use no memory",
        "Bucket counts can be added across pods before estimating a quantile",
        "Summaries cannot record latency",
        "Grafana can only draw histograms",
      ],
      answer: 1,
      explain: "Histogram buckets aggregate cleanly. Quantiles computed per client generally do not.",
    },
    {
      kind: "mcq",
      q: "Which of these is the worst choice for a Prometheus label?",
      options: ["model", "version", "request_id", "outcome"],
      answer: 2,
      explain: "A request ID is unique per request, so it would create a new series every time.",
    },
    {
      kind: "text",
      q: "A counter rises from 3,000 to 3,900 over 5 minutes. What is the rate in requests per second?",
      format: "*",
      accept: ["3", "3.0"],
      explain: "900 requests ÷ 300 seconds = 3 per second.",
    },
    {
      kind: "text",
      q: "Which PromQL function estimates a percentile from histogram buckets?",
      format: "******************",
      accept: ["histogram_quantile", "histogram quantile", "histogram_quantile()"],
      explain: "histogram_quantile() interpolates inside the bucket that holds the target rank.",
    },
  ],
};
