import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why Infrastructure as Code improves security and where it adds new risks",
    "Scan templates for misconfigurations before they reach a live account",
    "Keep secrets out of templates, variables and state files",
    "Give each serverless function its own narrow permissions and a cap on runaway use",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: clicking is not repeatable",
      body: (
        <>
          <p>
            Imagine building a server farm by clicking through a cloud console. Nobody records the
            exact steps. A month later, a second environment is built from memory and one setting is
            different. Nobody can say which one is correct, and an auditor can't see what changed.
          </p>
          <p>
            <strong>Infrastructure as Code (IaC)</strong> fixes this by describing infrastructure
            in text files. Tools such as Terraform, AWS CloudFormation, Azure Bicep and Pulumi read
            the files and create the resources. Because it is just text, you get the same benefits
            as software: version history, peer review, testing and the ability to rebuild an
            environment from scratch.
          </p>
          <p>
            For security this is a big gain. You can review a firewall rule in a pull request
            before it exists, scan it by machine, and roll back a bad change. But the same power
            can copy a mistake to a hundred accounts in seconds, so the checks matter.
          </p>
        </>
      ),
    },
    {
      id: "iac-risks",
      title: "Where IaC goes wrong",
      body: (
        <>
          <Table
            head={["Risk", "How it shows up", "Defence"]}
            rows={[
              ["Insecure defaults copied around", "A shared module opens a port or skips encryption", "Scan templates; publish hardened modules"],
              ["Secrets in code", "A password or key is written into a template or committed variable file", "Use a secrets manager; secret scanning in CI"],
              ["Secrets in state", "The tool's state file stores resource values in plain text", "Encrypted remote state with tight access"],
              ["Drift", "Someone edits the live resource by hand and it no longer matches the code", "Detect drift; limit console write access"],
              ["Over-powerful pipeline", "The deploy role can do anything in the account", "Least-privilege deploy role per environment"],
              ["Untrusted modules", "A third-party module changes or contains unwanted resources", "Pin versions; review before upgrading"],
            ]}
          />
          <Callout tone="warn" title="State files are sensitive">
            Terraform-style state records the real values of your resources, and that can include
            database passwords and keys. Never commit state to Git. Store it in a remote backend
            with encryption and locking, and let only the deploy pipeline and a few admins read
            it.
          </Callout>
        </>
      ),
    },
    {
      id: "scanning",
      title: "Scan before you apply",
      body: (
        <>
          <p>
            The cheapest place to catch a misconfiguration is before it exists. Static IaC scanners
            read your files and flag known bad patterns. Checkov and Trivy are two widely used
            open-source options, and CloudFormation has its own linter, cfn-lint. Run them on your
            own repository:
          </p>
          <pre>
            <code>{`# Check syntax and internal consistency
terraform validate

# Scan the current folder for misconfigurations
checkov -d .
trivy config .

# Save a plan and review exactly what will change
terraform plan -out=tfplan`}</code>
          </pre>
          <p>
            A good pipeline runs these in order: format check, validate, scan, plan, human review,
            then apply. Make the scan a required step so a failing rule blocks the merge.
          </p>
          <p>
            Here is a fix a scanner would ask for. This Terraform block turns on all four public
            access protections for a bucket you define:
          </p>
          <pre>
            <code>{`resource "aws_s3_bucket" "reports" {
  bucket = "example-reports-bucket"
}

resource "aws_s3_bucket_public_access_block" "reports" {
  bucket                  = aws_s3_bucket.reports.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

variable "db_password" {
  type      = string
  sensitive = true   # hides the value in plan output
}`}</code>
          </pre>
          <Callout tone="note">
            The <code>sensitive</code> flag only hides a value from console output. It does not
            remove it from state. Pass the real secret in at run time from a secrets manager, and
            protect the state itself.
          </Callout>
          <p>
            Scanners also produce false alarms, so allow documented exceptions. Record why a rule
            was waived, who agreed, and when to review it again. An exception list with no owners
            quickly turns into a hole.
          </p>
        </>
      ),
    },
    {
      id: "serverless",
      title: "Serverless: no server to patch, still plenty to secure",
      body: (
        <>
          <p>
            In serverless computing you upload a function and the provider runs it when an event
            arrives, such as a web request, a file upload or a queue message. Examples are AWS
            Lambda, Azure Functions and Google Cloud's function services. The provider owns the
            servers, operating system and runtime patching. You still own your code, its
            configuration, its permissions and its data. The shared responsibility line moves, but
            it does not vanish.
          </p>
          <p>The main risks and fixes:</p>
          <ul>
            <li>
              <strong>Shared execution role.</strong> If every function uses one broad role, a flaw
              in the smallest function exposes everything. Give each function its own role with
              only the actions it needs.
            </li>
            <li>
              <strong>Untrusted event data.</strong> A function can be triggered by a file name, a
              queue message or a web body. Treat all of it as input from an outsider. Validate it
              and use parameterized queries, as the Injection and XSS lesson explains.
            </li>
            <li>
              <strong>Secrets in environment variables.</strong> They are easy to leak through
              logs and error dumps. Fetch secrets at run time from a secrets service.
            </li>
            <li>
              <strong>Vulnerable dependencies.</strong> A function is mostly libraries. Scan and
              update them like any other application.
            </li>
            <li>
              <strong>Runaway cost.</strong> A flood of requests can run up a huge bill, sometimes
              called a denial-of-wallet. Set concurrency limits, timeouts and budget alerts.
            </li>
          </ul>
          <p>An example of a narrow role for a function that only reads one queue:</p>
          <pre>
            <code>{`{
  "Effect": "Allow",
  "Action": ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
  "Resource": "arn:aws:sqs:us-east-1:111122223333:example-orders-queue"
}`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "limits",
      title: "Worked example: capping the blast radius",
      body: (
        <>
          <p>
            Suppose a function runs for 2 seconds per call, and you set its reserved concurrency to
            10, meaning at most 10 copies can run at once. The most calls it can finish per second
            is:
          </p>
          <Formula>max calls per second = concurrency ÷ seconds per call</Formula>
          <pre>
            <code>{`10 ÷ 2 = 5 calls per second
5 × 60 × 60 × 24 = 432,000 calls per day (upper bound)`}</code>
          </pre>
          <p>
            Without a limit, an attacker or a bug can push far more through and your bill grows
            with it. With the limit, the worst case is known and you can budget for it. Extra
            requests wait or are rejected instead of consuming more resources. These numbers are
            illustrative, and exact limits and prices depend on your provider and plan.
          </p>
          <Callout tone="warn">
            Test your functions and pipelines only in accounts you own or are authorised to assess.
            Sending crafted input to someone else's endpoint, even to "see what happens", is not
            acceptable without written permission.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "IaC makes infrastructure reviewable, repeatable and scannable, but it can also copy mistakes quickly.",
    "Scan templates in CI and require them to pass before apply.",
    "Keep secrets out of code, variables and Git, and protect state files as sensitive data.",
    "Give every serverless function its own least-privilege role and treat all event data as untrusted.",
    "Set concurrency, timeout and budget limits so a flood cannot become a surprise bill.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why is a Terraform state file sensitive?",
      options: [
        "It holds the real values of resources, which can include secrets",
        "It contains the source code of the cloud provider",
        "It is always public by design",
        "It only stores comments",
      ],
      answer: 0,
      explain: "State records real resource values, so it needs encryption and restricted access.",
    },
    {
      kind: "mcq",
      q: "Where is the best place in a pipeline to catch a misconfigured firewall rule?",
      options: [
        "After deployment, when users complain",
        "During the annual audit",
        "In a scan step before the change is applied",
        "Never, scanners are unreliable",
      ],
      answer: 2,
      explain: "Scanning before apply is cheapest because the bad resource never exists.",
    },
    {
      kind: "mcq",
      q: "A team gives all of its functions one shared admin-level role. What is the main problem?",
      options: [
        "The functions run slower",
        "One flaw in any function exposes everything the role can reach",
        "The provider will refuse the deployment",
        "It breaks version control",
      ],
      answer: 1,
      explain: "A shared broad role means the weakest function sets the blast radius for all of them.",
    },
    {
      kind: "text",
      q: "A function takes 4 seconds per call and its reserved concurrency is 20. What is the maximum number of calls it can complete per second?",
      format: "*",
      accept: ["5", "five"],
      explain: "20 ÷ 4 = 5 calls per second.",
    },
    {
      kind: "text",
      q: "What one-word term describes the live infrastructure no longer matching its code after a manual change?",
      format: "*****",
      accept: ["drift"],
      explain: "Drift happens when someone edits a resource by hand, so code and reality disagree.",
    },
  ],
};
