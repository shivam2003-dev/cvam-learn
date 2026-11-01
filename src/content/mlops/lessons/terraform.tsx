import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain declarative infrastructure and the role of state",
    "Read and write Terraform for an ML environment",
    "Read a plan safely, including replacements and drift",
    "Reuse one module across environments with remote state",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Someone built your training environment by clicking through a cloud console last year.
            It has a bucket, GPU machines, network rules and some permissions. Now you need an
            identical copy for staging, and that person has left. Nobody knows which settings
            matter, or why.
          </p>
          <p>
            <strong>Infrastructure as code</strong> means describing those resources in text files
            that you keep in Git. <strong>Terraform</strong> is a popular tool for this.
            (OpenTofu is an open source fork with a compatible workflow.) You get review, history
            and repeatable builds, the same benefits your application code has.
          </p>
          <p>
            Terraform is <strong>declarative</strong>: you describe the end result, and it works
            out the steps. It's like giving a builder a floor plan rather than a list of
            instructions. If the plan says four rooms and three exist, the builder adds one. A
            shell script is the opposite: it lists actions, and a second run may fail or create
            duplicates.
          </p>
          <p>
            For MLOps, Terraform usually owns the slow-changing foundation: artifact buckets, GPU
            machine pools, Kubernetes clusters, container registries and IAM permissions. It
            doesn't train models. It builds the place where training runs.
          </p>
        </>
      ),
    },
    {
      id: "language",
      title: "Writing configuration",
      body: (
        <>
          <p>
            Terraform files are written in HCL and end in <code>.tf</code>. There are a few core
            building blocks:
          </p>
          <Table
            head={["Block", "Purpose"]}
            rows={[
              ["provider", "A plugin that talks to an API, such as AWS or Google Cloud"],
              ["resource", "One thing to create and manage"],
              ["variable", "An input, so one config can serve several environments"],
              ["output", "A value to expose, such as a bucket name"],
              ["data", "Read something that already exists"],
              ["module", "A reusable group of resources"],
            ]}
          />
          <p>Here's a small ML environment: a versioned artifact bucket and some GPU trainers.</p>
          <pre>
            <code>{`terraform {
  required_version = ">= 1.11"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket       = "acme-terraform-state"
    key          = "ml-platform/prod/terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}

variable "environment" {
  type = string
}

variable "trainer_count" {
  type    = number
  default = 1
}

variable "gpu_ami" {
  type        = string
  description = "Machine image with GPU drivers installed"
}

resource "aws_s3_bucket" "artifacts" {
  bucket = "acme-ml-artifacts-\${var.environment}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_instance" "trainer" {
  count         = var.trainer_count
  ami           = var.gpu_ami
  instance_type = "g5.xlarge"

  tags = {
    Name        = "trainer-\${var.environment}-\${count.index}"
    Environment = var.environment
  }
}

output "artifact_bucket" {
  value = aws_s3_bucket.artifacts.bucket
}`}</code>
          </pre>
          <p>
            Notice that <code>aws_s3_bucket_versioning</code> refers to{" "}
            <code>aws_s3_bucket.artifacts.id</code>. That reference tells Terraform the bucket must
            exist first. You rarely specify the order yourself: Terraform builds a dependency graph
            from references.
          </p>
        </>
      ),
    },
    {
      id: "workflow",
      title: "Plan, then apply",
      body: (
        <>
          <pre>
            <code>{`terraform init                           # download providers, set up the backend
terraform fmt                            # format the files
terraform validate                       # check syntax and types
terraform plan -var-file=prod.tfvars -out=tfplan
terraform apply tfplan                   # apply exactly what was reviewed`}</code>
          </pre>
          <p>
            <code>plan</code> compares your code with reality and prints what it would do, without
            changing anything. Treat it like a code diff for infrastructure, and read it each time.
          </p>
          <Table
            head={["Symbol", "Meaning", "Care needed"]}
            rows={[
              ["+", "Create", "Low. Check cost"],
              ["~", "Update in place", "Medium"],
              ["-", "Destroy", "High. Is the data safe?"],
              ["-/+", "Destroy, then create a replacement", "High. Is there downtime or data loss?"],
            ]}
          />
          <p>
            The summary line reads like <code>Plan: 3 to add, 1 to change, 0 to destroy.</code>
          </p>
          <Callout tone="warn">
            A small edit can force a replacement, because some settings can't change on a live
            resource. Renaming a bucket means destroying it, so look for "forces replacement" in
            the plan. The <code>prevent_destroy</code> setting above makes Terraform refuse any
            plan that would delete your model artifacts.
          </Callout>
        </>
      ),
    },
    {
      id: "state",
      title: "State: how Terraform remembers",
      body: (
        <>
          <p>
            Terraform keeps a <strong>state file</strong>, a record that maps each resource in your
            code to the real object in the cloud. That's how it knows{" "}
            <code>aws_instance.trainer[0]</code> is a specific machine, and how it knows to delete
            something after you remove it from the code.
          </p>
          <p>Three rules follow from this:</p>
          <ul>
            <li><strong>Store it remotely,</strong> so that the whole team and CI share one copy. The <code>backend</code> block above does this.</li>
            <li><strong>Lock it,</strong> so that two people can't apply at once and corrupt it. <code>use_lockfile</code> turns on S3 locking in recent versions. Older setups use a DynamoDB table.</li>
            <li><strong>Protect it,</strong> because it can hold secrets in plain text. Restrict access and don't commit it to Git. Do commit <code>.terraform.lock.hcl</code>, which pins provider versions.</li>
          </ul>
          <p>
            <strong>Drift</strong> happens when someone changes a resource outside Terraform, for
            example by resizing a machine in the console. The next plan shows the gap and proposes
            to undo the change. Running plan on a schedule is a cheap way to catch it.
          </p>
          <Callout tone="tip">
            In a team, run this through CI. Post the plan on each pull request, and apply after
            merge. Then every infrastructure change has a reviewer and an audit trail, and nobody
            needs production credentials on a laptop.
          </Callout>
        </>
      ),
    },
    {
      id: "environments",
      title: "One module, many environments",
      body: (
        <>
          <p>
            A <strong>module</strong> is a folder of Terraform files that you call like a function.
            Dev and prod then differ only in their inputs, so staging really does match production.
          </p>
          <pre>
            <code>{`module "training" {
  source        = "./modules/training"
  environment   = "prod"
  trainer_count = var.trainer_count
  gpu_ami       = var.gpu_ami
}`}</code>
          </pre>
          <p>
            Because <code>trainer_count</code> is a variable, cost becomes a code change. Here's an
            illustrative example at $1.00 per hour per machine. Real prices vary by region and
            change often, so check before you plan.
          </p>
          <pre>
            <code>{`Always on:    4 machines × $1.00 × 720 hours  = $2,880 per month
Work hours:   4 machines × $1.00 × 176 hours  = $704 per month
              (8 hours × 22 days = 176 hours)
Saving:       $2,880 − $704                   = $2,176 per month`}</code>
          </pre>
          <p>
            Setting the count to 0 removes the machines, and the bucket stays. A forgotten GPU is
            one of the most common surprise bills in ML, so <code>terraform destroy</code> on a
            short-lived experiment environment is a good habit, provided its important data is
            stored elsewhere.
          </p>
          <p>
            Terraform stops once the machine exists. Installing packages inside that machine is
            configuration management, which is covered in the Ansible lesson.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Terraform is declarative: you describe the end state and it works out the steps.",
    "Read every plan, especially destroy and replace lines.",
    "State maps code to real resources, so keep it remote, locked and private.",
    "Use prevent_destroy on data you can't afford to lose.",
    "Modules with different inputs keep dev, staging and prod consistent.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is Terraform's state file for?",
      options: [
        "Storing model weights",
        "Mapping code to the real resources it manages",
        "Holding provider source code",
        "Logging user sign-ins",
      ],
      answer: 1,
      explain: "State lets Terraform work out what to create, change or delete.",
    },
    {
      kind: "mcq",
      q: "A plan shows -/+ on your artifact bucket. What does it mean?",
      options: [
        "Tags will change",
        "The bucket will be destroyed and recreated",
        "Nothing will happen",
        "The bucket will be copied",
      ],
      answer: 1,
      explain: "That's a replacement, so check what happens to the data before you apply.",
    },
    {
      kind: "mcq",
      q: "Someone resized a machine by hand in the console. What is that called?",
      options: ["Drift", "Lineage", "Skew", "Backfill"],
      answer: 0,
      explain: "Drift is a gap between real infrastructure and what the code and state describe.",
    },
    {
      kind: "text",
      q: "Which Terraform command previews changes without making them?",
      format: "****",
      accept: ["plan", "terraform plan"],
      explain: "terraform plan shows what apply would do.",
    },
    {
      kind: "text",
      q: "3 instances at an illustrative $2 per hour run for 720 hours. What's the monthly cost in dollars?",
      format: "****",
      accept: ["4320", "4,320", "$4320", "$4,320"],
      explain: "3 × $2 × 720 = $4,320.",
    },
  ],
};
