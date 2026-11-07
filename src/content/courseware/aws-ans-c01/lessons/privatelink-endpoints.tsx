import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Distinguish gateway endpoints, interface endpoints and Gateway Load Balancer endpoints",
    "Publish your own service with an endpoint service backed by an NLB",
    "Use private DNS, endpoint policies and security groups to control access",
    "Reach AWS services privately from on-premises and from other VPCs",
    "Choose between PrivateLink, peering and Transit Gateway for private application connectivity",
  ],
  tasks: [
    {
      id: "types",
      title: "Three endpoint types",
      body: (
        <>
          <Table
            head={["", "Gateway endpoint", "Interface endpoint", "GWLB endpoint"]}
            rows={[
              ["Services", "Amazon S3 and DynamoDB only", "Most AWS services, your own and partner services (PrivateLink)", "Gateway Load Balancer endpoint services (appliances)"],
              ["How it works", "A prefix-list route in the route table", "One or more ENIs with private IPs in your subnets", "ENI that is a next hop in route tables"],
              ["Cost", "Free", "Per endpoint-hour per AZ plus per-GB", "Per endpoint-hour plus per-GB"],
              ["Security", "Endpoint policy; S3 bucket policy with aws:SourceVpce", "Security group, endpoint policy", "No SG; appliance side controls"],
              ["From on-premises / peered VPC / TGW", "No (route is local to the VPC)", "Yes (private IPs are routable)", "Yes, via route tables"],
              ["Private DNS", "Not used (prefix list)", "Optional private DNS name overrides the public service name", "N/A"],
            ]}
          />
          <Figure caption="Gateway endpoint adds a route; interface endpoint adds an ENI. Only the interface endpoint is reachable from outside the VPC.">
            <Graph
              label="Gateway endpoint for S3 via route table versus interface endpoint ENI for another service"
              cellW={200}
              cellH={100}
              nodeW={170}
              nodes={[
                { id: "ec2", label: "Private subnet instance", col: 0, row: 0.5, tone: "sky" },
                { id: "gw", label: "Gateway endpoint", sub: "pl-xxxx → S3 route", col: 1, row: 0, tone: "lime" },
                { id: "if", label: "Interface endpoint ENI", sub: "10.0.2.14, SG", col: 1, row: 1, tone: "amber" },
                { id: "s3", label: "Amazon S3", col: 2, row: 0, tone: "plain", shape: "db" },
                { id: "svc", label: "AWS service / PrivateLink service", col: 2, row: 1, tone: "plain" },
              ]}
              edges={[
                { from: "ec2", to: "gw" },
                { from: "ec2", to: "if" },
                { from: "gw", to: "s3" },
                { from: "if", to: "svc" },
              ]}
            />
          </Figure>
          <Callout tone="tip" title="S3 from on-premises">
            A gateway endpoint cannot be reached from on-premises. To use private connectivity to S3
            from a data center, create an S3 <strong>interface endpoint</strong> and resolve its
            endpoint-specific DNS names (through a Route 53 inbound endpoint) so traffic flows over
            Direct Connect or VPN to the ENI. You can use both endpoint types together.
          </Callout>
        </>
      ),
    },
    {
      id: "service",
      title: "Publishing your own service",
      body: (
        <>
          <p>
            To offer a service privately, put it behind a <strong>Network Load Balancer</strong> (or
            Gateway Load Balancer), then create a <strong>VPC endpoint service</strong>. Consumers
            create an interface endpoint to your service name. Traffic is one-way: consumers initiate
            connections; the provider cannot reach into the consumer VPC.
          </p>
          <ul>
            <li><strong>Acceptance:</strong> require manual acceptance of connection requests, and restrict by <em>allowed principals</em> (account, role or user ARNs).</li>
            <li><strong>Private DNS name:</strong> verify domain ownership so consumers can use a friendly name (for example <code>api.provider.example</code>).</li>
            <li><strong>Availability:</strong> an endpoint service is available in the AZs where its NLB has nodes; consumers should create endpoint ENIs in the same AZs. Cross-Region PrivateLink lets interface endpoints reach services hosted in another Region.</li>
            <li><strong>Source IP:</strong> the provider sees NLB or endpoint addresses; enable proxy protocol v2 to learn the consumer&apos;s VPC endpoint ID and original source.</li>
            <li><strong>Overlapping CIDRs:</strong> irrelevant, because the consumer addresses an ENI in its own range.</li>
          </ul>
          <Figure caption="PrivateLink provider and consumer. Many consumer VPCs reach one NLB-backed service without exposing the provider network.">
            <Graph
              label="Consumer VPCs reach a provider service through interface endpoints connected to an endpoint service backed by an NLB"
              cellW={200}
              cellH={100}
              nodeW={170}
              nodes={[
                { id: "c1", label: "Consumer VPC 1", sub: "interface endpoint", col: 0, row: 0, tone: "sky" },
                { id: "c2", label: "Consumer VPC 2", sub: "interface endpoint", col: 0, row: 1, tone: "sky" },
                { id: "es", label: "Endpoint service", sub: "allowed principals", col: 1, row: 0.5, tone: "amber" },
                { id: "nlb", label: "NLB", col: 2, row: 0.5, tone: "lime" },
                { id: "app", label: "Service targets", col: 3, row: 0.5, tone: "plain" },
              ]}
              edges={[
                { from: "c1", to: "es" },
                { from: "c2", to: "es" },
                { from: "es", to: "nlb" },
                { from: "nlb", to: "app" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "policy",
      title: "Controlling access",
      body: (
        <>
          <ul>
            <li><strong>Endpoint policies</strong> are IAM resource policies on an endpoint that limit which principals and resources can be used through it (for example only specific S3 buckets).</li>
            <li><strong>S3 bucket policies</strong> can require <code>aws:SourceVpce</code> or <code>aws:SourceVpc</code> so a bucket is reachable only through your endpoint.</li>
            <li><strong>Security groups</strong> on interface endpoints restrict which sources can connect (for example HTTPS 443 from app subnets).</li>
            <li><strong>Private DNS</strong> for AWS-service endpoints makes the standard service hostname resolve to endpoint ENI IPs inside the VPC; it needs <code>enableDnsSupport</code> and <code>enableDnsHostnames</code>.</li>
            <li>In a centralized design, create the endpoints in a shared VPC and share the private DNS across spokes with a private hosted zone (or Route 53 Profiles).</li>
          </ul>
          <Exercise
            title="Which access method?"
            task={<p>A SaaS vendor must let 200 customer accounts call its API privately. Customers use overlapping 10.0.0.0/16 ranges. The vendor must not have network access into customer VPCs. What do they build?</p>}
          >
            <p>
              A <strong>PrivateLink endpoint service</strong> backed by an NLB in front of the API.
              Customers create interface endpoints; the vendor restricts <em>allowed principals</em>{" "}
              to onboarded accounts. Overlap is irrelevant because consumers connect to an ENI in
              their own range, and connectivity is unidirectional, so the vendor has no path into
              customer networks. Peering and Transit Gateway both fail due to overlap and exposure.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Gateway endpoints (S3, DynamoDB) are free route-based and local to the VPC; interface endpoints are ENIs reachable from on-premises and peers.",
    "Publish a service with an NLB-backed endpoint service; connectivity is one-way and overlap-tolerant.",
    "Control access with endpoint policies, bucket policies using aws:SourceVpce, and security groups.",
    "Private DNS lets default service names resolve to endpoint ENIs inside the VPC.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which endpoint type is free and uses a route table entry?",
      options: ["Gateway endpoint", "Interface endpoint", "GWLB endpoint", "NAT gateway"],
      answer: 0,
      explain: "Gateway endpoints for S3 and DynamoDB add a prefix list route and have no hourly charge.",
    },
    {
      kind: "mcq",
      q: "On-premises servers must reach S3 privately over Direct Connect. What is required?",
      options: ["An S3 interface endpoint", "A gateway endpoint", "An internet gateway", "A NAT gateway"],
      answer: 0,
      explain: "Only interface endpoints have private IPs reachable from outside the VPC.",
    },
    {
      kind: "mcq",
      q: "What must back a PrivateLink endpoint service for a general application?",
      options: ["Network Load Balancer", "Application Load Balancer", "Classic Load Balancer", "CloudFront"],
      answer: 0,
      explain: "Endpoint services are backed by an NLB (or Gateway Load Balancer).",
    },
    {
      kind: "mcq",
      q: "Which condition key restricts an S3 bucket to a specific VPC endpoint?",
      options: ["aws:SourceVpce", "aws:SecureTransport", "aws:MultiFactorAuthPresent", "aws:PrincipalOrgID"],
      answer: 0,
      explain: "aws:SourceVpce matches the endpoint ID used for the request.",
    },
    {
      kind: "text",
      q: "Which header-less technique passes the original client connection details to the target behind an NLB?",
      format: "***** ******** **",
      accept: ["proxy protocol v2", "proxy protocol", "proxy protocol version 2"],
      explain: "Enable proxy protocol v2 to forward source and endpoint information.",
    },
  ],
};
