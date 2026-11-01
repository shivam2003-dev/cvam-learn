import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Hard",
  objectives: [
    "Explain topics, partitions, offsets and consumer groups",
    "Size partitions and storage for a Kafka topic",
    "Describe how Flink handles state, event time and failure",
    "Build a real-time feature path and watch consumer lag",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A recommendation model does better if it knows what a user clicked ten seconds ago.
            That click has to leave the app, be counted with other clicks, and reach a store the
            model can read, all within seconds. Those tasks split into two jobs, and two tools.
          </p>
          <p>
            <strong>Apache Kafka</strong> moves and stores events. <strong>Apache Flink</strong>{" "}
            computes on them. Picture a factory conveyor belt with a logbook: Kafka records each
            item in order and keeps the record for days, so anyone can read from any point. Flink
            is the worker at the belt who keeps running totals in a notebook and survives a
            shift change without losing count.
          </p>
          <Table
            head={["", "Kafka", "Flink"]}
            rows={[
              ["Main job", "Durable event log and transport", "Stateful stream processing"],
              ["Holds", "Raw events, kept for a set period", "Running state, such as counts per user"],
              ["You write", "Producers and consumers", "Jobs, in SQL, Java or Python"],
            ]}
          />
        </>
      ),
    },
    {
      id: "kafka",
      title: "How Kafka works",
      body: (
        <>
          <Table
            head={["Term", "Meaning"]}
            rows={[
              ["Broker", "A Kafka server"],
              ["Topic", "A named stream of events, such as clicks"],
              ["Partition", "An ordered, append-only log. A topic has one or more"],
              ["Offset", "An event's position within its partition"],
              ["Producer", "An app that writes events"],
              ["Consumer group", "Consumers that share the work of reading a topic"],
              ["Replication factor", "How many brokers keep a copy of each partition"],
            ]}
          />
          <p>
            Reading doesn't remove an event. It stays until the retention period ends, and each
            consumer group tracks its own offset. So a fraud service and a data lake writer can
            read the same topic at their own speed. You can also replay old events by resetting an
            offset, which helps when you fix a bug in a feature.
          </p>
          <p>
            Two rules shape almost every design. First, order is guaranteed only{" "}
            <strong>within a partition</strong>. Events with the same key go to the same partition,
            so keying by <code>user_id</code> keeps each user's events in order. Second, within a
            group, each partition is read by only one consumer at a time. So the partition count
            caps how far a group can scale out.
          </p>
          <pre>
            <code>{`import json
from confluent_kafka import Producer

producer = Producer({
    "bootstrap.servers": "kafka:9092",
    "acks": "all",               # wait for in-sync replicas
    "enable.idempotence": True,  # broker drops retried duplicates
})

event = {"user_id": "u123", "item_id": "i9", "ts": "2026-03-14T10:15:02Z"}
producer.produce("clicks", key=event["user_id"], value=json.dumps(event))
producer.flush()`}</code>
          </pre>
          <p>Here's a sizing example with illustrative figures. A topic takes a peak of 30 MB per second, and one consumer can handle 5 MB per second.</p>
          <Formula>partitions ≥ peak throughput ÷ throughput per consumer</Formula>
          <pre>
            <code>{`Partitions:   30 ÷ 5 = 6, doubled for growth = 12

If 30 MB/s were sustained for 7 days of retention:
One copy:     30 × 86,400 × 7 = 18,144,000 MB ≈ 18.1 TB
Three copies: 18.1 × 3        ≈ 54.4 TB`}</code>
          </pre>
          <Callout tone="warn">
            Plan partitions up front. Adding partitions later changes which partition a key maps
            to, so a user's new events may land away from their old ones and per-key order breaks
            across that change.
          </Callout>
        </>
      ),
    },
    {
      id: "flink",
      title: "How Flink works",
      body: (
        <>
          <p>
            A plain consumer is fine for moving events. But "clicks per user in the last 5
            minutes" needs memory: you must hold counts across events, for millions of users,
            through crashes. That memory is called <strong>state</strong>, and managing it is
            Flink's main job.
          </p>
          <ul>
            <li><strong>Keyed state:</strong> Flink splits state by key, so it's spread across workers.</li>
            <li><strong>Checkpoints:</strong> Flink regularly saves consistent snapshots of state and Kafka offsets. After a crash, it restores the latest one and resumes.</li>
            <li><strong>Savepoints:</strong> snapshots you trigger by hand, used to upgrade a job without losing state.</li>
            <li><strong>Watermarks:</strong> a marker in the stream that says "I don't expect events older than this time". It tells Flink when a window can close.</li>
          </ul>
          <p>
            Watermarks exist because events arrive out of order. If you wait 30 seconds, you catch
            most late events, but each result comes 30 seconds later. That's a direct trade-off
            between accuracy and freshness, and you set it based on how late your data really is.
          </p>
          <p>Flink SQL lets you write this job without Java. A hopping window here computes a 5-minute count, updated every minute:</p>
          <pre>
            <code>{`CREATE TABLE clicks (
  user_id    STRING,
  item_id    STRING,
  event_time TIMESTAMP(3),
  WATERMARK FOR event_time AS event_time - INTERVAL '30' SECOND
) WITH (
  'connector' = 'kafka',
  'topic' = 'clicks',
  'properties.bootstrap.servers' = 'kafka:9092',
  'properties.group.id' = 'click-features',
  'scan.startup.mode' = 'latest-offset',
  'format' = 'json'
);

SELECT user_id, window_start, window_end, COUNT(*) AS clicks_5m
FROM TABLE(
  HOP(TABLE clicks, DESCRIPTOR(event_time), INTERVAL '1' MINUTE, INTERVAL '5' MINUTE)
)
GROUP BY user_id, window_start, window_end;`}</code>
          </pre>
          <Callout tone="note">
            Flink can give exactly-once results for its own state using checkpoints. Reaching
            exactly once end to end also needs a sink that supports it, such as transactional
            Kafka writes or idempotent upserts by key.
          </Callout>
        </>
      ),
    },
    {
      id: "mlops",
      title: "The real-time feature path",
      body: (
        <>
          <p>A typical path for live features looks like this:</p>
          <pre>
            <code>{`app events → Kafka topic → Flink job → online store (e.g. Redis) → model server
                 ↓
           data lake (for training history)`}</code>
          </pre>
          <p>
            Sending the same topic to the lake means training uses the events that serving saw.
            Teams often add a <strong>schema registry</strong> as well, which stores event formats
            and rejects changes that would break consumers.
          </p>
          <p>
            The health metric to watch is <strong>consumer lag</strong>: how far a group's
            offset sits behind the newest event. Lag means your features are getting stale, even
            though nothing has crashed.
          </p>
          <Formula>catch-up time = lag ÷ (consume rate − produce rate)</Formula>
          <p>
            For example, a group is 1,200,000 messages behind. It consumes 20,000 messages per
            second while 15,000 arrive. It gains 5,000 per second, so it catches up in 1,200,000 ÷
            5,000 = 240 seconds, or 4 minutes. If the consume rate falls below the produce rate,
            lag grows without end, and you need more consumers or a faster job.
          </p>
          <Callout tone="tip">
            Alert on lag in seconds of delay if you can, since that maps to your freshness target.
            For Flink, also watch checkpoint duration and failures. A job that can't complete
            checkpoints has nothing recent to recover from.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Kafka is a durable, replayable log. Flink is a stateful engine that computes over streams.",
    "Order holds only within a partition, so choose your message key with care.",
    "A consumer group can't have more active consumers than partitions.",
    "Checkpoints restore Flink after failure, and watermarks trade freshness for completeness.",
    "Consumer lag is the key signal that real-time features are going stale.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You need each user's events processed in order. What should you do?",
      options: [
        "Use one consumer group per event",
        "Use user_id as the message key",
        "Set the retention to 30 days",
        "Turn off replication",
      ],
      answer: 1,
      explain: "Equal keys map to the same partition, and order holds within a partition.",
    },
    {
      kind: "mcq",
      q: "A topic has 6 partitions and a group has 10 consumers. How many consumers can actively read?",
      options: ["1", "6", "10", "16"],
      answer: 1,
      explain: "Each partition goes to one consumer in a group, so the other 4 sit idle.",
    },
    {
      kind: "mcq",
      q: "What does a watermark tell Flink?",
      options: [
        "Which broker is the leader",
        "How much memory it can use",
        "That events older than a given time aren't expected",
        "That a checkpoint has failed",
      ],
      answer: 2,
      explain: "This lets Flink decide when an event-time window is complete.",
    },
    {
      kind: "text",
      q: "A group is 900,000 messages behind. It consumes 12,000 per second while 9,000 arrive. How many seconds until it catches up?",
      format: "***",
      accept: ["300", "300s", "300 s", "300 seconds"],
      explain: "900,000 ÷ (12,000 − 9,000) = 300 seconds.",
    },
    {
      kind: "text",
      q: "What is the term for an event's numeric position within a Kafka partition?",
      format: "******",
      accept: ["offset"],
      explain: "Each consumer group stores its offset, so it knows where to resume reading.",
    },
  ],
};
