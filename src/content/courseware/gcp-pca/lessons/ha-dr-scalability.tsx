import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Medium",
  objectives: [
    "Define availability, RTO and RPO and convert an SLA into a design",
    "Apply zonal, regional and multi-regional architectures with failover",
    "Choose a disaster recovery pattern: backup and restore, pilot light, warm standby, hot",
    "Design for scalability and performance, including autoscaling and caching",
    "Plan backup and recovery with Google Cloud services",
  ],
  tasks: [
    {
      id: "targets",
      title: "Availability, RTO and RPO",
      body: (
        <>
          <p>
            <strong>Availability</strong> is the share of time a service works. Each extra nine
            costs more. <strong>RTO</strong> (recovery time objective) is how long you can be down;{" "}
            <strong>RPO</strong> (recovery point objective) is how much data you can lose. Both come
            from the business impact, not from technology preference.
          </p>
          <Table
            head={["Availability", "Downtime per year", "Typical architecture"]}
            rows={[
              ["99.9%", "About 8.8 hours", "Single region, multi-zone, managed services"],
              ["99.95%", "About 4.4 hours", "Multi-zone with automated failover and health checks"],
              ["99.99%", "About 53 minutes", "Multi-region active/passive or active/active"],
              ["99.999%", "About 5 minutes", "Multi-region with a globally consistent database such as Spanner multi-region"],
            ]}
          />
          <p>
            A system&apos;s availability is limited by its weakest <em>serial</em> dependency
            (multiply availabilities) and improved by <em>parallel</em> redundancy. A chain of three
            99.9% components gives about 99.7%.
          </p>
        </>
      ),
    },
    {
      id: "patterns",
      title: "Failure domains and DR patterns",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="ha-dr-scalability-diagram-1" />
          <Table
            head={["DR pattern", "What runs in the DR region", "RTO / RPO", "Relative cost"]}
            rows={[
              ["Backup and restore (cold)", "Nothing; backups in another region", "Hours to days / hours", "Lowest"],
              ["Pilot light", "Core data replicated; compute off, scripted to start", "Tens of minutes to hours / minutes", "Low"],
              ["Warm standby", "Scaled-down full stack running", "Minutes / seconds to minutes", "Medium"],
              ["Hot (active/active)", "Full capacity serving traffic", "Near zero / near zero", "Highest"],
            ]}
          />
          <ul>
            <li>Use <strong>regional</strong> managed services (regional MIGs, regional GKE, Cloud Run, Cloud SQL HA) to survive zone loss automatically.</li>
            <li>Use a <strong>global load balancer</strong> with health checks to fail over between regions without DNS changes.</li>
            <li>Data is the hard part: choose databases whose replication matches your RPO (Spanner multi-region synchronous; Cloud SQL cross-region replicas asynchronous; Bigtable multi-cluster replication eventual; Cloud Storage dual- or multi-region).</li>
            <li>Avoid <em>correlated failure</em>: keep control planes, DNS and identity independent of the failing region.</li>
          </ul>
        </>
      ),
    },
    {
      id: "scale",
      title: "Scalability, performance and backup",
      body: (
        <>
          <ul>
            <li><strong>Scale out, not up:</strong> stateless tiers behind load balancers, autoscaled by CPU, load balancer utilization, queue depth or custom metrics. Cloud Run and GKE Autopilot scale automatically.</li>
            <li><strong>Decouple</strong> with Pub/Sub or Cloud Tasks so producers and consumers scale independently and absorb bursts.</li>
            <li><strong>Cache:</strong> Cloud CDN for content, Memorystore for hot data; read replicas for read-heavy databases.</li>
            <li><strong>Latency:</strong> place compute near users and data; use global load balancing and CDN; choose regional placement for chatty tiers.</li>
            <li><strong>Backup and recovery:</strong> Backup and DR Service for VMs, databases and file systems; Cloud SQL automated backups with point-in-time recovery; persistent disk snapshots (incremental, schedulable); Cloud Storage versioning, soft delete and bucket-level retention; BigQuery time travel and table snapshots. Test restores.</li>
          </ul>
          <Callout tone="warn" title="Backups are not DR until restored">
            Define who restores, how long it takes and where. Run recovery tests on a schedule and
            record the measured RTO and RPO against the target.
          </Callout>
          <Exercise
            title="Meet the targets"
            task={<p>An order system must tolerate a full regional outage with RPO of zero for committed orders and RTO under 5 minutes. It currently uses Cloud SQL in a single region. What do you recommend?</p>}
          >
            <p>
              Cloud SQL cross-region replicas are asynchronous, so RPO is not zero. Migrate the order
              store to <strong>Spanner multi-region</strong> (synchronous replication, automatic
              failover, strong consistency), run stateless services in two regions behind a global
              external load balancer, and test regional failover. If migration is not possible,
              state honestly that Cloud SQL can reach low but non-zero RPO and agree on a relaxed
              target.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Derive RTO, RPO and availability targets from business impact; each extra nine costs more.",
    "Zone failure: regional managed services. Region failure: second region plus a global load balancer and a replicated database.",
    "DR patterns trade cost for recovery speed: backup/restore, pilot light, warm standby, hot.",
    "Match the database replication model to RPO; test restores and failovers regularly.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which database offers synchronous multi-region replication with strong consistency?",
      options: ["Spanner multi-region configuration", "Cloud SQL cross-region read replica", "Bigtable single cluster", "Memorystore"],
      answer: 0,
      explain: "Spanner multi-region configurations replicate synchronously and keep strong consistency.",
    },
    {
      kind: "mcq",
      q: "A 'pilot light' DR pattern means:",
      options: ["Core data is replicated and compute is started on demand", "Full capacity runs in the DR region", "Only tapes are stored", "No DR exists"],
      answer: 0,
      explain: "Pilot light keeps minimal core resources and scales up during a disaster.",
    },
    {
      kind: "mcq",
      q: "What does RPO measure?",
      options: ["Maximum tolerable data loss", "Maximum tolerable downtime", "Network latency", "Throughput"],
      answer: 0,
      explain: "Recovery point objective is how much data (in time) you can lose.",
    },
    {
      kind: "mcq",
      q: "How do you fail over between regions without changing DNS?",
      options: ["Global external load balancer with health checks", "Manually update A records", "Use zonal load balancers", "Use VPN"],
      answer: 0,
      explain: "A global load balancer uses one anycast IP and routes to healthy regional backends.",
    },
    {
      kind: "text",
      q: "Which Google Cloud service provides managed backup of VMs and databases? (name)",
      format: "****** *** ** *******",
      accept: ["backup and dr service", "backup and dr", "backup & dr service", "backup and disaster recovery"],
      explain: "Google Cloud Backup and DR Service protects VMs, databases and file systems.",
    },
  ],
};
