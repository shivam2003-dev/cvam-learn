import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Choose the right encryption in transit option for each network segment",
    "Explain VPN over Direct Connect, MACsec and Nitro in-transit encryption",
    "Terminate and manage TLS with ACM, ACM Private CA and load balancers",
    "Apply the shared responsibility model to network encryption",
    "Secure DNS communications with DNSSEC and encrypted resolvers",
  ],
  tasks: [
    {
      id: "map",
      title: "Encryption by segment",
      body: (
        <>
          <Figure caption="Encryption options along the path from user to data. A compliant design names the control for every segment.">
            <Layers
              layers={[
                { title: "User to edge", note: "HTTPS with CloudFront (TLS 1.2+/1.3), viewer protocol policy redirect-to-HTTPS, HSTS", tone: "lime" },
                { title: "Edge to origin", note: "Origin protocol policy HTTPS only; valid cert on ALB/NLB; match host header", tone: "lime" },
                { title: "Load balancer to targets", note: "Re-encrypt with HTTPS/TLS target groups, or NLB TCP passthrough", tone: "sky" },
                { title: "Between instances / VPCs", note: "Nitro instances encrypt traffic between supported instance types automatically; TLS/mTLS in the application; TGW and inter-Region peering encrypt at the physical layer", tone: "sky" },
                { title: "On-premises to AWS", note: "IPsec Site-to-Site VPN; IPsec over Direct Connect (public VIF or private IP VPN on transit VIF); MACsec on the DX link", tone: "amber" },
                { title: "To AWS services", note: "TLS endpoints for S3 (enforce aws:SecureTransport), RDS SSL/TLS, DynamoDB, KMS", tone: "plain" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "hybrid",
      title: "Encrypting hybrid links",
      body: (
        <>
          <Table
            head={["Option", "Layer", "Protects", "Notes"]}
            rows={[
              ["Site-to-Site VPN", "L3 (IPsec)", "Whole tunnel between customer gateway and AWS", "AES-GCM/CBC, IKEv1/v2, PSK or certificates, 1500 MTU limits"],
              ["IPsec over DX public VIF", "L3", "Traffic across Direct Connect with public IP tunnel endpoints", "VGW or TGW; adds VPN bandwidth limits per tunnel"],
              ["Private IP VPN on transit VIF", "L3", "IPsec between private IPs, TGW only", "No public IPs needed; ECMP possible"],
              ["MACsec on Direct Connect", "L2 (802.1AE)", "Hop between your router and the AWS DX router; line-rate", "Dedicated 10/100/400 Gbps ports; CKN/CAK secrets; not end to end"],
              ["TLS in the application / load balancer", "L4-L7", "End-to-end between client and server", "Independent of the network; required for end-to-end confidentiality"],
              ["Nitro in-transit encryption", "L3", "Automatic between supported Nitro instances in the same VPC or peered VPCs in a Region", "Nothing to configure; not for traffic leaving the VPC"],
            ]}
          />
          <Callout tone="note" title="Direct Connect is private, not confidential">
            A frequent trap. Direct Connect traffic is isolated from the internet, but unless you add
            MACsec or IPsec (or application TLS) it is not encrypted. Compliance regimes that require
            encryption of all transit data need one of those.
          </Callout>
        </>
      ),
    },
    {
      id: "certs",
      title: "Certificates: ACM and Private CA",
      body: (
        <>
          <ul>
            <li><strong>AWS Certificate Manager (ACM)</strong> issues and renews public TLS certificates at no charge for use with integrated services: ELB, CloudFront, API Gateway, App Runner. Validate ownership by <strong>DNS</strong> (preferred; a CNAME in Route 53 lets ACM renew automatically) or email. Public certificates for integrated services cannot be copied to your own servers (private keys are not exposed).</li>
            <li><strong>CloudFront</strong> requires its ACM certificate in <strong>us-east-1</strong>; load balancers and API Gateway Regional endpoints use certificates in their own Region.</li>
            <li><strong>ACM Private CA</strong> runs a private certificate authority hierarchy for internal TLS, mutual TLS, VPN client certificates, IoT and service meshes. Certificates can be exported for use on EC2 or on-premises, and you can use short-lived certificates.</li>
            <li><strong>mTLS:</strong> ALB mutual authentication verifies client certificates against a trust store; API Gateway and NLB TLS/passthrough designs support mTLS too; Client VPN uses mutual certificates.</li>
            <li><strong>Security policies:</strong> choose ELB TLS policies that disable legacy protocols (for example TLS 1.0/1.1) and use forward secrecy; FIPS policies exist for regulated workloads.</li>
          </ul>
          <Table
            head={["Requirement", "Solution"]}
            rows={[
              ["Free public certificate on ALB with auto-renewal", "ACM public certificate with DNS validation"],
              ["Internal microservices with mutual TLS", "ACM Private CA issuing certificates; ALB mTLS or service mesh"],
              ["Certificate on EC2 servers or appliances", "ACM Private CA (exportable) or a third-party CA"],
              ["Custom domain on CloudFront", "ACM certificate in us-east-1 plus alternate domain name"],
              ["VPN authentication without pre-shared keys", "Private CA certificates on VPN tunnels / Client VPN"],
            ]}
          />
        </>
      ),
    },
    {
      id: "shared",
      title: "Shared responsibility and secure DNS",
      body: (
        <>
          <p>
            Under the <strong>shared responsibility model</strong>, AWS secures the physical network,
            encrypts traffic between AWS data centers and across Regions on its backbone, and provides
            the capabilities. <em>You</em> decide whether and how to encrypt: enabling HTTPS listeners,
            enforcing TLS on S3 and databases, configuring IPsec/MACsec, managing certificates and
            keys, and choosing TLS policies.
          </p>
          <ul>
            <li><strong>Enforce</strong> encryption: S3 bucket policy with <code>aws:SecureTransport</code>, RDS <code>rds.force_ssl</code>, ALB HTTP→HTTPS redirect, CloudFront viewer protocol policy, security group rules that allow only 443.</li>
            <li><strong>Secure DNS:</strong> DNSSEC for authenticity of Route 53 answers, VPC resolver DNSSEC validation, DNS Firewall, and encrypted transport options on Resolver endpoints (DNS over HTTPS/TLS) where supported.</li>
            <li><strong>Key management:</strong> protect private keys and PSKs in Secrets Manager or KMS-backed stores; rotate regularly.</li>
          </ul>
          <Exercise
            title="Encrypt everything"
            task={<p>A healthcare company must encrypt all PHI in transit: users to the app, between tiers, to on-premises over Direct Connect, and to S3. What do you configure?</p>}
          >
            <p>
              CloudFront or ALB with <strong>HTTPS only</strong> (ACM certificate, TLS 1.2+ policy,
              HTTP redirect); <strong>re-encrypt</strong> to targets (HTTPS target groups) and use
              TLS to the database (force SSL); <strong>IPsec VPN over Direct Connect</strong> (private
              IP VPN on a transit VIF or VPN over the public VIF) and/or <strong>MACsec</strong> on
              dedicated connections; S3 bucket policy denying requests without{" "}
              <code>aws:SecureTransport</code> and using the HTTPS endpoints (also via an S3 interface
              endpoint). Manage certificates with ACM and Private CA and monitor expiries.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Name the encryption control for every segment: TLS at edge and origin, IPsec/MACsec on hybrid links, Nitro and TLS inside, TLS to AWS services.",
    "Direct Connect is private but not encrypted; add MACsec (hop) or IPsec (end-to-end tunnel).",
    "ACM issues free public certificates with DNS validation and auto-renewal; CloudFront needs us-east-1; Private CA covers internal and exportable certificates.",
    "AWS provides the capability; you configure and enforce encryption, certificates and policies.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which option provides layer 2 encryption on a Direct Connect dedicated connection?",
      options: ["MACsec", "IPsec on the VGW", "TLS passthrough", "AWS WAF"],
      answer: 0,
      explain: "MACsec encrypts the link between your device and the AWS router.",
    },
    {
      kind: "mcq",
      q: "Which certificate service issues certificates that can be exported to EC2 or on-premises servers?",
      options: ["ACM Private CA", "ACM public certificates for ALB", "IAM only", "Route 53"],
      answer: 0,
      explain: "Private CA certificates can be exported; ACM public certs for integrated services cannot.",
    },
    {
      kind: "mcq",
      q: "How can you require HTTPS for all requests to an S3 bucket?",
      options: ["Bucket policy denying requests where aws:SecureTransport is false", "Enable versioning", "Add a NACL", "Use a gateway endpoint only"],
      answer: 0,
      explain: "The aws:SecureTransport condition key lets you deny unencrypted requests.",
    },
    {
      kind: "mcq",
      q: "Which validation method allows fully automatic ACM renewal when the domain is in Route 53?",
      options: ["DNS validation", "Email validation", "Manual upload", "HTTP validation file"],
      answer: 0,
      explain: "A DNS CNAME record lets ACM revalidate and renew automatically.",
    },
    {
      kind: "text",
      q: "In which Region must the ACM certificate for CloudFront be issued?",
      format: "*********",
      accept: ["us-east-1", "us east 1", "n. virginia", "n virginia"],
      explain: "CloudFront can use only certificates from US East (N. Virginia).",
    },
  ],
};
