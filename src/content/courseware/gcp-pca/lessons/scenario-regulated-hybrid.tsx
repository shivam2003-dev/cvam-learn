import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Hard",
  objectives: [
    "Design a regulated hybrid platform with compliance, residency and recovery requirements",
    "Select connectivity, identity, data protection and perimeter controls together",
    "Plan DR and audit evidence that satisfy regulators",
    "Justify managed services under strict governance",
  ],
  tasks: [
    {
      id: "brief",
      title: "The scenario",
      body: (
        <>
          <p>
            <strong>Contoso Health</strong> operates clinics and wants a clinical data platform on
            Google Cloud. Requirements:
          </p>
          <ol>
            <li>Patient data (HL7 and FHIR) must stay in two named EU regions, with encryption keys controlled by the company.</li>
            <li>Clinic systems and an on-premises EHR must integrate privately with the cloud platform, with 99.9% availability.</li>
            <li>Data scientists may analyse de-identified data only; raw data must not leave the secured environment.</li>
            <li>RPO of 15 minutes and RTO of 2 hours for the clinical API; full audit trail kept 10 years.</li>
            <li>Administrators must have just-in-time privileged access with approvals.</li>
            <li>A summarisation assistant for clinicians must not leak patient identifiers into prompts or logs.</li>
          </ol>
        </>
      ),
    },
    {
      id: "arch",
      title: "Reference architecture",
      body: (
        <>
          <Figure caption="Secured zone (perimeter) holds identifiable data; a de-identification pipeline feeds an analytics zone; connectivity and keys are controlled.">
            <Graph
              label="On-premises EHR connects over Interconnect to a Cloud Healthcare API in a VPC Service Controls perimeter, with a de-identification pipeline feeding an analytics BigQuery zone and an AI assistant protected by Model Armor"
              cellW={200}
              cellH={96}
              nodeW={170}
              nodes={[
                { id: "ehr", label: "On-premises EHR / clinics", sub: "HL7 / FHIR", col: 0, row: 0.5, tone: "sky" },
                { id: "ic", label: "Interconnect + HA VPN backup", col: 1, row: 0.5, tone: "amber" },
                { id: "hc", label: "Cloud Healthcare API", sub: "FHIR store, EU regions", col: 2, row: 0, tone: "lime", shape: "db" },
                { id: "deid", label: "De-identification", sub: "Sensitive Data Protection", col: 2, row: 1, tone: "lime" },
                { id: "bq", label: "Analytics BigQuery", sub: "de-identified only", col: 3, row: 1, tone: "plain", shape: "db" },
                { id: "ai", label: "Clinician assistant", sub: "Gemini + Model Armor", col: 3, row: 0, tone: "rose" },
              ]}
              groups={[{ label: "VPC Service Controls perimeter (EU)", c1: 2, r1: 0, c2: 3, r2: 1, tone: "lime" }]}
              edges={[
                { from: "ehr", to: "ic" },
                { from: "ic", to: "hc" },
                { from: "hc", to: "deid" },
                { from: "deid", to: "bq" },
                { from: "hc", to: "ai", dashed: true },
              ]}
            />
          </Figure>
          <Table
            head={["Requirement", "Control"]}
            rows={[
              ["Residency and keys", "Org policy gcp.resourceLocations (EU locations only); Cloud Healthcare API datasets in the two EU regions; CMEK (or EKM) with EU key rings; Assured Workloads folder where mandated"],
              ["Private hybrid integration", "Two Interconnect attachments in separate edge availability domains (99.9%) plus HA VPN backup; Cloud Router; Cloud DNS forwarding; private service connectivity and restricted.googleapis.com VIPs"],
              ["De-identified analytics only", "Dataflow/DLP de-identification into a separate project; VPC SC perimeters per zone; column-level security; analysts have no access to the raw FHIR store"],
              ["RPO 15 min / RTO 2 h", "Cross-region replication/export of FHIR stores and cross-region BigQuery dataset copies, warm standby services in the second EU region, tested failover runbook; Backup and DR for VMs"],
              ["10-year audit", "Admin Activity and Data Access logs on in-scope services; aggregated sink to a Cloud Storage bucket with 10-year locked retention; BigQuery copy for analysis"],
              ["JIT privileged access", "Privileged Access Manager with approvals; separate admin identities; Access Approval for Google personnel; Policy Analyzer reviews"],
              ["AI without leaking PHI", "De-identify context before prompting; Model Armor templates for sensitive data and injection; regional EU Gemini endpoints; log redaction; no PHI in training data"],
            ]}
          />
        </>
      ),
    },
    {
      id: "trade",
      title: "Trade-offs and traps",
      body: (
        <>
          <ul>
            <li><strong>Key custody:</strong> EKM maximises control but adds latency and a dependency on the external key manager; CMEK is simpler. State the reason for the choice.</li>
            <li><strong>Availability target:</strong> 99.9% justifies two Interconnects in one metro; 99.99% would require four across two metros and more cost. Do not over-design.</li>
            <li><strong>Analytics copy vs. remote access:</strong> de-identified copies reduce risk and simplify access but need governance of re-identification risk.</li>
            <li><strong>Multi-region storage trap:</strong> a US multi-region would breach residency; choose EU regional/dual-region locations.</li>
            <li><strong>Compliance is shared:</strong> signing the BAA/DPA and using only covered services is required; logging alone does not make a design compliant.</li>
          </ul>
          <Callout tone="note" title="Evidence for auditors">
            Keep architecture diagrams, policy-as-code (organization policies, Terraform), access
            review reports, DR test results and log retention configuration. Auditors want proof that
            controls operate continuously, not only that they exist.
          </Callout>
          <Exercise
            title="Handle the exception"
            task={<p>A research partner outside the perimeter needs to query the de-identified dataset for one month. How do you allow it without weakening the perimeter?</p>}
          >
            <p>
              Use a narrowly scoped <strong>VPC SC ingress rule</strong> that allows only the
              partner&apos;s identity (or a partner project) to call the BigQuery API on that specific
              dataset project, restricted by source and method; or share through{" "}
              <strong>Analytics Hub</strong> with controls. Time-limit the access (remove after a
              month, or IAM condition), keep the dataset de-identified, and review the audit logs.
              Do not widen the perimeter or grant broad access levels.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Combine residency, key custody, perimeter, de-identification, connectivity and audit into one coherent design.",
    "Size availability and DR to the stated targets; avoid over-engineering.",
    "AI features need de-identified inputs, screening and regional endpoints.",
    "Exceptions use narrow ingress/egress rules and time limits, not wider perimeters.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service stores HL7 v2 and FHIR data with healthcare-specific APIs?",
      options: ["Cloud Healthcare API", "Cloud Spanner only", "Memorystore", "Pub/Sub only"],
      answer: 0,
      explain: "The Cloud Healthcare API provides FHIR, HL7v2 and DICOM stores.",
    },
    {
      kind: "mcq",
      q: "How do you prevent analysts from seeing identifiers while still enabling analytics?",
      options: ["De-identify with Sensitive Data Protection into a separate analytics dataset", "Give them Owner", "Disable audit logs", "Use Standard Tier networking"],
      answer: 0,
      explain: "De-identified copies in a separate zone limit exposure.",
    },
    {
      kind: "mcq",
      q: "Which grants time-bound, approved administrator access?",
      options: ["Privileged Access Manager", "Basic Editor role", "Service account keys", "Firewall tags"],
      answer: 0,
      explain: "PAM provides just-in-time elevation with approvals and audit.",
    },
    {
      kind: "mcq",
      q: "What is the best way to retain audit logs for 10 years tamper-resistantly?",
      options: ["Sink to a Cloud Storage bucket with a locked retention policy", "Keep in the default log bucket", "Email the logs", "Store on VM disks"],
      answer: 0,
      explain: "Locked retention prevents deletion before the period ends.",
    },
    {
      kind: "text",
      q: "Which control enforces that resources are created only in EU locations?",
      format: "*** ******** ******",
      accept: ["organization policy", "org policy", "gcp.resourcelocations", "resource locations"],
      explain: "The gcp.resourceLocations organization policy constraint.",
    },
  ],
};
