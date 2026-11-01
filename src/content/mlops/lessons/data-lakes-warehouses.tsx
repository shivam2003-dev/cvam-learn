import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Separate data lakes, data warehouses and lakehouses",
    "Explain why columnar files and partitions cut scan size and cost",
    "Use table versions to make a training dataset reproducible",
    "Pick a storage layer for a given ML workload",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Your production database isn't built for training. It's tuned for many small reads and
            writes, and a large scan for a training set can slow the app that real users depend on.
            It also holds current state, not the history a model needs.
          </p>
          <p>
            So companies copy data into systems built for large-scale reading. There are two
            classic choices. A <strong>data warehouse</strong> is like a library: books are
            catalogued and checked before they're shelved, and finding one is easy. A{" "}
            <strong>data lake</strong> is like a huge storage unit: anything fits and it's cheap,
            but without labels you'll struggle to find what you stored.
          </p>
          <Table
            head={["", "Data warehouse", "Data lake"]}
            rows={[
              ["Stores", "Structured tables", "Any file: Parquet, JSON, images, audio"],
              ["Schema", "Applied on write", "Applied on read"],
              ["Where it lives", "A managed query service", "Object storage such as S3"],
              ["Typical user", "Analysts writing SQL", "Data scientists and engineers"],
              ["Main risk", "Cost, and a poor fit for unstructured data", "Turning into a messy swamp"],
              ["Examples", "BigQuery, Snowflake, Redshift", "S3, Google Cloud Storage, Azure Blob Storage"],
            ]}
          />
          <p>
            <strong>Schema on write</strong> means data must match a defined shape before it's
            accepted. <strong>Schema on read</strong> means the files are stored as they are, and
            the reader decides how to interpret them. The first catches problems early. The second
            is flexible, but it pushes problems onto whoever reads the data later.
          </p>
        </>
      ),
    },
    {
      id: "columnar",
      title: "Columnar files and partitions",
      body: (
        <>
          <p>
            Most analytics and training queries read a few columns out of many. In a row-based
            format like CSV, you must read every value to reach the ones you want.{" "}
            <strong>Parquet</strong> is a columnar file format: it stores each column's values
            together and compresses them. A reader can skip the columns it doesn't need.
          </p>
          <p>
            <strong>Partitioning</strong> adds a second saving. Files are stored in folders by a
            key, usually date, so a query for one month skips all other months.
          </p>
          <pre>
            <code>{`s3://lake/clean/events/ds=2026-03-14/part-0000.parquet
s3://lake/clean/events/ds=2026-03-15/part-0000.parquet`}</code>
          </pre>
          <p>
            Here's a worked example. A table holds 2 TB across 365 daily partitions and 100 columns
            of roughly equal size. Your training job needs 3 columns from the last 30 days. Assume
            an illustrative price of $5 per TB scanned, since real prices vary and change.
          </p>
          <Formula>bytes scanned = total × (columns ÷ all columns) × (days ÷ all days)</Formula>
          <Table
            head={["Reading", "Scanned", "Illustrative cost"]}
            rows={[
              ["Whole table", "2,000 GB", "$10.00"],
              ["3 of 100 columns", "2,000 × 0.03 = 60 GB", "$0.30"],
              ["3 columns and 30 of 365 days", "60 × 30 ÷ 365 ≈ 4.9 GB", "About $0.02"],
            ]}
          />
          <p>
            The same job is about 400 times smaller, purely through how the data is laid out. If
            you retrain daily, that also means faster runs, not only lower bills.
          </p>
          <Callout tone="warn">
            Avoid <code>SELECT *</code> in training queries, since it throws away the column
            saving. Also avoid partitioning on a key with many values, such as user ID. You'd get
            huge numbers of tiny files, and opening each one costs time.
          </Callout>
        </>
      ),
    },
    {
      id: "lakehouse",
      title: "The lakehouse",
      body: (
        <>
          <p>
            Plain files on object storage have real gaps. Two jobs writing at once can corrupt a
            dataset. A reader can see half a write. Nothing records what the table looked like last
            week.
          </p>
          <p>
            A <strong>table format</strong> fixes this by adding a metadata layer above the files.
            That layer records exactly which files make up each version of a table. Delta Lake,
            Apache Iceberg and Apache Hudi are the main ones. The result is called a{" "}
            <strong>lakehouse</strong>: warehouse-style tables on low-cost lake storage. You get:
          </p>
          <ul>
            <li><strong>ACID transactions:</strong> a write either fully happens or doesn't, and readers never see partial data.</li>
            <li><strong>Schema enforcement:</strong> bad writes can be rejected.</li>
            <li><strong>Time travel:</strong> you can read an older version of a table.</li>
          </ul>
          <p>
            Time travel matters most for MLOps. A training set defined as "the churn table" changes
            every day, so you can't rebuild it later. A training set defined as "version 42 of the
            churn table" stays fixed.
          </p>
          <pre>
            <code>{`# Delta Lake: read an exact version, then log it with the run
VERSION = 42

train_df = (
    spark.read.format("delta")
    .option("versionAsOf", VERSION)
    .load("s3://lake/features/churn")
)

mlflow.log_param("dataset_path", "s3://lake/features/churn")
mlflow.log_param("dataset_version", VERSION)`}</code>
          </pre>
          <Callout tone="warn">
            Time travel isn't a permanent archive. Cleanup commands such as Delta's{" "}
            <code>VACUUM</code> or Iceberg's snapshot expiry delete old files to control storage
            costs. If a model must stay reproducible for years, keep a separate snapshot of its
            training data, or use a tool like DVC.
          </Callout>
        </>
      ),
    },
    {
      id: "choosing",
      title: "Choosing where data lives",
      body: (
        <>
          <p>
            Most lakes are organized in layers, often called <strong>medallion architecture</strong>
            . Bronze holds raw data as it arrived. Silver holds cleaned, deduplicated data. Gold
            holds curated tables, such as features or reports. Keeping bronze means a bug in a
            later layer can be fixed by reprocessing.
          </p>
          <Table
            head={["Workload", "A sensible home", "Why"]}
            rows={[
              ["Business reports and dashboards", "Warehouse", "Fast SQL and easy access control"],
              ["Tabular features in a SQL-heavy team", "Warehouse or lakehouse", "Reuses existing skills"],
              ["Images, audio, video, documents", "Lake", "Warehouses aren't built for large binary files"],
              ["Large Spark feature jobs", "Lakehouse", "Open files that many engines can read"],
              ["Long-term raw history", "Lake", "Cheapest storage, with colder tiers available"],
              ["Low-latency feature lookup at serving", "None of these", "Use an online store such as Redis"],
            ]}
          />
          <p>
            That last row catches people out. Lakes and warehouses are built for scans that take
            seconds or minutes. A model answering a live request usually needs features in
            milliseconds, so those are copied to a fast key-value store.
          </p>
          <Callout tone="tip">
            For image or audio training, a common pattern is to keep the binary files on object
            storage and put a table of paths, labels and splits in a lakehouse. Versioning that
            table gives you a precise record of the dataset without copying large files.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Warehouses apply schema on write and suit SQL. Lakes apply schema on read and hold any file.",
    "Columnar files and partitions shrink scans, which cuts both cost and run time.",
    "Table formats like Delta Lake and Apache Iceberg add transactions and versions to lake files.",
    "Log the table version with each training run so that the dataset can be found again.",
    "Live inference needs an online store, not a lake or warehouse.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does schema on read mean?",
      options: [
        "Data must match a schema before it's stored",
        "Files are stored as they are and interpreted when read",
        "Schemas are stored in a cache",
        "The data has no structure at all",
      ],
      answer: 1,
      explain: "The reader applies the structure, which is flexible but moves problems downstream.",
    },
    {
      kind: "mcq",
      q: "What does a table format like Apache Iceberg add to files on object storage?",
      options: [
        "GPU acceleration",
        "Faster network links",
        "Metadata that gives transactions and table versions",
        "A built-in model registry",
      ],
      answer: 2,
      explain: "Its metadata layer tracks which files form each version of the table.",
    },
    {
      kind: "mcq",
      q: "Why can time travel fail for a model trained two years ago?",
      options: [
        "Old versions become read-only",
        "Cleanup may have deleted the old files",
        "Parquet expires after a year",
        "Versions are only kept in memory",
      ],
      answer: 1,
      explain: "VACUUM and snapshot expiry remove old files, so keep a separate snapshot if you need it long term.",
    },
    {
      kind: "text",
      q: "A 1 TB (1,000 GB) table has 50 equally sized columns. A columnar read of 5 columns scans how many GB?",
      format: "***",
      accept: ["100", "100gb", "100 gb"],
      explain: "1,000 × 5 ÷ 50 = 100 GB.",
    },
    {
      kind: "text",
      q: "Which columnar file format is the usual choice in data lakes?",
      format: "*******",
      accept: ["parquet", "apache parquet"],
      explain: "Parquet stores values by column, so readers can skip the columns they don't need.",
    },
  ],
};
