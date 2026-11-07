import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Medium",
  objectives: [
    "Design monitoring, logging and alerting with Google Cloud Observability",
    "Use log sinks, buckets, log-based metrics and exclusion filters correctly",
    "Create alerting policies, uptime checks, dashboards and SLO monitoring",
    "Apply profiling, tracing and benchmarking to find performance issues",
    "Use Gemini Cloud Assist and Application Monitoring for investigation",
  ],
  tasks: [
    {
      id: "pillars",
      title: "The observability suite",
      body: (
        <>
          <Table
            head={["Pillar / service", "Purpose", "Key points"]}
            rows={[
              ["Cloud Monitoring", "Metrics, dashboards, alerting, uptime checks, SLOs", "System metrics free for Google services; custom and Prometheus metrics (Managed Service for Prometheus); metrics scopes to view many projects"],
              ["Cloud Logging", "Central log storage, search, analytics", "Log buckets (_Required, _Default, user-defined), sinks, Log Analytics (SQL), log-based metrics, retention per bucket"],
              ["Cloud Trace", "Distributed tracing for latency", "OpenTelemetry instrumentation; find slow spans"],
              ["Cloud Profiler", "Continuous CPU/memory profiling in production", "Low overhead; flame graphs"],
              ["Error Reporting", "Groups and counts application exceptions", "Notifications for new error groups"],
              ["Application Monitoring / Gemini Cloud Assist", "App-centric views and AI-assisted investigation", "Suggests causes, queries and fixes"],
              ["Managed Prometheus, Ops Agent", "Collect metrics and logs from VMs and Kubernetes", "Ops Agent on Compute Engine; GKE integration built in"],
            ]}
          />
          <CloudDiagram course="gcp-pca" id="observability-monitoring-diagram-1" />
        </>
      ),
    },
    {
      id: "alerts",
      title: "Alerting strategy",
      body: (
        <>
          <ul>
            <li><strong>Alert on symptoms users feel</strong> (error rate, latency, availability against SLOs), not every cause (CPU 80 percent). Add cause-based alerts only where they are early and actionable.</li>
            <li><strong>Burn-rate alerts</strong> on SLOs: page when the error budget is being consumed too quickly (for example a fast burn over 1 hour and a slow burn over 6 hours) to balance speed and noise.</li>
            <li><strong>Alerting policies</strong> combine conditions (threshold, absence, rate of change, forecast, MQL/PromQL), duration and notification channels (email, SMS, Slack, PagerDuty, Pub/Sub, webhooks) with documentation and runbook links.</li>
            <li><strong>Uptime checks</strong> probe public or private endpoints from multiple regions; use them for availability SLIs.</li>
            <li><strong>Severity and routing:</strong> page for urgent customer impact, ticket for non-urgent; avoid alert fatigue; review alerts regularly.</li>
            <li><strong>Dashboards:</strong> golden signals per service, per-environment, with SLO widgets.</li>
          </ul>
          <Callout tone="warn" title="Logging cost and compliance">
            Logs can be costly. Use exclusion filters for noisy low-value logs, route required audit
            logs through sinks to cheap, locked storage, and set bucket retention to meet policy. The{" "}
            <code>_Required</code> bucket (admin activity audit logs) is kept 400 days and cannot be
            modified.
          </Callout>
        </>
      ),
    },
    {
      id: "perf",
      title: "Profiling and benchmarking",
      body: (
        <>
          <ul>
            <li><strong>Baseline first</strong> with load tests and production metrics; compare before and after each change.</li>
            <li><strong>Trace</strong> to find the slow service or call; <strong>profile</strong> to find hot code paths; <strong>logs</strong> for context; <strong>metrics</strong> to quantify.</li>
            <li><strong>Benchmark</strong> machine types, database settings and storage classes with representative workloads (for example PerfKitBenchmarker) before committing to a size or commitment.</li>
            <li>Use Recommender and Gemini Cloud Assist for sizing and optimisation suggestions, then validate with tests.</li>
          </ul>
          <Exercise
            title="Design an alert"
            task={<p>An API has a 99.9 percent monthly availability SLO. The team is paged for CPU alerts all night but customers noticed an outage the monitoring missed. How do you redesign alerting?</p>}
          >
            <p>
              Define an availability SLI (good requests over total from load balancer metrics or
              uptime checks) and an SLO of 99.9 percent. Create <strong>burn-rate alerts</strong> (a
              fast-burn page and a slow-burn ticket). Remove or downgrade CPU-threshold pages to
              dashboards or tickets. Add an <strong>uptime check</strong> from multiple regions for
              end-to-end coverage and a runbook link in each alert. Review alert quality monthly.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Monitoring (metrics, alerts, SLOs), Logging (buckets, sinks, log-based metrics), Trace, Profiler and Error Reporting form the suite; Gemini Cloud Assist helps investigate.",
    "Alert on user-visible symptoms and SLO burn rate, with runbooks; reduce noise.",
    "Use sinks and exclusion filters to control cost and meet retention; know the _Required bucket.",
    "Baseline and benchmark before and after changes; profile and trace to find bottlenecks.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which approach reduces alert noise while catching real customer impact?",
      options: ["SLO burn-rate alerts", "Alert on every CPU spike", "No alerts", "Only email alerts daily"],
      answer: 0,
      explain: "Burn-rate alerts track error budget consumption and map to user impact.",
    },
    {
      kind: "mcq",
      q: "Which service continuously profiles CPU and memory in production?",
      options: ["Cloud Profiler", "Cloud Trace", "Error Reporting", "Cloud Armor"],
      answer: 0,
      explain: "Cloud Profiler gives low-overhead production profiling and flame graphs.",
    },
    {
      kind: "mcq",
      q: "How do you export logs to BigQuery for analysis?",
      options: ["Create a log sink to BigQuery", "Download manually", "Enable Cloud CDN", "Use a firewall rule"],
      answer: 0,
      explain: "Sinks route matching logs to BigQuery, Cloud Storage, Pub/Sub or other buckets.",
    },
    {
      kind: "mcq",
      q: "Which feature creates a metric from log patterns?",
      options: ["Log-based metrics", "Uptime checks", "Cloud Debugger", "Trace sampling"],
      answer: 0,
      explain: "Log-based metrics count or extract values from log entries.",
    },
    {
      kind: "text",
      q: "What are the four golden signals? Give the one that measures resource fullness.",
      format: "**********",
      accept: ["saturation"],
      explain: "Saturation measures how full the system is; the others are latency, traffic and errors.",
    },
  ],
};
