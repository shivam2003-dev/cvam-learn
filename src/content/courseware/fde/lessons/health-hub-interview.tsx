import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Hard",
  objectives: [
    "Answer interview questions about integrating regulated, high-stakes data",
    "Explain identity matching, consent and audit clearly to non-specialists",
    "Describe incident response and data quality governance",
    "Show judgment in prioritising safety over completeness",
  ],
  tasks: [
    {
      id: "q1",
      title: "Question 1: Overall approach",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;A hospital network wants one data hub across six hospitals and forty clinics. Where do you start?&rdquo;</p>}
          >
            <p>
              <strong>Start with purposes and people, not technology.</strong> &ldquo;Care, analytics
              and research have different rules and error tolerance. I would ask who needs what first;
              clinicians usually need allergies, medications and recent labs across sites.&rdquo;
            </p>
            <ul>
              <li><strong>Architecture:</strong> immutable raw zone, a curated clinical view, and separate pseudonymised and de-identified zones for analytics and research.</li>
              <li><strong>Hard problems first:</strong> identity matching with conservative thresholds, a policy engine for access and consent, and lineage and audit from day one.</li>
              <li><strong>First slice:</strong> two hospitals, three clinical data types, for emergency care, with testable requirements.</li>
            </ul>
            <p>
              <strong>Why this order:</strong> it addresses the highest-severity risks early and
              delivers value to clinicians in weeks, building trust for later expansion.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q2",
      title: "Question 2: Explain patient matching",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;Explain to a hospital executive how you decide two records are the same patient, and what happens when you are wrong.&rdquo;</p>}
          >
            <p>
              &ldquo;We compare details such as name, birth date, address and any shared identifiers,
              weighting stronger evidence more. If the evidence is very strong, we link automatically.
              If it is unclear, a trained person decides. If it is weak, we keep them separate.&rdquo;
            </p>
            <p>
              &ldquo;There are two mistakes. Linking two different people is the serious one, because a
              doctor might see someone else&apos;s allergies, so we set the automatic threshold very
              high and test it on tricky cases like twins and parents with children. Failing to link
              the same person is less risky; we accept more of those and review them over time. Every
              link can be undone and every change is logged.&rdquo;
            </p>
            <p>
              <strong>Notice:</strong> plain language, both error types, how the system favours safety,
              and the control (reversibility and audit) that makes errors recoverable.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q3",
      title: "Questions 3 to 6",
      body: (
        <>
          <Exercise
            title="Question 3: Consent withdrawal"
            task={<p>&ldquo;A patient withdraws consent for research use. What happens in your system?&rdquo;</p>}
          >
            <p>
              Consent is data, stored with the patient record and evaluated by the policy engine per
              purpose. On withdrawal, new research extracts must exclude the patient immediately. For
              existing research datasets, the data use agreement and law determine what must be
              removed; design lets us identify the patient&apos;s records in derived datasets through
              pseudonymous keys held separately, so removal or notification is possible. All of this is
              audited. I would confirm with legal what is required, because rules differ.
            </p>
          </Exercise>
          <Exercise
            title="Question 4: Bad source data"
            task={<p>&ldquo;One clinic sends garbage: missing dates, wrong units, duplicated visits. What do you do?&rdquo;</p>}
          >
            <p>
              Do not silently fix or silently drop. Keep the raw feed, apply validation, route invalid
              records to a reject queue with reasons, and publish a quality score per source. Make the
              clinic&apos;s data owner visible and responsible: weekly reports of reject reasons.
              Mark affected values in the clinical view as lower confidence rather than hiding the
              problem. Fix upstream where possible, and use a contract with expected fields and
              formats so changes are caught.
            </p>
          </Exercise>
          <Exercise
            title="Question 5: Executives want it all quickly"
            task={<p>&ldquo;The board wants all forty clinics connected in three months.&rdquo;</p>}
          >
            <p>
              &ldquo;I understand the urgency. Connecting everything at once multiplies identity and
              quality problems and delays value. I propose two hospitals first for emergency-care
              data, in six to eight weeks, then onboarding waves with a repeatable pattern: a source
              checklist, a mapping template, a quality gate, and a go-live review. Each wave should be
              faster than the last.&rdquo; Anchor on a repeatable onboarding process and early value.
            </p>
          </Exercise>
          <Exercise
            title="Question 6: Incident"
            task={<p>&ldquo;You learn a clinician viewed records of a neighbour, with no care relationship. What do you do?&rdquo;</p>}
          >
            <p>
              Follow the incident process: preserve audit logs, notify the privacy officer, restrict
              the account pending review, and assess scope using the audit trail (what was viewed and
              when). Then examine how the policy allowed it; if there is a care relationship check,
              why did it pass, and if the access was via break-glass, whether the review process
              worked. Add proactive monitoring for this pattern, such as alerts on access to
              neighbours, colleagues and public figures. Report as legally required.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "themes",
      title: "Themes interviewers listen for",
      body: (
        <>
          <Figure caption="What strong answers in regulated-data cases have in common. Each layer reflects a habit of mind, not a technology.">
            <Layers
              layers={[
                { title: "Humility about regulation", note: "You know the rules vary, defer to legal and privacy owners, and design for configurability.", tone: "amber" },
                { title: "Safety before completeness", note: "You will ship less data if it is safer, and explain why.", tone: "amber" },
                { title: "Recoverability", note: "Raw preservation, lineage, reversibility and audit let mistakes be found and fixed.", tone: "lime" },
                { title: "Plain communication", note: "You can explain matching, consent and risk to executives and clinicians without jargon.", tone: "lime" },
                { title: "Incremental delivery", note: "Narrow slices, quality gates and repeatable onboarding rather than a big bang.", tone: "sky" },
              ]}
            />
          </Figure>
          <Table
            head={["Probe", "Strong direction"]}
            rows={[
              ["Why not one big database copy?", "Different purposes need different identification and access; a single store makes least privilege and consent hard"],
              ["FHIR or HL7?", "Both appear: HL7 v2 from older systems, FHIR for newer APIs and for the common model; keep source codes"],
              ["How do you prove data integrity?", "Checksums, immutable raw zone, lineage, reconciliation counts, and reprocessing comparisons"],
              ["Can you use a cloud service?", "Depends on residency, contracts and the regulator; design for customer-controlled keys and region, with an on-premises option"],
              ["How would AI be used later?", "On the curated view with the same access control; evaluation on local data; clinicians stay accountable"],
            ]}
          />
          <Callout tone="tip" title="Say what you would ask the privacy officer">
            Naming two or three questions for legal and privacy owners (retention periods, consent
            model, cross-border rules) shows maturity. It signals that you will work with them, not
            around them.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Start from purposes and the highest-severity risks, with a narrow clinical first slice and testable requirements.",
    "Explain identity matching with plain language, both error types, thresholds, review and reversibility.",
    "Treat consent as data enforced by a policy engine, and defer legal specifics to privacy owners.",
    "Handle bad source data transparently with raw preservation, reject queues, quality scores and contracts.",
    "Respond to incidents with audit evidence, containment, root-cause review and proactive monitoring.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "The board wants all forty clinics in three months. What is a strong response?",
      options: [
        "Propose a narrow first slice and a repeatable onboarding process for later waves",
        "Agree and connect all at once",
        "Refuse",
        "Skip identity matching",
      ],
      answer: 0,
      explain: "Incremental delivery with a repeatable pattern delivers value earlier and manages risk.",
    },
    {
      kind: "mcq",
      q: "A source clinic sends poor-quality data. What should you avoid?",
      options: [
        "Silently dropping or fixing records",
        "Using a reject queue",
        "Reporting quality scores",
        "Keeping the raw feed",
      ],
      answer: 0,
      explain: "Silent handling hides problems; make rejects visible and owned.",
    },
    {
      kind: "mcq",
      q: "How should consent be implemented?",
      options: [
        "As data evaluated by a policy engine per purpose",
        "As a paper form in a drawer",
        "Hard-coded into each report",
        "Ignored after collection",
      ],
      answer: 0,
      explain: "Consent must be enforceable per record and purpose, and auditable.",
    },
    {
      kind: "mcq",
      q: "What helps scope the impact of a suspected inappropriate access?",
      options: [
        "The audit trail of what was viewed and when",
        "Memory",
        "Deleting logs",
        "Asking the user informally only",
      ],
      answer: 0,
      explain: "A tamper-resistant audit trail is the basis for investigation.",
    },
    {
      kind: "text",
      q: "Which standard is commonly used for modern healthcare APIs and a common data model? (four letters)",
      format: "****",
      accept: ["fhir", "hl7 fhir"],
      explain: "FHIR (Fast Healthcare Interoperability Resources) is widely used for APIs and common data models.",
    },
  ],
};
