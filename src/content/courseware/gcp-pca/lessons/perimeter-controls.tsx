import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Hard",
  objectives: [
    "Use VPC Service Controls to build service perimeters that prevent data exfiltration",
    "Apply Organization Policy constraints as guardrails",
    "Layer hierarchical firewall policies, network firewall policies and Cloud NGFW",
    "Provide secure remote access with Identity-Aware Proxy, context-aware access and Chrome Enterprise Premium",
    "Use service account impersonation and Workload Identity Federation instead of keys",
  ],
  tasks: [
    {
      id: "vpcsc",
      title: "VPC Service Controls",
      body: (
        <>
          <p>
            IAM answers <em>who</em> may call an API; <strong>VPC Service Controls (VPC SC)</strong>{" "}
            answers <em>from where</em>. You define a <strong>service perimeter</strong> around
            projects and the Google APIs (such as Cloud Storage, BigQuery) they use. API calls that
            cross the perimeter (from the internet, other projects, or to unauthorised projects) are
            blocked even with valid credentials, mitigating stolen credentials, misconfigured IAM and
            insider exfiltration.
          </p>
          <CloudDiagram course="gcp-pca" id="perimeter-controls-diagram-1" />
          <ul>
            <li><strong>Access levels</strong> (from Access Context Manager) allow requests by IP range, device posture or identity.</li>
            <li><strong>Ingress and egress rules</strong> permit specific cross-perimeter flows (for example a partner project, or a Cloud Build in another project).</li>
            <li><strong>Perimeter bridges / dry-run mode</strong>: test with dry run and review violation logs before enforcing.</li>
            <li>Use <code>restricted.googleapis.com</code> VIPs or PSC for Google APIs so on-premises traffic stays in the perimeter.</li>
          </ul>
        </>
      ),
    },
    {
      id: "policy",
      title: "Organization policy and firewalls",
      body: (
        <>
          <Table
            head={["Control", "Purpose", "Examples"]}
            rows={[
              ["Organization Policy constraints", "Restrict configurations org-wide or per folder/project (inherited, with exceptions)", "gcp.resourceLocations (data residency), compute.vmExternalIpAccess, iam.disableServiceAccountKeyCreation, storage.uniformBucketLevelAccess, compute.requireOsLogin, run.allowedIngress"],
              ["Hierarchical firewall policies", "Org/folder-level rules evaluated before VPC rules; actions allow, deny or go_to_next", "Block SSH from the internet everywhere; delegate the rest"],
              ["Network firewall policies", "Global or regional policy objects with tags (secure tags), FQDN, geo, threat intelligence", "Replace per-VPC rule sprawl"],
              ["Cloud NGFW / IDS", "Intrusion prevention and detection", "Inspect east-west and egress"],
              ["Private Google Access / PSC", "Avoid public paths to Google APIs", "Private-only workloads"],
            ]}
          />
          <Callout tone="tip" title="IAM versus organization policy">
            IAM controls <em>who can do what</em>; organization policy controls <em>what is allowed
            to exist</em>, regardless of who asks. Use both: for example only allow EU locations, and
            only allow network admins to create firewall rules.
          </Callout>
        </>
      ),
    },
    {
      id: "access",
      title: "Secure remote and workload access",
      body: (
        <>
          <ul>
            <li><strong>Identity-Aware Proxy (IAP):</strong> protects web apps behind HTTP(S) load balancers and provides <em>TCP forwarding</em> for SSH/RDP to VMs without external IPs or a VPN. Access is per user via IAM (<code>IAP-secured Web App User</code>, <code>IAP-secured Tunnel User</code>).</li>
            <li><strong>Context-aware access and Chrome Enterprise Premium</strong> (formerly BeyondCorp Enterprise) enforce zero-trust decisions using user identity, device posture and network context, with threat and data protection in the browser.</li>
            <li><strong>OS Login</strong> ties SSH access to IAM identities and supports 2-step verification; avoid shared SSH keys in metadata.</li>
            <li><strong>Service account impersonation</strong> gives short-lived access for humans and automation without keys.</li>
            <li><strong>Workload Identity Federation</strong> lets AWS, Azure, GitHub and OIDC/SAML workloads access Google Cloud keylessly; <strong>Workforce Identity Federation</strong> signs in employees from an external IdP.</li>
            <li><strong>Private clusters / bastion alternatives:</strong> use IAP tunnels or Cloud Shell with VPC access instead of public bastions.</li>
          </ul>
          <Exercise
            title="Prevent exfiltration"
            task={<p>A data science team has BigQuery datasets with sensitive data. A contractor with valid credentials works from a personal laptop. The CISO wants to stop copies leaving the company even if credentials leak. What do you configure?</p>}
          >
            <p>
              Put the projects and BigQuery/Cloud Storage APIs in a <strong>VPC Service Controls
              perimeter</strong> with an <strong>access level</strong> allowing only corporate IP
              ranges or managed devices (Chrome Enterprise Premium device posture). Add{" "}
              <strong>ingress/egress rules</strong> only for approved flows, run in <strong>dry
              run</strong> first, and enforce an organization policy restricting sharing and
              external destinations. IAM alone cannot stop a valid credential from copying data out.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "VPC Service Controls add a network-context perimeter around Google APIs to stop exfiltration even with valid IAM credentials.",
    "Organization Policy constrains configurations (locations, external IPs, key creation); hierarchical firewall policies centralise network rules.",
    "IAP, context-aware access and Chrome Enterprise Premium implement zero-trust access without VPNs or public bastions.",
    "Impersonation and federation remove long-lived keys.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service stops data from being copied out of BigQuery by a user with valid credentials from an untrusted network?",
      options: ["VPC Service Controls", "Cloud NAT", "Cloud CDN", "Cloud DNS"],
      answer: 0,
      explain: "VPC SC enforces perimeters around Google APIs independent of IAM.",
    },
    {
      kind: "mcq",
      q: "Which control restricts resource creation to EU locations organization-wide?",
      options: ["Organization policy gcp.resourceLocations", "IAM Viewer role", "Cloud Armor", "Firewall rule"],
      answer: 0,
      explain: "The resource locations constraint limits where resources can be created.",
    },
    {
      kind: "mcq",
      q: "SSH to VMs with no external IP and no VPN. Best option?",
      options: ["IAP TCP forwarding", "Public bastion with shared keys", "Open port 22 to the internet", "Cloud NAT"],
      answer: 0,
      explain: "IAP tunnels SSH/RDP to private VMs using IAM identity.",
    },
    {
      kind: "mcq",
      q: "Hierarchical firewall policies are attached at:",
      options: ["Organization or folder", "Instance", "Subnet only", "Bucket"],
      answer: 0,
      explain: "They are applied at organization or folder level and evaluated before VPC rules.",
    },
    {
      kind: "text",
      q: "Which VPC SC mode lets you test a perimeter without blocking traffic?",
      format: "*** ***",
      accept: ["dry run", "dry-run", "dry run mode"],
      explain: "Dry run logs violations without enforcing the perimeter.",
    },
  ],
};
