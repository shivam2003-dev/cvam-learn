import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Use Little's Law to relate traffic, latency and concurrency",
    "Calculate how long a burst takes to drain and how long it makes users wait",
    "Set a queue limit from a latency budget",
    "Shed load in a way that protects the requests you keep",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Traffic arrives in bursts. Capacity doesn't. A GPU has a fixed number of slots for
            active requests, and adding more takes minutes. So what happens in the seconds when
            more requests arrive than the slots can hold?
          </p>
          <p>
            You have three choices: serve them all and overload the server, reject them, or make
            them wait. A <strong>queue</strong> is the waiting room. It turns a short burst into a
            short delay, so a spike doesn't become a wall of errors.
          </p>
          <p>
            Think of a coffee shop. A line of six people during a rush is fine, because the
            baristas catch up. A line out the door is different. By the time anyone reaches the
            counter, they've missed their train. A queue only helps when the wait is shorter than
            the customer's patience. Beyond that, it's serving people who have already left.
          </p>
        </>
      ),
    },
    {
      id: "littles-law",
      title: "Little's Law",
      body: (
        <>
          <p>
            One simple relationship ties it all together. In any stable system, the average number
            of requests inside equals their arrival rate times the time each one stays:
          </p>
          <Formula>requests in system = arrival rate × time in system</Formula>
          <p>
            Suppose 10 requests arrive per second and each takes 8 seconds from start to finish.
            That's 10 × 8 = 80 requests in the system on average. If the server has 64 active slots,
            the other 16 are waiting. You didn't need a load test to learn that.
          </p>
          <p>
            It also explains a danger. When requests wait, time in system goes up, so even more
            requests sit inside. The law holds in both directions, and that's why latency tends to
            climb sharply once a server is near full.
          </p>
        </>
      ),
    },
    {
      id: "utilization",
      title: "Why 95% busy feels terrible",
      body: (
        <>
          <p>
            Random arrivals mean that a busy server sometimes gets several requests at once. The
            closer you run to full, the less room it has to recover. A classic single-server
            queueing model gives the average wait as:
          </p>
          <Formula>wait ≈ service time × utilization ÷ (1 − utilization)</Formula>
          <Table
            head={["Utilization", "Average wait, in service times"]}
            rows={[
              ["50%", "1"],
              ["80%", "4"],
              ["90%", "9"],
              ["95%", "19"],
            ]}
          />
          <p>
            Continuous batching makes an LLM server more complex than this model, so don't use the
            table for exact predictions. The shape is what matters: wait time isn't a straight line.
            Going from 90% to 95% can cost more than going from 50% to 90%. That's why capacity
            plans keep headroom, even though idle GPUs look wasteful.
          </p>
        </>
      ),
    },
    {
      id: "burst",
      title: "Worked example: a 30-second burst",
      body: (
        <>
          <p>
            A cluster serves 50 requests per second. Traffic normally runs at 40, then jumps to 80
            for 30 seconds before returning to 40. All numbers here are illustrative.
          </p>
          <pre>
            <code>{`Excess during burst   80 − 50 = 30 requests per second
Queue after burst     30 × 30 s = 900 requests
Longest wait          900 ÷ 50 = 18 s
Spare capacity after  50 − 40 = 10 requests per second
Time to drain         900 ÷ 10 = 90 s`}</code>
          </pre>
          <p>
            So a 30-second burst causes 120 seconds of elevated latency: the 30-second burst plus a
            90-second drain. The last request in line waits 18 seconds before its first token. For
            a batch job, that's fine. For a chat app with a 2-second target, it's a failure.
          </p>
          <p>
            Turn this around to set a queue limit. The longest queue you should allow is the largest
            one that still meets your budget:
          </p>
          <Formula>max queue length = wait budget × service rate</Formula>
          <p>
            A 2-second budget at 50 requests per second gives 2 × 50 = 100 queued requests. Anyone
            beyond that would wait longer than your target, so an unlimited queue isn't generous.
            It just makes everybody late.
          </p>
        </>
      ),
    },
    {
      id: "shedding",
      title: "Shedding load",
      body: (
        <>
          <p>
            <strong>Load shedding</strong> means rejecting some requests on purpose, so that the
            rest succeed. A fast rejection is better than a slow timeout: the client learns quickly
            and can retry, and you don't spend GPU time on a response nobody will read.
          </p>
          <p>Here's a small admission gate for an async Python gateway:</p>
          <pre>
            <code>{`import asyncio
from fastapi import HTTPException

MAX_ACTIVE = 64     # requests allowed at the engine
MAX_WAITING = 100   # queue limit from the budget
MAX_WAIT_S = 2.0    # wait budget

slots = asyncio.Semaphore(MAX_ACTIVE)
waiting = 0

async def admit():
    global waiting
    if waiting >= MAX_WAITING:
        raise HTTPException(429, headers={"Retry-After": "2"})
    waiting += 1
    try:
        await asyncio.wait_for(slots.acquire(), timeout=MAX_WAIT_S)
    except asyncio.TimeoutError:
        raise HTTPException(503, headers={"Retry-After": "2"})
    finally:
        waiting -= 1

# After the response ends, or the client disconnects:
# slots.release()`}</code>
          </pre>
          <p>A good shedding policy adds a few more rules:</p>
          <ul>
            <li><strong>Priority:</strong> drop background and free-tier work before paid, interactive work.</li>
            <li><strong>Cancellation:</strong> if a client disconnects, stop generating and free the slot at once.</li>
            <li><strong>Size awareness:</strong> count tokens as well as requests, since one huge prompt can use as much as many small ones.</li>
            <li><strong>Separate queues:</strong> keep batch jobs in their own queue, so they can't delay chat traffic.</li>
          </ul>
          <Callout tone="warn">
            Retries can turn a small overload into a large one. If every rejected client retries
            immediately, arrivals go up just as capacity runs out. Ask clients to use exponential
            backoff with random jitter, and send a <code>Retry-After</code> header.
          </Callout>
          <p>
            Queues also feed your autoscaler. Wait time and queue depth rise before latency targets
            break, and they measure demand you failed to serve. In vLLM, the metric{" "}
            <code>vllm:num_requests_waiting</code> reports how many requests are queued in the
            engine. It's often a better scaling signal than GPU utilization, which can read high
            even when a server is healthy. Just remember that a scale-up takes minutes. Queues
            handle the next few seconds, and autoscaling handles the next several minutes.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Queues turn short bursts into short delays, but they can't fix sustained overload.",
    "Little's Law: requests in system equals arrival rate times time in system.",
    "Latency rises sharply as utilization nears 100%, so headroom is worth paying for.",
    "Set the queue limit from your wait budget: budget times service rate.",
    "Shed load early and by priority, with client backoff to prevent retry storms.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Requests arrive at 20 per second and each stays in the system for 5 seconds. On average, how many requests are in the system?",
      format: "***",
      accept: ["100"],
      explain: "Little's Law: 20 × 5 = 100.",
    },
    {
      kind: "text",
      q: "Your cluster serves 40 requests per second and your wait budget is 3 seconds. What's the maximum queue length?",
      format: "***",
      accept: ["120"],
      explain: "3 × 40 = 120 requests.",
    },
    {
      kind: "mcq",
      q: "Why is an unlimited queue a bad idea for a chat product?",
      options: [
        "It uses too much GPU memory",
        "Requests wait past the point users care, and GPU time goes on answers nobody reads",
        "Queues can't hold more than 100 items",
        "It stops the autoscaler from working",
      ],
      answer: 1,
      explain: "A queue only helps when the wait is shorter than the client's patience.",
    },
    {
      kind: "mcq",
      q: "Which client behavior best protects a service that's returning 429 errors?",
      options: [
        "Retry immediately in a tight loop",
        "Open more connections",
        "Exponential backoff with random jitter",
        "Double the prompt length",
      ],
      answer: 2,
      explain: "Backoff spreads retries out, and jitter stops clients from retrying in sync.",
    },
  ],
};
