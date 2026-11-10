import type { ArchEdge, ArchGroup, ArchNode, ArchSpec, ArchSpecs, ArchStep, Provider } from "@/lib/cloud";

/**
 * Three-tier web application, drawn once per provider on the same grid so the
 * reader can flip clouds and watch the same layer change names. Geometry is
 * shared; each provider supplies its own labels, icons and explanations.
 */

type Cfg = {
  region: string;
  network: { label: string; sub: string };
  zones: [string, string];
  /** Subnets span every zone (Azure, GCP, OCI) instead of living in one (AWS). */
  regionalSubnets: boolean;
  subnets: { web: string; app: string; data: string };
  igw?: { label: string };
  dns: string;
  lb: string;
  web: string;
  nat: string;
  app: string;
  db: [string, string];
  dbStandby: [string, string];
  steps: ArchStep[];
};

const icon = (p: Provider, name: string) => `/images/cloud-icons/${p}/${name}.png`;

const CIDR = { net: "10.0.0.0/16", web: ["10.0.1.0/24", "10.0.2.0/24"], app: ["10.0.11.0/24", "10.0.12.0/24"], data: ["10.0.21.0/24", "10.0.22.0/24"] };

const X = [470, 785]; // web / app / db column per zone
const NAT_X = [560, 875];

function build(p: Provider, c: Cfg): ArchSpec {
  const groups: ArchGroup[] = [
    { id: "region", kind: "region", x: 255, y: 20, w: 685, h: 545, label: c.region, step: 1 },
    { id: "net", kind: "network", x: 290, y: 40, w: 640, h: 510, label: c.network.label, sub: c.network.sub, icon: icon(p, "network"), step: 1 },
  ];
  const zoneX = [305, 620];
  const zoneW = [300, 295];
  c.zones.forEach((label, i) => {
    groups.push({ id: `zone-${i}`, kind: "zone", x: zoneX[i], y: 175, w: zoneW[i], h: 365, label, step: 2 });
  });

  const rows: { key: "web" | "app" | "data"; y: number; h: number; kind: "public" | "private" }[] = [
    { key: "web", y: 210, h: 95, kind: "public" },
    { key: "app", y: 315, h: 95, kind: "private" },
    { key: "data", y: 420, h: 105, kind: "private" },
  ];
  for (const row of rows) {
    if (c.regionalSubnets) {
      groups.push({ id: `sub-${row.key}`, kind: row.kind, x: 315, y: row.y, w: 600, h: row.h, label: c.subnets[row.key], sub: CIDR[row.key === "web" ? "web" : row.key][0], step: 3 });
    } else {
      [0, 1].forEach((i) => {
        groups.push({ id: `sub-${row.key}-${i}`, kind: row.kind, x: zoneX[i] + 10, y: row.y, w: 280, h: row.h, label: c.subnets[row.key], sub: CIDR[row.key][i], step: 3 });
      });
    }
  }

  const nodes: ArchNode[] = [
    { id: "users", x: 50, y: 320, icon: "/images/cloud-icons/common/users.png", label: "Users", step: 4 },
    { id: "dns", x: 165, y: 320, icon: icon(p, "dns"), label: c.dns, step: 4 },
    { id: "lb", x: 610, y: 100, icon: icon(p, "lb"), label: c.lb, step: 5 },
  ];
  if (c.igw) nodes.push({ id: "igw", x: 290, y: 100, icon: icon(p, "igw"), label: c.igw.label, step: 4 });
  [0, 1].forEach((i) => {
    nodes.push({ id: `web${i}`, x: X[i], y: 245, icon: icon(p, "vm"), label: c.web, step: 6 });
    if (!c.regionalSubnets || i === 0) {
      nodes.push({ id: `nat${i}`, x: NAT_X[i], y: 245, icon: icon(p, "nat"), label: c.nat, step: 6 });
    }
    nodes.push({ id: `app${i}`, x: X[i], y: 345, icon: icon(p, "vm"), label: c.app, step: 7 });
  });
  nodes.push({ id: "db0", x: X[0], y: 465, icon: icon(p, "db"), label: c.db[0], sub: c.db[1], step: 8 });
  nodes.push({ id: "db1", x: X[1], y: 465, icon: icon(p, "db"), label: c.dbStandby[0], sub: c.dbStandby[1], step: 8 });

  const edges: ArchEdge[] = [{ from: "users", to: "dns", step: 4, num: 1, label: "lookup" }];
  if (c.igw) {
    edges.push({ from: "users", to: "igw", step: 4, num: 2, via: [[50, 100]] });
    edges.push({ from: "igw", to: "lb", step: 5, num: 3 });
  } else {
    edges.push({ from: "users", to: "lb", step: 5, num: 2, via: [[50, 100]] });
  }
  const n = c.igw ? 4 : 3;
  edges.push({ from: "lb", to: "web0", step: 6, num: n, via: [[610, 168], [470, 168]] });
  edges.push({ from: "lb", to: "web1", step: 6, via: [[610, 168], [785, 168]] });
  edges.push({ from: "web0", to: "app0", step: 7, num: n + 1 });
  edges.push({ from: "web1", to: "app1", step: 7 });
  edges.push({ from: "app0", to: "db0", step: 8, num: n + 2, fromShift: -10, toShift: -10 });
  edges.push({ from: "app1", to: "db0", step: 8, via: [[785, 414], [480, 414]], toShift: 10 });
  edges.push({ from: "db0", to: "db1", step: 8, dashed: true, both: true, label: "sync replication" });

  return { width: 960, height: 580, groups, nodes, edges, steps: c.steps };
}

