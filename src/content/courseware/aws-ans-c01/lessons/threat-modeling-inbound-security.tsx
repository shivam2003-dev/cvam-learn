import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Build a simple threat model for a network architecture using trust boundaries",
    "Protect inbound traffic with AWS WAF, AWS Shield and CloudFront / ALB placement",
    "Apply perimeter VPC, DMZ and three-tier architectures for compliance",
    "Mitigate common DDoS and application threats",
    "Test controls with failover and resiliency exercises",
  ],
  tasks: [
    {
      id: "threat",
      title: "Threat modeling for networks",
      body: (
        <>
          <p>
            A threat model answers four questions: what are we protecting, who or what can attack
            it, how, and what controls reduce the risk. For networks, draw <strong>trust
            boundaries</strong> (internet, perimeter, application tier, data tier, on-premises,
            partner) and the data flows crossing them, then list threats per flow using a framework
            such as STRIDE (spoofing, tampering, repudiation, information disclosure, denial of
            service, elevation of privilege).
          </p>
          <Table
            head={["Threat", "Example", "Control"]}
            rows={[
              ["Volumetric DDoS (L3/L4)", "UDP reflection flood", "Shield Standard/Advanced, CloudFront, Global Accelerator, Route 53"],
              ["Application DDoS and abuse (L7)", "HTTP floods, scrapers, credential stuffing", "AWS WAF rate-based rules, Bot Control, CAPTCHA"],
              ["Exploits", "SQL injection, XSS, known CVEs", "WAF managed rules, patching, Network Firewall IPS"],
              ["Lateral movement", "Compromised web host scans the database", "Segmentation, SGs by reference, NACLs, inspection"],
              ["Data exfiltration", "Malware calls out to a C2 domain", "Egress filtering, DNS Firewall, Network Firewall domain lists"],
              ["Misconfiguration", "Public database port", "Config rules, Firewall Manager, Access Analyzer, automation"],
              ["Man in the middle", "Snooping on links", "TLS/IPsec/MACsec"],
            ]}
          />
        </>
      ),
    },
    {
      id: "inbound",
      title: "Securing inbound traffic",
      body: (
        <>
          <Figure caption="Layered inbound defence. Each layer removes a class of attack before it reaches the next.">
            <Layers
              layers={[
                { title: "DNS and edge", note: "Route 53 (Shield protected), CloudFront or Global Accelerator absorb floods; geo-restrictions", tone: "lime" },
                { title: "AWS WAF + Shield", note: "Layer 7 rules, rate limits, bot control; Shield Advanced adds DDoS response team and cost protection", tone: "lime" },
                { title: "Load balancer in public subnets", note: "TLS termination, ALB only in the perimeter, security group allows CloudFront prefix list or required ports", tone: "sky" },
                { title: "Application tier in private subnets", note: "No public IPs; SG allows only the ALB security group", tone: "amber" },
                { title: "Data tier in isolated subnets", note: "SG allows only the application SG; no internet route", tone: "plain" },
              ]}
            />
          </Figure>
          <Table
            head={["Service", "Protects", "Key facts"]}
            rows={[
              ["AWS WAF", "CloudFront, ALB, API Gateway, AppSync, Cognito, App Runner", "Web ACLs with rules/rule groups; managed rule groups; rate-based rules; Bot Control; logging to S3, CloudWatch Logs or Firehose; web ACL capacity units; for CloudFront, create in us-east-1"],
              ["Shield Standard", "All AWS customers", "Free automatic L3/L4 protection"],
              ["Shield Advanced", "CloudFront, Route 53, Global Accelerator, ELB, Elastic IPs", "Subscription, advanced detection, Shield Response Team, DDoS cost protection, automatic application layer mitigation via WAF"],
              ["Network Firewall", "Traffic entering VPC subnets", "Stateless and stateful rules, Suricata-compatible IPS, domain filtering; endpoint in firewall subnet"],
              ["Security groups / NACLs", "Instance / subnet", "Least privilege, SG references, deny rules in NACL for known bad CIDRs"],
            ]}
          />
          <Callout tone="tip" title="Reduce the attack surface">
            Do not give instances public IPs unless necessary. Put only load balancers, bastions (or
            use Systems Manager Session Manager / EC2 Instance Connect Endpoint) and NAT in public
            subnets. Use CloudFront and Global Accelerator so the origin ALB can restrict sources.
          </Callout>
        </>
      ),
    },
    {
      id: "arch",
      title: "Perimeter and three-tier architectures",
      body: (
        <>
          <Figure caption="Perimeter (DMZ) VPC pattern. Untrusted traffic terminates in a perimeter VPC where WAF, firewall and reverse proxies live; only inspected traffic crosses Transit Gateway to private workload VPCs.">
            <Graph
              label="Internet to a perimeter VPC with WAF and firewall, then Transit Gateway to private workload VPCs"
              cellW={190}
              cellH={96}
              nodeW={160}
              nodes={[
                { id: "net", label: "Internet", col: 0, row: 0, tone: "rose", shape: "pill" },
                { id: "waf", label: "CloudFront + WAF", col: 1, row: 0, tone: "lime" },
                { id: "per", label: "Perimeter VPC", sub: "ALB + Network Firewall", col: 2, row: 0, tone: "amber" },
                { id: "tgw", label: "Transit Gateway", col: 3, row: 0, tone: "lime" },
                { id: "app", label: "Workload VPCs", sub: "private only", col: 4, row: 0, tone: "sky" },
              ]}
              edges={[
                { from: "net", to: "waf" },
                { from: "waf", to: "per" },
                { from: "per", to: "tgw" },
                { from: "tgw", to: "app" },
              ]}
            />
          </Figure>
          <ul>
            <li><strong>Untrusted network:</strong> third-party or partner links terminate in a separate VPC with strict NACLs and inspection, never directly into production.</li>
            <li><strong>Compliance zones</strong> (PCI, HIPAA) get separate VPCs or accounts and separate TGW route tables so scope is small and provable.</li>
            <li><strong>Test controls:</strong> run failover tests (terminate an AZ's firewall endpoint, break a link), load tests and game days to confirm resilience, and record the results for auditors.</li>
          </ul>
          <Exercise
            title="Layered defence"
            task={<p>An ecommerce site suffers HTTP floods and SQL injection attempts. The ALB is public and web servers have public IPs. Fix the architecture with minimal change.</p>}
          >
            <p>
              Put <strong>CloudFront</strong> and <strong>AWS WAF</strong> (managed SQLi/common rule
              sets, rate-based rule) in front, enable <strong>Shield Advanced</strong> if risk and
              budget justify, restrict the ALB security group to the CloudFront prefix list, move web
              servers to private subnets with no public IPs (allow only the ALB SG), and send WAF logs
              to S3 or CloudWatch Logs for tuning.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Model threats by trust boundary and data flow, then map each threat to a control.",
    "Layer the inbound path: edge services, WAF and Shield, load balancer, private application and isolated data tiers.",
    "WAF handles layer 7 on CloudFront, ALB and API Gateway; Shield Standard is free, Advanced adds response team and cost protection.",
    "Isolate untrusted networks and compliance scopes in separate VPCs or accounts and test the controls.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service provides rate-based rules to block an HTTP flood from a set of IPs?",
      options: ["AWS WAF", "Security groups", "Route 53", "VPC Flow Logs"],
      answer: 0,
      explain: "WAF rate-based rules block IPs exceeding a request threshold.",
    },
    {
      kind: "mcq",
      q: "Which Shield tier includes access to the Shield Response Team and DDoS cost protection?",
      options: ["Shield Advanced", "Shield Standard", "WAF", "Firewall Manager"],
      answer: 0,
      explain: "Shield Advanced is the paid tier with SRT support and cost protection.",
    },
    {
      kind: "mcq",
      q: "Where should application servers be placed in a three-tier design?",
      options: ["Private subnets with access only from the load balancer", "Public subnets with public IPs", "Directly on the internet", "In the database subnet"],
      answer: 0,
      explain: "Private subnets reduce exposure; the SG allows only the ALB.",
    },
    {
      kind: "mcq",
      q: "In which Region must a WAF web ACL for CloudFront be created?",
      options: ["us-east-1", "eu-west-1", "ap-southeast-1", "The origin Region"],
      answer: 0,
      explain: "CloudFront web ACLs are global resources created in US East (N. Virginia).",
    },
    {
      kind: "text",
      q: "Which threat-modeling framework has the letters S, T, R, I, D, E?",
      format: "******",
      accept: ["stride"],
      explain: "STRIDE: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege.",
    },
  ],
};
