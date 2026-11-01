import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why static batching wastes GPU time on LLMs",
    "Calculate slot utilization for a batch",
    "Describe the continuous batching scheduler loop",
    "Reason about batch size, inter-token latency and prefill stalls",
  ],
  tasks: [
    {
      id: "static-problem",
      title: "Why static batching fails for LLMs",
      body: (
        <>
          <p>
            GPUs are far more efficient when they process many items together. So you batch. For an
            image classifier that's easy: all the items take the same time.
          </p>
          <p>
            LLMs break that assumption. One response is 20 tokens and another is 400, and you can't
            know which in advance. In <strong>static batching</strong>, a batch starts together and
            ends together, so short requests sit finished in their slots while the longest runs.
          </p>
          <p>
            Static batching is a tour bus: it leaves full, and no new passengers board until it
            returns. Continuous batching is a restaurant: when one table leaves, the next party
            sits down right away.
          </p>
          <Formula>slot utilization = useful token steps ÷ (batch size × total steps)</Formula>
          <p>Take four requests that produce 20, 40, 60 and 400 tokens:</p>
          <pre>
            <code>{`Useful steps:  20 + 40 + 60 + 400 = 520
Total slots:   4 × 400 = 1,600
Utilization:   520 ÷ 1,600 = 32.5%`}</code>
          </pre>
          <p>
            More than two-thirds of the capacity did nothing. Waiting requests suffer as well. At
            an illustrative 25 ms per step, the batch takes 10 seconds, so a request arriving just
            after it starts waits up to 10 seconds to begin.
          </p>
        </>
      ),
    },
    {
      id: "scheduler-loop",
      title: "Scheduling every step",
      body: (
        <>
          <p>
            <strong>Continuous batching</strong> makes the scheduling decision at each step instead
            of each batch. The idea was published under the name iteration-level scheduling, and
            today it's standard in LLM engines. After each step, finished requests leave and
            waiting ones join.
          </p>
          <pre>
            <code>{`# Simplified sketch of an engine's main loop
while True:
    # Admit new work while slots and KV memory allow
    while waiting and len(running) < max_batch and kv.can_fit(waiting[0]):
        request = waiting.popleft()
        prefill(request)           # fill its KV cache, get its first token
        running.append(request)

    # One decode step: one new token for each running request
    tokens = decode_step(running)
    for request, token in zip(running, tokens):
        request.stream(token)

    # Finished requests leave now and free their memory
    for request in [r for r in running if r.finished]:
        kv.free(request)
        running.remove(request)`}</code>
          </pre>
          <p>
            Why is this possible? Each request brings its own KV cache, and a decode step takes
            just one new token per request. So requests can sit at very different positions and
            still share a step.
          </p>
          <p>
            Now redo the sum. With a steady queue, each slot refills as soon as it empties, so
            utilization stays close to 100%:
          </p>
          <Table
            head={["25 ms per step, 4 slots", "Static", "Continuous, busy queue"]}
            rows={[
              ["Slot utilization", "32.5%", "Close to 100%"],
              ["Throughput", "520 ÷ 10 s = 52 tokens/s", "Up to 4 ÷ 0.025 s = 160 tokens/s"],
              ["Longest queue wait", "Up to 10 s", "Until a slot opens"],
            ]}
          />
          <p>
            That's about three times the throughput on the same hardware, in this example, with no
            change to the model.
          </p>
        </>
      ),
    },
    {
      id: "batch-size",
      title: "Batch size is a trade-off",
      body: (
        <>
          <p>
            Bigger batches aren't free. Each step has more work, so it takes longer, and every
            request in the batch sees that as inter-token latency. With illustrative figures:
          </p>
          <Table
            head={["Batch", "Step time", "Total tokens/s", "Tokens/s per user"]}
            rows={[
              ["4", "25 ms", "160", "40"],
              ["32", "40 ms", "800", "25"],
            ]}
          />
          <p>
            Total throughput rose fivefold while each user got 37.5% slower. That's the trade you
            met in the lesson on latency and throughput, now set by a scheduler limit. Your target
            for per-user speed decides how far you can push it.
          </p>
          <p>Memory is the other limit. A scheduler should check two budgets before admitting work:</p>
          <ul>
            <li>
              <strong>Slots or tokens per step:</strong> how much compute one step can take.
            </li>
            <li>
              <strong>KV cache room:</strong> whether admitted requests can finish without running
              out of memory.
            </li>
          </ul>
          <p>
            If memory runs short mid-response, the engine must <strong>preempt</strong> a request:
            pause it and drop or move its cache. Recomputing that cache takes time, so preemption
            shows up as sudden latency spikes.
          </p>
        </>
      ),
    },
    {
      id: "prefill-stalls",
      title: "The catch: prefill stalls decode",
      body: (
        <>
          <p>
            New requests need prefill, and prefill is heavy. If it blocks the GPU, every streaming
            user freezes while it runs.
          </p>
          <p>Suppose an 8,000-token prompt arrives. Prefill speed is an illustrative 20,000 tokens/s:</p>
          <pre>
            <code>{`Blocking:  8,000 ÷ 20,000 = 0.4 s
           400 ms gap for all running streams

Chunked:   1,000 tokens per step, taking 50 ms
           8 chunks, each mixed with a 25 ms decode step
           Step time: 50 + 25 = 75 ms
           Prefill done in: 8 × 75 ms = 600 ms`}</code>
          </pre>
          <p>
            With <strong>chunked prefill</strong>, running users see 75 ms gaps rather than one 400
            ms freeze. The new request pays with a time to first token that's 200 ms later. The
            total work is the same, but you've chosen who waits.
          </p>
          <Callout tone="tip">
            Long prompts mixed with short ones cause the worst stalls. If you see inter-token
            latency spike only when long requests arrive, look at token limits per step and
            chunking before buying GPUs.
          </Callout>
          <Callout tone="note">
            Prefill and decode compete for one GPU because they share it. Prefill and decode
            disaggregation, covered in its own lesson, removes the conflict by running them on
            separate GPUs.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Static batches are held back by their longest request, which wastes slots and delays new work.",
    "Continuous batching schedules at every step, so finished requests leave immediately.",
    "Larger batches raise total throughput and lower speed per user.",
    "KV memory limits admission, and running out causes preemption and latency spikes.",
    "Chunking prefill spreads the pain and protects streaming users from long freezes.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What makes it possible for requests at different positions to share a decode step?",
      options: [
        "All requests have the same prompt",
        "Each request has its own KV cache and adds one token per step",
        "The GPU resets between steps",
        "Decode ignores earlier tokens",
      ],
      answer: 1,
      explain: "Past context lives in each request's cache, so a step only needs each request's newest token.",
    },
    {
      kind: "mcq",
      q: "Inter-token latency spikes whenever very long prompts arrive. What's the likely cause?",
      options: [
        "Prefill is delaying decode steps",
        "The tokenizer ran out of tokens",
        "The batch is too small",
        "Output tokens are too short",
      ],
      answer: 0,
      explain: "Prefill shares the GPU with decode, so a long prompt can hold up every stream.",
    },
    {
      kind: "text",
      q: "A static batch of 2 has requests of 100 and 300 tokens. What is the slot utilization, as a percentage?",
      format: "**.*",
      accept: ["66.7", "66.7%", "67", "67%", "66.67", "66.67%"],
      explain: "Useful steps are 400. Total slots are 2 × 300 = 600. 400 ÷ 600 ≈ 66.7%.",
    },
    {
      kind: "text",
      q: "A batch of 10 has a 50 ms step time. How many total tokens per second does it produce?",
      format: "***",
      accept: ["200"],
      explain: "10 tokens ÷ 0.05 s = 200 tokens per second.",
    },
  ],
};
