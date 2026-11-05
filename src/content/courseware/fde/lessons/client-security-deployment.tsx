import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Hard",
  objectives: [
    "Compare deployment models: vendor SaaS, single-tenant, customer VPC, on-premises and air-gapped",
    "Draw trust boundaries and explain what crosses each",
    "Design tenant isolation, encryption, key management and data residency",
    "Plan for restricted environments: packaging, updates, telemetry and support",
    "Answer a client's security questionnaire with a clear architecture and evidence",
  ],
  tasks: [
    {
      id: "models",
      title: "Where does it run?",
      body: (
        <>
          <p>
            The first question a security team asks is where the system runs and where the data
            goes. Your answer shapes the architecture more than any other choice, so settle it early
            in discovery.
          </p>
          <Figure caption="Deployment models by who operates the system and where data lives. Moving right gives the customer more control and you more operational burden.">
            <Graph
              label="Five deployment models: vendor SaaS, single-tenant cloud, customer VPC, on-premises and air-gapped, with data location for each"
              cellW={180}
              cellH={112}
              nodeW={150}
              nodes={[
                { id: "saas", label: "Vendor SaaS", sub: "Shared, vendor cloud", col: 0, row: 0, tone: "lime" },
                { id: "single", label: "Single-tenant", sub: "Dedicated, vendor cloud", col: 1, row: 0, tone: "sky" },
                { id: "vpc", label: "Customer VPC", sub: "Customer's cloud account", col: 2, row: 0, tone: "amber" },
                { id: "onprem", label: "On-premises", sub: "Customer data centre", col: 3, row: 0, tone: "rose" },
                { id: "air", label: "Air-gapped", sub: "No external network", col: 4, row: 0, tone: "rose" },
              ]}
              edges={[
                { from: "saas", to: "single", label: "more isolation" },
                { from: "single", to: "vpc", label: "data stays" },
                { from: "vpc", to: "onprem", label: "own hardware" },
                { from: "onprem", to: "air", label: "no internet" },
              ]}
            />
          </Figure>
          <Table
            head={["Model", "Data location", "Who operates", "Typical customers", "Cost to you"]}
            rows={[
              ["Vendor SaaS", "Vendor cloud, shared infrastructure", "Vendor", "Most commercial teams", "Lowest"],
              ["Single-tenant", "Vendor cloud, dedicated resources", "Vendor", "Regulated or large enterprises wanting isolation", "Medium"],
              ["Customer VPC / private cloud", "Customer's cloud account", "Shared; customer provides account and controls", "Banks, healthcare, strict data residency", "High: per-customer deployments"],
              ["On-premises", "Customer data centre", "Customer, with vendor support", "Government, industrial, legacy-heavy firms", "Very high: installation, upgrades, support"],
              ["Air-gapped", "Isolated network, no internet", "Customer", "Defence, intelligence, critical infrastructure", "Highest: offline everything"],
            ]}
          />
        </>
      ),
    },
    {
      id: "boundaries",
      title: "Draw the trust boundaries",
      body: (
        <>
          <p>
            A <strong>trust boundary</strong> separates zones with different levels of trust or
            control. Security reviewers read an architecture by finding every line that crosses one.
            Mark them, and state for each crossing: what data, which protocol, which authentication,
            and which controls.
          </p>
          <Figure caption="A deployment in the customer's cloud with a model call to a managed service. Every dashed boundary crossing is a review item.">
            <Graph
              label="Customer VPC containing app, database and vector index, calling a private model endpoint, with trust boundaries and external dependencies"
              cellW={202}
              cellH={106}
              nodeW={162}
              nodes={[
                { id: "user", label: "Employees", sub: "Corporate network, SSO", col: 0, row: 1, tone: "amber", shape: "pill" },
                { id: "app", label: "Application", sub: "Containers, private subnet", col: 1, row: 1, tone: "lime" },
                { id: "db", label: "Database", sub: "Encrypted at rest", col: 2, row: 0, tone: "sky", shape: "db" },
                { id: "idx", label: "Search index", sub: "Access lists per chunk", col: 2, row: 1, tone: "sky", shape: "db" },
                { id: "vault", label: "Secrets vault", sub: "Customer-managed keys", col: 2, row: 2, tone: "rose" },
                { id: "llm", label: "Model endpoint", sub: "Private link, no retention", col: 3, row: 1, tone: "plain" },
              ]}
              groups={[
                { label: "Customer VPC", c1: 1, r1: 0, c2: 2, r2: 2, tone: "sky" },
                { label: "Provider boundary", c1: 3, r1: 0, c2: 3, r2: 2, tone: "rose" },
              ]}
              edges={[
                { from: "user", to: "app", label: "HTTPS + SSO" },
                { from: "app", to: "db" },
                { from: "app", to: "idx" },
                { from: "app", to: "vault", dashed: true },
                { from: "app", to: "llm", label: "prompt + context" },
              ]}
            />
          </Figure>
          <ul>
            <li>The arrow to the model endpoint is the one most reviewers focus on for AI: what is sent, whether it is retained or used for training, and where it is processed.</li>
            <li>Show where encryption keys live and who controls them.</li>
            <li>Show what egress exists. &ldquo;None except the model endpoint, through a private link&rdquo; is a strong statement.</li>
          </ul>
        </>
      ),
    },
    {
      id: "controls",
      title: "The standard controls",
      body: (
        <>
          <Figure caption="Security controls by layer. A good answer to a questionnaire walks through each layer with the concrete mechanism used.">
            <Layers
              layers={[
                { title: "Governance and audit", note: "Audit logs of access and changes, retention, incident response plan, vulnerability management, certifications such as SOC 2 or ISO 27001.", tone: "amber" },
                { title: "Application", note: "SSO, role-based access, input validation, rate limits, secure defaults, dependency scanning.", tone: "amber" },
                { title: "Data", note: "Encryption at rest and in transit, key management, field-level masking, retention and deletion, residency.", tone: "lime" },
                { title: "Tenant isolation", note: "Separate data stores or enforced tenant IDs on every query; isolation tests; no cross-tenant caches.", tone: "lime" },
                { title: "Network", note: "Private subnets, security groups, private endpoints, egress allow-lists, WAF where public.", tone: "sky" },
                { title: "Platform and supply chain", note: "Hardened images, signed artifacts, SBOM, patching, least-privilege roles for deployment.", tone: "sky" },
              ]}
            />
          </Figure>

          <Table
            head={["Topic", "A strong, specific answer"]}
            rows={[
              ["Encryption", "TLS 1.2+ in transit; AES-256 at rest; keys in the customer's KMS with rotation; option for customer-managed keys"],
              ["Tenant isolation", "Every query is scoped by tenant ID enforced in the data layer; per-tenant encryption keys; isolation covered by automated tests"],
              ["Data residency", "Data and processing stay in the contracted region; model endpoint in the same region"],
              ["Retention and deletion", "Configurable retention; deletion propagates to indexes and backups on a documented schedule"],
              ["Logging", "Structured audit log of who accessed what; logs do not contain secrets or raw personal data beyond need; stored under the same access controls"],
              ["AI-specific", "Prompt injection defences, no training on customer data, output validation, human approval for consequential actions"],
            ]}
          />
        </>
      ),
    },
    {
      id: "restricted",
      title: "Delivering into restricted environments",
      body: (
        <>
          <p>
            In VPC, on-premises and air-gapped deployments, the customer runs your software, so
            delivery and operations become engineering problems in their own right.
          </p>
          <Table
            head={["Concern", "Approach"]}
            rows={[
              ["Packaging", "Container images and Helm or Terraform bundles that contain everything; no pulls from public registries at install time"],
              ["Dependencies", "Pin and vendor all dependencies; provide a software bill of materials; sign artifacts"],
              ["Models", "Support swappable model backends, including self-hosted open models, with documented hardware needs"],
              ["Updates", "Versioned releases with release notes and migration scripts; signed bundles delivered through the customer's approved channel; tested rollback"],
              ["Configuration", "A single documented config surface; no secrets in images; environment validation checks at start-up"],
              ["Telemetry and support", "Local logs and metrics by default; a support bundle command that collects diagnostics the customer can review before sharing"],
              ["Testing", "A pre-flight check script that verifies network paths, permissions, certificates and resources before install"],
            ]}
          />
          <Callout tone="tip" title="Ship a preflight check">
            A script that tests DNS, outbound rules, certificates, disk, memory and permissions
            before installation saves days of back-and-forth, because most failed installs are
            environment problems you can detect in seconds.
          </Callout>
        </>
      ),
    },
    {
      id: "answer",
      title: "Answering the questionnaire",
      body: (
        <>
          <p>
            Customers send long security questionnaires. Keep a maintained set of answers, an
            architecture diagram with trust boundaries, a data-flow description, and your
            certifications, so each review is an update, not a project.
          </p>

          <Exercise
            title="Design for a hospital"
            task={
              <p>
                A hospital wants a clinical-notes summarisation tool. Notes contain personal health
                data and may not leave the hospital&apos;s cloud account or country. They use their
                own identity provider and require audit logs. Choose a deployment model and describe
                three controls and the main risk.
              </p>
            }
          >
            <p>
              <strong>Deployment:</strong> customer VPC in an approved in-country region, with the
              model served from a private endpoint inside the same account (a managed in-region
              service or a self-hosted model). Data never reaches the vendor&apos;s cloud.
            </p>
            <ol>
              <li>
                <strong>Identity and audit:</strong> SSO with the hospital&apos;s identity provider,
                role-based access, and an immutable audit log of every note accessed and summary
                generated.
              </li>
              <li>
                <strong>Data protection:</strong> encryption at rest with customer-managed keys,
                private networking with no general egress, and minimal retention of prompts and
                outputs.
              </li>
              <li>
                <strong>Human oversight:</strong> summaries are drafts for clinicians to confirm,
                with source highlighting, and are never written to the record automatically.
              </li>
            </ol>
            <p>
              <strong>Main risk:</strong> an incorrect or incomplete summary influencing care.
              Mitigate with clinician review, evaluation on labelled notes, and a visible
              &ldquo;AI-generated draft&rdquo; label.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Deployment model (SaaS, single-tenant, VPC, on-premises, air-gapped) is the first design decision in security-sensitive deals.",
    "Mark trust boundaries and describe each crossing: data, protocol, authentication and controls.",
    "Standard controls cover governance, application, data, tenant isolation, network and supply chain.",
    "Restricted environments need self-contained packaging, signed updates, swappable models, local telemetry and a preflight check.",
    "Maintain reusable security answers, diagrams and evidence so each review is quick.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which deployment model keeps data in the customer's own cloud account?",
      options: ["Customer VPC", "Shared vendor SaaS", "Vendor single-tenant", "None"],
      answer: 0,
      explain: "In a customer VPC deployment the software and data run inside the customer's account.",
    },
    {
      kind: "mcq",
      q: "For an AI feature, which arrow do reviewers usually scrutinise most?",
      options: [
        "The one carrying prompts and context to the model provider",
        "The arrow to the logo",
        "The arrow between two internal containers on the same host",
        "The arrow to the printer",
      ],
      answer: 0,
      explain: "It carries potentially sensitive content across a boundary; retention and region matter.",
    },
    {
      kind: "mcq",
      q: "What does a preflight check script accomplish?",
      options: [
        "Detects environment problems before installation fails",
        "Replaces testing",
        "Installs the software silently",
        "Encrypts the disk",
      ],
      answer: 0,
      explain: "Most failed installs stem from network, permission or resource issues that can be checked up front.",
    },
    {
      kind: "mcq",
      q: "How should multi-tenant isolation be enforced?",
      options: [
        "At the data layer on every query, with automated isolation tests",
        "Only in the user interface",
        "By asking users to be careful",
        "It is not necessary",
      ],
      answer: 0,
      explain: "Enforcement in the data layer, tested automatically, prevents cross-tenant leaks.",
    },
    {
      kind: "text",
      q: "What term names a line separating zones with different trust levels on an architecture diagram? (two words)",
      format: "***** ********",
      accept: ["trust boundary", "trust boundaries", "security boundary"],
      explain: "Trust boundaries mark where data or credentials cross between zones of different control.",
    },
  ],
};
