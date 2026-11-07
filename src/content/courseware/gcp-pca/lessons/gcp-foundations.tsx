import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Easy",
  objectives: [
    "Explain regions, zones and the scope of Google Cloud resources (zonal, regional, global)",
    "Describe the resource hierarchy: organization, folders, projects, resources",
    "Understand billing accounts, quotas and the shared responsibility and shared fate models",
    "Choose between locations for latency, availability and data residency",
  ],
  tasks: [
    {
      id: "geo",
      title: "Regions, zones and resource scope",
      body: (
        <>
          <p>
            Google Cloud runs in <strong>regions</strong> (independent geographic areas such as
            <code> europe-west4</code>), each with three or more <strong>zones</strong> (deployment
            areas such as <code>europe-west4-a</code>). Resources have a scope that decides their
            failure domain and how you design for availability:
          </p>
          <Table
            head={["Scope", "Examples", "Design meaning"]}
            rows={[
              ["Zonal", "Compute Engine VMs, zonal persistent disks, zonal GKE clusters", "A zone failure takes them down; use multiple zones"],
              ["Regional", "Subnets, regional MIGs, Cloud Run services, Cloud SQL HA, regional GKE, regional persistent disks", "Survives a zone failure inside the region"],
              ["Multi-regional / global", "VPC networks, global external load balancers, Cloud Storage multi-region, Spanner multi-region, BigQuery multi-region, firewall rules, images", "Survives a regional failure when the service itself is multi-regional"],
            ]}
          />
          <p>
            Google&apos;s network carries traffic privately between regions. Premium Tier networking
            keeps user traffic on Google&apos;s backbone from the nearest edge point; Standard Tier uses
            the public internet for most of the path and is cheaper but slower and regional.
          </p>
        </>
      ),
    },
    {
      id: "hierarchy",
      title: "The resource hierarchy",
      body: (
        <>
          <Figure caption="The hierarchy. IAM policies and organization policies attach at any level and are inherited downward; projects are the unit of resource ownership, billing linkage and API enablement.">
            <Graph
              label="Resource hierarchy: organization, folders, projects, resources"
              cellW={190}
              cellH={92}
              nodeW={150}
              nodes={[
                { id: "org", label: "Organization", sub: "example.com", col: 1.5, row: 0, tone: "amber" },
                { id: "f1", label: "Folder: Production", col: 0.5, row: 1, tone: "lime" },
                { id: "f2", label: "Folder: Development", col: 2.5, row: 1, tone: "lime" },
                { id: "p1", label: "Project: shop-prod", col: 0, row: 2, tone: "sky" },
                { id: "p2", label: "Project: data-prod", col: 1, row: 2, tone: "sky" },
                { id: "p3", label: "Project: shop-dev", col: 2.5, row: 2, tone: "sky" },
                { id: "r", label: "Resources", sub: "VMs, buckets, datasets", col: 1, row: 3, tone: "plain", shape: "pill" },
              ]}
              edges={[
                { from: "org", to: "f1" },
                { from: "org", to: "f2" },
                { from: "f1", to: "p1" },
                { from: "f1", to: "p2" },
                { from: "f2", to: "p3" },
                { from: "p2", to: "r" },
              ]}
            />
          </Figure>
          <ul>
            <li><strong>Organization</strong> is the root, tied to a Cloud Identity or Google Workspace domain. It enables central IAM, organization policies, and visibility.</li>
            <li><strong>Folders</strong> group projects (by environment, team, business unit) and carry policies.</li>
            <li><strong>Projects</strong> have a unique project ID (immutable), project number and name. APIs are enabled per project; quotas and most billing reports are per project.</li>
            <li>Every project links to a <strong>Cloud Billing account</strong>. Separating billing accounts per business unit helps chargeback.</li>
            <li>Policy is <em>inherited</em> and combined: a role granted on a folder applies to every project beneath. You cannot remove an inherited allow at a lower level (use IAM deny policies or a different placement).</li>
          </ul>
        </>
      ),
    },
    {
      id: "shared",
      title: "Responsibility, shared fate and quotas",
      body: (
        <>
          <ul>
            <li><strong>Shared responsibility:</strong> Google secures the infrastructure; you secure your identities, data, configuration and workloads. The split moves with the service model (IaaS, PaaS, serverless).</li>
            <li><strong>Shared fate:</strong> Google also provides blueprints, secure-by-default settings, landing zones and guidance (the Architecture Center and enterprise foundations blueprint) rather than only a boundary of responsibility.</li>
            <li><strong>Quotas</strong> limit resource creation (CPUs per region, API rates) per project; request increases early for big launches. Budgets and alerts warn about spend but do not stop spending by default.</li>
            <li><strong>Location choice</strong> balances latency to users, availability needs, data residency law, service availability and price.</li>
          </ul>
          <Callout tone="tip" title="Enterprise foundations">
            A recommended foundation: an organization with folders per environment, separate projects
            for shared networking (Shared VPC host), logging, security tooling and each workload,
            centrally managed IAM groups, organization policies for guardrails, and Terraform
            to create everything.
          </Callout>
          <Exercise
            title="Placement"
            task={<p>A company has a production web application and a data science team. Both need different admins, separate billing visibility, and a shared network. How would you structure projects and folders?</p>}
          >
            <p>
              Folders per environment or business domain (for example Production and Data Science).
              Separate projects: a Shared VPC <em>host</em> project for the network, one service
              project for the web application, one for data science, plus a central logging project
              and a security project. Grant admin groups at folder or project level, link projects to
              billing accounts (or labels/budgets per project) for cost visibility, and attach
              organization policies at the folder.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Know the scope of each resource (zonal, regional, global) to design for failure domains.",
    "Organization → folders → projects → resources; policies inherit downward and projects anchor APIs, quotas and billing.",
    "Premium Tier networking uses Google's backbone; Standard Tier is cheaper and regional.",
    "Shared responsibility defines the boundary; shared fate adds Google's blueprints and secure defaults.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which of these is a global resource?",
      options: ["VPC network", "Subnet", "Compute Engine VM", "Zonal persistent disk"],
      answer: 0,
      explain: "VPC networks are global; subnets are regional; VMs and zonal disks are zonal.",
    },
    {
      kind: "mcq",
      q: "At what level can an IAM role grant access to all projects in a business unit?",
      options: ["Folder", "Resource", "Zone", "Subnet"],
      answer: 0,
      explain: "A folder-level role is inherited by all projects in that folder.",
    },
    {
      kind: "mcq",
      q: "Which value of a project cannot be changed after creation?",
      options: ["Project ID", "Project name", "Labels", "Billing account link"],
      answer: 0,
      explain: "The project ID is immutable and globally unique.",
    },
    {
      kind: "mcq",
      q: "Which network service tier keeps user traffic on Google's backbone from the nearest edge?",
      options: ["Premium Tier", "Standard Tier", "Basic Tier", "Edge Tier"],
      answer: 0,
      explain: "Premium Tier uses Google's global network; Standard uses the internet for most of the path.",
    },
    {
      kind: "text",
      q: "What is the root node of the Google Cloud resource hierarchy called?",
      format: "************",
      accept: ["organization", "the organization", "organisation"],
      explain: "The organization resource is the root, tied to a Cloud Identity or Workspace domain.",
    },
  ],
};
