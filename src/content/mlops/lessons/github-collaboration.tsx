import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Use a pull request workflow suited to ML code",
    "Protect main with rules and required checks",
    "Review ML changes for the risks that matter",
    "Route reviews with CODEOWNERS and estimate review load",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why teams need more than Git",
      body: (
        <>
          <p>
            Git tracks changes. It doesn't decide which changes are good enough to ship. Without
            agreed rules, one engineer pushes a feature change straight to <code>main</code>, the
            nightly pipeline retrains on it, and a worse model reaches customers by morning. Nobody
            reviewed it, and no test ran.
          </p>
          <p>
            <strong>GitHub</strong> hosts Git repositories and adds the team layer on top: pull
            requests, reviews, branch rules, issues and automation. Think of it as the editorial desk
            of a newspaper. Writers file drafts, an editor reviews them, and only approved pieces go
            to print. In many ML teams, merging to <code>main</code> starts real automation, so this
            review step is a production control, not a formality.
          </p>
        </>
      ),
    },
    {
      id: "flow",
      title: "The pull request workflow",
      body: (
        <>
          <p>
            A <strong>pull request</strong> (PR) proposes merging one branch into another. It shows
            the diff, collects review comments and displays the results of automated checks.
          </p>
          <ol>
            <li>Create a short-lived branch from <code>main</code>.</li>
            <li>Commit small, focused changes and push.</li>
            <li>Open a PR that says what changed and how you checked it.</li>
            <li>CI runs. Reviewers comment.</li>
            <li>Merge, delete the branch, and let automation take over.</li>
          </ol>
          <p>
            Most ML teams do well with this simple flow, often called{" "}
            <strong>trunk-based development</strong>: everyone branches from <code>main</code> and
            merges back within days. Long-lived branches drift away from <code>main</code>. They
            also hide a nasty ML problem, because two models trained on different branches can't be
            compared fairly once the feature code has diverged.
          </p>
          <p>The <code>gh</code> command-line tool lets you do all of this from the terminal:</p>
          <pre>
            <code>{`gh pr create --title "Cap tenure feature at 10 years" \\
  --body "Outliers were skewing the churn model. See metrics in CI."
gh pr checks              # watch CI status
gh pr view --web          # open the PR in a browser
gh pr merge --squash --delete-branch`}</code>
          </pre>
          <Table
            head={["Merge option", "History result", "Good for"]}
            rows={[
              ["Merge commit", "Keeps every commit, plus a merge commit", "Preserving exact branch history"],
              ["Squash", "One commit on main", "Messy branches and clean logs"],
              ["Rebase", "Replays commits with no merge commit", "Tidy series of meaningful commits"],
            ]}
          />
          <Callout tone="note">
            Squashing creates a new commit hash on <code>main</code>. If a model was trained from a
            branch commit, that hash may no longer be reachable from <code>main</code>. For lineage,
            prefer models built from the commit that was merged.
          </Callout>
        </>
      ),
    },
    {
      id: "protect",
      title: "Protecting main",
      body: (
        <>
          <p>
            Good intentions fail under deadline pressure, so let GitHub enforce the process. Branch
            protection rules and the newer rulesets, found in repository settings, can do the
            following:
          </p>
          <Table
            head={["Rule", "What it prevents"]}
            rows={[
              ["Require a pull request", "Direct pushes to main"],
              ["Require approvals", "Merging unreviewed work"],
              ["Require status checks to pass", "Merging code that fails tests or quality gates"],
              ["Dismiss stale approvals", "Approving one version, then merging a different one"],
              ["Block force-pushes", "Rewriting shared history"],
            ]}
          />
          <p>
            Status checks are what make the ML gates from CI real. If a job compares a new model with
            production, marking it as required means a losing model can't be merged without someone
            with bypass rights stepping in.
          </p>
          <p>
            <strong>CODEOWNERS</strong> routes reviews automatically. Place a file at{" "}
            <code>.github/CODEOWNERS</code>. Each line maps a path to reviewers, and the last matching
            line wins:
          </p>
          <pre>
            <code>{`# Default reviewers
*                    @acme/ml-engineers

# Feature logic affects every model
/src/features/       @acme/data-science

# Production config needs the platform team
/deploy/             @acme/ml-platform
/.github/workflows/  @acme/ml-platform`}</code>
          </pre>
          <p>
            Turn on "require review from code owners", and a change under <code>/deploy/</code> can't
            merge without the platform team.
          </p>
          <Callout tone="warn">
            Protect the workflow files too. Anyone who can edit a workflow can change what runs in
            CI, and may reach its secrets. That's why the example above assigns{" "}
            <code>.github/workflows/</code> an owner.
          </Callout>
        </>
      ),
    },
    {
      id: "review",
      title: "Reviewing ML changes",
      body: (
        <>
          <p>
            Ordinary code review asks if the code is correct and clear. ML review adds questions
            about behavior that a diff won't show:
          </p>
          <Table
            head={["Reviewer's question", "Why it matters"]}
            rows={[
              ["Is the same feature logic used in training and serving?", "A mismatch silently degrades predictions"],
              ["Could this feature leak future information?", "Offline scores rise, production doesn't"],
              ["Did the data version change on purpose?", "It may explain a metric shift"],
              ["Were metrics compared on the same test set?", "Otherwise the comparison means little"],
              ["Did any important slice get worse?", "An overall gain can hide harm to one group"],
              ["Is latency or memory affected?", "A bigger model may break its serving budget"],
            ]}
          />
          <p>
            A <strong>pull request template</strong> keeps these questions in view. Add{" "}
            <code>.github/pull_request_template.md</code>, and each new PR starts with this text:
          </p>
          <pre>
            <code>{`## What changed

## Data version
- [ ] Unchanged
- [ ] Updated (explain why)

## Model impact
Link to the metrics report:

## Checks
- [ ] No leakage from future data
- [ ] Feature logic matches serving
- [ ] Rollback plan is clear`}</code>
          </pre>
          <Callout tone="tip">
            Notebook diffs are unreadable JSON. Move logic into Python modules for review. If a
            notebook must stay, <code>nbdime</code> shows meaningful diffs, and{" "}
            <code>jupytext</code> pairs a notebook with a plain script.
          </Callout>
        </>
      ),
    },
    {
      id: "load",
      title: "Worked example: the cost of review",
      body: (
        <>
          <p>Review takes real time, so plan for it. Here's an illustrative team:</p>
          <Formula>review hours per week = PRs × reviewers per PR × hours per review</Formula>
          <p>
            Six engineers each open 3 PRs a week, making 6 × 3 = 18 PRs. If each PR needs 2 reviewers
            at 15 minutes, that's 18 × 2 = 36 reviews, and 36 × 15 = 540 minutes, or 9 hours a week.
          </p>
          <p>
            Dropping to one required reviewer for routine paths halves that to 4.5 hours, while
            CODEOWNERS can still require a second review on <code>/deploy/</code>. Small PRs help as
            well, because they're quicker to review and easier to revert.
          </p>
          <p>
            Compare that with the cost of skipping it. A bad change that triggers a 6-hour retrain on
            4 GPUs burns 24 GPU-hours. At an illustrative $2 per GPU-hour, that's $48 of compute
            before you've even counted the incident. Prices vary, so use your own figures.
          </p>
          <p>
            Finally, GitHub tracks the work around the code. <strong>Issues</strong> record bugs and
            experiment ideas, and linking a PR with <code>Fixes #123</code> closes the issue on merge.{" "}
            <strong>Releases</strong> attach notes to a Git tag, which is a tidy place to record a
            model's version, data version and metrics.
          </p>
          <Callout tone="warn">
            GitHub rejects files over 100 MiB, so a large model can't be pushed by accident. Smaller
            binaries still get through and bloat history, so keep them out with{" "}
            <code>.gitignore</code>.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Pull requests are a production control when merging starts ML automation.",
    "Use short-lived branches, so experiments stay comparable.",
    "Enforce reviews and required checks with branch rules, not goodwill.",
    "CODEOWNERS routes changes to the right people, including workflow files.",
    "Review ML changes for leakage, data versions, slices and training-serving mismatch.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What makes a model quality gate binding on a pull request?",
      options: [
        "Adding it to the README",
        "Marking its job as a required status check",
        "Asking reviewers to remember it",
        "Running it after merge",
      ],
      answer: 1,
      explain: "A required status check blocks the merge until the job passes.",
    },
    {
      kind: "mcq",
      q: "Why are long-lived branches a particular problem in ML?",
      options: [
        "GitHub deletes them",
        "Diverged feature code makes model comparisons unfair",
        "They use more GPU memory",
        "They can't run tests",
      ],
      answer: 1,
      explain: "If the code around two models differs, a metric gap may not be caused by the change you meant to test.",
    },
    {
      kind: "text",
      q: "Which file automatically assigns reviewers by path?",
      format: "**********",
      accept: ["codeowners", ".github/codeowners"],
      explain: "CODEOWNERS maps paths to the people or teams who must review them.",
    },
    {
      kind: "text",
      q: "A team merges 20 PRs a week. Each needs 2 reviewers at 30 minutes per review. How many hours of review is that per week?",
      format: "**",
      accept: ["20", "20 hours", "20h"],
      explain: "20 × 2 × 0.5 = 20 hours.",
    },
  ],
};
