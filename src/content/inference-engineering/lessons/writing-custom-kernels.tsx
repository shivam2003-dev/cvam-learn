import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Decide when a custom kernel is worth the effort",
    "Describe the thread, block and grid structure of a GPU launch",
    "Read and write a small kernel in Triton",
  ],
  tasks: [
    {
      id: "when",
      title: "When to drop down",
      body: (
        <>
          <p>
            Writing a kernel is expensive. It's slower to develop, harder to debug and easy to get
            wrong. Reach for it only when higher-level tools have run out of road.
          </p>
          <Table
            head={["Try first", "Write a kernel when"]}
            rows={[
              ["torch.compile and fused library ops", "A hot operation isn't fused by any tool you have"],
              ["An engine's built-in kernels", "Your model has a custom layer or new attention variant"],
              ["Quantization or a better format", "Profiling shows one kernel dominates, and it runs far below its roofline"],
            ]}
          />
          <p>
            The rule: profile first, find the one operation that matters, then check how far it
            is from the roofline. If it's already near the limit, a custom kernel won't help.
          </p>
        </>
      ),
    },
    {
      id: "model",
      title: "How a GPU launch is organized",
      body: (
        <>
          <p>A kernel launch creates a hierarchy of parallel workers:</p>
          <ul>
            <li><strong>Thread:</strong> the smallest unit, running your kernel code once.</li>
            <li><strong>Block:</strong> a group of threads that can share fast on-chip memory and synchronize.</li>
            <li><strong>Grid:</strong> all the blocks of one launch, spread across the GPU's multiprocessors.</li>
          </ul>
          <p>
            You choose the block size and how many blocks to launch. Each thread works out which
            piece of data is its own from its position. For n elements and 256 threads per block,
            you need <code>ceil(n ÷ 256)</code> blocks. For 1,000,000 elements, that's 3,907
            blocks, with a few threads in the last block doing nothing.
          </p>
        </>
      ),
    },
    {
      id: "triton",
      title: "A first kernel in Triton",
      body: (
        <>
          <p>
            Triton is a Python-based language for writing GPU kernels. You think in blocks of data
            rather than individual threads, and the compiler handles much of the low-level work.
            Here's an element-wise add:
          </p>
          <pre>
            <code>{`import torch
import triton
import triton.language as tl

@triton.jit
def add_kernel(x_ptr, y_ptr, out_ptr, n, BLOCK: tl.constexpr):
    pid = tl.program_id(0)                    # which block am I?
    offs = pid * BLOCK + tl.arange(0, BLOCK)  # the elements I own
    mask = offs < n                           # guard the ragged end
    x = tl.load(x_ptr + offs, mask=mask)
    y = tl.load(y_ptr + offs, mask=mask)
    tl.store(out_ptr + offs, x + y, mask=mask)

def add(x, y):
    out = torch.empty_like(x)
    n = x.numel()
    grid = (triton.cdiv(n, 1024),)            # number of blocks
    add_kernel[grid](x, y, out, n, BLOCK=1024)
    return out`}</code>
          </pre>
          <p>
            Each program handles 1,024 elements. The mask keeps the final, partial block from
            reading or writing past the end of the array. Fusing more work, such as an activation,
            just means adding lines before the store.
          </p>
        </>
      ),
    },
    {
      id: "checklist",
      title: "A safe workflow",
      body: (
        <>
          <ol>
            <li><strong>Write a reference</strong> in plain PyTorch. This is your source of truth.</li>
            <li><strong>Test for correctness</strong> against it on many shapes, including awkward sizes and edge values.</li>
            <li><strong>Benchmark</strong> with warm-up runs, and synchronize the GPU before reading timers.</li>
            <li><strong>Compare to the roofline</strong> to know how much headroom is left.</li>
            <li><strong>Re-check on each new GPU</strong> and driver, since tuning often doesn't carry over.</li>
          </ol>
          <Callout tone="warn">
            GPU calls are asynchronous. If you time a kernel without synchronizing, you measure
            only the launch, and the numbers look unrealistically fast.
          </Callout>
          <p>
            For maximum control, CUDA C++ lets you manage threads, shared memory and tensor cores
            directly. It's the most powerful option and the most work, so most teams reach for
            Triton or an existing library first.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Write a custom kernel only after profiling shows a hot, unfused operation far from its roofline.",
    "A launch is a grid of blocks, each made of threads, and blocks can share on-chip memory.",
    "Blocks needed equals the ceiling of elements divided by block size.",
    "Triton lets you write kernels in Python by thinking in blocks of data.",
    "Always test against a reference and synchronize before timing.",
  ],
  quiz: [
    {
      kind: "text",
      q: "You process 10,000 elements with blocks of 1,000. How many blocks do you need?",
      format: "**",
      accept: ["10"],
      explain: "10,000 ÷ 1,000 = 10 blocks.",
    },
    {
      kind: "mcq",
      q: "Why does the Triton example use a mask?",
      options: [
        "To encrypt the data",
        "To stop the last partial block from accessing memory out of bounds",
        "To make the kernel run on CPU",
        "To speed up compilation",
      ],
      answer: 1,
      explain: "The last block may extend past the array's end, so out-of-range lanes are masked off.",
    },
    {
      kind: "mcq",
      q: "You time a GPU kernel without synchronizing and get a tiny number. What's likely wrong?",
      options: [
        "The kernel is perfect",
        "You timed only the asynchronous launch, not the work",
        "The GPU is broken",
        "Python is too slow",
      ],
      answer: 1,
      explain: "GPU launches return immediately, so you must synchronize before reading the timer.",
    },
    {
      kind: "text",
      q: "How many blocks of 256 threads do you need to cover 1,000,000 elements?",
      format: "****",
      accept: ["3907", "3,907"],
      explain: "ceil(1,000,000 ÷ 256) = ceil(3,906.25) = 3,907.",
    },
  ],
};
