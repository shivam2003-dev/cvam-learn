import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain the idea of a local surrogate model",
    "Walk through the steps of LIME, including proximity weighting",
    "Generate and read a LIME explanation in Python",
    "Recognize when a LIME explanation can't be trusted",
  ],
  tasks: [
    {
      id: "the-idea",
      title: "Explaining one decision",
      body: (
        <>
          <p>
            A gradient-boosted model has rejected a loan application. The customer asks why, and so
            does the compliance team. The model is 500 trees, which nobody can read. Accuracy
            numbers don't help either, because they describe the model overall, not this person.
          </p>
          <p>
            <strong>LIME</strong> stands for Local Interpretable Model-agnostic Explanations. Each
            word matters:
          </p>
          <Table
            head={["Word", "Meaning"]}
            rows={[
              ["Local", "Explains one prediction, not the whole model"],
              ["Interpretable", "Uses a simple model that people can read"],
              ["Model-agnostic", "Treats the model as a black box; it only needs predictions"],
            ]}
          />
          <p>
            The idea comes from a familiar fact. The Earth is curved, but your street looks flat. A
            complex model is similar: its decision surface may curve wildly, yet near any one
            point, a straight line is a decent description. LIME finds that local line.
          </p>
          <p>
            A simple model used to mimic a complex one is called a <strong>surrogate</strong>. LIME
            fits a new one for every prediction you explain, and that model is only valid close to
            that point.
          </p>
        </>
      ),
    },
    {
      id: "algorithm",
      title: "How LIME works",
      body: (
        <>
          <p>To explain a prediction for an input x:</p>
          <ol>
            <li>
              <strong>Perturb:</strong> create thousands of variations of x by changing its values.
            </li>
            <li>
              <strong>Ask the black box:</strong> get a prediction for each variation.
            </li>
            <li>
              <strong>Weight:</strong> give variations close to x more weight.
            </li>
            <li>
              <strong>Fit:</strong> train a simple linear model on the weighted samples, keeping
              only a few features.
            </li>
            <li>
              <strong>Read:</strong> the coefficients of that linear model are the explanation.
            </li>
          </ol>
          <p>The weight usually comes from an exponential kernel, where D is distance and σ is the width:</p>
          <Formula>weight = exp(−D² ÷ σ²)</Formula>
          <p>
            Formally, LIME picks the surrogate g that best balances two goals: match the black box
            near x, and stay simple. In the paper's notation:
          </p>
          <Formula>explanation = argmin of L(f, g, π) + Ω(g)</Formula>
          <p>
            Here L measures the weighted mismatch between the black box f and the surrogate g, π is
            the proximity weighting, and Ω is a penalty for complexity, such as too many features.
          </p>
          <p>
            What "change its values" means depends on the data. Each type has its own simple
            representation:
          </p>
          <Table
            head={["Data", "Perturbation", "Explanation unit"]}
            rows={[
              ["Text", "Remove random words", "Words"],
              ["Images", "Gray out random superpixels (patches of similar pixels)", "Image regions"],
              ["Tabular", "Sample values from training statistics", "Features or value ranges"],
            ]}
          />
          <p>
            Text shows the idea most clearly. Say a support classifier marks "refund never arrived"
            as a complaint. LIME builds variants such as "refund arrived", "never arrived" and
            "refund never". Each variant is a row of ones and zeros that records which words were
            kept, and the black box scores every one. If the complaint score collapses whenever
            "never" is missing, then "never" gets a large positive weight in the linear model.
          </p>
          <p>
            This on-and-off form is the <strong>interpretable representation</strong>. The black box
            still sees real text, while the surrogate sees only which pieces were present. That
            split is what lets LIME explain a model whose own features, such as embeddings, mean
            nothing to a human reader.
          </p>
        </>
      ),
    },
    {
      id: "worked-example",
      title: "Worked example: why the weights matter",
      body: (
        <>
          <p>
            Take a one-feature black box, and say we want to explain the prediction at x = 0. It
            rises near 0, then falls far away. We sample four points. With σ² = 2, the kernel gives
            weights of about 0.6 at distance 1 and 0.01 at distance 3.
          </p>
          <Table
            head={["x", "Black box output", "Weight"]}
            rows={[
              ["−1", "0.40", "0.60"],
              ["0", "0.50", "1.00"],
              ["1", "0.60", "0.60"],
              ["3", "0.20", "0.01"],
            ]}
          />
          <p>The slope of a weighted line fit is:</p>
          <Formula>slope = Σ w(x − x̄)(y − ȳ) ÷ Σ w(x − x̄)²</Formula>
          <p>where x̄ and ȳ are the means using the same weights.</p>
          <pre>
            <code>{`No weights (all w = 1):
  x̄ = 0.75, ȳ = 0.425
  slope = −0.475 ÷ 8.75 = −0.05

With weights:
  x̄ = 0.03 ÷ 2.21 = 0.0136, ȳ = 1.102 ÷ 2.21 = 0.4986
  slope = 0.111 ÷ 1.290 = +0.09`}</code>
          </pre>
          <p>
            The sign flips. Without weights, one distant point dominates and suggests that x lowers
            the output. With weights, the fit follows the local behavior, which is rising. Near x =
            0 the true slope is 0.10, and the weighted estimate of 0.09 comes close. That is the
            whole point of proximity weighting.
          </p>
        </>
      ),
    },
    {
      id: "in-python",
      title: "LIME in Python",
      body: (
        <>
          <p>
            The <code>lime</code> package needs only your training data and a function returning
            probabilities:
          </p>
          <pre>
            <code>{`from lime.lime_tabular import LimeTabularExplainer

explainer = LimeTabularExplainer(
    X_train,                      # NumPy array
    feature_names=feature_names,
    class_names=["repaid", "default"],
    mode="classification",
    random_state=42,
)

exp = explainer.explain_instance(
    X_test[0],
    model.predict_proba,
    num_features=5,
    num_samples=5000,
)

print(exp.as_list())   # (feature rule, weight) pairs
print(exp.score)       # R² of the surrogate on the weighted samples`}</code>
          </pre>
          <p>Here's an illustrative output for the "default" class:</p>
          <Table
            head={["Rule", "Weight"]}
            rows={[
              ["debt_ratio > 0.45", "+0.22"],
              ["late_payments > 2", "+0.11"],
              ["income <= 42000", "+0.06"],
              ["years_employed > 5", "−0.05"],
            ]}
          />
          <p>
            Read it like a small sum. If the surrogate's intercept is 0.20, its prediction is 0.20
            + 0.22 + 0.11 + 0.06 − 0.05 = <strong>0.54</strong>. Compare this with the black box's
            actual prediction. A large gap means the surrogate is a poor fit, and the explanation
            shouldn't be trusted.
          </p>
          <p>
            Note the wording, too. These weights show what drives the model's output nearby. They do
            not tell you what causes real-world default.
          </p>
        </>
      ),
    },
    {
      id: "limits",
      title: "Where LIME breaks down",
      body: (
        <>
          <Table
            head={["Problem", "What happens", "What to do"]}
            rows={[
              ["Instability", "Random sampling can change the result between runs", "Repeat with several seeds, raise num_samples"],
              ["Kernel width", "Different widths give different explanations", "Try a few widths and compare"],
              ["Unrealistic samples", "Perturbing features independently creates impossible rows", "Be careful with correlated features"],
              ["Poor local fit", "The boundary is too curved for a line", "Check exp.score and the surrogate's prediction"],
              ["One point only", "It says nothing about the model overall", "Don't generalize from a few explanations"],
            ]}
          />
          <p>A simple stability check:</p>
          <pre>
            <code>{`top_features = []
for seed in range(5):
    explainer = LimeTabularExplainer(
        X_train, feature_names=feature_names,
        mode="classification", random_state=seed,
    )
    exp = explainer.explain_instance(X_test[0], model.predict_proba, num_features=5)
    top_features.append({name for name, _ in exp.as_list()})

print(set.intersection(*top_features))  # rules that appear in every run`}</code>
          </pre>
          <p>If the top features barely overlap between runs, don't show that explanation to anyone.</p>
          <Callout tone="warn">
            Researchers have shown that models can be built to hide bias from perturbation-based
            explainers. Such a model detects the unrealistic samples and behaves innocently on them
            alone. Treat LIME as a debugging aid, and not as proof that a model is fair.
          </Callout>
          <p>
            In MLOps terms, log explanations with the model version, and sample some for review. If
            a clearly irrelevant feature keeps appearing, you may have found data leakage or a broken
            pipeline.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "LIME explains one prediction by fitting a simple model around it.",
    "It's model-agnostic: it only needs inputs and outputs.",
    "Proximity weighting keeps the surrogate focused on local behavior.",
    "Check stability across seeds and the fit of the surrogate before trusting a result.",
    "LIME describes the model's behavior, not real-world causes.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does \"model-agnostic\" mean in LIME?",
      options: [
        "It only works with linear models",
        "It only needs the model's predictions, not its internals",
        "It requires no training data of any kind",
        "It removes the need for a model",
      ],
      answer: 1,
      explain: "LIME treats the model as a black box and only calls its prediction function.",
    },
    {
      kind: "mcq",
      q: "Why are perturbed samples weighted by proximity?",
      options: [
        "To make training faster",
        "So the surrogate describes behavior near the input",
        "To balance the classes",
        "To encrypt the input",
      ],
      answer: 1,
      explain: "The surrogate only needs to be accurate near the point being explained.",
    },
    {
      kind: "mcq",
      q: "Two LIME runs on the same input give different top features. What is the most likely cause?",
      options: [
        "The model was retrained",
        "Random sampling of perturbations",
        "The input changed",
        "The GPU overheated",
      ],
      answer: 1,
      explain: "LIME samples at random, so results vary unless you fix a seed and use enough samples.",
    },
    {
      kind: "text",
      q: "A LIME surrogate has an intercept of 0.30 and weights of +0.20, +0.10 and −0.05. What is its prediction?",
      format: "****",
      accept: ["0.55", ".55"],
      explain: "0.30 + 0.20 + 0.10 − 0.05 = 0.55.",
    },
    {
      kind: "text",
      q: "What is the term for a simple model that imitates a complex one?",
      format: "*********",
      accept: ["surrogate", "surrogate model"],
      explain: "LIME fits a local surrogate around each prediction.",
    },
  ],
};
