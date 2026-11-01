import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Decide when a model truly needs more than one machine",
    "Convert network speeds and estimate traffic across nodes",
    "Choose which parallelism method belongs on the network",
    "Plan for group failures, startup and rollouts",
  ],
  tasks: [
    {
      id: "problem",
      title: "When one machine isn't enough",
      body: (
        <>
          <p>
            Some models don't fit in a single server. Take a model with 1,000 GiB of weights and a
            server with 8 GPUs of 96 GiB each. That's 768 GiB in total, which isn't enough even
            before any KV cache. Two servers give you 1,536 GiB, so the model has to span them.
            That's <strong>multi-node inference</strong>, where a node is one physical machine.
          </p>
          <p>
            First, be sure you need it. If a model fits on one machine and you only want more
            throughput, run independent copies instead. These are called{" "}
            <strong>replicas</strong>. They don't talk to each other during inference, and one
            failing doesn't touch the others. Multi-node serving is for models too large for one
            machine, not a general way to scale.
          </p>
          <Table
            head={["Situation", "Best choice"]}
            rows={[
              ["Fits on one GPU", "Replicas of one GPU"],
              ["Fits on one machine", "Tensor parallelism, plus replicas"],
              ["Too big for one machine", "Multi-node group, plus replicas of that group"],
            ]}
          />
        </>
      ),
    },
    {
      id: "network",
      title: "The network is the new bottleneck",
      body: (
        <>
          <p>
            Inside a server, GPUs talk over NVLink. Between servers, data crosses a network
            card and switches. The network is far slower:
          </p>
          <Table
            head={["Link", "Where", "Rough scale"]}
            rows={[
              ["NVLink", "Between GPUs in a machine", "Hundreds of GB/s"],
              ["400 Gb/s network", "Between machines", "50 GB/s per card"],
              ["100 Gb/s network", "Between machines", "12.5 GB/s per card"],
            ]}
          />
          <p>
            These are rough figures that change by generation. Network speeds are also quoted in
            gigabits (Gb), while memory uses gigabytes (GB):
          </p>
          <Formula>GB/s = Gb/s ÷ 8</Formula>
          <p>
            Two technologies make the network usable. <strong>RDMA</strong> (remote direct memory
            access) lets one machine write into another's memory without involving its CPU.
            InfiniBand and RoCE, which is RDMA over Ethernet, are the usual ways to get it.{" "}
            <strong>GPUDirect RDMA</strong> goes further, letting the network card read and write
            GPU memory directly. Without it, data takes an extra trip through CPU memory.
          </p>
          <Callout tone="warn">
            Ordinary TCP over a data-center network is rarely good enough for splitting one
            model. Confirm that RDMA is actually working, because many setups can quietly fall
            back to a slower path.
          </Callout>
        </>
      ),
    },
    {
      id: "which-split",
      title: "Worked example: what crosses the wire",
      body: (
        <>
          <p>
            Say each node runs TP on its 8 GPUs, and our model has 60 layers and a hidden size of
            8,192, with 2 bytes per value. Compare two ways to cross the 50 GB/s network. In PP,
            the two nodes are stages with one boundary. In the other, TP spans all 16 GPUs, so
            all 120 syncs cross the network. Take a decode step with 32 tokens, and a prefill of
            one 100,000-token prompt.
          </p>
          <pre>
            <code>{`Decode, per transfer:   32 × 8,192 × 2 = 524,288 bytes
Prefill, per transfer:  100,000 × 8,192 × 2 = 1,638,400,000 bytes ≈ 1.6 GB

Pipeline, 1 transfer:
  Decode:   524,288 bytes ÷ 50 GB/s ≈ 10.5 µs
  Prefill:  1.64 GB ÷ 50 GB/s ≈ 33 ms

Tensor, 120 transfers:
  Decode:   62.9 MB ÷ 50 GB/s ≈ 1.3 ms
  Prefill:  196.6 GB ÷ 50 GB/s ≈ 3.9 s`}</code>
          </pre>
          <p>
            These are rough estimates that ignore protocol overhead and per-message delay, but
            the gap is huge. Prefill would spend nearly 4 seconds on the network alone with TP
            across nodes, against 33 ms with PP. This is why the usual layout keeps TP inside
            each node and uses PP between nodes.
          </p>
          <p>
            MoE models are harder. EP across nodes means all-to-all traffic crosses the network,
            so it needs a high-bandwidth fabric, and topology-aware placement of experts helps.
          </p>
          <Callout tone="tip">
            Place nodes in one group under the same network switch where possible. Extra switch
            hops add delay, and a shared uplink can become congested.
          </Callout>
        </>
      ),
    },
    {
      id: "operations",
      title: "Running a group as one unit",
      body: (
        <>
          <p>
            The hardest parts aren't about speed. A single-node replica is one thing to manage,
            but a multi-node group has to act as one.
          </p>
          <ul>
            <li>
              <strong>Shared failure.</strong> If one node fails, the entire group stops, and all
              its active requests fail.
            </li>
            <li>
              <strong>Gang scheduling.</strong> All nodes must start together. Half a group is
              useless, and it still holds expensive GPUs.
            </li>
            <li>
              <strong>Slow starts.</strong> Every node must load its weights before anything can
              serve, so startup time follows the slowest one.
            </li>
            <li>
              <strong>Rollouts.</strong> You replace or scale whole groups, so each step moves a
              big block of capacity.
            </li>
          </ul>
          <p>Shared failure multiplies. With a 99.5% availability per node (illustrative):</p>
          <Formula>group availability = node availability ^ nodes</Formula>
          <Table
            head={["Nodes in group", "Calculation", "Group availability"]}
            rows={[
              ["1", "0.995", "99.5%"],
              ["2", "0.995 × 0.995", "About 99.0%"],
              ["4", "0.995 ^ 4", "About 98.0%"],
            ]}
          />
          <p>
            On Kubernetes, the LeaderWorkerSet project models this directly. It treats a leader
            pod and its workers as one group, then scales and restarts groups as a unit:
          </p>
          <pre>
            <code>{`apiVersion: leaderworkerset.x-k8s.io/v1
kind: LeaderWorkerSet
metadata:
  name: big-model
spec:
  replicas: 3                # three independent serving groups
  leaderWorkerTemplate:
    size: 2                  # two pods per group: one leader, one worker
    restartPolicy: RecreateGroupOnPodRestart
    leaderTemplate:
      spec:
        containers:
          - name: leader
            image: your-registry/your-engine:1.0
            resources:
              limits:
                nvidia.com/gpu: "8"
    workerTemplate:
      spec:
        containers:
          - name: worker
            image: your-registry/your-engine:1.0
            resources:
              limits:
                nvidia.com/gpu: "8"`}</code>
          </pre>
          <p>
            Engines also bring their own coordination. vLLM, for example, can use Ray to run
            workers across nodes. Either way, keep more than one group running, so that a failure
            reduces capacity rather than taking the model offline.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Use multi-node inference when a model won't fit on one machine, not for ordinary scaling.",
    "Networks are far slower than NVLink, and they're quoted in bits, so divide by 8.",
    "RDMA and GPUDirect RDMA keep network transfers fast by skipping the CPU.",
    "Keep TP inside each node and use PP between nodes.",
    "Treat each group as one unit for failure, scheduling, startup and rollouts.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A model fits on one 8-GPU machine, and you need twice the throughput. What's the simplest good answer?",
      options: [
        "Span the model across two machines with TP",
        "Run two independent replicas",
        "Move to pipeline parallelism on one machine",
        "Lower the hidden size",
      ],
      answer: 1,
      explain: "Replicas add capacity without any network traffic between GPUs, and they fail independently.",
    },
    {
      kind: "mcq",
      q: "What does GPUDirect RDMA change?",
      options: [
        "GPUs share one memory pool",
        "The network card accesses GPU memory directly",
        "The CPU compresses all tensors",
        "It replaces NVLink inside a server",
      ],
      answer: 1,
      explain: "It avoids an extra copy through CPU memory on each transfer.",
    },
    {
      kind: "text",
      q: "A network link is rated at 800 Gb/s. What's that in GB/s?",
      format: "***",
      accept: ["100", "100 gb/s", "100gb/s"],
      explain: "800 ÷ 8 = 100 GB/s.",
    },
    {
      kind: "text",
      q: "A hidden state is 200 MB, and the network moves 40 GB/s. How many milliseconds does one transfer take?",
      format: "*",
      accept: ["5", "5 ms", "5ms"],
      explain: "0.2 GB ÷ 40 GB/s = 0.005 s, which is 5 ms.",
    },
  ],
};
