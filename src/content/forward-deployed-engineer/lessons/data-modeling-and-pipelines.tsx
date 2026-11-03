import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Model data with entities, keys, normalisation and a clear grain",
    "Contrast ETL and ELT and pick one for a given job",
    "Build a pipeline that is idempotent, validated and observable",
  ],
  tasks: [
    {
      id: "modeling",
      title: "Data modeling basics",
      body: (
        <>
          <p>
            Customer data is usually shaped by whatever system created it, not by what you need
            to answer. Modeling is deciding the entities, how they relate, and what one row means.
          </p>
          <ul>
            <li>
              <strong>Entities and keys.</strong> Customers, orders, products. Each has a stable
              primary key; relations use foreign keys.
            </li>
            <li>
              <strong>Normalisation</strong> removes duplication for transactional systems:
              store a customer's address once.
            </li>
            <li>
              <strong>Denormalisation</strong> copies data into wide tables for fast analytics.
            </li>
            <li>
              <strong>Grain.</strong> State what one row represents before anything else: one
              order line, one daily balance, one event. Mixed grains cause wrong totals.
            </li>
          </ul>
          <Table
            head={["Model", "Shape", "Best for"]}
            rows={[
              ["Third normal form", "Many narrow tables", "Writes, integrity (OLTP)"],
              ["Star schema", "Fact table plus dimensions", "Reporting, BI (OLAP)"],
              ["One big table", "Wide, flattened", "Quick analysis, ML features"],
            ]}
          />
          <Callout tone="warn">
            Joining a one-to-many relationship before summing is the classic cause of inflated
            totals. Check row counts before and after every join.
          </Callout>
        </>
      ),
    },
    {
      id: "etl-elt",
      title: "ETL and ELT",
      body: (
        <>
          <p>
            A <strong>data pipeline</strong> moves data from sources to a destination and shapes it
            on the way.
          </p>
          <Table
            head={["", "ETL", "ELT"]}
            rows={[
              ["Order", "Extract, transform, then load", "Extract, load raw, then transform"],
              ["Where transforms run", "A separate engine before the warehouse", "Inside the warehouse (SQL, dbt)"],
              ["Raw data kept?", "Often not", "Yes, so you can reprocess"],
              ["Good when", "Strict privacy, small targets, heavy cleaning first", "Modern cloud warehouse, evolving questions"],
            ]}
          />
          <p>
            ELT is the common default now: land raw data cheaply, then transform with versioned
            SQL. Use ETL when sensitive fields must be removed before data ever reaches the
            destination.
          </p>
        </>
      ),
    },
    {
      id: "reliable",
      title: "Pipelines that survive Tuesday",
      body: (
        <>
          <ul>
            <li>
              <strong>Idempotent.</strong> Running a job twice gives the same result. Use upserts
              or write by partition (overwrite one day), never blind appends.
            </li>
            <li>
              <strong>Incremental.</strong> Process only new or changed rows using a watermark such
              as <code>updated_at</code>.
            </li>
            <li>
              <strong>Validated.</strong> Check row counts, nulls, ranges and uniqueness; fail
              loudly instead of loading bad data.
            </li>
            <li>
              <strong>Observable.</strong> Log counts in and out, and alert on late or empty runs.
            </li>
            <li>
              <strong>Replayable.</strong> Keep raw data so a bug fix can be re-run over history.
            </li>
          </ul>
          <pre>
            <code>{`-- Idempotent load: re-running does not duplicate
INSERT INTO daily_sales (day, store_id, revenue)
SELECT day, store_id, SUM(total)
FROM raw_orders
WHERE day = :run_day
GROUP BY day, store_id
ON CONFLICT (day, store_id) DO UPDATE SET revenue = EXCLUDED.revenue;`}</code>
          </pre>
        </>
      ),
    },
  ],
  takeaways: [
    "State the grain of every table; check row counts around joins.",
    "Use normalised models for writes and star schemas or wide tables for analysis.",
    "Default to ELT with raw data kept; use ETL when sensitive data must be stripped first.",
    "Make pipelines idempotent, incremental, validated, observable and replayable.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does it mean for a pipeline step to be idempotent?",
      options: [
        "It runs faster each time",
        "Running it more than once gives the same result",
        "It never fails",
        "It deletes its inputs",
      ],
      answer: 1,
      explain: "Idempotency makes retries and re-runs safe, which is essential for reliable pipelines.",
    },
    {
      kind: "mcq",
      q: "Totals are suddenly doubled after adding a join. Most likely cause?",
      options: [
        "A one-to-many join before summing duplicated rows",
        "The database is full",
        "SQL cannot add numbers",
        "A time zone bug",
      ],
      answer: 0,
      explain: "A fan-out join repeats the parent row for each child, inflating sums.",
    },
    {
      kind: "mcq",
      q: "Sensitive fields must never reach the analytics warehouse. Which approach fits?",
      options: ["ELT with raw load", "ETL that removes the fields before loading", "Email the file", "Load everything then hope"],
      answer: 1,
      explain: "ETL transforms before load, so the sensitive columns can be dropped or masked first.",
    },
  ],
};
