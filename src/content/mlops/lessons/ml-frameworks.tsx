import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Choose between Scikit-learn, TensorFlow and PyTorch for a given problem",
    "Save and load models in each framework safely",
    "Use ONNX to separate serving from training",
    "Compare the running cost of CPU and GPU serving",
  ],
  tasks: [
    {
      id: "why-it-matters",
      title: "Why the framework matters to you",
      body: (
        <>
          <p>
            A data scientist hands you a model and asks you to ship it. The framework behind it
            decides the size of your image, whether you need GPUs, how the model is saved, and which
            serving tools will work.
          </p>
          <p>
            A <strong>framework</strong> is a library that provides the building blocks for models.
            Think of a workshop. Scikit-learn is a tidy set of reliable hand tools. TensorFlow and
            PyTorch are heavy machinery: more power, more setup and more to maintain. Using a
            machine to cut a small shelf is a waste. Using a hand saw on a ship's hull won't work.
          </p>
        </>
      ),
    },
    {
      id: "comparison",
      title: "The three side by side",
      body: (
        <>
          <Table
            head={["", "Scikit-learn", "TensorFlow", "PyTorch"]}
            rows={[
              ["Best for", "Tabular data, classic ML", "Deep learning, existing TF systems", "Deep learning, research, LLMs"],
              ["Hardware", "Mostly CPU", "GPU or TPU for training", "GPU for training"],
              ["Typical model", "Random forest, logistic regression", "Keras neural networks", "Custom neural networks"],
              ["Common save format", "joblib or pickle", "SavedModel or .keras", "state_dict or safetensors"],
              ["Common serving", "Your own API with FastAPI", "TF Serving", "Your own API, or an inference engine"],
              ["Image size", "Hundreds of MB", "Often over 1 GB with GPU support", "Often several GB with GPU support"],
            ]}
          />
          <p>
            <strong>Scikit-learn</strong> offers classic algorithms behind one simple pattern:{" "}
            <code>fit</code> and <code>predict</code>. Its pipelines bundle preprocessing with the
            model. XGBoost and LightGBM, two popular gradient boosting libraries, offer
            scikit-learn-compatible interfaces, so they fit into the same workflow.
          </p>
          <p>
            <strong>TensorFlow</strong> has a mature deployment story through TF Serving and a path
            to mobile through TFLite. Most people use it through <strong>Keras</strong>, its
            high-level interface.
          </p>
          <p>
            <strong>PyTorch</strong> feels like normal Python. You can step through it with a
            debugger, which helped it become the common choice for research and for most new LLM
            work. The Hugging Face ecosystem centers on it too.
          </p>
        </>
      ),
    },
    {
      id: "choosing",
      title: "How to choose",
      body: (
        <>
          <p>
            Often the choice is already made. Your job is to run what the team built. If you do have
            a say, these rules work well:
          </p>
          <ul>
            <li><strong>Tabular data:</strong> start with Scikit-learn or gradient boosting. They're fast, cheap and hard to beat on this kind of data.</li>
            <li><strong>Text, images or audio:</strong> use PyTorch, often with a pretrained model.</li>
            <li><strong>An existing TensorFlow stack:</strong> keep it. Rewriting a working system rarely pays off.</li>
          </ul>
          <Callout tone="tip">
            A simple model that runs on a small CPU is easier to deploy, debug, explain and pay for.
            Ask whether deep learning adds enough value to justify the extra operations work.
          </Callout>
          <p>
            Hardware needs flow from this choice, and so does the bill. Take an illustrative load of
            1,200 requests per second. Prices change, so use your own.
          </p>
          <pre>
            <code>{`CPU model:  300 requests/s per instance at $0.10/hour
            1,200 ÷ 300 = 4 instances
            4 × $0.10 × 730 hours = $292 per month

GPU model:  1,500 requests/s per instance at $1.20/hour
            1 instance is enough (keep a second for failover)
            1 × $1.20 × 730 hours = $876 per month
            2 × $1.20 × 730 hours = $1,752 per month`}</code>
          </pre>
          <p>
            The GPU version needs to earn that gap with better results. Real capacity comes from a
            load test, not a guess.
          </p>
        </>
      ),
    },
    {
      id: "saving",
      title: "Saving and loading models",
      body: (
        <>
          <pre>
            <code>{`# Scikit-learn
import joblib
joblib.dump(pipeline, "model.joblib")
pipeline = joblib.load("model.joblib")

# PyTorch: save weights, rebuild the class, then load
import torch
torch.save(model.state_dict(), "weights.pt")

model = Net()  # the class definition must be available
state = torch.load("weights.pt", map_location="cpu", weights_only=True)
model.load_state_dict(state)
model.eval()

# TensorFlow with Keras
model.save("model.keras")   # reload later in Keras
model.export("export/1")    # SavedModel for TF Serving`}</code>
          </pre>
          <p>
            TF Serving expects numbered version folders such as <code>export/1</code> and{" "}
            <code>export/2</code>, and it can pick up a new version on its own.
          </p>
          <Callout tone="warn" title="Model files can run code">
            Pickle-based files, which include joblib files and older PyTorch checkpoints, can run
            arbitrary code when loaded. Only load files you trust. Prefer{" "}
            <code>weights_only=True</code> in PyTorch and the <code>safetensors</code> format, which
            stores only tensors.
          </Callout>
          <Callout tone="note">
            Scikit-learn doesn't promise that a pickled model loads across library versions. Record
            the version with the model, and pin it in the serving image.
          </Callout>
        </>
      ),
    },
    {
      id: "onnx",
      title: "ONNX: separating training from serving",
      body: (
        <>
          <p>
            <strong>ONNX</strong> (Open Neural Network Exchange) is an open file format for models.
            Export once, then serve with <strong>ONNX Runtime</strong>, a small inference engine.
            Your serving image no longer needs the whole training framework, and models from
            different frameworks can share one serving path. Converters exist for PyTorch,
            TensorFlow and Scikit-learn.
          </p>
          <p>Always check that the exported model matches the original:</p>
          <pre>
            <code>{`import numpy as np
import onnxruntime as ort
import torch

model.eval()
dummy = torch.randn(1, 20)

torch.onnx.export(
    model, (dummy,), "model.onnx",
    input_names=["features"], output_names=["score"],
)

session = ort.InferenceSession(
    "model.onnx", providers=["CPUExecutionProvider"]
)
onnx_out = session.run(None, {"features": dummy.numpy()})[0]

with torch.inference_mode():
    torch_out = model(dummy).numpy()

assert np.allclose(onnx_out, torch_out, atol=1e-4)`}</code>
          </pre>
          <p>
            Run a check like this in CI. Not every custom operation converts cleanly, and you want
            to find that out before release.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Start with Scikit-learn or gradient boosting for tabular data.",
    "PyTorch leads for new deep learning and LLM work, and TensorFlow remains common in existing systems.",
    "Framework choice sets your image size, hardware and serving path.",
    "Pickle-based files can run code, so load only trusted ones.",
    "ONNX lets you serve without the training framework, but always verify the export.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A team wants to predict customer churn from a table of 50 columns. What's the best starting point?",
      options: [
        "A custom transformer in PyTorch",
        "Scikit-learn or gradient boosting",
        "A large LLM",
        "A TensorFlow image classifier",
      ],
      answer: 1,
      explain: "Tabular problems usually do well with simple, cheap models that run on CPUs.",
    },
    {
      kind: "mcq",
      q: "Why is loading an untrusted pickle file dangerous?",
      options: [
        "It can run arbitrary code",
        "It always fails on GPUs",
        "It deletes the weights",
        "It's slower than ONNX",
      ],
      answer: 0,
      explain: "Unpickling can execute code embedded in the file.",
    },
    {
      kind: "text",
      q: "Which open model format lets you serve a model without its training framework?",
      format: "****",
      accept: ["onnx"],
      explain: "ONNX models can run on ONNX Runtime.",
    },
    {
      kind: "text",
      q: "You need 1,500 requests per second. One instance handles 300. How many instances do you need?",
      format: "*",
      accept: ["5"],
      explain: "1,500 ÷ 300 = 5.",
    },
  ],
};