const aws: Cfg = {
  region: "Region us-east-1",
  network: { label: "VPC", sub: CIDR.net },
  zones: ["Availability Zone a", "Availability Zone b"],
  regionalSubnets: false,
  subnets: { web: "Public subnet", app: "Private subnet (app)", data: "Private subnet (data)" },
  igw: { label: "Internet gateway" },
  dns: "Amazon Route 53",
  lb: "Application Load Balancer",
  web: "Web servers (ASG)",
  nat: "NAT gateway",
  app: "App servers (ASG)",
  db: ["RDS primary", "Multi-AZ writer"],
  dbStandby: ["RDS standby", "sync replica"],
  steps: [
    {
      title: "Create the VPC",
      body: "Everything starts with a Virtual Private Cloud: your own isolated network inside one Region. You choose its IP range once, so pick it with room to grow.",
      points: [
        "Use 10.0.0.0/16: 65,536 addresses, plenty to carve into subnets.",
        "A VPC lives in a single Region and spans all of that Region's Availability Zones.",
        "Nothing can reach it yet: no internet gateway, no peering, no VPN.",
        "Avoid ranges that overlap with your office, other VPCs or on-premises networks; you cannot peer overlapping ranges.",
      ],
    },
    {
      title: "Spread across two Availability Zones",
      body: "An Availability Zone is one or more data centres with independent power and networking. Using two means one building failing does not take the application down.",
      points: [
        "Production workloads should use at least two AZs; three for quorum-based systems.",
        "AZs are connected by low-latency private links, so cross-AZ traffic is fast but billed per GB.",
        "A subnet cannot span AZs on AWS, so each AZ gets its own set of subnets in the next step.",
      ],
    },
    {
      title: "Carve public and private subnets",
      body: "Each AZ gets three subnets, one per tier. A subnet is 'public' only because its route table sends 0.0.0.0/0 to an internet gateway; the others have no such route.",
      points: [
        "Public subnet: web tier and NAT gateway. Private app subnet: business logic. Private data subnet: databases.",
        "One /24 per subnet gives 251 usable addresses (AWS reserves five).",
        "Separate subnets let you give each tier its own route table and network ACL.",
        "Leave unused CIDR space between tiers so you can add subnets later.",
      ],
    },
    {
      title: "Add users, DNS and the internet gateway",
      body: "Users find your site through DNS and enter the VPC through an internet gateway, the one door between the VPC and the public internet.",
      points: [
        "Route 53 holds an alias record for www.example.com that points to the load balancer.",
        "The internet gateway is horizontally scaled and highly available; it carries no bandwidth charge itself.",
        "Attaching it is not enough: public subnets also need a route 0.0.0.0/0 → igw.",
      ],
    },
    {
      title: "Place the Application Load Balancer",
      body: "The ALB gives users one stable address and spreads requests over healthy servers in both zones. It terminates TLS and understands HTTP paths and headers.",
      points: [
        "Enable it in a public subnet of each AZ; it creates one node per AZ.",
        "Attach an ACM certificate for HTTPS on port 443; redirect port 80 to 443.",
        "Health checks remove an unhealthy target from rotation within seconds.",
        "Security group: allow 80 and 443 from 0.0.0.0/0 and nothing else.",
      ],
    },
    {
      title: "Launch the web tier and NAT gateways",
      body: "Web servers run in an Auto Scaling group across both AZs. A NAT gateway per AZ lets private instances reach the internet for updates without being reachable from it.",
      points: [
        "Security group rule: allow 80/443 only from the ALB's security group (reference the group, not an IP range).",
        "Auto Scaling replaces failed instances and adds capacity on CPU or request count.",
        "One NAT gateway per AZ keeps outbound traffic in-zone and survives an AZ loss.",
        "Outbound-only: the NAT gateway has an Elastic IP but accepts no inbound connections.",
      ],
    },
    {
      title: "Add the application tier",
      body: "The app tier holds business logic and has no public address. Only the web tier can call it, which shrinks the attack surface.",
      points: [
        "Place in private app subnets; the route table sends internet-bound traffic to the in-AZ NAT gateway.",
        "Security group: allow the app port (for example 8080) only from the web tier's security group.",
        "Use an internal load balancer between web and app if tiers scale independently.",
        "Use IAM roles on instances instead of stored access keys.",
      ],
    },
    {
      title: "Protect the data tier",
      body: "RDS Multi-AZ keeps a synchronous standby in the other zone. If the primary or its AZ fails, AWS fails over automatically by flipping the database DNS name.",
      points: [
        "Data subnets have no route to the internet at all, not even through NAT.",
        "Security group: allow 5432 or 3306 only from the app tier's security group.",
        "Encrypt at rest with KMS and in transit with TLS; enable automated backups.",
        "Typical failover takes one to two minutes; applications must reconnect and retry.",
        "Add read replicas for read-heavy workloads; they are not the failover standby.",
      ],
    },
    {
      title: "Trace a request end to end",
      body: "Follow the numbered arrows. This is the path to memorise, and the path to debug when something is down: check each hop's route table, security group and health check in order.",
      points: [
        "1: browser asks Route 53, gets the ALB address. 2: request enters through the internet gateway.",
        "3: the ALB picks a healthy web target. 4: web calls the app tier. 5: app queries the database primary.",
        "Lose AZ a: the ALB stops sending to it, Auto Scaling refills AZ b, RDS promotes the standby.",
        "Cost to watch: NAT gateway hourly and per-GB charges, cross-AZ transfer and the idle standby.",
      ],
    },
  ],
};

