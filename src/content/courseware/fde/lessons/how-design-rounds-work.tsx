import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Medium",
  objectives: [
    "Explain how an FDE design round differs from a generic system design interview",
    "Recognise the typical prompt shapes: integration, AI feature, data platform and migration",
    "Know what interviewers look for and what they ignore",
    "Identify the building blocks you will reuse across prompts",
  ],
  tasks: [
    {
      id: "different",
      title: "Not the same as designing a URL shortener",
      body: (
        <>
          <p>
            Generic system design interviews usually ask you to design a product for millions of
            anonymous users: a feed, a chat service, a short-link service. The challenge is scale,
            and the user and requirements are mostly fixed by the prompt.
          </p>
          <p>
            FDE design rounds flip the emphasis. The scale is often modest, but the{" "}
            <strong>environment is messy and the requirements are incomplete</strong>. You are given
            a customer, a few existing systems, a business goal, and a handful of constraints, some
            stated and some hidden. The test is whether you can design something that works{" "}
            <em>there</em>.
          </p>

          <Table
            head={["", "Generic system design", "FDE system design"]}
            rows={[
              ["Users", "Millions, anonymous", "Dozens to thousands, known roles"],
              ["Main challenge", "Scale and availability", "Integration, data quality, security, adoption"],
              ["Requirements", "Mostly stated", "Incomplete; you must discover them"],
              ["Starting point", "Blank slate", "Existing systems you cannot change"],
              ["Failure that matters", "Outage", "Wrong data, silent errors, blocked approvals"],
              ["Success measure", "Latency, throughput", "Customer outcome and trust"],
              ["Key skill", "Distributed systems", "Discovery, integration design, communication"],
            ]}
          />
        </>
      ),
    },
    {
      id: "prompts",
      title: "Typical prompt shapes",
      body: (
        <>
          <p>
            Prompts vary, but they cluster into a few shapes. Recognising the shape tells you which
            building blocks and questions to reach for.
          </p>

          <DiagramReference lesson="how-design-rounds-work" panel={1} />

          <Table
            head={["Shape", "Example prompt", "What they probe"]}
            rows={[
              ["Integration", "A retailer needs orders in its CRM to appear in its ERP within minutes", "Data movement, idempotency, auth, failure handling, reconciliation"],
              ["AI feature", "A bank wants an assistant that answers policy questions for staff", "Retrieval, evaluation, guardrails, permissions, cost, human review"],
              ["Data platform", "A hospital group needs one patient view from five systems", "Identity matching, contracts, consent, audit, data quality"],
              ["Migration", "A manufacturer wants to retire a batch system without downtime", "Incremental cutover, parallel run, rollback, risk"],
            ]}
          />
        </>
      ),
    },
    {
      id: "look-for",
      title: "What interviewers look for",
      body: (
        <>
          <p>
            Interviewers rarely have one correct design in mind. They use a checklist of behaviours:
          </p>
          <ul>
            <li>
              <strong>Discovery.</strong> You asked about users, volumes, current systems, data
              quality, security and success measures before drawing.
            </li>
            <li>
              <strong>A coherent end-to-end design.</strong> Components and data flow that fit
              together, not a list of technologies.
            </li>
            <li>
              <strong>Fit with the environment.</strong> You respected existing systems and rules
              rather than assuming a clean slate.
            </li>
            <li>
              <strong>Failure and edge cases.</strong> You considered what breaks, how you would know,
              and how to recover.
            </li>
            <li>
              <strong>Security and compliance.</strong> Authentication, data protection and
              deployment constraints.
            </li>
            <li>
              <strong>Trade-offs and sequencing.</strong> You named options, chose, and proposed a
              phased rollout starting with a small slice.
            </li>
            <li>
              <strong>Communication.</strong> You explained clearly, adapted to the audience and
              invited feedback.
            </li>
          </ul>
          <Callout tone="note" title="What they usually do not care about">
            Precise capacity math for huge scale, memorised cloud product names, or fashionable
            technology. A simple design that clearly fits the customer beats an impressive one that
            ignores their constraints.
          </Callout>
        </>
      ),
    },
    {
      id: "blocks",
      title: "The building blocks you will reuse",
      body: (
        <>
          <p>
            A small set of components appears in nearly every FDE design. Know each one well enough to
            place it, explain it and say when to leave it out.
          </p>

          <DiagramReference lesson="how-design-rounds-work" panel={2} />

          <p>
            The rest of this chapter takes the most important of these in turn: how data moves, how
            identity crosses systems, how failures are handled, how contracts keep integrations
            stable, and how security and deployment shape everything.
          </p>

          <Exercise
            title="Classify the prompt"
            task={
              <p>
                Classify each prompt by shape and name the single biggest risk: (a) &ldquo;Build
                something so our field technicians can ask questions about equipment manuals.&rdquo;
                (b) &ldquo;Keep our billing system and our subscription platform in agreement.&rdquo;
                (c) &ldquo;Move our nightly pricing batch job to something real time.&rdquo;
              </p>
            }
          >
            <ol>
              <li>
                <strong>(a) AI feature.</strong> Biggest risk: wrong or ungrounded answers on
                safety-relevant equipment, so retrieval quality, citations and an evaluation set
                matter most.
              </li>
              <li>
                <strong>(b) Integration.</strong> Biggest risk: silent divergence, where the systems
                drift apart without anyone noticing. Idempotency, ordering and reconciliation are the
                core.
              </li>
              <li>
                <strong>(c) Migration.</strong> Biggest risk: breaking pricing during the cutover. A
                parallel run comparing old and new outputs, with a fast rollback, mitigates it.
              </li>
            </ol>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "FDE design rounds emphasise messy environments, incomplete requirements and integration, not extreme scale.",
    "Typical shapes are integration, AI feature, data platform and migration, each with its own main risk.",
    "Interviewers look for discovery, coherent design, environmental fit, failure thinking, security, trade-offs and communication.",
    "A small set of building blocks recurs: experience, orchestration, AI services, integration, data, identity and operations.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How does an FDE design round mainly differ from a generic one?",
      options: [
        "It emphasises messy environments and discovery over extreme scale",
        "It never involves diagrams",
        "It only asks about databases",
        "It is purely behavioural",
      ],
      answer: 0,
      explain: "The challenge is fitting a solution to a specific, imperfect customer environment.",
    },
    {
      kind: "mcq",
      q: "Keeping a billing system and a subscription platform in agreement is mainly which prompt shape?",
      options: ["Integration", "AI feature", "Migration", "Data warehouse"],
      answer: 0,
      explain: "Synchronising two systems is an integration problem, with idempotency and reconciliation at its core.",
    },
    {
      kind: "mcq",
      q: "Which is something interviewers usually do NOT weigh heavily?",
      options: [
        "Memorised cloud product names",
        "Asking clarifying questions",
        "Failure handling",
        "Trade-off reasoning",
      ],
      answer: 0,
      explain: "Fit, reasoning and communication matter far more than recalling product names.",
    },
    {
      kind: "mcq",
      q: "What is the biggest risk when migrating a legacy batch workflow to a new system?",
      options: [
        "Breaking the business process during cutover",
        "Choosing a colour scheme",
        "Writing too many comments",
        "Using too few servers",
      ],
      answer: 0,
      explain: "A parallel run and fast rollback are the standard ways to manage cutover risk.",
    },
    {
      kind: "text",
      q: "Which prompt shape involves unifying records from many source systems into one view? (two words)",
      format: "**** ********",
      accept: ["data platform", "data hub", "data integration"],
      explain: "A data platform (or hub) brings together records from several sources, with identity matching and quality control.",
    },
  ],
};
