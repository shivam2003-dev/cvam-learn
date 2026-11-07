import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Configure Cloud Storage for security, lifecycle, retention and protection",
    "Provision and tune disks and file storage for throughput and latency",
    "Plan data transfer, retention, growth and recovery for databases",
    "Apply access management and encryption to storage systems",
  ],
  tasks: [
    {
      id: "gcs",
      title: "Cloud Storage configuration",
      body: (
        <>
          <Table
            head={["Feature", "What it does", "Use"]}
            rows={[
              ["Uniform bucket-level access", "IAM only; disables object ACLs", "Simplify and secure access (enforce by org policy)"],
              ["Public access prevention", "Blocks public sharing", "Default for sensitive data"],
              ["Lifecycle rules", "Transition class or delete by age, state, versions", "Cost control: Standard → Nearline → Coldline → Archive → delete"],
              ["Object versioning + soft delete", "Keep or recover overwritten/deleted objects", "Accidental deletion recovery"],
              ["Retention policy / bucket lock", "Prevent deletion before a period; lock makes it irreversible", "WORM compliance (SEC, FINRA)"],
              ["Object holds", "Temporary/event-based hold", "Legal hold"],
              ["CMEK / CSEK", "Customer-managed keys in Cloud KMS / supplied keys", "Key control and revocation"],
              ["Signed URLs", "Time-limited access to a private object", "Sharing without IAM identities"],
              ["Dual-region / multi-region", "Geo-redundancy; turbo replication for dual-region", "Availability and RPO"],
              ["Storage Insights, Autoclass", "Inventory and automatic class changes", "Governance and cost"],
            ]}
          />
          <CloudDiagram course="gcp-pca" id="storage-configuration-lifecycle-diagram-1" />
        </>
      ),
    },
    {
      id: "block",
      title: "Disks, file systems and databases",
      body: (
        <>
          <ul>
            <li><strong>Persistent Disk and Hyperdisk:</strong> performance scales with size (PD) or is provisioned independently (Hyperdisk). Use balanced for general work, SSD/Extreme or Hyperdisk for databases; regional PD for synchronous replication across two zones; Local SSD for ephemeral scratch. Snapshot schedules are incremental, can be multi-regional, and images/machine images capture VM configurations.</li>
            <li><strong>Filestore</strong> offers NFS tiers (zonal, regional, enterprise) with snapshots and backups; choose by capacity, IOPS and availability.</li>
            <li><strong>Databases:</strong> Cloud SQL high availability (regional standby), automated backups and point-in-time recovery, storage auto-increase, maintenance windows, read replicas, private IP and IAM authentication. Spanner: choose regional or multi-region configuration and processing units/nodes for throughput; backups and PITR. Bigtable: cluster count and replication, storage type (SSD/HDD), autoscaling and app profiles. BigQuery: dataset location, time travel, table snapshots, expiry.</li>
            <li><strong>Data growth planning:</strong> monitor capacity metrics, enable autoscaling storage where available, forecast with Cloud Monitoring and set alerts before limits.</li>
          </ul>
        </>
      ),
    },
    {
      id: "transfer",
      title: "Data transfer, latency and protection",
      body: (
        <>
          <ul>
            <li><strong>Transfer:</strong> Storage Transfer Service (online, scheduled, from S3/Azure/HTTP/on-premises agents), <code>gcloud storage</code> (parallel composite uploads), Transfer Appliance for offline, BigQuery Data Transfer Service for SaaS and warehouse loads, Datastream for CDC.</li>
            <li><strong>Latency and throughput:</strong> colocate compute and storage in the same region; use Interconnect for hybrid; Cloud CDN for read-heavy public objects; Filestore/Parallelstore for HPC; Cloud Storage FUSE for ML data access.</li>
            <li><strong>Security:</strong> least-privilege IAM on buckets/datasets, CMEK, VPC Service Controls, audit logs (enable data access logs where needed), DLP scanning of buckets.</li>
            <li><strong>Protection:</strong> versioning, soft delete, retention locks, cross-region copies, and tested backups with Backup and DR Service.</li>
          </ul>
          <Callout tone="warn" title="Retention lock is permanent">
            Locking a retention policy cannot be undone. Test the policy on a non-production bucket
            first and confirm the period matches the regulation.
          </Callout>
          <Exercise
            title="Meet the policy"
            task={<p>Financial records must be immutable for 7 years, accessed rarely after 90 days, stored in the EU, encrypted with company-controlled keys. Configure storage.</p>}
          >
            <p>
              An EU <strong>dual-region or regional bucket</strong>, <strong>uniform bucket-level
              access</strong> and public access prevention, <strong>CMEK</strong> from Cloud KMS in the
              EU, a <strong>retention policy of 7 years with bucket lock</strong>, and a{" "}
              <strong>lifecycle rule</strong> moving objects to Coldline or Archive after 90 days
              (retention still applies). Restrict locations with an organization policy and audit with
              Cloud Audit Logs.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Cloud Storage: uniform access, public access prevention, lifecycle, versioning/soft delete, retention locks, CMEK and signed URLs.",
    "Choose disk types and regional PD for performance and availability; use snapshots and Backup and DR Service.",
    "Configure database HA, backups, PITR, replicas and capacity growth deliberately per service.",
    "Use the right transfer tool and keep compute near data; protect and test recovery.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Records must not be deletable for 7 years. Which feature?",
      options: ["Retention policy with bucket lock", "Lifecycle delete rule", "Object versioning only", "Signed URL"],
      answer: 0,
      explain: "A locked retention policy prevents deletion until the period expires.",
    },
    {
      kind: "mcq",
      q: "Which setting disables object ACLs in favour of IAM only?",
      options: ["Uniform bucket-level access", "Public access prevention", "Requester pays", "Autoclass"],
      answer: 0,
      explain: "Uniform bucket-level access makes IAM the only permission mechanism.",
    },
    {
      kind: "mcq",
      q: "Which disk replicates synchronously across two zones?",
      options: ["Regional persistent disk", "Local SSD", "Zonal standard PD", "Filestore basic"],
      answer: 0,
      explain: "Regional persistent disks replicate synchronously between two zones in a region.",
    },
    {
      kind: "mcq",
      q: "Scheduled online transfer of S3 buckets to Cloud Storage. Which service?",
      options: ["Storage Transfer Service", "Transfer Appliance", "Cloud Build", "Datastream"],
      answer: 0,
      explain: "Storage Transfer Service moves data from S3 and others on a schedule.",
    },
    {
      kind: "text",
      q: "Which Cloud Storage feature moves objects to cheaper classes by age?",
      format: "********* *****",
      accept: ["lifecycle rules", "lifecycle", "lifecycle management", "object lifecycle management"],
      explain: "Lifecycle rules transition or delete objects based on conditions such as age.",
    },
  ],
};
