import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Hard",
  objectives: [
    "Frame a multi-source patient data integration problem and its purposes",
    "Identify the hard problems: identity matching, semantics, consent, quality and lineage",
    "Differentiate use cases (clinical care, analytics, research) and their different rules",
    "Prioritise risks and define a first slice that delivers value safely",
    "Write requirements for integrity, privacy and auditability",
  ],
  tasks: [
    {
      id: "brief",
      title: "The brief",
      body: (
        <>
          <Callout tone="note" title="Customer request">
            &ldquo;We are a regional health network: six hospitals, forty clinics, and several
            acquired practices, each with its own record system, plus a lab system and a pharmacy
            system. Clinicians cannot see a patient&apos;s whole history. Researchers want data for
            studies. Executives want population-level dashboards. We want a single data hub. Privacy
            and regulators are paramount.&rdquo;
          </Callout>
          <p>
            This is a data-platform problem, not an AI problem, although AI features may later sit on
            top. It is worth including in an FDE course because the hardest parts are exactly the
            FDE skills: unifying messy sources, protecting people, and delivering value in stages to
            very different stakeholders.
          </p>
          <Callout tone="warn" title="Scope note">
            Healthcare regulation varies by country and changes. This lesson teaches design thinking.
            The customer&apos;s privacy officer and legal team decide what is permitted.
          </Callout>
        </>
      ),
    },
    {
      id: "uses",
      title: "Three purposes, three rulebooks",
      body: (
        <>
          <p>
            &ldquo;One hub&rdquo; hides the fact that the same data serves purposes with different
            legal bases, users and tolerance for error. Separating them early prevents disasters.
          </p>
          <Table
            head={["Purpose", "Users", "Data needed", "Key rules", "Error tolerance"]}
            rows={[
              ["Clinical care", "Doctors, nurses", "Identified, complete, current", "Treatment relationship; role-based access; break-glass with audit", "Very low: wrong data can harm patients"],
              ["Operations and analytics", "Managers, planners", "Aggregated or pseudonymised", "Minimum necessary; small-number suppression", "Medium"],
              ["Research", "Researchers", "De-identified or consented", "Ethics approval; consent; data use agreements; no re-identification", "Low for validity, but not life-critical"],
            ]}
          />
          <DiagramReference lesson="health-hub-decompose" panel={1} />
        </>
      ),
    },
    {
      id: "hard",
      title: "The hard problems",
      body: (
        <>
          <DiagramReference lesson="health-hub-decompose" panel={2} />
          <p>
            <strong>Identity matching deserves special attention.</strong> Two kinds of error have
            very different consequences:
          </p>
          <ul>
            <li>
              <strong>False match (wrong merge):</strong> two different patients combined into one
              record. A clinician might see someone else&apos;s allergies. This is a patient-safety
              and privacy incident.
            </li>
            <li>
              <strong>False non-match (missed merge):</strong> one person split across several
              records. Their history looks incomplete, which is inconvenient and sometimes unsafe, but
              usually less dangerous.
            </li>
          </ul>
          <p>
            So the matching design should be conservative: automatic merges only at very high
            confidence, a queue for human review in the middle, and no merge below a threshold.
          </p>
        </>
      ),
    },
    {
      id: "risk",
      title: "Prioritise risks and choose the first slice",
      body: (
        <>
          <DiagramReference lesson="health-hub-decompose" panel={3} />
          <p>
            A sensible first slice delivers clinical value quickly with limited scope:
          </p>
          <Table
            head={["Option", "Pros", "Cons"]}
            rows={[
              ["All six hospitals, all data", "Looks complete", "Enormous; every hard problem at once; no early value"],
              ["Two hospitals, medications, allergies, labs for emergency care", "High clinical value; bounded; tests identity, semantics and access control", "Needs agreement from two sites; limited breadth"],
              ["Analytics dashboard first", "Fast, lower privacy risk with aggregation", "Does not solve the clinicians' problem; risks building a different hub than needed"],
            ]}
          />
          <p>
            Recommended: the second option. Clinicians in emergency care most need allergies,
            medications and recent labs across sites, the data is structured, and success is easy to
            state.
          </p>
          <Exercise
            title="Write the requirements"
            task={
              <p>
                Write four testable requirements for the first slice, covering identity, access,
                quality and audit.
              </p>
            }
          >
            <ul>
              <li><strong>Identity:</strong> automatic merge only when match confidence exceeds the agreed threshold; on a labelled test set of 5,000 pairs, false-merge rate below 0.01%, with all uncertain pairs queued for review.</li>
              <li><strong>Access:</strong> clinicians see data only for patients under their care or through an audited break-glass; 100% of access attempts are logged, and unauthorised-access tests all fail as expected.</li>
              <li><strong>Quality:</strong> each displayed medication or allergy shows its source system and last-updated time; records older than a set age are visibly flagged.</li>
              <li><strong>Audit:</strong> for any displayed value, lineage back to the source record is retrievable within one minute for an auditor.</li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A health data hub serves care, analytics and research, each with different identification levels, rules and error tolerance.",
    "Separate zones: raw, clinical, pseudonymised analytics and de-identified research, with controlled movement outward.",
    "Hard problems are identity, semantics, quality, consent, lineage and legacy interfaces.",
    "Be conservative on identity merges: wrong merges are far more dangerous than missed ones.",
    "Start with a narrow, high-value clinical slice and write testable requirements for identity, access, quality and audit.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which identity-matching error is usually more dangerous?",
      options: [
        "False match: merging two different patients",
        "False non-match: splitting one patient",
        "Both are identical",
        "Neither matters",
      ],
      answer: 0,
      explain: "A wrong merge can expose or misattribute clinical data, a safety and privacy incident.",
    },
    {
      kind: "mcq",
      q: "Why separate zones for clinical, analytics and research use?",
      options: [
        "Each purpose has different identification levels, rules and users",
        "To store more data",
        "To avoid audit",
        "To simplify consent away",
      ],
      answer: 0,
      explain: "Different legal bases and risks require different levels of identification and controls.",
    },
    {
      kind: "mcq",
      q: "What is the best first slice for the hub?",
      options: [
        "Two hospitals with allergies, medications and labs for emergency care",
        "All data from all sites at once",
        "Only a marketing dashboard",
        "Research data first",
      ],
      answer: 0,
      explain: "A narrow clinical slice exercises key problems and delivers visible value early.",
    },
    {
      kind: "mcq",
      q: "Why show source system and last-updated time next to each value?",
      options: [
        "Clinicians can judge freshness and trust, and auditors can trace lineage",
        "To fill the screen",
        "To slow queries",
        "It is a legal formatting rule only",
      ],
      answer: 0,
      explain: "Provenance supports safe decisions and regulatory traceability.",
    },
    {
      kind: "text",
      q: "What is the name for emergency access that bypasses normal restrictions but is fully audited? (two words)",
      format: "***** ****",
      accept: ["break glass", "break-glass"],
      explain: "Break-glass access allows urgent access with after-the-fact review.",
    },
  ],
};
