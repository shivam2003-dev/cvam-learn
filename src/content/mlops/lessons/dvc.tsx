import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Medium",
  objectives: [
    "Explain how DVC versions large files without storing them in Git",
    "Track a dataset, push it to remote storage and restore an old version",
    "Define a pipeline that reruns only what changed",
    "Estimate how much storage a dataset update will add",
  ],
  tasks: [
    {
      id: "problem",
      title: "Git can't hold your data",
      body: (
        <>
          <p>
            A model is the product of code and data, and Git can only handle the first. Large files
            bloat its history. So teams end up with folders like <code>train_oct_clean2/</code> on a
            shared drive. Six months later, nobody can say which folder trained which model.
          </p>
          <p>
            <strong>DVC</strong> (Data Version Control) closes that gap. It's an open source
            command-line tool that works alongside Git. The trick is simple: the big file goes to
            cheap storage, and Git keeps a tiny pointer to it.
          </p>
          <p>
            Think of a coat check. You hand over a bulky coat and get a small numbered ticket. The
            ticket fits in your pocket, and it gets you exactly that coat back. Git holds the ticket;
            object storage holds the coat.
          </p>
          <Table
            head={["Item", "Lives in", "Versioned by"]}
            rows={[
              ["Code and params.yaml", "Git", "Git"],
              ["Small .dvc pointer files and dvc.lock", "Git", "Git"],
              ["Datasets and model files", "Local cache and remote storage", "DVC, by content hash"],
            ]}
          />
        </>
      ),
    },
    {
      id: "track",
      title: "Tracking data",
      body: (
        <>
          <p>
            DVC installs from pip. Add an extra for your storage type, such as{" "}
            <code>dvc[s3]</code>, <code>dvc[gs]</code> or <code>dvc[azure]</code>.
          </p>
          <pre>
            <code>{`pip install "dvc[s3]"

dvc init                                  # inside an existing Git repo
git commit -m "Initialize DVC"

dvc add data/train                        # start tracking a folder
git add data/train.dvc data/.gitignore
git commit -m "Track training data v1"

dvc remote add -d storage s3://acme-ml/dvc
git add .dvc/config
git commit -m "Configure DVC remote"

dvc push                                  # upload the data
git push`}</code>
          </pre>
          <p>
            <code>dvc add</code> hashes the data, moves it into a local cache at{" "}
            <code>.dvc/cache</code>, keeps a usable copy or link in your workspace and tells Git to
            ignore the original. The pointer it leaves, <code>data/train.dvc</code>, looks like this:
          </p>
          <pre>
            <code>{`outs:
- md5: 3863d0e317dee0a55c4e59d2ec0eef33.dir
  size: 10000000000
  nfiles: 10000
  hash: md5
  path: train`}</code>
          </pre>
          <p>
            The <strong>hash</strong> is a fingerprint of the content. It's the same for identical
            data and different for any change, so it acts as an exact version ID. A teammate gets the
            data with <code>git pull</code> followed by <code>dvc pull</code>.
          </p>
          <p>Going back in time takes two commands, because the two systems move together:</p>
          <pre>
            <code>{`git checkout churn-v2     # restore code and pointer files
dvc checkout              # make the data match those pointers`}</code>
          </pre>
          <Callout tone="warn">
            The classic mistake is <code>git push</code> without <code>dvc push</code>. Your teammate
            receives a pointer to data that never reached the remote, and <code>dvc pull</code>{" "}
            fails. Add <code>dvc push</code> to your routine, or use DVC's Git hooks through{" "}
            <code>dvc install</code>.
          </Callout>
        </>
      ),
    },
    {
      id: "storage",
      title: "Worked example: what an update costs",
      body: (
        <>
          <p>
            DVC stores content by hash, so identical files are kept once. But it deduplicates{" "}
            <strong>whole files</strong>, not parts of files. That makes the shape of your data
            matter a great deal.
          </p>
          <Formula>storage added ≈ total size of files whose content changed</Formula>
          <p>Take two illustrative layouts of the same 10 GB dataset, updated with 500 MB of new rows.</p>
          <Table
            head={["Layout", "What changes", "Added storage", "Total after update"]}
            rows={[
              ["10,000 files of 1 MB", "500 new files", "500 × 1 MB = 0.5 GB", "10.5 GB"],
              ["One 10 GB CSV", "The whole file gets a new hash", "10.5 GB", "20.5 GB"],
            ]}
          />
          <p>
            Append rows to the single CSV twelve times like that and you'd store a dozen near-copies.
            So keep data in partitioned files, for example one Parquet file per day, and add new
            files rather than rewriting old ones.
          </p>
        </>
      ),
    },
    {
      id: "pipelines",
      title: "Pipelines that rerun only what changed",
      body: (
        <>
          <p>
            DVC can also describe how outputs are made. A <code>dvc.yaml</code> file lists stages with
            their commands, dependencies and outputs. This gives you a <strong>DAG</strong>, a
            directed acyclic graph, meaning steps connected by dependencies with no loops.
          </p>
          <pre>
            <code>{`stages:
  prepare:
    cmd: python src/prepare.py
    deps:
      - src/prepare.py
      - data/raw
    params:
      - prepare.test_size
    outs:
      - data/prepared

  train:
    cmd: python src/train.py
    deps:
      - src/train.py
      - data/prepared
    params:
      - train.lr
      - train.epochs
    outs:
      - models/model.pkl
    metrics:
      - metrics.json:
          cache: false`}</code>
          </pre>
          <p>
            Run it with <code>dvc repro</code>. DVC records the hash of everything in{" "}
            <code>dvc.lock</code>, which you commit to Git. Next time, it compares hashes and skips any
            stage whose inputs haven't changed.
          </p>
          <p>
            Suppose <code>prepare</code> takes 40 minutes and <code>train</code> takes 3 hours
            (illustrative). Change <code>train.lr</code> in <code>params.yaml</code>, and only{" "}
            <code>train</code> reruns, saving 40 minutes. Change <code>data/raw</code>, and both rerun.
          </p>
          <p>
            Setting <code>cache: false</code> on <code>metrics.json</code> keeps that small file in Git,
            so you can compare it across commits:
          </p>
          <pre>
            <code>{`dvc status                # what is out of date?
dvc dag                   # draw the pipeline
dvc params diff main      # which parameters differ from main?
dvc metrics diff main     # how did the metrics move?

dvc exp run -S train.lr=0.01   # run an experiment
dvc exp show                   # compare experiments in a table`}</code>
          </pre>
          <Callout tone="tip">
            Stages must declare every input. If <code>train.py</code> imports{" "}
            <code>src/utils.py</code> and that file isn't under <code>deps</code>, DVC won't notice
            when it changes and will skip a stage that should have rerun.
          </Callout>
        </>
      ),
    },
    {
      id: "choose",
      title: "Where DVC fits",
      body: (
        <>
          <p>In CI, a job authenticates to the storage remote and fetches only what it needs:</p>
          <pre>
            <code>{`dvc pull data/sample.dvc   # just the small sample
dvc repro train`}</code>
          </pre>
          <Table
            head={["Tool", "Best for", "Limitation"]}
            rows={[
              ["Git LFS", "Large binaries tied to a Git host", "No pipelines, and depends on the host's storage"],
              ["DVC", "Files in your own storage, with reproducible pipelines", "Whole-file deduplication, and it's a separate step to learn"],
              ["Warehouse snapshots", "Tabular data already in a warehouse", "Tied to one platform"],
            ]}
          />
          <p>
            DVC isn't a database for live data, and it doesn't schedule anything. Airflow or CI starts
            a pipeline. DVC makes sure the data and each step are reproducible, and an experiment
            tracker such as MLflow can record the results.
          </p>
          <Callout tone="note">
            For strong lineage, log the Git commit along with the model. Since that commit contains
            the <code>.dvc</code> and <code>dvc.lock</code> files, it also pins the exact data.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Git stores small pointers, and object storage holds the real data.",
    "Use dvc add and dvc push to save data, and dvc pull and dvc checkout to restore it.",
    "DVC deduplicates by whole file, so partition data into many files.",
    "dvc.yaml defines a pipeline, and dvc repro reruns only the stages that changed.",
    "A single Git commit can pin code, parameters and data together.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does Git store when DVC tracks a dataset?",
      options: [
        "A compressed copy of the data",
        "A small pointer file containing a content hash",
        "Nothing at all",
        "A list of column names",
      ],
      answer: 1,
      explain: "The .dvc file records the hash, and the data itself goes to the cache and remote.",
    },
    {
      kind: "mcq",
      q: "You changed only a training hyperparameter in params.yaml. What does dvc repro do?",
      options: [
        "Reruns every stage",
        "Reruns only the stages that depend on that parameter, plus anything downstream",
        "Deletes the cache",
        "Does nothing",
      ],
      answer: 1,
      explain: "DVC compares hashes and skips stages whose inputs haven't changed.",
    },
    {
      kind: "text",
      q: "A 2,000-file dataset of 5 MB per file gains 100 new files of 5 MB each. How many MB does the DVC cache grow by?",
      format: "***",
      accept: ["500", "500 mb", "500mb"],
      explain: "Only new content is stored: 100 × 5 MB = 500 MB.",
    },
    {
      kind: "text",
      q: "Which DVC command runs a pipeline and skips stages that are up to date? Two words.",
      format: "*** *****",
      accept: ["dvc repro"],
      explain: "dvc repro compares recorded hashes and reruns only what's needed.",
    },
  ],
};
