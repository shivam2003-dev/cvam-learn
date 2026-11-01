import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Medium",
  objectives: [
    "Describe how Spark splits a job across a driver and executors",
    "Tell transformations from actions, and narrow from wide operations",
    "Write a PySpark feature job and a batch scoring job",
    "Estimate partitions and diagnose common failures such as skew",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            pandas works on one machine, in memory. Six months of clickstream data might be 600 GB,
            and your feature job needs to read all of it. A bigger machine helps only up to a
            point, and a crash at hour five loses everything.
          </p>
          <p>
            <strong>Apache Spark</strong> spreads the work across many machines and recovers when
            some of them fail. Think of counting all the votes in a country. One person would never
            finish. Instead, a coordinator hands one ballot box to each of many counters and adds
            up their totals. If a counter goes home sick, only their box is recounted.
          </p>
          <p>
            MLOps engineers rarely tune Spark for fun. You use it for three jobs: building
            features, preparing training sets and scoring large tables in batch. You also debug
            those jobs when they fail at 3 a.m.
          </p>
        </>
      ),
    },
    {
      id: "how-it-runs",
      title: "How a job runs",
      body: (
        <>
          <Table
            head={["Term", "Meaning"]}
            rows={[
              ["Driver", "The process that runs your program, plans the work and tracks it"],
              ["Executor", "A worker process that runs tasks and holds data"],
              ["Partition", "One chunk of the data, processed by one task"],
              ["Task", "One unit of work, running on one executor core"],
              ["Stage", "A group of tasks that can run without moving data between machines"],
              ["Job", "All the stages started by one action"],
            ]}
          />
          <p>
            Spark is <strong>lazy</strong>. A <strong>transformation</strong> such as{" "}
            <code>filter</code> or <code>groupBy</code> only adds a step to a plan. Nothing runs
            until an <strong>action</strong>, such as <code>count</code> or <code>write</code>,
            asks for a result. Waiting lets Spark optimize the whole plan: it can push a filter
            down so that it reads less data, for example.
          </p>
          <p>
            That plan is also how Spark recovers. If an executor dies, Spark uses the recorded
            steps, known as <strong>lineage</strong>, to recompute only the lost partitions. This
            is why cheaper spot instances are often workable for Spark workers.
          </p>
          <p>
            Operations come in two kinds. <strong>Narrow</strong> ones, like <code>filter</code>,
            work on each partition alone. <strong>Wide</strong> ones, like <code>groupBy</code> and{" "}
            <code>join</code>, need rows with the same key in the same place, so data must cross
            the network. That movement is a <strong>shuffle</strong>, and it's usually the slowest
            and most failure-prone part of a job.
          </p>
        </>
      ),
    },
    {
      id: "features",
      title: "A feature job in PySpark",
      body: (
        <>
          <p>This job builds daily features per user, with a rolling spend column.</p>
          <pre>
            <code>{`from pyspark.sql import SparkSession, functions as F
from pyspark.sql.window import Window

spark = (
    SparkSession.builder
    .appName("churn-features")
    .config("spark.sql.sources.partitionOverwriteMode", "dynamic")
    .getOrCreate()
)

# Transformations only: nothing has run yet
events = spark.read.parquet("s3a://lake/clean/events/")

daily = (
    events
    .filter(F.col("ds").between("2026-01-01", "2026-03-31"))
    .groupBy("user_id", "ds")
    .agg(F.count("*").alias("event_count"), F.sum("amount").alias("spend"))
)

w = Window.partitionBy("user_id").orderBy("ds").rowsBetween(-6, 0)
features = daily.withColumn("spend_last_7_active_days", F.sum("spend").over(w))

# The action: this line starts the job
features.write.mode("overwrite").partitionBy("ds").parquet("s3a://lake/features/churn/")`}</code>
          </pre>
          <p>
            Note that <code>rowsBetween(-6, 0)</code> counts rows, not calendar days. Users with
            gaps in activity get a window longer than a week, and the column name says so. For a
            true 7-day window, fill the missing days first or use a time-based range.
          </p>
          <Callout tone="warn">
            By default, <code>mode("overwrite")</code> on a partitioned path replaces the{" "}
            <strong>entire</strong> table, not just the partitions you wrote. The dynamic setting
            above replaces only the partitions in your output. That one line is what makes a
            single-day rerun safe.
          </Callout>
          <p>
            For batch scoring, <code>mapInPandas</code> sends your model code to the executors. It
            hands you pandas DataFrames, so existing model code mostly works as it is.
          </p>
          <pre>
            <code>{`import joblib

FEATURES = ["event_count", "spend", "spend_last_7_active_days"]

def score(batches):
    model = joblib.load("/models/churn.joblib")  # once per task, not per row
    for df in batches:
        df["score"] = model.predict_proba(df[FEATURES])[:, 1]
        yield df[["user_id", "score"]]

scores = features.mapInPandas(score, schema="user_id string, score double")`}</code>
          </pre>
          <p>
            The model file must be reachable from each executor, for example baked into the
            container image or copied from object storage.
          </p>
        </>
      ),
    },
    {
      id: "sizing",
      title: "Sizing a job",
      body: (
        <>
          <p>
            When reading files, Spark targets partitions of about 128 MB by default, set by{" "}
            <code>spark.sql.files.maxPartitionBytes</code>. Each executor core runs one task at a
            time.
          </p>
          <Formula>best-case time ≈ (partitions ÷ total cores) × time per task</Formula>
          <p>Here's a worked example with illustrative timings for a 600 GB input.</p>
          <pre>
            <code>{`Partitions:  600 × 1,024 MB ÷ 128 MB = 4,800
Cores:       100 executors × 4 cores = 400
Rounds:      4,800 ÷ 400             = 12
Time:        12 × 30 seconds         = 6 minutes`}</code>
          </pre>
          <p>
            That's the ideal for one stage. Real jobs have shuffles, slow tasks and startup time.
          </p>
          <p>
            After a shuffle, Spark SQL's partition count comes from{" "}
            <code>spark.sql.shuffle.partitions</code>, which defaults to 200. If a shuffle moves 400
            GB, that's about 2 GB per partition, large enough to cause memory pressure. Aiming for
            around 200 MB per partition suggests a value near 2,000.
          </p>
          <pre>
            <code>{`spark-submit \\
  --master yarn --deploy-mode cluster \\
  --num-executors 100 --executor-cores 4 --executor-memory 16g \\
  --conf spark.sql.shuffle.partitions=2000 \\
  features.py`}</code>
          </pre>
          <p>
            Recent Spark versions have <strong>Adaptive Query Execution</strong> on by default. It
            adjusts plans at run time using real statistics, and it can merge small shuffle
            partitions and split skewed ones. It reduces the need for hand tuning but doesn't
            remove it.
          </p>
        </>
      ),
    },
    {
      id: "debugging",
      title: "When a job fails",
      body: (
        <>
          <p>
            The <strong>Spark UI</strong> is your first stop. It shows each stage and how long its
            tasks took. Compare the median task time with the maximum.
          </p>
          <Table
            head={["Symptom", "Likely cause", "What to try"]}
            rows={[
              ["One task runs far longer than the rest", "Skew: one key holds much of the data", "Fix null or default keys, or salt the key"],
              ["Executors lost, out of memory", "Partitions too large", "Increase shuffle partitions or memory"],
              ["Driver out of memory", "collect() pulled data to one machine", "Write results out, and don't collect"],
              ["A slow join", "A small table is being shuffled", "Broadcast the small table"],
              ["Slow reads, many tiny tasks", "Small files", "Compact the files on write"],
            ]}
          />
          <p>
            <strong>Skew</strong> is the classic case. If 30% of your rows have a null{" "}
            <code>user_id</code>, they all go to one partition, and one task does the work while
            399 cores wait. Salting means adding a random suffix to split a hot key across tasks.
          </p>
          <p>
            A <strong>broadcast join</strong> sends a full copy of a small table to each executor,
            which avoids shuffling the large one:{" "}
            <code>events.join(F.broadcast(users), "user_id")</code>.
          </p>
          <Callout tone="tip">
            Avoid plain Python UDFs where a built-in function exists. They process rows one at a
            time and move data between the JVM and Python. Built-in functions run inside Spark's
            engine, and pandas-based functions work in batches.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Spark splits data into partitions and runs one task per partition across executors.",
    "Transformations build a lazy plan, and actions run it.",
    "Shuffles move data across the network and are usually the costliest part of a job.",
    "Enable dynamic partition overwrite so that a rerun replaces only the days it wrote.",
    "When one task lags behind the rest, suspect skew. Start debugging in the Spark UI.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which call makes Spark actually run a job?",
      options: ["filter", "groupBy", "withColumn", "write"],
      answer: 3,
      explain: "write is an action. The other three are transformations that only extend the plan.",
    },
    {
      kind: "mcq",
      q: "In a stage of 2,000 tasks, 1,999 finish in a minute and one runs for 40 minutes. What's the most likely cause?",
      options: ["Data skew", "Too many executors", "Lazy evaluation", "Parquet compression"],
      answer: 0,
      explain: "One partition holds far more data than the others, usually because of a hot key.",
    },
    {
      kind: "mcq",
      q: "Which operation needs a shuffle?",
      options: ["filter", "select", "groupBy", "withColumn"],
      answer: 2,
      explain: "groupBy has to bring rows with the same key together, so it's a wide operation.",
    },
    {
      kind: "text",
      q: "How many input partitions does a 300 GB dataset give at 128 MB per partition? (1 GB = 1,024 MB.)",
      format: "****",
      accept: ["2400", "2,400"],
      explain: "300 × 1,024 ÷ 128 = 2,400.",
    },
    {
      kind: "text",
      q: "What is Spark's name for moving data between executors across the network?",
      format: "*******",
      accept: ["shuffle", "shuffling", "a shuffle"],
      explain: "Wide operations like joins and aggregations trigger a shuffle.",
    },
  ],
};
