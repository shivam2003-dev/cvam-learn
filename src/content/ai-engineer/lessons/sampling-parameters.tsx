import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain how logits become probabilities and where sampling fits in",
    "Calculate the effect of temperature on a small distribution",
    "Apply top-k and top-p filtering by hand",
    "Choose sensible settings for factual, structured and creative tasks",
  ],
  tasks: [
    {
      id: "from-logits",
      title: "From scores to a chosen token",
      body: (
        <>
          <p>
            At every step the model produces one raw score per vocabulary token. These scores are
            called <strong>logits</strong>. They can be any number, positive or negative. A function
            called <strong>softmax</strong> turns them into probabilities that are positive and add
            up to 1:
          </p>
          <Formula>p(i) = exp(logit i) ÷ sum of exp(logit j) over all tokens j</Formula>
          <p>
            Something then has to choose one token from those probabilities. Always taking the
            highest is called <strong>greedy decoding</strong>. It is predictable but can be dull
            and repetitive. Picking randomly in proportion to the probabilities is{" "}
            <strong>sampling</strong>. The settings in this lesson control how that choice is made.
            Think of rolling a weighted die: temperature changes how lopsided the die is, and top-k
            and top-p remove faces before you roll.
          </p>
        </>
      ),
    },
    {
      id: "temperature",
      title: "Temperature",
      body: (
        <>
          <p>
            Temperature divides the logits before softmax. A low value sharpens the distribution so
            the top token dominates. A high value flattens it so unlikely tokens get a real chance.
          </p>
          <Formula>p(i) = exp(logit i ÷ T) ÷ sum of exp(logit j ÷ T)</Formula>
          <p>
            Work an example with three candidate tokens A, B and C and logits 2.0, 1.0 and 0.0.
          </p>
          <Table
            head={["Temperature", "Scaled logits", "P(A)", "P(B)", "P(C)"]}
            rows={[
              ["0.5", "4, 2, 0", "0.867", "0.117", "0.016"],
              ["1.0", "2, 1, 0", "0.665", "0.245", "0.090"],
              ["2.0", "1, 0.5, 0", "0.506", "0.307", "0.186"],
            ]}
          />
          <p>
            Here is the middle row in full. exp(2) = 7.389, exp(1) = 2.718, exp(0) = 1. The sum is
            11.107. So P(A) = 7.389 ÷ 11.107 = 0.665, P(B) = 2.718 ÷ 11.107 = 0.245 and P(C) = 1 ÷
            11.107 = 0.090. At T = 0.5 the scaled logits are 4, 2 and 0, so the values are 54.598,
            7.389 and 1, summing to 62.987, which gives 0.867, 0.117 and 0.016. Lower temperature
            made A far more likely.
          </p>
          <p>
            As T approaches 0 the choice approaches greedy: the top token wins almost always. Many
            APIs treat 0 as greedy decoding. Even then, results are not always identical between
            runs, because floating-point maths and server batching can change tiny details. Do not
            rely on perfect repeatability.
          </p>
          <pre>
            <code>{`import math

def softmax(logits, temperature=1.0):
    scaled = [x / temperature for x in logits]
    m = max(scaled)                          # subtract max for stability
    exps = [math.exp(x - m) for x in scaled]
    total = sum(exps)
    return [e / total for e in exps]

print(softmax([2.0, 1.0, 0.0], 1.0))   # about [0.665, 0.245, 0.090]
print(softmax([2.0, 1.0, 0.0], 0.5))   # about [0.867, 0.117, 0.016]`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "top-k",
      title: "Top-k",
      body: (
        <>
          <p>
            Top-k keeps only the k most likely tokens, throws the rest away, and renormalises so the
            survivors add up to 1. It cuts off the long tail of silly options.
          </p>
          <p>
            Take five tokens with probabilities A 0.50, B 0.25, C 0.15, D 0.07 and E 0.03. With k =
            2, only A and B stay. Their sum is 0.75, so the new probabilities are 0.50 ÷ 0.75 =
            0.667 and 0.25 ÷ 0.75 = 0.333.
          </p>
          <p>
            The weakness is that k is fixed. When the model is very sure, k = 40 still allows 39
            weak candidates. When it is unsure among 200 reasonable words, k = 40 cuts good ones.
          </p>
        </>
      ),
    },
    {
      id: "top-p",
      title: "Top-p (nucleus sampling)",
      body: (
        <>
          <p>
            Top-p adapts to the shape of the distribution. Sort tokens from most to least likely and
            keep the smallest group whose probabilities add up to at least p. Then renormalise.
          </p>
          <p>
            With the same five tokens and p = 0.85, the running totals are A 0.50, then B 0.75, then
            C 0.90. The total first passes 0.85 at C, so A, B and C stay. Their sum is 0.90, giving
            0.50 ÷ 0.90 = 0.556, 0.25 ÷ 0.90 = 0.278 and 0.15 ÷ 0.90 = 0.167.
          </p>
          <p>
            When the model is confident, the group is small (maybe one token). When it is unsure,
            the group grows. That flexibility is why top-p is popular.
          </p>
          <Callout tone="tip">
            Many guides suggest adjusting temperature or top-p, not both at once, because their
            effects interact and become hard to reason about. Change one, test, then decide.
          </Callout>
        </>
      ),
    },
    {
      id: "penalties",
      title: "Repetition penalties",
      body: (
        <>
          <p>
            Models sometimes loop, repeating a phrase. Penalties push against that by lowering the
            logits of tokens that already appeared.
          </p>
          <ul>
            <li>
              <strong>Frequency penalty:</strong> the more often a token has appeared, the bigger
              the reduction. It discourages heavy repetition.
            </li>
            <li>
              <strong>Presence penalty:</strong> a flat reduction once a token has appeared at all.
              It nudges the model toward new topics.
            </li>
            <li>
              <strong>Repetition penalty:</strong> a related setting in some open-source tools that
              scales down the scores of tokens already seen.
            </li>
          </ul>
          <p>
            Which of these exist, and what ranges they accept, depends on the provider and runtime.
            Check the current documentation. Keep values small. Strong penalties can make the model
            avoid words it genuinely needs, such as the name of a product repeated in an answer.
          </p>
        </>
      ),
    },
    {
      id: "settings",
      title: "Choosing settings in practice",
      body: (
        <>
          <Table
            head={["Task", "Direction", "Reason"]}
            rows={[
              ["Extraction, classification, JSON", "Low temperature", "You want the most likely, consistent answer"],
              ["Q and A over documents", "Low temperature", "Fewer invented details"],
              ["Brainstorming, naming, stories", "Higher temperature", "Variety is the point"],
              ["Code generation", "Low to moderate", "Correctness first, a little variety to retry"],
            ]}
          />
          <pre>
            <code>{`# Illustrative: parameter names and allowed ranges vary by provider.
response = client.messages.create(
    model=MODEL,
    max_tokens=300,
    temperature=0.2,     # low: steady, factual output
    top_p=1.0,           # leave unchanged while tuning temperature
    messages=[{"role": "user", "content": question}],
)`}</code>
          </pre>
          <Callout tone="warn">
            Some current models fix or ignore certain sampling settings, or restrict combinations.
            Read your model's documentation before assuming a knob works. Lowering temperature also
            does not make a model truthful. It only makes the output more consistent, including
            consistently wrong.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Logits become probabilities via softmax, and sampling picks a token from them.",
    "Temperature divides logits: low sharpens the distribution, high flattens it.",
    "Top-k keeps a fixed number of candidates. Top-p keeps the smallest set reaching probability p.",
    "Frequency and presence penalties reduce repetition. Keep them small.",
    "Use low temperature for factual or structured output and higher for creative work. Always check provider docs.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You raise temperature from 0.5 to 2.0. What happens to the distribution?",
      options: [
        "It becomes sharper around the top token",
        "It becomes flatter, giving unlikely tokens more chance",
        "Nothing changes",
        "Tokens are removed from the vocabulary",
      ],
      answer: 1,
      explain: "Dividing logits by a larger number brings them closer together, which flattens the probabilities.",
    },
    {
      kind: "mcq",
      q: "How does top-p differ from top-k?",
      options: [
        "Top-p keeps a fixed number of tokens",
        "Top-p always keeps exactly one token",
        "Top-p picks the least likely token",
        "Top-p keeps a variable number of tokens based on cumulative probability",
      ],
      answer: 3,
      explain: "Top-p keeps the smallest set whose probabilities sum to p, so the count adapts to confidence.",
    },
    {
      kind: "text",
      q: "Which setting, pushed toward 0, makes decoding approach greedy? One word.",
      format: "***********",
      accept: ["temperature"],
      explain: "As temperature approaches 0, the top token dominates and the choice becomes greedy.",
    },
    {
      kind: "text",
      q: "After top-k with k = 2 on probabilities A 0.50, B 0.25, C 0.15, what is the new probability of A, to three decimal places?",
      format: "*****",
      accept: ["0.667", ".667", "2/3"],
      explain: "Keep A and B, sum 0.75. A becomes 0.50 ÷ 0.75 = 0.667.",
    },
  ],
};
