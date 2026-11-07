import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Create VPC Flow Logs at VPC, subnet and ENI level and choose destinations",
    "Read default and custom fields and interpret ACCEPT/REJECT records",
    "List what flow logs do not capture",
    "Set up VPC Traffic Mirroring with sources, targets, filters and sessions",
    "Pick flow logs or traffic mirroring for a given question",
  ],
  tasks: [
    {
      id: "flowlogs",
      title: "VPC Flow Logs",
      body: (
        <>
          <p>
            VPC Flow Logs record metadata about IP traffic (not payload) accepted or rejected at
            network interfaces. Create them for a <strong>VPC</strong>, a <strong>subnet</strong> or
            an <strong>ENI</strong>; they can also be created for a Transit Gateway or its
            attachments. Deliver to <strong>CloudWatch Logs</strong> (query with Logs Insights),{" "}
            <strong>Amazon S3</strong> (Athena, cheaper at scale, Parquet option, Hive-partitioned)
            or <strong>Kinesis Data Firehose</strong> (to third-party tools).
          </p>
          <Table
            head={["Option", "Choice"]}
            rows={[
              ["Filter", "ACCEPT, REJECT or ALL"],
              ["Aggregation interval", "10 minutes (default) or 1 minute"],
              ["Format", "Default version 2 fields or a custom format with any supported fields"],
              ["Permissions", "IAM role for CloudWatch Logs; bucket policy for S3"],
              ["Immutability", "You cannot change a flow log's configuration after creation; create a new one"],
            ]}
          />
          <p>The default (version 2) record is:</p>
          <pre>
            <code>{`version account-id interface-id srcaddr dstaddr srcport dstport protocol packets bytes start end action log-status
2 123456789010 eni-0abc 10.0.1.5 10.0.2.9 49152 443 6 20 4249 1620140761 1620140821 ACCEPT OK`}</code>
          </pre>
          <p>
            Custom fields add <code>vpc-id</code>, <code>subnet-id</code>, <code>instance-id</code>,{" "}
            <code>tcp-flags</code>, <code>type</code> (IPv4/IPv6/EFA), <code>pkt-srcaddr</code> and{" "}
            <code>pkt-dstaddr</code> (the original packet addresses, vital behind NAT or load
            balancers), <code>flow-direction</code>, <code>traffic-path</code> (how traffic left the
            VPC: IGW, VGW, peering, TGW, endpoint…), <code>az-id</code>, <code>region</code> and more.
          </p>
          <Callout tone="warn" title="What flow logs do NOT capture">
            Traffic to the Amazon DNS server (unless you use your own resolver), DHCP, instance
            metadata (169.254.169.254), Amazon Time Sync (169.254.169.123), Windows license
            activation traffic, traffic to the VPC router reserved address, and mirrored traffic.
          </Callout>
        </>
      ),
    },
    {
      id: "interpret",
      title: "Reading flow logs",
      body: (
        <>
          <ul>
            <li><strong>REJECT</strong> records mean a security group or NACL denied the packet. If the inbound is ACCEPT but the response shows REJECT, suspect a stateless NACL missing ephemeral ports.</li>
            <li>Both directions appear as separate records because SG and NACL decisions are evaluated per direction.</li>
            <li><code>tcp-flags</code> distinguish scans (SYN only) from established flows; ICMP shows as protocol 1; TCP 6; UDP 17.</li>
            <li>For NAT/ALB analysis use <code>pkt-srcaddr</code>/<code>pkt-dstaddr</code> to see original packet endpoints versus the interface addresses.</li>
          </ul>
          <pre>
            <code>{`# CloudWatch Logs Insights: top rejected sources
fields @timestamp, srcAddr, dstAddr, dstPort, action
| filter action = "REJECT"
| stats count(*) as rejects by srcAddr, dstPort
| sort rejects desc
| limit 20`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "mirror",
      title: "VPC Traffic Mirroring",
      body: (
        <>
          <p>
            Flow logs show <em>who talked to whom</em>; they cannot show content. <strong>Traffic
            Mirroring</strong> copies the actual packets from a <strong>source ENI</strong> (Nitro
            instances) to a <strong>target</strong> (an ENI, a Network Load Balancer, or a Gateway
            Load Balancer endpoint) for analysis by IDS, forensic or performance tools. Packets are
            encapsulated in <strong>VXLAN on UDP 4789</strong>.
          </p>
          <CloudDiagram course="aws-ans-c01" id="flow-logs-traffic-mirroring-diagram-1" />
          <ul>
            <li>Targets can be in the same VPC, a peered VPC, or reachable through Transit Gateway.</li>
            <li>The target must allow VXLAN (UDP 4789) in its security group.</li>
            <li>Use <strong>filters</strong> (protocol, ports, CIDRs, accept/reject rules) and <strong>packet truncation</strong> to limit volume.</li>
            <li>VXLAN adds about 50 bytes; mirrored packets near the MTU can be truncated or dropped, so allow for this or truncate.</li>
            <li>Mirroring traffic is not captured in flow logs and incurs charges for each session.</li>
          </ul>
        </>
      ),
    },
    {
      id: "choose",
      title: "Which tool answers which question?",
      body: (
        <>
          <Table
            head={["Question", "Use"]}
            rows={[
              ["Was the connection accepted or rejected, and by whom (SG/NACL)?", "Flow Logs"],
              ["Which IPs are sending the most traffic?", "Flow Logs with Athena or Logs Insights"],
              ["What exactly is in the payload; is TLS negotiation failing?", "Traffic Mirroring to a packet analyzer"],
              ["Why does a large download stall (MTU)?", "Traffic Mirroring (see ICMP / retransmits) and Reachability Analyzer"],
              ["Is the path configured correctly?", "Reachability Analyzer (no live traffic)"],
              ["Which API changed the route?", "CloudTrail"],
            ]}
          />
          <Exercise
            title="Investigate"
            task={<p>A web server receives HTTPS requests from the internet, the security group allows 443 and flow logs show ACCEPT inbound, but clients report timeouts. What do the flow logs probably show for the return traffic, and what is the cause?</p>}
          >
            <p>
              A <strong>REJECT</strong> record for outbound traffic from the server to the client&apos;s
              ephemeral port. The security group is stateful and would allow replies, so a REJECT
              indicates the subnet <strong>network ACL</strong> (stateless) lacks an outbound rule for
              ephemeral ports 1024-65535. Add the rule to the NACL.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Flow logs capture metadata at VPC, subnet, ENI or Transit Gateway level and deliver to CloudWatch Logs, S3 or Firehose; configurations are immutable.",
    "Use custom fields such as pkt-srcaddr, flow-direction and traffic-path for NAT and path analysis; know what is not logged.",
    "Traffic Mirroring copies full packets over VXLAN UDP 4789 from Nitro ENIs to ENI, NLB or GWLB targets.",
    "REJECT for return traffic with accepted request usually means a stateless NACL issue.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which flow log field shows the original source address of a packet when traffic passes through a NAT or load balancer?",
      options: ["pkt-srcaddr", "srcaddr", "interface-id", "log-status"],
      answer: 0,
      explain: "pkt-srcaddr holds the packet's original source; srcaddr is the interface-level address.",
    },
    {
      kind: "mcq",
      q: "Traffic to which destination is NOT recorded in VPC Flow Logs?",
      options: ["Instance metadata at 169.254.169.254", "Internet destinations", "A peered VPC", "A load balancer"],
      answer: 0,
      explain: "Metadata, Amazon DNS (when used), DHCP and time sync traffic are not logged.",
    },
    {
      kind: "mcq",
      q: "You need the actual packet contents for intrusion detection. What do you use?",
      options: ["VPC Traffic Mirroring", "VPC Flow Logs", "CloudTrail", "Trusted Advisor"],
      answer: 0,
      explain: "Only mirroring provides packet payloads.",
    },
    {
      kind: "mcq",
      q: "Which encapsulation do mirrored packets use?",
      options: ["VXLAN", "GENEVE", "GRE", "IPsec"],
      answer: 0,
      explain: "Traffic Mirroring uses VXLAN over UDP 4789.",
    },
    {
      kind: "text",
      q: "Flow logs that show inbound ACCEPT and outbound REJECT for return traffic usually point to which stateless control?",
      format: "*******",
      accept: ["network acl", "nacl", "network access control list", "acl"],
      explain: "Network ACLs are stateless and need explicit outbound rules for ephemeral ports.",
    },
  ],
};
