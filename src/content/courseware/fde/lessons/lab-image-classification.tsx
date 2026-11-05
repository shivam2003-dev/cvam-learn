import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 60,
  difficulty: "Hard",
  objectives: [
    "Fine-tune a managed pretrained image model with Amazon SageMaker JumpStart on a small dataset",
    "Prepare data in the folder-per-class layout and split it correctly",
    "Deploy a real-time endpoint, call it, and evaluate with a confusion matrix",
    "Control cost: budgets, instance choices and cleanup",
    "Write a one-page customer readout of results, limits and next steps",
  ],
  tasks: [
    {
      id: "scenario",
      title: "The scenario and what you will build",
      body: (
        <>
          <p>
            A manufacturing customer wants to detect surface defects on parts from photos taken on the
            line. They have a few hundred labelled images per class. Rather than train a network from
            scratch, you will <strong>fine-tune a pretrained image classification model</strong>,
            which adapts a model that already understands generic visual features to your classes
            with far less data and time.
          </p>
          <Figure caption="The lab pipeline. Each stage is a place something can go wrong, and each has a check.">
            <Flow
              numbered
              steps={[
                { title: "Prepare data", note: "Folder per class; train / validation / test split", tone: "sky" },
                { title: "Upload to S3", note: "Private bucket in your region", tone: "sky" },
                { title: "Fine-tune", note: "JumpStart estimator on a GPU instance", tone: "lime" },
                { title: "Deploy", note: "Real-time endpoint", tone: "lime" },
                { title: "Evaluate", note: "Confusion matrix on the untouched test set", tone: "amber" },
                { title: "Clean up", note: "Delete endpoint and resources", tone: "rose" },
              ]}
            />
          </Figure>
          <Callout tone="warn" title="This lab costs real money and needs your own account">
            Use a personal or sandbox AWS account, never a company or customer account. GPU training
            and always-on endpoints are billed by the hour. Set a budget alert first, choose the
            smallest instances that work, and complete the cleanup step even if something fails
            midway. A forgotten endpoint keeps charging.
          </Callout>
          <p>
            This is a <em>guided</em> lab: you run it in your own account. Console screens, JumpStart
            model IDs and SDK parameters change over time, so use the current SageMaker JumpStart
            documentation and model catalogue alongside this text and treat the values below as
            examples to confirm.
          </p>
        </>
      ),
    },
    {
      id: "setup",
      title: "Step 1: account, permissions and budget",
      body: (
        <>
          <ol>
            <li>Create a budget with an alert (for example $20) in AWS Billing, with an email notification.</li>
            <li>Pick one region that offers the GPU instance types you need and stay in it.</li>
            <li>Create an execution role for SageMaker with access to SageMaker and to one S3 bucket only (least privilege).</li>
            <li>Create a private S3 bucket with public access blocked and encryption on.</li>
            <li>Open SageMaker Studio or a notebook instance and check service quotas: training GPU instances often start at zero quota and need a request. Ask early.</li>
          </ol>
          <Table
            head={["Resource", "Suggested starting point", "Why"]}
            rows={[
              ["Training instance", "Smallest GPU training instance available in your region", "Fine-tuning a small model on a few hundred images needs little compute"],
              ["Endpoint instance", "A small CPU instance, or the smallest GPU if latency requires it", "A small image model can often be served on CPU for a demo"],
              ["Notebook instance", "Smallest general-purpose type", "It only orchestrates"],
              ["Data volume", "Under 1 GB", "Keeps transfer and storage trivial"],
            ]}
          />
        </>
      ),
    },
    {
      id: "data",
      title: "Step 2: prepare and split the data",
      body: (
        <>
          <p>
            Use a public dataset for the lab (a small defect, plant disease or object dataset with
            permissive licence), not customer images. JumpStart image classification models
            typically expect one folder per class. Confirm the exact layout the chosen model expects
            in its documentation.
          </p>
          <pre>
            <code>{`data/
  train/
    scratch/   img001.jpg  img002.jpg ...
    dent/      img101.jpg ...
    ok/        img201.jpg ...
  validation/
    scratch/ ...  dent/ ...  ok/ ...
  test/                      # NEVER used for training or tuning
    scratch/ ...  dent/ ...  ok/ ...`}</code>
          </pre>
          <pre>
            <code>{`# split.py: split each class 70 / 15 / 15, keeping a fixed random seed
import random, shutil, pathlib
random.seed(42)
src, dst = pathlib.Path("raw"), pathlib.Path("data")
for cls in [p for p in src.iterdir() if p.is_dir()]:
    files = sorted(cls.glob("*.jpg"))
    random.shuffle(files)
    n = len(files); a, b = int(n * .70), int(n * .85)
    for split, group in (("train", files[:a]), ("validation", files[a:b]), ("test", files[b:])):
        out = dst / split / cls.name
        out.mkdir(parents=True, exist_ok=True)
        for f in group:
            shutil.copy(f, out / f.name)`}</code>
          </pre>
          <ul>
            <li>If images come from the same part or session, split by part or session, not by image, to avoid near-duplicates leaking into the test set.</li>
            <li>Check class balance. If one class dominates, report per-class metrics, not overall accuracy.</li>
            <li>Upload with <code>aws s3 sync data s3://YOUR-BUCKET/defects/</code>.</li>
          </ul>
        </>
      ),
    },
    {
      id: "train",
      title: "Step 3: fine-tune with JumpStart",
      body: (
        <>
          <pre>
            <code>{`# In a SageMaker notebook. Confirm model_id and hyperparameter names in the JumpStart catalogue.
import sagemaker
from sagemaker.jumpstart.estimator import JumpStartEstimator

session = sagemaker.Session()
role = sagemaker.get_execution_role()
bucket = "YOUR-BUCKET"
train_uri = f"s3://{bucket}/defects/"          # the folder that contains train/ and validation/

model_id = "<an image-classification model id from the JumpStart catalogue>"

estimator = JumpStartEstimator(
    model_id=model_id,
    role=role,
    instance_type="<smallest GPU training instance you have quota for>",
    hyperparameters={"epochs": "5", "batch-size": "16"},   # names vary by model; check the docs
)
estimator.fit({"training": train_uri}, logs=True)`}</code>
          </pre>
          <p>Watch the training log. What you are looking for:</p>
          <Table
            head={["Observation", "Meaning", "Action"]}
            rows={[
              ["Validation accuracy rises, then plateaus", "Model has learned what the data allows", "Stop; more epochs will not help"],
              ["Training accuracy high, validation low", "Overfitting", "Fewer epochs, more data or augmentation, lower learning rate"],
              ["Both low", "Underfitting or a data problem", "Check labels and image quality; more epochs; different model"],
              ["Loss goes to NaN", "Unstable learning", "Lower the learning rate"],
              ["Job fails at start", "Quota, permissions or data layout", "Read the error; check role, bucket path and folder structure"],
            ]}
          />
        </>
      ),
    },
    {
      id: "deploy",
      title: "Step 4: deploy and call the endpoint",
      body: (
        <>
          <pre>
            <code>{`predictor = estimator.deploy(
    initial_instance_count=1,
    instance_type="<small instance type>",
)

import json
with open("data/test/dent/img501.jpg", "rb") as f:
    body = f.read()
resp = predictor.predict(body, {"ContentType": "application/x-image", "Accept": "application/json;verbose"})
print(json.loads(resp))      # class probabilities; response format depends on the model`}</code>
          </pre>
          <Figure caption="What the deployed endpoint looks like to the rest of the system. A real customer deployment would add authentication, a queue for bursts and monitoring around it.">
            <Graph
              label="Camera or app sends an image to an API layer which calls the SageMaker endpoint, with S3 for model artefacts and CloudWatch for metrics"
              cellW={196}
              cellH={100}
              nodeW={160}
              nodes={[
                { id: "cam", label: "Line camera", sub: "Captures part image", col: 0, row: 0, tone: "amber", shape: "pill" },
                { id: "api", label: "API layer", sub: "Auth, resize, validate", col: 1, row: 0, tone: "lime" },
                { id: "ep", label: "SageMaker endpoint", sub: "Fine-tuned classifier", col: 2, row: 0, tone: "lime" },
                { id: "s3", label: "S3", sub: "Model artefacts, images", col: 2, row: 1, tone: "sky", shape: "db" },
                { id: "cw", label: "CloudWatch", sub: "Latency, errors, invocations", col: 1, row: 1, tone: "plain" },
              ]}
              edges={[
                { from: "cam", to: "api", label: "image" },
                { from: "api", to: "ep", label: "invoke" },
                { from: "ep", to: "s3", dashed: true },
                { from: "ep", to: "cw", dashed: true },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "evaluate",
      title: "Step 5: evaluate honestly on the test set",
      body: (
        <>
          <pre>
            <code>{`import glob, json, collections
classes = ["dent", "ok", "scratch"]
conf = {t: collections.Counter() for t in classes}      # true class -> predicted counts

for true in classes:
    for path in glob.glob(f"data/test/{true}/*.jpg"):
        probs = json.loads(predictor.predict(open(path, "rb").read(),
                 {"ContentType": "application/x-image", "Accept": "application/json;verbose"}))
        pred = max(zip(probs["probabilities"], probs["labels"]))[1]     # adapt to the response format
        conf[true][pred] += 1

for t in classes:
    total = sum(conf[t].values())
    print(t, dict(conf[t]), f"recall={conf[t][t] / total:.2f}")`}</code>
          </pre>
          <p>Read the result as a customer would:</p>
          <Table
            head={["Metric", "Meaning", "Why a customer cares"]}
            rows={[
              ["Recall per defect class", "Of real defects, how many were caught", "Missed defects reach customers"],
              ["Precision per class", "Of flagged parts, how many were truly defective", "False alarms waste inspection time and scrap good parts"],
              ["Confusion between classes", "Which defects are mistaken for each other", "Points to labelling ambiguity or lookalike classes"],
              ["Confidence threshold effect", "Accept only predictions above a threshold; send others to a person", "Trade accuracy against workload"],
              ["Latency and cost per image", "Measured on the endpoint", "Determines line speed and budget"],
            ]}
          />
          <Exercise
            title="Interpret the matrix"
            task={
              <p>
                On 100 defective test parts the model catches 82 and misses 18, and it flags 30 good
                parts out of 400 as defective. The customer says a missed defect costs ten times a
                false alarm. What do you recommend?
              </p>
            }
          >
            <p>
              Recall on defects is 82%, and the false alarm rate is 7.5%. Given that a miss costs ten
              times a false alarm, <strong>lower the decision threshold</strong> so that more
              borderline parts are flagged: expected cost falls even if false alarms rise, up to the
              point where the extra false alarms cost more than the misses avoided. Compute the
              total expected cost on the validation set at several thresholds and choose the minimum,
              then confirm once on the test set. Also route low-confidence cases to a human inspector,
              and collect the misses to improve the training data.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "cleanup",
      title: "Step 6: clean up, and the customer readout",
      body: (
        <>
          <pre>
            <code>{`predictor.delete_endpoint()        # stops the hourly charge
# Also: stop notebook instances, delete unused models and endpoint configs,
# empty and delete the S3 bucket if you no longer need it, and check the Billing console tomorrow.`}</code>
          </pre>
          <p>
            Finish by writing a one-page readout as you would for a customer. A good structure:
          </p>
          <Table
            head={["Section", "Content"]}
            rows={[
              ["Question", "Can a fine-tuned model detect the three surface conditions from line photos well enough to assist inspection?"],
              ["Result", "Recall and precision per class on an untouched test set; confusion matrix; threshold analysis"],
              ["Method", "Dataset size and source, split method, model, epochs, instance types and training time"],
              ["Cost and speed", "Training cost, per-image latency, hourly endpoint cost and cost per thousand images"],
              ["Limits", "Lighting and camera differences, rare defect types, small test set, class imbalance"],
              ["Recommendation", "Pilot with a person confirming flagged parts, collect more varied images, retest, then consider automation"],
              ["Next steps", "Data collection plan, drift monitoring, retraining trigger, security and deployment review"],
            ]}
          />
        </>
      ),
    },
  ],
  takeaways: [
    "Fine-tuning a pretrained image model needs far less data and time than training from scratch.",
    "Prepare data carefully: folder-per-class layout, a fixed-seed split by part or session, and a test set that is never touched.",
    "Read training logs for overfitting and underfitting, and evaluate with per-class recall, precision and a confusion matrix.",
    "Choose decision thresholds from the relative cost of misses and false alarms, and route low-confidence cases to people.",
    "Control cost with budgets, small instances and cleanup, and finish with a one-page readout of results, limits and next steps.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why must the test set never be used for training or tuning?",
      options: [
        "It must give an honest estimate of performance on unseen data",
        "It would be too large",
        "Models cannot read it",
        "It would cost more",
      ],
      answer: 0,
      explain: "Using the test set to tune makes the final score optimistic.",
    },
    {
      kind: "mcq",
      q: "Training accuracy is 99% but validation accuracy is 71%. This most likely means:",
      options: ["Overfitting", "Underfitting", "A network error", "A perfect model"],
      answer: 0,
      explain: "The model memorised training data and does not generalise.",
    },
    {
      kind: "mcq",
      q: "A missed defect costs ten times a false alarm. What should you do with the threshold?",
      options: [
        "Lower it so borderline parts are flagged, choosing by total expected cost",
        "Raise it to avoid all alarms",
        "Ignore costs",
        "Remove the model",
      ],
      answer: 0,
      explain: "When misses are costlier, flagging more borderline cases minimises expected cost.",
    },
    {
      kind: "mcq",
      q: "What is the most important cleanup action after the lab?",
      options: [
        "Delete the endpoint so it stops incurring hourly charges",
        "Rename the bucket",
        "Restart the laptop",
        "Nothing",
      ],
      answer: 0,
      explain: "A running endpoint is billed continuously until deleted.",
    },
    {
      kind: "text",
      q: "Of 100 real defects, the model catches 82. What is the recall as a percentage?",
      format: "**%",
      accept: ["82", "82%", "0.82"],
      explain: "Recall = caught defects / all defects = 82 / 100 = 82%.",
    },
  ],
};
