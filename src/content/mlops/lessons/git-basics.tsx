import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Easy",
  objectives: [
    "Explain commits, the staging area and branches",
    "Choose the right command to undo a mistake",
    "Keep data, models and secrets out of a repository",
    "Link every trained model to the exact commit that built it",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem Git solves for ML",
      body: (
        <>
          <p>
            Picture a folder containing <code>train_final.py</code>,{" "}
            <code>train_final_v2.py</code> and <code>train_final_v2_REAL.py</code>. Nobody knows which
            one produced the model running in production. If that model starts misbehaving, you
            can't rebuild it, and you can't compare it with what changed.
          </p>
          <p>
            <strong>Git</strong> is a version control system: it records the history of a project,
            so you can see what changed, who changed it and why, and return to any earlier state.
            For an MLOps engineer it does one more job. A commit is the anchor that ties code to a
            model. CI runs from it, DVC builds on it, and an experiment tracker records it.
          </p>
          <p>
            Think of commits as save points in a game. Before a risky change, you save. If things go
            badly, you load the earlier save. Branches let you try a different route without
            touching your main playthrough.
          </p>
        </>
      ),
    },
    {
      id: "model",
      title: "How Git thinks",
      body: (
        <>
          <p>
            A <strong>commit</strong> is a snapshot of tracked files, plus an author, a message and
            a link to its parent commit. Each one gets a hash, a 40-character ID computed from its
            content, such as <code>9fceb02d0ae598e95dc970b74767f19372d61af8</code>. Change anything
            and the hash changes, so a hash identifies one exact state of the code.
          </p>
          <p>Work moves through three places:</p>
          <Table
            head={["Area", "What it holds", "Moved by"]}
            rows={[
              ["Working directory", "The files you're editing", "Your editor"],
              ["Staging area", "Changes chosen for the next commit", <code key="a">git add</code>],
              ["Repository", "Permanent commit history", <code key="b">git commit</code>],
            ]}
          />
          <p>
            The staging area exists so a commit can hold one logical change, even if you've touched
            several things. A <strong>branch</strong> is just a movable label pointing at a commit,
            which is why creating one is instant. A <strong>remote</strong>, usually called{" "}
            <code>origin</code>, is a shared copy on a server such as GitHub.
          </p>
          <p>A typical day looks like this:</p>
          <pre>
            <code>{`git switch main
git pull                                # get the latest shared work
git switch -c fix-feature-nulls         # create a branch

# ...edit files...

git status                              # what changed?
git diff                                # show the exact lines
git add src/churn_model/features.py
git commit -m "Treat missing tenure as zero"
git push -u origin fix-feature-nulls`}</code>
          </pre>
          <p>
            Merging brings a branch's work into another branch. If two people changed the same lines,
            Git stops with a <strong>merge conflict</strong>. You edit the file to the correct
            result, then <code>git add</code> and <code>git commit</code>. <code>git rebase</code>{" "}
            instead replays your commits on top of another branch, which gives a straighter history.
          </p>
          <Callout tone="warn">
            Rebase rewrites commits and gives them new hashes. Use it on your own unshared branches,
            not on branches other people are working from.
          </Callout>
        </>
      ),
    },
    {
      id: "undo",
      title: "Undoing things safely",
      body: (
        <>
          <p>Each kind of mistake has its own tool. The main question is whether the work has been shared.</p>
          <Table
            head={["Situation", "Command", "Safe once pushed?"]}
            rows={[
              ["Discard edits to a file", <code key="a">git restore file.py</code>, "Yes, but the edits are lost"],
              ["Unstage a file", <code key="b">git restore --staged file.py</code>, "Yes"],
              ["Fix the last commit's message or content", <code key="c">git commit --amend</code>, "No, it rewrites history"],
              ["Undo a commit that's already shared", <code key="d">git revert abc1234</code>, "Yes, it adds a new commit"],
              ["Move a branch back to an earlier commit", <code key="e">git reset --hard abc1234</code>, "No, and it discards work"],
            ]}
          />
          <p>
            When production breaks, prefer <code>git revert</code>. It keeps the history honest and
            needs no force-push. If you lose a commit locally, <code>git reflog</code> lists where
            your branch has recently pointed, and often lets you recover it.
          </p>
        </>
      ),
    },
    {
      id: "what-not",
      title: "What stays out of Git",
      body: (
        <>
          <p>
            Git keeps every version of every file forever, and each clone downloads that history.
            Model weights compress poorly, so here's what happens if you commit them. A 200 MB model
            retrained weekly adds:
          </p>
          <Formula>52 × 200 MB = 10,400 MB ≈ 10.4 GB per year</Formula>
          <p>
            Every new clone, including each CI run that needs full history, carries that weight. This
            example is illustrative and ignores compression, but the trend holds. Deleting the file
            later won't help, because it stays in history.
          </p>
          <p>
            So code and small config go in Git, and large files go elsewhere. The DVC lesson covers
            how to version them. A <code>.gitignore</code> file tells Git what to skip:
          </p>
          <pre>
            <code>{`data/
models/
*.pt
*.ckpt
*.parquet
mlruns/
.env
.venv/
__pycache__/
.ipynb_checkpoints/`}</code>
          </pre>
          <Callout tone="warn" title="Secrets">
            If an API key is committed, deleting it in the next commit doesn't remove it. It's still
            in history. Treat it as leaked and rotate the key straight away. Keep secrets in
            environment variables or a secrets manager, and add a scanner such as gitleaks to your
            checks.
          </Callout>
          <Callout tone="tip">
            Notebooks are JSON files, and their saved outputs create noisy diffs. A tool like{" "}
            <code>nbstripout</code> removes outputs on commit, so reviews show only real changes.
          </Callout>
        </>
      ),
    },
    {
      id: "lineage",
      title: "Tying models to commits",
      body: (
        <>
          <p>Git gives you lineage only if you record the commit at training time:</p>
          <pre>
            <code>{`import subprocess


def git_state() -> dict:
    commit = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], text=True
    ).strip()
    dirty = subprocess.check_output(
        ["git", "status", "--porcelain"], text=True
    ).strip()
    return {"commit": commit, "dirty": bool(dirty)}`}</code>
          </pre>
          <p>
            Save this with the model's metadata. A <strong>dirty</strong> run had uncommitted changes,
            so the commit alone can't reproduce it. Many teams block dirty runs from reaching the
            model registry. MLflow records the commit automatically in many setups, but it's worth
            confirming that it does in yours.
          </p>
          <p>
            A <strong>tag</strong> gives a commit a permanent, readable name, which suits releases.
            Tags aren't pushed by default, so push them explicitly:
          </p>
          <pre>
            <code>{`git tag -a churn-v3 -m "Churn model v3, trained on October data"
git push origin churn-v3`}</code>
          </pre>
          <p>
            <code>git bisect</code> is a good friend when quality drops and nobody knows why. You mark
            one good and one bad commit, and Git walks you through a binary search. Each test halves
            the range, so:
          </p>
          <Formula>tests needed ≈ log₂(number of commits)</Formula>
          <p>
            For 128 commits, log₂(128) = 7, so about 7 test runs find the commit that broke things.
          </p>
          <pre>
            <code>{`git bisect start
git bisect bad                # the current commit is broken
git bisect good churn-v2      # this tag was fine
# Git checks out a middle commit. Test it, then:
git bisect good               # or: git bisect bad
git bisect reset              # finish and return to your branch`}</code>
          </pre>
        </>
      ),
    },
  ],
  takeaways: [
    "A commit is a snapshot with a hash that identifies one exact state of the code.",
    "Use git revert for shared mistakes, since it doesn't rewrite history.",
    "Keep data, model weights and secrets out of Git. A secret once committed is leaked.",
    "Record the commit hash and dirty state with every trained model.",
    "git bisect finds the breaking commit in about log₂(n) tests.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A bad commit is already on the shared main branch. What's the safest way to undo it?",
      options: ["git reset --hard", "git revert", "git commit --amend", "Delete the repository"],
      answer: 1,
      explain: "git revert adds a new commit that undoes the change, without rewriting shared history.",
    },
    {
      kind: "mcq",
      q: "You committed an API key, then removed it in the next commit. What now?",
      options: [
        "Nothing, it's gone",
        "Make the repository private and carry on",
        "Rotate the key, because it's still in history",
        "Rename the file",
      ],
      answer: 2,
      explain: "History keeps the old commit. Assume the key is exposed and replace it.",
    },
    {
      kind: "text",
      q: "About how many tests does git bisect need to search 1,024 commits?",
      format: "**",
      accept: ["10"],
      explain: "log₂(1,024) = 10, because 2 to the power 10 is 1,024.",
    },
    {
      kind: "text",
      q: "A 500 MB model is committed to Git every week for 10 weeks. Ignoring compression, how many GB does it add to history?",
      format: "*",
      accept: ["5", "5 gb", "5gb"],
      explain: "10 × 500 MB = 5,000 MB, which is 5 GB.",
    },
  ],
};
