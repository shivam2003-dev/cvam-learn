import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Explain AWS Network Firewall components: firewall, policy, rule groups and endpoints",
    "Compare distributed, centralized egress and centralized inspection deployment models",
    "Route traffic through Network Firewall or Gateway Load Balancer appliances correctly",
    "Choose proxies, NAT and domain filtering for outbound control",
    "Log and monitor firewall decisions",
  ],
  tasks: [
    {
      id: "nfw",
      title: "AWS Network Firewall",
      body: (
        <>
          <p>
            <strong>AWS Network Firewall</strong> is a managed, stateful network firewall and
            intrusion prevention service. You deploy a <strong>firewall</strong> into a VPC with one{" "}
            <strong>firewall endpoint</strong> per AZ, each in a dedicated firewall subnet. A{" "}
            <strong>firewall policy</strong> references <strong>rule groups</strong>.
          </p>
          <Table
            head={["Component", "Detail"]}
            rows={[
              ["Stateless rule groups", "Evaluated first, per packet, by priority: 5-tuple match with pass, drop, or forward to the stateful engine"],
              ["Stateful rule groups", "Connection-aware: 5-tuple rules, domain list rules (allow/deny by hostname via HTTP Host or TLS SNI), and Suricata-compatible IPS rules; default evaluation order or strict order"],
              ["Default actions", "Policy-level actions for traffic that matches no rule (drop, alert, forward to stateful)"],
              ["TLS inspection", "Decrypts and inspects TLS with certificates from ACM"],
              ["Logging", "Alert and flow logs to S3, CloudWatch Logs or Firehose"],
              ["Management", "Central policy and rule group sharing via AWS RAM and Firewall Manager"],
            ]}
          />
          <Callout tone="warn" title="Routing makes or breaks it">
            A firewall inspects only what you route to its endpoint. You must add routes so traffic
            enters and leaves via the firewall endpoint (and keep flows symmetric). Misrouted traffic
            bypasses inspection silently.
          </Callout>
        </>
      ),
    },
    {
      id: "models",
      title: "Deployment models",
      body: (
        <>
          <Table
            head={["Model", "Layout", "Pros", "Cons"]}
            rows={[
              ["Distributed", "Firewall (or NAT + firewall) in every VPC", "Local control, no transit hops, per-app rules", "Cost and policy sprawl; mitigate with Firewall Manager"],
              ["Centralized egress", "Spokes send 0.0.0.0/0 via TGW to an egress VPC with NAT gateways (and firewall)", "One place for internet access and logging; fewer NATs", "TGW processing cost, single choke point"],
              ["Centralized inspection (east-west + north-south)", "TGW routes all inter-VPC and on-premises traffic through an inspection VPC", "Uniform policy and visibility, segmentation proof", "Hairpin latency, appliance mode required, scale planning"],
              ["Ingress with edge routing", "Route table on the IGW sends inbound traffic to firewall endpoint then to the ALB subnet", "Inspect internet inbound traffic", "Careful route design"],
            ]}
          />
          <Figure caption="Centralized inspection with Transit Gateway. Spoke route tables send 0.0.0.0/0 to the inspection attachment; the inspection VPC sends cleaned traffic to the egress NAT or back to another spoke.">
            <Graph
              label="Spoke VPCs send traffic through Transit Gateway to an inspection VPC with Network Firewall, then to an egress VPC with NAT and the internet gateway"
              cellW={190}
              cellH={96}
              nodeW={160}
              nodes={[
                { id: "s1", label: "Spoke VPC A", col: 0, row: 0, tone: "sky" },
                { id: "s2", label: "Spoke VPC B", col: 0, row: 1, tone: "sky" },
                { id: "tgw", label: "Transit Gateway", sub: "appliance mode", col: 1, row: 0.5, tone: "lime" },
                { id: "ins", label: "Inspection VPC", sub: "Network Firewall endpoints", col: 2, row: 0.5, tone: "amber" },
                { id: "eg", label: "Egress VPC", sub: "NAT + IGW", col: 3, row: 0.5, tone: "plain" },
              ]}
              edges={[
                { from: "s1", to: "tgw" },
                { from: "s2", to: "tgw" },
                { from: "tgw", to: "ins", both: true },
                { from: "ins", to: "eg" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "gwlb",
      title: "Gateway Load Balancer and third-party appliances",
      body: (
        <>
          <p>
            When you need a specific vendor firewall, IDS/IPS or DPI, use a{" "}
            <strong>Gateway Load Balancer</strong>. Appliances register as GWLB targets; a{" "}
            <strong>GWLB endpoint</strong> in each protected VPC (or in a central VPC) is the next hop.
            Traffic is encapsulated with GENEVE (UDP 6081), balanced by a 5-tuple flow hash, and
            returned to the same path, keeping both directions on one appliance.
          </p>
          <ul>
            <li>Distributed: a GWLB endpoint in every VPC pointing to a shared appliance fleet (endpoint service model).</li>
            <li>Centralized: Transit Gateway to an inspection VPC containing GWLB and appliances, with <strong>appliance mode</strong> on the attachment.</li>
            <li>Health checks remove failed appliances; the fleet scales out behind the GWLB.</li>
          </ul>
          <h3>Proxies, NAT and domain control</h3>
          <ul>
            <li><strong>NAT gateway</strong> provides address translation but no filtering; add Network Firewall domain rules or security groups.</li>
            <li><strong>Forward proxy fleet</strong> (for example Squid behind an NLB) allows URL-level control and caching, with authentication and logging.</li>
            <li><strong>DNS Firewall</strong> blocks bad domains at the resolver; combine with network filtering to stop direct-IP exfiltration.</li>
            <li><strong>VPC endpoint policies</strong> restrict which AWS resources can be accessed from private subnets (for example only your S3 buckets), a powerful egress control for AWS APIs.</li>
          </ul>
          <Exercise
            title="Egress control"
            task={<p>Workloads in 60 VPCs must reach only a list of SaaS domains on the internet, all denied traffic must be logged centrally, and teams must not run their own NAT gateways. Design it.</p>}
          >
            <p>
              Use <strong>centralized egress</strong>: spokes route 0.0.0.0/0 to the Transit Gateway
              and an egress/inspection VPC with <strong>Network Firewall</strong> (stateful domain-list
              allow rules, default drop) in front of NAT gateways in each AZ, with appliance mode on.
              Send alert and flow logs to a central S3 bucket or CloudWatch Logs account. Manage the
              policy once with Firewall Manager, and block creation of IGWs and NAT gateways in
              workload accounts with SCPs.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Network Firewall has stateless then stateful engines, domain and Suricata rules, endpoints per AZ in dedicated subnets, and logs to S3/CloudWatch/Firehose.",
    "Inspection only works if routing sends traffic through the endpoint and keeps it symmetric.",
    "Choose distributed, centralized egress or centralized inspection by cost, control and latency trade-offs.",
    "GWLB with GENEVE scales third-party appliances; endpoint policies and DNS Firewall add egress control.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which AWS service lets you drive third-party firewall appliances transparently and scale them out?",
      options: ["Gateway Load Balancer", "NAT gateway", "Application Load Balancer", "Route 53 Resolver"],
      answer: 0,
      explain: "GWLB distributes flows over GENEVE to virtual appliance targets.",
    },
    {
      kind: "mcq",
      q: "Where are AWS Network Firewall endpoints deployed?",
      options: ["In dedicated firewall subnets, one endpoint per AZ", "In the Transit Gateway", "On the instance", "In S3"],
      answer: 0,
      explain: "Each AZ gets a firewall endpoint in a firewall subnet; route tables send traffic to it.",
    },
    {
      kind: "mcq",
      q: "Which Network Firewall rule type can allow only specified hostnames?",
      options: ["Stateful domain list rule group", "Stateless 5-tuple rule", "NACL", "Security group"],
      answer: 0,
      explain: "Domain list rules match HTTP Host headers or TLS SNI.",
    },
    {
      kind: "mcq",
      q: "Centralized inspection through Transit Gateway intermittently drops return traffic. What must be enabled?",
      options: ["Appliance mode on the inspection VPC attachment", "Multicast", "DNS resolution support", "Auto accept"],
      answer: 0,
      explain: "Without appliance mode the return packet can traverse a different AZ than the request.",
    },
    {
      kind: "text",
      q: "Which engine in Network Firewall evaluates first: stateless or stateful?",
      format: "*********",
      accept: ["stateless"],
      explain: "Stateless rules run first and can forward packets to the stateful engine.",
    },
  ],
};
