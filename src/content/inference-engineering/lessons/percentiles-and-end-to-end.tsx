import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain why averages hide problems and percentiles don't",
    "Calculate how fan-out amplifies tail latency",
    "Measure end-to-end latency and real-time factor correctly",
  ],
  tasks: [
    {
      id: "averages",
      title: "Averages lie",
      body: (
        <>
          <p>
            Imagine 99 requests at 1 second and one at 100 seconds. The average is about 2
            seconds, which describes nobody's experience. Most users got 1 second, and one user
            left.
          </p>
          <p>
            A <strong>percentile</strong> fixes this. p95 means 95% of requests were faster than
            this value. Sort all your latencies, then read the value 95% of the way along.
          </p>
          <Table
            head={["Percentile", "Answers", "Use it for"]}
            rows={[
              ["p50", "What's a typical request like?", "Normal experience"],
              ["p95", "What do slower requests see?", "Most latency targets"],
              ["p99", "How bad is the worst 1%?", "Reliability at scale"],
            ]}
          />
          <Callout tone="warn">
            You can't average percentiles. The mean of each replica's p99 is not the fleet's p99.
            Store histograms, then compute percentiles from the merged data.
          </Callout>
        </>
      ),
    },
    {
      id: "tail",
      title: "The tail reaches more people than you think",
      body: (
        <>
          <p>
            "It's only 1% of requests" sounds harmless until one user action makes several
            calls. An AI agent may make 10 model calls for one task. If any one of them being
            slow makes the task slow, the odds stack up:
          </p>
          <Formula>P(at least one slow) = 1 − 0.99ⁿ</Formula>
          <Table
            head={["Calls per task", "Tasks hitting a p99-or-worse call"]}
            rows={[
              ["1", "1.0%"],
              ["5", "4.9%"],
              ["10", "9.6%"],
              ["20", "18.2%"],
              ["100", "63.4%"],
            ]}
          />
          <p>
            So for an agent making 20 calls, your p99 latency is what almost 1 in 5 tasks sees.
            The tail is not an edge case for these products.
          </p>
        </>
      ),
    },
    {
      id: "e2e",
      title: "Measure end to end",
      body: (
        <>
          <p>
            <strong>End-to-end latency</strong> is the full time a user waits, from request sent to
            final token received. It includes things the engine's own metrics can't see: DNS,
            TLS, the gateway, load balancers, and network distance.
          </p>
          <p>
            So measure at more than one place. Compare client-side numbers with server-side
            ones. The gap between them shows you time spent outside the model.
          </p>
          <Callout tone="warn" title="Coordinated omission">
            A simple load tester waits for each response before sending the next request. If the
            server stalls, the tester stops sending, so the stall gets recorded as just a few
            slow samples. Real users wouldn't stop arriving. Use a load tool that sends on a fixed
            schedule so these stalls show up in your results.
          </Callout>
        </>
      ),
    },
    {
      id: "rtf",
      title: "Real-time factor for audio",
      body: (
        <>
          <p>
            Tokens don't fit speech models, so audio has its own metric. <strong>Real-time
            factor</strong> (RTF) compares processing time with audio length:
          </p>
          <Formula>RTF = processing time ÷ audio duration</Formula>
          <p>
            If 90 seconds of audio takes 13.5 seconds to transcribe, RTF is 0.15. Anything below 1
            keeps up with real time, and a lower number is better.
          </p>
          <Callout tone="warn">
            Some vendors report the inverse, so 0.15 here would appear as "6.7× real time", where
            higher is better. Always check which way a benchmark is written.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Use percentiles, because averages hide the users having a bad time.",
    "Merge histograms; never average percentiles.",
    "Multiple calls per task make tail latency common, not rare.",
    "Measure from the client too, and watch for coordinated omission.",
    "RTF below 1 keeps up with real time, but some vendors invert it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does a p95 latency of 2 s mean?",
      options: [
        "The average request takes 2 s",
        "95% of requests finished within 2 s",
        "95% of requests took over 2 s",
        "The slowest request took 2 s",
      ],
      answer: 1,
      explain: "95% of requests were at or below this value.",
    },
    {
      kind: "mcq",
      q: "You have 4 replicas with p99 values. How do you get the fleet p99?",
      options: [
        "Average the four values",
        "Take the highest value",
        "Compute it from merged histograms",
        "Multiply the lowest by four",
      ],
      answer: 2,
      explain: "Percentiles don't average. Merge the underlying distributions first.",
    },
    {
      kind: "text",
      q: "A 60 second clip takes 6 seconds to transcribe. What's the RTF?",
      format: "*.*",
      accept: ["0.1", ".1", "0.10"],
      explain: "6 ÷ 60 = 0.1.",
    },
    {
      kind: "text",
      q: "What is the name for the load-testing error where a stalled server stops new requests being sent? Two words.",
      format: "*********** ********",
      accept: ["coordinated omission"],
      explain: "Coordinated omission hides the worst latency, because the tester slows down with the server.",
    },
  ],
};
