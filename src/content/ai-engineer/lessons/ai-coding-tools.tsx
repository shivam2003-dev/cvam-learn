import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Tell terminal agents, AI editors and chat assistants apart and pick one per task",
    "Give an assistant the context it needs through a project instructions file",
    "Use tests, small diffs and review to keep AI-written code trustworthy",
    "Avoid the security mistakes unique to AI-assisted coding",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: fast output is not the same as correct output",
      body: (
        <>
          <p>
            AI coding tools can write a function, a test or a whole feature in seconds. That speed
            is real, and so is the trap. The code reads confidently whether or not it is right. It
            may call a function that does not exist, ignore a rule in your codebase, or handle the
            happy path and nothing else. If you accept it without checking, you have swapped the
            time you saved writing for time spent debugging later.
          </p>
          <p>
            The right mental model is a very fast junior colleague who has read a great deal but
            has never seen your system. You would give them clear context, ask for small pieces,
            review every pull request, and run the tests. The tools change monthly. These habits
            do not.
          </p>
        </>
      ),
    },
    {
      id: "kinds",
      title: "The main kinds of tool",
      body: (
        <>
          <Table
            head={["Kind", "How you use it", "Examples", "Best for"]}
            rows={[
              ["Terminal agents", "Describe a goal in a shell; the agent reads files, runs commands and edits code", "Claude Code, Codex CLI, Gemini CLI, aider", "Multi-file changes, refactors, running tests, repo questions"],
              ["AI editors and IDE assistants", "Suggestions and chat inside the editor; agent modes for larger tasks", "Cursor, GitHub Copilot, Windsurf", "Day-to-day coding, quick edits, completion"],
              ["Chat assistants", "Paste code or a question in a chat window", "Chat apps from model providers", "Explaining code, designing, learning, snippets"],
            ]}
          />
          <p>
            An <strong>agent</strong> differs from plain autocomplete because it loops: it plans,
            takes an action such as reading a file or running a command, looks at the result, and
            continues until it thinks the job is done. That makes it powerful, and it also means
            mistakes can compound. Features, names and limits change quickly, so judge a tool by
            trying it on a real task in your own repository.
          </p>
        </>
      ),
    },
    {
      id: "context",
      title: "Give it context: the instructions file",
      body: (
        <>
          <p>
            The assistant cannot guess your conventions. Many tools read a plain text file at the
            root of the repository, for example AGENTS.md or CLAUDE.md, and add it to every session.
            Check which filename your tool expects. Use it for what a new teammate would need on
            day one.
          </p>
          <pre>
            <code>{`# Project notes for AI assistants

## Commands
- Install: pip install -r requirements.txt
- Test:    pytest -q          (run before saying a task is done)
- Lint:    ruff check .

## Conventions
- Python 3.11, type hints on all public functions.
- Database access only through app/db.py. Never write raw SQL elsewhere.
- Do not add new dependencies without asking.

## Do not touch
- migrations/ (generated), .env files, anything under secrets/`}</code>
          </pre>
          <p>
            Keep it short and factual. Long, vague files waste the model&apos;s context and get
            ignored. When the assistant makes the same mistake twice, add a line to the file.
            Inside a prompt, point at specific files, state the goal, name the tests that should
            pass, and say what must not change.
          </p>
        </>
      ),
    },
    {
      id: "habits",
      title: "Habits that keep output trustworthy",
      body: (
        <>
          <p>
            Errors compound across steps. If each step of an agent is right with some probability,
            the chance that a whole chain is right is the product of the chances.
          </p>
          <Formula>P(all steps right) = p<sup>n</sup>  (p per step, n steps)</Formula>
          <pre>
            <code>{`p = 0.95 per step (illustrative), n = 10 steps:
0.95 ^ 10 = 0.599   -> about a 60% chance the whole chain is correct

p = 0.95, n = 3 steps:
0.95 ^ 3 = 0.857    -> about 86%`}</code>
          </pre>
          <p>
            A 5 percent miss rate per step sounds small, yet ten steps leave roughly a 40 percent
            chance that something is wrong. The fix is to make chains short and to check often.
          </p>
          <ul>
            <li>
              <strong>Tests are the referee.</strong> Ask for a failing test first, then the
              change that makes it pass. Run the suite yourself. An assistant that says it
              passes is not evidence.
            </li>
            <li>
              <strong>Small diffs.</strong> Ask for one change at a time and commit each good
              one. A 40-line diff can be reviewed properly. A 1,200-line diff gets skimmed.
            </li>
            <li>
              <strong>Read the code.</strong> If you cannot explain a line, do not merge it. Ask
              the assistant to explain it, then check the explanation against the docs.
            </li>
            <li>
              <strong>Use version control as an undo button.</strong> Work on a branch, commit
              before a big agent run, and review the full diff afterwards.
            </li>
            <li>
              <strong>Check that dependencies exist.</strong> Assistants sometimes invent package
              names. Attackers can register those names, so look up any new library before
              installing it.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "safety",
      title: "Security and permissions",
      body: (
        <>
          <p>
            A terminal agent can run commands on your machine, so treat its permissions like those
            of a new contractor. Approve actions deliberately, start in the most restricted mode
            your tool offers, and widen access only for tasks and folders you trust. Be especially
            careful with commands that delete files, push code, change infrastructure or touch
            production.
          </p>
          <Callout tone="warn">
            Never paste secrets, customer data or proprietary code into a tool before checking
            your employer&apos;s policy and the provider&apos;s data terms. Keep .env files out of
            the assistant&apos;s reach, and run it in a container or a throwaway environment when
            the task is risky.
          </Callout>
          <p>
            Also remember that agents read text from many places: README files, issue comments, web
            pages and tool output. That text can contain instructions meant to hijack the agent, a
            form of prompt injection. Review before you let an agent act on content you did not
            write.
          </p>
          <Callout tone="tip">
            A good loop is plan, small change, run tests, read the diff, commit. If you cannot say
            what changed and why, you are no longer in control of the codebase.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Terminal agents, AI editors and chat assistants suit different jobs. Try them on real tasks.",
    "A short instructions file with commands, conventions and no-go areas gives every session context.",
    "Chained steps compound errors: 0.95 per step over 10 steps leaves about a 60 percent chance of a correct chain.",
    "Use tests as the referee, keep diffs small, read the code and commit often.",
    "Limit permissions, protect secrets, and verify any dependency an assistant suggests.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What most clearly separates an agent from simple autocomplete?",
      options: [
        "It loops: it takes actions, sees results and continues",
        "It never makes mistakes",
        "It only works in a browser",
        "It cannot edit files",
      ],
      answer: 0,
      explain: "Agents plan, act, observe and repeat. That makes them powerful and lets errors compound.",
    },
    {
      kind: "mcq",
      q: "An assistant suggests installing a library you have never heard of. What should you do first?",
      options: [
        "Install it, since the assistant is confident",
        "Add it to the instructions file",
        "Check that the package exists and is the real, maintained one",
        "Ask for a larger diff",
      ],
      answer: 2,
      explain: "Assistants can invent package names, and attackers can publish malicious packages under those names. Verify before installing.",
    },
    {
      kind: "text",
      q: "If each step in an agent chain is right with probability 0.9, what is the chance two steps in a row are both right, as a decimal?",
      format: "****",
      accept: ["0.81", ".81"],
      explain: "0.9 × 0.9 = 0.81.",
    },
    {
      kind: "text",
      q: "Committing before a big agent run and reviewing the full diff afterwards uses what kind of tool as an undo button? Two words.",
      format: "******* *******",
      accept: ["version control", "source control", "git"],
      explain: "Version control lets you inspect every change an agent made and roll back the ones you do not want.",
    },
  ],
};
