import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Apply a layered troubleshooting method from physical to application",
    "Diagnose MTU, MSS and fragmentation problems and restore connectivity",
    "Recognize asymmetric routing, security group and NACL faults, DNS faults and BGP issues from symptoms",
    "Pick the right tool for each symptom",
  ],
  tasks: [
    {
      id: "method",
      title: "A repeatable method",
      body: (
        <>
          <Figure caption="Work from the bottom up or divide in half. Each step uses a specific tool, so you eliminate layers rather than guess.">
            <Flow
              numbered
              steps={[
                { title: "Define the flow", note: "Source, destination, port, protocol, direction", tone: "sky" },
                { title: "Name resolution", note: "dig/nslookup, Resolver logs", tone: "lime" },
                { title: "Route", note: "Route tables, TGW, Reachability Analyzer", tone: "lime" },
                { title: "Filters", note: "SG, NACL, firewall, flow logs REJECT", tone: "amber" },
                { title: "Path quality", note: "MTU, loss, latency, asymmetry", tone: "amber" },
                { title: "Application", note: "Listener, TLS, health, mirror", tone: "rose" },
              ]}
            />
          </Figure>
          <Table
            head={["Symptom", "Likely cause", "First tool"]}
            rows={[
              ["Name does not resolve", "Missing PHZ association, forwarding rule, DNS attribute off, DNSSEC failure", "dig, Resolver query logs"],
              ["Timeout, no REJECT in logs", "Missing route, blackhole, asymmetric path, host firewall", "Reachability Analyzer, route tables"],
              ["Timeout with REJECT", "Security group or NACL", "Flow Logs"],
              ["Small works, large fails", "MTU / MSS mismatch, blocked ICMP type 3 code 4", "ping with DF bit, tcpdump/Traffic Mirroring"],
              ["Works from one AZ only", "Route table, appliance mode, zonal endpoint, NAT per AZ", "Route tables per subnet, Reachability Analyzer"],
              ["Intermittent drops", "Instance bandwidth/PPS/conntrack allowance, NAT port exhaustion", "ethtool counters, NAT metrics"],
              ["VPN up but no traffic", "Missing routes, overlapping CIDR, SG, NAT-T, mismatched proxy IDs on static VPN", "TunnelState, route tables, device logs"],
              ["BGP flaps", "Prefix limit exceeded, MTU on BGP packets, hold timer, MD5 mismatch", "DX/VPN logs, router BGP state"],
              ["TLS error", "Wrong cert chain, SNI, security policy, expired ACM cert", "openssl s_client, ALB logs"],
            ]}
          />
        </>
      ),
    },
    {
      id: "mtu",
      title: "MTU and MSS in depth",
      body: (
        <>
          <p>
            Path MTU discovery needs routers to return <strong>ICMP type 3 code 4</strong>{" "}
            (Destination Unreachable, Fragmentation Needed and DF set). Block it and senders keep
            using too-large packets that vanish. Overheads reduce usable size: IPsec ESP adds about
            50 to 73 bytes and NAT-T more, GRE 24 bytes, VXLAN about 50 bytes.
          </p>
          <ul>
            <li><strong>Test:</strong> <code>ping -M do -s 1472 host</code> on Linux (1472 + 28 = 1500). Reduce until it succeeds to find path MTU. Use <code>tracepath</code> for PMTU.</li>
            <li><strong>Fix:</strong> allow ICMP type 3 code 4 in security groups and NACLs; set instance MTU consistently (jumbo 9001 only where the whole path supports it); clamp TCP MSS on the VPN/customer router (for example 1379 for IPsec to AWS); on Linux <code>ip link set dev eth0 mtu 1500</code> for flows crossing the internet or VPN.</li>
            <li><strong>Jumbo frames</strong> work inside a VPC, between peered VPCs, over Transit Gateway (8500), and on Direct Connect private (9001) or transit (8500) VIFs; they do <em>not</em> pass the internet gateway, VPN connections or inter-Region peering beyond 8500.</li>
            <li><strong>UDP</strong> has no MSS; large datagrams fragment or drop. Keep application payloads under the path MTU.</li>
          </ul>
          <Callout tone="tip" title="Classic exam scenario">
            A database in a VPC replicates to on-premises over Site-to-Site VPN. Small queries work;
            bulk transfers hang. Instances use jumbo frames (MTU 9001). Answer: lower the instance
            MTU or clamp MSS to fit the 1500 byte VPN path, and ensure ICMP fragmentation-needed is
            allowed.
          </Callout>
        </>
      ),
    },
    {
      id: "asym",
      title: "Asymmetric routing and stateful devices",
      body: (
        <>
          <p>
            Stateful devices (security groups on the instance are fine, but firewalls, NAT, Network
            Firewall, GWLB appliances) must see both directions of a flow. Asymmetry appears when
            return traffic takes a different path: two Direct Connect links with equal preference,
            Transit Gateway cross-AZ without appliance mode, or an on-premises firewall that sees the
            request on one link and the reply on another.
          </p>
          <ul>
            <li>Make the preferences consistent in both directions (local preference communities for AWS→on-premises, local preference on your router for on-premises→AWS).</li>
            <li>Enable appliance mode on inspection VPC attachments.</li>
            <li>Use GWLB flow stickiness; keep one active appliance path per flow.</li>
          </ul>
          <Exercise
            title="Triage"
            task={<p>An app in VPC A (10.1.0.0/16) cannot reach a service in VPC B (10.2.0.0/16) over a Transit Gateway. No REJECT records appear. Reachability Analyzer from A to B reports &ldquo;route not found&rdquo; at the TGW. What is the most likely fix?</p>}
          >
            <p>
              The TGW route table associated with VPC A&apos;s attachment has no route to{" "}
              <code>10.2.0.0/16</code>. Enable propagation of VPC B&apos;s attachment into that table
              (or add a static route), and verify the return path likewise. No REJECT appears because
              the packet never reaches a security group.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Troubleshoot in layers: flow definition, DNS, routes, filters, path quality, application.",
    "Symptom 'small works, large fails' means MTU/MSS with blocked ICMP type 3 code 4; clamp MSS and align MTUs.",
    "No REJECT but no reply suggests routing or host issues; REJECT points to SG or NACL.",
    "Asymmetric paths break stateful devices; align preferences and enable appliance mode.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which ICMP message is required for Path MTU Discovery to work?",
      options: ["Type 3 code 4 (Fragmentation Needed)", "Type 8 (Echo request)", "Type 0 (Echo reply)", "Type 11 (Time exceeded)"],
      answer: 0,
      explain: "Blocking Destination Unreachable / Fragmentation Needed causes PMTUD black holes.",
    },
    {
      kind: "mcq",
      q: "A flow log shows no REJECT yet the connection times out and Reachability Analyzer shows a missing TGW route. What next?",
      options: ["Fix TGW route propagation or add a static route", "Open the security group", "Increase the NAT gateway", "Change the TTL"],
      answer: 0,
      explain: "A routing gap drops traffic before security groups evaluate it, so there is no REJECT.",
    },
    {
      kind: "mcq",
      q: "Large transfers stall over Site-to-Site VPN from jumbo-frame instances. Best fix?",
      options: ["Clamp MSS / lower MTU to fit the VPN path", "Enable DNSSEC", "Add a second VPC", "Switch to a larger instance"],
      answer: 0,
      explain: "The VPN path MTU is about 1500 minus overhead; match the instance MTU or MSS.",
    },
    {
      kind: "mcq",
      q: "Stateful inspection appliances behind a Transit Gateway drop return packets. Which setting?",
      options: ["Appliance mode", "Multicast support", "DNS support", "Default route table association"],
      answer: 0,
      explain: "Appliance mode keeps flows symmetric through one AZ appliance.",
    },
    {
      kind: "text",
      q: "What ICMP type number is Destination Unreachable (which includes Fragmentation Needed)?",
      format: "*",
      accept: ["3", "type 3"],
      explain: "ICMP type 3 is Destination Unreachable; code 4 is Fragmentation Needed and DF set.",
    },
  ],
};
