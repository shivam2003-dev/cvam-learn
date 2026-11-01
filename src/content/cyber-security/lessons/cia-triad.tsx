import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Define confidentiality, integrity and availability and give an example of each",
    "Map an incident or a control to the property it affects",
    "Explain why the three goals pull against each other and how teams balance them",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Security work is full of tools, alerts and rules. Without a simple frame, it is hard to
            say what you are actually protecting. Is a stolen customer list worse than a website
            that is down for an hour? Is a silently edited invoice worse than either?
          </p>
          <p>
            The <strong>CIA triad</strong> gives you a short checklist for asking that question
            about any system. It names three goals that nearly every security control serves:
            <strong> confidentiality</strong>, <strong>integrity</strong> and{" "}
            <strong>availability</strong>. (This CIA has nothing to do with the intelligence agency.)
          </p>
          <p>
            Think of a bank vault. Confidentiality is keeping strangers from seeing what is inside.
            Integrity is making sure nobody swaps the gold for fakes. Availability is making sure
            the owner can open the door during business hours. A vault that fails any one of the
            three is a bad vault.
          </p>
        </>
      ),
    },
    {
      id: "three-goals",
      title: "The three goals",
      body: (
        <>
          <Table
            head={["Goal", "Plain meaning", "Typical failure", "Typical controls"]}
            rows={[
              [
                <strong key="c">Confidentiality</strong>,
                "Only the right people can read the data",
                "Leaked database, misconfigured public storage, eavesdropping",
                "Encryption, access control, MFA, data classification",
              ],
              [
                <strong key="i">Integrity</strong>,
                "Data and systems change only in authorised, detectable ways",
                "Tampered record, altered config file, modified software download",
                "Hashes, digital signatures, write permissions, audit logs, change control",
              ],
              [
                <strong key="a">Availability</strong>,
                "Systems and data work when people need them",
                "Outage, denial of service, ransomware, failed disk",
                "Redundancy, backups, capacity planning, patching, DoS protection",
              ],
            ]}
          />
          <p>
            Confidentiality is about <em>who can see</em>. Integrity is about <em>whether it is
            still correct</em>. Availability is about <em>whether it is there</em>. Notice that
            integrity covers more than data: an attacker who quietly changes a running program has
            broken the integrity of the system even if no file was read or deleted.
          </p>
          <Callout tone="note">
            Two related ideas often appear next to the triad. <strong>Authenticity</strong> means
            you can trust where data came from. <strong>Non-repudiation</strong> means a sender
            cannot credibly deny sending something, usually proven with digital signatures. Many
            texts fold both into integrity.
          </Callout>
        </>
      ),
    },
    {
      id: "examples",
      title: "Seeing the triad in real situations",
      body: (
        <>
          <p>
            A single event can break more than one goal. Sorting incidents by the property they
            hit helps you pick the right response.
          </p>
          <Table
            head={["Situation", "Main property hit", "Why"]}
            rows={[
              ["An employee emails a spreadsheet of salaries to the wrong person", "Confidentiality", "Data reached someone who should not see it"],
              ["A script changes bank account numbers in a payments table", "Integrity", "Data is no longer correct, though nothing leaked"],
              ["A web shop is flooded with junk traffic on a sale day", "Availability", "Real customers cannot reach the site"],
              ["Ransomware encrypts files and the attacker also copies them out", "Availability and confidentiality", "Files are unusable and a copy is now outside your control"],
              ["A software update server is compromised and serves a modified installer", "Integrity", "Users receive code the vendor never wrote"],
            ]}
          />
          <p>
            Here is a small, safe way to feel the difference on your own machine. A file that only
            you may read protects confidentiality. A saved hash lets you detect a change, which
            protects integrity.
          </p>
          <pre>
            <code>{`# Confidentiality: only the owner can read or write this file
chmod 600 secrets.env
ls -l secrets.env
# -rw------- 1 you you 42 secrets.env

# Integrity: record a fingerprint now, check it later
sha256sum report.csv > report.csv.sha256
sha256sum -c report.csv.sha256
# report.csv: OK     (prints FAILED if the file changed)`}</code>
          </pre>
          <p>
            A hash does not stop the change. It only makes the change visible. That is a useful
            distinction: some controls <em>prevent</em>, some <em>detect</em>, and good integrity
            usually needs both.
          </p>
        </>
      ),
    },
    {
      id: "availability-math",
      title: "Availability is a number you can calculate",
      body: (
        <>
          <p>
            Confidentiality and integrity are hard to measure, but availability is usually quoted
            as a percentage of time a service works. Convert it to minutes and the numbers become
            concrete.
          </p>
          <Formula>allowed downtime = total time × (1 − availability)</Formula>
          <p>Over a 365-day year there are 365 × 24 × 60 = 525,600 minutes:</p>
          <Table
            head={["Availability", "Downtime per year", "Calculation"]}
            rows={[
              ["99%", "about 87.6 hours", "525,600 × 0.01 = 5,256 minutes"],
              ["99.9%", "about 8.76 hours", "525,600 × 0.001 = 525.6 minutes"],
              ["99.99%", "about 52.6 minutes", "525,600 × 0.0001 = 52.56 minutes"],
            ]}
          />
          <p>
            Each extra nine is about ten times harder and more expensive. Redundancy is the usual
            tool. If one server is up 99% of the time and fails independently of a second identical
            server, the chance that both are down at once is 0.01 × 0.01 = 0.0001. Combined
            availability is 1 − 0.0001 = 99.99%.
          </p>
          <Callout tone="warn" title="Independence is the catch">
            That result assumes the two servers fail independently. If both sit on the same power
            feed, run the same buggy release, or depend on the same database, one fault takes both
            down and the maths no longer holds. Real redundancy means removing shared points of
            failure.
          </Callout>
        </>
      ),
    },
    {
      id: "trade-offs",
      title: "The goals pull against each other",
      body: (
        <>
          <p>
            You cannot maximise all three at once, so security is about balance. Some common
            tensions:
          </p>
          <ul>
            <li>
              <strong>Confidentiality versus availability:</strong> strong encryption and strict
              access checks add friction. Lose the key or lock out every admin and the data is
              perfectly confidential and completely unavailable.
            </li>
            <li>
              <strong>Integrity versus availability:</strong> strict change approval catches
              mistakes but slows urgent fixes during an outage.
            </li>
            <li>
              <strong>Availability versus confidentiality:</strong> more copies of data (backups,
              replicas, caches) survive failures better, but every copy is another place to leak
              from.
            </li>
          </ul>
          <p>
            The right balance depends on what the system does. A hospital records system leans on
            integrity and availability: a wrong dosage or an offline chart can harm a patient. A
            private journal app leans on confidentiality. A public news site cares most about
            availability and the integrity of its pages, since the content is public anyway.
          </p>
          <Callout tone="tip">
            When reviewing any design, ask three questions in order: who must never see this, what
            would be damaging if it were silently changed, and how long can we live without it?
            The answers tell you where to spend effort.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Confidentiality limits who can read, integrity protects correctness, availability keeps things working.",
    "One incident can hit several properties, so name each one when you analyse it.",
    "Hashes and signatures detect tampering; they do not by themselves prevent it.",
    "Availability can be converted to minutes of downtime, and redundancy only helps if failures are independent.",
    "The goals conflict, so the right balance depends on what the system is for.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "An attacker alters the amounts in a payments table but copies nothing. Which property is mainly broken?",
      options: ["Confidentiality", "Availability", "Authentication", "Integrity"],
      answer: 3,
      explain: "Data was changed without authorisation, so it is no longer correct. That is an integrity failure.",
    },
    {
      kind: "mcq",
      q: "Which control mainly supports availability?",
      options: ["Redundant servers behind a load balancer", "Encrypting data at rest", "Digitally signing releases", "Data classification labels"],
      answer: 0,
      explain: "Redundancy keeps a service working when one component fails. The others mainly serve confidentiality or integrity.",
    },
    {
      kind: "text",
      q: "In the CIA triad, which word does the letter I stand for?",
      format: "*********",
      accept: ["integrity"],
      explain: "I is for integrity: data and systems change only in authorised, detectable ways.",
    },
    {
      kind: "text",
      q: "A service promises 99.5% availability over a 30-day month (43,200 minutes). How many minutes of downtime does that allow?",
      format: "***",
      accept: ["216", "216 minutes"],
      explain: "43,200 × (1 − 0.995) = 43,200 × 0.005 = 216 minutes.",
    },
  ],
};
