import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Define the ops:byte ratio and calculate it from a GPU's headline numbers",
    "Explain why the ratio is so large on modern accelerators",
    "Predict how lower precision changes a chip's balance",
  ],
  tasks: [
    {
      id: "two-limits",
      title: "Every chip has two speed limits",
      body: (
        <>
          <p>
            A GPU can only go as fast as its slower resource allows. It has a limit on how many
            math operations it can do per second (<strong>compute</strong>) and a limit on how
            many bytes it can read from memory per second (<strong>bandwidth</strong>). Which one
            you hit depends on the job.
          </p>
          <p>
            Think of a bakery. The ovens set how much baking happens per hour. The delivery door
            sets how much flour arrives per hour. A recipe that needs one scoop of flour per
            loaf will be limited by the ovens. A recipe that needs a truckload of flour per loaf
            will be limited by the door. To know which bakery you have, compare the two rates.
          </p>
        </>
      ),
    },
    {
      id: "ratio",
      title: "The ops:byte ratio",
      body: (
        <>
          <p>
            The <strong>ops:byte ratio</strong> divides a chip's peak compute by its memory
            bandwidth. It tells you how many operations the chip can perform in the time it takes
            to read a single byte.
          </p>
          <Formula>ops:byte = peak FLOP/s ÷ memory bandwidth in bytes/s</Formula>
          <p>
            Here's an illustrative accelerator with 1,000 TFLOP/s of dense 16-bit compute and 3
            TB/s of memory bandwidth:
          </p>
          <pre>
            <code>{`1,000 × 10^12 FLOP/s  ÷  3 × 10^12 B/s  ≈  333 FLOP per byte`}</code>
          </pre>
          <p>
            Read that as: every byte fetched from memory must be used for about 333 operations, or
            the math units will sit idle waiting for data. That's a demanding bar. A lot of useful
            work, including most of LLM decoding, falls well below it.
          </p>
          <Callout tone="note">
            These headline numbers are examples. Real figures depend on the exact chip and
            precision, and vendors publish both dense and sparse peaks, so check you're using the
            dense number for a fair comparison.
          </Callout>
        </>
      ),
    },
    {
      id: "trend",
      title: "Why the ratio keeps rising",
      body: (
        <>
          <p>
            Over several GPU generations, compute has grown faster than memory bandwidth. Math
            units are cheaper to add than memory pins and stacks. So each new chip tends to have a
            higher ratio, which makes it harder for a given workload to keep the chip fully busy.
          </p>
          <p>Lower precision pushes it up too. Halving the bits per number roughly doubles the peak FLOP/s while bandwidth stays the same:</p>
          <Table
            head={["Format", "Illustrative peak", "Bandwidth", "Ops:byte"]}
            rows={[
              ["16-bit float", "1,000 TFLOP/s", "3 TB/s", "About 333"],
              ["8-bit float", "2,000 TFLOP/s", "3 TB/s", "About 667"],
              ["4-bit float", "4,000 TFLOP/s", "3 TB/s", "About 1,333"],
            ]}
          />
          <p>
            Smaller formats also shrink the bytes you move, so the practical picture is more
            nuanced. But the lesson holds: faster math makes bandwidth the thing you worry about.
          </p>
        </>
      ),
    },
    {
      id: "use",
      title: "How you use the number",
      body: (
        <>
          <p>The ratio is a yardstick. You compare it with your workload's own ratio, which the next lesson calls arithmetic intensity.</p>
          <ul>
            <li>If your workload does <strong>more</strong> operations per byte than the chip's ratio, it is compute-bound.</li>
            <li>If it does <strong>fewer</strong>, it is memory-bound, and buying more compute won't help.</li>
          </ul>
          <p>
            This is why two GPUs with similar FLOP/s can behave very differently on decode.
            Memory bandwidth decides the winner when a job is memory-bound.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A chip has a compute limit and a bandwidth limit, and the workload decides which one binds.",
    "Ops:byte equals peak FLOP/s divided by bytes per second.",
    "Modern accelerators have large ratios, so many workloads can't keep them busy.",
    "Lower precision raises peak FLOP/s, and so raises the ratio.",
    "Compare the chip's ratio with a workload's arithmetic intensity to find the bottleneck.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A chip has 600 TFLOP/s of compute and 2 TB/s of memory bandwidth. What is its ops:byte ratio?",
      format: "***",
      accept: ["300"],
      explain: "600 ÷ 2 = 300 FLOP per byte.",
    },
    {
      kind: "mcq",
      q: "Switching from 16-bit to 8-bit math doubles peak FLOP/s with bandwidth unchanged. What happens to the ratio?",
      options: ["It halves", "It doubles", "It stays the same", "It becomes zero"],
      answer: 1,
      explain: "Compute doubles and bandwidth is constant, so the ratio doubles.",
    },
    {
      kind: "mcq",
      q: "A job does fewer operations per byte than the chip's ops:byte ratio. What limits it?",
      options: ["Compute", "Memory bandwidth", "The compiler", "Disk space"],
      answer: 1,
      explain: "It can't feed the math units fast enough, so it is memory-bound.",
    },
    {
      kind: "text",
      q: "A chip has 400 TFLOP/s and 4 TB/s of bandwidth. What is the ratio?",
      format: "***",
      accept: ["100"],
      explain: "400 ÷ 4 = 100.",
    },
  ],
};
