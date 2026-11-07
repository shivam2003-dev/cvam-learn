import type { CheatSection, Exam, ExamSection } from "@/lib/exams";
import { questions } from "./questions";

const sections: ExamSection[] = [
  { id: 1, name: "Designing and planning a cloud solution architecture", weight: 25, lessons: ["business-requirements-wellarchitected", "ha-dr-scalability", "compute-choices", "storage-database-choices", "data-processing-analytics", "networking-design", "hybrid-multicloud-connectivity", "migration-planning", "ai-ml-solution-design"] },
  { id: 2, name: "Managing and provisioning a cloud solution infrastructure", weight: 17.5, lessons: ["load-balancing-edge-security", "storage-configuration-lifecycle", "compute-configuration-iac", "ai-platform-workflows", "prebuilt-ai-apis"] },
  { id: 3, name: "Designing for security and compliance", weight: 17.5, lessons: ["iam-resource-hierarchy", "data-protection-kms-secrets", "perimeter-controls", "supply-chain-ai-security", "compliance-governance"] },
  { id: 4, name: "Analyzing and optimizing technical and business processes", weight: 15, lessons: ["sdlc-cicd-testing", "troubleshooting-dr-testing", "business-processes-finops"] },
  { id: 5, name: "Managing implementation", weight: 12.5, lessons: ["api-management-apigee", "programmatic-access-terraform"] },
  { id: 6, name: "Ensuring solution and operations excellence", weight: 12.5, lessons: ["observability-monitoring", "release-reliability-sre"] },
];

