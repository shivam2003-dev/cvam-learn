import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain why batching trades per-request speed for total output",
    "Apply Little's law to a running system",
    "Use utilization to predict when queues explode",
  ],
  tasks: [
    {
      id: "bus",
      title: "The bus and the sports car",
      body: (
        <>
          <p>
            <strong>Latency</strong> is how long one request takes.{" "}
            <strong>Throughput</strong> is how much work the system finishes per second.
          </p>
          <p>
            A sports car carries 2 people very quickly. A bus carries 50 more slowly. The bus
            moves far more people per hour, even though each rider arrives later. Every serving
            decision sits somewhere between those two vehicles.
          </p>
          <p>
            GPUs work on many values in parallel, so serving requests in a batch uses the
            hardware far better. Each decode step takes a little longer as the batch grows, but
            that step yields one token for every request in it.
          </p>
          <Table
            head={["Batch size", "Step time", "Per-user speed", "Total output"]}
            rows={[
              ["1", "20 ms", "50 tok/s", "50 tok/s"],
              ["8", "28 ms", "36 tok/s", "286 tok/s"],
              ["32", "50 ms", "20 tok/s", "640 tok/s"],
              ["64", "100 ms", "10 tok/s", "640 tok/s"],
            ]}
          />
          <p>
            These numbers are illustrative, but the shape is typical. Going from 1 to 32 multiplies
            total output by about 13 while per-user speed drops 2.5 times. Going to 64 gains
            nothing and halves everyone's speed, so the system has hit a limit.
          </p>
        </>
      ),
    },
    {
      id: "littles-law",
      title: "Little's law",
      body: (
        <>
          <p>
            One of the most useful equations in systems work needs no assumptions about traffic
            shape. In any stable system:
          </p>
          <Formula>L = λ × W</Formula>
          <p>
            L is the average number of requests in the system, λ is the arrival rate, and W is the
            average time each request spends inside.
          </p>
          <p>
            If an engine holds 120 requests concurrently and each takes 8 seconds, it's completing
            120 ÷ 8 = <strong>15 requests per second</strong>. Now flip it: if you need 40 requests
            per second at 10 seconds each, you must hold 400 concurrently, which tells you how much
            batch capacity and KV cache memory you need.
          </p>
        </>
      ),
    },
    {
      id: "utilization",
      title: "Why queues explode",
      body: (
        <>
          <p>
            <strong>Utilization</strong> (ρ) is the share of capacity in use. Queueing theory's
            simplest model, M/M/1, shows what happens as it rises:
          </p>
          <Formula>W = S ÷ (1 − ρ)</Formula>
          <p>S is the service time with no queue. Watch what happens as ρ climbs:</p>
          <Table
            head={["Utilization", "Latency multiple", "2 s job takes"]}
            rows={[
              ["50%", "2×", "4 s"],
              ["80%", "5×", "10 s"],
              ["90%", "10×", "20 s"],
              ["95%", "20×", "40 s"],
            ]}
          />
          <p>
            Going from 50% to 80% is manageable. Going from 90% to 95% doubles latency for only
            5% more traffic. That's the wall you feel when a system goes from fine to on fire
            within minutes.
          </p>
          <Callout tone="note">
            M/M/1 is a simplified model. Real engines batch, so the numbers differ, but the curve
            has the same shape: latency stays flat for a while, then rises steeply near capacity.
          </Callout>
        </>
      ),
    },
    {
      id: "operating-point",
      title: "Pick an operating point",
      body: (
        <>
          <p>Here's how to choose where to run:</p>
          <ol>
            <li>Write down a latency target, such as p95 TTFT under 1 s and ITL under 50 ms.</li>
            <li>Load test while slowly raising request rate.</li>
            <li>Find the highest throughput that still meets the target.</li>
            <li>
              Run below that point, with headroom for bursts, and autoscale before you reach it.
            </li>
          </ol>
          <Callout tone="tip" title="Goodput">
            Only count requests that met their target. A system that outputs 1,000 tokens per
            second but misses latency on half its requests has a <strong>goodput</strong> of far
            less than 1,000. That's the number worth optimizing.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Latency is per request. Throughput is per system.",
    "Batching raises total output at the cost of per-request speed, up to a limit.",
    "Little's law, L = λ × W, links concurrency, rate and time.",
    "Latency rises slowly at first, then explodes near full utilization.",
    "Set a latency target, then maximize goodput beneath it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Doubling batch size usually does what?",
      options: [
        "Speeds up every request",
        "Raises total throughput but slows each request",
        "Has no effect on the GPU",
        "Lowers memory use",
      ],
      answer: 1,
      explain: "Each step takes longer, but it serves more requests, until the system hits a limit.",
    },
    {
      kind: "text",
      q: "A service handles 25 requests per second, and each takes 4 seconds. How many are in flight on average?",
      format: "***",
      accept: ["100"],
      explain: "L = λ × W = 25 × 4 = 100.",
    },
    {
      kind: "mcq",
      q: "Under the M/M/1 model, at 90% utilization latency is how many times the no-queue time?",
      options: ["1.1×", "2×", "9×", "10×"],
      answer: 3,
      explain: "1 ÷ (1 − 0.9) = 10.",
    },
    {
      kind: "text",
      q: "What word describes throughput counting only requests that met their latency target?",
      format: "*******",
      accept: ["goodput"],
      explain: "Goodput ignores work that arrived too late to be useful.",
    },
  ],
};
