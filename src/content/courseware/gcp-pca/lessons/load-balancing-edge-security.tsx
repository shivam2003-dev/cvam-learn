import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Select the right Cloud Load Balancing product from traffic type, scope and exposure",
    "Configure backend services, health checks, NEGs and URL maps",
    "Use Cloud CDN, Cloud Armor, IAP and managed certificates at the edge",
    "Design internal, hybrid and multi-region load balancing",
  ],
  tasks: [
    {
      id: "select",
      title: "Choosing a load balancer",
      body: (
        <>
          <p>
            Cloud Load Balancing is software-defined, with no pre-warming. Choose by{" "}
            <strong>layer</strong> (HTTP(S) application versus TCP/UDP network), <strong>scope</strong>{" "}
            (global versus regional), <strong>exposure</strong> (external versus internal), and{" "}
            <strong>proxy versus passthrough</strong>.
          </p>
          <Table
            head={["Load balancer", "Layer / protocol", "Scope", "Use"]}
            rows={[
              ["Global external Application LB", "L7 HTTP/HTTPS/HTTP2/gRPC", "Global, anycast IP (Premium Tier)", "Internet web apps and APIs across regions, CDN, Cloud Armor, IAP"],
              ["Regional external Application LB", "L7", "Regional (Standard Tier option)", "Regional apps, data residency, Standard Tier cost"],
              ["Internal Application LB", "L7", "Regional (and cross-region variant)", "Private microservices, internal APIs over RFC1918"],
              ["External proxy Network LB", "L4 TCP (SSL proxy)", "Global or regional", "Non-HTTP TCP with SSL offload"],
              ["Internal proxy Network LB", "L4 TCP", "Regional/cross-region", "Internal TCP services with proxying"],
              ["External passthrough Network LB", "L4 TCP/UDP/ESP/ICMP, preserves client IP", "Regional", "UDP, VoIP, gaming, client IP preservation"],
              ["Internal passthrough Network LB", "L4", "Regional", "Internal TCP/UDP, next hop for appliances"],
            ]}
          />
          <CloudDiagram course="gcp-pca" id="load-balancing-edge-security-diagram-1" />
        </>
      ),
    },
    {
      id: "config",
      title: "Configuration building blocks",
      body: (
        <>
          <ul>
            <li><strong>Backend services</strong> group backends (instance groups or <strong>network endpoint groups</strong>: zonal, serverless, internet, hybrid/on-premises, Private Service Connect) with a balancing mode (utilisation, rate, connections), capacity scaler and health checks.</li>
            <li><strong>Health checks</strong> must be allowed by firewall rules from Google health-check ranges (130.211.0.0/22 and 35.191.0.0/16, plus proxy-only subnets for envoy-based balancers).</li>
            <li><strong>URL maps</strong> route by host and path to backend services or buckets; support redirects, rewrites, header actions and weighted traffic splitting for canaries.</li>
            <li><strong>Certificates:</strong> Google-managed certificates or Certificate Manager; TLS policies set minimum versions; backend encryption with HTTPS to backends.</li>
            <li><strong>Session affinity, connection draining, outlier detection, failover policies</strong> tune behaviour.</li>
            <li><strong>Serverless:</strong> Cloud Run, functions and App Engine sit behind the load balancer through serverless NEGs, which also enables Cloud Armor, CDN and custom domains.</li>
            <li><strong>Hybrid:</strong> hybrid NEGs add on-premises or other-cloud endpoints reachable over Interconnect/VPN.</li>
          </ul>
        </>
      ),
    },
    {
      id: "edge",
      title: "Edge protection and access",
      body: (
        <>
          <Table
            head={["Service", "Purpose", "Key points"]}
            rows={[
              ["Cloud CDN", "Cache content at Google edge locations", "Enable on a backend service or bucket; cache modes, TTLs, signed URLs/cookies, cache invalidation"],
              ["Cloud Armor", "WAF and DDoS defence for external ALB / proxy NLB", "Security policies with preconfigured WAF rules (OWASP), rate limiting, geo/IP rules, bot management, Adaptive Protection; Enterprise tier adds advanced DDoS features"],
              ["Identity-Aware Proxy (IAP)", "Authenticate and authorise users at the load balancer using identity and context instead of a VPN", "Per-application IAM access; also TCP forwarding for SSH/RDP"],
              ["Cloud DNS", "Authoritative DNS with routing policies (geo, weighted, failover)", "Public and private zones, DNSSEC"],
              ["Cloud NAT", "Outbound NAT for private resources", "Not for inbound"],
              ["Cloud IDS / NGFW", "Intrusion detection and next-generation firewall", "Packet-mirror based IDS; FQDN and threat intelligence rules"],
            ]}
          />
          <Callout tone="tip" title="Typical secure web tier">
            Global external Application LB with a Google-managed certificate, Cloud Armor policy and
            Cloud CDN for static paths, serverless NEG or private backends (no external IPs on
            backends), IAP for admin apps, and firewall rules allowing only the load balancer and
            health check ranges.
          </Callout>
          <Exercise
            title="Pick the balancer"
            task={<p>(a) A global ecommerce site with CDN and WAF. (b) An internal microservices API reachable only inside the VPC and from on-premises over Interconnect. (c) A UDP game server needing the original client IP. Which load balancers?</p>}
          >
            <p>
              (a) <strong>Global external Application Load Balancer</strong> with Cloud CDN and Cloud
              Armor. (b) <strong>Internal Application Load Balancer</strong> (regional or cross-region),
              which on-premises clients reach via the internal IP across the hybrid link. (c){" "}
              <strong>External passthrough Network Load Balancer</strong> (UDP, preserves client IP).
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Select by layer, scope, exposure and proxy vs passthrough: global external ALB for web, internal ALB for private APIs, passthrough NLB for UDP and client IP.",
    "Backend services, NEGs, health checks (with firewall allowances), URL maps and certificates are the core objects.",
    "Cloud CDN, Cloud Armor, IAP and managed certificates add edge performance and security; serverless NEGs bring Cloud Run behind the same controls.",
    "Hybrid NEGs extend load balancing to on-premises and other clouds.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which load balancer provides a single global anycast IP for HTTP(S) traffic?",
      options: ["Global external Application Load Balancer", "Internal passthrough Network Load Balancer", "Regional external passthrough NLB", "Cloud NAT"],
      answer: 0,
      explain: "The global external ALB uses an anycast IP in Premium Tier.",
    },
    {
      kind: "mcq",
      q: "A backend shows unhealthy though the app is fine. What is a likely cause?",
      options: ["Firewall blocks Google health check ranges", "Wrong certificate", "Missing Cloud CDN", "Too many NEGs"],
      answer: 0,
      explain: "Health checks come from Google ranges that must be allowed by firewall rules.",
    },
    {
      kind: "mcq",
      q: "Which service provides WAF rules and rate limiting for external load balancers?",
      options: ["Cloud Armor", "Cloud NAT", "Cloud Router", "Cloud DNS"],
      answer: 0,
      explain: "Cloud Armor attaches security policies to backend services.",
    },
    {
      kind: "mcq",
      q: "How do you put a Cloud Run service behind a global load balancer?",
      options: ["Serverless network endpoint group", "Instance group", "Hybrid NEG", "Cloud VPN"],
      answer: 0,
      explain: "Serverless NEGs let load balancers route to Cloud Run, functions and App Engine.",
    },
    {
      kind: "text",
      q: "Which service authenticates users at the application layer instead of requiring a VPN? (acronym)",
      format: "***",
      accept: ["iap", "identity-aware proxy", "identity aware proxy"],
      explain: "Identity-Aware Proxy enforces identity and context-aware access to applications.",
    },
  ],
};
