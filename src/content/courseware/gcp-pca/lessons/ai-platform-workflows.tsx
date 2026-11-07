import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Describe an end-to-end ML lifecycle on the Agent Platform: data, training, evaluation, deployment, monitoring",
    "Use pipelines to automate and orchestrate ML workflows",
    "Prepare data integration with BigQuery, Cloud Storage and feature management",
    "Choose GPUs, TPUs and consumption models for training and serving",
    "Run large-scale training and design cost-aware inference",
  ],
  tasks: [
    {
      id: "lifecycle",
      title: "The ML lifecycle",
      body: (
        <>
          <Figure caption="ML lifecycle on a managed platform. Pipelines turn the loop into automated, repeatable runs.">
            <Flow
              numbered
              steps={[
                { title: "Prepare data", note: "BigQuery, Cloud Storage, Feature Store", tone: "sky" },
                { title: "Train / tune", note: "Custom jobs, AutoML-style, fine-tuning", tone: "lime" },
                { title: "Evaluate", note: "Metrics, bias, comparison", tone: "amber" },
                { title: "Register + deploy", note: "Model Registry, endpoints, batch", tone: "lime" },
                { title: "Monitor", note: "Drift, skew, quality, cost", tone: "rose" },
              ]}
            />
          </Figure>
          <p>
            The exam guide names the <strong>Gemini Enterprise Agent Platform</strong> (earlier
            Vertex AI) for end-to-end workflows and <strong>Agent Platform Pipelines</strong> to
            automate and orchestrate the lifecycle. Pipelines are defined as code (Kubeflow Pipelines
            or TFX components), run serverlessly, track lineage and artifacts, and are triggered by
            schedules, events or CI/CD.
          </p>
        </>
      ),
    },
    {
      id: "data",
      title: "Data integration and platform services",
      body: (
        <>
          <Table
            head={["Need", "Service / feature"]}
            rows={[
              ["Training data from the warehouse", "BigQuery datasets read directly by training jobs; BigQuery ML for in-database models"],
              ["Large files for training", "Cloud Storage with Cloud Storage FUSE or data loaders; Parallelstore/Managed Lustre for high throughput"],
              ["Reusable features online and offline", "Feature Store capabilities backed by BigQuery and online serving"],
              ["Experiments and notebooks", "Workbench / Colab Enterprise, experiment tracking, TensorBoard"],
              ["Model storage and governance", "Model Registry with versions, aliases, evaluation and deployment tracking"],
              ["Serving", "Online endpoints (autoscaling, traffic split), batch prediction, private endpoints; Cloud Run or GKE for custom serving"],
              ["Monitoring", "Model Monitoring for skew and drift; Cloud Logging and Monitoring for endpoints"],
              ["Integration", "Pub/Sub and Dataflow for streaming features, Cloud Run functions to trigger pipelines"],
            ]}
          />
          <Callout tone="note" title="Security and governance">
            Run training in a dedicated service account with least privilege; use private service
            access or Private Service Connect for endpoints, CMEK for datasets and models, and VPC
            Service Controls to prevent exfiltration of data and models.
          </Callout>
        </>
      ),
    },
    {
      id: "hypercomputer",
      title: "AI Hypercomputer: accelerators and consumption",
      body: (
        <>
          <Table
            head={["Choice", "Options", "Use"]}
            rows={[
              ["Accelerator", "NVIDIA GPUs (A- and G-series VMs), Google TPUs", "GPUs for broad framework support and flexibility; TPUs for large-scale training/inference with strong price-performance on supported frameworks (JAX, PyTorch/XLA, TensorFlow)"],
              ["Orchestration", "GKE with GPU/TPU node pools, Slurm, Cluster Director, Vertex custom jobs", "Large training clusters and schedulers"],
              ["Storage and data", "Cloud Storage FUSE, Parallelstore/Managed Lustre, Hyperdisk ML", "Feed accelerators without bottlenecks"],
              ["Networking", "High-bandwidth, low-latency fabrics and compact placement", "Multi-node distributed training"],
              ["Consumption", "On-demand, Spot, reservations and committed use, Dynamic Workload Scheduler (flex-start / calendar)", "Match cost and availability to the workload"],
              ["Serving", "GPU/TPU endpoints, vLLM-style serving on GKE, autoscaling, quantisation, batching", "Throughput and latency at lower cost"],
            ]}
          />
          <ul>
            <li><strong>Large training:</strong> distribute across many accelerators (data, tensor, pipeline parallelism), checkpoint frequently to Cloud Storage so jobs survive preemption, use compact placement.</li>
            <li><strong>Fine-tuning versus training from scratch:</strong> prefer tuning an existing model; far cheaper.</li>
            <li><strong>Cost levers:</strong> Spot or flex-start capacity for fault-tolerant training; reservations for predictable large runs; right-size serving with smaller models, distillation and caching.</li>
          </ul>
          <Exercise
            title="Pick the capacity"
            task={<p>A team must fine-tune a large model for 12 hours weekly on 64 accelerators and is cost-sensitive but can wait for capacity. A separate production endpoint needs steady low latency. Choose consumption models.</p>}
          >
            <p>
              Weekly training: <strong>Dynamic Workload Scheduler (flex-start or calendar mode)</strong>{" "}
              or Spot capacity with frequent checkpoints, which suits flexible start times and saves
              cost. Production serving: <strong>reserved or committed capacity</strong> (or an
              on-demand endpoint with autoscaling and minimum replicas) to guarantee availability and
              latency.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Automate the ML lifecycle with pipelines: prepare data, train, evaluate, register, deploy, monitor.",
    "Integrate data from BigQuery and Cloud Storage; use a registry, endpoints, batch prediction and monitoring.",
    "Pick GPUs or TPUs by framework, scale and cost, and match consumption (on-demand, Spot, reservations, flex-start) to the workload.",
    "Secure ML with least privilege, CMEK, private endpoints and VPC Service Controls.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does an ML pipeline provide?",
      options: ["Automated, repeatable orchestration of lifecycle steps with lineage", "Cheaper GPUs", "A VPN", "Automatic IAM"],
      answer: 0,
      explain: "Pipelines define and run workflow steps as code with tracked artifacts.",
    },
    {
      kind: "mcq",
      q: "Flexible-start training capacity with a lower price for fault-tolerant jobs is best matched by:",
      options: ["Dynamic Workload Scheduler or Spot capacity", "Sole-tenant nodes", "Bare Metal Solution", "Cloud Run"],
      answer: 0,
      explain: "DWS and Spot match interruptible, flexibly scheduled training.",
    },
    {
      kind: "mcq",
      q: "To survive preemption during long training you should:",
      options: ["Checkpoint frequently to Cloud Storage", "Disable autoscaling", "Use a single GPU", "Reduce IAM roles"],
      answer: 0,
      explain: "Checkpoints let a job resume after interruptions.",
    },
    {
      kind: "mcq",
      q: "Which accelerator is Google's custom chip for ML?",
      options: ["TPU", "NIC", "Local SSD", "ENA"],
      answer: 0,
      explain: "Tensor Processing Units are Google's ML accelerators.",
    },
    {
      kind: "text",
      q: "Which store holds model versions with evaluation and deployment tracking?",
      format: "***** ********",
      accept: ["model registry"],
      explain: "The Model Registry manages versions, aliases and lineage.",
    },
  ],
};
