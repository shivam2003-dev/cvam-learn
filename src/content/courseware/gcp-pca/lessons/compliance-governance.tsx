import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Map regulations (health records, children's privacy, GDPR, PCI) to technical controls",
    "Use Assured Workloads, resource location constraints and data residency features",
    "Describe Cloud Audit Logs, Access Transparency and Access Approval",
    "Plan evidence collection for audits and certifications such as SOC 2",
  ],
  tasks: [
    {
      id: "reg",
      title: "From regulation to control",
      body: (
        <>
          <Table
            head={["Concern", "Examples", "Typical controls on Google Cloud"]}
            rows={[
              ["Health record privacy", "HIPAA (US), regional equivalents", "Sign a Business Associate Agreement; use covered services; encryption, access logging, VPC Service Controls; Cloud Healthcare API with de-identification"],
              ["Children's privacy", "COPPA, GDPR-K", "Data minimisation, consent flows, restricted access and retention, deletion pipelines"],
              ["Data privacy", "GDPR, CCPA, local laws", "Data mapping, residency, DLP classification, right-to-erasure workflows, DPAs"],
              ["Data sovereignty and ownership", "Local storage and operational control mandates", "Resource location constraints, Assured Workloads, EKM, Sovereign Controls, key custody"],
              ["Payment card data", "PCI DSS", "Isolate cardholder environment in separate projects/VPCs, tokenisation, strong access control, logging, segmentation"],
              ["Industry certifications", "SOC 1/2/3, ISO 27001, FedRAMP, HITRUST", "Use Google's compliance reports (Compliance Reports Manager), map your controls, collect evidence"],
            ]}
          />
          <Callout tone="note" title="Shared responsibility again">
            Google Cloud holds certifications for its infrastructure and many services, but
            compliance of <em>your workload</em> is yours. Use only in-scope services, configure them
            correctly, and document the controls.
          </Callout>
        </>
      ),
    },
    {
      id: "controls",
      title: "Residency, Assured Workloads and transparency",
      body: (
        <>
          <ul>
            <li><strong>Organization policy <code>gcp.resourceLocations</code></strong> restricts where new resources can be created (for example <code>in:eu-locations</code>); choose service locations (regional, multi-region) accordingly.</li>
            <li><strong>Assured Workloads</strong> creates compliance-controlled folders for regimes such as FedRAMP, CJIS, IL4/5, EU sovereign options, with enforced locations, personnel access controls and key requirements.</li>
            <li><strong>Access Transparency</strong> logs actions by Google personnel on your content; <strong>Access Approval</strong> requires your approval before they access it; <strong>Key Access Justifications</strong> adds reasons for EKM key requests.</li>
            <li><strong>Cloud Audit Logs:</strong> Admin Activity (always on, free), Data Access (off by default except BigQuery; enable for sensitive services), System Event, and Policy Denied logs. Export to locked, retained storage.</li>
            <li><strong>Data lifecycle:</strong> retention policies, deletion workflows, backups with the same residency, and tested erasure.</li>
          </ul>
          <CloudDiagram course="gcp-pca" id="compliance-governance-diagram-1" />
        </>
      ),
    },
    {
      id: "audit",
      title: "Audits and logging design",
      body: (
        <>
          <ul>
            <li><strong>Aggregated log sinks</strong> at the organization level route logs to a central project: BigQuery for analysis, Cloud Storage (with retention lock) for long-term evidence, Pub/Sub for SIEM export.</li>
            <li>Enable <strong>Data Access audit logs</strong> for in-scope services (cost and volume tradeoff) and exclude noisy low-value logs by filter.</li>
            <li>Use <strong>log buckets</strong> with CMEK, regional locations, custom retention and Log Analytics for queries; lock the <code>_Required</code> bucket retention behaviour (400 days) and apply IAM separation so admins cannot erase their own trail.</li>
            <li>Run periodic <strong>access reviews</strong> with Policy Analyzer and IAM Recommender; test restores and deletion processes; keep the evidence.</li>
          </ul>
          <Exercise
            title="Health data in the EU"
            task={<p>A health-tech company will store patient records. Requirements: EU-only storage and processing, HIPAA-aligned controls for US customers, customer-controlled keys, and a full audit trail retained for 6 years. What do you configure?</p>}
          >
            <p>
              Use EU regions and an org policy <code>gcp.resourceLocations</code> restricted to EU
              locations; Assured Workloads folders where a regime applies; sign the BAA and use only
              covered services; CMEK (or EKM) with key rings in the EU and separated key admin roles;
              VPC Service Controls around data projects; enable Data Access audit logs and route them
              through an aggregated sink to a locked Cloud Storage bucket with a 6-year retention
              policy; de-identify analytics data with Sensitive Data Protection; IAM groups with PAM
              for administrators.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Translate each regulation into concrete controls and use only in-scope services; compliance of the workload is yours.",
    "Residency: gcp.resourceLocations, regional services, Assured Workloads, EKM.",
    "Audit logs: Admin Activity always on; enable Data Access logs for sensitive services; centralise and lock retention.",
    "Access Transparency and Access Approval add visibility and control over Google personnel access.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which audit log type is enabled by default and cannot be disabled?",
      options: ["Admin Activity", "Data Access for all services", "Debug logs", "Packet logs"],
      answer: 0,
      explain: "Admin Activity audit logs are always on; Data Access logs are mostly off by default.",
    },
    {
      kind: "mcq",
      q: "How do you restrict resource creation to EU locations?",
      options: ["Organization policy gcp.resourceLocations", "Firewall rule", "Cloud CDN", "IAM Viewer"],
      answer: 0,
      explain: "The resource locations constraint limits where resources can be created.",
    },
    {
      kind: "mcq",
      q: "Which service requires your approval before Google personnel access your content?",
      options: ["Access Approval", "Access Transparency alone", "Cloud Armor", "Cloud NAT"],
      answer: 0,
      explain: "Access Approval requires explicit approval; Access Transparency only logs the access.",
    },
    {
      kind: "mcq",
      q: "Which service creates compliance-controlled folders for regimes like FedRAMP?",
      options: ["Assured Workloads", "Cloud Build", "Dataflow", "Cloud Deploy"],
      answer: 0,
      explain: "Assured Workloads applies controls and location constraints for regulated regimes.",
    },
    {
      kind: "text",
      q: "Which US regulation protects health records (acronym)?",
      format: "*****",
      accept: ["hipaa"],
      explain: "HIPAA governs protected health information in the US.",
    },
  ],
};
