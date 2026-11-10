import { ArchDiagram, ForCloud, ServiceMap, Term } from "@/components/CloudArch";
import { Exercise } from "@/components/Diagram";
import { Callout, Table } from "@/components/Lesson";
import type { Sheet } from "@/lib/cloud";
import type { Lesson } from "@/lib/types";
import { threeTierSpecs } from "../specs/three-tier";

export const lesson: Lesson & { sheet: Sheet } = {
  sheet: { diagramTitle: "Highly available three-tier web application", specs: threeTierSpecs, takeaways: [] },
  minutes: 30,
  difficulty: "Easy",
  objectives: [
    "Name the three tiers of a web application and what belongs in each",
    "Build a highly available three-tier network layer by layer on AWS, Azure, Google Cloud and OCI",
    "Map each building block to its equivalent service on every provider",
    "Write the traffic rules that keep each tier reachable only from the one above it",
    "Explain what survives, and what does not, when a zone fails",
  ],
  tasks: [
    {
      id: "tiers",
      title: "What the three tiers are",
      body: (
        <>
          <p>
            A three-tier application splits one system into layers that scale, fail and are secured
            independently. Almost every web product you use is built this way, so it is the first
            diagram worth learning.
          </p>
          <ul>
            <li><strong>Web (presentation) tier:</strong> terminates user connections, serves pages and static assets, and forwards work inward. It is the only tier that faces the internet, and only through a load balancer.</li>
            <li><strong>Application (logic) tier:</strong> the business rules: pricing, checkout, permissions. It has no public address and accepts calls only from the web tier.</li>
            <li><strong>Data tier:</strong> the database. It accepts connections only from the application tier and is never exposed to the internet.</li>
          </ul>
          <p>
            Each tier sits in its own subnets, and the whole stack is duplicated across two zones so
            the loss of one building does not take the site down. The same pattern exists on every
            cloud; only the names and a few defaults change.
          </p>
          <h3>Same pattern, four vocabularies</h3>
          <p>Click a provider name in the header to light up its column. Your choice is remembered across the whole course.</p>
          <ServiceMap
            rows={[
              { role: "Private network", aws: "VPC", azure: "Virtual network (VNet)", gcp: "VPC network (global)", oci: "Virtual cloud network (VCN)" },
              { role: "Fault-isolation unit", aws: "Availability Zone", azure: "Availability zone", gcp: "Zone", oci: "Availability domain or fault domain" },
              { role: "Subnet scope", aws: "One zone", azure: "Whole region", gcp: "Whole region", oci: "Whole region (recommended)" },
              { role: "Internet entry", aws: "Internet gateway", azure: "Public IP address (no gateway object)", gcp: "Implicit default route and external IP", oci: "Internet gateway" },
              { role: "Outbound from private", aws: "NAT gateway", azure: "NAT Gateway", gcp: "Cloud NAT", oci: "NAT gateway" },
              { role: "DNS", aws: "Route 53", azure: "Azure DNS", gcp: "Cloud DNS", oci: "OCI DNS" },
              { role: "HTTP load balancer", aws: "Application Load Balancer", azure: "Application Gateway", gcp: "External Application Load Balancer", oci: "Load Balancer" },
              { role: "Autoscaled servers", aws: "EC2 Auto Scaling group", azure: "Virtual Machine Scale Set", gcp: "Managed instance group", oci: "Instance pool" },
              { role: "Managed relational database", aws: "RDS Multi-AZ", azure: "Azure Database for PostgreSQL (zone-redundant HA)", gcp: "Cloud SQL (high availability)", oci: "Base Database with Data Guard" },
              { role: "Traffic rules", aws: "Security groups and network ACLs", azure: "Network security groups", gcp: "VPC firewall rules", oci: "Security lists and NSGs" },
            ]}
          />
        </>
      ),
    },
    {
      id: "build",
      title: "Build it one layer at a time",
      body: (
        <>
          <p>
            Press <strong>Next</strong> to add each layer. Every step highlights what was just added
            and explains the decision behind it. Switch provider at any point to see the same layer
            on another cloud; notice where subnets stop being per-zone and where the internet
            gateway disappears.
          </p>
          <ArchDiagram specs={threeTierSpecs} title="Highly available three-tier web application" />
          <Callout tone="tip" title="Keyboard">
            Click the diagram, then use the left and right arrow keys to step through. Skip straight to the finished picture with the link under the explanation.
          </Callout>
        </>
      ),
    },
    {
      id: "differences",
      title: "Where the clouds really differ",
      body: (
        <>
          <p>
            Three differences cause most of the mistakes people make when they move between clouds.
            Read the note for your provider, then flip and compare.
          </p>
          <ForCloud
            aws={
              <>
                <p><strong>Subnets belong to one AZ.</strong> That is why the diagram has six subnets, two per tier. A public subnet is simply one whose route table sends <code>0.0.0.0/0</code> to an internet gateway.</p>
                <p><strong>Security groups are stateful and attach to resources.</strong> Reference one group from another, so the app tier allows traffic from "the web security group" rather than from an IP range that changes as servers scale.</p>
              </>
            }
            azure={
              <>
                <p><strong>Subnets span all zones,</strong> so you create three, not six. Zone resilience comes from pinning VMs, gateways and databases to zones, not from the subnet layout.</p>
                <p><strong>There is no internet gateway.</strong> A resource is public when it has a public IP and an NSG rule that allows the traffic. Default outbound access is being retired for new virtual networks, so plan an explicit outbound path such as NAT Gateway.</p>
              </>
            }
            gcp={
              <>
                <p><strong>The VPC is global and subnets are regional.</strong> One network can hold subnets in many regions with no peering between them, which makes multi-region designs simpler than on the other clouds.</p>
                <p><strong>Firewall rules belong to the VPC, not the subnet,</strong> and match by network tag or service account. Prefer service accounts: anyone who can edit a VM can change its tags.</p>
              </>
            }
            oci={
              <>
                <p><strong>Compartments come first.</strong> Resources and policies are organised by compartment, so decide the compartment layout before you create the VCN.</p>
                <p><strong>Availability domains vary by region.</strong> Some regions have three; some have one, in which case you spread across fault domains instead. Use regional subnets so the choice does not leak into your network design.</p>
              </>
            }
          />
        </>
      ),
    },
    {
      id: "rules",
      title: "The traffic rules that make it three tiers",
      body: (
        <>
          <p>
            Subnets alone do not isolate anything; the rules do. The rule set is identical on every
            cloud: each tier accepts traffic only from the tier directly above it.
          </p>
          <Table
            head={["Tier", "Allow inbound from", "Port", "Never allow"]}
            rows={[
              ["Load balancer", "The internet (0.0.0.0/0)", "443, and 80 only to redirect", "Anything else"],
              ["Web servers", "The load balancer only", "80 or 443", "Direct internet access, SSH from anywhere"],
              ["App servers", "The web tier only", "App port, for example 8080", "The load balancer or the internet"],
              ["Database", "The app tier only", "5432 PostgreSQL, 3306 MySQL, 1521 Oracle", "Any public IP at all"],
            ]}
          />
          <p>
            In a <Term aws="VPC" azure="VNet" gcp="VPC network" oci="VCN" /> the rules are written
            as <Term aws="security groups" azure="network security groups" gcp="firewall rules" oci="NSGs or security lists" />.
            For administration, use a managed path such as Session Manager, Bastion, Identity-Aware
            Proxy or the OCI Bastion service instead of opening SSH to the internet.
          </p>
          <Exercise
            title="Break the diagram"
            task={<p>Availability zone 1 loses power. List what happens to each tier, in order, and what a user would notice.</p>}
          >
            <ol>
              <li><strong>Load balancer:</strong> health checks to servers in the failed zone start failing within seconds, and it stops sending traffic there. Capacity is halved but nothing is dropped, provided the surviving zone can carry the load.</li>
              <li><strong>Web and app tiers:</strong> instances in the failed zone are gone. The autoscaler or instance group notices and launches replacements in the healthy zone, if there is quota and subnet address space.</li>
              <li><strong>Database:</strong> if the primary was in the failed zone, the standby is promoted automatically. This takes roughly one to two minutes, during which writes fail and the application must retry.</li>
              <li><strong>User view:</strong> a slow minute or a few errors on requests that touched the database, then normal service.</li>
            </ol>
            <p>
              The lesson: high availability is not just two of everything. You also need spare
              capacity, address space, quota and clients that retry.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Three tiers: web faces the internet through a load balancer, the app tier is private, the data tier is private and reachable only from the app tier.",
    "Duplicate every tier across two zones; the load balancer and the database standby are what make that useful.",
    "AWS subnets are per zone; Azure, Google Cloud and OCI subnets are regional. That changes how many subnets you draw.",
    "AWS and OCI use an internet gateway; Azure and Google Cloud make a resource public through its external IP and a rule that allows the traffic.",
    "Each tier allows inbound traffic only from the tier above it. Write rules by group or tag, not by IP range.",
    "Plan for failure: spare capacity, address space and quota, plus clients that retry during database failover.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "On AWS, what makes a subnet 'public'?",
      options: [
        "Its route table sends 0.0.0.0/0 to an internet gateway",
        "Its name contains the word public",
        "It uses a /24 range",
        "It has a NAT gateway inside",
      ],
      answer: 0,
      explain: "A subnet is public only because of its route to an internet gateway. A NAT gateway sits in a public subnet but does not make other subnets public.",
    },
    {
      kind: "mcq",
      q: "How many subnets do you draw for a three-tier app across two zones on Azure?",
      options: ["Three, because subnets span every zone", "Six, one per tier per zone", "Two, one per zone", "One shared subnet"],
      answer: 0,
      explain: "Azure subnets are regional, so one subnet per tier covers all zones. On AWS they are per zone, giving six.",
    },
    {
      kind: "mcq",
      q: "Which tier should be allowed to receive connections from the internet?",
      options: ["Only the load balancer", "The database", "The app tier", "Every tier"],
      answer: 0,
      explain: "Only the load balancer is public. Web servers accept traffic from it, the app tier from the web tier and the database from the app tier.",
    },
    {
      kind: "mcq",
      q: "Which cloud's VPC is a global resource with regional subnets?",
      options: ["Google Cloud", "AWS", "OCI", "Azure"],
      answer: 0,
      explain: "A Google Cloud VPC network is global; its subnets are regional. Other clouds scope the network to one region.",
    },
    {
      kind: "text",
      q: "What is the name of Azure's resource that filters traffic to subnets and network interfaces (three letters)?",
      format: "***",
      accept: ["nsg"],
      explain: "A network security group (NSG) holds the allow and deny rules for a subnet or NIC.",
    },
  ],
};

lesson.sheet.takeaways = lesson.takeaways;
