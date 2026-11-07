import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Medium",
  objectives: [
    "Select ingestion, processing, storage and serving services for batch and streaming pipelines",
    "Compare Dataflow, Dataproc, BigQuery, Data Fusion and Composer",
    "Design a data lake and warehouse architecture with governance",
    "Optimize BigQuery with partitioning, clustering and the right pricing model",
  ],
  tasks: [
    {
      id: "pipeline",
      title: "The data pipeline",
      body: (
        <>
          <Figure caption="A reference pipeline. Pub/Sub decouples producers; Dataflow transforms in streaming or batch; BigQuery serves analytics; Cloud Storage holds the raw lake; Composer orchestrates.">
            <Graph
              label="Streaming and batch data pipeline from sources through Pub/Sub and Dataflow to BigQuery and Cloud Storage with Composer orchestration"
              cellW={190}
              cellH={96}
              nodeW={160}
              nodes={[
                { id: "src", label: "Sources", sub: "apps, devices, databases", col: 0, row: 0.5, tone: "sky" },
                { id: "ps", label: "Pub/Sub", sub: "streaming ingest", col: 1, row: 0, tone: "lime" },
                { id: "ds", label: "Datastream", sub: "CDC from databases", col: 1, row: 1, tone: "lime" },
                { id: "df", label: "Dataflow", sub: "Apache Beam", col: 2, row: 0.5, tone: "amber" },
                { id: "gcs", label: "Cloud Storage", sub: "raw lake", col: 3, row: 0, tone: "plain" },
                { id: "bq", label: "BigQuery", sub: "warehouse + ML", col: 3, row: 1, tone: "lime" },
                { id: "bi", label: "Looker / BI", col: 4, row: 1, tone: "sky", shape: "pill" },
              ]}
              edges={[
                { from: "src", to: "ps" },
                { from: "src", to: "ds" },
                { from: "ps", to: "df" },
                { from: "ds", to: "df" },
                { from: "df", to: "gcs" },
                { from: "df", to: "bq" },
                { from: "bq", to: "bi" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "services",
      title: "Choosing the service",
      body: (
        <>
          <Table
            head={["Service", "Role", "Choose when"]}
            rows={[
              ["Pub/Sub", "Global, durable messaging; at-least-once, ordering keys, dead-letter topics, push and pull, BigQuery and Cloud Storage subscriptions", "Decouple services, ingest events, fan out"],
              ["Dataflow", "Serverless Apache Beam for batch and streaming with autoscaling, windowing, exactly-once processing", "Unified stream and batch ETL with minimal ops"],
              ["Dataproc", "Managed Spark/Hadoop/Flink clusters (and Dataproc Serverless)", "Existing Spark/Hadoop jobs; use ephemeral clusters and Cloud Storage instead of HDFS"],
              ["BigQuery", "Serverless warehouse, SQL, streaming inserts, BigQuery ML, BI Engine, Omni (multicloud)", "Analytics at scale; ELT in SQL"],
              ["Data Fusion", "Visual, code-free ETL (CDAP)", "Business users, many connectors"],
              ["Cloud Composer", "Managed Apache Airflow", "Orchestrate multi-step workflows and dependencies across services"],
              ["Dataplex", "Data governance, lake management, quality, catalog and lineage", "Govern data across BigQuery and Cloud Storage"],
              ["Dataform", "SQL workflow development in BigQuery", "Version-controlled ELT"],
              ["Looker", "Semantic layer and BI", "Governed metrics and dashboards"],
            ]}
          />
          <Callout tone="tip" title="Dataflow versus Dataproc">
            New pipelines and streaming: Dataflow (serverless, less ops). Existing Spark or Hadoop
            code, libraries and skills, or ML frameworks tied to Spark: Dataproc, ideally ephemeral
            clusters per job reading from Cloud Storage so you pay only while jobs run.
          </Callout>
        </>
      ),
    },
    {
      id: "bq",
      title: "BigQuery design and cost",
      body: (
        <>
          <ul>
            <li><strong>Partition</strong> tables (by ingestion time, date/timestamp column, or integer range) and <strong>cluster</strong> by frequently filtered columns to reduce bytes scanned. Require a partition filter on large tables.</li>
            <li><strong>Pricing:</strong> on-demand (per TB scanned) or capacity-based editions with slot autoscaling and reservations. Use capacity for predictable heavy workloads; on-demand for light or spiky use. Storage is cheaper for long-term unmodified data.</li>
            <li><strong>Security:</strong> IAM at project/dataset/table, row-level security, column-level security with policy tags, authorized views, CMEK, and VPC Service Controls to prevent exfiltration.</li>
            <li><strong>Streaming:</strong> Storage Write API (and BigQuery subscriptions from Pub/Sub) for low-latency inserts.</li>
            <li><strong>Sharing:</strong> Analytics Hub to exchange datasets without copying; BigQuery Omni for data in other clouds.</li>
            <li><strong>Avoid</strong> <code>SELECT *</code>, unpartitioned scans and repeated queries without materialized views or caching.</li>
          </ul>
          <Exercise
            title="Design the pipeline"
            task={<p>A ride-sharing app emits 200k events per second. Operations needs dashboards within seconds, finance needs daily reports, and raw events must be retained cheaply for seven years. The team is small. Propose services.</p>}
          >
            <p>
              Apps publish to <strong>Pub/Sub</strong>. A streaming <strong>Dataflow</strong> job
              (or a BigQuery subscription for simple cases) writes to <strong>BigQuery</strong>{" "}
              (partitioned by event date, clustered by city) for near-real-time dashboards, and writes
              raw files to <strong>Cloud Storage</strong> (lifecycle to Archive, retention policy) for
              seven-year retention. Daily finance reports are scheduled queries or Dataform workflows
              orchestrated by <strong>Composer</strong> if dependencies are complex. All serverless,
              so low operations.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Pub/Sub ingests and decouples; Dataflow transforms; BigQuery analyses; Cloud Storage keeps raw data; Composer orchestrates.",
    "Dataflow for new serverless batch/stream pipelines; Dataproc for existing Spark/Hadoop (ephemeral clusters on Cloud Storage).",
    "Partition and cluster BigQuery tables and pick on-demand versus capacity pricing by workload pattern.",
    "Govern with Dataplex, policy tags, row/column security and VPC Service Controls.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service runs unified batch and streaming Apache Beam pipelines serverlessly?",
      options: ["Dataflow", "Dataproc", "Data Fusion", "Composer"],
      answer: 0,
      explain: "Dataflow is the managed Apache Beam runner with autoscaling.",
    },
    {
      kind: "mcq",
      q: "A company has existing Spark jobs and wants minimal rewrite. Which service?",
      options: ["Dataproc", "Dataflow", "Pub/Sub", "Looker"],
      answer: 0,
      explain: "Dataproc runs Spark/Hadoop with little change.",
    },
    {
      kind: "mcq",
      q: "How do you reduce the bytes scanned by queries filtering on date and customer_id in BigQuery?",
      options: ["Partition by date and cluster by customer_id", "Use SELECT *", "Add more slots only", "Export to CSV"],
      answer: 0,
      explain: "Partition pruning and clustering reduce scanned data and cost.",
    },
    {
      kind: "mcq",
      q: "Which service orchestrates multi-step workflows as Airflow DAGs?",
      options: ["Cloud Composer", "Dataflow", "Pub/Sub", "Dataplex"],
      answer: 0,
      explain: "Cloud Composer is managed Apache Airflow.",
    },
    {
      kind: "text",
      q: "Which service captures change data from operational databases into BigQuery?",
      format: "**********",
      accept: ["datastream"],
      explain: "Datastream provides serverless CDC and replication.",
    },
  ],
};
