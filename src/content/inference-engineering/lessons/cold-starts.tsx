import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Break a cold start into its stages and estimate each one",
    "Choose the right fix for the slowest stage",
    "Configure health checks so traffic only reaches a ready replica",
    "Size spare capacity to cover the time a new replica needs",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A web service can add a replica in seconds. A model server can take minutes. Traffic
            doesn't wait for it. If demand jumps now and your new replica serves its first token
            five minutes from now, every extra request in those five minutes waits, fails or lands
            on a server that's already full.
          </p>
          <p>
            A <strong>cold start</strong> is the time from "the autoscaler asked for a replica" to
            "that replica is serving real traffic at full speed." Think of a pizza oven. Customers
            can walk in at any moment, but the oven needs time to heat up. You can't fix that by
            shouting at the oven. You either keep one hot, or you start heating it before the rush.
          </p>
          <p>
            Cold starts are long because of size. Model weights can be hundreds of gigabytes, and
            a GPU node is a heavy machine that clouds don't hand out instantly. So you need to know
            where the minutes go before you try to remove them.
          </p>
        </>
      ),
    },
    {
      id: "timeline",
      title: "Where the minutes go",
      body: (
        <>
          <p>Most cold starts follow the same five stages, and each one depends on the last.</p>
          <Table
            head={["Stage", "What happens", "Limited by"]}
            rows={[
              ["1. Node", "The cloud allocates a GPU machine, which then boots and joins the cluster", "Provider capacity, boot time, driver setup"],
              ["2. Image", "The node pulls and unpacks the container image", "Image size, registry bandwidth, disk"],
              ["3. Weights", "The model files reach local disk", "Network bandwidth, storage throughput"],
              ["4. Load", "Weights move from disk into GPU memory", "Disk speed, file format"],
              ["5. Warm-up", "The engine allocates memory and runs its first requests", "Engine, kernel compilation, first-run caches"],
            ]}
          />
          <p>
            Now some arithmetic. These figures are illustrative, so measure your own. Take a 70 GB
            model on a node with a 10 Gbit/s network, which is 1.25 GB/s, and a local NVMe disk
            that reads at 3 GB/s.
          </p>
          <pre>
            <code>{`Node provision and boot            120 s
Image pull and unpack               60 s
Weights: 70 GB ÷ 1.25 GB/s          56 s
Load:    70 GB ÷ 3 GB/s             23 s
Warm-up                             20 s
-----------------------------------------
Total                              279 s  (about 4.7 minutes)`}</code>
          </pre>
          <p>
            Suppose demand is 5 requests per second above your current capacity during that wait.
            That's 5 × 279 = 1,395 requests with nowhere to go. A shorter cold start isn't just a
            nicer number. It's fewer dropped requests and a smaller bill for spare GPUs.
          </p>
        </>
      ),
    },
    {
      id: "reducing",
      title: "Shortening each stage",
      body: (
        <>
          <p>
            Work on the biggest stage first. In the example above, shaving 10 seconds off warm-up
            matters far less than skipping the two minutes of node provisioning.
          </p>
          <Table
            head={["Stage", "Common fixes"]}
            rows={[
              ["Node", "Keep a small pool of idle nodes, or reserve capacity so provisioning can't stall"],
              ["Image", "Remove unused libraries, keep layers small, pre-pull the image onto nodes, or use lazy image loading"],
              ["Weights", "Cache on the node's disk, keep them in a fast shared filesystem, or download in parallel from storage in the same region"],
              ["Load", "Use the safetensors format, which can be memory-mapped and read efficiently, on fast local storage"],
              ["Warm-up", "Send test requests before taking traffic, and run compilation steps at build time where the engine allows it"],
            ]}
          />
          <p>
            Weights are worth special care. If you download them from the public internet on each
            start, your startup depends on a third party's speed and uptime. Copy them into your own
            object storage in the same region, pin an exact version, and cache them on the node.
            A replica that restarts on the same node then skips the download altogether.
          </p>
          <Callout tone="tip">
            Some teams go further and snapshot a loaded process, then restore it instead of starting
            again. It can remove most of the load and warm-up time, but GPU state makes it delicate.
            Treat it as an advanced option, after the simple fixes are done.
          </Callout>
        </>
      ),
    },
    {
      id: "probes",
      title: "Don't send traffic too early",
      body: (
        <>
          <p>
            A container that's running isn't a replica that's ready. If your load balancer sends
            traffic as soon as the process starts, users hit a server still loading weights. In
            Kubernetes, three probes keep this honest:
          </p>
          <ul>
            <li><strong>Startup probe:</strong> gives a slow process time to start before other checks begin.</li>
            <li><strong>Readiness probe:</strong> decides if the pod should receive traffic.</li>
            <li><strong>Liveness probe:</strong> restarts a container that has stopped responding.</li>
          </ul>
          <pre>
            <code>{`containers:
  - name: vllm
    image: vllm/vllm-openai:latest   # pin an exact tag in production
    args: ["--model", "/models/my-model"]
    ports:
      - containerPort: 8000
    startupProbe:
      httpGet: { path: /health, port: 8000 }
      periodSeconds: 10
      failureThreshold: 60     # allows up to 600 s to start
    readinessProbe:
      httpGet: { path: /health, port: 8000 }
      periodSeconds: 5
    livenessProbe:
      httpGet: { path: /health, port: 8000 }
      periodSeconds: 10
      failureThreshold: 3`}</code>
          </pre>
          <Callout tone="warn">
            A liveness probe without a startup probe is a classic trap. If the model takes four
            minutes to load and liveness gives up after 30 seconds, Kubernetes kills the container and
            starts again, forever. The pod never gets ready, and nothing in the logs looks like an
            error from the model itself.
          </Callout>
          <p>
            Also check that "healthy" means "warm." If your engine reports healthy before its first
            inference, the first real user pays for the warm-up. A small script that sends a test
            prompt before the pod reports ready moves that cost off your users.
          </p>
        </>
      ),
    },
    {
      id: "planning",
      title: "Plan around what's left",
      body: (
        <>
          <p>
            You'll never reach zero. So treat the remaining cold start as a planning input. Your
            autoscaler reacts late by exactly this amount, which means capacity must already exist
            for the demand that will arrive during the wait:
          </p>
          <Formula>spare capacity ≈ demand growth rate × cold start time</Formula>
          <p>
            Say demand can grow by 2 requests per second every minute, and cold start is 5 minutes.
            You need 2 × 5 = 10 requests per second of headroom. If one replica serves 4 requests
            per second, that's 10 ÷ 4 = 2.5, so keep 3 spare replicas.
          </p>
          <p>
            Cut the cold start to 2 minutes and the headroom drops to 4 requests per second, or
            1 spare replica. That's the real payoff: faster starts let you hold fewer idle GPUs.
          </p>
          <p>
            Log a timestamp at the end of each stage, and track the 95th percentile, not the
            average. A cold start that's usually 3 minutes but sometimes 15 will hurt you exactly
            when you need it, which is during a traffic spike when GPU capacity is tight.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A cold start runs from the scale-up decision to serving real traffic at full speed.",
    "The usual stages are node, image, weights, load and warm-up, so fix the largest first.",
    "Keep weights in your own same-region storage and cache them on the node.",
    "Startup and readiness probes keep slow replicas alive and away from traffic until ready.",
    "Spare capacity must cover demand growth during whatever cold start remains.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A pod keeps restarting and never gets ready, but its logs show the model loading normally. What's the most likely cause?",
      options: [
        "The GPU is too fast",
        "A liveness probe fires before loading finishes",
        "The readiness probe is too lenient",
        "The model is in the safetensors format",
      ],
      answer: 1,
      explain: "Without a startup probe, liveness can kill the pod mid-load, and the cycle repeats.",
    },
    {
      kind: "text",
      q: "A 70 GB model downloads over a link that delivers 1.25 GB/s. How many seconds does the download take?",
      format: "**",
      accept: ["56", "56s"],
      explain: "70 ÷ 1.25 = 56 seconds.",
    },
    {
      kind: "mcq",
      q: "Which change most directly reduces the time to get a GPU machine into the cluster?",
      options: [
        "Keeping a pool of idle nodes",
        "Shrinking the tokenizer",
        "Adding a readiness probe",
        "Raising the batch size",
      ],
      answer: 0,
      explain: "An idle node that's already in the cluster skips provisioning and boot.",
    },
    {
      kind: "text",
      q: "Demand grows by 3 requests per second each minute. Cold start is 4 minutes. How many requests per second of headroom do you need?",
      format: "**",
      accept: ["12"],
      explain: "3 × 4 = 12 requests per second.",
    },
  ],
};
