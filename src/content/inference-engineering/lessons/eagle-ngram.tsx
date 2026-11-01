import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Hard",
  objectives: [
    "Explain how n-gram speculation proposes tokens without a model",
    "Describe how EAGLE reuses the target's features",
    "Compare speculation methods by memory, setup and hit rate",
    "Estimate speedup for a mixed workload",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Draft-target decoding works, but a separate draft model is expensive. It uses GPU memory
            that could hold KV cache, it needs its own forward passes, and it must be chosen and kept
            in step with the target.
          </p>
          <p>
            Two cheaper proposers avoid most of this. <strong>N-gram speculation</strong> uses no
            model at all. It predicts by copying text that has already appeared.{" "}
            <strong>EAGLE</strong> uses a very small trained network that borrows knowledge the
            target has already computed.
          </p>
          <p>
            The verification step stays the same in both. The target checks every proposal, so
            output quality is preserved. Only the proposer changes.
          </p>
        </>
      ),
    },
    {
      id: "ngram",
      title: "N-gram speculation",
      body: (
        <>
          <p>
            An <strong>n-gram</strong> is a run of n tokens. The method looks at the last few tokens
            generated, searches the context for an earlier match, and proposes whatever followed
            that match. It's sometimes called <strong>prompt lookup</strong>.
          </p>
          <p>
            Picture autocomplete in a text editor. You've typed a variable name twice, so when you
            start it a third time, the rest appears.
          </p>
          <pre>
            <code>{`Prompt contains:  user_id = request.user.id
Model just wrote: user_id = request

Look up the last tokens "user_id = request"
Found earlier, followed by ".user.id"
Propose: . | user | . | id`}</code>
          </pre>
          <p>
            That's cheap, since it's a text search on the CPU. It uses no meaningful GPU memory and
            needs no training. If no match exists, the engine just runs a normal step.
          </p>
          <p>
            It shines where outputs repeat their inputs: editing code, rewriting a document, answering
            with quotes from retrieved passages, or producing JSON with repeated keys. It does little
            for fresh prose.
          </p>
          <p>Transformers exposes it with one argument:</p>
          <pre>
            <code>{`outputs = model.generate(
    **inputs,
    prompt_lookup_num_tokens=10,
    max_new_tokens=256,
)`}</code>
          </pre>
          <h4>A worked example</h4>
          <p>
            Take illustrative numbers: a plain step is 40 ms, a verifying step is 44 ms, and when a
            match exists, 3 proposed tokens are accepted on average.
          </p>
          <pre>
            <code>{`Code-editing traffic, match on 30% of steps:
  tokens per step = 0.3 × (3 + 1) + 0.7 × 1 = 1.9
  ms per step     = 0.3 × 44 + 0.7 × 40 = 41.2
  speed = 1.9 ÷ 0.0412 s ≈ 46 tokens/s  (about 1.8× over 25)

Chat traffic, match on 5% of steps:
  tokens per step = 0.05 × 4 + 0.95 × 1 = 1.15
  ms per step     = 0.05 × 44 + 0.95 × 40 = 40.2
  speed = 1.15 ÷ 0.0402 s ≈ 29 tokens/s  (about 1.1×)`}</code>
          </pre>
          <p>
            Same method, very different results. Your traffic mix decides whether it's worth turning
            on, although almost no downside makes it an easy experiment.
          </p>
        </>
      ),
    },
    {
      id: "eagle",
      title: "EAGLE",
      body: (
        <>
          <p>
            A separate draft model starts with no idea what the target is thinking. It reads the same
            tokens, but has to work everything out by itself with far fewer resources.
          </p>
          <p>
            EAGLE takes a different approach. It's a small network, called a <strong>head</strong>,
            attached to the target. As the target runs, its final layers produce{" "}
            <strong>hidden features</strong>: rich vectors that hold almost everything the model
            knows about the next token. EAGLE starts from those.
          </p>
          <p>
            It then works <strong>autoregressively</strong>, meaning each predicted feature feeds the
            next prediction. Each proposed token's feature is estimated by the small head, then
            turned into a token using the target's own output layer. So EAGLE doesn't need a big
            model of its own.
          </p>
          <p>
            Early speculative networks struggled with <strong>feature uncertainty</strong>: the next
            feature depends on which token gets picked, and that isn't known yet. EAGLE's central
            idea was to also feed in the embedding of the sampled token, which resolves this.
          </p>
          <Table
            head={["Version", "Main change"]}
            rows={[
              ["EAGLE", "Small feature-level draft head guided by sampled tokens"],
              ["EAGLE-2", "Draft trees whose shape adapts to confidence"],
              ["EAGLE-3", "Fuses features from several layers, trained without the feature target"],
            ]}
          />
          <p>
            A <strong>draft tree</strong> proposes several options at a position, not a single line.
            If the top choice fails, a sibling branch might survive. The target can check many
            branches in one pass using a modified attention mask. EAGLE-2 spends more of its budget
            on branches it's confident about.
          </p>
          <p>
            Here's the same arithmetic with an illustrative head at 1 ms per token, k = 4, and p =
            0.75 per token:
          </p>
          <pre>
            <code>{`tokens per cycle = 1 + 0.75 + 0.5625 + 0.4219 + 0.3164 ≈ 3.05
cycle time       = 44 + (4 × 1) = 48 ms
speed            = 3.05 ÷ 0.048 s ≈ 63.6 tokens/s  (about 2.5× over 25)`}</code>
          </pre>
          <Callout tone="warn">
            An EAGLE head belongs to one target model. If you change the model, you generally need a
            new head, and training one takes data and GPU time. If your model is a custom fine-tune,
            a head trained for the base model may accept far fewer tokens. Check prebuilt heads first.
          </Callout>
        </>
      ),
    },
    {
      id: "choosing",
      title: "Choosing a method",
      body: (
        <>
          <Table
            head={["", "N-gram", "EAGLE", "Draft-target"]}
            rows={[
              ["Proposer", "Text lookup", "Small trained head", "Separate model"],
              ["GPU memory", "Almost none", "Small", "Largest"],
              ["Setup", "A setting", "Needs a matching head", "Needs a good draft"],
              ["Best at", "Repetitive text", "General text", "General text"],
              ["Stays useful if model changes", "Yes", "Usually not", "Often"],
            ]}
          />
          <Formula>useful speedup = extra tokens accepted − cost of proposing and rejecting</Formula>
          <p>
            Engines usually take a config, as in this vLLM-style example. Option names and supported
            methods change between releases, so verify them against your version.
          </p>
          <pre>
            <code>{`from vllm import LLM

llm = LLM(
    model="your-org/your-model",
    speculative_config={
        "method": "ngram",
        "num_speculative_tokens": 8,
        "prompt_lookup_max": 4,
    },
)`}</code>
          </pre>
          <Callout tone="tip">
            Log the acceptance rate per request type. It's the single most useful number here, and it
            tells you where speculation pays. If it's low, shorten the draft or turn speculation off
            for that traffic.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "All speculation methods share one verify step, so only the proposer differs.",
    "N-gram speculation copies from earlier context and needs no model.",
    "EAGLE is a small head that builds on the target's own hidden features.",
    "Draft trees let one pass check several candidate branches.",
    "Workload decides which method wins, so track acceptance rate per traffic type.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which workload suits n-gram speculation best?",
      options: [
        "Writing an original poem",
        "Editing a large code file",
        "A very short yes or no answer",
        "Random text at high temperature",
      ],
      answer: 1,
      explain: "Code edits repeat long runs of the prompt, so lookups hit often.",
    },
    {
      kind: "mcq",
      q: "What does EAGLE use that a separate draft model doesn't have?",
      options: [
        "Hidden features computed by the target",
        "A larger KV cache",
        "A different tokenizer",
        "Direct access to training data",
      ],
      answer: 0,
      explain: "EAGLE builds on the target's features, so a tiny head can predict well.",
    },
    {
      kind: "text",
      q: "A lookup matches on 20% of steps, adding 3 accepted tokens each time. On average, how many tokens does a step yield?",
      format: "***",
      accept: ["1.6"],
      explain: "0.2 × (3 + 1) + 0.8 × 1 = 0.8 + 0.8 = 1.6.",
    },
    {
      kind: "text",
      q: "What is a run of n consecutive tokens called?",
      format: "******",
      accept: ["n-gram", "ngram", "n gram"],
      explain: "An n-gram is a sequence of n tokens, and it gives n-gram speculation its name.",
    },
  ],
};