const cheatsheet: CheatSection[] = [
  {
    section: 1,
    title: "Design and plan",
    points: [
      "Requirements: functional vs non-functional (availability, latency, RTO/RPO), constraints (budget, skills, residency, licences). Disposition: build, buy, modify, deprecate.",
      "Well-Architected pillars: operational excellence, security/privacy/compliance, reliability, cost optimization, performance optimization, sustainability.",
      "Availability: serial dependencies multiply; add redundancy in parallel. 99.9% ≈ 8.8 h/yr, 99.99% ≈ 53 min/yr, 99.999% ≈ 5 min/yr.",
      "DR patterns by cost: backup/restore < pilot light < warm standby < hot active/active.",
    ],
    table: {
      head: ["Need", "Pick"],
      rows: [
        ["Stateless container, spiky, small team", "Cloud Run"],
        ["Kubernetes, nodes managed by Google", "GKE Autopilot"],
        ["Custom OS, licensed or legacy, special hardware", "Compute Engine (MIG for scale)"],
        ["Fault-tolerant batch, lowest cost", "Spot VMs / Batch"],
        ["Global relational, strong consistency, 99.999%", "Spanner multi-region"],
        ["Standard MySQL/PostgreSQL/SQL Server", "Cloud SQL (HA = regional standby)"],
        ["Demanding PostgreSQL, analytics acceleration", "AlloyDB"],
        ["Massive key-value / time series", "Bigtable"],
        ["Documents, mobile sync", "Firestore"],
        ["Cache", "Memorystore"],
        ["Warehouse analytics", "BigQuery (partition + cluster)"],
        ["Stream ingest → transform → analyze", "Pub/Sub → Dataflow → BigQuery"],
        ["Existing Spark/Hadoop", "Dataproc (ephemeral clusters)"],
        ["Cloud Storage classes", "Standard, Nearline 30d, Coldline 90d, Archive 365d, Autoclass"],
      ],
    },
  },
  {
    section: 1,
    title: "Network, hybrid and migration",
    points: [
      "VPC is global, subnets regional, firewall rules stateful. Use custom mode VPCs. Cloud NAT = outbound only. Private Google Access for APIs without external IPs.",
      "Cloud Router = managed BGP. Global dynamic routing for multi-region VPCs.",
      "Interconnect 99.99%: 4 connections across 2 metros. 99.9%: 2 connections in 1 metro, different edge availability domains.",
      "Migration: assess (Migration Center) → plan → migrate → optimize. The six strategies: rehost, replatform, refactor, repurchase, retire, retain.",
    ],
    table: {
      head: ["Need", "Pick"],
      rows: [
        ["Many projects, one central network", "Shared VPC"],
        ["Simple VPC-to-VPC, no overlap, non-transitive", "VPC Network Peering"],
        ["Publish a service; overlapping IPs", "Private Service Connect"],
        ["Hub-and-spoke incl. hybrid spokes", "Network Connectivity Center"],
        ["Quick/low-cost hybrid or backup", "HA VPN (99.99% with 2 tunnels + BGP)"],
        ["High steady bandwidth, in a colo", "Dedicated Interconnect (10/100 Gbps)"],
        ["High bandwidth, not in a colo", "Partner Interconnect (50 Mbps–50 Gbps)"],
        ["Private link to AWS/Azure", "Cross-Cloud Interconnect"],
        ["Move VMware as-is", "VMware Engine"],
        ["VMs / databases / files / huge data", "Migrate to VMs / DMS / Storage Transfer / Transfer Appliance"],
      ],
    },
  },
  {
    section: 2,
    title: "Provision and configure",
    points: [
      "Health checks need firewall access from 130.211.0.0/22 and 35.191.0.0/16.",
      "MIG: instance template, regional spread, autoscaling, autohealing (app health check), rolling update (max unavailable 0 + surge keeps capacity).",
      "Cloud Run to private resources: Direct VPC egress or VPC connector; ingress internal-and-cloud-load-balancing keeps traffic behind the LB.",
      "Cloud Storage: uniform bucket-level access, lifecycle, versioning/soft delete, retention policy + lock (irreversible), CMEK.",
      "Terraform: remote state in versioned GCS, plan in CI, modules; Infrastructure Manager is managed Terraform.",
    ],
    table: {
      head: ["Load balancer", "Use"],
      rows: [
        ["Global external Application LB", "Internet HTTP(S), anycast IP, CDN, Cloud Armor, IAP"],
        ["Regional external Application LB", "Regional HTTP(S), Standard Tier, residency"],
        ["Internal Application LB", "Private L7 microservices, hybrid clients"],
        ["External proxy Network LB", "Non-HTTP TCP with SSL offload"],
        ["External passthrough Network LB", "UDP/TCP, preserve client IP"],
        ["Internal passthrough Network LB", "Internal L4, appliances as next hop"],
      ],
    },
  },
  {
    section: 3,
    title: "Security and compliance",
    points: [
      "IAM: allow policies inherit down the hierarchy (union). Predefined roles > basic roles. Groups over individuals. Deny policies override allows.",
      "Service accounts: dedicated per workload, attached identity, impersonation (Token Creator), no keys; WIF for external workloads, Workforce Identity Federation for staff.",
      "Org Policy = what may exist (locations, external IPs, key creation). VPC SC = which API calls may cross a perimeter (stops exfiltration despite IAM). Use dry run first.",
      "Keys: default Google-managed → CMEK (Cloud KMS) → HSM → EKM (outside Google). CSEK only for Cloud Storage and Compute disks. Separate key admin from key user.",
      "Audit logs: Admin Activity always on; Data Access off by default (except BigQuery); Access Transparency logs, Access Approval gates Google access.",
    ],
    table: {
      head: ["Need", "Pick"],
      rows: [
        ["Keyless CI from GitHub/AWS/Azure", "Workload Identity Federation"],
        ["SSH/RDP to private VMs, no VPN", "IAP TCP forwarding (+ OS Login)"],
        ["Only attested images in prod", "Binary Authorization (+ Artifact Registry, provenance)"],
        ["Prompt injection / PII in LLM apps", "Model Armor + Sensitive Data Protection"],
        ["Time-bound admin access", "Privileged Access Manager"],
        ["Why was access denied?", "Policy Troubleshooter"],
        ["Regulated regime folders", "Assured Workloads"],
        ["Secrets", "Secret Manager"],
        ["Central posture and threats", "Security Command Center"],
        ["HIPAA data", "BAA + covered services + Cloud Healthcare API + VPC SC + CMEK"],
      ],
    },
  },
  {
    section: 4,
    title: "Processes and optimization",
    points: [
      "CI/CD: Cloud Build → Artifact Registry → Cloud Deploy. Promote the same artifact. Rolling, blue/green, canary; flags decouple deploy from release.",
      "Incidents: mitigate first (rollback), then diagnose with changes + golden signals (latency, traffic, errors, saturation), then fix and run a blameless postmortem.",
      "DR is only real when tested: measure actual RTO/RPO.",
      "FinOps: label and export billing to BigQuery, delete waste, right-size, CUDs for baseline, Spot for fault-tolerant, partition/cluster BigQuery.",
      "Stakeholders: listen, show evidence (TCO/ROI, pilot), record decisions, plan change management and training.",
    ],
  },
  {
    section: 5,
    title: "Implementation",
    points: [
      "Apigee = full API lifecycle (portal, quotas, OAuth, analytics, monetization); API Gateway/Endpoints = lightweight. Spike Arrest = burst, Quota = period limit.",
      "Application Default Credentials; impersonation for testing; restrict API keys; retry 429/503 with backoff + jitter; paginate.",
      "Emulators: Bigtable, Spanner, Pub/Sub, Firestore/Datastore.",
      "gcloud, bq, gcloud storage (gsutil legacy), Cloud Shell/Editor, Cloud Code, client libraries.",
    ],
  },
  {
    section: 6,
    title: "Operations excellence",
    points: [
      "SLI = measurement, SLO = target, SLA = contract. Error budget = 1 − SLO (99.9% → 0.1% ≈ 43 min per 30 days). Spent budget → prioritize reliability.",
      "Alert on user-visible symptoms and SLO burn rate; keep runbooks; reduce toil.",
      "Cloud Monitoring (metrics, alerts, uptime, SLOs), Logging (buckets, sinks, log-based metrics), Trace (latency), Profiler (code hot spots), Error Reporting.",
      "Reliability proof: load, soak, chaos/game days, DR drills, penetration testing of your own resources within policy.",
    ],
  },
];

export const gcpPcaExam: Exam = {
  slug: "gcp-pca",
  title: "Professional Cloud Architect Practice Exam",
  subtitle: "60 original questions mapped to the six sections of the PCA exam guide",
  description:
    "Original practice questions written for this course and aligned to the current Professional Cloud Architect exam guide. Practice mode gives instant feedback with explanations; exam mode simulates timed conditions and produces a performance report by section and topic.",
  courseSlug: "gcp-pca",
  sections,
  questions,
  minutesPerQuestion: 2,
  target: 70,
  officialFormat: [
    "Real exam: 2 hours, 50 to 60 multiple choice and multiple select questions, $200.",
    "Two case studies make up about 20 to 30 percent of the real exam.",
    "Google does not publish a passing score, so 70% is used here as a practice readiness target.",
    "These questions are original and are not taken from the real exam.",
  ],
  cheatsheet,
};
