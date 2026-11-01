import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Describe how Windows accounts, privileges and UAC work",
    "Explain what the registry and services are and why defenders watch them",
    "Read key Security event log IDs for logons and account changes",
    "Summarise what Active Directory does and why it is a high-value target",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why Windows matters",
      body: (
        <>
          <p>
            Windows runs most office computers and a large share of business servers. That makes it
            the platform attackers study most, and the one defenders must understand deeply. Many
            organisations manage all their staff accounts through one Windows system called Active
            Directory, so a weakness there touches everyone.
          </p>
          <p>
            Windows can look like a pile of menus, but it has the same building blocks as Linux:
            accounts, files with permissions, background services and logs. The names differ. This
            lesson maps them out. Practise on your own Windows machine or a Windows virtual machine.
          </p>
        </>
      ),
    },
    {
      id: "accounts",
      title: "Accounts, privileges and UAC",
      body: (
        <>
          <p>
            Every account has a <strong>SID</strong> (security identifier), a unique ID that Windows
            uses internally instead of the username. There are two main account types:
          </p>
          <ul>
            <li>
              <strong>Local accounts:</strong> exist only on one computer.
            </li>
            <li>
              <strong>Domain accounts:</strong> exist in Active Directory and can sign in to many
              computers.
            </li>
          </ul>
          <p>
            Accounts can belong to groups such as Users or Administrators. A special identity called{" "}
            <strong>SYSTEM</strong> is used by the operating system itself and is even more powerful
            than an administrator.
          </p>
          <p>
            <strong>User Account Control (UAC)</strong> is a prompt that appears when an action needs
            administrator rights. Even an administrator normally runs with reduced rights until they
            approve the prompt. That limits what a piece of malware can do if a user runs it
            accidentally.
          </p>
          <pre>
            <code>{`whoami                  # current user
whoami /groups          # groups and privilege level
net user                # local accounts
net localgroup administrators   # who is a local admin?`}</code>
          </pre>
          <Callout tone="tip">
            The list of local administrators is worth checking on any machine you inherit. People
            added "temporarily" years ago are often still there.
          </Callout>
        </>
      ),
    },
    {
      id: "registry",
      title: "The registry and services",
      body: (
        <>
          <p>
            The <strong>registry</strong> is a hierarchical database that stores system and
            application settings. Its top-level sections are called hives. Two you will see often:
          </p>
          <Table
            head={["Hive", "Holds"]}
            rows={[
              ["HKEY_LOCAL_MACHINE (HKLM)", "Settings for the whole computer"],
              ["HKEY_CURRENT_USER (HKCU)", "Settings for the signed-in user"],
            ]}
          />
          <p>
            Defenders watch the registry because programs can ask Windows to start them automatically
            at sign-in by adding a value under special locations, such as the <code>Run</code> keys.
            Legitimate software does this, and so does malware that wants to survive a reboot. A new,
            unfamiliar entry there deserves investigation.
          </p>
          <p>
            A <strong>service</strong> is a background program, similar to a Linux daemon. Services
            often run as SYSTEM or a dedicated account, which is why a flaw in one can be serious.
          </p>
          <pre>
            <code>{`# PowerShell, on your own machine
Get-Service | Where-Object Status -eq 'Running'
Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
Get-NetTCPConnection -State Listen | Sort-Object LocalPort`}</code>
          </pre>
          <p>
            The second command lists programs that start for the current user at sign-in. The third
            shows listening ports, like <code>ss</code> on Linux.
          </p>
        </>
      ),
    },
    {
      id: "logs",
      title: "Event logs and the IDs to know",
      body: (
        <>
          <p>
            Windows records activity in <strong>Event Logs</strong>, viewed with Event Viewer or
            PowerShell. The <strong>Security</strong> log holds sign-in and account events. Each
            event type has a numeric ID, and a few are worth memorising.
          </p>
          <Table
            head={["Event ID", "Meaning", "What to look for"]}
            rows={[
              ["4624", "Successful logon", "Odd hours, unusual source computer"],
              ["4625", "Failed logon", "Many failures against one or many accounts"],
              ["4672", "Special privileges assigned to a new logon", "Admin-level sign-ins"],
              ["4720", "A user account was created", "Accounts nobody requested"],
              ["4688", "A new process was created", "Needs process auditing turned on"],
            ]}
          />
          <p>
            Each 4624 event also records a <strong>logon type</strong>. Type 2 is interactive (at the
            keyboard), type 3 is over the network, and type 10 is remote desktop. A burst of type 10
            logons from an unfamiliar address is a classic sign of someone attacking Remote Desktop,
            which uses TCP port 3389 by default.
          </p>
          <pre>
            <code>{`# Last 20 failed logons on your own machine (run PowerShell as administrator)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 20 |
  Select-Object TimeCreated, Id, Message`}</code>
          </pre>
          <p>
            A simple detection rule: raise an alert when one source causes 50 or more 4625 events
            within 5 minutes. The numbers are illustrative; tune them to your normal traffic.
          </p>
          <Callout tone="warn">
            Never leave Remote Desktop open to the whole internet. Put it behind a VPN, require
            multi-factor authentication and restrict which addresses can connect. Check only
            machines you own or administer.
          </Callout>
        </>
      ),
    },
    {
      id: "ad",
      title: "Active Directory at a glance",
      body: (
        <>
          <p>
            <strong>Active Directory (AD)</strong> is Microsoft's directory service. Think of it as
            the company phone book plus the security desk: it stores users, computers and groups, and
            it decides who may sign in where. Servers that run it are called{" "}
            <strong>domain controllers</strong>.
          </p>
          <Table
            head={["Term", "Meaning"]}
            rows={[
              ["Domain", "A group of accounts and computers under one AD, for example corp.example.com"],
              ["Domain controller", "A server that answers sign-in requests and holds the directory"],
              ["Organisational unit (OU)", "A folder used to organise objects and apply rules"],
              ["Group Policy", "Settings pushed to many machines at once"],
              ["Kerberos", "The main ticket-based sign-in protocol in a domain"],
            ]}
          />
          <p>
            Group Policy is powerful for defence: one setting can enforce password rules or turn on
            auditing across thousands of machines. The flip side is that whoever controls the domain
            controller controls the company. So the account groups with domain-wide rights, such as
            Domain Admins, must stay small, use strong authentication and never be used for daily
            work.
          </p>
        </>
      ),
    },
    {
      id: "built-in",
      title: "Built-in protections to switch on",
      body: (
        <>
          <ul>
            <li>
              <strong>Windows Update:</strong> most breaches use bugs that already have fixes.
            </li>
            <li>
              <strong>Microsoft Defender:</strong> built-in malware protection; keep it on.
            </li>
            <li>
              <strong>Windows Firewall:</strong> blocks unwanted inbound connections by default.
            </li>
            <li>
              <strong>BitLocker:</strong> full-disk encryption for lost or stolen devices.
            </li>
            <li>
              <strong>Standard user for daily use:</strong> reserve the admin account for admin tasks.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Windows identifies accounts by SID; UAC limits what even administrators do by default.",
    "The registry and services are common places for persistence, so defenders monitor them.",
    "Security log IDs 4624, 4625, 4672 and 4720 cover logons, failures, privileges and new accounts.",
    "Active Directory centralises identity, so protecting domain controllers and admin groups is critical.",
    "Updates, Defender, the firewall, BitLocker and standard-user habits give a strong baseline.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In a domain, which server type answers sign-in requests and holds the directory?",
      options: ["File server", "Print server", "Proxy server", "Domain controller"],
      answer: 3,
      explain: "Domain controllers run Active Directory and authenticate users.",
    },
    {
      kind: "mcq",
      q: "A burst of logon type 10 events from an unfamiliar address most likely points to what?",
      options: [
        "A scheduled backup",
        "Remote Desktop sign-in attempts",
        "A printer reboot",
        "Windows Update",
      ],
      answer: 1,
      explain: "Logon type 10 is remote interactive, which is Remote Desktop.",
    },
    {
      kind: "text",
      q: "Which Security event ID records a failed logon? Four digits.",
      format: "****",
      accept: ["4625"],
      explain: "4624 is a successful logon and 4625 is a failed one.",
    },
    {
      kind: "text",
      q: "Which TCP port does Remote Desktop use by default? Number only.",
      format: "****",
      accept: ["3389"],
      explain: "Remote Desktop Protocol listens on TCP 3389 unless changed.",
    },
  ],
};
