import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Explain the Amazon-provided DNS resolver and its addresses and limits",
    "Design Route 53 Resolver inbound and outbound endpoints for hybrid name resolution",
    "Write conditional forwarding rules and share them across accounts with AWS RAM",
    "Choose between a centralized and a distributed DNS architecture",
    "Describe how Route 53 Profiles simplify multi-account DNS configuration",
  ],
  tasks: [
    {
      id: "resolver",
      title: "The built-in VPC resolver",
      body: (
        <>
          <p>
            Every VPC has an Amazon-provided DNS resolver, reachable at the VPC base address plus two
            (for example <code>10.0.0.2</code> for <code>10.0.0.0/16</code>) and at the link-local
            address <code>169.254.169.253</code>. It resolves public names, VPC internal hostnames
            and records in associated private hosted zones. It is <strong>not reachable from outside
            the VPC</strong>, which is why hybrid DNS needs Resolver endpoints. Each network interface
            is limited to about 1,024 packets per second to the resolver, which matters for chatty
            hosts and for sizing endpoints.
          </p>
          <Callout tone="note" title="Order of resolution">
            The VPC resolver evaluates Resolver rules (forwarding) first by most specific domain, then
            private hosted zones, then public DNS. Resolver rules therefore override a PHZ of the same
            domain name.
          </Callout>
        </>
      ),
    },
    {
      id: "endpoints",
      title: "Inbound and outbound endpoints",
      body: (
        <>
          <p>
            <strong>Inbound endpoint:</strong> elastic network interfaces with private IPs in your VPC
            that on-premises DNS servers forward queries to. Use it so on-premises clients can resolve
            AWS names such as private hosted zone records and interface endpoint names.{" "}
            <strong>Outbound endpoint:</strong> ENIs from which Route 53 Resolver sends forwarded
            queries to on-premises DNS servers, driven by <strong>forwarding rules</strong> such as
            <code> corp.example.com → 192.168.10.10, 192.168.10.11</code>.
          </p>
          <Figure caption="Hybrid DNS with both endpoint types. On-premises forwards aws.example.com to the inbound endpoint; the VPC forwards corp.example.com to the outbound endpoint.">
            <Graph
              label="Hybrid DNS: on-premises DNS and VPC resolver connected through inbound and outbound Resolver endpoints"
              cellW={200}
              cellH={104}
              nodeW={170}
              nodes={[
                { id: "onp", label: "On-prem DNS servers", sub: "corp.example.com", col: 0, row: 0, tone: "amber" },
                { id: "in", label: "Inbound endpoint", sub: "ENIs in 2+ AZs", col: 1, row: 0, tone: "lime" },
                { id: "res", label: "VPC Resolver", sub: "PHZ aws.example.com", col: 2, row: 0, tone: "lime" },
                { id: "out", label: "Outbound endpoint", sub: "ENIs in 2+ AZs", col: 1, row: 1, tone: "lime" },
                { id: "ec2", label: "EC2 instance", col: 2, row: 1, tone: "sky" },
              ]}
              groups={[{ label: "AWS VPC", c1: 1, r1: 0, c2: 2, r2: 1, tone: "lime" }]}
              edges={[
                { from: "onp", to: "in", label: "aws.example.com" },
                { from: "in", to: "res" },
                { from: "ec2", to: "out", label: "corp.example.com" },
                { from: "out", to: "onp", label: "forward rule", dashed: true },
              ]}
            />
          </Figure>
          <Table
            head={["Design point", "Guidance"]}
            rows={[
              ["Availability", "Create endpoints with ENIs in at least two Availability Zones (each endpoint needs at least two IP addresses)"],
              ["Connectivity", "The endpoint reaches on-premises over Direct Connect or Site-to-Site VPN; allow TCP and UDP 53 in security groups and on-premises firewalls"],
              ["Security groups", "Inbound endpoint: allow DNS from on-premises CIDRs. Outbound endpoint: allow DNS out to the on-premises servers"],
              ["Capacity", "Roughly 10,000 queries per second per ENI; add ENIs to scale; monitor endpoint metrics in CloudWatch"],
              ["Protocols", "Standard DNS on port 53, with optional DNS over HTTPS (DoH) and DNS over TLS (DoT) options on endpoints for encrypted transport"],
            ]}
          />
        </>
      ),
    },
    {
      id: "multi",
      title: "Multi-account architectures",
      body: (
        <>
          <p>
            Resolver rules are regional resources that you can share with{" "}
            <strong>AWS Resource Access Manager (RAM)</strong>. A typical enterprise runs endpoints
            and rules in one <em>shared services</em> or network account and shares the forwarding
            rules with workload accounts; those accounts then <strong>associate</strong> the shared
            rules with their VPCs. Private hosted zones can be associated across accounts, and for
            large estates <strong>Route 53 Profiles</strong> bundle PHZ associations, Resolver rules
            and DNS Firewall rule groups into one shareable object you associate with many VPCs.
          </p>
          <Table
            head={["Model", "How", "Pros", "Cons"]}
            rows={[
              ["Centralized", "Endpoints and rules in a shared VPC; spoke VPCs use that VPC's resolver path (for example via Transit Gateway)", "Fewer endpoints, simple on-premises forwarding targets", "Single dependency, per-ENI query limits, cross-VPC traffic"],
              ["Distributed", "Rules shared with RAM; each VPC resolves using its own resolver and the shared outbound endpoint", "No hairpin through a shared VPC for AWS-to-AWS names, scales per VPC", "More associations to manage"],
              ["Hybrid of both", "Inbound endpoints centralized; forwarding rules shared widely", "Common best practice", "Needs good naming conventions"],
            ]}
          />
          <p>
            For on-premises clients to resolve PHZ records that live in many accounts, associate
            those PHZs with the VPC that hosts the inbound endpoint. For interface VPC endpoints with
            private DNS in a centralized-endpoints design, create a PHZ for the service name and
            associate it with the spoke VPCs.
          </p>
        </>
      ),
    },
    {
      id: "scenario",
      title: "Worked scenario",
      body: (
        <>
          <Exercise
            title="Who resolves what?"
            task={
              <p>
                Account A owns the network VPC with Direct Connect to on-premises. Accounts B to F have
                app VPCs. On-premises has <code>corp.example.com</code>; AWS has{" "}
                <code>apps.aws.example.com</code> in a PHZ. Requirements: on-premises resolves AWS
                app names, AWS instances resolve corporate names, rule changes must be managed once.
              </p>
            }
          >
            <ol>
              <li>In account A, create an <strong>inbound endpoint</strong> and associate the PHZ <code>apps.aws.example.com</code> with the account A VPC (and all app VPCs).</li>
              <li>On-premises DNS: add a conditional forwarder for <code>aws.example.com</code> to the inbound endpoint IPs over Direct Connect.</li>
              <li>In account A, create an <strong>outbound endpoint</strong> and a forwarding rule <code>corp.example.com</code> to the on-premises servers.</li>
              <li>Share the rule with accounts B to F through <strong>RAM</strong> and associate it with each VPC, or place both in a Route 53 Profile.</li>
            </ol>
            <p>Changes to the on-premises server list are made once, in the shared rule.</p>
          </Exercise>
          <Callout tone="tip" title="Cost awareness">
            Resolver endpoints are billed per ENI per hour plus per million queries. Do not create
            one pair per VPC if sharing rules does the job.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The VPC resolver (VPC base + 2, 169.254.169.253) is not reachable externally; use inbound endpoints for on-premises-to-AWS queries.",
    "Outbound endpoints plus forwarding rules send chosen domains to on-premises DNS; rules take precedence over PHZs.",
    "Use two or more AZs per endpoint and allow port 53 TCP/UDP end to end.",
    "Share forwarding rules with RAM, or bundle configuration with Route 53 Profiles, to manage DNS centrally.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "On-premises servers must resolve names in an AWS private hosted zone. What do you create?",
      options: ["Route 53 Resolver inbound endpoint", "Outbound endpoint", "A public hosted zone", "A Direct Connect public VIF"],
      answer: 0,
      explain: "On-premises DNS forwards queries to the inbound endpoint ENIs in the VPC.",
    },
    {
      kind: "mcq",
      q: "EC2 instances must resolve corp.example.com hosted on-premises. What do you use?",
      options: ["Outbound endpoint with a forwarding rule", "Inbound endpoint", "A private hosted zone", "A CNAME at the apex"],
      answer: 0,
      explain: "Forwarding rules sent through an outbound endpoint direct queries to on-premises DNS servers.",
    },
    {
      kind: "mcq",
      q: "How do you reuse one forwarding rule across many accounts?",
      options: ["Share it with AWS RAM and associate it with VPCs", "Copy it manually", "Use Route 53 health checks", "Create a CNAME"],
      answer: 0,
      explain: "Resolver rules are shareable resources in RAM; each account associates them with its VPCs.",
    },
    {
      kind: "mcq",
      q: "How many Availability Zones should a production Resolver endpoint span?",
      options: ["At least two", "One", "Exactly three only", "None; it is global"],
      answer: 0,
      explain: "Endpoints require at least two IP addresses and should be spread across at least two AZs.",
    },
    {
      kind: "text",
      q: "At what IP address offset from the VPC base address is the Amazon DNS resolver found?",
      format: "*",
      accept: ["2", "plus two", "+2", "base plus two", "base + 2"],
      explain: "The resolver is at the VPC network base address plus two.",
    },
  ],
};
