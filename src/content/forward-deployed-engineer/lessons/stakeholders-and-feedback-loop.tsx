import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Medium",
  objectives: [
    "Map stakeholders by influence and interest and tailor your engagement",
    "Handle conflict, resistance and shifting priorities",
    "Turn field learning into product feedback that gets acted on",
  ],
  tasks: [
    {
      id: "map",
      title: "Know who matters",
      body: (
        <>
          <p>
            A deployment succeeds or fails through people. List the stakeholders in the first week
            and revisit it.
          </p>
          <Table
            head={["Role", "Cares about", "How to engage"]}
            rows={[
              ["Executive sponsor", "Outcomes, budget, reputation", "Short, regular results; escalate risks early"],
              ["Day-to-day owner / champion", "Making the project work", "Weekly working sessions; give them wins to share"],
              ["End users", "Their workload and job security", "Involve in design; listen to complaints; train"],
              ["IT / security / legal", "Risk, compliance, uptime", "Early, prepared, respectful of process"],
              ["Skeptic / blocker", "Often a real concern", "Ask for their worst-case scenario and address it"],
              ["Your own team", "Product direction, capacity", "Honest updates and clear asks"],
            ]}
          />
          <Callout tone="tip">
            Plot influence against interest. High influence and high interest get close
            collaboration; high influence and low interest get brief, regular updates.
          </Callout>
        </>
      ),
    },
    {
      id: "conflict",
      title: "Resistance and shifting priorities",
      body: (
        <>
          <ul>
            <li>
              <strong>Listen for the fear.</strong> "This AI is not reliable" often means "I will be
              blamed if it is wrong". Offer review steps and visible evidence.
            </li>
            <li>
              <strong>Make the champion look good.</strong> Give them numbers and stories to report.
            </li>
            <li>
              <strong>Disagree with facts and options,</strong> not opinions. Bring data and two
              paths.
            </li>
            <li>
              <strong>Confirm decisions in writing</strong> after meetings: what, who, by when.
            </li>
            <li>
              <strong>When priorities shift</strong> (a reorg, a new sponsor), restate the goal and
              evidence and ask what has changed.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "feedback",
      title: "The product feedback loop",
      body: (
        <>
          <p>
            You see how the product behaves in the real world. That is the most valuable input your
            product team gets, but only if it is specific and shaped for them.
          </p>
          <pre>
            <code>{`Title:     Policy search fails on scanned PDFs
Customers: 4 (Acme, Borealis, Cobalt, Delta)
Impact:    ~30% of their documents; manual retyping, ~6 h/week/customer
Workaround: custom OCR step I built (repo link); 2 days per customer
Ask:       Native OCR in the ingestion pipeline
Evidence:  Support tickets #118, #131; recording of user session
Priority:  High: blocks 2 renewals`}</code>
          </pre>
          <ul>
            <li>Aggregate across customers; one request is an anecdote, four is a pattern.</li>
            <li>State the problem and impact before proposing a solution.</li>
            <li>Share your workaround code; it may become the first version of the feature.</li>
            <li>Close the loop: tell customers what shipped because of their input.</li>
            <li>Attend product reviews and bring customer voices, not only your own view.</li>
          </ul>
          <Callout tone="note">
            Not everything should become product. Keep custom what is truly specific to one
            customer, and push generic parts back.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Map sponsors, champions, users, gatekeepers and skeptics; tailor how you engage each.",
    "Treat resistance as information, argue with facts and options, and confirm decisions in writing.",
    "Send product feedback with impact, evidence, customer count and a workaround, then close the loop.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A user says 'this tool is unreliable'. What is the most useful next step?",
      options: [
        "Argue that they are wrong",
        "Ask what specifically failed and what worries them, and offer verification",
        "Ignore them",
        "Remove them from the project",
      ],
      answer: 1,
      explain: "Digging into the concern reveals real issues or fears you can address.",
    },
    {
      kind: "mcq",
      q: "What makes product feedback most likely to be acted on?",
      options: [
        "Vague complaints",
        "Impact, evidence, number of customers and a proposed workaround",
        "A long email with no data",
        "Only your opinion",
      ],
      answer: 1,
      explain: "Specific, quantified, multi-customer evidence is easy for product teams to prioritise.",
    },
    {
      kind: "mcq",
      q: "Why confirm meeting decisions in writing?",
      options: [
        "To create a shared record of what, who and when",
        "To avoid ever meeting",
        "Because chat is mandatory",
        "To hide mistakes",
      ],
      answer: 0,
      explain: "A written record avoids misunderstandings and drift.",
    },
  ],
};
