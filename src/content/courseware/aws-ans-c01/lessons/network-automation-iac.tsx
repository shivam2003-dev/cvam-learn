import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Describe infrastructure as code options for AWS networking: CloudFormation, CDK, CLI, SDK",
    "Avoid hard-coded values that break reuse and cause outages",
    "Design event-driven network automation with EventBridge, Lambda and Systems Manager",
    "Integrate hybrid automation and multi-account deployment (StackSets, Control Tower)",
    "Automate cost and resource optimization for network resources",
  ],
  tasks: [
    {
      id: "iac",
      title: "IaC choices",
      body: (
        <>
          <Table
            head={["Tool", "Use", "Notes"]}
            rows={[
              ["CloudFormation", "Declarative templates (YAML/JSON) for stacks; change sets preview updates; drift detection; StackSets deploy to many accounts/Regions", "Native, supports almost every networking resource"],
              ["AWS CDK", "Define infrastructure in TypeScript, Python, Java and more; synthesizes to CloudFormation; constructs encapsulate patterns", "L1 raw, L2 sensible defaults, L3 patterns; cdk diff previews"],
              ["AWS CLI / SDKs", "Imperative scripts and application logic; one-off tasks and custom automation", "Good for glue, not for desired-state management"],
              ["Terraform and others", "Third-party desired-state tools used widely in hybrid shops", "Same principles: modules, remote state, review in CI"],
            ]}
          />
          <p>
            Good network IaC is <strong>repeatable</strong> (same template, many environments),{" "}
            <strong>reviewable</strong> (pull request plus change set), and <strong>safe</strong>{" "}
            (small stacks, protected stateful resources, controlled deletes). Typical stack split: a
            foundation stack (VPC, subnets, route tables), a connectivity stack (TGW, attachments), a
            security stack (NACLs, Network Firewall) and a DNS stack.
          </p>
        </>
      ),
    },
    {
      id: "hardcode",
      title: "The hard-coded values problem",
      body: (
        <>
          <p>
            The exam guide explicitly mentions the common problems of hard-coded instructions in
            templates. Typical failures:
          </p>
          <ul>
            <li><strong>Hard-coded Availability Zone names</strong> (<code>us-east-1a</code>) fail in accounts where that AZ is unavailable or mapped differently. Use <code>Fn::GetAZs</code> / <code>!Select</code>, or parameters with AZ IDs.</li>
            <li><strong>Hard-coded CIDRs</strong> collide when the template is reused in another environment or Region. Take them as parameters, use <code>Fn::Cidr</code> to carve subnets from a VPC CIDR, or allocate from IPAM.</li>
            <li><strong>Hard-coded IDs and ARNs</strong> (vpc-0abc…, AMI IDs) break outside the original account or Region. Use parameters, <code>Ref</code>, <code>Fn::ImportValue</code> or SSM Parameter Store references (<code>{"{{resolve:ssm:/network/tgw-id}}"}</code>).</li>
            <li><strong>Hard-coded account IDs and Region names</strong> prevent StackSets reuse. Use pseudo parameters <code>AWS::AccountId</code> and <code>AWS::Region</code>.</li>
            <li><strong>Hard-coded secrets</strong> such as VPN pre-shared keys leak. Use Secrets Manager dynamic references.</li>
            <li><strong>Replacement-causing property edits:</strong> changing some properties (such as a subnet CIDR) replaces the resource and can cascade deletions; review change sets and use DeletionPolicy/UpdateReplacePolicy and stack policies on critical resources.</li>
          </ul>
          <pre>
            <code>{`Parameters:
  VpcCidr: { Type: String, Default: 10.20.0.0/16 }
Resources:
  Vpc:
    Type: AWS::EC2::VPC
    Properties: { CidrBlock: !Ref VpcCidr, EnableDnsSupport: true, EnableDnsHostnames: true }
  PrivateA:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref Vpc
      AvailabilityZone: !Select [0, !GetAZs ""]
      CidrBlock: !Select [0, !Cidr [!Ref VpcCidr, 8, 12]]   # /20 subnets`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "events",
      title: "Event-driven network automation",
      body: (
        <>
          <p>
            Many networking events can drive automation: CloudWatch alarm state changes, AWS Config
            rule non-compliance, CloudTrail API events (for example someone opens a security group to
            0.0.0.0/0), Health Dashboard events, Network Manager topology and route changes, and
            scheduled rules. <strong>EventBridge</strong> routes them to targets: Lambda, Step
            Functions, SNS, SQS, Systems Manager Automation.
          </p>
          <CloudDiagram course="aws-ans-c01" id="network-automation-iac-diagram-1" />
          <ul>
            <li><strong>Config rules with auto-remediation</strong> (for example <code>restricted-ssh</code>, <code>vpc-flow-logs-enabled</code>, <code>vpc-default-security-group-closed</code>) run SSM Automation documents.</li>
            <li><strong>Failover helpers:</strong> a Lambda triggered by a CloudWatch alarm can update a route table to point to a standby NAT instance or firewall.</li>
            <li><strong>Account vending:</strong> Control Tower Account Factory (or Customizations) deploys the baseline network stack into every new account.</li>
          </ul>
        </>
      ),
    },
    {
      id: "optimize",
      title: "Automation for cost and hygiene",
      body: (
        <>
          <CloudDiagram course="aws-ans-c01" id="network-automation-iac-diagram-2" />
          <Callout tone="tip" title="Hybrid automation">
            Keep network desired state in version control. Use the same pipeline to push AWS
            resources (CloudFormation/CDK) and on-premises router configuration (for example
            Ansible), and generate the VPN customer gateway configuration from the AWS API so the two
            ends cannot drift.
          </Callout>
          <Exercise
            title="Make it reusable"
            task={<p>A template creates a VPC in us-east-1 with AZs us-east-1a and us-east-1b and CIDR 10.0.0.0/16. The team wants it deployed to 12 Regions and 30 accounts without conflicts. What changes?</p>}
          >
            <p>
              Parameterize the CIDR (or draw from IPAM per account/Region), replace hard-coded AZs
              with <code>Fn::GetAZs</code>/<code>Select</code>, use pseudo parameters instead of IDs or
              Regions, read shared IDs (such as the TGW ID) from SSM parameters, and deploy with
              <strong> StackSets</strong> (service-managed permissions with Organizations). Preview
              with change sets and gate in a pipeline.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Use CloudFormation or CDK for repeatable, reviewable network stacks; StackSets scale them across accounts and Regions.",
    "Avoid hard-coded AZs, CIDRs, IDs, Regions, account IDs and secrets; use parameters, GetAZs, Cidr, SSM and Secrets Manager.",
    "EventBridge connects CloudTrail, Config, CloudWatch and Network Manager events to Lambda and SSM Automation for self-healing and guardrails.",
    "Automate verification and cost cleanup, and keep on-premises and AWS configs generated from one source.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which intrinsic function carves subnets from a VPC CIDR in CloudFormation?",
      options: ["Fn::Cidr", "Fn::Join", "Fn::Base64", "Fn::Sub"],
      answer: 0,
      explain: "Fn::Cidr returns an array of CIDR blocks, typically used with Fn::Select.",
    },
    {
      kind: "mcq",
      q: "What is a problem with hard-coding us-east-1a in a reusable template?",
      options: [
        "AZ availability and mapping differ per account",
        "It increases cost",
        "It disables flow logs",
        "It breaks IAM",
      ],
      answer: 0,
      explain: "AZ names map to different physical zones and not every AZ is available to every account.",
    },
    {
      kind: "mcq",
      q: "Which service deploys the same stack to many accounts and Regions?",
      options: ["CloudFormation StackSets", "AWS Config", "Route 53", "CloudTrail"],
      answer: 0,
      explain: "StackSets deploy and manage stacks across accounts and Regions.",
    },
    {
      kind: "mcq",
      q: "A security group is opened to 0.0.0.0/0 on port 22. Which pattern automatically fixes it?",
      options: [
        "EventBridge rule on the API event invoking Lambda or SSM Automation to revoke the rule",
        "A CloudFront function",
        "A larger NAT gateway",
        "A Route 53 health check",
      ],
      answer: 0,
      explain: "Event-driven remediation reacts to the API call and reverts or escalates.",
    },
    {
      kind: "text",
      q: "Which service stores shared values such as a Transit Gateway ID so templates can read them at deploy time? (name)",
      format: "**** ***** *****",
      accept: ["ssm parameter store", "parameter store", "systems manager parameter store", "ssm"],
      explain: "Systems Manager Parameter Store holds shared values referenced by dynamic references.",
    },
  ],
};
