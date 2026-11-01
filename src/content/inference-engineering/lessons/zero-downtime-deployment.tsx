import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Explain why normal rollouts drop LLM streams",
    "Drain a replica safely with Kubernetes settings",
    "Choose between rolling, blue-green, canary and shadow releases",
    "Estimate rollout time and the capacity it costs",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A typical web request lasts milliseconds, so restarting a server loses very little. An
            LLM stream can last minutes. Restart a replica without care and every response on it
            stops halfway through. Users see an answer cut off mid-sentence, and you've paid for the
            tokens anyway.
          </p>
          <p>
            New replicas are also slow to start, and GPUs are often fully booked, so you can't just
            create a second copy of the fleet. A rollout has to swap engines without stopping the
            plane.
          </p>
          <p>
            Picture a shift change at a supermarket. The incoming cashier opens a new lane. The
            outgoing one puts up a "lane closed" sign, serves the customers already in line, and
            only then leaves. Nobody gets turned away. That's what <strong>draining</strong> is:
            stop new work, finish current work, then exit.
          </p>
        </>
      ),
    },
    {
      id: "draining",
      title: "How to drain a replica",
      body: (
        <>
          <p>When Kubernetes terminates a pod, these things happen, roughly at the same time:</p>
          <ul>
            <li>The pod is removed from the list of service endpoints, so traffic should stop.</li>
            <li>The pod's <code>preStop</code> hook runs, if it has one.</li>
            <li>After that hook, the container receives <code>SIGTERM</code>.</li>
            <li>When the grace period ends, anything still running gets <code>SIGKILL</code>.</li>
          </ul>
          <p>
            The grace period defaults to 30 seconds, which is too short for long streams. Size it
            from your longest allowed response:
          </p>
          <Formula>grace period ≥ max tokens ÷ slowest token rate + safety margin</Formula>
          <p>
            With a 4,096 token limit and a slow stream at 20 tokens per second, that's
            4,096 ÷ 20 ≈ 205 seconds. Round up to 300 seconds to allow for queued requests.
          </p>
          <pre>
            <code>{`spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # one extra replica during the rollout
      maxUnavailable: 0    # never go below the desired count
  template:
    spec:
      terminationGracePeriodSeconds: 300
      containers:
        - name: vllm
          lifecycle:
            preStop:
              exec:
                command:
                  - /bin/sh
                  - -c
                  - |
                    sleep 15
                    while [ "$(curl -s localhost:8000/metrics \\
                      | awk '/^vllm:num_requests_running/ {s+=$2} END {print s+0}')" != "0" ]
                    do sleep 2; done`}</code>
          </pre>
          <p>
            The <code>sleep 15</code> gives routers time to stop sending traffic, since endpoint
            updates aren't instant. Then the loop waits until the engine reports nothing running.
            The grace period includes the time spent in this hook. The script needs{" "}
            <code>curl</code> in your image. Whether an engine waits for streams by itself on{" "}
            <code>SIGTERM</code> depends on the engine and version, so test it by killing a pod in
            the middle of a long stream.
          </p>
          <Callout tone="warn">
            Your gateway needs to stop routing too. If it keeps its own list of replicas, make sure
            that list updates when a replica starts draining. Otherwise, the replica keeps
            receiving requests right up until it dies.
          </Callout>
        </>
      ),
    },
    {
      id: "strategies",
      title: "Release strategies",
      body: (
        <>
          <Table
            head={["Strategy", "How it works", "Good for", "Cost"]}
            rows={[
              ["Rolling", "Replace replicas a few at a time", "Engine and config updates", "Mixed versions during the rollout"],
              ["Blue-green", "Build a full new fleet, then switch traffic", "Instant rollback", "Twice the GPUs for a while"],
              ["Canary", "Send a small share of traffic to the new version", "New models and risky changes", "Needs good metrics to judge"],
              ["Shadow", "Copy live requests to the new version and discard its output", "Load and latency testing with no user risk", "Extra GPUs, and privacy review"],
            ]}
          />
          <p>
            For a new model, canary is usually the right choice. Increase the traffic share in
            steps, such as 1%, 5%, 25%, 50% and 100%, and hold each step long enough to see real
            results. It's easiest to run models side by side behind an alias. Clients call{" "}
            <code>prod-chat</code>, and the gateway decides how much goes to each version.
          </p>
          <Table
            head={["Canary check", "Examples"]}
            rows={[
              ["Latency", "Time to first token, inter-token latency, at the tail"],
              ["Reliability", "Error rate, dropped streams"],
              ["Capacity", "Tokens per second per GPU, KV cache use"],
              ["Quality", "Evaluation scores, refusal rate, output length, user feedback"],
            ]}
          />
          <Callout tone="note">
            A model can be fast and wrong. Infrastructure metrics can't detect a worse answer. Run
            an evaluation set before release, and track quality signals during the canary.
          </Callout>
        </>
      ),
    },
    {
      id: "rollout-math",
      title: "Worked example: rollout time",
      body: (
        <>
          <p>
            You have 20 replicas and no spare GPUs. Each one takes 3 minutes to drain and 5 minutes
            to restart with the new version. These numbers are illustrative.
          </p>
          <Formula>rollout time = (replicas ÷ batch size) × time per batch</Formula>
          <pre>
            <code>{`Per batch: 3 + 5 = 8 minutes

One at a time:  20 batches × 8 = 160 minutes, 5% capacity lost
Four at a time:  5 batches × 8 =  40 minutes, 20% capacity lost`}</code>
          </pre>
          <p>
            That's the trade-off. Faster rollouts cost more capacity, so run them during quiet hours.
            If you're at 90% utilization, losing 20% of your capacity causes an overload. That's why
            your capacity plan needs a deployment buffer. If you can briefly get spare GPUs,{" "}
            <code>maxSurge</code> lets new replicas come up before old ones leave, and you lose
            nothing.
          </p>
        </>
      ),
    },
    {
      id: "safety",
      title: "Rollbacks and quiet breakages",
      body: (
        <>
          <p>
            A rollback is only useful if it's fast. Keep the old version's weights cached on nodes,
            keep its image available, and for model changes keep some old replicas running until the
            new version has proven itself. If going back takes as long as a full rollout, you don't
            really have a rollback.
          </p>
          <p>Before you start, check for the changes that don't look like model changes:</p>
          <ul>
            <li>
              <strong>Chat template:</strong> a different template changes every prompt. It can
              lower quality with no errors at all.
            </li>
            <li>
              <strong>Tokenizer:</strong> token counts change, and with them limits and billing.
            </li>
            <li>
              <strong>Stop tokens:</strong> a mistake here makes responses run on, or end early.
            </li>
            <li>
              <strong>Sampling defaults:</strong> an engine upgrade can change default parameters.
            </li>
            <li>
              <strong>Prefix cache:</strong> new replicas start empty, so expect slower first tokens
              until the cache fills.
            </li>
          </ul>
          <p>
            A short smoke test catches most of these. After a replica starts, send a few fixed
            prompts before it takes traffic. Check that the answers look sensible, the stream
            completes, and a finish reason is returned.
          </p>
          <pre>
            <code>{`curl -s localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model": "my-model",
       "messages": [{"role": "user", "content": "What is 2 + 2?"}],
       "max_tokens": 16}'`}</code>
          </pre>
          <Callout tone="tip">
            Practice the rollback before you need it. A failed release at 3 a.m. isn't a good
            moment to find out that the old image has been deleted.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Drain replicas: stop new requests, finish active streams, then exit.",
    "Set the grace period from your longest allowed response, not the 30-second default.",
    "Use canaries for model changes, and judge them on quality as well as latency.",
    "Rollout speed trades against capacity lost, so plan a deployment buffer.",
    "Keep the previous version ready, and smoke test templates, tokenizers and stop tokens.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Your longest response is 6,000 tokens at 30 tokens per second. How many seconds does it take?",
      format: "***",
      accept: ["200", "200s"],
      explain: "6,000 ÷ 30 = 200 seconds, so the grace period must be longer.",
    },
    {
      kind: "text",
      q: "You roll 30 replicas, 5 at a time, and each batch takes 10 minutes. How many minutes does the rollout take?",
      format: "**",
      accept: ["60"],
      explain: "30 ÷ 5 = 6 batches, and 6 × 10 = 60 minutes.",
    },
    {
      kind: "mcq",
      q: "Which strategy tests a new version under real load, with no effect on users?",
      options: ["Rolling", "Blue-green", "Canary", "Shadow"],
      answer: 3,
      explain: "Shadow copies requests to the new version and throws its output away.",
    },
    {
      kind: "mcq",
      q: "A canary shows normal latency and no errors. What can it still be hiding?",
      options: [
        "A DNS failure",
        "Worse answers from the new model",
        "A missing GPU",
        "A broken load balancer",
      ],
      answer: 1,
      explain: "Infrastructure metrics don't measure quality, so you need evaluations too.",
    },
  ],
};
