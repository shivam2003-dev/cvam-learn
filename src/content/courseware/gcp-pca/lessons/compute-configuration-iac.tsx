import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Configure managed instance groups with templates, autoscaling, autohealing and rolling updates",
    "Choose GKE Autopilot or Standard, regional clusters, private clusters and release channels",
    "Configure serverless networking and scaling for Cloud Run and functions",
    "Automate patching and provisioning with VM Manager, Terraform and Infrastructure Manager",
    "Use Spot versus standard capacity safely",
  ],
  tasks: [
    {
      id: "mig",
      title: "Compute Engine at scale",
      body: (
        <>
          <p>
            A <strong>managed instance group (MIG)</strong> creates identical VMs from an{" "}
            <strong>instance template</strong>. Choose <em>zonal</em> or <em>regional</em> (spread across
            zones) MIGs; regional is the default choice for availability.
          </p>
          <ul>
            <li><strong>Autoscaling</strong> on CPU, load balancer utilisation, Cloud Monitoring metrics, queue depth or schedules; set a cool-down period and min/max.</li>
            <li><strong>Autohealing</strong> recreates VMs that fail an application health check (not just VM running state).</li>
            <li><strong>Updates:</strong> rolling update with max surge/max unavailable, canary (partial) updates, proactive or opportunistic mode; replace instances rather than patching in place.</li>
            <li><strong>Stateful MIGs</strong> preserve disks, names and metadata across recreation for databases and licensed servers.</li>
            <li><strong>Spot VMs:</strong> in a separate MIG or a mixed fleet using flexible provisioning; handle the preemption notice and keep stateless.</li>
            <li><strong>Images:</strong> golden images or startup scripts; Image families; Shielded VM and Confidential VM options; OS Login for SSH.</li>
          </ul>
          <CloudDiagram course="gcp-pca" id="compute-configuration-iac-diagram-1" />
        </>
      ),
    },
    {
      id: "gke",
      title: "GKE and serverless configuration",
      body: (
        <>
          <Table
            head={["Decision", "Options", "Guidance"]}
            rows={[
              ["Mode", "Autopilot or Standard", "Autopilot unless you need node access, privileged pods or specific machine types"],
              ["Location", "Zonal or regional cluster", "Regional for control plane and node high availability"],
              ["Network", "VPC-native, private cluster, authorized networks, Dataplane V2 network policy", "Private nodes, restricted control-plane access"],
              ["Identity", "Workload Identity Federation for GKE", "Bind Kubernetes service accounts to IAM; no node keys"],
              ["Upgrades", "Release channels (rapid, regular, stable), maintenance windows, surge upgrades", "Regular/stable for production"],
              ["Scaling", "HPA, VPA, cluster autoscaler or node auto-provisioning; Autopilot automatic", "Right-size requests and limits"],
              ["Security", "Shielded nodes, Binary Authorization, Pod Security, secrets in Secret Manager", "Defence in depth"],
              ["Fleet", "GKE Enterprise: fleets, Config Sync, Policy Controller, Cloud Service Mesh", "Many clusters, multi-cloud, governance"],
            ]}
          />
          <ul>
            <li><strong>Cloud Run:</strong> set min/max instances, concurrency, CPU allocation (request-based or always-on), memory, timeout, ingress and VPC egress; use revisions and traffic splitting for canaries; secrets via Secret Manager; use a dedicated service account.</li>
            <li><strong>Cloud Run functions:</strong> choose triggers (HTTP, Pub/Sub, Cloud Storage, Eventarc); watch concurrency and cold start; avoid long-running work.</li>
            <li><strong>App Engine:</strong> standard (sandboxed, scales to zero) versus flexible (containers on VMs).</li>
            <li><strong>VMware Engine:</strong> private cloud networking through VPC peering/private services access and HCX for migration.</li>
          </ul>
        </>
      ),
    },
    {
      id: "iac",
      title: "Provisioning, patching and orchestration",
      body: (
        <>
          <ul>
            <li><strong>Terraform</strong> is the primary IaC tool (Google provider and Cloud Foundation Toolkit modules); <strong>Infrastructure Manager</strong> runs Terraform as a managed service; Config Connector manages resources through Kubernetes manifests; Deployment Manager is legacy.</li>
            <li><strong>State:</strong> store Terraform state in a Cloud Storage bucket with versioning and locking; review plans in CI; separate state per environment.</li>
            <li><strong>Patch management:</strong> <strong>VM Manager</strong> (OS Config) schedules patch deployments, inventory and compliance reporting; prefer replacing instances from new images in MIGs.</li>
            <li><strong>Orchestration of configuration:</strong> startup scripts, custom images with Packer, Ansible/Chef for existing tooling; Cloud Scheduler, Workflows and Eventarc for operational automation.</li>
            <li><strong>Service catalog:</strong> publish approved Terraform modules or Service Catalog solutions so teams self-serve compliant resources.</li>
          </ul>
          <Callout tone="tip" title="Immutable infrastructure">
            Build a new image and roll it out through the MIG instead of logging in and patching.
            Combined with autohealing and health checks this makes fleets consistent and recoverable.
          </Callout>
          <Exercise
            title="Update safely"
            task={<p>A regional MIG of 30 web VMs must roll out a new image with no capacity loss and the ability to test on a few instances first. How do you configure the update?</p>}
          >
            <p>
              Create a new instance template with the new image and start a <strong>rolling
              update</strong> with <strong>max unavailable = 0</strong> and a surge (for example
              3 or 10 percent) so new VMs are created before old ones are removed. Use a{" "}
              <strong>canary update</strong> by applying the new template to a small target size first,
              watch health and metrics, then finish the rollout. Autohealing and load balancer
              connection draining prevent traffic to unhealthy VMs.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "MIGs: templates, regional spread, autoscaling, application-level autohealing and rolling or canary updates.",
    "GKE: Autopilot by default, regional private clusters, Workload Identity Federation, release channels, fleet governance.",
    "Cloud Run: concurrency, min/max instances, VPC egress, revisions with traffic splitting.",
    "Terraform and Infrastructure Manager for provisioning, VM Manager for patching, immutable images for rollout.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How do you replace unhealthy VMs automatically based on an application check?",
      options: ["MIG autohealing with a health check", "Cloud NAT", "Cloud Scheduler", "Snapshot schedules"],
      answer: 0,
      explain: "Autohealing recreates instances failing the configured health check.",
    },
    {
      kind: "mcq",
      q: "Which GKE feature maps Kubernetes service accounts to IAM service accounts without keys?",
      options: ["Workload Identity Federation for GKE", "Node SSH keys", "Basic auth", "Static API keys"],
      answer: 0,
      explain: "Workload Identity Federation for GKE gives pods short-lived IAM credentials.",
    },
    {
      kind: "mcq",
      q: "You must roll out a new image keeping full capacity. Which MIG update settings?",
      options: ["Max unavailable 0 with surge", "Max surge 0 and max unavailable 100%", "Recreate all at once", "Delete the group"],
      answer: 0,
      explain: "A surge with zero unavailable adds new instances before removing old ones.",
    },
    {
      kind: "mcq",
      q: "Which service schedules OS patching and reports compliance for VMs?",
      options: ["VM Manager (OS Config)", "Cloud Build", "Cloud Armor", "Dataplex"],
      answer: 0,
      explain: "VM Manager provides patch management, inventory and OS policies.",
    },
    {
      kind: "text",
      q: "Which managed service runs Terraform deployments on Google Cloud?",
      format: "************** *******",
      accept: ["infrastructure manager"],
      explain: "Infrastructure Manager is the managed Terraform service.",
    },
  ],
};
