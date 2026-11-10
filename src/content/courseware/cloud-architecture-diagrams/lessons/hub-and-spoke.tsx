import { makeLesson } from "../kit/makeLesson";

export const lesson = makeLesson({
  minutes: 26,
  difficulty: "Hard",
  context: "Enterprises with many teams, many networks and an office or data centre to connect: the standard landing-zone network.",
  objectives: [
    "Explain why a hub-and-spoke network scales better than a mesh",
    "Place a transit hub, a central firewall, spokes and on-premises links",
    "Describe how traffic between spokes is inspected",
    "Compare the hub service on each cloud, including peering limits",
  ],
  problem: [
    "A company grows to twenty networks, one per team or environment. Connecting every pair needs 190 peering links, each with its own routes and firewall rules, and nobody can answer 'who can reach whom?'.",
    "Hub-and-spoke connects every network to one hub. Shared services, on-premises links and security inspection live in the hub, and each spoke stays small and self-contained.",
  ],
  diagramTitle: "Hub-and-spoke network with central inspection and hybrid links",
  arch: {
    width: 960,
    height: 480,
    groups: [
      { id: "hub", kind: "network", x: 300, y: 60, w: 280, h: 370, label: "Hub network", sub: "10.0.0.0/22", step: 1 },
      { id: "sa", kind: "private", x: 650, y: 30, w: 290, h: 130, label: "Spoke: production", sub: "10.10.0.0/16", step: 2 },
      { id: "sb", kind: "private", x: 650, y: 175, w: 290, h: 130, label: "Spoke: development", sub: "10.20.0.0/16", step: 2 },
      { id: "sc", kind: "private", x: 650, y: 320, w: 290, h: 130, label: "Spoke: shared data", sub: "10.30.0.0/16", step: 2 },
    ],
    nodes: [
      { id: "transit", svc: "transit", x: 440, y: 150, step: 1, label: "Transit hub router" },
      { id: "fw", svc: "firewall", x: 440, y: 330, step: 3, label: "Central firewall" },
      { id: "a", svc: "vm", x: 820, y: 105, step: 2, label: "Production workloads" },
      { id: "b", svc: "vm", x: 820, y: 250, step: 2, label: "Development workloads" },
      { id: "c", svc: "db", x: 820, y: 395, step: 2, label: "Shared databases" },
      { id: "onprem", svc: "server", x: 55, y: 250, step: 4, label: "On-premises network" },
      { id: "vpn", svc: "vpn", x: 190, y: 160, step: 4 },
      { id: "dc", svc: "interconnect", x: 190, y: 340, step: 4 },
    ],
    edges: [
      { from: "transit", to: "a", step: 2, num: 4, via: [[620, 150], [620, 105]] },
      { from: "transit", to: "b", step: 2, via: [[620, 150], [620, 250]] },
      { from: "transit", to: "c", step: 2, via: [[620, 150], [620, 395]] },
      { from: "transit", to: "fw", step: 3, num: 3, both: true, label: "inspect" },
      { from: "onprem", to: "vpn", step: 4, num: 1, via: [[55, 160]] },
      { from: "onprem", to: "dc", step: 4, via: [[55, 340]] },
      { from: "vpn", to: "transit", step: 4, num: 2, via: [[330, 160], [330, 150]] },
      { from: "dc", to: "transit", step: 4, via: [[330, 340], [330, 150]] },
    ],
    steps: [
      {
        title: "Build the hub",
        body: "The hub is a small network that owns the connections. Its router passes traffic between everything attached to it, so spokes never connect to each other directly.",
        points: ["Keep the hub tiny and locked down: only network and security teams change it.", "Reserve address space for it and for many future spokes before you start."],
        per: {
          aws: "AWS: a Transit Gateway is the hub router; spokes attach as VPC attachments, each associated with a route table.",
          azure: "Azure: a hub virtual network (or Virtual WAN hub) with spokes connected by peering.",
          gcp: "Google Cloud: Network Connectivity Center hub with VPC spokes, or a hub VPC with peering for simple cases.",
          oci: "OCI: a Dynamic Routing Gateway (DRG) is the hub; VCNs attach with their own route tables.",
        },
      },
      {
        title: "Attach the spokes",
        body: "Each team or environment gets its own spoke network with a non-overlapping address range. A spoke can reach the hub but not other spokes unless a rule allows it.",
        points: ["Plan non-overlapping CIDR ranges; overlap cannot be routed and is painful to fix later.", "Separate production from development at the network level."],
        per: {
          aws: "AWS: attach each VPC to the Transit Gateway; use separate route tables so dev cannot route to prod.",
          azure: "Azure: peer each spoke to the hub with 'use remote gateway' and user-defined routes through the firewall.",
          gcp: "Google Cloud: VPC peering is not transitive, so spokes that must talk through a hub need Network Connectivity Center, Cloud VPN or a proxy.",
          oci: "OCI: attach each VCN to the DRG and use DRG route tables and import distributions to control reachability.",
        },
      },
      {
        title: "Inspect traffic centrally",
        body: "Routes send spoke-to-spoke, spoke-to-internet and on-premises traffic through one firewall in the hub, so policy is written, logged and audited in one place.",
        points: ["Traffic must return through the same firewall in both directions (symmetric routing).", "Size the firewall for peak throughput and deploy it across zones."],
        per: {
          aws: "AWS: AWS Network Firewall or Gateway Load Balancer appliances in an inspection VPC; enable appliance mode on the Transit Gateway attachment to keep flows symmetric.",
          azure: "Azure: Azure Firewall in the hub, with route tables sending 0.0.0.0/0 and spoke prefixes to its private IP.",
          gcp: "Google Cloud: Cloud NGFW or third-party firewall appliances behind an internal load balancer used as the next hop.",
          oci: "OCI: OCI Network Firewall in a hub VCN, with DRG and VCN route tables steering traffic through it.",
        },
      },
      {
        title: "Connect the office and data centre",
        body: "A VPN gives quick, encrypted connectivity over the internet. A dedicated link gives predictable latency and bandwidth. Production usually uses both, the VPN as backup.",
        points: ["Use BGP so routes are learned dynamically and failover is automatic.", "Terminate hybrid links in the hub only; spokes reach on-premises through it."],
        per: {
          aws: "AWS: Site-to-Site VPN and Direct Connect (via a Direct Connect gateway and transit virtual interface) attach to the Transit Gateway.",
          azure: "Azure: VPN Gateway and ExpressRoute gateway in the hub (or Virtual WAN with built-in gateways).",
          gcp: "Google Cloud: Cloud VPN (HA) and Dedicated or Partner Interconnect attach through Cloud Router.",
          oci: "OCI: Site-to-Site VPN and FastConnect attach to the DRG.",
        },
      },
    ],
  },
  notes: {
    aws: ["Transit Gateway bills per attachment and per GB processed, so heavy inspected traffic can be expensive; model it before committing.", "Direct Connect needs a transit virtual interface and a Direct Connect gateway to reach a Transit Gateway."],
    azure: ["Virtual WAN is the managed alternative to building your own hub: it handles routing, VPN and ExpressRoute for you, at a price.", "Spoke-to-spoke traffic only goes through the hub firewall if you add user-defined routes that send it there."],
    gcp: ["VPC networks are global, so many designs need fewer spokes than on other clouds; a Shared VPC across projects often replaces peering.", "Because VPC peering is not transitive, hub-and-spoke on Google Cloud uses Network Connectivity Center or a routing appliance."],
    oci: ["The DRG is both the hybrid gateway and the inter-VCN router, which simplifies the hub design.", "Use separate DRG route tables per attachment type to stop spokes learning each other's routes."],
  },
  decisions: [
    { title: "Hub-and-spoke versus mesh", text: "A mesh needs n(n-1)/2 links and rules. A hub needs n and one place to inspect, at the cost of an extra hop." },
    { title: "Centralise the firewall or distribute it", text: "A central firewall is easy to audit but is a throughput bottleneck and a shared fate. Distributed firewalls scale but multiply policy." },
    { title: "Transitive routing", text: "Check whether the underlying connection type is transitive. Peering often is not, which is why a router hub exists." },
    { title: "Address plan first", text: "Overlapping ranges cannot be connected without NAT. Allocate from one organisation-wide plan." },
  ],
  exercise: {
    title: "Add a new team",
    task: "A new team needs a network that can reach shared databases and the internet, but not production. What do you do in the hub-and-spoke design?",
    answer: [
      "Allocate a non-overlapping range from the address plan and create the spoke network.",
      "Attach it to the hub and associate it with the route table or policy used by development spokes, not production.",
      "Add firewall rules allowing the new spoke to reach the shared database ports and egress to the internet, and nothing else.",
      "Because production is reached only through the hub, the new team has no route to it, and the firewall logs prove it.",
    ],
  },
  takeaways: [
    "Hub-and-spoke scales linearly; a mesh grows quadratically.",
    "The hub owns the hybrid links, the router and the firewall; spokes stay simple.",
    "Route spoke-to-spoke and egress traffic through the firewall, symmetrically.",
    "Use a VPN plus a dedicated link with BGP for hybrid resilience.",
    "Plan non-overlapping address space before you build.",
  ],
  quiz: [
    { kind: "mcq", q: "How many peering links does a full mesh of 20 networks need?", options: ["190", "20", "40", "400"], answer: 0, explain: "n(n-1)/2 = 20 × 19 / 2 = 190." },
    { kind: "mcq", q: "Why is symmetric routing important with a central firewall?", options: ["The firewall must see both directions of a flow", "It reduces DNS lookups", "It encrypts packets", "It hides IP addresses"], answer: 0, explain: "Stateful firewalls drop flows when only one direction passes through them." },
    { kind: "mcq", q: "What problem do overlapping IP ranges cause?", options: ["They cannot be routed between networks", "They slow down DNS", "They disable encryption", "They remove logs"], answer: 0, explain: "Overlap makes addresses ambiguous, so networks cannot be connected without NAT." },
    { kind: "text", q: "Which routing protocol do VPNs and dedicated links use to exchange routes dynamically? (three letters)", format: "***", accept: ["bgp"], explain: "Border Gateway Protocol (BGP)." },
  ],
});
