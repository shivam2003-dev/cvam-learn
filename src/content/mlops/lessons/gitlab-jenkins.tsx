import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Map CI concepts across GitHub Actions, GitLab and Jenkins",
    "Read a .gitlab-ci.yml file and a declarative Jenkinsfile",
    "Attach GPU workloads to the right runner or agent",
    "Estimate the cost of keeping CI GPUs running",
  ],
  tasks: [
    {
      id: "problem",
      title: "Your next team may not use GitHub Actions",
      body: (
        <>
          <p>
            Many companies have run CI for years, long before any ML arrived. They may host code on
            GitLab, or have hundreds of Jenkins jobs running in their own data center. As an MLOps
            engineer you rarely choose. You join a team and add ML steps to whatever already exists.
          </p>
          <p>
            The good news is that the ideas carry over. Every CI system has triggers, ordered steps,
            workers and artifacts. Learning a new one is like moving between car brands: the controls
            sit in different places, but they still steer and brake.
          </p>
          <Table
            head={["Concept", "GitHub Actions", "GitLab CI/CD", "Jenkins"]}
            rows={[
              ["Definition file", ".github/workflows/*.yml", ".gitlab-ci.yml", "Jenkinsfile"],
              ["Language", "YAML", "YAML", "Groovy-based DSL"],
              ["Worker", "Runner", "Runner", "Agent"],
              ["Unit of work", "Job and steps", "Job and script", "Stage and steps"],
              ["Ordering", "needs", "stages and needs", "Order of stages"],
              ["Select a worker", "runs-on labels", "tags", "agent label"],
              ["Keep files", "upload-artifact", "artifacts", "archiveArtifacts"],
            ]}
          />
        </>
      ),
    },
    {
      id: "gitlab",
      title: "GitLab CI/CD",
      body: (
        <>
          <p>
            <strong>GitLab</strong> is a single platform for code hosting, CI/CD, a container registry
            and more, and it's available as a service or self-managed. A pipeline is defined by one
            file at the repository root. <strong>Stages</strong> run in order, and jobs in the same
            stage run in parallel.
          </p>
          <pre>
            <code>{`stages:
  - test
  - train
  - gate

default:
  image: python:3.12-slim

variables:
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"

cache:
  key:
    files:
      - pyproject.toml
  paths:
    - .cache/pip

unit-tests:
  stage: test
  script:
    - pip install -e ".[dev]"
    - pytest -q
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

train-sample:
  stage: train
  tags:
    - gpu
  script:
    - pip install -e ".[dev]"
    - dvc pull data/sample.dvc
    - python -m churn_model.train --data data/sample --out out
  artifacts:
    paths:
      - out/
    expire_in: 1 week

quality-gate:
  stage: gate
  script:
    - python scripts/check_metrics.py out/metrics.json`}</code>
          </pre>
          <p>What's different from GitHub Actions:</p>
          <ul>
            <li>
              <strong>Containers are the norm.</strong> <code>image</code> sets the Docker image for
              each job on Docker or Kubernetes runners. Lock this to a tagged image with your
              dependencies, and jobs start faster.
            </li>
            <li>
              <strong>Artifacts flow forward automatically.</strong> <code>quality-gate</code> gets{" "}
              <code>out/</code> from the earlier stage with no download step.
            </li>
            <li>
              <strong>A merge request</strong> is GitLab's name for a pull request.
            </li>
            <li>
              <strong>Predefined variables</strong> such as <code>CI_COMMIT_SHA</code> are built in.
              Tag your models and images with that value for lineage.
            </li>
            <li>
              <strong>Rules</strong> decide when a job runs. Without a matching rule, it's left out.
            </li>
          </ul>
          <p>
            Secrets go under CI/CD variables in the project settings, where they can be masked and
            limited to protected branches. Job <code>tags</code> pick the runner, so a{" "}
            <code>gpu</code> tag sends the job to a machine you've registered with that tag.
          </p>
          <Callout tone="tip">
            GitLab's <code>parallel:matrix</code> keyword fans a job out over several values, which is
            handy for training a few small model variants in one pipeline.
          </Callout>
        </>
      ),
    },
    {
      id: "jenkins",
      title: "Jenkins",
      body: (
        <>
          <p>
            <strong>Jenkins</strong> is an open source automation server that you host yourself. A
            central <strong>controller</strong> schedules work, and <strong>agents</strong> do it.
            Almost everything beyond the core comes from <strong>plugins</strong>. That gives it huge
            flexibility and a real maintenance load.
          </p>
          <p>
            A pipeline lives in a <code>Jenkinsfile</code> in your repository. This is the declarative
            style, which is the easiest to read:
          </p>
          <pre>
            <code>{`pipeline {
  agent none

  options {
    timeout(time: 2, unit: 'HOURS')
  }

  stages {
    stage('Test') {
      agent { docker { image 'python:3.12-slim' } }
      steps {
        sh '''
          python -m venv .venv
          . .venv/bin/activate
          pip install -e ".[dev]"
          pytest -q
        '''
      }
    }

    stage('Train') {
      agent { label 'gpu' }
      steps {
        withCredentials([
          string(credentialsId: 'mlflow-token',
                 variable: 'MLFLOW_TRACKING_TOKEN')
        ]) {
          sh 'bash scripts/train.sh'
        }
        archiveArtifacts artifacts: 'out/**'
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed'
    }
  }
}`}</code>
          </pre>
          <ul>
            <li>
              <code>agent none</code> at the top lets each stage choose its own machine: a container
              for tests, a GPU box for training.
            </li>
            <li>
              <code>sh</code> runs shell commands, so a failing command fails the stage.
            </li>
            <li>
              <code>withCredentials</code> exposes a stored secret only inside its block.
            </li>
            <li>
              <code>post</code> runs after the pipeline, which is the place for notifications and
              cleanup.
            </li>
          </ul>
          <Callout tone="warn">
            Agents often keep their workspace between builds, unlike a fresh hosted runner. Old files
            can leak into a new run, so a model may look like it trained when it was left over from
            last time. Clean the workspace, or run stages in containers.
          </Callout>
          <p>
            Keep the logic in scripts, not in the <code>Jenkinsfile</code>. A step such as{" "}
            <code>bash scripts/train.sh</code> can run on a laptop, and it survives a move to a
            different CI system. Scripts are what make the concepts portable.
          </p>
        </>
      ),
    },
    {
      id: "gpu-cost",
      title: "Worked example: the idle GPU problem",
      body: (
        <>
          <p>
            Self-hosted CI brings a cost that's easy to miss. A cloud GPU machine used as a permanent
            runner bills for every hour it exists, working or not.
          </p>
          <Formula>utilization = busy hours ÷ total hours</Formula>
          <p>
            Take an illustrative machine at $2 per hour, running all month. CI uses it for 60 hours.
            Prices vary widely, so use your provider's current figures.
          </p>
          <pre>
            <code>{`Always on:  24 × 30 = 720 hours × $2 = $1,440 per month
On demand:  60 hours × $2 = $120 per month
Utilization: 60 ÷ 720 ≈ 8.3%`}</code>
          </pre>
          <p>
            So on-demand capacity would save $1,320 a month here, less whatever startup overhead it
            adds. Both GitLab runners and Jenkins can create workers on demand, through autoscaling
            setups or plugins for Kubernetes and cloud providers. You give up a few minutes of startup
            time per job. If the GPU hardware is one you own and already paid for, the sums change.
          </p>
        </>
      ),
    },
    {
      id: "choose",
      title: "Choosing and living with one",
      body: (
        <>
          <Table
            head={["System", "Strengths", "Trade-offs"]}
            rows={[
              ["GitHub Actions", "Native to GitHub, large action marketplace", "Self-hosted GPU setup is on you"],
              ["GitLab CI/CD", "All-in-one platform, good self-managed option", "Best when your code is on GitLab too"],
              ["Jenkins", "Very flexible, runs anywhere, including air-gapped sites", "You run it, patch it and manage plugins"],
            ]}
          />
          <p>
            If your code is already on a platform, use its CI. Adding a second system for ML alone
            means two sets of credentials, runners and habits. Jenkins is most common where it already
            exists, or where rules or network isolation require full control.
          </p>
          <Callout tone="note">
            Long-running Jenkins and GitLab installations hold secrets and can reach production. Treat
            them as critical systems: keep them patched, limit who can edit pipelines, and review
            plugins before you install them.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Every CI system has triggers, ordered steps, workers and artifacts.",
    "GitLab defines pipelines in .gitlab-ci.yml, with stages and runner tags.",
    "Jenkins uses a controller, agents, plugins and a Jenkinsfile.",
    "Keep logic in scripts, so pipelines stay portable.",
    "Always-on GPU runners waste money at low utilization, so scale them on demand.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In GitLab CI/CD, how do you send a job to a machine with a GPU?",
      options: [
        "Set the job's stage to gpu",
        "Give the job a tag that matches a registered runner",
        "Rename the job",
        "Add a Jenkinsfile",
      ],
      answer: 1,
      explain: "Job tags pick which runners can run the job.",
    },
    {
      kind: "mcq",
      q: "Why should pipeline logic live in scripts, not in the Jenkinsfile?",
      options: [
        "Jenkins can't run long pipelines",
        "Scripts can run locally and move between CI systems",
        "Scripts are always faster",
        "Groovy can't run shell commands",
      ],
      answer: 1,
      explain: "A thin pipeline calling scripts is easier to test and easier to migrate.",
    },
    {
      kind: "text",
      q: "A runner bills $3 per hour and stays on for a 30-day month. What is the monthly cost in dollars?",
      format: "****",
      accept: ["2160", "2,160", "$2160", "$2,160"],
      explain: "24 × 30 = 720 hours, and 720 × $3 = $2,160.",
    },
    {
      kind: "text",
      q: "A machine is busy for 72 of 720 hours. What is its utilization as a percentage?",
      format: "**",
      accept: ["10", "10%"],
      explain: "72 ÷ 720 = 0.10, or 10%.",
    },
  ],
};
