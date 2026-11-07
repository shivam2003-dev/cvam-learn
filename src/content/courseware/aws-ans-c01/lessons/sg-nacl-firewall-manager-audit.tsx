import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Compare security groups, network ACLs and endpoint policies for inter-VPC control",
    "Use AWS Firewall Manager to enforce security policy across accounts",
    "Design a network audit strategy with Config, CloudTrail, Trusted Advisor and logs",
    "Deliver, correlate and analyze logs from several network sources",
    "Create alarms and custom metrics for security events",
  ],
  tasks: [
    {
      id: "controls",
      title: "Controlling east-west traffic",
      body: (
        <>
          <Table
            head={["", "Security group", "Network ACL", "VPC endpoint policy"]}
            rows={[
              ["Level", "ENI / instance", "Subnet", "Endpoint (service access)"],
              ["State", "Stateful", "Stateless", "N/A (IAM resource policy)"],
              ["Rules", "Allow only; all rules evaluated", "Allow and deny; numbered, first match wins", "Allow/deny on principals, actions, resources"],
              ["Source", "CIDR, prefix list, other SG (even across peered VPCs in a Region)", "CIDR only", "Principal / resource conditions"],
              ["Default", "Deny all inbound, allow all outbound", "Default NACL allows all; custom NACL denies all", "Full access"],
              ["Best use", "Primary micro-segmentation: web SG → app SG → db SG", "Coarse subnet guardrails and explicit deny of bad CIDRs", "Limit which buckets/APIs the VPC may reach"],
            ]}
          />
          <ul>
            <li>Reference security groups by ID instead of CIDRs so scaling and IP changes do not matter. Cross-account references work with peering in the same Region and with shared VPCs.</li>
            <li>Avoid 0.0.0.0/0 inbound except 80/443 to a public load balancer. Replace SSH/RDP exposure with Session Manager or EC2 Instance Connect Endpoint.</li>
            <li>NACL tip: number rules in gaps (100, 200) and include ephemeral ports 1024-65535 for return traffic.</li>
            <li>Connection tracking: security groups track connections; some flows (for example to the Amazon DNS server) are automatically allowed and untracked flows have different behaviour, which matters for high-throughput designs.</li>
          </ul>
        </>
      ),
    },
    {
      id: "fm",
      title: "AWS Firewall Manager",
      body: (
        <>
          <p>
            <strong>Firewall Manager</strong> applies security policies centrally across an AWS
            Organization. It requires Organizations, a Firewall Manager <em>administrator account</em>{" "}
            and AWS Config enabled in member accounts. Policies automatically cover new accounts and
            resources and remediate drift.
          </p>
          <Table
            head={["Policy type", "Enforces"]}
            rows={[
              ["AWS WAF / WAF Classic", "Web ACLs on ALBs, CloudFront, API Gateway"],
              ["Shield Advanced", "Protections and response team engagement on resources"],
              ["Security group (common, audit, content audit)", "Baseline SGs, remove overly permissive or unused rules, audit against rules you define"],
              ["Network Firewall", "Firewall and policy in each in-scope VPC"],
              ["Route 53 Resolver DNS Firewall", "Rule groups on VPCs"],
              ["Network ACL (policy)", "Baseline NACL rules"],
              ["Third-party firewalls", "Partner firewall policies"],
            ]}
          />
          <Figure caption="Firewall Manager flow. The administrator defines a policy and scope; Config detects resources; non-compliant resources are reported or auto-remediated in member accounts.">
            <Flow
              numbered
              steps={[
                { title: "Define policy", note: "Type, scope (OUs, tags), remediation", tone: "sky" },
                { title: "Detect", note: "AWS Config inventory", tone: "lime" },
                { title: "Apply / remediate", note: "Create or fix resources in member accounts", tone: "amber" },
                { title: "Report", note: "Compliance dashboard, SNS notifications", tone: "rose" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "audit",
      title: "Audit and log strategy",
      body: (
        <>
          <Table
            head={["Source", "Answers", "Delivery"]}
            rows={[
              ["CloudTrail", "Who changed which network resource and when", "S3 (org trail), CloudWatch Logs, EventBridge"],
              ["AWS Config", "Configuration history and compliance against rules (restricted-ssh, vpc-flow-logs-enabled, open ports)", "S3, SNS, aggregator across accounts"],
              ["VPC Flow Logs / TGW flow logs", "Who talked to whom", "CloudWatch Logs, S3, Firehose"],
              ["Load balancer access logs", "Per-request details at ALB/NLB", "S3"],
              ["CloudFront standard / real-time logs", "Edge requests", "S3 / Kinesis Data Streams"],
              ["Route 53 query logs / Resolver logs", "DNS lookups", "CloudWatch Logs, S3, Firehose"],
              ["WAF / Network Firewall logs", "Rule matches and drops", "S3, CloudWatch Logs, Firehose"],
              ["Trusted Advisor", "Checks such as unrestricted security group ports and service limits", "Console, EventBridge"],
            ]}
          />
          <ul>
            <li><strong>Centralize:</strong> send logs to a dedicated log archive account with write-only access, S3 Object Lock and lifecycle rules for retention.</li>
            <li><strong>Correlate:</strong> join flow logs, DNS logs and CloudTrail by IP, instance ID and time with Athena or OpenSearch, or stream via Kinesis/Firehose to a SIEM.</li>
            <li><strong>Detect:</strong> metric filters on logs (for example repeated REJECTs, security group changes), CloudWatch alarms and custom metrics via the agent or <code>PutMetricData</code>, and EventBridge rules for API events.</li>
            <li><strong>Prove:</strong> run periodic Network Access Analyzer scopes and Reachability Analyzer checks and keep the output as audit evidence.</li>
          </ul>
          <Callout tone="note" title="Log delivery choices">
            CloudWatch Logs is best for interactive search and alarms; S3 is best for low-cost
            retention and large-scale analysis; Kinesis Data Firehose or Streams feeds near-real-time
            pipelines and third-party tools.
          </Callout>
          <Exercise
            title="Audit design"
            task={<p>An auditor asks for proof that no security group in any of 120 accounts allows 0.0.0.0/0 on port 22, alerts within minutes of a violation, and centralized evidence for seven years. Design it.</p>}
          >
            <p>
              Enable <strong>AWS Config</strong> in all accounts with the managed rule{" "}
              <code>restricted-ssh</code> and an organization <strong>aggregator</strong>; add a{" "}
              <strong>Firewall Manager security group audit policy</strong> to flag or remediate
              violations; route Config non-compliance and CloudTrail
              <code> AuthorizeSecurityGroupIngress</code> events through EventBridge to SNS and an SSM
              Automation remediation. Store Config history and CloudTrail in the log archive account
              S3 bucket with Object Lock and a seven-year lifecycle.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Use security groups (stateful, SG references) for micro-segmentation; NACLs (stateless) for coarse guardrails; endpoint policies for service-level egress control.",
    "Firewall Manager enforces WAF, Shield, SG, Network Firewall, DNS Firewall and NACL policies across an organization using Config.",
    "An audit strategy combines CloudTrail, Config, flow/DNS/LB/edge/WAF logs, centralized storage and automated alarms.",
    "Correlate sources by IP, instance and time; retain in a protected log archive account.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which control is stateless and supports explicit deny rules?",
      options: ["Network ACL", "Security group", "Endpoint policy", "Route table"],
      answer: 0,
      explain: "Network ACLs are stateless and support allow and deny rules.",
    },
    {
      kind: "mcq",
      q: "What does Firewall Manager need to function in member accounts?",
      options: ["AWS Organizations and AWS Config", "Direct Connect", "A NAT gateway", "CloudFront"],
      answer: 0,
      explain: "Firewall Manager relies on Organizations and Config to discover and enforce policy.",
    },
    {
      kind: "mcq",
      q: "Which service records who modified a security group?",
      options: ["AWS CloudTrail", "VPC Flow Logs", "Route 53 query logs", "ALB access logs"],
      answer: 0,
      explain: "CloudTrail records API calls such as AuthorizeSecurityGroupIngress.",
    },
    {
      kind: "mcq",
      q: "Best low-cost long-term retention and large-scale analysis destination for flow logs?",
      options: ["Amazon S3 with Athena", "CloudWatch Logs only", "SNS", "SQS"],
      answer: 0,
      explain: "S3 is cheap for retention and Athena queries it directly.",
    },
    {
      kind: "text",
      q: "Which AWS Config managed rule checks that SSH is not open to the world? (rule name)",
      format: "********** ***",
      accept: ["restricted-ssh", "restricted ssh", "incoming-ssh-disabled"],
      explain: "restricted-ssh (and incoming-ssh-disabled) flag security groups allowing unrestricted SSH.",
    },
  ],
};
