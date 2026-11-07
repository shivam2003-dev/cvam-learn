import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Explain what AWS Direct Connect provides and how a physical connection is established",
    "Distinguish dedicated and hosted connections and know their speeds and constraints",
    "Describe the physical steps: LOA-CFA, cross connect, colocation and partners",
    "Design resiliency using the maximum, high and development/test models",
    "Plan failover detection with BFD and understand the 99.99% SLA conditions",
  ],
  tasks: [
    {
      id: "what",
      title: "What Direct Connect is",
      body: (
        <>
          <p>
            AWS Direct Connect (DX) is a dedicated private network connection from your premises to
            AWS through a <strong>Direct Connect location</strong>, a colocation facility where AWS
            has routers. It gives consistent latency, higher throughput, and lower data-transfer-out
            cost than the internet. It is <em>not encrypted by default</em>: traffic is private, not
            confidential (see the encryption lesson).
          </p>
          <Figure caption="Physical path. Your router connects by cross connect to an AWS DX router in a colocation facility; AWS carries the traffic over its backbone to the Region.">
            <Graph
              label="Direct Connect physical path from customer data center through a colocation facility to the AWS Region"
              cellW={190}
              cellH={104}
              nodeW={160}
              nodes={[
                { id: "dc", label: "Customer router", sub: "data center", col: 0, row: 0, tone: "sky" },
                { id: "cx", label: "Cross connect", sub: "fibre, LOA-CFA", col: 1, row: 0, tone: "amber", shape: "pill" },
                { id: "dx", label: "AWS DX router", sub: "DX location", col: 2, row: 0, tone: "lime" },
                { id: "r", label: "AWS Region", sub: "VPCs via VIFs", col: 3, row: 0, tone: "lime" },
              ]}
              groups={[{ label: "Colocation facility", c1: 1, r1: 0, c2: 2, r2: 0, tone: "amber" }]}
              edges={[
                { from: "dc", to: "cx", label: "carrier / own fibre", dashed: true },
                { from: "cx", to: "dx" },
                { from: "dx", to: "r", label: "AWS backbone" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "types",
      title: "Dedicated versus hosted connections",
      body: (
        <>
          <Table
            head={["", "Dedicated connection", "Hosted connection"]}
            rows={[
              ["Ordered from", "AWS (you own the port)", "An AWS Direct Connect Partner"],
              ["Speeds", "1, 10, 100 Gbps (and 400 Gbps at supported locations)", "50 Mbps up to 25 Gbps"],
              ["VIFs per connection", "Many (up to 50 private or public VIFs, plus one transit VIF)", "Exactly one VIF per hosted connection"],
              ["Capacity changes", "Fixed port speed", "Partner can resize"],
              ["Features", "LAG, MACsec (10, 100, 400 Gbps), full control", "Provided by partner; no LAG across the partner link in the same way"],
              ["Best for", "Large steady bandwidth, many VIFs, MACsec", "Small or fast-to-provision needs, no presence in the DX location"],
            ]}
          />
          <p>
            Ordering a dedicated connection yields a <strong>Letter of Authorization and Connecting
            Facility Assignment (LOA-CFA)</strong>. You (or your colocation provider or carrier) give
            it to the facility operator to build the <strong>cross connect</strong> between your
            equipment and the AWS port. If you have no equipment in the facility, you reach it
            through a partner&apos;s network or an AWS Direct Connect Delivery Partner. Fibre
            specifications are single-mode: 1000BASE-LX (1G), 10GBASE-LR (10G), 100GBASE-LR4 (100G);
            auto-negotiation settings must match.
          </p>
          <Callout tone="note" title="Lead time">
            Cross connects take days to weeks. For fast cutover, use Site-to-Site VPN as an interim
            path or a hosted connection from a partner already in the facility. This is a frequent
            exam trade-off: Direct Connect for steady predictable bandwidth, VPN for speed of setup.
          </Callout>
        </>
      ),
    },
    {
      id: "resiliency",
      title: "Resiliency models",
      body: (
        <>
          <Table
            head={["Model", "Layout", "Protects against", "SLA"]}
            rows={[
              ["Maximum resiliency", "Two locations, two separate connections at each (four total) on separate devices", "Device, connection and entire location failure; recommended for critical workloads", "99.99%"],
              ["High resiliency", "Two locations, one connection each", "Connection and location failure", "99.9%"],
              ["Development and test", "Two connections on separate devices in one location", "Device and connection failure, not location failure", "Non-production"],
              ["Single connection", "One connection", "Nothing", "No resilience"],
            ]}
          />
          <Figure caption="Maximum resiliency: two DX locations, each with two connections to two separate on-premises routers. Active BGP sessions run over all four.">
            <Graph
              label="Maximum resiliency: two on-premises routers connected by four connections to two Direct Connect locations"
              cellW={200}
              cellH={96}
              nodeW={160}
              nodes={[
                { id: "r1", label: "Customer router A", col: 0, row: 0, tone: "sky" },
                { id: "r2", label: "Customer router B", col: 0, row: 1, tone: "sky" },
                { id: "l1", label: "DX location 1", sub: "two AWS devices", col: 1, row: 0, tone: "lime" },
                { id: "l2", label: "DX location 2", sub: "two AWS devices", col: 1, row: 1, tone: "lime" },
                { id: "aws", label: "AWS Region", col: 2, row: 0.5, tone: "amber", shape: "pill" },
              ]}
              edges={[
                { from: "r1", to: "l1" },
                { from: "r1", to: "l2" },
                { from: "r2", to: "l1" },
                { from: "r2", to: "l2" },
                { from: "l1", to: "aws" },
                { from: "l2", to: "aws" },
              ]}
            />
          </Figure>
          <ul>
            <li>The SLA applies only when you follow the published topology exactly, including separate AWS devices and separate customer devices.</li>
            <li>Use <strong>Bidirectional Forwarding Detection (BFD)</strong> on the BGP sessions so a link failure is detected in about a second instead of waiting for the BGP hold timer (default 90 seconds). AWS enables BFD on its side; you must enable it on your router.</li>
            <li>A Site-to-Site VPN is a valid <em>backup</em> for lower-cost resilience (see the redundancy lesson).</li>
          </ul>
        </>
      ),
    },
    {
      id: "decide",
      title: "Choosing and sizing",
      body: (
        <>
          <Exercise
            title="Meet the requirement"
            task={<p>A bank needs 20 Gbps of steady throughput to AWS, tolerates no single location failure, and must achieve the highest SLA. Which connection design?</p>}
          >
            <p>
              Maximum resiliency with <strong>two Direct Connect locations</strong>, each with a{" "}
              <strong>LAG of two 10 Gbps</strong> dedicated connections (or four 10 Gbps connections in
              total across two devices), terminated on separate customer routers, with BGP and BFD.
              Bandwidth sizing must hold even if one location fails, so each location (or the
              surviving pair) should carry the required load, or the failure mode should degrade
              gracefully by design. Add a VPN as an extra backup path only if the cost fits.
            </p>
          </Exercise>
          <p>
            Also compare costs: Direct Connect charges a port-hour fee plus data transfer out at a
            lower per-GB rate than internet egress; there is no charge for data transfer in. For
            small or intermittent data volumes the VPN over the internet is often cheaper.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Direct Connect is a private, consistent, non-encrypted link through a colocation facility, requiring a cross connect (LOA-CFA).",
    "Dedicated connections: 1, 10, 100 Gbps; hosted connections: 50 Mbps to 25 Gbps via partners with one VIF each.",
    "Maximum resiliency (two locations, two devices each) is required for the 99.99% SLA; use BFD for fast failover.",
    "Use VPN for quick start or low-cost backup; Direct Connect for steady high bandwidth and lower transfer cost.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which design is recommended for critical workloads that need the highest availability?",
      options: [
        "Maximum resiliency: two locations, two connections each, separate devices",
        "One 10 Gbps connection",
        "Two connections in the same location on the same device",
        "VPN only",
      ],
      answer: 0,
      explain: "The maximum resiliency model eliminates single points of failure at device and location level.",
    },
    {
      kind: "mcq",
      q: "Which document do you give your colocation provider to establish the cross connect?",
      options: ["LOA-CFA", "BGP communities list", "VPC flow log", "CloudTrail trail"],
      answer: 0,
      explain: "The LOA-CFA authorizes the facility to connect your equipment to the AWS port.",
    },
    {
      kind: "mcq",
      q: "Which feature speeds up detection of a failed Direct Connect link?",
      options: ["Bidirectional Forwarding Detection", "Longer BGP hold timer", "Larger MTU", "Route 53 health checks"],
      answer: 0,
      explain: "BFD detects failures in under a second so BGP can reconverge, versus the 90 second default hold time.",
    },
    {
      kind: "mcq",
      q: "How many virtual interfaces can a hosted connection carry?",
      options: ["One", "Two", "Up to 50", "Unlimited"],
      answer: 0,
      explain: "Each hosted connection supports a single VIF.",
    },
    {
      kind: "text",
      q: "Is Direct Connect traffic encrypted by default? (yes/no)",
      format: "**",
      accept: ["no", "n"],
      explain: "It is private but not encrypted; add MACsec or IPsec VPN if encryption is required.",
    },
  ],
};
