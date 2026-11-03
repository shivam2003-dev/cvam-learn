import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Compare terminal coding agents and AI editors",
    "Use AI to move faster on discovery, glue code and tests",
    "Apply habits that keep generated code correct, secure and understood",
  ],
  tasks: [
    {
      id: "tools",
      title: "The tool landscape",
      body: (
        <>
          <p>
            Coding agents read your repository, run commands, edit files and iterate on test
            results. For an FDE they compress days of glue work into hours, which matters when the
            customer's clock is running.
          </p>
          <Table
            head={["Tool", "Style", "Good for"]}
            rows={[
              ["Claude Code", "Terminal agent", "Multi-file changes, exploring unfamiliar repos, scripted workflows"],
              ["Codex (OpenAI)", "Terminal and cloud agent", "Delegated tasks that run in a sandbox"],
              ["Gemini CLI", "Terminal agent", "Large-context exploration"],
              ["Cursor", "AI-first editor", "Inline edits and chat inside the editor"],
              ["OpenCode and similar", "Open-source terminal agents", "Provider choice and customisation"],
            ]}
          />
          <p>
            Tools change quickly. Learn the shared skills: giving context, setting rules in a
            project file, reviewing diffs, and running tests.
          </p>
        </>
      ),
    },
    {
      id: "uses",
      title: "Where it pays off in FDE work",
      body: (
        <>
          <ul>
            <li>
              <strong>Understanding a legacy codebase.</strong> Ask it to map modules, trace a
              request, and explain a strange function.
            </li>
            <li>
              <strong>Glue code.</strong> API clients, parsers, format converters, one-off scripts.
            </li>
            <li>
              <strong>Tests and fixtures</strong> for code that has none.
            </li>
            <li>
              <strong>Prototypes</strong> to put a working screen in front of users quickly.
            </li>
            <li>
              <strong>Docs and runbooks</strong> drafted from the code, then corrected by you.
            </li>
          </ul>
          <pre>
            <code>{`# Example project instructions the agent reads every session
- Python 3.12, type hints required, run tests with: pytest -q
- Never print or log customer data; use the redact() helper
- Do not call production endpoints; use the sandbox base URL in .env.example
- Small commits, one purpose each`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "habits",
      title: "Habits that keep it trustworthy",
      body: (
        <>
          <ul>
            <li>
              <strong>Read every diff.</strong> You are accountable for code you ship, whoever
              wrote it.
            </li>
            <li>
              <strong>Run the tests</strong> and add one for the behaviour you care about.
            </li>
            <li>
              <strong>Work in small steps</strong> with version control, so a bad turn is easy to
              undo.
            </li>
            <li>
              <strong>Give context and constraints</strong>: goal, files, what not to touch, how to
              verify.
            </li>
            <li>
              <strong>Mind data.</strong> Do not paste customer secrets or personal data into tools
              the customer has not approved.
            </li>
            <li>
              <strong>Review permissions.</strong> Be careful with autonomous modes that can run
              commands; restrict them to a sandbox or an unprivileged account.
            </li>
          </ul>
          <Callout tone="warn">
            "Vibe coding" is fine for a throwaway demo. For anything that touches customer data or
            production, you must understand what the code does before it ships.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Coding agents speed up repo exploration, glue code, tests, prototypes and docs.",
    "Learn transferable skills: context, project rules, diff review and test loops.",
    "You own what ships; review diffs, test, work in small steps and protect customer data.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Who is accountable for AI-generated code you commit?",
      options: ["The AI vendor", "You", "Nobody", "The customer's intern"],
      answer: 1,
      explain: "Whoever ships the code owns it, so review and test it.",
    },
    {
      kind: "mcq",
      q: "Which is the safest way to use an autonomous coding agent on a customer project?",
      options: [
        "Give it production credentials",
        "Use a sandbox or sandbox credentials and review the diff",
        "Disable version control",
        "Paste customer personal data into it",
      ],
      answer: 1,
      explain: "Limit its reach and keep a reviewable record of changes.",
    },
    {
      kind: "mcq",
      q: "What goes in a project instructions file for an agent?",
      options: [
        "Build commands, conventions and rules such as what not to touch",
        "Passwords",
        "Random jokes",
        "Nothing; it never reads it",
      ],
      answer: 0,
      explain: "Persistent instructions make each session start with the right conventions and guardrails.",
    },
  ],
};
