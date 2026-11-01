import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Describe what red, blue, purple and white teams do",
    "Name the main frameworks (NIST CSF, ISO/IEC 27001, CIS Controls) and what each is for",
    "Explain the difference between a policy, a standard and a procedure",
    "Say what an audit checks and why compliance does not equal security",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Security is not one person&apos;s job. A growing organisation needs people who build
            defences, people who test them, and shared rules so that everyone is working to the
            same plan. Without structure, each team invents its own approach, gaps hide between
            teams, and nobody can prove to customers or regulators that the company is careful.
          </p>
          <p>
            Two things provide that structure. <strong>Teams</strong> divide the work. And{" "}
            <strong>frameworks</strong> give a tested checklist so you do not start from a blank
            page. This lesson covers both, plus the rule-setting and auditing that tie them
            together.
          </p>
        </>
      ),
    },
    {
      id: "teams",
      title: "The colour-coded teams",
      body: (
        <>
          <p>
            Security exercises borrow from sport and the military. Colours name the role, not a
            person, and a small company may have one person wearing several hats.
          </p>
          <Table
            head={["Team", "Role", "Typical activities"]}
            rows={[
              [<strong key="r">Red team</strong>, "Plays the attacker (with written permission)", "Simulated intrusions that test people, process and technology together"],
              [<strong key="b">Blue team</strong>, "Defends and responds", "Monitoring, alert triage, hardening, incident response, recovery"],
              [<strong key="p">Purple team</strong>, "Not a separate group so much as a way of working: red and blue share findings directly", "Run an attack technique, check whether it was detected, fix gaps, repeat"],
              [<strong key="w">White team</strong>, "Referees and coordinates an exercise", "Sets rules, scope and timing, and keeps the exercise safe"],
            ]}
          />
          <p>
            A plain way to see the difference: a red team asks <em>can we get in?</em>, a blue team
            asks <em>did we notice, and how fast could we stop it?</em>, and a purple exercise sits
            both groups at one table so every attack step produces a concrete defensive
            improvement instead of a report that is read once.
          </p>
          <Callout tone="warn">
            Red team and penetration test work is only legal and ethical with written authorisation
            that defines scope, dates and limits. Practise on your own lab or platforms that
            explicitly invite testing, never on systems you do not have permission to test.
          </Callout>
          <p>
            Common day-to-day job families are a security operations (SOC) analyst who watches
            alerts, an incident responder, a security engineer who builds controls, a
            vulnerability or penetration tester, and a governance, risk and compliance (GRC)
            specialist who owns policy and audits.
          </p>
        </>
      ),
    },
    {
      id: "frameworks",
      title: "Frameworks: do not start from a blank page",
      body: (
        <>
          <p>
            A framework is an agreed structure of goals or controls that experts have refined over
            time. Using one helps you cover the basics and speak a common language with partners.
          </p>
          <Table
            head={["Framework", "From", "What it is", "Typical use"]}
            rows={[
              ["NIST Cybersecurity Framework (CSF)", "NIST (US)", "A high-level model of outcomes. Version 2.0 has six functions: Govern, Identify, Protect, Detect, Respond, Recover", "Organising a programme and talking to leadership"],
              ["ISO/IEC 27001", "ISO/IEC", "A standard for running an information security management system (ISMS). Organisations can be formally certified", "Proving to customers that a managed security process exists"],
              ["CIS Critical Security Controls", "Center for Internet Security", "A prioritised list of practical safeguards (version 8 has 18 controls)", "Deciding what to do first, especially for smaller teams"],
              ["CIS Benchmarks", "Center for Internet Security", "Detailed secure-configuration guides for specific systems", "Hardening servers, cloud accounts and devices"],
              ["NIST SP 800-53", "NIST (US)", "A large catalogue of security and privacy controls", "Government and regulated environments"],
            ]}
          />
          <p>
            Think of it this way: CSF tells you what outcomes to aim for, ISO 27001 tells you how to
            run a management process around them, and CIS tells you which concrete safeguards to
            switch on first. Frameworks overlap, and organisations usually map one to another
            rather than choosing only one.
          </p>
          <Callout tone="note" title="Framework or law?">
            A framework is voluntary guidance. A regulation is a legal requirement. Some
            regulations point to a framework as the way to comply.
          </Callout>
        </>
      ),
    },
    {
      id: "policy-hierarchy",
      title: "From policy to procedure",
      body: (
        <>
          <p>
            Rules are written in layers, each more specific than the one above.
          </p>
          <Table
            head={["Document", "Answers", "Example"]}
            rows={[
              ["Policy", "What and why, approved by leadership", "All company laptops must be encrypted"],
              ["Standard", "A measurable requirement that supports the policy", "Full-disk encryption using an approved algorithm and key length"],
              ["Procedure", "Step-by-step how", "How IT enables and verifies disk encryption on a new laptop"],
              ["Guideline", "Advice that is recommended but not mandatory", "Tips for choosing a good passphrase"],
            ]}
          />
          <p>
            A policy changes rarely, procedures change often. Keeping them separate means you can
            update a command or screenshot without asking an executive to re-approve the policy.
          </p>
        </>
      ),
    },
    {
      id: "compliance",
      title: "Compliance and audits",
      body: (
        <>
          <p>
            <strong>Compliance</strong> means meeting the requirements of a law, contract or
            standard. Examples you will meet: PCI DSS for organisations that handle payment card
            data, HIPAA for certain US health information, GDPR for personal data of people in the
            European Union, and SOC 2, a report in which an independent auditor describes a
            service provider&apos;s controls.
          </p>
          <p>
            An <strong>audit</strong> is an independent check that controls exist and work.
            Auditors do not hack your systems. They compare what you say you do against evidence.
          </p>
          <ul>
            <li>
              <strong>Internal audits</strong> are run by your own staff to find gaps early.
            </li>
            <li>
              <strong>External audits</strong> are run by a third party whose report customers and
              regulators trust more.
            </li>
            <li>
              <strong>Evidence</strong> is what you hand over: screenshots of settings, exported
              access lists, tickets showing patches, signed policies, training records.
            </li>
          </ul>
          <p>
            A simple coverage figure shows where you stand. If 50 required controls apply and you
            can show evidence for 42, coverage is 42 ÷ 50 = 84%. The 8 missing items become the
            to-do list, ranked by risk.
          </p>
          <Callout tone="warn" title="Compliant is not the same as secure">
            Passing an audit shows you met a defined baseline at a point in time. It does not
            prove that you cannot be breached. Treat compliance as a floor, and keep monitoring,
            patching and training as ongoing work rather than something done once a year.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Red teams attack with permission, blue teams defend, purple teams share findings, white teams referee.",
    "NIST CSF sets outcomes, ISO/IEC 27001 sets a management system, and CIS lists practical safeguards.",
    "Policies say what and why; standards set measurable rules; procedures give steps.",
    "Audits compare claims to evidence, and internal audits help you find gaps before outsiders do.",
    "Compliance is a baseline, not proof of security.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which team plays the attacker in an authorised exercise?",
      options: ["Blue team", "White team", "Purple team", "Red team"],
      answer: 3,
      explain: "The red team simulates attacks, with permission, to test how well defences work.",
    },
    {
      kind: "mcq",
      q: "Which document gives step-by-step instructions for carrying out a task?",
      options: ["Procedure", "Policy", "Framework", "Audit"],
      answer: 0,
      explain: "A procedure describes the exact steps. A policy states what must happen and why.",
    },
    {
      kind: "text",
      q: "NIST CSF version 2.0 is organised into how many functions? Write the number.",
      format: "*",
      accept: ["6", "six"],
      explain: "Govern, Identify, Protect, Detect, Respond and Recover make six.",
    },
    {
      kind: "text",
      q: "An audit finds evidence for 42 of 50 applicable controls. What is the coverage as a percentage?",
      format: "**",
      accept: ["84", "84%", "84 percent"],
      explain: "42 ÷ 50 = 0.84, which is 84%.",
    },
  ],
};
