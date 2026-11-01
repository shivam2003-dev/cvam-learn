import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Say what the OWASP Top 10 is, and what it is not",
    "Name the ten categories in the 2021 edition and the idea behind each",
    "Match a real weakness in a web app to a category and a primary fix",
    "Use a few simple response headers and logging rules as first defences",
  ],
  tasks: [
    {
      id: "what-is-it",
      title: "The problem: too many ways to get a web app wrong",
      body: (
        <>
          <p>
            A web application takes input from strangers, talks to databases and other services,
            and keeps secrets. There are thousands of ways to build one badly. A new developer
            cannot study them all, and a busy team cannot fix them all at once. They need a list
            of what to fix first.
          </p>
          <p>
            The <strong>OWASP Top 10</strong> is that list. OWASP is the Open Worldwide Application
            Security Project, a non-profit community. The Top 10 is an awareness document that
            ranks the most critical categories of web application risk, based on data gathered
            from many organisations plus community input. It is updated every few years.
          </p>
          <p>
            It is a starting point, not a complete standard. Passing a Top 10 review does not mean
            an app is secure. Think of it as the list of the most common ways houses get burgled:
            lock those doors first, then look at the rest.
          </p>
          <Callout tone="note">
            This lesson uses the 2021 edition, which is widely taught. OWASP revises the list, so
            category names and their order can change. Check the current edition when you use it
            in a real project. The underlying ideas stay stable.
          </Callout>
        </>
      ),
    },
    {
      id: "the-list",
      title: "The ten categories (2021)",
      body: (
        <>
          <Table
            head={["Rank", "Category", "The idea in one line", "Primary defence"]}
            rows={[
              ["A01", "Broken Access Control", "Users can act outside their intended permissions", "Check ownership and role on the server for every request; deny by default"],
              ["A02", "Cryptographic Failures", "Sensitive data is weakly protected or sent in the clear", "Use TLS everywhere; strong, current algorithms; no secrets in code"],
              ["A03", "Injection", "Untrusted data is run as part of a command or query", "Parameterised queries; encode output; validate input"],
              ["A04", "Insecure Design", "The design itself lacks a needed control", "Threat model early; secure design patterns; abuse-case tests"],
              ["A05", "Security Misconfiguration", "Defaults, debug modes or open settings left on", "Repeatable hardened builds; remove unused features"],
              ["A06", "Vulnerable and Outdated Components", "Using libraries with known flaws", "Inventory dependencies; scan; update on a schedule"],
              ["A07", "Identification and Authentication Failures", "Weak login, session or password handling", "MFA; rate limits; safe session handling"],
              ["A08", "Software and Data Integrity Failures", "Trusting code or data without checking its origin", "Signed updates; protected build pipeline; verify dependencies"],
              ["A09", "Security Logging and Monitoring Failures", "Attacks happen and nobody sees them", "Log security events; alert on them; keep logs safe"],
              ["A10", "Server-Side Request Forgery (SSRF)", "The server fetches a web address chosen by an attacker", "Allow-list destinations; block internal ranges; segment the network"],
            ]}
          />
          <p>
            Three of these deserve a closer look because they trip up beginners.
          </p>
          <p>
            <strong>Broken access control</strong> is ranked first. Logging in proves who you are;
            access control decides what you may do. If an app shows invoice 1001 to its owner but
            also shows it to any logged-in user who edits the number in the address bar, access
            control is broken. Hiding a button in the page does nothing: the check has to happen
            on the server.
          </p>
          <p>
            <strong>Insecure design</strong> is different from a coding bug. A perfect
            implementation of a flawed design is still flawed. For example, a password reset that
            asks only for your date of birth is weak by design, however neatly it is coded.
          </p>
          <p>
            <strong>SSRF</strong> happens when a feature such as &quot;import an image from a link&quot;
            lets a user choose the address, and the server fetches it from inside your network.
            Servers can often reach things users cannot, such as internal admin pages or a cloud
            platform&apos;s metadata service. Many cloud providers expose that service at{" "}
            <code>169.254.169.254</code>, so blocking requests to link-local and private ranges is
            a standard control.
          </p>
        </>
      ),
    },
    {
      id: "misconfig",
      title: "Quick wins: configuration and headers",
      body: (
        <>
          <p>
            Security misconfiguration is the easiest category to fix because there is no code to
            rewrite. A web server can send response headers that tell the browser to be stricter.
            Here is an illustrative nginx snippet for a site you run yourself:
          </p>
          <pre>
            <code>{`server {
    listen 443 ssl;
    server_name example.com;

    # Tell browsers to use HTTPS only for the next 365 days
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Do not let the browser guess content types
    add_header X-Content-Type-Options "nosniff" always;

    # Do not allow other sites to frame this one
    add_header X-Frame-Options "DENY" always;

    # Do not reveal the server version
    server_tokens off;
}`}</code>
          </pre>
          <p>
            Where does the number come from? <code>max-age</code> is in seconds, so 365 days is:
          </p>
          <Formula>60 × 60 × 24 × 365 = 31,536,000 seconds</Formula>
          <p>
            Headers are a safety net, not a substitute for fixing code. Other misconfiguration
            habits to remove: default admin accounts, debug pages in production, directory
            listings, verbose error messages that show stack traces, and cloud storage left open
            to everyone.
          </p>
          <Callout tone="warn">
            Raise <code>max-age</code> slowly on a real site. Once browsers remember an HTTPS-only
            rule, a broken certificate locks visitors out until it is fixed. Test on a staging
            copy first.
          </Callout>
        </>
      ),
    },
    {
      id: "logging",
      title: "Seeing the attack: logging and monitoring",
      body: (
        <>
          <p>
            Category A09 is about visibility. If logging is thin, an attack can run for a long time
            before anyone notices, so decide in advance what to record.
            Useful events for a web app: failed and successful logins, password changes,
            permission denials, input validation failures and changes to sensitive data. Do not
            log passwords, full card numbers or session tokens.
          </p>
          <p>A line like this is worth an alert, using documentation-range addresses:</p>
          <pre>
            <code>{`2026-03-14T10:02:11Z WARN auth  user=alice result=FAIL ip=203.0.113.45
2026-03-14T10:02:12Z WARN auth  user=alice result=FAIL ip=203.0.113.45
2026-03-14T10:02:13Z WARN auth  user=bob   result=FAIL ip=203.0.113.45
2026-03-14T10:02:14Z WARN auth  user=carol result=FAIL ip=203.0.113.45`}</code>
          </pre>
          <p>
            One address failing against four different accounts in four seconds is not a person
            who forgot a password. A simple rule, such as &quot;more than 10 failures from one
            address in a minute,&quot; catches it, and a rate limit slows it down.
          </p>
          <Callout tone="tip">
            Ask of each Top 10 category: how would we notice this happening? If the answer is
            &quot;we wouldn&apos;t&quot;, add a log line and an alert before you add a feature.
          </Callout>
        </>
      ),
    },
    {
      id: "using-the-list",
      title: "Using the list on your own project",
      body: (
        <>
          <p>
            A practical review on an app you own can be done one category at a time.
            For each row in the table, write down: where could this happen in our code, what
            control do we have now, and how would we test it. Start with A01, A03 and A06: they
            find the most real bugs and fixing a dependency is often a one-line change.
          </p>
          <p>
            Pair the list with the Application Security Verification Standard (ASVS), another OWASP
            project, when you need a detailed checklist. The Top 10 tells you where to look; a
            checklist tells you what to verify.
          </p>
          <Callout tone="warn" title="Permission first">
            Testing a web app for these weaknesses is only acceptable on systems you own or have
            written permission to test. Use a deliberately vulnerable practice app in your own lab
            to learn.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The OWASP Top 10 ranks the most critical web risk categories; it is a starting point, not a full standard.",
    "In the 2021 list, Broken Access Control is first and Injection is third; check the current edition before relying on the order.",
    "Access control must be enforced on the server on every request, never only in the user interface.",
    "Many categories are fixed by configuration, patching and logging rather than clever code.",
    "Pick controls by asking where each category could happen in your app and how you would notice it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which category does the 2021 OWASP Top 10 rank first?",
      options: ["Injection", "Cryptographic Failures", "Broken Access Control", "Security Misconfiguration"],
      answer: 2,
      explain: "Broken Access Control moved to the top in 2021 because it was found in so many applications tested.",
    },
    {
      kind: "mcq",
      q: "A user changes the number in /orders/5001 to 5002 and sees someone else's order. Which category is this?",
      options: ["Broken Access Control", "Insecure Design", "SSRF", "Vulnerable and Outdated Components"],
      answer: 0,
      explain: "The server did not check that the order belongs to the requesting user.",
    },
    {
      kind: "mcq",
      q: "Which is the best primary defence against SSRF?",
      options: [
        "Hide the import button",
        "Use longer passwords",
        "Allow-list permitted destinations and block internal ranges",
        "Turn off logging",
      ],
      answer: 2,
      explain: "The server should only fetch from approved destinations and must not reach internal addresses on a user's behalf.",
    },
    {
      kind: "text",
      q: "A header sets max-age to 31536000. How many days is that? (31,536,000 seconds divided by 86,400)",
      format: "***",
      accept: ["365"],
      explain: "31,536,000 ÷ 86,400 = 365 days.",
    },
    {
      kind: "text",
      q: "What four-letter acronym names the category where the server fetches an address chosen by an attacker?",
      format: "****",
      accept: ["ssrf"],
      explain: "SSRF is Server-Side Request Forgery.",
    },
  ],
};
