import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Design ingestion from heterogeneous clinical sources with raw preservation and mapping",
    "Design a conservative patient identity matching service with human review",
    "Design consent, access control, break-glass and audit",
    "Design pseudonymisation and de-identification paths for analytics and research",
    "Plan data quality monitoring, lineage and operations",
  ],
  tasks: [
    {
      id: "ingest",
      title: "Ingestion and mapping",
      body: (
        <>
          <p>
            Sources speak many dialects: HL7 v2 messages from older hospital systems, FHIR APIs from
            newer ones, CSV exports from small clinics. The hub receives all of them in the same
            careful way.
          </p>
          <DiagramReference lesson="health-hub-design" panel={1} />
          <ul>
            <li><strong>Keep raw forever</strong> (within retention rules). Mapping bugs are inevitable, and raw data lets you reprocess.</li>
            <li><strong>Keep source codes alongside mapped codes.</strong> A mapping that loses the original makes errors undetectable.</li>
            <li><strong>Track rejects</strong> in a queue with reasons, and report rates per source. A source whose reject rate jumps usually changed something.</li>
            <li><strong>Make processing idempotent</strong> with message IDs, since feeds are retried and replayed.</li>
            <li><strong>Handle late and corrected data.</strong> Lab results get amended; model records as versioned events, not overwrites.</li>
          </ul>
        </>
      ),
    },
    {
      id: "identity",
      title: "Patient identity matching",
      body: (
        <>
          <DiagramReference lesson="health-hub-design" panel={2} />
          <ul>
            <li><strong>Blocking</strong> avoids comparing every pair: group by features such as date of birth and phonetic surname.</li>
            <li><strong>Scoring</strong> combines weighted agreements: exact national or insurance ID is strong; matching common names is weak. Probabilistic methods or a trained model can learn the weights.</li>
            <li><strong>Thresholds from data.</strong> Tune on a labelled set of true and false pairs; choose the auto-link threshold for a false-merge rate the clinical safety officer accepts.</li>
            <li><strong>Reversibility.</strong> Merges must be undoable (an unmerge operation that restores source links), with every change audited.</li>
            <li><strong>Stewards.</strong> Trained staff review the queue; their decisions become labels to improve the model.</li>
          </ul>
          <Callout tone="warn" title="Twins and families">
            Twins share birth dates and addresses; parents and children share names and addresses.
            Include them in the test set explicitly. They are the classic source of false merges.
          </Callout>
        </>
      ),
    },
    {
      id: "access",
      title: "Consent, access and audit",
      body: (
        <>
          <DiagramReference lesson="health-hub-design" panel={3} />
          <Table
            head={["Control", "Design"]}
            rows={[
              ["Authentication", "SSO with the network's identity provider; strong authentication for clinicians"],
              ["Authorisation", "Role-based plus relationship-based: a clinician sees patients under their care or in their department"],
              ["Consent", "Patient preferences stored as data, applied by the policy engine per purpose (care, research, sharing)"],
              ["Break glass", "Time-limited emergency override with required reason, immediate alert and mandatory later review"],
              ["Audit", "Append-only log of every access and change, protected from tampering; regular proactive reports, such as staff looking up colleagues or neighbours"],
              ["Minimum necessary", "Return only the fields the role needs; mask sensitive categories unless specifically permitted"],
            ]}
          />
        </>
      ),
    },
    {
      id: "derived",
      title: "Analytics and research zones",
      body: (
        <>
          <Table
            head={["Technique", "What it does", "Used for"]}
            rows={[
              ["Pseudonymisation", "Replace direct identifiers with consistent tokens; the key is held separately", "Analytics where records must be linked over time without names"],
              ["De-identification", "Remove or generalise identifiers (dates to years, locations to regions)", "Research datasets"],
              ["Aggregation and small-number suppression", "Report counts and rates; hide cells under a minimum size", "Dashboards"],
              ["Differential privacy or synthetic data", "Add noise or generate artificial data with similar statistics", "Sharing beyond the trust boundary; still needs expert review"],
              ["Trusted research environment", "Researchers analyse inside a locked workspace; only approved outputs leave", "High-risk research data"],
            ]}
          />
          <Callout tone="note" title="De-identification is not absolute">
            Combining a few quasi-identifiers (age, postcode, rare diagnosis) can single out a person.
            Treat de-identification as risk reduction. Use expert assessment, limit what is released,
            control access to the research workspace, and forbid re-identification attempts in the data
            use agreement.
          </Callout>
        </>
      ),
    },
    {
      id: "quality",
      title: "Quality, lineage and operations",
      body: (
        <>
          <ul>
            <li><strong>Quality dashboard per source:</strong> completeness of key fields, reject rates, freshness, duplicate rates, and unit or code anomalies, with alerts.</li>
            <li><strong>Lineage:</strong> every curated value records its source message, mapping version and processing time, so an auditor can trace it.</li>
            <li><strong>Reconciliation:</strong> periodic counts and checksums between sources and the hub; silent gaps are reported.</li>
            <li><strong>Reprocessing:</strong> when a mapping is fixed, replay raw data into a new version and compare before switching.</li>
            <li><strong>Availability:</strong> clinical views are critical, so design for high availability, a documented degraded mode, and downtime procedures for clinicians.</li>
            <li><strong>Change management:</strong> source-system upgrades are announced and tested against the hub before going live.</li>
          </ul>
          <Exercise
            title="Handle a mapping bug"
            task={
              <p>
                You discover that for three weeks a lab result unit was mapped incorrectly for one
                source (mg/dL treated as mmol/L). Describe your response.
              </p>
            }
          >
            <ol>
              <li><strong>Contain:</strong> immediately flag the affected result type from that source as unreliable in the clinical view, or hide it, and notify the clinical safety officer.</li>
              <li><strong>Assess:</strong> use lineage to list all affected records and any downstream decisions, alerts or reports that used them.</li>
              <li><strong>Fix and reprocess:</strong> correct the mapping, replay from raw data into a new version, and compare old and new results before switching.</li>
              <li><strong>Communicate:</strong> inform affected clinical teams and follow the incident process, including any reporting duties.</li>
              <li><strong>Prevent:</strong> add a unit-range validation rule and a regression test with sample messages, and monitor value distributions per source for sudden shifts.</li>
            </ol>
            <p>
              Raw preservation and lineage are what make this recoverable. Without them, the damage
              could not even be scoped.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Store raw data immutably, map to a common model keeping source codes, and track rejects and versions.",
    "Match identities conservatively with blocking, scoring, three decision bands, reviewers and reversible merges.",
    "Check role, care relationship, consent and purpose before returning data; support audited break-glass.",
    "Use pseudonymisation, de-identification, aggregation and trusted research environments for derived zones.",
    "Monitor quality per source, keep lineage, reconcile, and be able to reprocess from raw when mappings change.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why keep the raw data untouched?",
      options: [
        "Mapping bugs can be fixed by reprocessing from the original",
        "It saves storage",
        "Raw data is more accurate",
        "Raw data is never needed",
      ],
      answer: 0,
      explain: "Raw preservation makes corrections and audits possible.",
    },
    {
      kind: "mcq",
      q: "In identity matching, what happens to scores in the middle band?",
      options: [
        "They go to a human steward review queue",
        "They are always merged",
        "They are deleted",
        "They are ignored",
      ],
      answer: 0,
      explain: "Uncertain cases are reviewed by trained staff rather than decided automatically.",
    },
    {
      kind: "mcq",
      q: "Which statement about de-identification is accurate?",
      options: [
        "It reduces risk but combinations of attributes can still identify people",
        "It makes re-identification impossible",
        "It is the same as encryption",
        "It requires no controls",
      ],
      answer: 0,
      explain: "Quasi-identifiers can single out individuals, so controls and expert review remain necessary.",
    },
    {
      kind: "mcq",
      q: "A mapping bug is found. What lets you scope the damage?",
      options: [
        "Lineage showing which records came through the faulty mapping",
        "Guessing",
        "Deleting all data",
        "Ignoring it",
      ],
      answer: 0,
      explain: "Lineage identifies affected records and downstream uses.",
    },
    {
      kind: "text",
      q: "What is the term for replacing direct identifiers with tokens while the key is held separately? (one word)",
      format: "***************",
      accept: ["pseudonymisation", "pseudonymization", "pseudonymisation."],
      explain: "Pseudonymisation allows linkage over time without exposing names.",
    },
  ],
};
