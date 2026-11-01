import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain what a compiled runtime gains from a fixed graph",
    "Export a model to ONNX and run it with ONNX Runtime",
    "Describe the TensorRT build step and its trade-offs",
    "Identify which models suit a compiled runtime and which don't",
  ],
  tasks: [
    {
      id: "fixed-graphs",
      title: "Why fixed graphs run faster",
      body: (
        <>
          <p>
            An embedding service answers thousands of small requests per second, and each one does
            exactly the same thing: tokens go in, a vector comes out. Nothing in that path needs
            Python's flexibility, yet in eager PyTorch you still pay a little for it on every
            operation.
          </p>
          <p>
            A <strong>compiled runtime</strong> takes the whole computation as a graph up front.
            Because it can see every step, it can do things eager mode can't:
          </p>
          <ul>
            <li>
              <strong>Fuse</strong> several operations into one fast kernel.
            </li>
            <li>
              <strong>Plan memory</strong> so buffers are reused, with less allocation during a
              run.
            </li>
            <li>
              <strong>Remove</strong> anything that doesn't affect the output.
            </li>
            <li>
              <strong>Choose kernels</strong> matched to the exact GPU.
            </li>
          </ul>
          <p>
            Eager execution is a cook reading a recipe line by line. A compiled graph is a kitchen
            that read the whole recipe first, laid out each ingredient, and combined steps.
          </p>
        </>
      ),
    },
    {
      id: "onnx",
      title: "ONNX and ONNX Runtime",
      body: (
        <>
          <p>
            <strong>ONNX</strong> (Open Neural Network Exchange) is a file format for a model's
            graph and weights. It's framework-neutral, so a graph exported from PyTorch can run
            without PyTorch. <strong>ONNX Runtime</strong> is an engine that executes those files
            on many kinds of hardware.
          </p>
          <pre>
            <code>{`import torch

ids = torch.ones(1, 16, dtype=torch.long)
mask = torch.ones(1, 16, dtype=torch.long)

torch.onnx.export(
    model,
    (ids, mask),
    "encoder.onnx",
    input_names=["input_ids", "attention_mask"],
    output_names=["last_hidden_state"],
    dynamic_axes={
        "input_ids": {0: "batch", 1: "sequence"},
        "attention_mask": {0: "batch", 1: "sequence"},
    },
)`}</code>
          </pre>
          <p>
            The <code>dynamic_axes</code> argument keeps batch and sequence length flexible.
            Without it, the exported graph may be fixed to the sample's shape. PyTorch's exporter
            has changed across versions, so check the options for your release.
          </p>
          <pre>
            <code>{`import onnxruntime as ort

session = ort.InferenceSession(
    "encoder.onnx",
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
)
print(session.get_providers())

outputs = session.run(None, {
    "input_ids": ids.numpy(),
    "attention_mask": mask.numpy(),
})`}</code>
          </pre>
          <p>
            An <strong>execution provider</strong> is a hardware back end. ONNX Runtime splits the
            graph among the providers you list, and earlier entries have priority. CUDA, CPU and
            TensorRT all have providers.
          </p>
          <Callout tone="warn">
            If the GPU provider can't load, perhaps because the <code>onnxruntime-gpu</code> package
            is missing, ONNX Runtime can fall back to CPU. The service works and is mysteriously
            slow. Print <code>get_providers()</code> at startup and fail fast if the list is wrong.
          </Callout>
        </>
      ),
    },
    {
      id: "tensorrt",
      title: "TensorRT",
      body: (
        <>
          <p>
            <strong>TensorRT</strong> is NVIDIA's compiler and runtime for its own GPUs. It takes a
            graph, commonly ONNX, and builds an <strong>engine</strong>: a file optimized for a
            specific target. It fuses layers, tests kernels and picks fast ones. Then the runtime
            loads that engine and runs it.
          </p>
          <pre>
            <code>{`# Build and benchmark an engine, then save it
trtexec --onnx=encoder.onnx --saveEngine=encoder.engine

# Load the saved engine later and benchmark again
trtexec --loadEngine=encoder.engine`}</code>
          </pre>
          <p>
            <code>trtexec</code> is a command-line tool shipped with TensorRT. It's the quickest way
            to see whether a graph compiles and how fast it runs.
          </p>
          <p>
            An engine is generally tied to the GPU family and TensorRT version it was built for.
            So treat it as a build artifact, like a compiled binary. Rebuild it when either one
            changes, and keep the ONNX file as your source.
          </p>
          <Table
            head={["", "PyTorch eager", "ONNX Runtime", "TensorRT"]}
            rows={[
              ["Hardware", "Broad", "Very broad", "NVIDIA only"],
              ["Setup effort", "None", "Export and verify", "Export, build, verify"],
              ["Dynamic control flow", "Natural", "Limited", "Limited"],
              ["New models", "Immediate", "Depends on operators", "Depends on operators"],
              ["Peak speed on NVIDIA", "Lowest of the three", "Middle, or high with the TensorRT provider", "Usually highest"],
            ]}
          />
        </>
      ),
    },
    {
      id: "fit",
      title: "What fits, and is it worth it?",
      body: (
        <>
          <p>
            Compiled runtimes shine when a model does the same thing on every call. Good fits
            include embedding models, classifiers, reranking models, vision encoders and denoisers
            in image pipelines.
          </p>
          <p>
            A standard LLM decode loop is a poor fit. The KV cache grows each step, the batch
            changes each step, and each stage of generation has a different shape. That's why
            NVIDIA built a separate engine for LLMs, TensorRT-LLM, which has its own lesson.
          </p>
          <p>Decide by converting speed into machines. With illustrative figures:</p>
          <Formula>GPUs needed = target batches per second × batch time</Formula>
          <pre>
            <code>{`Target: 1,000 batches/s
PyTorch:   8 ms per batch  → 1,000 × 0.008 = 8 GPUs
TensorRT:  5 ms per batch  → 1,000 × 0.005 = 5 GPUs

Saving: 3 GPUs × $2/hour × 720 hours = $4,320/month`}</code>
          </pre>
          <p>
            Compare that with the ongoing cost of an extra build step and verification. On a large
            service it's clearly worth it. On a small one, plain PyTorch may be the better choice.
            GPU prices change, so use your current rates.
          </p>
          <Callout tone="warn">
            Export can quietly change behavior. If the exporter traces your code, an{" "}
            <code>if</code> statement is recorded as whichever branch the sample took. Always
            compare outputs with PyTorch on real inputs of different lengths, using something like{" "}
            <code>numpy.allclose</code>.
          </Callout>
          <p>
            Also watch your shapes. If a graph is frozen at 512 tokens while typical inputs have 64,
            each request does 8 times the work it needs. Keep sequence length dynamic, or build
            separate graphs for a few length buckets.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Seeing the whole graph lets a runtime fuse operations, plan memory and choose kernels.",
    "ONNX is the portable format, and ONNX Runtime runs it through execution providers.",
    "TensorRT builds NVIDIA-specific engines, so treat them as build artifacts.",
    "Compiled runtimes suit fixed graphs, while LLM decoding needs a specialized engine.",
    "Always verify exported output against PyTorch, and check your provider at startup.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which workload is the best fit for standard TensorRT?",
      options: [
        "A multi-turn LLM with a growing KV cache",
        "An embedding model that runs the same graph on each call",
        "A research notebook that changes daily",
        "A Python script with data-dependent branches",
      ],
      answer: 1,
      explain: "Embedding models run a fixed computation, which is what compilation rewards.",
    },
    {
      kind: "mcq",
      q: "An ONNX Runtime service works but is far slower than expected. What should you check first?",
      options: [
        "The tokenizer license",
        "Whether session.get_providers() lists the GPU provider",
        "The file extension",
        "The Python version number",
      ],
      answer: 1,
      explain: "A missing GPU provider can leave the session running on CPU with no obvious failure.",
    },
    {
      kind: "text",
      q: "You need 2,000 batches per second at 4 ms per batch. How many GPUs do you need?",
      format: "*",
      accept: ["8"],
      explain: "2,000 × 0.004 = 8 GPUs.",
    },
    {
      kind: "text",
      q: "In ONNX Runtime, what is the two-word name for a hardware back end?",
      format: "********* ********",
      accept: ["execution provider", "execution providers"],
      explain: "Execution providers such as CUDA, CPU and TensorRT run parts of the graph.",
    },
  ],
};
