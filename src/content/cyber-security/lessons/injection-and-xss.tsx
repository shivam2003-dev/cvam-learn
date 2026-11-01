import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain injection as untrusted data being treated as code",
    "Fix SQL injection with parameterised queries and limited database rights",
    "Tell reflected, stored and DOM-based cross-site scripting apart",
    "Apply output encoding, safe DOM APIs and a Content Security Policy to stop XSS",
  ],
  tasks: [
    {
      id: "root-cause",
      title: "One root cause: data mistaken for instructions",
      body: (
        <>
          <p>
            Imagine writing a note to a bank clerk: &quot;Please pay the person named below.&quot; Under
            it you leave a blank line for the name. If a customer fills that line with &quot;Alice.
            Also empty the safe,&quot; a careless clerk might read it all as instructions. That is
            injection.
          </p>
          <p>
            Programs build commands out of text: SQL queries, shell commands, LDAP filters, HTML
            pages. If user input is pasted into that text, the interpreter cannot tell where the
            programmer&apos;s instructions end and the user&apos;s data begins. The user&apos;s data can
            change the meaning of the command.
          </p>
          <p>
            Two families matter most on the web. <strong>SQL injection</strong> targets the
            database. <strong>Cross-site scripting (XSS)</strong> targets other users&apos; browsers.
            The cure is the same idea in both: keep data and code separate, and treat everything
            from outside as data.
          </p>
          <Callout tone="warn">
            Practise these ideas only on a deliberately vulnerable app running in your own lab, or
            on systems where you hold written permission to test. This lesson shows how to
            recognise and fix the flaws, not how to attack real sites.
          </Callout>
        </>
      ),
    },
    {
      id: "sqli",
      title: "SQL injection and how to fix it",
      body: (
        <>
          <p>
            A SQL query is text. If a developer builds that text by joining strings, any quote
            character or SQL keyword in the input becomes part of the query. The attacker can
            then change which rows are returned, read other tables, or alter data, limited only
            by what the database account is allowed to do.
          </p>
          <p>Here is the vulnerable pattern to learn to spot in code review (Node.js style):</p>
          <pre>
            <code>{`// VULNERABLE: input is concatenated into the query text
const sql = "SELECT id, email FROM users WHERE email = '" + email + "'";
const result = await client.query(sql);`}</code>
          </pre>
          <p>
            The fix is a <strong>parameterised query</strong> (also called a prepared statement).
            The query text and the values travel separately. The database parses the query first,
            then fills in the values as pure data, so they can never become SQL.
          </p>
          <pre>
            <code>{`// SAFE: the value is passed separately from the SQL
const result = await client.query(
  "SELECT id, email FROM users WHERE email = $1",
  [email]
);`}</code>
          </pre>
          <pre>
            <code>{`# SAFE in Python with psycopg
cur.execute("SELECT id FROM users WHERE email = %s", (email,))`}</code>
          </pre>
          <p>
            Placeholders only work for <em>values</em>. You cannot parameterise a table name,
            column name or sort direction. For those, map the user&apos;s choice to a fixed
            allow-list in your code (for example, accept only &quot;asc&quot; or &quot;desc&quot;).
          </p>
          <p>Add layers around the fix:</p>
          <ul>
            <li>
              <strong>Least privilege:</strong> the web app&apos;s database account should not own
              the schema or be able to drop tables or read tables it does not need.
            </li>
            <li>
              <strong>ORMs and query builders</strong> parameterise by default, but they usually
              offer a raw-SQL escape hatch. Check each use of it.
            </li>
            <li>
              <strong>Input validation:</strong> an age should be a number. This is a useful
              extra, but it is not a substitute for parameters.
            </li>
            <li>
              <strong>Error handling:</strong> never show raw database errors to users.
            </li>
          </ul>
          <p>
            Other injection types follow the same pattern. For operating-system commands, avoid
            the shell: pass arguments as a list, not a single string.
          </p>
          <pre>
            <code>{`# Risky: a shell parses the whole string
os.system("ping -c 1 " + host)

# Better: no shell, host is one argument (still validate it)
subprocess.run(["ping", "-c", "1", host], check=True)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "detect-sqli",
      title: "What it looks like in your logs",
      body: (
        <>
          <p>
            Attacks leave traces even when you have not found the bug yet. Signs worth alerting
            on:
          </p>
          <pre>
            <code>{`203.0.113.45 - - [14/Mar/2026:10:02:11 +0000] "GET /search?q=%27 HTTP/1.1" 500 1021
203.0.113.45 - - [14/Mar/2026:10:02:13 +0000] "GET /search?q=%27%27 HTTP/1.1" 200 5120
203.0.113.45 - - [14/Mar/2026:10:02:19 +0000] "GET /products?id=%27 HTTP/1.1" 500 1021

app.log: ERROR syntax error at or near "'" in query on table users`}</code>
          </pre>
          <p>
            A single client sending odd quote characters, a burst of 500 errors on one endpoint
            and database syntax errors in the application log are all signals. The web
            application firewall (WAF) in front of a site can block many such requests, but treat
            a WAF as a temporary shield while you fix the code.
          </p>
        </>
      ),
    },
    {
      id: "xss",
      title: "Cross-site scripting (XSS)",
      body: (
        <>
          <p>
            With XSS, the page contains text from an attacker that the browser runs as script.
            The script runs with the full rights of the page the user is on: it can read what the
            user sees, act as the user, and in some setups steal session data.
          </p>
          <Table
            head={["Type", "Where the bad input lives", "Example scenario"]}
            rows={[
              ["Reflected", "In the request, echoed straight back in the response", "A search page prints your query on the results page without encoding it"],
              ["Stored", "Saved on the server and shown to later visitors", "A comment or profile name saved and displayed to everyone"],
              ["DOM-based", "Handled only by client-side JavaScript", "Page script writes part of the URL into the page using innerHTML"],
            ]}
          />
          <p>Stored XSS is usually the worst, because one saved item hits every visitor.</p>
          <p>
            The main fix is <strong>output encoding</strong>: convert characters that have special
            meaning in HTML into harmless text at the moment you output them.
          </p>
          <Table
            head={["Character", "Encoded as", "Why"]}
            rows={[
              [<code key="a">{"<"}</code>, <code key="a2">{"&lt;"}</code>, "Stops a new tag from starting"],
              [<code key="b">{">"}</code>, <code key="b2">{"&gt;"}</code>, "Closes the text safely"],
              [<code key="c">{"&"}</code>, <code key="c2">{"&amp;"}</code>, "Stops entities being forged"],
              [<code key="d">{'"'}</code>, <code key="d2">{"&quot;"}</code>, "Stops breaking out of an attribute"],
              [<code key="e">{"'"}</code>, <code key="e2">{"&#39;"}</code>, "Same, for single-quoted attributes"],
            ]}
          />
          <p>
            Encoding must match the context: HTML text, an HTML attribute, a URL and a JavaScript
            string each need different rules. Do not write this yourself. Modern frameworks such
            as React, Vue and Angular encode by default; the danger comes when you opt out.
          </p>
          <pre>
            <code>{`// Dangerous: parsed as HTML
el.innerHTML = userComment;

// Safe: treated as plain text
el.textContent = userComment;

// React: avoid this unless the HTML was sanitised by a trusted library
// <div dangerouslySetInnerHTML={{ __html: html }} />`}</code>
          </pre>
          <p>
            If users must submit rich text, run it through a maintained HTML sanitiser library
            with a strict allow-list of tags. Do not try to strip bad tags with your own
            patterns; those fixes are routinely bypassed.
          </p>
        </>
      ),
    },
    {
      id: "defence-in-depth",
      title: "Extra layers against XSS",
      body: (
        <>
          <p>
            A <strong>Content Security Policy (CSP)</strong> is a response header that tells the
            browser which sources of script it may run. Even if an injection slips in, the
            browser can refuse to execute it.
          </p>
          <pre>
            <code>{`Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'`}</code>
          </pre>
          <p>
            This policy allows scripts only from your own site and blocks inline script. Roll it
            out first in report-only mode (the header name is{" "}
            <code>Content-Security-Policy-Report-Only</code>) so you can see what would break.
          </p>
          <p>
            Also set session cookies with <code>HttpOnly</code>, so that page script cannot read
            them. That does not stop XSS, but it limits the damage. The CSRF and session lesson
            covers cookie attributes in more detail.
          </p>
          <Callout tone="tip">
            Remember the order of defences: encode output (fixes the cause), then CSP (limits the
            impact), then HttpOnly cookies (protects the session). Each layer assumes the one
            before it might fail.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Injection happens when untrusted input is treated as code by an interpreter.",
    "Parameterised queries keep SQL and data apart; they are the real fix for SQL injection.",
    "Run the database account with least privilege to limit what a flaw can reach.",
    "XSS comes in reflected, stored and DOM-based forms; output encoding is the main cure.",
    "A strict CSP and HttpOnly cookies reduce the damage when something slips through.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which is the most effective fix for SQL injection?",
      options: [
        "Parameterised queries",
        "Hiding error messages only",
        "Making the form fields shorter",
        "Using a longer database password",
      ],
      answer: 0,
      explain: "Parameters keep values separate from the SQL text, so input can never change the query structure.",
    },
    {
      kind: "mcq",
      q: "A comment saved to the database is shown, unencoded, to every visitor. What type of XSS is this?",
      options: ["Reflected", "DOM-based", "Stored", "Blind"],
      answer: 2,
      explain: "The bad input is stored on the server and delivered to later visitors, which is stored XSS.",
    },
    {
      kind: "mcq",
      q: "Which JavaScript property inserts user text safely, without parsing it as HTML?",
      options: ["innerHTML", "outerHTML", "textContent", "document.write"],
      answer: 2,
      explain: "textContent treats the value as plain text. The others parse HTML.",
    },
    {
      kind: "text",
      q: "What three-letter acronym names the response header policy that restricts where scripts may load from?",
      format: "***",
      accept: ["csp"],
      explain: "CSP is Content Security Policy.",
    },
  ],
};
