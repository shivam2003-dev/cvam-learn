import type { Course } from "@/lib/types";

/**
 * Structure follows the current AWS Certified Advanced Networking - Specialty
 * (ANS-C01) exam guide: four domains weighted 30 / 26 / 20 / 24 percent, with
 * 16 task statements. Each chapter below maps to one or more task statements.
 */
export const ansC01: Course = {
  slug: "aws-ans-c01",
  title: "AWS Certified Advanced Networking - Specialty (ANS-C01)",
  tagline:
    "Design, implement, operate and secure AWS and hybrid networks at scale, mapped task by task to the current ANS-C01 exam guide.",
  description:
    "A full courseware for the AWS Advanced Networking Specialty exam. Every chapter maps to the official four domains: Network Design (30%), Network Implementation (26%), Network Management and Operation (20%) and Network Security, Compliance and Governance (24%). Learn edge services, Route 53 and hybrid DNS, load balancing, Direct Connect and VPN, BGP routing, Transit Gateway, PrivateLink, monitoring, automation, troubleshooting, security and encryption, then test yourself with scenarios, a hands-on lab and exam strategy.",
  level: "Advanced",
  skills: [
    "Direct Connect and VPN",
    "BGP routing",
    "Transit Gateway",
    "Route 53 and hybrid DNS",
    "Load balancing",
    "CloudFront and Global Accelerator",
    "Network security",
    "Troubleshooting",
  ],
  modules: [
    {
      id: "orientation",
      title: "Exam Blueprint and Networking Foundations",
      blurb: "Understand the exam format, the four domains and the fundamentals every question assumes.",
      lessons: [
        { slug: "ans-exam-overview", title: "ANS-C01 Exam Overview and Study Strategy", summary: "Format, domains, task statements, in-scope services and a study plan." },
        { slug: "network-foundations", title: "Networking Foundations for the Exam", summary: "OSI layers, CIDR, routing, BGP, MTU and how a VPC really forwards packets." },
      ],
    },
    {
      id: "edge-global",
      title: "Edge Networking and Global Traffic (Task 1.1)",
      blurb: "Optimize user performance and traffic management for global architectures.",
      lessons: [
        { slug: "cloudfront-design", title: "Amazon CloudFront Design Patterns", summary: "Origins, caching, security, private origins and integration with ALB, S3 and API Gateway." },
        { slug: "global-accelerator-edge", title: "AWS Global Accelerator and Global Traffic Management", summary: "Anycast IPs, endpoint groups, traffic dials and when to pick it over CloudFront." },
      ],
    },
    {
      id: "dns",
      title: "DNS on AWS (Tasks 1.2, 2.3)",
      blurb: "Design and implement public, private and hybrid DNS, including multi-account and multi-Region.",
      lessons: [
        { slug: "route53-public-private", title: "Route 53 Hosted Zones, Records and Registration", summary: "Public and private zones, alias records, delegation and domain registration." },
        { slug: "route53-routing-health", title: "Route 53 Routing Policies and Health Checks", summary: "Weighted, latency, failover, geolocation, geoproximity, IP-based and multivalue." },
        { slug: "hybrid-dns-resolver", title: "Hybrid and Multi-Account DNS with Resolver", summary: "Inbound and outbound endpoints, forwarding rules, RAM sharing and Route 53 Profiles." },
        { slug: "dnssec-dns-security", title: "DNSSEC, DNS Firewall and DNS Logging", summary: "Sign zones, validate answers, block bad domains and log every query." },
      ],
    },
    {
      id: "load-balancing",
      title: "Load Balancing (Task 1.3)",
      blurb: "Choose and configure load balancers for availability, scale and security.",
      lessons: [
        { slug: "elb-types-layers", title: "Elastic Load Balancing: ALB, NLB, GWLB and the OSI Layers", summary: "Layer 3, 4 and 7 behaviour and how to select the right type." },
        { slug: "elb-config-integration", title: "Load Balancer Configuration and Integrations", summary: "Target groups, TLS, proxy protocol, stickiness, auto scaling and the AWS Load Balancer Controller." },
      ],
    },
    {
      id: "hybrid",
      title: "Hybrid Connectivity (Tasks 1.5, 2.1)",
      blurb: "Design and implement Direct Connect, Site-to-Site VPN, BGP policy and SD-WAN integration.",
      lessons: [
        { slug: "direct-connect-design", title: "AWS Direct Connect: Design and Resiliency", summary: "Connection types, locations, LOA-CFA and the resiliency models." },
        { slug: "direct-connect-implementation", title: "Direct Connect: VIFs, Gateways and Layer 2 Details", summary: "Private, public and transit VIFs, Direct Connect gateway, LAG, MACsec and MTU." },
        { slug: "site-to-site-client-vpn", title: "Site-to-Site VPN and Client VPN", summary: "Tunnels, ECMP, accelerated VPN, private IP VPN and remote-user access." },
        { slug: "bgp-routing-policy", title: "BGP Routing and Traffic Engineering", summary: "Attributes, communities, prefix limits and active/passive versus load sharing." },
        { slug: "hybrid-sdwan-redundancy", title: "Redundant Hybrid Architectures and SD-WAN", summary: "Combining Direct Connect and VPN, Transit Gateway Connect and GRE overlays." },
      ],
    },
    {
      id: "multi-vpc",
      title: "Multi-VPC, Multi-Account and Multi-Region (Tasks 1.6, 2.2)",
      blurb: "Pick the right connectivity pattern and implement it across accounts and Regions.",
      lessons: [
        { slug: "vpc-design-addressing", title: "VPC Design, Addressing and Overlapping CIDRs", summary: "Subnets, secondary CIDRs, IPv6, NAT gateways and overlap strategies." },
        { slug: "vpc-peering-vs-tgw", title: "VPC Peering Compared with Transit Gateway", summary: "Limits, transitivity, cost and the decision table." },
        { slug: "transit-gateway-architectures", title: "Transit Gateway Architectures", summary: "Route tables, association and propagation, appliance mode, peering and multicast." },
        { slug: "privatelink-endpoints", title: "AWS PrivateLink and VPC Endpoints", summary: "Gateway and interface endpoints, endpoint services and endpoint policies." },
        { slug: "vpc-sharing-organizations", title: "VPC Sharing, Organizations and Resource Access Manager", summary: "Share subnets, Transit Gateways and rules across accounts." },
      ],
    },
    {
      id: "monitoring-automation",
      title: "Monitoring, Logging and Automation (Tasks 1.4, 2.4, 3.2)",
      blurb: "See the network, prove it works, and manage it as code.",
      lessons: [
        { slug: "network-monitoring-cloudwatch", title: "Network Monitoring with CloudWatch", summary: "Metrics, alarms, logs and baselines for each networking service." },
        { slug: "flow-logs-traffic-mirroring", title: "VPC Flow Logs and Traffic Mirroring", summary: "Fields, formats, destinations, limits and packet-level inspection." },
        { slug: "reachability-network-manager", title: "Reachability Analyzer, Network Manager and Route Analyzer", summary: "Prove connectivity intent and map global topology." },
        { slug: "network-automation-iac", title: "Network Automation and Infrastructure as Code", summary: "CloudFormation, CDK, event-driven automation and avoiding hard-coded values." },
      ],
    },
    {
      id: "operations",
      title: "Operations, Troubleshooting and Optimization (Tasks 3.1, 3.3)",
      blurb: "Maintain routing, fix faults and tune for performance, reliability and cost.",
      lessons: [
        { slug: "maintaining-routing-quotas", title: "Maintaining Routing, Route Tables and Quotas", summary: "Propagation, summarization, route priority and the limits that bite." },
        { slug: "troubleshooting-playbook", title: "Network Troubleshooting Playbook", summary: "A layered method, MTU and MSS problems, asymmetric routing and common faults." },
        { slug: "performance-cost-optimization", title: "Performance and Cost Optimization", summary: "ENA, EFA, jumbo frames, multicast, data transfer costs and subnet planning." },
      ],
    },
    {
      id: "security",
      title: "Network Security, Compliance and Governance (Domain 4)",
      blurb: "Secure inbound, outbound and east-west flows, audit them and encrypt data in transit.",
      lessons: [
        { slug: "threat-modeling-inbound-security", title: "Threat Modeling and Securing Inbound Traffic", summary: "WAF, Shield, perimeter VPCs and three-tier designs." },
        { slug: "outbound-inspection-firewall", title: "Securing Outbound and East-West Traffic", summary: "Network Firewall, Gateway Load Balancer, proxies and centralized inspection." },
        { slug: "sg-nacl-firewall-manager-audit", title: "Security Groups, NACLs, Firewall Manager and Auditing", summary: "Inter-VPC controls and a network audit strategy across accounts." },
        { slug: "encryption-in-transit-certificates", title: "Encryption in Transit and Certificate Management", summary: "IPsec, MACsec, TLS, ACM and Private CA under the shared responsibility model." },
      ],
    },
    {
      id: "practice",
      title: "Practice and Exam Readiness",
      blurb: "Apply everything to realistic scenarios, build a hub-and-spoke network and rehearse exam technique.",
      lessons: [
        { slug: "scenario-global-application", title: "Scenario: A Global Application with Edge, DNS and Load Balancing", summary: "Work a full design question the way the exam frames it." },
        { slug: "scenario-enterprise-hybrid", title: "Scenario: An Enterprise Hybrid Landing Zone", summary: "Direct Connect, Transit Gateway, inspection and shared DNS across accounts." },
        { slug: "lab-hub-spoke-transit-gateway", title: "Lab: Build a Hub-and-Spoke Network with Transit Gateway", summary: "Cloud lab: two spokes, a shared services VPC, segmentation and verification.", kind: "lab" },
        { slug: "exam-technique-and-review", title: "Exam Technique, Pattern Review and Final Checklist", summary: "How to read questions, eliminate distractors and a last-week review." },
      ],
    },
  ],
};
