import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Read a metrics dashboard using medians, percentiles and standard deviation",
    "Measure how far live data has moved from training data",
    "Judge whether a difference between two models is real or just noise",
    "Estimate memory from vector shapes and explain what a gradient does",
  ],
  tasks: [
    {
      id: "why-maths",
      title: "The maths you actually use",
      body: (
        <>
          <p>
            An MLOps engineer rarely derives anything on a whiteboard. But three questions come up
            every week. Is this latency spike real? Has the incoming data changed? Is the new model
            actually better than the old one?
          </p>
          <p>
            Each one is a statistics question. If you guess, you'll roll back good models, ship bad
            ones and silence useful alerts. Think of statistics as a set of instruments, like the
            gauges in a cockpit. You don't need to build the gauges. You do need to read them
            correctly.
          </p>
        </>
      ),
    },
    {
      id: "averages-percentiles",
      title: "Averages hide things",
      body: (
        <>
          <p>Here are ten request latencies in milliseconds:</p>
          <pre>
            <code>{`40, 42, 45, 45, 48, 50, 52, 55, 60, 900`}</code>
          </pre>
          <p>
            The <strong>mean</strong> is the sum divided by the count: 1,337 ÷ 10 = 133.7 ms. The{" "}
            <strong>median</strong> is the middle value. With ten values, take the midpoint of the
            fifth and sixth: (48 + 50) ÷ 2 = 49 ms.
          </p>
          <p>
            Nine of ten users waited about 50 ms, so the mean describes nobody. One outlier pulled
            it up. A <strong>percentile</strong> fixes this. The p95 is the value that 95% of
            requests beat. The tail of slow requests is what users notice, so service targets are
            usually written as p95 or p99, not as a mean.
          </p>
          <pre>
            <code>{`import numpy as np

latency_ms = np.array([40, 42, 45, 45, 48, 50, 52, 55, 60, 900])

print(latency_ms.mean())              # 133.7
print(np.median(latency_ms))          # 49.0
print(np.percentile(latency_ms, 90))  # 144.0 (interpolated)`}</code>
          </pre>
          <p>
            <strong>Standard deviation</strong> measures typical distance from the mean. A{" "}
            <strong>z-score</strong> uses it to say how unusual one value is:
          </p>
          <Formula>z = (value − mean) ÷ standard deviation</Formula>
          <p>
            If a feature averaged 100 in training with a standard deviation of 20, a live value of
            160 has z = (160 − 100) ÷ 20 = 3. That's three standard deviations out, which is rare
            for bell-shaped data. For that shape, about 68% of values sit within one standard
            deviation of the mean, 95% within two and 99.7% within three.
          </p>
          <Callout tone="warn">
            Latency, order values and many other production numbers aren't bell-shaped. They have
            long tails, so the 68-95-99.7 rule doesn't apply. Check the shape before you set an
            alert at "mean plus three standard deviations".
          </Callout>
          <Callout tone="note">
            A p99 from a small sample means little. With ten requests, one value decides the
            result. Collect plenty of requests before you trust a tail percentile.
          </Callout>
        </>
      ),
    },
    {
      id: "distributions-drift",
      title: "Measuring drift",
      body: (
        <>
          <p>
            A <strong>distribution</strong> describes how often each value occurs. Models assume
            live data looks like training data. When the distribution moves, that's called{" "}
            <strong>drift</strong>, and predictions can degrade with no error in any log.
          </p>
          <p>
            A common score for drift is the <strong>Population Stability Index</strong> (PSI). Split
            a feature into bins, then compare the share of data in each bin:
          </p>
          <Formula>PSI = Σ (live share − train share) × ln(live share ÷ train share)</Formula>
          <p>Here's an illustrative order-value feature with four bins:</p>
          <Table
            head={["Bin", "Train", "Live", "Contribution"]}
            rows={[
              ["Under 100", "0.25", "0.10", "(−0.15) × ln(0.4) = 0.137"],
              ["100 to 200", "0.25", "0.20", "(−0.05) × ln(0.8) = 0.011"],
              ["200 to 500", "0.25", "0.30", "(0.05) × ln(1.2) = 0.009"],
              ["Over 500", "0.25", "0.40", "(0.15) × ln(1.6) = 0.071"],
            ]}
          />
          <p>
            The total is about 0.23. A widely used rule of thumb reads under 0.1 as little change,
            0.1 to 0.25 as moderate and above 0.25 as large. That's a convention, not a law, so tune
            it per feature. One practical trap: an empty bin makes the logarithm undefined, so
            real implementations replace zero with a small value.
          </p>
        </>
      ),
    },
    {
      id: "is-it-real",
      title: "Is the new model really better?",
      body: (
        <>
          <p>
            Every measurement from a sample carries noise. The <strong>standard error</strong>{" "}
            estimates how much a measured rate would move if you repeated the experiment. For a
            proportion p measured on n users:
          </p>
          <Formula>standard error = √(p × (1 − p) ÷ n)</Formula>
          <p>
            Say an A/B test gives each model 10,000 users. Model A converts 5.0% and model B 5.6%.
            These figures are illustrative.
          </p>
          <pre>
            <code>{`A: 0.050 × 0.950 ÷ 10,000 = 0.00000475
B: 0.056 × 0.944 ÷ 10,000 = 0.00000529 (rounded)

SE of the difference = √(0.00000475 + 0.00000529)
                     = √0.00001004 ≈ 0.00317, or 0.32 points

Difference = 0.6 points
0.6 ÷ 0.317 ≈ 1.89 standard errors`}</code>
          </pre>
          <p>
            The usual bar for 95% confidence is 1.96 standard errors. At 1.89, B hasn't cleared it.
            B may well be better, but this test can't show it yet, so keep it running or plan a
            larger sample.
          </p>
          <p>
            A <strong>p-value</strong> answers a narrow question: if there were no real difference,
            how often would a gap this large appear by chance? It isn't the probability that B is
            better. Also fix the sample size in advance. If you check daily and stop on the first
            good day, you'll declare far too many false wins.
          </p>
        </>
      ),
    },
    {
      id: "vectors-gradients",
      title: "Vectors, shapes and gradients",
      body: (
        <>
          <p>
            A <strong>vector</strong> is a list of numbers. A <strong>matrix</strong> is a grid of
            them, and a <strong>tensor</strong> is the same idea with any number of dimensions.
            Models treat all inputs this way. An <strong>embedding</strong> is a vector that
            represents a thing such as a sentence, so similar things get similar vectors.
          </p>
          <p>
            The dimensions are called the <strong>shape</strong>, and they let you estimate memory
            before you provision anything:
          </p>
          <Formula>bytes = count × dimensions × bytes per value</Formula>
          <p>
            One million embeddings of 768 dimensions in 32-bit floats (4 bytes) need 1,000,000 ×
            768 × 4 = 3,072,000,000 bytes, or about 2.9 GiB, before any index overhead.
          </p>
          <p>
            A <strong>gradient</strong> is the slope of the error with respect to a model's
            parameters. It says which way to nudge each parameter to reduce the error. Training
            repeats that nudge many times. When a training loss explodes to infinity or NaN, the
            usual suspects are a learning rate that's too large or bad values in the data. You can
            often spot both without knowing the calculus.
          </p>
          <Table
            head={["Topic", "Where you'll meet it"]}
            rows={[
              ["Percentiles", "Latency targets, alert thresholds"],
              ["Distributions", "Drift detection, data validation"],
              ["Hypothesis tests", "A/B tests, model promotion"],
              ["Vectors and shapes", "Memory sizing, vector search, shape errors"],
              ["Gradients", "Debugging training runs"],
            ]}
          />
        </>
      ),
    },
  ],
  takeaways: [
    "Means hide outliers, so report medians and tail percentiles for latency.",
    "Z-scores flag unusual values, but only trust the 68-95-99.7 rule on bell-shaped data.",
    "PSI compares live and training distributions bin by bin.",
    "A gap between two models means little until you compare it with its standard error.",
    "Shapes give you a quick memory estimate before you provision hardware.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A service has a few very slow requests. Which number best shows what a typical user sees?",
      options: ["The mean", "The maximum", "The median", "The sum"],
      answer: 2,
      explain: "The median ignores how extreme the outliers are. Add p95 or p99 to see the tail.",
    },
    {
      kind: "mcq",
      q: "An A/B difference is 1.2 standard errors. What's the right conclusion at a 95% confidence bar?",
      options: [
        "The new model is proven better",
        "The new model is proven worse",
        "The two models are proven identical",
        "The test doesn't show a clear difference",
      ],
      answer: 3,
      explain: "1.2 is under 1.96. That's a lack of evidence, not proof that the models are equal.",
    },
    {
      kind: "text",
      q: "A feature has a mean of 50 and a standard deviation of 5. What is the z-score of the value 65?",
      format: "*",
      accept: ["3", "3.0"],
      explain: "(65 − 50) ÷ 5 = 3.",
    },
    {
      kind: "text",
      q: "Two million embeddings have 512 dimensions, stored in 4-byte floats. How many GB is that, where 1 GB is 1,000,000,000 bytes?",
      format: "*",
      accept: ["8", "8gb", "8 gb"],
      explain: "2,000,000 × 512 × 4 = 8,000,000,000 bytes, which is 8 GB.",
    },
  ],
};
