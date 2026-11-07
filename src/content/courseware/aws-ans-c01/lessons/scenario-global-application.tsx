import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Hard",
  objectives: [
    "Decompose a long scenario into requirements, constraints and success criteria",
    "Combine Route 53, CloudFront, Global Accelerator, WAF and load balancers into one design",
    "Eliminate wrong answers by naming the requirement each violates",
    "Justify trade-offs in cost, latency and operations",
  ],
  tasks: [
    {
      id: "brief",
      title: "The scenario",
      body: (
        <>
          <p>
            <strong>StreamCart</strong> runs a retail platform in us-east-1 and eu-west-1. The
            storefront (HTTPS) is served by ALBs. A real-time bidding API (TCP, custom port) is used
            by partners who can only allow-list fixed IP addresses. Requirements:
          </p>
          <ol>
            <li>Shoppers worldwide need low latency; EU shoppers&apos; personal data must be handled by the EU Region.</li>
            <li>Static assets rarely change; the origin must not be reachable except through the CDN.</li>
            <li>The partner API needs fixed IPs and failover between Regions in under a minute.</li>
            <li>Block SQL injection and request floods; encrypt all traffic in transit.</li>
            <li>Internal service names (<code>orders.internal.streamcart.example</code>) must resolve inside both Regions&apos; VPCs; data center DNS must resolve them too.</li>
            <li>Keep cost reasonable and operations simple.</li>
          </ol>
          <Callout tone="note" title="Method">
            For each requirement, name the AWS building block, then check that no block contradicts
            another. Write the reason next to each choice; on the exam, the reason is what separates
            the answer from the distractor.
          </Callout>
        </>
      ),
    },
    {
      id: "design",
      title: "A design that satisfies every requirement",
      body: (
        <>
          <Figure caption="Reference design. Storefront and API use different edge services because they have different protocol and addressing requirements.">
            <Graph
              label="StreamCart design: Route 53 geolocation to CloudFront and WAF for the storefront, Global Accelerator with static IPs for the partner API, ALBs in two Regions, and private DNS shared with on-premises"
              cellW={200}
              cellH={96}
              nodeW={170}
              nodes={[
                { id: "shop", label: "Shoppers", col: 0, row: 0, tone: "sky", shape: "pill" },
                { id: "part", label: "Partners", col: 0, row: 2, tone: "sky", shape: "pill" },
                { id: "r53", label: "Route 53", sub: "geolocation: EU → EU", col: 1, row: 0, tone: "lime" },
                { id: "cf", label: "CloudFront + WAF", sub: "OAC for S3 assets", col: 2, row: 0, tone: "lime" },
                { id: "ga", label: "Global Accelerator", sub: "2 static IPs, TCP port", col: 1, row: 2, tone: "amber" },
                { id: "us", label: "us-east-1", sub: "ALB + NLB + VPC", col: 3, row: 0, tone: "plain" },
                { id: "eu", label: "eu-west-1", sub: "ALB + NLB + VPC", col: 3, row: 2, tone: "plain" },
              ]}
              edges={[
                { from: "shop", to: "r53" },
                { from: "r53", to: "cf" },
                { from: "cf", to: "us", label: "origin groups" },
                { from: "part", to: "ga" },
                { from: "ga", to: "us", label: "dial 50%" },
                { from: "ga", to: "eu", label: "dial 50%" },
                { from: "cf", to: "eu" },
              ]}
            />
          </Figure>
          <Table
            head={["Requirement", "Choice", "Why"]}
            rows={[
              ["Global low latency, static assets", "CloudFront with S3 (OAC) and ALB origins", "Caching and backbone; S3 not public"],
              ["EU data in EU", "Route 53 geolocation (EU → EU records, default → latency) and separate EU stack", "Geolocation is deterministic; latency routing alone would not guarantee residency"],
              ["Origin only via CDN", "OAC for S3; CloudFront prefix list + secret header (or VPC origin) for ALB", "Prevents bypassing WAF"],
              ["Fixed IPs and fast failover for TCP API", "Global Accelerator with NLB endpoints in both Regions, health checks", "Static anycast IPs; failover does not wait for DNS TTL"],
              ["SQLi and floods", "AWS WAF managed rules and rate-based rule on CloudFront; Shield Advanced optional", "Layer 7 protection at the edge"],
              ["Encryption in transit", "HTTPS viewer and origin, ACM certs (us-east-1 for CloudFront), TLS policies, NLB TLS", "End to end"],
              ["Internal DNS across Regions and on-premises", "Private hosted zone associated with both VPCs; Resolver inbound endpoint for data center; outbound rules for corp domains; share via RAM/Profiles", "Hybrid DNS requirement"],
              ["Cost and operations", "Gateway endpoints for S3, CloudFormation/StackSets for both Regions, CloudWatch alarms", "Repeatable, cheaper egress"],
            ]}
          />
        </>
      ),
    },
    {
      id: "distractors",
      title: "Why the other answers lose",
      body: (
        <>
          <ul>
            <li><strong>&ldquo;Use Route 53 failover records for the partner API.&rdquo;</strong> Violates fixed IPs (the IPs change on failover) and sub-minute failover (DNS TTL and caching).</li>
            <li><strong>&ldquo;Use CloudFront for the TCP API.&rdquo;</strong> CloudFront handles HTTP(S) and WebSockets, not arbitrary TCP, and offers no static IPs.</li>
            <li><strong>&ldquo;Route 53 latency routing for EU residency.&rdquo;</strong> Latency picks the fastest Region, not the legally required one.</li>
            <li><strong>&ldquo;Make the S3 bucket public with a policy.&rdquo;</strong> Bypasses the CDN and WAF.</li>
            <li><strong>&ldquo;Associate the PHZ with only us-east-1&rdquo;</strong>: eu-west-1 clients would get NXDOMAIN or fail.</li>
          </ul>
          <Exercise
            title="Extend the design"
            task={<p>A new requirement arrives: the EU stack must have no inbound internet access to its ALB except via CloudFront, and spikes of 10x are expected during sales. What do you add?</p>}
          >
            <p>
              Convert the EU ALB to a <strong>CloudFront VPC origin</strong> (private subnet, no
              public IP) or restrict to the CloudFront prefix list plus a secret header; enable{" "}
              <strong>Auto Scaling</strong> with target tracking on ALB request count per target, and
              pre-plan ALB capacity with an <strong>LCU reservation</strong> or load-test warm-up for
              known events. Keep WAF rate limits tuned and consider Shield Advanced for DDoS cost
              protection during sales.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Split by protocol: CloudFront for HTTP(S) content, Global Accelerator for TCP/UDP and static IPs.",
    "Geolocation enforces residency; latency routing optimizes speed; use both in a nested structure when needed.",
    "Close bypass paths (OAC, VPC origin, prefix list) so WAF and caching cannot be skipped.",
    "Always verify hybrid DNS and encryption requirements; eliminate answers by naming the violated requirement.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Partners can only allow-list two IPs and need Region failover in under a minute for a TCP API. Best design?",
      options: ["Global Accelerator with NLB endpoints in two Regions", "Route 53 failover with ALIAS records", "CloudFront with two origins", "Two Elastic IPs on EC2 with a script"],
      answer: 0,
      explain: "Global Accelerator provides two static anycast IPs and health-based failover without DNS caching.",
    },
    {
      kind: "mcq",
      q: "EU users' data must stay in the EU Region. Which Route 53 policy ensures EU users are sent to EU endpoints?",
      options: ["Geolocation", "Latency", "Weighted", "Multivalue"],
      answer: 0,
      explain: "Geolocation maps users by location deterministically; latency is performance-based.",
    },
    {
      kind: "mcq",
      q: "How do you prevent clients from bypassing CloudFront and WAF to reach a public ALB?",
      options: ["CloudFront prefix list in the ALB security group plus a secret header check", "Rename the ALB", "Disable HTTPS", "Add a NAT gateway"],
      answer: 0,
      explain: "Restricting sources to CloudFront and validating a header blocks direct access.",
    },
    {
      kind: "mcq",
      q: "Internal DNS names in a private hosted zone must resolve in a second Region's VPC as well. What is needed?",
      options: ["Associate the PHZ with the second VPC", "Create a public zone", "Enable DNSSEC", "Create a CNAME at the apex"],
      answer: 0,
      explain: "A PHZ resolves only for associated VPCs; associate every VPC (including other Regions) that needs it.",
    },
    {
      kind: "text",
      q: "Which edge service gives static anycast IPs for a TCP application?",
      format: "****** ***********",
      accept: ["global accelerator", "aws global accelerator"],
      explain: "AWS Global Accelerator provides two static anycast IP addresses.",
    },
  ],
};
