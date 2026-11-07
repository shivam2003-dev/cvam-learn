import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Easy",
  objectives: [
    "Describe what FDE interviews are designed to measure and why they differ from standard software interviews",
    "Understand the typical stages of the process from screen to offer",
    "Map the competencies interviewers score to evidence you can prepare",
    "Build a preparation plan with milestones",
    "Avoid the common reasons capable candidates are rejected",
  ],
  tasks: [
    {
      id: "measure",
      title: "What the interview is trying to find out",
      body: (
        <>
          <p>
            A standard software interview mainly asks: can this person write correct, efficient code
            under constraints? An FDE interview asks that too, but adds questions that mirror the job:
            can this person understand an ambiguous customer problem, design something that fits a
            messy environment, communicate with non-engineers, and take ownership when things go
            wrong?
          </p>
          <p>
            Interviewers are effectively sampling the work. A design round resembles a discovery and
            architecture meeting. A customer scenario resembles a tense call. A take-home resembles a
            POC sprint. Preparing for the interview and learning the job are therefore largely the
            same activity.
          </p>

          <DiagramReference lesson="how-fde-interviews-work" panel={1} />

          <Callout tone="note" title="Processes differ">
            Companies vary in stages, names and emphasis, and they change over time. Treat this
            chapter as a model of the common shape, and always check the current process on the
            company&apos;s careers page, in recruiter emails and from people who have recently been
            through it.
          </Callout>
        </>
      ),
    },
    {
      id: "stages",
      title: "The typical process",
      body: (
        <>
          <p>
            Most processes combine several of the following stages, over about three to six weeks.
          </p>

          <DiagramReference lesson="how-fde-interviews-work" panel={2} />

          <Table
            head={["Stage", "What they evaluate", "How to prepare"]}
            rows={[
              ["Recruiter screen", "Motivation, communication, basic fit", "A crisp two-minute story: why FDE, why this company, what you have built"],
              ["Technical screen", "Coding fluency on practical problems", "Practise reading data, calling APIs, writing small programs fast and cleanly"],
              ["Take-home", "End-to-end delivery, judgment, documentation", "See the take-home chapters; practise scoping to a fixed time"],
              ["System design", "Integration and AI architecture for a customer", "The design chapters and case studies in this course"],
              ["Customer scenario", "Discovery, empathy, composure, pushing back", "Role-play with a friend; practise asking questions before solving"],
              ["Behavioural", "Ownership, conflict, learning, impact", "Prepare six stories using situation, action and result"],
            ]}
          />
        </>
      ),
    },
    {
      id: "scoring",
      title: "How candidates are scored",
      body: (
        <>
          <p>
            Interviewers usually fill in a structured scorecard. They rate each competency, often on a
            scale from &ldquo;strong no&rdquo; to &ldquo;strong yes&rdquo;, and write evidence. Then
            they meet to compare. Understanding what moves the score helps you aim your effort.
          </p>
          <ul>
            <li>
              <strong>Signal beats polish.</strong> A candidate who asks sharp clarifying questions
              and reasons aloud earns more than one who delivers a memorised, slick answer.
            </li>
            <li>
              <strong>Consistency matters.</strong> One brilliant round does not hide a round where
              you ignored the customer. Many loops require no strong negative signal.
            </li>
            <li>
              <strong>Trade-offs show seniority.</strong> Saying &ldquo;I chose X because of Y, and I
              would revisit if Z&rdquo; scores higher than naming the &ldquo;best&rdquo; option.
            </li>
            <li>
              <strong>Recovery counts.</strong> How you react when an interviewer changes the
              requirement mid-way is part of the test, since customers do exactly that.
            </li>
          </ul>

          <DiagramReference lesson="how-fde-interviews-work" panel={3} />
        </>
      ),
    },
    {
      id: "plan",
      title: "A preparation plan",
      body: (
        <>
          <p>
            A realistic plan for someone with solid engineering experience takes about six to eight
            weeks of part-time effort. Adjust to your starting point.
          </p>
          <Table
            head={["Weeks", "Focus", "Output"]}
            rows={[
              ["1 to 2", "Fundamentals: the FDE method, enterprise constraints, AI systems", "Notes on discovery, POC and pilot; a one-page AI system cheat sheet"],
              ["3 to 4", "Design practice: the CLIENT approach and case studies", "Four timed designs written and spoken aloud"],
              ["5", "Coding on messy data and APIs", "Three small integrations with error handling and tests"],
              ["6", "Take-home practice", "One full take-home in the fixed time, with README and video"],
              ["7", "Behavioural and customer scenarios", "Six stories; two recorded role-plays"],
              ["8", "Company research and mock loops", "Tailored notes per company; two full mock interviews"],
            ]}
          />
          <p>Habits that make the time effective:</p>
          <ul>
            <li>Practise out loud. Reading answers silently does not train speaking clearly under pressure.</li>
            <li>Time yourself. Many rounds are 45 minutes; learn to pace.</li>
            <li>Get feedback from a person, ideally someone who has interviewed for the role.</li>
            <li>Keep a log of mistakes and revisit it weekly.</li>
          </ul>
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Why capable people get rejected",
      body: (
        <>
          <Table
            head={["Mistake", "How it looks", "Fix"]}
            rows={[
              ["Solving before understanding", "Starts drawing boxes in the first minute", "Spend the first five minutes asking about users, data, systems and constraints"],
              ["Ignoring the customer", "Talks only about technology", "Tie every choice to the user's workflow and the customer's constraint"],
              ["Over-engineering", "Microservices and queues for ten users", "Start simple and name the trigger for adding complexity"],
              ["No failure thinking", "Happy path only", "Always walk one failure: what breaks, how detected, how recovered"],
              ["Vague on AI", "'We will use an LLM' with no evaluation", "Say how quality is measured, what guardrails exist, where humans review"],
              ["Defensive under challenge", "Argues or freezes when pushed", "Acknowledge, restate, and adapt: 'Good point; that changes X because Y'"],
              ["Silent thinking", "Long pauses with no narration", "Think aloud so the interviewer can follow and help"],
            ]}
          />

          <Exercise
            title="Self-assessment"
            task={
              <p>
                Rate yourself from 1 to 5 on each of the six competency layers in the first figure.
                Choose your two lowest and write one concrete practice activity for each that you can
                finish this week.
              </p>
            }
          >
            <p>
              Concrete examples: for <em>customer communication</em>, &ldquo;record myself explaining
              a technical trade-off to a non-technical friend and listen for jargon, by Wednesday.&rdquo;
              For <em>systems and integration design</em>, &ldquo;design the order-to-cash sync on
              paper in 40 minutes, then compare with the case study, by Saturday.&rdquo;
            </p>
            <p>
              Notice that each activity has an action, an output and a date. &ldquo;Study more
              design&rdquo; has none of these, which is why it tends not to happen.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "FDE interviews sample the job: ambiguity, design in messy environments, communication and ownership, as well as code.",
    "A typical loop has recruiter and technical screens, sometimes a take-home, then design, customer scenario and behavioural rounds.",
    "Scorecards reward signal over polish, consistency across rounds, explicit trade-offs and graceful recovery.",
    "A six-to-eight-week plan of fundamentals, design practice, coding, a take-home and mock loops works for most people.",
    "Common rejections come from solving before understanding, ignoring the customer, over-engineering and skipping failure cases.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How is an FDE interview different from a standard software interview?",
      options: [
        "It also samples ambiguity, customer communication, integration design and ownership",
        "It has no coding",
        "It only tests knowledge of one tool",
        "It is purely behavioural",
      ],
      answer: 0,
      explain: "The loop mirrors the job, so it adds customer-facing and design skills to the coding base.",
    },
    {
      kind: "mcq",
      q: "What should you do in the first minutes of a design round?",
      options: [
        "Ask clarifying questions about users, data, systems and constraints",
        "Draw the final architecture immediately",
        "List every technology you know",
        "Ask to skip to coding",
      ],
      answer: 0,
      explain: "Understanding the problem before designing is a core signal interviewers look for.",
    },
    {
      kind: "mcq",
      q: "An interviewer changes a requirement halfway through your design. The best response is to:",
      options: [
        "Acknowledge it and adapt the design, explaining what changes and why",
        "Insist the original plan was right",
        "Say you cannot continue",
        "Ignore the change",
      ],
      answer: 0,
      explain: "Customers change requirements, so graceful adaptation is part of what is evaluated.",
    },
    {
      kind: "mcq",
      q: "Which is the best use of preparation time?",
      options: [
        "Practising out loud, timed, with feedback from a person",
        "Silently rereading notes only",
        "Memorising model benchmark tables",
        "Skipping practice and relying on luck",
      ],
      answer: 0,
      explain: "Speaking under time pressure is a skill that only improves with practice and feedback.",
    },
    {
      kind: "text",
      q: "Which competency do interviewers score when they see you state trade-offs and choose with reasons? (one word, the quality they infer)",
      format: "********",
      accept: ["judgment", "judgement", "seniority"],
      explain: "Explicit trade-offs and reasoned choices demonstrate judgment, which signals seniority.",
    },
  ],
};
