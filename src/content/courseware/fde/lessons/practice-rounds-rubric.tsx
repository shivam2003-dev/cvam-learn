import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Timeline } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 30,
  difficulty: "Hard",
  objectives: [
    "Run timed mock design rounds on six fresh prompts",
    "Score yourself or a partner with a consistent rubric",
    "Diagnose your weakest competencies from the scores",
    "Build a two-week improvement plan from the results",
  ],
  tasks: [
    {
      id: "how",
      title: "How to run a practice round",
      body: (
        <>
          <p>
            You have now seen five worked cases. The skill is not recognising a design when you read
            it; it is producing one cold, aloud, in 45 minutes. This lesson gives you six unseen
            prompts and a rubric. Do at least three before moving on.
          </p>
          <Figure caption="The practice routine. The review step is where most of the learning happens, so do not skip it.">
            <Flow
              numbered
              steps={[
                { title: "Set a 45-minute timer", note: "No notes, one blank page", tone: "sky" },
                { title: "Speak and draw", note: "Record audio or ask a partner to play customer", tone: "lime" },
                { title: "Score with the rubric", note: "Immediately, before you check any answers", tone: "amber" },
                { title: "Compare", note: "Read the model approach notes", tone: "amber" },
                { title: "Fix one habit", note: "Redo the weakest segment for 10 minutes", tone: "rose" },
              ]}
            />
          </Figure>
          <Timeline
            phases={[
              { label: "0 to 9", when: "Clarify", tone: "sky", items: ["Users, data, systems", "Success measure", "Constraints"] },
              { label: "9 to 24", when: "Design", tone: "lime", weight: 1.5, items: ["Components and flows", "Mechanisms labelled"] },
              { label: "24 to 36", when: "Harden", tone: "amber", weight: 1.2, items: ["Failures", "Security", "Deployment"] },
              { label: "36 to 45", when: "Close", tone: "plain", items: ["Trade-offs", "Rollout", "Summary"] },
            ]}
          />
        </>
      ),
    },
    {
      id: "prompts",
      title: "Six practice prompts",
      body: (
        <>
          <Exercise
            title="Prompt 1: Contract review assistant"
            task={<p>A law firm wants an assistant that reviews supplier contracts and flags unusual clauses for lawyers. Documents are PDFs, some scanned; lawyers must be able to see exactly where each flag comes from.</p>}
          >
            <p>
              <strong>Approach notes:</strong> ingestion with OCR and layout; clause-level chunking
              with page references; a checklist of clause types as the spine; model flags with quoted
              evidence verified verbatim in code; lawyers review all flags; evaluation on lawyer-labelled
              contracts; confidentiality and per-matter access; rollout on one contract type.
            </p>
          </Exercise>
          <Exercise
            title="Prompt 2: Warehouse picking integration"
            task={<p>A retailer&apos;s e-commerce platform must send orders to three different warehouse systems with different APIs; one only accepts files twice a day. Orders must not be lost or picked twice.</p>}
          >
            <p>
              <strong>Approach notes:</strong> integration layer with per-warehouse adapters behind a
              common order contract; queue per warehouse; idempotency keys; file adapter producing
              batched files with acknowledgements and reconciliation; state machine; error queue;
              monitoring of age of oldest unacknowledged order.
            </p>
          </Exercise>
          <Exercise
            title="Prompt 3: Insurance claims triage"
            task={<p>An insurer receives 5,000 claims a week by email and forms. It wants AI to classify claims and route them to the right team, and to extract key fields. Some claims indicate possible fraud.</p>}
          >
            <p>
              <strong>Approach notes:</strong> intake normalisation; classifier plus extraction with
              confidence; rules for routing; fraud indicators as signals for a human specialist, never
              as automatic denial; human review for low confidence; fairness slices; audit; shadow
              mode against current routing.
            </p>
          </Exercise>
          <Exercise
            title="Prompt 4: Field technician copilot"
            task={<p>A utility&apos;s technicians work in areas with poor connectivity and want to ask questions about equipment manuals and past repair notes on their tablets.</p>}
          >
            <p>
              <strong>Approach notes:</strong> offline-first design: on-device index of relevant
              manuals synced when connected; small local model or cached retrieval; citations with
              page images; sync of new repair notes back with conflict handling; safety-critical
              content verified and versioned; evaluation on real field questions.
            </p>
          </Exercise>
          <Exercise
            title="Prompt 5: Bank onboarding automation"
            task={<p>A bank wants to speed up business customer onboarding. Customers upload documents; staff verify identity, company details and sanctions screening across several systems. It takes 9 days.</p>}
          >
            <p>
              <strong>Approach notes:</strong> workflow engine with human tasks; document
              classification and extraction with confidence; integration to registries and screening
              services with rate limits and retries; case management view with evidence; audit and
              regulatory retention; segregation of duties; measure cycle time by step.
            </p>
          </Exercise>
          <Exercise
            title="Prompt 6: Internal IT help agent"
            task={<p>A 20,000-person company wants an agent that resolves IT requests (password resets, software access, laptop issues) and files tickets when it cannot.</p>}
          >
            <p>
              <strong>Approach notes:</strong> intents and risk tiering; identity verification for
              resets; scoped tools to the identity provider and ticketing; approval workflows for
              access grants; knowledge retrieval with freshness; abuse and privilege-escalation tests;
              escalation with summaries; rings by department.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "rubric",
      title: "The self-review rubric",
      body: (
        <>
          <p>
            Score each row from 0 to 4. Be harsh; a partner or recording helps. Total out of 40.
          </p>
          <Table
            head={["Competency", "0 to 1: missing or weak", "2: adequate", "3 to 4: strong"]}
            rows={[
              ["Clarifying questions", "Started drawing within a minute", "Asked a few generic questions", "Asked targeted questions on users, data, systems, risk and success; stated assumptions"],
              ["Decomposition", "One big box", "Components listed, no flows", "Clear components, owners of data and a sensible first slice"],
              ["Integration and data movement", "Unspecified arrows", "Mechanisms named", "Mechanisms chosen with trade-offs; idempotency, ordering and contracts mentioned"],
              ["Failure handling", "None", "Retries mentioned", "Specific failure walked: detection, containment, recovery, reconciliation"],
              ["Security and compliance", "Not mentioned", "Auth mentioned", "Identity model, data protection, deployment fit and audit addressed concretely"],
              ["AI judgment (if relevant)", "'Use an LLM'", "Retrieval or agent named", "Right system type, evaluation, guardrails, human oversight and cost"],
              ["Trade-offs and rollout", "Single option", "One trade-off", "Options compared; phased rollout with measures and rollback"],
              ["Communication", "Rambling or silent", "Clear but unstructured", "Signposted, concise, adapted to the interviewer; strong summary"],
              ["Time management", "Ran out of time early", "Some topics rushed", "Covered all areas within time; checked the clock"],
              ["Recovery under change", "Froze or defended", "Adapted slowly", "Named the impact and adapted the design calmly"],
            ]}
          />
          <Table
            head={["Total", "Interpretation", "Next step"]}
            rows={[
              ["0 to 15", "Foundations missing", "Revisit chapters 2 and 7; redo prompt 1 with a script of questions"],
              ["16 to 25", "Solid but patchy", "Target the two lowest rows with focused 10-minute drills"],
              ["26 to 33", "Interview-ready with polish needed", "Practise timing and the closing summary; do mock rounds with a person"],
              ["34 to 40", "Strong", "Maintain with weekly rounds; practise unusual prompts and pushback"],
            ]}
          />
        </>
      ),
    },
    {
      id: "plan",
      title: "Turn scores into a two-week plan",
      body: (
        <>
          <Exercise
            title="Build your plan"
            task={
              <p>
                After three rounds, your average rubric scores are: clarifying 3, decomposition 3,
                integration 2, failure handling 1, security 2, AI judgment 3, trade-offs 2,
                communication 3, time 2, recovery 3. Write a two-week plan that targets the weakest
                areas.
              </p>
            }
          >
            <p>
              <strong>Weakest:</strong> failure handling (1), then integration, security, trade-offs
              and time (2 each).
            </p>
            <ol>
              <li><strong>Days 1 to 3:</strong> reread the failure-handling lesson; for each earlier practice design, write three failure scenarios with detection and recovery. Redo the failure segment of prompt 2 in 8 minutes.</li>
              <li><strong>Days 4 to 6:</strong> security drills: for each prompt, draw trust boundaries and state identity, data protection and deployment in two minutes.</li>
              <li><strong>Days 7 to 9:</strong> integration drill: choose and justify a data movement pattern for five scenarios, naming one alternative and why not.</li>
              <li><strong>Days 10 to 12:</strong> a timed full round with a partner, focusing on pacing and a trade-off statement every ten minutes.</li>
              <li><strong>Days 13 to 14:</strong> re-score; aim for at least 2 to 3 on every row and no zeros.</li>
            </ol>
            <p>
              Notice that the plan is specific, short and tied to rubric rows. Practising your
              strengths feels better but improves you less.
            </p>
          </Exercise>
          <Callout tone="tip" title="Record yourself once">
            Listen to one recording of your own round. Most people discover filler words, long
            silences and unlabelled arrows in minutes. One recording teaches more than three silent
            practice rounds.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Practise cold, timed and aloud; the review step is where the learning happens.",
    "Use a rubric covering questions, decomposition, integration, failure, security, AI, trade-offs, communication, time and recovery.",
    "Turn scores into a short plan that targets the lowest rows with specific drills.",
    "Record yourself at least once and redo the weakest segment rather than only practising strengths.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the most valuable step in a practice round?",
      options: [
        "Scoring and reviewing, then redoing the weakest segment",
        "Reading answers first",
        "Skipping the timer",
        "Practising only strengths",
      ],
      answer: 0,
      explain: "Reflection and targeted repetition drive improvement.",
    },
    {
      kind: "mcq",
      q: "Your lowest rubric score is failure handling. What should your next drill be?",
      options: [
        "Write three failure scenarios per design with detection and recovery",
        "Memorise cloud services",
        "Practise only introductions",
        "Rewrite the rubric",
      ],
      answer: 0,
      explain: "Targeted drills on the weakest competency produce the biggest gain.",
    },
    {
      kind: "mcq",
      q: "For a field technician copilot with poor connectivity, which design idea matters most?",
      options: [
        "Offline-first with an on-device index and sync",
        "A large always-online model",
        "Ignoring connectivity",
        "Email delivery of manuals",
      ],
      answer: 0,
      explain: "Connectivity is the defining constraint, so the design must work offline.",
    },
    {
      kind: "mcq",
      q: "In insurance claims triage, how should fraud indicators be used?",
      options: [
        "As signals for a human specialist, not automatic denial",
        "To automatically deny claims",
        "To hide claims",
        "They should be ignored",
      ],
      answer: 0,
      explain: "High-stakes decisions about people need human review and explainability.",
    },
    {
      kind: "text",
      q: "Ten rubric rows scored 0 to 4 give a maximum total of what?",
      format: "**",
      accept: ["40"],
      explain: "10 x 4 = 40.",
    },
  ],
};
