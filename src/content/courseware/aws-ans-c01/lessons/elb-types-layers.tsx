import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Contrast layer 3, layer 4 and layer 7 load balancing and the AWS service for each",
    "Select ALB, NLB or Gateway Load Balancer from a requirement list",
    "Explain scaling behaviour, static IPs, cross-zone load balancing and source IP handling",
    "Design internal versus internet-facing load balancer placement",
  ],
  tasks: [
    {
      id: "types",
      title: "Three load balancers, three layers",
      body: (
        <>
          <Figure caption="Which load balancer works at which layer. The Classic Load Balancer is legacy and is rarely the right answer on the exam.">
            <Graph
              label="Elastic Load Balancing types by OSI layer"
              cellW={200}
              cellH={100}
              nodeW={175}
              nodes={[
                { id: "alb", label: "Application Load Balancer", sub: "Layer 7: HTTP, HTTPS, gRPC, WebSocket", col: 0, row: 0, tone: "lime" },
                { id: "nlb", label: "Network Load Balancer", sub: "Layer 4: TCP, UDP, TLS", col: 1, row: 0, tone: "sky" },
                { id: "gwlb", label: "Gateway Load Balancer", sub: "Layer 3 gateway + L4 balancing, GENEVE", col: 2, row: 0, tone: "amber" },
                { id: "clb", label: "Classic Load Balancer", sub: "Legacy L4/L7", col: 3, row: 0, tone: "plain" },
              ]}
            />
          </Figure>
          <Table
            head={["", "ALB", "NLB", "GWLB"]}
            rows={[
              ["Layer", "7", "4", "3 (transparent) with 4 flow hashing"],
              ["Protocols", "HTTP, HTTPS, gRPC, WebSocket", "TCP, UDP, TCP_UDP, TLS", "IP packets over GENEVE (UDP 6081)"],
              ["Routing", "Host, path, header, query string, source IP, method; weighted target groups", "Flow hash on protocol, source/destination IP and port, TCP sequence", "5-tuple flow hash to appliances; sticky per flow"],
              ["Static / Elastic IP", "No (DNS name; IPs change)", "Yes, one per AZ, can use your Elastic IPs", "No public IP; reached via GWLB endpoints"],
              ["Source IP seen by target", "ALB address; client IP in X-Forwarded-For", "Preserved for instance targets; with IP targets depends on settings; proxy protocol v2 optional", "Original packets preserved"],
              ["Security groups", "Yes", "Yes (supported since 2023; older NLBs may have none)", "No; appliances have their own"],
              ["TLS", "Terminate with ACM or IAM certs, mTLS, SNI, end-to-end re-encryption", "TLS listener termination or TCP passthrough", "Not applicable"],
              ["Targets", "Instance, IP, Lambda", "Instance, IP, ALB", "Instance or IP appliances"],
              ["Special", "OIDC/Cognito auth, WAF, redirects, fixed responses", "Millions of requests per second, ultra-low latency, PrivateLink provider", "Inline firewall, IDS/IPS, DPI appliances"],
            ]}
          />
        </>
      ),
    },
    {
      id: "select",
      title: "Selecting the right one",
      body: (
        <>
          <ul>
            <li><strong>HTTP routing, WAF, authentication, containers per path:</strong> ALB.</li>
            <li><strong>Non-HTTP protocols, UDP, static IPs, extreme performance, expose a service through PrivateLink, preserve client IP:</strong> NLB.</li>
            <li><strong>Insert third-party virtual appliances transparently in the path:</strong> Gateway Load Balancer.</li>
            <li><strong>Both a static IP and layer 7 features:</strong> NLB in front of an ALB (ALB-type target group), or Global Accelerator in front of the ALB.</li>
          </ul>
          <Figure caption="Static IPs with Layer 7 routing. An NLB with Elastic IPs forwards to an ALB target group, which applies host and path rules.">
            <Graph
              label="NLB with static IPs forwarding to an ALB"
              cellW={190}
              cellH={96}
              nodeW={160}
              nodes={[
                { id: "c", label: "Client", sub: "allow-lists 2 IPs", col: 0, row: 0, tone: "sky", shape: "pill" },
                { id: "n", label: "NLB", sub: "Elastic IP per AZ", col: 1, row: 0, tone: "sky" },
                { id: "a", label: "ALB", sub: "path / host rules", col: 2, row: 0, tone: "lime" },
                { id: "t", label: "Targets", sub: "ECS / EC2", col: 3, row: 0, tone: "plain" },
              ]}
              edges={[
                { from: "c", to: "n" },
                { from: "n", to: "a" },
                { from: "a", to: "t" },
              ]}
            />
          </Figure>
          <Exercise
            title="Pick the load balancer"
            task={<p>A fleet of next-generation firewall appliances must inspect all traffic leaving 40 VPCs, scale out horizontally and keep each flow on the same appliance. What do you deploy?</p>}
          >
            <p>
              A <strong>Gateway Load Balancer</strong> in an inspection VPC with the appliances as
              targets, and <strong>GWLB endpoints</strong> in each spoke (or a central route path via
              Transit Gateway with appliance mode). GWLB uses GENEVE and a flow-hash so each flow, in
              both directions, reaches the same appliance, and the appliance fleet scales behind it.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "scale",
      title: "Scaling, zones and placement",
      body: (
        <>
          <ul>
            <li><strong>Nodes per AZ:</strong> A load balancer places a node (ENIs with IPs) in each enabled AZ. Enable at least two AZs. ALB nodes scale automatically with load; very sudden spikes can outpace scaling, so contact AWS or use LCU reservation for planned events.</li>
            <li><strong>Cross-zone load balancing:</strong> Each node distributes to targets in all AZs. It is always on for ALB (can be turned off per target group), off by default for NLB and GWLB (enabling it incurs inter-AZ data charges).</li>
            <li><strong>Subnets:</strong> Each load balancer subnet needs enough free IPs (a /27 or larger is recommended for ALB so it can scale).</li>
            <li><strong>Internet-facing versus internal:</strong> Internet-facing balancers need public subnets with a route to an internet gateway and have public DNS names resolving to public IPs. Internal ones have private IPs only and are used between tiers or exposed privately with PrivateLink and Direct Connect.</li>
            <li><strong>Health checks:</strong> Per target group; unhealthy targets are removed from rotation. For NLB, fail-open when all targets fail.</li>
          </ul>
          <Callout tone="note" title="Client IP preservation">
            Behind an ALB, applications read <code>X-Forwarded-For</code>. Behind an NLB with
            instance targets the source IP is preserved. With IP-type targets or when NLB is used with
            PrivateLink the source is the NLB or the endpoint; enable proxy protocol v2 so the
            application can still learn the original address.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "ALB is layer 7, NLB layer 4 with static IPs and PrivateLink, GWLB layer 3 transparent insertion of appliances with GENEVE.",
    "Combine NLB and ALB (or Global Accelerator) when you need static IPs and layer 7 routing.",
    "Cross-zone is on for ALB and off for NLB and GWLB by default; enable at least two AZs.",
    "Preserve the client IP through X-Forwarded-For (ALB) or proxy protocol v2 / source preservation (NLB).",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which load balancer supports Elastic IP addresses and UDP?",
      options: ["Network Load Balancer", "Application Load Balancer", "Classic Load Balancer", "Gateway Load Balancer"],
      answer: 0,
      explain: "NLB supports TCP, UDP and TLS with a static or Elastic IP per AZ.",
    },
    {
      kind: "mcq",
      q: "Which service inserts virtual firewall appliances transparently into the traffic path at scale?",
      options: ["Gateway Load Balancer", "Application Load Balancer", "Route 53", "CloudFront"],
      answer: 0,
      explain: "GWLB forwards IP packets over GENEVE to appliance targets and keeps flows symmetric.",
    },
    {
      kind: "mcq",
      q: "Which protocol and port does Gateway Load Balancer use to encapsulate traffic to appliances?",
      options: ["GENEVE on UDP 6081", "VXLAN on UDP 4789", "GRE on protocol 47", "IPsec on UDP 500"],
      answer: 0,
      explain: "GWLB uses GENEVE on UDP port 6081. VXLAN on UDP 4789 is used by traffic mirroring.",
    },
    {
      kind: "mcq",
      q: "A client must allow-list fixed IPs but the application needs path-based routing. What is the best design?",
      options: [
        "NLB with Elastic IPs forwarding to an ALB target group",
        "ALB alone",
        "Classic Load Balancer",
        "Route 53 simple record",
      ],
      answer: 0,
      explain: "NLB provides static IPs and can target an ALB, which provides layer 7 routing.",
    },
    {
      kind: "text",
      q: "Which header does an ALB add so the application can see the original client IP?",
      format: "***************",
      accept: ["x-forwarded-for", "x forwarded for", "xff"],
      explain: "ALB adds X-Forwarded-For with the client IP address.",
    },
  ],
};
