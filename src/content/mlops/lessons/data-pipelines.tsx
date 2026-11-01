import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Explain what a data pipeline does and why ML systems depend on one",
    "Choose between ETL and ELT for a given situation",
    "Make a pipeline step safe to rerun and backfill",
    "Add data quality checks that stop bad data before training",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A model is a function of its training data. If an upstream team changes a price column
            from dollars to cents, nothing crashes. Training still succeeds. The model simply
            learns from numbers that are 100 times too large, and you find out when predictions go
            wrong in production.
          </p>
          <p>
            A <strong>data pipeline</strong> is an automated series of steps that moves data from
            where it's created to where it's used, and changes it along the way. Think of a water
            treatment plant. Raw water comes in from many sources, passes through fixed stages, and
            is tested before anyone drinks it. Nobody carries buckets by hand, and a failed test
            stops the supply.
          </p>
          <p>
            As an MLOps engineer you often don't own the source systems, but you depend on them.
            Your job is to make sure training and serving get data that is complete, correct and
            on time, and that you notice when it isn't.
          </p>
        </>
      ),
    },
    {
      id: "etl-elt",
      title: "ETL and ELT",
      body: (
        <>
          <p>Every pipeline does three things. The difference is the order.</p>
          <ul>
            <li><strong>Extract:</strong> pull data out of a source, such as a database or an API.</li>
            <li><strong>Transform:</strong> clean, join and reshape it.</li>
            <li><strong>Load:</strong> write it to its destination.</li>
          </ul>
          <p>
            <strong>ETL</strong> transforms data before loading it, usually on a separate
            processing system. <strong>ELT</strong> loads raw data first, then transforms it inside
            the warehouse using SQL. Cheap storage and powerful warehouses made ELT popular, and
            tools like dbt exist to manage those SQL transformations.
          </p>
          <Table
            head={["", "ETL", "ELT"]}
            rows={[
              ["Where transforms run", "A processing engine, before the destination", "Inside the warehouse or lakehouse"],
              ["Raw data kept?", "Not always", "Yes, in the destination"],
              ["Changing the logic later", "May need a new extract", "Rerun the transform on the raw data"],
              ["Good fit", "Removing sensitive fields before storage, heavy non-SQL work", "Tabular data and SQL-friendly teams"],
            ]}
          />
          <p>
            ML favors keeping the raw data. Feature ideas change often, and a new feature may need
            a field nobody thought was useful last year. If raw data is kept, you can compute that
            feature over past data and train on it. This doesn't have to be all or nothing: a team
            may mask personal data on the way in (ETL) and build features in the warehouse (ELT).
          </p>
        </>
      ),
    },
    {
      id: "idempotent",
      title: "Make every step safe to rerun",
      body: (
        <>
          <p>
            Pipelines fail halfway through. Networks drop and machines die, so the scheduler will
            retry. A step is <strong>idempotent</strong> if running it twice gives the same result
            as running it once. Without that property, a retry can double-count data.
          </p>
          <p>
            The common pattern is to process one partition at a time and replace it. A{" "}
            <strong>partition</strong> is a slice of a table, often one day. This job can run ten
            times and the result won't change:
          </p>
          <pre>
            <code>{`BEGIN;

-- Remove anything a previous attempt wrote for this day
DELETE FROM features.daily_spend
WHERE ds = DATE '2026-03-14';

-- Rebuild the day from the source
INSERT INTO features.daily_spend (user_id, ds, spend)
SELECT user_id, DATE '2026-03-14', SUM(amount)
FROM clean.payments
WHERE paid_at >= DATE '2026-03-14'
  AND paid_at <  DATE '2026-03-15'
GROUP BY user_id;

COMMIT;`}</code>
          </pre>
          <p>
            Compare a plain <code>INSERT</code> with no delete. If it succeeds and then the task
            is retried, every user's spend appears twice, and a model trained on that table learns
            from the duplicates.
          </p>
          <p>
            Idempotent partitions also make <strong>backfills</strong> possible. A backfill reruns
            a pipeline over past dates, usually because a new feature needs history or a bug needs
            fixing. Here's how long one might take (illustrative figures):
          </p>
          <Formula>backfill time = (partitions ÷ parallel runs) × time per partition</Formula>
          <pre>
            <code>{`90 days, 12 minutes per day

One at a time:  90 × 12         = 1,080 minutes = 18 hours
Five at once:   (90 ÷ 5) × 12   =   216 minutes = 3.6 hours`}</code>
          </pre>
          <Callout tone="warn">
            Features must only use data available at the prediction time. If a row dated 14 March
            includes information from 20 March, the model trains on the future. This is called{" "}
            <strong>data leakage</strong>. Offline scores look great, then live performance
            disappoints.
          </Callout>
        </>
      ),
    },
    {
      id: "quality",
      title: "Data quality checks",
      body: (
        <>
          <p>
            Code tests can't catch bad data, because the code may be correct. So you test the data
            itself, as a pipeline step, and stop the run if it fails.
          </p>
          <Table
            head={["Dimension", "Question", "Example check"]}
            rows={[
              ["Completeness", "Is anything missing?", "Null rate under 1%"],
              ["Validity", "Are values allowed?", "Age between 0 and 120"],
              ["Uniqueness", "Are there duplicates?", "One row per user per day"],
              ["Freshness", "Is it recent?", "Newest row under 2 hours old"],
              ["Volume", "Is the size normal?", "Row count within 20% of the 7-day average"],
              ["Schema", "Did the shape change?", "Expected columns and types exist"],
            ]}
          />
          <p>Many of these fit in a single SQL query:</p>
          <pre>
            <code>{`SELECT
  COUNT(*)                                       AS row_count,
  COUNT(*) - COUNT(DISTINCT user_id)             AS duplicate_users,
  AVG(CASE WHEN spend IS NULL THEN 1.0 ELSE 0 END) AS null_rate,
  MIN(spend)                                     AS min_spend
FROM features.daily_spend
WHERE ds = DATE '2026-03-14';`}</code>
          </pre>
          <p>A worked example with illustrative numbers. Say the last 7 days averaged 1,000,000 rows, and today's load has 620,000 rows, of which 24,800 have a null spend.</p>
          <pre>
            <code>{`Volume drop:  (1,000,000 − 620,000) ÷ 1,000,000 = 38%
Null rate:     24,800 ÷ 620,000                = 4%`}</code>
          </pre>
          <p>
            Against limits of 20% and 1%, both checks fail. The pipeline should stop before
            writing to the training table. Yesterday's good data stays in place, and someone gets
            an alert. A missed day of retraining is usually far cheaper than a model trained on
            bad data.
          </p>
          <Callout tone="tip">
            Write and validate first, then publish. Build the new partition in a staging location,
            run the checks there, and only then swap it into the table that training reads. Tools
            such as Great Expectations, Soda and dbt tests help you manage many checks once a
            hand-written query stops scaling.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A pipeline automates moving and transforming data so that training and serving can rely on it.",
    "ETL transforms before loading, ELT after. Keeping raw data lets you build new features later.",
    "Idempotent steps make retries and backfills safe, usually by replacing whole partitions.",
    "Test data as a pipeline step, and stop the run when a check fails.",
    "Only use data that was available at prediction time, or you'll leak the future into training.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main difference between ETL and ELT?",
      options: [
        "ETL is only for streaming data",
        "ELT loads raw data first and transforms it at the destination",
        "ELT never transforms data",
        "ETL can't use SQL",
      ],
      answer: 1,
      explain: "Both do the same three things. ELT moves the transform to after the load.",
    },
    {
      kind: "mcq",
      q: "A daily job appends rows, and the scheduler retries it after a late failure. What's the likely result?",
      options: [
        "Nothing changes",
        "The table is dropped",
        "Rows for that day are duplicated",
        "The schema changes",
      ],
      answer: 2,
      explain: "A plain append isn't idempotent. Replacing the whole partition avoids this.",
    },
    {
      kind: "text",
      q: "A load has 150,000 rows, and 6,000 have a null value in a column. What is the null rate, in percent?",
      format: "*",
      accept: ["4", "4%"],
      explain: "6,000 ÷ 150,000 = 0.04, which is 4%.",
    },
    {
      kind: "text",
      q: "What word describes a step that gives the same result whether it runs once or many times?",
      format: "**********",
      accept: ["idempotent"],
      explain: "Idempotent steps are safe to retry, which schedulers do automatically.",
    },
    {
      kind: "text",
      q: "What is the term for rerunning a pipeline over past dates?",
      format: "********",
      accept: ["backfill", "backfilling", "back-fill"],
      explain: "A backfill recomputes history, for example when a new feature needs past values.",
    },
  ],
};
