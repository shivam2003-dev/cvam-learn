import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Define SLIs, SLOs, SLAs and error budgets, and use them to decide release pace",
    "Describe release management practices: progressive delivery, rollback, change windows",
    "Plan support for deployed solutions: on-call, runbooks, escalation, vendor support",
    "Evaluate quality controls and testing in production",
    "Ensure reliability with load testing, chaos engineering and penetration testing",
  ],
  tasks: [
    {
      id: "slo",
      title: "SLIs, SLOs and error budgets",
      body: (
        <>
          <Table
            head={["Term", "Meaning", "Example"]}
            rows={[
              ["SLI", "A measured indicator of service health", "Proportion of requests under 300 ms and not 5xx"],
              ["SLO", "Target for an SLI over a window", "99.9% over 30 days"],
              ["SLA", "Contract with consequences if missed (looser than the SLO)", "99.5% with service credits"],
              ["Error budget", "1 - SLO: allowed unreliability", "0.1% = about 43 minutes of full outage per 30 days"],
            ]}
          />
          <ul>
            <li>While budget remains, ship features; when it is spent, slow releases and invest in reliability. This turns the reliability/velocity argument into a shared metric.</li>
            <li>Choose SLIs that reflect user experience (availability, latency, correctness, freshness, throughput); avoid internal metrics as SLOs.</li>
            <li>Reduce <strong>toil</strong> (manual, repetitive, automatable work) through automation; keep it under about half of engineering time.</li>
          </ul>
        </>
      ),
    },
    {
      id: "release",
      title: "Release management and support",
      body: (
        <>
          <Figure caption="Progressive delivery with guardrails. Each step has an automatic check and a rollback.">
            <Flow
              numbered
              steps={[
                { title: "Deploy dark", note: "Feature flag off", tone: "sky" },
                { title: "Canary 1%", note: "Watch SLIs", tone: "lime" },
                { title: "Ramp 10 → 50%", note: "Automated analysis", tone: "lime" },
                { title: "Full", note: "Bake time", tone: "amber" },
                { title: "Cleanup", note: "Remove flag, old revisions", tone: "plain" },
              ]}
            />
          </Figure>
          <ul>
            <li><strong>Release management:</strong> versioning, release notes, change calendars/freezes around peak events, approvals proportional to risk, automated rollback, post-release verification.</li>
            <li><strong>Supporting deployed solutions:</strong> on-call rotations with clear escalation; severity definitions; runbooks linked from alerts; incident command roles and communication templates; status pages; Google Cloud support plans (Standard, Enhanced, Premium) and TAM engagement for critical systems; Personalized Service Health and Service Health alerts for Google Cloud incidents.</li>
            <li><strong>Evaluating quality controls:</strong> code review, static analysis, unit/integration coverage, canary analysis, change failure rate trends, defect escape rate, post-incident action completion, and periodic architecture reviews with the Well-Architected Framework.</li>
          </ul>
        </>
      ),
    },
    {
      id: "testing",
      title: "Proving reliability",
      body: (
        <>
          <Table
            head={["Practice", "Goal", "How on Google Cloud"]}
            rows={[
              ["Load testing", "Find capacity limits and bottlenecks before users do", "Tools such as k6, Locust, JMeter run from Cloud Run jobs/GKE/Compute Engine in the same region; watch autoscaling and quotas; test at 2 to 3 times expected peak"],
              ["Stress/soak testing", "Find breaking points and slow leaks", "Run long duration tests with Profiler and Monitoring"],
              ["Chaos engineering", "Verify resilience by injecting faults in a controlled way", "Kill pods/instances, inject latency, fail a zone dependency; start in staging with a hypothesis and abort criteria; game days"],
              ["Failover/DR drills", "Validate RTO/RPO", "Region failover exercise; restore from backup"],
              ["Penetration testing", "Find exploitable weaknesses", "You may test your own resources without notifying Google if you follow the acceptable use policy and terms; never attack others' resources or shared infrastructure; use Security Command Center and Web Security Scanner too"],
              ["Capacity planning", "Meet growth", "Forecast from metrics; reserve accelerator or VM capacity; request quota increases ahead of events"],
            ]}
          />
          <Callout tone="tip" title="Design for graceful degradation">
            Timeouts, retries with backoff and jitter, circuit breakers, load shedding, queues and
            fallbacks keep partial failures from cascading. Test these paths with fault injection.
          </Callout>
          <Exercise
            title="Black Friday readiness"
            task={<p>An ecommerce team expects 8x traffic. List the reliability activities you would require in the six weeks before.</p>}
          >
            <p>
              Define SLOs and burn-rate alerts; <strong>load test</strong> to 2x of 8x expected peak
              using production-like data; verify autoscaling, quotas (CPU, IPs, API rates) and
              database limits; run a <strong>zone failure game day</strong>; pre-warm caches and set
              min instances; rehearse rollback and the incident process with on-call coverage and a
              change freeze; confirm support plan and contacts. Review results and fix gaps.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "SLIs measure, SLOs target, SLAs contract; error budgets balance velocity and reliability.",
    "Release progressively with flags, canaries, automated checks and rollback; plan on-call, runbooks and escalation.",
    "Prove reliability with load, soak, chaos, DR and penetration testing under the platform's policies.",
    "Design graceful degradation: timeouts, backoff, circuit breakers and load shedding.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A 99.9% SLO leaves an error budget of:",
      options: ["0.1%", "1%", "10%", "0.01%"],
      answer: 0,
      explain: "Error budget = 100% minus the SLO = 0.1%.",
    },
    {
      kind: "mcq",
      q: "When the error budget is exhausted, what should the team do?",
      options: ["Slow feature releases and prioritise reliability work", "Ignore it", "Increase the SLO to 100%", "Delete alerts"],
      answer: 0,
      explain: "Spent budgets signal that stability work takes priority.",
    },
    {
      kind: "mcq",
      q: "What is the purpose of chaos engineering?",
      options: ["Verify resilience by injecting controlled failures", "Increase traffic", "Reduce costs", "Replace testing"],
      answer: 0,
      explain: "It tests hypotheses about failure handling in a controlled way.",
    },
    {
      kind: "mcq",
      q: "Which differs between an SLO and an SLA?",
      options: ["An SLA is a contract with consequences; an SLO is an internal target", "They are identical", "SLO has penalties", "SLA is measured by CPU"],
      answer: 0,
      explain: "SLAs carry contractual consequences and are usually looser than SLOs.",
    },
    {
      kind: "text",
      q: "What term describes manual, repetitive work that can be automated?",
      format: "****",
      accept: ["toil"],
      explain: "Toil is the manual repetitive operational work SRE aims to reduce.",
    },
  ],
};
