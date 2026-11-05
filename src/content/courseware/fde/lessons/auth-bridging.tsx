import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Sequence } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Hard",
  objectives: [
    "Distinguish authentication, authorisation, user identity and service identity",
    "Walk through SSO with OIDC or SAML and the OAuth 2.0 authorisation code flow",
    "Choose between acting as the user, acting as the service, and token exchange",
    "Propagate user permissions through an integration so users never see data they should not",
    "Manage secrets, rotation and revocation across systems",
  ],
  tasks: [
    {
      id: "terms",
      title: "Two questions, two kinds of identity",
      body: (
        <>
          <p>
            Every integration answers two separate questions. <strong>Authentication</strong>: who is
            making this request? <strong>Authorisation</strong>: what are they allowed to do? And
            there are two kinds of caller to identify: a <strong>person</strong> using your
            application, and a <strong>service</strong> (your connector) calling another system.
          </p>
          <p>
            Most customer security reviews are about this exact boundary. The right design depends on
            whether the downstream system should see the <em>user&apos;s</em> identity or the{" "}
            <em>service&apos;s</em>.
          </p>
          <Table
            head={["Mechanism", "Identity", "Typical use"]}
            rows={[
              ["SSO via OIDC or SAML", "Person (via the company identity provider)", "Employees signing in to your app"],
              ["OAuth 2.0 authorisation code (with PKCE)", "Person, delegating limited access to your app", "Your app reading a user's data in another system"],
              ["OAuth 2.0 client credentials", "Service", "Server-to-server calls with no user present"],
              ["Service account / workload identity", "Service, managed by the cloud or platform", "Jobs and pods calling cloud APIs"],
              ["API key", "Service (coarse)", "Simple integrations; treat as a password"],
              ["mTLS", "Service, proven by certificates", "High-trust internal service calls"],
            ]}
          />
        </>
      ),
    },
    {
      id: "sso",
      title: "Single sign-on with OIDC",
      body: (
        <>
          <p>
            Enterprise customers will insist that employees sign in with their existing company
            identity provider (IdP), such as Okta, Entra ID or Google Workspace, not with a new
            password. OpenID Connect (OIDC) is the modern way; SAML is the older but common
            alternative.
          </p>

          <Figure caption="OIDC authorisation code flow with PKCE. The app never sees the user's password; it receives short-lived tokens from the identity provider.">
            <Sequence
              label="Sequence of OIDC sign-in: browser redirects to the identity provider, user authenticates, code returned, app exchanges code for tokens"
              actors={[
                { id: "user", label: "User's browser" },
                { id: "app", label: "Your application" },
                { id: "idp", label: "Identity provider" },
              ]}
              messages={[
                { from: "user", to: "app", text: "Open the app" },
                { from: "app", to: "user", text: "Redirect to IdP with state and PKCE challenge", dashed: true },
                { from: "user", to: "idp", text: "Authenticate (password, MFA)" },
                { from: "idp", to: "user", text: "Redirect back with an authorisation code", dashed: true },
                { from: "user", to: "app", text: "Deliver the code" },
                { from: "app", to: "idp", text: "Exchange code + PKCE verifier for tokens" },
                { from: "idp", to: "app", text: "ID token (who) and access token (what)", dashed: true },
                { note: "App verifies the ID token signature, issuer, audience and expiry, then creates a session.", over: ["app", "idp"] },
              ]}
            />
          </Figure>

          <ul>
            <li>Verify tokens properly: signature, issuer, audience, expiry and nonce. Never trust unverified claims.</li>
            <li>Map IdP groups or roles to your application roles, and keep the mapping configurable per customer.</li>
            <li>Support user provisioning and deprovisioning (SCIM) if customers need it, so leavers lose access automatically.</li>
            <li>Keep sessions short, refresh tokens carefully and support logout.</li>
          </ul>
        </>
      ),
    },
    {
      id: "downstream",
      title: "Calling other systems: as the user or as the service?",
      body: (
        <>
          <p>
            Your application often needs to call a downstream system such as a document store or CRM.
            The central design question is whose identity that call carries.
          </p>

          <Figure caption="Two models for downstream calls. Acting as the service is simple but flattens permissions; acting on behalf of the user preserves them.">
            <Graph
              label="Service identity: all users share one broad downstream credential. Delegated identity: each call carries the user's own permissions."
              cellW={196}
              cellH={96}
              nodeW={156}
              nodes={[
                { id: "u1", label: "Users", sub: "Different permissions", col: 0, row: 0, tone: "amber", shape: "pill" },
                { id: "s1", label: "Your service", sub: "One shared credential", col: 1, row: 0, tone: "rose" },
                { id: "d1", label: "Downstream", sub: "Sees one broad caller", col: 2, row: 0, tone: "sky" },
                { id: "u2", label: "Users", sub: "Different permissions", col: 0, row: 1, tone: "amber", shape: "pill" },
                { id: "s2", label: "Your service", sub: "Exchanges user token", col: 1, row: 1, tone: "lime" },
                { id: "d2", label: "Downstream", sub: "Enforces each user's rights", col: 2, row: 1, tone: "sky" },
              ]}
              groups={[
                { label: "Service identity", c1: 0, r1: 0, c2: 2, r2: 0, tone: "rose" },
                { label: "Delegated (on behalf of)", c1: 0, r1: 1, c2: 2, r2: 1, tone: "lime" },
              ]}
              edges={[
                { from: "u1", to: "s1" },
                { from: "s1", to: "d1", label: "service token" },
                { from: "u2", to: "s2" },
                { from: "s2", to: "d2", label: "user-scoped token" },
              ]}
            />
          </Figure>

          <Table
            head={["Model", "Pros", "Cons", "Use when"]}
            rows={[
              ["Service identity", "Simple, no user token handling, works for background jobs", "Your service sees everything; you must re-implement the downstream permissions", "Background sync, data that all users may see"],
              ["Delegated (user token or token exchange)", "Downstream enforces real permissions; strong audit trail", "More complex; tokens expire; background jobs have no user", "User-facing features over sensitive, permissioned data"],
              ["Hybrid", "Service ingests, then your app filters by the user's group at query time", "Permission copies can go stale", "Search or RAG over documents with access control lists"],
            ]}
          />
          <Callout tone="warn" title="The permission-flattening trap">
            A common failure in AI assistants: a service account ingests every document into a search
            index, and any user can then retrieve text they could not open in the source system. Carry
            access control lists with each chunk and filter at query time, or use delegated access.
          </Callout>
        </>
      ),
    },
    {
      id: "secrets",
      title: "Secrets, rotation and revocation",
      body: (
        <>
          <p>
            Credentials are the part of an integration most likely to leak and the part customers
            audit hardest. Plan their whole lifecycle.
          </p>
          <ul>
            <li>
              <strong>Prefer short-lived credentials.</strong> Workload identity and token exchange
              avoid long-lived static keys entirely.
            </li>
            <li>
              <strong>Store secrets in a vault</strong> (a cloud secrets manager or equivalent), never
              in code, images, environment files in Git, or chat.
            </li>
            <li>
              <strong>Scope narrowly.</strong> A connector that reads orders should not be able to
              delete customers.
            </li>
            <li>
              <strong>Rotate regularly</strong> and design the rotation: can a new key be issued
              before the old one is revoked, with zero downtime?
            </li>
            <li>
              <strong>Plan revocation.</strong> If a credential leaks, how fast can it be killed, and
              what stops working?
            </li>
            <li>
              <strong>Audit.</strong> Log which identity did what, with enough detail to answer a
              regulator.
            </li>
          </ul>
          <Figure caption="Zero-downtime key rotation. The new key is issued and stored first, the service picks it up, and only then is the old key revoked.">
            <Sequence
              label="Zero-downtime key rotation: create new key, deploy it, verify, then revoke the old one"
              actors={[
                { id: "ops", label: "Operator" },
                { id: "vault", label: "Secrets vault" },
                { id: "svc", label: "Service" },
                { id: "api", label: "Downstream API" },
              ]}
              messages={[
                { from: "ops", to: "api", text: "Issue new key (old still valid)" },
                { from: "ops", to: "vault", text: "Store new key as version 2" },
                { from: "svc", to: "vault", text: "Fetch current key on refresh" },
                { from: "svc", to: "api", text: "Calls succeed with version 2" },
                { from: "ops", to: "api", text: "Revoke the old key after verification" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "practice",
      title: "Putting it together",
      body: (
        <>
          <Exercise
            title="Design the identity flow"
            task={
              <p>
                You are building an assistant for a bank&apos;s relationship managers. It answers
                questions over client documents stored in a content system with per-client access
                lists. Managers must see only clients assigned to them. The customer&apos;s security
                team requires SSO and an audit trail. Describe the identity design.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Sign-in:</strong> OIDC single sign-on with the bank&apos;s identity provider;
                map IdP groups to roles.
              </li>
              <li>
                <strong>Downstream access:</strong> use the manager&apos;s identity (token exchange or
                user-delegated token) for reads from the content system, so the source enforces the
                access lists. If search must be pre-indexed, store the access list with every chunk
                and filter by the manager&apos;s entitlements at query time, refreshing entitlements
                frequently.
              </li>
              <li>
                <strong>Service credentials:</strong> only for background ingestion, stored in a
                vault, narrowly scoped, short-lived and rotated.
              </li>
              <li>
                <strong>Audit:</strong> log user, query, documents retrieved and answer, protected
                with the same controls as the documents themselves.
              </li>
            </ol>
            <p>
              The key sentence for an interview: &ldquo;I would not let a shared service account bypass
              the source system&apos;s permissions.&rdquo;
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Authentication says who; authorisation says what; callers can be people or services.",
    "SSO with OIDC uses the authorisation code flow with PKCE; verify token signature, issuer, audience and expiry.",
    "Choose service identity, delegated identity or a hybrid, and avoid flattening permissions through a shared account.",
    "Use short-lived, narrowly scoped credentials in a vault, with planned rotation, revocation and audit.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main risk of using one broad service account to ingest documents into a search index?",
      options: [
        "Users may retrieve content they could not access in the source system",
        "The index becomes smaller",
        "Tokens never expire",
        "It makes SSO impossible",
      ],
      answer: 0,
      explain: "Permissions are flattened unless access lists are carried and enforced at query time.",
    },
    {
      kind: "mcq",
      q: "Which OAuth flow suits a web app acting for a signed-in user?",
      options: [
        "Authorisation code with PKCE",
        "Passing the password in the URL",
        "Client credentials only",
        "No flow",
      ],
      answer: 0,
      explain: "The authorisation code flow with PKCE delegates limited access without exposing the password.",
    },
    {
      kind: "mcq",
      q: "Why prefer short-lived credentials?",
      options: [
        "A leaked credential is useful to an attacker for only a short time",
        "They are faster",
        "They need no vault",
        "They never need revoking",
      ],
      answer: 0,
      explain: "Short lifetimes limit the damage window if a credential leaks.",
    },
    {
      kind: "mcq",
      q: "Which claim must you always verify in an ID token?",
      options: [
        "Signature, issuer, audience and expiry",
        "Only the user's name",
        "Only the colour theme",
        "Nothing, tokens are trusted",
      ],
      answer: 0,
      explain: "Without verifying these, a forged or misdirected token could be accepted.",
    },
    {
      kind: "text",
      q: "What does PKCE stand for? Give the first word.",
      format: "*****",
      accept: ["proof", "proof key for code exchange"],
      explain: "PKCE is Proof Key for Code Exchange, which protects the authorisation code flow.",
    },
  ],
};
