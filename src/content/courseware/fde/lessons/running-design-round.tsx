import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Run a design round with deliberate pacing and a clear whiteboard layout",
    "Think aloud in a way that helps the interviewer follow and help you",
    "Handle interruptions, hints, pushback and changed requirements",
    "Recover when you are stuck or have made a mistake",
    "Close the round with a crisp summary and risks",
  ],
  tasks: [
    {
      id: "pacing",
      title: "Pacing the 45 minutes",
      body: (
        <>
          <p>
            Knowing a framework is not the same as running it under time pressure. The commonest
            failures in a design round are running out of time before covering failure and security,
            or spending twenty minutes on one component the interviewer did not care about.
          </p>

          <DiagramReference lesson="running-design-round" panel={1} />

          <p>Practical rules:</p>
          <ul>
            <li>Say the plan at the start: &ldquo;I will clarify for a few minutes, sketch the design, then cover failures, security and rollout.&rdquo;</li>
            <li>At the 24-minute mark, even if the design feels unfinished, move on to hardening. Breadth beats a perfect partial design.</li>
            <li>Reserve the last five minutes for the summary. Do not let it be squeezed out.</li>
          </ul>
        </>
      ),
    },
    {
      id: "board",
      title: "Use the whiteboard well",
      body: (
        <>
          <p>
            A clear board reduces your cognitive load and helps the interviewer follow. Divide it into
            zones in the first minute.
          </p>
          <pre>
            <code>{`+--------------------------------------------------------------+
| GOAL / METRIC       |  ASSUMPTIONS                           |
| (top left)          |  (top right)                           |
+--------------------------------------------------------------+
|                                                              |
|          MAIN DIAGRAM (centre, largest area)                 |
|   [Customer systems] -> [Integration] -> [Product/AI] -> UI  |
|                                                              |
+--------------------------------------------------------------+
| RISKS / FAILURES    |  SECURITY / DEPLOY   |  ROLLOUT PHASES |
| (bottom left)       |  (bottom middle)     |  (bottom right) |
+--------------------------------------------------------------+`}</code>
          </pre>
          <ul>
            <li>Write the goal and success metric first, in a corner, and point back to it.</li>
            <li>Use consistent shapes: boxes for systems you do not control, a different colour or style for what you add.</li>
            <li>Label every arrow with its mechanism (webhook, REST poll, file drop, queue).</li>
            <li>Mark trust boundaries with a dashed line, so security is visible.</li>
            <li>Number your failure scenarios and refer to them by number.</li>
            <li>In a virtual round, use a simple diagramming tool and keep text short.</li>
          </ul>
        </>
      ),
    },
    {
      id: "aloud",
      title: "Thinking aloud, hints and interruptions",
      body: (
        <>
          <p>
            Interviewers cannot see inside your head. Narration lets them score your reasoning and,
            importantly, lets them help you. Many interviewers give hints; candidates who talk can use
            them, those who stay silent often do not notice them.
          </p>

          <DiagramReference lesson="running-design-round" panel={2} />

          <Table
            head={["Situation", "Strong response", "Weak response"]}
            rows={[
              ["Interviewer challenges a choice", "Acknowledge, restate the constraint, adapt, say what changes", "Defend rigidly or abandon the whole design"],
              ["Interviewer gives a hint", "Use it: 'That suggests X; let me apply it'", "Ignore or bristle"],
              ["Requirement changes", "State the impact, adjust the affected parts only", "Restart from scratch silently"],
              ["You do not know something", "Say so, reason from principles, state an assumption", "Bluff or freeze"],
              ["Time is short", "Say what you would do next if you had time", "Rush into unfinished detail"],
            ]}
          />
        </>
      ),
    },
    {
      id: "stuck",
      title: "When you are stuck",
      body: (
        <>
          <DiagramReference lesson="running-design-round" panel={3} />
          <Callout tone="tip" title="Mistakes are not fatal">
            If you realise you drew something wrong, say &ldquo;I made an error: this arrow should go
            the other way because the ERP is the system of record,&rdquo; fix it, and continue. A
            clean correction is a positive signal.
          </Callout>
        </>
      ),
    },
    {
      id: "close",
      title: "Closing well",
      body: (
        <>
          <p>
            Use the last few minutes to summarise. A good close has four parts: the design in one
            sentence, the main trade-off, the top risk with its mitigation, and the first phase.
          </p>
          <pre>
            <code>{`"To summarise: we sync orders from the CRM to the ERP through a webhook, a durable queue
and an idempotent transformer, with a nightly reconciliation to catch anything missed.
The main trade-off is at-least-once delivery with idempotent writes instead of exactly-once.
The biggest risk is silent divergence, which the reconciler and a dead-letter queue with
alerts address. I would start with a shadow phase for one region to compare against
manual entry, then pilot writes, then scale. What would you like me to go deeper on?"`}</code>
          </pre>

          <Exercise
            title="Practise the close"
            task={
              <p>
                You have designed a policy-question assistant: retrieval over documents with
                citations, SSO, permissions at retrieval, and a human review queue for low-confidence
                answers. Write a 40-second closing summary with design, trade-off, risk and first
                phase.
              </p>
            }
          >
            <p>
              &ldquo;We built a retrieval assistant that answers staff questions from policy
              documents, always showing its sources. Permissions are enforced at retrieval and users
              sign in with SSO. The main trade-off is accuracy against cost: I use a smaller model for
              simple lookups and a larger one only when confidence is low, with a person reviewing the
              hardest cases. The top risk is outdated or conflicting policies producing a wrong
              answer; I mitigate it with last-updated dates, a feedback button, and a weekly review of
              flagged answers. First phase: the HR policy set for 20 pilot users, measured on 100
              labelled questions, before adding other collections.&rdquo;
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Plan the 45 minutes: discover, design, harden, close, and check the clock at each checkpoint.",
    "Divide the whiteboard into zones, label arrows with mechanisms and mark trust boundaries.",
    "Think aloud so the interviewer can follow, give hints and challenge; treat challenges as information.",
    "When stuck, pause, restate, list facts, simplify and ask a focused question; correct mistakes cleanly.",
    "Close with the design in a sentence, the main trade-off, the top risk and the first phase.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "At about the 24-minute mark of a 45-minute round, what should you do?",
      options: [
        "Move on to failure, security and deployment even if the design is not perfect",
        "Keep polishing one component",
        "Stop and wait for feedback",
        "Start the design again",
      ],
      answer: 0,
      explain: "Breadth matters. Hardening topics are usually scored, so leave time for them.",
    },
    {
      kind: "mcq",
      q: "The interviewer says your polling plan breaks the ERP's rate limit. Best response?",
      options: [
        "Acknowledge, state alternatives (webhooks, change-cursor polling) and adapt",
        "Insist the limit is wrong",
        "Remove the ERP",
        "Say nothing",
      ],
      answer: 0,
      explain: "Challenges are information. Acknowledge, adapt and explain what changes.",
    },
    {
      kind: "mcq",
      q: "Why label every arrow in a diagram with its mechanism?",
      options: [
        "It shows how data actually moves and invites discussion of trade-offs",
        "It makes the board look busy",
        "It replaces explanation entirely",
        "It is required by interviewers' software",
      ],
      answer: 0,
      explain: "A labelled arrow communicates the design choice, such as webhook, poll or file drop.",
    },
    {
      kind: "mcq",
      q: "What belongs in a closing summary?",
      options: [
        "Design in a sentence, main trade-off, top risk and first phase",
        "A list of every technology you know",
        "An apology for what you missed",
        "A request to move on",
      ],
      answer: 0,
      explain: "A crisp summary shows you can communicate the whole design and its key risks.",
    },
    {
      kind: "text",
      q: "A dashed line on a diagram usually marks what kind of boundary? (one word)",
      format: "*****",
      accept: ["trust", "trust boundary", "security"],
      explain: "Dashed lines commonly mark trust boundaries, making security discussion visible.",
    },
  ],
};
