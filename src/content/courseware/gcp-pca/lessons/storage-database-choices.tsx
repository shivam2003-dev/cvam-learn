import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Medium",
  objectives: [
    "Choose among object, file and block storage",
    "Select the right database for relational, document, wide-column, in-memory and analytical needs",
    "Compare Cloud SQL, AlloyDB and Spanner on scale, consistency and availability",
    "Use a decision flow from access pattern and consistency requirements to a product",
  ],
  tasks: [
    {
      id: "storage",
      title: "Object, file and block storage",
      body: (
        <>
          <Table
            head={["Type", "Service", "Use"]}
            rows={[
              ["Object", "Cloud Storage (Standard, Nearline 30d, Coldline 90d, Archive 365d, Autoclass)", "Unstructured data, media, backups, data lake; regional, dual-region or multi-region"],
              ["File (NFS/SMB)", "Filestore (tiers), NetApp Volumes, Parallelstore/Managed Lustre for HPC", "Shared POSIX file systems, lift and shift, ML data"],
              ["Block", "Persistent Disk (standard, balanced, SSD, extreme), Hyperdisk, Local SSD", "VM boot and data disks; Local SSD is ephemeral and very fast"],
            ]}
          />
          <ul>
            <li>Choose the Cloud Storage location by availability and latency: <em>regional</em> (cheapest, one region), <em>dual-region</em> (two specific regions, turbo replication option) and <em>multi-region</em> (a large geography).</li>
            <li>Choose the class by access frequency and minimum storage duration, or let <strong>Autoclass</strong> move objects automatically.</li>
            <li>Regional persistent disks replicate synchronously across two zones.</li>
          </ul>
        </>
      ),
    },
    {
      id: "db",
      title: "Database options",
      body: (
        <>
          <Table
            head={["Service", "Model", "Scale and consistency", "Choose when"]}
            rows={[
              ["Cloud SQL", "Managed MySQL, PostgreSQL, SQL Server", "Vertical scale, read replicas, regional HA (zonal failover), up to tens of TB", "Standard relational apps, lift and shift of existing databases"],
              ["AlloyDB", "PostgreSQL-compatible, high performance", "Strong performance and analytics acceleration, read pools, HA, cross-region replicas", "Demanding PostgreSQL workloads, HTAP"],
              ["Spanner", "Relational, SQL, horizontally scalable", "Global scale, strong external consistency, 99.999% multi-region SLA", "Global transactional systems, unlimited scale, zero-RPO regional failover"],
              ["Bigtable", "Wide-column NoSQL", "Millisecond latency at huge scale, row-key design, replication across clusters (eventual consistency)", "Time series, IoT, ad tech, large key-value analytics"],
              ["Firestore", "Serverless document database", "Automatic scaling, real-time sync, multi-region options", "Mobile/web apps, flexible schemas"],
              ["Memorystore", "Managed Redis/Valkey and Memcached", "In-memory, sub-millisecond", "Caching, sessions, leaderboards"],
              ["BigQuery", "Serverless analytical warehouse", "Petabyte scale analytics, not OLTP", "Analytics, BI, ML on data"],
              ["Bare Metal Solution", "Oracle and specialised databases", "Dedicated hardware", "Oracle that cannot be re-platformed"],
            ]}
          />
          <Figure caption="A simple decision flow. Start with the access pattern and the consistency and scale needs, then check operational constraints.">
            <Flow
              steps={[
                { title: "Analytics / warehouse?", note: "Yes → BigQuery", tone: "lime" },
                { title: "Relational + SQL?", note: "Global scale, 99.999% → Spanner; Postgres performance → AlloyDB; otherwise Cloud SQL", tone: "sky" },
                { title: "Massive key-value / time series?", note: "Bigtable", tone: "amber" },
                { title: "Documents, mobile?", note: "Firestore", tone: "amber" },
                { title: "Cache?", note: "Memorystore", tone: "plain" },
              ]}
            />
          </Figure>
          <Callout tone="warn" title="Cloud SQL limits">
            Cloud SQL scales reads with replicas but writes scale vertically on a single primary. If
            the scenario needs write scale across regions or horizontal sharding without application
            changes, think Spanner. If it needs lowest-friction migration of MySQL/PostgreSQL/SQL
            Server, think Cloud SQL (with Database Migration Service).
          </Callout>
        </>
      ),
    },
    {
      id: "choose",
      title: "Applying the choice",
      body: (
        <>
          <Exercise
            title="Pick the data store"
            task={<p>(a) 5 TB of user profile JSON with real-time sync to mobile devices. (b) 2 PB of sensor readings queried by device and time range at single-digit milliseconds. (c) A global ledger needing ACID transactions across continents. (d) The same raw event data analysed by data scientists with SQL.</p>}
          >
            <p>
              (a) <strong>Firestore</strong>. (b) <strong>Bigtable</strong> with a row key like
              device#reversed-timestamp. (c) <strong>Spanner</strong> multi-region. (d){" "}
              <strong>BigQuery</strong> (load or stream from Pub/Sub/Dataflow; external tables over
              Cloud Storage are an option).
            </p>
          </Exercise>
          <ul>
            <li><strong>Combine stores:</strong> OLTP in Cloud SQL/Spanner, cache in Memorystore, analytics in BigQuery fed by Datastream (change data capture) or Dataflow.</li>
            <li><strong>Search and vector needs:</strong> AlloyDB, Cloud SQL (pgvector), Spanner and BigQuery support vector search; Vertex AI Vector Search for large dedicated indexes.</li>
            <li><strong>Security:</strong> private IP, CMEK, IAM database authentication, and VPC Service Controls apply across most of these products.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Object = Cloud Storage with classes and locations; file = Filestore and friends; block = Persistent Disk/Hyperdisk/Local SSD.",
    "Cloud SQL for standard relational, AlloyDB for demanding PostgreSQL, Spanner for global scale and consistency, Bigtable for huge key-value, Firestore for documents, Memorystore for cache, BigQuery for analytics.",
    "Cloud SQL scales writes vertically; Spanner scales horizontally with strong consistency.",
    "Pair stores: transactional sources feed analytics through Datastream or Dataflow.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A globally distributed financial system needs ACID transactions and 99.999% availability. Which database?",
      options: ["Spanner", "Cloud SQL", "Bigtable", "Firestore"],
      answer: 0,
      explain: "Spanner multi-region provides strong consistency, horizontal scale and a 99.999% SLA.",
    },
    {
      kind: "mcq",
      q: "Time-series IoT data at petabyte scale with millisecond reads by key. Which service?",
      options: ["Bigtable", "Cloud SQL", "Memorystore", "Filestore"],
      answer: 0,
      explain: "Bigtable is designed for massive low-latency key-value and time-series workloads.",
    },
    {
      kind: "mcq",
      q: "Which Cloud Storage class fits data accessed about once a year with a 365-day minimum duration?",
      options: ["Archive", "Standard", "Nearline", "Coldline"],
      answer: 0,
      explain: "Archive is for rarely accessed data with a 365 day minimum.",
    },
    {
      kind: "mcq",
      q: "A team wants to move a SQL Server application with minimal change. Which database service?",
      options: ["Cloud SQL for SQL Server", "Bigtable", "BigQuery", "Firestore"],
      answer: 0,
      explain: "Cloud SQL supports SQL Server and migrates with Database Migration Service.",
    },
    {
      kind: "text",
      q: "Which service provides a managed in-memory cache compatible with Redis?",
      format: "***********",
      accept: ["memorystore", "memorystore for redis"],
      explain: "Memorystore provides managed Redis (and Valkey) and Memcached.",
    },
  ],
};
