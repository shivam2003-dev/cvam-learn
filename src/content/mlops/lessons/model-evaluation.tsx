import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Compute precision, recall and F1 from a confusion matrix",
    "Choose a validation strategy that matches the data",
    "Find and prevent the common forms of data leakage",
    "Turn evaluation results into an automated promotion gate",
  ],
  tasks: [
    {
      id: "why-evaluate",
      title: "Why accuracy isn't enough",
      body: (
        <>
          <p>
            A fraud model reports 99% accuracy. That sounds great, until you learn that 99% of
            transactions are legitimate. A "model" that approves everything scores 99% and catches
            no fraud at all.
          </p>
          <p>
            Evaluation is how you decide whether a model may reach production, so it's an MLOps job
            as much as a data science job. You run it in pipelines, compare it with what's live,
            and block releases on it. A wrong metric, or a flawed test, means you're automating bad
            decisions.
          </p>
        </>
      ),
    },
    {
      id: "classification-metrics",
      title: "Precision, recall and friends",
      body: (
        <>
          <p>
            A <strong>confusion matrix</strong> counts the four possible outcomes of a yes-or-no
            prediction. Take an illustrative 10,000 transactions, where 100 are fraud. The model
            flags 120, and 80 of those are real fraud.
          </p>
          <Table
            head={["", "Actually fraud", "Actually legitimate"]}
            rows={[
              ["Flagged", "80 true positives (TP)", "40 false positives (FP)"],
              ["Not flagged", "20 false negatives (FN)", "9,860 true negatives (TN)"],
            ]}
          />
          <Formula>precision = TP ÷ (TP + FP)</Formula>
          <Formula>recall = TP ÷ (TP + FN)</Formula>
          <Formula>F1 = 2 × precision × recall ÷ (precision + recall)</Formula>
          <pre>
            <code>{`Accuracy:  (80 + 9,860) ÷ 10,000 = 99.4%
Precision: 80 ÷ 120 = 66.7%
Recall:    80 ÷ 100 = 80.0%
F1:        2 × 0.667 × 0.8 ÷ 1.467 = 0.727`}</code>
          </pre>
          <p>
            <strong>Precision</strong> asks: when we raise a flag, how often are we right?{" "}
            <strong>Recall</strong> asks: of all the real cases, how many did we catch? Think of a
            fishing net. A wide net catches more fish (recall) but also more junk (lower precision).
          </p>
          <p>
            Most classifiers output a score, and you choose a cutoff called the{" "}
            <strong>threshold</strong>. Lowering it raises recall and usually lowers precision. The
            right balance is a business decision: a missed fraud and a blocked customer have
            different costs. <strong>ROC AUC</strong> and <strong>PR AUC</strong> summarize
            performance across all thresholds. PR AUC is usually more informative when positives
            are rare.
          </p>
          <p>
            For predicting numbers, use <strong>MAE</strong> (mean absolute error) or{" "}
            <strong>RMSE</strong> (root mean squared error). With errors of 2, −2, 1, −1 and 10:
          </p>
          <pre>
            <code>{`MAE:  (2 + 2 + 1 + 1 + 10) ÷ 5 = 3.2
RMSE: √((4 + 4 + 1 + 1 + 100) ÷ 5) = √22 ≈ 4.69`}</code>
          </pre>
          <p>RMSE squares errors, so it punishes the single big miss much harder.</p>
        </>
      ),
    },
    {
      id: "validation",
      title: "Choosing a validation strategy",
      body: (
        <>
          <p>
            A score only means something if the test mimics real use. The way you split the data
            matters as much as the metric.
          </p>
          <Table
            head={["Strategy", "How it works", "Use when"]}
            rows={[
              ["Holdout", "One fixed train and test split", "Data is plentiful or training is slow"],
              ["K-fold", "Train k times, each time testing on a different slice", "Data is limited and rows are independent"],
              ["Group k-fold", "Keep all rows for one user in the same slice", "One entity has many rows"],
              ["Time-based", "Train on the past, test on the future", "Forecasting, or anything that changes over time"],
            ]}
          />
          <p>
            K-fold costs more compute. Five folds means training five models, so a one-hour
            training job becomes five hours of compute. The spread across folds is a useful bonus:
            it shows how stable the result is.
          </p>
        </>
      ),
    },
    {
      id: "leakage",
      title: "Data leakage",
      body: (
        <>
          <p>
            <strong>Leakage</strong> means information reaches the model during training that it
            won't have at prediction time. It's like taking an exam with the answer sheet: great
            score, nothing learned. Offline results look excellent, then production collapses.
          </p>
          <Table
            head={["Type", "Example", "Fix"]}
            rows={[
              ["Target leakage", "A \"refund issued\" feature used to predict fraud", "Ask if the value exists at prediction time"],
              ["Preprocessing leakage", "Scaling fitted on all data before the split", "Fit preprocessing on training folds only"],
              ["Group leakage", "One patient's scans in both train and test", "Split by entity, not by row"],
              ["Temporal leakage", "Training on rows from after the test period", "Split by time"],
            ]}
          />
          <p>A pipeline fixes preprocessing leakage, because it refits inside each fold:</p>
          <pre>
            <code>{`from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Rows must already be sorted by time.
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

scores = cross_val_score(
    pipe, X, y,
    cv=TimeSeriesSplit(n_splits=5),
    scoring="average_precision",
)
print(scores.mean(), scores.std())`}</code>
          </pre>
          <Callout tone="warn">
            Treat a surprisingly good score as a bug until you've proven otherwise. Check which
            features matter most. A single feature with huge importance is a classic sign of
            leakage.
          </Callout>
        </>
      ),
    },
    {
      id: "release-gates",
      title: "From metrics to release gates",
      body: (
        <>
          <p>
            In a pipeline, evaluation becomes a pass-or-fail check. The new model is the{" "}
            <strong>challenger</strong>, and the live one is the <strong>champion</strong>. Evaluate
            both on the same recent data, because scores from different data can't be compared.
          </p>
          <pre>
            <code>{`def passes_gate(new, champion, max_p95_ms=50):
    return (
        new["recall"] >= champion["recall"]
        and new["precision"] >= champion["precision"] - 0.01
        and new["p95_latency_ms"] <= max_p95_ms
    )`}</code>
          </pre>
          <p>A solid gate looks beyond one headline number:</p>
          <ul>
            <li><strong>Baseline:</strong> beat the champion and a simple rule.</li>
            <li><strong>Slices:</strong> check key groups, such as region or device type.</li>
            <li><strong>Operations:</strong> check latency, memory and model size.</li>
            <li><strong>Calibration:</strong> if scores are used as probabilities, check they match reality.</li>
          </ul>
          <Callout tone="tip">
            A strong overall average can hide a total failure for one group. Slice checks catch this
            before your users do.
          </Callout>
          <p>
            Offline evaluation is only an estimate. A model can win offline and lose on business
            results, because behavior changes when a model goes live. Finish with a shadow
            deployment or an A/B test.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Accuracy misleads on imbalanced data, so use precision, recall and PR AUC.",
    "The threshold trades precision against recall, and the business sets that balance.",
    "Split data the way the model will meet it, by time or by entity where needed.",
    "Leakage produces great offline scores and poor production results.",
    "Automate gates that compare challenger and champion on the same data.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which of these causes data leakage?",
      options: [
        "Fitting a scaler on the full dataset before splitting",
        "Fitting a scaler on the training set only",
        "Using five folds rather than three",
        "Setting a random seed",
      ],
      answer: 0,
      explain: "The scaler has learned from test data, so the test score is no longer honest.",
    },
    {
      kind: "mcq",
      q: "Which validation strategy suits a demand forecasting model?",
      options: ["Random k-fold", "Time-based splits", "Testing on the training data", "No validation"],
      answer: 1,
      explain: "Training on the past and testing on the future mimics how the model is used.",
    },
    {
      kind: "text",
      q: "A model has 30 true positives and 10 false positives. What is its precision, as a decimal?",
      format: "****",
      accept: ["0.75", ".75", "75%", "75"],
      explain: "30 ÷ (30 + 10) = 0.75.",
    },
    {
      kind: "text",
      q: "A model has 45 true positives and 5 false negatives. What is its recall, as a decimal?",
      format: "***",
      accept: ["0.9", ".9", "0.90", "90%", "90"],
      explain: "45 ÷ (45 + 5) = 0.9.",
    },
    {
      kind: "mcq",
      q: "Why should challenger and champion be evaluated on the same data?",
      options: [
        "It uses less storage",
        "Scores from different data aren't directly comparable",
        "The registry requires it",
        "It makes training faster",
      ],
      answer: 1,
      explain: "If the data differs, a score gap may come from the data rather than the model.",
    },
  ],
};
