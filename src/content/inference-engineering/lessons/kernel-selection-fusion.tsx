import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain what a GPU kernel is and why launching many small ones is costly",
    "Calculate the memory traffic saved by fusing operations",
    "Use compiler and library features to get fused kernels without writing them",
  ],
  tasks: [
    {
      id: "kernels",
      title: "What a kernel is",
      body: (
        <>
          <p>
            A <strong>kernel</strong> is a function that runs on the GPU. When your framework
            executes a model, it turns each operation into one or more kernel launches: a matrix
            multiply, an add, an activation, a normalization.
          </p>
          <p>
            For matrix multiplies, the framework usually calls hand-tuned library kernels such as
            those in cuBLAS. The key skill is <strong>kernel selection</strong>: which
            implementation runs for a given shape, precision and GPU. The wrong choice can leave
            large performance on the table.
          </p>
        </>
      ),
    },
    {
      id: "overhead",
      title: "Two hidden costs",
      body: (
        <>
          <p>Small operations are cheap in math but expensive in other ways.</p>
          <ul>
            <li>
              <strong>Memory traffic.</strong> Each kernel reads its inputs from GPU memory and
              writes its output back. A chain of simple operations moves the same data in and out
              again and again.
            </li>
            <li>
              <strong>Launch overhead.</strong> Starting a kernel costs a small, fixed amount of
              time from the CPU side. With many tiny kernels, the GPU can end up waiting on the
              CPU.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "fusion",
      title: "Fusion: do it in one trip",
      body: (
        <>
          <p>
            <strong>Kernel fusion</strong> combines several operations into one kernel. The data is
            read once, all the steps run while it sits in fast on-chip memory, and the final result
            is written once.
          </p>
          <p>
            Take a 4,096 × 4,096 tensor in 16-bit. That's 16,777,216 values × 2 bytes, or 32 MiB.
            Apply three element-wise steps: add bias, GELU, dropout.
          </p>
          <pre>
            <code>{`Unfused:  3 kernels × (read 32 MiB + write 32 MiB) = 192 MiB moved
Fused:    1 kernel  ×  (read 32 MiB + write 32 MiB) =  64 MiB moved

3× less traffic. At 3 TB/s: about 67 µs unfused vs about 22 µs fused.`}</code>
          </pre>
          <p>
            Element-wise operations have very low arithmetic intensity, so they're memory-bound.
            That makes cutting their memory traffic the entire game.
          </p>
          <Table
            head={["Common fusion", "What it removes"]}
            rows={[
              ["Bias + activation after a matmul", "A full read and write of the output"],
              ["Normalization with residual add", "Extra passes over the hidden states"],
              ["Attention steps (FlashAttention)", "Writing the large score matrix to memory"],
            ]}
          />
        </>
      ),
    },
    {
      id: "tools",
      title: "Getting fusion without writing kernels",
      body: (
        <>
          <p>You usually don't write fused kernels by hand. Your tools do it:</p>
          <pre>
            <code>{`import torch

model = MyModel().cuda().eval()
compiled = torch.compile(model)   # traces the model and fuses compatible ops

with torch.no_grad():
    out = compiled(x)             # first call compiles, later calls are fast`}</code>
          </pre>
          <ul>
            <li>
              <strong>Compilers</strong> such as <code>torch.compile</code> and TensorRT fuse
              operations automatically.
            </li>
            <li>
              <strong>CUDA graphs</strong> record a whole sequence of kernel launches and replay it
              with one launch, which removes most CPU-side overhead for decode loops.
            </li>
            <li>
              <strong>Inference engines</strong> ship pre-fused kernels for the hottest paths, such
              as attention.
            </li>
          </ul>
          <Callout tone="warn">
            Compiled code has a warm-up cost on the first call, and changing input shapes can
            trigger recompiles. Test with realistic shapes, and include warm-up in your startup
            time.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A kernel is a GPU function, and each model operation becomes one or more kernels.",
    "Library kernels are tuned for specific shapes and precisions, so selection matters.",
    "Many small kernels cost memory traffic and launch overhead.",
    "Fusion does several steps in one memory round trip, cutting traffic.",
    "Compilers, CUDA graphs and engine kernels give you fusion without hand-writing.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Three unfused element-wise kernels each read and write 32 MiB. How many MiB move in total?",
      format: "***",
      accept: ["192"],
      explain: "3 × (32 + 32) = 192 MiB.",
    },
    {
      kind: "mcq",
      q: "Why does fusing element-wise operations help so much?",
      options: [
        "It reduces the number of FLOPs",
        "They're memory-bound, so fewer round trips to memory saves time",
        "It makes the model more accurate",
        "It removes the need for a GPU",
      ],
      answer: 1,
      explain: "Element-wise ops have very low intensity, so memory traffic is the cost.",
    },
    {
      kind: "mcq",
      q: "What does a CUDA graph mainly reduce?",
      options: [
        "Model size",
        "CPU-side kernel launch overhead",
        "Training time",
        "Memory bandwidth",
      ],
      answer: 1,
      explain: "It replays a recorded sequence of launches with a single launch.",
    },
    {
      kind: "text",
      q: "What PyTorch function compiles a model and fuses operations? Give its full call name.",
      format: "************",
      accept: ["torch.compile"],
      explain: "torch.compile traces the model and generates fused kernels.",
    },
  ],
};
