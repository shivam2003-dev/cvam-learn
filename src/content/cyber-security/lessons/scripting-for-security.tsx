import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Choose between Python, Bash and PowerShell for a security task",
    "Parse a log file to count failed logins by source address",
    "Verify a file with a SHA-256 hash from each language",
    "Write scripts that fail safely and never hard-code secrets",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: too much repetition, too little time",
      body: (
        <>
          <p>
            Security work is full of small repeated jobs: read yesterday's logs, check whether a
            downloaded file is genuine, list every account that hasn't logged in for 90 days. Doing
            these by hand is slow and error-prone. A person tires and skips a line. A script does
            the same thing every time, in seconds, and leaves a record of what it did.
          </p>
          <p>
            You don't need to be a software engineer. Most useful security scripts are 10 to 40
            lines long. They read some data, filter it, count something and print a result. This
            lesson shows three languages and when each one fits.
          </p>
          <Table
            head={["Language", "Best at", "Typical home"]}
            rows={[
              ["Bash", "Chaining command-line tools, quick one-liners on Linux and macOS", "Servers, containers, CI jobs"],
              ["PowerShell", "Windows administration, event logs, Active Directory, objects not text", "Windows hosts and Microsoft 365"],
              ["Python", "Parsing, data handling, calling APIs, longer reusable tools", "Anywhere; the common choice for security tooling"],
            ]}
          />
          <p>
            A simple rule: use a Bash one-liner for a quick look, PowerShell when you are on
            Windows, and Python once the job needs logic, loops or reuse.
          </p>
        </>
      ),
    },
    {
      id: "logs",
      title: "Counting failed logins",
      body: (
        <>
          <p>
            A failed SSH login on a Linux machine leaves a line like this in the authentication
            log. The address below comes from a documentation range:
          </p>
          <pre>
            <code>{`Nov  2 10:15:01 web01 sshd[1234]: Failed password for invalid user admin from 203.0.113.5 port 52144 ssh2`}</code>
          </pre>
          <p>
            Many lines like this from one address in a short time suggest automated password
            guessing, which the Password Attacks lesson covers. The quick Bash version works on
            your own server. The log is usually <code>/var/log/auth.log</code> on Debian and Ubuntu
            and <code>/var/log/secure</code> on Red Hat style systems:
          </p>
          <pre>
            <code>{`grep 'Failed password' /var/log/auth.log \\
  | awk '{print $(NF-3)}' \\
  | sort | uniq -c | sort -rn | head -5`}</code>
          </pre>
          <p>
            Read it left to right. <code>grep</code> keeps the failure lines. <code>awk</code>{" "}
            prints the field that is three from the end, which is the source address. <code>sort</code>{" "}
            groups equal addresses, <code>uniq -c</code> counts each group, the second{" "}
            <code>sort -rn</code> puts the biggest first, and <code>head</code> keeps the top five.
          </p>
          <p>The same job in Python is longer, but easier to extend and test:</p>
          <pre>
            <code>{`import re
from collections import Counter

PATTERN = re.compile(r"Failed password for (?:invalid user )?(\\S+) from (\\d{1,3}(?:\\.\\d{1,3}){3}) port")

def count_failures(path):
    counts = Counter()
    with open(path, encoding="utf-8", errors="replace") as handle:
        for line in handle:
            match = PATTERN.search(line)
            if match:
                counts[match.group(2)] += 1
    return counts

if __name__ == "__main__":
    for ip, total in count_failures("auth.log").most_common(5):
        print(f"{total:5d}  {ip}")`}</code>
          </pre>
          <p>
            Notice the choices. The file is read one line at a time, so it works on a huge log
            without loading it all into memory. Bad bytes are replaced rather than crashing the
            script. And the counting logic sits in a function, so you can test it with a small
            sample file.
          </p>
          <p>Now put a number on what you see. Suppose one address caused 1,500 failures in 10 minutes:</p>
          <Formula>rate = failures ÷ seconds</Formula>
          <pre>
            <code>{`10 minutes = 600 seconds
1,500 ÷ 600 = 2.5 failed logins per second`}</code>
          </pre>
          <p>
            No human types 2.5 passwords a second, so this is almost certainly a tool. A rate like
            this is the starting point for a detection rule or an automatic block. The figures are
            illustrative.
          </p>
        </>
      ),
    },
    {
      id: "hashes",
      title: "Checking a file with a hash",
      body: (
        <>
          <p>
            A <strong>hash</strong> is a short fingerprint of a file. Change one byte and the
            fingerprint changes completely. Software publishers often post a SHA-256 value next to
            a download, so you can check that your copy wasn't corrupted or swapped. The Hashing and
            Salting lesson explains why this works.
          </p>
          <pre>
            <code>{`# Bash (Linux): verify against a list of published hashes
sha256sum -c SHA256SUMS

# PowerShell (Windows)
Get-FileHash -Algorithm SHA256 .\\installer.zip`}</code>
          </pre>
          <pre>
            <code>{`# Python: read in chunks so big files do not fill memory
import hashlib

def sha256_of(path, chunk=65536):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(chunk), b""):
            digest.update(block)
    return digest.hexdigest()`}</code>
          </pre>
          <Callout tone="note">
            A matching hash only proves your copy equals the one the hash was computed from. If an
            attacker can change the download and the page showing the hash, the check proves
            nothing. Prefer hashes or signatures obtained over a separate trusted channel.
          </Callout>
        </>
      ),
    },
    {
      id: "windows",
      title: "PowerShell and Windows events",
      body: (
        <>
          <p>
            Windows logs a failed logon as event ID 4625 in the Security log. PowerShell returns
            events as objects, so you filter on fields instead of slicing text. Run this as an
            administrator on your own machine:
          </p>
          <pre>
            <code>{`Get-WinEvent -FilterHashtable @{ LogName = 'Security'; Id = 4625 } -MaxEvents 50 |
  Select-Object TimeCreated, Id, ProviderName`}</code>
          </pre>
          <p>
            Filtering at the source, with <code>-FilterHashtable</code>, is much faster than
            pulling every event and filtering afterwards. For deeper analysis, a SIEM does this at
            scale, as the Logs and SIEM lesson shows.
          </p>
        </>
      ),
    },
    {
      id: "safe-scripts",
      title: "Writing scripts you can trust",
      body: (
        <>
          <p>
            A security script often runs with high privileges, so a careless one is itself a risk.
            Follow these habits:
          </p>
          <ul>
            <li>
              <strong>Read-only first.</strong> Make the default mode report only. Add an explicit
              flag for any step that changes or deletes something, and support a dry run.
            </li>
            <li>
              <strong>Never hard-code secrets.</strong> Read keys from an environment variable or a
              secrets manager. Anything in the script ends up in Git.
            </li>
            <li>
              <strong>Fail loudly.</strong> In Bash start with <code>set -euo pipefail</code> and
              quote your variables. In Python catch specific errors, not everything.
            </li>
            <li>
              <strong>Avoid shell injection.</strong> In Python, pass commands as a list, for
              example <code>subprocess.run(["ls", path], check=True)</code>, and avoid{" "}
              <code>shell=True</code> with any text that came from outside.
            </li>
            <li>
              <strong>Don't treat PowerShell's execution policy as a wall.</strong> It is a safety
              feature against accidents, not a security boundary.
            </li>
            <li>
              <strong>Use least privilege.</strong> Run with the lowest account that can do the job.
            </li>
          </ul>
          <Callout tone="warn">
            Run log parsers on logs you own. Scripts that test passwords, scan networks or probe
            services must only target your own lab or systems you have written permission to test.
            Unauthorised scanning and guessing can be a crime, and a script makes mistakes at
            machine speed.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Script the jobs you repeat: log parsing, hash checks and account audits are ideal starting points.",
    "Use Bash for quick pipelines, PowerShell on Windows, and Python for longer, reusable tools.",
    "Turn a count into a rate, such as failures per second, to tell humans from automation.",
    "A matching hash is only trustworthy if the hash came from a separate, trusted source.",
    "Default to read-only, avoid hard-coded secrets, and only run active tests on systems you own.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does the Python hashing example read the file in chunks?",
      options: [
        "To make the hash stronger",
        "So large files do not need to fit in memory",
        "Because SHA-256 only accepts 64 KB",
        "To avoid needing the hashlib module",
      ],
      answer: 1,
      explain: "Chunked reads keep memory use small while the digest updates block by block.",
    },
    {
      kind: "mcq",
      q: "Which is the safest way to run an external command from Python with a path supplied by a user?",
      options: [
        "Build one string and use shell=True",
        "Pass a list of arguments to subprocess.run without shell=True",
        "Concatenate the path into an f-string",
        "Disable error checking",
      ],
      answer: 1,
      explain: "A list of arguments stops the shell from interpreting special characters in the path.",
    },
    {
      kind: "mcq",
      q: "A hash is published on the same web page as the download. What is the main limit of that check?",
      options: [
        "SHA-256 is too weak",
        "It only works on Windows",
        "An attacker who alters the page can alter both the file and the hash",
        "Hashes cannot detect corruption",
      ],
      answer: 2,
      explain: "If one party controls both the file and the hash, the match proves nothing about authenticity.",
    },
    {
      kind: "text",
      q: "Which Windows Security event ID records a failed logon?",
      format: "****",
      accept: ["4625"],
      explain: "Event ID 4625 is logged for each failed logon attempt.",
    },
    {
      kind: "text",
      q: "One address made 900 failed logins over 5 minutes. How many per second is that?",
      format: "*",
      accept: ["3", "three"],
      explain: "5 minutes is 300 seconds, and 900 ÷ 300 = 3.",
    },
  ],
};
