import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Turn off the training machinery that slows down inference",
    "Choose a numeric precision and estimate the memory it needs",
    "Decide when torch.compile pays for itself",
    "Read PyTorch's memory numbers and diagnose fragmentation",
  ],
  tasks: [
    {
      id: "training-defaults",
      title: "Training defaults cost you at serve time",
      body: (
        <>
          <p>
            PyTorch is built for research and training, so its defaults favor flexibility. Every
            operation can be recorded so gradients can flow backward later. At serving time you
            never call backward, so that bookkeeping is pure waste in both time and memory.
          </p>
          <p>
            Think of a race car in the workshop, covered in sensors and laptops. All of that gear
            is useful while you tune the car. On race day you take it off.
          </p>
          <p>Two lines remove most of it:</p>
          <pre>
            <code>{`model = MyModel().to("cuda").eval()

with torch.inference_mode():
    logits = model(input_ids)`}</code>
          </pre>
          <p>
            <code>eval()</code> changes how layers behave: dropout stops dropping values, and batch
            normalization uses its stored statistics. Skip it and you can get wrong or random
            output, not just slow output. Note that it doesn't turn gradients off.
          </p>
          <p>
            <code>torch.inference_mode()</code> turns gradients off. It's a stricter version of{" "}
            <code>torch.no_grad()</code>: it also skips some internal tracking, so it's slightly
            cheaper. The catch is that tensors created inside it can't later join a gradient
            computation. For a server, that's fine.
          </p>
          <Callout tone="note">
            Hugging Face's <code>from_pretrained</code> returns a model in eval mode already. A
            model you build by hand and load with <code>load_state_dict</code> does not, so call{" "}
            <code>eval()</code> yourself.
          </Callout>
        </>
      ),
    },
    {
      id: "precision",
      title: "Pick a precision",
      body: (
        <>
          <p>
            Precision is how many bytes each number takes. Fewer bytes means less memory and more
            speed. It also means less range or less accuracy.
          </p>
          <Table
            head={["Type", "Bytes", "Range and detail", "Typical use"]}
            rows={[
              ["float32", "4", "Wide range, high detail", "Baseline, some CPU work"],
              ["float16", "2", "Narrow range, largest value about 65,504", "Models known to be stable in it"],
              ["bfloat16", "2", "Same range as float32, less detail", "Safe default for many LLMs"],
            ]}
          />
          <p>
            bfloat16 keeps float32's 8 exponent bits, so very large values stay representable, and
            gives up detail instead. float16 keeps more detail but has only 5 exponent bits. Values
            can overflow to infinity and spread as NaN (not a number) through the model.
          </p>
          <Formula>weight bytes = parameters × bytes per parameter</Formula>
          <p>Take a model with 7 billion parameters:</p>
          <pre>
            <code>{`float32:  7,000,000,000 × 4 = 28 GB
bfloat16: 7,000,000,000 × 2 = 14 GB`}</code>
          </pre>
          <p>
            The 14 GB you save is room for KV caches, which means more concurrent requests. Load
            weights in the target type directly rather than loading float32 and converting:
          </p>
          <pre>
            <code>{`import torch
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    dtype=torch.bfloat16,  # older versions call this torch_dtype
    device_map="auto",
)`}</code>
          </pre>
          <p>
            Formats below 16 bits belong to quantization, which has its own module. Whatever you
            pick, test output quality on your own evals, because a model card's preferred type is a
            starting point and not a guarantee for your workload.
          </p>
        </>
      ),
    },
    {
      id: "compile",
      title: "torch.compile: when it pays",
      body: (
        <>
          <p>
            Normally PyTorch runs eagerly: Python dispatches one operation at a time. That leaves
            time on the table, because no operation knows what comes next.{" "}
            <code>torch.compile</code> captures your model's operations as a graph, then generates
            optimized code for it, fusing small operations together.
          </p>
          <pre>
            <code>{`model = torch.compile(model)`}</code>
          </pre>
          <p>
            That line looks free, but it isn't. The real compile happens on the first call, and a
            later change can trigger it again. The compiled code is protected by guards, which are
            checks on things such as input shapes and Python values. If a guard fails, PyTorch may
            recompile. LLM inputs change shape constantly, so this matters. Setting the environment
            variable <code>TORCH_LOGS=recompiles</code> shows when it happens and why.
          </p>
          <p>Is it worth it? Do the break-even sum. With illustrative figures:</p>
          <pre>
            <code>{`Compile cost:    40 s
Step time:       50 ms before, 45 ms after
Saving:          5 ms per step
Break-even:      40,000 ms ÷ 5 ms = 8,000 steps
Time to reach:   8,000 × 45 ms = 360 s = 6 busy minutes`}</code>
          </pre>
          <p>
            A long-lived server earns that back quickly. A replica that scales up for a short burst
            might not. Measure on your own model, since the gain varies a lot.
          </p>
          <Callout tone="tip">
            Warm up before you take traffic. Send requests with representative shapes during
            startup, so real users don't pay for compilation in their time to first token.
          </Callout>
          <p>
            A related quick win is attention. PyTorch's{" "}
            <code>scaled_dot_product_attention</code> function routes to fast kernels where it can,
            so make sure your model uses it rather than a hand-written matrix version.
          </p>
        </>
      ),
    },
    {
      id: "memory",
      title: "Reading GPU memory",
      body: (
        <>
          <p>
            PyTorch doesn't return freed memory to the GPU driver straight away. It keeps a cache
            so the next allocation is fast. So there are two numbers:
          </p>
          <ul>
            <li>
              <strong>Allocated:</strong> memory held by live tensors.
            </li>
            <li>
              <strong>Reserved:</strong> memory PyTorch holds from the driver, including its cache.
            </li>
          </ul>
          <pre>
            <code>{`GIB = 2**30
print(torch.cuda.memory_allocated() / GIB)      # live tensors
print(torch.cuda.memory_reserved() / GIB)       # held from the driver
print(torch.cuda.max_memory_allocated() / GIB)  # peak so far`}</code>
          </pre>
          <p>
            Now a puzzle. An 80 GiB GPU shows 60 GiB allocated and 75 GiB reserved. That leaves 5
            GiB with the driver and 15 GiB in PyTorch's cache, so 20 GiB is free. Yet a 12 GiB
            allocation fails with an out-of-memory error.
          </p>
          <p>
            The cause is usually <strong>fragmentation</strong>. The free memory exists, but in
            pieces too small for one request. It's like a car park with plenty of single gaps and
            no room for a bus. Variable-length requests cause exactly this pattern.
          </p>
          <pre>
            <code>{`PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True python server.py`}</code>
          </pre>
          <p>
            This setting tells the allocator to grow its segments rather than create fixed ones,
            which often reduces fragmentation.
          </p>
          <Callout tone="warn">
            <code>torch.cuda.empty_cache()</code> doesn't free live tensors. It only returns unused
            cache to the driver, and the next allocation has to ask for it back. Calling it after
            every request slows you down and usually hides the real problem.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Use eval() for correct layer behavior and inference_mode() to drop gradient tracking.",
    "bfloat16 halves memory against float32 and keeps its range, unlike float16.",
    "torch.compile has an upfront cost, so work out the break-even and warm up before traffic.",
    "Reserved memory includes PyTorch's cache, while allocated memory is only live tensors.",
    "Out-of-memory errors with free memory showing usually mean fragmentation.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does model.eval() do?",
      options: [
        "Disables gradient tracking",
        "Switches layers such as dropout to their inference behavior",
        "Compiles the model",
        "Moves the model to the GPU",
      ],
      answer: 1,
      explain: "eval() changes layer behavior. Turning gradients off is the job of inference_mode().",
    },
    {
      kind: "mcq",
      q: "Why is bfloat16 often safer than float16 for LLM inference?",
      options: [
        "It uses fewer bytes",
        "It has the same exponent range as float32, so overflow is less likely",
        "It has more mantissa bits than float16",
        "It doesn't need a GPU",
      ],
      answer: 1,
      explain: "bfloat16 has 8 exponent bits against float16's 5. Both take 2 bytes, and float16 has more detail.",
    },
    {
      kind: "text",
      q: "A model has 13 billion parameters stored in bfloat16. How many GB do the weights take?",
      format: "**",
      accept: ["26", "26gb", "26 gb"],
      explain: "13,000,000,000 × 2 bytes = 26 GB.",
    },
    {
      kind: "text",
      q: "Compiling costs 30 s and saves 6 ms per step. How many steps until it breaks even?",
      format: "*****",
      accept: ["5000", "5,000"],
      explain: "30,000 ms ÷ 6 ms = 5,000 steps.",
    },
  ],
};
