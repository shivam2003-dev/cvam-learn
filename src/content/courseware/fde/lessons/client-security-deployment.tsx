import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
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
          <DiagramReference lesson="client-security-deployment" panel={1} />
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
          <DiagramReference lesson="client-security-deployment" panel={2} />
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
          <DiagramReference lesson="client-security-deployment" panel={3} />

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
