import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Hard",
  objectives: [
    "Compute Shapley values by hand for a small example",
    "State the properties that make SHAP values attractive",
    "Choose the right SHAP explainer for a model",
    "Read waterfall and summary plots, and avoid the common mistakes",
  ],
  tasks: [
    {
      id: "fair-credit",
      title: "Sharing credit fairly",
      body: (
        <>
          <p>
            Your churn model gives a customer a risk of 0.70. The average customer sits at 0.20. The
            extra 0.50 came from some mix of features, but how much from each? Features interact, so
            a simple one-at-a-time test can give misleading answers. Debt might matter only when
            income is low.
          </p>
          <p>
            Game theory solved a matching problem decades ago. Three colleagues win a contract
            together and need to split the bonus. Each person's contribution depends on who else was
            already in the room. A fair way to split it is to imagine them joining in every possible
            order, then average what each one added.
          </p>
          <p>
            That average is the <strong>Shapley value</strong>, named after Lloyd Shapley.{" "}
            <strong>SHAP</strong> (SHapley Additive exPlanations) applies it to machine learning. The
            features are the players, and the prediction is the payout to share out.
          </p>
          <Formula>prediction = base value + sum of all SHAP values</Formula>
          <p>
            The <strong>base value</strong> is the model's average output over a background
            dataset. Each SHAP value says how much one feature pushed this prediction up or down
            from that average.
          </p>
        </>
      ),
    },
    {
      id: "worked-example",
      title: "Computing Shapley values by hand",
      body: (
        <>
          <p>
            Take three features: income (I), debt (D) and history (H). Write v(S) for the model's
            expected output when only the features in set S are known. Here's an illustrative table:
          </p>
          <Table
            head={["Known features", "v"]}
            rows={[
              ["None", "0.20"],
              ["I", "0.40"],
              ["D", "0.30"],
              ["H", "0.20"],
              ["I, D", "0.60"],
              ["I, H", "0.45"],
              ["D, H", "0.35"],
              ["I, D, H", "0.70"],
            ]}
          />
          <p>
            Go through each of the 3! = 6 orderings and record what each feature adds when it joins.
            In the order I, D, H: I adds 0.40 − 0.20 = 0.20, D adds 0.60 − 0.40 = 0.20, and H adds 0.70
            − 0.60 = 0.10.
          </p>
          <Table
            head={["Order", "I adds", "D adds", "H adds"]}
            rows={[
              ["I, D, H", "0.20", "0.20", "0.10"],
              ["I, H, D", "0.20", "0.25", "0.05"],
              ["D, I, H", "0.30", "0.10", "0.10"],
              ["D, H, I", "0.35", "0.10", "0.05"],
              ["H, I, D", "0.25", "0.25", "0.00"],
              ["H, D, I", "0.35", "0.15", "0.00"],
              [<strong key="t">Total</strong>, "1.65", "1.05", "0.30"],
              [<strong key="a">Average (÷ 6)</strong>, "0.275", "0.175", "0.05"],
            ]}
          />
          <p>
            Check it: 0.275 + 0.175 + 0.05 = 0.50, and 0.20 + 0.50 = 0.70, which is exactly the
            prediction. Credit adds up, with nothing lost and nothing double counted.
          </p>
          <p>
            Notice that H adds nothing when it comes first, but something when it comes later. It only
            helps alongside the other features. Averaging over orders captures this kind of
            interaction, which is why a single order isn't enough.
          </p>
          <p>The general formula counts each subset S once rather than listing orders:</p>
          <Formula>φᵢ = Σ over S [ |S|! (n − |S| − 1)! ÷ n! ] × [ v(S ∪ i) − v(S) ]</Formula>
          <p>
            Here the sum covers every subset S that leaves out feature i, n is the feature count, and
            the fraction is the share of orderings in which exactly S comes before i.
          </p>
        </>
      ),
    },
    {
      id: "properties",
      title: "Why the theory matters",
      body: (
        <>
          <p>
            Shapley values are the only way of sharing credit that meets a small set of fairness
            rules. LIME has no such guarantee. SHAP's main theoretical result, from Lundberg and Lee,
            extends this to feature attribution.
          </p>
          <Table
            head={["Property", "Meaning"]}
            rows={[
              ["Efficiency (local accuracy)", "Values add up to prediction minus base value"],
              ["Symmetry", "Two features with identical effects get equal credit"],
              ["Dummy (missingness)", "A feature that never changes the output gets zero"],
              ["Consistency", "If a feature's contribution rises, its credit does not fall"],
            ]}
          />
          <p>
            The catch is cost. Exact values need every subset of features, which is 2ⁿ model
            evaluations. Three features need 8, 20 features need 1,048,576, and 30 features need over
            a billion. So practical SHAP depends on faster methods:
          </p>
          <Table
            head={["Explainer", "Works with", "Exact?", "Speed"]}
            rows={[
              [<code key="t">TreeExplainer</code>, "XGBoost, LightGBM, random forests", "Yes, for its definition", "Fast"],
              [<code key="d">DeepExplainer</code>, "Neural networks", "Approximate", "Moderate"],
              [<code key="g">GradientExplainer</code>, "Differentiable models", "Approximate", "Moderate"],
              [<code key="k">KernelExplainer</code>, "Any model", "Approximate", "Slow"],
            ]}
          />
          <Callout tone="note">
            KernelSHAP is closely related to LIME. Both fit a weighted linear model on perturbed
            samples. KernelSHAP uses a specific weighting that recovers Shapley values, rather than
            a proximity kernel chosen by you.
          </Callout>
        </>
      ),
    },
    {
      id: "in-python",
      title: "SHAP in Python",
      body: (
        <>
          <p>Tree models are the easiest place to start:</p>
          <pre>
            <code>{`import shap
import xgboost as xgb

model = xgb.XGBClassifier(n_estimators=200, max_depth=4)
model.fit(X_train, y_train)

explainer = shap.TreeExplainer(model)
explanation = explainer(X_test)        # an Explanation object

shap.plots.waterfall(explanation[0])   # one prediction
shap.plots.beeswarm(explanation)       # whole dataset
shap.plots.bar(explanation)            # global importance`}</code>
          </pre>
          <p>For a model with no fast explainer, use a small background sample to keep it affordable:</p>
          <pre>
            <code>{`background = shap.sample(X_train, 100)
explainer = shap.KernelExplainer(model.predict_proba, background)
shap_values = explainer.shap_values(X_test.iloc[:50])`}</code>
          </pre>
          <p>Each plot answers a different question:</p>
          <ul>
            <li>
              <strong>Waterfall:</strong> starts at the base value and steps through each feature to
              reach this one prediction. This is the plot for a case review.
            </li>
            <li>
              <strong>Beeswarm:</strong> one dot per row per feature. Horizontal position shows
              impact, and color shows the feature's value. A row of red dots on the right means high
              values push the prediction up.
            </li>
            <li>
              <strong>Bar:</strong> average absolute SHAP value per feature, for overall importance.
            </li>
          </ul>
          <p>
            Why absolute? Positive and negative effects would cancel out. Values of +0.4, −0.2, −0.3
            and +0.1 average to 0, but their mean absolute value is (0.4 + 0.2 + 0.3 + 0.1) ÷ 4 =
            0.25, so the feature clearly matters.
          </p>
          <Callout tone="warn" title="Check the units">
            For an XGBoost classifier, <code>TreeExplainer</code> reports values in log-odds by default,
            not probability. A base value of −1.0 and a sum of +1.5 gives 0.5 log-odds. Converting
            with e^0.5 ÷ (1 + e^0.5) gives a probability of about 0.62. Don't read +1.5 as "150 points
            of probability".
          </Callout>
        </>
      ),
    },
    {
      id: "pitfalls",
      title: "Pitfalls and production use",
      body: (
        <>
          <p>
            SHAP explains the model, not the world. A feature with a high SHAP value is one the
            model leans on, which doesn't make it a cause. Changing that feature in real life may
            not change the outcome.
          </p>
          <Table
            head={["Pitfall", "Why it matters"]}
            rows={[
              ["Correlated features", "Credit can be split between them, and impossible combinations may be evaluated"],
              ["Poor background data", "The base value and all attributions depend on it"],
              ["Explaining a weak model", "A clean plot of a bad model is still a bad model"],
              ["Unit confusion", "Log-odds, probabilities and margins aren't interchangeable"],
              ["Fairness claims", "A low value on a sensitive feature doesn't rule out bias through proxies"],
            ]}
          />
          <p>SHAP also earns its keep in MLOps:</p>
          <ul>
            <li>
              <strong>Debugging:</strong> an ID or timestamp near the top of the bar plot often means
              data leakage.
            </li>
            <li>
              <strong>Release checks:</strong> compare global importance between the old and new
              model. A sudden change deserves a look.
            </li>
            <li>
              <strong>Monitoring:</strong> track how SHAP distributions shift over time. Drift in an
              influential feature matters more than drift in an unused one.
            </li>
            <li>
              <strong>Reason codes:</strong> turn the top features of a prediction into text for
              reviewers.
            </li>
          </ul>
          <Table
            head={["", "LIME", "SHAP"]}
            rows={[
              ["Scope", "Local", "Local, and global by aggregation"],
              ["Theory", "Heuristic local fit", "Shapley axioms"],
              ["Stability", "Varies with sampling", "Stable for TreeExplainer"],
              ["Speed on trees", "Slower per prediction", "Fast"],
              ["Adds up to the prediction", "Approximately", "Yes, by design"],
            ]}
          />
          <Callout tone="tip">
            Computing SHAP at request time adds latency. For most systems, compute it in a batch
            job on a sample of predictions, and only on demand for cases that need a reason.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "SHAP values come from Shapley values: a feature's average contribution over all orderings.",
    "Base value plus all SHAP values equals the prediction.",
    "Exact computation is exponential, so use TreeExplainer for trees and approximations elsewhere.",
    "Mean absolute SHAP gives global importance, and waterfall plots explain single predictions.",
    "SHAP explains the model, not causes in the real world, and its units depend on the model output.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which explainer is the natural choice for a LightGBM model?",
      options: ["KernelExplainer", "TreeExplainer", "DeepExplainer", "GradientExplainer"],
      answer: 1,
      explain: "TreeExplainer uses the tree structure to compute values quickly.",
    },
    {
      kind: "mcq",
      q: "Which property says SHAP values add up to the prediction minus the base value?",
      options: ["Symmetry", "Dummy", "Efficiency", "Sparsity"],
      answer: 2,
      explain: "Efficiency, also called local accuracy, means no credit is lost or invented.",
    },
    {
      kind: "mcq",
      q: "A feature has a large mean absolute SHAP value. What can you conclude?",
      options: [
        "It causes the real-world outcome",
        "The model relies on it heavily",
        "It should be removed",
        "The model is fair",
      ],
      answer: 1,
      explain: "SHAP measures influence on model output, not real-world causation.",
    },
    {
      kind: "text",
      q: "A base value is 100. SHAP values are +30, −10 and +5. What is the prediction?",
      format: "***",
      accept: ["125", "125.0"],
      explain: "100 + 30 − 10 + 5 = 125.",
    },
    {
      kind: "text",
      q: "Two features, A and B. v(none) = 10, v(A) = 30, v(B) = 20, v(A, B) = 60. What is the Shapley value of A?",
      format: "**",
      accept: ["30", "30.0"],
      explain: "A adds 20 when first and 40 when second (60 − 20). The average is 30. B gets 20, and 30 + 20 = 50 = 60 − 10.",
    },
  ],
};
