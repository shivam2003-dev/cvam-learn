import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Quadrant, Sequence } from "@/components/Diagram";
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

          <Figure caption="The same project status, framed for four audiences. The facts are identical; the question each audience is asking is not.">
            <Graph
              label="One project fact at the centre, with four audiences each asking a different question"
              cellW={205}
              cellH={106}
              nodeW={170}
              nodes={[
                { id: "fact", label: "The same project", sub: "Accuracy 94%, 2 risks, launch in 3 weeks", col: 1.5, row: 1, tone: "lime", w: 190 },
                { id: "exec", label: "Executive", sub: "Is it worth it, and what do you need from me?", col: 0, row: 0, tone: "amber" },
                { id: "ops", label: "Operator / user", sub: "Will this make my day easier?", col: 3, row: 0, tone: "sky" },
                { id: "sec", label: "Security / legal", sub: "What can go wrong, and how is it contained?", col: 0, row: 2, tone: "rose" },
                { id: "eng", label: "Engineer", sub: "How does it work, and how do I run it?", col: 3, row: 2, tone: "plain" },
              ]}
              edges={[
                { from: "fact", to: "exec" },
                { from: "fact", to: "ops" },
                { from: "fact", to: "sec" },
                { from: "fact", to: "eng" },
              ]}
            />
          </Figure>

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

          <Figure caption="The answer-first structure. Each part has a job; if the reader stops after the first two, they still have what they need.">
            <Flow
              numbered
              steps={[
                { title: "Headline", note: "The conclusion in one line", tone: "lime" },
                { title: "Ask", note: "The decision or action you need", tone: "lime" },
                { title: "Evidence", note: "Two or three facts that support it", tone: "sky" },
                { title: "Options", note: "Alternatives and their trade-offs", tone: "sky" },
                { title: "Next steps", note: "Who does what by when", tone: "amber" },
              ]}
            />
          </Figure>

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

          <Figure caption="A customer working session from preparation to follow-up. The follow-up note, sent the same day, is the artefact that survives the meeting.">
            <Sequence
              label="Sequence of a customer meeting: send agenda, run meeting, send same-day summary, owners act"
              actors={[
                { id: "fde", label: "You" },
                { id: "cust", label: "Customer team" },
              ]}
              messages={[
                { from: "fde", to: "cust", text: "Send agenda and goal a day ahead" },
                { from: "fde", to: "cust", text: "Run: goal, update, decisions, risks, next steps" },
                { from: "cust", to: "fde", text: "Questions, decisions, objections", dashed: true },
                { from: "fde", to: "cust", text: "Same-day summary: decisions, owners, dates" },
                { note: "If it is not written down, it was not decided.", over: ["fde", "cust"] },
                { from: "cust", to: "fde", text: "Confirm or correct the summary", dashed: true },
              ]}
            />
          </Figure>

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

          <Figure caption="Stakeholder map by influence and support. Spend most effort on the high-influence people who are not yet supportive.">
            <Quadrant
              label="Stakeholders plotted by influence and support"
              xLabel="Support for the project"
              yLabel="Influence"
              corners={["Influential sceptics: win them over", "Champions: equip them", "Low priority: keep informed", "Fans: use as advocates"]}
              items={[
                { label: "Sponsor", x: 0.88, y: 0.88, tone: "lime" },
                { label: "Head of security", x: 0.28, y: 0.8, tone: "rose" },
                { label: "Team lead", x: 0.72, y: 0.55, tone: "lime" },
                { label: "Skeptical analyst", x: 0.2, y: 0.34, tone: "amber" },
                { label: "End users", x: 0.6, y: 0.2, tone: "sky" },
              ]}
            />
          </Figure>

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
