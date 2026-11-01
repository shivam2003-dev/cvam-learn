import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Compare batch, micro-batch and streaming ingestion",
    "Estimate data freshness and event volume for a design",
    "Explain change data capture and delivery guarantees",
    "Evaluate Lambda and Kappa architectures for ML features",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Ingestion is how data gets from source systems into your platform. The key question is
            how old the data can be when the model uses it.
          </p>
          <p>
            A churn model that scores customers each week can happily use yesterday's data. A
            fraud model can't. If a stolen card makes ten purchases in two minutes and your
            features update once an hour, the model sees none of them in time.
          </p>
          <p>
            Think of mail. <strong>Batch</strong> ingestion is the postal service: everything is
            collected and delivered in a daily round. <strong>Streaming</strong> is a phone call:
            each message arrives as soon as it's spoken, but someone must be there to answer all
            day. Faster delivery costs more, so choose it only when freshness earns its keep.
          </p>
        </>
      ),
    },
    {
      id: "patterns",
      title: "Batch, micro-batch and streaming",
      body: (
        <>
          <Table
            head={["Pattern", "How it works", "Typical freshness", "Fits"]}
            rows={[
              ["Batch", "A scheduled job copies a chunk of data", "Hours to a day", "Training data, reports, weekly scoring"],
              ["Micro-batch", "Very short batches, repeated all the time", "Seconds to minutes", "Near-real-time features using a batch engine"],
              ["Streaming", "Each event is processed as it arrives", "Milliseconds to seconds", "Fraud, recommendations, live personalization"],
            ]}
          />
          <p>
            Batch is simple. A failed job can just be rerun, and the data is complete when you read
            it. Streaming runs all the time, so someone is on call for it, and it needs care for
            late or repeated events. Spark Structured Streaming is a well-known micro-batch system
            by default. Flink is built around processing one event at a time.
          </p>
          <p>For a batch job, the oldest data a model can see is easy to work out:</p>
          <Formula>worst-case staleness = batch interval + job duration</Formula>
          <p>
            With an hourly job that takes 10 minutes, an event arriving just after a run starts
            waits almost 60 minutes for the next run, then 10 more for it to finish. That's about
            70 minutes at worst. On average it's about 40 minutes (half the interval plus the
            job). If your feature needs to be under 5 minutes old, hourly batch can't work however
            fast the job gets.
          </p>
          <p>You also need to size the flow. Here's an illustrative example:</p>
          <pre>
            <code>{`5,000 events per second × 1 KB per event = 5 MB per second
5 MB × 86,400 seconds per day           = 432,000 MB = 432 GB per day`}</code>
          </pre>
          <p>
            That figure drives broker sizing, retention and storage. Size for the peak rather than
            the average, since traffic is rarely flat across a day.
          </p>
        </>
      ),
    },
    {
      id: "cdc",
      title: "Change data capture",
      body: (
        <>
          <p>
            Much valuable data lives in production databases. The simple way to pull it is to
            query for rows with a recent <code>updated_at</code>. That misses deleted rows, misses
            values that changed twice between polls, and puts load on the database.
          </p>
          <p>
            <strong>Change data capture (CDC)</strong> reads the database's own transaction log
            instead: the Write-Ahead Log in PostgreSQL or the binlog in MySQL. The database already
            writes each insert, update and delete there in commit order. A CDC tool turns those
            records into a stream of change events. Debezium is a widely used open source option
            that runs on Kafka Connect:
          </p>
          <pre>
            <code>{`{
  "name": "orders-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "orders-db.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "\${file:/secrets/db.properties:password}",
    "database.dbname": "orders",
    "topic.prefix": "orders",
    "table.include.list": "public.orders",
    "plugin.name": "pgoutput"
  }
}`}</code>
          </pre>
          <p>
            For ML this is valuable because you see how a record changed over time. An order
            moving from "placed" to "refunded" is a signal that a nightly snapshot could lose.
          </p>
          <Callout tone="warn">
            Don't have an application write to its database and to Kafka as two separate steps.
            If one write fails, the two systems disagree. This is called the{" "}
            <strong>dual write</strong> problem, and reading the log avoids it. Also talk to the
            database owners first: a stalled CDC reader can stop the database from cleaning up its
            log, and disk usage will climb.
          </Callout>
        </>
      ),
    },
    {
      id: "guarantees",
      title: "Duplicates, order and late data",
      body: (
        <>
          <p>
            Networks fail, and when a sender gets no acknowledgement, it must decide whether to
            send again. That decision defines the delivery guarantee.
          </p>
          <Table
            head={["Guarantee", "Meaning", "Risk"]}
            rows={[
              ["At most once", "Send once, never retry", "Events can be lost"],
              ["At least once", "Retry until acknowledged", "Events can repeat"],
              ["Exactly once", "Each event affects the result once", "Needs support from every part of the path"],
            ]}
          />
          <p>
            At least once is the usual default. You handle repeats by giving each event a unique
            ID and making the writer ignore IDs it has already seen, for example with an upsert.
            An <strong>upsert</strong> updates a row if the key exists and inserts it if not.
          </p>
          <p>
            Time needs care too. <strong>Event time</strong> is when something happened.{" "}
            <strong>Processing time</strong> is when your system saw it. A phone that was offline
            may send a purchase two hours late. Build features on event time where you can, or the same
            events can produce different feature values depending on when they were processed.
          </p>
        </>
      ),
    },
    {
      id: "lambda-kappa",
      title: "Lambda and Kappa",
      body: (
        <>
          <p>
            ML often needs both long history for training and fresh values for serving. Two
            architectures address this.
          </p>
          <Table
            head={["", "Lambda", "Kappa"]}
            rows={[
              ["Idea", "A batch path and a separate streaming path", "One streaming path for everything"],
              ["Rebuilding history", "Rerun the batch path", "Replay events from a retained log"],
              ["Main strength", "Batch gives complete, correctable results", "One codebase"],
              ["Main risk", "Two versions of the same logic drift apart", "Replay needs long retention and can be slow"],
            ]}
          />
          <p>
            Lambda's risk is a serious one for ML. If the batch code calculates "orders in the last
            7 days" slightly differently from the streaming code, the model trains on one
            definition and serves on another. This is <strong>training-serving skew</strong>, and
            it lowers accuracy without raising any error.
          </p>
          <Callout tone="tip">
            Whichever you choose, define each feature once. Feature stores and engines with both
            batch and streaming modes help here. Before building a stream, ask what the business
            gains from fresher data. Many teams find that a simple hourly job is enough.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Choose ingestion by how fresh the data must be, not by what's fashionable.",
    "Worst-case batch staleness is the interval plus the job's duration.",
    "CDC reads the database log, so it catches deletes and every change in order.",
    "At-least-once delivery plus idempotent writes is the common practical design.",
    "Lambda risks training-serving skew from two codebases. Kappa relies on replaying a log.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why is CDC usually better than polling an updated_at column?",
      options: [
        "It needs no database",
        "It reads the transaction log, so it sees deletes and every change",
        "It removes the need for a schema",
        "It only runs at night",
      ],
      answer: 1,
      explain: "Polling can't see deleted rows and can miss changes that happen between polls.",
    },
    {
      kind: "mcq",
      q: "Your consumer gets at-least-once delivery. How do you avoid double counting?",
      options: [
        "Lower the event rate",
        "Use larger batches",
        "Deduplicate on a unique event ID or upsert by key",
        "Switch to processing time",
      ],
      answer: 2,
      explain: "Repeats will happen, so the write has to be idempotent.",
    },
    {
      kind: "mcq",
      q: "What is the biggest ML risk of a Lambda architecture?",
      options: [
        "Training-serving skew from two implementations of a feature",
        "It can't store history",
        "It can't run in the cloud",
        "It has no batch path",
      ],
      answer: 0,
      explain: "Two codebases computing one feature tend to drift apart.",
    },
    {
      kind: "text",
      q: "A batch job runs every hour and takes 15 minutes. What is the worst-case staleness in minutes?",
      format: "**",
      accept: ["75", "75 min", "75 minutes"],
      explain: "60 + 15 = 75 minutes.",
    },
    {
      kind: "text",
      q: "2,000 events per second at 500 bytes each. How many GB per day? (1 GB = 1,000 MB.)",
      format: "**.*",
      accept: ["86.4", "86.4gb", "86.4 gb"],
      explain: "2,000 × 500 = 1 MB per second, and 1 MB × 86,400 s = 86,400 MB = 86.4 GB.",
    },
  ],
};
