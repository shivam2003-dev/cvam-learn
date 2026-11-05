import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers, Timeline } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Check your background against the course's prerequisites honestly",
    "Understand how the 17 chapters are organised and why in that order",
    "Choose a study routine that turns reading into skill",
    "Set up a practice environment for the hands-on projects",
  ],
  tasks: [
    {
      id: "who",
      title: "Who this course is for",
      body: (
        <>
          <p>
            This course is for engineers who want to work with customers to deploy real systems,
            especially AI systems. You do not need to be an AI specialist. You do need to be able to
            write and read code and to be curious about the problem behind a request.
          </p>
          <p>It suits several starting points:</p>
          <ul>
            <li>Software engineers moving toward customer-facing, outcome-based work.</li>
            <li>Data and ML engineers who want to ship what they build into real workflows.</li>
            <li>Solutions or sales engineers who want to own production code.</li>
            <li>Consultants with strong technical skills who want to build, not only advise.</li>
            <li>Anyone preparing for a Forward Deployed or Applied AI Engineer interview.</li>
          </ul>
        </>
      ),
    },
    {
      id: "prereqs",
      title: "Prerequisites and a self-check",
      body: (
        <>
          <p>
            Rate yourself against each row below. &ldquo;Comfortable&rdquo; means you could do it
            today with documentation open, without a tutorial.
          </p>
          <Table
            head={["Area", "Comfortable means", "If not yet"]}
            rows={[
              ["Programming", "You can write a 100-line Python or TypeScript program that reads input, calls an API and writes output", "Build a small CLI tool that calls a public API before starting chapter 5"],
              ["HTTP and APIs", "You know GET vs POST, status codes, JSON, and authentication headers", "Read an API quick-start and call two endpoints with curl"],
              ["SQL basics", "You can write a join and a group by", "Work through a short SQL tutorial"],
              ["Git", "You branch, commit, push and open a pull request", "Practise on a throwaway repository"],
              ["Command line", "You can navigate files, read logs, and run scripts", "Learn grep, pipes and ssh basics"],
              ["Cloud basics", "You know what a VM, storage bucket and IAM role are", "Skim one cloud provider's core concepts page"],
              ["LLM basics (helpful)", "You have called a language-model API once", "Do that now; chapter 5 builds from there"],
            ]}
          />
          <Callout tone="note">
            You do not need to be strong in every row. Two or three gaps are normal, and this course
            teaches the FDE-specific parts. If the Programming or HTTP rows are both gaps, spend a
            week on them first. The projects will otherwise be frustrating.
          </Callout>
        </>
      ),
    },
    {
      id: "map",
      title: "How the course is organised",
      body: (
        <>
          <p>
            The chapters follow the order in which an FDE meets problems: first the method for
            working with a customer, then the architecture knowledge for the systems you will build,
            then practice that turns it into interview-ready skill.
          </p>

          <Figure caption="The course in four movements. Each movement builds on the last, and the case studies pull everything together.">
            <Timeline
              phases={[
                { label: "1 · The method", when: "Chapters 1 to 4", tone: "sky", weight: 1, items: ["The FDE role", "Discovery and scoping", "POC sprint", "Pilot, handoff, feedback", "Enterprise constraints"] },
                { label: "2 · The systems", when: "Chapter 5", tone: "lime", weight: 1, items: ["AI system types", "LLM systems", "Harness engineering", "Multi-agent patterns"] },
                { label: "3 · Design and cases", when: "Chapters 6 to 13", tone: "amber", weight: 1.3, items: ["Interview basics", "FDE system design", "Five case studies", "Projects and a cloud lab"] },
                { label: "4 · Getting hired", when: "Chapters 14 to 17", tone: "plain", weight: 1.1, items: ["Company guides", "Take-home masterclass", "Delivering and defending", "Capstones"] },
              ]}
            />
          </Figure>

          <p>
            Even if you are not interviewing, movements 1 and 2 are the ones that make you good at the
            job. Movement 3 gives you worked examples of everything in them, and movement 4 is
            valuable practice at communicating a technical solution to a sceptical audience, which is
            what the role asks of you daily.
          </p>
        </>
      ),
    },
    {
      id: "learn",
      title: "How to learn from this course",
      body: (
        <>
          <p>
            Reading alone produces familiarity, not skill. The material sticks when you do something
            with it. A routine that works well:
          </p>

          <Figure caption="A study loop for each lesson. The exercise and the written recap are where most of the learning happens.">
            <Flow
              numbered
              steps={[
                { title: "Read", note: "Once through at a steady pace", tone: "sky" },
                { title: "Attempt", note: "Do each exercise before opening the answer", tone: "lime" },
                { title: "Compare", note: "Check yours against the model answer", tone: "lime" },
                { title: "Recap", note: "Write three sentences in your own words", tone: "amber" },
                { title: "Apply", note: "Use it on a real situation this week", tone: "amber" },
              ]}
            />
          </Figure>

          <ul>
            <li>
              <strong>Attempt before you peek.</strong> The model answers are hidden for a reason.
              Struggling for two minutes teaches more than reading the answer.
            </li>
            <li>
              <strong>Keep an engagement notebook.</strong> Pick a real or imagined customer problem
              and apply each lesson to it: write the discovery questions, the scope, the risks.
            </li>
            <li>
              <strong>Speak the answers.</strong> For design lessons, explain your solution out loud
              to a friend or to a recording. Clear speech is clear thinking.
            </li>
            <li>
              <strong>Do the projects.</strong> The build projects are where tools and concepts meet
              real error messages.
            </li>
            <li>
              <strong>Review weekly.</strong> Use the quiz after each lesson, then revisit the ones you
              missed a week later.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "setup",
      title: "Set up your practice environment",
      body: (
        <>
          <p>
            The projects use a small, common toolkit. Set it up once now so it does not interrupt you
            later.
          </p>

          <Figure caption="The practice stack, from your machine up to the model providers you will call.">
            <Layers
              layers={[
                { title: "Model access", note: "An API key for at least one LLM provider. Free or low-cost tiers are enough for the projects.", tone: "amber" },
                { title: "Libraries", note: "Python packages for LangChain, an embeddings client and a vector store; AutoGen for the multi-agent project.", tone: "lime" },
                { title: "Language and tooling", note: "Python 3.11 or later, a virtual environment, and a code editor.", tone: "lime" },
                { title: "Cloud account (optional)", note: "A personal account with budget alerts, for the cloud lab only. Never use a company account.", tone: "sky" },
                { title: "Your machine", note: "Terminal, Git, and a place to keep an engagement notebook.", tone: "plain" },
              ]}
            />
          </Figure>

          <pre>
            <code>{`# One-time setup (macOS or Linux)
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install langchain langchain-google-genai chromadb pytest

# Keep keys out of code and out of Git
echo "GOOGLE_API_KEY=your-key-here" > .env
echo ".env" >> .gitignore`}</code>
          </pre>

          <Callout tone="warn" title="Protect your keys and your wallet">
            Never commit an API key, and set a spending limit or budget alert on any provider account
            before running experiments. A loop with a bug can spend real money quickly.
          </Callout>

          <Exercise
            title="Your readiness plan"
            task={
              <p>
                Using the self-check table, list your two weakest rows. For each, write one concrete
                action (not &ldquo;study more&rdquo;) and a date by which you will finish it.
              </p>
            }
          >
            <p>
              A good plan is specific and small. For example: &ldquo;SQL: complete the join and group
              by exercises in a tutorial by Friday, then write three queries against a sample
              database.&rdquo; &ldquo;Cloud basics: read the core concepts page of one provider and
              create then delete a storage bucket by Sunday.&rdquo; Each has an action you can finish,
              a way to know it is done, and a date. &ldquo;Improve my cloud knowledge&rdquo; has none
              of these, so it tends not to happen.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The course suits engineers who write code and want to own customer outcomes, with or without AI experience.",
    "A few gaps in prerequisites are fine; weak programming and HTTP skills are worth fixing first.",
    "The chapters run from method, to systems, to design and cases, to getting hired.",
    "Attempt exercises before reading answers, keep an engagement notebook, and apply each lesson.",
    "Set up your environment now, keep keys out of Git, and cap spending on any provider account.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which gap is most worth fixing before starting the AI systems chapters?",
      options: [
        "Programming and HTTP/API basics",
        "Knowing every cloud provider's product names",
        "Memorising model benchmarks",
        "Being able to design a logo",
      ],
      answer: 0,
      explain: "The projects need you to write code that calls APIs. Weakness there blocks everything else.",
    },
    {
      kind: "mcq",
      q: "What is the purpose of attempting an exercise before viewing the model answer?",
      options: [
        "Effortful recall builds skill; reading an answer produces only familiarity",
        "To make the course take longer",
        "The answers are often wrong",
        "It is required to unlock the quiz",
      ],
      answer: 0,
      explain: "Struggle followed by comparison is far more effective than passive reading.",
    },
    {
      kind: "mcq",
      q: "Where should an API key be stored for a practice project?",
      options: [
        "In a .env file that is ignored by Git",
        "Hard-coded in the source file",
        "In a public README",
        "In the commit message",
      ],
      answer: 0,
      explain: "Keys belong in environment variables or a git-ignored file, never in committed code.",
    },
    {
      kind: "text",
      q: "Which of the four movements covers chapters 6 to 13: the method, the systems, design and cases, or getting hired? Answer with the name's key words.",
      format: "****** *** *****",
      accept: ["design and cases", "design cases", "3 design and cases", "design & cases"],
      explain: "Chapters 6 to 13 cover interview basics, FDE system design and the five case studies.",
    },
  ],
};
