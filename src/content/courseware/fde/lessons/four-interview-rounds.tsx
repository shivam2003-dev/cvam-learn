import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Describe the four core rounds: coding, system design, customer scenario and behavioural",
    "Apply a specific approach to each round",
    "Handle a customer scenario round by discovering before solving",
    "Structure behavioural stories with situation, action, result and learning",
    "Manage time, nerves and recovery inside any round",
  ],
  tasks: [
    {
      id: "overview",
      title: "Four rounds, four muscles",
      body: (
        <>
          <p>
            Though loops vary, most contain some version of four rounds. Each tests a different
            muscle, and each rewards a different habit.
          </p>
          <Table
            head={["Round", "Looks like", "Tests", "Key habit"]}
            rows={[
              ["Coding", "Build or fix something practical in 45 to 60 minutes", "Fluency, correctness, debugging, tests", "Clarify, start simple, run it, handle errors"],
              ["System design", "Design an integration or AI system for a customer", "Decomposition, architecture, trade-offs", "Ask questions first; trace a failure"],
              ["Customer scenario", "Role-play with an interviewer as a customer", "Discovery, empathy, composure, scoping", "Ask before telling; summarise and confirm"],
              ["Behavioural", "Stories about past work", "Ownership, collaboration, learning", "Specific, honest, outcome-focused stories"],
            ]}
          />
        </>
      ),
    },
    {
      id: "coding",
      title: "Round 1: practical coding",
      body: (
        <>
          <p>
            FDE coding rounds lean practical: parse a messy file, call an API with pagination and
            errors, join two datasets, write a small transformation, or debug a failing script. Pure
            puzzles appear less often, though basic data structures still matter.
          </p>

          <DiagramReference lesson="four-interview-rounds" panel={1} />

          <pre>
            <code>{`# A typical practical task: pull all pages from a flaky API, keep valid records.
import time, requests

def fetch_all(url, token, max_retries=3):
    results, cursor = [], None
    while True:
        params = {"cursor": cursor} if cursor else {}
        for attempt in range(max_retries):
            r = requests.get(url, params=params, timeout=10,
                             headers={"Authorization": f"Bearer {token}"})
            if r.status_code == 429:                      # rate limited
                time.sleep(int(r.headers.get("Retry-After", 2 ** attempt)))
                continue
            if r.status_code >= 500:                      # transient server error
                time.sleep(2 ** attempt)
                continue
            r.raise_for_status()
            break
        else:
            raise RuntimeError("gave up after retries")
        page = r.json()
        results.extend(x for x in page["items"] if x.get("id") and x.get("total") is not None)
        cursor = page.get("next_cursor")
        if not cursor:
            return results`}</code>
          </pre>
          <ul>
            <li>Show that you think about pagination, rate limits, timeouts and bad records without being asked.</li>
            <li>Write a small test or run an example input before declaring done.</li>
            <li>If stuck, say what you have tried; interviewers often nudge candidates who communicate.</li>
          </ul>
        </>
      ),
    },
    {
      id: "design",
      title: "Round 2: system design",
      body: (
        <>
          <p>
            You will be given a customer situation and asked to design a solution. Chapter 7 covers
            this in depth with the CLIENT approach. The essentials for now:
          </p>
          <ul>
            <li>Spend the first five to eight minutes on questions: users, data, systems, volume, constraints, success measure.</li>
            <li>State your assumptions out loud, and ask which to change.</li>
            <li>Draw a simple end-to-end diagram, then go deeper where the risk is.</li>
            <li>Trace one failure path and one security concern without being asked.</li>
            <li>Name two or three trade-offs, choose, and say what would change your choice.</li>
          </ul>
          <Callout tone="tip" title="Narrate the map">
            Say where you are: &ldquo;I will start with data flow, then authentication, then failure
            handling, and finish with rollout.&rdquo; It gives the interviewer a map and prevents the
            session from feeling like a ramble.
          </Callout>
        </>
      ),
    },
    {
      id: "scenario",
      title: "Round 3: the customer scenario",
      body: (
        <>
          <p>
            In this round the interviewer plays a customer, often a slightly impatient one, with a
            vague request. You are being assessed on the first discovery conversation. The most
            common error is to start solving after two sentences.
          </p>

          <DiagramReference lesson="four-interview-rounds" panel={2} />

          <ul>
            <li>
              <strong>Ask about the past,</strong> not the future: the last time, the worst case, how
              long, how often.
            </li>
            <li>
              <strong>Summarise and confirm</strong> before proposing anything.
            </li>
            <li>
              <strong>Stay calm under pushback.</strong> If the &ldquo;customer&rdquo; says &ldquo;just
              build it all&rdquo;, acknowledge the urgency and explain that a small first slice gets
              them value sooner.
            </li>
            <li>
              <strong>End with next steps:</strong> who does what by when.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "behavioural",
      title: "Round 4: behavioural stories",
      body: (
        <>
          <p>
            These ask for examples: &ldquo;Tell me about a time you disagreed with a stakeholder, took
            ownership of a failing project, or had to learn something quickly.&rdquo; Prepare six
            strong stories that can be adapted to many questions.
          </p>
          <Table
            head={["Part", "Contents", "Length"]}
            rows={[
              ["Situation", "Context and stakes, briefly", "15%"],
              ["Task", "Your specific responsibility", "10%"],
              ["Action", "What you did and why; use 'I', not 'we'", "50%"],
              ["Result", "A measurable outcome", "15%"],
              ["Learning", "What you would do differently", "10%"],
            ]}
          />
          <p>Choose stories that cover the themes interviewers probe:</p>
          <ul>
            <li>Owning a project through a serious problem.</li>
            <li>Working with a difficult or sceptical stakeholder.</li>
            <li>Making a decision with incomplete information.</li>
            <li>Disagreeing, then committing, or changing your mind on evidence.</li>
            <li>Learning an unfamiliar domain or technology fast.</li>
            <li>Delivering bad news.</li>
          </ul>
          <Callout tone="warn" title="Be specific and honest">
            Vague stories (&ldquo;we improved the process&rdquo;) and inflated claims are easy to
            probe. Interviewers follow up with &ldquo;what exactly did you do?&rdquo;. Include real
            numbers and at least one thing that went wrong.
          </Callout>

          <Exercise
            title="Draft one story"
            task={
              <p>
                Write the outline of a story answering: &ldquo;Tell me about a time you had to deliver
                bad news to a stakeholder.&rdquo; Use situation, task, action, result and learning, in
                two sentences each at most.
              </p>
            }
          >
            <p>
              <strong>Situation:</strong> A pilot of a document-extraction tool was three weeks from a
              customer launch when testing showed accuracy of 84% against the agreed 95%.{" "}
              <strong>Task:</strong> I owned the pilot and had to tell the sponsor.
            </p>
            <p>
              <strong>Action:</strong> I analysed the errors before the meeting and found two causes
              that explained 70% of failures. I told the sponsor the same day with the data, two
              options (delay two weeks to fix, or launch with human review of low-confidence cases)
              and a recommendation. <strong>Result:</strong> We chose the second; the launch held,
              accuracy reached 96% after the fix, and the sponsor asked me to lead the next rollout.
            </p>
            <p>
              <strong>Learning:</strong> I now set a mid-point accuracy checkpoint in every pilot so bad
              news arrives earlier. Notice the story is specific, uses &ldquo;I&rdquo;, has numbers, and
              shows judgment under pressure.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "composure",
      title: "Time, nerves and recovery",
      body: (
        <>
          <ul>
            <li>
              <strong>Pace deliberately.</strong> In a 45-minute round, roughly: 5 minutes
              clarifying, 5 to 10 planning, 20 to 25 building or designing, 5 to 10 testing and
              discussion.
            </li>
            <li>
              <strong>If you blank,</strong> restate the problem and write down what you know. It buys
              time and often unlocks the next step.
            </li>
            <li>
              <strong>If you make a mistake,</strong> say so and fix it. Calm correction is a
              positive signal.
            </li>
            <li>
              <strong>Ask for feedback</strong> in the last minutes: &ldquo;Is there anything you
              would like me to go deeper on?&rdquo;
            </li>
            <li>
              <strong>Reset between rounds.</strong> A poor round does not decide the loop. Take a
              breath and start the next one fresh.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Four core rounds test coding, system design, customer scenario and behavioural skills.",
    "In coding rounds, clarify, build simply, test and harden with retries, validation and pagination.",
    "In scenario rounds, ask about the past, summarise, confirm, propose a small first slice and agree next steps.",
    "Prepare six specific, honest behavioural stories in situation, task, action, result and learning form.",
    "Pace the round, narrate your thinking, correct mistakes openly and reset between rounds.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In the customer scenario round, what is the most common mistake?",
      options: [
        "Starting to solve before understanding the problem",
        "Asking too many questions about past behaviour",
        "Summarising what the customer said",
        "Proposing a small first step",
      ],
      answer: 0,
      explain: "The round tests discovery. Jumping straight to a solution shows you would do the same with real customers.",
    },
    {
      kind: "mcq",
      q: "Which behavioural answer style is strongest?",
      options: [
        "Specific actions with 'I', measurable results and a learning",
        "General statements about the team",
        "Only describing the situation",
        "Claiming everything went perfectly",
      ],
      answer: 0,
      explain: "Specific, honest stories with personal ownership and outcomes are easy to trust and probe.",
    },
    {
      kind: "mcq",
      q: "You realise midway through coding that you made a mistake. What should you do?",
      options: [
        "Say so, fix it calmly, and continue",
        "Hide it and hope no one notices",
        "Abandon the problem",
        "Blame the question",
      ],
      answer: 0,
      explain: "Open, calm correction shows professionalism and is seen as a positive signal.",
    },
    {
      kind: "mcq",
      q: "A practical coding task calls an API with pagination. What shows strong thinking?",
      options: [
        "Handling rate limits, retries, timeouts and invalid records without being asked",
        "Only handling the first page",
        "Ignoring errors",
        "Hard-coding the response",
      ],
      answer: 0,
      explain: "Real APIs are flaky; anticipating failures demonstrates practical experience.",
    },
    {
      kind: "text",
      q: "In STAR-style stories, which letter-part usually deserves the most time? (one word)",
      format: "******",
      accept: ["action", "the action"],
      explain: "Action, what you specifically did and why, carries the most signal.",
    },
  ],
};
