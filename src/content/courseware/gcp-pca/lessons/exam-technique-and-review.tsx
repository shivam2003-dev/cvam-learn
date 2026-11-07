import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Read PCA questions for constraints and eliminate distractors systematically",
    "Recognise recurring decision patterns across the six sections",
    "Manage time over about 50 to 60 questions in 2 hours, including two case studies",
    "Run a final-week review and exam-day checklist",
  ],
  tasks: [
    {
      id: "read",
      title: "Reading the question",
      body: (
        <>
          <Figure caption="A four-pass reading method. Constraint words decide the answer, not familiar service names.">
            <Flow
              numbered
              steps={[
                { title: "Ask", note: "What exactly must I choose?", tone: "sky" },
                { title: "Constraints", note: "Cost, latency, residency, skills, effort, time", tone: "amber" },
                { title: "Eliminate", note: "Cross out options violating a constraint", tone: "lime" },
                { title: "Pick", note: "Most managed option that satisfies all", tone: "rose" },
              ]}
            />
          </Figure>
          <ul>
            <li>Watch qualifiers: <em>most cost-effective</em>, <em>least operational overhead</em>, <em>minimal changes</em>, <em>fastest</em>, <em>most secure</em>, <em>highly available</em>.</li>
            <li><strong>Multiple select</strong> questions tell you how many to choose; each must be correct.</li>
            <li>Prefer managed and serverless services, Google-recommended practices and the Well-Architected pillars when requirements are equal.</li>
            <li>Beware answers that are technically possible but ignore a stated constraint such as data residency or team skills.</li>
          </ul>
        </>
      ),
    },
    {
      id: "patterns",
      title: "Patterns to recognise",
      body: (
        <>
          <Table
            head={["Clue", "Think"]}
            rows={[
              ["Global users, HTTP, WAF, CDN", "Global external Application Load Balancer + Cloud CDN + Cloud Armor"],
              ["Relational, global scale, 99.999%, zero RPO across regions", "Spanner multi-region"],
              ["Massive time series / key-value, low latency", "Bigtable"],
              ["Standard MySQL/Postgres/SQL Server lift and shift", "Cloud SQL with Database Migration Service"],
              ["Stateless containers, spiky traffic, small team", "Cloud Run"],
              ["Kubernetes needed, Google manages nodes", "GKE Autopilot"],
              ["Fault-tolerant batch at lowest cost", "Spot VMs / Batch / Dataproc with preemptible workers"],
              ["Stream ingest and transform", "Pub/Sub + Dataflow + BigQuery"],
              ["Existing Spark/Hadoop", "Dataproc (ephemeral clusters, Cloud Storage)"],
              ["Move VMware as-is, quickly", "Google Cloud VMware Engine"],
              ["Hundreds of TB, slow link", "Transfer Appliance"],
              ["Many projects share one network", "Shared VPC"],
              ["Overlapping IPs / publish one service", "Private Service Connect"],
              ["Stop data exfiltration even with valid credentials", "VPC Service Controls"],
              ["Restrict locations or external IPs org-wide", "Organization Policy"],
              ["Keys outside Google", "Cloud EKM"],
              ["CI without keys from GitHub", "Workload Identity Federation"],
              ["Only signed images in prod", "Binary Authorization"],
              ["LLM prompt injection / PII leak", "Model Armor + Sensitive Data Protection"],
              ["Reduce alert noise, reflect user impact", "SLO burn-rate alerts"],
            ]}
          />
        </>
      ),
    },
    {
      id: "time",
      title: "Time, mindset and final week",
      body: (
        <>
          <ul>
            <li><strong>Pace:</strong> 120 minutes for 50 to 60 questions is about 2 minutes each. Case studies need a quick upfront summary; reuse it.</li>
            <li><strong>Flag and return:</strong> answer, flag unsure items and revisit with spare time. Never leave blanks.</li>
            <li><strong>Draw:</strong> sketch architectures on the provided whiteboard for networking and migration questions.</li>
          </ul>
          <Table
            head={["Section", "Final check"]}
            rows={[
              ["1. Design and plan", "Disposition, pillars, DR patterns, compute/storage/data/network choice, hybrid options, migration tools, AI building blocks"],
              ["2. Provision", "Load balancer types, storage config, MIG/GKE/Cloud Run settings, Terraform, ML workflows, prebuilt APIs"],
              ["3. Security", "IAM, service accounts, KMS options, VPC SC, org policy, firewall policies, IAP, supply chain, Model Armor, compliance"],
              ["4. Processes", "CI/CD, release strategies, RCA, DR tests, CapEx/OpEx, FinOps, stakeholder management"],
              ["5. Implementation", "Apigee, gcloud/SDKs, ADC, emulators, Terraform state"],
              ["6. Operations", "Monitoring, logging sinks, burn-rate alerts, SLOs, chaos, load tests"],
            ]}
          />
          <Callout tone="tip" title="Use the practice exam">
            Take the timed practice exam in the Practice Exams section, review every explanation,
            and use the cheat sheet. Repeat only the sections where your performance report shows
            below 70 percent.
          </Callout>
          <Exercise
            title="Self-test"
            task={<p>Without notes, explain in two minutes how you would choose between Cloud Run, GKE Autopilot and Compute Engine for a new workload.</p>}
          >
            <p>
              Start with Cloud Run for stateless HTTP/gRPC containers and event handlers (least ops,
              scale to zero). Choose GKE Autopilot when you need Kubernetes APIs, operators, sidecars
              or GPU pods at scale. Choose Compute Engine for custom OS or kernel, licensed or
              stateful legacy software, special hardware, or lift and shift, using MIGs for scale.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Read the final question, mark constraints, eliminate violators, choose the most managed compliant option.",
    "Memorise clue-to-service patterns across all six sections.",
    "Pace about 2 minutes per question, flag and return, summarise each case study once.",
    "Use timed practice exams and the performance report to target weak sections.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Two answers meet the requirements; one uses a managed service and the other custom scripts. Which?",
      options: ["The managed service", "The scripts", "Neither", "Whichever has more components"],
      answer: 0,
      explain: "Google-recommended, managed options reduce operational overhead.",
    },
    {
      kind: "mcq",
      q: "A question stresses 'stop data copying even with valid credentials'. Think:",
      options: ["VPC Service Controls", "Cloud NAT", "Cloud CDN", "Cloud DNS"],
      answer: 0,
      explain: "VPC SC perimeters block API calls crossing the boundary.",
    },
    {
      kind: "mcq",
      q: "Roughly how long should you spend per question on a 2-hour, 55-question exam?",
      options: ["About 2 minutes", "10 minutes", "30 seconds", "5 minutes"],
      answer: 0,
      explain: "120 minutes divided by 55 questions is about 2 minutes each.",
    },
    {
      kind: "mcq",
      q: "What should you do with an unsure question?",
      options: ["Answer, flag it and revisit", "Leave it blank", "Skip the exam", "Spend 15 minutes"],
      answer: 0,
      explain: "Answer and flag; there is no benefit to leaving blanks.",
    },
    {
      kind: "text",
      q: "How many case studies are in each standard PCA exam?",
      format: "*",
      accept: ["2", "two"],
      explain: "Two case studies per exam.",
    },
  ],
};
