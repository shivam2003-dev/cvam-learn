import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Map the core building blocks of AWS, GCP and Azure to each other",
    "Deploy into a customer's cloud account with least privilege and a clear network path",
    "Describe infrastructure with Terraform so it is repeatable and reviewable",
  ],
  tasks: [
    {
      id: "map",
      title: "Three clouds, one set of ideas",
      body: (
        <>
          <p>
            Customers pick the cloud; you adapt. The services have different names but the same
            jobs.
          </p>
          <Table
            head={["Need", "AWS", "GCP", "Azure"]}
            rows={[
              ["Virtual machines", "EC2", "Compute Engine", "Virtual Machines"],
              ["Containers", "ECS / EKS / Fargate", "Cloud Run / GKE", "Container Apps / AKS"],
              ["Functions", "Lambda", "Cloud Functions", "Functions"],
              ["Object storage", "S3", "Cloud Storage", "Blob Storage"],
              ["Managed Postgres", "RDS / Aurora", "Cloud SQL / AlloyDB", "Database for PostgreSQL"],
              ["Identity and access", "IAM", "IAM", "Entra ID / RBAC"],
              ["Secrets", "Secrets Manager", "Secret Manager", "Key Vault"],
              ["Hosted LLMs", "Bedrock", "Vertex AI", "Azure OpenAI / AI Foundry"],
            ]}
          />
          <Callout tone="note">
            Learn one cloud well, then translate. The concepts of accounts, networks, identities,
            storage and managed services carry over.
          </Callout>
        </>
      ),
    },
    {
      id: "deploy",
      title: "Deploying into the customer's account",
      body: (
        <>
          <p>
            Often your software runs in the customer's cloud, not yours, because their data cannot
            leave. That brings requirements you must plan for.
          </p>
          <ul>
            <li>
              <strong>Identity.</strong> Ask for a dedicated role or service account with only the
              permissions your system needs. Avoid admin access and long-lived keys; prefer
              short-lived credentials and workload identity.
            </li>
            <li>
              <strong>Network.</strong> Private subnets, VPC peering or private endpoints, egress
              allow-lists. Ask early who owns firewall changes and how long they take.
            </li>
            <li>
              <strong>Data location.</strong> Stay in the approved region; encrypt at rest and in
              transit with their keys if required.
            </li>
            <li>
              <strong>Cost.</strong> Tag resources, set budgets and alerts, and shut down test
              environments.
            </li>
            <li>
              <strong>Landing zone rules.</strong> Follow their naming, tagging and approval
              process.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "terraform",
      title: "Infrastructure as code with Terraform",
      body: (
        <>
          <p>
            Clicking in a console cannot be reviewed, repeated or rolled back. <strong>Terraform</strong>{" "}
            describes infrastructure in files; <code>plan</code> shows what will change and{" "}
            <code>apply</code> does it.
          </p>
          <pre>
            <code>{`resource "aws_s3_bucket" "docs" {
  bucket = "acme-fde-docs-\${var.env}"
}

resource "aws_s3_bucket_public_access_block" "docs" {
  bucket                  = aws_s3_bucket.docs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`}</code>
          </pre>
          <pre>
            <code>{`terraform init
terraform plan -out=tfplan     # review the diff carefully
terraform apply tfplan`}</code>
          </pre>
          <ul>
            <li>Store state remotely with locking, never in Git.</li>
            <li>Use variables and modules so one definition serves dev, staging and production.</li>
            <li>Run <code>plan</code> in CI on every pull request.</li>
            <li>Never put secrets in plain Terraform files.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Compute, storage, database, identity, secrets and hosted LLM services exist in every major cloud.",
    "In customer accounts, use least-privilege roles, private networking, regional data rules and tagged resources.",
    "Terraform makes infrastructure reviewable and repeatable: plan, review, apply, with remote state.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the S3 equivalent on Google Cloud?",
      options: ["Cloud Storage", "Compute Engine", "Cloud Functions", "Key Vault"],
      answer: 0,
      explain: "Object storage is Cloud Storage on GCP and Blob Storage on Azure.",
    },
    {
      kind: "mcq",
      q: "Which access model is best for software running in a customer's AWS account?",
      options: [
        "Root account keys shared by email",
        "A dedicated role with only the needed permissions",
        "Admin for everyone",
        "No authentication",
      ],
      answer: 1,
      explain: "Least privilege limits damage from mistakes and compromise and passes security review.",
    },
    {
      kind: "mcq",
      q: "What does terraform plan do?",
      options: [
        "Applies changes immediately",
        "Shows the changes that would be made without making them",
        "Deletes state",
        "Writes application code",
      ],
      answer: 1,
      explain: "Plan is the review step before apply.",
    },
  ],
};
