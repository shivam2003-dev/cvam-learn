import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain attack surface and the main steps of operating system hardening",
    "Use configuration baselines such as the CIS Benchmarks to set a target state",
    "Run a patching cycle: inventory, prioritise, test, deploy, verify",
    "Rank vulnerabilities using severity, exploitation and exposure together",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a default install is built for convenience",
      body: (
        <>
          <p>
            A fresh operating system install is designed to work for as many people as possible.
            That means extra services running, sample accounts, relaxed settings and software you
            will never use. Every extra piece is something that can contain a flaw or be
            misconfigured. The total set of ways in is the <strong>attack surface</strong>.
          </p>
          <p>
            <strong>Hardening</strong> shrinks it: remove what you do not need, lock down what
            remains. <strong>Patching</strong> fixes known flaws in what is left. Think of moving
            into a house: you change the locks, board up a spare door that you never use, and repair
            the broken window. Together these two jobs stop a large share of real attacks, because
            most attackers go for easy, known weaknesses first.
          </p>
        </>
      ),
    },
    {
      id: "hardening-steps",
      title: "Hardening, step by step",
      body: (
        <>
          <Table
            head={["Step", "What to do", "Why"]}
            rows={[
              ["Minimal install", "Install only needed packages and roles", "Software you do not have cannot be exploited"],
              ["Disable unused services", "Stop and disable services and listening ports you do not need", "Fewer entry points"],
              ["Change defaults", "Remove or rename default accounts; replace default passwords", "Defaults are publicly known"],
              ["Least privilege", "Daily work with a normal account; admin rights only when needed", "Limits what a compromise can do"],
              ["Strong authentication", "MFA for admin access; key-based SSH", "Passwords alone are weak"],
              ["Host firewall", "Default deny inbound, allow only what is required", "Blocks unwanted connections"],
              ["Encryption", "Full-disk encryption; TLS for services", "Protects data at rest and in transit"],
              ["Logging", "Enable audit logs and send them off the machine", "Lets you see problems and investigate"],
              ["Secure boot", "Enable firmware protections where supported", "Helps prevent tampering before the OS loads"],
            ]}
          />
          <p>
            Start by looking at what is listening on a machine you own. On Linux:
          </p>
          <pre>
            <code>{`# Which ports are open, and which program owns them?
sudo ss -tulpn

# Which services start at boot?
systemctl list-unit-files --state=enabled

# Example: stop and disable a service you do not need (cups is the print service)
sudo systemctl disable --now cups`}</code>
          </pre>
          <p>
            Suppose a baseline server shows 14 listening ports. After review, 9 turn out to be
            unneeded and are disabled, leaving 5:
          </p>
          <Formula>reduction = (14 − 5) ÷ 14 = 9 ÷ 14 ≈ 0.64, about a 64% smaller attack surface (illustrative)</Formula>
          <p>
            Remote access deserves special care. These lines in <code>/etc/ssh/sshd_config</code> are
            common hardening choices:
          </p>
          <pre>
            <code>{`PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3`}</code>
          </pre>
          <Callout tone="warn">
            Before you disable password login, confirm that your key works. Validate the file with{" "}
            <code>sudo sshd -t</code>, keep your current session open, and test a second login before
            closing the first. Practise on your own lab VM, not on someone else&apos;s server.
          </Callout>
        </>
      ),
    },
    {
      id: "baselines",
      title: "Baselines: a target you can measure",
      body: (
        <>
          <p>
            &quot;Make it secure&quot; is not something you can check. A <strong>configuration
            baseline</strong> is a written list of settings that define a secure build. You apply it
            to every new system and audit existing ones against it.
          </p>
          <ul>
            <li>
              <strong>CIS Benchmarks:</strong> consensus configuration guides for many operating
              systems, cloud services and applications, with different levels of strictness.
            </li>
            <li>
              <strong>DISA STIGs:</strong> detailed US defence configuration guides, also useful
              reference material elsewhere.
            </li>
            <li>
              <strong>Vendor guidance:</strong> security baselines published by the OS maker.
            </li>
          </ul>
          <p>
            Tools can audit a system against a baseline. On a Debian-based lab machine, the open
            source auditor Lynis reads the local configuration and prints suggestions:
          </p>
          <pre>
            <code>{`sudo lynis audit system`}</code>
          </pre>
          <p>
            Treat the output as hints to review, not orders. Some recommendations break software you
            depend on. Test baselines on a copy first, record any deliberate exceptions, and put the
            hardened build in an image or automation script so every new machine starts the same
            way. Without that, <strong>configuration drift</strong> slowly undoes the work.
          </p>
        </>
      ),
    },
    {
      id: "patching",
      title: "A patching cycle that works",
      body: (
        <>
          <ol>
            <li>
              <strong>Inventory.</strong> You cannot patch what you do not know about. List every
              system, its OS, and its software.
            </li>
            <li>
              <strong>Prioritise.</strong> Combine severity, whether the flaw is being exploited in
              the wild, how exposed the system is, and how important it is to the business.
            </li>
            <li>
              <strong>Test.</strong> Try the patch on a non-critical copy.
            </li>
            <li>
              <strong>Deploy in rings.</strong> A small pilot group first, then a wider group, then
              everyone. Have a rollback plan.
            </li>
            <li>
              <strong>Verify.</strong> Check that the update really installed and the flaw is gone.
            </li>
          </ol>
          <p>
            CVSS scores severity from 0.0 to 10.0. In the common bands, 0.1 to 3.9 is low, 4.0 to
            6.9 medium, 7.0 to 8.9 high, and 9.0 to 10.0 critical. A score alone does not decide
            order. A medium flaw on a public web server that attackers are already using can matter
            more than a critical one on an isolated test machine.
          </p>
          <Table
            head={["Platform", "Useful local commands (on your own machine)"]}
            rows={[
              ["Debian or Ubuntu", <code key="d">apt list --upgradable</code>],
              ["RHEL, Fedora and similar", <code key="r">dnf check-update</code>],
              ["Windows", <code key="w">Get-HotFix</code>],
              ["Automatic security updates (Debian or Ubuntu)", <span key="u">Install and configure the <code>unattended-upgrades</code> package</span>],
            ]}
          />
          <p>
            Microsoft releases most of its security updates on the second Tuesday of each month,
            often called Patch Tuesday, so many teams plan their cycle around it. Out-of-band
            fixes can arrive at any time for urgent problems.
          </p>
          <p>
            Set service-level targets and measure them. For example, critical patches within 7 days.
            If 250 servers need a critical patch and 230 have it by day 7:
          </p>
          <Formula>compliance = 230 ÷ 250 = 0.92, or 92% (illustrative)</Formula>
          <p>
            The remaining 20 servers are the list to chase. Common reasons are offline machines,
            apps that cannot restart, and systems nobody owns. Where a patch truly cannot be applied,
            document the exception and add other controls such as segmentation or a virtual patch.
          </p>
          <Callout tone="tip">
            Do not forget everything that is not the operating system: browsers, libraries, firmware,
            network devices and containers. Attackers use whatever is outdated.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Attack surface is every way in; hardening removes what you do not need and locks down the rest.",
    "A baseline such as a CIS Benchmark gives you a measurable target and an audit checklist.",
    "Automate builds so hardening is repeatable and drift is caught.",
    "Patch with a cycle: inventory, prioritise, test, deploy in rings, verify.",
    "Rank fixes by severity, active exploitation and exposure together, not by CVSS score alone.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main purpose of hardening an operating system?",
      options: [
        "To make it run faster",
        "To reduce the attack surface by removing and locking down what is not needed",
        "To replace patching",
        "To remove the need for backups",
      ],
      answer: 1,
      explain: "Hardening shrinks the set of ways in. It complements patching and backups; it does not replace them.",
    },
    {
      kind: "mcq",
      q: "Which is the best order for a patching cycle?",
      options: [
        "Deploy to everyone, then test",
        "Test, deploy, then work out what systems you own",
        "Inventory, prioritise, test, deploy in rings, verify",
        "Verify, then inventory",
      ],
      answer: 2,
      explain: "Know what you have, decide what matters, test, roll out gradually, then check it worked.",
    },
    {
      kind: "mcq",
      q: "A flaw has a lower CVSS score but is being actively exploited and affects an internet-facing server. What should you do?",
      options: [
        "Ignore it until the score is higher",
        "Treat it as a high priority",
        "Wait for the next yearly review",
        "Disable all logging",
      ],
      answer: 1,
      explain: "Active exploitation and exposure can outweigh the base score when deciding what to patch first.",
    },
    {
      kind: "text",
      q: "What is the lowest CVSS score that counts as critical? (Write it with one decimal place.)",
      format: "***",
      accept: ["9.0", "9"],
      explain: "Critical is the 9.0 to 10.0 band.",
    },
    {
      kind: "text",
      q: "250 servers need a critical patch and 230 have it by the deadline. What percentage is compliant?",
      format: "**",
      accept: ["92", "92%"],
      explain: "230 ÷ 250 = 0.92, which is 92%.",
    },
  ],
};
