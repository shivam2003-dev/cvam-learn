import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Hard",
  objectives: [
    "Answer interview questions on building a customer-facing AI agent safely",
    "Explain security, evaluation and escalation decisions concisely",
    "Handle pressure questions about cost, speed and replacing humans",
    "Show how to measure success beyond containment rate",
  ],
  tasks: [
    {
      id: "q1",
      title: "Question 1: Walk me through it",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;An online retailer gets 40,000 support contacts a month and wants an AI agent. How would you approach it?&rdquo;</p>}
          >
            <p>
              <strong>Start with the traffic:</strong> &ldquo;I would sample real conversations and
              segment by intent, volume and risk. Typically order status and returns are high volume
              and low risk; refunds, complaints and fraud are high risk. I would automate the first
              group, assist on the second, and escalate the rest.&rdquo;
            </p>
            <p>
              <strong>Then the design:</strong> a gateway that authenticates the customer; an agent
              runtime with policy retrieval and a small set of scoped tools whose permissions and
              limits are enforced in code; output guards; an always-available route to a human with a
              summary; audit logging.
            </p>
            <p>
              <strong>Then the plan:</strong> measurable goals (resolution, accuracy, satisfaction,
              safety, cost), an evaluation set including a red team, and a ring-based rollout.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "q2",
      title: "Question 2: Preventing misuse",
      body: (
        <>
          <Exercise
            title="Question"
            task={<p>&ldquo;What stops a customer from tricking the agent into refunding or revealing someone else&apos;s order?&rdquo;</p>}
          >
            <p>
              &ldquo;I do not rely on the model&apos;s judgment for that. The gateway authenticates
              the customer, and every tool takes the customer ID from the session, so even a
              perfectly persuasive message cannot query another account. Refund and voucher limits
              are enforced in the tool, and anything above them is a proposal that a human approves.
              Error messages are identical for missing and foreign orders so attackers cannot probe
              for valid numbers. I add abuse monitoring, such as repeated lookups of other
              accounts, and I include social-engineering and injection scripts in the red-team set,
              run on every release.&rdquo;
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
            title="Question 3: Measuring success"
            task={<p>&ldquo;The vendor demo shows 80% containment. Is that a good metric?&rdquo;</p>}
          >
            <p>
              Containment alone is misleading: a conversation can end because the customer gave up.
              I would measure resolution (did the issue actually get solved, checked by no repeat
              contact within a week), satisfaction compared with human-handled contacts, accuracy of
              answers against policy, escalation quality, safety incidents, and cost per resolved
              contact. I would also look at segments, since high containment on easy intents can hide
              poor performance on important ones.
            </p>
          </Exercise>
          <Exercise
            title="Question 4: Wrong policy answer"
            task={<p>&ldquo;The agent told a customer they could return an item after 90 days. The policy says 30. What now?&rdquo;</p>}
          >
            <Figure caption="Response to a policy error. Fix the customer, then the system, then the process that let it through.">
              <Flow
                numbered
                steps={[
                  { title: "Make it right", note: "Human reviews; honour per business decision", tone: "amber" },
                  { title: "Find the cause", note: "Retrieval miss? Outdated document? Prompt?", tone: "sky" },
                  { title: "Fix", note: "Update source; tighten retrieval; deterministic check", tone: "lime" },
                  { title: "Test", note: "Add the case to the policy test set", tone: "lime" },
                  { title: "Prevent", note: "Move return-window checks into the policy engine", tone: "rose" },
                ]}
              />
            </Figure>
            <p>
              The lasting fix is to stop asking the model to state a rule that code can evaluate:
              the return-eligibility tool computes the window from the order date, and the agent
              reports the result.
            </p>
          </Exercise>
          <Exercise
            title="Question 5: Replacing agents"
            task={<p>&ldquo;The CFO wants to cut half the support team once this goes live.&rdquo;</p>}
          >
            <p>
              I would reframe around measured outcomes: &ldquo;Let us define what the system must
              prove before staffing changes: resolution and satisfaction at least equal to human
              handling on the automated intents, with safety targets met. Then volume handled by the
              agent shows the capacity freed.&rdquo; Humans remain essential for complex and sensitive
              cases, and their role shifts toward those, approvals and improving the knowledge base.
              Staffing decisions belong to the customer; my job is to supply reliable data and a
              design that does not depend on cutting corners.
            </p>
          </Exercise>
          <Exercise
            title="Question 6: Latency and cost"
            task={<p>&ldquo;Responses take 9 seconds and cost is higher than expected. What would you change?&rdquo;</p>}
          >
            <p>
              Measure per step first. Typical improvements: stream the reply so it starts in a second
              or two; route simple intents to a smaller model; cache stable prompt prefixes and policy
              retrievals; shorten context by trimming history and tool results; run independent tool
              calls in parallel; replace model steps with code where the logic is deterministic.
              After each change, run the evaluation set to confirm quality did not drop, and show the
              customer the cost and quality trade-off.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "close",
      title: "Strong answers have a pattern",
      body: (
        <>
          <Table
            head={["Pattern", "Example phrase"]}
            rows={[
              ["Segment before building", "'I would first look at the real traffic by intent and risk.'"],
              ["Code enforces, prompts guide", "'The limit lives in the tool, not the prompt.'"],
              ["Always a path to a human", "'The customer can reach a person at any point, with a summary.'"],
              ["Measure what matters", "'Resolution and satisfaction versus the human baseline, not just containment.'"],
              ["Widen gradually", "'Rings with exit criteria and a rollback at each.'"],
              ["Turn failures into tests", "'Each wrong answer becomes a regression case.'"],
            ]}
          />
          <Callout tone="tip" title="Rehearse the red-team answer">
            Interviewers love security probes on customer-facing agents. Prepare a calm, concrete
            two-minute answer on identity binding, limits in code, injection handling and monitoring.
            It differentiates builders from demo-makers.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Approach customer service agents by segmenting traffic, then designing tools, limits, guards, escalation and rollout.",
    "Prevent misuse with identity binding, code-enforced limits, uniform errors, abuse monitoring and red-team tests.",
    "Use resolution, satisfaction, accuracy, safety and cost per resolved contact, not containment alone.",
    "Fix policy errors by moving deterministic rules into code and adding the case to the test set.",
    "Frame staffing questions around measured outcomes and keep humans for complex and sensitive cases.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why is containment alone a poor success metric?",
      options: [
        "Conversations can end because customers gave up, not because they were helped",
        "It is hard to compute",
        "It measures cost only",
        "It is always 100%",
      ],
      answer: 0,
      explain: "Resolution and satisfaction measure whether the problem was actually solved.",
    },
    {
      kind: "mcq",
      q: "The agent misstates the return window. What is the strongest lasting fix?",
      options: [
        "Compute eligibility in the policy engine and let the agent report the result",
        "Ask the model to try harder",
        "Remove the policy",
        "Disable returns",
      ],
      answer: 0,
      explain: "Deterministic rules should be evaluated by code, not recalled by a model.",
    },
    {
      kind: "mcq",
      q: "Which is a good way to cut perceived latency?",
      options: [
        "Stream the response and route simple intents to a smaller model",
        "Add more steps",
        "Increase prompt length",
        "Disable caching",
      ],
      answer: 0,
      explain: "Streaming improves perceived speed and smaller models reduce time and cost for easy cases.",
    },
    {
      kind: "mcq",
      q: "A CFO wants to cut half the support team immediately after launch. A good reply is to:",
      options: [
        "Define what the system must prove first and tie decisions to measured outcomes",
        "Agree without evidence",
        "Refuse to discuss",
        "Hide metrics",
      ],
      answer: 0,
      explain: "Evidence-based thresholds turn a risky promise into a managed decision.",
    },
    {
      kind: "text",
      q: "What kind of testing uses adversarial conversations such as social engineering and injection? (two words)",
      format: "*** ****",
      accept: ["red team", "red teaming", "red-team"],
      explain: "Red-team testing probes for weaknesses with adversarial scenarios.",
    },
  ],
};
