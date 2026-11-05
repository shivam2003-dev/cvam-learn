import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Medium",
  objectives: [
    "Design the solution around what the end user does, not around your architecture",
    "Map the user's current workflow and find where the solution should plug in",
    "Decide the right level of automation and where a human reviews",
    "Show the user's value in the first minute of a demo",
  ],
  tasks: [
    {
      id: "user",
      title: "Start from the user's day",
      body: (
        <>
          <p>
            Take-home reviewers repeatedly say that technically correct solutions fail because they
            do not fit a human. A finance clerk does not want a JSON file; an operations manager does
            not want to run a Python script. The brief names a user. Treat that person as the
            customer for the whole assignment.
          </p>
          <Figure caption="Two ways to start. Building from the architecture produces a system nobody can use; building from the workflow produces something that fits a day of work.">
            <Graph
              label="Architecture-first versus workflow-first: the first leads from components to a tool the user must adapt to; the second leads from the user's task to a fitting tool"
              cellW={206}
              cellH={96}
              nodeW={168}
              nodes={[
                { id: "a1", label: "Pick technologies", col: 0, row: 0, tone: "rose" },
                { id: "a2", label: "Build components", col: 1, row: 0, tone: "rose" },
                { id: "a3", label: "User must adapt", sub: "Awkward fit", col: 2, row: 0, tone: "rose" },
                { id: "b1", label: "Observe the task", col: 0, row: 1, tone: "lime" },
                { id: "b2", label: "Find the painful step", col: 1, row: 1, tone: "lime" },
                { id: "b3", label: "Fit the tool in", sub: "Natural place in the day", col: 2, row: 1, tone: "lime" },
              ]}
              groups={[
                { label: "Architecture-first", c1: 0, r1: 0, c2: 2, r2: 0, tone: "rose" },
                { label: "Workflow-first", c1: 0, r1: 1, c2: 2, r2: 1, tone: "lime" },
              ]}
              edges={[
                { from: "a1", to: "a2" },
                { from: "a2", to: "a3" },
                { from: "b1", to: "b2" },
                { from: "b2", to: "b3" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "map",
      title: "Map the workflow, then place the tool",
      body: (
        <>
          <p>
            Even without access to real users, you can reason about the workflow from the brief. Write
            a short story of one task, step by step, then mark where your solution intervenes.
          </p>
          <Figure caption="A clerk's invoice workflow with the solution inserted at the slow, error-prone steps. Everything else stays as it is, which makes adoption easy.">
            <Flow
              numbered
              steps={[
                { title: "Invoice arrives", note: "Email or portal", tone: "plain" },
                { title: "Key fields into ERP", note: "Slow and error-prone: automate", tone: "amber" },
                { title: "Match to purchase order", note: "Lookup by hand: automate", tone: "amber" },
                { title: "Resolve mismatches", note: "Judgment: human with the tool's help", tone: "lime" },
                { title: "Approve for payment", note: "Accountability: stays human", tone: "plain" },
              ]}
            />
          </Figure>
          <Table
            head={["Question about the user", "Design consequence"]}
            rows={[
              ["How often do they do this task?", "Daily and repeated: optimise for speed and keyboard flow. Rare: optimise for clarity"],
              ["How technical are they?", "Non-technical: a simple page or file they already use; no terminals"],
              ["What do they use today?", "Fit into it: export to the spreadsheet they already live in"],
              ["What happens when it is wrong?", "High cost: show sources and require confirmation; low cost: automate more"],
              ["Who is accountable for the outcome?", "They stay in control; the tool proposes, they decide"],
            ]}
          />
        </>
      ),
    },
    {
      id: "level",
      title: "Choose the level of automation",
      body: (
        <>
          <Table
            head={["Level", "What the tool does", "Use when"]}
            rows={[
              ["Inform", "Shows information; the user acts", "Low trust, high stakes, or early stage"],
              ["Suggest", "Proposes an action with evidence; user accepts or edits", "Most take-home cases"],
              ["Act with review", "Does the action; user can review and undo", "Reversible, well-evaluated tasks"],
              ["Act autonomously", "Does it and reports exceptions", "Only with strong evidence, limits and monitoring"],
            ]}
          />
          <Callout tone="tip" title="Default to suggest">
            In a take-home you cannot prove enough reliability to justify full autonomy. A tool that
            suggests with evidence, makes acceptance one click and flags low-confidence cases shows
            both ambition and maturity.
          </Callout>
        </>
      ),
    },
    {
      id: "value",
      title: "Show the value in the first minute",
      body: (
        <>
          <p>
            Reviewers and real users judge quickly. Make the first minute of the demo show the whole
            point: take a real input, run it, and show the result in the user&apos;s terms.
          </p>
          <ul>
            <li>Lead with the outcome: &ldquo;This invoice was read and matched in 3 seconds; here is the evidence.&rdquo;</li>
            <li>Show a <strong>before and after</strong> where possible: eight minutes by hand, three seconds with the tool.</li>
            <li>Let the flagged cases stand out, since that is where the user&apos;s attention is needed.</li>
            <li>Avoid starting with architecture, configuration or setup.</li>
          </ul>
          <Exercise
            title="Redesign around the user"
            task={
              <p>
                A candidate delivers a command-line tool that outputs a 300-line JSON file of extracted
                customer complaints with sentiment scores. The brief said &ldquo;for the customer care
                manager to see what customers are unhappy about each week.&rdquo; What should change?
              </p>
            }
          >
            <ul>
              <li><strong>Output:</strong> replace the JSON with a one-page weekly summary: top five themes with counts, change from last week, and two or three representative quotes per theme.</li>
              <li><strong>Interface:</strong> a simple HTML report or spreadsheet the manager already knows how to open; keep the CLI for generating it.</li>
              <li><strong>Evidence:</strong> link each theme to the underlying comments, so the manager can verify and dig in.</li>
              <li><strong>Action:</strong> highlight what changed this week and what looks urgent, since a manager&apos;s question is &ldquo;what should I do?&rdquo;.</li>
              <li><strong>Demo:</strong> open the weekly report in the first ten seconds.</li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Treat the user named in the brief as the customer; design from their workflow, not your architecture.",
    "Map one task step by step and insert the tool at the slow, error-prone steps.",
    "Choose the level of automation deliberately; suggest with evidence is the strong default.",
    "Make the first minute of the demo show the outcome in the user's terms, with before and after.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the best default automation level for a take-home?",
      options: [
        "Suggest with evidence, with the user accepting or editing",
        "Fully autonomous",
        "Inform only",
        "No tool at all",
      ],
      answer: 0,
      explain: "It shows ambition while keeping a person accountable.",
    },
    {
      kind: "mcq",
      q: "The user is a non-technical manager. Which output fits best?",
      options: [
        "A one-page report or spreadsheet they already use",
        "A 300-line JSON file",
        "A Python traceback",
        "A Docker image",
      ],
      answer: 0,
      explain: "The deliverable must fit the user's tools and skills.",
    },
    {
      kind: "mcq",
      q: "Where should the tool intervene in a workflow?",
      options: [
        "At slow and error-prone steps, leaving accountable decisions with the human",
        "At every step, including approvals",
        "Nowhere",
        "Only at the end",
      ],
      answer: 0,
      explain: "Targeted placement eases adoption and keeps accountability clear.",
    },
    {
      kind: "text",
      q: "A task takes 8 minutes by hand and 3 seconds with the tool. Roughly how many times faster is that (nearest whole number)?",
      format: "***",
      accept: ["160", "about 160", "~160"],
      explain: "480 seconds / 3 seconds = 160 times faster.",
    },
  ],
};
