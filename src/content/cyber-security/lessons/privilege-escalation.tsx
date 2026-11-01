import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Separate vertical from horizontal privilege escalation and explain why attackers need both",
    "Recognise the common misconfigurations that let access grow",
    "List persistence mechanisms and the audit rules that reveal them",
  ],
  tasks: [
    {
      id: "problem",
      title: "A foothold is rarely enough",
      body: (
        <>
          <p>
            The first access an attacker gets is usually small: a phished user, a compromised web
            application, a service account. That account can't read the database or install tools.
            So the next goal is to grow the access. Then, because the machine may be rebooted or the
            password changed, they work to keep it. These two goals are{" "}
            <strong>privilege escalation</strong> and <strong>persistence</strong>.
          </p>
          <p>
            Analogy: a visitor gets through the front door with a day pass. Escalation is
            finding a master key or being let into the staff area. Persistence is quietly cutting a
            copy of the key so they can return next week.
          </p>
          <Callout tone="warn">
            This lesson covers concepts and defensive checks. Only audit machines you own or have
            written permission to assess. It deliberately gives no exploit steps.
          </Callout>
        </>
      ),
    },
    {
      id: "kinds",
      title: "Vertical and horizontal",
      body: (
        <>
          <Table
            head={["Kind", "Meaning", "Example"]}
            rows={[
              ["Vertical", "Gaining a higher level of rights", "Normal user becomes administrator or root"],
              ["Horizontal", "Using another account at the same level", "One user reads another user's files"],
            ]}
          />
          <p>
            Horizontal movement is also how attackers spread across a network, which ATT&amp;CK calls
            lateral movement. A web application that lets user 1001 view user 1002's invoice by
            changing a number in the address has a horizontal escalation flaw.
          </p>
        </>
      ),
    },
    {
      id: "causes",
      title: "What makes escalation possible",
      body: (
        <>
          <p>
            Almost all escalation comes from a short list of weaknesses. Fixing these is
            more effective than chasing individual exploits.
          </p>
          <Table
            head={["Weakness", "Why it helps an attacker", "Fix"]}
            rows={[
              ["Unpatched kernel or software", "Known flaws give a route to higher rights", "Patch promptly"],
              ["Overly broad sudo rules", "A rule allowing an editor or shell as root is a root shell", "Allow only exact commands"],
              ["Needless SUID programs", "They run with the owner's rights, often root", "Remove the bit where not required"],
              ["Writable scripts run by root", "Editing the script means running code as root", "Strict ownership and permissions"],
              ["Secrets in files and history", "Passwords, tokens and keys lying around", "Use a secrets manager; rotate"],
              ["Weak service permissions", "A service account can edit its own service", "Least privilege for services"],
              ["Privileged containers", "Container root can reach the host", "Drop capabilities; avoid privileged mode"],
              ["Shared or reused admin passwords", "One theft opens many machines", "Unique local admin credentials"],
            ]}
          />
          <p>
            Remember the Unix file mode. In <code>4755</code>, the leading 4 is the SUID bit, and
            755 gives the owner read, write and execute (7 = 4 + 2 + 1), and read plus execute to
            everyone else (5 = 4 + 1). It displays as <code>rwsr-xr-x</code>.
          </p>
        </>
      ),
    },
    {
      id: "audit",
      title: "Auditing your own machine",
      body: (
        <>
          <p>
            Defenders run the same checks on their own systems first. On your own Linux lab VM:
          </p>
          <pre>
            <code>{`# What may this account run through sudo?
sudo -l

# Which programs carry the SUID bit? Review each for need.
find / -perm -4000 -type f 2>/dev/null

# Which files are writable by anyone? Review scripts in particular.
find /opt /etc -type f -perm -0002 2>/dev/null`}</code>
          </pre>
          <p>
            Keep a list of the expected results. The value comes from noticing a new entry that
            wasn't there last month. Then tighten what you find, for example:
          </p>
          <pre>
            <code>{`chmod 750 /opt/backup.sh
chown root:root /opt/backup.sh`}</code>
          </pre>
          <p>
            On Windows, equivalents are reviewing local administrators, service permissions and
            who can run what as SYSTEM. Tools such as LAPS (Local Administrator Password Solution)
            randomise each machine's local admin password.
          </p>
        </>
      ),
    },
    {
      id: "persistence",
      title: "Persistence: how access survives",
      body: (
        <>
          <p>
            Persistence means the attacker arranges to run again after a reboot or password reset.
            It depends on the platform, but the mechanisms are few.
          </p>
          <Table
            head={["Mechanism", "Where to look", "ATT&CK"]}
            rows={[
              ["Scheduled jobs", "cron, systemd timers, Windows scheduled tasks", "T1053"],
              ["New or modified services", "systemd units, Windows services", "T1543"],
              ["Added SSH keys", "authorized_keys files", "T1098.004"],
              ["Extra accounts", "Local or directory users, new admins", "T1136"],
              ["Startup entries", "Registry run keys, startup folders, shell profiles", "Several"],
              ["Web shells", "Odd scripts in a web root", "Several"],
            ]}
          />
          <p>
            You catch these by watching the places they must touch. On Linux, auditd can log writes
            to sensitive files. Illustrative rules:
          </p>
          <pre>
            <code>{`-w /etc/sudoers -p wa -k sudoers_change
-w /etc/passwd -p wa -k account_change
-w /root/.ssh/authorized_keys -p wa -k ssh_key_change
-w /etc/cron.d/ -p wa -k cron_change`}</code>
          </pre>
          <p>
            Here <code>-w</code> names the path, <code>-p wa</code> logs writes and attribute
            changes, and <code>-k</code> adds a search label. A matching log hit at 03:00 when no
            change was planned deserves immediate attention.
          </p>
        </>
      ),
    },
    {
      id: "stop",
      title: "Stopping the growth",
      body: (
        <>
          <p>The idea behind all of these controls is to make each step expensive and visible.</p>
          <ul>
            <li><strong>Least privilege:</strong> give every user and service the minimum rights, and nothing permanent beyond that.</li>
            <li><strong>Separate admin accounts:</strong> admins use a normal account for email and browsing.</li>
            <li><strong>Just-in-time access:</strong> temporary elevation that expires.</li>
            <li><strong>Patch and harden:</strong> including removing unused software and SUID programs.</li>
            <li><strong>File integrity monitoring and logging:</strong> to see what changed.</li>
            <li><strong>Segmentation:</strong> so one compromised host doesn't reach everything.</li>
          </ul>
          <Callout tone="tip">
            When you find an intruder's persistence, removing only that item isn't enough. Assume
            there are others, rotate the credentials involved, and rebuild from a known good image
            if you can't prove the system is clean.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Escalation grows access (vertical to higher rights, horizontal to other accounts); persistence keeps it.",
    "Most escalation comes from patching gaps, broad sudo rules, SUID or writable files, exposed secrets and reused admin passwords.",
    "Audit your own systems for the same weaknesses, with sudo -l and SUID and permission reviews.",
    "Persistence usually touches scheduled jobs, services, SSH keys, accounts or startup entries, so monitor those.",
    "Least privilege, just-in-time access and integrity monitoring limit the damage.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A normal user becomes root. What kind of escalation is this?",
      options: ["Horizontal", "Lateral", "Vertical", "Diagonal"],
      answer: 2,
      explain: "Gaining higher rights is vertical escalation. Using a peer's account is horizontal.",
    },
    {
      kind: "mcq",
      q: "Which is a persistence mechanism rather than an escalation method?",
      options: [
        "Planting a public key in authorized_keys",
        "Patching the kernel",
        "Reading a world-readable file",
        "Using sudo with a password",
      ],
      answer: 0,
      explain: "An added SSH key lets the attacker return later without the password.",
    },
    {
      kind: "text",
      q: "In file mode 4755, which leading digit sets the SUID bit?",
      format: "*",
      accept: ["4"],
      explain: "The leading 4 is SUID. 2 would be SGID and 1 the sticky bit.",
    },
    {
      kind: "text",
      q: "Which principle says every account gets only the access it needs? Three words.",
      format: "***** *********",
      accept: ["least privilege", "principle of least privilege"],
      explain: "Least privilege limits what a compromised account can do.",
    },
  ],
};
