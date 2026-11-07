import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Explain how AWS Global Accelerator uses anycast static IP addresses and the AWS backbone",
    "Configure listeners, endpoint groups, traffic dials and endpoint weights",
    "Compare Global Accelerator with CloudFront and with DNS-based routing",
    "Design multi-Region active/active and failover patterns",
  ],
  tasks: [
    {
      id: "what",
      title: "What Global Accelerator does",
      body: (
        <>
          <p>
            AWS Global Accelerator gives your application <strong>two static anycast IPv4
            addresses</strong> (and optionally two IPv6 addresses for a dual-stack accelerator). Those
            addresses are announced from many AWS edge locations. A client&apos;s traffic enters the
            nearest edge location and then travels on the AWS global network to the best healthy
            endpoint, instead of crossing many internet hops.
          </p>
          <CloudDiagram course="aws-ans-c01" id="global-accelerator-edge-diagram-1" />
          <p>Supported endpoints are Application Load Balancers, Network Load Balancers, EC2 instances and Elastic IP addresses. Global Accelerator continuously health-checks endpoints and shifts traffic away from unhealthy ones within seconds, without waiting for DNS TTLs to expire.</p>
        </>
      ),
    },
    {
      id: "control",
      title: "Controlling the traffic",
      body: (
        <>
          <Table
            head={["Control", "Level", "Purpose"]}
            rows={[
              ["Traffic dial", "Endpoint group (0 to 100%)", "Shift or drain a whole Region for blue/green, maintenance or cost"],
              ["Endpoint weight", "Endpoint (0 to 255)", "Split traffic between endpoints in one group"],
              ["Health checks", "Endpoint group", "TCP, HTTP or HTTPS checks for fast failover"],
              ["Client affinity", "Listener", "Source IP affinity keeps a client on one endpoint"],
              ["Client IP preservation", "Endpoint", "Back-end sees the real client IP (supported for ALB, EC2 and NLB endpoints in a VPC)"],
              ["BYOIP", "Accelerator", "Use your own IP range as the static addresses"],
            ]}
          />
          <p>
            The standard accelerator picks the endpoint for you by proximity and health. A{" "}
            <strong>custom routing accelerator</strong> instead maps a user to a <em>specific</em>{" "}
            EC2 instance and port in a VPC subnet, which suits multiplayer game sessions or VoIP where
            your application decides placement.
          </p>
          <Callout tone="tip" title="Why static IPs matter">
            Customers that firewall by IP, partners that allow-list your address, and clients with
            hard-coded IPs all prefer two stable addresses. They stay the same even when you add or
            remove Regions and load balancers behind them.
          </Callout>
        </>
      ),
    },
    {
      id: "compare",
      title: "Global Accelerator versus CloudFront versus DNS",
      body: (
        <>
          <Table
            head={["Need", "Best fit", "Why"]}
            rows={[
              ["Cache static or semi-static HTTP content close to users", "CloudFront", "Caching at edge; Global Accelerator does not cache"],
              ["Non-HTTP traffic (TCP/UDP: gaming, IoT, VoIP, MQTT)", "Global Accelerator", "Layer 4 proxy at the edge"],
              ["Static IP addresses for allow-listing", "Global Accelerator", "Two anycast IPs per accelerator"],
              ["Instant regional failover without DNS caching", "Global Accelerator", "Does not depend on client DNS TTL"],
              ["Cheap multi-Region distribution with health checks", "Route 53 routing policies", "DNS only, TTL-dependent failover"],
              ["HTTP edge logic, WAF at the edge, signed URLs", "CloudFront", "L7 features"],
            ]}
          />
          <p>
            They are not exclusive: a common pattern fronts a dynamic API with Global Accelerator
            (static IPs and fast failover) and serves assets through CloudFront. Global Accelerator
            can also front a CloudFront-less ALB to give an anchor IP, and an NLB can be the endpoint
            for a PrivateLink-backed service.
          </p>
          <Exercise
            title="Pick the service"
            task={<p>A fintech partner can only allow-list IP addresses. The API runs in two Regions behind ALBs and must fail over in under a minute without relying on DNS. Which service?</p>}
          >
            <p>
              Global Accelerator. It supplies two static anycast IPs the partner can allow-list, the
              endpoint groups hold the Regional ALBs, and health-check-driven failover shifts traffic
              without waiting on DNS caches. Route 53 failover would depend on TTLs and returns
              changing IPs; CloudFront has no static IPs.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "patterns",
      title: "Multi-Region patterns",
      body: (
        <>
          <ul>
            <li><strong>Active/active:</strong> two endpoint groups, dial 100% each; proximity routing sends users to the closest Region, and failover happens automatically.</li>
            <li><strong>Active/passive:</strong> dial the standby group to 0%. When the primary fails its health checks, traffic goes to remaining healthy groups (a group dialled to 0 is treated as drained, so manage the dial in your runbook or automation).</li>
            <li><strong>Blue/green:</strong> gradually raise the dial on the new Region while lowering the old one.</li>
            <li><strong>Security:</strong> Global Accelerator is protected by AWS Shield Standard; Shield Advanced adds more. Restrict endpoint security groups to the listener ports you need, and pair the accelerator with AWS WAF on the ALB for layer 7 filtering.</li>
          </ul>
          <Callout tone="warn" title="Stateful data still needs a plan">
            Global Accelerator moves packets, not data. Multi-Region active/active needs replicated
            data stores (for example Aurora global database or DynamoDB global tables) and a session
            strategy.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Global Accelerator provides two static anycast IPs and routes over the AWS backbone to healthy endpoints in the best Region.",
    "Traffic dials work per endpoint group, weights per endpoint; health-check failover does not depend on DNS TTLs.",
    "Choose CloudFront for caching and HTTP edge logic, Global Accelerator for TCP/UDP, static IPs and fast failover.",
    "Custom routing accelerators map users to specific EC2 instances and ports.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A customer requires static IP addresses for allow-listing and fast regional failover for a TCP application. Which service fits?",
      options: ["Global Accelerator", "CloudFront", "Route 53 weighted records", "Application Load Balancer alone"],
      answer: 0,
      explain: "Global Accelerator offers two anycast static IPs and health-based failover independent of DNS caching.",
    },
    {
      kind: "mcq",
      q: "Which control shifts a percentage of traffic away from an entire Region?",
      options: ["Traffic dial on the endpoint group", "Endpoint weight", "Client affinity", "Listener port range"],
      answer: 0,
      explain: "The traffic dial is configured on the endpoint group and ranges from 0 to 100 percent.",
    },
    {
      kind: "mcq",
      q: "Which statement about Global Accelerator and caching is correct?",
      options: [
        "It does not cache content; use CloudFront for caching",
        "It caches HTTP responses at edge",
        "It caches DNS only",
        "It replaces CloudFront for static sites",
      ],
      answer: 0,
      explain: "Global Accelerator is a network-layer proxy and has no content cache.",
    },
    {
      kind: "mcq",
      q: "Which is a valid Global Accelerator endpoint?",
      options: ["Network Load Balancer", "RDS instance", "S3 bucket", "Lambda function URL"],
      answer: 0,
      explain: "Endpoints are ALBs, NLBs, EC2 instances and Elastic IP addresses.",
    },
    {
      kind: "text",
      q: "How many static anycast IPv4 addresses does a standard accelerator provide?",
      format: "*",
      accept: ["2", "two"],
      explain: "Each accelerator gets two static anycast IPv4 addresses (and two IPv6 if dual-stack).",
    },
  ],
};
