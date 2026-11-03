import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Ask discovery questions that surface the real problem, not the requested solution",
    "Map a current workflow with the people who do it",
    "Write requirements and success criteria that the customer can sign",
  ],
  tasks: [
    {
      id: "real",
      title: "Find the problem behind the request",
      body: (
        <>
          <p>
            Customers describe solutions: "we need a chatbot". Your job is to find the underlying
            problem: "support agents spend 40 minutes finding the right policy". The same wish can
            hide very different needs.
          </p>
          <Table
            head={["Instead of asking", "Ask"]}
            rows={[
              ["Would you like a dashboard?", "Walk me through the last time you needed this number. What did you do?"],
              ["Do you want AI to do X?", "What happens today when X goes wrong? How often?"],
              ["What features do you want?", "What would make this a success in three months?"],
              ["Is this important?", "What does it cost you, in hours or money, each week?"],
              ["Who will use it?", "Who touches this process, and who decides if it is a success?"],
            ]}
          />
          <Callout tone="tip">
            Ask about past behaviour, not hypothetical futures. People are poor at predicting what
            they will use but reliable about what they did last Tuesday.
          </Callout>
        </>
      ),
    },
    {
      id: "map",
      title: "Map the workflow",
      body: (
        <>
          <ol>
            <li>
              <strong>Shadow a real user</strong> for an hour. Watch the workarounds: spreadsheets,
              copy and paste, sticky notes.
            </li>
            <li>
              <strong>Draw the steps:</strong> trigger, inputs, decisions, systems, outputs, who
              does each.
            </li>
            <li>
              <strong>Mark pain points:</strong> slow, error-prone, repeated, risky.
            </li>
            <li>
              <strong>Collect examples:</strong> real documents and records, including the odd
              ones.
            </li>
            <li>
              <strong>Note constraints:</strong> approvals, security rules, systems that cannot
              change, deadlines.
            </li>
          </ol>
          <Callout tone="note">
            Talk to the end users and the gatekeepers (IT, security, legal), not only the sponsor.
            The sponsor knows the goal; users know the reality; gatekeepers know what is allowed.
          </Callout>
        </>
      ),
    },
    {
      id: "write",
      title: "Write it down",
      body: (
        <>
          <p>
            Turn notes into a short document the customer confirms. A useful structure:
          </p>
          <pre>
            <code>{`Problem:       Support agents take ~40 min to find the right policy per escalated ticket.
Who:           40 tier-2 agents; team lead approves exceptions.
Goal:          Cut median time to find a policy to under 5 min within 8 weeks.
Success:       Median time, agent satisfaction >= 4/5, 90% of answers cite a correct policy.
In scope:      Search + answer over the 600-page policy set, inside the ticketing tool.
Out of scope:  Auto-replies to customers, policy authoring.
Data/systems:  Policy PDFs (SharePoint), tickets (Zendesk). Read-only.
Risks:         Outdated policies, personal data in tickets.
Open questions: Who owns policy updates? Is SSO required?`}</code>
          </pre>
          <ul>
            <li>Write requirements as outcomes, with a measure, not feature lists.</li>
            <li>List what is out of scope; it prevents later arguments.</li>
            <li>Record assumptions and open questions with owners and dates.</li>
            <li>Get written confirmation before you build.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Dig from the requested solution to the underlying problem with questions about past behaviour.",
    "Shadow users and map the workflow; speak to sponsors, users and gatekeepers.",
    "Write a short brief: problem, goal, success measures, scope, out of scope, risks and open questions.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which question is best for uncovering real needs?",
      options: [
        "Would you use a dashboard if we built one?",
        "Tell me about the last time you needed this and what you did.",
        "Do you like AI?",
        "Is everything important?",
      ],
      answer: 1,
      explain: "It asks about real past behaviour rather than a hypothetical opinion.",
    },
    {
      kind: "mcq",
      q: "Why list out-of-scope items in the requirements?",
      options: [
        "To prevent scope creep and misunderstandings later",
        "To make the document longer",
        "To hide the work",
        "It has no purpose",
      ],
      answer: 0,
      explain: "Explicit boundaries give you a basis to say 'later' without conflict.",
    },
    {
      kind: "mcq",
      q: "Whom should you talk to during discovery?",
      options: [
        "Only the executive sponsor",
        "Sponsor, end users and gatekeepers like IT and security",
        "Only competitors",
        "Nobody until launch",
      ],
      answer: 1,
      explain: "Each group knows a different part of the truth: goals, reality and constraints.",
    },
  ],
};
