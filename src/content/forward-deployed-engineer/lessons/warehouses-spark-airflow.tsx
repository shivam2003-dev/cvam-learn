import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Explain what a data warehouse is and how it differs from an operational database",
    "Decide when Spark is needed and when plain SQL is enough",
    "Describe an Airflow DAG and the habits that keep workflows healthy",
  ],
  tasks: [
    {
      id: "warehouse",
      title: "Data warehouses",
      body: (
        <>
          <p>
            A <strong>data warehouse</strong> (Snowflake, BigQuery, Redshift, Databricks SQL) is a
            database built for analytics: large scans, aggregations and many readers. It stores
            data in columns, so a query over one column of a billion rows reads only that column.
          </p>
          <Table
            head={["", "Operational DB (OLTP)", "Warehouse (OLAP)"]}
            rows={[
              ["Purpose", "Run the application", "Answer questions across history"],
              ["Access", "Many small reads and writes", "Few big scans and aggregates"],
              ["Layout", "Row oriented", "Column oriented"],
              ["Typical query", "Get order 42", "Revenue by region by month"],
            ]}
          />
          <p>
            Running heavy reports on the production database slows the app. Replicate into a
            warehouse and report from there. Control cost by filtering on partition columns and
            selecting only the columns you need.
          </p>
        </>
      ),
    },
    {
      id: "spark",
      title: "Spark for scale",
      body: (
        <>
          <p>
            <strong>Apache Spark</strong> spreads a computation across many machines. You write
            DataFrame code and Spark plans how to split it into tasks.
          </p>
          <pre>
            <code>{`from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("daily_sales").getOrCreate()
orders = spark.read.parquet("s3://lake/raw/orders/")
daily = (orders
    .filter(F.col("status") == "paid")
    .groupBy("store_id", F.to_date("created_at").alias("day"))
    .agg(F.sum("total").alias("revenue")))
daily.write.mode("overwrite").partitionBy("day").parquet("s3://lake/curated/daily_sales/")`}</code>
          </pre>
          <Callout tone="tip">
            Try SQL in the warehouse first. Spark earns its place when data no longer fits one
            machine's memory, when you need custom Python/Scala transforms at scale, or when the
            customer already runs it.
          </Callout>
          <p>
            Common Spark pain: skewed keys (one partition is huge), too many small files, and
            wide shuffles. Look at the Spark UI before adding more machines.
          </p>
        </>
      ),
    },
    {
      id: "airflow",
      title: "Orchestrating with Airflow",
      body: (
        <>
          <p>
            <strong>Apache Airflow</strong> schedules and monitors workflows defined as a DAG, a
            directed acyclic graph of tasks with dependencies.
          </p>
          <pre>
            <code>{`from airflow.decorators import dag, task
from datetime import datetime

@dag(schedule="@daily", start_date=datetime(2026, 1, 1), catchup=False)
def sales_pipeline():
    @task
    def extract(): ...
    @task
    def transform(raw): ...
    @task
    def load(clean): ...

    load(transform(extract()))

sales_pipeline()`}</code>
          </pre>
          <ul>
            <li>Keep tasks small and idempotent so retries are safe.</li>
            <li>Pass references (paths, IDs) between tasks, not large data.</li>
            <li>Set retries, timeouts and alerts on failure or on a missed SLA.</li>
            <li>Parameterise by run date so you can backfill history.</li>
            <li>Keep secrets in connections or a secrets backend, not in DAG code.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Warehouses are column stores for analytics; keep heavy reports off the production database.",
    "Use SQL first; reach for Spark when data or logic outgrows one machine.",
    "Airflow DAGs should be small, idempotent, parameterised by date and monitored.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why are warehouses fast at aggregating one column across billions of rows?",
      options: [
        "They store data by column, reading only what is needed",
        "They have no indexes",
        "They hold everything in a spreadsheet",
        "They avoid disks",
      ],
      answer: 0,
      explain: "Columnar storage skips unrelated columns and compresses well.",
    },
    {
      kind: "mcq",
      q: "When is Spark the right tool?",
      options: [
        "A 10,000-row CSV",
        "Data too large for one machine or the customer already runs it",
        "Sending an email",
        "Styling a web page",
      ],
      answer: 1,
      explain: "Spark pays off at scale or where it is already the platform. Smaller jobs are simpler in SQL.",
    },
    {
      kind: "mcq",
      q: "What does DAG stand for in Airflow?",
      options: ["Directed acyclic graph", "Data access gateway", "Dynamic API group", "Database aggregation grid"],
      answer: 0,
      explain: "Tasks are nodes and dependencies are directed edges with no cycles.",
    },
  ],
};
