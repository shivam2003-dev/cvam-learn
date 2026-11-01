import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Decide when a model should run on the device rather than in the cloud",
    "Convert and quantize a model for TFLite",
    "Export a PyTorch model for mobile, and know where PyTorch Mobile is heading",
    "Plan testing and updates for models shipped inside apps",
  ],
  tasks: [
    {
      id: "why-device",
      title: "Why run a model on a phone?",
      body: (
        <>
          <p>
            A camera app wants to blur the background in real time. Sending every frame to a server
            means paying for GPUs, uploading video, and waiting for a network round trip that can
            take longer than the frame itself. On a train with weak signal, the feature stops
            working altogether.
          </p>
          <p>Running the model on the device fixes several of these at once:</p>
          <Table
            head={["Benefit", "Why it matters"]}
            rows={[
              ["Low latency", "No network round trip"],
              ["Privacy", "Data can stay on the device"],
              ["Offline use", "Works with no signal"],
              ["Lower serving cost", "The user's hardware does the work"],
            ]}
          />
          <p>
            The price is a tight budget. Moving from a server to a phone is like moving from a
            workshop to a toolbox: you can't bring everything, so each item has to earn its place.
            You are limited by download size, memory, battery and heat. Phones also slow themselves
            down when they get hot, so a model that is fast for ten seconds may not be fast for ten
            minutes.
          </p>
          <p>
            Start from the latency budget. At 30 frames per second, each frame gets 1,000 ÷ 30 ≈ 33
            ms, and that time also covers preprocessing and drawing. A model taking 45 ms manages
            only 1,000 ÷ 45 ≈ 22 frames per second. You then need a smaller model, a faster
            processor, or a lower frame rate.
          </p>
        </>
      ),
    },
    {
      id: "quantization",
      title: "Shrinking a model with quantization",
      body: (
        <>
          <p>
            <strong>Quantization</strong> stores numbers with fewer bits, usually replacing 32-bit
            floats with 8-bit integers. A model with 20 million parameters takes about 80 MB as
            float32 and about 20 MB as int8, a reduction of four times. Integer math is often faster
            on mobile hardware too.
          </p>
          <p>Each integer maps back to a real value through two numbers, a scale and a zero point:</p>
          <Formula>real value = scale × (integer − zero point)</Formula>
          <p>
            Suppose a tensor's values run from −1 to 3, and we use int8, which covers −128 to 127.
          </p>
          <pre>
            <code>{`scale      = (3 − (−1)) ÷ 255 = 0.015686
zero point = −128 + round(1 ÷ 0.015686) = −64

Encode 1.5:  round(1.5 ÷ 0.015686) − 64 = 96 − 64 = 32
Decode 32:   0.015686 × (32 + 64) = 1.506`}</code>
          </pre>
          <p>
            We put in 1.5 and got back 1.506. That small error is the cost, and it usually has little
            effect on accuracy. Not always, though, so measure it.
          </p>
          <Table
            head={["Method", "How it works", "Trade-off"]}
            rows={[
              ["Dynamic range", "Weights become int8; activations are handled at run time", "Easy; no sample data needed"],
              ["Full integer", "Weights and activations become int8", "Needs sample data; best for many accelerators"],
              ["Float16", "Weights stored as 16-bit floats", "Halves size; often suits GPUs"],
              ["Quantization-aware training", "Simulates quantization during training", "More work; useful when accuracy drops"],
            ]}
          />
        </>
      ),
    },
    {
      id: "tflite",
      title: "Converting with TFLite",
      body: (
        <>
          <p>
            TFLite, TensorFlow's on-device runtime, packs a model into a single flat file with a{" "}
            <code>.tflite</code> extension. The app bundles a small interpreter that runs this file.
          </p>
          <Callout tone="note">
            Google has renamed TensorFlow Lite to LiteRT. You'll see both names in docs and packages.
            The <code>.tflite</code> file format and the concepts here carry over.
          </Callout>
          <p>
            Full integer quantization needs a <strong>representative dataset</strong>: a few hundred
            real inputs, so the converter can measure the range of each activation.
          </p>
          <pre>
            <code>{`import tensorflow as tf

def representative_data():
    for image in calibration_images.take(200):
        yield [tf.expand_dims(image, 0)]

converter = tf.lite.TFLiteConverter.from_saved_model("export/classifier")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_data
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type = tf.uint8
converter.inference_output_type = tf.uint8

with open("classifier.tflite", "wb") as f:
    f.write(converter.convert())`}</code>
          </pre>
          <p>On Android, load and run it with the interpreter:</p>
          <pre>
            <code>{`val model = FileUtil.loadMappedFile(context, "classifier.tflite")
val options = Interpreter.Options().setNumThreads(4)
val interpreter = Interpreter(model, options)

val input = Array(1) { Array(224) { Array(224) { ByteArray(3) } } }
val output = Array(1) { ByteArray(1000) }
interpreter.run(input, output)`}</code>
          </pre>
          <p>
            A <strong>delegate</strong> hands supported operations to faster hardware. Examples are
            the GPU delegate, and the Core ML delegate on iOS. Any operation the delegate can't
            handle falls back to the CPU, and moving data back and forth costs time. A partly
            delegated model can therefore run slower than a CPU-only one, so always measure.
          </p>
        </>
      ),
    },
    {
      id: "pytorch",
      title: "PyTorch Mobile and ExecuTorch",
      body: (
        <>
          <p>
            PyTorch Mobile takes a TorchScript model, optimizes it for mobile, and saves it for a
            lightweight interpreter:
          </p>
          <pre>
            <code>{`import torch
from torch.utils.mobile_optimizer import optimize_for_mobile

model.eval()
example = torch.rand(1, 3, 224, 224)
scripted = torch.jit.trace(model, example)
optimized = optimize_for_mobile(scripted)
optimized._save_for_lite_interpreter("classifier.ptl")`}</code>
          </pre>
          <p>The app loads the file through the PyTorch Android library:</p>
          <pre>
            <code>{`val module = LiteModuleLoader.load(modelPath)
val output = module.forward(IValue.from(inputTensor)).toTensor()`}</code>
          </pre>
          <Callout tone="warn">
            The PyTorch project has moved on-device work to <strong>ExecuTorch</strong>, and PyTorch
            Mobile is no longer the recommended path. Learn the workflow above for existing apps, but
            prefer ExecuTorch for new work. Check the current docs, as APIs here change.
          </Callout>
          <p>
            ExecuTorch uses <code>torch.export</code> to capture the model, then writes a{" "}
            <code>.pte</code> file for a small runtime. Backends, such as XNNPACK for CPUs, provide
            the acceleration.
          </p>
          <pre>
            <code>{`import torch
from executorch.exir import to_edge

exported = torch.export.export(model, (example,))
program = to_edge(exported).to_executorch()

with open("classifier.pte", "wb") as f:
    f.write(program.buffer)`}</code>
          </pre>
          <Table
            head={["", "TFLite", "PyTorch Mobile", "ExecuTorch"]}
            rows={[
              ["Model file", ".tflite", ".ptl", ".pte"],
              ["Typical source", "TensorFlow, Keras", "PyTorch", "PyTorch"],
              ["Export path", "TFLiteConverter", "TorchScript", "torch.export"],
              ["Status", "Active, as LiteRT", "Legacy", "Current PyTorch path"],
            ]}
          />
        </>
      ),
    },
    {
      id: "shipping",
      title: "Shipping and updating on-device models",
      body: (
        <>
          <p>A phone is not a server you control, and that changes your release process.</p>
          <ul>
            <li>
              <strong>Check the converted model:</strong> run the final file over your test set,
              not only the original model. Conversion can change results.
            </li>
            <li>
              <strong>Match preprocessing:</strong> resizing, color order and normalization must
              match training. Mismatches here are a very common source of bad on-device results.
            </li>
            <li>
              <strong>Test on real devices:</strong> include older, cheaper phones as well as new
              flagships, and run long enough to see thermal slowdown.
            </li>
            <li>
              <strong>Separate the model from the app:</strong> downloading a model at run time lets
              you update it without a full app release.
            </li>
            <li>
              <strong>Monitor from the app:</strong> report model version, latency and crashes as
              anonymous telemetry, with user consent.
            </li>
          </ul>
          <p>
            Updates add up, too. A 5 MB model pushed to 1 million users is 5 TB of downloads, so
            ship updates when they earn it, and prefer Wi-Fi downloads where possible. Keep the
            previous version available so you can roll back, and expect old versions to stay in the
            wild for months.
          </p>
          <Callout tone="tip">
            Keep a server model as a fallback for tasks a low-end device can't handle. Many products
            run a small model locally and call the cloud only for hard cases.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "On-device models trade server cost and latency for tight limits on size, memory, battery and heat.",
    "Quantization to int8 cuts weight storage about four times, at a small accuracy risk you must measure.",
    "TFLite, now LiteRT, converts models to a .tflite file and uses delegates to reach faster hardware.",
    "PyTorch Mobile is the legacy path, and ExecuTorch is the current one for PyTorch.",
    "Test the converted file on real devices, and plan for updates and rollback.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does full integer quantization need a representative dataset?",
      options: [
        "To retrain the model",
        "To measure activation ranges for scale and zero point",
        "To encrypt the weights",
        "To pick the delegate",
      ],
      answer: 1,
      explain: "Activation ranges depend on real inputs, so the converter observes sample data.",
    },
    {
      kind: "mcq",
      q: "A model runs slower with a GPU delegate than on the CPU. What is a likely reason?",
      options: [
        "GPUs cannot run neural networks",
        "Unsupported operations fall back to the CPU, and data transfers add cost",
        "The model file became larger",
        "Delegates always disable quantization",
      ],
      answer: 1,
      explain: "A partly delegated graph moves data between processors, and that overhead can outweigh the gain.",
    },
    {
      kind: "mcq",
      q: "Which is the current on-device path for new PyTorch projects?",
      options: ["TorchScript only", "ExecuTorch", "Core ML delegate", "Keras"],
      answer: 1,
      explain: "ExecuTorch is the successor to PyTorch Mobile.",
    },
    {
      kind: "text",
      q: "A video feature must run at 25 frames per second. How many milliseconds does each frame get?",
      format: "**",
      accept: ["40", "40 ms", "40ms"],
      explain: "1,000 ÷ 25 = 40 ms per frame.",
    },
    {
      kind: "text",
      q: "A model takes 120 MB as float32. About how many MB will its weights take as int8?",
      format: "**",
      accept: ["30", "30 mb", "30mb"],
      explain: "Going from 32 bits to 8 bits divides size by 4: 120 ÷ 4 = 30 MB.",
    },
  ],
};
