import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Describe what a forward deployed engineer at a frontier AI lab is likely to do, based on public descriptions",
    "Identify the technical themes: model APIs, evaluation, agents, retrieval, latency and cost",
    "Prepare a portfolio project that demonstrates the relevant skills",
    "Practise customer scenarios involving enterprise adoption of language models",
    "Verify the current process from official sources",
  ],
  tasks: [
    {
      id: "context",
      title: "The role in context",
      body: (
        <>
          <Callout tone="warn" title="Verify before you rely on this">
            This guide draws only on publicly described themes of FDE and applied roles at AI labs and
            on general preparation advice. It does not describe any private interview process. Check
            the current job description and official careers pages, and expect details to change.
          </Callout>
          <p>
            At companies that sell access to large language models, FDE-style roles typically help
            large customers move from experiments to production: scoping use cases, building
            prototypes and production integrations, setting up evaluations, and feeding product
            gaps back to research and product teams. Job descriptions commonly mention working with
            enterprise customers, building with model APIs, and being technical enough to debug
            real systems and credible enough to talk to executives.
          </p>
          <p>
            The customer problems are often the ones in this course: retrieval over private
            documents, agents that call tools, structured extraction, classification at scale,
            coding assistants, and evaluations that prove value.
          </p>
        </>
      ),
    },
    {
      id: "themes",
      title: "Technical themes to prepare",
      body: (
        <>
          <Table
            head={["Theme", "What to be able to do", "Where in this course"]}
            rows={[
              ["Model API fluency", "Use messages-style APIs, tool calling, structured output, streaming, batching, and handle errors, rate limits and retries", "Chapter 5, LLM-based systems"],
              ["Prompting and context", "Write robust prompts; manage context; use caching; know failure modes such as drift and injection", "Chapter 5, harness engineering"],
              ["Retrieval", "Design RAG with metadata, hybrid search, evaluation and permissions", "Chapter 8"],
              ["Agents", "Design tool loops, limits, approvals and orchestration", "Chapters 5 and 9"],
              ["Evaluation", "Build datasets and graders; compare models and prompts; present results to customers", "Chapters 3, 8 and 13"],
              ["Cost and latency", "Estimate cost per task, choose models by difficulty, cache, stream", "Chapter 5"],
              ["Safety and governance", "Guardrails, data handling, human oversight, red-teaming", "Chapters 5 and 13"],
              ["Customer skill", "Discovery, scoping, communicating limits and uncertainty honestly", "Chapters 2 to 4"],
            ]}
          />
          <Figure caption="Where to invest your preparation effort. The top right (high impact, achievable in weeks) is where a strong portfolio project and evaluation practice sit.">
            <Quadrant
              label="Preparation activities plotted by effort and interview impact"
              xLabel="Effort"
              yLabel="Impact"
              corners={["Quick wins", "Invest here", "Skip", "Only if time"]}
              items={[
                { label: "Portfolio project with evals", x: 0.55, y: 0.9, tone: "lime" },
                { label: "Practise customer scenarios", x: 0.32, y: 0.82, tone: "lime" },
                { label: "Read model docs deeply", x: 0.28, y: 0.6, tone: "sky" },
                { label: "Design practice", x: 0.5, y: 0.7, tone: "lime" },
                { label: "Memorise benchmarks", x: 0.18, y: 0.18, tone: "rose" },
                { label: "Train a model from scratch", x: 0.92, y: 0.32, tone: "amber" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "project",
      title: "A portfolio project that signals the right skills",
      body: (
        <>
          <p>
            Build one project that you can demo, explain and defend. The best ones show not only that
            something works but how you know.
          </p>
          <Figure caption="A project shape that covers the main themes. The evaluation and write-up are what separate it from a tutorial.">
            <Flow
              numbered
              steps={[
                { title: "Pick a real workflow", note: "e.g. triage support tickets or extract data from contracts", tone: "sky" },
                { title: "Build with a model API", note: "Structured output, retrieval or tools as needed", tone: "lime" },
                { title: "Create an evaluation set", note: "50 to 100 labelled examples; metrics; failure analysis", tone: "lime" },
                { title: "Compare options", note: "Two models or prompts on quality, cost and latency", tone: "amber" },
                { title: "Add guardrails", note: "Validation, abstention, a red-team set", tone: "amber" },
                { title: "Write it up", note: "README, trade-offs, limits, and a short demo video", tone: "rose" },
              ]}
            />
          </Figure>
          <Exercise
            title="Customer scenario drill"
            task={
              <p>
                A large insurer ran a successful pilot of a claims-summarisation assistant with 10
                users and now wants to roll out to 3,000 adjusters. What do you ask, and what do you
                worry about?
              </p>
            }
          >
            <p>
              <strong>Questions:</strong> what did the pilot measure and how (time saved, accuracy,
              satisfaction); what kinds of claims were included and what is different at scale; how
              will adjusters use it in their workflow; who reviews outputs and how errors are caught;
              what are the data, privacy and audit requirements; expected volume and latency; budget.
            </p>
            <p>
              <strong>Concerns:</strong> the pilot users were likely enthusiasts and the claim mix may
              not represent the whole; quality on rarer claim types; cost at 3,000 users; permission
              and data handling at scale; monitoring and a feedback path; change management and
              training; a rollback plan. <strong>Proposal:</strong> staged rollout in rings, an
              evaluation set that reflects the full claim mix, cost estimates per claim with model
              routing, and weekly sampled reviews.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "ask",
      title: "Questions to ask and traps to avoid",
      body: (
        <>
          <Table
            head={["Ask", "Why"]}
            rows={[
              ["How does the team prioritise between customer-specific work and product gaps?", "Shows you understand the feedback loop"],
              ["What does a successful first six months look like?", "Defines expectations"],
              ["How do you evaluate model changes for customers?", "Signals evaluation mindset"],
              ["What are the hardest recurring problems customers hit?", "Learn the real work"],
            ]}
          />
          <Table
            head={["Trap", "Better"]}
            rows={[
              ["Name-dropping model internals you cannot explain", "Speak about what you have built and measured"],
              ["Overclaiming what models can do", "Be precise about failure modes and how you handle them"],
              ["Ignoring cost and latency", "Estimate per-task cost and time budgets"],
              ["Treating customers as users of a demo", "Talk about adoption, change management and measurement"],
            ]}
          />
        </>
      ),
    },
  ],
  takeaways: [
    "FDE-style roles at AI labs focus on moving enterprise customers from experiments to production with model APIs, evaluation and feedback to product.",
    "Prepare model API fluency, prompting and context, retrieval, agents, evaluation, cost and latency, and safety.",
    "A portfolio project with an evaluation set, option comparison, guardrails and a write-up signals the right skills.",
    "Practise customer scenarios about scaling pilots, and always verify the current process from official sources.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which portfolio element most distinguishes a strong project from a tutorial clone?",
      options: [
        "An evaluation set, option comparison and a write-up of trade-offs",
        "A longer README with screenshots only",
        "Using the newest model",
        "A fancy logo",
      ],
      answer: 0,
      explain: "Showing how you know it works is the strongest signal.",
    },
    {
      kind: "mcq",
      q: "A pilot with 10 users succeeded. What is the main risk when scaling to 3,000?",
      options: [
        "The pilot may not represent the full range of cases, costs and users",
        "Pilots never succeed",
        "Scaling needs no testing",
        "Users will not notice differences",
      ],
      answer: 0,
      explain: "Enthusiast pilots and narrow case mixes can hide problems that appear at scale.",
    },
    {
      kind: "mcq",
      q: "What should you do when asked about model internals you cannot explain?",
      options: [
        "Be honest and speak about what you have built and measured",
        "Bluff confidently",
        "Change the subject silently",
        "End the interview",
      ],
      answer: 0,
      explain: "Honesty and grounded experience are more convincing than bluffing.",
    },
    {
      kind: "text",
      q: "A rollout done in widening groups with exit criteria at each step uses what? (one word)",
      format: "*****",
      accept: ["rings", "ring-based", "ring based", "staged"],
      explain: "Rings limit risk while evidence builds.",
    },
  ],
};
