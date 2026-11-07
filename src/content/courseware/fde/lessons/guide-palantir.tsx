import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Understand why Palantir is the reference point for the forward deployed model",
    "Map the role's publicly described responsibilities to preparation themes",
    "Build a preparation plan covering decomposition, coding, domain curiosity and communication",
    "Prepare questions to ask and stories to tell",
    "Verify current process details from reliable, recent sources",
  ],
  tasks: [
    {
      id: "context",
      title: "Why Palantir matters for FDEs",
      body: (
        <>
          <Callout tone="warn" title="Read this first: verify everything here">
            Interview processes change and differ by team, location and level. This guide uses only
            widely published information about the role and general preparation strategy. It does not
            describe any confidential process. Before you prepare, check the company&apos;s current
            careers page and job description, and read recent first-hand accounts from candidates,
            treating any single account as one data point.
          </Callout>
          <p>
            Palantir is widely credited with popularising the forward deployed engineering model: its
            engineers work directly with customers in government, defence, healthcare, finance and
            industry to configure and extend the company&apos;s data platforms against real
            operational problems. Job descriptions have described roles such as forward deployed
            software engineer and, on the business side, roles focused on deployment strategy and
            operations. Many companies that hire FDEs borrow vocabulary from this model, so
            understanding it helps even if you apply elsewhere.
          </p>
        </>
      ),
    },
    {
      id: "themes",
      title: "What the role tends to value",
      body: (
        <>
          <DiagramReference lesson="guide-palantir" panel={1} />
        </>
      ),
    },
    {
      id: "prep",
      title: "A six-week preparation plan",
      body: (
        <>
          <DiagramReference lesson="guide-palantir" panel={2} />
          <Table
            head={["Area", "What to practise", "Example drill"]}
            rows={[
              ["Decomposition", "Open-ended prompts with real-world messiness and incomplete data", "'A hospital has long emergency wait times. How would you use data to help?' Spend 10 minutes only on questions and a plan"],
              ["Data skills", "Exploring a new dataset quickly, spotting quality issues, answering questions with SQL", "Take a public dataset, find five problems and five insights in 45 minutes"],
              ["Coding", "Practical programs, not only puzzles", "Parse and join two messy files and produce a clean summary with tests"],
              ["Domain curiosity", "Reading about the industries the company serves", "Pick one industry and write a one-page map of its data, decisions and pain points"],
              ["Communication", "Explaining technical work to a non-technical audience", "Teach a friend what you built in three minutes, no jargon"],
              ["Motivation", "A clear and honest answer to why this company and this work", "Write it, say it aloud, and tighten it"],
            ]}
          />
        </>
      ),
    },
    {
      id: "practice",
      title: "Practice prompt and questions to ask",
      body: (
        <>
          <Exercise
            title="Decomposition drill"
            task={
              <p>
                &ldquo;A national disaster agency wants to know where to pre-position supplies before
                storms. They have weather forecasts, population data, road networks and last year&apos;s
                incident logs, all in different formats and owned by different departments. Where do
                you start?&rdquo; Take 10 minutes and write only your questions and your plan.
              </p>
            }
          >
            <p>
              <strong>Questions first:</strong> who decides and by when; what decision exactly is being
              made (which depots, how much, for which regions); what does a good outcome look like and
              how will it be measured; who owns each dataset and what are the access rules; how current
              and reliable is each source; what happened last time.
            </p>
            <p>
              <strong>Plan:</strong> define the decision and metric (for example, share of demand
              served within 24 hours); inventory data and ownership; build a thin pipeline joining
              forecast zones to population and past incident demand; validate against last year&apos;s
              storms; produce a simple map and ranked depot recommendations for a human planner; add
              uncertainty and assumptions; agree a pilot with one region.
            </p>
            <p>
              <strong>Signals this demonstrates:</strong> decision-first thinking, data ownership
              awareness, validation against history, human-in-the-loop, and a small first step.
            </p>
          </Exercise>
          <Table
            head={["Questions to ask your interviewers", "Why they are good"]}
            rows={[
              ["What does a typical first three months on a deployment look like?", "Shows you think about ramp-up and ownership"],
              ["How much of the work is on site versus remote, and what is the travel pattern?", "Practical, and avoids surprises"],
              ["How do learnings from deployments feed back into the product?", "Shows understanding of the feedback loop"],
              ["What distinguishes people who thrive in this role?", "Invites a candid answer you can reflect on"],
              ["What kinds of problems would I be most likely to work on first?", "Connects your skills to the team's needs"],
            ]}
          />
          <Callout tone="tip" title="Reflect, do not recite">
            Interviewers are skilled at spotting rehearsed answers. Prepare stories and frameworks,
            then answer the actual question in front of you, in your own words.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Palantir popularised the forward deployed model; its public role descriptions emphasise ownership, decomposition, data fluency, engineering and communication.",
    "Prepare through decomposition drills, data and coding practice, domain curiosity, stories and mock loops.",
    "Always verify the current process from official sources and recent candidate accounts; this guide avoids confidential details.",
    "Prepare thoughtful questions about onboarding, travel, feedback loops and what success looks like.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why should you verify process details before preparing for any company?",
      options: [
        "Processes change and differ by team, level and location",
        "They never change",
        "Official sources are always wrong",
        "It is not allowed to prepare",
      ],
      answer: 0,
      explain: "Current official information and recent accounts are more reliable than old assumptions.",
    },
    {
      kind: "mcq",
      q: "In a decomposition drill, what should you do first?",
      options: [
        "Ask who decides what, by when, and how success is measured",
        "Pick a technology",
        "Draw a database schema",
        "Request more time",
      ],
      answer: 0,
      explain: "Clarifying the decision and success measure anchors everything that follows.",
    },
    {
      kind: "mcq",
      q: "Which question to an interviewer shows you understand the FDE model?",
      options: [
        "How do deployment learnings feed back into the product?",
        "What is the dress code?",
        "How many holidays are there?",
        "Can I skip the technical round?",
      ],
      answer: 0,
      explain: "The feedback loop is central to making the model valuable.",
    },
    {
      kind: "text",
      q: "In the disaster-supplies drill, what should you validate your recommendations against? (two words)",
      format: "**** ****",
      accept: ["last year", "past storms", "historical data", "last year's storms", "past incidents"],
      explain: "Validating against history shows whether the approach would have worked.",
    },
  ],
};
