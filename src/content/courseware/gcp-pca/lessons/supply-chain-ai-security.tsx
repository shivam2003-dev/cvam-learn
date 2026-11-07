import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Hard",
  objectives: [
    "Describe software supply chain threats and the controls that counter them",
    "Build a secure pipeline with Artifact Registry, vulnerability scanning, provenance and Binary Authorization",
    "Secure AI workloads with Model Armor, Sensitive Data Protection and secure model deployment",
    "Use Security Command Center for posture and threat detection",
  ],
  tasks: [
    {
      id: "chain",
      title: "Securing the software supply chain",
      body: (
        <>
          <p>
            Attackers target the path from source to production: compromised dependencies, tampered
            build steps, poisoned images, stolen credentials. Defend each stage and <em>verify</em>{" "}
            before deploy.
          </p>
          <Figure caption="A secured delivery chain. Each stage produces evidence that the next stage checks.">
            <Flow
              numbered
              steps={[
                { title: "Source", note: "Protected branches, code review, signed commits, Secret scanning", tone: "sky" },
                { title: "Build", note: "Cloud Build, hermetic and isolated; SLSA provenance", tone: "lime" },
                { title: "Store", note: "Artifact Registry, vulnerability scanning, immutable tags", tone: "lime" },
                { title: "Attest", note: "Sign images; attestations after tests and scans", tone: "amber" },
                { title: "Admit", note: "Binary Authorization policy at deploy time", tone: "rose" },
              ]}
            />
          </Figure>
          <Table
            head={["Control", "What it does"]}
            rows={[
              ["Artifact Registry", "Private repositories for container images and language packages; remote and virtual repos; IAM, CMEK, vulnerability scanning via Artifact Analysis"],
              ["Cloud Build provenance", "Generates SLSA build provenance and signed metadata for images"],
              ["Binary Authorization", "Deploy-time enforcement for GKE, Cloud Run and GKE Enterprise: only images with required attestations (signed by trusted attestors) or from allowed repositories may run; break-glass and dry-run modes"],
              ["Container / OS scanning", "Find CVEs in images and VMs; fail the pipeline at a severity threshold"],
              ["Assured Open Source Software", "Google-vetted, built-from-source Java and Python packages"],
              ["Secret handling", "Secret Manager; Secret scanning in repositories; no keys in images"],
              ["Least-privilege pipelines", "Dedicated build service accounts, private pools in your VPC, VPC SC"],
            ]}
          />
        </>
      ),
    },
    {
      id: "ai",
      title: "Securing AI",
      body: (
        <>
          <ul>
            <li><strong>Model Armor</strong> screens prompts and responses for prompt injection and jailbreaks, malicious URLs, harmful content and sensitive data leakage, with templates and enforcement actions; use it at your application or gateway layer for any model.</li>
            <li><strong>Sensitive Data Protection</strong> classifies and de-identifies PII before it enters training data, RAG indexes or prompts, and inspects model outputs.</li>
            <li><strong>Secure model deployment:</strong> private endpoints (Private Service Connect), IAM per endpoint, VPC Service Controls, CMEK for datasets/models/endpoints, separate service accounts for training and serving, signed and scanned model containers, and Model Registry approvals.</li>
            <li><strong>Agent security:</strong> least-privilege tool access, human approval for risky actions, input/output validation, audit logging of tool calls, and rate limits.</li>
            <li><strong>Data governance:</strong> keep prompts, grounding data and outputs in chosen regions; understand retention and logging settings; apply content filters and safety settings.</li>
          </ul>
          <Callout tone="warn" title="Prompt injection is untrusted input">
            Treat retrieved documents, tool results and user prompts as untrusted. Never let model
            output execute actions with more privilege than the requesting user, and validate outputs
            before use.
          </Callout>
        </>
      ),
    },
    {
      id: "scc",
      title: "Posture and threat detection",
      body: (
        <>
          <ul>
            <li><strong>Security Command Center</strong> (Standard, Premium, Enterprise) aggregates findings: misconfigurations (Security Health Analytics), vulnerabilities, threats (Event Threat Detection, Container Threat Detection, VM Threat Detection), compliance reports, attack path simulation, and AI security posture.</li>
            <li><strong>Cloud Audit Logs, Cloud Asset Inventory and Policy Intelligence</strong> provide evidence and investigation data.</li>
            <li><strong>Chronicle / SecOps and SOAR</strong> support detection and response at scale.</li>
          </ul>
          <Exercise
            title="Block unsigned images"
            task={<p>A bank wants only images that passed unit tests, vulnerability scanning and a security review to run on GKE production clusters, and wants proof of what built each image. Design the controls.</p>}
          >
            <p>
              Build in <strong>Cloud Build</strong> with provenance, push to{" "}
              <strong>Artifact Registry</strong> with vulnerability scanning, and have CI create{" "}
              <strong>attestations</strong> (tests passed, scan below threshold, reviewer sign-off)
              signed with Cloud KMS keys. Enable <strong>Binary Authorization</strong> on production
              clusters requiring those attestations; start in dry-run, then enforce, with an audited
              break-glass path. Limit who can create attestations and administer keys.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Secure each stage from source to runtime and verify at deploy: Artifact Registry, provenance, attestations, Binary Authorization.",
    "Model Armor, Sensitive Data Protection and private, scoped model deployment secure AI systems; treat prompts and retrieved content as untrusted.",
    "Security Command Center centralises posture, vulnerabilities and threat findings.",
    "Use separate service accounts and key custody for attestations and models.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service enforces that only attested images may be deployed to GKE?",
      options: ["Binary Authorization", "Cloud Armor", "Cloud NAT", "Cloud CDN"],
      answer: 0,
      explain: "Binary Authorization checks policy and attestations at deploy time.",
    },
    {
      kind: "mcq",
      q: "Which product screens LLM prompts and responses for injection and sensitive data?",
      options: ["Model Armor", "Cloud IDS", "Cloud Router", "Dataplex"],
      answer: 0,
      explain: "Model Armor is designed for generative AI application safety.",
    },
    {
      kind: "mcq",
      q: "Where do you store private container images with vulnerability scanning?",
      options: ["Artifact Registry", "Cloud DNS", "Secret Manager", "Pub/Sub"],
      answer: 0,
      explain: "Artifact Registry stores images and integrates with Artifact Analysis scanning.",
    },
    {
      kind: "mcq",
      q: "A central view of misconfigurations, vulnerabilities and threats is provided by:",
      options: ["Security Command Center", "Cloud Trace", "Cloud Profiler", "Cloud Scheduler"],
      answer: 0,
      explain: "SCC aggregates security findings across the organization.",
    },
    {
      kind: "text",
      q: "What does SLSA provenance describe about an artifact?",
      format: "***** ** ****",
      accept: ["how it was built", "how it was built and by whom", "build origin", "how it was built."],
      explain: "Provenance records how and where an artifact was built, enabling verification.",
    },
  ],
};
