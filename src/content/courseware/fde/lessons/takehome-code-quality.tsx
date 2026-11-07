import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Write code a reviewer can understand in minutes: naming, small functions and clear boundaries",
    "Decide what to test in limited time and write tests that protect the riskiest logic",
    "Handle errors and configuration like a production engineer",
    "Make the project reproducible from a clean clone",
    "Run a final quality checklist before submitting",
  ],
  tasks: [
    {
      id: "readable",
      title: "Readable beats clever",
      body: (
        <>
          <p>
            Reviewers skim code. They form an impression from function names, file layout and the
            first screen of each file. You are communicating, so write for the reader.
          </p>
          <Table
            head={["Habit", "Weak", "Strong"]}
            rows={[
              ["Names", "process(x), data2, tmp", "match_invoice_to_po(invoice, orders)"],
              ["Function size", "A 120-line function doing everything", "Small functions with one job and a clear return type"],
              ["Comments", "Comment every line, or none", "Explain why, not what; a short note on any non-obvious rule"],
              ["Magic values", "if score > 0.83", "MIN_MATCH_SCORE = 0.83 with a comment on how it was chosen"],
              ["Types and schemas", "Dicts everywhere", "Dataclasses or pydantic models for the main entities"],
              ["Dead code", "Commented-out experiments", "Removed; history is in Git"],
              ["Formatting", "Inconsistent", "An autoformatter and linter run once (black/ruff, prettier/eslint)"],
            ]}
          />
        </>
      ),
    },
    {
      id: "tests",
      title: "Test the risky logic, not everything",
      body: (
        <>
          <p>
            With a few hours, tests are about evidence and risk, not coverage numbers. Test where a
            bug would hurt and where logic is subtle.
          </p>
          <DiagramReference lesson="takehome-code-quality" panel={1} />
          <pre>
            <code>{`# tests/test_match.py: small, readable, edge-case focused
import pytest
from invoice_checker.match import match_invoice

PO = [{"po": "PO-100", "supplier": "Acme", "amount": 500.00}]

def test_exact_match():
    assert match_invoice({"po": "PO-100", "supplier": "Acme", "total": 500.00}, PO).status == "matched"

def test_amount_mismatch_flagged():
    r = match_invoice({"po": "PO-100", "supplier": "Acme", "total": 650.00}, PO)
    assert r.status == "review" and "amount" in r.reason

def test_unknown_po_flagged_not_rejected():
    assert match_invoice({"po": "PO-999", "supplier": "Acme", "total": 10}, PO).status == "review"

@pytest.mark.parametrize("total", [None, -5, "abc"])
def test_invalid_totals_do_not_crash(total):
    assert match_invoice({"po": "PO-100", "supplier": "Acme", "total": total}, PO).status == "review"`}</code>
          </pre>
          <ul>
            <li>Name tests as sentences describing behaviour.</li>
            <li>Mock the model and network; never depend on a live call in tests.</li>
            <li>Show one test that failed before a fix and now passes, and mention it.</li>
          </ul>
        </>
      ),
    },
    {
      id: "errors",
      title: "Errors, configuration and secrets",
      body: (
        <>
          <ul>
            <li><strong>Fail loudly at the start</strong> for missing configuration, with a message that says what to set.</li>
            <li><strong>Handle expected errors specifically</strong> (file not found, invalid row, API failure) and avoid blanket <code>except Exception: pass</code>.</li>
            <li><strong>Return, do not swallow.</strong> Bad records go to a rejected file with a reason; the run continues but reports counts.</li>
            <li><strong>Log with levels</strong> (info for progress, warning for flagged items, error for failures) and never log secrets or full personal data.</li>
            <li><strong>Read configuration from the environment</strong> in one place (<code>config.py</code>), with defaults for non-secrets.</li>
          </ul>
          <pre>
            <code>{`# config.py
import os, sys

def require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        sys.exit(f"Missing environment variable {name}. See .env.example, or run with --demo.")
    return value

DEMO = os.environ.get("DEMO", "0") == "1"
MAX_MODEL_CALLS = int(os.environ.get("MAX_MODEL_CALLS", "200"))`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "final",
      title: "The pre-submission checklist",
      body: (
        <>
          <DiagramReference lesson="takehome-code-quality" panel={2} />
          <Table
            head={["Check", "Done?"]}
            rows={[
              ["README: what it does, how to run in 3 commands, assumptions, results, limitations, next steps", "☐"],
              ["Works on a clean clone, with and without an API key (demo mode)", "☐"],
              ["Tests pass; evaluation numbers in the README match a fresh run", "☐"],
              ["No secrets in the repo or its history", "☐"],
              ["No dead code, debug prints or stray files", "☐"],
              ["Dependencies pinned; Python or Node version stated", "☐"],
              ["Diagram and demo video link included", "☐"],
            ]}
          />
          <Callout tone="warn" title="Search your history for secrets">
            Deleting a key in a later commit does not remove it from history. Search with{" "}
            <code>git log -p | grep -i key</code>, and if a key was committed, rotate it and rewrite
            history before submitting.
          </Callout>
          <Exercise
            title="Review this snippet"
            task={
              <pre>
                <code>{`def p(d):
    try:
        r = []
        for x in d:
            if x["t"] > 0.83:
                r.append(x["n"])
        return r
    except:
        return []`}</code>
              </pre>
            }
          >
            <p>Problems a reviewer would note, and the fixes:</p>
            <ul>
              <li><strong>Unclear names</strong> (<code>p</code>, <code>d</code>, <code>t</code>, <code>n</code>): name the function and fields for their meaning.</li>
              <li><strong>Magic number 0.83:</strong> make it a named constant with a note on its origin.</li>
              <li><strong>Bare <code>except</code> returning an empty list:</strong> hides every error, including bugs; catch specific exceptions, log, and surface a failure count.</li>
              <li><strong>No types or tests:</strong> add type hints and a test for the threshold boundary and a malformed row.</li>
            </ul>
            <pre>
              <code>{`MIN_MATCH_SCORE = 0.83   # chosen on the validation set; see README

def names_above_threshold(matches: list[Match]) -> list[str]:
    return [m.name for m in matches if m.score > MIN_MATCH_SCORE]`}</code>
            </pre>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Readable code with clear names, small functions, named constants, types and no dead code makes a strong impression.",
    "Test the riskiest logic with focused unit tests, a few pipeline tests and a smoke test; mock the model and network.",
    "Fail loudly on missing config, handle expected errors specifically, never swallow exceptions and never log secrets.",
    "Use a last-hour routine: freeze features, verify on a clean clone, run tests and evaluation, check for secrets, submit.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is wrong with a bare 'except: return []'?",
      options: [
        "It hides every error, including bugs, and returns misleading empty results",
        "It makes code faster",
        "It is required for safety",
        "It improves readability",
      ],
      answer: 0,
      explain: "Swallowing exceptions conceals failures and corrupts results silently.",
    },
    {
      kind: "mcq",
      q: "What should tests mock in a take-home?",
      options: [
        "The model and network calls",
        "The business rules",
        "The assertions",
        "The README",
      ],
      answer: 0,
      explain: "Tests should be deterministic and not depend on live services or keys.",
    },
    {
      kind: "mcq",
      q: "You committed an API key earlier and deleted it in a later commit. What should you do?",
      options: [
        "Rotate the key and rewrite history before submitting",
        "Nothing; it is deleted",
        "Hide the README",
        "Rename the repo",
      ],
      answer: 0,
      explain: "Keys remain in history; rotate and clean.",
    },
    {
      kind: "mcq",
      q: "Which pre-submission step finds the most setup problems?",
      options: [
        "Cloning into a new folder and following only the README",
        "Rereading the code once",
        "Reformatting",
        "Adding features",
      ],
      answer: 0,
      explain: "A clean-clone run reveals hidden dependencies and missing instructions.",
    },
    {
      kind: "text",
      q: "How many minutes before submission does the routine say to freeze features? (a number)",
      format: "**",
      accept: ["60", "t-60", "60 minutes"],
      explain: "T-60: stop adding features and clean up.",
    },
  ],
};
