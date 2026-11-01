import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Describe the main types of threat actor by motive, skill and resources",
    "Explain the difference between known threats, unknown threats and zero days",
    "Work out how long a system stays exposed between first exploitation and patching",
    "Use the likely attacker to decide which defences matter most",
  ],
  tasks: [
    {
      id: "why-actors",
      title: "Why 'who' matters as much as 'how'",
      body: (
        <>
          <p>
            You cannot defend against everything equally. A corner shop and a defence contractor
            both run computers, but they face very different people. If you treat every attacker
            as the same, you will either spend too much on threats that will never come, or too
            little on the ones that will.
          </p>
          <p>
            A <strong>threat actor</strong> is a person or group that can cause harm to your
            systems or data. Describing an actor takes four questions: <em>why</em> do they act
            (motive), <em>how skilled</em> are they, <em>what can they spend</em> (money, time,
            tools), and <em>how close</em> are they to you (outside, or already inside). The
            answers shape the attacks you should expect.
          </p>
          <p>
            Think of burglary. A teenager trying car doors in a car park, a gang that has studied
            your shop for weeks, and a former employee who still has a key are three different
            problems. A better lock helps with the first. Watching who has keys helps with the
            third. Cyber security works the same way.
          </p>
        </>
      ),
    },
    {
      id: "actor-types",
      title: "The main types of threat actor",
      body: (
        <>
          <Table
            head={["Actor", "Usual motive", "Skill and resources", "What it means for you"]}
            rows={[
              [
                "Unskilled attacker (script kiddie)",
                "Curiosity, bragging, mischief",
                "Low skill; reuses tools written by others",
                "Noisy and opportunistic. Patching and good defaults stop most of it.",
              ],
              [
                "Hacktivist",
                "A political or social cause",
                "Varies; often defacement and denial of service",
                "Your organisation may be a target because of what it stands for.",
              ],
              [
                "Cybercriminal",
                "Money: ransomware, fraud, stolen data for sale",
                "Often organised, run like a business, with specialised roles",
                "The most common serious threat. Backups, MFA and patching matter most.",
              ],
              [
                "Nation-state or APT",
                "Espionage, disruption, strategic advantage",
                "High skill, large budgets, patient, hard to remove",
                "Targets governments, defence, energy and large suppliers.",
              ],
              [
                "Insider",
                "Grievance, profit, or no motive at all (a mistake)",
                "Already has access, so little skill is needed",
                "Least privilege, logging and offboarding matter more than firewalls.",
              ],
              [
                "Competitor",
                "Stealing trade secrets or designs",
                "Moderate; may hire others to do it",
                "Protect intellectual property and watch departing staff.",
              ],
            ]}
          />
          <p>
            <strong>APT</strong> means advanced persistent threat. The key word is persistent: the
            group wants to stay inside for months, quietly, rather than grab something and go.
          </p>
          <p>
            Insiders come in two kinds. A <em>malicious</em> insider acts on purpose. A{" "}
            <em>negligent</em> insider clicks the wrong link, sends a file to the wrong person or
            misconfigures a storage bucket. The second kind is far more common, and the same
            controls help against both.
          </p>
          <p>
            Related ideas you will meet: <strong>shadow IT</strong> is software or cloud
            services staff use without approval, which creates systems nobody is defending. A{" "}
            <strong>threat vector</strong> is the route an attack takes in, such as email, an
            exposed remote-access service or a stolen password.
          </p>
          <Callout tone="note">
            Real attackers do not stay in neat boxes. Criminals use tools first built by
            governments, and states sometimes hide behind criminal groups. Use the table to
            reason about motive and effort, not to label a specific incident with certainty.
          </Callout>
        </>
      ),
    },
    {
      id: "known-unknown",
      title: "Known threats, unknown threats and zero days",
      body: (
        <>
          <p>
            A <strong>vulnerability</strong> is a weakness. Once someone is able to use it, they
            have an <strong>exploit</strong>. Whether you can defend depends on who knows about
            the weakness.
          </p>
          <ul>
            <li>
              <strong>Known threat:</strong> the weakness is public and a fix or detection exists.
              It has an identifier such as a CVE number. Defence is routine: patch, block, detect.
            </li>
            <li>
              <strong>Unknown threat:</strong> a weakness or technique that defenders have not yet
              identified. You cannot patch what nobody has described.
            </li>
            <li>
              <strong>Zero day:</strong> a vulnerability the vendor does not know about, or knows
              about but has not yet fixed, so there are zero days of protection available. If
              attackers are already using it, it is a zero-day exploit.
            </li>
          </ul>
          <p>
            Once a patch ships, the flaw becomes an <strong>n-day</strong>: known, fixable, and
            still dangerous to anyone who has not applied the fix. Attackers read patch notes
            too, so n-day exploits often appear within days of a release. Most real breaches use
            n-days, not zero days. Skipped patches are a bigger problem than secret flaws.
          </p>
          <p>
            Severity is often scored with CVSS, which runs from 0.0 to 10.0. A high score says how
            bad the flaw is in general, not how likely it is to be used against you today. Pair it
            with whether the flaw is being exploited in the wild and whether the system is
            reachable from the internet.
          </p>
        </>
      ),
    },
    {
      id: "exposure-window",
      title: "How long are you exposed? A worked example",
      body: (
        <>
          <p>
            Your risk from a flaw is not only about the zero-day period. It is the whole time from
            first use by attackers until your own systems are fixed.
          </p>
          <Formula>exposure = (vendor patch day − first exploit day) + (your deploy day − vendor patch day)</Formula>
          <p>Take an illustrative timeline, measured in days from the first attack:</p>
          <pre>
            <code>{`Day 0   attackers start using the flaw (zero day)
Day 20  vendor publishes a patch
Day 27  your team finishes deploying it

Zero-day phase : 20 - 0  = 20 days  (nothing to patch)
Your delay     : 27 - 20 =  7 days  (patch exists, you have not applied it)
Total exposure : 20 + 7  = 27 days`}</code>
          </pre>
          <p>
            You control only the 7 days. Cutting that to 2 days reduces total exposure from 27
            days to 22, which is why patch speed is the one lever you always have. For the 20
            days you cannot patch, you rely on other controls.
          </p>
          <Table
            head={["When no patch exists", "How it helps"]}
            rows={[
              ["Reduce attack surface", "Turn off or remove the affected feature if you can"],
              ["Network segmentation", "A compromised host cannot reach everything"],
              ["Least privilege", "The exploited process runs with few rights"],
              ["Behaviour-based detection", "Catches odd activity even with no known signature"],
              ["Vendor workarounds", "Temporary settings or rules published in advisories"],
              ["Virtual patching", "A firewall or WAF rule blocks the known attack route"],
            ]}
          />
          <Callout tone="tip">
            Defence in depth is the answer to zero days. No single control stops an unknown flaw,
            but five imperfect layers make a successful attack slow, noisy and easier to catch.
          </Callout>
        </>
      ),
    },
    {
      id: "apply",
      title: "Turning actors into decisions",
      body: (
        <>
          <p>
            Pick a system you own, such as a small web shop, and ask who would realistically
            attack it. A web shop mostly attracts cybercriminals after card data or ransom money,
            plus unskilled attackers scanning for easy wins. It is unlikely to be of interest to
            a nation-state. That tells you to put effort into patching, MFA, backups and web
            application security rather than into defending against advanced espionage.
          </p>
          <p>
            A contractor that supplies parts to a government has a different list. Patience and
            resources on the attacker side mean you must plan for a long, quiet intrusion. Detect
            unusual behaviour inside, not just block at the edge.
          </p>
          <Callout tone="warn" title="Stay on the right side of the line">
            Learning how attackers work is legitimate. Testing real systems that you do not own,
            or have no written permission to test, is illegal in most places. Practise only in
            your own lab or on platforms built for it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Describe a threat actor by motive, skill, resources and how close they are to you.",
    "Cybercriminals are the most common serious threat; insiders already hold access.",
    "A zero day has no vendor fix yet. Once a patch exists the flaw becomes an n-day.",
    "Most breaches use known flaws that were not patched, so patch speed is your main lever.",
    "For unknown flaws, rely on layers: less attack surface, segmentation, least privilege and behaviour detection.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which description best fits a zero-day vulnerability?",
      options: [
        "A flaw that was patched more than a year ago",
        "A flaw the vendor does not know about or has not yet fixed",
        "A flaw that can only be used on the first day of the month",
        "A flaw found only by hacktivists",
      ],
      answer: 1,
      explain: "Zero day means defenders have had zero days to prepare: no patch exists yet.",
    },
    {
      kind: "mcq",
      q: "A departing employee still has working login details and copies customer files. Which actor type is this?",
      options: ["Nation-state", "Hacktivist", "Unskilled attacker", "Insider"],
      answer: 3,
      explain: "An insider already has legitimate access. Least privilege, logging and prompt offboarding limit this risk.",
    },
    {
      kind: "text",
      q: "Attackers start using a flaw on day 0. The vendor patches on day 12. You deploy the patch on day 15. How many days in total were you exposed?",
      format: "**",
      accept: ["15"],
      explain: "Exposure runs from first use to your fix: 15 − 0 = 15 days (12 with no patch plus 3 of your own delay).",
    },
    {
      kind: "text",
      q: "What two-word term describes a flaw that has no vendor fix yet? Use the term as written in the lesson, with a space between the words.",
      format: "**** ***",
      accept: ["zero day", "zero-day", "0 day", "0-day", "zeroday"],
      explain: "A zero day is a vulnerability with no patch available at the time it is found or used.",
    },
  ],
};
