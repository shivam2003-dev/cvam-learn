import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Tell zero-shot, one-shot and few-shot prompts apart",
    "Decide when examples are worth their token cost",
    "Choose and order examples so they teach the right pattern",
    "Estimate the extra cost that examples add to each request",
  ],
  tasks: [
    {
      id: "problem",
      title: "Telling versus showing",
      body: (
        <>
          <p>
            Sometimes you can describe a task in words and the model gets it right. Sometimes the
            description is long, awkward or still gets misread. In that case it is often faster to{" "}
            <em>show</em> the model what you want.
          </p>
          <p>
            Compare explaining a house style to a new editor with a page of rules, versus handing
            them three finished articles and saying &quot;match these&quot;. The second often
            works better. Language models behave the same way. They are very good at spotting a
            pattern in the text they are given and continuing it.
          </p>
          <p>The vocabulary is simple. The count refers to how many worked examples you include.</p>
          <Table
            head={["Style", "Examples in prompt", "Best for"]}
            rows={[
              ["Zero-shot", "0", "Common tasks the model already knows well"],
              ["One-shot", "1", "Showing a format or tone"],
              ["Few-shot", "2 to about 8", "Custom labels, house style, tricky edge cases"],
            ]}
          />
        </>
      ),
    },
    {
      id: "zero-shot",
      title: "Start with zero-shot",
      body: (
        <>
          <p>
            A <strong>zero-shot</strong> prompt gives instructions and no examples. Always try this
            first. It is the cheapest and shortest, and modern models handle many tasks well from a
            clear instruction alone.
          </p>
          <pre>
            <code>{`Classify the sentiment of the review as positive, negative or neutral.
Reply with one word only.

Review: The battery lasts all day but the screen scratches easily.`}</code>
          </pre>
          <p>
            Notice the instruction names the allowed labels and the reply format. Most zero-shot
            problems come from being vague about those two things, not from the model being unable to
            do the task.
          </p>
          <p>
            Zero-shot starts to struggle when the task is unusual or the labels are your own. If your
            categories are &quot;refund-risk&quot; and &quot;upsell-lead&quot;, the model has to guess
            what you mean from two words. Examples remove that guess.
          </p>
        </>
      ),
    },
    {
      id: "few-shot",
      title: "Adding examples",
      body: (
        <>
          <p>
            A <strong>few-shot</strong> prompt adds input and output pairs before the real input.
            The model sees the pattern and follows it. Here are three examples for a custom label
            set.
          </p>
          <pre>
            <code>{`Label each support message as refund-risk, upsell-lead or other.
Reply with the label only.

Message: I've been charged twice and I'm thinking of cancelling.
Label: refund-risk

Message: Does the Pro plan include more seats?
Label: upsell-lead

Message: How do I change my profile photo?
Label: other

Message: Your last update broke my invoices, I want my money back.
Label:`}</code>
          </pre>
          <p>
            The final line stops at <code>Label:</code> so the most natural continuation is a label.
            That small trick keeps replies short and parseable.
          </p>
          <p>The same idea works with chat messages. Put each example as a user message followed by an assistant message:</p>
          <pre>
            <code>{`# Illustrative: field names differ by provider.
messages = [
    {"role": "system", "content": "Label support messages. Reply with the label only."},
    {"role": "user", "content": "I've been charged twice and I'm thinking of cancelling."},
    {"role": "assistant", "content": "refund-risk"},
    {"role": "user", "content": "Does the Pro plan include more seats?"},
    {"role": "assistant", "content": "upsell-lead"},
    {"role": "user", "content": new_message},
]`}</code>
          </pre>
          <p>
            Written this way, the examples teach the format through behaviour, not only through a
            description of it.
          </p>
        </>
      ),
    },
    {
      id: "choosing",
      title: "Choosing good examples",
      body: (
        <>
          <p>
            The model copies what you show, including your accidents. A few rules keep examples
            useful.
          </p>
          <ul>
            <li>
              <strong>Cover the range.</strong> Include each label or output type at least once, and
              at least one borderline case. If every example is easy, the model has nothing to learn
              about the hard ones.
            </li>
            <li>
              <strong>Balance the labels.</strong> If four of five examples are &quot;positive&quot;,
              the model drifts toward that answer. Keep the mix roughly even, or match the real
              distribution on purpose.
            </li>
            <li>
              <strong>Keep the format identical.</strong> Same field names, same spacing, same
              ending. The model will copy sloppy formatting just as faithfully.
            </li>
            <li>
              <strong>Mind the order.</strong> Models can lean on the last example more than the
              others. Shuffle the order and test; do not leave the same label last by accident.
            </li>
            <li>
              <strong>Use real data.</strong> Examples drawn from real inputs match what the model
              will see in production better than tidy invented ones.
            </li>
            <li>
              <strong>Stay diverse.</strong> Five near-identical examples teach less than three
              different ones.
            </li>
          </ul>
          <Callout tone="tip">
            When a model gets a case wrong in testing, add that case as an example. Fixing failures
            with examples taken from your own logs is one of the most reliable ways to improve a
            prompt.
          </Callout>
        </>
      ),
    },
    {
      id: "cost",
      title: "What examples cost",
      body: (
        <>
          <p>
            Examples are tokens, and tokens are billed on every request. Before adding more, do the
            arithmetic.
          </p>
          <Formula>extra cost per day = requests × example tokens × price per token</Formula>
          <p>
            Suppose each example is about 45 tokens, you include 6 of them, and you handle 100,000
            requests a day. Use an illustrative input price of 1 dollar per million tokens (check the
            provider's current prices).
          </p>
          <pre>
            <code>{`example tokens per request = 6 × 45 = 270
tokens per day             = 100,000 × 270 = 27,000,000
cost per day               = 27 million × 1 dollar per million = 27 dollars`}</code>
          </pre>
          <p>
            Twenty-seven dollars a day buys a stable label set. Compare that with the cost of
            wrong labels, and with the alternative of a longer written explanation, which also costs
            tokens. If the examples let you move to a smaller, cheaper model, they may even save
            money overall.
          </p>
          <p>Some ways to keep the cost down:</p>
          <ul>
            <li>Put the examples in a fixed prefix so prompt caching can reuse them.</li>
            <li>Trim each example to the shortest text that still shows the pattern.</li>
            <li>
              Pick examples by similarity: look up the few stored examples closest to the new input
              and include only those. This is called dynamic few-shot, and it connects to the
              embedding ideas later in the course.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "limits",
      title: "When examples are not the answer",
      body: (
        <>
          <p>Examples help with format, style and custom labels. They are weak at some things.</p>
          <ul>
            <li>
              <strong>Missing knowledge.</strong> If the model does not know your product policy, no
              example will teach it. Give the facts in the prompt or retrieve them.
            </li>
            <li>
              <strong>Hard reasoning.</strong> A few examples of correct answers rarely teach a model
              to solve a multi-step problem. The next lesson covers prompting for reasoning.
            </li>
            <li>
              <strong>Too many examples.</strong> Past a certain point more examples add cost with
              little gain. If you need dozens, consider fine-tuning instead.
            </li>
          </ul>
          <Callout tone="warn">
            Do not test a few-shot prompt on the same cases you used as examples. It will look
            perfect and tell you nothing. Hold out a separate set of inputs to measure with.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Zero-shot gives instructions only; few-shot adds worked input and output pairs.",
    "Try zero-shot first, then add examples when labels, format or style are custom.",
    "Choose examples that cover the range, balance labels, share one format and use real data.",
    "Examples are billed as input tokens on every call: examples × tokens each × requests × price.",
    "Examples teach patterns, not facts or deep reasoning, and you must test on cases not used as examples.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A prompt includes three worked input and output pairs before the real input. What is it called?",
      options: ["Zero-shot", "Few-shot", "Fine-tuning", "Retrieval"],
      answer: 1,
      explain: "Few-shot prompts include a small number of worked examples in the prompt itself.",
    },
    {
      kind: "mcq",
      q: "Your five examples are all labelled positive. What is the likely effect?",
      options: [
        "The model becomes more accurate on negatives",
        "Nothing; labels are ignored",
        "The prompt gets cheaper",
        "The model leans toward answering positive",
      ],
      answer: 3,
      explain: "Models copy patterns, including skewed ones, so unbalanced labels bias the answer.",
    },
    {
      kind: "mcq",
      q: "Which problem are examples least able to fix?",
      options: [
        "A custom output format",
        "A house writing style",
        "The model not knowing your private refund policy",
        "Ambiguous label names",
      ],
      answer: 2,
      explain: "Examples show patterns. Missing facts must be supplied in the prompt or through retrieval.",
    },
    {
      kind: "text",
      q: "You include 6 examples of 45 tokens each. How many extra tokens does each request carry?",
      format: "***",
      accept: ["270"],
      explain: "6 × 45 = 270 tokens per request.",
    },
  ],
};
