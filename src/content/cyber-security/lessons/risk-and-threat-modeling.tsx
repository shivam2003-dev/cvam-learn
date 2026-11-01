import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Tell assets, threats, vulnerabilities and risk apart",
    "Rank risks with likelihood times impact and estimate annual loss in money",
    "Choose between mitigating, transferring, avoiding and accepting a risk",
    "Run a simple STRIDE threat-modeling pass over a system diagram",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            You will never have enough time or money to fix everything. A company with ten thousand
            known weaknesses still has to decide what to fix this week. Risk analysis is the habit
            of deciding that on purpose rather than by gut feeling or by whichever alert is loudest.
          </p>
          <p>
            It starts with four words that people often mix up. Getting them straight makes every
            later conversation clearer.
          </p>
          <Table
            head={["Term", "Meaning", "Example"]}
            rows={[
              [<strong key="a">Asset</strong>, "Something of value you want to protect", "Customer database"],
              [<strong key="t">Threat</strong>, "Something or someone that could cause harm", "A criminal group, a careless insider, a flood"],
              [<strong key="v">Vulnerability</strong>, "A weakness a threat could use", "An unpatched server, a weak password rule"],
              [<strong key="r">Risk</strong>, "The chance that a threat uses a vulnerability to harm an asset, and how bad that would be", "Chance of the database leaking this year, and the cost if it does"],
            ]}
          />
          <p>
            An analogy: a house is the asset, a burglar is the threat, an unlocked back door is the
            vulnerability, and the risk is how likely a break-in is combined with what you would
            lose. Remove any one of the three ingredients and the risk drops. A burglar with no
            unlocked door, or an unlocked door in a neighbourhood with no burglars, is a smaller
            problem.
          </p>
        </>
      ),
    },
    {
      id: "likelihood-impact",
      title: "Ranking risks: likelihood times impact",
      body: (
        <>
          <Formula>risk score = likelihood × impact</Formula>
          <p>
            A simple method scores both on a scale of 1 (very low) to 5 (very high) and multiplies.
            The scales and bands below are illustrative; every organisation sets its own.
          </p>
          <Table
            head={["Risk", "Likelihood", "Impact", "Score"]}
            rows={[
              ["Internet-facing VPN appliance left unpatched", "3", "5", "15"],
              ["Employee falls for a phishing email", "4", "3", "12"],
              ["Unencrypted laptop is lost or stolen", "3", "4", "12"],
              ["Admin deletes a production table by mistake", "2", "4", "8"],
              ["Office loses power for a day", "2", "2", "4"],
            ]}
          />
          <p>
            Sorted by score, the VPN comes first, even though phishing is more likely. Impact
            matters as much as chance. Many teams then draw a grid (a heat map) with likelihood on
            one axis and impact on the other, and colour the corners red, amber and green to show
            leadership where attention is needed.
          </p>
          <Callout tone="note">
            This is <strong>qualitative</strong> analysis: it ranks, but does not say what a risk
            costs. It is quick and good enough for most prioritising. Its weakness is that a 12
            from one analyst may be a 9 from another. Agree written definitions for each number.
          </Callout>
          <p>
            For a single known weakness, defenders often start from its CVSS score (Common
            Vulnerability Scoring System). It runs from 0.0 to 10.0. In version 3.x the usual
            bands are Low (0.1 to 3.9), Medium (4.0 to 6.9), High (7.0 to 8.9) and Critical (9.0 to
            10.0).
          </p>
          <p>
            CVSS rates how severe a flaw is in general, not how risky it is for you. A critical
            flaw on a machine that is offline and holds nothing of value may matter less than a
            medium flaw on your public login server. Combine the score with asset value, exposure
            and whether attacks are already happening to get real priority.
          </p>
        </>
      ),
    },
    {
      id: "ale",
      title: "Putting a price on risk",
      body: (
        <>
          <p>
            <strong>Quantitative</strong> analysis uses money. Three terms are standard:
          </p>
          <Formula>SLE = asset value × exposure factor</Formula>
          <Formula>ALE = SLE × ARO</Formula>
          <ul>
            <li>
              <strong>SLE</strong> (single loss expectancy): cost of one incident. The{" "}
              <strong>exposure factor</strong> is the share of the asset lost in that incident.
            </li>
            <li>
              <strong>ARO</strong> (annualised rate of occurrence): how many times per year you
              expect it. Once every five years is 0.2.
            </li>
            <li>
              <strong>ALE</strong> (annualised loss expectancy): the expected loss per year.
            </li>
          </ul>
          <p>
            Worked example with illustrative figures. A data set is worth $200,000. A breach would
            expose 25% of that value.
          </p>
          <pre>
            <code>{`SLE = 200,000 x 0.25 = 50,000
ARO = 1 incident / 5 years = 0.2
ALE = 50,000 x 0.2 = 10,000 per year

Proposed control: encryption plus tighter access, costs 4,000 per year.
It cuts ARO from 0.2 to 0.05.
New ALE = 50,000 x 0.05 = 2,500
Loss avoided = 10,000 - 2,500 = 7,500
Net benefit = 7,500 - 4,000 = 3,500 per year  -> worth doing`}</code>
          </pre>
          <p>
            If a control costs more per year than the loss it avoids, it is not worth buying on
            money grounds alone. Be honest that these inputs are estimates. The method is most
            useful for comparing options, not for predicting an exact bill.
          </p>
        </>
      ),
    },
    {
      id: "treatment",
      title: "What to do with a risk",
      body: (
        <>
          <p>Once you know a risk, you have four standard choices.</p>
          <Table
            head={["Response", "Meaning", "Example"]}
            rows={[
              ["Mitigate (reduce)", "Add controls to lower likelihood or impact", "Patch, add MFA, encrypt"],
              ["Transfer (share)", "Move the financial loss to someone else", "Cyber insurance, a managed provider under contract"],
              ["Avoid", "Stop the risky activity", "Do not collect card numbers; use a payment provider instead"],
              ["Accept", "Knowingly live with it", "Low score, fix costs more than the loss"],
            ]}
          />
          <p>
            What is left after controls is the <strong>residual risk</strong>. It is never zero.
            Accepting a risk should be a written decision by someone with the authority to own it,
            not a default that happens because nobody looked.
          </p>
          <Callout tone="warn" title="Transfer is not erase">
            Insurance can pay for a loss but cannot give back customer trust or restore stolen
            data. Outsourcing a task also leaves you accountable for protecting your customers.
          </Callout>
        </>
      ),
    },
    {
      id: "stride",
      title: "Threat modeling with STRIDE",
      body: (
        <>
          <p>
            Risk tables rank problems you already know. <strong>Threat modeling</strong> finds
            problems during design, when they are cheap to fix. The usual method: draw how data
            moves through the system (users, services, data stores, and the trust boundaries
            between them), then ask what could go wrong at each point.
          </p>
          <p>STRIDE is a checklist of six threat types for that question.</p>
          <Table
            head={["Letter", "Threat", "Property it attacks", "Example question"]}
            rows={[
              ["S", "Spoofing", "Authenticity", "Can someone pretend to be this user or service?"],
              ["T", "Tampering", "Integrity", "Can data be altered in transit or at rest?"],
              ["R", "Repudiation", "Non-repudiation", "Could a user deny an action because we keep no proof?"],
              ["I", "Information disclosure", "Confidentiality", "Can data reach someone who should not see it?"],
              ["D", "Denial of service", "Availability", "Can someone make this unusable?"],
              ["E", "Elevation of privilege", "Authorization", "Can a normal user gain admin rights?"],
            ]}
          />
          <p>
            Example: a mobile app talks to an API, which reads a database. At the arrow between
            app and API, ask STRIDE. Spoofing: is each request tied to a verified user? Tampering:
            is the connection protected with TLS? Information disclosure: do error messages leak
            internal details? Each yes-or-no answer either clears the item or adds a task to the
            backlog. Write the findings down with an owner.
          </p>
          <Callout tone="tip">
            Four questions keep sessions short: what are we building, what can go wrong, what will
            we do about it, and did we do a good job? Repeat when the design changes.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Risk is a threat using a vulnerability against an asset, weighed by likelihood and impact.",
    "Likelihood times impact ranks risks quickly; SLE, ARO and ALE put a price on them.",
    "You can mitigate, transfer, avoid or accept a risk, and some residual risk always remains.",
    "STRIDE is a design-time checklist for finding threats on a data-flow diagram.",
    "A CVSS score measures general severity, so adjust it for your own assets and exposure.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "An unlocked server room door, in these terms, is which of the following?",
      options: ["An asset", "A threat", "A vulnerability", "A residual risk"],
      answer: 2,
      explain: "It is a weakness that a threat could use. The server is the asset and an intruder is the threat.",
    },
    {
      kind: "mcq",
      q: "A company buys cyber insurance to cover breach costs. Which risk response is this?",
      options: ["Avoid", "Transfer", "Accept", "Mitigate"],
      answer: 1,
      explain: "Insurance moves the financial loss to another party. It does not remove the chance of the incident.",
    },
    {
      kind: "text",
      q: "A single incident would cost 20,000 and is expected once every two years (ARO 0.5). What is the ALE per year?",
      format: "*****",
      accept: ["10000", "10,000", "$10,000", "10000 per year"],
      explain: "ALE = SLE × ARO = 20,000 × 0.5 = 10,000 per year.",
    },
    {
      kind: "text",
      q: "In STRIDE, which one-word threat type attacks integrity?",
      format: "*********",
      accept: ["tampering"],
      explain: "T is for tampering: unauthorised changes to data or code.",
    },
  ],
};
