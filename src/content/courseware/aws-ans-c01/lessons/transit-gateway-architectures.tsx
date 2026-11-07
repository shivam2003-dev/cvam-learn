import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Hard",
  objectives: [
    "Explain Transit Gateway attachments, route tables, association and propagation",
    "Design segmentation with multiple route tables (prod, dev, shared, on-premises)",
    "Build a centralized inspection pattern with appliance mode",
    "Peer Transit Gateways across Regions and share them across accounts with RAM",
    "Describe multicast domains and when they are used",
  ],
  tasks: [
    {
      id: "model",
      title: "The Transit Gateway routing model",
      body: (
        <>
          <p>
            A Transit Gateway (TGW) is a Regional virtual router. Networks connect through{" "}
            <strong>attachments</strong>: VPC, Site-to-Site VPN, Direct Connect gateway, Connect
            (SD-WAN), and TGW peering. Two ideas control everything:
          </p>
          <ul>
            <li><strong>Association:</strong> an attachment is associated with exactly <em>one</em> TGW route table. That table decides where traffic <em>coming from</em> the attachment is sent.</li>
            <li><strong>Propagation:</strong> an attachment can propagate its routes into <em>one or many</em> route tables so others know how to reach it.</li>
          </ul>
          <p>
            You also add <strong>static routes</strong> (including <em>blackhole</em> routes to drop
            traffic). By default, a TGW has a default route table to which all attachments associate
            and propagate, creating full connectivity. Disable default association and propagation to
            segment.
          </p>
          <Callout tone="warn" title="Two sides of every path">
            A VPC attachment needs a VPC route table entry pointing at the TGW <em>and</em> a TGW
            route table entry for the destination. Forgetting either side is the most common
            Transit Gateway fault.
          </Callout>
        </>
      ),
    },
    {
      id: "segment",
      title: "Segmentation example",
      body: (
        <>
          <CloudDiagram course="aws-ans-c01" id="transit-gateway-architectures-diagram-1" />
          <Table
            head={["Route table", "Associated attachments", "Contains routes propagated from"]}
            rows={[
              ["RT-Prod", "Prod VPCs", "Shared services, on-premises (not Dev)"],
              ["RT-Dev", "Dev VPCs", "Shared services, on-premises (not Prod)"],
              ["RT-Shared", "Shared services VPC, DX/VPN attachments", "Prod, Dev (so return traffic works)"],
            ]}
          />
        </>
      ),
    },
    {
      id: "inspect",
      title: "Centralized inspection and appliance mode",
      body: (
        <>
          <p>
            To inspect east-west or egress traffic, place a firewall (AWS Network Firewall or
            third-party appliances behind a Gateway Load Balancer) in an <strong>inspection
            VPC</strong> attached to the TGW. Spokes associate with a route table whose default route
            (0.0.0.0/0) points to the inspection attachment; the inspection attachment&apos;s table
            holds the spoke routes.
          </p>
          <ul>
            <li>Enable <strong>appliance mode</strong> on the inspection VPC attachment. It keeps a flow&apos;s forward and return packets on the same AZ&apos;s appliance (symmetric), which stateful firewalls require. Without it, TGW may send the return packet through a different AZ and the firewall drops it.</li>
            <li>Egress to the internet can use a central NAT/egress VPC with a default route from spokes.</li>
            <li>Plan cost: every hop adds TGW data processing charges.</li>
          </ul>
        </>
      ),
    },
    {
      id: "multi",
      title: "Cross-Region, cross-account and multicast",
      body: (
        <>
          <ul>
            <li><strong>Peering attachments</strong> connect TGWs in the same or different Regions and accounts. Routes across a peering are <strong>static only</strong> (no propagation), traffic is encrypted and stays on the AWS backbone.</li>
            <li><strong>Sharing:</strong> share a TGW with other accounts or the whole organization using <strong>AWS RAM</strong>; accounts then create VPC attachments to it, and the TGW owner accepts them (or auto-accepts).</li>
            <li><strong>Multicast:</strong> a TGW can host <em>multicast domains</em>; sources send to a group address and members (ENIs) receive replicated packets. Supports IGMPv2 or static membership, Nitro instances only. Use for market data feeds and cluster discovery.</li>
            <li><strong>Network Manager / Route Analyzer</strong> visualize and validate TGW routes.</li>
            <li><strong>Flow logs</strong> can be enabled on a TGW for visibility of transit traffic.</li>
          </ul>
          <Exercise
            title="Design the route tables"
            task={<p>Workloads are in prod and dev VPCs. Prod and dev must never talk to each other, both reach a shared DNS VPC, and only prod reaches on-premises. How do you configure association and propagation?</p>}
          >
            <p>
              Disable default association and propagation. Create RT-Prod, RT-Dev and RT-Shared. Prod
              attachments associate with RT-Prod; Dev with RT-Dev; the DNS VPC with RT-Shared; the
              DX gateway with RT-Shared (or its own table). Propagate DNS VPC routes into RT-Prod and
              RT-Dev; propagate DX routes into RT-Prod only. Propagate Prod and Dev routes into
              RT-Shared so return traffic works. Prod and Dev routes are never propagated to each
              other&apos;s tables, so they cannot communicate. Add VPC route tables pointing the
              destinations at the TGW.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Association chooses the table used for traffic from an attachment; propagation advertises an attachment's routes into tables.",
    "Disable default association/propagation to segment prod, dev, shared and on-premises.",
    "Appliance mode keeps flows symmetric across AZs for stateful inspection.",
    "TGW peering uses static routes; share a TGW across accounts with RAM; multicast needs a multicast domain and Nitro instances.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How many Transit Gateway route tables can an attachment be associated with?",
      options: ["One", "Two", "Any number", "None; association is automatic"],
      answer: 0,
      explain: "An attachment associates with exactly one route table but can propagate to many.",
    },
    {
      kind: "mcq",
      q: "Stateful firewall appliances in an inspection VPC drop return traffic that arrives via another AZ. Which TGW setting fixes this?",
      options: ["Appliance mode on the VPC attachment", "ECMP support", "Auto accept shared attachments", "DNS support"],
      answer: 0,
      explain: "Appliance mode keeps both directions of a flow on the same AZ network interface.",
    },
    {
      kind: "mcq",
      q: "How are routes exchanged across a Transit Gateway peering attachment?",
      options: ["Static routes only", "BGP propagation", "OSPF", "Automatically via RAM"],
      answer: 0,
      explain: "Peering attachments do not propagate dynamically; add static routes.",
    },
    {
      kind: "mcq",
      q: "What do you use to share a Transit Gateway with other accounts?",
      options: ["AWS RAM", "IAM roles only", "Route 53", "Security groups"],
      answer: 0,
      explain: "RAM shares the TGW so other accounts can create attachments.",
    },
    {
      kind: "text",
      q: "Which type of route do you add to a TGW route table to deliberately drop traffic?",
      format: "*********",
      accept: ["blackhole", "blackhole route"],
      explain: "A blackhole route drops packets that match its CIDR.",
    },
  ],
};
