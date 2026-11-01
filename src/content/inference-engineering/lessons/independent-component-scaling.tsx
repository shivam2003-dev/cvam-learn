import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Show why scaling a pipeline as one unit wastes GPUs",
    "Calculate replicas for each stage from its own throughput",
    "Choose a scaling signal for each kind of component",
    "Add buffers and backpressure so that stages don't overwhelm each other",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Modern AI products are rarely a single model. A voice agent runs speech recognition, an
            LLM and text-to-speech. A RAG app runs an embedding model, a vector search, a reranker
            and an LLM. An image product runs a text encoder, a diffusion model and a decoder.
          </p>
          <p>
            These stages need very different amounts of hardware. If you package them together
            and scale the package, each extra copy adds the stages you need and all the ones you
            don't.
          </p>
          <p>
            Think of a restaurant where dishes are piling up at the sink. You'd hire a dishwasher.
            You wouldn't hire a matching chef, waiter and host every time. Independent component
            scaling gives each stage its own replica count, so you only add what's actually short.
          </p>
        </>
      ),
    },
    {
      id: "bottleneck",
      title: "Worked example: a voice agent",
      body: (
        <>
          <p>
            A pipeline can only go as fast as its slowest stage. Stack one GPU of each stage in a
            box, and the slowest one sets the box's throughput.
          </p>
          <Formula>pipeline throughput = slowest stage's throughput</Formula>
          <p>Here are illustrative capacities for one GPU at each stage, serving 100 live streams:</p>
          <Table
            head={["Stage", "Streams per GPU", "GPUs for 100 streams"]}
            rows={[
              ["Speech recognition", "20", "5"],
              ["LLM", "5", "20"],
              ["Text-to-speech", "10", "10"],
              ["Total", "", "35"],
            ]}
          />
          <p>
            Each row uses the same rule: round up demand divided by per-replica throughput.
          </p>
          <Formula>replicas = demand ÷ throughput per replica, rounded up</Formula>
          <p>
            Now scale them together. One bundle of three GPUs serves only 5 streams, as the LLM
            limits it. For 100 streams you need 100 ÷ 5 = 20 bundles, or 60 GPUs.
          </p>
          <pre>
            <code>{`Bundled:      20 bundles × 3 GPUs = 60 GPUs
Independent:  5 + 20 + 10         = 35 GPUs
Saved:        60 − 35             = 25 GPUs (about 42%)`}</code>
          </pre>
          <p>
            In the bundled setup, the speech GPUs are only a quarter busy, and text-to-speech GPUs
            only half. You paid for them anyway.
          </p>
        </>
      ),
    },
    {
      id: "signals",
      title: "A different signal for each stage",
      body: (
        <>
          <p>
            Independent scaling only works when each stage scales on a signal that fits it. CPU
            utilization is fine for a web server, but it says little about a GPU stage.
          </p>
          <Table
            head={["Component", "Good signal", "Why"]}
            rows={[
              ["Gateway", "CPU, active connections", "It's ordinary web serving"],
              ["Embedding", "Queue depth, batch fill", "Short jobs, sized for throughput"],
              ["Reranker", "Queue wait time", "It's often latency sensitive inside the request"],
              ["LLM", "Waiting requests, KV cache use", "Memory and slots are the real limits"],
              ["Speech recognition", "Active streams", "Each stream holds capacity while open"],
              ["Image generation", "Queue length", "Long jobs, so backlog predicts load"],
            ]}
          />
          <p>
            In Kubernetes, you give each stage its own Deployment and autoscaler. This one scales an
            LLM on a per-pod queue metric, published through a metrics adapter such as the Prometheus
            Adapter. The metric's name depends on how you configure that adapter.
          </p>
          <pre>
            <code>{`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm
  minReplicas: 2
  maxReplicas: 40
  metrics:
    - type: Pods
      pods:
        metric:
          name: vllm_num_requests_waiting
        target:
          type: AverageValue
          averageValue: "5"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 600`}</code>
          </pre>
          <p>
            The long stabilization window stops the LLM from shrinking on a brief dip, which would
            force an expensive cold start soon after.
          </p>
        </>
      ),
    },
    {
      id: "between-stages",
      title: "What goes wrong between stages",
      body: (
        <>
          <p>
            Separating stages adds a new problem. Scale up one and you may just move the bottleneck.
            If the retriever doubles, it floods the LLM with twice as many requests.
          </p>
          <ul>
            <li>
              <strong>Queues between stages:</strong> a buffer absorbs short mismatches, so a burst
              at one stage doesn't become errors at the next.
            </li>
            <li>
              <strong>Backpressure:</strong> when a downstream stage is full, it tells upstream to
              slow down. Without that, queues grow until something falls over.
            </li>
            <li>
              <strong>End-to-end deadlines:</strong> pass the time remaining with each request, so a
              late stage doesn't do work for a user who has already timed out.
            </li>
            <li>
              <strong>Different cold starts:</strong> a CPU gateway starts in seconds and an LLM in
              minutes. The slow stage needs extra headroom, because it reacts last.
            </li>
          </ul>
          <Callout tone="warn">
            Splitting adds network hops, serialization and version mismatches between stages. For
            one LLM behind a gateway, none of this is worthwhile. Split when stages have clearly
            different hardware needs or demand, not for the sake of tidiness.
          </Callout>
        </>
      ),
    },
    {
      id: "prefill-decode",
      title: "The same idea inside an LLM",
      body: (
        <>
          <p>
            A single LLM has two stages of its own, and they stress hardware differently. Prefill is
            compute-heavy and decode is limited by memory bandwidth. Some systems run them on
            separate pools of GPUs, which the lesson on Prefill &amp; Decode Disaggregation covers in
            depth. Engines and orchestrators such as NVIDIA Dynamo are built with this in mind.
          </p>
          <p>
            The price is moving the KV cache from one GPU to the other. Take a 3.9 GiB cache, which
            is about 4.2 GB, over an illustrative 200 Gbit/s link, or 25 GB/s:
          </p>
          <pre>
            <code>{`4.2 GB ÷ 25 GB/s ≈ 0.17 s`}</code>
          </pre>
          <p>
            That's 170 ms added to the time to first token on a very long request, before any
            software overhead. It can pay off when prompts are long, since heavy prefills no longer
            slow down the streams being decoded. On a short chat workload with little contention,
            the gain may not justify the complexity. Measure both before you commit.
          </p>
          <Callout tone="tip">
            Start by measuring each stage's utilization at peak. A stage that's always at 25% while
            another sits at 95% is the clearest sign that you should separate them.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A bundled pipeline scales at the pace of its slowest stage and wastes the others.",
    "Calculate replicas for each stage from its own demand and throughput.",
    "Use the signal that fits each stage, not one metric for all.",
    "Queues, backpressure and deadlines stop stages from overwhelming each other.",
    "Prefill and decode disaggregation is the same idea, with KV transfer as its price.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Each LLM GPU handles 6 streams. How many GPUs do you need for 120 streams?",
      format: "**",
      accept: ["20"],
      explain: "120 ÷ 6 = 20 GPUs.",
    },
    {
      kind: "text",
      q: "A pipeline has stages that handle 40, 8 and 25 requests per second on one GPU each. What's the pipeline's throughput?",
      format: "*",
      accept: ["8"],
      explain: "The slowest stage sets the limit, which is 8.",
    },
    {
      kind: "mcq",
      q: "You scale up your retrieval stage and LLM latency gets worse. What happened?",
      options: [
        "Retrieval returned fewer documents",
        "More requests now reach the LLM, so the bottleneck moved downstream",
        "Autoscalers can't run in parallel",
        "The vector database got slower",
      ],
      answer: 1,
      explain: "Relieving one stage pushes more load onto the next one.",
    },
    {
      kind: "mcq",
      q: "When is splitting a pipeline into separate services least worthwhile?",
      options: [
        "A voice agent with three models",
        "One LLM behind a thin gateway",
        "A RAG app with a reranker",
        "An image pipeline with separate GPU stages",
      ],
      answer: 1,
      explain: "With one main stage there's nothing to scale separately, and the extra hops add cost.",
    },
  ],
};
