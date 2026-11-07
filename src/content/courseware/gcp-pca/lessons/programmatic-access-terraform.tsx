import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Medium",
  objectives: [
    "Use Cloud Shell, Cloud Shell Editor, Cloud Code and the gcloud, bq and storage CLIs",
    "Authenticate correctly with Application Default Credentials and client libraries",
    "Test locally with emulators for Bigtable, Spanner, Pub/Sub and Firestore",
    "Manage infrastructure as code with Terraform and understand state, modules and drift",
    "Apply Google API access best practices: retries, pagination, quotas, least privilege",
  ],
  tasks: [
    {
      id: "tools",
      title: "Interactive tools and SDKs",
      body: (
        <>
          <Table
            head={["Tool", "What it is", "Notes"]}
            rows={[
              ["Cloud Shell", "Browser terminal with a persistent 5 GB home directory and preinstalled tools", "Authenticated as you; free; ephemeral VM"],
              ["Cloud Shell Editor", "Theia/VS Code based editor in the console", "Edit, debug and deploy; Gemini Code Assist integration"],
              ["Cloud Code", "IDE plugins (VS Code, JetBrains) for Kubernetes and Cloud Run development", "Local debugging with Skaffold, emulators"],
              ["gcloud CLI", "Primary CLI for most services", "Configurations (named profiles), --format, --filter, --impersonate-service-account"],
              ["gcloud storage / gsutil", "Cloud Storage CLI; gcloud storage is the newer, faster implementation", "Parallel composite uploads, rsync"],
              ["bq", "BigQuery CLI", "Queries, loads, dataset management"],
              ["Client libraries", "Idiomatic libraries for Java, Python, Go, Node.js, C#, etc.", "Use ADC; built-in retries and pagination"],
              ["REST/gRPC APIs", "Underlying interface", "API Explorer; discovery documents"],
            ]}
          />
          <pre>
            <code>{`gcloud config configurations create prod
gcloud config set project my-prod-project
gcloud run deploy api --image us-docker.pkg.dev/my-prod-project/app/api:1.4.2 \\
  --region europe-west4 --service-account api-sa@my-prod-project.iam.gserviceaccount.com
gcloud compute instances list --filter="labels.env=prod" --format="table(name,zone,status)"
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM \`proj.ds.events\` WHERE dt = CURRENT_DATE()'`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "auth",
      title: "Authentication and API best practices",
      body: (
        <>
          <ul>
            <li><strong>Application Default Credentials (ADC):</strong> libraries find credentials automatically: environment variable, <code>gcloud auth application-default login</code> for local development, or the attached service account on Google Cloud runtimes. Never ship key files.</li>
            <li><strong>Impersonation</strong> (<code>--impersonate-service-account</code>) tests with the permissions of a service account without keys.</li>
            <li><strong>Resilience:</strong> retry idempotent calls with exponential backoff and jitter; honour 429/503; use deadlines/timeouts; paginate with page tokens; batch requests where supported.</li>
            <li><strong>Quotas:</strong> know per-method rate limits; request increases; use quota projects (<code>x-goog-user-project</code>) for billing attribution.</li>
            <li><strong>Least privilege and scopes:</strong> request only needed roles/scopes; restrict API keys; enable only required APIs.</li>
            <li><strong>Efficiency:</strong> field masks/partial responses, caching, streaming APIs for large data, regional endpoints for residency.</li>
          </ul>
        </>
      ),
    },
    {
      id: "emulators",
      title: "Emulators and local testing",
      body: (
        <>
          <p>
            Local emulators let you develop and run tests without cloud cost or shared state. Google
            provides emulators for <strong>Bigtable, Spanner, Pub/Sub, Firestore and Datastore</strong>{" "}
            via the gcloud CLI (<code>gcloud emulators ...</code>). Set the
            <code> *_EMULATOR_HOST</code> environment variable and the client libraries route to the
            emulator. Use them in CI for fast integration tests; still run a smaller set against real
            services to catch behaviour differences (IAM, quotas, performance).
          </p>
        </>
      ),
    },
    {
      id: "iac",
      title: "Infrastructure as code with Terraform",
      body: (
        <>
          <Figure caption="Terraform workflow. State records what exists; plan shows the diff; apply changes it; pipelines add review and policy checks.">
            <Flow
              numbered
              steps={[
                { title: "Write", note: "Modules, variables, providers", tone: "sky" },
                { title: "Init", note: "Providers, remote backend (GCS)", tone: "lime" },
                { title: "Plan", note: "Diff against state; policy checks", tone: "amber" },
                { title: "Apply", note: "Create/update with approvals", tone: "lime" },
                { title: "Detect drift", note: "Plan on schedule; fix manually changed resources", tone: "rose" },
              ]}
            />
          </Figure>
          <ul>
            <li><strong>State:</strong> store in a versioned Cloud Storage bucket with locking; restrict access; never commit state; separate state per environment/team.</li>
            <li><strong>Modules:</strong> reuse the Cloud Foundation Toolkit modules for projects, networks, IAM and GKE.</li>
            <li><strong>Authentication:</strong> run with a dedicated service account or Workload Identity Federation from CI; avoid user credentials.</li>
            <li><strong>Alternatives:</strong> Infrastructure Manager (managed Terraform), Config Connector (Kubernetes-native), Pulumi, and legacy Deployment Manager.</li>
            <li><strong>Import and drift:</strong> <code>terraform import</code> brings existing resources under management; scheduled plans detect drift.</li>
          </ul>
          <Callout tone="tip" title="Bootstrapping">
            The first run (creating the state bucket, CI service account and project factory) is done
            manually or with a bootstrap step; everything after that runs through the pipeline.
          </Callout>
          <Exercise
            title="Local tests"
            task={<p>A team writes a service that publishes to Pub/Sub and stores data in Firestore. Tests must run in CI quickly without cloud credentials. What do they do?</p>}
          >
            <p>
              Start the <strong>Pub/Sub and Firestore emulators</strong> in the CI job, set the
              emulator host environment variables so the client libraries use them, and run
              integration tests against them with no credentials. Keep a small suite of smoke tests
              against a real dev project (using Workload Identity Federation) before release.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Cloud Shell and Editor, Cloud Code, gcloud, bq, gcloud storage and client libraries cover interactive and programmatic access.",
    "Use ADC and attached service accounts; impersonate for testing; never ship key files.",
    "Emulators exist for Bigtable, Spanner, Pub/Sub and Firestore for fast local and CI tests.",
    "Terraform with remote state, modules, pipelines and drift detection is the standard IaC approach.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which mechanism lets client libraries find credentials automatically?",
      options: ["Application Default Credentials", "Hard-coded keys", "Browser cookies", "Basic auth"],
      answer: 0,
      explain: "ADC checks environment, local gcloud login and attached service accounts.",
    },
    {
      kind: "mcq",
      q: "Which services have official local emulators?",
      options: ["Bigtable, Spanner, Pub/Sub, Firestore", "Cloud Armor and Cloud NAT", "VPC and Interconnect", "Cloud KMS and IAM"],
      answer: 0,
      explain: "Emulators exist for the listed data and messaging services.",
    },
    {
      kind: "mcq",
      q: "Where should Terraform state be stored?",
      options: ["A versioned Cloud Storage bucket with restricted access", "In the Git repo", "On a laptop", "In a public bucket"],
      answer: 0,
      explain: "Remote state in GCS provides locking, versioning and access control.",
    },
    {
      kind: "mcq",
      q: "How do you handle a 429 response from an API?",
      options: ["Retry with exponential backoff and jitter", "Retry immediately in a loop", "Ignore it", "Disable quotas"],
      answer: 0,
      explain: "Backoff with jitter reduces load and improves success.",
    },
    {
      kind: "text",
      q: "Which gcloud flag runs a command as a service account without a key file?",
      format: "************************",
      accept: ["--impersonate-service-account", "impersonate-service-account"],
      explain: "--impersonate-service-account uses short-lived impersonated credentials.",
    },
  ],
};
