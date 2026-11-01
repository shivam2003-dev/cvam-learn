import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "List the constraints that make phones harder than desktops",
    "Size a model for a memory budget shared with the operating system",
    "Describe the main ways models get onto a device",
  ],
  tasks: [
    {
      id: "constraints",
      title: "A phone is a tight box",
      body: (
        <>
          <p>
            On-device inference runs where the data is: the camera, the microphone, the keyboard.
            It enables instant responses, offline use and private data that never leaves the
            device. But phones impose limits a data center never has.
          </p>
          <Table
            head={["Constraint", "Why it hurts", "What it forces"]}
            rows={[
              ["Memory", "Shared with the OS and other apps, and apps get killed if they use too much", "Small, heavily quantized models"],
              ["Bandwidth", "Much lower than server GPUs", "Slower decode, so keep models small"],
              ["Power and battery", "Heavy compute drains the battery quickly", "Run only when needed"],
              ["Heat", "No fan, so sustained load makes the chip slow itself down", "Short bursts, lighter models"],
              ["Storage and download", "Users won't accept huge app downloads", "Compact model files"],
            ]}
          />
        </>
      ),
    },
    {
      id: "sizing",
      title: "Sizing a model for the budget",
      body: (
        <>
          <p>
            Suppose a phone has several GB of memory, but the OS and the foreground app leave only
            a portion free for your model. Treat your budget as a small slice, and work backwards.
          </p>
          <pre>
            <code>{`Budget for the model:  2 GB (illustrative)
Weights at 4-bit:  parameters × 0.5 bytes
Largest model:  about 2 ÷ 0.5 = 4 billion parameters, before the KV cache

3B model at 4-bit  =  1.5 GB   (leaves room for context)
1B model at 4-bit  =  0.5 GB`}</code>
          </pre>
          <p>
            Speed follows the same bandwidth rule as before. With an illustrative 50 GB/s and a
            1.5 GB model, the ceiling is about 33 tokens per second, and sustained heat usually
            pulls real numbers lower.
          </p>
          <Callout tone="warn">
            Memory limits on phones are enforced strictly and vary by device and OS version. Test
            on the lowest-end device you plan to support, not on your own phone.
          </Callout>
        </>
      ),
    },
    {
      id: "deploy",
      title: "Getting a model onto a device",
      body: (
        <>
          <p>
            You rarely ship the research checkpoint. You convert the model into a format the
            device's runtime can load, quantize it, and often target the phone's neural processor
            or GPU for speed and efficiency.
          </p>
          <ul>
            <li><strong>Core ML</strong> for Apple devices.</li>
            <li><strong>LiteRT</strong>, the successor to TensorFlow Lite, for Android and embedded devices.</li>
            <li><strong>ExecuTorch</strong>, PyTorch's on-device runtime.</li>
            <li><strong>ONNX Runtime</strong> with its mobile builds, for a cross-platform route.</li>
          </ul>
          <p>
            Each supports a subset of operations, so a model sometimes needs adjusting to convert
            cleanly. Check that every operator in your model runs on the accelerator, because one
            unsupported operator can push work back to the slow CPU.
          </p>
        </>
      ),
    },
    {
      id: "design",
      title: "Design for the device",
      body: (
        <>
          <ul>
            <li>
              <strong>Use the smallest model that does the job.</strong> Narrow tasks like
              classification, transcription or rewriting need far less than a general chatbot.
            </li>
            <li>
              <strong>Hybrid design.</strong> Do quick, private tasks on the device, and send hard
              requests to a server.
            </li>
            <li>
              <strong>Measure on real hardware.</strong> Time, memory and battery all matter, and
              emulators don't show heat behavior.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Phones limit memory, bandwidth, power and heat, and have strictly enforced app budgets.",
    "Work backwards from the memory budget to the biggest model that fits at 4 bits.",
    "Decode speed is still bounded by bandwidth divided by weight bytes.",
    "Models are converted to device formats such as Core ML, LiteRT or ExecuTorch.",
    "Pick the smallest capable model, and test on the lowest-end target.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A 3B model is quantized to 4 bits. How many GB are its weights?",
      format: "*.*",
      accept: ["1.5"],
      explain: "3 × 4 ÷ 8 = 1.5 GB.",
    },
    {
      kind: "mcq",
      q: "Why does sustained heavy inference slow a phone down?",
      options: [
        "Batteries can't hold a charge",
        "With no fan, the chip throttles itself when it gets hot",
        "The screen turns off",
        "Models forget their weights",
      ],
      answer: 1,
      explain: "Thermal throttling lowers clocks to keep the device within safe temperatures.",
    },
    {
      kind: "mcq",
      q: "What's the risk of one unsupported operator when converting for a phone's accelerator?",
      options: [
        "The model file gets bigger than the phone's storage",
        "That work falls back to the slower CPU",
        "The model becomes more accurate",
        "Nothing, it's ignored",
      ],
      answer: 1,
      explain: "Operators the accelerator can't run fall back to the CPU, which can erase the speedup.",
    },
    {
      kind: "text",
      q: "With 40 GB/s of bandwidth and a 2 GB model, what's the upper bound in tokens per second?",
      format: "**",
      accept: ["20"],
      explain: "40 ÷ 2 = 20 tokens per second.",
    },
  ],
};
