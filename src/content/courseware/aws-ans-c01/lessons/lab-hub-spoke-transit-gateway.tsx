import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 60,
  difficulty: "Hard",
  objectives: [
    "Build three VPCs connected through a Transit Gateway with separate route tables",
    "Verify segmentation: spokes reach shared services but not each other",
    "Test connectivity with Systems Manager, Reachability Analyzer and flow logs",
    "Troubleshoot an intentionally missing route",
    "Clean up every billable resource",
  ],
  tasks: [
    {
      id: "scenario",
      title: "What you will build",
      body: (
        <>
          <p>
            You will create a hub-and-spoke network in one Region: a <strong>shared services
            VPC</strong> and two spoke VPCs (<strong>app-a</strong> and <strong>app-b</strong>)
            attached to one Transit Gateway. Segmentation requirement: both spokes can reach shared
            services, but <strong>app-a and app-b cannot reach each other</strong>.
          </p>
          <CloudDiagram course="aws-ans-c01" id="lab-hub-spoke-transit-gateway-diagram-1" />
          <Callout tone="warn" title="Cost and safety">
            A Transit Gateway bills per attachment-hour and per GB. Three attachments for a couple of
            hours cost cents to a dollar or two, but forgotten resources keep billing. Use a sandbox
            account, set a budget alert, and complete the cleanup task. Replace Region and IDs below with yours.
          </Callout>
        </>
      ),
    },
    {
      id: "build",
      title: "Build the network",
      body: (
        <>
          <CloudDiagram course="aws-ans-c01" id="lab-hub-spoke-transit-gateway-diagram-2" />
          <p>1. Create VPCs and subnets (repeat with 10.1.0.0/16 and 10.2.0.0/16):</p>
          <pre>
            <code>{`aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=shared}]'
aws ec2 create-subnet --vpc-id vpc-SHARED --cidr-block 10.0.1.0/24 --availability-zone-id use1-az1`}</code>
          </pre>
          <p>2. Create the Transit Gateway with default tables disabled so you control routing:</p>
          <pre>
            <code>{`aws ec2 create-transit-gateway \\
  --options AmazonSideAsn=64512,DefaultRouteTableAssociation=disable,DefaultRouteTablePropagation=disable
aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id tgw-XXXX \\
  --vpc-id vpc-SHARED --subnet-ids subnet-SHARED   # repeat for app-a, app-b`}</code>
          </pre>
          <p>3. Create three route tables, associate and propagate:</p>
          <pre>
            <code>{`aws ec2 create-transit-gateway-route-table --transit-gateway-id tgw-XXXX   # RT-A, RT-B, RT-Shared
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id tgw-rtb-A --transit-gateway-attachment-id tgw-attach-A
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id tgw-rtb-B --transit-gateway-attachment-id tgw-attach-B
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id tgw-rtb-S --transit-gateway-attachment-id tgw-attach-S
# Spokes learn the shared VPC; shared learns both spokes
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id tgw-rtb-A --transit-gateway-attachment-id tgw-attach-S
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id tgw-rtb-B --transit-gateway-attachment-id tgw-attach-S
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id tgw-rtb-S --transit-gateway-attachment-id tgw-attach-A
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id tgw-rtb-S --transit-gateway-attachment-id tgw-attach-B`}</code>
          </pre>
          <p>4. Add VPC routes. In app-a and app-b route tables, send <code>10.0.0.0/16</code> to the TGW. In the shared VPC route table, send <code>10.1.0.0/16</code> and <code>10.2.0.0/16</code> to the TGW.</p>
          <Table
            head={["Resource", "Setting"]}
            rows={[
              ["Instances", "One small instance per VPC using the Amazon Linux AMI with the SSM agent role (no SSH, no public IP)"],
              ["Security groups", "Allow ICMP and TCP 80 from 10.0.0.0/8 (lab only)"],
              ["SSM endpoints", "Interface endpoints for ssm, ssmmessages, ec2messages in each VPC (or a NAT gateway), so Session Manager works without internet"],
            ]}
          />
        </>
      ),
    },
    {
      id: "verify",
      title: "Verify segmentation",
      body: (
        <>
          <ol>
            <li>Start a Session Manager session on the app-a instance and run <code>ping 10.0.1.X</code> (shared). Expect replies.</li>
            <li>From app-a ping the app-b instance. Expect <strong>no reply</strong>, because RT-A has no route to 10.2.0.0/16.</li>
            <li>Run <strong>Reachability Analyzer</strong> from the app-a ENI to the app-b ENI and from app-a to shared. The first should report not reachable at the TGW route table; the second reachable.</li>
            <li>Use <strong>TGW Route Analyzer</strong> on RT-A for destination 10.2.0.0/16: no route. For 10.0.0.0/16: route via the shared attachment.</li>
            <li>Enable <strong>VPC Flow Logs</strong> to CloudWatch Logs on the shared VPC and watch the ICMP records.</li>
          </ol>
          <Exercise
            title="Break and fix"
            task={<p>Delete the route <code>10.0.0.0/16 → TGW</code> from the app-b VPC route table. Predict what Reachability Analyzer says about app-b to shared, and what appears in flow logs. Then restore it.</p>}
          >
            <p>
              Reachability Analyzer reports <em>not reachable</em> with the explanation that the
              route table of the app-b subnet has no route to the destination. Flow logs on shared will
              show no packets from app-b (traffic never leaves the instance&apos;s subnet toward the
              TGW), so there are no REJECT records. Restoring the route turns the analysis to
              reachable again. This shows why missing routes appear as silence, not rejections.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "cleanup",
      title: "Clean up",
      body: (
        <>
          <ol>
            <li>Terminate the three instances.</li>
            <li>Delete the TGW route table associations, then route tables; delete the three VPC attachments and wait until they are <code>deleted</code>.</li>
            <li>Delete the Transit Gateway.</li>
            <li>Delete interface endpoints, NAT gateways (if used), subnets and VPCs.</li>
            <li>Delete flow log groups and any S3 buckets created.</li>
          </ol>
          <Callout tone="tip" title="Extend the lab">
            Add a Network Firewall in an inspection VPC with appliance mode, route spoke traffic
            through it, then peer a second Transit Gateway in another Region with static routes.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Disable default TGW association and propagation to control segmentation explicitly.",
    "Each spoke needs a VPC route to the TGW and a TGW route table entry (by propagation or static) back to it.",
    "Missing routes produce silence and no REJECT flow log; Reachability Analyzer names the missing hop.",
    "Always clean up attachments before deleting the Transit Gateway.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why create the TGW with DefaultRouteTableAssociation=disable?",
      options: ["To control which route table each attachment uses", "To save cost", "To enable multicast", "To enable DNS"],
      answer: 0,
      explain: "Disabling defaults lets you associate attachments with specific route tables for segmentation.",
    },
    {
      kind: "mcq",
      q: "App-a and app-b must not reach each other. Which is true in the lab design?",
      options: ["Neither RT-A nor RT-B contains a route to the other spoke", "Security groups block them", "The shared VPC blocks them", "Peering is disabled"],
      answer: 0,
      explain: "Selective propagation means each spoke's table only learns the shared VPC.",
    },
    {
      kind: "mcq",
      q: "A missing VPC route produces what flow log evidence on the destination?",
      options: ["Nothing; the packets never arrive", "ACCEPT records", "REJECT records", "DNS errors"],
      answer: 0,
      explain: "Without a route the traffic is dropped at the source and never reaches the destination VPC.",
    },
    {
      kind: "mcq",
      q: "Which must be deleted first when removing a Transit Gateway?",
      options: ["Its attachments", "Its Amazon-side ASN", "The AWS account", "CloudTrail"],
      answer: 0,
      explain: "A Transit Gateway cannot be deleted while attachments exist.",
    },
    {
      kind: "text",
      q: "Which tool statically analyzes a path between two ENIs without sending traffic?",
      format: "************ ********",
      accept: ["reachability analyzer", "vpc reachability analyzer"],
      explain: "VPC Reachability Analyzer models the path from configuration.",
    },
  ],
};
