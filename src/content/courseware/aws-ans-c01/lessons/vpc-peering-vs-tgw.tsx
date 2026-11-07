import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Describe VPC peering rules: non-transitive, no overlap, same or cross Region and account",
    "Compare peering, Transit Gateway and PrivateLink on scale, cost, bandwidth and features",
    "Count connections in a full mesh versus a hub-and-spoke",
    "Select a pattern from stated requirements",
  ],
  tasks: [
    {
      id: "peering",
      title: "VPC peering in detail",
      body: (
        <>
          <p>
            A <strong>VPC peering connection</strong> is a one-to-one private link between two VPCs
            in the same or different accounts, and in the same or different Regions. Traffic stays on
            the AWS network (inter-Region traffic is encrypted). There is no gateway or bandwidth
            bottleneck, and no hourly charge: you pay only for data transfer where applicable.
          </p>
          <ul>
            <li><strong>Non-transitive:</strong> if A peers B and B peers C, A cannot reach C through B.</li>
            <li><strong>No overlapping CIDRs</strong> between the two VPCs.</li>
            <li><strong>No edge-to-edge routing:</strong> a peer cannot use the other VPC&apos;s IGW, NAT gateway, VPN, Direct Connect or gateway endpoints.</li>
            <li>You must add <strong>routes in both VPCs</strong> to the peer CIDR, and allow traffic in security groups and NACLs. Security group references to a peer work within a Region only.</li>
            <li>Optional DNS resolution of the peer&apos;s private hostnames to private IPs.</li>
            <li>One peering connection per VPC pair; the quota on active peerings per VPC is adjustable up to 125.</li>
          </ul>
          <CloudDiagram course="aws-ans-c01" id="vpc-peering-vs-tgw-diagram-1" />
        </>
      ),
    },
    {
      id: "compare",
      title: "Peering versus Transit Gateway versus PrivateLink",
      body: (
        <>
          <Table
            head={["", "VPC peering", "Transit Gateway", "PrivateLink"]}
            rows={[
              ["Model", "Point to point", "Regional hub, many attachments (VPC, VPN, DX gateway, Connect, peering)", "Service-level, consumer to provider"],
              ["Transitive", "No", "Yes (route-table controlled)", "N/A (one service)"],
              ["Overlapping CIDRs", "Not allowed", "Not allowed between attached networks", "Allowed"],
              ["Bandwidth", "Limited only by instance and ENI", "Up to 50 Gbps per VPC attachment, burst", "Per endpoint, scales with NLB"],
              ["Latency", "Lowest (no extra hop)", "Extra hop", "Extra hop (NLB)"],
              ["Cost", "No hourly charge; data charge cross-AZ/Region", "Per attachment-hour plus per-GB processed", "Per endpoint-hour plus per-GB"],
              ["Scale", "Full mesh needs n(n-1)/2 connections", "Up to 5,000 attachments", "Many consumers, one service"],
              ["Security", "SG and NACL; peer-wide network access", "Route-table segmentation, appliance mode, flow logs", "Only the exposed port/service"],
              ["Cross-Region", "Yes", "Via TGW peering (static routes)", "Yes (interface endpoints to services in other Regions)"],
            ]}
          />
          <Callout tone="note" title="Rule of thumb for the exam">
            Two or three VPCs, high throughput, lowest latency and cost: <strong>peering</strong>.
            Many VPCs, on-premises, centralized inspection, segmentation: <strong>Transit Gateway</strong>.
            One service shared with many consumers, overlap, or least-privilege exposure:{" "}
            <strong>PrivateLink</strong>.
          </Callout>
        </>
      ),
    },
    {
      id: "mesh",
      title: "Mesh versus hub",
      body: (
        <>
          <p>
            With <em>n</em> VPCs, a full peering mesh needs <em>n(n−1)/2</em> connections and twice
            as many route entries to maintain: 10 VPCs need 45 peerings, 50 VPCs need 1,225. A
            Transit Gateway needs <em>n</em> attachments. Beyond a handful of VPCs, operational
            overhead and quotas push you to Transit Gateway.
          </p>
          <Exercise
            title="Choose a pattern"
            task={<p>A data-science VPC needs to move 20 TB nightly to an analytics VPC in the same Region, and no other VPCs are involved. Which connectivity and why?</p>}
          >
            <p>
              <strong>VPC peering.</strong> It has no hourly cost, no per-GB processing fee (data
              within the same AZ is free; cross-AZ is standard inter-AZ pricing), no bandwidth cap
              beyond instance limits and the lowest latency. Transit Gateway would add a per-GB
              processing charge on 20 TB nightly for no benefit.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Peering is private, cheap, fast and non-transitive; CIDRs must not overlap and routes are needed on both sides.",
    "Transit Gateway scales to thousands of attachments with route-table segmentation, at a per-attachment and per-GB cost.",
    "PrivateLink exposes a service, not a network, and tolerates overlapping CIDRs.",
    "Full mesh grows as n(n-1)/2; use hub-and-spoke past a few VPCs.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "VPC A peers with B, and B peers with C. Can A reach C through B?",
      options: ["No, peering is non-transitive", "Yes, automatically", "Yes, if route propagation is on", "Only across Regions"],
      answer: 0,
      explain: "Peering never forwards traffic between two other VPCs.",
    },
    {
      kind: "mcq",
      q: "How many peering connections does a full mesh of 8 VPCs require?",
      options: ["28", "8", "16", "64"],
      answer: 0,
      explain: "n(n-1)/2 = 8×7/2 = 28.",
    },
    {
      kind: "mcq",
      q: "Which option has no hourly charge and the lowest latency for two VPCs?",
      options: ["VPC peering", "Transit Gateway", "PrivateLink", "Site-to-Site VPN"],
      answer: 0,
      explain: "Peering has no hourly fee and no extra hop.",
    },
    {
      kind: "mcq",
      q: "A peered VPC wants to use the other VPC's NAT gateway for internet access. Is this supported?",
      options: ["No, edge-to-edge routing is not supported", "Yes, with a route", "Yes, with a security group rule", "Only within one account"],
      answer: 0,
      explain: "Peering does not allow transitive use of IGWs, NAT gateways, VPNs or Direct Connect in the peer.",
    },
    {
      kind: "text",
      q: "What is the maximum number of attachments per Transit Gateway?",
      format: "****",
      accept: ["5000", "5,000"],
      explain: "A Transit Gateway supports up to 5,000 attachments.",
    },
  ],
};
