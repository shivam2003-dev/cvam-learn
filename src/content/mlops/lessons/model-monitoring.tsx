import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Separate data quality problems, data drift, concept drift and model decay",
    "Compute a Population Stability Index by hand and in code",
    "Choose what to monitor when true labels arrive late",
    "Turn monitoring signals into alerts and retraining decisions",
  ],
  tasks: [
    {
      id: "silent-failure",
      title: "Why models fail quietly",
      body: (
        <>
          <p>
            When a web service breaks, it usually says so. You see 500 errors, timeouts and angry
            users. A model can break while every dashboard stays green. It keeps returning a
            confident number in 40 ms with HTTP 200. The number is just wrong more often than it
            used to be.
          </p>
          <p>
            Think of a model as a map. It was accurate on the day it was drawn. Then roads close and
            new ones open. The map doesn't crash. It simply sends you the wrong way, and you only
            notice when you arrive somewhere odd.
          </p>
          <p>
            <strong>Model monitoring</strong> means watching live behavior so you find out before
            your users or your finance team do. It covers four layers:
          </p>
          <Table
            head={["Layer", "Question", "Example signals"]}
            rows={[
              ["Service", "Is it up and fast?", "Latency, error rate, throughput"],
              ["Data quality", "Is the input valid?", "Nulls, wrong types, out-of-range values"],
              ["Drift", "Does live data still look like training data?", "PSI, KS test, score distribution"],
              ["Model quality", "Are predictions still right?", "Accuracy, recall, calibration, business KPIs"],
            ]}
          />
          <p>
            Read the table from top to bottom. Each layer is harder to measure than the one above,
            and closer to what you actually care about.
          </p>
        </>
      ),
    },
    {
      id: "drift-vocabulary",
      title: "Drift, decay and broken data",
      body: (
        <>
          <p>
            These terms get mixed up, but they point to different causes and different fixes. Write
            a model as learning the relationship P(y | x): the chance of output y given input x.
          </p>
          <Table
            head={["Term", "What changed", "Example", "Usual response"]}
            rows={[
              ["Data quality issue", "A pipeline broke", "A unit changes from dollars to cents", "Fix the pipeline, not the model"],
              ["Data drift", "Inputs: P(x)", "A new region brings younger users", "Investigate, maybe retrain"],
              ["Label drift", "Outcomes: P(y)", "Fraud rate doubles during a sale", "Check thresholds and calibration"],
              ["Concept drift", "The relationship: P(y | x)", "Fraudsters change tactics", "Retrain on recent data"],
            ]}
          />
          <p>
            <strong>Model decay</strong> is the result you see: quality falling over time. Drift is
            one common cause. Decay can be slow, like tastes shifting, or sudden, like a new
            regulation or a competitor's launch.
          </p>
          <p>
            Check data quality first, because it is the cheapest to find and a common surprise.
            If an upstream team renames a field, a serving default may fill it with zeros and the
            model will keep scoring happily. Validate the schema, null rate and value ranges at the
            serving boundary, using the same rules you applied in training.
          </p>
          <Callout tone="warn">
            Drift does not always mean harm. A feature can shift a lot and barely affect the model
            if the model relies on it only a little. Weight drift alerts by feature importance, or
            you will train your team to ignore them.
          </Callout>
        </>
      ),
    },
    {
      id: "psi",
      title: "Measuring drift with PSI",
      body: (
        <>
          <p>
            To detect drift, compare two samples: a <strong>reference</strong> window, usually
            training data, and a <strong>live</strong> window, such as the last 24 hours. A common
            score is the <strong>Population Stability Index</strong> (PSI). Split the reference data
            into buckets, measure the share of each sample in each bucket, then sum:
          </p>
          <Formula>PSI = Σ (actual% − expected%) × ln(actual% ÷ expected%)</Formula>
          <p>
            A worked example with four buckets of equal size in the reference data:
          </p>
          <Table
            head={["Bucket", "Expected", "Actual", "Term"]}
            rows={[
              ["1", "0.25", "0.10", "−0.15 × ln(0.40) = 0.1374"],
              ["2", "0.25", "0.20", "−0.05 × ln(0.80) = 0.0112"],
              ["3", "0.25", "0.30", "0.05 × ln(1.20) = 0.0091"],
              ["4", "0.25", "0.40", "0.15 × ln(1.60) = 0.0705"],
            ]}
          />
          <p>
            The terms add up to a PSI of about <strong>0.23</strong>. Every term is positive, because
            the difference and the log always share the same sign. A widely used rule of thumb
            reads like this:
          </p>
          <Table
            head={["PSI", "Reading"]}
            rows={[
              ["Under 0.1", "Little change"],
              ["0.1 to 0.25", "Moderate shift, investigate"],
              ["Over 0.25", "Large shift, act"],
            ]}
          />
          <p>So 0.23 is moderate and close to the action line. In code:</p>
          <pre>
            <code>{`import numpy as np

def psi(reference, live, bins=10, eps=1e-6):
    # Bucket edges come from the reference sample only
    edges = np.quantile(reference, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf

    ref_counts, _ = np.histogram(reference, bins=edges)
    live_counts, _ = np.histogram(live, bins=edges)

    # eps avoids dividing by zero for empty buckets
    e = np.clip(ref_counts / len(reference), eps, None)
    a = np.clip(live_counts / len(live), eps, None)
    return float(np.sum((a - e) * np.log(a / e)))`}</code>
          </pre>
          <Callout tone="note">
            The Kolmogorov-Smirnov test, available as <code>scipy.stats.ks_2samp</code>, is a common
            alternative for numeric features. Be careful with large samples: with millions of rows
            it flags tiny, harmless differences as significant. PSI thresholds and a look at the
            actual distributions are often more useful. These thresholds are conventions, not
            laws, so tune them on your own history.
          </Callout>
        </>
      ),
    },
    {
      id: "delayed-labels",
      title: "When the truth arrives late",
      body: (
        <>
          <p>
            The best signal is real model quality, but you need true labels to compute it. Those
            labels often arrive late, or never. A loan default may take a year to show up. A
            recommendation only gets a label if the user reacts. And when a model blocks a transaction,
            you never learn whether it would have been fraud.
          </p>
          <p>While you wait, use proxies:</p>
          <ul>
            <li>
              <strong>Prediction drift:</strong> watch the distribution of scores. If the share of
              "approve" falls from 70% to 50% with no business reason, look into it.
            </li>
            <li>
              <strong>Input drift:</strong> run PSI on the most important features.
            </li>
            <li>
              <strong>Business metrics:</strong> click rate, conversion rate or manual review rate
              are often available within hours.
            </li>
            <li>
              <strong>Human review:</strong> label a small random sample each week. Keep it random,
              or the estimate will be biased.
            </li>
          </ul>
          <p>
            When labels do arrive, join them to the stored predictions by a request ID. This is why
            each prediction should be logged with its model version, features and timestamp. Then
            compute metrics per time window and per segment. A model can hold steady overall while
            it fails badly for one country or device type.
          </p>
          <p>
            A quick example, with illustrative numbers. Last week had 50 confirmed fraud cases and
            the model caught 40, so recall is 40 ÷ 50 = 80%. The launch baseline was 90%. That is a
            drop of 10 points, and the actual change matters more than any drift score.
          </p>
        </>
      ),
    },
    {
      id: "acting",
      title: "From alert to action",
      body: (
        <>
          <p>
            A metric nobody acts on is decoration. For each signal, write down in advance who owns
            it and what happens next:
          </p>
          <Table
            head={["Signal", "Severity", "First action"]}
            rows={[
              ["Null rate jumps on a key feature", "Page someone", "Check the upstream pipeline; fall back if needed"],
              ["PSI over 0.25 on a top feature", "Ticket", "Compare distributions and find the cause"],
              ["Recall below the agreed floor", "Page someone", "Roll back or retrain, then validate"],
              ["Slow rise in score drift", "Weekly review", "Add to the retraining discussion"],
            ]}
          />
          <p>
            Retraining is not always the answer. If the input is broken, retraining teaches the model
            to accept broken data. Find the cause first. When retraining is right, run the new model
            through the same validation as any release, then roll it out gradually with shadow,
            canary or A/B deployment.
          </p>
          <Callout tone="tip">
            Start small. Log every prediction with its model version, check schema and null rates,
            and run PSI on the top ten features. That catches many common problems. Add
            segments and fancier tests once these are trusted.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A model can fail while every service metric stays healthy.",
    "Data quality issues, data drift, label drift and concept drift have different causes and fixes.",
    "PSI compares bucket shares between a reference and a live sample.",
    "Late labels call for proxies, such as prediction drift and business metrics, plus stored predictions to join later.",
    "Each alert needs an owner and a planned action, and retraining is only one option.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Fraudsters change tactics, so transactions that look the same now have a different chance of being fraud. What is this?",
      options: ["A data quality issue", "Concept drift", "A latency regression", "Overprovisioning"],
      answer: 1,
      explain: "The relationship between inputs and the outcome has changed, which is concept drift.",
    },
    {
      kind: "mcq",
      q: "A feature's null rate jumps from 1% to 60% overnight. What should you do first?",
      options: [
        "Retrain the model on the latest data",
        "Raise the decision threshold",
        "Investigate the upstream data pipeline",
        "Ignore it unless accuracy has fallen",
      ],
      answer: 2,
      explain: "A sudden jump points to a broken pipeline. Retraining on bad data would make things worse.",
    },
    {
      kind: "mcq",
      q: "A feature has a PSI of 0.05. Using the common rule of thumb, how do you read it?",
      options: ["Little change", "Moderate shift", "Large shift", "The model has failed"],
      answer: 0,
      explain: "Values under 0.1 usually mean little change.",
    },
    {
      kind: "text",
      q: "Of 200 true fraud cases last week, a model caught 150. What was its recall, in percent? Digits only.",
      format: "**",
      accept: ["75", "75%"],
      explain: "150 ÷ 200 = 0.75, which is 75%.",
    },
    {
      kind: "text",
      q: "A bucket has an expected share of 0.5 and an actual share of 0.5. What does this bucket add to PSI?",
      format: "*",
      accept: ["0", "0.0", "zero"],
      explain: "The difference is 0 and ln(1) is 0, so the term is 0.",
    },
  ],
};
