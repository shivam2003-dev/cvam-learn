import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Apply a systematic troubleshooting and root cause analysis method",
    "Use Google Cloud tools to investigate: Logging, Monitoring, Trace, Error Reporting, Network Intelligence, Gemini Cloud Assist",
    "Write blameless postmortems with actionable follow-ups",
    "Test and validate disaster recovery plans with measured RTO and RPO",
  ],
  tasks: [
    {
      id: "method",
      title: "A method for incidents",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="troubleshooting-dr-testing-diagram-1" />
          <ul>
            <li><strong>Mitigate before you understand.</strong> Restore service first (rollback, shift traffic), then find root cause.</li>
            <li><strong>Check what changed:</strong> deployments, config, flags, quotas, certificates, dependencies, traffic. Audit logs and release history answer this fast.</li>
            <li><strong>Use the four golden signals:</strong> latency, traffic, errors, saturation. Narrow by region, version, endpoint, customer.</li>
            <li><strong>Binary search the path:</strong> client → DNS → load balancer → service → dependency → database; use traces to see where time or errors accumulate.</li>
            <li><strong>Five whys</strong> to find systemic causes, not just the proximate trigger.</li>
          </ul>
        </>
      ),
    },
    {
      id: "tools",
      title: "Tools by symptom",
      body: (
        <>
          <Table
            head={["Symptom", "Tool", "What to look for"]}
            rows={[
              ["Errors spiking", "Error Reporting, Cloud Logging", "New exception groups after a deploy; severity>=ERROR queries"],
              ["Slow requests", "Cloud Trace, Profiler, Monitoring", "Which span dominates; CPU or lock hotspots in code"],
              ["Network unreachable", "Network Intelligence Center: Connectivity Tests, Firewall Insights, VPC Flow Logs", "Reachability analysis, denied packets, shadowed rules"],
              ["Load balancer 502/503", "Load balancer logs, backend health", "Health check firewall, backend capacity, timeouts"],
              ["Permission denied", "Audit logs, Policy Troubleshooter", "Which permission and which policy denies"],
              ["Quota errors", "Quotas page, Monitoring quota metrics", "Which quota and region"],
              ["Unexpected cost", "Billing export to BigQuery, Cost anomaly", "SKU, project, label"],
              ["Unknown / complex", "Gemini Cloud Assist investigations", "Guided analysis of logs, metrics and config to suggest causes and fixes"],
            ]}
          />
          <Callout tone="tip" title="Connectivity Tests">
            Network Intelligence Center Connectivity Tests analyse the configured path between two
            endpoints (VMs, GKE, on-premises addresses, load balancers) and show the hop that blocks
            traffic, like a static config analysis. Use it before packet capture.
          </Callout>
        </>
      ),
    },
    {
      id: "post",
      title: "Postmortems and DR testing",
      body: (
        <>
          <ul>
            <li><strong>Blameless postmortem:</strong> timeline, impact (users, minutes, money), detection, mitigation, root and contributing causes, what went well and badly, and owner-assigned action items with deadlines. Focus on systems, not individuals.</li>
            <li><strong>Prevent recurrence:</strong> add tests, alerts, runbooks, guardrails or automation; track actions to completion.</li>
            <li><strong>DR testing:</strong> tabletop exercises, restore tests from backups, regional failover drills, chaos and game days. Measure actual RTO and RPO and compare with targets; update runbooks; test dependency failures (DNS, identity, CI).</li>
            <li><strong>Backups:</strong> verify integrity and restoreability; keep copies in another region/project with separate permissions to resist ransomware.</li>
          </ul>
          <Exercise
            title="Triage an outage"
            task={<p>After a Friday deploy, 5 percent of checkout requests fail with 503 from the load balancer. CPU is normal. What do you do in order?</p>}
          >
            <p>
              (1) <strong>Mitigate:</strong> roll back to the previous revision (or shift traffic away
              from the canary). (2) <strong>Scope:</strong> filter load balancer logs by backend,
              revision and URL; the failure maps to the new revision. (3) <strong>Diagnose:</strong>{" "}
              Error Reporting and Trace show a dependency timeout; check quotas and health checks.
              (4) <strong>Fix</strong> in code or config with a canary and verification. (5){" "}
              <strong>Postmortem</strong> with actions: add a canary SLO alert, load test the
              dependency path, add auto-rollback.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Mitigate first, then diagnose using what changed, golden signals and the request path.",
    "Match tools to symptoms: Error Reporting, Trace, Profiler, Connectivity Tests, Firewall Insights, Policy Troubleshooter, Gemini Cloud Assist.",
    "Blameless postmortems produce tracked actions; verify fixes with tests and alerts.",
    "Test DR for real and record measured RTO and RPO.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A deploy causes errors. What should you do first?",
      options: ["Roll back or shift traffic to restore service", "Write the postmortem", "Add features", "Delete logs"],
      answer: 0,
      explain: "Mitigate impact before investigating root cause.",
    },
    {
      kind: "mcq",
      q: "Which tool analyses the configured network path between two endpoints without sending traffic?",
      options: ["Connectivity Tests", "Cloud Profiler", "Error Reporting", "Cloud Debugger"],
      answer: 0,
      explain: "Connectivity Tests perform configuration analysis of paths.",
    },
    {
      kind: "mcq",
      q: "Which tool shows where time is spent across microservices in a request?",
      options: ["Cloud Trace", "Cloud Armor", "Cloud KMS", "Cloud DNS"],
      answer: 0,
      explain: "Cloud Trace shows distributed latency by span.",
    },
    {
      kind: "mcq",
      q: "A good postmortem is:",
      options: ["Blameless with owned action items", "Focused on who made the mistake", "Private and unwritten", "Only for outages over a day"],
      answer: 0,
      explain: "Blameless culture encourages honest analysis and systemic fixes.",
    },
    {
      kind: "text",
      q: "Name the four golden signals: latency, traffic, errors, and what?",
      format: "**********",
      accept: ["saturation"],
      explain: "Latency, traffic, errors and saturation.",
    },
  ],
};
