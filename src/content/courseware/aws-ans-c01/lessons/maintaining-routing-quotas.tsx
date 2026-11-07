import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Hard",
  objectives: [
    "Maintain routing across VPC route tables, VGW propagation and Transit Gateway route tables",
    "Summarize routes and handle CIDR overlaps without breaking reachability",
    "Account for quotas that affect networking services (routes, bandwidth, attachments)",
    "Maintain private access to custom services with PrivateLink and peering",
    "Compare intra-Region and inter-Region communication patterns",
  ],
  tasks: [
    {
      id: "tables",
      title: "Route tables in practice",
      body: (
        <>
          <ul>
            <li><strong>Subnet association:</strong> each subnet uses exactly one route table (explicit or the VPC main table). New subnets silently use the main table, so keep the main table minimal and private.</li>
            <li><strong>Gateway route tables:</strong> associate a route table with an internet gateway or virtual private gateway to steer inbound traffic (ingress routing) through a firewall endpoint before it reaches the subnet.</li>
            <li><strong>Route propagation:</strong> enable on a VPC route table so routes learned by a VGW (VPN/DX) appear automatically. Static routes win over propagated routes for the same prefix.</li>
            <li><strong>Prefix lists:</strong> use managed prefix lists to reference many CIDRs in one route or security group rule and update them centrally.</li>
            <li><strong>Blackhole routes:</strong> a route to a deleted target becomes <em>blackhole</em> and silently drops traffic. Alert on these with Config or a script.</li>
          </ul>
          <Figure caption="Route maintenance loop. Every change should be reviewed, tested and monitored.">
            <Flow
              numbered
              steps={[
                { title: "Change request", note: "IaC pull request", tone: "sky" },
                { title: "Preview", note: "Change set, Reachability Analyzer", tone: "amber" },
                { title: "Apply", note: "Pipeline", tone: "lime" },
                { title: "Monitor", note: "Blackhole, drop and BGP alarms", tone: "rose" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "summarize",
      title: "Summarization and overlap handling",
      body: (
        <>
          <p>
            <strong>Summarize</strong> (aggregate) contiguous prefixes into one larger prefix to cut
            route counts and protect against prefix limits. For example{" "}
            <code>10.1.0.0/24</code>, <code>10.1.1.0/24</code>, <code>10.1.2.0/24</code> and{" "}
            <code>10.1.3.0/24</code> summarize to <code>10.1.0.0/22</code>. Design your addressing so
            that each Region, environment or site owns an aligned block, then advertise one summary.
          </p>
          <ul>
            <li>Summaries must not hide failures: if one member is down, the summary still attracts traffic (a black hole). Keep specific routes for critical or multi-homed subnets, since longest prefix match prefers them.</li>
            <li>On Direct Connect private and transit VIFs you can advertise at most 100 prefixes; Transit Gateway associations toward on-premises allow up to 200 prefixes in the allowed list. Summarize to fit.</li>
            <li>When on-premises and VPC ranges overlap, the VPC local route wins; reachable on-premises hosts in that overlap become unreachable. Fix with re-addressing, NAT or PrivateLink.</li>
          </ul>
        </>
      ),
    },
    {
      id: "quotas",
      title: "Limits and quotas that shape designs",
      body: (
        <>
          <Table
            head={["Area", "Limit to remember", "Design implication"]}
            rows={[
              ["VPC route table", "Default 50 routes (non-propagated), adjustable to 1,000; propagated routes counted separately", "Summarize, use prefix lists"],
              ["VGW / VPN BGP", "Advertise up to 100 routes from on-premises per VPN connection; static VPN limited", "Send summaries or a default"],
              ["Direct Connect VIF", "100 prefixes from customer on private/transit VIF", "Summarize or use default route"],
              ["Transit Gateway", "5,000 attachments; large number of static and propagated routes per table (thousands); 50 Gbps per VPC attachment, 1.25 Gbps per VPN tunnel", "Split into multiple TGWs or route tables if needed"],
              ["VPC peering", "125 per VPC", "Use TGW for large estates"],
              ["Security groups", "5 per ENI, 60 inbound + 60 outbound rules per SG (adjustable, product capped)", "Use prefix lists and shared SGs"],
              ["NAT gateway", "55,000 connections per destination; 100 Gbps", "Add NAT gateways per AZ / spread destinations"],
              ["Interface endpoint", "Per-AZ bandwidth up to 100 Gbps, scales", "Create in each AZ used"],
              ["Resolver endpoint ENI", "About 10,000 qps per ENI", "Add IPs to the endpoint"],
            ]}
          />
          <Callout tone="warn" title="Quotas are not constants">
            Values change and many are adjustable via Service Quotas. For the exam, remember the
            <em> order of magnitude</em> and the symptom when you hit one, such as a BGP session
            flapping when prefix limits are exceeded or new attachments failing.
          </Callout>
        </>
      ),
    },
    {
      id: "private",
      title: "Private access and communication patterns",
      body: (
        <>
          <Table
            head={["Need", "Intra-Region", "Inter-Region"]}
            rows={[
              ["VPC to VPC", "Peering or Transit Gateway", "Inter-Region peering or TGW peering (static routes)"],
              ["Private access to a service", "PrivateLink", "Cross-Region PrivateLink or Transit Gateway"],
              ["Private access to AWS services", "Gateway/interface endpoints", "Interface endpoints in each Region"],
              ["On-premises access", "DX/VPN to VGW or TGW", "Direct Connect gateway to TGWs in several Regions, plus TGW peering"],
              ["DNS", "Private hosted zones associated with VPCs", "Associate PHZ with VPCs in other Regions; Resolver rules per Region"],
            ]}
          />
          <Exercise
            title="Too many routes"
            task={<p>A private VIF BGP session with a Direct Connect gateway keeps dropping after the company adds branch offices that advertise 140 /24 prefixes on-premises. What do you change?</p>}
          >
            <p>
              The VIF accepts up to 100 prefixes. Summarize the branch prefixes to fewer aggregate
              routes at the on-premises router (for example one /16 or several /20s), or advertise a
              default route toward AWS. Keep any critical specifics only where necessary. Restore the
              session and add an alarm for BGP session state and an operational check against the
              prefix count.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Keep explicit route tables per subnet tier, use prefix lists and alert on blackhole routes.",
    "Summarize aligned address blocks to respect prefix limits, but keep specifics for multi-homed or critical networks.",
    "Know the order of magnitude of limits: 100 prefixes per VIF, 5,000 TGW attachments, 125 peerings, 5 SGs per ENI, 55,000 NAT connections.",
    "Use the right pattern per scope: peering or TGW and PrivateLink within a Region; TGW peering, cross-Region peering and DX gateway across Regions.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A BGP session over Direct Connect drops after the customer advertises too many prefixes. What is the fix?",
      options: ["Summarize the routes", "Increase the MTU", "Add a NAT gateway", "Enable DNSSEC"],
      answer: 0,
      explain: "Exceeding the prefix limit tears down the session; summarize or send a default route.",
    },
    {
      kind: "mcq",
      q: "Which entry silently drops traffic when its target is deleted?",
      options: ["A blackhole route", "A local route", "A propagated route", "A prefix list"],
      answer: 0,
      explain: "A route whose target no longer exists becomes blackhole and drops matching packets.",
    },
    {
      kind: "mcq",
      q: "Four /24 networks 10.1.0.0 to 10.1.3.0 aggregate to which prefix?",
      options: ["10.1.0.0/22", "10.1.0.0/23", "10.1.0.0/21", "10.1.0.0/24"],
      answer: 0,
      explain: "Four contiguous /24 blocks make a /22.",
    },
    {
      kind: "mcq",
      q: "Which feature lets you steer inbound internet traffic through a firewall before it hits subnets?",
      options: ["Route table associated with the internet gateway (ingress routing)", "Security group", "Elastic IP", "Route 53 alias"],
      answer: 0,
      explain: "Gateway route tables direct ingress traffic to a firewall endpoint.",
    },
    {
      kind: "text",
      q: "Peering connections per VPC can be raised up to what maximum?",
      format: "***",
      accept: ["125"],
      explain: "The adjustable quota for active peering connections per VPC tops out at 125.",
    },
  ],
};
