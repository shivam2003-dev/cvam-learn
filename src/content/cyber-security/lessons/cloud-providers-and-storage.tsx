import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Map the main identity, network, storage and logging services across AWS, Azure and GCP",
    "Spot the identity, network and storage settings that most often cause cloud breaches",
    "Write a least-privilege policy and read a risky one",
    "Shrink network exposure with a worked address-count example",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: one idea, three vocabularies",
      body: (
        <>
          <p>
            AWS, Microsoft Azure and Google Cloud Platform (GCP) solve the same problems, but each
            gives them different names. A new engineer can easily miss that "security group" on one
            cloud and "network security group" on another are close cousins. The risks are shared
            too. In all three, the breaches that make the news rarely come from some exotic flaw in
            the provider. They come from an open storage bucket, a forgotten access key, or a
            permission that was far too broad.
          </p>
          <p>
            This lesson gives you a translation table, then walks through the three areas where
            mistakes cost the most: identity, networking and storage.
          </p>
          <Table
            head={["Job", "AWS", "Azure", "GCP"]}
            rows={[
              ["Identity and permissions", "IAM", "Microsoft Entra ID and Azure RBAC", "Cloud IAM"],
              ["Private network", "VPC", "VNet", "VPC network"],
              ["Instance-level firewall", "Security group", "Network security group (NSG)", "VPC firewall rules"],
              ["Object storage", "S3", "Blob Storage", "Cloud Storage"],
              ["Key management", "KMS", "Key Vault", "Cloud KMS"],
              ["Audit log of API calls", "CloudTrail", "Activity Log", "Cloud Audit Logs"],
            ]}
          />
        </>
      ),
    },
    {
      id: "identity",
      title: "Identity: the new perimeter",
      body: (
        <>
          <p>
            In the cloud, every action is an API call, and every API call is allowed or denied by
            an identity's permissions. That makes identity the real perimeter. A stolen key with
            wide permissions beats any firewall.
          </p>
          <p>Common identity mistakes, and the fix for each:</p>
          <ul>
            <li>
              <strong>Using the root or global admin account for daily work.</strong> Protect it
              with MFA, lock it away, and use ordinary named accounts with limited roles.
            </li>
            <li>
              <strong>Long-lived access keys.</strong> They get copied into scripts, chat messages
              and Git history. Prefer roles that issue short-lived credentials to people and
              services.
            </li>
            <li>
              <strong>Wildcard permissions.</strong> A policy that allows every action on every
              resource turns one leaked credential into a full account takeover.
            </li>
          </ul>
          <p>Compare a risky AWS-style policy with a least-privilege one:</p>
          <pre>
            <code>{`// RISKY: any action, any resource
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}

// BETTER: read one folder of one bucket, nothing else
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::example-reports-bucket/reports/*"
}`}</code>
          </pre>
          <p>
            Azure and GCP follow the same principle with role assignments. Give the smallest role
            at the smallest scope, such as one resource group or one project, not the whole
            subscription or organisation.
          </p>
          <Callout tone="tip">
            Search your Git history and CI logs for access keys. Many providers and code hosts offer
            secret scanning. If a key ever appears in a repository, treat it as leaked and rotate
            it, even after you delete the commit.
          </Callout>
        </>
      ),
    },
    {
      id: "network",
      title: "Networking: closing the front door",
      body: (
        <>
          <p>
            Cloud firewalls are deny-by-default for inbound traffic, so the danger comes from rules
            people add. The classic mistake is opening an admin port to the whole internet, written
            as <code>0.0.0.0/0</code>. Port 22 (SSH) and port 3389 (RDP) are the usual targets
            because attackers constantly scan for them. You will see this in logs as a steady
            stream of failed logins from many unrelated addresses.
          </p>
          <p>
            The fix is to allow only the addresses that need access, or better, to use the
            provider's managed access service so that no admin port faces the internet at all.
          </p>
          <p>
            Here is the arithmetic behind "smaller is safer". An IPv4 address has 32 bits.
          </p>
          <Formula>addresses in a /n range = 2^(32 − n)</Formula>
          <pre>
            <code>{`0.0.0.0/0        = 2^32 = 4,294,967,296 addresses
203.0.113.0/24   = 2^8  = 256 addresses

4,294,967,296 ÷ 256 = 16,777,216`}</code>
          </pre>
          <p>
            Allowing only a /24 office range instead of the whole internet cuts the number of
            addresses that can reach the port by a factor of 16,777,216. The example range{" "}
            <code>203.0.113.0/24</code> comes from a block reserved for documentation. Use your own
            real ranges in practice.
          </p>
          <p>Two more network habits matter:</p>
          <ul>
            <li>
              Put databases and internal services in private subnets with no public address.
            </li>
            <li>
              Turn on flow logs so you can see accepted and rejected connections later.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "storage",
      title: "Storage: the bucket that made the headlines",
      body: (
        <>
          <p>
            Object storage holds files in containers called buckets (S3 and Cloud Storage) or
            containers inside a storage account (Azure Blob Storage). It is cheap, huge and easy
            to share, which is exactly why mistakes spread so far. A single bucket set to public
            can expose backups, customer exports or logs to anyone who finds the address.
          </p>
          <Table
            head={["Control", "What it does"]}
            rows={[
              ["AWS S3 Block Public Access", "Overrides ACLs and policies that would make data public"],
              ["Azure: disable anonymous blob access", "A storage account setting that stops public containers"],
              ["GCP public access prevention", "Blocks granting access to anyone on the internet"],
              ["Uniform bucket-level access (GCP)", "Uses IAM only, so hidden per-object ACLs cannot widen access"],
              ["Encryption with your own key", "Lets you control and audit key use through KMS or Key Vault"],
              ["Versioning and object lock", "Helps recover from deletion and ransomware-style overwrites"],
            ]}
          />
          <p>
            You can inspect and fix a bucket in your own AWS account from the command line. Replace
            the name with a bucket you own:
          </p>
          <pre>
            <code>{`# See the current setting
aws s3api get-public-access-block --bucket example-reports-bucket

# Turn all four protections on
aws s3api put-public-access-block --bucket example-reports-bucket \\
  --public-access-block-configuration \\
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true`}</code>
          </pre>
          <p>
            When you genuinely need to share one file, don't open the bucket. Use a short-lived
            link: a pre-signed URL on AWS, a shared access signature (SAS) on Azure, or a signed
            URL on GCP. Each one expires, so a leaked link stops working.
          </p>
          <Callout tone="warn">
            Only audit buckets and accounts you own or have written permission to assess. Reading
            or listing someone else's storage, even when it is misconfigured, can be illegal.
            Report what you find to the owner instead.
          </Callout>
        </>
      ),
    },
    {
      id: "detect",
      title: "Detecting the change before it hurts",
      body: (
        <>
          <p>
            Prevention fails sometimes, so watch for the actions that weaken security. In AWS
            CloudTrail, these API events deserve an alert because they can open data or hide
            tracks:
          </p>
          <ul>
            <li>
              <code>PutBucketPolicy</code> and <code>PutBucketAcl</code>: someone changed who can
              read a bucket.
            </li>
            <li>
              <code>DeletePublicAccessBlock</code>: the safety net on a bucket was removed.
            </li>
            <li>
              <code>StopLogging</code>: audit logging itself was switched off.
            </li>
          </ul>
          <p>
            Azure and GCP record equivalent changes in the Activity Log and Cloud Audit Logs. Send
            all three to your log platform so one search can cover every cloud. The Logs and SIEM
            lesson shows how.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "AWS, Azure and GCP share the same ideas under different names, so learn the mapping once.",
    "Identity is the perimeter: protect root accounts, avoid long-lived keys, and refuse wildcard permissions.",
    "Never expose admin ports such as 22 or 3389 to 0.0.0.0/0.",
    "Block public access on storage by default and share single files with short-lived signed links.",
    "Alert on changes that weaken security, such as public access being enabled or logging being stopped.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which AWS-style policy follows least privilege?",
      options: [
        "Allow all actions on all resources",
        "Allow s3:GetObject on one folder of one bucket",
        "Allow all S3 actions on every bucket",
        "Allow all actions on one account",
      ],
      answer: 1,
      explain: "Least privilege grants only the specific action and resource a task needs.",
    },
    {
      kind: "mcq",
      q: "You must share one report with a partner for an hour. What is the safest approach?",
      options: [
        "Make the whole bucket public",
        "Email your access key",
        "Disable Block Public Access for the day",
        "Create a short-lived pre-signed or signed URL for that object",
      ],
      answer: 3,
      explain: "Signed links expire and cover a single object, so a leak has limited impact.",
    },
    {
      kind: "mcq",
      q: "Which cloud service is the equivalent of an AWS CloudTrail log of API calls?",
      options: [
        "Azure Activity Log",
        "Azure Key Vault",
        "GCP Cloud KMS",
        "Azure VNet",
      ],
      answer: 0,
      explain: "The Azure Activity Log records management actions in a subscription, like CloudTrail does on AWS.",
    },
    {
      kind: "text",
      q: "Which TCP port number does Windows Remote Desktop (RDP) use by default?",
      format: "****",
      accept: ["3389"],
      explain: "RDP listens on TCP 3389. It should never be open to 0.0.0.0/0.",
    },
    {
      kind: "text",
      q: "How many addresses are in a /24 IPv4 range?",
      format: "***",
      accept: ["256"],
      explain: "2^(32 − 24) = 2^8 = 256.",
    },
  ],
};
