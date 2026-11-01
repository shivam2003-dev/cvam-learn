import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain how macOS relates to Unix and Linux, and where it differs",
    "Name the main built-in protections: SIP, Gatekeeper, XProtect, TCC and FileVault",
    "Check the state of those protections from the terminal on your own Mac",
    "Locate the places where programs start automatically and where logs are kept",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why macOS needs its own lesson",
      body: (
        <>
          <p>
            Macs are common on developer and security teams, and they are not immune to malware.
            Many people assume a Mac is safe by default, and that assumption is the weak spot. You
            need to know what Apple builds in, how to confirm it is on, and where macOS behaves
            differently from the Linux and Windows machines you have just met.
          </p>
          <p>
            The good news: if you know Linux, you already know a lot. macOS is built on a Unix-based
            core called Darwin, so the shell, file permissions and many commands work the same way.
          </p>
        </>
      ),
    },
    {
      id: "unix",
      title: "A Unix underneath, with a different layout",
      body: (
        <>
          <p>
            The terminal app runs <code>zsh</code> by default on current versions. Commands such as{" "}
            <code>ls</code>, <code>grep</code>, <code>chmod</code>, <code>ps</code> and{" "}
            <code>sudo</code> behave as you expect. Some tools differ in small ways: macOS ships BSD
            versions of utilities, so a Linux flag may not exist.
          </p>
          <Table
            head={["Task", "Linux", "macOS"]}
            rows={[
              ["Local file system", "ext4 or similar", "APFS"],
              ["User home", "/home/name", "/Users/name"],
              ["Listening ports", "ss -tulpn", "lsof -i -P -n with sudo, or netstat"],
              ["Network config", "ip addr", "ifconfig or networksetup"],
              ["Services", "systemd", "launchd, managed with launchctl"],
              ["Logs", "/var/log, journalctl", "Unified logging, read with the log command"],
              ["Package manager", "apt, dnf", "Homebrew (third party)"],
            ]}
          />
          <p>
            Two other Apple-specific ideas. The system itself sits on a read-only, cryptographically
            sealed volume on current versions, which makes tampering with core files much harder.
            And on Apple silicon Macs, a dedicated security chip called the{" "}
            <strong>Secure Enclave</strong> protects keys and biometric data.
          </p>
        </>
      ),
    },
    {
      id: "protections",
      title: "The built-in protection stack",
      body: (
        <>
          <p>
            macOS layers several protections. Learn what each one stops.
          </p>
          <Table
            head={["Protection", "What it does"]}
            rows={[
              ["System Integrity Protection (SIP)", "Stops even root from changing protected system files and processes"],
              ["Gatekeeper", "Checks that downloaded apps are signed by an identified developer and notarised by Apple"],
              ["XProtect", "Apple's built-in malware signature scanning, updated in the background"],
              ["TCC (Transparency, Consent and Control)", "Asks you before an app can use the camera, microphone, contacts, files in protected folders and more"],
              ["FileVault", "Full-disk encryption"],
              ["Keychain", "Encrypted store for passwords, keys and certificates"],
              ["Application firewall", "Controls incoming connections per app; check it is turned on in System Settings"],
            ]}
          />
          <p>
            <strong>Notarisation</strong> means a developer uploaded the app to Apple, which scanned it
            and recorded approval. It does not prove an app is harmless, only that it passed an
            automated check and is traceable to a developer.
          </p>
          <p>
            Here is how they fit together. A user downloads an app. Gatekeeper checks its signature
            and notarisation before first launch. XProtect looks for known bad patterns. Once running,
            the app cannot read the user's Documents or use the microphone unless TCC permission is
            granted. SIP stops it from modifying the operating system. If the laptop is lost,
            FileVault keeps the disk unreadable. No single layer is perfect, but together they raise the
            cost of an attack.
          </p>
        </>
      ),
    },
    {
      id: "check",
      title: "Worked example: audit your own Mac",
      body: (
        <>
          <p>
            Run these in Terminal on a Mac you own. Each is a read-only status check.
          </p>
          <pre>
            <code>{`csrutil status                 # System Integrity Protection: enabled or disabled
spctl --status                 # Gatekeeper: assessments enabled?
fdesetup status                # FileVault: On or Off
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate   # firewall state
sw_vers                        # macOS version
softwareupdate --list          # pending updates`}</code>
          </pre>
          <p>
            You want to see SIP enabled, Gatekeeper enabled, FileVault on and the OS up to date. If
            FileVault is off on a laptop that leaves your desk, turn it on in System Settings under
            Privacy and Security. A disabled SIP is rarely needed; if you did not turn it off on
            purpose, find out why it is off.
          </p>
          <Callout tone="tip">
            Treat the output as a checklist. Keep the four results in a notes file, and re-run them
            after major macOS updates to catch settings that changed.
          </Callout>
        </>
      ),
    },
    {
      id: "persistence",
      title: "Autostart locations and logs",
      body: (
        <>
          <p>
            A program can ask macOS to start it automatically. This is how helpful tools launch at
            login, and also how unwanted software tries to stay installed. The common places are{" "}
            <strong>launchd</strong> property list files:
          </p>
          <Table
            head={["Location", "Scope"]}
            rows={[
              ["~/Library/LaunchAgents", "Runs for one user at login"],
              ["/Library/LaunchAgents", "Runs for every user at login"],
              ["/Library/LaunchDaemons", "Runs at boot, as a system service"],
            ]}
          />
          <pre>
            <code>{`ls -la ~/Library/LaunchAgents /Library/LaunchAgents /Library/LaunchDaemons
launchctl list | head -20`}</code>
          </pre>
          <p>
            Compare the list with the software you know you installed. Items you cannot explain, or
            with odd names, are worth researching. Also review the Login Items list in System
            Settings.
          </p>
          <p>
            For logs, macOS uses the <strong>unified log</strong>. Query it with the{" "}
            <code>log</code> command, for example <code>log show --last 1h --predicate{" "}
            'process == "sshd"'</code>. That shows the last hour of messages from the SSH server, if you
            have it enabled.
          </p>
          <Callout tone="warn">
            Only audit and change settings on Macs you own or manage. Do not disable SIP or Gatekeeper
            to run something you cannot explain; that removes the layers designed to protect you.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "macOS is Unix-based, so shell skills and permissions carry over, with BSD-flavoured tools.",
    "SIP, Gatekeeper, XProtect, TCC, FileVault and Keychain are the main built-in layers.",
    "Notarisation shows an app passed Apple's automated check, not that it is harmless.",
    "Check csrutil, spctl and fdesetup status, and keep the system updated.",
    "Review LaunchAgents, LaunchDaemons and Login Items for unexplained autostart entries.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which macOS feature prompts you before an app can use the camera or microphone?",
      options: ["FileVault", "TCC", "Keychain", "launchd"],
      answer: 1,
      explain: "Transparency, Consent and Control manages per-app permissions for sensitive resources.",
    },
    {
      kind: "mcq",
      q: "Which folder holds services that start at boot for the whole system?",
      options: [
        "~/Library/LaunchAgents",
        "/Applications",
        "/Library/LaunchDaemons",
        "/Users/Shared",
      ],
      answer: 2,
      explain: "LaunchDaemons start at boot as system services. LaunchAgents start at login.",
    },
    {
      kind: "text",
      q: "What is the name of macOS's full-disk encryption feature? One word.",
      format: "*********",
      accept: ["filevault", "file vault"],
      explain: "FileVault encrypts the startup disk so a lost Mac does not expose its data.",
    },
    {
      kind: "text",
      q: "What does the acronym SIP stand for? Three words.",
      format: "****** ********* **********",
      accept: ["system integrity protection"],
      explain: "System Integrity Protection blocks changes to protected system locations, even by root.",
    },
  ],
};
