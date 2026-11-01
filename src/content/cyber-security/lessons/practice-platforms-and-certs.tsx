import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Explain why you must have permission before testing any system",
    "Choose a legal place to practise for your current level",
    "Map common certifications to the roles they suit",
    "Build a simple practice plan that mixes platforms with your own lab",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: skills need practice, and practice can be illegal",
      body: (
        <>
          <p>
            Reading about security only takes you so far. You learn by doing: running commands,
            reading logs, breaking a test application and then fixing it. But the same actions aimed at
            a system you do not own can be a crime, even if you only look around and change nothing.
          </p>
          <p>
            Laws differ by country. Examples include the Computer Fraud and Abuse Act in the United
            States, the Computer Misuse Act 1990 in the United Kingdom and the Information Technology
            Act, 2000 in India. Each one criminalises unauthorised access to computers. "I was only
            learning" is not a defence.
          </p>
          <p>
            The fix is simple: practise only where you have permission. That means three places. Your
            own machines and virtual labs, platforms built for learning, and organisations that gave
            you a signed agreement.
          </p>
          <Callout tone="warn" title="Rule zero">
            Only test systems you own or have written permission to test. A friend saying "go ahead" is
            not enough for a company's server. Written scope, dates and contact details are what
            protect you.
          </Callout>
        </>
      ),
    },
    {
      id: "permission",
      title: "What written permission looks like",
      body: (
        <>
          <p>
            Professional testers work under a signed agreement before they touch anything. The key
            parts are:
          </p>
          <ul>
            <li>
              <strong>Scope:</strong> exactly which systems, addresses and applications are allowed.
              Anything not listed is off limits.
            </li>
            <li>
              <strong>Rules of engagement:</strong> allowed times, banned techniques (for example, no
              attacks that could knock a service offline) and who to call if something breaks.
            </li>
            <li>
              <strong>Authorisation:</strong> a signature from someone with the authority to approve
              testing.
            </li>
            <li>
              <strong>Reporting:</strong> how findings will be written up and handled.
            </li>
          </ul>
          <p>
            Many companies also run <strong>bug bounty programmes</strong>, which publish exactly what
            you may test and how to report issues. Read their rules fully and stay inside them.
          </p>
        </>
      ),
    },
    {
      id: "platforms",
      title: "Where to practise, by type",
      body: (
        <>
          <p>
            Legal practice grounds fall into a few kinds. The table lists well-known options so you
            can search for them yourself. Features and free tiers change, so check each site.
          </p>
          <Table
            head={["Kind", "Examples", "Good for"]}
            rows={[
              ["Guided learning rooms", "TryHackMe", "Complete beginners, step by step"],
              ["Challenge machines", "Hack The Box", "Harder, less guided practice"],
              ["Command-line games", "OverTheWire", "Linux and shell skills"],
              ["Web security training", "PortSwigger Web Security Academy", "Understanding web flaws and fixes"],
              ["Capture the Flag (CTF)", "picoCTF", "Puzzles and team events"],
              ["Defensive practice", "CyberDefenders, Blue Team Labs Online", "Log analysis, investigations"],
              ["Deliberately weak apps", "OWASP Juice Shop, DVWA", "Run on your own lab VM"],
            ]}
          />
          <p>
            A <strong>CTF</strong> (Capture the Flag) is a contest where you solve security puzzles to
            find a hidden string called a flag. Some are attack style, some are defensive.
          </p>
          <Callout tone="tip">
            Do not skip the defensive side. Reading a log and spotting what happened teaches you what
            attackers leave behind, and employers hire far more defenders than testers.
          </Callout>
        </>
      ),
    },
    {
      id: "certs",
      title: "Certifications: what they are and how to choose",
      body: (
        <>
          <p>
            A <strong>certification</strong> is an exam-based credential from a vendor or body. It
            proves a baseline to employers who cannot judge your skills directly, and many job
            adverts and government roles list them. They do not replace experience, and prices and
            exam formats change, so check the current details with the issuer.
          </p>
          <Table
            head={["Certification", "Level", "Suits"]}
            rows={[
              ["CompTIA Network+", "Entry", "Networking foundations"],
              ["CompTIA Security+", "Entry", "General security knowledge; common first cert"],
              ["CompTIA CySA+", "Intermediate", "SOC and defensive analysis"],
              ["CompTIA PenTest+", "Intermediate", "Penetration testing basics"],
              ["eJPT (INE)", "Entry", "Hands-on junior penetration testing"],
              ["OSCP (OffSec)", "Advanced", "Hands-on penetration testing, practical exam"],
              ["GIAC certifications", "Varies", "Specialities such as forensics, incident handling"],
              ["CISSP (ISC2)", "Advanced, experience required", "Security management and architecture"],
              ["CISA and CISM (ISACA)", "Advanced", "Audit and security management"],
              ["CEH (EC-Council)", "Intermediate", "Ethical hacking concepts; widely recognised on adverts"],
            ]}
          />
          <p>
            Match the cert to the job you want rather than collecting them. A rough guide: aim for
            Network+ and Security+ for general starts, CySA+ or a GIAC course for SOC work, a
            practical exam such as eJPT or OSCP for testing, and CISSP, CISM or CISA later in a
            management or audit career.
          </p>
        </>
      ),
    },
    {
      id: "plan",
      title: "A simple practice plan",
      body: (
        <>
          <p>
            Consistency beats cramming. Here is a balanced weekly rhythm. The hours are illustrative,
            so adjust them to your life.
          </p>
          <Table
            head={["Activity", "Hours per week", "Why"]}
            rows={[
              ["Guided room or course", "3", "Structure and new ideas"],
              ["Your own lab (next lessons)", "2", "Build things and break your own copies"],
              ["Defensive exercise or log reading", "1", "See the other side"],
              ["Write notes in your own words", "1", "Turns exposure into memory"],
            ]}
          />
          <p>
            That is 7 hours a week. Over 12 weeks it comes to 84 hours of deliberate practice, which
            is plenty to finish a beginner path. Keep notes of what you tried and what you learned.
            They become a portfolio you can show.
          </p>
          <Callout tone="note">
            A good habit from day one: before running any tool, ask "Do I own this target, or do I have
            written permission?" If the answer is not a clear yes, stop.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Unauthorised access is a crime in most places, whatever your intent.",
    "Written scope and authorisation are what make testing legal and professional.",
    "Practise on your own lab, on learning platforms and in permitted programmes only.",
    "Choose certifications that match the role you want, not the longest list.",
    "Mix offensive and defensive practice and keep notes of what you learn.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which item is the core of permission to test a company's systems?",
      options: [
        "A verbal agreement from a colleague",
        "A signed agreement that defines scope and rules of engagement",
        "Using a VPN",
        "Having a certification",
      ],
      answer: 1,
      explain: "Written scope and authorisation define what you may test and protect you legally.",
    },
    {
      kind: "mcq",
      q: "Which pairing of practice type and purpose is correct?",
      options: [
        "OverTheWire: practise Linux shell skills through games",
        "A neighbour's Wi-Fi: safe practice with no permission",
        "A bug bounty target not in scope: fine to test",
        "A company website: fine if you do not change anything",
      ],
      answer: 0,
      explain: "OverTheWire is a legal game for shell skills. The other options all involve systems you lack permission to test.",
    },
    {
      kind: "text",
      q: "What does the acronym CTF stand for in security events? Three words.",
      format: "******* *** ****",
      accept: ["capture the flag"],
      explain: "In a Capture the Flag contest you solve puzzles to find a hidden flag string.",
    },
    {
      kind: "text",
      q: "What word describes the list of systems you are allowed to test in an agreement?",
      format: "*****",
      accept: ["scope"],
      explain: "Scope defines the allowed targets. Anything outside it is off limits.",
    },
  ],
};
