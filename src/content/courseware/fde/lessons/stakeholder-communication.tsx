import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Adapt the same message for executives, operators, security reviewers and engineers",
    "Structure updates, escalations and bad news so decisions get made",
    "Explain technical trade-offs and AI limitations without jargon or false confidence",
    "Run effective customer meetings: agenda, notes and follow-up",
    "Handle disagreement, resistance and changing priorities",
  ],
  tasks: [
    {
      id: "audiences",
      title: "One truth, four audiences",
      body: (
        <>
          <p>
            Technical skill gets you in the door. Communication determines whether your work is
            adopted. The facts of a project do not change, but each audience needs a different slice
            of them, in different words, for a different decision.
          </p>

          <DiagramReference lesson="stakeholder-communication" panel={1} />

          <Table
            head={["Audience", "Cares about", "Lead with", "Avoid"]}
            rows={[
              ["Executive sponsor", "Outcome, money, risk, timing", "The result and the decision you need", "Architecture, model names, acronyms"],
              ["Operator / end user", "Their daily work and job security", "What changes for them, in their words", "Promises of replacing the process"],
              ["Security, privacy, legal", "Data, access, liability", "Data flows, controls, evidence", "Reassurance without proof"],
              ["Engineers", "Correctness, maintainability", "Design, trade-offs, interfaces", "Business spin"],
            ]}
          />
        </>
      ),
    },
    {
      id: "structure",
      title: "Structure messages so decisions get made",
      body: (
        <>
          <p>
            Busy people read the top and skim the rest. A reliable structure puts the conclusion and
            the ask first, then supports them:
          </p>

          <DiagramReference lesson="stakeholder-communication" panel={2} />

          <pre>
            <code>{`Subject: Decision needed by Fri: how to connect to the ERP

Headline: We can meet the 14 Nov launch only if the ERP team can build one import
job by Wed 5 Nov. Otherwise launch moves two weeks.

Ask: Please confirm ERP team capacity this week (owner: M. Okafor).

Why: Security forbids our service from holding ERP credentials, so the write must
go through a job the ERP team owns. Design agreed on Thursday; effort is about 2 days.

Options
  A. ERP team builds the import job (recommended): launch on time, cleanest audit.
  B. We write directly with a vaulted credential: needs a policy exception; likely slower.

Next: I will send the interface spec today; ERP team reviews Monday.`}</code>
          </pre>

          <Callout tone="tip" title="Bad news early, with options">
            Report a risk the moment you can describe its impact and a date, even if you do not have
            the answer. &ldquo;Here is the problem, here is when it bites, here are two ways
            forward&rdquo; is a message sponsors thank you for. A surprise is not.
          </Callout>
        </>
      ),
    },
    {
      id: "translate",
      title: "Explaining technical and AI ideas plainly",
      body: (
        <>
          <p>
            Most stakeholders do not need to know how a model works. They need to know what it can be
            trusted to do, where it fails, and how failures are handled. Translate technical points
            into consequences.
          </p>
          <Table
            head={["Technical statement", "Plain version"]}
            rows={[
              ["The model has 94% accuracy on the test set.", "In testing it got 94 of 100 invoices right. For the other six, the system flags them for a person to check."],
              ["We use retrieval-augmented generation.", "The assistant looks up the relevant policy pages first, then writes its answer from those pages and shows its sources."],
              ["There's a hallucination risk.", "Sometimes it can state something that sounds right but isn't supported. That is why every answer links to its source, and why a person approves anything that goes to a customer."],
              ["Latency is p95 1.8 s.", "Almost always you will get an answer in under two seconds."],
              ["It's non-deterministic.", "Asking twice can give slightly different wording, so we check meaning rather than exact text."],
            ]}
          />
          <p>
            Be honest about limits. Overstating capability is the quickest way to lose trust, and AI
            systems make this temptation stronger because demos look so good. A reliable line:
            &ldquo;Here is what it does well, here is where it is weak, and here is what we do about
            the weak parts.&rdquo;
          </p>
        </>
      ),
    },
    {
      id: "meetings",
      title: "Running customer meetings",
      body: (
        <>
          <p>
            Meetings are where trust is built or lost. The work happens before and after the call.
          </p>

          <DiagramReference lesson="stakeholder-communication" panel={3} />

          <ul>
            <li>
              <strong>Start with the goal</strong> and what decision you need, not with slides.
            </li>
            <li>
              <strong>Invite the right people.</strong> Too many and nothing is decided; too few and
              decisions are reversed later.
            </li>
            <li>
              <strong>Listen more than you speak.</strong> A good session is mostly questions and
              silence while others think.
            </li>
            <li>
              <strong>Capture decisions and owners live,</strong> and read them back before closing.
            </li>
            <li>
              <strong>Send the summary the same day.</strong> It is the record everyone refers to.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "conflict",
      title: "Disagreement, resistance and shifting priorities",
      body: (
        <>
          <p>
            Disagreement is normal and often useful. Resistance often hides a real concern. Map each
            stakeholder before a difficult conversation.
          </p>

          <DiagramReference lesson="stakeholder-communication" panel={4} />

          <ul>
            <li>
              <strong>Find the concern behind the objection.</strong> &ldquo;AI is unreliable&rdquo;
              often means &ldquo;I will be blamed if it&apos;s wrong&rdquo;. Offer review steps and
              visible sources, not arguments.
            </li>
            <li>
              <strong>Disagree with options and evidence.</strong> &ldquo;Here are two ways to meet
              that requirement and what each costs&rdquo; is easier to accept than &ldquo;that
              won&apos;t work&rdquo;.
            </li>
            <li>
              <strong>When priorities shift</strong> (a reorganisation, a new sponsor), restate the
              goal and evidence, then ask what has changed and what they need now.
            </li>
            <li>
              <strong>Protect relationships.</strong> You will work with these people again. Be
              direct without being sharp.
            </li>
          </ul>

          <Exercise
            title="Rewrite the update"
            task={
              <p>
                Rewrite this message for an executive sponsor: &ldquo;We had some issues with the
                embedding pipeline and the vector index had to be rebuilt, which pushed our evals back
                a bit. Might slip a little. Let me know if that&apos;s OK.&rdquo;
              </p>
            }
          >
            <pre>
              <code>{`Status: AMBER

Headline: Quality testing is two days behind; launch date holds if we start
pilot testing on Wednesday instead of Monday.

Why: A data issue meant the search index had to be rebuilt. It is fixed and
verified; no data was lost.

Ask: Please confirm that Wednesday works for the pilot team (owner: J. Lee, by Mon).

If not: launch slips by about one week.`}</code>
            </pre>
            <p>
              The rewrite leads with status and impact, replaces jargon with a plain cause, states a
              specific ask with an owner and a date, and says the consequence if the ask cannot be
              met. It also gives the sponsor something to decide rather than something to worry
              about.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The same facts need different framing for executives, users, security and engineers.",
    "Lead with the headline and the ask, then evidence, options and next steps.",
    "Translate technical results into consequences and be honest about limits.",
    "Run meetings with a goal, the right people, live decisions and a same-day written summary.",
    "Find the concern behind resistance, disagree with options and evidence, and protect relationships.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What should an update to an executive sponsor lead with?",
      options: [
        "The headline status and the decision you need",
        "A detailed architecture description",
        "The names of the libraries used",
        "An apology",
      ],
      answer: 0,
      explain: "Executives scan. Lead with the conclusion and the ask so they can act in a minute.",
    },
    {
      kind: "mcq",
      q: "Which is the best plain-language version of 'the model hallucinates sometimes'?",
      options: [
        "Sometimes it states things that sound right but aren't supported, so answers link to sources and a person approves customer-facing output",
        "It never makes mistakes",
        "It is fully reliable",
        "The data is bad",
      ],
      answer: 0,
      explain: "State the limit, and the control that handles it, without jargon or false confidence.",
    },
    {
      kind: "mcq",
      q: "Why send a written summary after every meeting?",
      options: [
        "It records decisions, owners and dates so everyone shares the same understanding",
        "It replaces the next meeting",
        "It impresses the manager",
        "It is legally required",
      ],
      answer: 0,
      explain: "A written record avoids misunderstanding and drift, and gives people a chance to correct it.",
    },
    {
      kind: "mcq",
      q: "A security lead says, 'AI is too risky.' What is the most productive reply?",
      options: [
        "Ask what specific risk worries them and show the controls that address it",
        "Argue that AI is safe",
        "Escalate immediately",
        "Avoid them",
      ],
      answer: 0,
      explain: "Concerns usually have a specific root. Addressing it with evidence works better than general reassurance.",
    },
    {
      kind: "text",
      q: "In the answer-first structure, what comes right after the headline? (one word)",
      format: "***",
      accept: ["ask", "the ask"],
      explain: "Headline first, then the ask: the decision or action you need from the reader.",
    },
  ],
};
