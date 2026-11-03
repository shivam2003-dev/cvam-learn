import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 9,
  difficulty: "Easy",
  objectives: [
    "Describe a typical set of FDE levels and what changes at each",
    "Explain the common ways engineers move into an FDE role",
    "Identify the gaps to close when coming from your own background",
  ],
  tasks: [
    {
      id: "tiers",
      title: "FDE tiers",
      body: (
        <>
          <p>
            Companies label levels differently, but the progression usually tracks how much
            ambiguity you can handle and how big a customer relationship you can carry. A common
            shape:
          </p>
          <Table
            head={["Tier", "Scope", "What you are trusted with"]}
            rows={[
              ["Junior / associate", "A defined task inside an engagement", "Build and integrate a well-specified piece, with review"],
              ["FDE", "One customer deployment end to end", "Discovery, scoping, build, rollout, and the weekly customer call"],
              ["Senior / staff FDE", "Several deployments or a strategic account", "Set technical direction, mentor, shape contracts, push patterns into product"],
              ["Lead / manager", "A team and a book of customers", "Staffing, escalation, hiring, relationship with executives"],
            ]}
          />
          <Callout tone="note">
            Growth is mostly about scope of ambiguity, not tool knowledge. A senior FDE can walk
            into an unclear situation and leave with a plan the customer trusts.
          </Callout>
        </>
      ),
    },
    {
      id: "paths",
      title: "From X to FDE",
      body: (
        <>
          <p>People arrive from many places. Each background has a strength and a gap.</p>
          <Table
            head={["Coming from", "You already have", "Close this gap"]}
            rows={[
              ["Software engineer", "Code quality, systems thinking", "Customer discovery, scoping, executive communication"],
              ["Data engineer / scientist", "Data, pipelines, modelling", "Product thinking, frontend, production hardening"],
              ["Solutions / sales engineer", "Customer skills, demos", "Owning production code and operations"],
              ["Consultant / analyst", "Business sense, stakeholder skills", "Hands-on engineering depth"],
              ["DevOps / SRE", "Deployment, reliability, security", "Application code, product mindset"],
            ]}
          />
        </>
      ),
    },
    {
      id: "plan",
      title: "A practical plan to switch",
      body: (
        <>
          <ol>
            <li>
              <strong>Build breadth.</strong> Be able to ship a small full-stack app with a
              database, an API, auth and a deployment. The next modules cover this.
            </li>
            <li>
              <strong>Add AI skills.</strong> Prompting, retrieval, agents and evals now appear in
              most FDE job descriptions.
            </li>
            <li>
              <strong>Practise discovery.</strong> Take a real workflow at your current job, talk to
              the people who do it, and write a one-page problem statement.
            </li>
            <li>
              <strong>Create evidence.</strong> A portfolio piece that solves a real, messy
              problem with real constraints beats a tutorial clone.
            </li>
            <li>
              <strong>Learn to write.</strong> Short status updates and clear design notes are a
              hiring signal.
            </li>
          </ol>
          <Callout tone="tip">
            In interviews, expect an ambiguous case. They test whether you ask questions before
            you start building.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Levels grow with the ambiguity and customer scope you can own, not just technical skill.",
    "Every background brings a strength and a gap; name yours.",
    "Breadth, AI skills, discovery practice, a real portfolio piece and good writing are the entry plan.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A backend engineer wants to become an FDE. Which gap is most likely?",
      options: [
        "Writing SQL",
        "Customer discovery and executive communication",
        "Using Git",
        "Running unit tests",
      ],
      answer: 1,
      explain: "Strong engineers usually have the code skills. The new muscles are talking to customers and scoping ambiguous work.",
    },
    {
      kind: "mcq",
      q: "What mostly separates a senior FDE from a mid-level one?",
      options: [
        "Knowing more programming languages",
        "Handling bigger ambiguity and customer scope",
        "Working longer hours",
        "Avoiding customer calls",
      ],
      answer: 1,
      explain: "Seniority tracks the size and fuzziness of the problem you can take on and make safe for the customer.",
    },
    {
      kind: "mcq",
      q: "Which portfolio item best signals FDE readiness?",
      options: [
        "A copy of a tutorial project",
        "A project that solves a real messy workflow with documented constraints",
        "A list of certifications",
        "A screenshot of a code editor",
      ],
      answer: 1,
      explain: "Real constraints and a written problem statement show discovery, scoping and delivery together.",
    },
  ],
};
