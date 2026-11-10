import type { Course } from "@/lib/types";

/**
 * Hands-on architecture-diagram course. Every lesson builds a real reference
 * architecture one layer at a time, and the reader can flip the whole page
 * between AWS, Azure, Google Cloud and OCI with one click.
 */
export const cloudArchitectureDiagrams: Course = {
  slug: "cloud-architecture-diagrams",
  title: "Cloud Architecture Diagrams: AWS, Azure, GCP and OCI",
  tagline:
    "Build professional reference architectures one layer at a time, then switch cloud provider in one click to compare the same design everywhere.",
  description:
    "Learn to read, draw and defend cloud architectures. Each lesson starts from an empty network and adds one layer per click: the network, zones, subnets, gateways, load balancers, compute, data and security, with the official-style icons for each provider. Switch between AWS, Azure, Google Cloud and Oracle Cloud at any step to see how the same pattern is named and built on each, and where the clouds genuinely differ.",
  level: "Beginner to Professional",
  skills: [
    "VPC / VNet / VCN design",
    "Three-tier web apps",
    "High availability",
    "Load balancing",
    "Serverless and containers",
    "Hybrid networking",
    "Multi-cloud comparison",
  ],
  modules: [
    {
      id: "foundations",
      title: "Foundations: Network, Zones and Subnets",
      blurb: "Learn the building blocks every cloud diagram starts from.",
      lessons: [
        { slug: "three-tier-web-app", title: "Three-Tier Web Application", summary: "Build a highly available web, app and database stack step by step, on any of the four clouds." },
        { slug: "network-and-subnet-design", title: "Network and Subnet Design", summary: "CIDR planning, public versus private subnets, route tables and NAT." },
        { slug: "traffic-rules-and-security", title: "Security Groups, Firewalls and NACLs", summary: "Who may talk to whom, and how each cloud expresses it." },
      ],
    },
    {
      id: "scale-resilience",
      title: "Scale and Resilience",
      blurb: "Patterns that keep working when a zone, a server or a region fails.",
      lessons: [
        { slug: "autoscaling-web-tier", title: "Autoscaling Web Tier with a CDN", summary: "CDN, WAF, load balancer and autoscaling groups." },
        { slug: "multi-region-failover", title: "Multi-Region Active/Passive Failover", summary: "DNS failover, cross-region replication and recovery objectives." },
        { slug: "database-high-availability", title: "Database High Availability and Replicas", summary: "Synchronous standby, read replicas and backups." },
      ],
    },
    {
      id: "modern-apps",
      title: "Serverless, Containers and Events",
      blurb: "Draw modern application architectures.",
      lessons: [
        { slug: "serverless-api", title: "Serverless REST API", summary: "API gateway, functions, a managed database and authentication." },
        { slug: "container-platform", title: "Containers on Kubernetes", summary: "Managed Kubernetes, ingress, registries and node pools." },
        { slug: "event-driven-pipeline", title: "Event-Driven Processing Pipeline", summary: "Queues, topics, stream processing and dead-letter handling." },
      ],
    },
    {
      id: "hybrid-enterprise",
      title: "Hybrid and Enterprise Architecture",
      blurb: "Connect clouds to offices and to each other.",
      lessons: [
        { slug: "hub-and-spoke", title: "Hub-and-Spoke Network", summary: "Shared services, transit routing and central inspection." },
        { slug: "hybrid-connectivity", title: "Hybrid Connectivity: VPN and Dedicated Links", summary: "Site-to-site VPN, Direct Connect, ExpressRoute, Interconnect and FastConnect." },
        { slug: "landing-zone", title: "Landing Zone and Account Structure", summary: "Organisations, accounts, subscriptions, projects and compartments." },
      ],
    },
    {
      id: "operate",
      title: "Operate, Secure and Optimise",
      blurb: "Observability, identity, cost and the review checklist.",
      lessons: [
        { slug: "observability-stack", title: "Logging, Metrics and Alerting", summary: "What to collect, where it goes and who gets paged." },
        { slug: "identity-and-access", title: "Identity and Least Privilege", summary: "Roles, service accounts, managed identities and policies." },
        { slug: "well-architected-review", title: "Architecture Review Checklist", summary: "Reliability, security, cost, performance and operations on every cloud." },
      ],
    },
  ],
};
