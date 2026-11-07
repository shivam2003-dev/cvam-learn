import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Design VPC subnets, route tables and gateways for multi-AZ workloads",
    "Add secondary CIDR blocks and avoid IP address exhaustion, including for EKS",
    "Use IPv6, egress-only internet gateways and dual stack",
    "Resolve overlapping CIDR ranges with NAT, PrivateLink and Transit Gateway patterns",
    "Describe NAT gateway behaviour, limits and alternatives",
  ],
  tasks: [
    {
      id: "layout",
      title: "VPC and subnet layout",
      body: (
        <>
          <p>
            A VPC spans a Region; a subnet lives in one AZ. A <strong>public subnet</strong> has a
            route to an internet gateway (IGW); a <strong>private subnet</strong> does not. Instances
            in private subnets reach the internet outbound through a NAT gateway placed in a public
            subnet of the same AZ.
          </p>
          <CloudDiagram course="aws-ans-c01" id="vpc-design-addressing-diagram-1" />
          <ul>
            <li>Plan CIDR sizes for growth: VPC from /16 to /28; leave unallocated space for new subnets.</li>
            <li>Use separate route tables per tier so only public subnets have an IGW route.</li>
            <li>Use <strong>AZ IDs</strong> (such as use1-az1) rather than AZ names when coordinating across accounts, because names map to different physical zones per account.</li>
          </ul>
        </>
      ),
    },
    {
      id: "exhaust",
      title: "Running out of IP addresses",
      body: (
        <>
          <p>
            Large container fleets on EKS (each pod can take a VPC IP with the VPC CNI) or big
            Lambda-in-VPC and ENI-heavy designs exhaust subnets quickly. Fixes, in the order exams
            usually prefer:
          </p>
          <Table
            head={["Fix", "How", "Notes"]}
            rows={[
              ["Add a secondary CIDR", "Associate additional IPv4 blocks (up to the quota, five by default) with the VPC and create new subnets", "Blocks must not overlap each other or peers; RFC 1918 or 100.64.0.0/10 allowed; existing subnets cannot be resized"],
              ["Use 100.64.0.0/10 for pods", "EKS custom networking puts pods in a secondary-CIDR subnet while nodes use the primary range", "Pods are not routable from outside the VPC without NAT"],
              ["IPv6 or dual stack", "Associate an IPv6 block (/56 per VPC, /64 per subnet)", "Egress-only internet gateway for outbound-only private IPv6"],
              ["Prefix delegation", "Assign /28 IPv4 prefixes per ENI instead of single IPs", "Reduces ENI count; needs contiguous free space"],
              ["IPAM", "Amazon VPC IP Address Manager allocates, tracks and enforces CIDRs across accounts and Regions", "Prevents overlaps by design"],
            ]}
          />
          <Callout tone="tip" title="Auto scaling and subnets">
            An Auto Scaling group or load balancer cannot launch into a subnet with no free IPs. Give
            load balancers at least /27 subnets and keep headroom for scale-out events, rolling
            deployments and replacement instances.
          </Callout>
        </>
      ),
    },
    {
      id: "overlap",
      title: "Overlapping address space",
      body: (
        <>
          <p>
            Mergers, partners and legacy networks often collide with your CIDRs. Peering and Transit
            Gateway cannot route between identical ranges. Options:
          </p>
          <Table
            head={["Approach", "How it works", "Best when"]}
            rows={[
              ["Re-address", "Renumber one side", "Few hosts, long-term fix"],
              ["PrivateLink", "Expose only the needed service through an NLB-backed endpoint service; consumers see an ENI in their own range", "Unidirectional, application-level access"],
              ["Private NAT gateway + TGW", "Translate overlapping source or destination to a non-overlapping range in a routable subnet", "Two-way IP connectivity with limited hosts"],
              ["Proxy / reverse proxy tier", "A host in a unique range forwards requests", "Legacy applications"],
              ["Separate secondary CIDR", "Use a non-overlapping secondary CIDR for the routable subnets", "Only part of the VPC must be reachable"],
            ]}
          />
          <Exercise
            title="Overlap"
            task={<p>Two companies both use 10.0.0.0/16. A single reporting application in company A must call a REST service in company B. No other connectivity is required. What is the simplest design?</p>}
          >
            <p>
              <strong>PrivateLink.</strong> Company B puts the service behind a Network Load Balancer
              and publishes an endpoint service; company A creates an interface endpoint in its VPC.
              The endpoint ENI gets an address from A&apos;s own range, so the overlap never matters and
              B&apos;s network is not exposed.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "nat",
      title: "NAT gateway essentials",
      body: (
        <>
          <ul>
            <li><strong>Public NAT gateway:</strong> in a public subnet with an Elastic IP; provides outbound IPv4 internet access for private subnets. Scales automatically from 5 Gbps up to 100 Gbps and supports 55,000 simultaneous connections to each unique destination IP, port and protocol.</li>
            <li><strong>Private NAT gateway:</strong> no internet; translates between private networks, used for overlapping CIDRs and on-premises or other VPC communication through TGW or VGW.</li>
            <li><strong>Zonal:</strong> create one per AZ and route each AZ&apos;s private subnets to its local NAT gateway to avoid cross-AZ charges and single points of failure.</li>
            <li><strong>Metrics:</strong> <code>ErrorPortAllocation</code> shows port exhaustion; <code>PacketsDropCount</code> shows drops.</li>
            <li><strong>Cost:</strong> hourly plus per-GB processing; use gateway endpoints for S3 and DynamoDB to bypass NAT for that traffic.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Use per-AZ NAT gateways and separate route tables per subnet tier.",
    "Add secondary CIDRs (including 100.64.0.0/10), IPv6 or prefix delegation to avoid IP exhaustion; IPAM prevents overlaps.",
    "For overlapping CIDRs, prefer PrivateLink for service access or a private NAT gateway for IP-level access.",
    "Gateway endpoints for S3 and DynamoDB avoid NAT gateway data processing charges.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A subnet is nearly out of IP addresses. What is the standard remedy?",
      options: ["Associate a secondary CIDR and create new subnets", "Resize the subnet", "Delete the route table", "Enable jumbo frames"],
      answer: 0,
      explain: "Subnets cannot be resized; add a secondary CIDR to the VPC and create additional subnets.",
    },
    {
      kind: "mcq",
      q: "Which service exposes one service across VPCs with overlapping CIDRs?",
      options: ["AWS PrivateLink", "VPC peering", "Transit Gateway without NAT", "Internet gateway"],
      answer: 0,
      explain: "PrivateLink presents the service as an ENI in the consumer VPC, avoiding routing between overlapping ranges.",
    },
    {
      kind: "mcq",
      q: "Which gateway provides outbound-only internet access for IPv6 from private subnets?",
      options: ["Egress-only internet gateway", "NAT gateway", "Virtual private gateway", "Transit gateway"],
      answer: 0,
      explain: "IPv6 addresses are globally unique; an egress-only IGW allows outbound-only traffic.",
    },
    {
      kind: "mcq",
      q: "Which metric reveals NAT gateway port exhaustion?",
      options: ["ErrorPortAllocation", "BytesOutToSource", "ActiveConnectionCount", "PacketsInFromSource"],
      answer: 0,
      explain: "ErrorPortAllocation counts failures to allocate a source port.",
    },
    {
      kind: "text",
      q: "How many IP addresses does AWS reserve in every subnet?",
      format: "*",
      accept: ["5", "five"],
      explain: "The first four and the last address of every subnet are reserved.",
    },
  ],
};
