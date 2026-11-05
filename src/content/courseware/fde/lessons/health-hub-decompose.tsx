import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Layers, Quadrant } from "@/components/Diagram";
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
          <Figure caption="One platform, three zones with different identification levels. Data flows outward only through controlled, audited transformations.">
            <Graph
              label="Hub architecture zones: source systems, a raw identified zone, a curated identified clinical view, a pseudonymised analytics zone and a de-identified research zone"
              cellW={196}
              cellH={104}
              nodeW={160}
              nodes={[
                { id: "src", label: "Source systems", sub: "EHRs, lab, pharmacy", col: 0, row: 1, tone: "sky", shape: "db" },
                { id: "raw", label: "Raw zone", sub: "Immutable copies, identified", col: 1, row: 1, tone: "rose", shape: "db" },
                { id: "clin", label: "Clinical view", sub: "Matched, curated, identified", col: 2, row: 0, tone: "lime", shape: "db" },
                { id: "ana", label: "Analytics zone", sub: "Pseudonymised", col: 2, row: 1, tone: "amber", shape: "db" },
                { id: "res", label: "Research zone", sub: "De-identified, approved projects", col: 2, row: 2, tone: "sky", shape: "db" },
                { id: "cl", label: "Clinicians", col: 3, row: 0, tone: "lime", shape: "pill" },
                { id: "mg", label: "Managers", col: 3, row: 1, tone: "amber", shape: "pill" },
                { id: "rs", label: "Researchers", col: 3, row: 2, tone: "sky", shape: "pill" },
              ]}
              edges={[
                { from: "src", to: "raw" },
                { from: "raw", to: "clin" },
                { from: "raw", to: "ana" },
                { from: "raw", to: "res" },
                { from: "clin", to: "cl" },
                { from: "ana", to: "mg" },
                { from: "res", to: "rs" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "hard",
      title: "The hard problems",
      body: (
        <>
          <Layers
            layers={[
              { title: "Lineage and audit", note: "For any value, show which source it came from, when, and who accessed it. Regulators ask.", tone: "rose" },
              { title: "Consent and purpose", note: "Patients may opt out of research or sharing. Consent changes over time and must be enforced per record.", tone: "rose" },
              { title: "Data quality", note: "Missing fields, wrong units, free-text diagnoses, duplicated and conflicting entries.", tone: "amber" },
              { title: "Semantics and standards", note: "Each system names things differently. Map to common standards (for example FHIR resources and standard terminologies) and keep source values.", tone: "amber" },
              { title: "Patient identity", note: "Is 'J. Smith, born 1980' in system A the same person as 'John Smith, born 1980' in system B? Wrong merges and missed merges both harm.", tone: "lime" },
              { title: "Integration with legacy", note: "Old interfaces (HL7 v2 messages, file exports, vendor APIs), different schedules and uptimes.", tone: "sky" },
            ]}
          />
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
          <Figure caption="Risk ranking. Wrong merges and privacy breaches are rare but severe; data quality problems are certain and need continuous handling.">
            <Quadrant
              label="Risks plotted by likelihood and severity"
              xLabel="Likelihood"
              yLabel="Severity"
              corners={["Guard rigorously", "Address first", "Accept and monitor", "Reduce systematically"]}
              items={[
                { label: "Wrong patient merge", x: 0.3, y: 0.94, tone: "rose" },
                { label: "Unauthorised access", x: 0.4, y: 0.86, tone: "rose" },
                { label: "Consent not honoured", x: 0.34, y: 0.7, tone: "rose" },
                { label: "Poor data quality", x: 0.9, y: 0.5, tone: "amber" },
                { label: "Source outages", x: 0.72, y: 0.3, tone: "sky" },
                { label: "Terminology mismatch", x: 0.82, y: 0.62, tone: "amber" },
              ]}
            />
          </Figure>
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
