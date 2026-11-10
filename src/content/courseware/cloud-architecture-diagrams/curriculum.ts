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
      blurb: "The building blocks every cloud diagram starts from.",
      lessons: [
        { slug: "three-tier-web-app", title: "Three-Tier Web Application", summary: "Build a highly available web, app and database stack step by step, on any of the four clouds." },
        { slug: "network-and-subnet-design", title: "Network and Subnet Design", summary: "CIDR planning, public versus private subnets, route tables and NAT." },
        { slug: "multi-region-failover", title: "Multi-Region Active/Passive Failover", summary: "DNS failover, cross-region replication and recovery objectives." },
      ],
    },
    {
      id: "app-platforms",
      title: "Application Platforms",
      blurb: "Serverless, containers and multi-tenant SaaS.",
      lessons: [
        { slug: "serverless-api", title: "Serverless REST API", summary: "API gateway, authentication, functions, a NoSQL table and an async queue." },
        { slug: "container-platform", title: "Containers on Managed Kubernetes", summary: "Registry, cluster, ingress, autoscaling and private data access." },
        { slug: "saas-multitenant", title: "Multi-Tenant SaaS Platform", summary: "Tenant isolation, a shared control plane and per-tenant data." },
      ],
    },
    {
      id: "data-architecture",
      title: "Data and Event Architecture",
      blurb: "Events, lakes, warehouses and device telemetry.",
      lessons: [
        { slug: "event-driven-pipeline", title: "Event-Driven Order Processing", summary: "Topics, queues, idempotent consumers and dead-letter handling." },
        { slug: "data-lake-analytics", title: "Data Lake and Analytics Platform", summary: "Ingest, store, transform, catalogue, query and visualise." },
        { slug: "iot-telemetry", title: "IoT Telemetry Pipeline", summary: "Devices, secure ingestion, stream processing, hot and cold storage." },
      ],
    },
    {
      id: "devops",
      title: "DevOps and Delivery",
      blurb: "From commit to production, safely.",
      lessons: [
        { slug: "cicd-pipeline", title: "CI/CD Pipeline with Environments", summary: "Source, build, scan, artifact, staged deployment and rollback." },
        { slug: "observability-stack", title: "Logging, Metrics and Alerting", summary: "What to collect, where it goes and who gets paged." },
      ],
    },
    {
      id: "security",
      title: "Security and Network Architecture",
      blurb: "Defence in depth, zero trust and hybrid connectivity.",
      lessons: [
        { slug: "secure-perimeter", title: "Defence in Depth: Secure Web Perimeter", summary: "DDoS, WAF, private back ends, key management, secrets and threat detection." },
        { slug: "hub-and-spoke", title: "Hub-and-Spoke Network with Central Inspection", summary: "Shared services, transit routing, a firewall hub and on-premises links." },
        { slug: "identity-and-access", title: "Identity and Least Privilege", summary: "Roles, service identities and guardrails." },
      ],
    },
    {
      id: "industry",
      title: "Industry Reference Architectures",
      blurb: "Complete designs for the products teams actually ship.",
      lessons: [
        { slug: "ecommerce-platform", title: "E-Commerce Platform", summary: "CDN, search, cart, checkout, payments and order events at peak traffic." },
        { slug: "fintech-payments", title: "Fintech Payments (PCI-Aware)", summary: "Isolating the cardholder environment, tokenisation, HSM-backed keys and audit." },
        { slug: "healthcare-data-platform", title: "Healthcare Data Platform (HIPAA-Aware)", summary: "Protected health information, de-identification, access control and audit." },
        { slug: "media-streaming", title: "Video Streaming Platform", summary: "Upload, transcode, package, protect and deliver video through a CDN." },
        { slug: "gaming-backend", title: "Multiplayer Game Backend", summary: "Matchmaking, a dedicated server fleet, leaderboards and live telemetry." },
        { slug: "logistics-tracking", title: "Real-Time Logistics and Dispatch", summary: "Live location streaming, geo-indexed matching and order handling." },
      ],
    },
  ],
};
