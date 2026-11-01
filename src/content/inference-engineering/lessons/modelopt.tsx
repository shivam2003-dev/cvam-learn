import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Explain what ModelOpt does and where it fits in a serving pipeline",
    "Quantize a PyTorch model with the mtq API",
    "Size a calibration run and estimate the result",
    "Check an exported model before it reaches production",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Knowing how quantization works is one thing. Doing it safely is another. Someone has to
            find the right layers, attach observers, run calibration, write out a checkpoint and make
            sure the serving engine understands the result. Doing that by hand for every new model is
            slow and easy to get wrong.
          </p>
          <p>
            <strong>ModelOpt</strong>, short for NVIDIA Model Optimizer, is an open-source Python
            library for this job. Think of a mechanic's tuning kit: the kit doesn't change what an
            engine is, but it gives you tested parts and a repeatable process.
          </p>
          <p>
            It works on models before serving. You give it a PyTorch or ONNX model, and it gives
            back an optimized one for an engine to load. Its main use is quantization (both PTQ and
            QAT). It also covers related techniques such as pruning, knowledge distillation and
            speculative decoding.
          </p>
          <Table
            head={["Tool", "Often chosen when"]}
            rows={[
              ["ModelOpt", "You target NVIDIA GPUs and engines, including FP8 and FP4 formats"],
              ["llm-compressor", "You serve on vLLM and want its native compressed format"],
              ["torchao", "You want quantization built around PyTorch"],
              ["bitsandbytes", "You want quick 8-bit or 4-bit loading for experiments"],
            ]}
          />
          <p>
            These tools overlap, and they change quickly. Pick based on the format your engine and
            hardware support, not on the tool's name.
          </p>
        </>
      ),
    },
    {
      id: "workflow",
      title: "The basic workflow",
      body: (
        <>
          <p>The core PyTorch flow has four steps:</p>
          <ol>
            <li>Load the model on a GPU.</li>
            <li>Write a <code>forward_loop</code> that feeds calibration data through it.</li>
            <li>Call <code>mtq.quantize</code>, which inserts quantizers and runs your loop.</li>
            <li>Export a checkpoint for the serving engine.</li>
          </ol>
          <p>
            The package installs as <code>nvidia-modelopt</code> and imports as{" "}
            <code>modelopt</code>:
          </p>
          <pre>
            <code>{`import torch
import modelopt.torch.quantization as mtq
from modelopt.torch.export import export_hf_checkpoint
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "your-org/your-model"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id, torch_dtype="auto", device_map="auto"
)

def forward_loop(m):
    for text in calibration_texts:   # your own representative prompts
        batch = tokenizer(text, return_tensors="pt", truncation=True,
                          max_length=512).to(m.device)
        m(**batch)

model = mtq.quantize(model, mtq.FP8_DEFAULT_CFG, forward_loop)
mtq.disable_quantizer(model, "*lm_head*")
mtq.print_quant_summary(model)

with torch.inference_mode():
    export_hf_checkpoint(model, export_dir="model-fp8")`}</code>
          </pre>
          <p>
            <code>FP8_DEFAULT_CFG</code> is a preset. Others exist, such as{" "}
            <code>INT8_DEFAULT_CFG</code>. Presets and export options change between releases, so
            check the docs for your installed version.
          </p>
          <p>
            <code>print_quant_summary</code> deserves attention. It lists the quantizers that were
            inserted. Read it. It's the quickest way to catch layers that were skipped by accident,
            or quantized when they shouldn't be.
          </p>
        </>
      ),
    },
    {
      id: "calibration",
      title: "Sizing calibration",
      body: (
        <>
          <p>
            Calibration data doesn't train the model. It only shows the observers a realistic range
            of values, so you need far less of it than you'd need for training. It should still look
            like your traffic: if you serve code, don't calibrate only on news articles.
          </p>
          <Formula>calibration time ≈ samples ÷ batch size × seconds per batch</Formula>
          <p>Here's an illustrative plan:</p>
          <pre>
            <code>{`512 samples ÷ 8 per batch = 64 batches
64 batches × 0.6 s per batch ≈ 38 s of forward passes
512 samples × 256 tokens each = 131,072 tokens seen`}</code>
          </pre>
          <p>
            Loading the model and writing the checkpoint often takes longer than this step. So
            calibration is rarely the slow part of the pipeline. The slow part is the evaluation
            that has to follow.
          </p>
          <p>Next, the size payoff for a 40-billion-parameter model:</p>
          <Table
            head={["Format", "Bytes per value", "Weights (no metadata)"]}
            rows={[
              ["FP16 (original)", "2", "80 GB"],
              ["FP8", "1", "40 GB"],
              ["FP4", "0.5", "20 GB"],
            ]}
          />
          <p>
            Real checkpoints come out a bit larger, because excluded layers stay at higher
            precision. Moving from FP16 to FP8 on a 48 GB GPU changes the model from not fitting at
            all to leaving about 8 GB for KV cache and overhead.
          </p>
          <Callout tone="note">
            Native hardware support matters. NVIDIA's Hopper GPUs added FP8 support, and Blackwell
            added FP4. On older GPUs these formats may be unsupported or need slow conversion, so
            check your target before committing. Specs and support change, so verify them.
          </Callout>
        </>
      ),
    },
    {
      id: "production",
      title: "From checkpoint to production",
      body: (
        <>
          <p>
            Exported checkpoints follow the Hugging Face layout, with extra files that describe the
            quantization. Engines such as vLLM, SGLang and TensorRT-LLM can load supported formats,
            but support depends on the model, the format and the version. Test the exact combination.
          </p>
          <p>A short checklist before you ship:</p>
          <ul>
            <li><strong>Loads:</strong> the engine starts and reports the expected quantization.</li>
            <li><strong>Answers:</strong> a few fixed prompts return sensible text.</li>
            <li><strong>Speed:</strong> TTFT and tokens per second beat the original.</li>
            <li><strong>Quality:</strong> it passes your gate, as covered in Measuring Quality Impact.</li>
            <li><strong>Reproducible:</strong> you saved the ModelOpt version, config and calibration data.</li>
          </ul>
          <Callout tone="warn">
            Don't calibrate on sensitive user data without thinking it through, and don't assume a
            preset fits every model. New architectures can contain layers that a preset doesn't
            recognize. That's another reason to read the quantization summary.
          </Callout>
          <Callout tone="tip">
            Put this in a pipeline, not a notebook. A script that takes a model ID and a config, then
            quantizes, exports and evaluates, lets you repeat the work for every new model version.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "ModelOpt is NVIDIA's open-source library for quantizing and otherwise optimizing models before serving.",
    "The core flow is load, calibrate with a forward_loop, quantize, then export.",
    "Calibration data needs to be representative, not large.",
    "Read the quantization summary to catch layers that were handled wrongly.",
    "Confirm that your engine and GPU support the format, then measure quality and speed.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What's the purpose of the forward_loop passed to mtq.quantize?",
      options: [
        "To train new weights",
        "To feed calibration data so observers can record value ranges",
        "To serve live traffic",
        "To download the model",
      ],
      answer: 1,
      explain: "The loop runs representative data through the model, so quantizers can set their ranges.",
    },
    {
      kind: "mcq",
      q: "Which is the best way to choose between quantization tools?",
      options: [
        "Whichever has the newest logo",
        "Whichever produces a format your engine and hardware support well",
        "Always use the one with the most presets",
        "Always use the one that takes the fewest lines of code",
      ],
      answer: 1,
      explain: "A quantized model is only useful if your serving stack can run it efficiently.",
    },
    {
      kind: "text",
      q: "Calibration uses 1,000 samples at 10 per batch, and each batch takes 0.5 s. How many seconds does it take?",
      format: "**",
      accept: ["50"],
      explain: "1,000 ÷ 10 = 100 batches. 100 × 0.5 s = 50 s.",
    },
    {
      kind: "text",
      q: "A 30-billion-parameter model is stored in FP4. How many GB do its weights need, ignoring metadata?",
      format: "**",
      accept: ["15"],
      explain: "FP4 uses 0.5 bytes per value, so 30 billion × 0.5 bytes = 15 GB.",
    },
  ],
};
