import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Name the main log sources and read a few key Windows and Linux events",
    "Decode a syslog priority value into facility and severity",
    "Explain what a SIEM and a SOAR platform each do in a SOC",
    "Estimate log volume and storage, and write a simple correlation rule",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: attackers leave traces, but nobody is looking",
      body: (
        <>
          <p>
            Almost everything a computer does can leave a record: a user signing in, a program
            starting, a firewall blocking a connection, a file being shared. These records are{" "}
            <strong>logs</strong>. When something goes wrong, logs are how you answer who, what,
            when and from where.
          </p>
          <p>
            The trouble is scale. A mid-sized company produces millions of log lines a day across
            servers, laptops, firewalls, cloud accounts and applications. No person can read
            that. And if each system keeps its own logs, an attacker who gains control of a
            machine can simply delete the evidence on it. So we collect logs centrally, in one
            protected place, and let software help us search and raise alarms.
          </p>
          <p>
            Imagine a shop with fifty doors, each with its own paper visitor book. Nobody checks
            them, and a thief can tear out a page. Now imagine one security desk that receives a
            copy of every entry, in the same format, and flags anything odd. That desk is the idea
            behind a SIEM.
          </p>
        </>
      ),
    },
    {
      id: "sources",
      title: "Where logs come from",
      body: (
        <>
          <Table
            head={["Source", "What it tells you", "Example"]}
            rows={[
              ["Operating system", "Sign-ins, new processes, account changes", "Windows Security log, Linux auth log"],
              ["Network devices", "Allowed and blocked traffic", "Firewall, router, VPN logs"],
              ["Network flow data", "Who talked to whom, how much", "NetFlow, IPFIX"],
              ["Applications", "Errors and user actions", "Web server access log"],
              ["Cloud and identity", "Console and API activity", "Cloud audit trail, identity provider"],
              ["Security tools", "Detections and blocks", "EDR, antivirus, email gateway"],
            ]}
          />
          <p>A few Windows Security event IDs are worth memorising because they appear in almost every investigation:</p>
          <Table
            head={["Event ID", "Meaning"]}
            rows={[
              ["4624", "An account logged on successfully"],
              ["4625", "An account failed to log on"],
              ["4672", "Special privileges assigned to a new logon"],
              ["4688", "A new process was created"],
              ["4720", "A user account was created"],
              ["4740", "A user account was locked out"],
              ["1102", "The audit log was cleared"],
            ]}
          />
          <p>
            Event 1102 is a classic warning sign. Clearing the log is rarely something an ordinary
            user does. On Linux, sign-in activity goes to <code>/var/log/auth.log</code> on
            Debian-family systems and <code>/var/log/secure</code> on Red Hat-family systems, or
            can be read with <code>journalctl</code>. A failed SSH sign-in looks like this
            (documentation address, illustrative):
          </p>
          <pre>
            <code>{`Nov  2 03:14:07 web01 sshd[2211]: Failed password for invalid user admin from 203.0.113.50 port 51522 ssh2`}</code>
          </pre>
          <p>
            Read it left to right: time, host, program and process ID, then the event. A single
            line is noise. Hundreds like it from one address in a few minutes is a pattern.
          </p>
        </>
      ),
    },
    {
      id: "syslog-netflow",
      title: "Syslog and NetFlow",
      body: (
        <>
          <p>
            <strong>Syslog</strong> is the standard way for devices to send log messages to a
            central server. Classic syslog uses UDP port 514, which is fast but can silently lose
            messages. TCP is more reliable, and syslog over TLS (usually port 6514) adds
            encryption so logs cannot be read or altered on the way.
          </p>
          <p>
            Every message starts with a priority number, written <code>&lt;PRI&gt;</code>, that
            packs two values together: a <strong>facility</strong> (what kind of program sent it,
            for example 0 kernel, 1 user, 4 security/auth) and a <strong>severity</strong>:
          </p>
          <Table
            head={["Severity", "Name", "Meaning"]}
            rows={[
              ["0", "Emergency", "System is unusable"],
              ["1", "Alert", "Act immediately"],
              ["2", "Critical", "Critical condition"],
              ["3", "Error", "Error condition"],
              ["4", "Warning", "Warning condition"],
              ["5", "Notice", "Normal but significant"],
              ["6", "Informational", "Routine information"],
              ["7", "Debug", "Debug detail"],
            ]}
          />
          <Formula>PRI = facility × 8 + severity</Formula>
          <p>
            Worked example: facility 4 (security/auth), severity 3 (error) gives 4 × 8 + 3 = 35.
            Going the other way, a PRI of 38 means 38 ÷ 8 = 4 remainder 6, so facility 4 and
            severity 6 (informational).
          </p>
          <p>
            <strong>NetFlow</strong> (and the standard version, IPFIX) records a summary of each
            network conversation: source and destination address, ports, protocol, bytes and
            times. It does not record the content. That makes it small and cheap, and still useful.
            It can show that a laptop sent 40 GB to an unfamiliar address overnight, even if the
            traffic was encrypted.
          </p>
          <Callout tone="tip">
            Keep clocks in sync with NTP on every system. If two machines disagree by five
            minutes, you cannot line up events across them, and your timeline falls apart.
          </Callout>
        </>
      ),
    },
    {
      id: "siem-soar",
      title: "SIEM and SOAR",
      body: (
        <>
          <p>
            A <strong>SIEM</strong> (Security Information and Event Management) system does five
            jobs:
          </p>
          <ul>
            <li>
              <strong>Collect</strong> logs from many sources.
            </li>
            <li>
              <strong>Normalise</strong> them into common fields (source IP, user, action), so one
              query works on firewall and server logs alike.
            </li>
            <li>
              <strong>Correlate</strong> events across sources to spot patterns.
            </li>
            <li>
              <strong>Alert</strong> analysts when rules match.
            </li>
            <li>
              <strong>Retain</strong> data for investigation and compliance.
            </li>
          </ul>
          <p>
            A single failed login means nothing. Correlation turns it into a story. A simple rule,
            written as pseudocode:
          </p>
          <pre>
            <code>{`IF count(event_id = 4625, same user, same source_ip) >= 5 within 10 minutes
   AND THEN event_id = 4624 (success), same user, same source_ip within 10 minutes
THEN alert "Possible password guessing succeeded"
     severity = high
     attach: source_ip, user, host, first and last failure time`}</code>
          </pre>
          <p>
            <strong>SOAR</strong> (Security Orchestration, Automation and Response) takes the alert
            and does the repetitive follow-up using playbooks. For that alert, a playbook might look
            up the address in a reputation service, check whether the user is travelling, disable
            the session, and open a ticket, with a human approving any risky step. It saves analyst
            time on the boring 80 percent so people can focus on judgment calls.
          </p>
          <p>
            The people using these tools sit in a <strong>SOC</strong> (Security Operations Centre).
            A common arrangement is tiers: first-line analysts triage alerts, second-line analysts
            investigate, and senior staff handle complex incidents and tune the rules.
          </p>
          <Callout tone="warn">
            More alerts is not better. If most alerts are false positives, analysts stop trusting
            them, and the one real alarm gets missed. Tune rules, track the false-positive rate,
            and retire rules that never lead to action.
          </Callout>
        </>
      ),
    },
    {
      id: "volume",
      title: "Sizing the problem: log volume",
      body: (
        <>
          <p>
            Storage is a real constraint, so estimate it early.
          </p>
          <Formula>daily volume = events per second × bytes per event × 86,400</Formula>
          <p>
            Worked example (illustrative): 2,000 events per second at an average of 500 bytes:
          </p>
          <pre>
            <code>{`2,000 × 500 = 1,000,000 bytes per second (about 1 MB/s)
1 MB/s × 86,400 s = 86,400 MB ≈ 86.4 GB per day
86.4 GB × 90 days ≈ 7,776 GB ≈ 7.8 TB for 90 days (before compression)`}</code>
          </pre>
          <p>
            Real systems compress logs well, but indexing adds overhead, so treat the raw number
            as a starting point. Decide what to keep hot (fast to search, say 30 days) and what to
            move to cheaper storage. Also protect the logs themselves: send them off the source
            machine immediately, restrict who can delete them, and alert if a source goes silent.
            Silence can mean an outage or an attacker.
          </p>
          <p>
            Finally, log what matters. Capturing every debug message from every application costs
            money and buries the signal. Start with authentication, privileged actions, process
            creation on key servers, firewall and DNS activity, and cloud audit trails.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Collect logs centrally and off the source machine, so attackers cannot erase the evidence.",
    "Know key events: Windows 4624, 4625, 4688 and 1102, plus the Linux auth log.",
    "Syslog PRI equals facility times 8 plus severity; TLS syslog adds encryption.",
    "A SIEM collects, normalises, correlates, alerts and retains; SOAR automates the follow-up.",
    "Estimate volume early, keep clocks synced, and tune rules to protect analyst attention.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which Windows Security event ID means an account failed to log on?",
      options: ["4624", "4688", "4720", "4625"],
      answer: 3,
      explain: "4625 is a failed logon. 4624 is a success, 4688 a new process and 4720 a new account.",
    },
    {
      kind: "mcq",
      q: "What is the main difference between a SIEM and a SOAR platform?",
      options: [
        "SIEM collects and correlates events; SOAR automates response playbooks",
        "SIEM blocks traffic; SOAR stores logs",
        "SIEM is only for the cloud; SOAR is only on premises",
        "They are the same product with two names",
      ],
      answer: 0,
      explain: "A SIEM gathers and analyses events and raises alerts. SOAR runs automated and human-approved response steps.",
    },
    {
      kind: "mcq",
      q: "Why should logs be forwarded to a central server straight away?",
      options: [
        "Local disks cannot store text",
        "An attacker on a machine can delete its local logs",
        "Syslog works only with a central server",
        "It makes the logs smaller",
      ],
      answer: 1,
      explain: "A copy held elsewhere survives tampering on the compromised host.",
    },
    {
      kind: "text",
      q: "What is the syslog PRI value for facility 1 (user) and severity 2 (critical)?",
      format: "**",
      accept: ["10", "<10>"],
      explain: "PRI = 1 × 8 + 2 = 10.",
    },
    {
      kind: "text",
      q: "A network averages 1,000 events per second at 500 bytes each. How many GB of logs per day? Use 1 GB = 1,000,000,000 bytes.",
      format: "****",
      accept: ["43.2", "43.2 GB", "43.2gb"],
      explain: "1,000 × 500 = 500,000 bytes per second. Times 86,400 seconds is 43,200,000,000 bytes, or 43.2 GB.",
    },
  ],
};
