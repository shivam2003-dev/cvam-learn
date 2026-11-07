import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Describe Site-to-Site VPN components: virtual private gateway or Transit Gateway, customer gateway, two tunnels",
    "Choose static or dynamic (BGP) routing and understand ECMP bandwidth scaling",
    "Use accelerated VPN, private IP VPN over Direct Connect, and certificate authentication",
    "Configure AWS Client VPN for remote users with split tunnel and authorization rules",
  ],
  tasks: [
    {
      id: "s2s",
      title: "Site-to-Site VPN anatomy",
      body: (
        <>
          <p>
            An AWS Site-to-Site VPN connection builds <strong>two IPsec tunnels</strong> between an
            AWS-side gateway and your <strong>customer gateway device</strong>. The AWS endpoints sit
            in <em>different Availability Zones</em> for resilience. You model your device as a{" "}
            <strong>customer gateway</strong> resource (its public IP and BGP ASN) and terminate the
            VPN on a <strong>virtual private gateway (VGW)</strong> attached to one VPC or on a{" "}
            <strong>Transit Gateway</strong> for many VPCs.
          </p>
          <Figure caption="Two tunnels per connection. Configure both on the customer device; one active and one standby, or both active with ECMP on a Transit Gateway.">
            <Graph
              label="Site-to-Site VPN with two IPsec tunnels from a customer gateway device to AWS endpoints in two Availability Zones"
              cellW={200}
              cellH={100}
              nodeW={170}
              nodes={[
                { id: "cgw", label: "Customer gateway device", sub: "public IP, ASN", col: 0, row: 0.5, tone: "sky" },
                { id: "t1", label: "Tunnel 1", sub: "AWS endpoint AZ-a", col: 1, row: 0, tone: "amber", shape: "pill" },
                { id: "t2", label: "Tunnel 2", sub: "AWS endpoint AZ-b", col: 1, row: 1, tone: "amber", shape: "pill" },
                { id: "gw", label: "VGW or Transit Gateway", col: 2, row: 0.5, tone: "lime" },
              ]}
              edges={[
                { from: "cgw", to: "t1" },
                { from: "cgw", to: "t2" },
                { from: "t1", to: "gw" },
                { from: "t2", to: "gw" },
              ]}
            />
          </Figure>
          <Table
            head={["Topic", "Detail"]}
            rows={[
              ["Throughput", "About 1.25 Gbps per tunnel; a larger-bandwidth tunnel option exists on Transit Gateway for higher per-tunnel speed"],
              ["Scaling beyond one tunnel", "ECMP across multiple tunnels and VPN connections works on Transit Gateway only, not on a VGW"],
              ["Routing", "Static (you list prefixes) or dynamic BGP (AWS side ASN configurable on VGW/TGW); BGP is preferred for automatic failover"],
              ["IKE and encryption", "IKEv1 and IKEv2, AES-128/256, SHA-1/2, DH groups; NAT traversal on UDP 4500; per-tunnel options configurable, including pre-shared key or certificate from ACM Private CA"],
              ["Authentication", "Pre-shared key or private certificates"],
              ["MTU", "1500 on the tunnel; clamp MSS (for example 1379) to avoid fragmentation"],
              ["Dead peer detection", "Tunnel endpoint replacement and DPD timeouts configurable; AWS may rotate endpoints for maintenance, so both tunnels must be configured"],
            ]}
          />
          <Callout tone="warn" title="Both tunnels, always">
            An AWS-side endpoint replacement can take a tunnel down for a short time. If only one
            tunnel is configured on your device, you lose connectivity. Configure both tunnels, and
            on a VGW prefer the one with the better BGP attributes using AS_PATH prepending or MED.
          </Callout>
        </>
      ),
    },
    {
      id: "variants",
      title: "Accelerated and private IP VPN",
      body: (
        <>
          <ul>
            <li><strong>Accelerated Site-to-Site VPN</strong> sends tunnel traffic to the nearest AWS edge location via <strong>Global Accelerator</strong> and then over the AWS backbone. Each connection uses two accelerators with static IPs. It improves performance over a poor internet path and is only available when terminating on a <strong>Transit Gateway</strong> (not a VGW).</li>
            <li><strong>Private IP VPN</strong> builds IPsec tunnels using <em>private</em> IP addresses on both ends and runs over a Direct Connect <strong>transit VIF</strong>, giving encryption on a private path without public IPs. It requires Transit Gateway and a Direct Connect gateway.</li>
            <li><strong>VPN over a public VIF</strong> encrypts traffic across Direct Connect using the public IPs; this is the classic way to add IPsec to Direct Connect.</li>
          </ul>
          <Table
            head={["Option", "Underlay", "Terminates on", "Encrypts"]}
            rows={[
              ["Standard VPN", "Internet", "VGW or TGW", "Yes"],
              ["Accelerated VPN", "Edge location + AWS backbone", "TGW only", "Yes"],
              ["Private IP VPN", "Direct Connect transit VIF", "TGW only", "Yes"],
              ["IPsec over public VIF", "Direct Connect public VIF", "VGW or TGW", "Yes"],
            ]}
          />
        </>
      ),
    },
    {
      id: "client",
      title: "AWS Client VPN",
      body: (
        <>
          <p>
            <strong>Client VPN</strong> is a managed OpenVPN-based service for individual users
            (laptops). You create a Client VPN <em>endpoint</em>, associate it with one or more
            subnets (each association adds an ENI and route), and define <strong>authorization
            rules</strong> that say which CIDRs each user group may reach.
          </p>
          <ul>
            <li><strong>Authentication:</strong> mutual certificates, Active Directory (AWS Managed Microsoft AD or AD Connector), or SAML 2.0 federation (with IAM Identity Center, Okta, etc.). Several can be combined; add MFA through the directory or IdP.</li>
            <li><strong>Client CIDR:</strong> an address pool between /22 and /12 that must not overlap the VPC or routes; user traffic is source NATed to the subnet ENI address.</li>
            <li><strong>Split tunnel</strong> sends only routes for the VPC through the VPN and internet traffic goes direct; full tunnel routes everything via AWS (useful for central inspection, at higher cost).</li>
            <li>Associate at least two subnets in different AZs for availability, and enable connection logging to CloudWatch Logs.</li>
            <li>To reach peered VPCs, on-premises or other VPCs you must add routes to the endpoint route table <em>and</em> authorization rules.</li>
          </ul>
          <Exercise
            title="Remote access design"
            task={<p>Contractors with AD accounts need access to two subnets in one VPC and must not access production databases. Internet traffic should not traverse AWS. What do you configure?</p>}
          >
            <p>
              Create a Client VPN endpoint with Active Directory (or SAML) authentication,
              associate it with subnets in two AZs, add authorization rules mapping the contractor AD
              group to only the two allowed subnet CIDRs (none for the database subnet), enable{" "}
              <strong>split tunnel</strong>, and send connection logs to CloudWatch Logs. Also restrict
              the database security groups to application sources only.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A Site-to-Site VPN connection has two tunnels in different AZs; configure both and prefer BGP for dynamic failover.",
    "ECMP across tunnels and connections needs a Transit Gateway; a VGW does not support ECMP.",
    "Accelerated VPN uses Global Accelerator and requires Transit Gateway; Private IP VPN runs over a Direct Connect transit VIF.",
    "Client VPN offers certificate, AD and SAML authentication, authorization rules per CIDR, split tunnel and logging.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A company needs more than 1.25 Gbps over VPN to AWS using multiple tunnels in parallel. What do they need?",
      options: ["Transit Gateway with ECMP", "A virtual private gateway", "VPC peering", "A NAT gateway"],
      answer: 0,
      explain: "Only Transit Gateway supports ECMP across VPN tunnels for aggregate bandwidth.",
    },
    {
      kind: "mcq",
      q: "Which option encrypts traffic over Direct Connect without using public IP addresses?",
      options: ["Private IP VPN on a transit VIF", "Standard VPN over the internet", "Accelerated VPN", "Public VIF only"],
      answer: 0,
      explain: "Private IP VPN builds IPsec tunnels with private IPs over a Direct Connect transit VIF to a Transit Gateway.",
    },
    {
      kind: "mcq",
      q: "Where must an accelerated Site-to-Site VPN terminate?",
      options: ["Transit Gateway", "Virtual private gateway", "Internet gateway", "Direct Connect gateway"],
      answer: 0,
      explain: "Acceleration is supported only on Transit Gateway VPN attachments.",
    },
    {
      kind: "mcq",
      q: "Which Client VPN setting restricts which networks a user group can access?",
      options: ["Authorization rules", "Security group of the client", "Route 53 policy", "Client CIDR size"],
      answer: 0,
      explain: "Authorization rules map user groups to destination CIDRs.",
    },
    {
      kind: "text",
      q: "How many IPsec tunnels does each Site-to-Site VPN connection provide?",
      format: "*",
      accept: ["2", "two"],
      explain: "Every connection has two tunnels terminating in different Availability Zones.",
    },
  ],
};
