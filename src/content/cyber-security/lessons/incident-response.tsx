import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Distinguish an event from an incident and describe the phases of incident response",
    "Compare the NIST and SANS phase models",
    "Name the teams involved and what each contributes",
    "Contain a compromised host safely and calculate MTTD and MTTR",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: panic is the real enemy",
      body: (
        <>
          <p>
            Sooner or later something will get through. A staff member's account is taken over, a
            server starts sending odd traffic, a laptop shows a ransom note. What happens in the
            next hour often decides whether it is a bad afternoon or a company-wide disaster. Teams
            that improvise tend to make three mistakes: they act too fast and destroy evidence,
            they act too slowly and let the damage spread, or they leave key people (legal,
            management, customers) uninformed.
          </p>
          <p>
            <strong>Incident response (IR)</strong> is the planned way of handling this. First some
            definitions. An <strong>event</strong> is any observable occurrence, such as a user
            signing in. Most events are harmless. An <strong>incident</strong> is an event, or group
            of events, that actually or potentially harms confidentiality, integrity or availability,
            or breaks security policy. A single failed login is an event. A successful login from a
            country the user has never visited, followed by mailbox rules forwarding email outside
            the company, is an incident.
          </p>
          <p>
            Think of a fire drill. Nobody designs the escape route while the building is burning.
            You agree it in advance, practise it, and then people can act calmly.
          </p>
        </>
      ),
    },
    {
      id: "phases",
      title: "The phases",
      body: (
        <>
          <p>
            Two models are widely taught. NIST (in its guide SP 800-61) uses four phases. SANS uses
            six, often remembered as PICERL. They describe the same work, divided differently.
          </p>
          <Table
            head={["NIST phase", "SANS phase", "What happens"]}
            rows={[
              ["Preparation", "Preparation", "Plans, tools, contacts, training, logging in place"],
              ["Detection and analysis", "Identification", "Spot it, confirm it, scope it, rate its severity"],
              ["Containment, eradication and recovery", "Containment", "Stop the spread without losing evidence"],
              ["", "Eradication", "Remove the cause: malware, access, bad accounts"],
              ["", "Recovery", "Restore systems and watch closely for return"],
              ["Post-incident activity", "Lessons learned", "Review what happened and improve"],
            ]}
          />
          <p>
            In practice the phases overlap and loop. Analysis may reveal a second infected machine
            after you thought you had contained everything, sending you back a step.
          </p>
          <ul>
            <li>
              <strong>Preparation</strong> is the phase that pays off most. It includes a written IR
              plan, an up-to-date contact list, logging and backups that work (see the lessons on
              logs and on backups), a place to talk if email is compromised, and practice
              exercises.
            </li>
            <li>
              <strong>Identification</strong> asks: is it real, how big is it, and how bad? Rate
              severity using criteria agreed in advance (data involved, systems affected, whether
              operations are down) so the response matches the risk.
            </li>
            <li>
              <strong>Containment</strong> limits damage. Short-term moves are fast: isolate a host
              from the network, disable an account, block an address. Longer-term moves keep the
              business running while you clean up, such as rebuilding a clean replacement.
            </li>
            <li>
              <strong>Eradication</strong> removes what the attacker left: malware, persistence
              mechanisms, extra accounts, and the weakness they used. Closing the door matters, or
              they simply return.
            </li>
            <li>
              <strong>Recovery</strong> brings systems back from known-good sources and monitors them
              intensely for a period.
            </li>
            <li>
              <strong>Lessons learned</strong> is a blameless review a few days after the incident. What
              worked, what slowed us down, what do we change? Without it, you will repeat the incident.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "containment",
      title: "Containing a host without destroying evidence",
      body: (
        <>
          <p>
            The tempting reaction to a compromised machine is to pull the power. Resist it. Powering
            off wipes memory, which can hold running malware, network connections and encryption
            keys. Usually the better first step is to cut the machine off from the network while
            leaving it running, then follow your forensics procedure (see the digital forensics
            lesson).
          </p>
          <p>
            Many endpoint detection tools can isolate a host remotely with one click, leaving only a
            channel back to the security team. On a Linux server you control, a temporary block of a
            suspicious address might look like this (illustrative, using a documentation address):
          </p>
          <pre>
            <code>{`# record who you are and when, before changing anything
date -u; whoami

# drop traffic to and from one suspicious address
sudo iptables -I INPUT  1 -s 198.51.100.7 -j DROP
sudo iptables -I OUTPUT 1 -d 198.51.100.7 -j DROP

# note the change in the incident log, so it can be reversed later
sudo iptables -L -n --line-numbers | head`}</code>
          </pre>
          <Callout tone="warn">
            Act only on systems you are responsible for and are authorised to change. During a real
            incident, follow the plan and write down every action with a timestamp. Undocumented
            changes make it impossible to separate your actions from the attacker's.
          </Callout>
          <p>
            Also decide early whether to <em>watch</em> or <em>evict</em>. Sometimes a team quietly
            monitors the intruder to learn the full scope before cutting access, so that eradication
            removes everything in one go. This is a risk decision for the incident lead, not a
            solo choice by an analyst.
          </p>
        </>
      ),
    },
    {
      id: "people",
      title: "Who gets involved",
      body: (
        <>
          <p>IR is a team effort and not only for technical staff.</p>
          <Table
            head={["Role", "Contribution"]}
            rows={[
              ["Incident lead or commander", "Makes decisions, keeps the response organised, owns the timeline"],
              ["SOC and IR analysts", "Triage, investigate, contain, collect evidence"],
              ["IT and system owners", "Apply changes, rebuild and restore systems"],
              ["Legal and compliance", "Advise on obligations, evidence and notifications"],
              ["Communications", "Handle messages to staff, customers and the press"],
              ["Management", "Approve disruptive actions and spend"],
              ["HR", "Involved when an employee is the source or the target"],
            ]}
          />
          <p>
            Legal involvement matters because rules may require telling regulators or affected people
            within a fixed time. For example, the EU GDPR generally requires notifying the supervisory
            authority of a personal data breach within 72 hours of becoming aware of it, where
            required. Check the rules that apply to your organisation and region.
          </p>
          <p>
            Keep one shared, timestamped log of facts: what was seen, by whom, what action was taken.
            Use a communication channel that does not depend on the possibly compromised systems.
          </p>
        </>
      ),
    },
    {
      id: "metrics",
      title: "Measuring response",
      body: (
        <>
          <p>Two simple numbers show whether your team is improving:</p>
          <Formula>MTTD = total detection time ÷ number of incidents</Formula>
          <p>
            <strong>MTTD</strong> is mean time to detect: from when the problem began to when you
            noticed it. <strong>MTTR</strong> is mean time to respond or recover, depending on the
            organisation, so write down which definition you use.
          </p>
          <p>
            Worked example (illustrative): four incidents were detected 4, 10, 1 and 5 hours after
            they began. The mean is (4 + 10 + 1 + 5) ÷ 4 = 20 ÷ 4 = 5 hours. The long 10-hour case
            is worth studying: what logging or alert was missing? Averages can hide outliers, so look
            at the individual cases too.
          </p>
          <Callout tone="tip">
            Run a tabletop exercise twice a year: gather the team, read out a realistic scenario,
            and talk through each decision. It finds gaps in the plan at almost no cost.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An event is anything observable; an incident actually or potentially harms security.",
    "NIST has four phases and SANS six. Both cover prepare, detect, contain, eradicate, recover and learn.",
    "Preparation pays off most: plans, contacts, logging, backups and practice.",
    "Isolate before you power off, document every action, and keep evidence intact.",
    "IR involves legal, communications and management, not only technical staff. Measure with MTTD and MTTR.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which phase comes immediately after containment in the SANS model?",
      options: ["Identification", "Lessons learned", "Preparation", "Eradication"],
      answer: 3,
      explain: "SANS order: Preparation, Identification, Containment, Eradication, Recovery, Lessons learned.",
    },
    {
      kind: "mcq",
      q: "A suspected compromised laptop is still running. What is usually the best first containment step?",
      options: [
        "Pull the power cord immediately",
        "Isolate it from the network and keep it running",
        "Reinstall the operating system",
        "Ask the user to delete suspicious files",
      ],
      answer: 1,
      explain: "Powering off loses memory contents and reinstalling destroys evidence. Network isolation stops the spread while preserving both.",
    },
    {
      kind: "mcq",
      q: "Why is a lessons-learned review held after the incident is closed?",
      options: [
        "To assign blame to one person",
        "To satisfy a press request",
        "To find what to improve so it does not happen again",
        "To delete the incident record",
      ],
      answer: 2,
      explain: "The goal is improvement of people, process and tools, not blame.",
    },
    {
      kind: "text",
      q: "Detection times for three incidents were 2, 7 and 12 hours. What is the MTTD in hours?",
      format: "*",
      accept: ["7", "7 hours"],
      explain: "(2 + 7 + 12) ÷ 3 = 21 ÷ 3 = 7 hours.",
    },
    {
      kind: "text",
      q: "Under the EU GDPR, within how many hours must a notifiable personal data breach generally be reported to the authority?",
      format: "**",
      accept: ["72", "72 hours"],
      explain: "Article 33 sets a general limit of 72 hours after becoming aware of the breach, where notification is required.",
    },
  ],
};
