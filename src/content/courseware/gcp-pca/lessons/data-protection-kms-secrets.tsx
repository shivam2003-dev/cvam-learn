import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Describe default encryption at rest and in transit on Google Cloud",
    "Choose between Google-managed keys, CMEK, CSEK, Cloud HSM and Cloud EKM",
    "Manage keys in Cloud KMS: key rings, rotation, destruction, separation of duties",
    "Store secrets with Secret Manager and avoid secrets in code",
    "Discover and de-identify sensitive data with Sensitive Data Protection",
  ],
  tasks: [
    {
      id: "default",
      title: "Encryption by default and key options",
      body: (
        <>
          <p>
            Google encrypts data at rest by default with AES-256 using Google-managed keys, and
            encrypts data in transit between its facilities. You decide whether you need more control.
          </p>
          <CloudDiagram course="gcp-pca" id="data-protection-kms-secrets-diagram-1" />
          <ul>
            <li><strong>Cloud KMS Autokey</strong> automates CMEK creation and assignment with consistent policy.</li>
            <li><strong>Confidential Computing</strong> protects data in use with memory encryption (Confidential VMs, GKE nodes).</li>
          </ul>
        </>
      ),
    },
    {
      id: "kms",
      title: "Operating Cloud KMS",
      body: (
        <>
          <Table
            head={["Concept", "Detail"]}
            rows={[
              ["Key ring and key", "Key rings are regional or multi-regional containers (immutable location); keys have versions; the primary version encrypts new data"],
              ["Protection levels", "Software, HSM, External (EKM)"],
              ["Rotation", "Automatic schedule creates a new primary version; old versions still decrypt existing data (rotate to limit exposure)"],
              ["Destroy", "Scheduled destruction with a waiting period (default 24 hours) before key material is deleted; destroying a key makes data unreadable (crypto-shredding)"],
              ["Location", "The key's location must match the resource's region for most CMEK use; plan multi-region data accordingly"],
              ["IAM", "Separate admin (roles/cloudkms.admin: manages keys) from users (cryptoKeyEncrypterDecrypter) from auditors; grant service agents the encrypter/decrypter role"],
              ["Audit", "Admin activity logs always; enable data access logs for key usage; Key Access Justifications with EKM"],
            ]}
          />
          <Callout tone="tip" title="Separation of duties for keys">
            Put keys in a dedicated security project owned by the security team. Application teams
            get only <code>cryptoKeyEncrypterDecrypter</code> on specific keys through service
            agents; they cannot administer or destroy keys, and key admins cannot read data.
          </Callout>
        </>
      ),
    },
    {
      id: "secrets",
      title: "Secrets and sensitive data",
      body: (
        <>
          <ul>
            <li><strong>Secret Manager</strong> stores API keys, passwords and certificates with versions, IAM per secret, rotation notifications, replication policy (automatic or user-managed regions), CMEK and audit logs. Mount or fetch at runtime (Cloud Run, GKE integrations); never commit secrets to code or images.</li>
            <li><strong>Sensitive Data Protection (Cloud DLP)</strong> discovers and classifies sensitive data (PII, PCI, credentials) across Cloud Storage, BigQuery, Datastore and more with 150+ infoTypes, then <strong>de-identifies</strong> it: redaction, masking, bucketing, tokenisation, format-preserving encryption, date shifting. Use it before analytics, sharing or sending data to AI models.</li>
            <li><strong>Data Loss Prevention in pipelines:</strong> inspect in Dataflow/Cloud Run functions; use discovery to profile new data and attach policy tags in BigQuery.</li>
            <li><strong>Certificates:</strong> Certificate Manager and Certificate Authority Service for public/private PKI.</li>
          </ul>
          <Exercise
            title="Choose the key model"
            task={<p>A bank must be able to revoke Google&apos;s access to its data immediately, keep the key material in its own HSM outside Google Cloud, and log each key use. Which approach?</p>}
          >
            <p>
              <strong>Cloud EKM</strong> with the bank&apos;s external key manager (and Key Access
              Justifications where supported). Data is protected by keys that never leave the external
              HSM; disabling the key in the bank&apos;s system makes the data inaccessible, and key
              usage is logged. CMEK with Cloud HSM keeps keys in Google-operated HSMs, so it would
              not satisfy &ldquo;outside Google Cloud&rdquo;.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Data is encrypted at rest by default; escalate to CMEK, HSM, EKM or CSEK as control requirements grow.",
    "Cloud KMS: keys, versions, rotation, scheduled destruction, location matching and separate admin/user roles.",
    "Secret Manager for secrets; Sensitive Data Protection to discover and de-identify PII.",
    "Confidential Computing protects data in use.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A regulator requires that keys remain outside Google Cloud under customer control. Which?",
      options: ["Cloud EKM", "Google-managed keys", "CMEK in software", "CSEK for BigQuery"],
      answer: 0,
      explain: "Cloud EKM uses keys stored in an external key manager.",
    },
    {
      kind: "mcq",
      q: "Which services support customer-supplied encryption keys (CSEK)?",
      options: ["Cloud Storage and Compute Engine disks", "BigQuery and Spanner", "Pub/Sub and Dataflow", "All services"],
      answer: 0,
      explain: "CSEK is limited to Cloud Storage and Compute Engine persistent disks.",
    },
    {
      kind: "mcq",
      q: "Where should API keys and passwords used by an application be stored?",
      options: ["Secret Manager", "In source code", "In a public bucket", "In instance metadata labels"],
      answer: 0,
      explain: "Secret Manager provides access control, versioning and auditing for secrets.",
    },
    {
      kind: "mcq",
      q: "Which tool can tokenise credit card numbers before analysis?",
      options: ["Sensitive Data Protection", "Cloud Armor", "Cloud NAT", "Cloud CDN"],
      answer: 0,
      explain: "Sensitive Data Protection de-identifies data using masking, tokenisation and encryption.",
    },
    {
      kind: "text",
      q: "Which feature protects data in use by encrypting memory? (two words)",
      format: "************ *********",
      accept: ["confidential computing", "confidential vms", "confidential vm"],
      explain: "Confidential Computing encrypts data while it is being processed.",
    },
  ],
};
