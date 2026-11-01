import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Separate online, offline and async inference by who is waiting",
    "Explain why utilization drives the cost gap between the modes",
    "Calculate cost per million tokens at different utilization levels",
    "Pick a delivery mode for a new feature",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: not every request has someone waiting",
      body: (
        <>
          <p>
            Picture two jobs that use the same model. A chat assistant must start replying within a
            second, because a person is staring at the screen. A nightly job that summarizes last
            month's support tickets can take six hours, and nobody will notice.
          </p>
          <p>
            If you serve both the same way, you pay for speed the second job doesn't need. GPUs are
            expensive, and the fastest way to waste them is to keep them idle in case a request
            arrives. So the first question for any AI feature isn't "which model?" It's "who is
            waiting, and how long will they wait?"
          </p>
          <p>The answer puts the work into one of three delivery modes:</p>
          <Table
            head={["", "Online", "Async", "Offline"]}
            rows={[
              ["Who is waiting", "A person, right now", "A person or system, later", "Nobody"],
              ["Typical target", "Under a few seconds", "Seconds to minutes", "Hours"],
              ["Connection", "Held open, often streamed", "Closed, result delivered later", "None, job reads files"],
              ["Spare capacity", "Large buffer needed", "Queue absorbs bursts", "Almost none"],
              ["Example", "Chat, code completion", "Image generation, long reports", "Embedding a document archive"],
            ]}
          />
          <p>
            A restaurant is a good analogy. Online is table service: staff stand ready even when the
            room is half empty. Async is a takeaway order: you get a ticket and collect the food when
            it's ready. Offline is catering: the kitchen cooks everything in one planned run during
            quiet hours.
          </p>
        </>
      ),
    },
    {
      id: "online",
      title: "Online: pay for readiness",
      body: (
        <>
          <p>
            <strong>Online inference</strong> means a client holds a connection and expects an answer
            immediately. Your limits are the metrics from the Performance Metrics module: time to
            first token, inter-token latency and their p99 values.
          </p>
          <p>
            Traffic rises and falls, but your latency target stays fixed. So you size the fleet for
            the peak, plus a margin for bursts. Autoscaling helps, but GPU nodes can take minutes to
            start, so you can't remove the margin entirely. The result is that online fleets often
            run well below full load on average.
          </p>
          <p>
            Batches also stay small, because a larger batch adds latency for every request in it.
            You give up throughput to protect each user's experience.
          </p>
        </>
      ),
    },
    {
      id: "offline",
      title: "Offline: pay only for work",
      body: (
        <>
          <p>
            <strong>Offline inference</strong>, also called batch inference, processes a known pile of
            inputs with no user attached. Latency per item barely matters. What matters is total
            tokens per hour, and how soon the whole pile finishes.
          </p>
          <p>
            That freedom unlocks large batches, spare or spot capacity, and off-peak hours. It also
            means you don't need a server at all. An engine can run as a plain script that reads
            inputs and writes outputs:
          </p>
          <pre>
            <code>{`from vllm import LLM, SamplingParams

llm = LLM(model="Qwen/Qwen2.5-7B-Instruct")
params = SamplingParams(temperature=0.0, max_tokens=256)

# prompts is a Python list loaded from your input file.
outputs = llm.generate(prompts, params)

for output in outputs:
    print(output.outputs[0].text)`}</code>
          </pre>
          <p>
            Many API providers sell the same idea as a batch product: you upload a file of requests,
            accept a completion window such as 24 hours, and pay less per token. The discount exists
            because the provider can schedule your work into its quiet periods.
          </p>
          <Callout tone="warn">
            Plan for partial failure. A 12-hour job that dies at hour 11 with no checkpoints has to
            start again. Write results as you go, and make it safe to rerun any input.
          </Callout>
        </>
      ),
    },
    {
      id: "async",
      title: "Async: the useful middle",
      body: (
        <>
          <p>
            <strong>Async inference</strong> splits a request in two. The client submits work and
            immediately gets a job ID. A queue holds the job until a worker is free. The client then
            polls for the result, or your system calls a <strong>webhook</strong>, which is a URL the
            client registered to be notified at.
          </p>
          <p>
            This suits work that's too slow to hold a connection for but still matters to a user:
            image and video generation, long document analysis, and agent runs. The queue does the
            important job. Workers stay busy at a steady rate while bursts wait in line, so you don't
            have to buy capacity for the peak.
          </p>
          <p>Async does add new responsibilities:</p>
          <ul>
            <li>
              <strong>Idempotency:</strong> a retried submit must not create and bill a second job.
            </li>
            <li>
              <strong>Priorities:</strong> paying users usually shouldn't wait behind a huge free job.
            </li>
            <li>
              <strong>Queue limits:</strong> an unbounded queue hides overload until wait times are
              absurd. Reject work or warn the client once the wait passes your target.
            </li>
          </ul>
          <Callout tone="note">
            "Batch" means two things. An offline batch job is a large planned run. A batch inside an
            engine is the group of requests sharing one GPU step. Online systems use the second kind
            all the time. They just keep it small.
          </Callout>
        </>
      ),
    },
    {
      id: "cost",
      title: "Worked example: why utilization sets the price",
      body: (
        <>
          <p>
            You pay for a dedicated GPU by the hour whether it's busy or not. So the cost of each
            token depends on how much of that hour was used:
          </p>
          <Formula>cost per 1M tokens = hourly GPU cost ÷ tokens per hour at actual utilization (in millions)</Formula>
          <p>
            Take an illustrative GPU at $2 per hour that produces 1,000 tokens per second at full
            load. Prices and speeds change, so treat these as example figures.
          </p>
          <pre>
            <code>{`Full capacity:  1,000 tokens/s × 3,600 s = 3.6M tokens/hour

Online at 30% average utilization:
  3.6M × 0.30 = 1.08M tokens/hour
  $2 ÷ 1.08 = $1.85 per 1M tokens

Offline at 90% utilization:
  3.6M × 0.90 = 3.24M tokens/hour
  $2 ÷ 3.24 = $0.62 per 1M tokens`}</code>
          </pre>
          <p>
            Same model, same GPU, and three times the cost per token. Nothing about the math got
            harder. You just paid for idle time. This example even undersells the gap, because a
            full offline batch usually produces more tokens per hour than an online fleet tuned for
            latency.
          </p>
          <Callout tone="tip">
            Ask product teams for a real deadline. "As fast as possible" often turns into "within an
            hour is fine" once they see the price difference. Every feature you move away from online
            makes the online fleet easier to run.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Choose a delivery mode by asking who is waiting and for how long.",
    "Online pays for readiness, so it needs a capacity buffer and small batches.",
    "Offline pays only for work, which allows large batches and cheap capacity.",
    "Async uses a queue to give users results later while workers stay steadily busy.",
    "Cost per token is hourly cost divided by tokens actually produced, so utilization drives price.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A team needs to embed 20 million archived documents once. Nobody is waiting on the result. Which mode fits best?",
      options: ["Online", "Offline", "Streaming online", "Real-time speech"],
      answer: 1,
      explain: "No one is waiting, so the job can use large batches and cheap capacity.",
    },
    {
      kind: "mcq",
      q: "Why is the queue central to async inference?",
      options: [
        "It makes each model step faster",
        "It removes the need for a GPU",
        "It absorbs bursts so workers can run at a steady rate",
        "It keeps the client connection open",
      ],
      answer: 2,
      explain: "Bursts wait in line, so you don't have to buy enough capacity for the peak.",
    },
    {
      kind: "text",
      q: "A GPU costs $3 per hour and produces 2M tokens per hour at full load. At 50% utilization, what is the cost in dollars per 1M tokens?",
      format: "*",
      accept: ["3", "$3", "3.00", "$3.00"],
      explain: "2M × 0.5 = 1M tokens per hour, and $3 ÷ 1 = $3 per 1M tokens.",
    },
    {
      kind: "text",
      q: "In async inference, what does the client receive right after submitting work? Two words.",
      format: "*** **",
      accept: ["job id", "job-id", "jobid", "request id", "task id"],
      explain: "The client uses the job ID to poll for the result or match it to a webhook call.",
    },
  ],
};