const azure: Cfg = {
  region: "Region East US",
  network: { label: "Virtual network (VNet)", sub: CIDR.net },
  zones: ["Availability Zone 1", "Availability Zone 2"],
  regionalSubnets: true,
  subnets: { web: "Web subnet", app: "App subnet", data: "Data subnet" },
  dns: "Azure DNS",
  lb: "Application Gateway (v2)",
  web: "Web VMs (VMSS)",
  nat: "NAT Gateway",
  app: "App VMs (VMSS)",
  db: ["Postgres primary", "zone-redundant HA"],
  dbStandby: ["Postgres standby", "sync replica"],
  steps: [
    {
      title: "Create the virtual network",
      body: "A VNet is your private network in one Azure region. Like the other clouds you choose the address space up front.",
      points: [
        "Use 10.0.0.0/16 and avoid overlap with on-premises or other VNets you will peer.",
        "A VNet is regional and spans every availability zone in that region.",
        "Create it inside a resource group so the whole stack can be tagged, costed and deleted as one unit.",
      ],
    },
    {
      title: "Use two availability zones",
      body: "Availability zones are physically separate datacentres inside a region. Unlike AWS, you do not draw them as network boundaries: you pin individual resources to zones.",
      points: [
        "Pin or spread VMs, gateways and databases across zones 1, 2 and 3 for zone resilience.",
        "Not every region has zones; check before designing for them.",
        "Cross-zone traffic within a region is billed; keep chatty components together when you can.",
      ],
    },
    {
      title: "Create three regional subnets",
      body: "Subnets in Azure are regional: one subnet spans all zones, so you create three subnets, not six. That is a real difference from AWS.",
      points: [
        "Web, app and data subnets, each a /24 carved from the VNet.",
        "Azure reserves five addresses per subnet, as AWS does.",
        "Application Gateway v2 needs a dedicated subnet of its own; the web subnet here stands in for it to keep the diagram simple.",
        "Attach a network security group (NSG) to each subnet; there is no concept of a 'public subnet' route table.",
      ],
    },
    {
      title: "Add users and DNS",
      body: "Azure has no internet gateway object. A resource is internet-reachable when it has a public IP address and an NSG that allows the traffic.",
      points: [
        "Azure DNS hosts the zone and points www to the gateway's public IP.",
        "Outbound access: default outbound access is being retired for new VNets, so give private subnets an explicit path such as a NAT Gateway.",
        "Traffic enters the VNet at whichever resource owns the public IP, here the Application Gateway.",
      ],
    },
    {
      title: "Place the Application Gateway",
      body: "Application Gateway v2 is the layer-7 load balancer with TLS termination, URL routing and an optional Web Application Firewall. It can be zone-redundant.",
      points: [
        "Deploy it zone-redundant with autoscaling so it survives a zone loss.",
        "Public frontend IP; backend pool targets the web scale set.",
        "Turn on the WAF policy for OWASP protection.",
        "For non-HTTP traffic use Azure Load Balancer (layer 4) instead.",
      ],
    },
    {
      title: "Launch the web tier and NAT Gateway",
      body: "Web VMs run in a Virtual Machine Scale Set (VMSS) spread across zones. A NAT Gateway attached to the subnet gives them a fixed outbound address.",
      points: [
        "NSG rule: allow 80/443 only from the Application Gateway subnet.",
        "VMSS with zones 1, 2 and 3 and an autoscale rule on CPU or request rate.",
        "NAT Gateway is associated with the subnet and supplies a static outbound public IP.",
      ],
    },
    {
      title: "Add the application tier",
      body: "App VMs sit in the app subnet with private IPs only. Only the web subnet can reach them.",
      points: [
        "NSG rule: allow the app port only from the web subnet's address range or an application security group.",
        "Application security groups let you write rules by role instead of by IP.",
        "Use managed identities for the VMs, not stored credentials.",
      ],
    },
    {
      title: "Protect the data tier",
      body: "Azure Database for PostgreSQL Flexible Server with zone-redundant high availability keeps a synchronous standby in a second zone and fails over automatically.",
      points: [
        "Place it in a delegated subnet with private access; no public endpoint.",
        "NSG rule: allow 5432 only from the app subnet.",
        "Encryption at rest is on by default; enforce TLS in transit.",
        "Use a private endpoint if the database must be reached from another VNet.",
      ],
    },
    {
      title: "Trace a request end to end",
      body: "Follow the numbered arrows, then break something on purpose and find the hop that fails.",
      points: [
        "1: DNS returns the gateway's public IP. 2: Application Gateway receives and inspects the request.",
        "3: gateway forwards to a healthy web VM. 4: web calls the app tier. 5: app reads and writes the primary.",
        "Lose zone 1: the gateway routes to zone 2, the scale set refills and the database fails over to its standby.",
        "Cost to watch: Application Gateway capacity units, NAT Gateway data processing and the standby server.",
      ],
    },
  ],
};

