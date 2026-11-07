import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Read scenario questions for constraints, and eliminate distractors systematically",
    "Recognise the recurring decision patterns of ANS-C01",
    "Manage time across about 65 questions in 170 minutes",
    "Run a final-week review and exam-day checklist",
  ],
  tasks: [
    {
      id: "read",
      title: "Reading the question",
      body: (
        <>
          <CloudDiagram course="aws-ans-c01" id="exam-technique-and-review-diagram-1" />
          <ul>
            <li><strong>Qualifiers:</strong> &ldquo;most cost-effective&rdquo;, &ldquo;least operational overhead&rdquo;, &ldquo;highest availability&rdquo;, &ldquo;without changing the application&rdquo;, &ldquo;fastest to implement&rdquo;.</li>
            <li><strong>Multiple response:</strong> the question says how many to choose; each chosen option must be independently correct and together satisfy the scenario. Partial credit is not given.</li>
            <li><strong>Matching:</strong> map each prompt to exactly one response; use elimination from the easy pairs first.</li>
            <li>Prefer managed AWS-native services over self-built solutions when requirements are equal.</li>
          </ul>
        </>
      ),
    },
    {
      id: "patterns",
      title: "Patterns to recognise instantly",
      body: (
        <>
          <Table
            head={["Clue in the question", "Think"]}
            rows={[
              ["Static IPs for allow-listing, TCP/UDP, fast failover", "Global Accelerator (or NLB with EIPs for a single Region)"],
              ["Cache static content, protect origin, geo-block", "CloudFront with OAC / VPC origin and WAF"],
              ["Private hosted zone unresolved from on-premises", "Resolver inbound endpoint"],
              ["Instances cannot resolve on-premises names", "Resolver outbound endpoint and forwarding rule"],
              ["Hundreds of VPCs, transitive routing, segmentation", "Transit Gateway with multiple route tables"],
              ["Two VPCs, high throughput, lowest cost", "VPC peering"],
              ["Overlapping CIDRs, one service shared", "PrivateLink (NLB-backed endpoint service)"],
              ["Inline third-party firewall at scale", "Gateway Load Balancer, appliance mode"],
              ["Inspect egress with domain allow-list", "Network Firewall stateful domain rules, centralized egress"],
              ["Private path to S3 from on-premises", "S3 interface endpoint (not gateway endpoint)"],
              ["Highest Direct Connect SLA", "Two locations, two devices each (maximum resiliency), BFD"],
              ["Encrypt Direct Connect", "MACsec (L2) or IPsec VPN over DX (private IP VPN on transit VIF)"],
              ["VPN bandwidth beyond one tunnel", "Transit Gateway ECMP, not a VGW"],
              ["Large transfers hang, small work, VPN/DX in path", "MTU/MSS and ICMP type 3 code 4"],
              ["Need to prove connectivity without traffic", "Reachability Analyzer"],
              ["Need packets/payload for IDS", "Traffic Mirroring (VXLAN 4789)"],
              ["Org-wide SG / WAF / DNS Firewall enforcement", "Firewall Manager + Config + Organizations"],
              ["Template breaks in new Region/account", "Remove hard-coded AZs, CIDRs, IDs; use parameters, GetAZs, Cidr, SSM"],
            ]}
          />
        </>
      ),
    },
    {
      id: "time",
      title: "Time and mindset",
      body: (
        <>
          <ul>
            <li><strong>Pacing:</strong> 65 questions in 170 minutes is about 2.6 minutes each. Spend about 90 seconds on a first pass; flag and move on when stuck.</li>
            <li><strong>Two passes:</strong> answer everything once, then revisit flagged items with the remaining time. No penalty for guessing, so never leave a blank.</li>
            <li><strong>Eliminate first:</strong> in most questions you can remove two options for violating a hard constraint.</li>
            <li><strong>Draw it:</strong> use the whiteboard (or provided notes) to sketch VPCs, route tables and the packet path for routing questions.</li>
            <li><strong>Unscored questions</strong> exist (15), so do not panic over odd ones.</li>
          </ul>
          <Callout tone="tip" title="When two options both work">
            Choose the one that is cheaper, more managed, or requires fewer changes, unless a
            constraint (compliance, performance, existing tooling) says otherwise.
          </Callout>
        </>
      ),
    },
    {
      id: "final",
      title: "Final-week checklist",
      body: (
        <>
          <Table
            head={["Domain", "Make sure you can"]}
            rows={[
              ["1. Design (30%)", "Pick edge, DNS, ELB, hybrid and multi-VPC patterns from requirements; explain BGP traffic engineering; list logging needs"],
              ["2. Implementation (26%)", "Create VIFs, VPN, TGW attachments/route tables, Resolver endpoints, DNSSEC; explain IaC and event-driven automation"],
              ["3. Operations (20%)", "Troubleshoot MTU, routes, SG/NACL, DNS, BGP; read flow logs; pick Reachability Analyzer, Route Analyzer, Network Manager; optimize cost and performance"],
              ["4. Security (24%)", "Layer WAF/Shield/Network Firewall/GWLB, SG vs NACL, Firewall Manager, audit logs, encryption (IPsec, MACsec, TLS, ACM, PCA)"],
            ]}
          />
          <ol>
            <li>Re-read your decision tables and redo every wrong quiz answer from this course.</li>
            <li>Redraw the three scenarios (global application, enterprise hybrid, hub and spoke) from memory.</li>
            <li>Skim the AWS documentation quotas for TGW, Direct Connect, VPN, VPC and ELB.</li>
            <li>Sleep, plan the testing location or online proctoring setup, and bring valid ID.</li>
          </ol>
          <Exercise
            title="Self-test"
            task={<p>Without notes, explain in two minutes: how a packet from an on-premises server reaches an instance in a spoke VPC through Direct Connect and Transit Gateway, naming every routing table and attachment involved.</p>}
          >
            <p>
              On-premises router → BGP route (learned from AWS) → Direct Connect transit VIF → DX
              gateway → TGW (DX gateway attachment associated with route table RT-X; RT-X contains the
              spoke CIDR via propagation from the spoke VPC attachment) → VPC attachment ENI in a
              spoke subnet → VPC local routing → security group and NACL allow → instance. The return
              path uses the spoke subnet&apos;s route table (on-premises CIDR via TGW), the TGW route
              table associated with the spoke attachment (on-premises CIDR via DX gateway propagated
              or static), and the DX gateway&apos;s allowed prefixes toward on-premises.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Read the final question, underline constraints, eliminate violators, then choose the simplest compliant option.",
    "Memorise the clue-to-service patterns; they cover a large share of scenarios.",
    "Pace at about 2.6 minutes per question, flag and return, and never leave an answer blank.",
    "Final week: decision tables, redraw scenarios, review quotas and rehearse packet paths.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A question asks for the most cost-effective way for two VPCs in one Region to exchange 20 TB nightly. What do you pick?",
      options: ["VPC peering", "Transit Gateway", "Direct Connect", "Site-to-Site VPN"],
      answer: 0,
      explain: "Peering has no per-GB processing fee beyond standard transfer and no hourly cost.",
    },
    {
      kind: "mcq",
      q: "Two answers both work. One needs custom scripts on EC2 and one uses a managed service. Absent other constraints, which?",
      options: ["The managed service", "The scripts", "Neither", "Whichever is more expensive"],
      answer: 0,
      explain: "Exams favour lower operational overhead when requirements are met equally.",
    },
    {
      kind: "mcq",
      q: "Static IPs, TCP traffic and sub-minute Region failover point to which service?",
      options: ["Global Accelerator", "CloudFront", "Route 53 latency", "ALB"],
      answer: 0,
      explain: "This clue pattern maps to Global Accelerator.",
    },
    {
      kind: "mcq",
      q: "What should you do with a hard question on first pass?",
      options: ["Flag it, answer your best guess, and return later", "Leave it blank", "Spend 10 minutes on it", "Skip the rest"],
      answer: 0,
      explain: "There is no penalty for guessing, so answer, flag and revisit if time remains.",
    },
    {
      kind: "text",
      q: "How many scored questions does ANS-C01 contain?",
      format: "**",
      accept: ["50", "fifty"],
      explain: "50 scored questions plus 15 unscored questions.",
    },
  ],
};
