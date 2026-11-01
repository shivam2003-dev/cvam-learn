import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain how fake quantization lets a model adapt to rounding",
    "Describe why the straight-through estimator is needed",
    "Plan a short quantization-aware fine-tuning run",
    "Decide when the cost beats post-training quantization",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Post-training quantization rounds weights after training ends. The model never saw that
            rounding, so it has no chance to work around it. Often that's fine. Sometimes, especially
            at 4 bits or lower, accuracy falls too far, and calibration alone may not fix it.
          </p>
          <p>
            <strong>Quantization-aware training</strong>, or QAT, teaches the model about rounding
            while it can still adapt. Think of a runner who trains at altitude before a race in the
            mountains. If they only ever train at sea level, the thin air on race day is a shock. If
            they train in the same conditions, their body adjusts.
          </p>
          <p>
            In practice QAT is usually a short <strong>fine-tune</strong>: a brief, gentle round of
            extra training on an already trained model. You don't start from scratch.
          </p>
        </>
      ),
    },
    {
      id: "fake-quant",
      title: "Fake quantization",
      body: (
        <>
          <p>
            During QAT, the weights stay as ordinary floats, so they can make small changes. But each
            time the model runs, a <strong>fake quantizer</strong> rounds a copy of them to the
            target grid, and the forward pass uses that rounded copy. The output, and so the loss,
            shows exactly the error that deployment would show.
          </p>
          <p>
            There's a snag. Rounding is a staircase: flat almost everywhere, so its gradient is zero.
            Backpropagation would learn nothing. The fix is the{" "}
            <strong>straight-through estimator</strong>. On the forward pass, use the rounded value.
            On the backward pass, pretend rounding wasn't there and let the gradient pass unchanged.
          </p>
          <pre>
            <code>{`import torch

def fake_quant(x: torch.Tensor, scale: float) -> torch.Tensor:
    q = torch.round(x / scale).clamp(-128, 127) * scale
    # Forward value is q. Gradient flows as if the output were x.
    return x + (q - x).detach()`}</code>
          </pre>
          <p>
            The <code>detach()</code> call is the trick. It hides <code>q - x</code> from autograd,
            so the output equals <code>q</code> but its gradient is that of <code>x</code>. This
            snippet shows the idea. In a real project, use a library that handles scales and
            observers for you.
          </p>
          <h4>A worked example</h4>
          <p>
            Take a grid with a step of 0.1, and a weight of 0.24. It rounds to 0.2. Suppose the
            gradient is a steady 0.5 and the learning rate is 0.1, so each step moves the weight by
            0.05.
          </p>
          <Table
            head={["Step", "Float weight", "Rounded value used"]}
            rows={[
              ["Start", "0.24", "0.2"],
              ["1", "0.19", "0.2"],
              ["2", "0.14", "0.1"],
            ]}
          />
          <p>
            At step 1 the rounded value doesn't move at all. But the hidden float keeps collecting
            small changes until it crosses a rounding boundary at 0.15, and then the deployed value
            jumps. That's why training on a float shadow works: it accumulates small updates which
            a rounded weight alone would simply lose.
          </p>
        </>
      ),
    },
    {
      id: "process",
      title: "Running a QAT fine-tune",
      body: (
        <>
          <ol>
            <li>Start from the trained model, not random weights.</li>
            <li>
              Fix the target scheme: bit width, symmetric or not, and which layers are skipped. It
              must match what you'll deploy.
            </li>
            <li>Insert fake quantizers and run a little data through to set initial ranges.</li>
            <li>
              Fine-tune with a small learning rate, well below the original. You're nudging a good
              model, not relearning it.
            </li>
            <li>Convert the fake quantizers to real ones, producing the final low-bit model.</li>
            <li>Evaluate against both the original model and a PTQ baseline.</li>
          </ol>
          <Callout tone="warn">
            If training simulates one scheme and you deploy another, QAT has optimized for the wrong
            thing. Decide on the serving format first. Changing it later means repeating the run.
          </Callout>
          <p>
            Many teams also use <strong>knowledge distillation</strong> here. The original model acts
            as a teacher, and the quantized model learns to match its outputs. This helps when you
            don't have much original training data.
          </p>
          <p>
            You don't need to build any of this yourself. ModelOpt supports QAT by calibrating and
            then fine-tuning the quantized model, and PyTorch's torchao library has its own QAT
            tools.
          </p>
        </>
      ),
    },
    {
      id: "decision",
      title: "Is it worth it?",
      body: (
        <>
          <Table
            head={["", "Post-training", "Quantization-aware"]}
            rows={[
              ["Needs", "Weights, a little data", "Training code, data, GPUs"],
              ["Time", "Hours", "Days or more"],
              ["Quality at 8 bits", "Often good enough", "Small gain, if any"],
              ["Quality at 4 bits or lower", "Can fall noticeably", "Where QAT helps most"],
              ["Best for", "Most teams, as a default", "PTQ fails your quality gate"],
            ]}
          />
          <p>Compare the costs with rough numbers. These figures are illustrative.</p>
          <Formula>run cost = GPUs × hours × price per GPU-hour</Formula>
          <pre>
            <code>{`PTQ calibration: 1 GPU × 1 hour  × $3 =   $3
QAT fine-tune:   8 GPUs × 20 hours × $3 = $480`}</code>
          </pre>
          <p>
            $480 looks small if it lets you serve on half as many GPUs for a year. It looks large if
            PTQ already passed your evals. GPU prices vary widely, and the real cost is often
            engineering time rather than compute: you need a working training pipeline, which many
            teams serving someone else's open model don't have.
          </p>
          <Callout tone="tip">
            Treat QAT as an escalation. Run PTQ and measure it. If quality fails, try a gentler
            format or skip more layers. Reach for QAT when you truly need the lower bit width and
            cheaper options have run out.
          </Callout>
          <Callout tone="note">
            Check the license and your data rights before fine-tuning a third-party model. Fine-tuning
            may also change behavior in ways your evals don't cover, so re-run safety and regression
            tests too.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "QAT lets a model adapt to rounding during a short fine-tune.",
    "Fake quantizers round a copy of float weights, so the loss sees deployment error.",
    "The straight-through estimator passes gradients through rounding, which would otherwise block them.",
    "Train for the exact scheme you plan to deploy.",
    "Use QAT when post-training quantization can't meet your quality gate, usually at low bit widths.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does QAT need the straight-through estimator?",
      options: [
        "Rounding has zero gradient almost everywhere, which would stop learning",
        "It makes the GPU round faster",
        "It compresses the training data",
        "It removes the need for a loss function",
      ],
      answer: 0,
      explain: "It uses rounded values going forward but passes gradients through as if rounding weren't there.",
    },
    {
      kind: "mcq",
      q: "A team's FP8 PTQ model passes all evals. What should they usually do next?",
      options: [
        "Run QAT anyway to be safe",
        "Retrain the model from scratch",
        "Ship FP8 and skip QAT",
        "Switch to INT4 without testing",
      ],
      answer: 2,
      explain: "QAT costs real time and money, so it's only justified when PTQ misses the quality gate.",
    },
    {
      kind: "text",
      q: "Grid step is 0.1. A float weight is 0.31, and each step lowers it by 0.04. After how many steps does it first round to 0.2?",
      format: "*",
      accept: ["2"],
      explain: "0.31 → 0.27 → 0.23. It crosses the 0.25 boundary at step 2, and 0.23 rounds to 0.2.",
    },
    {
      kind: "text",
      q: "What does QAT insert into the model during training? Two words.",
      format: "**** **********",
      accept: ["fake quantizers", "fake quantizer", "fake quantization", "fake-quantizers"],
      explain: "Fake quantizers round values in the forward pass while the stored weights stay as floats.",
    },
  ],
};
