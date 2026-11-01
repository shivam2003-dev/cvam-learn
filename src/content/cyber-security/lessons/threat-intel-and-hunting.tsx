import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Define threat intelligence, OSINT and indicators of compromise",
    "Use the Pyramid of Pain to judge which indicators are worth acting on",
    "Describe MITRE ATT&CK and how teams use it to describe behaviour",
    "Run a hypothesis-driven threat hunt from idea to new detection",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: waiting for alarms is not enough",
      body: (
        <>
          <p>
            Security tools raise alerts when something matches a known bad pattern. That covers
            the common threats. It does not cover a patient intruder who uses normal tools, avoids
            noisy behaviour and has been inside for weeks. Two ideas help here.
          </p>
          <p>
            <strong>Threat intelligence</strong> is information about who is attacking, how they
            work and what they want, turned into something you can act on. It answers: what
            should we look out for, and how worried should we be?
          </p>
          <p>
            <strong>Threat hunting</strong> flips the usual order. Instead of waiting for an alert,
            a human assumes someone may already be inside and goes looking for evidence. Intelligence
            tells hunters where to look. Hunting finds what the alarms missed, and every result
            improves the alarms.
          </p>
          <p>
            Think of weather. Intelligence is the forecast: storms are likely this week in your
            region. Hunting is walking the roof before the storm and checking for loose tiles,
            instead of waiting for the leak.
          </p>
        </>
      ),
    },
    {
      id: "intel",
      title: "Kinds of intelligence and where it comes from",
      body: (
        <>
          <Table
            head={["Level", "Audience", "Example question"]}
            rows={[
              ["Strategic", "Executives", "Which threat groups target our industry, and why?"],
              ["Operational", "Security managers", "What campaign is active, and how does it start?"],
              ["Tactical", "Defenders and engineers", "Which behaviours should our detections cover?"],
              ["Technical", "SOC tools", "Which addresses, domains and file hashes are known bad?"],
            ]}
          />
          <p>
            <strong>OSINT</strong> (open-source intelligence) means information anyone can
            lawfully read: vendor blogs, government advisories, security researcher write-ups,
            public vulnerability databases, certificate transparency logs, and published malware
            analyses. Other sources are commercial feeds, sharing groups within an industry, and
            your own logs, which are often the most relevant of all.
          </p>
          <p>
            To exchange intelligence between tools, two standards are common: <strong>STIX</strong>{" "}
            is a language for describing threat information, and <strong>TAXII</strong> is the
            protocol for delivering it. To control who may see a report, many groups use the Traffic
            Light Protocol (TLP): RED means named recipients only, AMBER is limited sharing within
            your organisation and those who need it, GREEN allows sharing within the community, and
            CLEAR means no restriction. Always respect the label.
          </p>
          <Callout tone="warn">
            OSINT research must stay passive and lawful. Reading public pages is fine. Logging in to
            systems you do not own, interacting with attacker infrastructure, or trying to
            "hack back" is not. Also avoid collecting personal data about private individuals
            beyond what an investigation truly needs.
          </Callout>
        </>
      ),
    },
    {
      id: "iocs",
      title: "Indicators of compromise and the Pyramid of Pain",
      body: (
        <>
          <p>
            An <strong>indicator of compromise (IOC)</strong> is a clue that a system may have
            been attacked: a file hash, an IP address, a domain name, a registry key, an unusual
            filename. IOCs are easy to share and easy to search for. Their weakness is that they
            expire. An attacker changes a domain or recompiles a file, and the old indicator is
            useless. Do not keep an IOC forever. Record when it was seen and when to review it.
          </p>
          <p>
            David Bianco's <strong>Pyramid of Pain</strong> ranks indicators by how much trouble it
            causes an attacker when you detect and block them:
          </p>
          <Table
            head={["Level (bottom to top)", "Effort for the attacker to change it"]}
            rows={[
              ["Hash values", "Trivial: change one byte"],
              ["IP addresses", "Easy: use another server"],
              ["Domain names", "Simple: register a new one"],
              ["Network and host artifacts", "Annoying: adjust tooling"],
              ["Tools", "Challenging: find or build new ones"],
              ["Tactics, techniques and procedures (TTPs)", "Tough: change how they work"],
            ]}
          />
          <p>
            The lesson: blocking hashes is cheap and quickly outdated. Detecting a{" "}
            <em>behaviour</em>, such as "a document opens a command shell", forces the attacker to
            rethink their whole approach.
          </p>
          <p>
            <strong>MITRE ATT&amp;CK</strong> is a public knowledge base that catalogues attacker
            behaviour. It groups <em>tactics</em> (the goal, such as persistence or credential
            access) and <em>techniques</em> (the method, such as creating a scheduled task). Using
            its shared IDs, a hunter, a detection engineer and a report writer all mean the same
            thing, and you can map your detections to see what is covered and what is missing.
          </p>
        </>
      ),
    },
    {
      id: "hunting",
      title: "How a hunt works",
      body: (
        <>
          <p>A good hunt follows a loop, not a random search:</p>
          <ol>
            <li>
              <strong>Hypothesis.</strong> A specific, testable idea: "An attacker who gained a
              foothold might keep access by creating scheduled tasks on servers."
            </li>
            <li>
              <strong>Collect data.</strong> Decide which logs would prove or disprove it.
            </li>
            <li>
              <strong>Investigate.</strong> Search, filter, and compare against normal.
            </li>
            <li>
              <strong>Conclude.</strong> Malicious, benign, or inconclusive because data was missing.
            </li>
            <li>
              <strong>Improve.</strong> Turn what you learned into a permanent detection, fix the
              logging gap, or hand a finding to incident response.
            </li>
          </ol>
          <p>
            Here is the scheduled-task hypothesis as pseudocode over Windows Security events.
            Event 4698 records the creation of a scheduled task:
          </p>
          <pre>
            <code>{`source: Windows Security log
filter: event_id = 4698
group by: host, task_name, creating_user
exclude: known software-update tasks (maintained allow-list)
review: tasks created outside business hours, by non-admin users,
        or running from user-writable folders such as a temp directory
output: list of hosts and tasks to investigate`}</code>
          </pre>
          <p>
            Many results will be harmless. That is normal. The value is in learning what normal
            looks like, building the allow-list, and writing a rule that watches for the odd cases
            from now on.
          </p>
          <p>
            Another classic hunt looks for <strong>beaconing</strong>: malware checking in with its
            controller at regular intervals. Humans browse in bursts; software on a timer is steady.
            A simple count shows why this stands out:
          </p>
          <Formula>connections per day = 86,400 ÷ interval in seconds</Formula>
          <p>
            Worked example (illustrative): a beacon every 60 seconds makes 86,400 ÷ 60 = 1,440
            connections a day to one destination, every day, even at 3 a.m. over a weekend. Attackers
            add random "jitter" to the timing, so hunters look at the overall spread of intervals
            and the small, uniform size of the transfers instead of an exact period. A rare
            destination that many hosts never contacted before is another useful clue.
          </p>
          <Callout tone="tip">
            Write down a hunt even when you find nothing. "We checked X using data Y and found
            nothing" is a result. It documents coverage and saves the next person time.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Threat intelligence turns information about attackers into action; hunting actively searches for what alerts missed.",
    "OSINT must stay lawful and passive. Respect TLP labels when sharing.",
    "IOCs such as hashes, IPs and domains expire fast. Behaviours (TTPs) are costly for attackers to change.",
    "MITRE ATT&CK gives a shared vocabulary of tactics and techniques for hunts and detections.",
    "A hunt is a loop: hypothesis, data, investigation, conclusion, then a lasting improvement.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "At which level of the Pyramid of Pain do indicators cause an attacker the most difficulty?",
      options: ["Hash values", "IP addresses", "Domain names", "Tactics, techniques and procedures"],
      answer: 3,
      explain: "Behaviours are the hardest for an attacker to change, so detecting them hurts the most.",
    },
    {
      kind: "mcq",
      q: "What best describes a threat hunt?",
      options: [
        "Waiting for the SIEM to send an alert",
        "A hypothesis-driven search for intruders that existing alerts did not catch",
        "Scanning the internet for other companies' weaknesses",
        "Deleting old log files",
      ],
      answer: 1,
      explain: "Hunting assumes a compromise may exist and tests a specific idea against real data.",
    },
    {
      kind: "mcq",
      q: "A report is marked TLP:RED. What does that mean for sharing?",
      options: [
        "Share freely with anyone",
        "Post it publicly after a week",
        "Share only with the named recipients",
        "Share with all customers",
      ],
      answer: 2,
      explain: "RED is the most restrictive label: named recipients only.",
    },
    {
      kind: "text",
      q: "Malware beacons to its controller every 60 seconds. How many connections does it make in one day?",
      format: "****",
      accept: ["1440", "1,440"],
      explain: "86,400 seconds in a day ÷ 60 = 1,440.",
    },
    {
      kind: "text",
      q: "What does the acronym IOC stand for? Give the three words.",
      format: "********* ** **********",
      accept: ["indicator of compromise", "indicators of compromise"],
      explain: "An indicator of compromise is evidence that a system may have been breached.",
    },
  ],
};
