import { ACCOUNT } from "../kit/builder";
import { makeLesson } from "../kit/makeLesson";

export const lesson = makeLesson({
  minutes: 26,
  difficulty: "Hard",
  context: "Microservice platforms, internal developer platforms, SaaS back ends and any team that deploys many services several times a day.",
  objectives: [
    "Describe the parts of a managed Kubernetes platform and who operates each",
    "Place registry, cluster, ingress, autoscaling and private data services",
    "Explain horizontal pod autoscaling versus node autoscaling",
    "Compare the managed Kubernetes offering on each cloud",
  ],
  problem: [
    "A team runs 40 services. Servers are hand-built, deployments take an afternoon and one noisy service starves its neighbours. They want to package each service once, deploy it anywhere in minutes and let the platform restart and scale it.",
    "Managed Kubernetes provides that: you describe the desired state, the control plane keeps reality matching it, and the cloud runs the control plane for you.",
  ],
  diagramTitle: "Containers on managed Kubernetes with private data services",
  arch: {
    width: 960,
    height: 470,
    groups: [
      { id: "acct", kind: "region", x: 120, y: 20, w: 820, h: 430, label: ACCOUNT, step: 1 },
      { id: "cluster", kind: "network", x: 300, y: 70, w: 440, h: 360, label: { aws: "EKS cluster", azure: "AKS cluster", gcp: "GKE cluster", oci: "OKE cluster" }, step: 2 },
      { id: "hpa", kind: "scaling", x: 340, y: 120, w: 360, h: 140, label: "Horizontal pod autoscaler: more pods when busy", step: 5 },
    ],
    nodes: [
      { id: "registry", svc: "registry", x: 205, y: 380, step: 1 },
      { id: "users", svc: "users", x: 55, y: 230, step: 3 },
      { id: "lb", svc: "lb", x: 205, y: 230, step: 3, label: "Ingress load balancer" },
      { id: "cp", svc: "k8s", x: 410, y: 340, step: 2, label: "Managed control plane" },
      { id: "web", svc: "container", x: 410, y: 190, step: 4, label: "Web pods" },
      { id: "api", svc: "container", x: 600, y: 190, step: 4, label: "API pods" },
      { id: "worker", svc: "container", x: 600, y: 340, step: 4, label: "Worker pods" },
      { id: "db", svc: "db", x: 850, y: 190, step: 6 },
      { id: "cache", svc: "cache", x: 850, y: 340, step: 6 },
    ],
    edges: [
      { from: "users", to: "lb", step: 3, num: 1 },
      { from: "lb", to: "web", step: 3, num: 2, via: [[205, 190]], label: "ingress" },
      { from: "web", to: "api", step: 4, num: 3 },
      { from: "api", to: "worker", step: 4, label: "jobs" },
      { from: "api", to: "db", step: 6, num: 4, label: "private" },
      { from: "worker", to: "cache", step: 6 },
      { from: "registry", to: "cp", step: 4, dashed: true, label: "image pulls", via: [[205, 340]] },
    ],
    steps: [
      {
        title: "Start with a registry",
        body: "Every service is built into an image once and stored in a private registry. The same image runs in test and production, which removes 'works on my machine'.",
        points: ["Tag images with the commit ID, never 'latest'.", "Scan images for vulnerabilities on push and block critical findings."],
        per: {
          aws: "AWS: Elastic Container Registry (ECR) with image scanning and lifecycle policies.",
          azure: "Azure: Azure Container Registry with Defender scanning and geo-replication.",
          gcp: "Google Cloud: Artifact Registry with vulnerability scanning and Binary Authorization.",
          oci: "OCI: Container Registry (OCIR) with vulnerability scanning.",
        },
      },
      {
        title: "Create the managed cluster",
        body: "The cloud runs the control plane (API server, scheduler, etcd) for you and keeps it highly available. You own the worker nodes and what runs on them.",
        points: ["Use private nodes and restrict the API endpoint to your network.", "Upgrade often: Kubernetes versions leave support within about a year."],
        per: {
          aws: "AWS: EKS runs the control plane; nodes are managed node groups or Fargate profiles.",
          azure: "Azure: AKS has a free control plane tier and node pools per workload type.",
          gcp: "Google Cloud: GKE Autopilot manages nodes for you; Standard gives node-level control.",
          oci: "OCI: OKE basic clusters have no control-plane charge; nodes are managed or virtual node pools.",
        },
      },
      {
        title: "Expose services through an ingress",
        body: "A load balancer outside the cluster sends traffic to an ingress controller, which routes by host and path to the right service.",
        points: ["Terminate TLS at the ingress and rotate certificates automatically.", "Keep the services themselves internal (ClusterIP); only the ingress is public."],
        per: {
          aws: "AWS: AWS Load Balancer Controller creates an ALB from an Ingress resource.",
          azure: "Azure: Application Gateway for Containers or the managed NGINX ingress add-on.",
          gcp: "Google Cloud: the GKE Ingress and Gateway controllers create Cloud Load Balancing resources.",
          oci: "OCI: OKE creates an OCI Load Balancer from a Service of type LoadBalancer or an ingress controller.",
        },
      },
      {
        title: "Run workloads as deployments",
        body: "Each service is a deployment of identical pods. Kubernetes restarts failed pods, spreads them across nodes and zones and rolls out new versions gradually.",
        points: ["Set CPU and memory requests and limits on every container, or one pod can starve the node.", "Add readiness and liveness probes so traffic only reaches healthy pods.", "Spread pods across zones with topology spread constraints."],
        per: {
          aws: "AWS: pods get VPC IP addresses by default, so size subnets generously.",
          azure: "Azure: AKS uses Azure CNI Overlay or Azure CNI with VNet IPs; pick before you create the cluster.",
          gcp: "Google Cloud: GKE uses VPC-native clusters with alias IP ranges for pods and services.",
          oci: "OCI: OKE uses VCN-native pod networking or flannel overlay.",
        },
      },
      {
        title: "Scale pods and nodes automatically",
        body: "The pod autoscaler adds replicas as load rises. When nodes run out of room, the node autoscaler adds machines; when idle, it removes them.",
        points: ["Scale pods on CPU, memory or a custom metric such as queue depth.", "Set a PodDisruptionBudget so scale-down and upgrades never take every replica at once."],
        per: {
          aws: "AWS: Karpenter or Cluster Autoscaler adds EC2 nodes; Fargate removes node management entirely.",
          azure: "Azure: the AKS cluster autoscaler and Node Auto Provisioning (Karpenter-based) add nodes; KEDA scales on events.",
          gcp: "Google Cloud: GKE Autopilot scales nodes for you; Standard uses the cluster autoscaler or node auto-provisioning.",
          oci: "OCI: the OKE cluster autoscaler and virtual nodes add capacity on demand.",
        },
      },
      {
        title: "Keep data services private",
        body: "Databases and caches are managed services outside the cluster, reachable only over private addresses from the pods that need them.",
        points: ["Do not store state on pods; a pod can be replaced at any moment.", "Give each service its own identity and database credentials, fetched at runtime rather than baked into images."],
        per: {
          aws: "AWS: RDS and ElastiCache in private subnets; IAM Roles for Service Accounts give pods temporary credentials.",
          azure: "Azure: Azure Database and Cache for Redis with Private Endpoints; Workload Identity gives pods Entra tokens.",
          gcp: "Google Cloud: Cloud SQL and Memorystore on private IPs; Workload Identity Federation maps Kubernetes accounts to IAM.",
          oci: "OCI: Database and cache on private subnets; workload identity lets pods call OCI APIs without keys.",
        },
      },
    ],
  },
  notes: {
    aws: ["EKS charges for the control plane and leaves nodes to you; Fargate profiles remove nodes but limit daemonsets and host access.", "ECS is a simpler AWS-native alternative if you do not need the Kubernetes ecosystem."],
    azure: ["AKS Automatic configures networking, scaling and security defaults for you and suits teams new to Kubernetes.", "Azure Container Apps (built on Kubernetes and KEDA) hides the cluster entirely for simpler microservices."],
    gcp: ["Autopilot bills per pod resource request rather than per node, which suits spiky or poorly packed workloads.", "Cloud Run runs containers without any cluster and is often the better first choice for stateless services."],
    oci: ["Virtual nodes in OKE are serverless: you pay per pod and never patch a node.", "OKE integrates with OCI Vault and Service Mesh, and clusters can use a mix of Arm and x86 shapes."],
  },
  decisions: [
    { title: "Kubernetes or something simpler", text: "Kubernetes pays off with many services and platform teams. For a handful of stateless services, serverless containers (Cloud Run, Container Apps, Fargate) are cheaper to run and to learn." },
    { title: "One cluster or many", text: "Separate clusters isolate production and give a smaller blast radius for upgrades; namespaces are not a hard security boundary." },
    { title: "Requests and limits", text: "Requests decide scheduling; limits cap use. Wrong values cause either wasted money or evictions." },
    { title: "Secrets", text: "Do not bake secrets into images or manifests. Use an external secrets operator or the cloud's secret store with workload identity." },
  ],
  exercise: {
    title: "The upgrade that took everything down",
    task: "A node upgrade drains nodes one by one and the API service has two pods, both on the same node. Users see errors for a minute. What three changes prevent this?",
    answer: [
      "Spread replicas across nodes and zones with topology spread constraints or pod anti-affinity.",
      "Add a PodDisruptionBudget (for example minAvailable: 1) so a drain waits until another replica is ready.",
      "Run at least three replicas and use readiness probes so traffic only goes to pods that can serve it.",
      "Surge extra nodes during the upgrade so there is capacity for rescheduled pods.",
    ],
  },
  takeaways: [
    "Build images once, store them in a private registry and scan them.",
    "The cloud runs the control plane; you own nodes (or use serverless nodes), workloads and upgrades.",
    "Ingress is the only public door; services and data stay private.",
    "Scale pods with an autoscaler and nodes with a node autoscaler.",
    "Set requests, limits, probes and disruption budgets on every workload.",
  ],
  quiz: [
    { kind: "mcq", q: "Who operates the Kubernetes control plane in a managed service such as EKS, AKS, GKE or OKE?", options: ["The cloud provider", "You, on your own VMs", "The registry", "The ingress"], answer: 0, explain: "Managed services run and patch the control plane; you manage worker nodes and workloads." },
    { kind: "mcq", q: "What does a PodDisruptionBudget protect against?", options: ["Too many replicas being taken down at once during drains", "Image vulnerabilities", "DNS failures", "Expired certificates"], answer: 0, explain: "It limits voluntary disruptions so a minimum number of pods stay available." },
    { kind: "mcq", q: "Which is the better first choice for a few stateless services with no Kubernetes needs?", options: ["Serverless containers", "A self-built cluster", "A single VM", "A mainframe"], answer: 0, explain: "Cloud Run, Container Apps and Fargate remove cluster operations." },
    { kind: "text", q: "What do you tag images with, instead of 'latest', so a deployment is traceable? (one word, a git concept)", format: "******", accept: ["commit", "commit id", "sha", "commit sha", "hash"], explain: "Tag with the commit ID so every running image maps to exact source code." },
  ],
});
