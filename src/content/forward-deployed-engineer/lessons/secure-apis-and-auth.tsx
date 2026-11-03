import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Distinguish authentication from authorisation and choose a pattern (API keys, OAuth 2.0, OIDC, mTLS)",
    "Harden an API against the most common attacks",
    "Add security checks to the delivery pipeline (DevSecOps)",
  ],
  tasks: [
    {
      id: "authn",
      title: "Authentication and authorisation",
      body: (
        <>
          <p>
            <strong>Authentication</strong> answers "who are you?". <strong>Authorisation</strong>{" "}
            answers "what may you do?". Enterprise customers care about both, and about proving
            them in audits.
          </p>
          <Table
            head={["Mechanism", "Use for", "Notes"]}
            rows={[
              ["API key", "Simple server-to-server calls", "Treat as a password; rotate; scope per client"],
              ["OAuth 2.0", "Delegated access to another system on a user's behalf", "Use authorization code flow with PKCE for apps"],
              ["OIDC / SSO (SAML)", "Employees signing in with the company identity provider", "Customers will require this"],
              ["JWT access tokens", "Stateless proof of identity and claims", "Verify signature, issuer, audience and expiry"],
              ["mTLS", "Strong service-to-service identity", "Common in locked-down networks"],
              ["Service accounts / workload identity", "Cloud workloads calling cloud APIs", "Prefer over long-lived keys"],
            ]}
          />
          <ul>
            <li>Use role-based or attribute-based access, and deny by default.</li>
            <li>Check authorisation on the server for every request, on every object.</li>
            <li>Never invent your own crypto or password storage; use proven libraries and hashing like Argon2 or bcrypt.</li>
          </ul>
        </>
      ),
    },
    {
      id: "api",
      title: "API hardening",
      body: (
        <>
          <p>The OWASP API Security Top 10 is a good checklist. The ones that bite most often:</p>
          <ul>
            <li>
              <strong>Broken object-level authorisation.</strong> A user changes an ID in the URL
              and sees someone else's record. Always check ownership.
            </li>
            <li>
              <strong>Broken authentication.</strong> Weak tokens, no expiry, no rate limit on
              login.
            </li>
            <li>
              <strong>Excessive data exposure.</strong> Returning whole database rows. Return only
              the needed fields.
            </li>
            <li>
              <strong>No rate limiting.</strong> Lets one client exhaust resources or brute-force.
            </li>
            <li>
              <strong>Injection.</strong> Use parameterised queries and validate inputs.
            </li>
            <li>
              <strong>Misconfiguration.</strong> Verbose errors, open CORS, default credentials,
              debug mode.
            </li>
          </ul>
          <pre>
            <code>{`# object-level check: never trust the ID alone
invoice = db.get_invoice(invoice_id)
if invoice is None or invoice.tenant_id != current_user.tenant_id:
    raise NotFound()   # same response for missing and forbidden`}</code>
          </pre>
          <Callout tone="warn">
            Use TLS everywhere, store secrets in a secrets manager, and never log tokens, keys or
            personal data.
          </Callout>
        </>
      ),
    },
    {
      id: "devsecops",
      title: "DevSecOps",
      body: (
        <>
          <p>
            Security found late is expensive. Build checks into the pipeline so they run on every
            change.
          </p>
          <Table
            head={["Check", "What it finds"]}
            rows={[
              ["Secret scanning", "Keys and tokens committed to Git"],
              ["Dependency scanning (SCA)", "Libraries with known vulnerabilities"],
              ["Static analysis (SAST)", "Insecure code patterns"],
              ["Container image scan", "Vulnerable base images and packages"],
              ["IaC scan", "Open buckets, wide-open security groups"],
              ["Dynamic tests (DAST)", "Issues in the running app"],
              ["SBOM and signing", "Proof of what is in an artifact and who built it"],
            ]}
          />
          <Callout tone="note">
            Expect a customer security questionnaire or review before go-live. Having these checks,
            an architecture diagram and a data-flow description ready shortens it by weeks.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Authentication proves identity; authorisation limits actions; enforce both on the server per object.",
    "Pick API keys, OAuth/OIDC, JWT, mTLS or workload identity to fit the case; support customer SSO.",
    "Guard against broken object authorisation, data exposure, missing rate limits and injection.",
    "Automate secret, dependency, code, image and IaC scanning in CI.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A user changes /invoices/41 to /invoices/42 and sees another company's invoice. Which flaw is this?",
      options: [
        "Broken object-level authorisation",
        "Slow database",
        "CSS bug",
        "Weak Wi-Fi",
      ],
      answer: 0,
      explain: "The server failed to verify that the requested object belongs to the caller.",
    },
    {
      kind: "mcq",
      q: "Which OAuth 2.0 flow is recommended for web and mobile apps acting for a user?",
      options: [
        "Authorization code with PKCE",
        "Passing the password in the URL",
        "No flow at all",
        "Sharing one global token",
      ],
      answer: 0,
      explain: "Authorization code with PKCE avoids exposing tokens and is the standard recommendation.",
    },
    {
      kind: "mcq",
      q: "Secret scanning in CI helps by:",
      options: [
        "Catching keys committed to Git before they spread",
        "Making builds faster",
        "Encrypting the database",
        "Deleting branches",
      ],
      answer: 0,
      explain: "It detects credentials in code so they can be revoked and removed early.",
    },
  ],
};
