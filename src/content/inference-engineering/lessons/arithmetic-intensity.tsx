import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Calculate arithmetic intensity for simple operations",
    "Show why a matrix-vector product is memory-bound and a large matrix product is not",
    "Connect batch size to arithmetic intensity in LLM decoding",
  ],
  tasks: [
    {
      id: "definition",
      title: "Operations per byte, for the workload",
      body: (
        <>
          <p>
            The ops:byte ratio describes a chip. <strong>Arithmetic intensity</strong> describes a
            workload: how many operations it performs for each byte it moves to or from memory.
          </p>
          <Formula>arithmetic intensity = FLOPs performed ÷ bytes moved</Formula>
          <p>
            An operation that touches a lot of data but does little with it has low intensity. An
            operation that reuses each byte many times has high intensity. That reuse is the whole
            story.
          </p>
        </>
      ),
    },
    {
      id: "matvec",
      title: "Example: matrix times vector",
      body: (
        <>
          <p>
            Multiply an n × n matrix by a vector, with 16-bit numbers (2 bytes each). Every matrix
            entry is used exactly once.
          </p>
          <pre>
            <code>{`FLOPs  = 2 × n²          (one multiply and one add per entry)
Bytes  ≈ 2 × n²          (reading the matrix dominates)
Intensity ≈ 1 FLOP per byte`}</code>
          </pre>
          <p>
            One FLOP per byte is tiny next to a chip ratio of a few hundred. A matrix-vector
            product is deeply memory-bound, no matter the size.
          </p>
        </>
      ),
    },
    {
      id: "matmul",
      title: "Example: matrix times matrix",
      body: (
        <>
          <p>
            Now multiply two n × n matrices. Each entry gets reused n times, which changes
            everything.
          </p>
          <pre>
            <code>{`FLOPs  = 2 × n³
Bytes  = 3 matrices × n² entries × 2 bytes = 6 × n²
Intensity = 2n³ ÷ 6n² = n ÷ 3

n = 4,096  →  about 1,365 FLOP per byte`}</code>
          </pre>
          <p>
            That's above the illustrative chip ratio of 333, so a large matrix multiply is
            compute-bound. Intensity grows with size, so big matrices can keep a chip busy.
          </p>
          <Table
            head={["Operation", "Intensity", "Usually"]}
            rows={[
              ["Matrix × vector", "About 1", "Memory-bound"],
              ["Matrix × matrix, n = 4,096", "About 1,365", "Compute-bound"],
              ["Element-wise add or GELU", "About 1 or less", "Memory-bound"],
            ]}
          />
        </>
      ),
    },
    {
      id: "batching",
      title: "Batching raises intensity",
      body: (
        <>
          <p>
            This is the most useful idea in the lesson. During decoding, each request multiplies a
            weight matrix by one token's vector. Run B requests together and the same weights
            multiply a B-column batch.
          </p>
          <pre>
            <code>{`Weights: d × d at 2 bytes  →  about 2d² bytes (read once for the whole batch)
FLOPs for a batch of B tokens  =  2 × B × d²
Intensity ≈ B FLOP per byte`}</code>
          </pre>
          <p>
            So intensity is roughly the batch size. A batch of 64 gives about 64 FLOP per byte,
            still below a 333 ratio, so still memory-bound. You'd need a batch in the hundreds to
            become compute-bound, if memory for the KV caches allowed it.
          </p>
          <Callout tone="tip">
            This is why batching is one of the biggest levers in LLM serving. The weight read is
            paid once, and the weight-related work for each extra request is nearly free until
            intensity reaches the chip's ratio. Each request still reads its own KV cache.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Arithmetic intensity is FLOPs divided by bytes moved, for a workload.",
    "A matrix-vector product has an intensity near 1 and is memory-bound.",
    "A large matrix-matrix product has an intensity near n ÷ 3 and can be compute-bound.",
    "In decoding, intensity is roughly equal to the batch size.",
    "Batching reuses each weight byte, which is how serving raises efficiency.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Square matrix multiply has intensity of about n ÷ 3 in 16-bit. What is it for n = 3,072?",
      format: "****",
      accept: ["1024", "1,024"],
      explain: "3,072 ÷ 3 = 1,024 FLOP per byte.",
    },
    {
      kind: "mcq",
      q: "Why is a matrix-vector product memory-bound?",
      options: [
        "It uses too many FLOPs",
        "Each matrix entry is read once and used for only one multiply-add",
        "Vectors are stored on disk",
        "It can't run on a GPU",
      ],
      answer: 1,
      explain: "With no reuse, intensity is about 1 FLOP per byte.",
    },
    {
      kind: "mcq",
      q: "During decoding, doubling the batch size does what to arithmetic intensity?",
      options: ["Halves it", "Roughly doubles it", "Leaves it alone", "Sets it to zero"],
      answer: 1,
      explain: "Weights are read once per step, so FLOPs per byte rise with the batch.",
    },
    {
      kind: "mcq",
      q: "A chip's ratio is 300. A decode batch has intensity about 48. What binds it?",
      options: ["Compute", "Memory bandwidth", "The network", "Neither"],
      answer: 1,
      explain: "48 is below 300, so it can't saturate the compute units.",
    },
  ],
};
