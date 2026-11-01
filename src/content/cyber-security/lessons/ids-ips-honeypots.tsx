import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain the difference between an IDS and an IPS, and where each is placed",
    "Compare signature-based and anomaly-based detection",
    "Work out why a small false-positive rate can still bury analysts in alerts",
    "Describe how honeypots and honeytokens give high-quality alerts safely",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a firewall only sees the front door",
      body: (
        <>
          <p>
            A firewall decides who may talk to what. It does not decide whether the conversation
            itself is malicious. A web request to an allowed port may carry an attack, and a
            compromised laptop may quietly send data out over an allowed port. You need something
            that watches the traffic and the hosts for signs of trouble.
          </p>
          <p>
            An <strong>intrusion detection system (IDS)</strong> watches and raises alerts. An{" "}
            <strong>intrusion prevention system (IPS)</strong> sits in the traffic path and can
            also block. Think of a CCTV camera with an alarm (IDS) versus a security guard who can
            stop someone at the door (IPS).
          </p>
        </>
      ),
    },
    {
      id: "ids-vs-ips",
      title: "IDS, IPS, network and host",
      body: (
        <>
          <Table
            head={["", "IDS", "IPS"]}
            rows={[
              ["Action", "Detects and alerts", "Detects and blocks"],
              ["Placement", "Off to the side, fed a copy of traffic (SPAN or mirror port, or a network TAP)", "Inline, so traffic flows through it"],
              ["If it fails", "You lose visibility; traffic keeps flowing", "Fail-open lets everything through; fail-closed stops the network"],
              ["Risk of a false positive", "A wasted analyst alert", "Legitimate traffic gets blocked"],
            ]}
          />
          <p>
            A <strong>network IDS/IPS (NIDS/NIPS)</strong> watches traffic on a network segment. A{" "}
            <strong>host IDS/IPS (HIDS/HIPS)</strong> runs on one machine and watches logs, file
            changes, processes and system calls. Encrypted traffic is a blind spot for network
            tools, which is where host-based tools help.
          </p>
          <p>
            Start in detection mode. Run any new IPS rule as alert-only first, review the
            matches, and switch to blocking only for rules you trust. This avoids the nasty case
            where a rule blocks the payroll system on month end.
          </p>
        </>
      ),
    },
    {
      id: "detection-methods",
      title: "How detection decisions are made",
      body: (
        <>
          <Table
            head={["Method", "How it works", "Good at", "Weak at"]}
            rows={[
              ["Signature-based", "Matches traffic or files against known patterns", "Known attacks, few false positives", "New or modified attacks"],
              ["Anomaly-based", "Learns what normal looks like and flags deviations", "Unusual behaviour, possibly new attacks", "Noisy; normal changes cause alerts"],
              ["Policy-based", "Alerts on anything that breaks your rules", "Detecting forbidden use", "Needs well-written policy"],
            ]}
          />
          <p>
            Most products combine these. Here is an illustrative Suricata rule that alerts when one
            source opens many new connections to an SSH port in a short time:
          </p>
          <pre>
            <code>{`alert tcp $EXTERNAL_NET any -> $HOME_NET 22 (msg:"Many SSH connection attempts from one source"; flags:S; threshold:type both, track by_src, count 5, seconds 60; classtype:attempted-recon; sid:1000001; rev:1;)`}</code>
          </pre>
          <p>
            Read it left to right: alert on TCP traffic from outside to your network on port 22; match
            only the first packet of a connection (<code>flags:S</code>); fire when 5 such packets
            arrive from the same source within 60 seconds. IDs from 1,000,000 up are reserved for
            your own local rules.
          </p>
          <p>
            On a single host, the same behaviour appears in the authentication log, and tools such
            as <code>fail2ban</code> can react by banning the address:
          </p>
          <pre>
            <code>{`Mar 14 10:02:11 web01 sshd[2211]: Failed password for invalid user admin from 203.0.113.45 port 51514 ssh2

# /etc/fail2ban/jail.local
[sshd]
enabled  = true
maxretry = 5
findtime = 10m
bantime  = 1h`}</code>
          </pre>
          <Callout tone="warn">
            Only run scans, traffic generators or detection tests on a lab you own. Sending
            suspicious-looking traffic across a real network that is not yours may be illegal and can
            set off real incident responses.
          </Callout>
        </>
      ),
    },
    {
      id: "alert-fatigue",
      title: "Why a tiny error rate still drowns you",
      body: (
        <>
          <p>
            Most traffic is harmless, so even a very accurate detector raises many false alarms.
            This is the base-rate problem, and it connects to the lesson on true and false
            positives. Take illustrative numbers for one day:
          </p>
          <pre>
            <code>{`Events inspected:        1,000,000
Real attacks among them:       10
Detector catches 90% of real attacks:       10 × 0.90   =     9 true alerts
False positive rate 0.1% on harmless events: ~999,990 × 0.001 ≈ 1,000 false alerts

Precision = true alerts ÷ all alerts = 9 ÷ (9 + 1,000) ≈ 0.9%`}</code>
          </pre>
          <Formula>precision = true positives ÷ (true positives + false positives)</Formula>
          <p>
            Fewer than 1 alert in 100 is real, even though the detector is &quot;99.9% right&quot; on
            harmless events. That is why analysts become numb and miss the real one. The fix is
            tuning: disable rules that never matter, raise thresholds, add context (is this
            host a server?) and prefer fewer, higher-quality alerts.
          </p>
        </>
      ),
    },
    {
      id: "honeypots",
      title: "Honeypots and honeytokens",
      body: (
        <>
          <p>
            A <strong>honeypot</strong> is a decoy system with no legitimate use. Nobody should
            ever connect to it, so any contact is suspicious. That makes its alerts rare and
            valuable, the opposite of the alert-fatigue problem above.
          </p>
          <Table
            head={["Kind", "What it is", "Trade-off"]}
            rows={[
              ["Low-interaction honeypot", "Imitates a few services, such as a fake login prompt", "Safe and easy; limited detail captured"],
              ["High-interaction honeypot", "A real system left to be probed", "Rich information; higher risk and effort"],
              ["Honeynet", "A network of honeypots", "Studies attacker behaviour in depth"],
              ["Honeytoken", "A fake record, file, credential or cloud key that should never be used", "Cheap; alert fires when it is touched"],
            ]}
          />
          <p>
            Example: place a document named <code>passwords_backup.xlsx</code> on a file server
            with a canary that alerts when it is opened, or create a user account with an attractive
            name that no one is supposed to log in to. Any login attempt on that account is an
            instant, near-certain alert.
          </p>
          <Callout tone="warn" title="Isolate the decoy">
            A honeypot is a machine an attacker may try to take over, so it must not be a path to
            real systems. Place it in its own segment with strict outbound rules, monitor it, and
            check legal and policy limits before deploying one on a production network.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An IDS watches and alerts; an IPS sits inline and can block, so a wrong IPS rule can break real traffic.",
    "Network sensors see traffic; host sensors see processes and files, and cope with encrypted traffic better.",
    "Signature detection is precise on known attacks; anomaly detection can find new ones but is noisier.",
    "Low false-positive rates still produce many false alerts when real attacks are rare, so tune relentlessly.",
    "Honeypots and honeytokens produce few, high-confidence alerts if they are isolated and watched.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the key difference between an IDS and an IPS?",
      options: [
        "An IDS is inline and blocks; an IPS only logs",
        "An IPS sits inline and can block traffic; an IDS detects and alerts",
        "An IPS only works on hosts",
        "There is no difference",
      ],
      answer: 1,
      explain: "An IPS is placed in the traffic path so it can stop traffic. An IDS receives a copy and raises alerts.",
    },
    {
      kind: "mcq",
      q: "Which method is most likely to detect a brand-new attack that has no known signature?",
      options: ["Signature-based detection", "Hash lookup", "Anomaly-based detection", "Port scanning"],
      answer: 2,
      explain: "Anomaly detection flags deviations from normal behaviour, so it can notice attacks nobody has described yet.",
    },
    {
      kind: "text",
      q: "A detector has a 0.2% false positive rate and inspects 500,000 harmless events a day. About how many false alerts is that per day?",
      format: "****",
      accept: ["1000", "1,000"],
      explain: "500,000 × 0.002 = 1,000 false alerts.",
    },
    {
      kind: "text",
      q: "In the term IPS, what does the P stand for? (One word.)",
      format: "**********",
      accept: ["prevention"],
      explain: "IPS is intrusion prevention system.",
    },
  ],
};
