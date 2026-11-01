import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain how TensorRT-LLM differs from standard TensorRT",
    "Describe where the engine finds extra speed on NVIDIA GPUs",
    "Calculate the effect of removing GPU idle time between steps",
    "Decide when the switching cost is worth paying",
  ],
  tasks: [
    {
      id: "what-it-is",
      title: "A specialist engine for NVIDIA GPUs",
      body: (
        <>
          <p>
            General engines have to run on many setups, so they can't tune every path for one chip.
            If you're spending heavily on NVIDIA GPUs, the gap between general code and tuned code
            turns into real money.
          </p>
          <p>
            <strong>TensorRT-LLM</strong> is NVIDIA's open-source library for that gap. Think of
            vLLM as a well-made all-terrain vehicle and TensorRT-LLM as a track car. The track car
            is faster where it fits, and much more particular about where it runs.
          </p>
          <p>
            Despite the name, it isn't plain TensorRT with an LLM mode. Standard TensorRT suits a
            fixed graph, while LLM decoding changes shape all the time. TensorRT-LLM adds what LLMs
            need: scheduling, KV cache management and tuned attention kernels.
          </p>
          <Callout tone="note" title="Two generations of docs">
            Older guides describe converting a checkpoint and building a compiled engine ahead of
            time. Current versions are built around PyTorch, with a Python API that loads a model
            directly. If a tutorial starts with an engine build step, check its date.
          </Callout>
          <p>The Python API will look familiar if you've used vLLM:</p>
          <pre>
            <code>{`from tensorrt_llm import LLM, SamplingParams

llm = LLM(model="TinyLlama/TinyLlama-1.1B-Chat-v1.0")
params = SamplingParams(max_tokens=64, temperature=0.8)

for output in llm.generate(["The KV cache stores"], params):
    print(output.outputs[0].text)`}</code>
          </pre>
          <p>For a network service, its server has an OpenAI-compatible API:</p>
          <pre>
            <code>{`trtllm-serve TinyLlama/TinyLlama-1.1B-Chat-v1.0 --host 0.0.0.0 --port 8000`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "speed-sources",
      title: "Where the extra speed comes from",
      body: (
        <>
          <Table
            head={["Technique", "What it does"]}
            rows={[
              ["Custom kernels", "Hand-tuned attention, matrix and MoE routines for each GPU generation"],
              ["In-flight batching", "NVIDIA's name for continuous batching"],
              ["Overlap scheduling", "Prepares the next step while the GPU runs the current one"],
              ["Quantization support", "Works closely with formats such as FP8 and FP4"],
              ["CUDA graphs", "Records GPU work once and replays it with less CPU launch overhead"],
              ["KV cache reuse", "Skips prefill for repeated prefixes"],
              ["Speculative decoding", "Uses cheap guesses to produce several tokens per step"],
            ]}
          />
          <p>
            None of these is magic, and other engines have versions of several. The advantage comes
            from NVIDIA tuning all of them together for its own hardware, often at launch of a new
            GPU generation.
          </p>
        </>
      ),
    },
    {
      id: "overlap",
      title: "Worked example: closing the idle gap",
      body: (
        <>
          <p>
            A GPU step isn't the only thing in a decode loop. Between steps, the CPU has to choose
            next tokens, update the scheduler, check for stop conditions and prepare the next
            batch. If the GPU sits idle during all that, you're paying for an expensive chip to
            wait for a cheap one.
          </p>
          <Formula>tokens/s per stream = 1 ÷ (GPU step + idle gap)</Formula>
          <p>Take a 20 ms GPU step and a 5 ms gap, both illustrative:</p>
          <pre>
            <code>{`With a gap:     1 ÷ (0.020 + 0.005) = 40 tokens/s
Without a gap:  1 ÷ 0.020 = 50 tokens/s
Improvement:    50 ÷ 40 = 1.25, so 25% more`}</code>
          </pre>
          <p>
            No kernel got faster. <strong>Overlap scheduling</strong> achieves this by preparing
            step N+1 while step N is still running, so the GPU always has its next job ready.
          </p>
          <p>
            There's a cost. The next step is planned before this step's results are checked. If a
            request hits its stop token in step N, it has already been included in step N+1, and
            that one token of work is thrown away. A small waste buys more throughput overall.
          </p>
          <Callout tone="tip">
            Try this measurement on any engine. Compare GPU busy time to wall-clock time per step,
            using the methods in the Profiling Performance lesson. A big gap means your limit is in
            the CPU, not the GPU.
          </Callout>
        </>
      ),
    },
    {
      id: "choosing",
      title: "Should you switch?",
      body: (
        <>
          <p>Turn a speed gain into machines. With illustrative throughput for one GPU:</p>
          <pre>
            <code>{`Target:        200,000 output tokens/s across the fleet
Engine A:      30,000 tokens/s per GPU → 200,000 ÷ 30,000 = 6.67, so 7 GPUs
Engine B:      40,000 tokens/s per GPU → 200,000 ÷ 40,000 = 5 GPUs`}</code>
          </pre>
          <p>
            Two GPUs out of seven is a large saving at scale, and it may not matter at all for a
            small deployment. Compare the money with the costs:
          </p>
          <Table
            head={["Factor", "Consideration"]}
            rows={[
              ["Hardware", "NVIDIA only, so there's no portability to other accelerators"],
              ["Model coverage", "New or unusual architectures may arrive later than in other engines"],
              ["Versions", "CUDA, drivers and the library need to match, so use NVIDIA's containers where possible"],
              ["Debugging", "Deep issues can reach into C++ and custom kernels"],
              ["Team skill", "Tuning takes time, and an untuned setup may not beat an alternative"],
            ]}
          />
          <p>
            A sensible path is to start with a flexible engine so you can ship. Once a model has
            stable, high-volume traffic, benchmark TensorRT-LLM at your real latency target. If the
            saving clearly beats the migration effort, move that model only. Teams often run more
            than one engine for this reason.
          </p>
          <Callout tone="warn">
            Published speed comparisons are often tuned for the vendor's best case. Compare engines
            at your own latency limits, with your own prompts, and with each one properly configured.
          </Callout>
          <p>
            It also fits into larger systems. NVIDIA Dynamo, covered in the next lesson, can use
            TensorRT-LLM as a back end, so the choice doesn't lock you out of cluster-level
            features.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "TensorRT-LLM is a dedicated LLM engine, not standard TensorRT with a new mode.",
    "Its edge comes from tuned kernels combined with scheduling and quantization work.",
    "Removing idle time between steps can raise throughput with no faster kernel.",
    "Overlap scheduling wastes a little work to keep the GPU busy.",
    "Portability, model coverage and tuning effort are the price of its speed.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why doesn't standard TensorRT suit LLM decoding well?",
      options: [
        "It can't run on NVIDIA GPUs",
        "LLM decoding has changing cache and batch shapes, while TensorRT favors a fixed graph",
        "LLMs don't use matrix math",
        "TensorRT only supports images",
      ],
      answer: 1,
      explain: "That mismatch is why NVIDIA built a dedicated LLM engine.",
    },
    {
      kind: "mcq",
      q: "What is the trade-off of overlap scheduling?",
      options: [
        "A finished request may have one token of wasted work",
        "It needs two GPUs per request",
        "It disables streaming",
        "It lowers output accuracy",
      ],
      answer: 0,
      explain: "Step N+1 is planned before step N's results are known, so a stop can waste one step.",
    },
    {
      kind: "text",
      q: "A GPU step takes 40 ms and the idle gap is 10 ms. How many tokens per second does each stream get?",
      format: "**",
      accept: ["20"],
      explain: "1 ÷ (0.040 + 0.010) = 20 tokens per second.",
    },
    {
      kind: "text",
      q: "What is NVIDIA's name for continuous batching in TensorRT-LLM?",
      format: "**-****** ********",
      accept: ["in-flight batching", "inflight batching", "in flight batching"],
      explain: "In-flight batching lets requests join and leave a batch between steps.",
    },
  ],
};
