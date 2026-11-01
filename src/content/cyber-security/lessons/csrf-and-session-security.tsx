import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain why browsers make cross-site request forgery possible",
    "Set cookie attributes and anti-CSRF controls that stop it",
    "Describe how sessions are created, protected and ended",
    "Find and fix broken access control (insecure direct object references)",
  ],
  tasks: [
    {
      id: "sessions",
      title: "The problem: HTTP forgets you",
      body: (
        <>
          <p>
            HTTP has no memory. Each request arrives alone, so after you log in the server must
            recognise you on the next click. It does this with a <strong>session</strong>. At
            login the server creates a random <strong>session ID</strong>, stores what it knows
            about you against that ID, and hands the ID to your browser in a cookie. The browser
            sends the cookie back on every request.
          </p>
          <p>
            Think of a coat-check ticket. The ticket proves nothing about you, but whoever holds
            it gets the coat. So the ticket must be hard to guess, hard to steal, and cancelled
            when you leave. Almost every web session attack goes after one of those three things.
          </p>
          <p>How strong must the ID be? The ID should come from a cryptographically secure random generator, with plenty of bits:</p>
          <Formula>128 bits = 16 bytes = 32 hex characters ≈ 3.4 × 10^38 possible values</Formula>
          <p>
            Guessing one valid ID out of that many is not practical. Short, sequential or
            timestamp-based IDs are the classic mistake.
          </p>
        </>
      ),
    },
    {
      id: "cookie-flags",
      title: "Cookie attributes that protect the session",
      body: (
        <>
          <Table
            head={["Attribute", "What it does", "Protects against"]}
            rows={[
              [<code key="s">Secure</code>, "Cookie is sent only over HTTPS", "Capture on the network"],
              [<code key="h">HttpOnly</code>, "Page JavaScript cannot read the cookie", "Session theft after an XSS flaw"],
              [<code key="ss">SameSite</code>, "Limits when the cookie is sent on cross-site requests", "Request forgery (CSRF)"],
              [<code key="p">Path / Domain</code>, "Limits which URLs receive the cookie", "Over-sharing between apps"],
              [<code key="m">Max-Age / Expires</code>, "Sets a lifetime", "Long-lived stolen cookies"],
            ]}
          />
          <p>A well-configured session cookie header looks like this:</p>
          <pre>
            <code>{`Set-Cookie: __Host-sid=9f2c...; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600`}</code>
          </pre>
          <p>
            The <code>__Host-</code> name prefix tells the browser to accept the cookie only if it
            is Secure, has <code>Path=/</code> and has no <code>Domain</code> attribute. That
            stops other subdomains from overwriting it.
          </p>
          <p>
            <code>SameSite</code> has three values. <code>Strict</code> sends the cookie only for
            requests that start on your own site. <code>Lax</code> also sends it when a user
            follows a normal top-level link to you, which keeps links from other sites working.
            <code> None</code> sends it always, and requires <code>Secure</code>. Browsers have
            moved toward treating a missing value as Lax, but behaviour has varied, so always set
            it explicitly.
          </p>
        </>
      ),
    },
    {
      id: "csrf",
      title: "Cross-site request forgery (CSRF)",
      body: (
        <>
          <p>
            Browsers attach cookies automatically to every request to a site, no matter which page
            triggered it. Suppose you are logged in to your bank in one tab, and in another tab you
            open a page controlled by someone else. That page can quietly make your browser send a
            request to the bank. The bank sees a valid session cookie and has no idea you did not
            choose to send it. This is <strong>CSRF</strong>.
          </p>
          <p>
            The attacker cannot read the response. CSRF only works for actions that change state,
            such as changing an email address, transferring money or deleting an item. That is why
            GET requests must never change state.
          </p>
          <Table
            head={["Defence", "How it works", "Notes"]}
            rows={[
              ["SameSite cookies", "Browser withholds the cookie on cross-site requests", "Strong first layer. Set Lax or Strict."],
              ["Anti-CSRF token", "A random, per-session value is required in each form or request, and checked on the server", "Attacker's page cannot read it. Use your framework's built-in support."],
              ["Check Origin header", "Reject state-changing requests whose Origin is not your site", "Cheap extra layer."],
              ["Custom header for APIs", "Require a header that cross-site forms cannot set", "Works when requests come from your own JavaScript."],
              ["Re-authentication", "Ask for the password again for sensitive actions", "Good for changing email or payment details."],
            ]}
          />
          <Callout tone="note" title="Site is not the same as origin">
            &quot;Same-site&quot; means the same registered domain, such as <code>example.com</code>
            plus all its subdomains. A weak page on <code>blog.example.com</code> is same-site with{" "}
            <code>app.example.com</code>, so SameSite alone will not stop it. Tokens still matter.
          </Callout>
        </>
      ),
    },
    {
      id: "session-lifecycle",
      title: "Handling the session lifecycle safely",
      body: (
        <>
          <ul>
            <li>
              <strong>Regenerate the ID at login.</strong> If you keep the pre-login ID, an
              attacker who planted it (session fixation) now shares your session.
            </li>
            <li>
              <strong>Use two timeouts.</strong> An idle timeout (for example, after 15 minutes of
              no activity) and an absolute timeout (for example, 8 hours after login).
            </li>
            <li>
              <strong>Invalidate on the server at logout.</strong> Deleting the cookie in the
              browser is not enough if the server still accepts the old ID.
            </li>
            <li>
              <strong>Never put the ID in a URL.</strong> URLs end up in logs, history and the
              Referer header.
            </li>
            <li>
              <strong>Serve everything over HTTPS</strong>, not just the login page.
            </li>
          </ul>
          <Callout tone="tip">
            Signed tokens such as JWTs are convenient, but a stateless token is hard to revoke
            before it expires. Keep their lifetime short and have a plan for forced logout.
          </Callout>
        </>
      ),
    },
    {
      id: "access-control",
      title: "Broken access control and direct object references",
      body: (
        <>
          <p>
            Authentication says who you are. <strong>Authorization</strong> says what you may do.
            Broken access control is when the second check is missing or weak. The most common form
            is an <strong>insecure direct object reference (IDOR)</strong>: the app trusts an ID
            sent by the client.
          </p>
          <p>The fix is to check ownership on the server, in the query itself:</p>
          <pre>
            <code>{`// VULNERABLE: any logged-in user can load any invoice by ID
const inv = await db.query("SELECT * FROM invoices WHERE id = $1", [req.params.id]);

// SAFE: the invoice must belong to the signed-in user
const inv = await db.query(
  "SELECT * FROM invoices WHERE id = $1 AND owner_id = $2",
  [req.params.id, req.user.id]
);
if (inv.rows.length === 0) return res.sendStatus(404);`}</code>
          </pre>
          <p>
            Random IDs make guessing harder, but they are not access control. The ownership check is.
            Follow the rules: deny by default, check on every request, and enforce on the server,
            never only by hiding links.
          </p>
          <p>It shows up in logs as one account walking through sequential IDs:</p>
          <pre>
            <code>{`10:15:01 user=4821 GET /api/invoices/1001 200
10:15:01 user=4821 GET /api/invoices/1002 403
10:15:01 user=4821 GET /api/invoices/1003 403
... 40 requests in 12 seconds, nearly all 403 or 404`}</code>
          </pre>
          <p>
            Forty requests in 12 seconds is about 3.3 per second (40 ÷ 12), faster than a person
            clicking. A rule that alerts on many denials from one account catches this.
          </p>
          <Callout tone="warn">
            Only test access control on applications you own or have written permission to test.
            Walking through other people&apos;s records on a live site is unauthorised access, even
            if no hacking tools are involved.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A session is a random ID in a cookie. It must be unguessable, protected in transit and ended properly.",
    "Use Secure, HttpOnly and SameSite on session cookies.",
    "CSRF abuses the browser sending cookies automatically; SameSite plus anti-CSRF tokens stop it.",
    "Regenerate the session ID at login and invalidate it on the server at logout.",
    "Authorization must be checked on the server for every request, including who owns the object.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which cookie attribute stops page JavaScript from reading the cookie?",
      options: ["Secure", "SameSite", "Path", "HttpOnly"],
      answer: 3,
      explain: "HttpOnly hides the cookie from scripts, which limits session theft after an XSS flaw.",
    },
    {
      kind: "mcq",
      q: "Why does CSRF work?",
      options: [
        "Browsers attach cookies automatically to requests to a site, whichever page triggered them",
        "Passwords are stored in plain text",
        "Servers do not use HTTPS",
        "Session IDs are too long",
      ],
      answer: 0,
      explain: "The server sees a valid cookie and cannot tell the user did not intend the request.",
    },
    {
      kind: "mcq",
      q: "A user edits /invoices/1001 to /invoices/1002 and sees another customer's invoice. What is the best fix?",
      options: [
        "Make the URL longer",
        "Hide the link in the page",
        "Use a CAPTCHA",
        "Check on the server that the invoice belongs to the signed-in user",
      ],
      answer: 3,
      explain: "Only a server-side ownership check enforces access. Hiding or lengthening the URL does not.",
    },
    {
      kind: "text",
      q: "A 128-bit session ID is written as hexadecimal. Each hex character holds 4 bits. How many hex characters is that?",
      format: "**",
      accept: ["32"],
      explain: "128 ÷ 4 = 32 hex characters.",
    },
  ],
};
