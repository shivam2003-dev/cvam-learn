import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Hard",
  objectives: [
    "Break a slow request into a time budget, layer by layer",
    "Estimate the gain from a fix before you build it",
    "Pick the right profiler for each layer",
    "Explain why GPU utilization alone can mislead you",
  ],
  tasks: [
    {
      id: "budget",
      title: "Start with a time budget",
      body: (
        <>
          <p>
            A benchmark tells you a system is slow. It doesn't tell you why. Without that answer,
            teams guess, and they tend to guess the part they know best. They might spend a month
            speeding up attention while requests sit in a queue.
          </p>
          <p>
            Profiling is like a doctor's examination. Start with broad checks, then order the
            specific scan. Don't begin with surgery.
          </p>
          <p>
            So first split the latency you're trying to fix into stages. Here's an illustrative
            time to first token of 900 ms:
          </p>
          <Table
            head={["Stage", "Time", "Share"]}
            rows={[
              ["Client to gateway network", "40 ms", "4.4%"],
              ["Gateway and auth", "30 ms", "3.3%"],
              ["Queue in the engine", "450 ms", "50%"],
              ["Tokenization", "10 ms", "1.1%"],
              ["Prefill on GPU", "350 ms", "38.9%"],
              ["First token out", "20 ms", "2.2%"],
            ]}
          />
          <p>
            These rows add up to 900 ms. Half of it is queueing, which isn't model speed at all.
            Now estimate each fix before you build it, using <strong>Amdahl's law</strong>: speeding
            up one part only helps by that part's share of the total.
          </p>
          <Formula>new time = old time × (1 − share + share ÷ speedup)</Formula>
          <pre>
            <code>{`Make prefill twice as fast:
  900 × (1 − 0.389 + 0.389 ÷ 2) ≈ 725 ms    (saves 175 ms)

Remove queueing by adding capacity:
  900 − 450 = 450 ms                        (saves 450 ms)

Make tokenization ten times faster:
  saves 9 ms                                (not worth doing)`}</code>
          </pre>
          <p>
            A month of kernel tuning that doubles prefill speed saves less than half of what
            fixing the queue would.
          </p>
        </>
      ),
    },
    {
      id: "gpu-signals",
      title: "Reading GPU signals",
      body: (
        <>
          <p>
            <code>nvidia-smi</code> is the first stop. Its GPU utilization number has a well-known
            trap: it means a kernel was running at some point during the sample window, not that
            the GPU was working hard. A single small kernel running constantly can show 100%.
          </p>
          <pre>
            <code>{`# Sample key numbers once per second
nvidia-smi --query-gpu=utilization.gpu,memory.used,power.draw,clocks.sm \\
  --format=csv -l 1

# Why are clocks limited? Look for thermal or power reasons
nvidia-smi -q -d PERFORMANCE`}</code>
          </pre>
          <p>
            For a truer view, NVIDIA's DCGM (Data Center GPU Manager) reports what the hardware
            units are doing:
          </p>
          <pre>
            <code>{`# Graphics engine, SM, tensor and DRAM activity, every 1,000 ms
dcgmi dmon -e 1001,1002,1004,1005 -d 1000`}</code>
          </pre>
          <p>Use these symptoms to decide where to look next:</p>
          <Table
            head={["What you see", "Likely cause", "Next step"]}
            rows={[
              ["Low GPU use with a long queue", "CPU bottleneck or a low batch limit", "Profile the Python process"],
              ["High DRAM activity, low tensor activity", "Limited by memory bandwidth", "Roofline analysis, smaller cache reads"],
              ["High tensor activity, high latency", "GPU is saturated with real work", "Tune kernels or add capacity"],
              ["Latency spikes as cache fills", "Preemption", "Reduce concurrency or length limits"],
              ["Speed sags as the GPU heats up", "Thermal or power throttling", "Check clocks and cooling"],
            ]}
          />
        </>
      ),
    },
    {
      id: "cpu-and-torch",
      title: "Profiling Python and PyTorch",
      body: (
        <>
          <p>
            A lot of inference latency is CPU work: tokenizing, scheduling, detokenizing and
            serializing. Python's global interpreter lock (GIL) allows only one thread to run
            Python code at a time, so one busy loop can throttle an expensive GPU.{" "}
            <strong>py-spy</strong> attaches to a running process with no code changes, which makes
            it fairly safe to use on a live server:
          </p>
          <pre>
            <code>{`py-spy top --pid 1234                     # live view
py-spy record -o flame.svg --pid 1234     # flame graph
py-spy dump --pid 1234                    # one snapshot of all threads`}</code>
          </pre>
          <p>
            A <strong>flame graph</strong> shows call stacks, where wider bars mean more time.
            Look for the widest bars, not the tallest.
          </p>
          <p>For operations inside the model, use the PyTorch profiler:</p>
          <pre>
            <code>{`import torch
from torch.profiler import ProfilerActivity, profile, record_function

with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    record_shapes=True,
    profile_memory=True,
) as prof:
    with torch.inference_mode(), record_function("decode_step"):
        model(input_ids)

print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))
prof.export_chrome_trace("trace.json")`}</code>
          </pre>
          <Callout tone="warn" title="The timing trap">
            GPU work is asynchronous. A Python call returns once the work is queued, not once it's
            done. If you time around it, you can measure almost nothing. Call{" "}
            <code>torch.cuda.synchronize()</code> before reading the clock, and only in test code,
            because it stalls the pipeline.
          </Callout>
          <pre>
            <code>{`torch.cuda.synchronize()
start = time.perf_counter()
model(input_ids)
torch.cuda.synchronize()
print((time.perf_counter() - start) * 1000, "ms")`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "system-traces",
      title: "System traces and overhead",
      body: (
        <>
          <p>
            Sometimes you need to see CPU and GPU together on one timeline. Is the GPU idle between
            steps while the CPU prepares work? <strong>NVIDIA Nsight Systems</strong> records that
            timeline. NVTX markers label your own code on it.
          </p>
          <pre>
            <code>{`# Inside the code you're measuring
torch.cuda.nvtx.range_push("decode_step")
model(input_ids)
torch.cuda.nvtx.range_pop()`}</code>
          </pre>
          <pre>
            <code>{`nsys profile -t cuda,nvtx -o report python bench.py`}</code>
          </pre>
          <p>
            Open the report and look for gaps. A step of 20 ms of GPU work inside 25 ms of wall time
            means 20% of your GPU time is idle (5 ÷ 25), and the fix belongs in the CPU path. For a
            deeper look at one kernel, <strong>Nsight Compute</strong> analyzes it in detail. Most
            serving teams rarely need to go that far.
          </p>
          <Table
            head={["Question", "Tool", "Overhead"]}
            rows={[
              ["Is the GPU doing real work?", "DCGM, nvidia-smi", "Very low"],
              ["Where is Python spending time?", "py-spy", "Low"],
              ["Which model operations are slow?", "PyTorch profiler", "Medium to high"],
              ["Where are the CPU and GPU gaps?", "Nsight Systems", "Medium"],
              ["Why is one kernel slow?", "Nsight Compute", "High"],
            ]}
          />
          <Callout tone="tip">
            Profilers change the thing they measure. Trust them for where time goes, and use a
            benchmark without the profiler to confirm the final gain. Change one thing at a time,
            and rerun the same load after each fix.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Split latency into stages before optimizing anything.",
    "Amdahl's law tells you the most a fix can gain, so do the sum first.",
    "GPU utilization shows activity, not useful work, so use DCGM activity metrics too.",
    "Choose tools by layer: py-spy for Python, PyTorch profiler for operations, Nsight for timelines.",
    "GPU calls are asynchronous, so synchronize before timing them.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why can nvidia-smi's 100% utilization mislead you?",
      options: [
        "It's always measured in the wrong units",
        "It means a kernel was running during the sample, not that the GPU was fully used",
        "It only reports CPU use",
        "It measures network traffic",
      ],
      answer: 1,
      explain: "Even one small kernel running through the sample period can read as 100%.",
    },
    {
      kind: "mcq",
      q: "You time a model call and get 0.2 ms, which seems impossibly fast. What's the likely cause?",
      options: [
        "The GPU is very fast",
        "The work was queued asynchronously and you didn't synchronize",
        "The model has no weights",
        "Python optimized the model away",
      ],
      answer: 1,
      explain: "The call returned before the GPU finished. Use torch.cuda.synchronize() around the timing.",
    },
    {
      kind: "text",
      q: "A request takes 1,000 ms, and 200 ms of that is decode kernels. If those kernels become infinitely fast, what's the new total in ms?",
      format: "***",
      accept: ["800", "800ms", "800 ms"],
      explain: "Only the 200 ms can vanish, so 1,000 − 200 = 800 ms.",
    },
    {
      kind: "text",
      q: "A step has 30 ms of GPU work in 40 ms of wall time. What percentage of the time is the GPU idle?",
      format: "**",
      accept: ["25", "25%"],
      explain: "Idle time is 10 ms, and 10 ÷ 40 = 25%.",
    },
  ],
};
