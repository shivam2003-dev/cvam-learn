import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Hard",
  objectives: [
    "Design hybrid connectivity that survives link, device, location and provider failures",
    "Combine Direct Connect with Site-to-Site VPN as a backup and understand failover behaviour",
    "Explain Transit Gateway Connect, GRE tunnels and BGP for SD-WAN integration",
    "Use overlay networks and encapsulation (GRE, IPsec) appropriately",
  ],
  tasks: [
    {
      id: "pattern",
      title: "Resilient hybrid patterns",
      body: (
        <>
          <Table
            head={["Pattern", "Design", "Trade-off"]}
            rows={[
              ["DX + DX (maximum resiliency)", "Two locations, two devices each", "Highest cost and availability"],
              ["DX + VPN backup", "Primary Direct Connect; VPN over the internet to the same VGW/TGW", "Cheap; VPN has lower bandwidth and variable latency, so plan for degraded throughput on failover"],
              ["DX + DX + VPN", "Two Direct Connects plus a VPN as a third path", "Survives a provider or both-location outage"],
              ["VPN + VPN", "Two connections to different customer routers and ISPs", "No physical link to order; best for small sites"],
              ["Dual-Region", "Hybrid link into each of two Regions via Direct Connect gateway and TGW peering", "Regional failure tolerance; more routing to manage"],
            ]}
          />
          <Figure caption="Direct Connect primary with VPN backup into a Transit Gateway. The DXGW route is preferred; if it drops, the VPN route takes over automatically through BGP.">
            <Graph
              label="Direct Connect primary and Site-to-Site VPN backup both attached to a Transit Gateway"
              cellW={200}
              cellH={100}
              nodeW={170}
              nodes={[
                { id: "onp", label: "On-premises routers", sub: "BGP", col: 0, row: 0.5, tone: "sky" },
                { id: "dx", label: "Direct Connect (transit VIF)", sub: "preferred", col: 1, row: 0, tone: "lime" },
                { id: "vpn", label: "Site-to-Site VPN", sub: "backup", col: 1, row: 1, tone: "amber" },
                { id: "tgw", label: "Transit Gateway", col: 2, row: 0.5, tone: "lime" },
              ]}
              edges={[
                { from: "onp", to: "dx" },
                { from: "onp", to: "vpn", dashed: true },
                { from: "dx", to: "tgw" },
                { from: "vpn", to: "tgw", dashed: true },
              ]}
            />
          </Figure>
          <Callout tone="warn" title="Do not forget the return path">
            Failover must work in both directions. AWS prefers Direct Connect over VPN for the same
            prefix, but your router also needs to prefer the Direct Connect path for traffic it sends,
            or you create asymmetric flows that stateful firewalls drop. Test failover regularly by
            shutting the primary.
          </Callout>
        </>
      ),
    },
    {
      id: "connect",
      title: "Transit Gateway Connect and SD-WAN",
      body: (
        <>
          <p>
            Many enterprises run an <strong>SD-WAN</strong> overlay and place virtual SD-WAN
            appliances in a VPC. <strong>Transit Gateway Connect</strong> is a special attachment type
            that uses an existing VPC or Direct Connect attachment as <em>transport</em> and runs{" "}
            <strong>GRE tunnels with BGP</strong> between the Transit Gateway and the appliance.
          </p>
          <ul>
            <li>Each Connect attachment supports up to <strong>four Connect peers</strong> (GRE tunnels), each up to about 5 Gbps, for up to 20 Gbps per attachment, far above a single IPsec tunnel.</li>
            <li>The Connect peer is defined by the appliance&apos;s GRE outer IP, the TGW GRE address, and a BGP inside CIDR from <code>169.254.6.0/23</code>.</li>
            <li>BGP over the tunnel exchanges SD-WAN prefixes dynamically; the TGW ASN and appliance ASN must differ (eBGP).</li>
            <li>Advertised routes can be propagated into TGW route tables for segmentation; multiple appliances in different AZs provide redundancy.</li>
            <li>Network Manager integrates with SD-WAN vendors for visibility of sites and links.</li>
          </ul>
          <Figure caption="SD-WAN with Transit Gateway Connect. GRE+BGP rides on a VPC attachment as transport; branch sites reach VPCs through the overlay.">
            <Graph
              label="SD-WAN appliance in a VPC connected to Transit Gateway through a Connect attachment using GRE and BGP"
              cellW={200}
              cellH={100}
              nodeW={170}
              nodes={[
                { id: "br", label: "Branch SD-WAN edges", col: 0, row: 0.5, tone: "sky" },
                { id: "app", label: "SD-WAN appliance", sub: "in transport VPC", col: 1, row: 0.5, tone: "amber" },
                { id: "tgw", label: "Transit Gateway", sub: "Connect attachment", col: 2, row: 0.5, tone: "lime" },
                { id: "vpcs", label: "Workload VPCs", col: 3, row: 0.5, tone: "plain" },
              ]}
              edges={[
                { from: "br", to: "app", label: "overlay", dashed: true },
                { from: "app", to: "tgw", label: "GRE + BGP" },
                { from: "tgw", to: "vpcs" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "overlay",
      title: "Encapsulation and overlay concepts",
      body: (
        <>
          <Table
            head={["Technology", "What it is", "Use on AWS"]}
            rows={[
              ["IPsec", "Encrypts and authenticates IP packets (ESP) with IKE key exchange", "Site-to-Site VPN, VPN over DX"],
              ["GRE", "Simple tunnel that encapsulates any protocol; no encryption", "Transit Gateway Connect"],
              ["VXLAN", "Layer 2 over UDP 4789 overlay", "Traffic Mirroring"],
              ["GENEVE", "Extensible tunnel with metadata on UDP 6081", "Gateway Load Balancer"],
              ["VLAN 802.1Q", "Layer 2 segmentation", "Direct Connect VIFs"],
            ]}
          />
          <Exercise
            title="Design for failure"
            task={<p>A retailer has one Direct Connect connection to us-east-1 and a ten-hour outage cut it. They want automatic failover at lower cost than another 10 Gbps link, accepting reduced capacity. What now?</p>}
          >
            <p>
              Add an <strong>IPsec Site-to-Site VPN</strong> from a different on-premises router to
              the same Transit Gateway (BGP), possibly using accelerated VPN for better performance.
              The Direct Connect routes win by default, and the VPN carries traffic if the link fails.
              Use ECMP across several VPN connections to raise backup bandwidth, and set matching
              preferences on the router for symmetry. Review whether critical flows need QoS during
              reduced capacity.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Layer redundancy: separate devices, locations and providers, with VPN as a cost-effective backup.",
    "BGP makes failover automatic; keep symmetric preferences on both sides.",
    "Transit Gateway Connect uses GRE with BGP over VPC or Direct Connect transport, with up to four peers and about 5 Gbps each.",
    "GRE does not encrypt, IPsec does; VXLAN and GENEVE appear in mirroring and GWLB.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which attachment type integrates SD-WAN appliances with Transit Gateway using GRE and BGP?",
      options: ["Transit Gateway Connect", "VPC peering", "Client VPN", "PrivateLink"],
      answer: 0,
      explain: "Connect attachments run GRE tunnels with BGP over a VPC or Direct Connect transport attachment.",
    },
    {
      kind: "mcq",
      q: "What is the most cost-effective backup for a Direct Connect link?",
      options: ["Site-to-Site VPN to the same gateway", "A second Region", "Client VPN", "NAT gateway"],
      answer: 0,
      explain: "A VPN over the internet provides a lower-cost backup path.",
    },
    {
      kind: "mcq",
      q: "How many Connect peers does a Transit Gateway Connect attachment support?",
      options: ["Four", "One", "Ten", "Unlimited"],
      answer: 0,
      explain: "Each Connect attachment supports up to four Connect peers (GRE tunnels).",
    },
    {
      kind: "mcq",
      q: "Which encapsulation is NOT encrypted?",
      options: ["GRE", "IPsec ESP", "MACsec", "TLS"],
      answer: 0,
      explain: "GRE provides tunneling only; pair it with IPsec if encryption is needed.",
    },
    {
      kind: "text",
      q: "Which UDP port does VXLAN use in VPC Traffic Mirroring?",
      format: "****",
      accept: ["4789"],
      explain: "Mirrored packets are encapsulated in VXLAN on UDP port 4789.",
    },
  ],
};
