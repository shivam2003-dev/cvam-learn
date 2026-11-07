import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Explain VPC sharing and what the owner and participants can each do",
    "Share Transit Gateways, Resolver rules and prefix lists using AWS RAM",
    "Design a multi-account network layout with Organizations, Control Tower and SCPs",
    "Compare VPC sharing with one-VPC-per-account designs",
  ],
  tasks: [
    {
      id: "sharing",
      title: "VPC sharing",
      body: (
        <>
          <p>
            With <strong>VPC sharing</strong>, the account that owns a VPC shares one or more{" "}
            <em>subnets</em> with other accounts in the same AWS Organization using AWS Resource
            Access Manager (RAM). Participant accounts launch their own resources (EC2, RDS, Lambda,
            load balancers) directly into the shared subnets. Resources in the same VPC talk over the
            VPC local route, with no peering or Transit Gateway cost.
          </p>
          <Table
            head={["Role", "Can", "Cannot"]}
            rows={[
              ["Owner (network account)", "Create and manage VPC, subnets, route tables, NACLs, gateways, flow logs; share subnets", "Modify participants' resources"],
              ["Participant", "Create resources and security groups in shared subnets; manage its own resources", "Change route tables, subnets, NACLs, IGW/NAT; see or modify other participants' resources (instances, ENIs)"],
            ]}
          />
          <CloudDiagram course="aws-ans-c01" id="vpc-sharing-organizations-diagram-1" />
          <ul>
            <li>Sharing works only within the same <strong>organization</strong> (with RAM sharing with Organizations enabled).</li>
            <li>Use <strong>AZ IDs</strong>; AZ names differ per account.</li>
            <li>Security groups of participants are scoped to the VPC; each participant manages its own. Use security group references across participants (supported inside the same VPC).</li>
            <li>The owner is billed for NAT gateways, VPC endpoints and data processing in the VPC; participants are billed for their resources. Data transfer across AZs is billed to the account that incurs it.</li>
            <li>Quotas such as the number of ENIs and IPs are shared by the VPC.</li>
          </ul>
        </>
      ),
    },
    {
      id: "ram",
      title: "What else RAM shares",
      body: (
        <>
          <Table
            head={["Resource", "Why share it"]}
            rows={[
              ["Transit Gateway", "Let every account attach VPCs to one central TGW"],
              ["Route 53 Resolver rules and DNS Firewall rule groups", "One hybrid DNS configuration for all VPCs"],
              ["Customer-managed prefix lists", "One approved list of CIDRs reused in security groups and route tables"],
              ["Subnets (VPC sharing)", "Centralized network ownership"],
              ["Network Firewall policies/rule groups, Route 53 Profiles", "Standard security and DNS baselines"],
              ["Direct Connect gateway associations (via allowed principals)", "Central hybrid link for many accounts"],
            ]}
          />
          <Callout tone="note" title="Sharing does not move the resource">
            RAM keeps the resource in the owner account. Participants use it but the owner controls
            lifecycle. Cross-account Transit Gateway attachments appear in both accounts; the TGW
            owner may need to accept them unless auto-accept is on.
          </Callout>
        </>
      ),
    },
    {
      id: "org",
      title: "Multi-account network governance",
      body: (
        <>
          <ul>
            <li><strong>Organizations</strong> groups accounts into OUs; <strong>service control policies</strong> set guardrails, for example deny <code>ec2:CreateInternetGateway</code> or deny creating VPC peering in workload accounts, forcing traffic through the central hub.</li>
            <li><strong>Control Tower</strong> builds a landing zone with a baseline: management, log archive and audit accounts, guardrails, and Account Factory to vend accounts with a standard VPC.</li>
            <li>A typical structure has a <strong>Network account</strong> (Transit Gateway, Direct Connect, inspection VPC, DNS), a <strong>Shared services</strong> account, a <strong>Log archive</strong> account, and many workload accounts.</li>
            <li>Use <strong>AWS Config</strong> and <strong>Firewall Manager</strong> to enforce and audit network settings across accounts.</li>
          </ul>
          <Exercise
            title="Shared VPC or VPC per account?"
            task={<p>A company has 40 small application teams that need isolation of IAM and billing but identical network design, central NAT and no VPC-to-VPC data charges. Which model?</p>}
          >
            <p>
              <strong>VPC sharing.</strong> One (or a few) network-owned VPCs share subnets to team
              accounts. Each team keeps its own IAM and billing; the network account runs NAT, endpoints
              and inspection once; traffic between teams in the same VPC avoids Transit Gateway
              processing charges. A VPC per account is better when teams need full network
              autonomy, strict blast-radius isolation or overlapping private ranges.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "VPC sharing lets participants deploy into owner-managed subnets; the owner controls routing, participants control their own resources.",
    "RAM shares Transit Gateways, Resolver rules, prefix lists and more; use Organizations for organization-wide sharing.",
    "Use AZ IDs, SCP guardrails, Control Tower and a dedicated network account for governance.",
    "Choose VPC sharing for central control and cost; separate VPCs for autonomy and isolation.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In a shared VPC, which party manages route tables?",
      options: ["The VPC owner", "Each participant", "AWS Support", "The Organizations management account only"],
      answer: 0,
      explain: "Participants cannot modify subnets, route tables or NACLs of a shared VPC.",
    },
    {
      kind: "mcq",
      q: "Which service do you use to share a subnet with another account?",
      options: ["AWS Resource Access Manager", "AWS Config", "IAM Identity Center", "AWS Artifact"],
      answer: 0,
      explain: "RAM shares subnets, Transit Gateways, Resolver rules and more.",
    },
    {
      kind: "mcq",
      q: "Why use AZ IDs instead of AZ names when sharing subnets?",
      options: [
        "AZ names map to different physical zones in different accounts",
        "AZ IDs are shorter",
        "AZ names are deprecated",
        "AZ IDs are free",
      ],
      answer: 0,
      explain: "AZ names are randomized per account; AZ IDs identify the same physical zone consistently.",
    },
    {
      kind: "mcq",
      q: "Which control prevents workload accounts from creating internet gateways?",
      options: ["A service control policy", "A security group", "A NACL", "A Route 53 rule"],
      answer: 0,
      explain: "SCPs set maximum permissions for accounts in an OU.",
    },
    {
      kind: "text",
      q: "Which AWS service shares resources such as subnets and Transit Gateways across accounts? (acronym)",
      format: "***",
      accept: ["ram", "aws ram", "resource access manager"],
      explain: "AWS Resource Access Manager (RAM).",
    },
  ],
};
