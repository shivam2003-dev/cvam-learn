import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Describe the main alternatives to NVIDIA GPUs",
    "Explain how SRAM-heavy chips differ from HBM-based ones",
    "Weigh hardware savings against the cost of porting software",
    "Decide when an alternative is worth testing",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: price, supply and lock-in",
      body: (
        <>
          <p>
            NVIDIA has a very strong position in inference, thanks in large part to CUDA and the
            software around it. Relying on one supplier has downsides, though: high prices,
            uneven supply and little bargaining power. Inference also suits alternatives better
            than training does. It runs a known model on a stable graph, so it doesn't need the
            whole research toolchain.
          </p>
          <p>
            Think of it like choosing a delivery fleet. Standard vans go anywhere and every
            mechanic knows them. A specialist vehicle may be better on your exact route, but only
            if that route stays the same and you can get it serviced. Hardware buying works much
            the same way.
          </p>
        </>
      ),
    },
    {
      id: "landscape",
      title: "The landscape",
      body: (
        <>
          <Table
            head={["Family", "Examples", "Memory design", "How you get it", "Software"]}
            rows={[
              ["AMD GPUs", "Instinct MI300 and MI350 series", "HBM", "Clouds, or buy", "ROCm, close to the GPU model"],
              ["Google TPUs", "Ironwood and earlier TPUs", "HBM", "Google Cloud", "JAX, XLA, PyTorch/XLA"],
              ["AWS silicon", "Inferentia, Trainium", "HBM or similar", "AWS only", "Neuron SDK"],
              ["Low-latency chips", "Groq LPU", "On-chip SRAM", "Mostly as a service", "Vendor compiler"],
              ["Wafer-scale", "Cerebras WSE", "On-wafer SRAM", "Service or systems", "Vendor stack"],
            ]}
          />
          <Callout tone="warn" title="This changes fast">
            Products, ownership and availability shift often in this market. Treat this table as a
            map of the types, not a current catalog, and check vendor documents for live details.
          </Callout>
        </>
      ),
    },
    {
      id: "amd-tpu",
      title: "The GPU-like options",
      body: (
        <>
          <p>
            <strong>AMD Instinct</strong> is the closest alternative. Its GPUs work like NVIDIA's,
            with HBM, and they're generous on memory. AMD lists the MI350 series with up to 288 GB
            of HBM3E per GPU and 8 TB/s of memory bandwidth. As with any spec, verify it for the
            exact part you're buying.
          </p>
          <p>
            Its software stack is <strong>ROCm</strong>. PyTorch has ROCm builds, and vLLM
            supports it. Your code can stay similar, but custom kernels and some optimized
            features may arrive later or be less tuned. You can check which build you have:
          </p>
          <pre>
            <code>{`import torch

print(torch.cuda.is_available())  # True on both CUDA and ROCm builds
print(torch.version.cuda)         # None on a ROCm build
print(torch.version.hip)          # None on a CUDA build`}</code>
          </pre>
          <p>
            <strong>Google TPUs</strong> are custom chips built around large matrix engines, and
            they scale through fast links between chips. They're available only on Google Cloud.
            They work well with JAX. They can be a strong choice for teams already on that
            platform, and Google runs its own models on them.
          </p>
          <p>
            <strong>AWS Inferentia and Trainium</strong> follow a similar logic inside AWS, with
            the Neuron SDK as the software layer. Models go through a compile step, so check that
            your architecture is supported before you plan on them.
          </p>
        </>
      ),
    },
    {
      id: "sram",
      title: "SRAM-heavy designs",
      body: (
        <>
          <p>
            Remember the decode bottleneck: reading weights from memory. Some designs attack it
            directly by moving memory onto the chip.
          </p>
          <p>
            <strong>Groq's LPU</strong> keeps model data in on-chip SRAM, rather than in external
            HBM, and uses a compiler to schedule work ahead of time. SRAM is very fast, so token
            rates per user can be high and latency predictable. But each chip has only hundreds of
            megabytes of SRAM, so a large model has to spread across many chips. NVIDIA also
            licensed Groq's inference technology in a large deal, which shows how seriously the
            market takes low-latency inference.
          </p>
          <p>
            <strong>Cerebras</strong> takes a more extreme path, building one huge chip from a
            whole silicon wafer. That gives it a lot of on-wafer SRAM, measured in tens of
            gigabytes, and very fast internal communication.
          </p>
          <Table
            head={["", "HBM-based GPU", "SRAM-heavy chip"]}
            rows={[
              ["Memory speed", "High", "Very high"],
              ["Memory per chip", "Large", "Small to moderate"],
              ["Decode speed per user", "Good", "Often excellent"],
              ["Long context and many users", "Stronger", "Harder, memory is scarce"],
              ["Serving new model types", "Flexible", "Depends on vendor support"],
            ]}
          />
          <p>
            These trade-offs follow from physics, not branding. They also suit a growing need:
            interactive products such as voice agents, where per-user speed matters more than
            cost per token.
          </p>
        </>
      ),
    },
    {
      id: "deciding",
      title: "Worked example: is switching worth it?",
      body: (
        <>
          <p>Lower prices only count if they survive the cost of moving.</p>
          <Formula>payback months = porting cost ÷ monthly saving</Formula>
          <p>
            Say you spend $100,000 a month on GPUs, and a benchmark on your workload shows an
            alternative would cut that by 30%. Porting takes two engineers three months, at an
            illustrative $20,000 per engineer per month.
          </p>
          <pre>
            <code>{`Monthly saving:  $100,000 × 0.30 = $30,000
Porting cost:    2 × 3 × $20,000 = $120,000
Payback:         $120,000 ÷ $30,000 = 4 months`}</code>
          </pre>
          <p>
            Four months looks good. But add ongoing costs. You'll run two stacks for a while, and
            new models may arrive late on the alternative. A one-engineer maintenance load of
            $20,000 a month cuts the net saving to $10,000, and payback stretches to 12 months.
          </p>
          <p>Before committing, test these:</p>
          <ul>
            <li>Does your exact model run, with your exact features, such as tool calling?</li>
            <li>Do the numbers hold at your latency target, at your real prompt lengths?</li>
            <li>How quickly do new model releases get supported?</li>
            <li>Can you get the capacity, and is it in your region?</li>
          </ul>
          <Callout tone="tip">
            Keep your options open cheaply. Have your application call an OpenAI-compatible
            endpoint, not a hardware-specific library. Then a backend change becomes a routing
            change, and you can run a small share of traffic on an alternative as a trial.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Inference is a good fit for alternatives, because the workload is stable and well defined.",
    "AMD is the closest match to NVIDIA GPUs. TPUs and AWS chips are tied to their clouds.",
    "SRAM-heavy chips favor speed per user, but memory per chip is limited.",
    "Include porting and ongoing maintenance when calculating any saving.",
    "OpenAI-compatible interfaces keep your options open.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why are SRAM-heavy chips often fast at decode?",
      options: [
        "They skip the attention step",
        "On-chip memory removes much of the wait for reading data",
        "They don't need weights",
        "They run only tiny models",
      ],
      answer: 1,
      explain: "Decode is limited by memory access, and on-chip SRAM is very fast to read.",
    },
    {
      kind: "mcq",
      q: "Which is a real challenge for SRAM-heavy designs?",
      options: [
        "Low memory bandwidth",
        "Fitting large models and many KV caches, because memory is scarce",
        "Slow token rates",
        "A lack of on-chip memory",
      ],
      answer: 1,
      explain: "SRAM takes up a lot of chip area, so capacity per chip is limited.",
    },
    {
      kind: "mcq",
      q: "Which software stack does AMD Instinct use?",
      options: ["CUDA", "ROCm", "Neuron SDK", "JAX only"],
      answer: 1,
      explain: "ROCm is AMD's open GPU software stack. Neuron SDK is AWS's stack.",
    },
    {
      kind: "text",
      q: "Porting costs $90,000 and saves $15,000 a month. What is the payback time in months?",
      format: "*",
      accept: ["6"],
      explain: "$90,000 ÷ $15,000 = 6 months.",
    },
  ],
};
