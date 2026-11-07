import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Hard",
  objectives: [
    "Configure target groups, health checks, algorithms, stickiness and deregistration delay",
    "Choose between TLS termination, re-encryption and TLS passthrough",
    "Integrate load balancers with Auto Scaling, WAF, Route 53, CloudFront and Global Accelerator",
    "Explain how the AWS Load Balancer Controller provisions ALBs and NLBs for Kubernetes",
  ],
  tasks: [
    {
      id: "targets",
      title: "Target groups and behaviour",
      body: (
        <>
          <Table
            head={["Setting", "Options and notes"]}
            rows={[
              ["Target type", "Instance (traffic to primary ENI), IP (any routable IP incl. on-premises, peered VPC, containers), Lambda (ALB), ALB (NLB)"],
              ["Protocols", "ALB: HTTP, HTTPS, gRPC. NLB: TCP, UDP, TCP_UDP, TLS. GWLB: GENEVE"],
              ["Routing algorithm", "ALB: round robin (default), least outstanding requests, weighted random. NLB: flow hash"],
              ["Stickiness", "ALB: duration-based or application-based cookies. NLB: source IP affinity. GWLB: 5-tuple flow stickiness"],
              ["Health checks", "Protocol, path, port, interval, thresholds, success codes; unhealthy targets receive no new traffic"],
              ["Deregistration delay", "Default 300 seconds to drain in-flight requests before removal"],
              ["Slow start (ALB)", "Ramp traffic to a new target over 30 to 900 seconds"],
              ["Cross-zone", "Per-target-group override on ALB"],
              ["Proxy protocol v2 (NLB)", "Passes original connection info to the target when source IP would otherwise be lost"],
            ]}
          />
          <Callout tone="tip" title="IP targets unlock hybrid">
            Because IP target groups accept any private address reachable from the VPC, an ALB or NLB
            can balance across EC2, containers, peered-VPC hosts and on-premises servers over Direct
            Connect or VPN. This is a common migration pattern.
          </Callout>
        </>
      ),
    },
    {
      id: "tls",
      title: "Encryption and authentication patterns",
      body: (
        <>
          <CloudDiagram course="aws-ans-c01" id="elb-config-integration-diagram-1" />
          <ul>
            <li>Certificates come from <strong>AWS Certificate Manager</strong> (public or private CA) or IAM; one listener supports multiple certificates using SNI.</li>
            <li>Use predefined <strong>security policies</strong> (for example TLS 1.3 policies) to restrict protocol versions and ciphers.</li>
            <li>ALB can authenticate users with <strong>Amazon Cognito or an OIDC provider</strong> before forwarding, and verify client certificates with <strong>mutual TLS</strong>.</li>
            <li>ALB listener rules can redirect HTTP to HTTPS, return fixed responses and forward by weighted target groups for blue/green.</li>
          </ul>
        </>
      ),
    },
    {
      id: "integrate",
      title: "Integrations that appear in scenarios",
      body: (
        <>
          <Table
            head={["Integration", "Pattern"]}
            rows={[
              ["EC2 Auto Scaling", "Attach the target group to the Auto Scaling group; use ELB health checks so unhealthy instances are replaced; scale on ALBRequestCountPerTarget"],
              ["AWS WAF", "Attach a web ACL to an ALB (regional); not to NLB or GWLB"],
              ["CloudFront", "ALB as origin; restrict ALB security group to the CloudFront prefix list and verify a secret header"],
              ["Global Accelerator", "ALB or NLB as endpoint for static IPs and multi-Region failover"],
              ["Route 53", "Alias A/AAAA record to the load balancer; evaluate target health"],
              ["API Gateway", "VPC link to an NLB (or ALB with HTTP APIs) to reach private services"],
              ["PrivateLink", "NLB (or GWLB) is the backing for an endpoint service"],
              ["ECS / Fargate", "Dynamic port mapping and IP targets for awsvpc networking"],
            ]}
          />
          <CloudDiagram course="aws-ans-c01" id="elb-config-integration-diagram-2" />
        </>
      ),
    },
    {
      id: "k8s",
      title: "AWS Load Balancer Controller for Kubernetes",
      body: (
        <>
          <p>
            The <strong>AWS Load Balancer Controller</strong> runs in an Amazon EKS cluster and
            reconciles Kubernetes objects into load balancers. A Kubernetes <code>Ingress</code>{" "}
            (class <code>alb</code>) creates an <strong>ALB</strong>; a <code>Service</code> of type{" "}
            <code>LoadBalancer</code> with the controller&apos;s annotations or load balancer class
            creates an <strong>NLB</strong>. It needs IAM permissions (IRSA or EKS Pod Identity) to
            call ELB APIs.
          </p>
          <ul>
            <li><strong>Target type <code>ip</code></strong> sends traffic straight to pod IPs from the VPC CNI (fewer hops, works with Fargate); <strong>instance</strong> mode goes through the node port and kube-proxy.</li>
            <li><strong>IngressGroup</strong> annotations let several Ingress resources share one ALB to save cost.</li>
            <li><strong>TargetGroupBinding</strong> attaches pods to an existing target group you manage.</li>
            <li>Pod readiness gates keep pods from being terminated before the load balancer finishes registering them, enabling zero-downtime rollouts.</li>
            <li>Subnets are discovered by tags such as <code>kubernetes.io/role/elb</code> (public) and <code>kubernetes.io/role/internal-elb</code> (private).</li>
          </ul>
          <Exercise
            title="EKS exposure"
            task={<p>Ten microservices on EKS need HTTP path routing, one WAF, and the lowest load balancer cost. How do you expose them?</p>}
          >
            <p>
              Install the AWS Load Balancer Controller, create Ingress resources for each service with
              the same <code>alb.ingress.kubernetes.io/group.name</code> annotation so they share a
              single ALB, use <code>target-type: ip</code>, and attach one AWS WAF web ACL to that ALB.
              One load balancer replaces ten.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Target groups define type, protocol, health, algorithm and stickiness; IP targets reach hybrid and peered resources.",
    "TLS terminate for features, re-encrypt for end-to-end compliance, pass through (NLB TCP) when the target must hold the certificate.",
    "WAF attaches to ALB; Auto Scaling uses ELB health checks and request-count metrics; API Gateway uses VPC links to NLB.",
    "The AWS Load Balancer Controller maps Ingress to ALB and Service type LoadBalancer to NLB, with IP targets and shared ALBs through IngressGroup.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which design keeps TLS encrypted all the way to the instance without the load balancer decrypting it?",
      options: ["NLB with a TCP listener (TLS passthrough)", "ALB with HTTP listener", "ALB with HTTPS and ACM certificate", "CloudFront with HTTP origin"],
      answer: 0,
      explain: "A TCP listener forwards encrypted traffic as-is; the target terminates TLS.",
    },
    {
      kind: "mcq",
      q: "Which AWS Load Balancer Controller resource creates an ALB?",
      options: ["Ingress", "Service of type ClusterIP", "ConfigMap", "PersistentVolumeClaim"],
      answer: 0,
      explain: "Ingress resources of the alb class create an Application Load Balancer; LoadBalancer Services create an NLB.",
    },
    {
      kind: "mcq",
      q: "Which service can you attach directly to an Application Load Balancer for layer 7 protection?",
      options: ["AWS WAF", "AWS Shield Advanced only", "Route 53 DNSSEC", "AWS Network Firewall endpoint"],
      answer: 0,
      explain: "Regional AWS WAF web ACLs associate with ALBs.",
    },
    {
      kind: "mcq",
      q: "What does deregistration delay do?",
      options: [
        "Lets in-flight requests finish before a target is removed",
        "Delays health checks",
        "Delays DNS TTL",
        "Prevents new targets from registering",
      ],
      answer: 0,
      explain: "Deregistration delay (default 300 s) drains connections to a target being removed.",
    },
    {
      kind: "text",
      q: "Which target type lets a load balancer send traffic to an on-premises server over Direct Connect?",
      format: "**",
      accept: ["ip", "ip target", "ip address"],
      explain: "IP target groups accept private IPs routable from the VPC, including on-premises addresses.",
    },
  ],
};
