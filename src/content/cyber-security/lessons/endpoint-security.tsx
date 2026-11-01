import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Define an endpoint and explain why endpoints are the usual point of entry",
    "Compare antivirus, EDR, DLP, host firewalls, allow-listing and sandboxing",
    "Read a simple behavioural detection rule and explain why it works",
    "Measure endpoint coverage and understand why gaps matter",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: the attacker only needs one laptop",
      body: (
        <>
          <p>
            An <strong>endpoint</strong> is any device a person or process uses to reach your
            data: laptops, phones, servers, virtual machines, and even printers and cameras.
            Firewalls guard the network, but attacks keep arriving through someone opening an email,
            plugging in a USB stick or running a booby-trapped download. Once code runs on one
            endpoint, the network defences are on the wrong side of the problem.
          </p>
          <p>
            Endpoint security puts protection and visibility on each device itself. Think of it as
            giving every room its own lock and smoke detector instead of relying only on the front
            gate.
          </p>
        </>
      ),
    },
    {
      id: "layers",
      title: "The layers on an endpoint",
      body: (
        <>
          <Table
            head={["Control", "What it does", "Catches", "Misses"]}
            rows={[
              ["Antivirus (AV)", "Scans files for known malware signatures and some suspicious behaviour", "Common, known malware", "New or custom malware, attacks that use no files"],
              ["Endpoint protection platform (EPP)", "AV plus extras such as a host firewall and web filtering", "Known threats, bad downloads", "Skilled intruders using normal tools"],
              ["Endpoint detection and response (EDR)", "Records activity (processes, logins, network, file changes), spots suspicious chains, and lets you respond", "Behaviour such as an office app launching a script engine", "Needs people or automation to act on alerts"],
              ["Host firewall", "Filters traffic to and from this one device", "Lateral movement, unwanted listeners", "Malicious traffic on an allowed port"],
              ["Application allow-listing", "Only approved programs may run", "Unknown executables of any kind", "Needs upkeep; abuse of allowed tools"],
              ["Data loss prevention (DLP)", "Inspects data leaving by email, USB, web upload or print and applies policy", "Accidental or deliberate leaks of sensitive data", "Data that is not classified or is encrypted before it leaves"],
              ["Full-disk encryption", "Encrypts the drive, so a stolen device is unreadable", "Lost or stolen devices", "A device that is on and unlocked"],
              ["Sandboxing", "Runs untrusted files in an isolated environment to watch what they do", "Suspicious attachments before they reach users", "Malware that detects it is being watched"],
            ]}
          />
          <p>
            <strong>XDR</strong> (extended detection and response) widens the EDR idea to also pull
            in email, identity and cloud data. The core idea is the same: collect more signals and
            connect them.
          </p>
          <p>
            No single layer is enough. AV stops the cheap, common threats so analysts can focus on
            the hard ones. EDR gives the evidence to investigate. Allow-listing and encryption shrink
            what an attacker can do.
          </p>
        </>
      ),
    },
    {
      id: "behaviour",
      title: "Behaviour beats signatures: a worked rule",
      body: (
        <>
          <p>
            Attackers can change a file in seconds so its signature no longer matches. What they cannot
            easily hide is what the program does. A word processor has no normal reason to start a
            command shell. EDR tools look for these <em>parent-child process</em> oddities.
          </p>
          <p>
            Here is the idea written as a Sigma rule, a common vendor-neutral format for detection logic
            that can be translated into the query language of your tools:
          </p>
          <pre>
            <code>{`title: Office application starts a command interpreter
status: experimental
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith:
      - '\\winword.exe'
      - '\\excel.exe'
    Image|endswith:
      - '\\powershell.exe'
      - '\\cmd.exe'
  condition: selection
level: medium`}</code>
          </pre>
          <p>
            The rule says: if Word or Excel is the parent process and PowerShell or the command
            prompt is the child, raise a medium-severity alert. It will produce some false positives,
            for instance a legitimate macro in a finance spreadsheet, so a real team would tune it by
            excluding known-good cases rather than switching it off.
          </p>
          <Callout tone="note">
            This works even for malware nobody has seen before. It detects the <em>technique</em>,
            not the file. That is the main advantage of behavioural detection over signatures.
          </Callout>
        </>
      ),
    },
    {
      id: "coverage",
      title: "Coverage: the endpoint you do not manage",
      body: (
        <>
          <p>
            The best agent is useless on a device that does not have it. Attackers look for the
            forgotten machine: an old server, a contractor laptop, a test VM. So track coverage:
          </p>
          <Formula>coverage % = devices with a working agent ÷ total known devices × 100</Formula>
          <p>Illustrative numbers: an inventory lists 480 devices, and the EDR console reports 456.</p>
          <pre>
            <code>{`456 ÷ 480 = 0.95  ->  95% coverage
480 - 456 = 24 devices unprotected`}</code>
          </pre>
          <p>
            95% sounds high, but those 24 devices are exactly where a patient intruder would settle.
            Your first job is to find them and either install the agent, isolate them, or retire them.
            Mobile device management (MDM) and an up-to-date asset inventory make this possible.
          </p>
          <p>
            Check the protection on your own Windows machine from PowerShell. These commands only read
            local status:
          </p>
          <pre>
            <code>{`Get-MpComputerStatus | Select-Object AMServiceEnabled, AntivirusEnabled, RealTimeProtectionEnabled
Get-NetFirewallProfile | Select-Object Name, Enabled`}</code>
          </pre>
          <p>
            On macOS, FileVault and the built-in firewall are in System Settings. On Linux, check{" "}
            <code>lsblk -f</code> to see whether a volume is encrypted with LUKS.
          </p>
          <Callout tone="warn">
            Never run or detonate real malware on your normal computer or a work machine. If you
            want to study suspicious files, do it in an isolated lab VM with no shared folders and
            networking off or restricted, and only with samples you are allowed to handle.
          </Callout>
        </>
      ),
    },
    {
      id: "response",
      title: "Responding from the endpoint",
      body: (
        <>
          <p>
            EDR is useful because it lets you act fast. Typical response actions:
          </p>
          <ul>
            <li>
              <strong>Isolate the host</strong> from the network while keeping a link to the console,
              so you can investigate without it spreading anything.
            </li>
            <li>
              <strong>Kill a process</strong> or quarantine a file.
            </li>
            <li>
              <strong>Collect evidence</strong> such as a process tree, a memory sample or a file for
              analysis.
            </li>
            <li>
              <strong>Roll back or reimage</strong> the machine, then reset the user&apos;s credentials.
            </li>
          </ul>
          <p>
            Decide in advance who may isolate a machine, and under what conditions. Isolating a
            production server is a business decision as much as a technical one. Also remember
            privacy: endpoint tools see a lot, so have a clear policy on what is collected and who
            can look at it.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Endpoints are where most attacks land, so protection and visibility must be on the device itself.",
    "Antivirus handles known threats; EDR records behaviour and lets you investigate and respond.",
    "Behavioural rules detect techniques, such as an office app launching a shell, rather than specific files.",
    "DLP, disk encryption, allow-listing and host firewalls each cover a different gap.",
    "Measure coverage: unmanaged devices are the easiest route in.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which control is best at spotting a Word document that launches PowerShell, even if the malware is new?",
      options: [
        "Behaviour-based EDR detection",
        "A stateless packet filter",
        "A longer password policy",
        "Signature-only antivirus",
      ],
      answer: 0,
      explain: "EDR looks at what processes do, so it can flag the technique even when no signature exists.",
    },
    {
      kind: "mcq",
      q: "What does DLP primarily protect against?",
      options: ["Denial of service", "Sensitive data leaving the organisation", "Weak Wi-Fi encryption", "Unpatched kernels"],
      answer: 1,
      explain: "Data loss prevention inspects and controls data moving out through email, uploads, USB and similar channels.",
    },
    {
      kind: "mcq",
      q: "A stolen laptop is powered off. Which control makes its data unreadable?",
      options: ["Host firewall", "Sandboxing", "Application allow-listing", "Full-disk encryption"],
      answer: 3,
      explain: "Full-disk encryption protects data at rest, so a stolen powered-off device does not expose its contents.",
    },
    {
      kind: "text",
      q: "An inventory lists 600 devices and 570 have a working EDR agent. What is the coverage as a whole-number percentage?",
      format: "**",
      accept: ["95", "95%"],
      explain: "570 ÷ 600 = 0.95, which is 95%.",
    },
    {
      kind: "text",
      q: "In the acronym EDR, what does the R stand for? (One word.)",
      format: "********",
      accept: ["response"],
      explain: "EDR is endpoint detection and response.",
    },
  ],
};
