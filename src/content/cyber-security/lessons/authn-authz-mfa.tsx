import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Separate authentication, authorization and accounting",
    "Name the authentication factors and rank common MFA methods by strength",
    "Compare the main access control models: DAC, MAC, RBAC and ABAC",
    "Spot broken authorization in code and read the 401 and 403 status codes correctly",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A system must answer two questions about every request: <em>who are you?</em> and{" "}
            <em>are you allowed to do this?</em> People often blur them together, and the result is
            bugs and breaches. A hotel gives a clear picture. At the front desk you show ID and get
            a key card. That is <strong>authentication</strong>: proving identity. The key card then
            opens your room but not other rooms or the staff office. That is{" "}
            <strong>authorization</strong>: deciding what an identity may do.
          </p>
          <Table
            head={["Term", "Question", "Example"]}
            rows={[
              [<strong key="n">Authentication (authn)</strong>, "Who are you?", "Password plus a one-time code"],
              [<strong key="z">Authorization (authz)</strong>, "What may you do?", "Can read this folder, cannot delete it"],
              [<strong key="a">Accounting</strong>, "What did you do?", "Log entry: user alice deleted file X at 10:42"],
            ]}
          />
          <p>
            Together these are often called AAA. The order matters: you can only decide what a
            user may do after you know who they are, and you can only audit actions if each one is
            tied to a verified identity.
          </p>
        </>
      ),
    },
    {
      id: "factors",
      title: "Authentication factors",
      body: (
        <>
          <p>A factor is a category of proof. There are three classic ones.</p>
          <Table
            head={["Factor", "Meaning", "Examples", "Weakness"]}
            rows={[
              ["Something you know", "A secret in your head", "Password, PIN", "Guessed, phished, reused, leaked"],
              ["Something you have", "A thing in your possession", "Phone app, hardware security key, smart card", "Can be lost or stolen"],
              ["Something you are", "A body trait", "Fingerprint, face", "Cannot be changed if copied; false matches and misses"],
            ]}
          />
          <p>
            Some systems add context such as location or time, but these are weak signals, not
            proofs. <strong>Multi-factor authentication (MFA)</strong> means using two or more{" "}
            <em>different</em> factors. A password plus a security question is not MFA, because
            both are things you know. A password plus a code from your phone is.
          </p>
          <p>
            Why it works: a stolen password alone is no longer enough. The attacker would also
            need the second factor, which usually lives on a separate device or needs your body.
          </p>
        </>
      ),
    },
    {
      id: "mfa-methods",
      title: "Not all MFA is equal",
      body: (
        <>
          <Table
            head={["Method", "How it works", "Main risk"]}
            rows={[
              ["SMS code", "Code texted to your phone number", "SIM swapping and message interception; also phishable"],
              ["Authenticator app (TOTP)", "App computes a short-lived code from a shared secret and the clock", "Code can be typed into a fake login page"],
              ["Push approval", "Tap approve on your phone", "Prompt fatigue: users approve after repeated requests"],
              ["Security key (FIDO2/WebAuthn)", "Hardware or device key signs a challenge tied to the real site", "Lost key; needs a recovery plan"],
            ]}
          />
          <p>
            Authenticator apps follow a published standard, TOTP (time-based one-time password,
            RFC 6238). The app and the server share a secret key once. Both then compute a code
            from that secret and the current time in 30-second steps, usually shown as 6 digits.
          </p>
          <Formula>counter = floor(unix time ÷ 30)     code = 6 digits derived from (secret, counter)</Formula>
          <pre>
            <code>{`Unix time 1,700,000,010 seconds
counter = 1,700,000,010 / 30 = 56,666,667   (exact)
At 1,700,000,040 the counter becomes 56,666,668, so the code changes.

A 6-digit code has 1,000,000 possible values.
A blind guess succeeds with probability 1/1,000,000.
With a lockout after 5 tries: 5/1,000,000 = 0.0005%`}</code>
          </pre>
          <p>
            Security keys based on FIDO2 and WebAuthn are called <strong>phishing-resistant</strong>.
            The key only answers the genuine site&apos;s domain, so a look-alike page gets nothing
            useful. Codes and push prompts can be relayed by a convincing fake page.
          </p>
          <Callout tone="warn" title="Defend against prompt bombing">
            If an attacker already has a password, they may trigger repeated push prompts hoping
            you will tap approve. Defences: number matching on the prompt, rate limits, alerts on
            bursts of denied prompts, and training users to report unexpected requests. Only test
            these flows on accounts you own or are authorised to test.
          </Callout>
        </>
      ),
    },
    {
      id: "access-models",
      title: "Authorization: deciding what is allowed",
      body: (
        <>
          <p>
            Once identity is known, the system applies a model to decide access.
          </p>
          <Table
            head={["Model", "Who decides", "Example"]}
            rows={[
              ["DAC (discretionary)", "The resource owner", "You share a document with a colleague"],
              ["MAC (mandatory)", "Central policy using labels; users cannot override", "Files labelled Secret readable only by cleared users"],
              ["RBAC (role-based)", "Permissions attach to roles; users get roles", "Role billing-clerk can view and edit invoices"],
              ["ABAC (attribute-based)", "Rules over attributes of user, resource and context", "Allow if department is finance and device is managed and time is business hours"],
            ]}
          />
          <p>
            RBAC is the most common because it is easy to explain and audit: change a role once and
            everyone in it is updated. ABAC is more flexible but harder to reason about. Either way,
            follow <strong>least privilege</strong> (grant the minimum needed) and{" "}
            <strong>deny by default</strong> (no rule, no access).
          </p>
        </>
      ),
    },
    {
      id: "failures",
      title: "Common mistakes and how to read them",
      body: (
        <>
          <p>
            The most frequent web flaw in this area is <strong>broken access control</strong>: the
            user is authenticated, but the code never checks whether they may touch that specific
            record. The fix is to check on the server, for every request, against the object.
          </p>
          <pre>
            <code>{`# Weak: any logged-in user can fetch any invoice id
def get_invoice(user, invoice_id):
    return db.find_invoice(invoice_id)

# Better: deny by default, check ownership or role on the server
def get_invoice(user, invoice_id):
    invoice = db.find_invoice(invoice_id)
    if invoice is None:
        raise NotFound()
    if invoice.owner_id != user.id and "finance" not in user.roles:
        raise Forbidden()
    return invoice`}</code>
          </pre>
          <p>
            Two HTTP status codes show up constantly. <code>401</code> (named Unauthorized, but it
            really means not authenticated) says the server does not know who you are. <code>403</code>{" "}
            (Forbidden) says it knows who you are and the answer is no.
          </p>
          <p>
            In logs, watch for many failed logins followed by one success, successes from a new
            country minutes apart, and sudden bursts of 403 responses from one account, which can
            mean someone is probing for records they should not reach.
          </p>
          <Callout tone="tip">
            Store passwords as salted slow hashes (covered in the hashing lesson), enforce MFA on
            admin and remote-access accounts first, and keep a tested recovery path. Account
            recovery is often the weakest link, because it can bypass every factor you added.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Authentication proves identity; authorization decides permissions; accounting records actions.",
    "MFA needs factors from different categories: know, have, are.",
    "Security keys using FIDO2 and WebAuthn resist phishing; SMS codes and push prompts are weaker.",
    "RBAC and ABAC both should follow least privilege and deny by default.",
    "Check authorization on the server for every object, not just at login.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which pair counts as true multi-factor authentication?",
      options: [
        "Password and security question",
        "PIN and password",
        "Password and a code from an authenticator app",
        "Two different passwords",
      ],
      answer: 2,
      explain: "A password is something you know and the app code is something you have. The other pairs use the same factor twice.",
    },
    {
      kind: "mcq",
      q: "Which MFA method is generally considered phishing-resistant?",
      options: ["SMS code", "FIDO2/WebAuthn security key", "Emailed code", "Security question"],
      answer: 1,
      explain: "A security key signs a challenge bound to the genuine site, so a look-alike page cannot reuse it.",
    },
    {
      kind: "text",
      q: "A server knows who you are but refuses the request. Which three-digit HTTP status code is the right answer?",
      format: "***",
      accept: ["403"],
      explain: "403 Forbidden means authenticated but not permitted. 401 means not authenticated.",
    },
    {
      kind: "text",
      q: "A TOTP code uses 6 digits. How many different codes are possible? Write digits only.",
      format: "*******",
      accept: ["1000000", "1,000,000", "1 000 000"],
      explain: "Six decimal digits give 10^6 = 1,000,000 values, so a blind guess is a 1 in a million chance.",
    },
  ],
};
