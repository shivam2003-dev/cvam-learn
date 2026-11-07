import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Compare Cloud VPN (HA VPN), Dedicated Interconnect, Partner Interconnect and Cross-Cloud Interconnect",
    "Use Cloud Router and BGP for dynamic routing and redundancy",
    "Design topologies that reach availability SLAs",
    "Connect to other clouds and combine with Network Connectivity Center",
    "Secure hybrid links with encryption",
  ],
  tasks: [
    {
      id: "options",
      title: "The connectivity options",
      body: (
        <>
          <Table
            head={["Option", "Bandwidth", "Path", "Choose when"]}
            rows={[
              ["HA VPN", "Up to about 3 Gbps per tunnel; scale with more tunnels", "IPsec over the internet; 99.99% SLA with the recommended topology", "Quick start, lower cost, backup or modest bandwidth"],
              ["Dedicated Interconnect", "10 or 100 Gbps circuits (multiples)", "Direct physical link in a colocation facility", "High, steady bandwidth, low latency, you can colocate"],
              ["Partner Interconnect", "50 Mbps to 50 Gbps via a service provider", "Layer 2 or layer 3 through a partner", "No presence in a Google colo, smaller bandwidth"],
              ["Cross-Cloud Interconnect", "10 or 100 Gbps", "Direct link from Google to AWS, Azure, Oracle, others", "Multicloud with private high-speed link"],
              ["Direct/Carrier Peering", "Varies", "Reach Google public services over a peering link", "Public Google services (Workspace, YouTube); not for VPC access"],
            ]}
          />
          <p>
            All dynamic hybrid options use a <strong>Cloud Router</strong>, a regional managed BGP
            speaker that exchanges routes with your router and programs them into the VPC.
          </p>
        </>
      ),
    },
    {
      id: "sla",
      title: "Redundancy and SLAs",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="hybrid-multicloud-connectivity-diagram-1" />
          <ul>
            <li><strong>Interconnect 99.99%:</strong> at least four connections across two metropolitan areas, two per metro in different edge availability domains. <strong>99.9%:</strong> two connections in one metro in different domains.</li>
            <li><strong>HA VPN 99.99%:</strong> two interfaces and at least two tunnels to a peer gateway (or one tunnel per peer interface on a redundant peer), with BGP. Use more tunnels or Interconnect for throughput.</li>
            <li>Enable <strong>global dynamic routing</strong> on the VPC so routes learned in one region are usable in all regions; use MED/AS-path to prefer one path.</li>
            <li><strong>VPN as backup</strong> for Interconnect with lower route priority is a common cost-aware design.</li>
            <li><strong>MACsec</strong> for Interconnect and <strong>HA VPN over Interconnect</strong> (IPsec tunnels across an Interconnect) provide encryption in transit.</li>
          </ul>
        </>
      ),
    },
    {
      id: "nccdns",
      title: "Network Connectivity Center and DNS",
      body: (
        <>
          <ul>
            <li><strong>Network Connectivity Center (NCC)</strong> provides hub-and-spoke routing among VPC spokes and hybrid spokes (VPN, Interconnect, router appliances) and can use Google&apos;s backbone to connect on-premises sites to each other.</li>
            <li><strong>Hybrid DNS:</strong> Cloud DNS forwarding zones send queries for on-premises domains to on-premises servers; an <em>inbound server policy</em> exposes an IP in the VPC that on-premises resolvers can query for Google Cloud private zones; DNS peering shares zones between VPCs.</li>
            <li><strong>Private access for on-premises hosts to Google APIs:</strong> use <code>private.googleapis.com</code> or <code>restricted.googleapis.com</code> VIPs (restricted works with VPC Service Controls) or PSC endpoints for Google APIs, advertised through Cloud Router.</li>
          </ul>
          <Callout tone="note" title="Latency and throughput trade">
            Interconnect provides lower, more consistent latency and higher throughput than VPN, and
            egress over Interconnect is priced lower per GB than internet egress. VPN is faster to
            provision.
          </Callout>
          <Exercise
            title="Choose the link"
            task={<p>A manufacturer needs 8 Gbps steady throughput to Google Cloud from two plants, has no presence in a Google colocation facility, and needs 99.9% availability. What do you choose?</p>}
          >
            <p>
              <strong>Partner Interconnect</strong>, because the plants are not in a Google colo, with
              redundant VLAN attachments (two partner connections in different edge availability
              domains of one metro) for 99.9% (four across two metros for 99.99%). Add HA VPN as backup
              if budget allows. Dedicated Interconnect would require colocating equipment; HA VPN alone
              is limited in bandwidth per tunnel.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "HA VPN is quick and cheap (99.99% with proper topology); Dedicated Interconnect for high steady bandwidth in a colo; Partner Interconnect via providers; Cross-Cloud Interconnect to other clouds.",
    "Cloud Router with BGP provides dynamic routing; use global dynamic routing for multi-region VPCs.",
    "99.99% Interconnect needs four connections across two metros; 99.9% needs two in one metro.",
    "NCC connects spokes; Cloud DNS forwarding and inbound policies make hybrid name resolution work.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A site is not in a Google colocation facility and needs 5 Gbps. Which option?",
      options: ["Partner Interconnect", "Dedicated Interconnect", "Direct Peering", "Cloud NAT"],
      answer: 0,
      explain: "Partner Interconnect uses a service provider to reach Google without colocating.",
    },
    {
      kind: "mcq",
      q: "Which topology achieves the 99.99% SLA for Dedicated Interconnect?",
      options: ["Four connections across two metros, two per metro", "One connection", "Two connections in one metro", "Two VPN tunnels"],
      answer: 0,
      explain: "99.99% requires redundancy across two metropolitan areas and edge availability domains.",
    },
    {
      kind: "mcq",
      q: "Which service exchanges BGP routes with your on-premises router?",
      options: ["Cloud Router", "Cloud NAT", "Cloud CDN", "Cloud Armor"],
      answer: 0,
      explain: "Cloud Router is the managed BGP speaker.",
    },
    {
      kind: "mcq",
      q: "A private link to AWS with 10 Gbps is needed. Which product?",
      options: ["Cross-Cloud Interconnect", "Cloud VPN only", "Direct Peering", "Shared VPC"],
      answer: 0,
      explain: "Cross-Cloud Interconnect provides direct private connectivity to other clouds.",
    },
    {
      kind: "text",
      q: "Which Cloud DNS feature sends queries for on-premises domains to on-premises DNS servers?",
      format: "********** ****",
      accept: ["forwarding zone", "forwarding zones", "dns forwarding"],
      explain: "Forwarding zones forward queries for specified domains to target name servers.",
    },
  ],
};
