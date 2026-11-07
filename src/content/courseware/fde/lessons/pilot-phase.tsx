import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Explain how a pilot differs from a POC and what it must prove",
    "Define pilot scope, user cohort, success metrics and exit criteria",
    "Harden a POC for real users: security, reliability, monitoring and support",
    "Run a pilot with feedback loops, change control and honest reporting",
    "Make the scale, extend or stop decision with evidence",
  ],
  tasks: [
    {
      id: "what",
      title: "From \"can it work\" to \"does it work for them\"",
      body: (
        <>
          <p>
            The POC showed that the approach is feasible. The <strong>pilot</strong> asks a harder
            question: <em>when real users use it on their real work, over weeks, does it deliver the
            outcome we agreed?</em>
          </p>
          <p>
            This is where many promising projects stall. Real users behave differently from the
            hand-picked testers of a POC. They have bad days, odd cases and no patience for friction.
            Systems that were fine in a demo meet slow networks, expired tokens and data nobody
            cleaned. The pilot is deliberately the first contact with all of that, under controlled
            conditions.
          </p>

          <DiagramReference lesson="pilot-phase" panel={1} />
        </>
      ),
    },
    {
      id: "scope",
      title: "Define the pilot",
      body: (
        <>
          <p>
            A pilot without clear boundaries drifts into an unofficial production launch. Fix five
            things in writing before it starts:
          </p>
          <Table
            head={["Element", "Decide", "Example"]}
            rows={[
              ["Cohort", "Which users, how many, how chosen", "12 agents on one team, including two sceptics"],
              ["Scope", "What the system does and does not do", "Policy search and drafts for tier-2 escalations only"],
              ["Duration", "Start, end and review dates", "Six weeks; midpoint review in week 3"],
              ["Metrics", "Baseline, target, how measured", "Median lookup 35 min to under 5; reopen rate 12% to under 6%"],
              ["Exit criteria", "What triggers scale, extend or stop", "Target met for two consecutive weeks to scale"],
            ]}
          />
          <p>
            Choose the cohort carefully. A pilot of only enthusiasts flatters the result; one of only
            sceptics is a trial by hostility. A mix, with one respected team lead on your side, gives
            the most trustworthy signal. Also fix the <em>comparison</em>: you need a baseline from
            before, or a control group that does not use the system, to know the change is yours.
          </p>

          <Callout tone="note" title="Metrics you can trust">
            Prefer measures that come from system logs and existing tools over surveys alone.
            Self-reported time savings are useful for sentiment but unreliable as proof. Combine
            logged data (handling time, reopen rate) with a short weekly user survey.
          </Callout>
        </>
      ),
    },
    {
      id: "harden",
      title: "Harden before you launch",
      body: (
        <>
          <p>
            Real users need things a POC never had. Budget time at the start of the pilot to add the
            minimum set:
          </p>

          <DiagramReference lesson="pilot-phase" panel={2} />

          <p>Three items are non-negotiable even for a small pilot:</p>
          <ol>
            <li>
              <strong>Authentication and authorisation.</strong> Users see only what they are allowed
              to see. This is the check security reviewers care about most.
            </li>
            <li>
              <strong>A way to say &ldquo;this is wrong&rdquo;.</strong> A one-click feedback button
              on every answer gives you labelled data and shows users you listen.
            </li>
            <li>
              <strong>A rollback.</strong> You must be able to switch the system off, or back to the
              previous version, in minutes.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "run",
      title: "Run the pilot",
      body: (
        <>
          <p>
            A six-week pilot has a rhythm. Plan it so that feedback arrives while there is still time
            to act on it.
          </p>

          <DiagramReference lesson="pilot-phase" panel={3} />

          <p>Habits that make pilots succeed:</p>
          <ul>
            <li>
              <strong>Watch adoption daily.</strong> If usage is dropping, find out why in person.
              Silence is a bad sign, not a good one.
            </li>
            <li>
              <strong>Triage feedback.</strong> Sort into bugs, quality problems, missing features,
              and training gaps, and answer each person who gave feedback, even if the answer is
              &ldquo;not now&rdquo;.
            </li>
            <li>
              <strong>Control change.</strong> Ship fixes on a predictable cadence (for example twice
              a week) with a note of what changed, so users trust the system and metrics stay
              interpretable.
            </li>
            <li>
              <strong>Protect the scope.</strong> New requests go on a visible list for after the
              pilot unless they are required to meet the agreed metric.
            </li>
            <li>
              <strong>Report weekly</strong> with honest status. A pilot dashboard that shows both
              the wins and the problems builds credibility.
            </li>
          </ul>

          <DiagramReference lesson="pilot-phase" panel={4} />
        </>
      ),
    },
    {
      id: "decide",
      title: "The decision: scale, extend or stop",
      body: (
        <>
          <p>
            Pilots end with a decision. Prepare for it from the start by agreeing the exit criteria
            in writing. At the end, the decision should feel like arithmetic, not debate.
          </p>
          <Table
            head={["Outcome", "Evidence", "Action"]}
            rows={[
              ["Scale", "Target metrics met for the agreed period; users adopted without chasing; no blocking risks", "Plan rollout, support model, training and handoff"],
              ["Extend", "Close to target; a clear, fixable cause for the gap; sponsor still supportive", "Extend a few weeks with a specific fix and a new checkpoint"],
              ["Change approach", "Quality is fine but adoption or cost is not; users want something different", "Return to discovery and rescope"],
              ["Stop", "Kill criteria triggered or value is too low to justify cost", "Document learnings, shut down cleanly, thank the team"],
            ]}
          />
          <p>
            Stopping cleanly is a skill. A pilot that ends with a clear &ldquo;no&rdquo; and a short
            write-up of why still produces value: the customer learns what does not work, and trusts
            you for saying so.
          </p>

          <Exercise
            title="Read the pilot"
            task={
              <p>
                Week 5 results: the target is median lookup under 5 minutes. You measure 4.6 minutes.
                Reopen rate is 7% against a 6% target. Usage fell from 11 of 12 users in week 2 to 6
                of 12 in week 5. Survey comments say answers are good but &ldquo;slow to open and
                easy to forget&rdquo;. What do you recommend?
              </p>
            }
          >
            <p>
              The quality outcomes are nearly there, but the usage drop is the real finding: half the
              cohort stopped using it. A system nobody opens cannot scale. Recommend <strong>extend</strong>{" "}
              for two to three weeks with a focus on adoption, not accuracy: embed the assistant
              inside the ticketing tool so it is one click away, fix the slow start (probably
              authentication or loading), and ask the six users who dropped off what happened. Then
              re-measure with the same cohort. Scaling now would multiply a system with an adoption
              problem.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A pilot tests whether real users get the agreed outcome on real work over weeks.",
    "Fix cohort, scope, duration, metrics with a baseline, and exit criteria in writing before starting.",
    "Harden minimally but properly: auth, observability, reliability, feedback and rollback.",
    "Watch adoption daily, triage feedback, control change cadence and report honestly each week.",
    "End with a scale, extend, change-approach or stop decision based on the agreed evidence.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the key question a pilot answers that a POC does not?",
      options: [
        "Whether real users get the agreed outcome on real work over time",
        "Whether the idea is technically possible",
        "Which cloud provider is cheapest",
        "How to market the product",
      ],
      answer: 0,
      explain: "A POC proves feasibility. A pilot proves the outcome with real users in real conditions.",
    },
    {
      kind: "mcq",
      q: "Why capture a baseline before the pilot starts?",
      options: [
        "To show that any improvement is due to the system",
        "To increase the pilot's cost",
        "To avoid involving users",
        "It is not necessary",
      ],
      answer: 0,
      explain: "Without a baseline, you cannot attribute a change to your system.",
    },
    {
      kind: "mcq",
      q: "Usage drops from 11 of 12 users to 6 of 12 midway through a pilot. What is the best response?",
      options: [
        "Investigate with the users who stopped and fix the friction",
        "Ignore it, the accuracy is fine",
        "Add more features",
        "End the pilot and declare success",
      ],
      answer: 0,
      explain: "Adoption drop-off is a leading indicator of failure; understanding it directly is the priority.",
    },
    {
      kind: "mcq",
      q: "Which three items are non-negotiable hardening even for a small pilot?",
      options: [
        "Access control, a feedback mechanism and a rollback",
        "A dark mode, a logo and a custom domain",
        "A mobile app, analytics and a blog",
        "A 24/7 hotline, a wiki and a marketing site",
      ],
      answer: 0,
      explain: "Users must be authenticated and authorised, able to report problems, and you must be able to roll back.",
    },
    {
      kind: "text",
      q: "Name the four outcomes of a pilot decision: scale, extend, change approach, or what?",
      format: "****",
      accept: ["stop", "to stop", "stop it"],
      explain: "If kill criteria are triggered or the value is too low, stop cleanly and document the learning.",
    },
  ],
};
