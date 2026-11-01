import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain how token masking guarantees valid output",
    "Calculate renormalized probabilities after a mask",
    "Request schema-constrained output through an API",
    "Recognize the limits and costs of constrained decoding",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Your code needs JSON. The model returns "Sure! Here's the JSON:" and a broken object with
            a trailing comma. Your parser throws, and the pipeline stops.
          </p>
          <p>
            Asking nicely in the prompt helps but guarantees nothing. Retrying wastes money and adds
            latency. If 90% of responses parse, the average request needs 1 ÷ 0.9 ≈ 1.11 attempts:
            about 11% extra GPU work. Worse, the unlucky 10% wait twice as long, and that lands
            directly on your tail latency.
          </p>
          <p>
            <strong>Constrained decoding</strong> makes invalid output impossible. Think of a form
            with a dropdown instead of a free-text box. The person can still choose, but only from
            options that are valid. The engine changes which tokens can be chosen at each step.
          </p>
        </>
      ),
    },
    {
      id: "mask",
      title: "How the mask works",
      body: (
        <>
          <p>
            At each step, a model gives every token in its vocabulary a score, called a{" "}
            <strong>logit</strong>. A higher score means a more likely token. Constrained decoding
            adds one operation before sampling:
          </p>
          <ol>
            <li>Ask a grammar which tokens can legally come next.</li>
            <li>Set the logit of every other token to negative infinity.</li>
            <li>Sample as usual. The illegal tokens now have zero chance.</li>
            <li>Update the grammar's state with the chosen token.</li>
          </ol>
          <p>
            The grammar is usually a <strong>finite-state machine</strong>: a set of states, with
            rules for moving between them. For a schema, the state records where you are, such as
            "inside the status field, expecting a value." For deep nesting, a context-free grammar
            adds a stack.
          </p>
          <p>
            Say that after the text <code>"status": "</code> the schema allows only{" "}
            <code>active</code> and <code>inactive</code>. The model's raw probabilities are:
          </p>
          <Table
            head={["Token", "Raw probability", "Allowed?", "After mask"]}
            rows={[
              ["active", "0.20", "Yes", "0.20 ÷ 0.25 = 0.80"],
              ["inactive", "0.05", "Yes", "0.05 ÷ 0.25 = 0.20"],
              ["pending", "0.60", "No", "0"],
              ["everything else", "0.15", "No", "0"],
            ]}
          />
          <Formula>new probability = raw probability ÷ total of allowed probabilities</Formula>
          <p>
            Look at the row for <code>pending</code>. The model strongly wanted a word the schema
            forbids, so it was forced to choose something else. The output is valid, but maybe not
            what the model really "thought." Keep that in mind for later.
          </p>
          <h4>Tokens aren't characters</h4>
          <p>
            Grammars work in characters, but models produce tokens, and one token may span several
            characters, such as <code>":"</code> or a whole word. So the engine has to work out which
            tokens keep the text valid. Libraries precompute much of this. Outlines does it by
            building an index of token transitions. XGrammar and llguidance are designed to compile
            grammars and apply masks quickly.
          </p>
        </>
      ),
    },
    {
      id: "api",
      title: "Asking for structured output",
      body: (
        <>
          <p>
            Many engines, including vLLM and SGLang, offer an OpenAI-compatible server. Using it, you
            pass a JSON Schema through <code>response_format</code>:
          </p>
          <pre>
            <code>{`from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="unused")

schema = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["active", "inactive"]},
        "reason": {"type": "string", "maxLength": 200},
    },
    "required": ["status", "reason"],
    "additionalProperties": False,
}

response = client.chat.completions.create(
    model="your-org/your-model",
    messages=[{"role": "user", "content": "Classify this account: ..."}],
    response_format={
        "type": "json_schema",
        "json_schema": {"name": "account_status", "schema": schema},
    },
    max_tokens=300,
)
print(response.choices[0].message.content)`}</code>
          </pre>
          <p>
            Support for schema keywords varies by engine and backend, so test yours. The same
            technique covers regular expressions, fixed choice lists and tool calls.
          </p>
        </>
      ),
    },
    {
      id: "limits",
      title: "Costs and limits",
      body: (
        <>
          <Table
            head={["Cost", "Why", "What to do"]}
            rows={[
              ["Compile time", "Turning a schema into a grammar takes work", "Cache compiled grammars"],
              ["Per-token overhead", "A mask is computed at every step", "Use a fast backend and measure it"],
              ["Batching", "Each request may have its own grammar state", "Benchmark mixed traffic"],
              ["Quality", "Forced tokens can push the model into a bad path", "Describe the format in the prompt"],
            ]}
          />
          <p>The first request with a new schema is often slowest, due to compilation. If users send dynamic schemas, this cost repeats, and a very complex schema can stall a worker. Limit schema size and set a compile timeout.</p>
          <Callout tone="warn" title="Valid is not correct">
            A schema guarantees shape, not truth. The model can return perfectly valid JSON with a
            wrong answer, or an invented ID. Keep your business validation in place.
          </Callout>
          <p>Two failure modes catch people out:</p>
          <ul>
            <li>
              <strong>Truncation:</strong> if the response hits <code>max_tokens</code>, the JSON
              ends early and won't parse. Check that <code>finish_reason</code> is{" "}
              <code>stop</code>, not <code>length</code>.
            </li>
            <li>
              <strong>Runaway output:</strong> JSON allows unlimited whitespace, and some models get
              stuck emitting it. Free-text fields can also run on. Bound string lengths and always
              set <code>max_tokens</code>.
            </li>
          </ul>
          <p>
            Check how it interacts with speculative decoding too. Draft tokens must also pass the
            grammar check, and not every engine supports both features together for each method.
          </p>
          <Callout tone="tip">
            Still put the schema, and an example, in the prompt. The mask stops invalid tokens, but
            it can't tell the model what you want. A model that already expects the format needs far
            less forcing, and its answers tend to be better.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Constrained decoding masks illegal tokens, so invalid output can't be sampled.",
    "A grammar, often a finite-state machine, tracks which tokens are legal at each step.",
    "Remaining probabilities are renormalized over the allowed tokens.",
    "Compilation and per-token masking cost time, so cache grammars and measure.",
    "A schema guarantees structure, not correctness, and truncation can still break it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How does constrained decoding block an illegal token?",
      options: [
        "It retries the request",
        "It sets the token's logit to negative infinity before sampling",
        "It deletes the token from the tokenizer",
        "It parses the output after generation",
      ],
      answer: 1,
      explain: "With a logit of negative infinity, the token has zero probability.",
    },
    {
      kind: "mcq",
      q: "A constrained response stops at max_tokens. What's the likely result?",
      options: [
        "Perfectly valid JSON",
        "The engine extends the limit automatically",
        "Incomplete JSON that won't parse",
        "An empty response every time",
      ],
      answer: 2,
      explain: "The mask controls which tokens appear, but it can't stop the token limit cutting them off.",
    },
    {
      kind: "text",
      q: "Allowed tokens have raw probabilities 0.3 and 0.1. What's the renormalized probability of the first?",
      format: "****",
      accept: ["0.75", ".75", "75%", "3/4"],
      explain: "0.3 ÷ (0.3 + 0.1) = 0.75.",
    },
    {
      kind: "text",
      q: "If 80% of responses parse, how many attempts does the average request need?",
      format: "****",
      accept: ["1.25"],
      explain: "1 ÷ 0.8 = 1.25, assuming each attempt succeeds independently.",
    },
  ],
};
