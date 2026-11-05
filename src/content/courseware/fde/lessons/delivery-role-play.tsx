import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Sequence } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Handle a customer role-play where the interviewer plays a stakeholder and changes the brief",
    "Respond to scope changes with options, trade-offs and a clear recommendation",
    "Stay constructive with a demanding or impatient stakeholder",
    "Confirm decisions and next steps at the end of the conversation",
  ],
  tasks: [
    {
      id: "what",
      title: "What the role-play tests",
      body: (
        <>
          <p>
            In a role-play round, the interviewer becomes your customer after you present your
            take-home. They might say &ldquo;This is great, but we also need it to handle email
            attachments and work in French by next week.&rdquo; They are checking whether you can
            handle the most characteristic moment of the job: a stakeholder who wants more, faster,
            with no change in the date.
          </p>
          <Figure caption="A scope-change conversation done well. The candidate clarifies, offers options with costs, recommends, and confirms.">
            <Sequence
              label="Sequence of a scope change: customer asks for more; candidate clarifies need, presents options with trade-offs, recommends one, and confirms next steps"
              actors={[
                { id: "c", label: "Customer" },
                { id: "you", label: "You" },
              ]}
              messages={[
                { from: "c", to: "you", text: "We also need email attachments and French, by next week.", dashed: true },
                { from: "you", to: "c", text: "Understood. What is driving the deadline, and which matters most for the first release?" },
                { from: "c", to: "you", text: "A French-speaking region pilots Monday; attachments can wait.", dashed: true },
                { from: "you", to: "c", text: "Options: A) French only by Monday; B) both, a week later; C) both Monday with lower accuracy and human review." },
                { from: "you", to: "c", text: "I recommend A: it meets the pilot date with tested quality; attachments follow." },
                { from: "c", to: "you", text: "Agreed.", dashed: true },
                { from: "you", to: "c", text: "I will send a summary today with the decision, scope and dates." },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "method",
      title: "A structure for scope change",
      body: (
        <>
          <Figure caption="Five moves for any scope change. None requires saying no; all require saying what it costs.">
            <Flow
              numbered
              steps={[
                { title: "Listen and restate", note: "Show you understood the request", tone: "sky" },
                { title: "Find the need", note: "What outcome and deadline drive it?", tone: "sky" },
                { title: "Offer options", note: "Two or three, each with cost and risk", tone: "lime" },
                { title: "Recommend", note: "One, with a reason tied to their goal", tone: "amber" },
                { title: "Confirm", note: "Decision, owner, date, in writing", tone: "rose" },
              ]}
            />
          </Figure>
          <Table
            head={["Customer says", "Weak reply", "Strong reply"]}
            rows={[
              ["'Add this by Friday.'", "'Sure!' (then fail) or 'No, impossible.'", "'I can, and it means X moves or the date moves. Which do you prefer?'"],
              ["'Why is it so slow?'", "Defensive explanation", "'Fair concern. Median is 9 seconds; the model call is 7 of that. Options: a smaller model, streaming, or caching. Which matters most?'"],
              ["'My team will not trust AI.'", "'It is accurate.' (with no evidence)", "'That is a real risk. What would they need to see? Typically sources beside every answer and an easy way to correct it.'"],
              ["'Can't you just make it 100% accurate?'", "'Yes' or a lecture", "'Not for open-ended input, but we can set a threshold where uncertain cases go to a person. Here is how many that would be.'"],
              ["'The CEO wants a demo tomorrow.'", "Panic", "'Happy to. Which story should it tell? I will prepare a short, safe demo on sample data and note what is not yet built.'"],
            ]}
          />
        </>
      ),
    },
    {
      id: "tone",
      title: "Tone with a demanding stakeholder",
      body: (
        <>
          <ul>
            <li><strong>Be calm and specific.</strong> Impatience is usually about risk or pressure from above; address that.</li>
            <li><strong>Do not agree to the impossible</strong> to please. An honest, early &ldquo;here is what is feasible&rdquo; protects the relationship.</li>
            <li><strong>Use their words.</strong> If they say &ldquo;the Monday pilot&rdquo;, say it back.</li>
            <li><strong>Separate the person from the request.</strong> You are solving their problem together.</li>
            <li><strong>Never blame</strong> another team or the brief. Describe constraints neutrally.</li>
          </ul>
          <Callout tone="warn" title="The trap of the instant yes">
            Under role-play pressure, candidates often say yes to everything. In reality that leads to
            missed dates and broken trust. Interviewers read an instant yes as inexperience; a
            thoughtful &ldquo;yes, and here is what it affects&rdquo; reads as seniority.
          </Callout>
        </>
      ),
    },
    {
      id: "practice",
      title: "Practise",
      body: (
        <>
          <Exercise
            title="Respond to the customer"
            task={
              <p>
                You built a support-email classifier. The customer says: &ldquo;Great demo. Now we want
                it to also reply automatically, in all our languages, and go live for all 200 agents
                next month. Is that okay?&rdquo; Write the first minute of your reply.
              </p>
            }
          >
            <p>
              &ldquo;Thank you, I am glad it landed well. I want to make sure we get this right. May I
              check a few things? What is the main outcome for next month: fewer misrouted emails, or
              faster replies? And are replies to customers allowed to go out without an agent
              reading them?&rdquo;
            </p>
            <p>
              (After their answers) &ldquo;Here is how I would stage it. Next month: classification
              live for all 200 agents in the two highest-volume languages, where my tests show strong
              accuracy, with drafts suggested but agents sending. Then, over the following weeks: the
              other languages as we validate each one, and automatic replies only for the two
              simplest categories once we have measured error rates. I recommend not sending
              unreviewed replies on day one, because a wrong reply reaches a customer. Does that meet
              next month&apos;s goal? I will send a one-page plan today.&rdquo;
            </p>
            <p>
              Note the moves: clarified the need, staged the scope, tied to evidence, gave a
              recommendation with a reason, and committed to a written follow-up.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Role-play rounds test how you handle a stakeholder who wants more, faster, without moving the date.",
    "Use five moves: listen and restate, find the need, offer options, recommend, confirm in writing.",
    "Never agree to the impossible or say a flat no; say what it affects and offer choices.",
    "Stay calm, use their words, avoid blame, and end with a written decision and next steps.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A customer asks for much more scope by the same date. What is the strongest response?",
      options: [
        "Clarify the driving need and offer options with trade-offs and a recommendation",
        "Say yes to everything",
        "Say no immediately",
        "Ignore the date",
      ],
      answer: 0,
      explain: "Understanding the need and offering choices maintains trust and feasibility.",
    },
    {
      kind: "mcq",
      q: "A stakeholder says their team will not trust AI. What is a good reply?",
      options: [
        "Ask what they would need to see, such as sources and easy correction",
        "Insist the model is accurate",
        "Change the subject",
        "Offer no evidence",
      ],
      answer: 0,
      explain: "Address the concern with concrete mechanisms for trust.",
    },
    {
      kind: "mcq",
      q: "What should end a scope-change conversation?",
      options: [
        "A confirmed decision, owner and date, followed up in writing",
        "An open question",
        "Silence",
        "A new feature",
      ],
      answer: 0,
      explain: "Confirmation prevents later misunderstandings.",
    },
    {
      kind: "text",
      q: "How many options should you typically offer in a scope change? (a number)",
      format: "*",
      accept: ["2", "3", "two", "three", "2 or 3", "2 to 3", "two or three"],
      explain: "Two or three clear options with costs and risks keep decisions manageable.",
    },
  ],
};
