import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Place protocols and AWS services on the OSI model and explain why layer matters",
    "Calculate CIDR ranges and spot overlaps",
    "Describe how static and BGP routing select a path, including longest prefix match",
    "Explain MTU, MSS and fragmentation and why they cause mysterious failures",
    "Trace how a VPC route table, security group and network ACL combine to forward a packet",
  ],
  tasks: [
    {
      id: "osi",
      title: "The OSI layers you must be able to use",
      body: (
        <>
          <p>
            Exam questions routinely hinge on layer. A load balancer that sees HTTP headers works at
            layer 7; one that only sees TCP ports works at layer 4; one that forwards IP packets to
            an appliance works at layer 3. Knowing the layer tells you what the device can and cannot
            do.
          </p>
          <Figure caption="OSI layers with typical AWS services. Higher layers can inspect more but add latency and cost.">
            <Layers
              layers={[
                { title: "L7 Application", note: "HTTP, gRPC, DNS. ALB, CloudFront, API Gateway, AWS WAF, Route 53.", tone: "lime" },
                { title: "L6 / L5 Presentation, session", note: "TLS termination and sessions. ALB and NLB TLS listeners, ACM certificates.", tone: "lime" },
                { title: "L4 Transport", note: "TCP, UDP ports. NLB, security groups, network ACLs, NAT gateway, Global Accelerator.", tone: "sky" },
                { title: "L3 Network", note: "IP, ICMP, routing, BGP. Route tables, Transit Gateway, GWLB (GENEVE), VPN (IPsec).", tone: "sky" },
                { title: "L2 Data link", note: "Ethernet, VLAN 802.1Q, LAG, MACsec. Direct Connect VIFs ride a VLAN.", tone: "amber" },
                { title: "L1 Physical", note: "Fibre, optics, cross-connects. Direct Connect location, LOA-CFA.", tone: "amber" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "cidr",
      title: "CIDR arithmetic and overlaps",
      body: (
        <>
          <p>
            A CIDR block <code>a.b.c.d/n</code> has <code>2^(32-n)</code> addresses. A VPC IPv4 CIDR
            can be between <code>/16</code> and <code>/28</code>. In every subnet AWS reserves{" "}
            <strong>five</strong> addresses: network, VPC router, DNS, future use and broadcast, so a{" "}
            <code>/24</code> has 251 usable addresses.
          </p>
          <Table
            head={["Prefix", "Addresses", "Usable in a subnet", "Typical use"]}
            rows={[
              ["/16", "65,536", "65,531", "Whole VPC"],
              ["/20", "4,096", "4,091", "Large subnet, EKS nodes"],
              ["/24", "256", "251", "Standard subnet"],
              ["/28", "16", "11", "Smallest subnet, endpoints"],
            ]}
          />
          <p>
            Two networks <em>overlap</em> if one range contains any address of the other.{" "}
            <code>10.0.0.0/16</code> and <code>10.0.128.0/17</code> overlap; <code>10.0.0.0/16</code>{" "}
            and <code>10.1.0.0/16</code> do not. Overlaps block VPC peering and make routing
            ambiguous, so address planning (often with Amazon VPC IP Address Manager) comes first.
          </p>
          <Exercise
            title="Spot the overlap"
            task={<p>Which pair overlaps? (a) 172.16.0.0/16 and 172.17.0.0/16 (b) 10.10.0.0/20 and 10.10.8.0/21 (c) 192.168.0.0/24 and 192.168.1.0/24</p>}
          >
            <p>
              (b). <code>10.10.0.0/20</code> covers 10.10.0.0 to 10.10.15.255, and{" "}
              <code>10.10.8.0/21</code> is 10.10.8.0 to 10.10.15.255, which sits inside it. (a) and
              (c) are adjacent but distinct.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "routing",
      title: "Routing: longest prefix, static and BGP",
      body: (
        <>
          <p>
            Every router, including a VPC route table, picks the route whose prefix is{" "}
            <strong>most specific</strong> (longest prefix match). Only on a tie do other rules apply.
            In a VPC route table the order is: local route (always wins for the VPC CIDR), longest
            prefix, then static routes over propagated routes, then the type of propagated route.
          </p>
          <ul>
            <li><strong>Static routes</strong> are simple and predictable but do not react to failures.</li>
            <li><strong>BGP</strong> (Border Gateway Protocol, TCP port 179) exchanges prefixes between autonomous systems identified by an ASN. It is a path-vector protocol: it prefers higher local preference, then shorter AS_PATH, then lower MED, among other tie-breakers.</li>
            <li><strong>eBGP</strong> runs between different ASNs (your router and AWS); <strong>iBGP</strong> within the same ASN.</li>
          </ul>
          <Figure caption="Longest prefix match. The /24 wins for 10.1.1.5 even though the /16 also matches; 10.1.9.9 only matches the /16.">
            <Graph
              label="Longest prefix match example with two routes and two destinations"
              cellW={200}
              cellH={96}
              nodeW={170}
              nodes={[
                { id: "pkt1", label: "Dest 10.1.1.5", col: 0, row: 0, tone: "sky", shape: "pill" },
                { id: "pkt2", label: "Dest 10.1.9.9", col: 0, row: 1, tone: "sky", shape: "pill" },
                { id: "rt", label: "Route table", sub: "10.1.0.0/16 → pcx", col: 1, row: 0, tone: "amber" },
                { id: "rt2", label: "More specific", sub: "10.1.1.0/24 → tgw", col: 1, row: 1, tone: "amber" },
                { id: "tgw", label: "Transit Gateway", col: 2, row: 1, tone: "lime" },
                { id: "pcx", label: "VPC peering", col: 2, row: 0, tone: "lime" },
              ]}
              edges={[
                { from: "pkt1", to: "rt2", label: "wins /24" },
                { from: "pkt2", to: "rt", label: "only /16" },
                { from: "rt2", to: "tgw" },
                { from: "rt", to: "pcx" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "mtu",
      title: "MTU, MSS and fragmentation",
      body: (
        <>
          <p>
            <strong>MTU</strong> is the largest IP packet a link carries. <strong>MSS</strong> is the
            largest TCP payload, usually MTU minus 40 bytes of IP and TCP headers. If a packet
            exceeds the path MTU and has the Don&apos;t Fragment bit set, a router should drop it and
            send ICMP <em>type 3 code 4 (Fragmentation Needed)</em>. If a security group or network
            ACL blocks that ICMP, the sender never learns, and large transfers hang while small
            requests work. This is the classic path MTU discovery black hole.
          </p>
          <Table
            head={["Path", "Typical MTU"]}
            rows={[
              ["Within a VPC and between peered VPCs in a Region", "9001 (jumbo frames)"],
              ["Inter-Region VPC peering", "8500"],
              ["Internet gateway, NAT gateway to internet", "1500"],
              ["Transit Gateway VPC, Direct Connect, peering attachments", "8500"],
              ["Site-to-Site VPN", "1500 on the tunnel, less usable after IPsec overhead"],
              ["Direct Connect private VIF / transit VIF", "9001 / 8500"],
            ]}
          />
          <Callout tone="tip" title="Exam pattern">
            Symptom: ping and small requests work, large file transfers stall. Cause: MTU mismatch
            with ICMP blocked. Fixes: allow ICMP type 3 code 4, lower the MTU or clamp the MSS, or
            use a consistent jumbo-frame path.
          </Callout>
        </>
      ),
    },
    {
      id: "vpc",
      title: "How a VPC forwards a packet",
      body: (
        <>
          <p>
            For one packet leaving an instance, AWS checks in order: the instance&apos;s{" "}
            <strong>security group</strong> (stateful, allow rules only), the subnet&apos;s{" "}
            <strong>network ACL</strong> (stateless, numbered allow and deny rules, evaluated on both
            directions), then the subnet <strong>route table</strong> for the next hop. Return traffic
            for allowed security-group flows is automatic; for network ACLs you must permit the
            ephemeral ports (1024 to 65535) explicitly.
          </p>
          <Figure caption="Packet path from an instance to a remote VPC. A block at any step stops the flow.">
            <Graph
              label="Packet path: instance, security group, network ACL, route table, next hop"
              cellW={170}
              cellH={90}
              nodeW={140}
              nodes={[
                { id: "ec2", label: "Instance", col: 0, row: 0, tone: "sky" },
                { id: "sg", label: "Security group", sub: "stateful", col: 1, row: 0, tone: "lime" },
                { id: "nacl", label: "Network ACL", sub: "stateless", col: 2, row: 0, tone: "lime" },
                { id: "rt", label: "Route table", sub: "longest prefix", col: 3, row: 0, tone: "amber" },
                { id: "hop", label: "Next hop", sub: "TGW, IGW, PCX, VGW", col: 4, row: 0, tone: "plain", shape: "pill" },
              ]}
              edges={[
                { from: "ec2", to: "sg" },
                { from: "sg", to: "nacl" },
                { from: "nacl", to: "rt" },
                { from: "rt", to: "hop" },
              ]}
            />
          </Figure>
        </>
      ),
    },
  ],
  takeaways: [
    "Layer determines capability: L7 can read HTTP, L4 sees ports, L3 forwards packets.",
    "A VPC subnet loses five addresses; overlapping CIDRs block peering and complicate routing.",
    "Longest prefix always wins first; then static beats propagated, and BGP uses local preference and AS_PATH.",
    "Blocked ICMP type 3 code 4 plus an MTU mismatch causes large transfers to hang while small ones succeed.",
    "Security groups are stateful, network ACLs are stateless, and route tables choose the next hop.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How many IP addresses in a /24 subnet are usable on AWS?",
      options: ["251", "254", "256", "250"],
      answer: 0,
      explain: "AWS reserves five addresses per subnet, leaving 251 of 256 in a /24.",
    },
    {
      kind: "mcq",
      q: "A route table has 10.0.0.0/8 to a VPN and 10.5.0.0/16 to a peering connection. Where does 10.5.2.2 go?",
      options: ["The peering connection", "The VPN", "It is load balanced", "It is dropped"],
      answer: 0,
      explain: "Longest prefix match selects the /16, which is more specific than the /8.",
    },
    {
      kind: "mcq",
      q: "Small HTTP requests succeed but large downloads hang across a VPN. What is the most likely cause?",
      options: [
        "MTU mismatch with ICMP fragmentation-needed messages blocked",
        "A missing route",
        "An expired TLS certificate",
        "DNS failure",
      ],
      answer: 0,
      explain: "Path MTU discovery fails when ICMP type 3 code 4 is blocked, so full-size packets are silently dropped.",
    },
    {
      kind: "mcq",
      q: "Which statement about network ACLs is correct?",
      options: [
        "They are stateless, so return traffic must be allowed explicitly",
        "They are stateful like security groups",
        "They attach to instances",
        "They only support allow rules",
      ],
      answer: 0,
      explain: "NACLs are stateless, associated with subnets, and support both allow and deny rules.",
    },
    {
      kind: "text",
      q: "What is the typical MTU inside a VPC between instances that support jumbo frames?",
      format: "****",
      accept: ["9001", "9001 bytes"],
      explain: "Within a VPC and between peered VPCs in a Region jumbo frames of 9001 bytes are supported.",
    },
  ],
};
