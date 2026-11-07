import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Hard",
  objectives: [
    "Explain how DNSSEC establishes a chain of trust and what it does not protect",
    "Enable DNSSEC signing on a Route 53 public hosted zone, including the KMS key and DS record steps",
    "Enable DNSSEC validation in Route 53 Resolver",
    "Use Route 53 Resolver DNS Firewall to allow or block domains",
    "Configure DNS query logging and monitoring for public and private traffic",
  ],
  tasks: [
    {
      id: "dnssec",
      title: "DNSSEC: integrity of DNS answers",
      body: (
        <>
          <p>
            DNS was designed without authentication, so an attacker who spoofs a response (cache
            poisoning) can redirect users. <strong>DNSSEC</strong> adds cryptographic signatures to
            DNS data so a validating resolver can confirm an answer came from the zone owner and was
            not altered. It provides <em>authenticity and integrity</em>, not confidentiality: queries
            are still visible.
          </p>
          <Figure caption="Chain of trust. The parent zone holds a DS record that vouches for the child zone's key-signing key.">
            <Flow
              steps={[
                { title: "Root zone", note: "Trust anchor in validating resolvers", tone: "sky" },
                { title: ".com (parent)", note: "Holds DS record for example.com", tone: "sky" },
                { title: "example.com (child)", note: "KSK signs the ZSK; ZSK signs record sets (RRSIG)", tone: "lime" },
                { title: "Validating resolver", note: "Checks signatures up the chain", tone: "amber" },
              ]}
            />
          </Figure>
          <Table
            head={["Term", "Meaning"]}
            rows={[
              ["KSK / ZSK", "Key-signing key and zone-signing key. In Route 53 the KSK is backed by an AWS KMS key; Route 53 manages the ZSK"],
              ["RRSIG", "Signature over a record set"],
              ["DNSKEY", "Public keys of the zone"],
              ["DS", "Delegation signer: hash of the child's KSK, published in the parent zone"],
            ]}
          />
        </>
      ),
    },
    {
      id: "r53-dnssec",
      title: "Enabling DNSSEC signing on Route 53",
      body: (
        <>
          <ol>
            <li>Create (or choose) an <strong>asymmetric KMS key</strong> with the <code>ECC_NIST_P256</code> key spec, in <strong>us-east-1</strong>, with a key policy that lets Route 53 use it for signing.</li>
            <li>Enable DNSSEC signing for the public hosted zone, creating a KSK that uses that KMS key.</li>
            <li>Create the <strong>chain of trust</strong>: add the DS record to the parent zone. If the domain is registered with Route 53, add the DS record through the registrar settings; for another registrar, give them the DS values.</li>
            <li>Monitor with CloudWatch alarms for <code>DNSSECInternalFailure</code> and <code>DNSSECKeySigningKeysNeedingAction</code>.</li>
          </ol>
          <Callout tone="warn" title="Order matters">
            Add the DS record only after signing is working, and lower the parent NS and DS TTLs
            beforehand. If you publish a DS record that does not match your zone&apos;s key, validating
            resolvers return SERVFAIL and the whole domain goes dark. To disable DNSSEC, remove the DS
            record from the parent first, wait for its TTL, then disable signing.
          </Callout>
          <p>
            Route 53 supports DNSSEC signing for <em>public</em> hosted zones, not private hosted
            zones. For the resolver side, you can enable <strong>DNSSEC validation</strong> on a VPC
            through Route 53 Resolver, so instances only accept validated answers for signed zones.
          </p>
        </>
      ),
    },
    {
      id: "firewall",
      title: "Route 53 Resolver DNS Firewall",
      body: (
        <>
          <p>
            DNS is a favourite channel for malware command and control and data exfiltration.{" "}
            <strong>DNS Firewall</strong> filters outbound queries made from VPCs through the Amazon
            resolver. You build <strong>domain lists</strong> (custom, or AWS managed lists for
            malware and botnet domains), group them into <strong>rule groups</strong> with actions
            ALLOW, ALERT or BLOCK (with NODATA, NXDOMAIN or override responses), and associate the
            rule group with VPCs. A VPC-level setting chooses <em>fail open</em> or <em>fail closed</em>{" "}
            if the firewall cannot evaluate a query.
          </p>
          <ul>
            <li>Block everything except an allow-list for locked-down workloads (allow-list then a catch-all block).</li>
            <li>Manage rule groups across accounts with <strong>AWS Firewall Manager</strong> or share through RAM and Route 53 Profiles.</li>
            <li>DNS Firewall inspects only queries to the VPC resolver; hosts that use an external resolver bypass it, so pair it with network controls that block outbound port 53 except to the VPC resolver.</li>
          </ul>
        </>
      ),
    },
    {
      id: "logging",
      title: "Logging DNS",
      body: (
        <>
          <Table
            head={["Log", "Records", "Destination"]}
            rows={[
              ["Public hosted zone query logging", "Queries that reach Route 53 for the zone (domain, type, edge location, response code)", "CloudWatch Logs group in us-east-1"],
              ["Resolver query logging", "Queries from VPC resources (source instance, query, answer, firewall action)", "CloudWatch Logs, S3 or Kinesis Data Firehose"],
              ["DNS Firewall", "Appears in Resolver query logs with the rule matched", "Same as above"],
              ["CloudTrail", "API calls to change records, zones, rules", "S3 / CloudWatch Logs"],
            ]}
          />
          <p>
            Use CloudWatch Logs Insights or Athena over the S3 logs to find unusual query volume,
            long random-looking subdomains (tunneling), or queries for newly registered domains, and
            create metric filters and alarms for these patterns.
          </p>
          <Exercise
            title="Stop DNS exfiltration"
            task={<p>A security team wants to block queries to known malicious domains from all accounts, see which instance made each query, and prevent instances using public resolvers directly. What do you do?</p>}
          >
            <p>
              Create DNS Firewall rule groups with AWS managed threat domain lists (BLOCK) and share
              or enforce them with Firewall Manager across the organization. Turn on Resolver query
              logging to S3 or CloudWatch Logs to capture source instance IDs. In security groups and
              network ACLs (or Network Firewall), allow outbound DNS only to the VPC resolver so
              clients cannot bypass the firewall by using an external resolver.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "DNSSEC gives authenticity and integrity through a chain of trust (DS in the parent), not confidentiality.",
    "Route 53 DNSSEC signing: public zones only, asymmetric ECC_NIST_P256 KMS key in us-east-1, then add DS at the parent last.",
    "Resolver DNSSEC validation protects VPC clients; DNS Firewall blocks bad domains and can fail open or closed.",
    "Public zone query logs go to CloudWatch Logs in us-east-1; Resolver query logs go to CloudWatch Logs, S3 or Firehose.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which KMS key type does Route 53 DNSSEC signing require?",
      options: [
        "Asymmetric ECC_NIST_P256 key in us-east-1",
        "Symmetric AES-256 key in any Region",
        "RSA 4096 key in eu-west-1",
        "No KMS key is needed",
      ],
      answer: 0,
      explain: "The KSK uses an asymmetric ECC_NIST_P256 customer managed key created in us-east-1.",
    },
    {
      kind: "mcq",
      q: "What does DNSSEC NOT provide?",
      options: ["Confidentiality of queries", "Authenticity of answers", "Integrity of answers", "Protection against cache poisoning"],
      answer: 0,
      explain: "DNSSEC signs data but does not encrypt queries or responses.",
    },
    {
      kind: "mcq",
      q: "Which feature blocks instances in a VPC from resolving known malicious domains?",
      options: ["Route 53 Resolver DNS Firewall", "AWS WAF", "Security groups only", "VPC Flow Logs"],
      answer: 0,
      explain: "DNS Firewall filters queries sent to the VPC resolver using domain lists and actions.",
    },
    {
      kind: "mcq",
      q: "What is the safest sequence to disable DNSSEC on a signed zone?",
      options: [
        "Remove the DS record at the parent, wait for TTL, then disable signing",
        "Disable signing, then remove the DS record",
        "Delete the hosted zone",
        "Change the TTL to zero only",
      ],
      answer: 0,
      explain: "A leftover DS with no signed zone makes validating resolvers fail; remove the DS first.",
    },
    {
      kind: "text",
      q: "Which record in the parent zone vouches for a child zone's key-signing key?",
      format: "**",
      accept: ["ds", "ds record", "delegation signer"],
      explain: "The DS (delegation signer) record holds a hash of the child KSK and anchors the chain of trust.",
    },
  ],
};
