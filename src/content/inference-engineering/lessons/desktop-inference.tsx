import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Say when running a model on a desktop or laptop makes sense",
    "Estimate whether a model fits in memory at a given bit width",
    "Predict decode speed from memory bandwidth",
  ],
  tasks: [
    {
      id: "why",
      title: "Why run models locally",
      body: (
        <>
          <p>
            Not every model needs a data center. Running on a workstation, a gaming PC or a laptop
            is a real option, and for some jobs it's the best one.
          </p>
          <ul>
            <li><strong>Privacy:</strong> prompts and documents never leave the machine.</li>
            <li><strong>Cost:</strong> no per-token fees, and the hardware is often already owned.</li>
            <li><strong>Offline use:</strong> it works without a network.</li>
            <li><strong>Development:</strong> a fast loop for testing prompts and pipelines.</li>
          </ul>
          <p>
            The trade-off is limited memory and bandwidth. A desktop can't serve a thousand users,
            so local inference is about one user, or a handful, getting good responses.
          </p>
        </>
      ),
    },
    {
      id: "fit",
      title: "Will it fit?",
      body: (
        <>
          <p>
            The first question is memory. Weight size is the parameter count times the bytes per
            weight, and bits are what you control through quantization.
          </p>
          <Formula>weight GB ≈ parameters in billions × bits ÷ 8</Formula>
          <Table
            head={["Model", "16-bit", "8-bit", "4-bit"]}
            rows={[
              ["7B", "14 GB", "7 GB", "3.5 GB"],
              ["13B", "26 GB", "13 GB", "6.5 GB"],
              ["70B", "140 GB", "70 GB", "35 GB"],
            ]}
          />
          <p>
            Add headroom for the KV cache, the runtime and your operating system. A practical
            rule is to leave a few extra GB, more for long contexts. A 7B model at 4 bits needs
            roughly 4 to 5 GB in total, which fits comfortably on many laptops.
          </p>
          <p>
            Where that memory lives matters. Machines with a discrete GPU are limited by the GPU's
            own memory. Machines with unified memory, where the CPU and GPU share one pool, can
            use a larger share of system RAM for the model.
          </p>
        </>
      ),
    },
    {
      id: "speed",
      title: "How fast will it be?",
      body: (
        <>
          <p>
            Decoding is memory-bound, so the same bandwidth rule applies here as on a data center
            GPU. Divide bandwidth by the weight bytes.
          </p>
          <pre>
            <code>{`Illustrative laptop: 100 GB/s memory bandwidth
7B model at 4-bit:  3.5 GB
Upper bound:  100 ÷ 3.5  ≈ 28 tokens/s

Same laptop, 13B at 4-bit: 6.5 GB  →  100 ÷ 6.5 ≈ 15 tokens/s`}</code>
          </pre>
          <p>
            Real speed is lower than this ceiling. But it explains why a smaller or more
            quantized model feels faster, and why a machine with higher memory bandwidth feels
            faster even with the same chip speed.
          </p>
          <Callout tone="note">
            Prompt processing (prefill) is compute-bound, so a long prompt can take noticeably
            longer on a laptop than on a data center GPU even when generation speed feels fine.
          </Callout>
        </>
      ),
    },
    {
      id: "tools",
      title: "Common tools",
      body: (
        <>
          <ul>
            <li>
              <strong>llama.cpp</strong> is a C and C++ engine that runs quantized models on CPUs
              and many kinds of GPUs. It uses the <strong>GGUF</strong> file format.
            </li>
            <li>
              <strong>Ollama</strong> wraps llama.cpp-style engines in a simple command line and
              local server, so downloading and running a model takes one command.
            </li>
            <li>
              <strong>MLX</strong> is Apple's array framework built for Apple silicon and its
              unified memory.
            </li>
          </ul>
          <p>
            Many of these expose an OpenAI-compatible HTTP endpoint, so code you wrote against a
            hosted API can often point at <code>localhost</code> with only a URL change.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Local inference suits privacy, cost, offline use and fast development for few users.",
    "Weight size is parameters × bits ÷ 8, with extra room for the KV cache and the system.",
    "Decode speed is bounded by memory bandwidth divided by weight bytes.",
    "Unified memory lets larger models fit than a small discrete GPU would.",
    "llama.cpp, Ollama and MLX are common ways to run models locally.",
  ],
  quiz: [
    {
      kind: "text",
      q: "How many GB are the weights of a 14B model at 4-bit?",
      format: "*",
      accept: ["7"],
      explain: "14 × 4 ÷ 8 = 7 GB.",
    },
    {
      kind: "text",
      q: "A machine has 200 GB/s of bandwidth and a 5 GB model. What's the upper bound in tokens per second?",
      format: "**",
      accept: ["40"],
      explain: "200 ÷ 5 = 40 tokens per second.",
    },
    {
      kind: "mcq",
      q: "What file format does llama.cpp use for quantized models?",
      options: ["GGUF", "CSV", "ONNX only", "PNG"],
      answer: 0,
      explain: "GGUF is the format used by llama.cpp.",
    },
    {
      kind: "mcq",
      q: "Why might a machine with the same chip speed but more memory bandwidth generate text faster?",
      options: [
        "Decoding is limited by memory bandwidth",
        "Bandwidth sets the model's accuracy",
        "It has more disk space",
        "It tokenizes faster",
      ],
      answer: 0,
      explain: "Each token requires reading the weights, so bandwidth sets the ceiling.",
    },
  ],
};
