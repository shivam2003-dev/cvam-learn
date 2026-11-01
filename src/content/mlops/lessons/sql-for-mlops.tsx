import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Build training features with joins and aggregations",
    "Avoid label leakage with point-in-time filters",
    "Use window functions for rolling metrics and deduplication",
    "Write data quality checks and cheap queries",
  ],
  tasks: [
    {
      id: "problem",
      title: "Most training data starts as a query",
      body: (
        <>
          <p>
            The data behind a model usually lives in a database or warehouse, such as PostgreSQL,
            BigQuery, Snowflake or Redshift. <strong>SQL</strong> is how you get it out. A pipeline
            often begins with a query, and predictions and monitoring results often end up back in
            tables.
          </p>
          <p>
            For an MLOps engineer, a wrong query is worse than a crash. It runs, returns plausible
            rows and quietly produces a bad model. So this lesson focuses on the three mistakes that
            cause the most harm: join fan-out, data leakage and filters in the wrong place.
          </p>
          <p>It helps to know the order a database logically follows, because it differs from the order you write:</p>
          <Table
            head={["Step", "Clause", "What happens"]}
            rows={[
              ["1", "FROM and JOIN", "Pick tables and match rows"],
              ["2", "WHERE", "Filter individual rows"],
              ["3", "GROUP BY", "Collapse rows into groups"],
              ["4", "HAVING", "Filter whole groups"],
              ["5", "SELECT", "Compute columns, including window functions"],
              ["6", "ORDER BY, LIMIT", "Sort and cut the result"],
            ]}
          />
        </>
      ),
    },
    {
      id: "joins",
      title: "Joins and the fan-out bug",
      body: (
        <>
          <p>
            An <code>INNER JOIN</code> keeps rows with a match on both sides. A{" "}
            <code>LEFT JOIN</code> keeps every row from the left table and fills missing matches
            with <code>NULL</code>. For features you nearly always want <code>LEFT JOIN</code>,
            because a customer with no orders is still a customer. Often that absence is the signal.
          </p>
          <p>
            <strong>Fan-out</strong> happens when a join matches many rows per key. Say you have
            1,000 customers, each with 3 support tickets on average. Joining them directly gives
            1,000 × 3 = 3,000 rows. Now each customer appears 3 times, and any sum of their
            subscription fee is three times too large. Your training set is also weighted towards
            customers with many tickets.
          </p>
          <p>The fix is to aggregate to one row per key first, then join:</p>
          <pre>
            <code>{`WITH ticket_counts AS (
  SELECT customer_id, COUNT(*) AS tickets
  FROM support_tickets
  GROUP BY customer_id
)
SELECT c.customer_id, c.plan, COALESCE(t.tickets, 0) AS tickets
FROM customers c
LEFT JOIN ticket_counts t ON t.customer_id = c.customer_id;`}</code>
          </pre>
          <p>
            <code>WITH</code> defines a <strong>common table expression</strong>, a named temporary
            result that keeps long queries readable. <code>COALESCE</code> returns the first
            non-null value, turning "no tickets" into 0.
          </p>
          <Callout tone="tip">
            After building a training table, check that row count equals the number of unique keys.
            If they differ, a join has fanned out.
          </Callout>
        </>
      ),
    },
    {
      id: "leakage",
      title: "Point-in-time correctness",
      body: (
        <>
          <p>
            <strong>Leakage</strong> means a model trains on information it won't have at prediction
            time. Evaluation looks wonderful, and production disappoints. In SQL it's usually
            innocent: you compute total spend across all time, including spending that happened
            after the moment you're trying to predict from.
          </p>
          <p>
            Each training row should be built like a time machine: use only what was known on that
            row's date. Here is a churn example, in PostgreSQL syntax. Date arithmetic varies between
            systems.
          </p>
          <pre>
            <code>{`SELECT
  l.customer_id,
  l.label_date,
  l.churned,
  COUNT(o.order_id)          AS orders_90d,
  COALESCE(SUM(o.amount), 0) AS spend_90d
FROM labels l
LEFT JOIN orders o
  ON  o.customer_id = l.customer_id
  AND o.order_date <  l.label_date
  AND o.order_date >= l.label_date - INTERVAL '90 days'
GROUP BY l.customer_id, l.label_date, l.churned;`}</code>
          </pre>
          <p>
            The strict <code>{"<"}</code> excludes anything from the label date onwards. Notice too
            that the date filters sit in the <code>ON</code> clause.
          </p>
          <Callout tone="warn">
            If those date filters move to <code>WHERE</code>, customers with no orders are dropped.
            Their <code>order_date</code> is <code>NULL</code>, the comparison isn't true, and the{" "}
            <code>LEFT JOIN</code> behaves like an <code>INNER JOIN</code>. Those may be the very
            customers most likely to churn.
          </Callout>
        </>
      ),
    },
    {
      id: "windows",
      title: "Window functions",
      body: (
        <>
          <p>
            <code>GROUP BY</code> collapses rows. A <strong>window function</strong> computes across
            related rows but keeps every row. Two patterns come up constantly.
          </p>
          <p>
            <strong>Latest row per key.</strong> Tables that receive updates often hold several
            versions of each entity:
          </p>
          <pre>
            <code>{`SELECT *
FROM (
  SELECT p.*,
         ROW_NUMBER() OVER (
           PARTITION BY customer_id
           ORDER BY updated_at DESC
         ) AS rn
  FROM customer_profile p
) ranked
WHERE rn = 1;`}</code>
          </pre>
          <p>
            <strong>Rolling metrics for monitoring.</strong> A daily rate is noisy, so compare it
            with a 7-day average. A sudden gap between them can reveal drift:
          </p>
          <pre>
            <code>{`SELECT
  day,
  positive_rate,
  AVG(positive_rate) OVER (
    ORDER BY day
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rate_7d
FROM daily_predictions
ORDER BY day;`}</code>
          </pre>
          <p>The window covers the current row and the six before it, which makes seven days if the table has one row per day.</p>
        </>
      ),
    },
    {
      id: "quality-cost",
      title: "Data checks and query cost",
      body: (
        <>
          <p>
            A pipeline should check data before training on it. One query can reveal a lot. The key
            fact is that <code>COUNT(*)</code> counts rows, while <code>COUNT(column)</code> skips{" "}
            <code>NULL</code>s.
          </p>
          <pre>
            <code>{`SELECT
  COUNT(*)                    AS total_rows,
  COUNT(*) - COUNT(age)       AS null_age,
  COUNT(DISTINCT customer_id) AS unique_customers,
  MIN(signup_date)            AS earliest,
  MAX(signup_date)            AS latest
FROM customers;`}</code>
          </pre>
          <Formula>missing % = (total rows − non-null rows) ÷ total rows × 100</Formula>
          <p>
            If there are 1,000,000 rows and <code>COUNT(age)</code> returns 970,000, then 30,000 are
            missing, which is 3%. Fail the pipeline if that rate jumps from its usual level. A stale{" "}
            <code>MAX(signup_date)</code> is an equally useful warning: the upstream feed may have
            stopped.
          </p>
          <p>
            Cost matters too, because warehouses often charge by data scanned or by compute time.
            Two habits help, as these illustrative figures show:
          </p>
          <ul>
            <li>
              <strong>Filter on the partition column.</strong> A table is often split by date. With
              1 GB per day across 1,000 days, a 30-day filter on that column reads about 30 GB
              rather than 1,000 GB, or 3% of the table.
            </li>
            <li>
              <strong>Avoid SELECT *.</strong> Warehouses store data by column. Reading 5 of 50
              similar-sized columns touches about 10% of the data.
            </li>
          </ul>
          <Callout tone="note">
            Point heavy training queries at a warehouse or a read replica, not the production
            database serving your app. A long scan can slow down live customers. Use{" "}
            <code>EXPLAIN</code> to see how a database plans to run a query.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Aggregate to one row per key before joining, to avoid fan-out.",
    "Build each training row only from data known before its label date.",
    "Filters on the right table of a LEFT JOIN belong in the ON clause.",
    "Window functions handle deduplication and rolling metrics without collapsing rows.",
    "COUNT(*) minus COUNT(column) gives a simple missing-value check.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A training table should have one row per customer but has 40% more rows than customers. What is the likely cause?",
      options: [
        "A missing index",
        "A join that matched several rows per customer",
        "Too many columns",
        "A slow query",
      ],
      answer: 1,
      explain: "That's join fan-out. Aggregate the many-side to one row per key before joining.",
    },
    {
      kind: "mcq",
      q: "What does a window function do that GROUP BY doesn't?",
      options: [
        "Computes across related rows while keeping every row",
        "Removes NULL values",
        "Runs before WHERE",
        "Joins two tables",
      ],
      answer: 0,
      explain: "GROUP BY collapses rows into groups. Window functions keep the original rows.",
    },
    {
      kind: "text",
      q: "A table has 200,000 rows, and COUNT(age) returns 195,000. What percentage of age values are missing? Answer as a number.",
      format: "*.*",
      accept: ["2.5", "2.5%"],
      explain: "5,000 ÷ 200,000 × 100 = 2.5%.",
    },
    {
      kind: "text",
      q: "What is it called when a model trains on information unavailable at prediction time?",
      format: "*******",
      accept: ["leakage", "data leakage", "label leakage"],
      explain: "Leakage inflates evaluation scores, and those scores don't hold up in production.",
    },
  ],
};
