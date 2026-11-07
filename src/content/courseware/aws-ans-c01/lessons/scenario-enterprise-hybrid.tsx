import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 32,
  difficulty: "Hard",
  objectives: [
    "Design a multi-account, multi-Region landing zone network end to end",
    "Combine Direct Connect, Transit Gateway, inspection, shared DNS and PrivateLink",
    "Plan IP addressing, routing policy and failure behaviour",
    "Define the monitoring, automation and audit baseline for the design",
  ],
  tasks: [
    {
      id: "brief",
      title: "The scenario",
      body: (
        <>
          <p>
            <strong>Northwind Bank</strong> is moving 80 workloads into AWS across two Regions
            (us-east-1 and eu-west-1) and 40 accounts under one organization. Requirements:
          </p>
          <ol>
            <li>Private, predictable connectivity from two data centers; up to 10 Gbps steady; no single failure may cut access.</li>
            <li>Prod, non-prod and shared services must be isolated; only prod reaches core banking on-premises.</li>
            <li>All internet egress and all inter-environment traffic must be inspected and logged centrally.</li>
            <li>Hybrid DNS in both directions; teams cannot run their own resolvers.</li>
            <li>Third-party fintech APIs must be consumed privately; some partners use 10.0.0.0/8 addresses too.</li>
            <li>Data in transit must be encrypted on hybrid links; audit evidence retained seven years.</li>
          </ol>
        </>
      ),
    },
    {
      id: "arch",
      title: "Reference architecture",
      body: (
        <>
          <CloudDiagram course="aws-ans-c01" id="scenario-enterprise-hybrid-diagram-1" />
          <Table
            head={["Requirement", "Design decision"]}
            rows={[
              ["Resilient 10 Gbps hybrid", "Maximum resiliency: two DX locations, a LAG of 2×10 Gbps (or 4×10 Gbps) per location sized for failure; transit VIFs to a DXGW associated with both TGWs; Site-to-Site VPN backup with BGP; BFD enabled"],
              ["Isolation", "TGW route tables: RT-Prod (to shared, on-premises), RT-NonProd (shared only), RT-Shared; no propagation between prod and non-prod"],
              ["Central inspection", "Inspection VPC attachment with appliance mode; spokes' default route to inspection; Network Firewall domain and IPS rules; egress NAT in a separate egress VPC; logs to a central archive"],
              ["Hybrid DNS", "Route 53 Resolver inbound and outbound endpoints in the shared services VPC; forwarding rules and Profiles shared with RAM; PHZs associated centrally; DNS Firewall via Firewall Manager"],
              ["Partner APIs and overlaps", "Consume through PrivateLink interface endpoints (overlap-safe); for partners needing IP routing use a private NAT gateway in a dedicated range"],
              ["Encryption", "IPsec private IP VPN on transit VIFs or MACsec on the DX ports; TLS on all application tiers; ACM Private CA for internal certificates"],
              ["Audit and evidence", "Organization CloudTrail and Config aggregator; flow logs (VPC and TGW) to S3 in the log archive account with Object Lock; Reachability Analyzer and Network Access Analyzer scheduled checks"],
              ["Governance", "Control Tower landing zone, SCPs denying IGW/peering/NAT in workload accounts, IPAM for non-overlapping CIDRs, StackSets/CDK pipeline for baseline"],
            ]}
          />
        </>
      ),
    },
    {
      id: "routing",
      title: "Routing policy and failure modes",
      body: (
        <>
          <ul>
            <li><strong>Prefix plan:</strong> allocate aligned blocks per Region and environment so each can be summarized (stay under the 100-prefix VIF limit and the 200-prefix allowed-prefix list on the TGW association).</li>
            <li><strong>Active/active:</strong> equal local preference on both DX locations; on-premises routers use equal-cost paths, and capacity is sized so one location can carry the load.</li>
            <li><strong>Prefer DX over VPN:</strong> by default DX wins; the VPN stands by.</li>
            <li><strong>Region failure:</strong> inter-Region TGW peering uses static routes; add routes in both directions and a runbook for shifting workloads. DX gateway reaches both Regions, so on-premises access survives the loss of one Region.</li>
            <li><strong>Inspection failure:</strong> Network Firewall endpoints in at least two AZs; test AZ loss; keep symmetric flows with appliance mode.</li>
          </ul>
          <Callout tone="warn" title="Common design mistakes">
            Forgetting TGW peering static routes; using a private VIF with a DX gateway when more
            than 20 VPCs need access (use transit VIF); attaching too many Regions to one DXGW
            association limit (3 TGWs); overlapping partner ranges with VPC CIDRs; centralizing DNS
            but not sharing private zone associations.
          </Callout>
          <Exercise
            title="What fails when?"
            task={<p>The us-east-1 Direct Connect location 1 loses power. List what happens to hybrid traffic and what you must have in place so users see no outage.</p>}
          >
            <p>
              BFD detects the failed links in about a second and BGP withdraws the routes learned over
              location 1. Traffic shifts to location 2 (and then VPN if both fail) as the DXGW and TGW
              prefer remaining paths. On-premises routers must have equal or backup preference toward
              location 2, firewalls must tolerate path change (state sync or symmetric design), and
              location 2 must be sized for full load. Alarms on <code>ConnectionState</code> and BGP
              session state notify operations.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Separate concerns: DX/VPN and TGW for connectivity, route tables for isolation, inspection VPC for control, Resolver and RAM for DNS.",
    "Use transit VIFs with a DX gateway for many VPCs and Regions; size for single-location failure.",
    "PrivateLink handles overlapping partner ranges; private NAT handles IP-level needs.",
    "Bake monitoring, audit and automation into the baseline from day one.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A company needs to connect on-premises to 80 VPCs in two Regions over Direct Connect. Which VIF and gateways?",
      options: ["Transit VIF to a DX gateway associated with Transit Gateways", "Private VIF to a VGW per VPC", "Public VIF", "Hosted VIF with 80 VPNs"],
      answer: 0,
      explain: "Transit VIFs reach Transit Gateways, which scale to thousands of VPCs across Regions.",
    },
    {
      kind: "mcq",
      q: "Which TGW configuration prevents prod and non-prod VPCs from communicating but lets both reach shared services?",
      options: ["Separate route tables with propagation only from shared services", "One default route table", "VPC peering", "Security groups only"],
      answer: 0,
      explain: "Route table association and selective propagation segment the network.",
    },
    {
      kind: "mcq",
      q: "A partner uses the same 10.0.0.0/8 range as your VPCs. Which is the best way to consume its API privately?",
      options: ["PrivateLink", "Transit Gateway attachment", "VPC peering", "Direct Connect public VIF"],
      answer: 0,
      explain: "PrivateLink avoids routing between overlapping ranges.",
    },
    {
      kind: "mcq",
      q: "How are routes exchanged across a Transit Gateway peering attachment?",
      options: ["Static routes", "BGP", "OSPF", "Automatic propagation"],
      answer: 0,
      explain: "Peering attachments need static routes in both Transit Gateways.",
    },
    {
      kind: "text",
      q: "How many Transit Gateways can one Direct Connect gateway associate with?",
      format: "*",
      accept: ["3", "three"],
      explain: "A DX gateway supports up to three Transit Gateway associations.",
    },
  ],
};
