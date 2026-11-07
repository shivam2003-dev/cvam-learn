import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Hard",
  objectives: [
    "Design VPC networks with custom subnets, routes and firewall rules",
    "Choose between Shared VPC, VPC peering and Private Service Connect",
    "Provide private access to Google APIs and managed services",
    "Plan container networking for GKE and serverless connectivity",
    "Apply IP planning, Cloud NAT and DNS",
  ],
  tasks: [
    {
      id: "vpc",
      title: "VPC fundamentals",
      body: (
        <>
          <p>
            A Google Cloud <strong>VPC network is global</strong>; its <strong>subnets are
            regional</strong> and span all zones in the region. VMs in different regions of one VPC
            talk over internal IPs through Google&apos;s backbone with no gateway. Choose{" "}
            <strong>custom mode</strong> VPCs for production (auto mode creates a subnet in every
            region with fixed ranges that can overlap with your other networks).
          </p>
          <ul>
            <li><strong>Subnets</strong> support expansion (increase the prefix length) but not shrinking; secondary ranges serve GKE pods and services.</li>
            <li><strong>Routes:</strong> system-generated subnet and default routes, custom static routes, and dynamic routes via Cloud Router (BGP). Dynamic routing mode can be regional or global.</li>
            <li><strong>Firewall rules:</strong> stateful, allow/deny with priorities, targeted by network tags or service accounts (prefer service accounts). Implicit rules deny all ingress and allow all egress. Newer <strong>network firewall policies</strong> and <strong>hierarchical firewall policies</strong> (organization or folder) add central control; Cloud NGFW adds FQDN, geo and threat intelligence.</li>
            <li><strong>Cloud NAT</strong> gives VMs without external IPs outbound internet access (regional, through Cloud Router); it does not allow unsolicited inbound.</li>
            <li><strong>Private Google Access</strong> lets VMs without external IPs reach Google APIs; set per subnet.</li>
          </ul>
        </>
      ),
    },
    {
      id: "multi",
      title: "Connecting networks",
      body: (
        <>
          <Table
            head={["Option", "What it does", "Notes"]}
            rows={[
              ["Shared VPC", "A host project owns the VPC; service projects attach and use its subnets", "Central network team, many projects, one network; IAM roles (Compute Network User) per subnet"],
              ["VPC Network Peering", "Private RFC1918 connectivity between two VPCs (any project/organization)", "Non-transitive, no overlapping IP ranges, decentralised admin; can exchange custom routes"],
              ["Private Service Connect (PSC)", "Consumers create an endpoint (internal IP) to a producer's published service or to Google APIs", "Overlap-safe, unidirectional, no peering; also PSC backends and service attachments with NAT subnets"],
              ["Private services access", "VPC peering to Google-managed services (Cloud SQL private IP, Memorystore) using an allocated range", "Reserve a range; transitivity limits apply"],
              ["Network Connectivity Center", "Hub-and-spoke connectivity for VPCs and hybrid spokes", "Transitive routing between spokes, SD-WAN integration"],
              ["Cloud VPN / Interconnect", "Hybrid connectivity to on-premises or other clouds", "Next lesson"],
            ]}
          />
          <CloudDiagram course="gcp-pca" id="networking-design-diagram-1" />
          <Callout tone="tip" title="When to use which">
            Many teams, one organization, central governance: <strong>Shared VPC</strong>. Few
            independent teams or other organizations, simple full-network connectivity, no overlap:{" "}
            <strong>peering</strong>. Publish one service to many consumers or connect overlapping
            ranges: <strong>Private Service Connect</strong>. Many spokes with transitive routing and
            hybrid: <strong>Network Connectivity Center</strong>.
          </Callout>
        </>
      ),
    },
    {
      id: "containers",
      title: "Container and serverless networking",
      body: (
        <>
          <ul>
            <li><strong>GKE:</strong> VPC-native clusters use alias IP ranges (primary for nodes, secondary for pods and services). Plan pod ranges generously (each node reserves a block). <strong>Private clusters</strong> keep nodes without external IPs, with an authorized-network list or private endpoint for the control plane. <strong>Gateway API</strong> and Ingress create load balancers; Network Policy (Dataplane V2) restricts pod traffic; Cloud Service Mesh adds mTLS and traffic management.</li>
            <li><strong>Cloud Run and functions:</strong> use <strong>Direct VPC egress</strong> (or a Serverless VPC Access connector) to reach private resources; control ingress (internal, internal and Cloud Load Balancing, all). Use PSC or load balancers to expose privately.</li>
            <li><strong>Private IP to managed services:</strong> Cloud SQL private IP through private services access; Cloud SQL connectors and the Auth Proxy for secure access.</li>
            <li><strong>DNS:</strong> Cloud DNS public/private zones, forwarding zones and inbound/outbound server policies, DNS peering across VPCs, response policies, DNSSEC.</li>
            <li><strong>IP planning:</strong> allocate non-overlapping RFC1918 ranges across VPCs and on-premises; keep room for GKE pods and growth.</li>
          </ul>
          <Exercise
            title="Network design"
            task={<p>A company has 15 teams, each with its own project, all needing one shared production network with central firewall control. Workloads in GKE need private nodes and access to Cloud SQL by private IP. A SaaS vendor must be reached privately from some projects. What do you design?</p>}
          >
            <p>
              A <strong>Shared VPC</strong> host project with custom subnets per team and region,
              secondary ranges for GKE pods and services; <strong>hierarchical and network firewall
              policies</strong> managed centrally; <strong>private GKE clusters</strong> with Cloud NAT
              for egress; <strong>private services access</strong> (or PSC) for Cloud SQL;{" "}
              <strong>Private Google Access</strong> enabled; and a <strong>Private Service
              Connect endpoint</strong> for the vendor&apos;s published service.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "VPCs are global, subnets regional; use custom mode, global dynamic routing as needed, and service-account-targeted firewall rules.",
    "Shared VPC for central control, peering for simple non-transitive links, PSC for service publishing and overlap-safe access, NCC for hub-and-spoke.",
    "Private Google Access, Cloud NAT and private services access remove the need for external IPs.",
    "Plan GKE alias IP ranges and serverless VPC egress early.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which option lets many projects use one centrally managed VPC?",
      options: ["Shared VPC", "VPC Network Peering", "Cloud NAT", "Private Google Access"],
      answer: 0,
      explain: "Shared VPC lets service projects use subnets owned by a host project.",
    },
    {
      kind: "mcq",
      q: "VPC Network Peering between two VPCs with overlapping subnets:",
      options: ["Is not possible", "Works with NAT", "Works with Cloud Router", "Works if one is auto mode"],
      answer: 0,
      explain: "Peering requires non-overlapping IP ranges.",
    },
    {
      kind: "mcq",
      q: "What lets a VM without an external IP call Google APIs?",
      options: ["Private Google Access", "Cloud CDN", "Cloud Armor", "A static route to 0.0.0.0/0"],
      answer: 0,
      explain: "Private Google Access is enabled per subnet.",
    },
    {
      kind: "mcq",
      q: "How can a producer expose a service to many consumer VPCs including those with overlapping IP ranges?",
      options: ["Private Service Connect", "VPC peering", "Shared VPC", "Cloud VPN"],
      answer: 0,
      explain: "PSC gives consumers an internal endpoint and avoids routing between ranges.",
    },
    {
      kind: "text",
      q: "Which scope does a Google Cloud VPC network have: zonal, regional or global?",
      format: "******",
      accept: ["global"],
      explain: "VPC networks are global; subnets are regional.",
    },
  ],
};
