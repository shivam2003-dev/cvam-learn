import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Separate a customer's stated request from the underlying problem",
    "Map stakeholders and decide whom to interview, and in what order",
    "Ask discovery questions about past behaviour that surface real workflow and pain",
    "Map a current workflow and mark the steps worth changing",
    "Write a one-page problem statement the customer can confirm",
  ],
  tasks: [
    {
      id: "why",
      title: "Why discovery decides the project",
      body: (
        <>
          <p>
            Most failed AI and integration projects did not fail because the model was weak or the code
            was buggy. They failed because they solved the wrong problem, or solved the right problem
            for the wrong person. Discovery is the work done before building to avoid that.
          </p>
          <p>
            The tension is that customers rarely describe their problem. They describe a solution they
            have seen elsewhere (&ldquo;we need a chatbot&rdquo;), a symptom (&ldquo;our reports are
            always late&rdquo;) or a mandate from above (&ldquo;the CEO wants AI&rdquo;). Your job is
            to move from that statement to a problem that is specific, measurable and owned.
          </p>

          <DiagramReference lesson="customer-discovery" panel={1} />

          <Callout tone="note" title="Discovery is not a phase you finish">
            You do most of it in the first week, but it continues. Every call, demo and support ticket
            teaches you more about the real problem. Treat your understanding as a hypothesis you keep
            testing.
          </Callout>
        </>
      ),
    },
    {
      id: "stakeholders",
      title: "Map the people before you meet them",
      body: (
        <>
          <p>
            Different people hold different pieces of the truth. If you only talk to the person who
            signed the contract, you will hear the goal but miss the reality. A short stakeholder map
            tells you whom to speak to and what to ask each of them.
          </p>

          <DiagramReference lesson="customer-discovery" panel={2} />

          <Table
            head={["Who", "Ask about", "Typical blind spot"]}
            rows={[
              ["Executive sponsor", "The goal, the budget, the deadline, what success is worth", "Day-to-day reality; may overstate how standard the process is"],
              ["Champion", "How the process really works, who matters, what has been tried", "May be too optimistic or protective of their team"],
              ["End users", "A real recent task, workarounds, what annoys them", "Do not see the bigger picture; may fear replacement"],
              ["IT and security", "Access, environments, review process, hard rules", "May not know the business need behind your request"],
              ["Legal and privacy", "Data categories, retention, regions, contract limits", "Will say no to anything they have not seen before"],
            ]}
          />

          <p>
            Interview in this order when you can: sponsor for the goal, champion for the lay of the
            land, users for the truth, then IT and legal early enough that their lead times do not
            surprise you. Speaking to the sceptic is often the most valuable call of all.
          </p>
        </>
      ),
    },
    {
      id: "questions",
      title: "Ask about the past, not the future",
      body: (
        <>
          <p>
            People are unreliable predictors of their own behaviour. Ask whether they would use a
            feature and they will say yes to be polite. Ask what they did the last time the problem
            occurred and you get facts. This single habit improves discovery more than any technique.
          </p>
          <Table
            head={["Weak question", "Why it fails", "Stronger question"]}
            rows={[
              ["Would an AI assistant help you?", "Invites a polite yes", "Tell me about the last time you couldn't find an answer. What did you do?"],
              ["Is this a big problem?", "Subjective", "How often does it happen, and how long does it take each time?"],
              ["What features do you want?", "Gets a wish list", "What would have to be true in three months for you to call this a success?"],
              ["Do you have the data?", "Gets a polite yes", "Can you show me where it lives and how you would export a sample?"],
              ["Who will use it?", "Gets a job title", "Who touched the last ten of these, and who signs off?"],
            ]}
          />

          <p>Useful follow-ups once someone is talking:</p>
          <ul>
            <li>&ldquo;And then what happened?&rdquo; to walk through a story step by step.</li>
            <li>&ldquo;Why is that step there?&rdquo; to find the rule behind a habit.</li>
            <li>&ldquo;What happens if that goes wrong?&rdquo; to learn the cost of failure.</li>
            <li>&ldquo;Show me.&rdquo; to replace description with observation.</li>
            <li>&ldquo;Who else should I talk to?&rdquo; to find people you did not know existed.</li>
          </ul>

          <Callout tone="tip" title="Shadowing beats interviewing">
            An hour next to a real user shows workarounds and exceptions they have stopped noticing.
            The personal spreadsheet, the sticky note, the step everyone skips: those are your best
            discoveries.
          </Callout>
        </>
      ),
    },
    {
      id: "workflow",
      title: "Map the current workflow",
      body: (
        <>
          <p>
            Draw the process as it is today, not as the manual describes it. Capture the trigger, each
            step, who does it, which system is used, how long it takes, and where it goes wrong. Then
            mark the steps that are slow, error-prone, repetitive or risky.
          </p>

          <DiagramReference lesson="customer-discovery" panel={3} />

          <p>Questions to apply to each step on the map:</p>
          <ul>
            <li>How long does it take, and how variable is that?</li>
            <li>What data goes in, and where does it come from?</li>
            <li>How often does it go wrong, and what does a mistake cost?</li>
            <li>Is it a judgment call, or a rule someone could write down?</li>
            <li>Could a mistake here be seen by a customer, a regulator or the press?</li>
          </ul>

          <p>
            Judgment calls and rules lead to different solutions. A rule-based step is a candidate for
            deterministic code. A fuzzy step involving language and context may be a candidate for a
            model, usually with a human confirming at first.
          </p>
        </>
      ),
    },
    {
      id: "size",
      title: "Size the opportunity",
      body: (
        <>
          <p>
            Before investing weeks, check that the problem is worth solving. A rough calculation is
            enough, and it also gives you a baseline to compare against later.
          </p>
          <pre>
            <code>{`Problem:  policy lookup for escalated tickets
Volume:   40 agents x 6 escalations/day x 230 days  = 55,200 per year
Time now: ~35 minutes searching per escalation (measured by shadowing)
Total:    55,200 x 35 / 60  = 32,200 hours per year
Cost:     32,200 x $35 loaded hourly cost  = about $1.13M per year

If the solution halves the time:  ~$560K per year potential value
Budget range the sponsor mentioned:  $150K to $250K  ->  plausible`}</code>
          </pre>
          <p>
            Treat numbers like these as ranges and write down the assumptions. They set the ceiling on
            what the customer should spend, and they tell you whether the project is worth the
            sponsor&apos;s attention. If a rough sum shows a $20K yearly benefit, a $200K project is a
            hard sell regardless of how clever the technology is.
          </p>

          <DiagramReference lesson="customer-discovery" panel={4} />
        </>
      ),
    },
    {
      id: "statement",
      title: "Write the problem statement",
      body: (
        <>
          <p>
            End discovery with a short document that the customer reads and says &ldquo;yes, that is
            it&rdquo;. If they cannot confirm it, you do not understand the problem yet. One page is
            enough:
          </p>
          <pre>
            <code>{`PROBLEM STATEMENT: Escalation policy lookup

Who:        40 tier-2 support agents; team lead M. Rossi approves exceptions
Problem:    Agents spend ~35 min per escalation finding the right policy across
            three systems; answers are sometimes inconsistent between agents
Evidence:   Shadowing of 6 agents; time study of 30 tickets; 12% of replies
            reopened because of a wrong policy
Baseline:   35 min median lookup; 12% reopen rate
Goal:       Median lookup under 5 min; reopen rate under 6% within 8 weeks
In scope:   Search and answer over 600 policy pages, inside the ticketing tool
Out of scope: Auto-replies to customers; authoring or editing policies
Systems:    Policy PDFs on SharePoint (read only); tickets in Zendesk
Constraints: SSO required; no data leaves the EU; security review (2 weeks)
Risks:      Outdated policies; personal data inside tickets
Open items: Who owns policy updates? (Owner: M. Rossi, by Fri)`}</code>
          </pre>
          <p>
            Send it back within a day of the last interview. Corrections you get now cost minutes; the
            same corrections in week five cost a sprint.
          </p>

          <Exercise
            title="From wish to problem"
            task={
              <p>
                A regional bank&apos;s head of operations says: &ldquo;We want an AI that reads our
                loan applications.&rdquo; Write five discovery questions that move from this request
                to a real problem. Use past behaviour, not hypotheticals.
              </p>
            }
          >
            <ol>
              <li>
                &ldquo;Take me through the last application that came in. What happened to it, step by
                step?&rdquo;
              </li>
              <li>
                &ldquo;Where did the time go on it, and what was the longest wait?&rdquo;
              </li>
              <li>
                &ldquo;What kinds of mistakes have you seen, and what did the worst one cost?&rdquo;
              </li>
              <li>
                &ldquo;Who checks the result before it moves on, and what do they look at?&rdquo;
              </li>
              <li>
                &ldquo;Could I watch an underwriter work through three applications, including a messy
                one?&rdquo;
              </li>
            </ol>
            <p>
              Notice that none of the questions mentions AI. The goal is to learn whether the pain is
              reading, checking, waiting or something else entirely. The right solution may only
              involve AI for one of those steps.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Customers describe solutions and symptoms; discovery finds the underlying problem.",
    "Map stakeholders: sponsor for goals, champion for the lay of the land, users for the truth, IT and legal early.",
    "Ask about the last time it happened. Past behaviour is reliable; hypotheticals are not.",
    "Shadow real users and map the current workflow, marking slow, error-prone, repetitive and risky steps.",
    "Size the opportunity with a rough calculation and written assumptions before committing weeks.",
    "End with a one-page problem statement that the customer confirms in writing.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A customer says, 'We need a chatbot.' What should you do first?",
      options: [
        "Ask about the problem behind the request and a recent time it occurred",
        "Start building a chatbot",
        "Compare chatbot vendors",
        "Decline until they are more specific",
      ],
      answer: 0,
      explain: "A chatbot is a solution. Discovery moves to the underlying problem, its frequency and cost.",
    },
    {
      kind: "mcq",
      q: "Which question gives the most reliable information?",
      options: [
        "Tell me about the last time this happened and what you did.",
        "Would you use an assistant like this?",
        "Do you think this is important?",
        "What features would you like?",
      ],
      answer: 0,
      explain: "Questions about past behaviour reveal facts, while hypotheticals invite polite answers.",
    },
    {
      kind: "mcq",
      q: "Why talk to IT and security during the first week of discovery?",
      options: [
        "Their approval lead times can dominate the schedule",
        "They write the product requirements",
        "They are the end users",
        "It is only a courtesy",
      ],
      answer: 0,
      explain: "Security reviews and access requests take elapsed time, so you need to learn the rules and start them early.",
    },
    {
      kind: "mcq",
      q: "What is the main purpose of the one-page problem statement?",
      options: [
        "To get written confirmation that you understand the problem, goal and scope",
        "To impress executives with detail",
        "To replace the contract",
        "To list every feature",
      ],
      answer: 0,
      explain: "If the customer cannot confirm it, misunderstandings are cheaper to fix now than later.",
    },
    {
      kind: "text",
      q: "A team handles 20,000 tickets a year, each taking 30 minutes to research. How many hours is that per year?",
      format: "*****",
      accept: ["10000", "10,000", "10000 hours", "10,000 hours"],
      explain: "20,000 x 30 minutes = 600,000 minutes, which is 10,000 hours.",
    },
  ],
};