const gcp: Cfg = {
  region: "Region us-central1",
  network: { label: "VPC network (global)", sub: "custom mode, ranges per subnet" },
  zones: ["Zone us-central1-a", "Zone us-central1-b"],
  regionalSubnets: true,
  subnets: { web: "Web subnet", app: "App subnet", data: "Data subnet" },
  dns: "Cloud DNS",
  lb: "Cloud Load Balancing",
  web: "Web VMs (MIG)",
  nat: "Cloud NAT",
  app: "App VMs (MIG)",
  db: ["Cloud SQL primary", "regional HA"],
  dbStandby: ["Cloud SQL standby", "sync replica"],
  steps: [
    {
      title: "Create the VPC network",
      body: "A Google Cloud VPC is a global resource: one network, with subnets in whichever regions you choose. You still pick address ranges per subnet.",
      points: [
        "Choose custom mode and define your own subnets; auto mode creates one in every region and its ranges can clash later.",
        "Ranges are per subnet, so there is no single VPC-wide CIDR to plan; 10.0.0.0/16 is shown for the family.",
        "The VPC lives inside a project, which is also your billing and IAM boundary.",
      ],
    },
    {
      title: "Use two zones",
      body: "A region has three or more zones. Like Azure, GCP subnets are not tied to a zone, so zones decide where individual VMs and database nodes run.",
      points: [
        "Spread managed instance groups across at least two zones.",
        "Use a regional managed instance group so Google places instances across zones for you.",
        "Cross-zone traffic is billed; keep that in mind for chatty services.",
      ],
    },
    {
      title: "Create three regional subnets",
      body: "Subnets are regional, so one subnet in us-central1 covers every zone. Three subnets, one per tier.",
      points: [
        "Web, app and data subnets, each a /24 in us-central1.",
        "Enable Private Google Access so VMs without external IPs can still call Google APIs.",
        "Firewall rules are applied at the VPC level and matched by network tag or service account, not by subnet.",
        "Ingress is denied by default; egress is allowed by default.",
      ],
    },
    {
      title: "Add users and DNS",
      body: "There is no internet gateway to configure: every VPC already has a route to the internet. A VM is reachable only if it has an external IP and a firewall rule that allows the traffic.",
      points: [
        "Cloud DNS serves the public zone; www points to the load balancer's anycast IP.",
        "Private VMs need Cloud NAT for outbound access.",
        "The external load balancer sits at Google's edge; it is drawn inside the network here only for readability.",
      ],
    },
    {
      title: "Place Cloud Load Balancing",
      body: "The global external Application Load Balancer gives you a single anycast IP that works worldwide. It terminates TLS, applies Cloud Armor and routes by URL.",
      points: [
        "One IP, reachable from every Google edge location; traffic enters Google's network close to the user.",
        "Backend service points at the web instance group; health checks control rotation.",
        "Google-managed certificates renew automatically.",
        "Attach Cloud Armor for WAF rules and DDoS protection.",
      ],
    },
    {
      title: "Launch the web tier and Cloud NAT",
      body: "Web VMs run in a regional managed instance group (MIG) with autoscaling. Cloud NAT, configured on a Cloud Router, provides outbound access for private VMs.",
      points: [
        "Firewall rule: allow 80/443 from Google's front-end and health-check ranges (130.211.0.0/22 and 35.191.0.0/16) to the web tag.",
        "Regional MIG spreads instances across zones and heals unhealthy ones automatically.",
        "Cloud NAT is a software-defined service, so there is no gateway VM to size or fail.",
      ],
    },
    {
      title: "Add the application tier",
      body: "App VMs have no external IP. Firewall rules allow only the web tier to reach them.",
      points: [
        "Firewall rule: allow the app port from the web service account or tag to the app service account or tag.",
        "Prefer service accounts over tags: they are access-controlled, tags are not.",
        "Give each tier its own service account with least privilege.",
      ],
    },
    {
      title: "Protect the data tier",
      body: "A Cloud SQL instance with high availability runs a primary and a standby in two zones, replicated synchronously, and fails over automatically.",
      points: [
        "Use a private IP via private services access; disable the public IP.",
        "Firewall rule: allow 5432 or 3306 only from the app tier.",
        "Backups and point-in-time recovery are one setting each.",
        "Failover usually completes in about a minute or two; the instance IP does not change.",
      ],
    },
    {
      title: "Trace a request end to end",
      body: "Follow the numbered arrows from the user to the database.",
      points: [
        "1: Cloud DNS returns the anycast IP. 2: the request lands on the nearest Google edge and the load balancer.",
        "3: it picks a healthy web VM. 4: web calls the app tier. 5: app reads and writes the Cloud SQL primary.",
        "Lose a zone: the load balancer shifts traffic, the regional MIG recreates VMs and Cloud SQL promotes the standby.",
        "Cost to watch: load balancer forwarding rules, Cloud NAT egress and the standby's compute.",
      ],
    },
  ],
};

