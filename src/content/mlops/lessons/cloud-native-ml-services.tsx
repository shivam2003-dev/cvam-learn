import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Describe what SageMaker, Azure Machine Learning and Vertex AI manage for you",
    "Compare managed platforms with self-hosted options",
    "Calculate when a managed service costs more than running it yourself",
    "Structure ML code so you can leave a platform later",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem managed platforms solve",
      body: (
        <>
          <p>
            To train and serve a model on raw infrastructure, someone must install drivers, schedule
            GPUs, handle failures, build endpoints, wire up autoscaling and keep it all patched.
            None of that makes your model better.
          </p>
          <p>
            A <strong>managed ML platform</strong> takes on much of that work. You hand it code and
            data, and it provisions machines, runs the job, stores the result and shuts everything
            down. Think of renting a furnished apartment. You move in faster and don't fix the
            boiler, but you pay more and can't knock down walls.
          </p>
        </>
      ),
    },
    {
      id: "platforms",
      title: "What the big three offer",
      body: (
        <>
          <p>
            Amazon SageMaker, Azure Machine Learning and Google's Vertex AI all cover the same
            lifecycle. Feature names shift over time, so treat this as a map rather than a catalog.
          </p>
          <Table
            head={["Stage", "SageMaker", "Azure Machine Learning", "Vertex AI"]}
            rows={[
              ["Notebooks", "Studio", "Compute instances", "Workbench"],
              ["Training", "Training jobs", "Command jobs", "Custom training"],
              ["Pipelines", "SageMaker Pipelines", "Azure ML pipelines", "Vertex AI Pipelines"],
              ["Model registry", "Model Registry", "Model registry", "Model Registry"],
              ["Live serving", "Real-time endpoints", "Online endpoints", "Online prediction endpoints"],
              ["Offline scoring", "Batch Transform", "Batch endpoints", "Batch prediction"],
              ["Monitoring", "Model Monitor", "Model monitoring", "Model Monitoring"],
            ]}
          />
          <p>
            Each also offers hosted foundation models through an API, such as Amazon Bedrock, Azure
            OpenAI and Gemini on Vertex AI. There, you pay by usage and run no model servers at
            all.
          </p>
          <p>A managed training job often needs only a short script. This uses SageMaker:</p>
          <pre>
            <code>{`from sagemaker.pytorch import PyTorch

estimator = PyTorch(
    entry_point="train.py",
    source_dir="src",
    role="arn:aws:iam::123456789012:role/SageMakerTrainRole",
    framework_version="2.1",
    py_version="py310",
    instance_type="ml.g5.xlarge",
    instance_count=1,
    use_spot_instances=True,
    max_run=3600,
    max_wait=7200,
    checkpoint_s3_uri="s3://acme-ml/checkpoints/fraud/",
)

estimator.fit({"train": "s3://acme-ml/data/fraud/v12/"})

predictor = estimator.deploy(
    initial_instance_count=1,
    instance_type="ml.m5.large",
)`}</code>
          </pre>
          <p>
            These few lines ask for a GPU machine at spot pricing, copy the data in, run the script,
            sync checkpoints to S3, save the model and release the machine. Building that yourself
            takes real effort. The last call starts a live endpoint.
          </p>
          <Callout tone="note">
            This shows the estimator style from version 2 of the SageMaker Python SDK. Cloud SDKs
            change between major versions, so pin yours and check the current docs.
          </Callout>
        </>
      ),
    },
    {
      id: "options",
      title: "The spectrum of options",
      body: (
        <>
          <p>Managed versus self-hosted isn't a yes-or-no choice. It's a range:</p>
          <Table
            head={["Option", "You manage", "Good fit"]}
            rows={[
              ["Hosted model API", "Prompts and evaluation", "Standard LLM tasks, fast starts"],
              ["Managed ML platform", "Code, data, configuration", "Small teams with custom models"],
              ["Managed Kubernetes", "Workloads, serving stack, upgrades", "Platform teams, many models"],
              ["Virtual machines", "Nearly everything", "Unusual needs or very tight budgets"],
            ]}
          />
          <p>You can mix them. A common pattern trains on a managed platform and serves on Kubernetes.</p>
        </>
      ),
    },
    {
      id: "cost",
      title: "Is it worth paying for?",
      body: (
        <>
          <p>
            Managed instances usually cost more per hour than the same raw machine. That extra
            charge is the <strong>premium</strong>. It's easy to measure. The engineering time it
            saves is easy to forget.
          </p>
          <Formula>yearly premium = extra cost per hour × instances × 8,760 hours</Formula>
          <p>
            Here's an illustrative case. A raw machine costs $1.00 per hour. The managed version
            costs $1.40. Running it yourself takes a quarter of an engineer, at a total yearly cost
            of $160,000.
          </p>
          <pre>
            <code>{`Premium per instance per year:
  $0.40 × 8,760 = $3,504

Self-hosting labor per year:
  0.25 × $160,000 = $40,000

Break-even:
  $40,000 ÷ $3,504 ≈ 11.4 instances

4 instances:   premium $14,016   → managed is cheaper
100 instances: premium $350,400  → self-hosting is cheaper`}</code>
          </pre>
          <p>
            Labor would grow somewhat with scale, so the real break-even sits higher than this. The
            lesson still holds: small fleets favor managed services, and large steady ones often
            justify a platform team.
          </p>
          <p>
            Idle endpoints are the other trap. A real-time endpoint bills while it's up, even with
            no traffic. If you only need nightly scores, a batch job that takes two hours bills for
            2 of the 24 hours. Use batch whenever nobody is waiting on the answer.
          </p>
          <Callout tone="warn">
            Experiment endpoints and notebooks left running are a common source of waste on these
            platforms. Add automatic shutdown rules and alert on anything idle.
          </Callout>
        </>
      ),
    },
    {
      id: "portability",
      title: "Avoiding lock-in",
      body: (
        <>
          <p>
            <strong>Lock-in</strong> means leaving would be costly. Some is fine if you get value in
            return. The aim is to know where it is and to contain it.
          </p>
          <ul>
            <li><strong>Keep training code plain.</strong> It should read data from a path and write a model to a path. Keep platform calls in a thin wrapper.</li>
            <li><strong>Use containers.</strong> All three platforms can run your own images.</li>
            <li><strong>Prefer open formats.</strong> Store models in formats such as ONNX or safetensors in your own buckets.</li>
            <li><strong>Prefer open tools where they fit.</strong> SageMaker offers managed MLflow, and Azure Machine Learning works with MLflow tracking, so your logging code can stay portable.</li>
          </ul>
          <p>
            For example, SageMaker passes paths through environment variables such as{" "}
            <code>SM_CHANNEL_TRAIN</code> and <code>SM_MODEL_DIR</code>. Read those once in a small
            entry script, then pass ordinary paths to the rest of your code:
          </p>
          <pre>
            <code>{`import os
from trainer import run_training  # knows nothing about SageMaker

run_training(
    data_dir=os.environ.get("SM_CHANNEL_TRAIN", "data/"),
    model_dir=os.environ.get("SM_MODEL_DIR", "out/"),
)`}</code>
          </pre>
          <p>The same code now runs on a laptop, in CI and on the platform.</p>
          <Callout tone="tip">
            Ask these questions before you commit. Do you have a platform team? Is traffic steady
            or spiky? Do you need custom GPU scheduling? Must data stay in a certain place? How many
            models will you run? Small team and few models points to managed.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "SageMaker, Azure Machine Learning and Vertex AI cover the same ML lifecycle.",
    "Options range from hosted APIs to raw machines, and you can mix them.",
    "Weigh the hourly premium against the engineering time it saves.",
    "Use batch jobs when nobody is waiting, and shut idle endpoints down.",
    "Keep code plain and use containers so you can move later.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which is Google's managed ML platform?",
      options: ["SageMaker", "Vertex AI", "Bedrock", "AKS"],
      answer: 1,
      explain: "Vertex AI is Google Cloud's platform. SageMaker and Bedrock are AWS services.",
    },
    {
      kind: "mcq",
      q: "Which team is the strongest fit for a managed ML platform?",
      options: [
        "Three engineers running a handful of custom models",
        "A large platform team with thousands of steady GPUs",
        "A team needing custom GPU scheduling on every job",
        "A team with no cloud access at all",
      ],
      answer: 0,
      explain: "A small team gains the most from handing off operations work.",
    },
    {
      kind: "mcq",
      q: "Which habit best limits lock-in?",
      options: [
        "Calling platform SDKs throughout the training code",
        "Keeping models only in a proprietary format",
        "Keeping plain training code in a container, behind a thin wrapper",
        "Deleting the training code after deployment",
      ],
      answer: 2,
      explain: "Plain code behind a thin wrapper runs anywhere, so only the wrapper needs changing.",
    },
    {
      kind: "text",
      q: "A managed service adds $0.50 per hour per instance. For 10 instances over 730 hours, what's the premium in dollars?",
      format: "****",
      accept: ["3650", "3,650", "$3650", "$3,650"],
      explain: "$0.50 × 10 × 730 = $3,650.",
    },
  ],
};
