import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Medium",
  objectives: [
    "Map workloads to Compute Engine, GKE, Cloud Run, Cloud Run functions, App Engine and Batch",
    "Choose machine families, custom machine types and pricing models (Spot, committed use)",
    "Select specialised compute: GPUs, TPUs, sole-tenant nodes, confidential VMs, VMware Engine",
    "Decide using control versus operations trade-offs",
  ],
  tasks: [
    {
      id: "spectrum",
      title: "The compute spectrum",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="compute-choices-diagram-1" />
          <Table
            head={["Service", "Best for", "Notes"]}
            rows={[
              ["Cloud Run functions", "Event-driven snippets reacting to Pub/Sub, Cloud Storage, HTTP, Eventarc", "Single-purpose, short-lived; scale to zero"],
              ["Cloud Run (services)", "Stateless HTTP/gRPC containers, APIs, web apps, microservices", "Scale to zero, concurrency per instance, min instances, per-request or instance billing, VPC egress"],
              ["Cloud Run jobs", "Batch tasks and scheduled jobs in containers", "Run to completion"],
              ["App Engine", "Existing PaaS apps (standard and flexible)", "Often superseded by Cloud Run for new work"],
              ["GKE Autopilot", "Kubernetes with Google managing nodes", "Pay per pod resources; hardened defaults"],
              ["GKE Standard", "Kubernetes needing node-level control, DaemonSets, GPUs, custom images", "You manage node pools"],
              ["Compute Engine", "Lift and shift, custom OS/kernel, licensed software, stateful monoliths, specialised hardware", "Full control and responsibility"],
              ["Batch", "Large-scale scheduled HPC and batch jobs", "Managed job scheduling over Compute Engine"],
              ["VMware Engine", "Existing VMware workloads moved with minimal change", "Managed vSphere/NSX/vSAN on Google Cloud"],
              ["Bare Metal Solution", "Specialised workloads such as Oracle needing dedicated hardware", "Low-latency connection to Google Cloud"],
            ]}
          />
        </>
      ),
    },
    {
      id: "gce",
      title: "Choosing Compute Engine resources",
      body: (
        <>
          <Table
            head={["Machine family", "Use"]}
            rows={[
              ["General purpose (E2, N2, N4, C3/C4 family, Tau T2D/T2A)", "Web servers, small databases, dev/test; balance price and performance (E2 cheapest; Tau for scale-out)"],
              ["Compute optimized (C2, H3)", "HPC, gaming, single-threaded and compute-bound workloads"],
              ["Memory optimized (M-series)", "In-memory databases such as SAP HANA, large analytics"],
              ["Storage optimized (Z3)", "High local SSD throughput workloads"],
              ["Accelerator optimized (A, G series)", "GPU for ML training/inference, graphics, transcoding"],
            ]}
          />
          <ul>
            <li><strong>Custom machine types</strong> let you set vCPU and memory independently to avoid paying for unused capacity.</li>
            <li><strong>Spot VMs</strong> give deep discounts (up to about 60 to 91 percent) but can be preempted with a 30 second notice and have no guaranteed availability. Use them for fault-tolerant batch, CI, rendering and stateless workers, with checkpointing.</li>
            <li><strong>Committed use discounts</strong> (1 or 3 years): resource-based for specific vCPU/memory or flexible spend-based commitments. <strong>Sustained use discounts</strong> apply automatically to some families for long-running usage.</li>
            <li><strong>Sole-tenant nodes</strong> give dedicated physical servers for licence compliance (bring-your-own licences) or isolation; <strong>Shielded VMs</strong> add boot integrity; <strong>Confidential VMs</strong> encrypt memory in use.</li>
            <li><strong>Live migration</strong> keeps most VMs running during host maintenance; GPU VMs generally need a terminate-and-restart maintenance policy.</li>
            <li>GPUs (NVIDIA) and TPUs are chosen by model size, framework and cost; see the AI lessons.</li>
          </ul>
        </>
      ),
    },
    {
      id: "decide",
      title: "How to decide",
      body: (
        <>
          <ol>
            <li><strong>Is it a short event handler?</strong> Cloud Run functions (or a Cloud Run service).</li>
            <li><strong>Is it a stateless container with HTTP or gRPC?</strong> Cloud Run first; it removes cluster operations.</li>
            <li><strong>Need Kubernetes APIs, operators, service mesh, GPUs on pods, multi-container pods with sidecars at scale?</strong> GKE (Autopilot unless you need node control).</li>
            <li><strong>Need an OS, kernel, licensed software, legacy app, or special hardware?</strong> Compute Engine, with MIGs for scale.</li>
            <li><strong>Existing VMware estate to move fast?</strong> VMware Engine.</li>
          </ol>
          <Callout tone="tip" title="Default to the most managed">
            Exam questions that stress low operational overhead, rapid scaling or small teams point to
            Cloud Run or GKE Autopilot. Questions that mention specific kernel modules, custom
            drivers, licence servers or stateful legacy software point to Compute Engine.
          </Callout>
          <Exercise
            title="Place the workloads"
            task={<p>(a) A nightly image-processing job that is fault tolerant and runs for 6 hours on 500 cores. (b) A public REST API with spiky traffic. (c) A commercial ERP that needs Windows and a licence server. Choose compute for each.</p>}
          >
            <p>
              (a) <strong>Spot VMs</strong> via Batch or a MIG with checkpointing: cheap and
              fault-tolerant. (b) <strong>Cloud Run</strong>: stateless, scale-to-zero, handles spikes
              with min instances if cold starts matter. (c) <strong>Compute Engine</strong> (possibly
              sole-tenant nodes for licensing), because of Windows, licensing and statefulness.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Prefer the most managed option that meets requirements: functions, Cloud Run, GKE Autopilot, then GKE Standard and Compute Engine.",
    "Use custom machine types to avoid waste and Spot VMs for fault-tolerant batch workloads.",
    "Committed use discounts reduce steady cost; sole-tenant nodes help with licensing and isolation.",
    "Match special needs: GPUs and TPUs for ML, M-series for in-memory databases, VMware Engine for VMware estates.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A stateless containerised API with unpredictable traffic and a small ops team. Best fit?",
      options: ["Cloud Run", "Compute Engine with manual scaling", "GKE Standard with custom nodes", "Bare Metal Solution"],
      answer: 0,
      explain: "Cloud Run is serverless, autoscaling and low-ops for stateless containers.",
    },
    {
      kind: "mcq",
      q: "Which VM type suits fault-tolerant batch jobs at the lowest price?",
      options: ["Spot VMs", "Sole-tenant nodes", "Confidential VMs", "Bare metal"],
      answer: 0,
      explain: "Spot VMs are discounted but can be preempted.",
    },
    {
      kind: "mcq",
      q: "A vendor requires dedicated physical hardware for licence compliance. Which option?",
      options: ["Sole-tenant nodes", "Cloud Run", "Preemptible VMs", "App Engine standard"],
      answer: 0,
      explain: "Sole-tenant nodes provide dedicated hosts for licensing and isolation.",
    },
    {
      kind: "mcq",
      q: "You need to set exactly 6 vCPUs and 20 GB RAM. What do you use?",
      options: ["Custom machine type", "Predefined machine type only", "Cloud Run jobs", "A bigger pre-defined family"],
      answer: 0,
      explain: "Custom machine types allow precise vCPU and memory sizing.",
    },
    {
      kind: "text",
      q: "Which Kubernetes mode on Google Cloud has Google manage the nodes for you?",
      format: "*********",
      accept: ["autopilot", "gke autopilot"],
      explain: "GKE Autopilot manages nodes and bills for pod resource requests.",
    },
  ],
};
