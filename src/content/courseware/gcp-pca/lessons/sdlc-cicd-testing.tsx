import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Map the software development lifecycle to Google Cloud services",
    "Design CI/CD with Cloud Build, Artifact Registry and Cloud Deploy",
    "Choose deployment strategies: rolling, blue/green, canary",
    "Plan testing and validation of software and infrastructure",
    "Provide a service catalog and self-service provisioning",
  ],
  tasks: [
    {
      id: "pipeline",
      title: "A CI/CD pipeline on Google Cloud",
      body: (
        <>
          <Figure caption="From commit to production. Every stage produces evidence and gates the next.">
            <Flow
              numbered
              steps={[
                { title: "Source", note: "GitHub, GitLab, Developer Connect, Cloud Source Repositories legacy", tone: "sky" },
                { title: "Build + test", note: "Cloud Build triggers, unit tests, SAST", tone: "lime" },
                { title: "Package", note: "Artifact Registry, scan, sign", tone: "lime" },
                { title: "Deploy", note: "Cloud Deploy pipeline: dev → staging → prod", tone: "amber" },
                { title: "Verify + operate", note: "Smoke tests, SLO monitoring, rollback", tone: "rose" },
              ]}
            />
          </Figure>
          <Table
            head={["Service", "Role"]}
            rows={[
              ["Cloud Build", "Serverless CI: build steps in containers, triggers on commits/PRs/tags, private pools for VPC access, substitutions, caching, provenance"],
              ["Artifact Registry", "Stores images, packages, Helm charts; vulnerability scanning"],
              ["Cloud Deploy", "Managed continuous delivery to GKE, Cloud Run (and GKE Enterprise): delivery pipelines, targets, promotion, approvals, canary and parallel deployments, rollback, Skaffold-rendered manifests"],
              ["Cloud Run / GKE / MIG", "Deployment targets with traffic splitting or rolling updates"],
              ["Terraform / Infrastructure Manager", "Infrastructure changes through the same review pipeline"],
              ["Cloud Workstations", "Managed, secure dev environments"],
            ]}
          />
        </>
      ),
    },
    {
      id: "strategy",
      title: "Release strategies",
      body: (
        <>
          <Table
            head={["Strategy", "How", "Pros", "Cons"]}
            rows={[
              ["Rolling", "Replace instances gradually", "No extra capacity needed", "Mixed versions during rollout; slower rollback"],
              ["Blue/green", "Deploy the new stack beside the old and switch traffic", "Instant rollback, full pre-testing", "Double capacity during switch"],
              ["Canary", "Send a small percentage to the new version and increase", "Limits blast radius, real-user validation", "Needs good metrics and traffic splitting"],
              ["Feature flags", "Deploy dark, enable per user/segment", "Decouple deploy from release", "Flag hygiene"],
            ]}
          />
          <ul>
            <li>Cloud Run revisions split traffic by percentage; GKE uses Gateway API/service mesh weighting or Cloud Deploy canary; load balancer URL maps support weighted backends.</li>
            <li>Make deployments <strong>automated, repeatable and reversible</strong>; promote the same artifact through environments; never rebuild per environment.</li>
            <li>Database changes: backward-compatible, expand/contract migrations so old and new versions coexist.</li>
          </ul>
        </>
      ),
    },
    {
      id: "testing",
      title: "Testing, validation and service catalog",
      body: (
        <>
          <ul>
            <li><strong>Test pyramid:</strong> many unit tests, fewer integration tests (use emulators or ephemeral environments), few end-to-end tests; add contract tests for APIs.</li>
            <li><strong>Non-functional testing:</strong> load and performance tests against SLOs, resilience and failure injection, security scans (SAST/DAST/dependency), accessibility, cost checks.</li>
            <li><strong>Infrastructure validation:</strong> <code>terraform plan</code> in CI, policy-as-code checks (Policy Controller/OPA, Terraform validator), drift detection, ephemeral environments from the same modules.</li>
            <li><strong>Service catalog and provisioning:</strong> publish approved Terraform modules or catalogue solutions (Service Catalog, Infrastructure Manager, internal developer platform) so teams provision compliant resources on demand with guardrails.</li>
          </ul>
          <Callout tone="tip" title="Shift left, deploy small">
            Run security and policy checks in pull requests, deploy small changes frequently, and
            measure delivery with the four key metrics: deployment frequency, lead time for changes,
            change failure rate and time to restore service.
          </Callout>
          <Exercise
            title="Design the pipeline"
            task={<p>A team deploys a Cloud Run service. Requirements: automatic deploy to dev on merge, manual approval to prod, 10 percent canary in prod with automatic rollback if errors rise, and only scanned, signed images in prod. Describe the setup.</p>}
          >
            <p>
              Cloud Build trigger on merge builds, tests, scans and pushes the image to Artifact
              Registry and creates a signed attestation. A <strong>Cloud Deploy</strong> delivery
              pipeline has targets dev, staging and prod; dev auto-promotes, prod requires approval
              and uses a <strong>canary strategy</strong> (10 → 50 → 100 percent) with verification
              steps against Cloud Monitoring alerts, and automatic rollback on failure. Binary
              Authorization requires attestation in prod.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Cloud Build → Artifact Registry → Cloud Deploy forms the managed pipeline; promote the same artifact through environments.",
    "Pick rolling, blue/green or canary by risk, capacity and rollback needs; decouple deploy from release with flags.",
    "Test at multiple levels, validate infrastructure and policy in CI, and offer a service catalog for self-service.",
    "Measure delivery with deployment frequency, lead time, change failure rate and time to restore.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service provides managed progressive delivery with approvals to GKE and Cloud Run?",
      options: ["Cloud Deploy", "Cloud Build", "Cloud Scheduler", "Pub/Sub"],
      answer: 0,
      explain: "Cloud Deploy manages delivery pipelines, promotions and canaries.",
    },
    {
      kind: "mcq",
      q: "Which release strategy sends a small share of traffic to the new version first?",
      options: ["Canary", "Big bang", "Recreate", "Blue/green only"],
      answer: 0,
      explain: "Canary releases limit blast radius by testing with a small percentage of traffic.",
    },
    {
      kind: "mcq",
      q: "You want to run CI steps that need access to a private network. Which Cloud Build feature?",
      options: ["Private pools", "Default pool", "Cloud NAT", "Cloud Armor"],
      answer: 0,
      explain: "Private pools run builds in your VPC.",
    },
    {
      kind: "mcq",
      q: "Which practice avoids 'works in staging but not prod' due to rebuilding?",
      options: ["Promote the same immutable artifact", "Rebuild per environment", "Edit the image in prod", "Skip staging"],
      answer: 0,
      explain: "Promoting one tested artifact keeps environments consistent.",
    },
    {
      kind: "text",
      q: "Name one of the four key delivery metrics: deployment frequency, lead time, time to restore service, and what?",
      format: "****** ******* ****",
      accept: ["change failure rate", "change fail rate"],
      explain: "The four key metrics include change failure rate.",
    },
  ],
};
