import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Use the everyday Git commands: status, add, commit, branch, merge, rebase",
    "Run a pull request workflow with small, reviewable changes",
    "Keep customer-specific work and secrets out of the wrong place",
  ],
  tasks: [
    {
      id: "commands",
      title: "The commands you use every day",
      body: (
        <>
          <pre>
            <code>{`git status                     # what changed?
git switch -c fix/order-sync   # new branch for one piece of work
git add -p                     # stage changes hunk by hunk
git commit -m "Retry order sync on 429"
git fetch origin && git rebase origin/main   # replay your work on latest main
git push -u origin fix/order-sync
git log --oneline --graph -20  # see recent history
git stash                      # park uncommitted work`}</code>
          </pre>
          <p>
            Commit small and often, with messages that say <em>why</em>. When something breaks at
            a customer, <code>git log</code> and <code>git bisect</code> are how you find which
            change did it.
          </p>
        </>
      ),
    },
    {
      id: "workflow",
      title: "Pull request workflow",
      body: (
        <>
          <ol>
            <li>Branch from an up-to-date <code>main</code>, one purpose per branch.</li>
            <li>Push and open a pull request early; mark it draft if unfinished.</li>
            <li>Keep it small enough to review in 15 minutes. Explain what and why in the description.</li>
            <li>Let CI run tests and linters; fix failures before asking for review.</li>
            <li>Merge when approved, delete the branch, and tag releases that go to customers.</li>
          </ol>
          <Table
            head={["Situation", "Prefer"]}
            rows={[
              ["Clean up your own local commits", "Interactive rebase before pushing"],
              ["Shared branch other people use", "Merge, never rewrite history"],
              ["Hotfix at a customer", "Branch from the deployed tag, cherry-pick back to main"],
              ["Undo a pushed mistake", "git revert, not force push"],
            ]}
          />
        </>
      ),
    },
    {
      id: "customer-repos",
      title: "Customer code, forks and secrets",
      body: (
        <>
          <p>
            FDE repos often mix product code, customer configuration and credentials. Keep them
            apart.
          </p>
          <ul>
            <li>
              <strong>Never commit secrets.</strong> Use environment variables or a secrets
              manager, and add a <code>.gitignore</code> entry for local env files.
            </li>
            <li>
              <strong>Separate config from code.</strong> One shared codebase, a small
              per-customer config file or directory.
            </li>
            <li>
              <strong>Avoid long-lived customer forks.</strong> They drift and become impossible to
              upgrade. Prefer feature flags and configuration in the main repo.
            </li>
            <li>
              <strong>Respect their rules.</strong> Some customers require their own Git host,
              signed commits or approval for every change.
            </li>
          </ul>
          <Callout tone="warn">
            A secret pushed to a remote is compromised even if you delete it in the next commit.
            Rotate the credential, then clean the history.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Branch per purpose, commit small with a message that explains why.",
    "Open pull requests early, keep them small, and let CI catch problems.",
    "Revert instead of force-pushing shared history.",
    "Keep secrets out of Git, config out of code, and customer forks short-lived.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You committed an API key and pushed. What is the first thing to do?",
      options: [
        "Delete the file in a new commit",
        "Rotate the key",
        "Ignore it, nobody will notice",
        "Rename the branch",
      ],
      answer: 1,
      explain: "Once pushed, the key is exposed. Rotating it is the only safe fix; history cleanup comes after.",
    },
    {
      kind: "mcq",
      q: "How do you safely undo a bad commit already on a shared main branch?",
      options: ["git push --force", "git revert", "Delete the repo", "git reset --hard on the server"],
      answer: 1,
      explain: "git revert adds a new commit that undoes the change without rewriting shared history.",
    },
    {
      kind: "text",
      q: "Which command creates and switches to a new branch (modern syntax)? Answer as: git switch -c",
      format: "*** ****** **",
      accept: ["git switch -c", "git switch -c <name>", "git switch -c name"],
      explain: "git switch -c <name> creates and moves to a new branch.",
    },
  ],
};
