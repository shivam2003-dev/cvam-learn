import { NET } from "../kit/builder";
import { makeLesson } from "../kit/makeLesson";

export const lesson = makeLesson({
  minutes: 26,
  difficulty: "Medium",
  context: "The first design review of any cloud project: how big is the network, how is it carved up and how does traffic enter, leave and stay private?",
  objectives: [
    "Plan a CIDR range that leaves room to grow and avoids overlap",
    "Explain what makes a subnet public, private or isolated using route tables",
    "Place an internet gateway, a NAT gateway and private endpoints correctly",
    "Describe how each cloud scopes subnets (per zone or per region)",
  ],
  problem: [
    "A team creates a network with a /24 because 254 addresses 'seemed plenty'. A year later they have 30 services, Kubernetes pods that each take an address, a second Region and an acquisition whose network uses the same range. Nothing can be connected without NAT and renumbering means rebuilding.",
    "Network design is the hardest thing to change later. A few hours planning address space, route tables and exit paths saves months of rework.",
  ],
  diagramTitle: "Subnets, route tables and the paths in and out",
  arch: {
    width: 960,
    height: 500,
    groups: [
      { id: "net", kind: "network", x: 290, y: 30, w: 640, h: 450, label: NET, sub: "10.0.0.0/16", icon: "network", step: 1 },
      { id: "pub", kind: "public", x: 310, y: 70, w: 600, h: 120, label: { aws: "Public subnets: route to internet gateway", azure: "Public subnets: public IPs allowed", gcp: "Public subnets: external IPs allowed", oci: "Public subnets: route to internet gateway" }, sub: "10.0.0.0/20", step: 2 },
      { id: "app", kind: "private", x: 310, y: 205, w: 600, h: 120, label: "Private app subnets: outbound via NAT", sub: "10.0.16.0/20", step: 2 },
      { id: "data", kind: "private", x: 310, y: 340, w: 600, h: 120, label: "Isolated data subnets: no internet route", sub: "10.0.32.0/20", step: 2 },
    ],
    nodes: [
      { id: "users", svc: "users", x: 55, y: 125, step: 3 },
      { id: "igw", svc: "igw", x: 290, y: 125, step: 3, skip: ["azure", "gcp"] },
      { id: "lb", svc: "lb", x: 640, y: 125, step: 3 },
      { id: "vm", svc: "vm", x: 640, y: 260, step: 4, label: "App servers" },
      { id: "db", svc: "db", x: 640, y: 395, step: 4 },
      { id: "nat", svc: "nat", x: 830, y: 125, step: 5 },
      { id: "pl", svc: "privlink", x: 480, y: 260, step: 6, label: { aws: "VPC endpoint", azure: "Private Endpoint", gcp: "Private Service Connect", oci: "Service gateway" } },
    ],
    edges: [
      { from: "users", to: "igw", step: 3, num: 1 },
      { from: "igw", to: "lb", step: 3, num: 2 },
      { from: "users", to: "lb", step: 3, num: 2, label: "public IP", skip: ["aws", "oci"] },
      { from: "lb", to: "vm", step: 4, num: 3 },
      { from: "vm", to: "db", step: 4, num: 4 },
      { from: "vm", to: "nat", step: 5, dashed: true, elbow: "hv", label: "outbound only" },
      { from: "vm", to: "pl", step: 6, dashed: true },
    ],
    steps: [
      {
        title: "Choose the address space",
        body: "Pick one private range for the network, large enough for years of growth, and carve every environment from a single organisation-wide plan.",
        points: ["Use RFC 1918 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) and never overlap with offices, other clouds or partners.", "A /16 gives 65,536 addresses. Kubernetes pods and serverless networking can consume many; plan for them.", "Keep an address register: who owns which range, in which cloud and Region."],
        per: {
          aws: "AWS: a VPC takes a primary CIDR between /16 and /28 and can add secondary ranges later; IPAM tracks allocations across accounts.",
          azure: "Azure: a virtual network has one or more address spaces that can be extended; Azure Virtual Network Manager and IPAM help across subscriptions.",
          gcp: "Google Cloud: a VPC has no single range; each subnet has its own primary (and optional secondary) range, which you can expand but not shrink.",
          oci: "OCI: a VCN takes one or more CIDR blocks (up to /16 each) that can be added later; subnets are carved from them.",
        },
      },
      {
        title: "Create tiers of subnets",
        body: "Group resources by how exposed they should be. Each tier gets its own subnets, route table and rules, so the network itself enforces who can talk to whom.",
        points: ["Public subnets hold only what must be reachable: load balancers and NAT.", "Private subnets hold application servers and containers.", "Isolated subnets hold databases with no route to the internet at all.", "Leave unused space between tiers so you can add subnets later."],
        per: {
          aws: "AWS: subnets are tied to one Availability Zone, so each tier gets a subnet per zone (shown here as one band per tier); a /20 per tier-zone is generous.",
          azure: "Azure: subnets are regional and span all zones, so one subnet per tier is enough; some services need their own delegated subnet.",
          gcp: "Google Cloud: subnets are regional and span all zones in the Region; one subnet per tier per Region.",
          oci: "OCI: regional subnets (recommended) span all availability domains; you choose public or private when you create each subnet.",
        },
      },
      {
        title: "Open the front door",
        body: "A subnet is public because its route table sends internet-bound traffic to an internet gateway and its resources have public addresses. Everything else stays unreachable from outside.",
        points: ["Only the load balancer needs to be public.", "The route table, not the subnet name, defines public versus private."],
        per: {
          aws: "AWS: attach an internet gateway to the VPC and add 0.0.0.0/0 to it in the public route table.",
          azure: "Azure: there is no gateway object; a resource with a public IP is internet-reachable if an NSG allows the traffic.",
          gcp: "Google Cloud: the default internet gateway route (0.0.0.0/0) exists in every VPC; reachability comes from an external IP plus a firewall rule.",
          oci: "OCI: create an internet gateway and add a route rule to it in the public subnet's route table.",
        },
      },
      {
        title: "Place application and data tiers",
        body: "App servers sit in private subnets with no public address; databases sit in isolated subnets. Traffic flows only downward: load balancer to app to database.",
        points: ["Write rules by tier (security group, NSG, tag or service account), not by IP address.", "Isolated subnets need no route out, which removes a whole class of exfiltration."],
        per: {
          aws: "AWS: security groups reference each other (app allows the load balancer's group; database allows the app's group).",
          azure: "Azure: NSGs with application security groups name roles instead of addresses.",
          gcp: "Google Cloud: firewall rules target service accounts or tags, so rules follow the workload.",
          oci: "OCI: network security groups attach to VNICs and can reference each other.",
        },
      },
      {
        title: "Give private servers a way out",
        body: "Private servers still need to download patches and call external APIs. A NAT service lets them start outbound connections while accepting none inbound.",
        points: ["NAT lives in a public subnet (or is a managed service) and translates private addresses to a public one.", "Every NAT egress is a cost and a choke point; send cloud-service traffic through private endpoints instead (next step)."],
        per: {
          aws: "AWS: a NAT gateway per Availability Zone in a public subnet; private route tables point 0.0.0.0/0 at it.",
          azure: "Azure: NAT Gateway attached to the subnet gives a fixed outbound address; it replaces default outbound access.",
          gcp: "Google Cloud: Cloud NAT on a Cloud Router, software-defined with no instance to manage.",
          oci: "OCI: a NAT gateway with a route rule on the private subnet's route table.",
        },
      },
      {
        title: "Reach cloud services privately",
        body: "Calls to storage, queues and databases should not cross the internet. Private endpoints put those services on addresses inside your network, cutting NAT cost and exposure.",
        points: ["Disable public access on the service itself once the private path works.", "Private endpoints usually need private DNS so the service's normal name resolves to the private address."],
        per: {
          aws: "AWS: gateway endpoints (free) for S3 and DynamoDB; interface endpoints (PrivateLink) for most other services.",
          azure: "Azure: Private Endpoint with a private DNS zone; service endpoints are the simpler, older option.",
          gcp: "Google Cloud: Private Google Access for Google APIs; Private Service Connect for published and partner services.",
          oci: "OCI: a service gateway reaches Object Storage and other Oracle services without an internet path.",
        },
      },
    ],
  },
  notes: {
    aws: ["Each subnet reserves five addresses; secondary CIDR blocks let you add space to a full VPC.", "Route tables are per subnet; the main route table is a default, so make it private and create explicit public ones."],
    azure: ["Azure reserves five addresses per subnet. Peering needs non-overlapping ranges, and resizing a subnet requires it to be empty.", "User-defined routes override system routes and are how you steer traffic through a firewall."],
    gcp: ["A custom-mode VPC lets you choose subnet ranges; auto mode creates one in every Region and its ranges can collide with your plan.", "Routes are global in a VPC but subnets are regional, which simplifies multi-Region addressing."],
    oci: ["Each subnet reserves three addresses. Route tables and security lists attach per subnet, NSGs per VNIC.", "A DRG is the gateway to other VCNs and on-premises; internet and NAT gateways are separate."],
  },
  decisions: [
    { title: "Bigger than you think", text: "Address space is free; renumbering is not. Start with a /16 per environment unless you have a reason not to." },
    { title: "One plan for everything", text: "Allocate ranges from a central plan for all clouds, Regions and on-premises sites before any team creates a network." },
    { title: "Private by default", text: "Start with no public addresses and add exposure deliberately. It is much harder to remove it later." },
    { title: "NAT is a cost centre", text: "Heavy outbound traffic through NAT is billed per GB. Use private endpoints, caches and proxies for repeated downloads." },
  ],
  exercise: {
    title: "Size the network",
    task: "You will run 3 environments in 2 Regions, each with a three-tier app, plus a Kubernetes cluster that may reach 500 pods. Propose an address plan.",
    answer: [
      "Reserve 10.0.0.0/8 as the organisation space, and allocate a /16 per environment per Region: that is six /16 blocks (for example 10.0 to 10.5), leaving the rest for growth and other clouds.",
      "Inside each /16, give each tier a /20 (4,096 addresses) and reserve a larger block (for example a /19) for Kubernetes pods, as they take addresses from the network on most clouds.",
      "Keep gaps between blocks and document the plan in an IPAM tool so no team invents a range.",
      "Check against on-premises ranges and likely acquisitions before you commit; overlap discovered later means NAT or rebuild.",
    ],
  },
  takeaways: [
    "Choose a large private range from one organisation-wide plan and never overlap.",
    "Public, private and isolated tiers are defined by route tables and rules.",
    "Only load balancers (and NAT) belong in public subnets; databases get no internet route.",
    "Use NAT for outbound internet and private endpoints for cloud services.",
    "Know your cloud's subnet scope: AWS per zone, the others per Region.",
  ],
  quiz: [
    { kind: "mcq", q: "What actually makes an AWS subnet 'public'?", options: ["A route to an internet gateway", "Its name", "Its size", "Having a database"], answer: 0, explain: "Public versus private is defined by the route table." },
    { kind: "mcq", q: "Why use private endpoints for cloud services?", options: ["Traffic stays off the internet and avoids NAT charges", "They make the CIDR larger", "They replace route tables", "They remove the need for DNS"], answer: 0, explain: "Private endpoints keep service traffic on your network." },
    { kind: "mcq", q: "Which problem does overlapping CIDR ranges cause?", options: ["Networks cannot be connected without NAT or renumbering", "Slower DNS", "Weaker encryption", "Higher storage cost"], answer: 0, explain: "Overlapping addresses are ambiguous to routers." },
    { kind: "text", q: "How many addresses does a /24 contain? (number)", format: "***", accept: ["256"], explain: "A /24 has 2^8 = 256 addresses (fewer usable, as clouds reserve some)." },
  ],
});
