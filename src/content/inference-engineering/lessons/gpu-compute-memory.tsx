import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Describe how a data center GPU organizes compute and memory",
    "Tell memory capacity apart from memory bandwidth",
    "Estimate a decode speed limit from bandwidth",
    "Read GPU utilization metrics without being misled",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a GPU is more than its core count",
      body: (
        <>
          <p>
            A GPU spec sheet lists many numbers, but inference speed is usually set by just a few.
            If you don't know what the parts do, it's easy to buy the wrong GPU or to misread
            what limits it. This lesson gives you a working model of the hardware.
          </p>
          <p>
            Picture a large restaurant kitchen. Many cooks work in parallel (compute). Each
            station has a small counter (on-chip memory). A big pantry holds all the ingredients
            (HBM). A door connects the pantry to the kitchen (memory bandwidth). A kitchen with
            hundreds of cooks and a narrow door still serves food slowly. Inference has the same
            shape: lots of math, but a lot of data to move first.
          </p>
        </>
      ),
    },
    {
      id: "compute",
      title: "Compute: thousands of simple workers",
      body: (
        <>
          <p>
            A CPU has a modest number of powerful cores, built to handle branching logic fast. A
            GPU has a huge number of simpler execution units that run the same operation over
            lots of data. Matrix multiplication suits that design perfectly.
          </p>
          <p>On NVIDIA GPUs, compute is arranged in a hierarchy:</p>
          <ul>
            <li>
              <strong>Streaming multiprocessor (SM):</strong> the main repeated building block. A
              GPU contains many of them.
            </li>
            <li>
              <strong>CUDA cores:</strong> general arithmetic units inside each SM.
            </li>
            <li>
              <strong>Tensor cores:</strong> specialized units that do small matrix multiply-add
              operations in one go. Most AI throughput comes from these.
            </li>
          </ul>
          <p>
            Tensor cores are why number format matters. Hardware support for a format decides how
            fast it runs. Hopper added hardware acceleration for 8-bit floats (FP8), and Blackwell
            extended this to 4-bit formats. Fewer bits per number means more numbers moved per
            second, as well as less memory.
          </p>
        </>
      ),
    },
    {
      id: "memory",
      title: "Memory: a ladder of speed and size",
      body: (
        <>
          <p>
            <strong>High-bandwidth memory (HBM)</strong> is DRAM stacked vertically and placed
            beside the GPU die on the same package. Its very wide connection gives it far more
            bandwidth than regular server memory. It's also costly and limited in supply, which is
            part of why GPUs are expensive.
          </p>
          <Table
            head={["Level", "Size", "Speed", "What lives there"]}
            rows={[
              ["SM shared memory and L1", "Kilobytes", "Fastest", "Data for the current tile"],
              ["L2 cache", "Megabytes", "Very fast", "Recently used data"],
              ["HBM", "Tens to hundreds of GB", "Fast", "Weights and KV caches"],
              ["CPU memory", "Hundreds of GB and up", "Much slower link", "Offloaded caches"],
              ["Local NVMe", "Terabytes", "Slowest here", "Model files, cold caches"],
            ]}
          />
          <p>Two numbers describe HBM, and they answer different questions:</p>
          <ul>
            <li>
              <strong>Capacity</strong>, in GB: what fits? This is a hard limit. If the weights
              don't fit, the model doesn't run on that GPU alone.
            </li>
            <li>
              <strong>Bandwidth</strong>, in TB/s: how fast can it be read? This is a soft limit.
              Things still work, just slowly.
            </li>
          </ul>
          <p>
            For a concrete reference point, NVIDIA lists the H100 SXM with 80 GB of HBM at about
            3.35 TB/s. Specs differ between form factors and generations and they keep changing,
            so check the current datasheet.
          </p>
        </>
      ),
    },
    {
      id: "speed-limit",
      title: "Worked example: a decode speed limit",
      body: (
        <>
          <p>
            Weights are far bigger than the on-chip caches. So a decode step has to pull roughly
            all the weights from HBM, plus the KV cache of every request in the batch. That gives
            a simple upper bound:
          </p>
          <Formula>steps per second ≈ memory bandwidth ÷ bytes read per step</Formula>
          <p>
            Take illustrative numbers: 3 TB/s of bandwidth, 30 GB of weights, and 20 active
            requests holding 2 GB of cache each.
          </p>
          <pre>
            <code>{`One request, ignoring its cache:
  30 GB ÷ 3,000 GB/s = 10 ms per step
  At most 100 tokens/s

Batch of 20:
  Read per step = 30 + (20 × 2) = 70 GB
  70 ÷ 3,000 = 23.3 ms per step
  1 ÷ 0.0233 = about 43 tokens/s per request
  43 × 20 = about 857 tokens/s in total`}</code>
          </pre>
          <p>
            Batching gave this GPU much more total throughput, since all 20 requests share one
            read of the weights. Each user got slower, because the caches add to every step. This
            is the latency and throughput trade in hardware form.
          </p>
          <p>
            This is a ceiling, not a forecast. Real systems stay below it. But it tells you where
            to look: a faster core clock can't help if the door is what's full. The Roofline Model
            lesson turns this idea into a full method.
          </p>
          <Callout tone="note">
            Precision helps twice. Moving weights from 16-bit to 8-bit halves their size, so they
            fit in less memory and take half as long to read.
          </Callout>
        </>
      ),
    },
    {
      id: "measuring",
      title: "Measuring what the GPU is really doing",
      body: (
        <>
          <p>Start with a quick look:</p>
          <pre>
            <code>{`nvidia-smi --query-gpu=name,memory.total,memory.used,utilization.gpu,power.draw,clocks.gr --format=csv -l 5`}</code>
          </pre>
          <Callout tone="warn">
            The usual "GPU utilization" figure is misleading. It reports the share of time at
            least one kernel was running, not how much of the chip was busy. A GPU can show 100%
            while most of its compute sits idle. Don't use it alone to judge spare capacity.
          </Callout>
          <p>
            For a better view, use NVIDIA's Data Center GPU Manager (DCGM), which reports hardware
            activity:
          </p>
          <pre>
            <code>{`# 1002 SM active, 1003 SM occupancy,
# 1004 tensor core active, 1005 memory active
dcgmi dmon -e 1002,1003,1004,1005`}</code>
          </pre>
          <Table
            head={["What you see", "Likely meaning"]}
            rows={[
              ["High memory activity, moderate tensor activity", "Limited by bandwidth, common in decode"],
              ["High tensor activity, lower memory activity", "Limited by compute, common in prefill"],
              ["Both low while requests are waiting", "Bottleneck is outside the GPU: CPU, network or scheduler"],
              ["Clocks falling under steady load", "Power or heat limit"],
            ]}
          />
          <p>
            Treat these patterns as starting points, then confirm them with a profiler. Also keep
            an eye on power and temperature. A GPU that's throttling loses clock speed, and your
            benchmark from a cool idle start won't match sustained load.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Tensor cores do most AI math, and supported number formats determine how fast they run.",
    "HBM capacity decides what fits. HBM bandwidth decides how fast it runs.",
    "Bandwidth divided by bytes read per step gives a useful ceiling for decode speed.",
    "Batching shares the weight read, so total throughput rises while per-user speed falls.",
    "GPU utilization isn't real load, so use DCGM activity metrics instead.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which limit is hard, meaning the model simply won't run on one GPU if it's exceeded?",
      options: ["Memory bandwidth", "Memory capacity", "Core clock", "Power limit"],
      answer: 1,
      explain: "If the weights don't fit in capacity, they can't be loaded. The other limits only slow things down.",
    },
    {
      kind: "mcq",
      q: "nvidia-smi shows 100% GPU utilization. What can you safely conclude?",
      options: [
        "All cores are fully busy",
        "The GPU has no spare capacity",
        "At least one kernel was running during the sample period",
        "Memory is full",
      ],
      answer: 2,
      explain: "The metric only reports that something was running, not how much of the chip was used.",
    },
    {
      kind: "mcq",
      q: "Why does batching raise total decode throughput?",
      options: [
        "It raises the GPU clock",
        "Requests in a batch share one read of the weights",
        "It removes the KV cache",
        "It doubles memory bandwidth",
      ],
      answer: 1,
      explain: "One step serves every request in the batch, so the cost of reading weights is shared.",
    },
    {
      kind: "text",
      q: "A GPU has 4 TB/s of bandwidth. Each decode step reads 40 GB. What is the upper limit in steps per second?",
      format: "***",
      accept: ["100"],
      explain: "4,000 GB/s ÷ 40 GB = 100 steps per second.",
    },
    {
      kind: "text",
      q: "What does the abbreviation HBM stand for?",
      format: "**** ********* ******",
      accept: ["high bandwidth memory", "high-bandwidth memory"],
      explain: "High-bandwidth memory is stacked DRAM placed beside the GPU die.",
    },
  ],
};
