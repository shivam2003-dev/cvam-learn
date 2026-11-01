import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Explain why a cluster needs a layer above the engine",
    "Name Dynamo's main components and what each one does",
    "Score routing decisions using cache overlap and load",
    "Decide whether your deployment needs this complexity",
  ],
  tasks: [
    {
      id: "beyond-one-engine",
      title: "Problems one engine can't see",
      body: (
        <>
          <p>
            An engine such as vLLM manages the GPUs of one server process very well. Grow to dozens
            of replicas, and new problems appear that no single process can see:
          </p>
          <ul>
            <li>A load balancer sends a request away from the replica that has its prefix cached.</li>
            <li>One replica's KV cache is full while another's memory sits idle.</li>
            <li>Traffic moves toward longer prompts, and capacity stays set up for the old mix.</li>
            <li>A KV cache needs to move between machines quickly, without slow CPU copies.</li>
          </ul>
          <p>
            <strong>NVIDIA Dynamo</strong> is an open-source, datacenter-scale serving stack for
            these problems. It doesn't replace your engine. It's an orchestration layer above
            engines, and it works with SGLang, TensorRT-LLM and vLLM.
          </p>
          <p>
            Picture a large hospital. Engines are the operating rooms, each one highly skilled.
            Dynamo is the operations desk, which decides who goes where, moves records between
            departments, and shifts staff as the mix of patients changes.
          </p>
        </>
      ),
    },
    {
      id: "components",
      title: "The main pieces",
      body: (
        <>
          <Table
            head={["Component", "Job", "Problem it solves"]}
            rows={[
              ["Router", "Chooses a worker for each request", "Lost prefix cache hits and uneven load"],
              ["Planner", "Scales worker pools from load and latency goals", "Capacity that doesn't match traffic"],
              ["KV Block Manager", "Moves KV blocks across GPU, CPU, SSD and remote storage", "GPU memory running out"],
              ["NIXL", "Transfers data quickly across memory and storage types", "Slow movement between machines"],
            ]}
          />
          <p>
            NIXL stands for NVIDIA Inference Xfer Library. It gives a single interface over fast
            transports, so components don't need custom code for each pairing of memory, GPU and
            network.
          </p>
          <Callout tone="note">
            Dynamo changes quickly, and its commands and deployment files vary by release. This
            lesson focuses on the concepts, which last longer. Use the project's current docs for
            exact setup.
          </Callout>
        </>
      ),
    },
    {
      id: "routing",
      title: "Worked example: routing by cost",
      body: (
        <>
          <p>
            A router has to balance two goals that pull against each other. Sending a request to a
            worker with its prefix cached avoids prefill. Sending every related request to one
            worker overloads it. A cost score combines both. This simplified version shows the idea:
          </p>
          <Formula>cost = overlap weight × blocks to prefill + active blocks</Formula>
          <p>
            <strong>Blocks to prefill</strong> is the part of the prompt the worker hasn't cached.{" "}
            <strong>Active blocks</strong> measures how busy it is. The worker with the lowest cost
            wins. For a 400-block prompt with a weight of 1:
          </p>
          <Table
            head={["Worker", "Cached", "To prefill", "Active", "Cost"]}
            rows={[
              ["A", "380", "20", "150", "170"],
              ["B", "0", "400", "40", "440"],
              ["C", "200", "200", "20", "220"],
            ]}
          />
          <p>
            A wins despite being the busiest, because the cache saves so much. Now let A's active
            load reach 500. Its cost becomes 520, and C wins at 220. That's the behavior you want:
            cache affinity, until a worker gets overloaded.
          </p>
          <pre>
            <code>{`# Conceptual sketch, not Dynamo source code
def choose_worker(workers, prompt_blocks, overlap_weight=1.0):
    def cost(worker):
        to_prefill = prompt_blocks - worker.cached_blocks
        return overlap_weight * to_prefill + worker.active_blocks
    return min(workers, key=cost)`}</code>
          </pre>
          <p>
            Raising the weight favors cache hits. Lowering it favors even load. The right value
            depends on how much of your traffic shares prefixes.
          </p>
        </>
      ),
    },
    {
      id: "planner-transfer",
      title: "Moving capacity and moving cache",
      body: (
        <>
          <p>
            Dynamo is built with prefill and decode disaggregation in mind, where separate GPU pools
            do each phase. Then the right split between them depends on traffic. Say one prefill
            GPU handles 20,000 input tokens/s, one decode GPU handles 2,000 output tokens/s, and
            traffic is 100 requests/s (all illustrative):
          </p>
          <Table
            head={["Traffic mix", "Prefill GPUs", "Decode GPUs", "Total"]}
            rows={[
              ["2,000 in, 100 out", "200,000 ÷ 20,000 = 10", "10,000 ÷ 2,000 = 5", "15"],
              ["1,000 in, 300 out", "100,000 ÷ 20,000 = 5", "30,000 ÷ 2,000 = 15", "20"],
            ]}
          />
          <p>
            The request rate didn't change, yet the ideal split flipped from 2:1 to 1:3. A fixed
            setup would be badly wrong after that shift. The <strong>Planner</strong> exists to
            follow such changes.
          </p>
          <p>
            Disaggregation has a price: after prefill, the KV cache must travel to a decode GPU, and
            that transfer adds to time to first token. To estimate it, watch your units, since
            networks are sold in bits and caches measured in bytes:
          </p>
          <Formula>transfer time = cache size ÷ link speed in bytes per second</Formula>
          <pre>
            <code>{`2 GB cache on a 400 Gb/s link:
  400 ÷ 8 = 50 GB/s
  2 ÷ 50 = 0.04 s = 40 ms

2 GB cache on a 100 Gb/s link:
  100 ÷ 8 = 12.5 GB/s
  2 ÷ 12.5 = 0.16 s = 160 ms`}</code>
          </pre>
          <p>
            These are best-case figures that ignore protocol overhead. They show why a fast
            transfer path matters, and it's why NIXL exists.
          </p>
          <p>
            The KV Block Manager addresses the memory side. Inactive caches move down to CPU memory
            or SSD, and come back on the next turn. That's only a win if reading a cache back is
            faster than recomputing it.
          </p>
        </>
      ),
    },
    {
      id: "do-you-need-it",
      title: "Do you need it?",
      body: (
        <>
          <Table
            head={["Your situation", "Likely answer"]}
            rows={[
              ["One or a few GPUs", "No, an engine on its own is simpler"],
              ["Several replicas with shared prefixes", "Try a cache-aware router first"],
              ["Large fleet, long contexts, shifting traffic", "Worth evaluating"],
              ["Multi-node models, disaggregated phases", "Strong candidate"],
            ]}
          />
          <Callout tone="warn">
            Every layer you add is another system to deploy, monitor and debug. A central router can
            also become a bottleneck or a single point of failure. Adopt this kind of system when you
            can point to a measured problem that it solves, such as a low cache hit rate across
            replicas.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Dynamo coordinates engines across a cluster and doesn't replace them.",
    "The Router weighs cache overlap against load when picking a worker.",
    "The Planner adjusts worker pools as traffic mix shifts.",
    "NIXL moves data quickly, and the KV Block Manager tiers it across memory and storage.",
    "Cluster orchestration adds complexity, so adopt it for a measured need.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How does Dynamo relate to vLLM, SGLang and TensorRT-LLM?",
      options: [
        "It replaces them",
        "It's an orchestration layer that coordinates them across a cluster",
        "It's a new model format",
        "It only works with one of them",
      ],
      answer: 1,
      explain: "Engines still run the model, and Dynamo coordinates them.",
    },
    {
      kind: "mcq",
      q: "Traffic moves toward shorter prompts and much longer outputs. What should happen in a disaggregated cluster?",
      options: [
        "Shift GPUs from prefill to decode",
        "Shift GPUs from decode to prefill",
        "Nothing, the ratio is constant",
        "Turn off KV caching",
      ],
      answer: 0,
      explain: "Less input and more output means decode needs more of the capacity.",
    },
    {
      kind: "text",
      q: "A prompt is 300 blocks. A worker has 250 cached and 100 active blocks. With a weight of 1, what is its cost?",
      format: "***",
      accept: ["150"],
      explain: "To prefill: 300 − 250 = 50. Cost: 50 + 100 = 150.",
    },
    {
      kind: "text",
      q: "How many milliseconds does a 5 GB cache take over a 200 Gb/s link, ignoring overhead?",
      format: "***",
      accept: ["200", "200ms", "200 ms"],
      explain: "200 ÷ 8 = 25 GB/s, and 5 ÷ 25 = 0.2 s = 200 ms.",
    },
  ],
};
