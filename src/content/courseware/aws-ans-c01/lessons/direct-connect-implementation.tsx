import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Create and compare private, public and transit virtual interfaces",
    "Use a Direct Connect gateway to reach VPCs and Transit Gateways in multiple Regions",
    "Configure link aggregation groups (LAG), MACsec and jumbo frames",
    "Apply BGP session settings: ASN, MD5 authentication, advertised prefixes and limits",
    "Validate a new connection and troubleshoot BGP state",
  ],
  tasks: [
    {
      id: "vif",
      title: "Virtual interfaces",
      body: (
        <>
          <p>
            A physical connection carries one or more <strong>virtual interfaces (VIFs)</strong>.
            Each VIF is an 802.1Q VLAN with its own BGP session. The VIF type decides what you can
            reach.
          </p>
          <Table
            head={["VIF type", "Reaches", "Terminates on", "Notes"]}
            rows={[
              ["Private", "VPC private IPs", "Virtual private gateway (one VPC) or Direct Connect gateway (many VPCs)", "MTU 1500 or 9001; up to 100 prefixes from you per VIF"],
              ["Transit", "VPCs through Transit Gateway", "Direct Connect gateway associated with Transit Gateways", "MTU 1500 or 8500; only one transit VIF per dedicated connection and at most one per hosted connection"],
              ["Public", "AWS public endpoints (S3, DynamoDB, public IPs of AWS services) using public IPs", "AWS public address space, not a VPC", "Receives all AWS public prefixes; you advertise your own public prefixes; MTU 1500"],
            ]}
          />
          <CloudDiagram course="aws-ans-c01" id="direct-connect-implementation-diagram-1" />
          <Callout tone="warn" title="Public VIF is not a private path to your VPC">
            A public VIF reaches AWS public IP space only. To reach VPC resources, use a private or
            transit VIF. To reach S3 privately from on-premises you can also use an S3 interface
            endpoint over a private VIF.
          </Callout>
        </>
      ),
    },
    {
      id: "dxgw",
      title: "Direct Connect gateway",
      body: (
        <>
          <p>
            A <strong>Direct Connect gateway (DXGW)</strong> is a global, highly available construct.
            Attach a private VIF or transit VIF to it and associate it with{" "}
            <strong>virtual private gateways</strong> or <strong>Transit Gateways</strong> in any
            Region (except China) and in other accounts. One physical connection in one location can
            then reach VPCs in many Regions.
          </p>
          <ul>
            <li>Private VIF → DXGW → up to 20 virtual private gateways (VPCs).</li>
            <li>Transit VIF → DXGW → up to 3 Transit Gateways, using an <em>allowed prefixes</em> list on each association (up to 200 prefixes are advertised toward on-premises).</li>
            <li>A DXGW does <strong>not</strong> route between VPCs and does not route between DX locations; traffic only flows between on-premises and associated gateways.</li>
            <li>Transit Gateway associations let on-premises reach many VPCs while keeping VPC-to-VPC routing inside the TGW.</li>
          </ul>
          <CloudDiagram course="aws-ans-c01" id="direct-connect-implementation-diagram-2" />
        </>
      ),
    },
    {
      id: "l2",
      title: "BGP, LAG, MACsec and jumbo frames",
      body: (
        <>
          <ul>
            <li><strong>BGP parameters:</strong> your ASN (public or private 64512 to 65534 / 4200000000 to 4294967294), optional MD5 authentication key, customer and Amazon peer IPs (AWS can auto-generate /30 link-local addresses), and for a DXGW the Amazon-side ASN (choose it at creation; it cannot be changed).</li>
            <li><strong>Prefix limits:</strong> a private or transit VIF accepts about 100 prefixes from you; exceed it and the BGP session goes down. Summarize or use a default route.</li>
            <li><strong>LAG:</strong> bundle up to four connections of the same speed at the same location and device pair with LACP into one logical connection; configure a minimum number of links that must be up. A LAG scales bandwidth but does not give location resiliency.</li>
            <li><strong>MACsec (802.1AE):</strong> layer 2 encryption on dedicated 10, 100 and 400 Gbps connections between your device and the AWS router, using a CKN/CAK pair stored in Secrets Manager. It protects the hop to the DX location, not the full path.</li>
            <li><strong>Jumbo frames:</strong> up to 9001 bytes on private VIFs and 8500 on transit VIFs, provided the whole path supports it. Public VIFs stay at 1500.</li>
          </ul>
          <Exercise
            title="Which VIF?"
            task={<p>A company has 30 VPCs across three Regions in one organization and wants one connection from its data center to reach all of them with room to grow, plus VPC-to-VPC routing. Which VIF and gateways?</p>}
          >
            <p>
              A <strong>transit VIF</strong> to a <strong>Direct Connect gateway</strong> associated
              with a <strong>Transit Gateway</strong> in each Region (up to three per DXGW), with TGW
              peering between Regions. A private VIF to a DXGW and virtual private gateways would cap
              at 20 VPCs and gives no VPC-to-VPC routing.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "validate",
      title: "Provisioning and validation checklist",
      body: (
        <>
          <ol>
            <li>Order the connection; receive the LOA-CFA; your provider builds the cross connect.</li>
            <li>Confirm the physical state in the console (<em>up</em>) and CloudWatch <code>ConnectionState</code>; check light levels (<code>ConnectionLightLevelTx/Rx</code>) and errors (<code>ConnectionCRCErrorCount</code>).</li>
            <li>Create the VIF with VLAN, ASN, peer IPs and MD5 key; download the router configuration example from the console.</li>
            <li>Bring up BGP: both sides <code>Established</code>; verify received and advertised prefixes.</li>
            <li>Test with ping from an on-premises host to a VPC instance; use Reachability Analyzer and VPC route tables to confirm routes; ensure security groups and NACLs allow the traffic.</li>
            <li>Enable BFD and monitoring alarms; test failover by shutting a link.</li>
          </ol>
          <Callout tone="tip" title="Route propagation reminder">
            Private VIF routes appear in a VPC only if the VGW has route propagation enabled on that
            VPC route table; with Transit Gateway, the DXGW attachment must be associated and
            propagated in the TGW route tables.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Private VIFs reach VPCs, transit VIFs reach Transit Gateways, public VIFs reach AWS public endpoints only.",
    "A Direct Connect gateway is global and connects one VIF to many VGWs (up to 20) or Transit Gateways (up to 3) but never routes between them.",
    "LAG aggregates bandwidth at one location; MACsec encrypts layer 2; jumbo is 9001 on private VIFs and 8500 on transit VIFs.",
    "Mind the 100-prefix limit on BGP sessions and validate with state, light-level metrics and Reachability Analyzer.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which VIF type connects a data center to many VPCs through a Transit Gateway?",
      options: ["Transit VIF", "Private VIF to a VGW", "Public VIF", "Hosted VIF only"],
      answer: 0,
      explain: "Transit VIFs attach to a Direct Connect gateway that is associated with Transit Gateways.",
    },
    {
      kind: "mcq",
      q: "How many Transit Gateways can be associated with one Direct Connect gateway?",
      options: ["Up to 3", "Up to 20", "Exactly 1", "Unlimited"],
      answer: 0,
      explain: "A DXGW can associate with up to three Transit Gateways and up to 20 virtual private gateways.",
    },
    {
      kind: "mcq",
      q: "A private VIF BGP session drops after you add more routes. What is the likely cause?",
      options: ["Exceeded the 100-prefix limit", "Wrong MTU", "Expired certificate", "Route 53 outage"],
      answer: 0,
      explain: "AWS tears down a BGP session if the customer advertises more prefixes than the limit.",
    },
    {
      kind: "mcq",
      q: "Which feature provides layer 2 encryption on a dedicated connection?",
      options: ["MACsec", "IPsec on the VGW only", "TLS on the ALB", "Security groups"],
      answer: 0,
      explain: "MACsec (802.1AE) encrypts between your device and the AWS Direct Connect router.",
    },
    {
      kind: "text",
      q: "What is the maximum MTU supported on a transit VIF?",
      format: "****",
      accept: ["8500", "8500 bytes"],
      explain: "Transit VIFs support 8500; private VIFs support 9001.",
    },
  ],
};
