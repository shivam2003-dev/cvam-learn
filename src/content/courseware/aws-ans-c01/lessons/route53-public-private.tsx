import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Review DNS record types, TTL, zones and delegation",
    "Create public and private hosted zones and know when to use each",
    "Use alias records correctly, including at the zone apex",
    "Associate private hosted zones with VPCs across accounts",
    "Explain domain registration, name servers and delegation of subdomains",
  ],
  tasks: [
    {
      id: "dns",
      title: "DNS essentials the exam assumes",
      body: (
        <>
          <p>
            DNS maps names to data. A <strong>zone</strong> is the set of records for a domain that
            one set of authoritative name servers answers. <strong>Delegation</strong> hands a
            subdomain to other name servers using <code>NS</code> records in the parent zone.
            Resolvers cache answers for the record&apos;s <strong>TTL</strong>, so lowering TTL
            before a migration speeds cutover but increases query volume.
          </p>
          <Table
            head={["Record", "Purpose", "Note"]}
            rows={[
              ["A / AAAA", "Name to IPv4 / IPv6 address", "Multiple values allowed"],
              ["CNAME", "Name to another name", "Not allowed at the zone apex"],
              ["Alias (Route 53)", "Name to an AWS resource, answered as A/AAAA", "Allowed at apex; queries to AWS targets are free; follows target health"],
              ["NS / SOA", "Delegation and zone authority", "Route 53 creates them with the zone"],
              ["MX / TXT", "Mail routing, verification, SPF/DKIM", "TXT strings up to 255 characters each"],
              ["PTR", "IP to name (reverse lookup)", "Lives in reverse zones such as in-addr.arpa"],
              ["CAA / SRV / DS", "Certificate authority limits, service location, DNSSEC chain", "DS is added at the parent for DNSSEC"],
            ]}
          />
        </>
      ),
    },
    {
      id: "zones",
      title: "Public and private hosted zones",
      body: (
        <>
          <p>
            A <strong>public hosted zone</strong> answers queries from the internet. A{" "}
            <strong>private hosted zone (PHZ)</strong> answers only for the VPCs associated with it,
            so internal names such as <code>db.corp.example</code> never reach the public internet.
          </p>
          <CloudDiagram course="aws-ans-c01" id="route53-public-private-diagram-1" />
          <p>For a PHZ to work the associated VPC must have both <code>enableDnsSupport</code> and <code>enableDnsHostnames</code> set to true. When a PHZ and a public zone share the same domain name, queries from an associated VPC go to the PHZ and, if the PHZ has no matching record for that name, the answer is NXDOMAIN rather than falling back to the public zone. Duplicate the records you still need.</p>
          <Callout tone="warn" title="Cross-account association">
            The VPC owner and the zone owner are different accounts. The zone account first runs{" "}
            <code>create-vpc-association-authorization</code>, then the VPC account runs{" "}
            <code>associate-vpc-with-hosted-zone</code>, and the authorization can be deleted
            afterwards. This is a CLI/API workflow; the console cannot do the cross-account step. For
            many VPCs and accounts, prefer sharing the DNS configuration with Route 53 Profiles or
            using Resolver rules (next lessons).
          </Callout>
        </>
      ),
    },
    {
      id: "alias",
      title: "Alias records and delegation",
      body: (
        <>
          <p>
            An alias record points to supported AWS targets: CloudFront distributions, ELB load
            balancers, API Gateway custom domains, Global Accelerator, S3 website endpoints, VPC
            interface endpoints, Elastic Beanstalk and other records in the same zone. Alias queries
            to these targets are free, the answer tracks target IP changes automatically, and alias is
            the only way to put an AWS-hosted load balancer or distribution at <code>example.com</code>{" "}
            (the apex), because a CNAME cannot exist there.
          </p>
          <p>
            To delegate <code>dev.example.com</code> to another account, create a new public hosted
            zone for <code>dev.example.com</code> in that account, then add an <code>NS</code> record
            set named <code>dev</code> in the parent zone containing the four name servers of the new
            zone. For private subdomains, associate the child PHZ with the VPCs that need it.
          </p>
          <Exercise
            title="Apex record"
            task={<p>You must make <code>example.com</code> (no www) resolve to an Application Load Balancer. Why does a CNAME fail and what do you use?</p>}
          >
            <p>
              DNS standards forbid a CNAME at the zone apex because the apex already holds NS and SOA
              records. Use a Route 53 <strong>alias A record</strong> (and AAAA for IPv6) pointing to
              the ALB. It returns A records, is free to query for AWS targets, and can evaluate target
              health.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "registration",
      title: "Domain registration and name servers",
      body: (
        <>
          <p>
            Route 53 is also a <strong>registrar</strong>. Registering a domain through Route 53
            creates a public hosted zone and sets the domain&apos;s name servers to that zone&apos;s
            four NS values. If the domain is registered elsewhere, you can still host the zone in
            Route 53: copy its four name servers into the external registrar. You can also{" "}
            <strong>transfer</strong> a domain into Route 53, and Route 53 supports auto-renew,
            registrar lock and WHOIS privacy.
          </p>
          <ul>
            <li>Changing name servers at the registrar, not just creating a zone, is what makes Route 53 authoritative.</li>
            <li>If you delete and recreate a hosted zone you get a <em>new</em> set of name servers; update the registrar or resolution breaks. A <em>reusable delegation set</em> lets multiple zones share the same four name servers.</li>
            <li>Route 53 supports DNS query logging for public zones, delivered to CloudWatch Logs in us-east-1.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Public zones serve the internet; private zones serve associated VPCs and require enableDnsSupport and enableDnsHostnames.",
    "Alias records work at the apex, are free for AWS targets and follow target changes; CNAMEs cannot be at the apex.",
    "Cross-account PHZ association needs an authorization from the zone account and an association from the VPC account.",
    "Delegation uses NS records in the parent zone; registrar name servers must match the hosting zone.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which record type lets you point the zone apex at an Application Load Balancer?",
      options: ["Alias A record", "CNAME", "PTR", "TXT"],
      answer: 0,
      explain: "A CNAME cannot exist at the apex; Route 53 alias records can.",
    },
    {
      kind: "mcq",
      q: "A VPC is associated with a PHZ for example.com that lacks a record for www. A public zone has www. What does an instance in the VPC receive for www.example.com?",
      options: ["NXDOMAIN", "The public record", "A SERVFAIL", "A CNAME to the public zone"],
      answer: 0,
      explain: "The PHZ is authoritative for the whole domain for associated VPCs, so missing names return NXDOMAIN.",
    },
    {
      kind: "mcq",
      q: "Which VPC attributes must be enabled for private hosted zones to work?",
      options: ["enableDnsSupport and enableDnsHostnames", "Only enableDnsHostnames", "Only enableDnsSupport", "DHCP option set with custom DNS only"],
      answer: 0,
      explain: "Both DNS attributes must be true on each associated VPC.",
    },
    {
      kind: "mcq",
      q: "How do you associate a VPC in account B with a private hosted zone in account A?",
      options: [
        "Authorize from account A, then associate from account B via CLI/API",
        "Use the console in account B only",
        "Share the zone with RAM only",
        "It is not possible",
      ],
      answer: 0,
      explain: "create-vpc-association-authorization in the zone account, then associate-vpc-with-hosted-zone in the VPC account.",
    },
    {
      kind: "text",
      q: "Which record type delegates a subdomain to another set of name servers?",
      format: "**",
      accept: ["ns", "ns record"],
      explain: "NS records in the parent zone delegate the subdomain.",
    },
  ],
};
