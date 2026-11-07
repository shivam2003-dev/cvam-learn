import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Explain IAM concepts: principals, roles, permissions, policies and inheritance",
    "Choose between basic, predefined and custom roles and apply least privilege",
    "Manage service accounts safely: attached identities, impersonation, no keys",
    "Use IAM conditions, deny policies, Policy Troubleshooter and Recommender",
    "Design separation of duties with groups and the resource hierarchy",
  ],
  tasks: [
    {
      id: "model",
      title: "The IAM model",
      body: (
        <>
          <p>
            An <strong>allow policy</strong> binds <strong>principals</strong> (users, groups,
            service accounts, domains, workforce/workload identities) to <strong>roles</strong>{" "}
            (collections of permissions) on a <strong>resource</strong>. Policies are inherited down
            the hierarchy and are additive: the effective access is the union of grants at the
            resource and all ancestors, minus any matching <strong>deny policy</strong>, subject to{" "}
            <strong>organization policy</strong> constraints and VPC Service Controls.
          </p>
          <Table
            head={["Role type", "Description", "Guidance"]}
            rows={[
              ["Basic", "Owner, Editor, Viewer: broad", "Avoid in production"],
              ["Predefined", "Curated by Google per service (for example roles/storage.objectViewer)", "Default choice"],
              ["Custom", "Your own set of permissions at project or organization level", "When predefined roles are too broad; maintain carefully"],
            ]}
          />
          <CloudDiagram course="gcp-pca" id="iam-resource-hierarchy-diagram-1" />
        </>
      ),
    },
    {
      id: "sa",
      title: "Service accounts and workload identity",
      body: (
        <>
          <ul>
            <li>A <strong>service account</strong> is an identity for a workload. Prefer a <strong>dedicated service account per workload</strong> with minimal roles over the default Compute Engine service account (which historically has the Editor role).</li>
            <li><strong>Avoid long-lived keys.</strong> Attach the service account to the resource (VM, Cloud Run, GKE via Workload Identity Federation for GKE) and use Application Default Credentials. Enforce <code>iam.disableServiceAccountKeyCreation</code> by organization policy.</li>
            <li><strong>Impersonation:</strong> grant <code>roles/iam.serviceAccountTokenCreator</code> so a human or CI job can act as a service account for short-lived tokens (no key file), and <code>roles/iam.serviceAccountUser</code> to let a principal attach it to resources. Treat both as powerful.</li>
            <li><strong>Workload Identity Federation</strong> lets external workloads (AWS, Azure, GitHub Actions, OIDC/SAML IdPs) obtain Google credentials without keys.</li>
            <li><strong>Workforce Identity Federation</strong> lets employees sign in with an external IdP without Google accounts.</li>
          </ul>
          <Callout tone="warn" title="Privilege escalation paths">
            Permissions such as <code>iam.serviceAccounts.actAs</code>, <code>setIamPolicy</code>,
            creating service account keys or custom roles let a user grant themselves more access.
            Grant them sparingly and monitor them in audit logs.
          </Callout>
        </>
      ),
    },
    {
      id: "tools",
      title: "Conditions, tooling and separation of duties",
      body: (
        <>
          <ul>
            <li><strong>IAM Conditions</strong> restrict a grant by time, resource name/tag or request attributes (for example access only during an incident window, or only to resources tagged <code>env=dev</code>). <strong>Tags</strong> allow policy by classification.</li>
            <li><strong>Deny policies</strong> block specific permissions for principals regardless of allows (for example deny deleting log buckets for everyone except a break-glass group).</li>
            <li><strong>Privileged Access Manager</strong> grants time-bound, approved, audited elevation (just in time).</li>
            <li><strong>Policy Troubleshooter</strong> explains why access is allowed or denied; <strong>Policy Analyzer</strong> answers who has access to what; <strong>IAM Recommender</strong> suggests removing unused roles; <strong>Cloud Asset Inventory</strong> exports policies for audit.</li>
            <li><strong>Groups over individuals:</strong> grant roles to Google Groups synced from your IdP; manage membership centrally.</li>
            <li><strong>Separation of duties:</strong> separate who can deploy from who can approve, who administers keys from who uses data, and who manages logs from who generates them. Use different projects and groups for networking, security, and application teams.</li>
          </ul>
          <Exercise
            title="Least privilege"
            task={<p>A CI pipeline in GitHub Actions must deploy to Cloud Run in one project. Today it uses an exported service account key stored as a secret. Redesign it.</p>}
          >
            <p>
              Use <strong>Workload Identity Federation</strong> with GitHub&apos;s OIDC provider so the
              pipeline exchanges its short-lived token for Google credentials by impersonating a
              dedicated deploy service account that has only{" "}
              <code>roles/run.developer</code> and <code>roles/iam.serviceAccountUser</code> on the
              runtime service account. Add an attribute condition restricting to the repository and
              branch, delete the key, and enforce key-creation prevention by organization policy.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Allow policies inherit and union down the hierarchy; deny policies and organization policy restrict even allowed access.",
    "Use predefined roles and groups; avoid basic roles; custom roles only when needed.",
    "Dedicated service accounts, attached identities, impersonation and Workload Identity Federation replace service account keys.",
    "Use conditions, PAM, Policy Troubleshooter/Analyzer and Recommender, and design explicit separation of duties.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which is the recommended way to let a CI system outside Google Cloud deploy without storing keys?",
      options: ["Workload Identity Federation", "Export a service account key", "Share a user password", "Grant Owner to a user"],
      answer: 0,
      explain: "WIF exchanges external identities for short-lived Google credentials.",
    },
    {
      kind: "mcq",
      q: "Roles granted at a folder:",
      options: ["Are inherited by all projects in the folder", "Apply only to the folder resource", "Cannot be combined with project roles", "Are ignored by projects"],
      answer: 0,
      explain: "IAM policies inherit down the hierarchy.",
    },
    {
      kind: "mcq",
      q: "Which feature gives time-bound, approved elevated access?",
      options: ["Privileged Access Manager", "Basic Owner role", "Service account key", "Cloud NAT"],
      answer: 0,
      explain: "PAM provides just-in-time, audited privilege.",
    },
    {
      kind: "mcq",
      q: "Which tool answers why a user was denied access to a resource?",
      options: ["Policy Troubleshooter", "Cloud Trace", "Error Reporting", "Cloud Profiler"],
      answer: 0,
      explain: "Policy Troubleshooter evaluates policies and explains access results.",
    },
    {
      kind: "text",
      q: "Which organization policy constraint family blocks creation of service account keys? (hint: iam.disable...)",
      format: "************ ******* ***** ********",
      accept: ["iam.disableserviceaccountkeycreation", "disableserviceaccountkeycreation", "disable service account key creation"],
      explain: "constraints/iam.disableServiceAccountKeyCreation prevents key creation.",
    },
  ],
};
