import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "List the seven stages of the Cyber Kill Chain and what a defender can do at each",
    "Explain how MITRE ATT&CK organises tactics, techniques and sub-techniques",
    "Describe the four corners of the Diamond Model and when to use each model",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why we need models of an attack",
      body: (
        <>
          <p>
            An intrusion is not one event. It is a series of steps, and each step leaves traces. If
            you only see the final ransom note, you have lost. If you can name the steps, you can
            ask a useful question at each one: could we have seen this, and could we have stopped
            it?
          </p>
          <p>
            Three popular models give defenders a shared vocabulary. They answer different
            questions, so teams often use all three.
          </p>
          <Table
            head={["Model", "Main question", "Best for"]}
            rows={[
              ["Cyber Kill Chain", "How far has the attack got?", "Planning layered defence"],
              ["MITRE ATT&CK", "What exactly did the attacker do?", "Detection coverage and threat hunting"],
              ["Diamond Model", "Who, with what, against whom?", "Linking incidents and analysis"],
            ]}
          />
          <p>
            Analogy: think of a burglary. The kill chain is the timeline from scouting the street to
            leaving with the goods. ATT&amp;CK is a catalogue of burglar techniques, such as picking
            a lock or climbing a drainpipe. The Diamond Model is the case file connecting the
            burglar, their tools, the route and the house.
          </p>
        </>
      ),
    },
    {
      id: "kill-chain",
      title: "The Cyber Kill Chain",
      body: (
        <>
          <p>
            Lockheed Martin adapted a military idea into seven stages. The core idea: the attacker
            must succeed at every stage, while the defender only needs to break one link.
          </p>
          <Table
            head={["Stage", "What the attacker does", "Defender response"]}
            rows={[
              ["1 Reconnaissance", "Gathers names, systems and weaknesses", "Limit public info, watch for scanning"],
              ["2 Weaponization", "Prepares a payload to pair with a weakness", "Hard to see; study threat reports"],
              ["3 Delivery", "Sends it, such as by email or a web link", "Mail filtering, web filtering, awareness"],
              ["4 Exploitation", "Triggers a flaw or tricks the user", "Patching, hardening, sandboxing"],
              ["5 Installation", "Plants persistent access", "Endpoint detection, allow-listing"],
              ["6 Command and Control", "Opens a channel back to the attacker", "Egress filtering, DNS and proxy monitoring"],
              ["7 Actions on Objectives", "Steals data, encrypts files, disrupts", "Segmentation, data loss prevention, backups"],
            ]}
          />
          <p>
            The strength of the model is the "break one link" thinking. Its weakness is that real
            attacks loop back, and insiders or stolen passwords can skip early stages entirely. It
            also focuses on the perimeter, so it fits poorly once the attacker is already inside.
          </p>
        </>
      ),
    },
    {
      id: "attack",
      title: "MITRE ATT&CK",
      body: (
        <>
          <p>
            ATT&amp;CK is a public knowledge base of how real attackers behave, built from observed
            incidents. It is a matrix. The columns are <strong>tactics</strong>, which are the
            attacker's goals at that moment. Under each tactic sit <strong>techniques</strong>, the
            ways to reach the goal, and some have <strong>sub-techniques</strong> with more detail.
          </p>
          <p>
            The Enterprise matrix has 14 tactics: Reconnaissance, Resource Development, Initial
            Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential
            Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration and
            Impact. Techniques have IDs. Examples:
          </p>
          <Table
            head={["ID", "Name", "Tactic"]}
            rows={[
              ["T1566", "Phishing", "Initial Access"],
              ["T1566.001", "Spearphishing Attachment (sub-technique)", "Initial Access"],
              ["T1078", "Valid Accounts", "Initial Access and others"],
              ["T1110", "Brute Force", "Credential Access"],
            ]}
          />
          <p>
            The practical use is <strong>coverage mapping</strong>. List the techniques that matter
            for your environment, mark which ones your logging and alerts would catch, and the gaps
            become your work list. Illustrative example: if you have working detections for 9 of the
            14 tactics, coverage is:
          </p>
          <Formula>9 ÷ 14 = 0.643, about 64%</Formula>
          <Callout tone="tip">
            Tactic coverage is a rough guide. Having one detection in a tactic doesn't mean you
            cover every technique under it. Track coverage per technique for the ones you care
            about most.
          </Callout>
        </>
      ),
    },
    {
      id: "diamond",
      title: "The Diamond Model",
      body: (
        <>
          <p>
            The Diamond Model describes one intrusion event as four connected corners:
          </p>
          <ul>
            <li><strong>Adversary:</strong> the actor, or what you know about them.</li>
            <li><strong>Capability:</strong> the tools and techniques used, such as malware or a stolen password.</li>
            <li><strong>Infrastructure:</strong> what they used to reach you, such as domains, servers and mail accounts.</li>
            <li><strong>Victim:</strong> the target, such as a person, a host or an organisation.</li>
          </ul>
          <p>
            Its power is pivoting. Say two incidents used the same domain (infrastructure). That is
            a hint that the same adversary may be behind both, and you can then check whether the
            capability matches too. Each new fact on one corner lets you ask questions about the
            others. It is a way to organise evidence and spot links, not a way to sequence an attack.
          </p>
        </>
      ),
    },
    {
      id: "example",
      title: "Worked example: one phishing intrusion",
      body: (
        <>
          <p>
            An illustrative incident, mapped across all three models. The addresses use documentation
            ranges and example names only.
          </p>
          <Table
            head={["Observation", "Kill chain", "ATT&CK"]}
            rows={[
              ["Staff names collected from a public site", "Reconnaissance", "Reconnaissance"],
              ["Email with a document attached", "Delivery", "T1566.001, Initial Access"],
              ["User opens it and a script runs", "Exploitation", "Execution"],
              ["A scheduled task is created", "Installation", "Persistence"],
              ["Regular outbound calls to 203.0.113.50", "Command and Control", "Command and Control"],
              ["Files copied out", "Actions on Objectives", "Exfiltration"],
            ]}
          />
          <p>
            Diamond view: the adversary is unknown, the capability is the document and script, the
            infrastructure is 203.0.113.50 and the sending domain, and the victim is the finance
            team. Blocking the sending domain at the mail gateway would have broken the chain at
            Delivery. Spotting the regular outbound calls would have broken it at Command and
            Control.
          </p>
          <Callout tone="warn">
            These models are for defence and analysis. Don't use them as a script to attack systems
            you don't own. Test only where you have written permission.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The Cyber Kill Chain has seven stages, and breaking any one link stops that attack path.",
    "ATT&CK catalogues real attacker behaviour as tactics (goals), techniques and sub-techniques.",
    "Use ATT&CK to map which techniques your logging and alerts actually cover.",
    "The Diamond Model links adversary, capability, infrastructure and victim so you can pivot between incidents.",
    "No single model is complete; combine them and treat real attacks as non-linear.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which model is organised as a matrix of tactics and techniques, and is best for mapping detection coverage?",
      options: ["Diamond Model", "Cyber Kill Chain", "OSI model", "MITRE ATT&CK"],
      answer: 3,
      explain: "ATT&CK lists attacker behaviours by tactic and technique, which suits coverage mapping.",
    },
    {
      kind: "mcq",
      q: "In the kill chain, sending the malicious email is which stage?",
      options: ["Delivery", "Exploitation", "Installation", "Weaponization"],
      answer: 0,
      explain: "Delivery is how the payload reaches the target. Exploitation is when it triggers.",
    },
    {
      kind: "text",
      q: "How many stages are in the Lockheed Martin Cyber Kill Chain?",
      format: "*",
      accept: ["7", "seven"],
      explain: "Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command and Control, Actions on Objectives.",
    },
    {
      kind: "text",
      q: "How many corners does the Diamond Model have?",
      format: "*",
      accept: ["4", "four"],
      explain: "Adversary, capability, infrastructure and victim.",
    },
  ],
};
