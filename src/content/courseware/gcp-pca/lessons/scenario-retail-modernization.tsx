import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Hard",
  objectives: [
    "Work a long design scenario from requirements to a justified architecture",
    "Combine compute, data, networking, security, AI and operations choices coherently",
    "Name the requirement each wrong answer violates",
    "State trade-offs and a phased migration plan",
  ],
  tasks: [
    {
      id: "brief",
      title: "The scenario",
      body: (
        <>
          <p>
            <strong>Fabrikam Retail</strong> runs a monolithic ecommerce site on VMs in two
            colocation data centers. Traffic peaks 10x on sale days and the site has gone down twice.
            The business wants to launch in three new countries (EU and APAC), add personalised
            product search, and cut infrastructure cost. Constraints and requirements:
          </p>
          <ol>
            <li>EU customer personal data must remain in the EU.</li>
            <li>Checkout must reach 99.99% availability and never double-charge an order.</li>
            <li>The platform team has strong VM skills and limited Kubernetes experience.</li>
            <li>The ERP system must stay on-premises for 18 months and exchange orders and stock.</li>
            <li>Card payments must be isolated to reduce PCI scope.</li>
            <li>Release to production several times a week with fast rollback.</li>
          </ol>
        </>
      ),
    },
    {
      id: "design",
      title: "Reference design",
      body: (
        <>
          <Figure caption="Target architecture. Stateless services on Cloud Run behind a global load balancer, transactional data in Spanner, events through Pub/Sub, and a private link to the on-premises ERP.">
            <Graph
              label="Retail platform: global load balancer with Cloud Armor and CDN to Cloud Run services, Spanner, Pub/Sub and BigQuery, with Interconnect to the on-premises ERP"
              cellW={190}
              cellH={92}
              nodeW={160}
              nodes={[
                { id: "u", label: "Shoppers", col: 0, row: 1, tone: "sky", shape: "pill" },
                { id: "lb", label: "Global ALB", sub: "Cloud Armor + CDN", col: 1, row: 1, tone: "lime" },
                { id: "web", label: "Cloud Run: storefront + checkout", sub: "regions: EU, US, APAC", col: 2, row: 1, tone: "lime" },
                { id: "db", label: "Spanner multi-region", sub: "orders, inventory", col: 3, row: 0, tone: "amber", shape: "db" },
                { id: "ps", label: "Pub/Sub", sub: "order events", col: 3, row: 1, tone: "amber" },
                { id: "bq", label: "BigQuery + Vertex AI Search", sub: "analytics, personalised search", col: 3, row: 2, tone: "plain" },
                { id: "erp", label: "On-premises ERP", sub: "Interconnect + Cloud Router", col: 4, row: 1, tone: "sky" },
              ]}
              edges={[
                { from: "u", to: "lb" },
                { from: "lb", to: "web" },
                { from: "web", to: "db" },
                { from: "web", to: "ps" },
                { from: "ps", to: "bq" },
                { from: "ps", to: "erp", label: "orders" },
                { from: "web", to: "bq", dashed: true },
              ]}
            />
          </Figure>
          <Table
            head={["Requirement", "Decision", "Reason"]}
            rows={[
              ["Spikes and stability", "Cloud Run with autoscaling and min instances; Cloud CDN for catalogue pages", "Absorbs 10x without capacity planning; removes server patching for a VM-skilled team"],
              ["Skills", "Cloud Run first, GKE Autopilot only where Kubernetes is truly required", "Avoids a steep Kubernetes learning curve"],
              ["99.99% checkout, no double charge", "Multi-region Spanner for orders; idempotency keys on payment calls; Pub/Sub with dead-letter topics", "Strong consistency and automatic failover; safe retries"],
              ["EU data residency", "Separate EU Spanner configuration and EU buckets/BigQuery datasets; org policy gcp.resourceLocations; regional routing by URL map", "Personal data stays in the EU; global control plane unchanged"],
              ["PCI scope", "Delegate card capture to a PCI-compliant payment provider (tokenisation); separate project/VPC for payment service; VPC Service Controls", "Shrinks the cardholder data environment"],
              ["ERP coexistence", "Partner/Dedicated Interconnect with HA VPN backup; Pub/Sub plus a connector (Apigee or Application Integration) for order and stock sync", "Predictable bandwidth and decoupled integration"],
              ["Personalised search", "Vertex AI Search for commerce on catalogue and behaviour data in BigQuery", "Managed relevance and recommendations"],
              ["Fast releases", "Cloud Build + Cloud Deploy with canary on Cloud Run revisions; SLO burn-rate alerts", "Frequent, reversible deployments"],
              ["Cost", "Scale to zero for non-prod, committed use for steady components, lifecycle on logs, BigQuery partitioning", "Pay for use"],
            ]}
          />
        </>
      ),
    },
    {
      id: "why-not",
      title: "Why the alternatives lose",
      body: (
        <>
          <ul>
            <li><strong>Lift and shift the monolith to Compute Engine MIGs only.</strong> Easy, but does not fix scaling pain or cost, and delays the new-country launch.</li>
            <li><strong>Cloud SQL with cross-region replicas for orders.</strong> Replication is asynchronous, so a regional failure can lose committed orders; write scale is vertical.</li>
            <li><strong>One global dataset in a US multi-region.</strong> Violates EU residency.</li>
            <li><strong>Store card numbers yourself with CMEK.</strong> Encryption helps, but the PCI scope remains large; tokenisation through a provider is better.</li>
            <li><strong>Move the ERP at once.</strong> Contradicts the 18-month constraint.</li>
          </ul>
          <Callout tone="tip" title="Phase it">
            Phase 1: landing zone, Interconnect, and the catalogue and search on Cloud Run with CDN.
            Phase 2: cart and checkout with Spanner and events. Phase 3: new countries, then
            decommission colo hardware. Use the strangler pattern behind the load balancer to route
            paths to new services while the monolith shrinks.
          </Callout>
          <Exercise
            title="Add a requirement"
            task={<p>The CISO now requires that no developer can export customer data from BigQuery to a personal project, and the AI search team wants to use Gemini on product descriptions only. What do you add?</p>}
          >
            <p>
              Place the data projects and BigQuery/Cloud Storage APIs in a <strong>VPC Service
              Controls perimeter</strong> with ingress/egress rules only for approved flows; use
              column-level policy tags and authorised views so the AI team sees product text only;
              screen prompts and responses with <strong>Model Armor</strong>; keep Gemini calls on
              regional endpoints in the EU for EU data; and audit access with Data Access logs.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Trace every decision to a stated requirement and say which pillar or constraint it serves.",
    "Cloud Run, Spanner, Pub/Sub and BigQuery give scale, consistency, decoupling and analytics with low ops.",
    "Residency, PCI scope, hybrid coexistence and team skills are the hidden constraints that decide close calls.",
    "Phase the migration with the strangler pattern to reduce risk.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Checkout needs no loss of committed orders on regional failure. Which database fits?",
      options: ["Spanner multi-region", "Cloud SQL with an async cross-region replica", "Firestore in one region", "Bigtable single cluster"],
      answer: 0,
      explain: "Spanner replicates synchronously across regions with strong consistency.",
    },
    {
      kind: "mcq",
      q: "Which option best reduces PCI DSS scope?",
      options: ["Tokenise card data with a compliant payment provider", "Store card numbers encrypted in your database", "Use a bigger VM", "Disable logging"],
      answer: 0,
      explain: "Tokenisation keeps card data out of your systems, shrinking scope.",
    },
    {
      kind: "mcq",
      q: "A team with VM skills needs quick scaling for a stateless web tier. Choose:",
      options: ["Cloud Run", "Self-managed Kubernetes", "Bare Metal Solution", "A single large VM"],
      answer: 0,
      explain: "Cloud Run is serverless and has a small learning curve.",
    },
    {
      kind: "mcq",
      q: "How do you route new paths to new services while the monolith still serves the rest?",
      options: ["URL map rules on the load balancer (strangler pattern)", "DNS A record changes only", "A VPN", "Cloud NAT"],
      answer: 0,
      explain: "A load balancer URL map can send selected paths to new backends gradually.",
    },
    {
      kind: "text",
      q: "Which service provides the private high-bandwidth link to the on-premises ERP in this design? (one word)",
      format: "************",
      accept: ["interconnect"],
      explain: "Partner or Dedicated Interconnect with Cloud Router.",
    },
  ],
};
