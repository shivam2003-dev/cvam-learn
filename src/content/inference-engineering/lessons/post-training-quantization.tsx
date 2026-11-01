import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain how quantization maps real numbers onto a small set of values",
    "Estimate memory savings for common number formats",
    "Separate weight-only, dynamic and static post-training quantization",
    "Choose what to leave unquantized and why",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A 70-billion-parameter model stored in 16-bit floats needs 140 GB for its weights alone.
            That won't fit on most single GPUs, and everything that has to move those weights
            through memory gets slower too.
          </p>
          <p>
            <strong>Quantization</strong> stores numbers with fewer bits. Think of a photo saved
            with fewer colors. From a distance it looks the same. Up close, smooth gradients turn
            into visible bands. The file is much smaller, and the question is whether anyone
            notices the difference.
          </p>
          <p>
            <strong>Post-training quantization</strong>, or PTQ, means you take a finished model and
            convert it. There's no retraining. You need the weights and, for some methods, a small
            sample of data. That makes it the first thing to try, because it's cheap and takes
            hours instead of weeks.
          </p>
          <Table
            head={["Format", "Bits", "Type", "70B-parameter weights"]}
            rows={[
              ["FP32", "32", "Floating point", "280 GB"],
              ["FP16 / BF16", "16", "Floating point", "140 GB"],
              ["FP8", "8", "Floating point", "70 GB"],
              ["INT8", "8", "Integer", "70 GB"],
              ["INT4 / FP4", "4", "Integer / float", "35 GB"],
            ]}
          />
          <p>
            The sizes are simple arithmetic: parameters times bytes per value, ignoring metadata and
            any layers you keep at higher precision. Smaller weights help in three ways. They fit on
            cheaper GPUs, they leave more memory for the KV cache, and they reduce how much data
            each token must move.
          </p>
        </>
      ),
    },
    {
      id: "mapping",
      title: "How the mapping works",
      body: (
        <>
          <p>
            Integer quantization picks a <strong>scale</strong> (the size of one step) and a{" "}
            <strong>zero point</strong> (the integer that stands for real 0). Then every real value
            snaps to its nearest step.
          </p>
          <Formula>real value ≈ scale × (integer − zero point)</Formula>
          <p>
            Say a tensor's values run from −0.8 to 1.6, and we use unsigned 8-bit integers, which
            run from 0 to 255:
          </p>
          <pre>
            <code>{`scale      = (1.6 − (−0.8)) ÷ 255 = 2.4 ÷ 255 ≈ 0.00941
zero point = 0.8 ÷ 0.00941 = 85

Store the weight 0.5:
  0.5 ÷ 0.00941 = 53.125, which rounds to 53
  53 + 85 = 138

Read it back:
  0.00941 × (138 − 85) ≈ 0.4988
  error ≈ 0.0012`}</code>
          </pre>
          <p>
            The error can never exceed half a step, here about 0.0047. Each error is tiny. But a
            large model has billions of them, and they stack up through dozens of layers.
          </p>
          <p>
            Notice one outlier would ruin this. If a single value were 50, the range would stretch
            and every ordinary value would crowd into just a few steps. That's why tools estimate
            the range carefully rather than simply taking the extremes.
          </p>
          <p>
            FP8 and FP4 work differently. They're floating-point formats, so each value has its own
            exponent and small values keep their resolution automatically. That's why they often
            need less tuning than integers at the same bit width, and why recent GPUs add native
            hardware support for them.
          </p>
        </>
      ),
    },
    {
      id: "types",
      title: "Three flavors of PTQ",
      body: (
        <>
          <p>
            Weights are known in advance. <strong>Activations</strong>, the values flowing through
            the network at run time, are not. The three flavors differ in how they treat activations.
          </p>
          <Table
            head={["Flavor", "Weights", "Activations", "Needs data?"]}
            rows={[
              ["Weight-only", "Quantized", "Left at higher precision", "Depends: simple rounding no, GPTQ and AWQ yes"],
              ["Dynamic", "Quantized", "Quantized, range measured per batch at run time", "No"],
              ["Static", "Quantized", "Quantized, range fixed in advance", "Yes, for calibration"],
            ]}
          />
          <p>
            <strong>Calibration</strong> means running a few hundred representative prompts through
            the model and recording the activation ranges, so they can be frozen into the model.
            Static quantization can be the fastest at run time, because no ranges are computed. It also
            carries a risk: if calibration data doesn't look like real traffic, those frozen ranges
            will fit badly.
          </p>
          <p>
            For LLMs, methods also try to protect accuracy in smarter ways. <strong>GPTQ</strong>{" "}
            adjusts the remaining weights to compensate for the error of each weight it rounds.{" "}
            <strong>AWQ</strong> uses activation data to find which weights matter most and scales
            them to preserve their precision. Both target low bit widths such as 4-bit.
          </p>
        </>
      ),
    },
    {
      id: "skip",
      title: "What to leave alone",
      body: (
        <>
          <p>
            Not every layer deserves the same treatment. Quantization errors hurt most where a small
            change affects everything after it.
          </p>
          <ul>
            <li>
              <strong>The final output layer</strong> (<code>lm_head</code>) directly sets token
              probabilities, so it's commonly excluded.
            </li>
            <li>
              <strong>Token embeddings</strong> feed every later layer. They're sometimes kept at
              higher precision.
            </li>
            <li>
              <strong>Sensitive layers</strong> can be found by quantizing one layer at a time and
              measuring the damage.
            </li>
          </ul>
          <p>
            Here's a real pipeline using llm-compressor, a library from the vLLM project. FP8 with
            dynamic activations needs no calibration data, which makes it a good first attempt.
          </p>
          <pre>
            <code>{`from transformers import AutoModelForCausalLM, AutoTokenizer
from llmcompressor import oneshot
from llmcompressor.modifiers.quantization import QuantizationModifier

model_id = "your-org/your-model"
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype="auto")
tokenizer = AutoTokenizer.from_pretrained(model_id)

recipe = QuantizationModifier(
    targets="Linear",
    scheme="FP8_DYNAMIC",
    ignore=["lm_head"],
)
oneshot(model=model, recipe=recipe)

model.save_pretrained("model-fp8", save_compressed=True)
tokenizer.save_pretrained("model-fp8")`}</code>
          </pre>
          <Callout tone="warn">
            Quantization and data type must match your hardware. An INT4 model on hardware without
            good support can spend so long converting values that it runs slower than a larger one.
            Smaller doesn't automatically mean faster, so always benchmark the result.
          </Callout>
          <Callout tone="tip">
            Work down the ladder. Try FP8 first, because many models lose very little. Only move to
            4-bit if you need the memory, and then measure quality before you trust it. The lesson
            Measuring Quality Impact shows how.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Quantization stores values in fewer bits, trading a little precision for memory and speed.",
    "Post-training quantization converts a finished model without retraining, so try it first.",
    "Integer formats snap values to steps defined by a scale and a zero point.",
    "Weight-only, dynamic and static differ in how they handle activations; static needs calibration.",
    "Leave sensitive layers such as lm_head at higher precision, and benchmark on your hardware.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which PTQ flavor needs representative data to fix activation ranges ahead of time?",
      options: ["Weight-only", "Dynamic", "Static", "All of them"],
      answer: 2,
      explain: "Static quantization freezes activation ranges, so it needs a calibration run first.",
    },
    {
      kind: "mcq",
      q: "Why does one extreme outlier damage plain integer quantization?",
      options: [
        "It overflows the GPU's memory",
        "It stretches the range, so ordinary values share very few steps",
        "It changes the zero point to a negative number",
        "It forces the model to retrain",
      ],
      answer: 1,
      explain: "A fixed number of steps must cover the whole range, so a wide range means coarse steps.",
    },
    {
      kind: "text",
      q: "A model has 40 billion parameters. How many GB do its weights need in FP8, ignoring metadata?",
      format: "**",
      accept: ["40"],
      explain: "FP8 uses 1 byte per value, so 40 billion × 1 byte = 40 GB.",
    },
    {
      kind: "text",
      q: "With a scale of 0.01 and a zero point of 10, what real value does the stored integer 60 represent?",
      format: "***",
      accept: ["0.5", "0.50", ".5"],
      explain: "0.01 × (60 − 10) = 0.5.",
    },
  ],
};