const oci: Cfg = {
  region: "Region us-ashburn-1",
  network: { label: "Virtual cloud network (VCN)", sub: CIDR.net },
  zones: ["Availability Domain 1", "Availability Domain 2"],
  regionalSubnets: true,
  subnets: { web: "Public subnet (web)", app: "Private subnet (app)", data: "Private subnet (data)" },
  igw: { label: "Internet gateway" },
  dns: "OCI DNS",
  lb: "Load Balancer",
  web: "Web VMs (pool)",
  nat: "NAT gateway",
  app: "App VMs (pool)",
  db: ["DB System primary", "Data Guard"],
  dbStandby: ["DB System standby", "sync replica"],
  steps: [
    {
      title: "Create the VCN",
      body: "A Virtual Cloud Network is your private network in an OCI region. You place it in a compartment, Oracle's way of grouping and permissioning resources.",
      points: [
        "Use 10.0.0.0/16 and avoid overlap with on-premises ranges you will reach over FastConnect or VPN.",
        "A VCN is regional; subnets inside it can be regional or tied to one availability domain.",
        "Compartments carry IAM policies, so create one for this application first.",
      ],
    },
    {
      title: "Use two availability domains",
      body: "Some OCI regions have three availability domains; others have one. A single-AD region gives you fault domains (three isolated groups of hardware) for the same purpose.",
      points: [
        "Spread compute across ADs where available, otherwise across fault domains.",
        "Check how many ADs your region has before designing for them.",
        "Check the current pricing page for cross-AD data charges before you size a chatty design.",
      ],
    },
    {
      title: "Create regional subnets",
      body: "Oracle recommends regional subnets: one subnet spans every AD, so you need three, not six. Each subnet is public or private, chosen when you create it.",
      points: [
        "Public subnet for the load balancer and web tier; private subnets for app and data.",
        "Each subnet uses a route table and a security list (or network security groups) you attach.",
        "A private subnet blocks public IPs on its resources outright.",
        "Prefer network security groups (NSGs) to security lists so rules follow resources, not subnets.",
      ],
    },
    {
      title: "Add users, DNS and the internet gateway",
      body: "The internet gateway gives a public subnet's resources two-way internet access, once the route table points to it.",
      points: [
        "OCI DNS hosts the public zone and points www to the load balancer.",
        "Route table rule: 0.0.0.0/0 → internet gateway for the public subnet only.",
        "The gateway is a managed, redundant virtual device.",
      ],
    },
    {
      title: "Place the Load Balancer",
      body: "The OCI Load Balancer is a layer-7 service with flexible bandwidth (you set a minimum and maximum Mbps). It runs as a primary and standby pair that fail over for you.",
      points: [
        "Create it in a public regional subnet and attach a certificate for HTTPS.",
        "Backend set points at the web pool; health checks decide rotation.",
        "Use the Network Load Balancer instead for TCP/UDP and preserving the client IP.",
      ],
    },
    {
      title: "Launch the web tier and NAT gateway",
      body: "Web VMs run in an instance pool spread across ADs or fault domains. A NAT gateway lets private subnets reach out without being reachable.",
      points: [
        "Security rule: allow 80/443 only from the load balancer's NSG or subnet.",
        "Instance pools use an instance configuration; autoscaling adds or removes members on metrics.",
        "Private subnets get a route 0.0.0.0/0 → NAT gateway for patches and API calls.",
      ],
    },
    {
      title: "Add the application tier",
      body: "App VMs live in a private subnet with no public IP. Only the web tier can reach them.",
      points: [
        "Security rule: allow the app port only from the web tier's NSG.",
        "Use instance principals so the VMs call OCI services without stored keys.",
        "Reach OCI services such as Object Storage through a service gateway, not over the internet.",
      ],
    },
    {
      title: "Protect the data tier",
      body: "A Base Database System with Oracle Data Guard keeps a standby in another AD, synchronised with the primary, and can fail over automatically with Fast-Start Failover.",
      points: [
        "Private subnet, no public IP; security rule allows 1521 only from the app tier.",
        "Transparent Data Encryption is enabled by default.",
        "Autonomous Database is the managed alternative that handles patching and HA for you.",
      ],
    },
    {
      title: "Trace a request end to end",
      body: "Follow the numbered arrows from the user to the database.",
      points: [
        "1: OCI DNS returns the load balancer address. 2: traffic enters through the internet gateway.",
        "3: the load balancer picks a healthy web VM. 4: web calls the app tier. 5: app reads and writes the primary database.",
        "Lose an AD: the pool continues in the other, the load balancer re-routes and Data Guard promotes the standby.",
        "Cost to watch: load balancer bandwidth, outbound data beyond the free allowance and the standby database.",
      ],
    },
  ],
};

export const threeTierSpecs: ArchSpecs = {
  aws: build("aws", aws),
  azure: build("azure", azure),
  gcp: build("gcp", gcp),
  oci: build("oci", oci),
};
