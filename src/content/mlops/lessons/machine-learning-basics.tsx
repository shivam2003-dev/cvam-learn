import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Easy",
  objectives: [
    "Separate supervised and unsupervised learning, and say what each needs in production",
    "Walk through one step of gradient descent by hand",
    "Recognize overfitting from training and validation results",
    "Explain why preprocessing must ship with the model",
  ],
  tasks: [
    {
      id: "what-is-ml",
      title: "From rules to learned behavior",
      body: (
        <>
          <p>
            Imagine writing rules to detect fraud. You start with "flag orders over 1,000". Then
            come exceptions, then exceptions to the exceptions. Soon nobody can maintain it, and
            fraudsters change tactics anyway.
          </p>
          <p>
            Machine learning takes a different route. You show a program many past examples, and it
            finds the pattern itself. It's like a student who learns from past exam papers rather
            than memorizing a rulebook.
          </p>
          <p>A few terms come up constantly:</p>
          <ul>
            <li><strong>Feature:</strong> an input value, such as order amount.</li>
            <li><strong>Label:</strong> the right answer for an example, such as "fraud".</li>
            <li><strong>Model:</strong> a function whose behavior depends on learned numbers.</li>
            <li><strong>Parameters:</strong> those learned numbers, also called weights.</li>
            <li><strong>Hyperparameters:</strong> settings you choose before training.</li>
            <li><strong>Training:</strong> finding good parameters from data.</li>
            <li><strong>Inference:</strong> using a trained model to predict on new data.</li>
          </ul>
          <p>
            For MLOps, this changes what "the software" is. Behavior now comes from code plus data
            plus parameters. A change to any of them changes the system, which is why all three
            need versions.
          </p>
        </>
      ),
    },
    {
      id: "types",
      title: "The main types of learning",
      body: (
        <Table
          head={["Type", "Learns from", "Examples", "What it means for you"]}
          rows={[
            [
              "Supervised",
              "Labeled examples",
              "Regression (predict a number), classification (predict a category)",
              "You need a labeling source, and labels may arrive weeks late",
            ],
            [
              "Unsupervised",
              "Unlabeled data",
              "Clustering such as k-means, anomaly detection, dimensionality reduction",
              "No simple right answer, so evaluation is harder",
            ],
            [
              "Reinforcement",
              "Rewards from actions",
              "Game playing, some recommendation and control systems",
              "Needs a simulator or careful live experiments",
            ],
          ]}
        />
      ),
    },
    {
      id: "training",
      title: "How training works",
      body: (
        <>
          <p>Most training follows the same loop:</p>
          <ol>
            <li>Make a prediction with the current parameters.</li>
            <li>Measure how wrong it was. This score is the <strong>loss</strong>.</li>
            <li>Work out which way each parameter should move to lower the loss.</li>
            <li>Move it a little, then repeat.</li>
          </ol>
          <p>
            Step 3 uses the gradient, and the method is called <strong>gradient descent</strong>.
            Picture walking downhill in fog. You can't see the valley, but you can feel the slope
            under your feet.
          </p>
          <Formula>new weight = weight − learning rate × gradient</Formula>
          <p>
            Here's a tiny worked example. The model is <code>prediction = w × x</code>, with one
            weight. We have one example, x = 2 and y = 4, so the right answer is w = 2. The loss is
            the squared error, and its gradient for this example works out to 8w − 16. We start at
            w = 0 with a learning rate of 0.1.
          </p>
          <Table
            head={["Step", "w", "Prediction", "Loss", "Gradient", "Next w"]}
            rows={[
              ["1", "0", "0", "16", "−16", "0 − 0.1 × (−16) = 1.6"],
              ["2", "1.6", "3.2", "0.64", "−3.2", "1.6 − 0.1 × (−3.2) = 1.92"],
              ["3", "1.92", "3.84", "0.0256", "−0.64", "1.92 − 0.1 × (−0.64) = 1.984"],
            ]}
          />
          <p>
            The loss falls quickly, and w closes in on 2. Real models repeat this over millions of
            weights. A learning rate that's too high overshoots, and one that's too low wastes
            compute. One full pass through the training data is an <strong>epoch</strong>.
          </p>
        </>
      ),
    },
    {
      id: "overfitting",
      title: "Overfitting and data splits",
      body: (
        <>
          <p>
            A student who memorizes past papers scores perfectly on those papers and fails on new
            questions. A model can do the same. <strong>Overfitting</strong> means it learned the
            noise in its training data rather than the general pattern.{" "}
            <strong>Underfitting</strong> means it's too simple to learn the pattern at all.
          </p>
          <p>To catch this, split your data into three parts:</p>
          <ul>
            <li><strong>Training set:</strong> the model learns from it.</li>
            <li><strong>Validation set:</strong> you tune hyperparameters on it.</li>
            <li><strong>Test set:</strong> you touch it once, for a final honest score.</li>
          </ul>
          <Table
            head={["Train score", "Validation score", "Diagnosis", "Typical fix"]}
            rows={[
              ["0.70", "0.69", "Underfitting", "Better features or a stronger model"],
              ["0.99", "0.72", "Overfitting", "More data, regularization, early stopping"],
              ["0.91", "0.89", "Healthy", "Move on to the test set"],
            ]}
          />
          <p>
            The scores above are illustrative. <strong>Regularization</strong> means penalizing
            complexity. <strong>Early stopping</strong> means ending training when validation
            results stop improving.
          </p>
        </>
      ),
    },
    {
      id: "production-view",
      title: "What you actually ship",
      body: (
        <>
          <p>
            The artifact isn't only the weights. It also includes every step that turned raw data
            into features. If training scales a value one way and the live service scales it
            another way, predictions go wrong with no error. This is{" "}
            <strong>training-serving skew</strong>, and it's among the most common production ML
            bugs.
          </p>
          <p>The simplest defense is to bundle preprocessing and the model together:</p>
          <pre>
            <code>{`from joblib import dump
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X_train, y_train)

print("test accuracy:", model.score(X_test, y_test))
dump(model, "model.joblib")`}</code>
          </pre>
          <p>
            Here <code>stratify=y</code> keeps the class balance equal in both splits, and{" "}
            <code>random_state</code> makes the split repeatable. The saved file holds the scaler
            settings learned from training data, so the service can't drift from them.
          </p>
          <Callout tone="tip">
            Ask data scientists two questions early. Where do the labels come from, and how long do
            they take to arrive? The answers decide how fast you can detect a bad model and how
            often you can retrain.
          </Callout>
          <p>
            A model is also a snapshot of the past. As the world changes, its accuracy decays. That
            makes retraining a routine operation, not a one-off event, and much of MLOps exists to
            make it safe and boring.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A model is a function whose behavior comes from learned parameters.",
    "Supervised learning needs labels, and label delay shapes your whole system.",
    "Training repeats one loop: predict, measure the loss, follow the gradient, update.",
    "A high train score with a low validation score means overfitting.",
    "Ship preprocessing with the model to avoid training-serving skew.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A model scores 0.99 on training data and 0.70 on validation data. What's the most likely problem?",
      options: ["Underfitting", "Overfitting", "A slow GPU", "The learning rate is exactly right"],
      answer: 1,
      explain: "A large gap between the two scores means the model memorized its training data.",
    },
    {
      kind: "mcq",
      q: "Grouping customers with k-means, with no labels, is an example of which type of learning?",
      options: ["Supervised", "Reinforcement", "Unsupervised", "Transfer"],
      answer: 2,
      explain: "Clustering finds structure in data without any labels.",
    },
    {
      kind: "text",
      q: "A weight is 3, the gradient is 10 and the learning rate is 0.1. What is the new weight?",
      format: "*",
      accept: ["2", "2.0"],
      explain: "3 − 0.1 × 10 = 2.",
    },
    {
      kind: "text",
      q: "Which data split should you use only once, for the final honest score?",
      format: "****",
      accept: ["test", "test set"],
      explain: "If you tune against the test set, its score stops being an honest estimate.",
    },
    {
      kind: "mcq",
      q: "Features are computed differently in the training pipeline and the live service. What's this called?",
      options: ["Backpropagation", "Regularization", "Training-serving skew", "Early stopping"],
      answer: 2,
      explain: "Skew means the model sees different inputs live than it saw in training.",
    },
  ],
};
