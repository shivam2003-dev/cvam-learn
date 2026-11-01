import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Compare H100, H200, B200 and B300 on the specs that matter for inference",
    "Explain what each generation changed for LLM serving",
    "Work out how many GPUs a large model needs at different precisions",
    "Compare generations by cost per token",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: which generation should you pick?",
      body: (
        <>
          <p>
            Most production inference today runs on NVIDIA's <strong>Hopper</strong> and{" "}
            <strong>Blackwell</strong> GPUs, and clouds usually offer both. The newer one isn't
            automatically the right one. The older GPU may be cheaper and easier to get, and it
            may meet your latency target anyway. Headline claims won't tell you, because they
            describe a particular setup and rarely yours.
          </p>
          <p>
            So learn what actually changed between generations, and connect each change to a
            bottleneck. A car analogy helps: don't compare top speed alone. Compare seats, luggage
            room and running cost for the journeys you really make.
          </p>
        </>
      ),
    },
    {
      id: "specs",
      title: "The numbers that matter",
      body: (
        <>
          <Table
            head={["GPU", "Memory", "Memory bandwidth", "NVLink per GPU"]}
            rows={[
              ["H100 SXM", "80 GB", "About 3.35 TB/s", "900 GB/s"],
              ["H200 SXM", "141 GB", "About 4.8 TB/s", "900 GB/s"],
              ["B200", "About 180 to 192 GB", "About 8 TB/s", "1.8 TB/s"],
              ["B300", "About 270 to 288 GB", "About 8 TB/s", "1.8 TB/s"],
            ]}
          />
          <Callout tone="warn" title="Check the datasheet">
            These figures are approximate, and they change with form factor and system. Blackwell
            memory is listed differently across sources and products, which is why the table gives
            ranges. Confirm the numbers for the exact system you're buying, and expect this table
            to age as new products ship.
          </Callout>
          <p>
            Two simple ratios help. Moving from H100 to B200 at 180 GB gives 180 ÷ 80 = 2.25 times
            the capacity and 8 ÷ 3.35 = about 2.4 times the bandwidth, before any compute gain.
            Those two numbers largely set how much more KV cache a GPU can hold and how fast it
            can read it.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      title: "What each step changed",
      body: (
        <>
          <p>
            <strong>H100</strong> is the baseline Hopper part. It introduced the Transformer
            Engine, with hardware support for 8-bit floating point (FP8). Software support is
            mature, and most engines and guides assume it.
          </p>
          <p>
            <strong>H200</strong> is largely a memory upgrade. It uses the same Hopper design and
            the same NVLink, with more and faster memory. So it helps most where memory is the
            bottleneck: long contexts, high concurrency and decode. Don't expect the same gain on
            work that's mainly limited by compute.
          </p>
          <p>
            <strong>B200</strong> is a new architecture. It joins two large dies in one package so
            that they behave as one GPU, with more compute and much more bandwidth. It doubles
            NVLink speed, and it adds hardware support for 4-bit floats, including NVIDIA's NVFP4
            format.
          </p>
          <p>
            <strong>B300</strong> is Blackwell Ultra. Its main change for inference is much more
            memory per GPU, at higher power.
          </p>
          <Table
            head={["Your bottleneck", "What helps most"]}
            rows={[
              ["Model doesn't fit", "More capacity: H200, then B200 or B300"],
              ["Decode too slow", "More bandwidth: Blackwell"],
              ["Long prompts too slow", "More compute: Blackwell"],
              ["KV cache limits concurrency", "More capacity, or a smaller cache"],
              ["Tensor parallelism overhead", "Faster NVLink: Blackwell"],
            ]}
          />
        </>
      ),
    },
    {
      id: "fit",
      title: "Worked example: fitting a very large model",
      body: (
        <>
          <p>
            Take a 405-billion-parameter model, such as Llama 3.1 405B. Weight size is simple
            multiplication:
          </p>
          <Formula>weight bytes ≈ parameters × bits per parameter ÷ 8</Formula>
          <pre>
            <code>{`FP8:  405 B × 1 byte    = 405 GB
FP4:  405 B × 0.5 bytes = 202.5 GB

GPUs needed for the weights alone:
           H100 (80)   B200 (180)   B300 (270)
FP8 405     6 (5.06)    3 (2.25)     2 (1.5)
FP4 202.5   3 (2.53)    2 (1.13)     1 (0.75)`}</code>
          </pre>
          <p>
            These numbers use the low end of each memory range, and they're only for the weights.
            A real deployment needs extra room for KV caches, so the true count is often higher.
            A single B300 holding the FP4 weights has about 67.5 GB left for caches, which is a
            workable amount. Note too that FP4 runs well only on hardware that supports it, and
            aggressive quantization must be tested for quality.
          </p>
          <p>
            The takeaway is that memory per GPU changes the shape of your deployment. Fewer GPUs
            per replica means less traffic over interconnects and simpler operations.
          </p>
        </>
      ),
    },
    {
      id: "scale-cost",
      title: "Rack scale and comparing cost",
      body: (
        <>
          <p>
            Blackwell also brought a bigger unit of purchase. <strong>GB200 NVL72</strong> is a
            full rack with 72 Blackwell GPUs and 36 Grace CPUs, all in one NVLink domain. Any GPU
            can talk to any other at NVLink speed, so one large model can span the rack without
            going through a slower network.
          </p>
          <p>
            That needs real facilities. These racks are liquid-cooled and draw well over 100 kW,
            which far exceeds a traditional server rack. Most teams get them through a cloud
            rather than installing their own.
          </p>
          <p>Compare generations on cost per token at your latency target:</p>
          <Formula>relative cost per token = relative hourly price ÷ relative throughput</Formula>
          <p>
            Suppose a B200 rents for 1.6 times an H100 and your benchmark shows it sustains 3
            times the throughput at your target. These numbers are illustrative. Then 1.6 ÷ 3 =
            0.53, so it costs about 47% less per token. If your benchmark instead shows just 1.4
            times the throughput, 1.6 ÷ 1.4 = 1.14, and it costs 14% more. The answer depends
            on your model, your software and your prices.
          </p>
          <Callout tone="tip">
            New hardware needs new software to shine. A tuned stack on Hopper can beat a generic
            stack on Blackwell. Benchmark both using your actual engine version, and check that it
            supports the features you're counting on, such as FP4.
          </Callout>
          <Callout tone="note">
            NVIDIA's next generation after Blackwell is Rubin. The Grace &amp; Vera lesson touches
            on it. Generations arrive quickly, so build your own benchmark that you can re-run on
            anything new.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "H200 is mainly a memory upgrade on Hopper, with the same NVLink speed as H100.",
    "Blackwell adds compute, bandwidth, double the NVLink speed and 4-bit float support.",
    "B300 mainly adds memory per GPU, which can mean fewer GPUs per replica.",
    "Match the upgrade to your bottleneck, and compare on cost per token at your latency target.",
    "Hardware specs vary by system and change often, so always verify them.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A workload is limited by decode and long context on H100. Which simple upgrade targets that directly?",
      options: [
        "H200, for more and faster memory",
        "A faster CPU",
        "More PCIe lanes",
        "A lower power limit",
      ],
      answer: 0,
      explain: "H200 mainly improves memory capacity and bandwidth, which is what this workload needs.",
    },
    {
      kind: "mcq",
      q: "What is true of H200 compared with H100?",
      options: [
        "It has double the NVLink speed",
        "It's a two-die architecture",
        "It has the same NVLink speed and more memory",
        "It supports only FP4",
      ],
      answer: 2,
      explain: "H200 keeps the Hopper design and 900 GB/s NVLink, while upgrading the memory.",
    },
    {
      kind: "text",
      q: "A model has 140 billion parameters. How many GB do its weights take at FP8?",
      format: "***",
      accept: ["140"],
      explain: "FP8 uses 1 byte per parameter, so 140 billion bytes is 140 GB.",
    },
    {
      kind: "text",
      q: "How many 80 GB GPUs are needed to hold 250 GB of weights alone?",
      format: "*",
      accept: ["4"],
      explain: "250 ÷ 80 = 3.125, which rounds up to 4 GPUs.",
    },
    {
      kind: "text",
      q: "A new GPU costs 2 times the hourly price and gives 4 times the throughput. What is its relative cost per token? Give a decimal.",
      format: "***",
      accept: ["0.5", "1/2"],
      explain: "2 ÷ 4 = 0.5, which is half the cost per token.",
    },
  ],
};
