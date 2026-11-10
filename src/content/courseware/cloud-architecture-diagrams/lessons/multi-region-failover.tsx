import { makeLesson } from "../kit/makeLesson";

export const lesson = makeLesson({
  minutes: 27,
  difficulty: "Hard",
  context: "Payments, healthcare, trading, government portals and any business that cannot be down for hours when a whole Region fails.",
  objectives: [
    "Define RTO and RPO and map them to pilot light, warm standby and active-active",
    "Design DNS-based failover with health checks",
    "Replicate databases and objects across Regions and understand the data-loss trade-off",
    "Plan and rehearse a failover and failback",
  ],
  problem: [
    "A whole-Region outage is rare but real: a bad deployment of a regional service, a power or network failure, or a cloud control-plane issue. A bank that is down for six hours loses customers and may breach regulation.",
    "Multi-Region architecture trades cost and complexity for the ability to keep running. The question is not 'can we', it is 'how fast must we recover, and how much data can we lose?'.",
  ],
  diagramTitle: "Active/passive multi-Region with DNS failover",
  arch: {
    width: 960,
    height: 480,
    groups: [
      { id: "ra", kind: "region", x: 270, y: 50, w: 320, h: 400, label: "Primary Region", step: 1 },
      { id: "rb", kind: "region", x: 640, y: 50, w: 300, h: 400, label: "Recovery Region", step: 1 },
    ],
    nodes: [
      { id: "users", svc: "users", x: 55, y: 240, step: 2 },
      { id: "dns", svc: "dns", x: 190, y: 240, step: 2, label: { aws: "Route 53 health checks", azure: "Traffic Manager / Front Door", gcp: "Global load balancer", oci: "Traffic Management steering" } },
      { id: "lba", svc: "lb", x: 350, y: 130, step: 3 },
      { id: "vma", svc: "vm", x: 350, y: 255, step: 3, label: "App tier" },
      { id: "dba", svc: "db", x: 350, y: 375, step: 4, label: "Primary database" },
      { id: "lbb", svc: "lb", x: 720, y: 130, step: 5 },
      { id: "vmb", svc: "vm", x: 720, y: 255, step: 5, label: "App tier (standby)" },
      { id: "dbb", svc: "db", x: 720, y: 375, step: 5, label: "Replica database" },
    ],
    edges: [
      { from: "users", to: "dns", step: 2, num: 1 },
      { from: "dns", to: "lba", step: 3, num: 2, elbow: "vh" },
      { from: "lba", to: "vma", step: 3, num: 3 },
      { from: "vma", to: "dba", step: 4, num: 4 },
      { from: "dba", to: "dbb", step: 5, dashed: true, label: "async replication" },
      { from: "lbb", to: "vmb", step: 5 },
      { from: "vmb", to: "dbb", step: 5 },
      { from: "dns", to: "lbb", step: 6, dashed: true, via: [[190, 28], [720, 28]], label: "failover route" },
    ],
    steps: [
      {
        title: "Set recovery targets first",
        body: "RTO is how long you can be down; RPO is how much recent data you can lose. These two numbers decide the whole design and its cost.",
        points: ["Backup and restore: hours of RTO, hours of RPO, cheapest.", "Pilot light: core data replicated, compute off until needed; RTO tens of minutes.", "Warm standby: a scaled-down copy always running; RTO minutes.", "Active-active: both Regions serve traffic; RTO near zero but hardest and most expensive."],
        per: {
          aws: "AWS: pick two Regions (for example us-east-1 and us-west-2) and use the AWS Resilience Hub to assess your targets.",
          azure: "Azure: use a Region pair, which gets prioritised recovery and sequenced updates; confirm paired services.",
          gcp: "Google Cloud: choose two Regions, or a multi-region location (such as US) for services that support it.",
          oci: "OCI: pick two Regions, ideally in a pair designed for disaster recovery (such as Ashburn and Phoenix).",
        },
      },
      {
        title: "Route users with health-checked DNS",
        body: "Users reach the application through a name that can point at either Region. A health check watches the primary and moves the name when it fails.",
        points: ["Use short DNS TTLs (30 to 60 seconds) so clients move quickly; very low TTLs raise query cost.", "Health-check a real dependency (the app, not just the load balancer) or failover may never trigger."],
        per: {
          aws: "AWS: Route 53 failover records with health checks, or Global Accelerator for fast IP-level failover.",
          azure: "Azure: Traffic Manager (DNS) or Front Door (global anycast) with priority routing and health probes.",
          gcp: "Google Cloud: a global external load balancer fails over between Regions automatically with one anycast IP.",
          oci: "OCI: Traffic Management steering policies with failover and health checks.",
        },
      },
      {
        title: "Run the primary Region",
        body: "The primary Region serves all traffic: a load balancer, an application tier spread over zones and a database. This is the normal path.",
        points: ["Make each Region internally highly available across zones first; multi-Region does not replace multi-zone.", "Keep configuration and infrastructure as code so the second Region is built from the same source."],
        per: {
          aws: "AWS: ALB, Auto Scaling group and Aurora across three Availability Zones.",
          azure: "Azure: Application Gateway, scale sets across zones and zone-redundant SQL.",
          gcp: "Google Cloud: regional load balancer, regional managed instance group and Cloud SQL HA.",
          oci: "OCI: Load Balancer, instance pool across availability domains and a Data Guard database.",
        },
      },
      {
        title: "Plan the database as the hard part",
        body: "Compute is easy to duplicate; data is not. The database decides your RPO, because replication across Regions is usually asynchronous.",
        points: ["Asynchronous replication lags by seconds, so a failover can lose recent writes: your RPO.", "Synchronous cross-Region replication gives zero loss but adds latency to every write.", "Globally consistent databases exist but cost more and change your design."],
        per: {
          aws: "AWS: Aurora Global Database (typical lag under a second) or DynamoDB global tables; S3 cross-Region replication for objects.",
          azure: "Azure: SQL auto-failover groups or geo-replication, Cosmos DB multi-region writes, and GRS or GZRS storage.",
          gcp: "Google Cloud: Cloud SQL cross-region replicas, Spanner multi-region for zero RPO, Cloud Storage dual- or multi-region buckets.",
          oci: "OCI: Autonomous Data Guard or Data Guard cross-region standby and Object Storage replication.",
        },
      },
      {
        title: "Build the recovery Region",
        body: "The recovery Region mirrors the primary at the size your RTO demands: fully scaled for active-active, minimal for pilot light. Its database is a continuously updated replica.",
        points: ["Keep secrets, certificates, images and DNS records available in both Regions.", "Test that the standby really works: a never-exercised standby usually fails when needed."],
        per: {
          aws: "AWS: replicate ECR images, KMS multi-Region keys and Secrets Manager secrets; keep an Auto Scaling group at minimum size.",
          azure: "Azure: geo-replicate Container Registry, use Key Vault in both regions and keep scale sets at minimum.",
          gcp: "Google Cloud: multi-region Artifact Registry, replicated Secret Manager secrets and a minimal instance group.",
          oci: "OCI: replicate registry images and Vault keys across Regions and keep the instance pool small.",
        },
      },
      {
        title: "Fail over and fail back",
        body: "When health checks fail, DNS moves users to the recovery Region, the replica is promoted and the application scales up. Failing back later is a planned, tested move, not a reflex.",
        points: ["Decide who can trigger a failover and under what conditions; automatic failover can cause flapping or split-brain.", "After failover the old primary must be rebuilt as a replica before you switch back.", "Rehearse at least twice a year with a game day and measure the real RTO and RPO."],
        per: {
          aws: "AWS: promote the Aurora secondary, scale the Auto Scaling group and let Route 53 switch records.",
          azure: "Azure: initiate the SQL failover group, scale the scale set and let Traffic Manager shift traffic.",
          gcp: "Google Cloud: promote the Cloud SQL replica and scale the instance group; the global load balancer routes to the healthy Region.",
          oci: "OCI: switch over or fail over Data Guard, scale the pool and let the steering policy move traffic.",
        },
      },
    ],
  },
  notes: {
    aws: ["Control-plane actions (such as promoting a database) may themselves be impaired in a Region event; pre-provision capacity and prefer data-plane failover such as Route 53 health checks.", "Aurora Global Database can fail over in about a minute for planned switchovers."],
    azure: ["Region pairs are in the same geography, which helps with data residency; confirm each service supports paired replication.", "Azure Site Recovery replicates VMs to another region for lift-and-shift applications."],
    gcp: ["A global load balancer hides the failover from clients, which is a real advantage over DNS-based approaches.", "Spanner multi-region configurations give zero RPO with automatic failover, at higher cost."],
    oci: ["OCI Full Stack Disaster Recovery orchestrates failover plans across compute, databases and storage.", "Cross-region Object Storage replication is asynchronous and object-level."],
  },
  decisions: [
    { title: "Is multi-Region worth it?", text: "Multi-zone covers most outages. Go multi-Region only when your RTO and regulators demand it, because it multiplies cost and complexity." },
    { title: "Automatic or manual failover", text: "Automatic is faster but can fail over wrongly. Many teams automate detection and require a human decision for data-affecting steps." },
    { title: "Data consistency", text: "Decide up front what happens to writes made just before the failure. Document the RPO and tell the business." },
    { title: "Test it", text: "Untested DR is theatre. Run game days, measure actual RTO and RPO and fix what you find." },
  ],
  exercise: {
    title: "Pick the pattern",
    task: "A retailer has RTO of 30 minutes and RPO of 5 minutes, and a limited budget. Which pattern, and what must they test?",
    answer: [
      "Warm standby or pilot light: a small running recovery Region with an asynchronously replicated database; active-active is more than the targets need.",
      "Confirm replication lag stays under five minutes and alarm on it, since lag is the RPO in practice.",
      "Test that scaling the standby up and promoting the database fit inside 30 minutes, including DNS propagation.",
      "Keep images, secrets and infrastructure code replicated, and rehearse the whole sequence on a schedule.",
    ],
  },
  takeaways: [
    "RTO and RPO drive the pattern: backup, pilot light, warm standby or active-active.",
    "Health-checked DNS (or a global load balancer) moves users to the healthy Region.",
    "Data is the hard part: asynchronous replication means some loss; synchronous means latency.",
    "Make each Region highly available across zones before adding a second Region.",
    "Rehearse failover and failback; untested plans fail.",
  ],
  quiz: [
    { kind: "mcq", q: "What does RPO measure?", options: ["How much recent data you can afford to lose", "How fast you must recover", "How many users you serve", "The size of the standby"], answer: 0, explain: "Recovery point objective is the maximum acceptable data loss, measured in time." },
    { kind: "mcq", q: "Which pattern keeps a scaled-down copy of the application always running in another Region?", options: ["Warm standby", "Backup and restore", "Single region", "Cold archive"], answer: 0, explain: "Warm standby runs a minimal version that is scaled up on failover." },
    { kind: "mcq", q: "Why can asynchronous replication lose data on failover?", options: ["The replica may not have received the latest writes", "It encrypts too much", "DNS caches them", "Queues are full"], answer: 0, explain: "Asynchronous replicas lag behind; unreplicated writes are lost." },
    { kind: "text", q: "What does the T in RTO stand for? (one word)", format: "****", accept: ["time"], explain: "Recovery time objective." },
  ],
});
