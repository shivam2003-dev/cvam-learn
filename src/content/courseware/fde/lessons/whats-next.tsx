import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Easy",
  objectives: [
    "Review the skills the course built and where each shows up in the job",
    "Choose a path for the next three months based on your goal: interviews, a first FDE role or growth in a current role",
    "Build a portfolio and reputation that signal the right skills",
    "Set up habits for continued learning in a fast-moving field",
  ],
  tasks: [
    {
      id: "review",
      title: "What you can now do",
      body: (
        <>
          <p>
            You started by asking what a forward deployed engineer is. You now have a working method
            and the technical depth to apply it. In one view:
          </p>
          <DiagramReference lesson="whats-next" panel={1} />
          <Table
            head={["Skill", "Where you practised it", "Evidence you can show"]}
            rows={[
              ["Customer discovery", "Chapter 2, case decompositions", "A written problem statement and success metrics"],
              ["Architecture and integration", "Chapter 7, cases 8 to 13", "Designs for sync, RAG, agents and data hubs with failure handling"],
              ["AI systems", "Chapter 5, projects", "A RAG project and a multi-agent project with evaluations"],
              ["Enterprise delivery", "Chapters 3 and 4", "A pilot plan, handoff package and communication templates"],
              ["Delivery under constraints", "Chapters 15 and 16, capstones", "Two complete take-home submissions"],
            ]}
          />
        </>
      ),
    },
    {
      id: "paths",
      title: "Choose your next three months",
      body: (
        <>
          <Table
            head={["Your goal", "Focus", "Concrete plan"]}
            rows={[
              ["Interview for FDE roles soon", "Design and take-home fluency", "Weeks 1 to 2: redo two case designs timed. Weeks 3 to 4: one new take-home in 6 hours. Weeks 5 to 6: mock interviews. Apply in parallel"],
              ["Move into an FDE role from another job", "Evidence and bridges", "Build one portfolio project on a real workflow; volunteer for a customer-facing deployment at work; write about it"],
              ["Grow in a current FDE role", "Leverage and depth", "Start a field notes log, ship one reusable component, mentor a newer engineer, deepen one spike (data, security or AI evaluation)"],
              ["Lead or found something", "Productising", "Study packaging of repeated engagements; practise commercial scoping and pricing; build a reference architecture"],
            ]}
          />
          <DiagramReference lesson="whats-next" panel={2} />
        </>
      ),
    },
    {
      id: "portfolio",
      title: "Portfolio and reputation",
      body: (
        <>
          <ul>
            <li><strong>One strong project beats five weak ones.</strong> Pick a real workflow, build it end to end, evaluate it and write it up as you would for a customer.</li>
            <li><strong>Write publicly.</strong> A short post on what you built, how you measured it and what failed shows communication and honesty.</li>
            <li><strong>Contribute.</strong> Small contributions to open-source tools you use (documentation, fixes, examples) show you can read unfamiliar code and communicate.</li>
            <li><strong>Keep a field notes log</strong> of problems you met and how you solved them; it becomes stories for interviews.</li>
            <li><strong>Build relationships.</strong> Talk to people doing the job; ask what they wish they had known.</li>
          </ul>
          <Callout tone="tip" title="Show your reasoning, not only your results">
            In every write-up, include the assumptions, the trade-offs and one thing that did not
            work. That is what separates an engineer who can deploy for customers from one who can
            only demo.
          </Callout>
        </>
      ),
    },
    {
      id: "learn",
      title: "Keep learning in a fast field",
      body: (
        <>
          <p>
            Tools and model capabilities change quickly. What stays valuable is the method: discover,
            scope, build thin slices, measure, hand off and feed back. Protect time to learn the
            changing layer without chasing every release.
          </p>
          <Table
            head={["Habit", "How"]}
            rows={[
              ["Weekly build", "Two hours a week building something small with a new tool or model, with a short note on what you learned"],
              ["Read primary sources", "Provider documentation, engineering blogs and release notes rather than summaries"],
              ["Keep an evaluation set", "A personal set of tasks you can run against each new model or tool to judge it fairly"],
              ["Teach", "Explain one concept a month to a colleague or in writing"],
              ["Review your own work", "Every quarter, reread a past project and list what you would now do differently"],
            ]}
          />
          <Exercise
            title="Your next step"
            task={
              <p>
                Write a three-line plan: your goal for the next three months, the single project or
                activity that moves you most toward it, and the date you will finish its first
                milestone.
              </p>
            }
          >
            <p>
              An example: &ldquo;Goal: get interview-ready for FDE roles by 1 March. Project: build and
              write up the BrightHome-style support assistant with an evaluation set. First milestone:
              working end to end with 40 evaluation questions by the 15th of this month.&rdquo;
            </p>
            <p>
              Notice the plan has a goal, one project and a dated milestone. Vague plans fail. Start
              with the smallest version of the next step, and do it this week.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The course gives you a delivery loop: discover and scope, design and build, prove and pilot, hand off, feed back, communicate.",
    "Choose the next three months by goal: interviews, a first role, growth in a role or productising work.",
    "One strong, well-written project with evaluation and honest trade-offs is worth more than many shallow ones.",
    "Protect the method, and keep learning the changing tools with small weekly builds, primary sources and a personal evaluation set.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What best signals FDE readiness in a portfolio?",
      options: [
        "One end-to-end project with evaluation, assumptions and trade-offs written up",
        "Many tutorial clones",
        "A list of tools",
        "Screenshots only",
      ],
      answer: 0,
      explain: "Depth and honest reasoning show customer-ready judgment.",
    },
    {
      kind: "mcq",
      q: "What stays valuable as tools change?",
      options: [
        "The method: discover, scope, thin slices, measurement, handoff and feedback",
        "A specific library version",
        "Memorised API names",
        "A single framework",
      ],
      answer: 0,
      explain: "Method outlasts tooling.",
    },
    {
      kind: "mcq",
      q: "Which is a good three-month plan?",
      options: [
        "A specific goal, one project and a dated first milestone",
        "Study more",
        "Read everything",
        "Wait for opportunities",
      ],
      answer: 0,
      explain: "Specific, dated plans get done.",
    },
    {
      kind: "text",
      q: "How many hours a week does the lesson suggest for a small 'weekly build'? (a number)",
      format: "*",
      accept: ["2", "two"],
      explain: "Two hours a week of small building keeps skills current.",
    },
  ],
};
