import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Write SQL with joins, grouping and filters against a relational database",
    "Choose between PostgreSQL and a NoSQL store for a workload",
    "Build a small Node.js service that reads and writes data safely",
  ],
  tasks: [
    {
      id: "sql",
      title: "SQL you will use every week",
      body: (
        <>
          <p>
            Almost every customer has data in a relational database, and SQL is how you learn what
            is in it. Be fluent with <code>SELECT</code>, <code>JOIN</code>,{" "}
            <code>GROUP BY</code> and filtering.
          </p>
          <pre>
            <code>{`-- Revenue per customer in the last 30 days, biggest first
SELECT c.name, COUNT(o.id) AS orders, SUM(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= now() - interval '30 days'
  AND o.status = 'paid'
GROUP BY c.name
HAVING SUM(o.total) > 1000
ORDER BY revenue DESC
LIMIT 20;`}</code>
          </pre>
          <ul>
            <li>Use <code>EXPLAIN</code> to see whether a query uses an index.</li>
            <li>Add an index on columns you filter or join on often.</li>
            <li>
              Always use parameterised queries from code, never string concatenation, to prevent SQL
              injection.
            </li>
          </ul>
          <Callout tone="warn">
            Before running anything that changes data on a customer database, run the matching
            <code> SELECT</code> first, and wrap the change in a transaction you can roll back.
          </Callout>
        </>
      ),
    },
    {
      id: "choose",
      title: "PostgreSQL or NoSQL?",
      body: (
        <>
          <Table
            head={["Need", "Good fit"]}
            rows={[
              ["Structured data, relations, transactions", "PostgreSQL"],
              ["Flexible documents that change shape", "Document store (MongoDB)"],
              ["Very fast key lookups, caching, sessions", "Key-value (Redis)"],
              ["Huge write volume, time series", "Wide-column or time-series store"],
              ["Rich relationships between entities", "Graph database"],
              ["Embeddings and similarity search", "pgvector or a vector database"],
            ]}
          />
          <p>
            Default to PostgreSQL. It handles JSON columns, full-text search and vectors, so it
            covers many cases and keeps your system simple. Reach for a specialised store when a
            measured need appears.
          </p>
        </>
      ),
    },
    {
      id: "node",
      title: "A small Node.js service",
      body: (
        <>
          <pre>
            <code>{`import express from "express";
import { Pool } from "pg";

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(express.json());

app.get("/orders/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

app.listen(3000);`}</code>
          </pre>
          <p>Habits that make a service survivable at a customer:</p>
          <ul>
            <li>Read config from environment variables and fail fast if one is missing.</li>
            <li>Validate every input and return clear status codes and error bodies.</li>
            <li>Add a <code>/health</code> endpoint and structured logs with request IDs.</li>
            <li>Set timeouts and retry with backoff for calls to other systems.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "SQL joins, grouping and filtering are everyday tools; use EXPLAIN and indexes.",
    "Use parameterised queries and transactions to stay safe on customer data.",
    "Default to PostgreSQL; pick NoSQL stores for a measured need.",
    "Services need env config, validation, health checks, logs, timeouts and retries.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why use a parameterised query like WHERE id = $1?",
      options: [
        "It is shorter to type",
        "It prevents SQL injection",
        "It makes the database faster to install",
        "It removes the need for indexes",
      ],
      answer: 1,
      explain: "Parameters keep user input as data, so it cannot change the SQL structure.",
    },
    {
      kind: "mcq",
      q: "Which store is the sensible default for structured business data with relations?",
      options: ["PostgreSQL", "A text file", "A graph database always", "A spreadsheet in email"],
      answer: 0,
      explain: "PostgreSQL gives relations, transactions and rich features, and covers many needs.",
    },
    {
      kind: "mcq",
      q: "Before an UPDATE on a customer's production table, what should you do first?",
      options: [
        "Run it immediately",
        "Run the matching SELECT and use a transaction you can roll back",
        "Disable all logging",
        "Drop the table",
      ],
      answer: 1,
      explain: "Checking affected rows and keeping a rollback path prevents irreversible mistakes.",
    },
  ],
};
