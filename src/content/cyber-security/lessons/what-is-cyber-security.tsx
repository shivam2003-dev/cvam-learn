import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Define cyber security and name its three core goals",
    "Describe risk as likelihood times impact and score a simple example",
    "Match the main job roles to defensive, offensive and governance work",
    "Explain how this learning path is laid out",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Almost everything of value now lives in computers: money, medical records, photos,
            company plans, the software that runs a power grid. Anything valuable attracts people who
            want to take it, change it or break it. Software is written by people, so it has mistakes.
            Networks connect millions of strangers. People get tired and click things.
          </p>
          <p>
            <strong>Cyber security</strong> is the practice of protecting systems, networks and data
            from unauthorised access, damage and disruption. It is not one tool or one job. It is a
            set of habits, designs and checks that make attacks harder, quicker to spot and cheaper to
            recover from.
          </p>
          <p>
            Think of a house. Locks on the doors do not make a house safe on their own. You also want
            good windows, a habit of not leaving keys under the mat, a neighbour who notices strangers,
            and an insurance plan for the day something still goes wrong. Cyber security is the same
            idea applied to computers: prevent, detect, respond and recover.
          </p>
          <Callout tone="note">
            No system is perfectly secure. The honest goal is to make an attack costly enough, and
            visible enough, that it is no longer worth trying, and to limit the damage if it works.
          </Callout>
        </>
      ),
    },
    {
      id: "cia",
      title: "The three goals: C, I and A",
      body: (
        <>
          <p>
            Nearly every security decision protects one of three properties. Together they are called
            the <strong>CIA triad</strong>. (This has nothing to do with the intelligence agency.)
          </p>
          <Table
            head={["Goal", "Meaning", "Breaks when...", "Typical control"]}
            rows={[
              ["Confidentiality", "Only the right people can read the data", "A database is exposed to the internet", "Encryption, access control"],
              ["Integrity", "Data is accurate and has not been changed without permission", "A file is silently altered", "Hashes, digital signatures, change logs"],
              ["Availability", "Systems work when people need them", "A site is knocked offline", "Backups, redundancy, rate limiting"],
            ]}
          />
          <p>
            These goals can pull against each other. A system with no access at all is perfectly
            confidential and perfectly useless. Security work is choosing the right balance for the
            data in front of you. A hospital leans hard on availability and integrity, because a wrong
            or missing record can harm a patient. A secret research lab leans on confidentiality.
          </p>
          <p>
            A quick habit: when you read about any incident, ask which of the three it damaged. Stolen
            customer emails hurt confidentiality. A ransomware lock-out hurts availability. A tampered
            bank balance hurts integrity. Many incidents hurt more than one.
          </p>
        </>
      ),
    },
    {
      id: "risk",
      title: "Thinking in risk",
      body: (
        <>
          <p>
            You cannot fix everything, so you rank problems. Three words come up constantly. An{" "}
            <strong>asset</strong> is something worth protecting. A <strong>threat</strong> is
            something that could harm it. A <strong>vulnerability</strong> is a weakness the threat
            could use. <strong>Risk</strong> is the chance that harm actually happens, combined with
            how bad it would be.
          </p>
          <Formula>risk score = likelihood × impact</Formula>
          <p>
            Teams often score each factor from 1 (very low) to 5 (very high). The numbers below are
            illustrative, but the arithmetic is how real risk registers work.
          </p>
          <Table
            head={["Issue", "Likelihood", "Impact", "Score"]}
            rows={[
              ["Admin password reused on many sites", "4", "5", "20"],
              ["Laptop with no disk encryption is lost", "3", "4", "12"],
              ["Old test server still online, holds no real data", "3", "2", "6"],
              ["Office printer has a default password", "2", "2", "4"],
            ]}
          />
          <p>
            Fix the 20 first, then the 12. The 4 can wait. Notice that the printer is easy to attack
            but costs little if it falls, so it ranks last. Likelihood alone is never enough.
          </p>
          <p>
            Once a risk is scored you have four honest choices: <strong>reduce</strong> it with a
            control, <strong>avoid</strong> it by removing the activity, <strong>transfer</strong> it
            (insurance, a provider) or <strong>accept</strong> it knowingly and write that down.
          </p>
        </>
      ),
    },
    {
      id: "layers",
      title: "Prevent, detect, respond, recover",
      body: (
        <>
          <p>
            The NIST Cybersecurity Framework, a widely used guide, groups security work into six
            functions: Govern, Identify, Protect, Detect, Respond and Recover. You do not need to
            memorise a standard yet. The useful idea is that security is a cycle, not a wall.
          </p>
          <ul>
            <li>
              <strong>Identify:</strong> know what you own. You cannot protect a server you forgot
              existed.
            </li>
            <li>
              <strong>Protect:</strong> patching, strong authentication, least privilege, encryption.
            </li>
            <li>
              <strong>Detect:</strong> logs and alerts that tell you something is wrong.
            </li>
            <li>
              <strong>Respond and recover:</strong> a plan for who does what, and tested backups to
              restore from.
            </li>
          </ul>
          <p>
            This is called <strong>defence in depth</strong>: several independent layers, so one
            failure is not fatal. A phishing email might slip past the mail filter, but the user
            still needs a second login factor, the account still has only limited permissions, and
            an alert still fires on strange behaviour.
          </p>
          <Callout tone="tip">
            When you learn any new technique in this path, ask three questions: how does it work, how
            would I see it in logs, and how do I stop it? That habit is what separates a defender from
            someone who only knows tricks.
          </Callout>
        </>
      ),
    },
    {
      id: "roles",
      title: "Who does what: common roles",
      body: (
        <>
          <p>
            Job titles vary between companies, but the work falls into a few families.
          </p>
          <Table
            head={["Role", "Daily work", "Side"]}
            rows={[
              ["SOC analyst", "Watches alerts, decides what is real, escalates incidents", "Defensive"],
              ["Incident responder", "Contains and investigates a live breach, writes the report", "Defensive"],
              ["Security engineer", "Builds and hardens systems, tunes detection, automates controls", "Defensive"],
              ["Digital forensics analyst", "Preserves and examines evidence from disks and memory", "Defensive"],
              ["Penetration tester", "Authorised testing of systems to find weaknesses before criminals do", "Offensive"],
              ["Application security engineer", "Reviews code and designs, fixes classes of bugs", "Both"],
              ["GRC analyst", "Policies, audits, compliance, risk registers", "Governance"],
            ]}
          />
          <p>
            Many people start in a SOC or in IT support and move sideways. Offensive roles are a small
            part of the field, and they need strong defensive and system knowledge first. That is why
            this path starts with operating systems and networks before it touches attacks.
          </p>
          <Callout tone="warn" title="Legal line">
            Testing a system you do not own, without written permission, is illegal in most countries,
            even if you mean no harm. Practise only on your own lab machines or on platforms built for
            it. The next lessons cover where.
          </Callout>
        </>
      ),
    },
    {
      id: "path",
      title: "How this path is laid out",
      body: (
        <>
          <p>
            The path is ordered so each part rests on the one before it.
          </p>
          <ol>
            <li>
              <strong>Introduction:</strong> this lesson, basic hardware, and where to practise
              legally.
            </li>
            <li>
              <strong>Operating systems:</strong> Linux, Windows and macOS, permissions and a home
              lab. You cannot defend a machine you cannot operate.
            </li>
            <li>
              <strong>Networking:</strong> every attack and defence travels over a network.
            </li>
            <li>
              <strong>Later topics:</strong> the threats, the tools and the habits of defenders,
              each explained from the defender's view.
            </li>
          </ol>
          <p>
            Do the tasks in each lesson on a machine you own. Reading builds recognition, but typing
            commands builds skill.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Cyber security protects systems and data from unauthorised access, damage and disruption.",
    "The CIA triad is confidentiality, integrity and availability, and goals can conflict.",
    "Risk is likelihood times impact, used to decide what to fix first.",
    "Good security layers prevention, detection, response and recovery.",
    "Always practise on systems you own or have written permission to test.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A ransomware attack locks a hospital's files so staff cannot open them. Which CIA goal is most directly hit?",
      options: ["Confidentiality", "Integrity", "Non-repudiation", "Availability"],
      answer: 3,
      explain: "Staff cannot get to the data when they need it, which is an availability failure.",
    },
    {
      kind: "mcq",
      q: "Which approach does defence in depth describe?",
      options: [
        "One very strong firewall at the edge",
        "Several independent layers so one failure is not fatal",
        "Hiding the system's name from users",
        "Accepting every risk in writing",
      ],
      answer: 1,
      explain: "Layers such as filtering, authentication, least privilege and alerting back each other up.",
    },
    {
      kind: "text",
      q: "An issue has likelihood 4 and impact 5 on a 1 to 5 scale. What is its risk score?",
      format: "**",
      accept: ["20"],
      explain: "Risk score is likelihood times impact: 4 × 5 = 20.",
    },
    {
      kind: "text",
      q: "What does the C in the CIA triad stand for? One word.",
      format: "***************",
      accept: ["confidentiality"],
      explain: "Confidentiality means only the right people can read the data.",
    },
  ],
};
