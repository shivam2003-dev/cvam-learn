import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Choose among arrays, hash maps, sets, queues and trees by the operation you need",
    "Estimate cost with Big-O and spot an accidental quadratic loop",
    "Sketch a simple system design with components, data flow and failure points",
  ],
  tasks: [
    {
      id: "structures",
      title: "Pick the structure by the operation",
      body: (
        <>
          <p>
            FDE work is rarely a puzzle contest, but a wrong structure shows up as a job that runs
            for six hours instead of six seconds. Match the structure to the question you ask most.
          </p>
          <Table
            head={["You need to...", "Use", "Typical cost"]}
            rows={[
              ["Look up by key fast", "Hash map / dictionary", "O(1) average"],
              ["Check membership or remove duplicates", "Set", "O(1) average"],
              ["Process in arrival order", "Queue", "O(1) push and pop"],
              ["Always take the highest priority next", "Heap / priority queue", "O(log n)"],
              ["Keep sorted data and search it", "Sorted array + binary search, or a tree", "O(log n) search"],
              ["Model relationships", "Graph", "Depends on traversal"],
            ]}
          />
          <pre>
            <code>{`# Slow: scanning a list for every record -> O(n * m)
for order in orders:
    if order["customer_id"] in [c["id"] for c in customers]:  # rebuilds list each time
        ...

# Fast: build a set once -> O(n + m)
ids = {c["id"] for c in customers}
for order in orders:
    if order["customer_id"] in ids:
        ...`}</code>
          </pre>
          <Callout tone="tip">
            When a script that worked on 1,000 rows crawls on 1,000,000, look for a loop inside a
            loop first. A dictionary or set usually fixes it.
          </Callout>
        </>
      ),
    },
    {
      id: "bigo",
      title: "Big-O in practice",
      body: (
        <>
          <p>
            Big-O describes how cost grows with input size <code>n</code>. You only need a feel for
            the common classes:
          </p>
          <pre>
            <code>{`O(1)        constant      dictionary lookup
O(log n)    logarithmic   binary search
O(n)        linear        one pass over the data
O(n log n)  sorting
O(n^2)      quadratic     nested loops over the same data  <- danger
O(2^n)      exponential   brute-force subsets              <- avoid`}</code>
          </pre>
          <p>
            At 1,000,000 items, O(n) is about a million steps and O(n^2) is about a trillion.
            Measure with a real sample before you guess.
          </p>
        </>
      ),
    },
    {
      id: "design",
      title: "Sketching a system",
      body: (
        <>
          <p>
            System design for an FDE means drawing a solution the customer's engineers will accept
            and that you can build in the time you have. A repeatable order:
          </p>
          <ol>
            <li>
              <strong>Clarify requirements.</strong> Who uses it, how many, how fast, how fresh
              must data be, what happens when it fails.
            </li>
            <li>
              <strong>Estimate load.</strong> Requests per second, data size per day, growth.
            </li>
            <li>
              <strong>Draw the components.</strong> Clients, API, database, queue, cache, external
              systems.
            </li>
            <li>
              <strong>Trace one request end to end.</strong> Then trace a failure.
            </li>
            <li>
              <strong>Name the trade-offs.</strong> Consistency vs availability, cost vs latency,
              build vs buy.
            </li>
          </ol>
          <Callout tone="note">
            Start simple. One service and one database often beats a diagram with eight boxes.
            Add a queue, cache or second service only when a number from step 2 demands it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Choose the data structure by the operation you perform most; sets and maps remove many slow loops.",
    "Learn the Big-O classes and treat nested loops over big data as suspects.",
    "Design in order: requirements, load, components, one request traced, trade-offs.",
    "Start with the simplest design the numbers allow.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You must check millions of IDs against a list of valid IDs. Best structure for the valid IDs?",
      options: ["A list scanned each time", "A set", "A linked list", "A text file read each time"],
      answer: 1,
      explain: "Set membership is O(1) on average, so the whole job is linear instead of quadratic.",
    },
    {
      kind: "mcq",
      q: "Which complexity class is the biggest warning sign at large n?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      answer: 3,
      explain: "Quadratic growth explodes: a million items means about a trillion steps.",
    },
    {
      kind: "text",
      q: "How many comparisons does a nested loop make over a list of 1,000 items against itself (n x n)? Enter the number.",
      format: "*******",
      accept: ["1000000", "1,000,000"],
      explain: "1,000 x 1,000 = 1,000,000.",
    },
  ],
};
